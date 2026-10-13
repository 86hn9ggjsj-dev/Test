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

import hashlib
import json
import logging
import math
import re
import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field, replace
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

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
    # EE. UU. / Canadá / México
    "KLGA": ("New York City", 40.7769, -73.8740), "KORD": ("Chicago", 41.9742, -87.9073),
    "KMIA": ("Miami", 25.7959, -80.2870), "KDAL": ("Dallas", 32.8471, -96.8518),
    "KATL": ("Atlanta", 33.6407, -84.4277), "KSEA": ("Seattle", 47.4502, -122.3088),
    "KLAX": ("Los Angeles", 33.9416, -118.4085), "KBKF": ("Denver", 39.7017, -104.7516),
    "KDEN": ("Denver", 39.8561, -104.6737), "KHOU": ("Houston", 29.6454, -95.2789),
    "KPHX": ("Phoenix", 33.4342, -112.0116), "KBOS": ("Boston", 42.3656, -71.0096),
    "KPHL": ("Philadelphia", 39.8744, -75.2424), "KDCA": ("Washington", 38.8512, -77.0402),
    "KSFO": ("San Francisco", 37.6213, -122.3790), "KAUS": ("Austin", 30.1975, -97.6664),
    "CYYZ": ("Toronto", 43.6777, -79.6248), "MMMX": ("Mexico City", 19.4361, -99.0719),
    "MPMG": ("Panama City", 8.9733, -79.5556),
    # Sudamérica / África / Oriente Medio
    "SAEZ": ("Buenos Aires", -34.8222, -58.5358), "SBGR": ("Sao Paulo", -23.4356, -46.4731),
    "FACT": ("Cape Town", -33.9715, 18.6021), "OEJN": ("Jeddah", 21.6796, 39.1565),
    "LLBG": ("Tel Aviv", 32.0055, 34.8854), "OPKC": ("Karachi", 24.9065, 67.1608),
    # Europa
    "EGLC": ("London", 51.5048, 0.0495), "LFPB": ("Paris", 48.9694, 2.4414), "LFPG": ("Paris", 49.0097, 2.5479),
    "LEMD": ("Madrid", 40.4983, -3.5676), "LIMC": ("Milan", 45.6306, 8.7281), "EDDM": ("Munich", 48.3538, 11.7861),
    "EHAM": ("Amsterdam", 52.3105, 4.7683), "EFHK": ("Helsinki", 60.3172, 24.9633),
    "EPWA": ("Warsaw", 52.1657, 20.9671), "LTFM": ("Istanbul", 41.2753, 28.7519),
    "LTAC": ("Ankara", 40.1281, 32.9951), "UUWW": ("Moscow", 55.5915, 37.2615),
    # Asia / Oceanía
    "VILK": ("Lucknow", 26.7606, 80.8893), "RJTT": ("Tokyo", 35.5494, 139.7798),
    "RKSI": ("Seoul", 37.4602, 126.4407), "RKPK": ("Busan", 35.1795, 128.9382),
    "RCSS": ("Taipei", 25.0697, 121.5525), "ZBAA": ("Beijing", 40.0801, 116.5846),
    "ZSPD": ("Shanghai", 31.1443, 121.8083), "ZSQD": ("Qingdao", 36.3614, 120.0880),
    "ZGGG": ("Guangzhou", 23.3924, 113.2988), "ZGSZ": ("Shenzhen", 22.6393, 113.8107),
    "ZUUU": ("Chengdu", 30.5785, 103.9471), "ZUCK": ("Chongqing", 29.7192, 106.6417),
    "ZHHH": ("Wuhan", 30.7838, 114.2081), "ZHCC": ("Zhengzhou", 34.5197, 113.8409),
    "ZSJN": ("Jinan", 36.8572, 117.2160), "VHHH": ("Hong Kong", 22.3020, 114.1742),  # Observatorio de HK
    "RPLL": ("Manila", 14.5086, 121.0198), "WMKK": ("Kuala Lumpur", 2.7456, 101.7099),
    "WSSS": ("Singapore", 1.3644, 103.9915), "NZWN": ("Wellington", -41.3272, 174.8053),
    "SBGL": ("Rio de Janeiro", -22.8099, -43.2506),
}
CITY_ALIASES = {v[0].lower(): k for k, v in STATIONS.items() if k not in ("KDEN", "LFPG")}
CITY_ALIASES.update({
    "nyc": "KLGA", "new york": "KLGA", "la": "KLAX", "dc": "KDCA", "washington dc": "KDCA", "seoul (incheon)": "RKSI",
    "são paulo": "SBGR", "hong kong": "VHHH", "denver": "KBKF", "paris": "LFPB",
})
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
    target: date         # día (local) cuya temperatura decide el mercado
    kind: str            # "range" | "below" | "above" | "exact"
    lo: int | None
    hi: int | None
    stat: str = "max"    # "max" (temperatura más alta del día) o "min" (más baja)


