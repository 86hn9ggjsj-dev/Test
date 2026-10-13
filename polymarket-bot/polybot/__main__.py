"""Línea de comandos.

  python -m polybot run             loop 24/7 (un ciclo cada LOOP_MINUTES)
  python -m polybot once            un solo ciclo
  python -m polybot status          muestra el estado
  python -m polybot scan            lista mercados elegibles (sin llamar a Claude, sin operar)
  python -m polybot dashboard       panel web en directo (http://127.0.0.1:8080)
  python -m polybot report          ¿bate Claude al mercado? (paper trading) + crecimiento mensual
  python -m polybot backtest        backtest honesto de mercados de temperatura (datos históricos reales)
  python -m polybot approve --yes   reanuda tras un parón por drawdown
  python -m polybot reset --yes     borra el estado PAPER y empieza de nuevo con el bankroll inicial
"""

from __future__ import annotations

import argparse
import logging
import signal
import sys
import time

from . import filters
from .config import load_config
from .journal import Journal, render_status, setup_logging
from .polymarket import PolymarketData
from .state import BotState

log = logging.getLogger("polybot")
_stop = False


def _handle_signal(signum, _frame):
    global _stop
    _stop = True
    log.info("Señal %s recibida: termino al acabar el ciclo actual", signum)


def cmd_run(cfg, once: bool) -> int:
    from .agent import Agent

    import os

    if not (os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN")):
        log.warning("ANTHROPIC_API_KEY no configurada: el bot escaneará mercados pero Claude no podrá estimar fair values")
    agent = Agent(cfg)
    signal.signal(signal.SIGTERM, _handle_signal)
    signal.signal(signal.SIGINT, _handle_signal)
    log.info("Polybot arrancado en modo %s · bankroll $%.2f · loop cada %g min",
             cfg.mode.upper(), agent.state.equity, cfg.loop_minutes)
    while True:
        started = time.monotonic()
        try:
            agent.run_cycle()
        except Exception:
            log.exception("Error no controlado en el ciclo; continúo en el siguiente")
        if once or _stop:
            return 0
        wait = cfg.loop_minutes * 60 - (time.monotonic() - started)
        while wait > 0 and not _stop:
            time.sleep(min(wait, 5))
            wait -= 5
        if _stop:
            return 0


def cmd_scan(cfg) -> int:
    markets = PolymarketData().fetch_active_markets(cfg.max_markets_scan)
    ok = filters.eligible_markets(markets, cfg)
    print(f"{len(markets)} mercados escaneados, {len(ok)} elegibles:\n")
    for m in ok[:50]:
        print(f"  {m.prices[0]:.3f}  liq ${m.liquidity:>10,.0f}  vol24h ${m.volume_24h:>10,.0f}  "
              f"{m.hours_to_resolution():>7.1f} h  {m.question[:80]}")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="polybot", description="Agente autónomo de trading en Polymarket")
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("run")
    sub.add_parser("once")
    sub.add_parser("status")
    sub.add_parser("scan")
    sub.add_parser("report")
    bp = sub.add_parser("backtest")
    bp.add_argument("--days", type=int, default=90, help="días hacia atrás (por defecto 90)")
    bp.add_argument("--bankroll", type=float, default=50.0)
    bp.add_argument("--spread", type=float, default=0.02, help="spread supuesto (por defecto 2 pp)")
    bp.add_argument("--train-frac", type=float, default=0.4, help="fracción inicial para ajustar el modelo")
    bp.add_argument("--max-markets", type=int, default=3000)
    bp.add_argument("--hold", action="store_true", help="sin salidas anticipadas: aguantar hasta la resolución")
    dp = sub.add_parser("dashboard")
    dp.add_argument("--host", default=None, help="por defecto 127.0.0.1 (o DASHBOARD_HOST)")
    dp.add_argument("--port", type=int, default=None, help="por defecto 8080 (o DASHBOARD_PORT)")
    ap = sub.add_parser("approve")
    ap.add_argument("--yes", action="store_true")
    ap.add_argument("--note", default="")
    rp = sub.add_parser("reset")
    rp.add_argument("--yes", action="store_true")
    parser.add_argument("--env", default=".env", help="fichero .env (por defecto ./.env)")
    args = parser.parse_args(argv)

    try:
        cfg = load_config(args.env)
    except ValueError as exc:
        print(exc, file=sys.stderr)
        return 2
    setup_logging(cfg.log_dir)

    if args.cmd in ("run", "once"):
        return cmd_run(cfg, once=args.cmd == "once")
    if args.cmd == "scan":
        return cmd_scan(cfg)
    if args.cmd == "report":
        from .report import build_report

        print(build_report(cfg))
        print(f"(guardado en {cfg.data_dir / 'report.md'})")
        return 0
    if args.cmd == "backtest":
        from .backtest import HistoryClient, render, run_backtest

        import requests

        try:
            res = run_backtest(HistoryClient(cache_dir=cfg.data_dir / "backtest_cache"), cfg, days=args.days, train_frac=args.train_frac, spread=args.spread,
                               bankroll=args.bankroll, max_markets=args.max_markets, hold=args.hold)
        except requests.RequestException as exc:
            print(f"No se pudieron descargar los datos históricos: {exc}\n"
                  "El backtest necesita acceso a gamma-api.polymarket.com, clob.polymarket.com y "
                  "previous-runs-api.open-meteo.com.", file=sys.stderr)
            return 1
        text = render(res, args.bankroll)
        cfg.data_dir.mkdir(parents=True, exist_ok=True)
        (cfg.data_dir / "backtest.md").write_text(text, encoding="utf-8")
        print(text)
        print(f"(guardado en {cfg.data_dir / 'backtest.md'})")
        return 0
    if args.cmd == "dashboard":
        import os

        from .dashboard import serve

        serve(cfg, args.host or os.environ.get("DASHBOARD_HOST", "127.0.0.1"),
              args.port or int(os.environ.get("DASHBOARD_PORT", "8080")), os.environ.get("DASHBOARD_TOKEN", ""))
        return 0

    state = BotState.load_or_new(cfg.state_path, cfg.mode, cfg.initial_bankroll)
    if args.cmd == "status":
        print(render_status(state, cfg.vps_monthly_usd))
        return 0
    if args.cmd == "approve":
        if not state.halted:
            print("El bot no está detenido; no hay nada que aprobar.")
            return 0
        if not args.yes:
            print(f"Detenido por: {state.halt_reason}. Revisa el post-mortem en {cfg.data_dir} y repite con --yes.")
            return 1
        from .agent import Agent
        Agent(cfg, state=state).approve_restart(args.note)
        print("Aprobado. El bot volverá a operar en el próximo ciclo.")
        return 0
    if args.cmd == "reset":
        if cfg.mode != "paper":
            print("reset solo está permitido en modo paper.")
            return 1
        if not args.yes:
            print("Esto borra el estado paper. Repite con --yes para confirmar.")
            return 1
        BotState.new("paper", cfg.initial_bankroll).save(cfg.state_path)
        Journal(cfg.data_dir).event(kind="paper_reset", bankroll=cfg.initial_bankroll)
        print(f"Estado paper reiniciado con ${cfg.initial_bankroll:.2f}.")
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main())
