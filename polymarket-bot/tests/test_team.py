"""El equipo de 5 agentes: SCOUT -> TRIAGE -> ANALISTA -> ESCÉPTICO -> RIESGO."""

from dataclasses import replace

import pytest
from conftest import FakeBrain, FakeData, make_market

from polybot.agent import Agent
from polybot.agents import Review, Screen
from polybot.executor import PaperExecutor
from polybot.journal import Journal


class FakeTriage:
    def __init__(self, fair, flags):
        self.fair, self.flags, self.batches, self.last_cost = fair, flags, [], 0.0

    def screen(self, batch):
        self.batches.append([m.id for m in batch])
        self.last_cost = 0.01
        return [Screen(m.id, self.fair.get(m.id, m.prices[0]), self.flags.get(m.id, False), "test") for m in batch]


class FakeSkeptic:
    def __init__(self, fair=None, verdict="agree"):
        self.fair, self.verdict, self.calls, self.last_cost = fair or {}, verdict, [], 0.0

    def review(self, m, ask0, ask1, est, side):
        self.calls.append((m.id, side))
        self.last_cost = 0.03
        return Review(self.fair.get(m.id, est.fair_yes), self.verdict, "objeción de prueba", "test", 0.03)


@pytest.fixture
def team_cfg(cfg):
    return replace(cfg, triage_enabled=True, skeptic_enabled=True, fast_mode=True)


def team(cfg, data, brain, triage, skeptic):
    return Agent(cfg, data=data, brain=brain, triage=triage, skeptic=skeptic,
                 executor=PaperExecutor(cfg), journal=Journal(cfg.data_dir))


def three_markets(data):
    for mid in ("a", "b", "c"):
        data.add(make_market(mid, price=0.40, question=f"Will candidate {mid} win?",
                             resolution_source="https://gov.example"))


def test_analyst_only_sees_flagged_markets(team_cfg):
    data = FakeData()
    three_markets(data)
    brain = FakeBrain({"a": 0.60, "b": 0.60, "c": 0.60})
    triage = FakeTriage({"b": 0.55}, {"b": True})
    agent = team(team_cfg, data, brain, triage, FakeSkeptic())
    agent.run_cycle()
    assert triage.batches and sorted(triage.batches[0]) == ["a", "b", "c"]
    assert brain.calls == 1                      # solo el marcado llega al analista
    assert list(agent.state.positions) == ["b"]
    stats = agent.state.agent_stats
    assert stats["triage"]["screened"] == 3 and stats["triage"]["flagged"] == 1
    assert stats["analyst"]["estimates"] == 1 and stats["skeptic"]["approvals"] == 1
    assert stats["risk"]["orders"] == 1 and stats["scout"]["scanned"] == 3


def test_skeptic_veto_blocks_trade(team_cfg):
    data = FakeData()
    data.add(make_market("a", price=0.40, question="Will X happen?", resolution_source="https://gov.example"))
    agent = team(team_cfg, data, FakeBrain({"a": 0.65}), FakeTriage({}, {"a": True}), FakeSkeptic(verdict="veto"))
    agent.run_cycle()
    assert not agent.state.positions
    assert agent.state.agent_stats["skeptic"]["vetoes"] == 1
    assert agent.state.agent_stats["risk"]["blocked"] == 1


def test_final_fair_value_is_average_and_must_keep_edge(team_cfg):
    data = FakeData()
    data.add(make_market("a", price=0.40, question="Will X happen?", resolution_source="https://gov.example"))
    data.add(make_market("b", price=0.40, question="Will Y happen?", resolution_source="https://gov.example"))
    # a: analista 0.66, escéptico 0.56 -> media 0.61, edge 20 pp vs ask 0.41 -> opera
    # b: analista 0.60, escéptico 0.36 -> media 0.48, edge 7 pp -> el riesgo lo bloquea
    skeptic = FakeSkeptic({"a": 0.56, "b": 0.36})
    agent = team(team_cfg, data, FakeBrain({"a": 0.66, "b": 0.60}),
                 FakeTriage({}, {"a": True, "b": True}), skeptic)
    agent.run_cycle()
    assert list(agent.state.positions) == ["a"]
    assert agent.state.positions["a"].entry_fair_value == pytest.approx(0.61)


def test_weather_markets_skip_triage_in_fast_mode(team_cfg):
    data = FakeData()
    data.add(make_market("w", price=0.40, question="Highest temperature in Phoenix above 112°F?"))
    data.add(make_market("x", price=0.40, question="Will X happen?", resolution_source="https://gov.example"))
    triage = FakeTriage({}, {})
    brain = FakeBrain({"w": 0.70})
    agent = team(team_cfg, data, brain, triage, FakeSkeptic())
    agent.run_cycle()
    assert triage.batches == [["x"]]             # el del tiempo no pasa por la criba
    assert "w" in agent.state.positions


def test_triage_budget_and_cache(team_cfg):
    cfg = replace(team_cfg, triage_batch=2, triage_daily_budget_usd=0.015)
    data = FakeData()
    for i in range(6):
        data.add(make_market(f"m{i}", price=0.40, question=f"Will thing {i} happen?",
                             resolution_source="https://gov.example"))
    triage = FakeTriage({}, {})
    agent = team(cfg, data, FakeBrain({}), triage, FakeSkeptic())
    agent.run_cycle()
    assert len(triage.batches) == 2              # 0.01 + 0.01 > 0.015 -> para
    agent.run_cycle()
    assert len(triage.batches) == 2              # presupuesto de triage agotado hoy
