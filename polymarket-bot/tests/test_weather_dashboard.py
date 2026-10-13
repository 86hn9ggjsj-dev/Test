import json
from dataclasses import replace

import anthropic
import httpx2
from conftest import FakeBrain, FakeData, make_market
from test_brain import _message

from polybot import filters
from polybot.agent import Agent
from polybot.brain import Brain
from polybot.dashboard import build_data, make_handler
from polybot.executor import PaperExecutor
from polybot.journal import Journal
from polybot.weather import is_weather_market, run_nws_tool


def test_weather_detection():
    assert is_weather_market(make_market(question="Highest temperature in Phoenix on Aug 26 above 112°F?"))
    assert is_weather_market(make_market(question="Will NOAA name a 9th Atlantic storm in August?"))
    assert is_weather_market(make_market(question="Hurricane landfall in Florida before Sep 15?"))
    assert not is_weather_market(make_market(question="Will the Miami Heat win the NBA title?", resolution_source=""))
    assert not is_weather_market(make_market(question="Fed cuts rates in September?", resolution_source=""))


def test_fast_mode_prioritizes_weather_then_soonest(cfg):
    a = make_market("a", hours=200, question="Fed cuts rates?", resolution_source="https://fed.gov")
    b = make_market("b", hours=100, question="NYC high above 95°F on Aug 28?")
    c = make_market("c", hours=10, question="Election winner?", resolution_source="https://gov.example")
    d = make_market("d", hours=30, question="Will it rain in Houston on Aug 30?")
    order = [m.id for m in filters.eligible_markets([a, b, c, d], cfg)]
    assert order == ["d", "b", "c", "a"]
    slow = [m.id for m in filters.eligible_markets([a, b, c, d], replace(cfg, fast_mode=False))]
    assert slow[0] in ("a", "b", "c", "d") and len(slow) == 4


class FakeNWS:
    def __init__(self):
        self.calls = []

    def forecast(self, lat, lon):
        self.calls.append((lat, lon))
        return {"forecast": [{"name": "Tuesday", "temperature": 114, "unit": "F"}]}


def test_brain_uses_nws_tool_for_weather_markets(cfg):
    seen = []
    replies = [
        _message([{"type": "tool_use", "id": "toolu_w", "name": "get_nws_forecast",
                   "input": {"latitude": 33.45, "longitude": -112.07}}], "tool_use"),
        _message([{"type": "tool_use", "id": "toolu_s", "name": "submit_estimate", "input": {
            "probability": 0.8, "confidence": "high", "resolution_source_clear": True,
            "resolution_source": "NWS Phoenix", "reasoning": "Forecast 114F.", "key_evidence": ["NWS"]}}], "tool_use"),
    ]

    def handler(request):
        seen.append(json.loads(request.content))
        return httpx2.Response(200, json=replies[len(seen) - 1])

    client = anthropic.Anthropic(api_key="t", http_client=httpx2.Client(transport=httpx2.MockTransport(handler)))
    brain = Brain(cfg, client=client)
    brain.nws = FakeNWS()
    est = brain.estimate(make_market(question="Highest temperature in Phoenix above 112°F?"), 0.5, 0.52)

    assert est.fair_yes == 0.8
    assert brain.nws.calls == [(33.45, -112.07)]
    assert any(t.get("name") == "get_nws_forecast" for t in seen[0]["tools"])
    result_msg = seen[1]["messages"][-1]
    assert result_msg["role"] == "user" and result_msg["content"][0]["type"] == "tool_result"
    assert result_msg["content"][0]["tool_use_id"] == "toolu_w"
    assert "weather market" in seen[0]["messages"][0]["content"]


def test_brain_does_not_offer_nws_for_other_markets(cfg):
    seen = []

    def handler(request):
        seen.append(json.loads(request.content))
        return httpx2.Response(200, json=_message([], "refusal"))

    client = anthropic.Anthropic(api_key="t", http_client=httpx2.Client(transport=httpx2.MockTransport(handler)))
    Brain(cfg, client=client).estimate(make_market(question="Fed cuts rates?", resolution_source="https://fed.gov"), 0.5, 0.5)
    assert not any(t.get("name") == "get_nws_forecast" for t in seen[0]["tools"])


def test_nws_tool_bad_input():
    out, err = run_nws_tool(FakeNWS(), {"latitude": "x"})
    assert err and "error" in out


def test_dashboard_data_from_real_cycle(cfg):
    data = FakeData()
    data.add(make_market("a", price=0.40))
    agent = Agent(cfg, data=data, brain=FakeBrain({"a": 0.65}), executor=PaperExecutor(cfg), journal=Journal(cfg.data_dir))
    agent.run_cycle()
    d = build_data(cfg)
    assert d["mode"] == "paper" and len(d["positions"]) == 1
    assert len(d["series"]) == 2 and d["series"][0][1] == 50.0
    assert any(a["kind"] == "order" for a in d["activity"])
    assert d["runway_days"] is not None and d["daily_cost"] > 0
    json.dumps(d, default=str)


def test_dashboard_token(cfg):
    import io

    handler_cls = make_handler(cfg, token="s3cret")

    class Req(handler_cls):
        def __init__(self, path):
            self.path, self.wfile, self.headers = path, io.BytesIO(), {}
            self.request_version, self.command, self.requestline = "HTTP/1.1", "GET", "GET"
            self.client_address = ("127.0.0.1", 0)
            self.do_GET()

    assert b" 401 " in Req("/api/data").wfile.getvalue()[:40]
    assert b" 200 " in Req("/api/data?token=s3cret").wfile.getvalue()[:40]
