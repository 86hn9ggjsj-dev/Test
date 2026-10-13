"""Backtest honesto de mercados de temperatura máxima (sin Claude y sin mirar al futuro).

Idea: en cada momento del pasado, reconstruir
  - el PRECIO que tenía el mercado (historial del CLOB de Polymarket), y
  - la PREVISIÓN tal como estaba publicada en ese momento (Open-Meteo "Previous Runs":
    para cada hora, la previsión emitida N días antes),
y aplicar exactamente las reglas de risk.py (edge > 8 pp, 1/4 Kelly, 6%, 5 posiciones,
salidas). El resultado final de cada mercado sale de su resolución en Polymarket.

Por qué sin Claude: Claude conoce resultados del pasado (entrenamiento) y la búsqueda web
devuelve noticias de hoy; cualquier backtest con él estaría contaminado. Este mide la ventaja
central del bot en los mercados del tiempo: si los precios van por detrás de las previsiones.

Validación walk-forward: los parámetros del modelo (sesgo y dispersión de la previsión) se
ajustan con el primer tramo de mercados (por fecha) y se opera SOLO en el tramo posterior.

Uso:  python -m polybot backtest --days 90
"""

from __future__ import annotations

import logging
import math
import re
from dataclasses import dataclass, field, replace
from datetime import date, datetime, timedelta, timezone

import requests

from . import risk
from .config import Config
from .polymarket import CLOB_URL, GAMMA_URL, Market, parse_market
from .weather import is_weather_market

log = logging.getLogger("polybot.backtest")
PREVIOUS_RUNS_URL = "https://previous-runs-api.open-meteo.com/v1/forecast"
MAX_LEAD_DAYS = 7

# Estaciones de resolución habituales (aeropuertos). Polymarket suele resolver con Weather
# Underground en estas estaciones; revisa la descripción de cada mercado y amplía la tabla si hace falta.
STATIONS = {
    "KLGA": ("New York City", 40.7769, -73.8740), "KORD": ("Chicago", 41.9742, -87.9073),
    "KMIA": ("Miami", 25.7959, -80.2870), "KDAL": ("Dallas", 32.8471, -96.8518),
    "KATL": ("Atlanta", 33.6407, -84.4277), "KSEA": ("Seattle", 47.4502, -122.3088),
    "KLAX": ("Los Angeles", 33.9416, -118.4085), "KDEN": ("Denver", 39.8561, -104.6737),
    "KHOU": ("Houston", 29.6454, -95.2789), "KPHX": ("Phoenix", 33.4342, -112.0116),
    "KBOS": ("Boston", 42.3656, -71.0096), "KPHL": ("Philadelphia", 39.8744, -75.2424),
    "KDCA": ("Washington", 38.8512, -77.0402), "KSFO": ("San Francisco", 37.6213, -122.3790),
    "KAUS": ("Austin", 30.1975, -97.6664), "EGLC": ("London", 51.5048, 0.0495),
    "LFPG": ("Paris", 49.0097, 2.5479), "CYYZ": ("Toronto", 43.6777, -79.6248),
    "RKSI": ("Seoul", 37.4602, 126.4407), "RJTT": ("Tokyo", 35.5494, 139.7798),
    "SAEZ": ("Buenos Aires", -34.8222, -58.5358), "LTAC": ("Ankara", 40.1281, 32.9951),
    "NZWN": ("Wellington", -41.3272, 174.8053), "SBGR": ("Sao Paulo", -23.4356, -46.4731),
}
CITY_ALIASES = {
    "new york city": "KLGA", "new york": "KLGA", "nyc": "KLGA", "chicago": "KORD", "miami": "KMIA",
    "dallas": "KDAL", "atlanta": "KATL", "seattle": "KSEA", "los angeles": "KLAX", "la": "KLAX",
    "denver": "KDEN", "houston": "KHOU", "phoenix": "KPHX", "boston": "KBOS", "philadelphia": "KPHL",
    "washington": "KDCA", "washington dc": "KDCA", "dc": "KDCA", "san francisco": "KSFO", "austin": "KAUS",
    "london": "EGLC", "paris": "LFPG", "toronto": "CYYZ", "seoul": "RKSI", "tokyo": "RJTT",
    "buenos aires": "SAEZ", "ankara": "LTAC", "wellington": "NZWN", "sao paulo": "SBGR", "são paulo": "SBGR",
}
MONTHS = {m: i for i, m in enumerate(
    ["january", "february", "march", "april", "may", "june", "july", "august", "september",
     "october", "november", "december"], start=1)}


