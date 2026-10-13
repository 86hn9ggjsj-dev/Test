"""Acceso a datos de Polymarket: Gamma API (mercados) y CLOB (libros de órdenes).

Solo lectura y sin autenticación. Las órdenes reales se firman en executor.py.
"""

from __future__ import annotations

import json
import logging
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone

import requests

GAMMA_URL = "https://gamma-api.polymarket.com"
CLOB_URL = "https://clob.polymarket.com"

log = logging.getLogger("polybot.data")


@dataclass
class Market:
    id: str
    question: str
    slug: str
    outcomes: list[str]          # siempre 2 (mercados binarios)
    token_ids: list[str]         # token del CLOB por resultado
    prices: list[float]          # precio indicativo de Gamma por resultado
    end_date: datetime | None
    liquidity: float
    volume_24h: float
    description: str = ""
    resolution_source: str = ""
    accepting_orders: bool = True
    closed: bool = False
    min_order_size: float = 5.0
    tick_size: float = 0.01
    neg_risk: bool = False
    fee_rate: float = 0.0        # comisión taker: precio × tasa × (precio·(1−precio))^exponente por share
    fee_exponent: float = 1.0
    raw: dict = field(default_factory=dict, repr=False)

    def hours_to_resolution(self, now: datetime | None = None) -> float | None:
        if self.end_date is None:
            return None
        now = now or datetime.now(timezone.utc)
        return (self.end_date - now).total_seconds() / 3600

    @property
    def url(self) -> str:
        return f"https://polymarket.com/market/{self.slug}" if self.slug else ""

    def resolved_outcome(self) -> int | None:
        """Índice del resultado ganador si el mercado está cerrado y resuelto."""
        if not self.closed:
            return None
        for i, p in enumerate(self.prices):
            if p >= 0.99:
                return i
        return None


@dataclass
class BookLevel:
    price: float
    size: float


@dataclass
class OrderBook:
    token_id: str
    bids: list[BookLevel]  # ordenados de mejor (más alto) a peor
    asks: list[BookLevel]  # ordenados de mejor (más bajo) a peor

    @property
    def best_bid(self) -> float | None:
        return self.bids[0].price if self.bids else None

    @property
    def best_ask(self) -> float | None:
        return self.asks[0].price if self.asks else None

    @property
    def mid(self) -> float | None:
        if self.best_bid is None or self.best_ask is None:
            return None
        return (self.best_bid + self.best_ask) / 2

    def fill_buy(self, usd: float) -> tuple[float, float] | None:
        """Simula comprar `usd` dólares barriendo los asks. Devuelve (shares, precio medio)."""
        remaining, shares = usd, 0.0
        for level in self.asks:
            cost = level.price * level.size
            if cost >= remaining:
                shares += remaining / level.price
                remaining = 0
                break
            shares += level.size
            remaining -= cost
        if remaining > 1e-9 or shares <= 0:
            return None  # profundidad insuficiente
        return shares, usd / shares

    def fill_sell(self, shares: float) -> tuple[float, float] | None:
        """Simula vender `shares` barriendo los bids. Devuelve (dólares, precio medio)."""
        remaining, proceeds = shares, 0.0
        for level in self.bids:
            take = min(level.size, remaining)
            proceeds += take * level.price
            remaining -= take
            if remaining <= 1e-9:
                break
        if remaining > 1e-9:
            return None
        return proceeds, proceeds / shares


def _json_list(value) -> list:
    if isinstance(value, list):
        return value
    if isinstance(value, str) and value:
        try:
            parsed = json.loads(value)
            return parsed if isinstance(parsed, list) else []
        except json.JSONDecodeError:
            return []
    return []