_TEMP_Q = re.compile(r"(?P<stat>highest|lowest) temperature in (?P<city>.+?) (?:be|reach|hit|exceed)\b", re.IGNORECASE)
_SITE = re.compile(r"site=([A-Za-z0-9]{4})\b")
_DATE = re.compile(r"\bon (?P<month>[A-Za-z]+) (?P<day>\d{1,2})\b")
_RANGE = re.compile(r"between (?P<lo>-?\d+)\s*(?:-|–|and|to)\s*(?P<hi>-?\d+)\s*°\s*(?P<u>[FC])", re.IGNORECASE)
_BELOW = re.compile(r"(?P<v>-?\d+)\s*°\s*(?P<u>[FC]) or (?:below|lower|less)", re.IGNORECASE)
_ABOVE = re.compile(r"(?P<v>-?\d+)\s*°\s*(?P<u>[FC]) or (?:higher|above|more)", re.IGNORECASE)
_EXACT = re.compile(r"\bbe (?P<v>-?\d+)\s*°\s*(?P<u>[FC])\b", re.IGNORECASE)


def parse_temp_market(m: Market) -> TempMarket | None:
    """Reconoce 'Will the highest/lowest temperature in <ciudad> be <bucket> on <Mes> <día>?'."""
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

    site = _SITE.search(m.description + " " + m.resolution_source)
    station = site.group(1).upper() if site and site.group(1).upper() in STATIONS else None
    if station is None:
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
        stat = "max" if city_match["stat"].lower() == "highest" else "min"
        return TempMarket(m, station, lat, lon, unit, target, kind, lo, hi, stat)
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


def forecast_max(prev_runs: dict, target: date, lead: int, stat: str = "max") -> float | None:
    """Máxima (o mínima) del día objetivo según la previsión emitida `lead` días antes (horas locales)."""
    hourly = prev_runs.get("hourly", {})
    values = hourly.get(f"temperature_2m_previous_day{lead}")
    times = hourly.get("time", [])
    if not values:
        return None
    day = target.isoformat()
    temps = [v for t, v in zip(times, values) if str(t).startswith(day) and v is not None]
    if len(temps) < 18:  # exige casi todo el día
        return None
    return max(temps) if stat == "max" else min(temps)