# ------------------------------------------------------------- parseo
@dataclass
class TempMarket:
    market: Market
    station: str
    lat: float
    lon: float
    unit: str            # "F" o "C"
    target: date         # día (local) cuya máxima decide el mercado
    kind: str            # "range" | "below" | "above" | "exact"
    lo: int | None
    hi: int | None


_TEMP_Q = re.compile(r"highest temperature in (?P<city>.+?) (?:be|reach|hit|exceed)\b", re.IGNORECASE)
_DATE = re.compile(r"\bon (?P<month>[A-Za-z]+) (?P<day>\d{1,2})\b")
_RANGE = re.compile(r"between (?P<lo>-?\d+)\s*(?:-|–|and|to)\s*(?P<hi>-?\d+)\s*°\s*(?P<u>[FC])", re.IGNORECASE)
_BELOW = re.compile(r"(?P<v>-?\d+)\s*°\s*(?P<u>[FC]) or (?:below|lower|less)", re.IGNORECASE)
_ABOVE = re.compile(r"(?P<v>-?\d+)\s*°\s*(?P<u>[FC]) or (?:higher|above|more)", re.IGNORECASE)
_EXACT = re.compile(r"\bbe (?P<v>-?\d+)\s*°\s*(?P<u>[FC])\b", re.IGNORECASE)


def parse_temp_market(m: Market) -> TempMarket | None:
    """Reconoce 'Will the highest temperature in <ciudad> be <bucket> on <Mes> <día>?'."""
    q = m.question
    city_match = _TEMP_Q.search(q)
    date_match = _DATE.search(q)
    if not city_match or not date_match or m.end_date is None:
        return None
    month = MONTHS.get(date_match["month"].lower())
    if not month:
        return None
    year = m.end_date.year if not (month == 12 and m.end_date.month == 1) else m.end_date.year - 1
    try:
        target = date(year, month, int(date_match["day"]))
    except ValueError:
        return None

    station = next((code for code in STATIONS if code in m.description), None)
    if station is None:
        city = city_match["city"].strip().lower().removeprefix("the ")
        station = CITY_ALIASES.get(city)
    if station is None:
        return None
    _, lat, lon = STATIONS[station]

    for pattern, kind in ((_RANGE, "range"), (_BELOW, "below"), (_ABOVE, "above"), (_EXACT, "exact")):
        mt = pattern.search(q)
        if not mt:
            continue
        unit = mt["u"].upper()
        if kind == "range":
            lo, hi = int(mt["lo"]), int(mt["hi"])
        elif kind == "below":
            lo, hi = None, int(mt["v"])
        elif kind == "above":
            lo, hi = int(mt["v"]), None
        else:
            lo = hi = int(mt["v"])
        return TempMarket(m, station, lat, lon, unit, target, kind, lo, hi)
    return None


# ------------------------------------------------------ modelo de previsión
def _phi(x: float) -> float:
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))


def bucket_prob(mu: float, sd: float, tm: TempMarket) -> float:
    """P(la máxima REDONDEADA cae en el bucket) con T ~ Normal(mu, sd)."""
    lo = -math.inf if tm.lo is None else tm.lo - 0.5
    hi = math.inf if tm.hi is None else tm.hi + 0.5
    p = (_phi((hi - mu) / sd) if hi != math.inf else 1.0) - (_phi((lo - mu) / sd) if lo != -math.inf else 0.0)
    return min(max(p, 0.001), 0.999)


