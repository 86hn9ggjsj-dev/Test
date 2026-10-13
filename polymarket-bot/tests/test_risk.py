from dataclasses import replace

import pytest

from polybot import risk
from polybot.config import Config


def test_kelly_formula():
    # p=0.6, precio 0.5 -> f* = (0.6-0.5)/(1-0.5) = 0.2
    assert risk.kelly_fraction(0.6, 0.5) == pytest.approx(0.2)
    assert risk.kelly_fraction(0.4, 0.5) == 0.0  # sin edge, sin apuesta
    assert risk.kelly_fraction(0.5, 0.0) == 0.0
    assert risk.kelly_fraction(0.5, 1.0) == 0.0


def test_quarter_kelly_below_cap():
    cfg = Config()
    # f* = (0.55-0.45)/0.55 = 0.1818 -> 1/4 = 4.55% < 6%
    stake, info = risk.position_size_usd(50, 50, 0.55, 0.45, cfg)
    assert info["pct_bankroll"] == pytest.approx(0.0455, abs=1e-3)
    assert stake == pytest.approx(50 * 0.04545, abs=0.01)


def test_hard_cap_six_percent():
    cfg = Config()
    # f* = (0.9-0.3)/0.7 = 0.857 -> 1/4 = 21% -> tope 6%
    stake, info = risk.position_size_usd(50, 50, 0.9, 0.3, cfg)
    assert info["pct_bankroll"] == 0.06
    assert stake == 3.0


def test_stake_never_exceeds_cash():
    stake, _ = risk.position_size_usd(100, 1.5, 0.9, 0.3, Config())
    assert stake == 1.5


def test_best_side_picks_no_when_overpriced_yes():
    s = risk.best_side(0.30, ask_yes=0.45, ask_no=0.57)
    assert s.outcome_index == 1
    assert s.fair_value == pytest.approx(0.70)
    assert s.edge == pytest.approx(0.13)


def test_entry_blockers():
    cfg = Config()
    ok = dict(edge=0.10, confidence="high", resolution_clear=True, open_positions=0, halted=False, cfg=cfg)
    assert risk.entry_blockers(**ok) == []
    assert risk.entry_blockers(**{**ok, "edge": 0.08})  # 8 pp exactos NO bastan: debe ser > 8
    assert risk.entry_blockers(**{**ok, "open_positions": 5})
    assert risk.entry_blockers(**{**ok, "halted": True})
    assert risk.entry_blockers(**{**ok, "confidence": "low"})
    assert risk.entry_blockers(**{**ok, "resolution_clear": False})


def test_drawdown():
    cfg = Config()
    assert risk.drawdown(60, 100) == pytest.approx(0.4)
    assert risk.drawdown_breached(60, 100, cfg)
    assert not risk.drawdown_breached(61, 100, cfg)


@pytest.mark.parametrize("field,value", [
    ("max_position_pct", 0.10), ("max_open_positions", 6), ("min_edge", 0.05),
    ("kelly_fraction", 0.5), ("min_liquidity", 1000), ("min_hours_to_resolution", 1), ("max_drawdown", 0.5),
])
def test_config_cannot_loosen_hard_rules(field, value):
    with pytest.raises(ValueError):
        replace(Config(), **{field: value}).validate()


def test_config_can_tighten_rules():
    replace(Config(), max_position_pct=0.03, min_edge=0.12, max_open_positions=3).validate()


def test_live_requires_explicit_confirmation():
    with pytest.raises(ValueError):
        replace(Config(), mode="live", private_key="0xabc", funder="0xdef").validate()
    replace(Config(), mode="live", private_key="0xabc", funder="0xdef", live_confirm=True).validate()


def test_simulation_smoke():
    from polybot.simulate import EVAL_COST, simulate_run, summarize

    cfg = Config()
    res = [simulate_run(s, months=1, skill=0.5, claude_noise=0.05, market_err=0.04, eval_cost=EVAL_COST["haiku"],
                        budget=0.5, spread=0.02, vol=0.25, cfg=cfg) for s in range(3)]
    out = summarize(res, 1, 6.0, cfg.initial_bankroll)
    assert len(out["median"]) == 1 and out["median"][0] > 0


def test_turbo_raises_throughput_but_not_hard_rules(monkeypatch, tmp_path):
    from polybot.config import TURBO_DEFAULTS, load_config

    for k in list(TURBO_DEFAULTS) + ["TURBO", "DAILY_API_BUDGET_USD"]:
        monkeypatch.delenv(k, raising=False)
    monkeypatch.setenv("TURBO", "true")
    monkeypatch.setenv("DAILY_API_BUDGET_USD", "4")      # lo puesto a mano manda
    cfg = load_config(env_file=None)
    assert cfg.turbo and cfg.max_days_to_resolution == 7 and cfg.triage_max_per_cycle == 150
    assert cfg.daily_api_budget_usd == 4
    assert (cfg.max_position_pct, cfg.max_open_positions, cfg.min_edge, cfg.kelly_fraction, cfg.max_drawdown) == \
        (0.06, 5, 0.08, 0.25, 0.40)
    for k in TURBO_DEFAULTS:
        monkeypatch.delenv(k, raising=False)
