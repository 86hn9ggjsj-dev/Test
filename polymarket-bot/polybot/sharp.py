"""Agente CUOTAS: fair value de partidos a partir de una casa de apuestas "sharp" (Pinnacle).

Idea (la que usan muchos traders de deportes que ganan): las cuotas de Pinnacle, sin el margen
de la casa, son una de las mejores estimaciones públicas de la probabilidad real de un partido.
Cuando Polymarket se desvía de ellas, la ventaja suele estar del lado de Pinnacle.

Datos: The Odds API (https://the-odds-api.com), región "eu", casa "pinnacle".
Mercados: h2h (ganador, con empate en fútbol), totals (más/menos) y spreads (hándicap).
"""

from __future__ import annotations

import difflib
import logging
import re
import unicodedata
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone

import requests

from .polymarket import Market

log = logging.getLogger("polybot.sharp")
ODDS_URL = "https://api.the-odds-api.com/v4"

# Palabras que no ayudan a identificar al equipo.
_NOISE = {"fc", "cf", "sc", "ac", "afc", "cd", "ud", "sd", "rc", "rcd", "sk", "kv", "fk", "bk", "if", "ssc", "as",
          "club", "de", "del", "la", "the", "calcio", "sporting", "and", "&"}
# Equivalencias habituales entre los nombres de Polymarket y los de las casas de apuestas.
_ALIASES = {
    "munchen": "munich", "internazionale": "inter", "milano": "milan", "atletico": "atletico", "atlético": "atletico",
    "wolverhampton wanderers": "wolves", "tottenham hotspur": "tottenham", "paris saint germain": "psg",
    "paris saint-germain": "psg", "manchester utd": "manchester united", "man united": "manchester united",
    "man city": "manchester city", "brighton and hove albion": "brighton", "newcastle united": "newcastle",
    "west ham united": "west ham", "nottingham forest": "nottingham", "la dodgers": "los angeles dodgers",
    "la angels": "los angeles angels", "ny yankees": "new york yankees", "ny mets": "new york mets",
}


def normalize_team(name: str) -> str:
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode().lower()
    s = re.sub(r"[^a-z0-9 ]+", " ", s)
    s = " ".join(s.split())
    for k, v in _ALIASES.items():
        k2 = unicodedata.normalize("NFKD", k).encode("ascii", "ignore").decode()
        s = re.sub(rf"\b{re.escape(k2)}\b", v, s)
    words = [w for w in s.split() if w not in _NOISE]
    return " ".join(words) or s


def team_score(a: str, b: str) -> float:
    """Parecido entre dos nombres de equipo (0-1)."""
    na, nb = normalize_team(a), normalize_team(b)
    if not na or not nb:
        return 0.0
    if na == nb:
        return 1.0
    wa, wb = na.split(), nb.split()
    longer, shorter = (wa, wb) if len(wa) >= len(wb) else (wb, wa)
    ratio = lambda x, y: difflib.SequenceMatcher(None, x, y).ratio()  # noqa: E731
    # cada palabra del nombre más largo frente a su mejor pareja: "milan" ≠ "inter milan"
    score = sum(max(ratio(w, v) for v in shorter) for w in longer) / len(longer)
    # la palabra final suele ser la distintiva (Yankees/Mets, City/United): si no coincide, no es el mismo equipo
    if ratio(wa[-1], wb[-1]) < 0.8:
        score *= 0.5
    return score


def devig(prices: list[float]) -> list[float]:
    """Cuotas decimales -> probabilidades sin el margen de la casa (normalización multiplicativa)."""
    inv = [1 / p for p in prices if p and p > 1]
    if len(inv) != len(prices):
        return []
    total = sum(inv)
    return [x / total for x in inv]


@dataclass
class SharpEvent:
    home: str
    away: str
    commence: datetime
    sport: str
    h2h: dict[str, float] = field(default_factory=dict)                       # equipo/"Draw" -> prob
    totals: dict[float, dict[str, float]] = field(default_factory=dict)       # línea -> {"Over": p, "Under": p}
    spreads: list[tuple[str, float, float]] = field(default_factory=list)     # (equipo, línea, prob)

    def team_match(self, name: str) -> tuple[str | None, float]:
        cands = [(self.home, team_score(name, self.home)), (self.away, team_score(name, self.away))]
        best = max(cands, key=lambda x: x[1])
        return (best[0], best[1]) if best[1] >= 0.72 else (None, best[1])


def parse_event(raw: dict, bookmaker: str) -> SharpEvent | None:
    try:
        commence = datetime.fromisoformat(raw["commence_time"].replace("Z", "+00:00"))
    except (KeyError, ValueError):
        return None
    ev = SharpEvent(raw.get("home_team", ""), raw.get("away_team", ""), commence, raw.get("sport_key", ""))
    book = next((b for b in raw.get("bookmakers", []) if b.get("key") == bookmaker), None)
    if not book:
        return None
    for mk in book.get("markets", []):
        outs = mk.get("outcomes", [])
        probs = devig([float(o.get("price", 0)) for o in outs])
        if not probs:
            continue
        if mk.get("key") == "h2h":
            ev.h2h = {o["name"]: p for o, p in zip(outs, probs)}
        elif mk.get("key") == "totals" and len(outs) == 2:
            point = float(outs[0].get("point", 0))
            ev.totals[point] = {o["name"]: p for o, p in zip(outs, probs)}
        elif mk.get("key") == "spreads" and len(outs) == 2:
            for o, p in zip(outs, probs):
                ev.spreads.append((o["name"], float(o.get("point", 0)), p))
    return ev