def required_lead(target: date, utc_offset_s: int, t: datetime) -> int:
    """Antigüedad mínima (días) de una previsión para que estuviera publicada en `t` para todo el día objetivo.

    Para cada hora h del día objetivo, la previsión 'previous_dayN' se emitió en h − N·24 h.
    Debe ser <= t para todas las horas, es decir N >= (fin del día local − t) / 24 h.
    """
    day_end_utc = datetime(target.year, target.month, target.day, tzinfo=timezone.utc) + timedelta(days=1) \
        - timedelta(seconds=utc_offset_s)
    return max(1, math.ceil((day_end_utc - t).total_seconds() / 86400))


def forecast_max(prev_runs: dict, target: date, lead: int) -> float | None:
    """Máxima del día objetivo según la previsión emitida `lead` días antes (horas locales)."""
    hourly = prev_runs.get("hourly", {})
    values = hourly.get(f"temperature_2m_previous_day{lead}")
    times = hourly.get("time", [])
    if not values:
        return None
    day = target.isoformat()
    temps = [v for t, v in zip(times, values) if str(t).startswith(day) and v is not None]
    return max(temps) if len(temps) >= 18 else None  # exige casi todo el día


# ------------------------------------------------------------- datos
class HistoryClient:
    """Descarga de datos históricos reales: Gamma (mercados cerrados), CLOB (precios), Open-Meteo."""

    def __init__(self, session: requests.Session | None = None, timeout: float = 20.0):
        self.session = session or requests.Session()
        self.session.headers.setdefault("User-Agent", "polybot-backtest/1.0")
        self.timeout = timeout

    def _get(self, url: str, params: dict | None = None):
        resp = self.session.get(url, params=params, timeout=self.timeout)
        resp.raise_for_status()
        return resp.json()

    def closed_weather_markets(self, days: int, max_markets: int = 3000) -> list[Market]:
        since = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")
        params_base = {"closed": "true", "limit": 100, "order": "endDate", "ascending": "false", "end_date_min": since}
        tag_id = self._weather_tag_id()
        if tag_id:
            params_base["tag_id"] = tag_id
        out, offset = [], 0
        while offset < max_markets:
            page = self._get(f"{GAMMA_URL}/markets", {**params_base, "offset": offset})
            if not isinstance(page, list) or not page:
                break
            for raw in page:
                m = parse_market(raw)
                if m and is_weather_market(m):
                    out.append(m)
            offset += len(page)
        log.info("Gamma: %d mercados del tiempo cerrados en %d días (tag %s)", len(out), days, tag_id)
        return out

    def _weather_tag_id(self) -> str | None:
        try:
            tags = self._get(f"{GAMMA_URL}/tags", {"limit": 1000})
        except (requests.RequestException, ValueError):
            return None
        for t in tags if isinstance(tags, list) else []:
            if str(t.get("slug", "")).lower() == "weather":
                return str(t.get("id"))
        return None

    def price_history(self, token_id: str, start: datetime, end: datetime) -> list[tuple[datetime, float]]:
        params = {"market": token_id, "startTs": int(start.timestamp()), "endTs": int(end.timestamp()), "fidelity": 60}
        data = self._get(f"{CLOB_URL}/prices-history", params)
        if not data.get("history"):
            data = self._get(f"{CLOB_URL}/prices-history", {"market": token_id, "interval": "max", "fidelity": 60})
        return sorted((datetime.fromtimestamp(int(h["t"]), timezone.utc), float(h["p"])) for h in data.get("history", []))

    def previous_runs(self, lat: float, lon: float, start: date, end: date, unit: str) -> dict:
        params = {
            "latitude": lat, "longitude": lon, "start_date": start.isoformat(), "end_date": end.isoformat(),
            "hourly": ",".join(f"temperature_2m_previous_day{n}" for n in range(1, MAX_LEAD_DAYS + 1)),
            "temperature_unit": "fahrenheit" if unit == "F" else "celsius", "timezone": "auto",
        }
        return self._get(PREVIOUS_RUNS_URL, params)


# ------------------------------------------------------------- simulación
@dataclass
class Observation:
    t: datetime
    tm: TempMarket
    price: float          # precio del resultado [0] en ese momento
    lead: int
    fcst: float           # máxima prevista (sin sesgo)
    outcome: int          # 1 si el resultado [0] ganó


