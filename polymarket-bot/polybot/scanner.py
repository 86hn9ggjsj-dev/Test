"""Escáner de ventaja en TODO Polymarket (solo precios, datos históricos reales).

Pregunta: ¿hay alguna categoría de mercados (deportes, cripto, política, premios, economía...)
donde los precios fallen de forma sistemática? Por ejemplo: "los Sí al 20% de los mercados de
premios solo ganan el 8%".

Método honesto:
  - Selección por FECHA DE CIERRE PROGRAMADA dentro del periodo (todos esos mercados ya cerraron).
    Elegir por "ya cerrado" metería sesgo: los que resolvieron 'Sí' antes de tiempo entrarían y
    los que siguen abiertos (casi siempre 'No' hasta ahora) no.
  - Observaciones a horas fijas (cada 6 h) mientras el mercado estaba abierto, como lo vería el bot.
  - Se descartan precios no operables: en eventos de varias opciones, instantes en que los 'Sí'
    no suman ~100%; en cualquier mercado, precios congelados > 48 h (libro vacío).
  - Walk-forward: la tabla de calibración por categoría se aprende con el primer 40% del periodo
    y se opera SOLO en el resto, con las reglas del bot (edge > 8 pp, 1/4 Kelly, 6%, 5 posiciones).

Uso:  python -m polybot scan-edges --days 30
"""

from __future__ import annotations

import logging
import math
import re
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field, replace
from datetime import datetime, timedelta, timezone

import requests

from . import risk
from .backtest import GAMMA_URL, HistoryClient
from .config import Config
from .polymarket import parse_market
from .weather import is_weather_market

log = logging.getLogger("polybot.scanner")

CATEGORIES = [
    ("cripto", re.compile(r"\b(bitcoin|btc|ethereum|eth|solana|sol|xrp|dogecoin|doge|crypto|up or down)\b", re.I)),
    ("tiempo", None),  # usa is_weather_market
    ("deportes", re.compile(
        r"\b(vs\.?|nfl|nba|mlb|nhl|wnba|ufc|fight|match|game \d|series|playoffs?|super bowl|world series|premier league|"
        r"la liga|serie a|bundesliga|champions league|uefa|fifa|grand prix|f1|tennis|atp|wta|open|cup|o/u|spread|"
        r"win the 20\d\d|title|mvp|touchdown|goals?|points?)\b", re.I)),
    ("política", re.compile(
        r"\b(election|elected|president|presidential|senate|congress|governor|mayor|prime minister|parliament|"
        r"vote|referendum|party|trump|biden|democrat|republican|minister|cabinet|impeach|poll)\b", re.I)),
    ("economía", re.compile(r"\b(fed|interest rate|rates?|cpi|inflation|gdp|unemployment|jobs report|recession|"
                            r"s&p|nasdaq|dow|stock|ipo|earnings|tariff)\b", re.I)),
    ("cultura", re.compile(r"\b(nobel|oscar|grammy|emmy|award|box office|album|song|movie|film|spotify|billboard|"
                           r"youtube|tiktok|tweet|elon|musk)\b", re.I)),
]
CAL_EDGES = [0.0, 0.03, 0.07, 0.12, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.88, 0.93, 0.97, 1.0]


def category(question: str, m=None) -> str:
    for name, rx in CATEGORIES:
        if name == "tiempo":
            if m is not None and is_weather_market(m):
                return name
            continue
        if rx.search(question):
            return name
    return "otros"


@dataclass
class Obs:
    t: datetime
    market_id: str
    event_id: str
    question: str
    cat: str
    price: float
    outcome: int          # 1 si ganó el 'Sí'
    closed_at: datetime
    end: datetime         # cierre programado


@dataclass
class ScanResult:
    period: tuple[str, str]
    markets: int
    observations: int
    skipped: dict
    calibration: dict            # categoría -> tabla (entrenamiento)
    test_brier: dict             # categoría -> (calibrado, mercado, n)
    trades: list[dict] = field(default_factory=list)
    final_equity: float = 0.0


