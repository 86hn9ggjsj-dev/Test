import json
from datetime import datetime, timedelta, timezone

import pytest
from conftest import FakeData, make_market

from polybot.agent import Agent
from polybot.executor import PaperExecutor
from polybot.journal import Journal
from polybot.report import sharp_section
from polybot.sharp import SharpBook, devig, normalize_team, parse_event, team_score

START = datetime.now(timezone.utc) + timedelta(hours=30)


def test_devig_removes_bookmaker_margin():
    p = devig([1.90, 2.10])
    assert sum(p) == pytest.approx(1.0)
    assert p[0] == pytest.approx((1 / 1.9) / (1 / 1.9 + 1 / 2.1))
    assert devig([2.0, 0.0]) == []


@pytest.mark.parametrize("a,b", [
    ("FC Bayern München", "Bayern Munich"), ("Club Atlético de Madrid", "Atletico Madrid"),
    ("Manchester United FC", "Manchester United"), ("FC Internazionale Milano", "Inter Milan"),
    ("Wolverhampton Wanderers FC", "Wolverhampton Wanderers"), ("Atlanta Braves", "Atlanta Braves"),
])
def test_team_names_match(a, b):
    assert team_score(a, b) >= 0.72, (normalize_team(a), normalize_team(b))


@pytest.mark.parametrize("a,b", [("AC Milan", "Inter Milan"), ("Manchester City", "Manchester United"),
                                 ("Real Madrid", "Atletico Madrid"), ("New York Yankees", "New York Mets")])
def test_different_teams_do_not_match(a, b):
    assert team_score(a, b) < 0.72


def odds_event(home, away, h2h, totals=None, spreads=None, start=START):
    markets = [{"key": "h2h", "outcomes": [{"name": n, "price": p} for n, p in h2h]}]
    if totals:
        markets.append({"key": "totals", "outcomes": [{"name": n, "price": p, "point": pt} for n, p, pt in totals]})
    if spreads:
        markets.append({"key": "spreads", "outcomes": [{"name": n, "price": p, "point": pt} for n, p, pt in spreads]})
    return {"id": "x", "sport_key": "s", "commence_time": start.isoformat().replace("+00:00", "Z"),
            "home_team": home, "away_team": away, "bookmakers": [{"key": "pinnacle", "markets": markets}]}


class FakeOdds:
    bookmaker = "pinnacle"
    remaining = "499"

    def __init__(self, events):
        self.events, self.calls = events, 0

    def odds(self, sport, markets):
        self.calls += 1
        return self.events


def poly(mid, question, outcomes, kind, title, price, line=None):
    raw = {"sportsMarketType": kind, "gameStartTime": START.strftime("%Y-%m-%d %H:%M:%S+00"), "line": line,
           "events": [{"title": title}]}
    return make_market(mid, price=price, question=question, outcomes=outcomes, raw=raw,
                       end_date=START, resolution_source="https://www.uefa.com")


def book(events):
    b = SharpBook(FakeOdds(events), ["s"], "h2h,totals,spreads", 360)
    b.refresh_if_stale()
    return b


def test_fair_values_for_each_market_type():
    b = book([
        odds_event("Atletico Madrid", "Manchester United", [("Atletico Madrid", 2.0), ("Manchester United", 4.0), ("Draw", 4.0)],
                   totals=[("Over", 1.95, 2.5), ("Under", 1.95, 2.5)]),
        odds_event("New York Yankees", "Atlanta Braves", [("New York Yankees", 1.5), ("Atlanta Braves", 3.0)],
                   spreads=[("New York Yankees", 2.2, -1.5), ("Atlanta Braves", 1.8, 1.5)]),
    ])
    title = "Club Atlético de Madrid vs. Manchester United FC"
    win = poly("a", "Will Club Atlético de Madrid win on 2026-10-13?", ["Yes", "No"], "moneyline", title, 0.4)
    draw = poly("b", "Will Club Atlético de Madrid vs. Manchester United FC end in a draw?", ["Yes", "No"], "moneyline", title, 0.2)
    over = poly("c", "Atletico vs Man Utd: O/U 2.5", ["Over", "Under"], "totals", title, 0.5, line=2.5)
    mlb = poly("d", "Atlanta Braves vs. New York Yankees", ["Atlanta Braves", "New York Yankees"], "moneyline",
               "Atlanta Braves vs. New York Yankees", 0.4)
    spread = poly("e", "Spread: New York Yankees (-1.5)", ["New York Yankees", "Atlanta Braves"], "spreads",
                  "Atlanta Braves vs. New York Yankees", 0.45, line=-1.5)
    assert b.fair_yes(win)[0] == pytest.approx(0.5)
    assert b.fair_yes(draw)[0] == pytest.approx(0.25)
    assert b.fair_yes(over)[0] == pytest.approx(0.5)
    assert b.fair_yes(mlb)[0] == pytest.approx(1 / 3)
    assert b.fair_yes(spread)[0] == pytest.approx((1 / 2.2) / (1 / 2.2 + 1 / 1.8))


