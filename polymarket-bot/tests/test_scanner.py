import random
from datetime import datetime, timedelta, timezone

from polybot.config import Config
from polybot.scanner import Obs, category, corrected, fit_table, simulate


def test_category_heuristics():
    assert category("Bitcoin Up or Down - October 12, 3PM ET?") == "cripto"
    assert category("Lakers vs. Celtics") == "deportes"
    assert category("Will Mark Carney win the Nobel Peace Prize in 2026?") == "cultura"
    assert category("Will the Fed cut interest rates in October?") == "economía"
    assert category("Will the Conservative party win the election?") == "política"
    assert category("Will aliens land?") == "otros"


def synthetic(bias, n_markets=400, seed=0):
    """Mercados cuyo 'Sí' cotiza a p pero gana con prob p + bias."""
    rng = random.Random(seed)
    t0 = datetime(2026, 9, 1, tzinfo=timezone.utc)
    obs = []
    for i in range(n_markets):
        p = rng.uniform(0.15, 0.30)
        y = 1 if rng.random() < max(0.0, p + bias) else 0
        start = t0 + timedelta(hours=6 * i)
        end = start + timedelta(days=2)
        for k in range(6):
            obs.append(Obs(start + timedelta(hours=6 * k), f"m{i}", f"m{i}", "q", "cultura", p, y, end, end))
    obs.sort(key=lambda o: o.t)
    return obs


def test_scanner_learns_underpriced_yes_and_profits():
    obs = synthetic(bias=+0.15)
    cut = len(obs) * 4 // 10
    table = fit_table(obs[:cut])
    assert corrected(0.25, table) > 0.33
    trades, final = simulate(obs[cut:], {"cultura": table}, Config(), spread=0.02)
    assert trades and all(t["side"] == 0 for t in trades)   # compra 'Sí'
    assert final > 50


def test_min_order_size_blocks_expensive_side_with_small_bankroll():
    # 'Sí' sobrevalorado -> la ventaja está en el 'No' a ~0.76: con $50, 6% = $3 = 3.9 shares < 5 mínimo
    obs = synthetic(bias=-0.15)
    cut = len(obs) * 4 // 10
    table = fit_table(obs[:cut])
    assert corrected(0.25, table) < 0.15
    trades, _ = simulate(obs[cut:], {"cultura": table}, Config(), spread=0.02)
    assert trades == []
    from dataclasses import replace
    trades, final = simulate(obs[cut:], {"cultura": table}, replace(Config(), initial_bankroll=500), spread=0.02)
    assert trades and all(t["side"] == 1 for t in trades) and final > 500


def test_scanner_finds_nothing_in_efficient_market():
    obs = synthetic(bias=0.0)
    cut = len(obs) * 4 // 10
    table = fit_table(obs[:cut])
    trades, final = simulate(obs[cut:], {"cultura": table}, Config(), spread=0.02)
    assert len(trades) <= 3 and final <= 53
