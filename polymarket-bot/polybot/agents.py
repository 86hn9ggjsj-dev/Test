"""Los agentes de Claude además del ANALISTA (que está en brain.py).

El equipo completo, en orden:

  1. SCOUT     (código)   escanea 1.000 mercados, filtra y ordena          -> filters.py
  2. TRIAGE    (Claude)   criba barata por lotes, sin búsqueda web          -> aquí
  3. ANALISTA  (Claude)   fair value a fondo con web + NOAA                 -> brain.py
  4. ESCÉPTICO (Claude)   intenta demostrar que el mercado tiene razón;     -> aquí
                          puede vetar. Si aprueba, se promedian estimaciones
  5. RIESGO    (código)   Kelly, reglas duras, órdenes y salidas            -> risk.py + agent.py

Los agentes de Claude solo dan opiniones (probabilidades). Solo RIESGO puede operar.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timezone

import anthropic

from .brain import Estimate, market_prompt, run_tool_loop, web_search_tool
from .config import Config
from .polymarket import Market
from .weather import NWS_TOOL, NWSClient, is_weather_market, run_nws_tool

log = logging.getLogger("polybot.agents")


# ------------------------------------------------------------------- TRIAGE
TRIAGE_SYSTEM = """\
You are the triage desk of a prediction-market trading team. You see many Polymarket markets \
at once and must decide, quickly and cheaply, which few deserve a deep research pass by the \
analyst. You have no web access: use your knowledge, base rates and the market wording.

For each market give a quick probability for outcome [0] and set flag=true only when you \
suspect the price is wrong by roughly {threshold} points or more, or when the wording, deadline \
or resolution rules look commonly misread. Be selective: in an efficient market most prices are \
right, so flag at most about one market in five. Your knowledge may be out of date; if a market \
depends on recent events you cannot know, do not flag it just for that.

Call submit_screen exactly once with one entry per market."""

SCREEN_TOOL = {
    "name": "submit_screen",
    "description": "Submit the quick screen for every market in the batch.",
    "strict": True,
    "input_schema": {
        "type": "object",
        "properties": {
            "markets": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "index": {"type": "integer", "description": "The market's index in the batch"},
                        "probability": {"type": "number", "description": "Quick probability (0-1) for outcome [0]"},
                        "flag": {"type": "boolean", "description": "True if it deserves deep research"},
                        "reason": {"type": "string", "description": "One short sentence"},
                    },
                    "required": ["index", "probability", "flag", "reason"],
                    "additionalProperties": False,
                },
            },
        },
        "required": ["markets"],
        "additionalProperties": False,
    },
}


@dataclass
class Screen:
    market_id: str
    fair_yes: float
    flag: bool
    reason: str


def triage_prompt(batch: list[Market]) -> str:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = [f"Current time: {now}. Markets to screen:\n"]
    for i, m in enumerate(batch):
        end = m.end_date.strftime("%Y-%m-%d") if m.end_date else "?"
        desc = " ".join(m.description.split())[:300]
        lines.append(
            f"[{i}] {m.question}\n    outcomes: [0] {m.outcomes[0]} / [1] {m.outcomes[1]} · price of [0]: "
            f"{m.prices[0]:.3f} · ends {end}\n    rules: {desc}"
        )
    return "\n".join(lines)


class Triage:
    def __init__(self, cfg: Config, client: anthropic.Anthropic | None = None):
        self.cfg = cfg
        self.client = client or anthropic.Anthropic(max_retries=3, timeout=300.0)
        self.last_cost = 0.0

    def screen(self, batch: list[Market]) -> list[Screen]:
        """Criba un lote. Devuelve una lista (posiblemente vacía) y deja el coste en last_cost."""
        if not batch:
            self.last_cost = 0.0
            return []
        system = TRIAGE_SYSTEM.format(threshold=round(self.cfg.triage_threshold * 100))
        data, cost = run_tool_loop(
            self.client, model=self.cfg.triage_model, system=system, prompt=triage_prompt(batch),
            tools=[SCREEN_TOOL], submit_name="submit_screen", effort=self.cfg.triage_effort,
            max_tokens=8000, max_turns=2, label=f"triage x{len(batch)}",
        )
        self.last_cost = cost
        out = []
        for row in (data or {}).get("markets", []):
            try:
                i = int(row["index"])
                prob = min(max(float(row["probability"]), 0.0), 1.0)
            except (KeyError, TypeError, ValueError):
                continue
            if 0 <= i < len(batch):
                out.append(Screen(batch[i].id, prob, bool(row.get("flag")), str(row.get("reason", ""))[:200]))
        return out


# ---------------------------------------------------------------- ESCÉPTICO
SKEPTIC_SYSTEM = """\
You are the skeptic on a prediction-market trading team. An analyst believes a Polymarket market \
is mispriced and wants to trade it. Your job is to stop bad trades: argue the other side. Look for \
the strongest reasons the market price is right — information the analyst missed or misread, \
resolution-rule traps, timing and time-zone details, stale sources, base rates, and the simple fact \
that liquid markets are usually efficient. Research independently with web search (and the NWS \
forecast tool for weather markets).