def test_no_match_when_time_or_teams_differ():
    b = book([odds_event("Real Madrid", "Barcelona", [("Real Madrid", 2.0), ("Barcelona", 2.0)],
                         start=START + timedelta(hours=10))])
    m = poly("a", "Real Madrid vs. Barcelona", ["Real Madrid", "Barcelona"], "moneyline", "Real Madrid vs. Barcelona", 0.5)
    assert b.fair_yes(m)[0] is None  # misma pareja pero 10 h de diferencia: otro partido
    m2 = poly("b", "Atletico Madrid vs. Sevilla", ["Atletico Madrid", "Sevilla"], "moneyline", "Atletico Madrid vs. Sevilla", 0.5)
    assert b.fair_yes(m2)[0] is None


def test_refresh_respects_interval():
    odds = FakeOdds([])
    b = SharpBook(odds, ["a", "b"], "h2h", 360)
    b.refresh_if_stale()
    b.refresh_if_stale()
    assert odds.calls == 2  # 2 deportes, un solo refresco


def run_agent(cfg, events, price):
    data = FakeData()
    title = "Atlanta Braves vs. New York Yankees"
    data.add(poly("g1", title, ["Atlanta Braves", "New York Yankees"], "moneyline", title, price))
    agent = Agent(cfg, data=data, brain=None or __import__("conftest").FakeBrain({}), executor=PaperExecutor(cfg),
                  journal=Journal(cfg.data_dir), sharp=book(events))
    agent.run_cycle()
    rows = [json.loads(x) for x in (cfg.data_dir / "decisions.jsonl").read_text().splitlines()]
    return agent, [r for r in rows if r.get("kind") == "sharp"]


EVENTS = [odds_event("New York Yankees", "Atlanta Braves", [("New York Yankees", 1.6), ("Atlanta Braves", 2.6)])]  # Braves ~38%


def test_agent_trades_big_deviation_from_pinnacle(cfg):
    agent, sharp_rows = run_agent(cfg, EVENTS, price=0.25)   # ask Braves 0.26 vs justo ~0.38 -> ~12 pp
    assert sharp_rows[-1]["decision"] == "TRADE"
    p = agent.state.positions["g1"]
    assert p.source == "sharp" and p.outcome == "Atlanta Braves"
    assert agent.state.agent_stats["sharp"]["signals"] == 1


def test_agent_only_shadows_small_deviation(cfg):
    agent, sharp_rows = run_agent(cfg, EVENTS, price=0.33)   # ~4 pp: por debajo de la regla de 8 pp
    assert sharp_rows[-1]["decision"] == "SHADOW"
    assert not agent.state.positions


class Resolved:
    def __init__(self, winners):
        self.winners = winners

    def fetch_market(self, mid):
        if mid not in self.winners:
            return None
        return make_market(mid, closed=True, prices=[1.0, 0.0] if self.winners[mid] == 0 else [0.0, 1.0])


def test_report_scores_shadow_signals(cfg):
    cfg.data_dir.mkdir(parents=True)
    rows = [{"kind": "sharp", "market_id": f"m{i}", "side_index": 0, "side_price": 0.30, "edge": 0.05,
             "fee_rate": 0.05, "sports_type": "moneyline"} for i in range(40)]
    (cfg.data_dir / "decisions.jsonl").write_text("\n".join(json.dumps(r) for r in rows))
    text = "\n".join(sharp_section(cfg, Resolved({f"m{i}": 0 if i < 16 else 1 for i in range(40)})))
    assert "ya resueltos: 40" in text
    assert "| ≥ 4 pp | 40 |" in text and "| ≥ 8 pp | 0 |" in text
