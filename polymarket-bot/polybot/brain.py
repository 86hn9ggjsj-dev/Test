"""Cerebro: Claude estima el fair value de un mercado.

Claude investiga con búsqueda web (datos oficiales, NOAA, injury reports,
encuestas, calendarios...) y termina llamando a la herramienta `submit_estimate`.
Claude NO puede operar: solo devuelve una probabilidad que risk.py valida.
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from datetime import datetime, timezone

import anthropic

from .config import MODEL_PRICES, WEB_SEARCH_PRICE_PER_REQUEST, Config
from .polymarket import Market

log = logging.getLogger("polybot.brain")

SYSTEM_PROMPT = """\
You are the forecasting engine of an autonomous prediction-market trading agent. \
For each Polymarket market you receive, estimate the probability that the FIRST listed \
outcome happens, as judged by the market's own resolution rules.

How to work:
- Read the resolution criteria carefully. Many mispricings are really traps in the wording \
(deadlines, time zones, "announced" vs "happened", which source counts).
- Use web search to find current, primary information: official data and statistics, \
government agencies (e.g. NOAA/NWS for weather), league injury reports, official schedules, \
filings, polling aggregates, and reputable news. Prefer primary sources over commentary.
- The current market price is shown for context. Markets are usually well calibrated; only \
move far from the price when you have concrete evidence the market is missing or misreading. \
If you cannot find such evidence, stay close to the price and report low confidence.
- Judge whether the resolution source is clear and official (a named, authoritative, \
verifiable source). Ambiguous or subjective resolution means resolution_source_clear=false.
- Be calibrated. A good forecaster's 70% happens 70% of the time.

