"""Informe del paper trading: ¿bate Claude al mercado? (backtest "hacia delante", sin sesgo)

Cada estimación queda guardada en decisions.jsonl ANTES de saber el resultado. Cuando los
mercados resuelven, se compara la probabilidad de Claude (y la del escéptico) con el precio
del mercado en ese mismo momento. Si Claude no bate al precio, no hay ventaja que explotar.

Uso:  python -m polybot report
"""

from __future__ import annotations

import json
import logging
from collections import defaultdict
from pathlib import Path

from .config import Config
from .polymarket import PolymarketData
from .state import BotState

log = logging.getLogger("polybot.report")
MIN_SAMPLE = 30  # por debajo de esto, cualquier conclusión es ruido


def _read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    out = []
    for line in path.read_text(encoding="utf-8").splitlines():
        try:
            out.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return out


def _market_price(d: dict) -> float | None:
    if d.get("mid_yes") is not None:
        return float(d["mid_yes"])
    if d.get("price_yes") is not None:
        return float(d["price_yes"])
    ask = d.get("ask") or [None]
    return None if ask[0] is None else max(0.0, float(ask[0]) - 0.01)


def collect(cfg: Config, data) -> dict:
    """Une cada estimación con el resultado del mercado (si ya resolvió)."""
    decisions = [d for d in _read_jsonl(cfg.data_dir / "decisions.jsonl")
                 if d.get("kind") == "entry" and d.get("fair_yes") is not None]
    outcomes: dict[str, int | None] = {}
    rows = []
    for d in decisions:
        mid = d["market_id"]
        if mid not in outcomes:
            try:
                m = data.fetch_market(mid)
                winner = m.resolved_outcome() if m else None
            except Exception as exc:  # red caída: ese mercado queda pendiente
                log.warning("No se pudo consultar %s: %s", mid, exc)
                winner = None
            outcomes[mid] = None if winner is None else (1 if winner == 0 else 0)
        y = outcomes[mid]
        price = _market_price(d)
        if y is None or price is None:
            continue
        rows.append({
            "ts": d["ts"], "market_id": mid, "question": d.get("question", ""), "y": y, "market": price,
            "claude": float(d.get("analyst_fair_yes", d["fair_yes"])), "final": float(d["fair_yes"]),
            "skeptic": d.get("skeptic_fair_yes"), "verdict": d.get("skeptic_verdict"),
            "decision": d.get("decision"),
        })
    pending = sum(1 for v in outcomes.values() if v is None)
    return {"rows": rows, "pending_markets": pending, "markets": len(outcomes)}


def _brier(rows, key) -> float:
    return sum((r[key] - r["y"]) ** 2 for r in rows) / len(rows)


