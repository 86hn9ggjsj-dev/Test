"""Paper trading: las estrategias del banco operan con precios reales y dinero ficticio.

Cada estrategia es un "trader" con CAPITAL_POR_ESTRATEGIA dólares ficticios. En cada ciclo se
descargan las velas nuevas y se simula la estrategia desde el momento en que entró en la sala,
con exactamente las mismas reglas que el backtest (backtest.py). Encima va la gestión de riesgo
(riesgo.py): decide qué parte del capital usa cada operación y puede vetar entradas nuevas.
Nunca se envía ninguna orden a ningún exchange.
"""

from __future__ import annotations

import datetime as dt
import threading

import numpy as np
import pandas as pd

from . import almacen, banco, riesgo
from .backtest import simular
from .config import CAPITAL_POR_ESTRATEGIA, COSTE_IDA_VUELTA
from .datos import velas
from .estrategia import Estrategia
from .mercado import Mercado

ACTIVIDAD_MAX = 60


def _ahora() -> str:
    return dt.datetime.now().astimezone().isoformat(timespec="seconds")


def _precio(x: float) -> str:
    return f"{x:,.2f}".replace(",", "_").replace(".", ",").replace("_", ".")


def _pct(x: float) -> str:
    return f"{x:+.2f} %".replace(".", ",")


def _telegram(texto: str) -> None:
    """Aviso opcional al móvil, reutilizando el bot de Telegram de Jarvis si está configurado."""
    try:
        from jarvis.avisos import telegram
        from jarvis.config import NotConfigured
    except ImportError:
        return
    try:
        telegram(texto)
    except NotConfigured:
        pass
    except Exception as e:  # un fallo de Telegram no debe parar el paper trading
        print(f"[papel] No he podido avisar por Telegram: {e}")


def _curva(res, m: Mercado, inicio: int, direccion: str, fracciones: list[float]) -> np.ndarray:
    """Patrimonio relativo (1 = capital inicial) al cierre de cada vela desde `inicio - 1`,
    valorando a precio de mercado las posiciones abiertas. Cada operación solo mueve la parte
    del capital que invirtió (su fracción)."""
    n0 = inicio - 1
    eq = np.ones(len(m) - n0)
    d = 1 if direccion == "largo" else -1
    for e, s, pe, r, motivo, f in zip(res.entradas, res.salidas, res.precio_entrada, res.retornos, res.motivos, fracciones):
        hasta = len(m) if motivo == "abierta" else s
        eq[e - n0 : hasta - n0] *= 1 + f * (d * (m.c[e:hasta] / pe - 1) - COSTE_IDA_VUELTA)
        if motivo != "abierta":
            eq[s - n0 :] *= 1 + f * r
    return eq


def _resumen(pnl: list[pd.Series], traders: dict) -> tuple[dict, list, list]:
    """Resultado total y de hoy, curva de resultado acumulado y resultado de cada día."""
    inicial = CAPITAL_POR_ESTRATEGIA * len(traders)
    resultado = sum(t["resultado"] for t in traders.values())
    zona = dt.datetime.now().astimezone().tzinfo
    medianoche = pd.Timestamp(dt.datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0))
    curva, diarios, hoy = [], [], 0.0
    if pnl:
        total = pd.concat(pnl, axis=1).sort_index().ffill().fillna(0).sum(axis=1)
        antes = total[total.index <= medianoche]
        hoy = float(total.iloc[-1] - (antes.iloc[-1] if len(antes) else 0.0))
        local = total.copy()
        local.index = local.index.tz_convert(zona)
        ultima = local.iloc[-24 * 30 :]
        curva = [[t.isoformat(), round(float(v), 2)] for t, v in ultima.items()]
        por_dia = local.resample("1D").last().ffill()
        cambio = por_dia.diff()
        cambio.iloc[0] = por_dia.iloc[0]
        diarios = [[t.date().isoformat(), round(float(v), 2)] for t, v in cambio.iloc[-14:].items()]
    resumen = {
        "inicial": inicial,
        "patrimonio": round(inicial + resultado, 2),
        "resultado": round(resultado, 2),
        "resultado_pct": round(resultado / inicial * 100, 3) if inicial else 0.0,
        "hoy": round(hoy, 2),
        "hoy_pct": round(hoy / inicial * 100, 3) if inicial else 0.0,
    }
    return resumen, curva, diarios