# ------------------------------------------------------------- datos
class HistoryClient:
    """Descarga de datos históricos reales: Gamma (eventos cerrados), CLOB (precios), Open-Meteo."""

    DAILY_TEMPERATURE_TAG = "daily-temperature"

    def __init__(self, session: requests.Session | None = None, timeout: float = 60.0, cache_dir=None):
        self.session = session or requests.Session()
        self.session.headers.setdefault("User-Agent", "polybot-backtest/1.0")
        self.timeout = timeout
        self.cache_dir = Path(cache_dir) if cache_dir else None  # caché en disco: reinicios sin re-descargar
        if self.cache_dir:
            self.cache_dir.mkdir(parents=True, exist_ok=True)
        self._last_meteo = 0.0

    def _cached(self, key: str, fetch):
        if not self.cache_dir:
            return fetch()
        path = self.cache_dir / (hashlib.sha1(key.encode()).hexdigest() + ".json")
        if path.exists():
            return json.loads(path.read_text())
        data = fetch()
        path.write_text(json.dumps(data))
        return data

    def _get(self, url: str, params: dict | None = None, retries: int = 6):
        for attempt in range(retries):
            try:
                resp = self.session.get(url, params=params, timeout=self.timeout)
            except (requests.Timeout, requests.ConnectionError):
                if attempt == retries - 1:
                    raise
                time.sleep(min(2 ** attempt, 30))
                continue
            if resp.status_code == 429 or resp.status_code >= 500:
                wait = float(resp.headers.get("retry-after") or 0) or min(5 * 2 ** attempt, 120)
                time.sleep(wait)
                continue
            resp.raise_for_status()
            return resp.json()
        resp.raise_for_status()
        return resp.json()

    def _tag_id(self, slug: str) -> str | None:
        try:
            return str(self._get(f"{GAMMA_URL}/tags/slug/{slug}").get("id"))
        except (requests.RequestException, ValueError, AttributeError):
            return None

    def closed_weather_markets(self, days: int, max_markets: int = 3000) -> list[Market]:
        """Mercados de temperatura diaria ya cerrados (eventos con la etiqueta daily-temperature)."""
        now = datetime.now(timezone.utc)
        tag_id = self._tag_id(self.DAILY_TEMPERATURE_TAG)
        if not tag_id:
            log.warning("No se encontró la etiqueta %s en Gamma", self.DAILY_TEMPERATURE_TAG)
            return []
        # Gamma no pagina más allá de ~2.000 resultados por consulta: se pide día a día.
        out, events, seen = [], 0, set()
        day_end = now
        while day_end > now - timedelta(days=days) and len(out) < max_markets:
            day_start = day_end - timedelta(days=1)
            offset = 0
            while offset < 2000 and len(out) < max_markets:
                try:
                    page = self._get(f"{GAMMA_URL}/events", {
                        "tag_id": tag_id, "closed": "true", "limit": 100, "offset": offset,
                        "end_date_min": day_start.strftime("%Y-%m-%dT%H:%M:%SZ"),
                        "end_date_max": day_end.strftime("%Y-%m-%dT%H:%M:%SZ")})
                except requests.HTTPError as exc:
                    log.warning("Gamma %s → %s", day_start.date(), exc)
                    break
                if not isinstance(page, list) or not page:
                    break
                for ev in page:
                    if ev.get("id") in seen:
                        continue
                    seen.add(ev.get("id"))
                    events += 1
                    for raw in ev.get("markets") or []:
                        m = parse_market(raw)
                        if m:
                            out.append(m)
                offset += len(page)
                if len(page) < 100:
                    break
            day_end = day_start
        log.info("Gamma: %d eventos, %d mercados de temperatura cerrados en %d días", events, len(out), days)
        return out[:max_markets]

    def price_history(self, token_id: str, start: datetime, end: datetime) -> list[tuple[datetime, float]]:
        params = {"market": token_id, "startTs": int(start.timestamp()), "endTs": int(end.timestamp()), "fidelity": 60}

        def fetch():
            data = self._get(f"{CLOB_URL}/prices-history", params)
            if not data.get("history"):
                data = self._get(f"{CLOB_URL}/prices-history", {"market": token_id, "interval": "max", "fidelity": 60})
            return data

        data = self._cached(f"ph:{token_id}:{params['startTs']}:{params['endTs']}", fetch)
        return sorted((datetime.fromtimestamp(int(h["t"]), timezone.utc), float(h["p"])) for h in data.get("history", []))

    def previous_runs(self, lat: float, lon: float, start: date, end: date, unit: str) -> dict:
        params = {
            "latitude": lat, "longitude": lon, "start_date": start.isoformat(), "end_date": end.isoformat(),
            "hourly": ",".join(f"temperature_2m_previous_day{n}" for n in range(1, MAX_LEAD_DAYS + 1)),
            "temperature_unit": "fahrenheit" if unit == "F" else "celsius", "timezone": "auto",
        }

        def fetch():
            # Open-Meteo gratuito limita peticiones por minuto: espaciarlas.
            wait = 6.0 - (time.monotonic() - self._last_meteo)
            if wait > 0:
                time.sleep(wait)
            try:
                return self._get(PREVIOUS_RUNS_URL, params)
            finally:
                self._last_meteo = time.monotonic()

        return self._cached(f"om:{lat}:{lon}:{start}:{end}:{unit}", fetch)


# ------------------------------------------------------------- simulación
@dataclass
class Observation:
    t: datetime
    tm: TempMarket
    price: float          # precio del resultado [0] en ese momento
    lead: int
    fcst: float           # temperatura extrema prevista (sin sesgo)
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
    period: tuple[str, str] = ("", "")