# ------------------------------------------------------------- datos
def fetch_markets(client: HistoryClient, days: int, min_volume: float, max_markets: int) -> list[tuple]:
    """(Market, event_id, closed_at) de mercados con cierre programado en los últimos `days` días."""
    now = datetime.now(timezone.utc)
    out, seen = [], set()
    win_end = now - timedelta(hours=12)  # margen: lo que cerró hace menos de 12 h puede no estar resuelto
    while win_end > now - timedelta(days=days) and len(out) < max_markets:
        win_start = win_end - timedelta(hours=12)  # ventanas de 12 h: Gamma no pagina más allá de ~2.000
        offset = 0
        while offset < 2000:
            try:
                page = client._get(f"{GAMMA_URL}/markets", {
                    "closed": "true", "limit": 100, "offset": offset, "volume_num_min": min_volume,
                    "end_date_min": win_start.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "end_date_max": win_end.strftime("%Y-%m-%dT%H:%M:%SZ")})
            except requests.HTTPError as exc:
                log.warning("Gamma %s: %s", win_start, exc)
                break
            if not isinstance(page, list) or not page:
                break
            for raw in page:
                if raw.get("id") in seen:
                    continue
                seen.add(raw.get("id"))
                m = parse_market(raw)
                if m is None or m.resolved_outcome() is None:
                    continue
                closed_raw = raw.get("closedTime") or raw.get("endDate")
                try:
                    closed_at = datetime.fromisoformat(str(closed_raw).replace("Z", "+00:00").replace(" ", "T"))
                    if closed_at.tzinfo is None:
                        closed_at = closed_at.replace(tzinfo=timezone.utc)
                except ValueError:
                    continue
                ev = (raw.get("events") or [{}])[0]
                out.append((m, str(ev.get("id") or m.id), closed_at, bool(ev.get("negRisk") or raw.get("negRisk"))))
            offset += len(page)
            if len(page) < 100:
                break
        win_end = win_start
    log.info("Gamma: %d mercados binarios resueltos (volumen >= $%.0f) en %d días", len(out), min_volume, days)
    return out[:max_markets]


def build_obs(client: HistoryClient, rows: list[tuple], step_hours: int = 6, workers: int = 10,
              lookback_days: int = 14) -> tuple[list[Obs], dict]:
    skipped: dict[str, int] = defaultdict(int)

    def fetch(row):
        m, ev_id, closed_at, neg = row
        start = (m.end_date or closed_at) - timedelta(days=lookback_days)
        try:
            return row, client.price_history(m.token_ids[0], start, closed_at)
        except (requests.RequestException, ValueError, KeyError):
            return row, None

    obs: list[Obs] = []
    neg_events: set[str] = set()
    with ThreadPoolExecutor(max_workers=workers) as pool:
        for done, (row, hist) in enumerate(pool.map(fetch, rows), start=1):
            if done % 5000 == 0:
                log.info("Historiales: %d/%d", done, len(rows))
            m, ev_id, closed_at, neg = row
            if not hist:
                skipped["sin historial"] += 1
                continue
            if neg:
                neg_events.add(ev_id)
            y = 1 if m.resolved_outcome() == 0 else 0
            cat = category(m.question, m)
            # horas fijas (múltiplos de step) mientras estaba abierto
            t = hist[0][0].replace(minute=0, second=0, microsecond=0)
            t += timedelta(hours=(-t.hour) % step_hours)
            idx, last_change = 0, hist[0][0]
            prev_p = hist[0][1]
            while t < closed_at - timedelta(hours=1):
                while idx + 1 < len(hist) and hist[idx + 1][0] <= t:
                    idx += 1
                    if abs(hist[idx][1] - prev_p) > 1e-9:
                        last_change = hist[idx][0]
                    prev_p = hist[idx][1]
                if hist[idx][0] <= t:
                    if (t - last_change) > timedelta(hours=48):
                        skipped["precio congelado > 48 h"] += 1
                    else:
                        obs.append(Obs(t, m.id, ev_id, m.question, cat, hist[idx][1], y, closed_at,
                                       m.end_date or closed_at))
                t += timedelta(hours=step_hours)

    # Eventos de varias opciones: solo instantes en que los 'Sí' suman 95-110%.
    groups: dict[tuple, list[Obs]] = defaultdict(list)
    for o in obs:
        if o.event_id in neg_events:
            groups[(o.event_id, o.t)].append(o)
    event_size = defaultdict(set)
    for o in obs:
        if o.event_id in neg_events:
            event_size[o.event_id].add(o.market_id)
    bad = set()
    for (ev, t), rows_ in groups.items():
        total = sum(o.price for o in rows_)
        if len(rows_) < 0.8 * len(event_size[ev]) or not (0.95 <= total <= 1.10):
            bad.add((ev, t))
    keep = [o for o in obs if not (o.event_id in neg_events and (o.event_id, o.t) in bad)]
    skipped["evento de varias opciones con precios incoherentes"] += len(obs) - len(keep)
    keep.sort(key=lambda o: o.t)
    return keep, dict(skipped)


