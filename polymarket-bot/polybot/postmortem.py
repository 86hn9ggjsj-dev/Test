"""Post-mortem automático cuando el drawdown llega al 40%."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path

from . import risk
from .config import Config
from .state import BotState

log = logging.getLogger("polybot.postmortem")


def _recent_decisions(data_dir: Path, limit: int = 40) -> list[dict]:
    path = data_dir / "decisions.jsonl"
    if not path.exists():
        return []
    lines = path.read_text(encoding="utf-8").splitlines()
    out = []
    for line in lines[-2000:]:
        try:
            rec = json.loads(line)
        except json.JSONDecodeError:
            continue
        if rec.get("kind") == "entry" and rec.get("decision") == "TRADE":
            out.append(rec)
    return out[-limit:]


def build_report(st: BotState, cfg: Config) -> str:
    eq = st.equity
    trades = st.closed_trades
    losses = sorted(trades, key=lambda t: t.pnl)[:10]
    by_reason: dict[str, list[float]] = {}
    for t in trades:
        by_reason.setdefault(t.reason, []).append(t.pnl)
    lines = [
        f"# Post-mortem — {st.mode.upper()} — {datetime.now(timezone.utc).isoformat(timespec='seconds')}",
        "",
        "## Resumen",
        f"- Motivo de parada: {st.halt_reason}",
        f"- Bankroll inicial: ${st.initial_bankroll:.2f}",
        f"- Pico de equity: ${st.peak_equity:.2f}",
        f"- Equity actual: ${eq:.2f} (caja ${st.cash:.2f} + posiciones ${st.positions_value:.2f})",
        f"- Drawdown: {risk.drawdown(eq, st.peak_equity) * 100:.1f}%",
        f"- Trades cerrados: {len(trades)} · ganadores {st.wins} · win rate "
        f"{'—' if st.win_rate is None else f'{st.win_rate * 100:.0f}%'}",
        f"- PnL realizado: ${st.realized_pnl:+.2f}",
        f"- Coste API acumulado: ${st.api_cost_total:.2f} en {st.claude_calls} llamadas",
        f"- Ciclos ejecutados: {st.cycles} desde {st.started_at}",
        "",
        "## PnL por motivo de cierre",
    ]
    for reason, pnls in sorted(by_reason.items()):
        lines.append(f"- {reason}: {len(pnls)} trades, total ${sum(pnls):+.2f}")
    lines += ["", "## Peores trades", "", "| Mercado | Lado | Entrada | Salida | PnL | Motivo |", "|---|---|---|---|---|---|"]
    for t in losses:
        lines.append(f"| {t.question[:60]} | {t.outcome} | {t.entry_price:.3f} | {t.exit_price:.3f} | ${t.pnl:+.2f} | {t.reason} |")
    lines += ["", "## Posiciones aún abiertas", ""]
    for p in st.positions.values():
        lines.append(f"- {p.question[:70]} [{p.outcome}] coste ${p.cost:.2f}, valor ${p.value:.2f}, FV {p.last_fair_value:.3f}")
    if not st.positions:
        lines.append("_Ninguna._")
    lines += ["", "## Últimas entradas (fair value vs precio y razonamiento)", ""]
    for d in _recent_decisions(cfg.data_dir):
        lines.append(
            f"- {d.get('ts')} · {d.get('question', '')[:70]} · lado {d.get('side')} · FV {d.get('side_fair_value')} "
            f"· edge {d.get('exec_edge')} · conf {d.get('confidence')}\n  > {str(d.get('reasoning', ''))[:400]}"
        )
    return "\n".join(lines) + "\n"


def write_postmortem(st: BotState, cfg: Config, brain=None) -> Path:
    report = build_report(st, cfg)
    if brain is not None:
        try:
            analysis, cost = brain.write_postmortem_analysis(report)
            st.add_api_cost(cost)
            report += "\n## Análisis de Claude\n\n" + analysis + "\n"
        except Exception as exc:
            log.error("No se pudo generar el análisis con Claude: %s", exc)
            report += "\n## Análisis de Claude\n\n_(No disponible: " + str(exc) + ")_\n"
    report += (
        "\n## Cómo reanudar\n\n"
        "El bot NO volverá a operar hasta que un humano lo apruebe. Revisa este informe y, si decides continuar:\n\n"
        "```\npython -m polybot approve --yes --note \"motivo\"\n```\n\n"
        "El drawdown se medirá desde la equity actual a partir de ese momento.\n"
    )
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    path = cfg.data_dir / f"postmortem_{st.mode}_{ts}.md"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(report, encoding="utf-8")
    log.critical("Post-mortem escrito en %s", path)
    return path