def build_observations(client: HistoryClient, markets: list[Market], step_hours: int = 2,
                       workers: int = 8) -> tuple[list[Observation], dict]:
    skipped: dict[str, int] = {}

    def skip(reason, n=1):
        skipped[reason] = skipped.get(reason, 0) + n

    parsed: list[TempMarket] = []
    for m in markets:
        tm = parse_temp_market(m)
        if tm is None:
            skip("no es un mercado de temperatura reconocible (o ciudad sin estación en la tabla)")
        elif m.resolved_outcome() is None:
            skip("sin resolución clara")
        else:
            parsed.append(tm)

    # Previsiones: UNA petición por estación para todo el periodo.
    runs: dict[tuple, dict] = {}
    by_station: dict[tuple, list[TempMarket]] = {}
    for tm in parsed:
        by_station.setdefault((tm.station, tm.unit), []).append(tm)
    for (station, unit), tms in by_station.items():
        first, last = min(t.target for t in tms), max(t.target for t in tms)
        try:
            runs[(station, unit)] = client.previous_runs(tms[0].lat, tms[0].lon, first, last, unit)
        except (requests.RequestException, ValueError) as exc:
            log.warning("Open-Meteo %s: %s", station, exc)
            runs[(station, unit)] = {}

    # Precios: en paralelo.
    def fetch(tm: TempMarket):
        start = datetime(tm.target.year, tm.target.month, tm.target.day, tzinfo=timezone.utc) - timedelta(days=4)
        try:
            return tm, client.price_history(tm.market.token_ids[0], start, tm.market.end_date)
        except (requests.RequestException, ValueError, KeyError) as exc:
            log.debug("historial %s: %s", tm.market.id, exc)
            return tm, None

    obs: list[Observation] = []
    with ThreadPoolExecutor(max_workers=workers) as pool:
        for done, (tm, history) in enumerate(pool.map(fetch, parsed), start=1):
            if done % 500 == 0:
                log.info("Historiales descargados: %d/%d", done, len(parsed))
            if not history:
                skip("sin historial de precios")
                continue
            r = runs.get((tm.station, tm.unit), {})
            offset = int(r.get("utc_offset_seconds", 0))
            outcome = 1 if tm.market.resolved_outcome() == 0 else 0
            t, idx, n_obs = history[0][0], 0, 0
            while t <= tm.market.end_date:
                while idx + 1 < len(history) and history[idx + 1][0] <= t:
                    idx += 1
                lead = required_lead(tm.target, offset, t)
                fc = forecast_max(r, tm.target, lead, tm.stat) if lead <= MAX_LEAD_DAYS else None
                if fc is not None:
                    obs.append(Observation(t, tm, history[idx][1], lead, fc, outcome))
                    n_obs += 1
                t += timedelta(hours=step_hours)
            if n_obs == 0:
                skip("sin previsión histórica a tiempo")
    obs.sort(key=lambda o: o.t)
    offsets = {k: int(v.get("utc_offset_seconds", 0)) for k, v in runs.items()}
    return obs, skipped, offsets


DEFAULT_PARAMS = {"bias": 0.0, "sd_base": 2.5}


def model_prob(o: Observation, params: dict) -> float:
    p = params.get(o.tm.stat, DEFAULT_PARAMS)
    scale = 1.0 if o.tm.unit == "F" else 1 / 1.8
    sd = p["sd_base"] * scale * (1 + 0.25 * (o.lead - 1))
    return bucket_prob(o.fcst + p["bias"] * scale, sd, o.tm)


def fit_params(train: list[Observation]) -> dict:
    """Ajusta sesgo y dispersión (por máximas y mínimas) minimizando log-loss en el tramo de entrenamiento."""
    out = {}
    for stat in ("max", "min"):
        rows = [o for o in train if o.tm.stat == stat]
        if not rows:  # sin datos de entrenamiento: parámetros neutros, nunca un extremo de la rejilla
            out[stat] = dict(DEFAULT_PARAMS)
            continue
        best, best_loss = dict(DEFAULT_PARAMS), math.inf
        for bias in [x / 4 for x in range(-12, 13)]:          # -3 a +3 °F
            for sd_base in (1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0):
                cand = {stat: {"bias": bias, "sd_base": sd_base}}
                loss = 0.0
                for o in rows:
                    pr = model_prob(o, cand)
                    loss -= math.log(pr if o.outcome else 1 - pr)
                if loss < best_loss:
                    best, best_loss = {"bias": bias, "sd_base": sd_base}, loss
        out[stat] = best
    return out


def local_day_start(o: Observation, offsets: dict) -> datetime:
    off = offsets.get((o.tm.station, o.tm.unit), 0)
    return datetime(o.tm.target.year, o.tm.target.month, o.tm.target.day, tzinfo=timezone.utc) - timedelta(seconds=off)