# ------------------------------------------------------------- análisis
def fit_table(rows: list[Obs], k: float = 30.0) -> list[dict]:
    table = []
    for lo, hi in zip(CAL_EDGES, CAL_EDGES[1:]):
        r = [o for o in rows if lo <= o.price < hi or (hi == 1.0 and o.price == 1.0)]
        n_m = len({o.market_id for o in r})
        mp = sum(o.price for o in r) / len(r) if r else (lo + hi) / 2
        raw = sum(o.outcome for o in r) / len(r) if r else mp
        w = n_m / (n_m + k)  # suavizado por nº de mercados (sus observaciones no son independientes)
        table.append({"lo": lo, "hi": hi, "n_markets": n_m, "mean_price": mp, "raw": raw,
                      "freq": w * raw + (1 - w) * mp})
    return table


def corrected(price: float, table: list[dict]) -> float:
    for r in table:
        if r["lo"] <= price < r["hi"] or (r["hi"] == 1.0 and price >= 1.0):
            return min(max(price + r["freq"] - r["mean_price"], 0.001), 0.999)
    return price


def simulate(test: list[Obs], tables: dict, cfg: Config, spread: float) -> tuple[list[dict], float]:
    half = spread / 2
    cash = peak = cfg.initial_bankroll
    positions: dict[str, dict] = {}
    marks: dict[str, float] = {}
    trades: list[dict] = []
    halted = False

    def equity():
        return cash + sum(p["shares"] * max((marks[mid] if p["side"] == 0 else 1 - marks[mid]) - half, 0)
                          for mid, p in positions.items())

    for o in test:
        for mid in [mid for mid, p in positions.items() if p["closed_at"] <= o.t]:
            p = positions.pop(mid)
            won = (p["y"] == 1) == (p["side"] == 0)
            cash += p["shares"] if won else 0.0
            trades.append({"cat": p["cat"], "question": p["q"], "pnl": (p["shares"] if won else 0) - p["cost"],
                           "reason": "resolved_win" if won else "resolved_loss", "side": p["side"]})
        marks[o.market_id] = o.price
        if o.market_id in positions or halted:
            continue
        hours_left = (o.end - o.t).total_seconds() / 3600
        if not (cfg.min_price <= o.price <= cfg.max_price) or hours_left < cfg.min_hours_to_resolution:
            continue
        fair = corrected(o.price, tables.get(o.cat, []))
        choice = risk.best_side(fair, o.price + half, 1 - o.price + half, cfg.taker_fee)
        eq = equity()
        stake, _ = risk.position_size_usd(eq, cash, choice.fair_value, choice.price, cfg)
        if risk.entry_blockers(edge=choice.edge, confidence="high", resolution_clear=True,
                               open_positions=len(positions), halted=halted, cfg=cfg):
            continue
        if stake < 1.0 or stake / choice.price < 5:
            continue
        cash -= stake
        positions[o.market_id] = {"side": choice.outcome_index, "shares": stake / choice.price, "cost": stake,
                                  "closed_at": o.closed_at, "y": o.outcome, "cat": o.cat, "q": o.question}
        eq = equity()
        peak = max(peak, eq)
        if risk.drawdown_breached(eq, peak, cfg):
            halted = True
    for mid, p in positions.items():
        won = (p["y"] == 1) == (p["side"] == 0)
        cash += p["shares"] if won else 0.0
        trades.append({"cat": p["cat"], "question": p["q"], "pnl": (p["shares"] if won else 0) - p["cost"],
                       "reason": "resolved_win" if won else "resolved_loss", "side": p["side"]})
    return trades, cash