Then give YOUR OWN probability for outcome [0] and a verdict:
- "agree" only if a real mispricing survives your scrutiny,
- "veto" if the edge is doubtful, the evidence is thin, or resolution is ambiguous.
Call submit_review exactly once."""

REVIEW_TOOL = {
    "name": "submit_review",
    "description": "Submit your independent probability and verdict on the analyst's trade idea.",
    "strict": True,
    "input_schema": {
        "type": "object",
        "properties": {
            "probability": {"type": "number", "description": "Your probability (0-1) that outcome [0] resolves true"},
            "verdict": {"type": "string", "enum": ["agree", "veto"]},
            "main_objection": {"type": "string", "description": "The strongest argument against the trade"},
            "reasoning": {"type": "string", "description": "2-4 sentences"},
        },
        "required": ["probability", "verdict", "main_objection", "reasoning"],
        "additionalProperties": False,
    },
}


@dataclass
class Review:
    fair_yes: float
    verdict: str
    objection: str
    reasoning: str
    cost_usd: float


class Skeptic:
    def __init__(self, cfg: Config, client: anthropic.Anthropic | None = None):
        self.cfg = cfg
        self.client = client or anthropic.Anthropic(max_retries=3, timeout=300.0)
        self.last_cost = 0.0
        self.nws = NWSClient()

    def review(self, m: Market, ask_yes: float | None, ask_no: float | None, est: Estimate, side: str) -> Review | None:
        weather = is_weather_market(m)
        evidence = "\n".join(f"- {e}" for e in est.evidence) or "- (none listed)"
        prompt = (
            market_prompt(m, ask_yes, ask_no, weather).rsplit("\n\nEstimate the probability", 1)[0]
            + f"\n\nThe analyst estimates P([0] '{m.outcomes[0]}') = {est.fair_yes:.3f} "
              f"(confidence {est.confidence}) and wants to BUY '{side}'.\n"
              f"Analyst reasoning: {est.reasoning}\nAnalyst evidence:\n{evidence}\n\n"
              "Challenge this trade, then call submit_review."
        )
        tools = [web_search_tool(self.cfg.skeptic_web_searches), REVIEW_TOOL, *([NWS_TOOL] if weather else [])]
        data, cost = run_tool_loop(
            self.client, model=self.cfg.skeptic_model, system=SKEPTIC_SYSTEM, prompt=prompt, tools=tools,
            submit_name="submit_review", effort=self.cfg.skeptic_effort,
            local_tools={"get_nws_forecast": lambda i: run_nws_tool(self.nws, i)} if weather else None,
            label=f"escéptico {m.id}",
        )
        self.last_cost = cost
        if data is None:
            return None
        try:
            prob = min(max(float(data["probability"]), 0.0), 1.0)
        except (KeyError, TypeError, ValueError):
            return None
        verdict = "agree" if data.get("verdict") == "agree" else "veto"
        return Review(prob, verdict, str(data.get("main_objection", "")), str(data.get("reasoning", "")), cost)
