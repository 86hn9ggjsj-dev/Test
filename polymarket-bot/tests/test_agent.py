import json
from dataclasses import replace

import pytest
from conftest import FakeBrain, FakeData, make_market

from polybot.agent import Agent
from polybot.executor import PaperExecutor
from polybot.journal import Journal
from polybot.state import BotState


def make_agent(cfg, data, brain):
    return Agent(cfg, data=data, brain=brain, executor=PaperExecutor(cfg), journal=Journal(cfg.data_dir))


def read_jsonl(path):
    return [json.loads(line) for line in path.read_text().splitlines()]


def test_enters_trade_with_edge_and_respects_cap(cfg):
    data = FakeData()
    data.add(make_market("a", price=0.40))      # ask yes = 0.41
    brain = FakeBrain({"a": 0.60})              # edge ~19 pp
    agent = make_agent(cfg, data, brain)
    agent.run_cycle()

    st = agent.state
    assert "a" in st.positions
    p = st.positions["a"]
    assert p.outcome == "Yes"
    assert p.cost <= 50 * 0.06 + 1e-9           # tope 6%
    assert st.cash == pytest.approx(50 - p.cost)
    assert cfg.state_path.exists()
    assert (cfg.data_dir / "status.md").exists()
    trades = read_jsonl(cfg.data_dir / "trades.jsonl")
    assert trades[0]["action"] == "OPEN"


def test_no_trade_when_edge_too_small(cfg):
    data = FakeData()
    data.add(make_market("a", price=0.40))
    agent = make_agent(cfg, data, FakeBrain({"a": 0.47}))  # 6 pp vs ask 0.41
    agent.run_cycle()
    assert not agent.state.positions
    decisions = read_jsonl(cfg.data_dir / "decisions.jsonl")
    assert decisions[-1]["decision"] == "SKIP"


def test_buys_no_side(cfg):
    data = FakeData()
    data.add(make_market("a", price=0.60))      # ask no = 0.41
    agent = make_agent(cfg, data, FakeBrain({"a": 0.35}))  # P(no)=0.65
    agent.run_cycle()
    assert agent.state.positions["a"].outcome == "No"


def test_max_five_positions(cfg):
    cfg = replace(cfg, max_evaluations_per_cycle=10)
    data = FakeData()
    fair = {}
    for i in range(8):
        data.add(make_market(f"m{i}", price=0.40))
        fair[f"m{i}"] = 0.65
    agent = make_agent(cfg, data, FakeBrain(fair))
    agent.run_cycle()
    agent.run_cycle()
    assert len(agent.state.positions) == 5


def test_skips_low_confidence_and_unclear_resolution(cfg):
    data = FakeData()
    data.add(make_market("a", price=0.40))
    agent = make_agent(cfg, data, FakeBrain({"a": 0.70}, confidence="low"))
    agent.run_cycle()
    assert not agent.state.positions
    agent2 = make_agent(replace(cfg, data_dir=cfg.data_dir / "b"), data, FakeBrain({"a": 0.70}, clear=False))
    agent2.run_cycle()
    assert not agent2.state.positions


def test_exit_when_edge_gone(cfg):
    cfg = replace(cfg, position_reeval_minutes=0)
    data = FakeData()
    data.add(make_market("a", price=0.40))
    brain = FakeBrain({"a": 0.60})
    agent = make_agent(cfg, data, brain)
    agent.run_cycle()
    assert "a" in agent.state.positions
    data.set_price("a", 0.59)                   # el mercado alcanza nuestro fair value
    agent.run_cycle()
    assert "a" not in agent.state.positions
    assert agent.state.closed_trades[-1].reason == "edge_gone"
    assert agent.state.closed_trades[-1].pnl > 0


def test_exit_when_fair_value_moves_against(cfg):
    cfg = replace(cfg, position_reeval_minutes=0)
    data = FakeData()
    data.add(make_market("a", price=0.40))
    brain = FakeBrain({"a": 0.62})
    agent = make_agent(cfg, data, brain)
    agent.run_cycle()
    brain.fair["a"] = 0.55                       # FV baja 7 pp (> 5)
    agent.run_cycle()
    # con media móvil (0.5): 0.585 -> solo -3.5 pp, todavía no sale por una sola lectura
    assert "a" in agent.state.positions
    agent.run_cycle()                            # se confirma: 0.5675 -> -5.25 pp
    assert agent.state.closed_trades[-1].reason == "fair_value_moved_against"


