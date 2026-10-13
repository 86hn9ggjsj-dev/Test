"""Backtest de temperatura y report, con un mundo sintético donde se conoce la respuesta."""

import json
import random
from dataclasses import replace
from datetime import date, datetime, timedelta, timezone

import pytest

from polybot.backtest import (TempMarket, bucket_prob, forecast_max, parse_temp_market, required_lead,
                              run_backtest)
from polybot.polymarket import Market
from polybot.report import build_report

MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September",
          "October", "November", "December"]


def mk(question, end=datetime(2026, 8, 27, 4, tzinfo=timezone.utc), desc="Resolves per Weather Underground KLGA.",
       closed=False, prices=(0.5, 0.5), mid="x"):
    return Market(id=mid, question=question, slug=mid, outcomes=["Yes", "No"], token_ids=[f"{mid}-y", f"{mid}-n"],
                  prices=list(prices), end_date=end, liquidity=10000, volume_24h=5000, description=desc,
                  resolution_source="https://www.wunderground.com", closed=closed)


def test_parse_formats():
    tm = parse_temp_market(mk("Will the highest temperature in New York City be between 84-85°F on August 26?"))
    assert (tm.station, tm.kind, tm.lo, tm.hi, tm.unit, tm.target) == ("KLGA", "range", 84, 85, "F", date(2026, 8, 26))
    tm = parse_temp_market(mk("Will the highest temperature in London be 18°C on August 26?", desc="EGLC station"))
    assert (tm.station, tm.kind, tm.lo, tm.hi, tm.unit) == ("EGLC", "exact", 18, 18, "C")
    assert parse_temp_market(mk("Will the highest temperature in Chicago be 79°F or below on August 26?", desc="")).kind == "below"
    assert parse_temp_market(mk("Will the highest temperature in Miami be 95°F or higher on August 26?", desc="")).kind == "above"
    assert parse_temp_market(mk("Will it rain in Houston on August 30?")) is None
    assert parse_temp_market(mk("Will the highest temperature in Atlantis be 90°F or higher on August 26?", desc="")) is None


def test_bucket_probs_partition_sums_to_one():
    m = mk("x")
    buckets = [TempMarket(m, "KLGA", 0, 0, "F", date(2026, 8, 26), "below", None, 79)]
    buckets += [TempMarket(m, "KLGA", 0, 0, "F", date(2026, 8, 26), "range", a, a + 1) for a in range(80, 92, 2)]
    buckets += [TempMarket(m, "KLGA", 0, 0, "F", date(2026, 8, 26), "above", 92, None)]
    assert sum(bucket_prob(85.3, 2.5, b) for b in buckets) == pytest.approx(1.0, abs=0.01)


def test_required_lead_never_uses_future_forecasts():
    # Nueva York (UTC-4). Día objetivo 26-ago termina a las 04:00 UTC del 27.
    t = datetime(2026, 8, 25, 12, tzinfo=timezone.utc)   # faltan 40 h -> hace falta la previsión de hace 2 días
    assert required_lead(date(2026, 8, 26), -14400, t) == 2
    t = datetime(2026, 8, 26, 10, tzinfo=timezone.utc)   # faltan 18 h -> la de hace 1 día
    assert required_lead(date(2026, 8, 26), -14400, t) == 1


def test_forecast_max_uses_requested_run():
    runs = {"hourly": {"time": [f"2026-08-26T{h:02d}:00" for h in range(24)],
                       "temperature_2m_previous_day2": [80 + (h == 15) * 6 for h in range(24)],
                       "temperature_2m_previous_day1": [70.0] * 24}}
    assert forecast_max(runs, date(2026, 8, 26), 2) == 86
    assert forecast_max(runs, date(2026, 8, 26), 1) == 70
    assert forecast_max(runs, date(2026, 8, 26), 3) is None