def build_report(cfg: Config, data=None) -> str:
    data = data or PolymarketData()
    st = BotState.load_or_new(cfg.state_path, cfg.mode, cfg.initial_bankroll)
    res = collect(cfg, data)
    rows = res["rows"]
    lines = [f"# Informe de paper trading ({cfg.mode.upper()})", ""]

    # --- 1. ¿Bate Claude al mercado? ---
    lines += ["## 1. ¿Bate Claude al mercado?", ""]
    lines.append(f"Estimaciones con mercado ya resuelto: **{len(rows)}** "
                 f"({res['markets']} mercados evaluados, {res['pending_markets']} aún sin resolver).")
    if rows:
        bc, bm, bf = _brier(rows, "claude"), _brier(rows, "market"), _brier(rows, "final")
        lines += [
            "",
            "Brier score (error cuadrático medio de la probabilidad; más bajo = mejor):",
            "",
            "| Quién | Brier |",
            "|---|---|",
            f"| Precio del mercado | {bm:.4f} |",
            f"| Analista (Claude) | {bc:.4f} |",
            f"| Final (analista + escéptico) | {bf:.4f} |",
            "",
        ]
        best = min(bc, bf)
        if len(rows) < MIN_SAMPLE:
            verdict = f"⏳ Muestra pequeña (< {MIN_SAMPLE}). Todavía no se puede concluir nada; sigue en paper."
        elif best < bm * 0.97:
            verdict = "✅ Claude bate al precio del mercado con margen. Hay indicios de ventaja real."
        elif best < bm:
            verdict = "🟡 Claude bate al mercado por muy poco: probablemente no compense spread + costes de API."
        else:
            verdict = "❌ El mercado acierta más que Claude. No hay ventaja: no pases a live."
        lines.append(f"**Veredicto:** {verdict}")

        # calibración
        bins = defaultdict(list)
        for r in rows:
            bins[min(int(r["final"] * 10), 9)].append(r)
        lines += ["", "Calibración (cuando el bot dice X%, ¿pasa un X% de las veces?):", "",
                  "| El bot decía | Casos | Pasó de verdad |", "|---|---|---|"]
        for b in sorted(bins):
            rs = bins[b]
            lines.append(f"| {b * 10}–{b * 10 + 10}% | {len(rs)} | {sum(r['y'] for r in rs) / len(rs) * 100:.0f}% |")

        # escéptico
        reviewed = [r for r in rows if r["verdict"] in ("agree", "veto")]
        if reviewed:
            def side_right(r):  # ¿el lado que quería comprar el analista acabó ganando?
                buy_yes = r["claude"] > r["market"]
                return (r["y"] == 1) == buy_yes
            vetoed = [r for r in reviewed if r["verdict"] == "veto"]
            agreed = [r for r in reviewed if r["verdict"] == "agree"]
            lines += ["", "Escéptico:", ""]
            if vetoed:
                lines.append(f"- Vetó {len(vetoed)} ideas; el analista habría acertado el lado en "
                             f"{sum(map(side_right, vetoed)) / len(vetoed) * 100:.0f}% de ellas.")
            if agreed:
                lines.append(f"- Aprobó {len(agreed)}; acertaron el lado en {sum(map(side_right, agreed)) / len(agreed) * 100:.0f}%.")

    # --- 2. Dinero ---
    trades = st.closed_trades
    eq = st.equity
    vps = st.vps_cost_to_date(cfg.vps_monthly_usd)
    lines += ["", "## 2. Dinero", "",
              f"- Equity: ${eq:.2f} (inicial ${st.initial_bankroll:.2f}, {(eq / st.initial_bankroll - 1) * 100:+.1f}%)",
              f"- Trades cerrados: {len(trades)} · win rate "
              f"{'—' if st.win_rate is None else f'{st.win_rate * 100:.0f}%'} · PnL realizado ${st.realized_pnl:+.2f}",
              f"- Costes: API ${st.api_cost_total:.2f} + VPS ${vps:.2f}",
              f"- **Neto supervivencia: ${round(eq - st.initial_bankroll - st.api_cost_total - vps, 2) + 0.0:+.2f}**"]
    by_reason = defaultdict(list)
    for t in trades:
        by_reason[t.reason].append(t.pnl)
    for reason, pnls in sorted(by_reason.items()):
        lines.append(f"  - {reason}: {len(pnls)} trades, ${sum(pnls):+.2f}")

    # --- 3. Crecimiento mensual ---
    equity_rows = [r for r in _read_jsonl(cfg.data_dir / "equity.jsonl") if r.get("mode") == cfg.mode]
    months: dict[str, list[float]] = {}
    for r in equity_rows:
        months.setdefault(r["ts"][:7], []).append(r["equity"])
    if months:
        lines += ["", "## 3. Crecimiento mensual", "", "| Mes | Inicio | Fin | Variación |", "|---|---|---|---|"]
        prev_end = st.initial_bankroll
        for month in sorted(months):
            vals = months[month]
            start = prev_end
            lines.append(f"| {month} | ${start:.2f} | ${vals[-1]:.2f} | {(vals[-1] / start - 1) * 100:+.1f}% |")
            prev_end = vals[-1]
    text = "\n".join(lines) + "\n"
    (cfg.data_dir / "report.md").parent.mkdir(parents=True, exist_ok=True)
    (cfg.data_dir / "report.md").write_text(text, encoding="utf-8")
    return text
