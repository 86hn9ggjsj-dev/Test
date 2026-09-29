"""Paper trading: las estrategias del banco operan con precios reales y dinero ficticio.

Cada estrategia es un "trader" con CAPITAL_POR_ESTRATEGIA dólares ficticios. En cada ciclo se
descargan las velas nuevas y se simula la estrategia desde el momento en que entró en la sala,
con exactamente las mismas reglas que el backtest (backtest.py). Nunca se envía ninguna orden
a ningún exchange.
"""

from __future__ import annotations

import datetime as dt
import threading
from collections import defaultdict

import numpy as np
import pandas as pd

from . import almacen, banco
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


def _curva(res, m: Mercado, inicio: int, direccion: str) -> np.ndarray:
    """Patrimonio relativo (1 = capital inicial) al cierre de cada vela desde `inicio - 1`,
    valorando a precio de mercado las posiciones abiertas."""
    n0 = inicio - 1
    eq = np.ones(len(m) - n0)
    d = 1 if direccion == "largo" else -1
    for e, s, pe, r, motivo in zip(res.entradas, res.salidas, res.precio_entrada, res.retornos, res.motivos):
        hasta = len(m) if motivo == "abierta" else s
        eq[e - n0 : hasta - n0] *= 1 + d * (m.c[e:hasta] / pe - 1) - COSTE_IDA_VUELTA
        if motivo != "abierta":
            eq[s - n0 :] *= 1 + r
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


def ciclo(estado: dict) -> list[dict]:
    """Actualiza el estado del paper trading con las velas nuevas. Devuelve los eventos nuevos."""
    en_banco = {b["id"]: b for b in banco.cargar()}
    traders = estado.setdefault("estrategias", {})
    precios = estado.setdefault("precios", {})
    for id_ in [i for i in traders if i not in en_banco]:  # borradas del banco
        del traders[id_]

    grupos = defaultdict(list)
    for b in en_banco.values():
        grupos[(b["estrategia"]["simbolo"], b["estrategia"]["intervalo"])].append(b)

    eventos: list[dict] = []
    pnl: list[pd.Series] = []
    medianoche = pd.Timestamp(dt.datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0))

    def evento(tipo: str, texto: str, **datos) -> None:
        eventos.append({"t": _ahora(), "tipo": tipo, "texto": texto, **datos})

    for (simbolo, intervalo), lista in grupos.items():
        m = Mercado(velas(simbolo, intervalo), simbolo, intervalo)
        atr = m.ind("atr", 14)
        velas_dia = max(1, 1440 // m.minutos)
        precios[simbolo] = {
            "precio": float(m.c[-1]),
            "cambio_24h_pct": round(float(m.c[-1] / m.c[-1 - velas_dia] - 1) * 100, 2),
            "serie": [float(x) for x in m.c[-72:]],
            "vela": m.tiempo[-1].isoformat(),
        }
        for b in lista:
            est = Estrategia.de_dict(b["estrategia"])
            t = traders.get(b["id"])
            if t is None:
                t = traders[b["id"]] = {
                    "inicio": m.tiempo[-1].isoformat(),  # opera a partir de la próxima vela
                    "simbolo": simbolo,
                    "direccion": est.direccion,
                    "descripcion": b["descripcion"],
                    "operaciones": [],
                    "posicion": None,
                }
                evento("alta", f"{b['id']} entra en la sala de trading con {_precio(CAPITAL_POR_ESTRATEGIA)} $ ficticios",
                       id=b["id"], simbolo=simbolo, direccion=est.direccion)

            inicio = int(np.searchsorted(m.tiempo, pd.Timestamp(t["inicio"]), side="right"))
            cerradas, posicion = [], None
            t["hoy"] = 0.0
            if inicio < len(m):
                res = simular(est, m, inicio=inicio, cerrar_al_final=False)
                curva = pd.Series(CAPITAL_POR_ESTRATEGIA * (_curva(res, m, inicio, est.direccion) - 1),
                                  index=m.tiempo[inicio - 1 :] + pd.Timedelta(minutes=m.minutos))
                pnl.append(curva)
                antes = curva[curva.index <= medianoche]
                t["hoy"] = round(float(curva.iloc[-1] - (antes.iloc[-1] if len(antes) else 0.0)), 2)
                for e, s, pe, ps, r, motivo in zip(res.entradas, res.salidas, res.precio_entrada,
                                                  res.precio_salida, res.retornos, res.motivos):
                    op = {
                        "entrada_t": m.tiempo[e].isoformat(),
                        "salida_t": m.tiempo[s].isoformat(),
                        "entrada": float(pe),
                        "salida": float(ps),
                        "retorno_pct": round(float(r) * 100, 3),
                        "motivo": motivo,
                    }
                    if motivo == "abierta":
                        d = 1 if est.direccion == "largo" else -1
                        op.update(
                            stop=float(pe - d * est.stop_atr * atr[e - 1]),
                            objetivo=float(pe + d * est.objetivo_atr * atr[e - 1]),
                            velas=int(s - e + 1),
                            max_velas=est.max_velas,
                        )
                        posicion = op
                    else:
                        cerradas.append(op)

            lado = "LARGO" if est.direccion == "largo" else "CORTO"
            for op in cerradas[len(t["operaciones"]):]:
                evento("cierre", f"{b['id']} cierra {lado} en {simbolo}: {_pct(op['retorno_pct'])} ({op['motivo']})",
                       id=b["id"], simbolo=simbolo, direccion=est.direccion,
                       retorno_pct=op["retorno_pct"], motivo=op["motivo"], precio=op["salida"])
            if posicion and (not t["posicion"] or t["posicion"]["entrada_t"] != posicion["entrada_t"]):
                evento("apertura", f"{b['id']} abre {lado} en {simbolo} a {_precio(posicion['entrada'])} "
                                   f"(stop {_precio(posicion['stop'])} · objetivo {_precio(posicion['objetivo'])})",
                       id=b["id"], simbolo=simbolo, direccion=est.direccion, precio=posicion["entrada"])

            t["operaciones"] = cerradas
            t["posicion"] = posicion
            patrimonio = CAPITAL_POR_ESTRATEGIA * float(np.prod([1 + o["retorno_pct"] / 100 for o in cerradas]))
            if posicion:
                patrimonio *= 1 + posicion["retorno_pct"] / 100
            t["patrimonio"] = round(patrimonio, 2)
            t["resultado"] = round(patrimonio - CAPITAL_POR_ESTRATEGIA, 2)

    estado["resumen"], estado["curva"], estado["diarios"] = _resumen(pnl, traders)
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
        parar.wait(segundos)