def _radar(est: Estrategia, m: Mercado) -> dict:
    """Qué condiciones de la estrategia se cumplen ahora, cuándo cierra la próxima vela y niveles clave."""
    conds = est.condiciones_ahora(m)
    return {
        "cumplidas": sum(ok for _, ok in conds),
        "total": len(conds),
        "faltan": [texto for texto, ok in conds if not ok],
        "proximo_cierre": (m.tiempo[-1] + pd.Timedelta(minutes=2 * m.minutos)).isoformat(),
        "soporte": float(m.l[-48:].min()),
        "resistencia": float(m.h[-48:].max()),
        "atr": float(m.ind("atr", 14)[-1]),
        "precio": float(m.c[-1]),
    }


def ciclo(estado: dict) -> list[dict]:
    """Actualiza el estado del paper trading con las velas nuevas. Devuelve los eventos nuevos."""
    en_banco = {b["id"]: b for b in banco.cargar()}
    traders = estado.setdefault("estrategias", {})
    precios = estado.setdefault("precios", {})
    for id_ in [i for i in traders if i not in en_banco]:  # borradas del banco
        del traders[id_]

    eventos: list[dict] = []
    medianoche = pd.Timestamp(dt.datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0))

    def evento(tipo: str, texto: str, **datos) -> None:
        eventos.append({"t": _ahora(), "tipo": tipo, "texto": texto, **datos})

    # 1) Mercados, precios y traders nuevos.
    mercados: dict[tuple[str, str], Mercado] = {}
    for b in en_banco.values():
        clave = (b["estrategia"]["simbolo"], b["estrategia"]["intervalo"])
        if clave not in mercados:
            m = mercados[clave] = Mercado(velas(*clave), *clave)
            velas_dia = max(1, 1440 // m.minutos)
            precios[clave[0]] = {
                "precio": float(m.c[-1]),
                "cambio_24h_pct": round(float(m.c[-1] / m.c[-1 - velas_dia] - 1) * 100, 2),
                "serie": [float(x) for x in m.c[-72:]],
                "vela": m.tiempo[-1].isoformat(),
            }
        if b["id"] not in traders:
            est = Estrategia.de_dict(b["estrategia"])
            traders[b["id"]] = {
                "inicio": mercados[clave].tiempo[-1].isoformat(),  # opera a partir de la próxima vela
                "simbolo": clave[0], "direccion": est.direccion, "descripcion": b["descripcion"],
                "operaciones": [], "posicion": None, "aprobadas": [], "vetadas": [],
            }
            evento("alta", f"{b['id']} entra en la sala de trading con {_precio(CAPITAL_POR_ESTRATEGIA)} $ ficticios",
                   id=b["id"], simbolo=clave[0], direccion=est.direccion)

    # 2) Simulación con la gestión de riesgo: cada entrada nueva se aprueba o se veta una sola vez.
    def simular_trader(id_: str):
        b, t = en_banco[id_], traders[id_]
        est, m = Estrategia.de_dict(b["estrategia"]), mercados[(b["estrategia"]["simbolo"], b["estrategia"]["intervalo"])]
        inicio = int(np.searchsorted(m.tiempo, pd.Timestamp(t["inicio"]), side="right"))
        if inicio >= len(m):
            return None
        vetadas = {int(i) for i in np.searchsorted(m.tiempo, pd.to_datetime(t["vetadas"])) if i < len(m)} if t.get("vetadas") else set()
        return est, m, inicio, simular(est, m, inicio=inicio, cerrar_al_final=False, vetadas=vetadas)

    sims = {id_: simular_trader(id_) for id_ in traders}
    for id_, sim in sims.items():  # estados de versiones anteriores: lo ya operado se da por aprobado
        t = traders[id_]
        if "aprobadas" not in t:
            t["vetadas"] = []
            t["aprobadas"] = [sim[1].tiempo[e].isoformat() for e in sim[3].entradas] if sim else []
    bloqueo = riesgo.bloqueo_general(estado.get("resumen"), estado.get("curva"))
    vetos = estado.get("riesgo", {}).get("vetos", [])
    for _ in range(6):
        pendientes = []
        for id_, sim in sims.items():
            if sim:
                est, m, _, res = sim
                aprobadas = set(traders[id_]["aprobadas"])
                for j, e in enumerate(res.entradas):
                    if m.tiempo[e].isoformat() not in aprobadas:
                        pendientes.append((m.tiempo[e].isoformat(), id_, j))
        if not pendientes:
            break
        abiertas = [(s[0].simbolo, s[0].direccion) for i, s in sims.items()
                    if s and s[3].abierta and s[1].tiempo[s[3].entradas[-1]].isoformat() in traders[i]["aprobadas"]]
        cambiados = set()
        for te, id_, j in sorted(pendientes):
            if id_ in cambiados:
                continue  # tras un veto hay que volver a simular a este trader antes de seguir
            est, m, _, res = sims[id_]
            motivo = riesgo.evaluar_entrada(est.simbolo, est.direccion, abiertas, bloqueo)
            if motivo:
                traders[id_]["vetadas"].append(te)
                cambiados.add(id_)
                lado = "LARGO" if est.direccion == "largo" else "CORTO"
                evento("veto", f"Riesgos veta a {id_} ({lado} en {est.simbolo}): {motivo}",
                       id=id_, simbolo=est.simbolo, direccion=est.direccion, motivo=motivo)
                vetos = [{"t": _ahora(), "id": id_, "simbolo": est.simbolo, "direccion": est.direccion, "motivo": motivo}] + vetos
            else:
                traders[id_]["aprobadas"].append(te)
                if res.motivos[j] == "abierta":
                    abiertas.append((est.simbolo, est.direccion))
        for id_ in cambiados:
            sims[id_] = simular_trader(id_)

    # 3) Resultados de cada trader, con el tamaño de cada operación según el riesgo.
    pnl: list[pd.Series] = []
    for id_, t in traders.items():
        cerradas, posicion = [], None
        t["hoy"] = t["semana"] = 0.0
        sim = sims[id_]
        if sim:
            est, m, inicio, res = sim
            atr = m.ind("atr", 14)
            d = 1 if est.direccion == "largo" else -1
            fracciones = [riesgo.fraccion(est.stop_atr, atr[e - 1], pe) for e, pe in zip(res.entradas, res.precio_entrada)]
            curva = pd.Series(CAPITAL_POR_ESTRATEGIA * (_curva(res, m, inicio, est.direccion, fracciones) - 1),
                              index=m.tiempo[inicio - 1 :] + pd.Timedelta(minutes=m.minutos))
            pnl.append(curva)
            antes = curva[curva.index <= medianoche]
            t["hoy"] = round(float(curva.iloc[-1] - (antes.iloc[-1] if len(antes) else 0.0)), 2)
            hace_semana = curva[curva.index <= curva.index[-1] - pd.Timedelta(days=7)]
            t["semana"] = round(float(curva.iloc[-1] - (hace_semana.iloc[-1] if len(hace_semana) else 0.0)), 2)
            for e, s, pe, ps, r, motivo, f in zip(res.entradas, res.salidas, res.precio_entrada,
                                                 res.precio_salida, res.retornos, res.motivos, fracciones):
                op = {
                    "entrada_t": m.tiempo[e].isoformat(),
                    "salida_t": m.tiempo[s].isoformat(),
                    "entrada": float(pe),
                    "salida": float(ps),
                    "fraccion": round(f, 4),
                    "retorno_pct": round(float(f * r) * 100, 3),  # efecto sobre el capital del trader
                    "movimiento_pct": round(float(r) * 100, 3),  # lo que se movió la operación, con costes
                    "motivo": motivo,
                }
                if motivo == "abierta":
                    op.update(stop=float(pe - d * est.stop_atr * atr[e - 1]),
                              objetivo=float(pe + d * est.objetivo_atr * atr[e - 1]),
                              velas=int(s - e + 1), max_velas=est.max_velas)
                    posicion = op
                else:
                    cerradas.append(op)

        lado = "LARGO" if t["direccion"] == "largo" else "CORTO"
        for op in cerradas[len(t["operaciones"]):]:
            evento("cierre", f"{id_} cierra {lado} en {t['simbolo']}: {_pct(op['retorno_pct'])} del capital ({op['motivo']})",
                   id=id_, simbolo=t["simbolo"], direccion=t["direccion"],
                   retorno_pct=op["retorno_pct"], motivo=op["motivo"], precio=op["salida"])
        if posicion and (not t["posicion"] or t["posicion"]["entrada_t"] != posicion["entrada_t"]):
            evento("apertura", f"{id_} abre {lado} en {t['simbolo']} a {_precio(posicion['entrada'])} con el "
                               f"{posicion['fraccion']:.0%} de su capital (stop {_precio(posicion['stop'])} · "
                               f"objetivo {_precio(posicion['objetivo'])})".replace("%", " %"),
                   id=id_, simbolo=t["simbolo"], direccion=t["direccion"], precio=posicion["entrada"],
                   fraccion=posicion["fraccion"])
        t["operaciones"] = cerradas
        t["posicion"] = posicion
        if sim:
            t["radar"] = _radar(sim[0], sim[1])
        patrimonio = CAPITAL_POR_ESTRATEGIA * float(np.prod([1 + o["retorno_pct"] / 100 for o in cerradas]))
        if posicion:
            patrimonio *= 1 + posicion["retorno_pct"] / 100
        t["patrimonio"] = round(patrimonio, 2)
        t["resultado"] = round(patrimonio - CAPITAL_POR_ESTRATEGIA, 2)

    estado["resumen"], estado["curva"], estado["diarios"] = _resumen(pnl, traders)
    nuevo_bloqueo = riesgo.bloqueo_general(estado["resumen"], estado["curva"])
    anterior = estado.get("riesgo", {}).get("bloqueo")
    if nuevo_bloqueo and not anterior:
        evento("freno", f"¡Freno de riesgo! {nuevo_bloqueo[0].upper() + nuevo_bloqueo[1:]}. No se abren posiciones nuevas.",
               motivo=nuevo_bloqueo)
    elif anterior and not nuevo_bloqueo:
        evento("reanuda", "Se levanta el freno de riesgo: se vuelven a permitir entradas.")
    abiertas = [(t["simbolo"], t["direccion"]) for t in traders.values() if t["posicion"]]
    estado["riesgo"] = riesgo.estado(estado["resumen"], estado["curva"], abiertas, nuevo_bloqueo, vetos)
    estado["capital_por_estrategia"] = CAPITAL_POR_ESTRATEGIA
    estado["actividad"] = (eventos[::-1] + estado.get("actividad", []))[:ACTIVIDAD_MAX]
    estado["actualizado"] = _ahora()
    return eventos


def operar(segundos: float = 60, telegram: bool = False, parar: threading.Event | None = None) -> None:
    """Bucle del paper trading: un ciclo cada `segundos` hasta que se pida parar."""
    parar = parar or threading.Event()
    print(f"[papel] Paper trading en marcha (dinero ficticio). Reviso el mercado cada {segundos:g} s.", flush=True)
    ultima_vela = None
    while not parar.is_set():
        try:
            estado = almacen.cargar("papel", {})
            eventos = ciclo(estado)
            almacen.guardar("papel", estado)
            for ev in eventos:
                print(f"[papel {dt.datetime.now():%H:%M}] {ev['texto']}", flush=True)
                if telegram and ev["tipo"] in ("apertura", "cierre"):
                    _telegram(f"📊 {ev['texto']}")
            traders = estado.get("estrategias", {})
            vela = max((p["vela"] for p in estado.get("precios", {}).values()), default=None)
            if traders and vela != ultima_vela:
                ultima_vela = vela
                total = sum(t["patrimonio"] for t in traders.values())
                inicial = CAPITAL_POR_ESTRATEGIA * len(traders)
                abiertas = sum(1 for t in traders.values() if t["posicion"])
                print(f"[papel {dt.datetime.now():%H:%M}] Patrimonio {_precio(total)} $ "
                      f"({_pct((total / inicial - 1) * 100)}) · {len(traders)} traders · "
                      f"{abiertas} posiciones abiertas", flush=True)
        except Exception as e:  # sin conexión, etc.: se reintenta en el siguiente ciclo
            print(f"[papel] Error en el ciclo (lo reintento): {e}", flush=True)
        try:
            from .holding import actualizar

            for ev in actualizar():
                print(f"[holding {dt.datetime.now():%H:%M}] {ev['texto']}", flush=True)
                if telegram and ev["tipo"] in ("compra", "venta", "stop"):
                    _telegram(f"💎 {ev['texto']}")
        except Exception as e:
            print(f"[holding] Error en el ciclo (lo reintento): {e}", flush=True)
        parar.wait(segundos)