@dataclass
class BacktestResult:
    params: dict
    train_markets: int
    test_markets: int
    observations: int
    trades: list[dict] = field(default_factory=list)
    equity_curve: list[tuple[str, float]] = field(default_factory=list)
    final_equity: float = 0.0
    brier_model: float | None = None
    brier_market: float | None = None
    skipped: dict = field(default_factory=dict)


def build_observations(client: HistoryClient, markets: list[Market], step_hours: int = 6) -> tuple[list[Observation], dict]:
    skipped: dict[str, int] = {}

    def skip(reason):
        skipped[reason] = skipped.get(reason, 0) + 1

    obs: list[Observation] = []
    runs_cache: dict[tuple, dict] = {}
    for m in markets:
        tm = parse_temp_market(m)
        if tm is None:
            skip("no es un mercado de temperatura máxima reconocible")
            continue
        outcome = m.resolved_outcome()
        if outcome is None:
            skip("sin resolución clara")
            continue
        start = datetime(tm.target.year, tm.target.month, tm.target.day, tzinfo=timezone.utc) - timedelta(days=4)
        try:
            history = client.price_history(m.token_ids[0], start, m.end_date)
        except (requests.RequestException, ValueError, KeyError) as exc:
            skip("sin historial de precios")
            log.debug("historial %s: %s", m.id, exc)
            continue
        if not history:
            skip("sin historial de precios")
            continue
        key = (tm.station, tm.target, tm.unit)
        if key not in runs_cache:
            try:
                runs_cache[key] = client.previous_runs(tm.lat, tm.lon, tm.target, tm.target, tm.unit)
            except (requests.RequestException, ValueError) as exc:
                log.debug("open-meteo %s: %s", key, exc)
                runs_cache[key] = {}
        runs = runs_cache[key]
        offset = int(runs.get("utc_offset_seconds", 0))
        t = history[0][0]
        idx, n_obs = 0, 0
        while t <= m.end_date:
            while idx + 1 < len(history) and history[idx + 1][0] <= t:
                idx += 1
            if history[idx][0] <= t:
                lead = required_lead(tm.target, offset, t)
                fc = forecast_max(runs, tm.target, lead) if lead <= MAX_LEAD_DAYS else None
                if fc is not None:
                    obs.append(Observation(t, tm, history[idx][1], lead, fc, 1 if outcome == 0 else 0))
                    n_obs += 1
            t += timedelta(hours=step_hours)
        if n_obs == 0:
            skip("sin previsión histórica a tiempo")
    obs.sort(key=lambda o: o.t)
    return obs, skipped


def model_prob(o: Observation, bias: float, sd_base: float) -> float:
    scale = 1.0 if o.tm.unit == "F" else 1 / 1.8
    sd = sd_base * scale * (1 + 0.25 * (o.lead - 1))
    return bucket_prob(o.fcst + bias * scale, sd, o.tm)


def fit_params(train: list[Observation]) -> dict:
    """Ajusta sesgo y dispersión minimizando log-loss en el tramo de entrenamiento."""
    best, best_loss = {"bias": 0.0, "sd_base": 2.5}, math.inf
    if not train:
        return best
    for bias in [x / 4 for x in range(-8, 9)]:            # -2 a +2 °F
        for sd_base in (1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0):
            loss = 0.0
            for o in train:
                p = model_prob(o, bias, sd_base)
                loss -= math.log(p if o.outcome else 1 - p)
            if loss < best_loss:
                best, best_loss = {"bias": bias, "sd_base": sd_base}, loss
    return best