def test_exit_fair_value_without_smoothing(cfg):
    cfg = replace(cfg, position_reeval_minutes=0, fv_smoothing=0.0)
    data = FakeData()
    data.add(make_market("a", price=0.40))
    brain = FakeBrain({"a": 0.62})
    agent = make_agent(cfg, data, brain)
    agent.run_cycle()
    brain.fair["a"] = 0.55
    agent.run_cycle()
    assert agent.state.closed_trades[-1].reason == "fair_value_moved_against"


def test_exit_near_resolution(cfg):
    data = FakeData()
    data.add(make_market("a", price=0.40))
    agent = make_agent(cfg, data, FakeBrain({"a": 0.65}))
    agent.run_cycle()
    from datetime import datetime, timedelta, timezone
    data.markets["a"].end_date = datetime.now(timezone.utc) + timedelta(hours=1)
    agent.run_cycle()
    assert agent.state.closed_trades[-1].reason == "near_resolution"


def test_settles_resolved_market(cfg):
    data = FakeData()
    data.add(make_market("a", price=0.40))
    agent = make_agent(cfg, data, FakeBrain({"a": 0.65}))
    agent.run_cycle()
    shares = agent.state.positions["a"].shares
    cash_before = agent.state.cash
    data.markets["a"].closed = True
    data.markets["a"].prices = [1.0, 0.0]
    agent.run_cycle()
    assert agent.state.cash == pytest.approx(cash_before + shares)
    assert agent.state.closed_trades[-1].reason == "resolved_win"


def test_drawdown_halts_and_writes_postmortem(cfg):
    data = FakeData()
    data.add(make_market("a", price=0.40))
    st = BotState.new("paper", 50.0)
    st.cash = 29.0                               # equity 29 vs pico 50 -> 42% DD
    brain = FakeBrain({"a": 0.70})
    agent = Agent(cfg, data=data, brain=brain, executor=PaperExecutor(cfg), journal=Journal(cfg.data_dir), state=st)
    agent.run_cycle()
    assert agent.state.halted
    assert not agent.state.positions             # no opera tras la parada
    assert list(cfg.data_dir.glob("postmortem_paper_*.md"))
    agent.run_cycle()                            # sigue parado en ciclos siguientes
    assert not agent.state.positions
    agent.approve_restart("test")
    assert not agent.state.halted
    assert agent.state.peak_equity == pytest.approx(29.0)


def test_daily_budget_stops_evaluations(cfg):
    cfg = replace(cfg, daily_api_budget_usd=0.01, max_evaluations_per_cycle=10)
    data = FakeData()
    for i in range(3):
        data.add(make_market(f"m{i}", price=0.40))
    brain = FakeBrain({f"m{i}": 0.45 for i in range(3)})
    agent = make_agent(cfg, data, brain)
    agent.run_cycle()
    assert brain.calls == 1                      # tras la 1ª llamada ($0.05) se agota el presupuesto


def test_estimate_cache_avoids_repeat_calls(cfg):
    data = FakeData()
    data.add(make_market("a", price=0.40))
    brain = FakeBrain({"a": 0.44})               # sin edge -> no entra, queda en caché
    agent = make_agent(cfg, data, brain)
    agent.run_cycle()
    agent.run_cycle()
    assert brain.calls == 1


def test_state_roundtrip(cfg):
    data = FakeData()
    data.add(make_market("a", price=0.40))
    agent = make_agent(cfg, data, FakeBrain({"a": 0.65}))
    agent.run_cycle()
    loaded = BotState.load_or_new(cfg.state_path, "paper", 50)
    assert loaded.positions["a"].shares == agent.state.positions["a"].shares
    assert loaded.equity == pytest.approx(agent.state.equity)


def test_scan_failure_still_reviews_positions(cfg):
    from datetime import datetime, timedelta, timezone

    data = FakeData()
    data.add(make_market("a", price=0.40))
    agent = make_agent(cfg, data, FakeBrain({"a": 0.65}))
    agent.run_cycle()
    data.markets["a"].end_date = datetime.now(timezone.utc) + timedelta(hours=1)

    def boom(max_markets=1000):
        raise RuntimeError("gamma caído")

    data.fetch_active_markets = boom
    agent.run_cycle()
    assert agent.state.closed_trades[-1].reason == "near_resolution"