def simulate(obs: list[Observation], params: dict, cfg: Config, spread: float, *, hold: bool = False,
             offsets: dict | None = None) -> tuple[list[dict], list, float]:
    """Mismas reglas que el bot (risk.py) sobre las observaciones en orden temporal.

    Solo se entra ANTES de que empiece el día local objetivo: después, el mercado ya ve la
    temperatura real y este modelo (solo previsiones) compararía con desventaja.
    hold=True: sin salidas anticipadas, se mantiene hasta la resolución.
    """
    offsets = offsets or {}
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
        fair_yes = model_prob(o, params)
        hours_left = (m.end_date - o.t).total_seconds() / 3600

        if m.id in positions and not halted and not hold:  # parado = no se opera, ni para salir
            p = positions[m.id]
            fv = fair_yes if p["side"] == 0 else 1 - fair_yes
            p["fv"] = cfg.fv_smoothing * p["fv"] + (1 - cfg.fv_smoothing) * fv
            mid_price = o.price if p["side"] == 0 else 1 - o.price
            reason = ("near_resolution" if hours_left < cfg.exit_hours_before_resolution
                      else "fair_value_moved_against" if p["entry_fv"] - p["fv"] > cfg.fv_move_exit
                      else "edge_gone" if p["fv"] - mid_price < cfg.exit_edge else None)
            if reason:
                close(m.id, p["shares"] * max(mid_price - half, 0), reason, o.t)
        elif (m.id not in positions and not halted and hours_left >= cfg.min_hours_to_resolution
              and cfg.min_price <= o.price <= cfg.max_price and o.t < local_day_start(o, offsets)):
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
    bm = sum((model_prob(o, params) - o.outcome) ** 2 for o in obs) / len(obs)
    bk = sum((o.price - o.outcome) ** 2 for o in obs) / len(obs)
    return bm, bk


def run_backtest(client: HistoryClient, cfg: Config, *, days: int = 90, train_frac: float = 0.4,
                 spread: float = 0.02, bankroll: float = 50.0, max_markets: int = 3000, hold: bool = False,
                 cache: dict | None = None) -> BacktestResult:
    cfg = replace(cfg, initial_bankroll=bankroll)
    if cache is not None and "obs" in cache:
        obs, skipped, offsets = cache["obs"], cache["skipped"], cache["offsets"]
    else:
        markets = client.closed_weather_markets(days, max_markets)
        obs, skipped, offsets = build_observations(client, markets)
        if cache is not None:
            cache.update(obs=obs, skipped=skipped, offsets=offsets)
    targets = sorted({o.tm.target for o in obs})
    if not targets:
        return BacktestResult(params={}, train_markets=0, test_markets=0, observations=0, skipped=skipped,
                              final_equity=bankroll)
    cut = targets[min(len(targets) - 1, int(len(targets) * train_frac))]
    train = [o for o in obs if o.tm.target < cut]
    test = [o for o in obs if o.tm.target >= cut]
    params = fit_params(train)
    trades, curve, final = simulate(test, params, cfg, spread, hold=hold, offsets=offsets)
    bm, bk = brier(test, params)
    return BacktestResult(
        period=(cut.isoformat(), targets[-1].isoformat()),
        params=params, train_markets=len({o.tm.market.id for o in train}),
        test_markets=len({o.tm.market.id for o in test}), observations=len(obs),
        trades=trades, equity_curve=curve, final_equity=final, brier_model=bm, brier_market=bk, skipped=skipped,
    )


def render(res: BacktestResult, bankroll: float) -> str:
    real = [t for t in res.trades if t["reason"] != "halt"]
    wins = sum(1 for t in real if t["pnl"] > 0)
    lines = [
        "# Backtest — mercados de temperatura diaria (máximas y mínimas)",
        "",
        "Precio histórico de Polymarket vs. previsión publicada en cada momento (Open-Meteo Previous Runs).",
        "Parámetros ajustados con el primer tramo; trading simulado SOLO en el tramo posterior (walk-forward).",
        "",
        f"- Observaciones: {res.observations} · mercados entrenamiento: {res.train_markets} · test: {res.test_markets}",
        f"- Periodo de test: {res.period[0]} → {res.period[1]}",
    ]
    for stat, label in (("max", "máximas"), ("min", "mínimas")):
        p = res.params.get(stat)
        if p:
            lines.append(f"- Modelo {label}: sesgo {p['bias']:+.2f} °F, dispersión base {p['sd_base']:.1f} °F")
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
                  "conoce, así que no se filtra por ella; solo mercados de temperatura diaria de ciudades de la tabla STATIONS; "
                  "el modelo solo usa previsiones (no observaciones), así que solo entra antes del día objetivo. "
                  "El historial del CLOB son precios puntuales: si rebotan entre bid y ask, comprar barato y vender caro "
                  "parece rentable y no lo es. Desconfía si casi todo el beneficio viene de salidas (edge_gone) y no de "
                  "mercados resueltos; prueba con más --spread para ver si aguanta."]
    return "\n".join(lines) + "\n"