def simulate(obs: list[Observation], params: dict, cfg: Config, spread: float) -> tuple[list[dict], list, float]:
    """Mismas reglas que el bot (risk.py) sobre las observaciones en orden temporal."""
    half = spread / 2
    cash = peak = cfg.initial_bankroll
    halted = False
    positions: dict[str, dict] = {}
    marks: dict[str, float] = {}
    trades, curve = [], []

    def equity():
        return cash + sum(p["shares"] * max((marks[mid] if p["side"] == 0 else 1 - marks[mid]) - half, 0)
                          for mid, p in positions.items())

    def close(mid, proceeds, reason, t):
        nonlocal cash
        p = positions.pop(mid)
        cash += proceeds
        trades.append({"t": t.isoformat(), "question": p["question"], "side": p["side_name"],
                       "cost": round(p["cost"], 4), "proceeds": round(proceeds, 4),
                       "pnl": round(proceeds - p["cost"], 4), "reason": reason})

    ends = {}
    for o in obs:
        ends[o.tm.market.id] = (o.tm.market.end_date, o.outcome)
    last_day = None
    for o in obs:
        # liquidar mercados resueltos antes de este momento
        for mid in [mid for mid in positions if ends[mid][0] <= o.t]:
            p = positions[mid]
            won = (ends[mid][1] == 1) == (p["side"] == 0)
            close(mid, p["shares"] if won else 0.0, "resolved_win" if won else "resolved_loss", ends[mid][0])
        m = o.tm.market
        marks[m.id] = o.price
        fair_yes = model_prob(o, params["bias"], params["sd_base"])
        hours_left = (m.end_date - o.t).total_seconds() / 3600

        if m.id in positions and not halted:  # parado = no se opera, ni para salir (como el bot)
            p = positions[m.id]
            fv = fair_yes if p["side"] == 0 else 1 - fair_yes
            p["fv"] = cfg.fv_smoothing * p["fv"] + (1 - cfg.fv_smoothing) * fv
            mid_price = o.price if p["side"] == 0 else 1 - o.price
            reason = ("near_resolution" if hours_left < cfg.exit_hours_before_resolution
                      else "fair_value_moved_against" if p["entry_fv"] - p["fv"] > cfg.fv_move_exit
                      else "edge_gone" if p["fv"] - mid_price < cfg.exit_edge else None)
            if reason:
                close(m.id, p["shares"] * max(mid_price - half, 0), reason, o.t)
        elif not halted and hours_left >= cfg.min_hours_to_resolution and cfg.min_price <= o.price <= cfg.max_price:
            choice = risk.best_side(fair_yes, o.price + half, (1 - o.price) + half, cfg.taker_fee)
            eq = equity()
            stake, _ = risk.position_size_usd(eq, cash, choice.fair_value, choice.price, cfg)
            blockers = risk.entry_blockers(edge=choice.edge, confidence="high", resolution_clear=True,
                                           open_positions=len(positions), halted=halted, cfg=cfg)
            if not blockers and stake >= 1.0 and stake / choice.price >= 5:
                cash -= stake
                positions[m.id] = {"side": choice.outcome_index, "side_name": m.outcomes[choice.outcome_index],
                                   "shares": stake / choice.price, "cost": stake, "entry_fv": choice.fair_value,
                                   "fv": choice.fair_value, "question": m.question}

        eq = equity()
        peak = max(peak, eq)
        if not halted and risk.drawdown_breached(eq, peak, cfg):
            halted = True
            trades.append({"t": o.t.isoformat(), "question": "PARADA POR DRAWDOWN 40%", "side": "", "cost": 0,
                           "proceeds": 0, "pnl": 0, "reason": "halt"})
        day = o.t.date().isoformat()
        if day != last_day:
            curve.append((day, round(eq, 4)))
            last_day = day
    # liquidar lo que quede abierto
    for mid in list(positions):
        p = positions[mid]
        won = (ends[mid][1] == 1) == (p["side"] == 0)
        close(mid, p["shares"] if won else 0.0, "resolved_win" if won else "resolved_loss", ends[mid][0])
    final = cash
    if curve:
        curve.append((curve[-1][0], round(final, 4)))
    return trades, curve, final


def brier(obs: list[Observation], params: dict) -> tuple[float | None, float | None]:
    if not obs:
        return None, None
    bm = sum((model_prob(o, params["bias"], params["sd_base"]) - o.outcome) ** 2 for o in obs) / len(obs)
    bk = sum((o.price - o.outcome) ** 2 for o in obs) / len(obs)
    return bm, bk


