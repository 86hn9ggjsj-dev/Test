"""Estado persistente del bot: caja, pico, posiciones, historial y costes."""

from __future__ import annotations

import json
import os
import tempfile
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


@dataclass
class Position:
    market_id: str
    question: str
    outcome: str
    outcome_index: int
    token_id: str
    shares: float
    entry_price: float
    cost: float
    entry_fair_value: float
    last_fair_value: float
    last_price: float          # último precio de valoración (bid) del token
    opened_at: str
    end_date: str | None
    slug: str = ""
    last_estimate_at: str = ""
    last_estimate_price: float = 0.0
    min_order_size: float = 5.0
    tick_size: float = 0.01
    neg_risk: bool = False

    @property
    def value(self) -> float:
        return self.shares * self.last_price


@dataclass
class ClosedTrade:
    market_id: str
    question: str
    outcome: str
    shares: float
    entry_price: float
    exit_price: float
    cost: float
    proceeds: float
    pnl: float
    reason: str
    opened_at: str
    closed_at: str


@dataclass
class BotState:
    mode: str
    initial_bankroll: float
    cash: float
    peak_equity: float
    positions: dict[str, Position] = field(default_factory=dict)
    closed_trades: list[ClosedTrade] = field(default_factory=list)
    halted: bool = False
    halt_reason: str = ""
    halted_at: str = ""
    cycles: int = 0
    started_at: str = field(default_factory=now_iso)
    last_cycle_at: str = ""
    api_cost_total: float = 0.0
    api_cost_by_day: dict[str, float] = field(default_factory=dict)
    claude_calls: int = 0
    # Cache de estimaciones de mercados sin posición: market_id -> {fair_yes, price_yes, at, ...}
    estimates: dict[str, dict] = field(default_factory=dict)

    # ---- métricas ----
    @property
    def positions_value(self) -> float:
        return sum(p.value for p in self.positions.values())

    @property
    def equity(self) -> float:
        return self.cash + self.positions_value

    @property
    def realized_pnl(self) -> float:
        return sum(t.pnl for t in self.closed_trades)

    @property
    def wins(self) -> int:
        return sum(1 for t in self.closed_trades if t.pnl > 0)

    @property
    def win_rate(self) -> float | None:
        return self.wins / len(self.closed_trades) if self.closed_trades else None

    def api_cost_today(self) -> float:
        return self.api_cost_by_day.get(today(), 0.0)

    def add_api_cost(self, usd: float) -> None:
        self.api_cost_total += usd
        self.api_cost_by_day[today()] = self.api_cost_by_day.get(today(), 0.0) + usd
        self.claude_calls += 1

    def vps_cost_to_date(self, monthly_usd: float) -> float:
        started = datetime.fromisoformat(self.started_at)
        days = (datetime.now(timezone.utc) - started).total_seconds() / 86400
        return monthly_usd * days / 30

    def update_peak(self) -> None:
        self.peak_equity = max(self.peak_equity, self.equity)

    # ---- persistencia ----
    def to_dict(self) -> dict:
        d = asdict(self)
        d["positions"] = {k: asdict(v) for k, v in self.positions.items()}
        return d

    @classmethod
    def from_dict(cls, d: dict) -> "BotState":
        d = dict(d)
        d["positions"] = {k: Position(**v) for k, v in d.get("positions", {}).items()}
        d["closed_trades"] = [ClosedTrade(**t) for t in d.get("closed_trades", [])]
        return cls(**d)

    @classmethod
    def new(cls, mode: str, bankroll: float) -> "BotState":
        return cls(mode=mode, initial_bankroll=bankroll, cash=bankroll, peak_equity=bankroll)

    def save(self, path: Path) -> None:
        """Escritura atómica: nunca deja un estado a medio escribir si el proceso muere."""
        path.parent.mkdir(parents=True, exist_ok=True)
        fd, tmp = tempfile.mkstemp(dir=path.parent, prefix=".state-", suffix=".json")
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(self.to_dict(), f, indent=2, ensure_ascii=False)
        os.replace(tmp, path)

    @classmethod
    def load_or_new(cls, path: Path, mode: str, bankroll: float) -> "BotState":
        if path.exists():
            with open(path, encoding="utf-8") as f:
                return cls.from_dict(json.load(f))
        return cls.new(mode, bankroll)
