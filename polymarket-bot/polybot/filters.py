"""Filtro de mercados elegibles (paso 2 del loop)."""

from __future__ import annotations

import re
from datetime import datetime

from .config import Config
from .polymarket import Market
from .weather import is_weather_market

# Pistas de que la descripción nombra una fuente de resolución concreta.
_SOURCE_HINTS = re.compile(
    r"resolution source|resolve[sd]? (?:according to|based on|per)|according to (?:the )?official|"
    r"as reported by|official (?:data|results|website|announcement)|https?://",
    re.IGNORECASE,
)


def has_resolution_source(m: Market) -> bool:
    """Chequeo determinista previo. Claude confirma después que la fuente es clara y oficial."""
    return bool(m.resolution_source.strip()) or bool(_SOURCE_HINTS.search(m.description))


def rejection_reason(m: Market, cfg: Config, now: datetime | None = None) -> str | None:
    """Devuelve el motivo por el que el mercado NO es elegible, o None si pasa."""
    if m.closed or not m.accepting_orders:
        return "cerrado o sin libro de órdenes"
    if m.liquidity <= cfg.min_liquidity:
        return f"liquidez ${m.liquidity:,.0f} <= ${cfg.min_liquidity:,.0f}"
    if m.volume_24h < cfg.min_volume_24h:
        return f"volumen 24h ${m.volume_24h:,.0f} < ${cfg.min_volume_24h:,.0f}"
    hours = m.hours_to_resolution(now)
    if hours is None:
        return "fecha de resolución desconocida"
    if hours < cfg.min_hours_to_resolution:
        return f"resuelve en {hours:.1f} h (< {cfg.min_hours_to_resolution:g} h)"
    if hours > cfg.max_days_to_resolution * 24:
        return f"resuelve en {hours / 24:.0f} días (> {cfg.max_days_to_resolution:g})"
    if not has_resolution_source(m):
        return "fuente de resolución no identificable"
    if not (cfg.min_price <= m.prices[0] <= cfg.max_price):
        return f"precio extremo ({m.prices[0]:.3f})"
    return None


def eligible_markets(markets: list[Market], cfg: Config, now: datetime | None = None) -> list[Market]:
    ok = [m for m in markets if rejection_reason(m, cfg, now) is None]
    if cfg.fast_mode:
        # Primero mercados del tiempo (datos oficiales, posible ventaja real) y, dentro de cada
        # grupo, los que resuelven antes: el capital vuelve antes y se puede reinvertir.
        ok.sort(key=lambda m: (not is_weather_market(m), m.hours_to_resolution(now) or 0.0))
    else:
        # Lo más líquido y activo: mejor ejecución y más información pública.
        ok.sort(key=lambda m: (m.volume_24h, m.liquidity), reverse=True)
    return ok
