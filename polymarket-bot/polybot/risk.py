"""Gestión de riesgo: edge, Kelly fraccional y reglas duras.

Este módulo es la única puerta de entrada a una operación. Claude solo da una
probabilidad; el tamaño y el permiso para operar se deciden aquí, con código
determinista que no se puede saltar.
"""

from __future__ import annotations

from dataclasses import dataclass

from .config import HARD_LIMITS, Config

CONFIDENCE_RANK = {"low": 0, "medium": 1, "high": 2}


def kelly_fraction(prob_win: float, price: float) -> float:
    """Fracción de Kelly completa para comprar un token binario a `price` que paga $1.

    Con probabilidad p de ganar y cuota neta b = (1 - price) / price:
        f* = (b·p - (1 - p)) / b = (p - price) / (1 - price)
    """
    if not (0 < price < 1) or not (0 <= prob_win <= 1):
        return 0.0
    return max(0.0, (prob_win - price) / (1 - price))


def taker_fee(price: float, rate: float, exponent: float = 1.0) -> float:
    """Comisión taker de Polymarket por share, en $: precio × tasa × (precio·(1−precio))^exponente.

    Máxima al 50% (con tasa 0.05 y exponente 1: 1,25% del importe) y casi nula en los extremos.
    """
    if rate <= 0 or not (0 < price < 1):
        return 0.0
    return price * rate * (price * (1 - price)) ** exponent


@dataclass
class SideChoice:
    outcome_index: int
    fair_value: float  # probabilidad estimada de ESTE resultado
    price: float       # precio de ejecución esperado (ask) de ESTE resultado
    edge: float        # fair_value - price - comisión


def best_side(fair_yes: float, ask_yes: float | None, ask_no: float | None, fee: float = 0.0,
              fee_rate: float = 0.0, fee_exponent: float = 1.0) -> SideChoice | None:
    """Elige el lado con más edge NETO de comisiones. `fair_yes` es la probabilidad del resultado 0."""
    options = []
    if ask_yes is not None:
        cost = fee + taker_fee(ask_yes, fee_rate, fee_exponent)
        options.append(SideChoice(0, fair_yes, ask_yes, fair_yes - ask_yes - cost))
    if ask_no is not None:
        cost = fee + taker_fee(ask_no, fee_rate, fee_exponent)
        options.append(SideChoice(1, 1 - fair_yes, ask_no, (1 - fair_yes) - ask_no - cost))
    return max(options, key=lambda s: s.edge) if options else None


def position_size_usd(equity: float, cash: float, prob_win: float, price: float, cfg: Config) -> tuple[float, dict]:
    """Tamaño en dólares: 1/4 Kelly con tope duro del 6% del bankroll actual."""
    full = kelly_fraction(prob_win, price)
    frac = min(cfg.kelly_fraction, HARD_LIMITS["kelly_fraction"])
    cap = min(cfg.max_position_pct, HARD_LIMITS["max_position_pct"])
    pct = min(full * frac, cap)
    stake = max(0.0, min(pct * equity, cash))
    return round(stake, 2), {"kelly_full": round(full, 4), "kelly_used": round(full * frac, 4), "pct_bankroll": round(pct, 4)}


def entry_blockers(
    *,
    edge: float,
    confidence: str,
    resolution_clear: bool,
    open_positions: int,
    halted: bool,
    cfg: Config,
) -> list[str]:
    """Motivos que impiden entrar. Lista vacía = permitido por las reglas."""
    reasons = []
    if halted:
        reasons.append("trading detenido (drawdown) — requiere aprobación humana")
    if open_positions >= min(cfg.max_open_positions, HARD_LIMITS["max_open_positions"]):
        reasons.append(f"ya hay {open_positions} posiciones abiertas (máx. {cfg.max_open_positions})")
    if edge <= max(cfg.min_edge, HARD_LIMITS["min_edge"]):
        reasons.append(f"edge {edge * 100:.1f} pp <= {cfg.min_edge * 100:.0f} pp")
    if CONFIDENCE_RANK.get(confidence, 0) < CONFIDENCE_RANK[cfg.min_confidence]:
        reasons.append(f"confianza '{confidence}' < '{cfg.min_confidence}'")
    if not resolution_clear:
        reasons.append("fuente de resolución no clara/oficial según el análisis")
    return reasons


def drawdown(equity: float, peak: float) -> float:
    return 0.0 if peak <= 0 else max(0.0, (peak - equity) / peak)


def drawdown_breached(equity: float, peak: float, cfg: Config) -> bool:
    return drawdown(equity, peak) >= min(cfg.max_drawdown, HARD_LIMITS["max_drawdown"])
