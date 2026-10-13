"""Ejecución de órdenes.

PaperExecutor  simula el fill barriendo el libro de órdenes REAL del CLOB
               (precio medio realista, rechaza si no hay profundidad).
LiveExecutor   firma y envía órdenes FOK (fill-or-kill) con precio límite
               usando py-clob-client, la librería oficial de Polymarket.
"""

from __future__ import annotations

import logging
import math
from dataclasses import dataclass, field

from .config import Config
from .polymarket import CLOB_URL, OrderBook

log = logging.getLogger("polybot.exec")


@dataclass
class Fill:
    shares: float
    avg_price: float
    usd: float
    order_id: str = ""
    raw: dict = field(default_factory=dict)


def _ceil_tick(price: float, tick: float) -> float:
    return round(math.ceil(price / tick - 1e-9) * tick, 6)


def _floor_tick(price: float, tick: float) -> float:
    return round(math.floor(price / tick + 1e-9) * tick, 6)


def buy_limit(expected_price: float, tick: float, slippage: float) -> float:
    return min(1 - tick, _ceil_tick(expected_price + slippage, tick))


def sell_limit(expected_price: float, tick: float, slippage: float) -> float:
    return max(tick, _floor_tick(expected_price - slippage, tick))


class PaperExecutor:
    mode = "paper"

    def __init__(self, cfg: Config):
        self.cfg = cfg

    def buy(self, token_id: str, usd: float, book: OrderBook, tick: float, neg_risk: bool) -> Fill | None:
        sim = book.fill_buy(usd)
        if sim is None:
            log.info("[paper] sin profundidad suficiente para comprar $%.2f", usd)
            return None
        shares, avg = sim
        return Fill(shares=round(shares, 4), avg_price=avg, usd=usd, order_id="paper")

    def sell(self, token_id: str, shares: float, book: OrderBook, tick: float, neg_risk: bool) -> Fill | None:
        sim = book.fill_sell(shares)
        if sim is None:
            log.info("[paper] sin profundidad suficiente para vender %.2f shares", shares)
            return None
        proceeds, avg = sim
        return Fill(shares=shares, avg_price=avg, usd=proceeds, order_id="paper")

    def wallet_cash(self) -> float | None:
        return None


class LiveExecutor:
    mode = "live"

    def __init__(self, cfg: Config):
        from py_clob_client.client import ClobClient

        self.cfg = cfg
        self.client = ClobClient(
            CLOB_URL,
            chain_id=137,  # Polygon
            key=cfg.private_key,
            signature_type=cfg.signature_type,
            funder=cfg.funder or None,
        )
        self.client.set_api_creds(self.client.create_or_derive_api_creds())
        log.warning("LIVE TRADING ACTIVO — las órdenes usan dinero real")

    def _post_market(self, token_id: str, amount: float, side: str, limit: float) -> dict:
        from py_clob_client.clob_types import MarketOrderArgs, OrderType

        args = MarketOrderArgs(token_id=token_id, amount=amount, side=side, price=limit, order_type=OrderType.FOK)
        signed = self.client.create_market_order(args)
        resp = self.client.post_order(signed, OrderType.FOK)
        return resp if isinstance(resp, dict) else {"raw": resp}

    def buy(self, token_id: str, usd: float, book: OrderBook, tick: float, neg_risk: bool) -> Fill | None:
        expected = book.fill_buy(usd)
        if expected is None:
            return None
        limit = buy_limit(expected[1], tick, self.cfg.max_slippage)
        try:
            resp = self._post_market(token_id, round(usd, 2), "BUY", limit)
        except Exception as exc:  # la librería lanza Exception genérica
            log.error("Orden BUY rechazada: %s", exc)
            return None
        if not resp.get("success", False):
            log.error("Orden BUY no ejecutada: %s", resp)
            return None
        # En una compra, makingAmount = USDC pagado y takingAmount = shares recibidas.
        spent = float(resp.get("makingAmount") or usd)
        shares = float(resp.get("takingAmount") or expected[0])
        return Fill(shares=shares, avg_price=spent / shares, usd=spent, order_id=str(resp.get("orderID", "")), raw=resp)

    def sell(self, token_id: str, shares: float, book: OrderBook, tick: float, neg_risk: bool) -> Fill | None:
        expected = book.fill_sell(shares)
        if expected is None:
            return None
        limit = sell_limit(expected[1], tick, self.cfg.max_slippage)
        try:
            resp = self._post_market(token_id, round(shares, 2), "SELL", limit)
        except Exception as exc:
            log.error("Orden SELL rechazada: %s", exc)
            return None
        if not resp.get("success", False):
            log.error("Orden SELL no ejecutada: %s", resp)
            return None
        # En una venta, makingAmount = shares entregadas y takingAmount = USDC recibido.
        sold = float(resp.get("makingAmount") or shares)
        received = float(resp.get("takingAmount") or expected[0])
        return Fill(shares=sold, avg_price=received / sold, usd=received, order_id=str(resp.get("orderID", "")), raw=resp)

    def wallet_cash(self) -> float | None:
        from py_clob_client.clob_types import AssetType, BalanceAllowanceParams

        try:
            resp = self.client.get_balance_allowance(
                BalanceAllowanceParams(asset_type=AssetType.COLLATERAL, signature_type=self.cfg.signature_type)
            )
            return float(resp.get("balance", 0)) / 1e6  # USDC tiene 6 decimales
        except Exception as exc:
            log.error("No se pudo leer el saldo de la wallet: %s", exc)
            return None


def make_executor(cfg: Config):
    return LiveExecutor(cfg) if cfg.mode == "live" else PaperExecutor(cfg)