class FakeHistory:
    """Mundo sintético: máxima real, previsiones con error creciente con la antelación y un mercado
    que, según el escenario, va por detrás de la previsión ('naive') o sabe más que ella ('informed')."""

    def __init__(self, scenario, n_days=40, seed=3):
        rng = random.Random(seed)
        self.markets, self.history, self.runs = [], {}, {}
        base = date(2026, 6, 1)
        for d in range(n_days):
            target = base + timedelta(days=d)
            true = rng.gauss(85, 5)
            fc = {n: true + rng.gauss(0, 1.5 * (1 + 0.25 * (n - 1))) for n in range(1, 8)}
            hourly = {"time": [f"{target.isoformat()}T{h:02d}:00" for h in range(24)]}
            for n in range(1, 8):
                hourly[f"temperature_2m_previous_day{n}"] = [fc[n] - abs(h - 15) * 0.8 for h in range(24)]
            self.runs[target] = {"utc_offset_seconds": -14400, "hourly": hourly}
            end = datetime(target.year, target.month, target.day, tzinfo=timezone.utc) + timedelta(days=1, hours=4)
            market_err = rng.gauss(0, 0.5)  # error del mercado persistente (no ruido nuevo cada hora)
            buckets = [("below", None, 79)] + [("range", a, a + 1) for a in range(80, 92, 2)] + [("above", 92, None)]
            for kind, lo, hi in buckets:
                label = {"below": f"{hi}°F or below", "above": f"{lo}°F or higher", "range": f"between {lo}-{hi}°F"}[kind]
                q = f"Will the highest temperature in New York City be {label} on {MONTHS[target.month - 1]} {target.day}?"
                r = round(true)
                won = (lo is None or r >= lo) and (hi is None or r <= hi)
                mid = f"{target.isoformat()}-{kind}-{lo}-{hi}"
                m = mk(q, end=end, closed=True, prices=(1.0, 0.0) if won else (0.0, 1.0), mid=mid)
                self.markets.append(m)
                tm = parse_temp_market(m)
                pts, t = [], end - timedelta(days=4)
                while t <= end:
                    if scenario == "naive":       # precio = climatología, no mira la previsión
                        p = bucket_prob(85, 5, tm)
                    else:                         # el mercado sabe casi la temperatura real
                        p = bucket_prob(true + market_err, 0.7, tm)
                    pts.append((t, min(max(p, 0.01), 0.99)))
                    t += timedelta(hours=1)
                self.history[m.token_ids[0]] = pts

    def closed_weather_markets(self, days, max_markets=3000):
        return self.markets

    def price_history(self, token_id, start, end):
        return self.history[token_id]

    def previous_runs(self, lat, lon, start, end, unit):
        merged = {"utc_offset_seconds": -14400, "hourly": {}}
        d = start
        while d <= end:
            for k, v in self.runs[d]["hourly"].items():
                merged["hourly"].setdefault(k, []).extend(v)
            d += timedelta(days=1)
        return merged


@pytest.fixture
def bt_cfg(cfg):
    return replace(cfg, max_days_to_resolution=60)


def test_backtest_finds_edge_when_market_lags_forecast(bt_cfg):
    res = run_backtest(FakeHistory("naive"), bt_cfg, bankroll=50)
    assert res.test_markets > 0 and res.train_markets > 0
    assert res.brier_model < res.brier_market
    assert len([t for t in res.trades if t["reason"] != "halt"]) > 10
    assert res.final_equity > 50


def test_backtest_finds_no_edge_when_market_knows_more(bt_cfg):
    res = run_backtest(FakeHistory("informed"), bt_cfg, bankroll=50)
    assert res.brier_model > res.brier_market
    assert res.final_equity <= 52  # sin ventaja real no debería crecer


# ------------------------------------------------------------------- report
class FakeResolved:
    def __init__(self, outcomes):
        self.outcomes = outcomes

    def fetch_market(self, mid):
        if mid not in self.outcomes:
            return mk("q", mid=mid)
        won = self.outcomes[mid]
        return mk("q", mid=mid, closed=True, prices=(1.0, 0.0) if won else (0.0, 1.0))


def test_report_compares_claude_with_market(cfg):
    cfg.data_dir.mkdir(parents=True)
    rows = []
    rng = random.Random(1)
    outcomes = {}
    for i in range(40):
        truth = rng.random() < 0.5
        outcomes[f"m{i}"] = truth
        rows.append({"ts": "2026-08-01T00:00:00+00:00", "kind": "entry", "market_id": f"m{i}", "question": f"q{i}",
                     "mid_yes": 0.5, "fair_yes": 0.8 if truth else 0.2, "analyst_fair_yes": 0.8 if truth else 0.2,
                     "skeptic_verdict": "agree", "decision": "TRADE"})
    rows.append({"ts": "2026-08-02T00:00:00+00:00", "kind": "entry", "market_id": "pending", "question": "p",
                 "mid_yes": 0.5, "fair_yes": 0.6})
    (cfg.data_dir / "decisions.jsonl").write_text("\n".join(json.dumps(r) for r in rows))
    (cfg.data_dir / "equity.jsonl").write_text(
        json.dumps({"ts": "2026-08-01T00:00:00", "mode": "paper", "equity": 51.0}) + "\n"
        + json.dumps({"ts": "2026-09-01T00:00:00", "mode": "paper", "equity": 49.0}) + "\n")
    text = build_report(cfg, FakeResolved(outcomes))
    assert "Estimaciones con mercado ya resuelto: **40**" in text
    assert "1 aún sin resolver" in text
    assert "✅ Claude bate al precio del mercado" in text
    assert "| 2026-08 | $50.00 | $51.00 | +2.0% |" in text and "| 2026-09 |" in text
    assert (cfg.data_dir / "report.md").exists()


def test_report_small_sample_is_inconclusive(cfg):
    cfg.data_dir.mkdir(parents=True)
    (cfg.data_dir / "decisions.jsonl").write_text(json.dumps(
        {"ts": "t", "kind": "entry", "market_id": "a", "question": "q", "mid_yes": 0.5, "fair_yes": 0.9}))
    text = build_report(cfg, FakeResolved({"a": True}))
    assert "Muestra pequeña" in text