def run_backtest(client: HistoryClient, cfg: Config, *, days: int = 90, train_frac: float = 0.4,
                 spread: float = 0.02, bankroll: float = 50.0, max_markets: int = 3000) -> BacktestResult:
    cfg = replace(cfg, initial_bankroll=bankroll)
    markets = client.closed_weather_markets(days, max_markets)
    obs, skipped = build_observations(client, markets)
    targets = sorted({o.tm.target for o in obs})
    if not targets:
        return BacktestResult(params={}, train_markets=0, test_markets=0, observations=0, skipped=skipped,
                              final_equity=bankroll)
    cut = targets[min(len(targets) - 1, int(len(targets) * train_frac))]
    train = [o for o in obs if o.tm.target < cut]
    test = [o for o in obs if o.tm.target >= cut]
    params = fit_params(train)
    trades, curve, final = simulate(test, params, cfg, spread)
    bm, bk = brier(test, params)
    return BacktestResult(
        params=params, train_markets=len({o.tm.market.id for o in train}),
        test_markets=len({o.tm.market.id for o in test}), observations=len(obs),
        trades=trades, equity_curve=curve, final_equity=final, brier_model=bm, brier_market=bk, skipped=skipped,
    )


def render(res: BacktestResult, bankroll: float) -> str:
    real = [t for t in res.trades if t["reason"] != "halt"]
    wins = sum(1 for t in real if t["pnl"] > 0)
    lines = [
        "# Backtest — mercados de temperatura máxima",
        "",
        "Precio histórico de Polymarket vs. previsión publicada en cada momento (Open-Meteo Previous Runs).",
        "Parámetros ajustados con el primer tramo; trading simulado SOLO en el tramo posterior (walk-forward).",
        "",
        f"- Observaciones: {res.observations} · mercados entrenamiento: {res.train_markets} · test: {res.test_markets}",
        f"- Modelo ajustado: sesgo {res.params.get('bias', 0):+.2f} °F, dispersión base {res.params.get('sd_base', 0):.1f} °F",
    ]
    if res.brier_model is not None:
        better = res.brier_model < res.brier_market
        lines.append(f"- Brier en test (más bajo = mejor): modelo {res.brier_model:.4f} · mercado {res.brier_market:.4f} → "
                     f"{'la previsión bate al precio' if better else 'el mercado va por delante de la previsión'}")
    lines += [
        f"- Trades: {len(real)} · ganadores {wins} · win rate {wins / len(real) * 100:.0f}%" if real else "- Trades: 0",
        f"- Bankroll: ${bankroll:.2f} → **${res.final_equity:.2f}** ({(res.final_equity / bankroll - 1) * 100:+.1f}%)",
    ]
    if any(t["reason"] == "halt" for t in res.trades):
        lines.append("- ⛔ Se alcanzó el 40% de drawdown: el bot real se habría parado ahí.")
    if res.skipped:
        lines += ["", "Mercados descartados:"] + [f"- {k}: {v}" for k, v in sorted(res.skipped.items(), key=lambda x: -x[1])]
    if real:
        lines += ["", "| Fecha | Mercado | Lado | PnL | Motivo |", "|---|---|---|---|---|"]
        for t in real[-30:]:
            lines.append(f"| {t['t'][:16]} | {t['question'][:70]} | {t['side']} | ${t['pnl']:+.2f} | {t['reason']} |")
    lines += ["", "Limitaciones: sin coste de API (no usa Claude); spread fijo supuesto; la liquidez histórica no se "
                  "conoce, así que no se filtra por ella; solo mercados de máxima diaria de ciudades de la tabla STATIONS. "
                  "El historial del CLOB son precios puntuales: si rebotan entre bid y ask, comprar barato y vender caro "
                  "parece rentable y no lo es. Desconfía si casi todo el beneficio viene de salidas (edge_gone) y no de "
                  "mercados resueltos; prueba con más --spread para ver si aguanta."]
    return "\n".join(lines) + "\n"
