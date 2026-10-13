"""Un ciclo del agente (se ejecuta cada 10 minutos).

  1. Sincroniza caja (live), liquida mercados resueltos y valora posiciones
  2. Comprueba el drawdown: al 40% se detiene y escribe el post-mortem
  3. Escanea hasta 1.000 mercados (Gamma) y los filtra
  4. Revisa posiciones abiertas: sale si el edge desaparece, el fair value se
     mueve > 5 pp en contra o el mercado está a punto de resolver
  5. Equipo de agentes sobre los candidatos:
       SCOUT (filtro) -> TRIAGE (criba barata por lotes) -> ANALISTA (fair value a fondo)
       -> ESCÉPTICO (segunda opinión, puede vetar) -> RIESGO (Kelly, reglas duras, orden)
  6. Guarda estado, logs y resumen
"""

from __future__ import annotations

import logging
from collections import Counter
from datetime import datetime, timedelta, timezone

from . import filters, risk
from .agents import Skeptic, Triage
from .brain import Brain, Estimate
from .config import Config
from .executor import make_executor
from .journal import Journal
from .polymarket import Market, OrderBook, PolymarketData
from .sharp import OddsClient, SharpBook
from .postmortem import write_postmortem
from .state import BotState, ClosedTrade, Position, now_iso, today
from .weather import is_weather_market

log = logging.getLogger("polybot.agent")


def _minutes_since(iso: str) -> float:
    if not iso:
        return float("inf")
    return (datetime.now(timezone.utc) - datetime.fromisoformat(iso)).total_seconds() / 60


