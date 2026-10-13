"""Simulación Monte Carlo del bot en un mercado sintético.

NO son resultados reales: es lo que haría el bot SI los supuestos fueran ciertos.
Usa las mismas reglas que el bot (risk.py): edge > 8 pp, 1/4 Kelly con tope 6%,
máx. 5 posiciones, salidas por edge < 2 pp / fair value -5 pp / < 2 h, parada al 40%,
y el presupuesto diario de API compartido entre re-evaluar posiciones y buscar nuevas.

Modelo del mundo (pasos de 1 hora):
  - Cada mercado tiene una probabilidad verdadera que se mueve como paseo aleatorio.
  - El precio de mercado = verdad + error del mercado (persistente, sd `market_err`).
  - Claude ve el precio y las mismas noticias que el mercado, así que su estimación es:
        precio + skill * (verdad - precio) + ruido propio (sd `claude_noise`)
    skill = 0 -> Claude no sabe nada que el mercado no sepa (solo ruido)
    skill = 1 -> Claude detecta todo el error del mercado

Uso:  python -m polybot.simulate            (escenarios por defecto)
      python -m polybot.simulate --runs 500 --skill 0.3 --model sonnet
"""

from __future__ import annotations

import argparse
import math
import random
import statistics
from dataclasses import dataclass, replace

from . import risk
from .config import Config

HOURS_PER_MONTH = 730
# Coste estimado por evaluación (tokens + búsquedas web). Estimaciones, no medidas.
EVAL_COST = {"opus": 0.25, "sonnet": 0.12, "haiku": 0.04}


@dataclass
class SimMarket:
    p: float          # probabilidad verdadera actual
    m_err: float      # error persistente del mercado
    c_noise: float    # ruido persistente de Claude en este mercado
    end: int          # hora de resolución
    t: int            # última hora en que se actualizó

    def advance(self, now: int, rng: random.Random, vol: float, market_err: float) -> None:
        dt = now - self.t
        if dt <= 0:
            return
        # paseo aleatorio en logit (vol por raíz de día)
        x = math.log(self.p / (1 - self.p)) + rng.gauss(0, vol * math.sqrt(dt / 24))
        self.p = min(max(1 / (1 + math.exp(-x)), 0.005), 0.995)
        # error del mercado: Ornstein-Uhlenbeck con vida media de ~3 días
        rho = 0.5 ** (dt / 72)  # los errores de precio tardan días en corregirse
        self.m_err = rho * self.m_err + math.sqrt(1 - rho * rho) * rng.gauss(0, market_err)
        self.t = now

    def price(self) -> float:
        return min(max(self.p + self.m_err, 0.01), 0.99)


@dataclass
class SimPos:
    mk: SimMarket
    side: int         # 0 = YES, 1 = NO
    shares: float
    cost: float
    entry_fv: float
    fv: float
    last_eval: int
    last_eval_mid: float


def _side_price(price_yes: float, side: int) -> float:
    return price_yes if side == 0 else 1 - price_yes


