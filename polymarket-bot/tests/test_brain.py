"""El cerebro contra un transporte HTTP falso: valida la petición que el SDK
construye y el bucle pause_turn -> submit_estimate, sin gastar en la API."""

import json

import anthropic
import httpx2
from conftest import make_market

from polybot.brain import Brain


def _message(content, stop_reason, searches=0):
    return {
        "id": "msg_test", "type": "message", "role": "assistant", "model": "claude-opus-5-5",
        "content": content, "stop_reason": stop_reason, "stop_sequence": None,
        "usage": {"input_tokens": 1000, "output_tokens": 500,
                  "server_tool_use": {"web_search_requests": searches}},
    }


def test_brain_request_and_pause_turn_loop(cfg):
    requests_seen = []
    replies = [
        _message([{"type": "text", "text": "Researching..."}], "pause_turn", searches=2),
        _message([{"type": "tool_use", "id": "toolu_1", "name": "submit_estimate", "input": {
            "probability": 0.62, "confidence": "medium", "resolution_source_clear": True,
            "resolution_source": "NOAA", "reasoning": "Forecast shows rain.", "key_evidence": ["NWS forecast"],
        }}], "tool_use"),
    ]

    def handler(request: httpx2.Request) -> httpx2.Response:
        requests_seen.append((dict(request.headers), json.loads(request.content)))
        return httpx2.Response(200, json=replies[len(requests_seen) - 1])

    client = anthropic.Anthropic(api_key="test", http_client=httpx2.Client(transport=httpx2.MockTransport(handler)))
    brain = Brain(cfg, client=client)
    est = brain.estimate(make_market("a"), 0.41, 0.61)

    assert est is not None and est.fair_yes == 0.62 and est.confidence == "medium"
    assert len(requests_seen) == 2
    headers, body = requests_seen[0]
    assert body["model"] == "claude-opus-5-5"
    assert body["fallbacks"] == "default"
    assert "server-side-fallback-2026-07-01" in headers["anthropic-beta"]
    assert body["output_config"] == {"effort": "high"}
    tool_types = [t.get("type", t.get("name")) for t in body["tools"]]
    assert "web_search_20260209" in tool_types and "submit_estimate" in tool_types
    assert "thinking" not in body  # Opus 5.5: pensamiento adaptativo por defecto
    # tras pause_turn se reenvía el turno del asistente sin añadir un mensaje de usuario
    assert requests_seen[1][1]["messages"][-1]["role"] == "assistant"
    # coste: 2 llamadas x (1000 in @ $4/M + 500 out @ $20/M) + 2 búsquedas @ $0.01
    assert abs(est.cost_usd - (2 * (0.004 + 0.01) + 0.02)) < 1e-9


def test_brain_handles_refusal(cfg):
    def handler(request):
        return httpx2.Response(200, json=_message([], "refusal"))

    client = anthropic.Anthropic(api_key="test", http_client=httpx2.Client(transport=httpx2.MockTransport(handler)))
    brain = Brain(cfg, client=client)
    assert brain.estimate(make_market("a"), 0.41, 0.61) is None
    assert brain.last_cost > 0