class Agent:
    def __init__(self, cfg: Config, *, data=None, brain=None, executor=None, journal=None, state=None,
                 triage=None, skeptic=None, sharp=None):
        self.cfg = cfg
        self.data = data or PolymarketData()
        self.brain = brain or Brain(cfg)
        self.triage = triage if triage is not None else (Triage(cfg) if cfg.triage_enabled else None)
        self.skeptic = skeptic if skeptic is not None else (Skeptic(cfg) if cfg.skeptic_enabled else None)
        if sharp is None and cfg.sharp_enabled:
            sports = [x.strip() for x in cfg.sharp_sports.split(",") if x.strip()]
            sharp = SharpBook(OddsClient(cfg.odds_api_key, bookmaker=cfg.sharp_bookmaker), sports,
                              cfg.sharp_markets, cfg.sharp_refresh_minutes)
        self.sharp = sharp
        self.executor = executor or make_executor(cfg)
        self.journal = journal or Journal(cfg.data_dir)
        self.state = state or BotState.load_or_new(cfg.state_path, cfg.mode, cfg.initial_bankroll)
        if self.state.mode != cfg.mode:
            raise ValueError(f"El estado {cfg.state_path} es de modo {self.state.mode}, no {cfg.mode}")

    # ------------------------------------------------------------------ ciclo
    def run_cycle(self) -> None:
        st = self.state
        st.cycles += 1
        log.info("──── Ciclo %d (%s) ────", st.cycles, self.cfg.mode.upper())

        self._sync_wallet()
        self._refresh_positions()
        st.update_peak()

        if not st.halted and risk.drawdown_breached(st.equity, st.peak_equity, self.cfg):
            self._halt()
        if st.halted:
            log.warning("Trading DETENIDO (%s). Esperando aprobación humana: python -m polybot approve", st.halt_reason)
            self._finish()
            return

        try:
            markets = self.data.fetch_active_markets(self.cfg.max_markets_scan)
        except Exception as exc:
            log.error("No se pudo escanear Gamma: %s", exc)
            self.journal.event(kind="scan_error", error=str(exc))
            markets = None

        if self.sharp is not None and markets is not None:
            try:
                self.sharp.refresh_if_stale()
            except Exception as exc:
                log.warning("No se pudieron refrescar las cuotas: %s", exc)

        # Las posiciones se revisan aunque el escaneo falle (cada una se consulta por separado).
        self._review_positions({m.id: m for m in markets or []})
        if markets is not None:
            self._find_entries(markets)
        self._finish()

    # -------------------------------------------------------------- helpers
    def _budget_left(self) -> bool:
        return self.state.api_cost_today() < self.cfg.daily_api_budget_usd

    def _stat(self, agent: str, key: str, inc: float = 1, last: str | None = None) -> None:
        """Contadores por agente para el panel."""
        s = self.state.agent_stats.setdefault(agent, {})
        s[key] = s.get(key, 0) + inc
        if last is not None:
            s["last"] = last[:140]
            s["last_at"] = now_iso()

    def _books(self, m: Market) -> tuple[OrderBook, OrderBook]:
        return self.data.order_book(m.token_ids[0]), self.data.order_book(m.token_ids[1])

    def _estimate(self, m: Market, ask0: float | None, ask1: float | None) -> Estimate | None:
        est = self.brain.estimate(m, ask0, ask1)
        self.state.add_api_cost(getattr(self.brain, "last_cost", 0.0) or 0.0)
        return est

    def _sync_wallet(self) -> None:
        """Live: la caja del bot nunca supera el saldo real, y nunca crece por depósitos externos."""
        wallet = self.executor.wallet_cash()
        if wallet is not None and wallet < self.state.cash - 0.01:
            log.warning("Saldo wallet $%.2f < caja interna $%.2f: ajusto a la baja", wallet, self.state.cash)
            self.journal.event(kind="cash_adjust", internal=self.state.cash, wallet=wallet)
            self.state.cash = wallet

    # ------------------------------------------------- posiciones existentes
    def _refresh_positions(self) -> None:
        for mid, p in list(self.state.positions.items()):
            try:
                m = self.data.fetch_market(mid)
            except Exception as exc:
                log.warning("No se pudo refrescar el mercado %s: %s", mid, exc)
                continue
            if m is None:
                continue
            winner = m.resolved_outcome()
            if winner is not None:
                self._settle(p, won=(winner == p.outcome_index))
                continue
            if m.closed:
                continue  # cerrado pero aún sin resolver: mantener valoración
            try:
                book = self.data.order_book(p.token_id)
                p.last_price = book.best_bid if book.best_bid is not None else (book.mid or p.last_price)
            except Exception as exc:
                log.warning("No se pudo leer el libro de %s: %s", mid, exc)

    def _settle(self, p: Position, won: bool) -> None:
        payout = p.shares if won else 0.0
        self.state.cash += payout
        self._close(p, exit_price=1.0 if won else 0.0, proceeds=payout, reason="resolved_win" if won else "resolved_loss")
        if self.cfg.mode == "live" and won:
            log.warning("Mercado %s resuelto a favor: reclama (redeem) las ganancias en polymarket.com", p.market_id)

    def _close(self, p: Position, exit_price: float, proceeds: float, reason: str) -> None:
        trade = ClosedTrade(
            market_id=p.market_id, question=p.question, outcome=p.outcome, shares=p.shares,
            entry_price=p.entry_price, exit_price=exit_price, cost=p.cost, proceeds=proceeds,
            pnl=proceeds - p.cost, reason=reason, opened_at=p.opened_at, closed_at=now_iso(),
        )
        self.state.closed_trades.append(trade)
        self.state.positions.pop(p.market_id, None)
        self.journal.trade(action="CLOSE", mode=self.cfg.mode, **trade.__dict__)
        log.info("CERRADA %s [%s] pnl $%+.2f (%s)", p.question[:60], p.outcome, trade.pnl, reason)

    def _review_positions(self, by_id: dict[str, Market]) -> None:
        for mid, p in list(self.state.positions.items()):
            try:
                self._review_one(p, by_id.get(mid))
            except Exception as exc:
                log.exception("Error revisando la posición %s: %s", mid, exc)

    def _review_one(self, p: Position, m: Market | None) -> None:
        m = m or self.data.fetch_market(p.market_id)
        if m is None:
            return
        book0, book1 = self._books(m)
        held = book0 if p.outcome_index == 0 else book1
        mid = held.mid if held.mid is not None else p.last_price
        hours = m.hours_to_resolution()
        reason = None

        if hours is not None and hours < self.cfg.exit_hours_before_resolution:
            reason = "near_resolution"
        else:
            stale = _minutes_since(p.last_estimate_at) >= self.cfg.position_reeval_minutes
            moved = abs(mid - p.last_estimate_price) >= self.cfg.reeval_price_move
            if p.source == "sharp" and self.sharp is not None:
                fair, _ = self.sharp.fair_yes(m)  # posiciones de CUOTAS: se revisan con Pinnacle, sin gastar en Claude
                if fair is not None:
                    new_fv = fair if p.outcome_index == 0 else 1 - fair
                    a = self.cfg.fv_smoothing
                    p.last_fair_value = a * p.last_fair_value + (1 - a) * new_fv
                    p.last_estimate_at, p.last_estimate_price = now_iso(), mid
            elif (stale or moved) and self._budget_left():
                est = self._estimate(m, book0.best_ask, book1.best_ask)
                if est is not None:
                    new_fv = est.fair_yes if p.outcome_index == 0 else 1 - est.fair_yes
                    # Media móvil: una sola re-estimación con ruido no dispara una salida.
                    a = self.cfg.fv_smoothing
                    p.last_fair_value = a * p.last_fair_value + (1 - a) * new_fv
                    p.last_estimate_at = now_iso()
                    p.last_estimate_price = mid
            if p.entry_fair_value - p.last_fair_value > self.cfg.fv_move_exit:
                reason = "fair_value_moved_against"
            elif p.last_fair_value - mid < self.cfg.exit_edge:
                reason = "edge_gone"

        self.journal.decision(
            kind="review", market_id=p.market_id, question=p.question, outcome=p.outcome,
            entry_fv=p.entry_fair_value, fair_value=p.last_fair_value, mid=mid,
            edge_now=round(p.last_fair_value - mid, 4), hours_to_resolution=hours,
            decision="EXIT" if reason else "HOLD", reason=reason,
        )
        if reason:
            self._exit(p, held, reason)

    def _exit(self, p: Position, book: OrderBook, reason: str) -> None:
        fill = self.executor.sell(p.token_id, p.shares, book, p.tick_size, p.neg_risk,
                                  fee_rate=p.fee_rate, fee_exponent=p.fee_exponent)
        if fill is None:
            log.warning("No se pudo salir de %s (%s); se reintentará", p.question[:60], reason)
            return
        self.state.cash += fill.usd
        self._close(p, exit_price=fill.avg_price, proceeds=fill.usd, reason=reason)

    # --------------------------------------------------------- nuevas entradas
    def _find_entries(self, markets: list[Market]) -> None:
        st, cfg = self.state, self.cfg
        rejected = Counter()
        for m in markets:
            r = filters.rejection_reason(m, cfg)
            if r:
                rejected[r.split(" ")[0]] += 1
        candidates = [m for m in filters.eligible_markets(markets, cfg) if m.id not in st.positions]
        self.journal.event(kind="scan", scanned=len(markets), eligible=len(candidates), rejected=dict(rejected))
        log.info("Mercados: %d escaneados, %d elegibles", len(markets), len(candidates))
        self._stat("scout", "scanned", len(markets), last=f"{len(markets)} escaneados, {len(candidates)} elegibles")
        self._stat("scout", "cycles")
        self.state.agent_stats["scout"]["eligible_now"] = len(candidates)
        self._prune_estimates()

        slots = cfg.max_open_positions - len(st.positions)
        if self.sharp is not None:  # CUOTAS va primero: no gasta en Claude y registra la sombra aunque no haya hueco
            handled, entered = self._sharp_entries(candidates, max(slots, 0))
            slots -= entered
            candidates = [m for m in candidates if m.id not in handled]
        if slots <= 0:
            log.info("Máximo de %d posiciones alcanzado; no se buscan entradas", cfg.max_open_positions)
            return

        if self.triage is not None:
            candidates = self._run_triage(candidates)

        evaluations = 0
        for m in candidates:
            if slots <= 0 or evaluations >= cfg.max_evaluations_per_cycle:
                break
            if not self._budget_left():
                log.warning("Presupuesto diario de API agotado ($%.2f); sin nuevas evaluaciones", cfg.daily_api_budget_usd)
                self.journal.event(kind="budget_exhausted", spent_today=st.api_cost_today())
                break
            cached = st.estimates.get(m.id)
            if cached and _minutes_since(cached["at"]) < cfg.reevaluate_after_minutes \
                    and abs(m.prices[0] - cached["price_yes"]) < cfg.reeval_price_move:
                continue
            try:
                evaluated, entered = self._consider(m)
            except Exception as exc:
                log.exception("Error evaluando %s: %s", m.id, exc)
                continue
            evaluations += evaluated
            slots -= entered

    def _sharp_entries(self, candidates: list[Market], slots: int) -> tuple[set, int]:
        """CUOTAS: compara cada partido con Pinnacle. Opera solo con las reglas duras; el resto, a la sombra."""
        st, cfg = self.state, self.cfg
        handled, entered = set(), 0
        for m in candidates:
            if not (m.raw or {}).get("sportsMarketType"):
                continue
            try:
                fair, why = self.sharp.fair_yes(m)
            except Exception as exc:
                log.debug("emparejado %s: %s", m.id, exc)
                continue
            if fair is None:
                self._stat("sharp", "unmatched")
                continue
            handled.add(m.id)
            self._stat("sharp", "matched")
            if abs(fair - m.prices[0]) < cfg.sharp_shadow_edge:  # prefiltro barato antes de pedir libros
                continue
            try:
                book0, book1 = self._books(m)
            except Exception as exc:
                log.warning("Libro de %s: %s", m.id, exc)
                continue
            ask0, ask1 = book0.best_ask, book1.best_ask
            choice = risk.best_side(fair, ask0, ask1, cfg.taker_fee, m.fee_rate, m.fee_exponent)
            if choice is None or choice.edge < cfg.sharp_shadow_edge:
                continue
            base = {"kind": "sharp", "market_id": m.id, "question": m.question, "url": m.url,
                    "ask": [ask0, ask1], "mid_yes": book0.mid, "price_yes": m.prices[0],
                    "fair_yes": round(fair, 4), "match": why, "sports_type": m.raw.get("sportsMarketType"),
                    "side": m.outcomes[choice.outcome_index], "side_index": choice.outcome_index,
                    "side_price": choice.price, "side_fair_value": round(choice.fair_value, 4),
                    "edge": round(choice.edge, 4), "fee_rate": m.fee_rate, "game_start": m.raw.get("gameStartTime")}
            blockers = risk.entry_blockers(edge=choice.edge, confidence="high", resolution_clear=True,
                                           open_positions=len(st.positions), halted=st.halted, cfg=cfg)
            if not blockers and entered >= slots:
                blockers.append(f"sin huecos libres ({cfg.max_open_positions} posiciones)")
            book = book0 if choice.outcome_index == 0 else book1
            stake, kelly, exec_edge = self._size_check(m, choice, book, blockers)
            self.journal.decision(**base, exec_edge=None if exec_edge is None else round(exec_edge, 4),
                                  stake_usd=stake, **kelly, decision="SHADOW" if blockers else "TRADE",
                                  reasons=blockers)
            self._stat("sharp", "signals", last=f"{choice.edge * 100:+.1f} pp {base['side']} · {m.question[:60]}")
            log.info("CUOTAS %s | Pinnacle %.3f vs ask %s/%s | edge %+.1f pp | %s", m.question[:60], fair, ask0, ask1,
                     choice.edge * 100, "TRADE" if not blockers else "sombra: " + "; ".join(blockers))
            if not blockers and self._open_position(m, choice, book, stake, exec_edge, base, source="sharp"):
                entered += 1
        return handled, entered

    def _run_triage(self, candidates: list[Market]) -> list[Market]:
        """TRIAGE: criba barata por lotes. Devuelve la lista corta para el analista, en orden."""
        st, cfg = self.state, self.cfg
        fast_weather = lambda m: cfg.fast_mode and is_weather_market(m)  # noqa: E731

        def stale(m: Market) -> bool:
            sc = st.screens.get(m.id)
            return (sc is None or _minutes_since(sc["at"]) >= cfg.triage_refresh_hours * 60
                    or abs(m.prices[0] - sc["price_yes"]) >= cfg.reeval_price_move)

        # Los mercados del tiempo van directos al analista: sin datos de NOAA la criba no aporta.
        pending = [m for m in candidates if not fast_weather(m) and stale(m)][: cfg.triage_max_per_cycle]
        for i in range(0, len(pending), cfg.triage_batch):
            if st.triage_cost_by_day.get(today(), 0.0) >= cfg.triage_daily_budget_usd or not self._budget_left():
                log.info("Presupuesto de triage agotado por hoy")
                break
            batch = pending[i:i + cfg.triage_batch]
            screens = self.triage.screen(batch)
            cost = getattr(self.triage, "last_cost", 0.0) or 0.0
            st.add_api_cost(cost)
            st.triage_cost_by_day[today()] = st.triage_cost_by_day.get(today(), 0.0) + cost
            by_id = {m.id: m for m in batch}
            flagged = 0
            for sc in screens:
                st.screens[sc.market_id] = {"at": now_iso(), "price_yes": by_id[sc.market_id].prices[0],
                                            "fair_yes": sc.fair_yes, "flag": sc.flag, "reason": sc.reason}
                flagged += sc.flag
            self._stat("triage", "screened", len(batch))
            self._stat("triage", "flagged", flagged, last=f"lote de {len(batch)}: {flagged} marcados")
            self._stat("triage", "cost", cost)
            self.journal.decision(kind="triage", cost_usd=round(cost, 4), markets=[
                {"market_id": sc.market_id, "question": by_id[sc.market_id].question,
                 "price_yes": by_id[sc.market_id].prices[0], "fair_yes": round(sc.fair_yes, 3),
                 "flag": sc.flag, "reason": sc.reason} for sc in screens])
            log.info("TRIAGE: %d mercados cribados, %d marcados ($%.3f)", len(batch), flagged, cost)

        def gap(m: Market) -> float:
            sc = st.screens.get(m.id)
            return abs(sc["fair_yes"] - m.prices[0]) if sc else 0.0

        shortlist = [m for m in candidates if fast_weather(m)
                     or ((sc := st.screens.get(m.id)) and (sc["flag"] or gap(m) >= cfg.triage_threshold))]
        shortlist.sort(key=lambda m: (not fast_weather(m), -gap(m)))
        return shortlist

    def _consider(self, m: Market) -> tuple[int, int]:
        """Evalúa un mercado. Devuelve (llamadas a Claude, posiciones abiertas)."""
        st, cfg = self.state, self.cfg
        book0, book1 = self._books(m)
        ask0, ask1 = book0.best_ask, book1.best_ask
        base = {"kind": "entry", "market_id": m.id, "question": m.question, "url": m.url,
                "ask": [ask0, ask1], "mid_yes": book0.mid, "price_yes": m.prices[0],
                "liquidity": m.liquidity, "volume_24h": m.volume_24h}

        if ask0 is None or book0.best_bid is None or (ask0 - book0.best_bid) > cfg.max_spread:
            self.journal.decision(**base, decision="SKIP", reasons=["spread demasiado ancho o libro vacío"])
            return 0, 0

        est = self._estimate(m, ask0, ask1)
        calls = 1
        if est is None:
            st.estimates[m.id] = {"at": now_iso(), "price_yes": m.prices[0], "fair_yes": None}
            self.journal.decision(**base, decision="SKIP", reasons=["sin estimación de Claude"])
            return 1, 0
        st.estimates[m.id] = {"at": now_iso(), "price_yes": m.prices[0], "fair_yes": est.fair_yes}

        analyst_choice = risk.best_side(est.fair_yes, ask0, ask1, cfg.taker_fee, m.fee_rate, m.fee_exponent)
        self._stat("analyst", "estimates", last=f"FV {est.fair_yes:.2f} · {m.question[:80]}")
        if analyst_choice.edge > cfg.min_edge:
            self._stat("analyst", "edges_found")
        blockers = risk.entry_blockers(
            edge=analyst_choice.edge, confidence=est.confidence, resolution_clear=est.resolution_clear,
            open_positions=len(st.positions), halted=st.halted, cfg=cfg,
        )

        # ESCÉPTICO: solo revisa ideas que ya pasan las reglas; su veto bloquea y, si aprueba,
        # el fair value final es la media de las dos opiniones (menos ruido).
        choice, fair_yes, review = analyst_choice, est.fair_yes, None
        if not blockers and self.skeptic is not None:
            if not self._budget_left():
                blockers.append("sin presupuesto de API para el escéptico")
            else:
                side_name = m.outcomes[analyst_choice.outcome_index]
                review = self.skeptic.review(m, ask0, ask1, est, side_name)
                st.add_api_cost(getattr(self.skeptic, "last_cost", 0.0) or 0.0)
                calls += 1
                if review is None:
                    blockers.append("el escéptico no respondió")
                else:
                    self._stat("skeptic", "reviews")
                    fair_yes = (est.fair_yes + review.fair_yes) / 2
                    choice = risk.best_side(fair_yes, ask0, ask1, cfg.taker_fee, m.fee_rate, m.fee_exponent)
                    if review.verdict == "veto":
                        self._stat("skeptic", "vetoes", last=f"VETO {m.question[:60]}: {review.objection[:70]}")
                        blockers.append(f"vetado por el escéptico: {review.objection[:160]}")
                    else:
                        self._stat("skeptic", "approvals", last=f"OK {m.question[:80]}")
                    if choice.outcome_index != analyst_choice.outcome_index:
                        blockers.append("analista y escéptico no coinciden en el lado")
                    elif choice.edge <= cfg.min_edge:
                        blockers.append(f"edge combinado {choice.edge * 100:.1f} pp <= {cfg.min_edge * 100:.0f} pp")
        st.estimates[m.id]["fair_yes"] = fair_yes

        book = book0 if choice.outcome_index == 0 else book1
        stake, kelly, exec_edge = self._size_check(m, choice, book, blockers)

        self.journal.decision(
            **base, fair_yes=round(fair_yes, 4), analyst_fair_yes=round(est.fair_yes, 4),
            skeptic_fair_yes=None if review is None else round(review.fair_yes, 4),
            skeptic_verdict=None if review is None else review.verdict,
            skeptic_objection=None if review is None else review.objection,
            triage=st.screens.get(m.id), confidence=est.confidence,
            resolution_clear=est.resolution_clear, resolution_source=est.resolution_source,
            side=m.outcomes[choice.outcome_index], side_fair_value=round(choice.fair_value, 4),
            edge=round(choice.edge, 4), exec_edge=None if exec_edge is None else round(exec_edge, 4),
            stake_usd=stake, **kelly, equity=round(st.equity, 2),
            decision="SKIP" if blockers else "TRADE", reasons=blockers,
            reasoning=est.reasoning, evidence=est.evidence, cost_usd=round(est.cost_usd, 4),
        )
        log.info("%s | FV %.3f vs ask %s/%s | edge %+.1f pp | %s",
                 m.question[:70], fair_yes, ask0, ask1, choice.edge * 100,
                 "TRADE" if not blockers else "skip: " + "; ".join(blockers))
        if blockers:
            if analyst_choice.edge > cfg.min_edge:  # era una idea con edge y algo la frenó
                self._stat("risk", "blocked", last=f"bloqueado: {blockers[0][:100]}")
            return calls, 0

        if not self._open_position(m, choice, book, stake, exec_edge, base, source="claude"):
            return calls, 0
        return calls, 1

    # ------------------------------------------------------ comunes a todas las fuentes
    def _size_check(self, m: Market, choice, book: OrderBook, blockers: list[str]) -> tuple[float, dict, float | None]:
        """RIESGO: tamaño (1/4 Kelly, tope 6%) y comprobaciones al precio real de ejecución."""
        st, cfg = self.state, self.cfg
        stake, kelly = risk.position_size_usd(st.equity, st.cash, choice.fair_value, choice.price, cfg)
        exec_edge = None
        if not blockers:
            sim = book.fill_buy(stake) if stake > 0 else None
            if sim is None:
                blockers.append("sin profundidad para el tamaño o tamaño 0")
            else:
                shares, avg_price = sim
                exec_edge = (choice.fair_value - avg_price - cfg.taker_fee
                             - risk.taker_fee(avg_price, m.fee_rate, m.fee_exponent))
                if exec_edge <= cfg.min_edge:
                    blockers.append(f"edge al precio medio de ejecución {exec_edge * 100:.1f} pp <= {cfg.min_edge * 100:.0f} pp")
                if shares < m.min_order_size:
                    blockers.append(f"{shares:.2f} shares < mínimo del mercado ({m.min_order_size:g})")
                if stake < 1.0:
                    blockers.append(f"tamaño ${stake:.2f} < $1 mínimo")
        return stake, kelly, exec_edge

    def _open_position(self, m: Market, choice, book: OrderBook, stake: float, exec_edge: float | None,
                       base: dict, source: str) -> bool:
        st, cfg = self.state, self.cfg
        fill = self.executor.buy(m.token_ids[choice.outcome_index], stake, book, m.tick_size, m.neg_risk,
                                 fee_rate=m.fee_rate, fee_exponent=m.fee_exponent)
        if fill is None:
            self.journal.decision(**base, decision="FAILED", reasons=["la orden no se ejecutó"])
            self._stat("risk", "failed_orders")
            return False
        st.cash -= fill.usd
        p = Position(
            market_id=m.id, question=m.question, outcome=m.outcomes[choice.outcome_index],
            outcome_index=choice.outcome_index, token_id=m.token_ids[choice.outcome_index],
            shares=fill.shares, entry_price=fill.avg_price, cost=fill.usd,
            entry_fair_value=choice.fair_value, last_fair_value=choice.fair_value,
            last_price=book.best_bid or fill.avg_price, opened_at=now_iso(),
            end_date=m.end_date.isoformat() if m.end_date else None, slug=m.slug,
            last_estimate_at=now_iso(), last_estimate_price=book.mid or fill.avg_price,
            min_order_size=m.min_order_size, tick_size=m.tick_size, neg_risk=m.neg_risk,
            fee_rate=m.fee_rate, fee_exponent=m.fee_exponent, source=source,
        )
        st.positions[m.id] = p
        self.journal.trade(action="OPEN", mode=cfg.mode, market_id=m.id, question=m.question,
                           outcome=p.outcome, shares=p.shares, price=p.entry_price, usd=p.cost,
                           fair_value=p.entry_fair_value, edge=exec_edge, order_id=fill.order_id, source=source)
        log.info("ABIERTA [%s] %s [%s] %.2f shares @ %.3f ($%.2f)", source, m.question[:60], p.outcome, p.shares,
                 p.entry_price, p.cost)
        self._stat("risk", "orders", last=f"ORDER ${p.cost:.2f} {p.outcome} · {m.question[:70]}")
        return True

    def _prune_estimates(self) -> None:
        cutoff = datetime.now(timezone.utc) - timedelta(days=2)
        self.state.estimates = {
            k: v for k, v in self.state.estimates.items() if datetime.fromisoformat(v["at"]) > cutoff
        }
        self.state.screens = {
            k: v for k, v in self.state.screens.items() if datetime.fromisoformat(v["at"]) > cutoff
        }

    # ------------------------------------------------------------ parada/fin
    def _halt(self) -> None:
        st = self.state
        dd = risk.drawdown(st.equity, st.peak_equity)
        st.halted = True
        st.halt_reason = f"drawdown {dd * 100:.1f}% desde el pico ${st.peak_equity:.2f}"
        st.halted_at = now_iso()
        log.critical("DRAWDOWN %.1f%% >= 40%%: TRADING DETENIDO", dd * 100)
        path = write_postmortem(st, self.cfg, self.brain)
        self.journal.event(kind="halt", reason=st.halt_reason, postmortem=str(path))

    def approve_restart(self, note: str = "") -> None:
        st = self.state
        st.halted = False
        st.halt_reason = ""
        st.peak_equity = st.equity  # el drawdown se mide desde aquí a partir de ahora
        self.journal.event(kind="human_approval", equity=st.equity, note=note)
        st.save(self.cfg.state_path)

    def _finish(self) -> None:
        st = self.state
        st.last_cycle_at = now_iso()
        st.save(self.cfg.state_path)
        self.journal.equity(st)
        self.journal.write_status(st, self.cfg.vps_monthly_usd)
        log.info("Equity $%.2f | caja $%.2f | pico $%.2f | DD %.1f%% | %d posiciones | API hoy $%.2f",
                 st.equity, st.cash, st.peak_equity, risk.drawdown(st.equity, st.peak_equity) * 100,
                 len(st.positions), st.api_cost_today())