When done, call submit_estimate exactly once. Keep the reasoning short and concrete."""

SUBMIT_TOOL = {
    "name": "submit_estimate",
    "description": (
        "Submit your final probability estimate for the market's first outcome. "
        "Call this exactly once, after your research."
    ),
    "strict": True,
    "input_schema": {
        "type": "object",
        "properties": {
            "probability": {
                "type": "number",
                "description": "Probability (0 to 1) that the FIRST listed outcome resolves true.",
            },
            "confidence": {
                "type": "string",
                "enum": ["low", "medium", "high"],
                "description": "How confident you are that your estimate beats the market price.",
            },
            "resolution_source_clear": {
                "type": "boolean",
                "description": "True if resolution relies on a clear, official, verifiable source.",
            },
            "resolution_source": {"type": "string", "description": "The source that decides resolution."},
            "reasoning": {"type": "string", "description": "2-5 sentences: why this probability."},
            "key_evidence": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Up to 5 short evidence bullets, with source names.",
            },
        },
        "required": [
            "probability", "confidence", "resolution_source_clear",
            "resolution_source", "reasoning", "key_evidence",
        ],
        "additionalProperties": False,
    },
}


@dataclass
class Estimate:
    fair_yes: float            # probabilidad del resultado 0
    confidence: str
    resolution_clear: bool
    resolution_source: str
    reasoning: str
    evidence: list[str]
    cost_usd: float
    model: str


def _usage_cost(model: str, usage) -> float:
    in_price, out_price = MODEL_PRICES.get(model, MODEL_PRICES["claude-opus-5-5"])
    tokens_in = (getattr(usage, "input_tokens", 0) or 0)
    tokens_in += 1.25 * (getattr(usage, "cache_creation_input_tokens", 0) or 0)
    tokens_in += 0.10 * (getattr(usage, "cache_read_input_tokens", 0) or 0)
    tokens_out = getattr(usage, "output_tokens", 0) or 0
    searches = getattr(getattr(usage, "server_tool_use", None), "web_search_requests", 0) or 0
    return tokens_in / 1e6 * in_price + tokens_out / 1e6 * out_price + searches * WEB_SEARCH_PRICE_PER_REQUEST


def market_prompt(m: Market, price_yes: float | None, price_no: float | None) -> str:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    end = m.end_date.strftime("%Y-%m-%d %H:%M UTC") if m.end_date else "unknown"
    description = m.description.strip()[:4000]
    return (
        f"Current time: {now}\n\n"
        f"Market: {m.question}\n"
        f"Outcomes: [0] {m.outcomes[0]}  /  [1] {m.outcomes[1]}\n"
        f"Scheduled end: {end}\n"
        f"Stated resolution source: {m.resolution_source or '(none given)'}\n"
        f"Current prices (best ask): {m.outcomes[0]} = {price_yes}, {m.outcomes[1]} = {price_no}\n"
        f"Liquidity: ${m.liquidity:,.0f}  ·  24h volume: ${m.volume_24h:,.0f}\n\n"
        f"Resolution rules / description:\n{description or '(empty)'}\n\n"
        f"Estimate the probability that outcome [0] '{m.outcomes[0]}' resolves true, then call submit_estimate."
    )


class Brain:
    def __init__(self, cfg: Config, client: anthropic.Anthropic | None = None):
        self.cfg = cfg
        self.client = client or anthropic.Anthropic(max_retries=3, timeout=300.0)
        self.last_cost = 0.0  # coste de la última estimación, aunque fallara

    def _create(self, messages: list):
        return self.client.beta.messages.create(
            model=self.cfg.model,
            max_tokens=16000,
            system=SYSTEM_PROMPT,
            messages=messages,
            tools=[
                {"type": "web_search_20260209", "name": "web_search", "max_uses": self.cfg.max_web_searches},
                SUBMIT_TOOL,
            ],
            output_config={"effort": self.cfg.effort},
            cache_control={"type": "ephemeral"},
            # Si un clasificador de seguridad rechaza la petición, la API la repite
            # en el modelo de respaldo recomendado en lugar de devolver un rechazo.
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
        )

    def estimate(self, m: Market, price_yes: float | None, price_no: float | None) -> Estimate | None:
        """Devuelve una estimación, o None si Claude no la produjo. Registra siempre el coste."""
        messages: list = [{"role": "user", "content": market_prompt(m, price_yes, price_no)}]
        total_cost = 0.0
        nudged = False
        self.last_cost = 0.0
        try:
            for _ in range(6):
                resp = self._create(messages)
                total_cost += _usage_cost(self.cfg.model, resp.usage)
                self.last_cost = total_cost

                if resp.stop_reason == "refusal":
                    log.warning("Claude rechazó evaluar %s", m.id)
                    return None

                for block in resp.content:
                    if block.type == "tool_use" and block.name == "submit_estimate":
                        return self._to_estimate(block.input, total_cost)

                if resp.stop_reason == "pause_turn":
                    # Bucle de búsqueda del servidor en pausa: reenviar para que continúe.
                    messages.append({"role": "assistant", "content": resp.content})
                    continue
                if resp.stop_reason in ("end_turn", "max_tokens") and not nudged:
                    messages.append({"role": "assistant", "content": resp.content})
                    messages.append({"role": "user", "content": "Please call submit_estimate now with your final answer."})
                    nudged = True
                    continue
                break
            log.warning("Claude no envió estimación para %s", m.id)
            return None
        except anthropic.APIError as exc:
            log.error("Error de la API de Claude evaluando %s: %s", m.id, exc)
            return None

    def _to_estimate(self, data, cost: float) -> Estimate | None:
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                return None
        try:
            prob = float(data["probability"])
        except (KeyError, TypeError, ValueError):
            return None
        if prob > 1 and prob <= 100:  # por si responde en porcentaje
            prob /= 100
        prob = min(max(prob, 0.0), 1.0)
        return Estimate(
            fair_yes=prob,
            confidence=str(data.get("confidence", "low")),
            resolution_clear=bool(data.get("resolution_source_clear", False)),
            resolution_source=str(data.get("resolution_source", "")),
            reasoning=str(data.get("reasoning", "")),
            evidence=[str(e) for e in data.get("key_evidence", [])][:5],
            cost_usd=cost,
            model=self.cfg.model,
        )

    def write_postmortem_analysis(self, report: str) -> tuple[str, float]:
        """Análisis cualitativo del post-mortem. Sin herramientas; una sola llamada."""
        resp = self.client.beta.messages.create(
            model=self.cfg.model,
            max_tokens=8000,
            system=(
                "You are reviewing the trading record of an autonomous prediction-market agent "
                "that hit its 40% maximum drawdown and was halted. Write a candid post-mortem in "
                "Spanish: what went wrong, whether losses came from bad forecasts, bad sizing, bad "
                "market selection or bad luck, and concrete changes to consider before restarting."
            ),
            messages=[{"role": "user", "content": report}],
            output_config={"effort": "medium"},
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
        )
        cost = _usage_cost(self.cfg.model, resp.usage)
        if resp.stop_reason == "refusal":
            return "(Claude no generó el análisis.)", cost
        text = "\n".join(b.text for b in resp.content if b.type == "text")
        return text, cost