class OddsClient:
    def __init__(self, api_key: str, regions: str = "eu", bookmaker: str = "pinnacle",
                 session: requests.Session | None = None, timeout: float = 20.0):
        self.api_key, self.regions, self.bookmaker = api_key, regions, bookmaker
        self.session = session or requests.Session()
        self.timeout = timeout
        self.remaining: str | None = None  # créditos restantes según la cabecera de la API

    def odds(self, sport: str, markets: str) -> list[dict]:
        resp = self.session.get(f"{ODDS_URL}/sports/{sport}/odds", timeout=self.timeout, params={
            "apiKey": self.api_key, "regions": self.regions, "markets": markets,
            "oddsFormat": "decimal", "bookmakers": self.bookmaker})
        self.remaining = resp.headers.get("x-requests-remaining", self.remaining)
        if resp.status_code in (401, 429):
            raise requests.HTTPError(f"The Odds API {resp.status_code}: {resp.text[:200]}", response=resp)
        if resp.status_code == 422 or resp.status_code == 404:  # deporte sin partidos / clave de deporte inválida
            return []
        resp.raise_for_status()
        data = resp.json()
        return data if isinstance(data, list) else []


class SharpBook:
    """Índice de partidos con probabilidades de Pinnacle, refrescado cada X minutos."""

    def __init__(self, client: OddsClient, sports: list[str], markets: str, refresh_minutes: float):
        self.client, self.sports, self.markets = client, sports, markets
        self.refresh_minutes = refresh_minutes
        self.events: list[SharpEvent] = []
        self.updated_at: datetime | None = None

    def refresh_if_stale(self, now: datetime | None = None) -> bool:
        now = now or datetime.now(timezone.utc)
        if self.updated_at and now - self.updated_at < timedelta(minutes=self.refresh_minutes):
            return False
        events = []
        for sport in self.sports:
            try:
                for raw in self.client.odds(sport, self.markets):
                    ev = parse_event(raw, self.client.bookmaker)
                    if ev:
                        events.append(ev)
            except requests.RequestException as exc:
                log.warning("Cuotas %s: %s", sport, exc)
        self.events, self.updated_at = events, now
        log.info("CUOTAS: %d partidos con Pinnacle (créditos restantes: %s)", len(events), self.client.remaining)
        return True

    # ---------------------------------------------------------------- emparejar
    def fair_yes(self, m: Market) -> tuple[float | None, str]:
        """Probabilidad justa del resultado [0] del mercado de Polymarket, o (None, motivo)."""
        raw = m.raw or {}
        kind = (raw.get("sportsMarketType") or "").lower()
        start = _parse_dt(raw.get("gameStartTime")) or m.end_date
        title = ((raw.get("events") or [{}])[0] or {}).get("title") or m.question
        teams = _teams_from_title(title)
        if not teams or start is None:
            return None, "sin equipos u hora de inicio"
        ev = self._find_event(teams, start)
        if ev is None:
            return None, "partido no encontrado en Pinnacle"
        o0 = m.outcomes[0]

        if kind == "moneyline":
            if o0.lower() in ("yes", "sí", "si"):
                q = m.question.lower()
                if "draw" in q:
                    p = ev.h2h.get("Draw")
                    return (p, "empate") if p is not None else (None, "sin cuota de empate")
                mt = re.search(r"will (.+?) win", m.question, re.I)
                name, score = ev.team_match(mt.group(1)) if mt else (None, 0)
                if name is None or name not in ev.h2h:
                    return None, "equipo no emparejado"
                return ev.h2h[name], f"gana {name}"
            name, _ = ev.team_match(o0)
            if name is None or name not in ev.h2h:
                return None, "equipo no emparejado"
            if "Draw" in ev.h2h:  # fútbol: un mercado de 2 resultados no encaja con 3 resultados
                return None, "mercado de 2 resultados con empate posible"
            return ev.h2h[name], f"gana {name}"

        if kind == "totals":
            line = _float(raw.get("line"))
            if line is None or line not in ev.totals or o0.lower() not in ("over", "under"):
                return None, "línea de más/menos no disponible"
            return ev.totals[line]["Over" if o0.lower() == "over" else "Under"], f"{o0} {line}"

        if kind == "spreads":
            line = _float(raw.get("line"))
            name, _ = ev.team_match(o0)
            if line is None or name is None:
                return None, "hándicap no emparejado"
            for team, point, p in ev.spreads:
                if team == name and abs(point - line) < 1e-9:
                    return p, f"{name} {line:+g}"
            return None, "línea de hándicap no disponible"
        return None, f"tipo de mercado no soportado ({kind or '?'})"

    def _find_event(self, teams: tuple[str, str], start: datetime) -> SharpEvent | None:
        best, best_score = None, 0.0
        for ev in self.events:
            if abs((ev.commence - start).total_seconds()) > 3 * 3600:
                continue
            s1 = min(team_score(teams[0], ev.home), team_score(teams[1], ev.away))
            s2 = min(team_score(teams[0], ev.away), team_score(teams[1], ev.home))
            score = max(s1, s2)
            if score > best_score:
                best, best_score = ev, score
        return best if best_score >= 0.72 else None


def _teams_from_title(title: str) -> tuple[str, str] | None:
    title = re.sub(r"\s+-\s+(More Markets|.*Winner.*)$", "", title, flags=re.I)
    title = re.sub(r"^[A-Za-z0-9 ]+:\s+", "", title)  # "LoL: ", "UFC 330: "
    parts = re.split(r"\s+vs\.?\s+", title, flags=re.I)
    if len(parts) != 2:
        return None
    return parts[0].strip(), re.sub(r"\s*\(.*\)$", "", parts[1]).strip()


def _parse_dt(value) -> datetime | None:
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(str(value).replace("Z", "+00:00").replace(" ", "T"))
    except ValueError:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _float(v) -> float | None:
    try:
        return float(v)
    except (TypeError, ValueError):
        return None
