"""Panel web en directo (solo lectura).

  python -m polybot dashboard                 -> http://127.0.0.1:8080
  python -m polybot dashboard --host 0.0.0.0  -> accesible desde fuera (pon DASHBOARD_TOKEN)

Lee los mismos ficheros que escribe el bot (estado + diarios JSONL); nunca opera.
"""

from __future__ import annotations

import hmac
import json
import logging
from collections import deque
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from . import risk
from .config import Config
from .state import BotState

log = logging.getLogger("polybot.dashboard")
HTML_PATH = Path(__file__).with_name("dashboard.html")


def _tail_jsonl(path: Path, limit: int) -> list[dict]:
    if not path.exists():
        return []
    rows: deque = deque(maxlen=limit)
    with open(path, encoding="utf-8") as f:
        for line in f:
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return list(rows)


def _downsample(points: list, max_points: int = 400) -> list:
    if len(points) <= max_points:
        return points
    step = len(points) / max_points
    picked = [points[int(i * step)] for i in range(max_points)]
    picked[-1] = points[-1]
    return picked


def build_data(cfg: Config) -> dict:
    st = BotState.load_or_new(cfg.state_path, cfg.mode, cfg.initial_bankroll)
    data_dir = cfg.data_dir

    equity_rows = [r for r in _tail_jsonl(data_dir / "equity.jsonl", 200_000) if r.get("mode") == cfg.mode]
    series = [[st.started_at, st.initial_bankroll]] + [[r["ts"], r["equity"]] for r in equity_rows]

    trades = [t for t in _tail_jsonl(data_dir / "trades.jsonl", 5000) if t.get("mode") == cfg.mode]
    events = _tail_jsonl(data_dir / "events.jsonl", 5000)
    scans = [e for e in events if e.get("kind") == "scan"]

    activity = []
    for t in trades[-60:]:
        if t.get("action") == "OPEN":
            edge = t.get("edge")
            activity.append({"ts": t["ts"], "kind": "order", "usd": t.get("usd"), "text": t.get("question", ""),
                             "side": t.get("outcome"), "edge": edge})
        else:
            activity.append({"ts": t["ts"], "kind": "close", "usd": t.get("pnl"), "text": t.get("question", ""),
                             "side": t.get("outcome"), "reason": t.get("reason")})
    for e in scans[-3:]:  # solo los últimos escaneos, para que no tapen las órdenes
        activity.append({"ts": e["ts"], "kind": "scan", "scanned": e.get("scanned"), "eligible": e.get("eligible")})
    for e in events[-200:]:
        if e.get("kind") in ("halt", "human_approval", "budget_exhausted", "scan_error", "cash_adjust", "paper_reset"):
            activity.append({"ts": e["ts"], "kind": e["kind"], "text": e.get("reason") or e.get("error") or e.get("note") or ""})
    activity.sort(key=lambda a: a["ts"], reverse=True)

    # Coste diario: media de la API en los últimos 7 días + VPS prorrateado.
    days = [(datetime.now(timezone.utc) - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
    started = datetime.fromisoformat(st.started_at)
    active_days = max(1.0, min(7.0, (datetime.now(timezone.utc) - started).total_seconds() / 86400))
    api_daily = sum(st.api_cost_by_day.get(d, 0.0) for d in days) / active_days
    daily_cost = api_daily + cfg.vps_monthly_usd / 30
    equity = st.equity
    open_edges = [t.get("edge") for t in trades if t.get("action") == "OPEN" and t.get("edge") is not None]
    vps = st.vps_cost_to_date(cfg.vps_monthly_usd)

    return {
        "mode": st.mode,
        "halted": st.halted,
        "halt_reason": st.halt_reason,
        "started_at": st.started_at,
        "last_cycle_at": st.last_cycle_at,
        "cycles": st.cycles,
        "initial": st.initial_bankroll,
        "equity": equity,
        "cash": st.cash,
        "peak": st.peak_equity,
        "drawdown": risk.drawdown(equity, st.peak_equity),
        "max_drawdown": cfg.max_drawdown,
        "pnl": equity - st.initial_bankroll,
        "api_cost_total": st.api_cost_total,
        "vps_cost": vps,
        "net": equity - st.initial_bankroll - st.api_cost_total - vps,
        "daily_cost": daily_cost,
        "runway_days": equity / daily_cost if daily_cost > 0 else None,
        "win_rate": st.win_rate,
        "wins": st.wins,
        "closed": len(st.closed_trades),
        "trades_opened": sum(1 for t in trades if t.get("action") == "OPEN"),
        "scanned_total": sum(e.get("scanned", 0) for e in scans),
        "avg_edge": sum(open_edges) / len(open_edges) if open_edges else None,
        "claude_calls": st.claude_calls,
        "series": _downsample(series),
        "positions": [
            {"question": p.question, "outcome": p.outcome, "shares": p.shares, "entry": p.entry_price,
             "price": p.last_price, "fv": p.last_fair_value, "cost": p.cost, "value": p.value,
             "end_date": p.end_date, "slug": p.slug}
            for p in st.positions.values()
        ],
        "closed_trades": [
            {"closed_at": t.closed_at, "question": t.question, "outcome": t.outcome, "pnl": t.pnl, "reason": t.reason}
            for t in st.closed_trades[-25:][::-1]
        ],
        "activity": activity[:80],
    }


def make_handler(cfg: Config, token: str):
    html = HTML_PATH.read_bytes()

    class Handler(BaseHTTPRequestHandler):
        def _send(self, code: int, body: bytes, ctype: str) -> None:
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self):  # noqa: N802 (nombre impuesto por http.server)
            url = urlparse(self.path)
            if token:
                given = parse_qs(url.query).get("token", [""])[0]
                if not hmac.compare_digest(given, token):
                    return self._send(401, b"token requerido: ?token=...", "text/plain; charset=utf-8")
            if url.path == "/":
                return self._send(200, html, "text/html; charset=utf-8")
            if url.path == "/api/data":
                try:
                    body = json.dumps(build_data(cfg), default=str).encode()
                except Exception as exc:  # el bot puede estar escribiendo; el panel no debe caerse
                    log.warning("Error leyendo datos: %s", exc)
                    return self._send(503, b'{"error":"datos no disponibles"}', "application/json")
                return self._send(200, body, "application/json")
            return self._send(404, b"not found", "text/plain")

        def log_message(self, fmt, *args):
            log.debug("%s - %s", self.address_string(), fmt % args)

    return Handler


def serve(cfg: Config, host: str, port: int, token: str = "") -> None:
    if host not in ("127.0.0.1", "localhost") and not token:
        log.warning("Panel expuesto en %s sin DASHBOARD_TOKEN: cualquiera con la IP podrá verlo", host)
    server = ThreadingHTTPServer((host, port), make_handler(cfg, token))
    log.info("Panel en http://%s:%d%s", host, port, "/?token=…" if token else "")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