def _parse_date(value) -> datetime | None:
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _float(value, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def parse_market(raw: dict) -> Market | None:
    """Convierte un mercado de Gamma. Devuelve None si no es binario o le faltan datos."""
    outcomes = _json_list(raw.get("outcomes"))
    token_ids = [str(t) for t in _json_list(raw.get("clobTokenIds"))]
    prices = [_float(p) for p in _json_list(raw.get("outcomePrices"))]
    if len(outcomes) != 2 or len(token_ids) != 2 or len(prices) != 2:
        return None
    fee_rate, fee_exp = 0.0, 1.0
    if raw.get("feesEnabled"):
        sched = raw.get("feeSchedule") or {}
        # Sin tabla explícita, asumimos la tasa habitual (conservador: mejor descontar de más).
        fee_rate = _float(sched.get("rate"), 0.05) if isinstance(sched, dict) else 0.05
        fee_exp = _float(sched.get("exponent"), 1.0) if isinstance(sched, dict) else 1.0
    return Market(
        id=str(raw.get("id", "")),
        question=str(raw.get("question", "")).strip(),
        slug=str(raw.get("slug", "")),
        outcomes=[str(o) for o in outcomes],
        token_ids=token_ids,
        prices=prices,
        end_date=_parse_date(raw.get("endDate") or raw.get("endDateIso")),
        liquidity=_float(raw.get("liquidityNum", raw.get("liquidity"))),
        volume_24h=_float(raw.get("volume24hr")),
        description=str(raw.get("description") or ""),
        resolution_source=str(raw.get("resolutionSource") or ""),
        accepting_orders=bool(raw.get("acceptingOrders", True)) and bool(raw.get("enableOrderBook", True)),
        closed=bool(raw.get("closed", False)),
        min_order_size=_float(raw.get("orderMinSize"), 5.0) or 5.0,
        tick_size=_float(raw.get("orderPriceMinTickSize"), 0.01) or 0.01,
        neg_risk=bool(raw.get("negRisk", False)),
        fee_rate=fee_rate,
        fee_exponent=fee_exp,
        raw=raw,
    )


def parse_book(token_id: str, raw: dict) -> OrderBook:
    def levels(items) -> list[BookLevel]:
        out = [BookLevel(_float(i.get("price")), _float(i.get("size"))) for i in items or []]
        return [lv for lv in out if lv.price > 0 and lv.size > 0]

    bids = sorted(levels(raw.get("bids")), key=lambda lv: lv.price, reverse=True)
    asks = sorted(levels(raw.get("asks")), key=lambda lv: lv.price)
    return OrderBook(token_id=token_id, bids=bids, asks=asks)


class PolymarketData:
    """Cliente HTTP de solo lectura con reintentos sencillos."""

    def __init__(self, session: requests.Session | None = None, timeout: float = 15.0):
        self.session = session or requests.Session()
        self.session.headers.setdefault("User-Agent", "polybot/1.0")
        self.timeout = timeout

    def _get(self, url: str, params: dict | None = None, retries: int = 3):
        last_exc: Exception | None = None
        for attempt in range(retries):
            try:
                resp = self.session.get(url, params=params, timeout=self.timeout)
                if resp.status_code == 429 or resp.status_code >= 500:
                    raise requests.HTTPError(f"HTTP {resp.status_code}", response=resp)
                resp.raise_for_status()
                return resp.json()
            except (requests.RequestException, ValueError) as exc:
                last_exc = exc
                time.sleep(2 ** attempt)
        raise RuntimeError(f"GET {url} falló tras {retries} intentos: {last_exc}")

    def fetch_active_markets(self, max_markets: int = 1000, page_size: int = 100) -> list[Market]:
        markets: list[Market] = []
        offset = 0
        while offset < max_markets:
            params = {
                "active": "true",
                "closed": "false",
                "archived": "false",
                "limit": min(page_size, max_markets - offset),
                "offset": offset,
                "order": "volume24hr",
                "ascending": "false",
            }
            try:
                page = self._get(f"{GAMMA_URL}/markets", params)
            except RuntimeError:
                if offset > 0:
                    break  # nos quedamos con lo ya descargado
                log.warning("Falló la petición ordenada por volumen; reintento sin ordenar")
                params.pop("order")
                params.pop("ascending")
                page = self._get(f"{GAMMA_URL}/markets", params)
            if not isinstance(page, list) or not page:
                break
            for raw in page:
                m = parse_market(raw)
                if m:
                    markets.append(m)
            offset += len(page)
            if len(page) < params["limit"]:
                break
        log.info("Escaneados %d mercados binarios de Gamma (offset final %d)", len(markets), offset)
        return markets

    def fetch_market(self, market_id: str) -> Market | None:
        raw = self._get(f"{GAMMA_URL}/markets/{market_id}")
        return parse_market(raw) if isinstance(raw, dict) else None

    def order_book(self, token_id: str) -> OrderBook:
        raw = self._get(f"{CLOB_URL}/book", {"token_id": token_id})
        return parse_book(token_id, raw if isinstance(raw, dict) else {})
