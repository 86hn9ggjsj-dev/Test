import sys
from dataclasses import replace
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from polybot.brain import Estimate  # noqa: E402
from polybot.config import Config  # noqa: E402
from polybot.polymarket import BookLevel, Market, OrderBook  # noqa: E402


def make_market(mid="m1", price=0.40, hours=72, liquidity=20000, volume=50000, **kw) -> Market:
    defaults = dict(
        id=mid, question=f"Will thing {mid} happen?", slug=f"thing-{mid}",
        outcomes=["Yes", "No"], token_ids=[f"{mid}-yes", f"{mid}-no"], prices=[price, 1 - price],
        end_date=datetime.now(timezone.utc) + timedelta(hours=hours),
        liquidity=liquidity, volume_24h=volume,
        description="Resolves according to the official results published by the Electoral Commission.",
        resolution_source="https://example.gov/results",
    )
    defaults.update(kw)
    return Market(**defaults)


def make_book(token_id, bid, ask, size=1000) -> OrderBook:
    return OrderBook(token_id, bids=[BookLevel(bid, size)], asks=[BookLevel(ask, size)])


class FakeData:
    def __init__(self):
        self.markets: dict[str, Market] = {}
        self.books: dict[str, OrderBook] = {}

    def add(self, m: Market, spread=0.02):
        self.markets[m.id] = m
        p = m.prices[0]
        self.books[m.token_ids[0]] = make_book(m.token_ids[0], round(p - spread / 2, 3), round(p + spread / 2, 3))
        q = 1 - p
        self.books[m.token_ids[1]] = make_book(m.token_ids[1], round(q - spread / 2, 3), round(q + spread / 2, 3))

    def set_price(self, mid, p, spread=0.02):
        m = self.markets[mid]
        m.prices = [p, 1 - p]
        self.add(m, spread)

    def fetch_active_markets(self, max_markets=1000):
        return list(self.markets.values())[:max_markets]

    def fetch_market(self, market_id):
        return self.markets.get(market_id)

    def order_book(self, token_id):
        return self.books[token_id]


class FakeBrain:
    def __init__(self, fair=None, confidence="high", clear=True):
        self.fair = fair or {}
        self.confidence = confidence
        self.clear = clear
        self.calls = 0
        self.last_cost = 0.0

    def estimate(self, m, ask0, ask1):
        self.calls += 1
        self.last_cost = 0.05
        if m.id not in self.fair:
            return None
        return Estimate(self.fair[m.id], self.confidence, self.clear, "official", "test", [], 0.05, "fake")

    def write_postmortem_analysis(self, report):
        return "análisis de prueba", 0.01


@pytest.fixture
def cfg(tmp_path) -> Config:
    return replace(Config(), data_dir=tmp_path / "data", log_dir=tmp_path / "logs")
