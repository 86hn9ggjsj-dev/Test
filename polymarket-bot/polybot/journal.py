"""Logs: texto legible (consola + fichero rotativo) y diarios JSONL auditables.

  logs/polybot.log      -> lo que verías en la consola
  data/decisions.jsonl  -> cada mercado evaluado: fair value, precio, edge, decisión y motivo
  data/trades.jsonl     -> cada orden ejecutada (entradas, salidas, liquidaciones)
  data/equity.jsonl     -> balance, pico y drawdown en cada ciclo
  data/status.md        -> resumen legible, se reescribe cada ciclo
"""

from __future__ import annotations

import json
import logging
import logging.handlers
from pathlib import Path

from .state import BotState, now_iso
from . import risk


def setup_logging(log_dir: Path, level: int = logging.INFO) -> None:
    log_dir.mkdir(parents=True, exist_ok=True)
    fmt = logging.Formatter("%(asctime)s %(levelname)-7s %(name)s | %(message)s", "%Y-%m-%d %H:%M:%S")
    root = logging.getLogger()
    root.setLevel(level)
    root.handlers.clear()
    console = logging.StreamHandler()
    console.setFormatter(fmt)
    root.addHandler(console)
    file_handler = logging.handlers.RotatingFileHandler(
        log_dir / "polybot.log", maxBytes=5_000_000, backupCount=10, encoding="utf-8"
    )
    file_handler.setFormatter(fmt)
    root.addHandler(file_handler)
    for noisy in ("httpx", "httpx2", "urllib3", "anthropic"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


class Journal:
    def __init__(self, data_dir: Path):
        self.dir = data_dir
        self.dir.mkdir(parents=True, exist_ok=True)

    def _append(self, name: str, record: dict) -> None:
        record = {"ts": now_iso(), **record}
        with open(self.dir / name, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False, default=str) + "\n")

    def decision(self, **record) -> None:
        self._append("decisions.jsonl", record)

    def trade(self, **record) -> None:
        self._append("trades.jsonl", record)

    def event(self, **record) -> None:
        self._append("events.jsonl", record)

    def equity(self, state: BotState) -> None:
        self._append("equity.jsonl", {
            "mode": state.mode,
            "cycle": state.cycles,
            "cash": round(state.cash, 4),
            "positions_value": round(state.positions_value, 4),
            "equity": round(state.equity, 4),
            "peak": round(state.peak_equity, 4),
            "drawdown": round(risk.drawdown(state.equity, state.peak_equity), 4),
            "open_positions": len(state.positions),
            "api_cost_total": round(state.api_cost_total, 4),
        })

    def write_status(self, state: BotState, vps_monthly_usd: float) -> str:
        text = render_status(state, vps_monthly_usd)
        (self.dir / "status.md").write_text(text, encoding="utf-8")
        return text


def render_status(state: BotState, vps_monthly_usd: float) -> str:
    eq = state.equity
    dd = risk.drawdown(eq, state.peak_equity)
    wr = state.win_rate
    trading_pnl = eq - state.initial_bankroll
    vps = state.vps_cost_to_date(vps_monthly_usd)
    net = trading_pnl - state.api_cost_total - vps
    lines = [
        f"# Polybot — estado ({state.mode.upper()})",
        "",
        f"Actualizado: {now_iso()}  ·  ciclos: {state.cycles}  ·  en marcha desde {state.started_at}",
        "",
        "| Métrica | Valor |",
        "|---|---|",
        f"| Bankroll inicial | ${state.initial_bankroll:,.2f} |",
        f"| Caja | ${state.cash:,.2f} |",
        f"| Valor posiciones | ${state.positions_value:,.2f} |",
        f"| **Equity** | **${eq:,.2f}** |",
        f"| Pico | ${state.peak_equity:,.2f} |",
        f"| Drawdown | {dd * 100:.1f}% (límite 40%) |",
        f"| PnL trading | ${trading_pnl:+,.2f} |",
        f"| Trades cerrados | {len(state.closed_trades)} (win rate {'—' if wr is None else f'{wr * 100:.0f}%'}) |",
        f"| Coste API Claude | ${state.api_cost_total:,.2f} ({state.claude_calls} llamadas, hoy ${state.api_cost_today():,.2f}) |",
        f"| Coste VPS prorrateado | ${vps:,.2f} |",
        f"| **Neto supervivencia** | **${net:+,.2f}** → {'se paga solo ✅' if net >= 0 else 'aún no se paga ❌'} |",
        f"| Estado | {'⛔ DETENIDO: ' + state.halt_reason if state.halted else '✅ operando'} |",
        "",
        "## Posiciones abiertas",
        "",
    ]
    if not state.positions:
        lines.append("_Ninguna._")
    else:
        lines += ["| Mercado | Lado | Shares | Entrada | Actual | FV | PnL |", "|---|---|---|---|---|---|---|"]
        for p in state.positions.values():
            pnl = p.value - p.cost
            lines.append(
                f"| {p.question[:60]} | {p.outcome} | {p.shares:.2f} | {p.entry_price:.3f} | "
                f"{p.last_price:.3f} | {p.last_fair_value:.3f} | ${pnl:+.2f} |"
            )
    lines += ["", "## Últimos trades cerrados", ""]
    if not state.closed_trades:
        lines.append("_Ninguno._")
    else:
        lines += ["| Cerrado | Mercado | Lado | PnL | Motivo |", "|---|---|---|---|---|"]
        for t in state.closed_trades[-10:][::-1]:
            lines.append(f"| {t.closed_at} | {t.question[:50]} | {t.outcome} | ${t.pnl:+.2f} | {t.reason} |")
    return "\n".join(lines) + "\n"