def simulate_run(seed: int, *, months: int, skill: float, claude_noise: float, market_err: float, eval_cost: float,
                 budget: float, spread: float, vol: float, cfg: Config) -> dict:
    rng = random.Random(seed)
    cash = peak = cfg.initial_bankroll
    positions: list[SimPos] = []
    monthly_equity, trades, wins, api_cost = [], 0, 0, 0.0
    spent_today, halted_at = 0.0, None
    half = spread / 2

    def estimate(mk: SimMarket) -> float:
        price = mk.price()
        return min(max(price + skill * (mk.p - price) + mk.c_noise + rng.gauss(0, 0.01), 0.01), 0.99)

    def equity() -> float:
        return cash + sum(p.shares * max(_side_price(p.mk.price(), p.side) - half, 0) for p in positions)

    for hour in range(months * HOURS_PER_MONTH):
        if hour % 24 == 0:
            spent_today = 0.0
        if halted_at is None:
            # --- revisar posiciones ---
            for pos in list(positions):
                pos.mk.advance(hour, rng, vol, market_err)
                if hour >= pos.mk.end:  # resuelve
                    won = (rng.random() < pos.mk.p) == (pos.side == 0)
                    cash += pos.shares if won else 0.0
                    trades += 1
                    wins += won
                    positions.remove(pos)
                    continue
                mid = _side_price(pos.mk.price(), pos.side)
                exit_now = pos.mk.end - hour < cfg.exit_hours_before_resolution
                if not exit_now:
                    if (hour - pos.last_eval >= cfg.position_reeval_minutes / 60
                            or abs(mid - pos.last_eval_mid) >= cfg.reeval_price_move) and spent_today < budget:
                        spent_today += eval_cost
                        api_cost += eval_cost
                        f = estimate(pos.mk)
                        pos.fv = f if pos.side == 0 else 1 - f
                        pos.last_eval, pos.last_eval_mid = hour, mid
                    exit_now = (pos.entry_fv - pos.fv > cfg.fv_move_exit) or (pos.fv - mid < cfg.exit_edge)
                if exit_now:
                    proceeds = pos.shares * max(mid - half, 0)
                    cash += proceeds
                    trades += 1
                    wins += proceeds > pos.cost
                    positions.remove(pos)

            eq = equity()
            peak = max(peak, eq)
            if risk.drawdown_breached(eq, peak, cfg):
                halted_at = hour

        # --- nuevas entradas (hasta 6 ciclos x 4 evaluaciones por hora, limitado por presupuesto) ---
        evals = 0
        while (halted_at is None and len(positions) < cfg.max_open_positions
               and spent_today < budget and evals < 24):
            evals += 1
            hours_left = math.exp(rng.uniform(math.log(cfg.min_hours_to_resolution + 1),
                                              math.log(cfg.max_days_to_resolution * 24)))
            mk = SimMarket(p=rng.uniform(0.08, 0.92), m_err=rng.gauss(0, market_err),
                           c_noise=rng.gauss(0, claude_noise), end=hour + int(hours_left), t=hour)
            price_yes = mk.price()
            if not (cfg.min_price <= price_yes <= cfg.max_price):
                continue
            spent_today += eval_cost
            api_cost += eval_cost
            fair = estimate(mk)
            choice = risk.best_side(fair, price_yes + half, (1 - price_yes) + half, cfg.taker_fee)
            eq = equity()
            stake, _ = risk.position_size_usd(eq, cash, choice.fair_value, choice.price, cfg)
            blockers = risk.entry_blockers(edge=choice.edge, confidence="high", resolution_clear=True,
                                           open_positions=len(positions), halted=False, cfg=cfg)
            if blockers or stake < 1.0 or stake / choice.price < 5:
                continue
            cash -= stake
            positions.append(SimPos(mk, choice.outcome_index, stake / choice.price, stake,
                                    choice.fair_value, choice.fair_value, hour, choice.price - half))

        if (hour + 1) % HOURS_PER_MONTH == 0:
            for pos in positions:
                pos.mk.advance(hour, rng, vol, market_err)
            monthly_equity.append(equity())

    return {"monthly": monthly_equity, "trades": trades, "wins": wins, "api_cost": api_cost,
            "halted_month": None if halted_at is None else halted_at // HOURS_PER_MONTH + 1}


def summarize(results: list[dict], months: int, vps_monthly: float, bankroll: float) -> dict:
    def pct(xs, q):
        xs = sorted(xs)
        return xs[min(int(q * len(xs)), len(xs) - 1)]

    by_month = [[r["monthly"][m] for r in results] for m in range(months)]
    api = statistics.mean(r["api_cost"] for r in results)
    final = by_month[-1]
    return {
        "median": [statistics.median(m) for m in by_month],
        "p10": [pct(m, 0.10) for m in by_month],
        "p90": [pct(m, 0.90) for m in by_month],
        "halt_pct": sum(r["halted_month"] is not None for r in results) / len(results),
        "trades_per_month": statistics.mean(r["trades"] for r in results) / months,
        "win_rate": sum(r["wins"] for r in results) / max(1, sum(r["trades"] for r in results)),
        "api_per_month": api / months,
        "median_profit": statistics.median(final) - bankroll,
        "costs": api + vps_monthly * months,
        "p_pays_for_itself": sum((f - bankroll) >= (r["api_cost"] + vps_monthly * months)
                                 for f, r in zip(final, results)) / len(results),
    }


def main(argv: list[str] | None = None) -> None:
    ap = argparse.ArgumentParser(description="Simulación Monte Carlo de Polybot (supuestos, no resultados reales)")
    ap.add_argument("--runs", type=int, default=200)
    ap.add_argument("--months", type=int, default=12)
    ap.add_argument("--market-err", type=float, default=0.04, help="error típico del precio de mercado")
    ap.add_argument("--skill", type=float, action="append", help="fracción del error del mercado que detecta Claude (repetible)")
    ap.add_argument("--claude-noise", type=float, default=0.05, help="ruido propio de Claude")
    ap.add_argument("--model", choices=list(EVAL_COST), action="append")
    ap.add_argument("--budget", type=float, help="presupuesto diario de API en $ (por defecto según modelo)")
    ap.add_argument("--spread", type=float, default=0.02)
    ap.add_argument("--vps", type=float, default=6.0)
    args = ap.parse_args(argv)

    cfg = replace(Config())
    models = args.model or ["opus", "haiku"]
    skills = args.skill or [0.0, 0.25, 0.5, 0.75]
    labels = {0.0: "no sabe más que el mercado", 0.25: "detecta 1/4 del error",
              0.5: "detecta la mitad", 0.75: "detecta 3/4", 1.0: "detecta todo"}
    default_budget = {"opus": 3.0, "sonnet": 1.5, "haiku": 0.5}
    print(f"{args.runs} simulaciones x {args.months} meses · $50 iniciales · error del mercado {args.market_err:.3f} · ruido de Claude {args.claude_noise:.3f}\n")
    for model in models:
        budget = args.budget or default_budget[model]
        print(f"=== {model}: ~${EVAL_COST[model]:.2f}/evaluación, presupuesto ${budget:.2f}/día, VPS ${args.vps:.0f}/mes ===")
        print(f"{'Habilidad de Claude':<34}{'mes1':>7}{'mes3':>7}{'mes6':>7}{'mes12':>8}  {'p10-p90 mes12':>15}  "
              f"{'parada40%':>9}  {'trades/mes':>10}  {'API/mes':>8}  {'se paga':>7}")
        for sk in skills:
            res = [simulate_run(seed, months=args.months, skill=sk, claude_noise=args.claude_noise, market_err=args.market_err,
                                eval_cost=EVAL_COST[model], budget=budget, spread=args.spread, vol=0.25, cfg=cfg)
                   for seed in range(args.runs)]
            s = summarize(res, args.months, args.vps, cfg.initial_bankroll)
            med = s["median"]
            m = lambda i: f"${med[min(i, len(med) - 1)]:.0f}"  # noqa: E731
            label = f"{sk:.2f} ({labels.get(sk, '')})"
            print(f"{label:<34}{m(0):>7}{m(2):>7}{m(5):>7}{m(11):>8}  "
                  f"{'$%.0f-$%.0f' % (s['p10'][-1], s['p90'][-1]):>15}  {s['halt_pct'] * 100:>8.0f}%  "
                  f"{s['trades_per_month']:>10.1f}  ${s['api_per_month']:>7.0f}  {s['p_pays_for_itself'] * 100:>6.0f}%")
        print()


if __name__ == "__main__":
    main()