def run_scan(client: HistoryClient, cfg: Config, *, days: int = 30, min_volume: float = 10000,
             max_markets: int = 80000, spread: float = 0.02, train_frac: float = 0.4,
             cache: dict | None = None) -> ScanResult:
    if cache is not None and "obs" in cache:
        obs, skipped, n_markets = cache["obs"], cache["skipped"], cache["n_markets"]
    else:
        rows = fetch_markets(client, days, min_volume, max_markets)
        obs, skipped = build_obs(client, rows)
        n_markets = len(rows)
        if cache is not None:
            cache.update(obs=obs, skipped=skipped, n_markets=n_markets)
    ends = sorted({o.end for o in obs})
    if not ends:
        return ScanResult(("", ""), n_markets, 0, skipped, {}, {}, final_equity=cfg.initial_bankroll)
    cut = ends[int(len(ends) * train_frac)]
    train = [o for o in obs if o.end < cut]
    test = [o for o in obs if o.end >= cut]
    cats = sorted({o.cat for o in obs})
    tables = {c: fit_table([o for o in train if o.cat == c]) for c in cats}
    briers = {}
    for c in cats:
        rs = [o for o in test if o.cat == c]
        if rs:
            bc = sum((corrected(o.price, tables[c]) - o.outcome) ** 2 for o in rs) / len(rs)
            bm = sum((o.price - o.outcome) ** 2 for o in rs) / len(rs)
            briers[c] = (bc, bm, len({o.market_id for o in rs}))
    trades, final = simulate(test, tables, replace(cfg), spread)
    return ScanResult((cut.date().isoformat(), ends[-1].date().isoformat()), n_markets, len(obs), skipped,
                      tables, briers, trades, final)


def render_scan(res: ScanResult, bankroll: float) -> str:
    lines = ["# Escáner de ventaja en Polymarket (solo precios, datos reales)", "",
             f"- Mercados: {res.markets} · observaciones útiles: {res.observations} · test: {res.period[0]} → {res.period[1]}",
             f"- Descartes: {res.skipped}", "",
             "## ¿En qué categoría falla el precio? (test; Brier más bajo = mejor)", "",
             "| Categoría | Mercados test | Precio corregido | Precio del mercado | ¿Mejora? |", "|---|---|---|---|---|"]
    for c, (bc, bm, n) in sorted(res.test_brier.items(), key=lambda x: -x[1][2]):
        lines.append(f"| {c} | {n} | {bc:.4f} | {bm:.4f} | {'✅ sí' if bc < bm * 0.99 else '—'} |")
    lines += ["", "## Mayores descuadres aprendidos (entrenamiento, ≥ 30 mercados en el tramo)", "",
              "| Categoría | Precio | Mercados | Precio medio | Ganó de verdad | Diferencia |", "|---|---|---|---|---|---|"]
    rows = []
    for c, table in res.calibration.items():
        for r in table:
            if r["n_markets"] >= 30:
                rows.append((abs(r["raw"] - r["mean_price"]), c, r))
    for _, c, r in sorted(rows, key=lambda x: -x[0])[:15]:
        lines.append(f"| {c} | {r['lo'] * 100:.0f}–{r['hi'] * 100:.0f}% | {r['n_markets']} | {r['mean_price'] * 100:.1f}% | "
                     f"{r['raw'] * 100:.1f}% | {(r['raw'] - r['mean_price']) * 100:+.1f} pp |")
    by = defaultdict(list)
    for t in res.trades:
        by[t["cat"]].append(t["pnl"])
    lines += ["", "## Trading simulado con las reglas del bot (solo en el tramo de test)", "",
              f"- Bankroll: ${bankroll:.2f} → **${res.final_equity:.2f}** · trades: {len(res.trades)} · "
              f"ganadores: {sum(1 for t in res.trades if t['pnl'] > 0)}"]
    for c, v in sorted(by.items(), key=lambda x: -sum(x[1])):
        lines.append(f"  - {c}: {len(v)} trades, ${sum(v):+.2f}")
    return "\n".join(lines) + "\n"
