"""Paper trading: las estrategias del banco operan con precios reales y dinero ficticio.

Cada estrategia es un "trader" con el capital ficticio que le toca según el reparto de tu fondo
(fondo.py; al principio, CAPITAL_POR_ESTRATEGIA dólares). En cada ciclo se
descargan las velas nuevas y se simula la estrategia desde el momento en que entró en la sala,
con exactamente las mismas reglas que el backtest (backtest.py). Encima va la gestión de riesgo
(riesgo.py): decide qué parte del capital usa cada operación y puede vetar entradas nuevas.

El camino de una estrategia nueva:
1. Incubadora (config.INCUBADORA): opera con dinero de prueba que NO es del fondo y sin vetos de sala, hasta que
   aprueba su examen (operaciones mínimas, ganando y con factor de beneficio suficiente) o lo suspende. Si la
   incubadora está llena, espera en el banquillo.
2. Mesa: las aprobadas suben a una mesa libre con capital del fondo (la mejor nota primero). Cada trader tiene su
   mesa (48 en trading y 12 en scalping).
3. Supervisor (config.PRUEBA): vigila a cada trader en su mesa; al que no es rentable le retira la estrategia,
   cuando no tiene nada abierto, y le da la mejor aprobada de la incubadora.
Cada estrategia que sale lleva su post mortem (postmortem.py). Lo que ganó o perdió con dinero del fondo queda
congelado y sigue contando en la sala y en tu fondo. Con 30 operaciones reales o más, el tamaño de cada operación
sale del Kelly prudente. El kill switch cierra todo lo abierto del fondo.
Nunca se envía ninguna orden a ningún exchange.
"""

from __future__ import annotations

import datetime as dt
import threading
import time

import numpy as np
import pandas as pd

from . import almacen, banco, control, fondo, postmortem, riesgo
from .backtest import simular
from .config import (CAPITAL_INCUBADORA, CAPITAL_POR_ESTRATEGIA, INCUBADORA, KELLY_FRACCION, KELLY_MIN_OPERACIONES,
                     KELLY_MINIMO, KELLY_TOPE, MESAS, PRUEBA, coste_de, dias_de, es_scalping)
from .datos import velas
from .estrategia import Estrategia
from .mercado import Mercado

ACTIVIDAD_MAX = 60
SUPERVISORES = {"trading": "Clara", "scalping": "Álex"}   # los mismos nombres que en la oficina


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


def _curva(res, m: Mercado, inicio: int, direccion: str, fracciones: list[float], coste: float) -> np.ndarray:
    """Patrimonio relativo (1 = capital inicial) al cierre de cada vela desde `inicio - 1`,
    valorando a precio de mercado las posiciones abiertas. Cada operación solo mueve la parte
    del capital que invirtió (su fracción)."""
    n0 = inicio - 1
    eq = np.ones(len(m) - n0)
    d = 1 if direccion == "largo" else -1
    for e, s, pe, r, motivo, f in zip(res.entradas, res.salidas, res.precio_entrada, res.retornos, res.motivos, fracciones):
        hasta = len(m) if motivo == "abierta" else s
        eq[e - n0 : hasta - n0] *= 1 + f * (d * (m.c[e:hasta] / pe - 1) - coste)
        if motivo != "abierta":
            eq[s - n0 :] *= 1 + f * r
    return eq


def _por_tramos(eq: np.ndarray, tiempos: pd.DatetimeIndex, tramos: list, col: int) -> tuple[np.ndarray, list]:
    """Resultado en $ punto a punto cuando el capital del trader cambia con el reparto del fondo: cada tramo aplica
    su capital a lo que se mueve la curva desde que empieza, y lo ganado antes se conserva.
    Devuelve el resultado y los tramos [(punto de inicio, capital)]."""
    previos = [c for c in tramos if c[0] <= tiempos[0]]
    cortes = [(0, (previos[-1] if previos else tramos[0])[col])]
    for c in tramos:
        if c[0] > tiempos[0]:
            p = min(int(np.searchsorted(tiempos, c[0], side="right")) - 1, len(eq) - 1)
            if p == cortes[-1][0]:
                cortes[-1] = (p, c[col])
            else:
                cortes.append((p, c[col]))
    pnl, base = np.zeros(len(eq)), 0.0
    for k, (ini, cap) in enumerate(cortes):
        fin = cortes[k + 1][0] if k + 1 < len(cortes) else len(eq) - 1
        pnl[ini:fin + 1] = base + cap * (eq[ini:fin + 1] / eq[ini] - 1)
        base = pnl[fin]
    return pnl, cortes


def _serie(puntos: list | None) -> pd.Series:
    if not puntos:
        return pd.Series(dtype=float)
    return pd.Series([float(v) for _, v in puntos], index=pd.to_datetime([t for t, _ in puntos], utc=True))


def _valor_en(puntos: list, momento: pd.Timestamp) -> float:
    """Valor de una serie [[t, v]] en un momento (el último punto que haya antes)."""
    s = _serie(puntos)
    antes = s[s.index <= momento]
    return float(antes.iloc[-1]) if len(antes) else 0.0


def _resumen(pnl: list[pd.Series], traders: dict, retirados: dict) -> tuple[dict, list, list]:
    """Resultado total y de hoy, curva de resultado acumulado y resultado de cada día. Incluye lo que ganaron o
    perdieron las estrategias ya retiradas: ese dinero se ganó o se perdió de verdad (en papel)."""
    inicial = sum(t.get("capital", CAPITAL_POR_ESTRATEGIA) for t in traders.values())
    resultado = sum(t["resultado"] for t in traders.values()) + sum(r["resultado"] for r in retirados.values())
    zona = dt.datetime.now().astimezone().tzinfo
    medianoche = pd.Timestamp(dt.datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0))
    curva, diarios, hoy, tramos = [], [], 0.0, {}
    if pnl:
        total = pd.concat(pnl, axis=1).sort_index().ffill().fillna(0).sum(axis=1)
        antes = total[total.index <= medianoche]
        hoy = float(total.iloc[-1] - (antes.iloc[-1] if len(antes) else 0.0))
        # resultado de las últimas 24 horas, 7 días y 30 días (si hay menos historia, desde el principio)
        ahora = pd.Timestamp.now(tz="UTC")
        for horas in (24, 168, 720):
            previo = total[total.index <= ahora - pd.Timedelta(hours=horas)]
            v = float(total.iloc[-1] - previo.iloc[-1]) if len(previo) else resultado
            tramos[str(horas)] = {"resultado": round(v, 2), "pct": round(v / inicial * 100, 3) if inicial else 0.0}
        local = total.copy()
        local.index = local.index.tz_convert(zona)
        # un punto por hora (las velas de scalping son de 5 minutos): así 30 días son de verdad 30 días
        ultima = local.resample("1h").last().ffill().iloc[-24 * 30 :]
        curva = [[t.isoformat(), round(float(v), 2)] for t, v in ultima.items()]
        por_dia = local.resample("1D").last().ffill()
        cambio = por_dia.diff()
        cambio.iloc[0] = por_dia.iloc[0]
        diarios = [[t.date().isoformat(), round(float(v), 2)] for t, v in cambio.iloc[-14:].items()]
    resumen = {
        "inicial": inicial,
        "patrimonio": round(sum(t.get("patrimonio", CAPITAL_POR_ESTRATEGIA) for t in traders.values()), 2),
        "resultado": round(resultado, 2),
        "resultado_pct": round(resultado / inicial * 100, 3) if inicial else 0.0,
        "hoy": round(hoy, 2),
        "hoy_pct": round(hoy / inicial * 100, 3) if inicial else 0.0,
        "tramos": tramos,
    }
    return resumen, curva, diarios


def _serie_horaria(curvas: list[pd.Series]) -> list[list]:
    """Resultado acumulado de un grupo de traders, hora a hora, desde el primero."""
    if not curvas:
        return []
    total = pd.concat(curvas, axis=1).sort_index().ffill().fillna(0).sum(axis=1)
    horas = total.resample("1h").last().ffill()
    return [[t.isoformat(), round(float(v), 2)] for t, v in horas.items()]


def _resumen_grupo(ts: list[dict], rs: list[dict], medianoche: pd.Timestamp) -> dict:
    """Cifras de un equipo (una sala o la incubadora): resultado, hoy, operaciones, acierto, media por operación,
    posiciones abiertas y comisiones. Las estrategias retiradas siguen contando con lo que hicieron mientras operaron."""
    ops = [o for t in ts for o in t["operaciones"]] + [o for r in rs for o in r["operaciones"]]
    hoy = [o for o in ops if pd.Timestamp(o["salida_t"]) >= medianoche]
    hoy_retiradas = sum(r["resultado"] - _valor_en(r["serie"], medianoche) for r in rs if pd.Timestamp(r["fin"]) >= medianoche)
    abiertas = [t["posicion"] for t in ts if t.get("posicion")]
    return {
        "traders": len(ts),
        "capital": round(sum(t.get("capital", CAPITAL_POR_ESTRATEGIA) for t in ts), 2),
        "resultado": round(sum(t["resultado"] for t in ts) + sum(r["resultado"] for r in rs), 2),
        "resultado_retiradas": round(sum(r["resultado"] for r in rs), 2),
        "hoy_retiradas": round(hoy_retiradas, 2),
        "retiradas": len(rs),
        "hoy": round(sum(t.get("hoy", 0.0) for t in ts) + hoy_retiradas, 2),
        "operaciones": len(ops),
        "operaciones_hoy": len(hoy),
        "aciertos_pct": round(sum(o["retorno_pct"] > 0 for o in ops) / len(ops) * 100, 1) if ops else None,
        "media_op_pct": round(float(np.mean([o.get("movimiento_pct", 0.0) for o in ops])), 3) if ops else None,
        "abiertas": len(abiertas),
        "abiertas_usd": round(sum(p.get("resultado_usd", 0.0) for p in abiertas), 2),
        "comisiones": round(sum(t.get("comisiones", 0.0) for t in ts) + sum(r.get("comisiones", 0.0) for r in rs), 2),
    }


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


def _grupo(intervalo: str) -> str:
    return "scalping" if es_scalping(intervalo) else "trading"


def _sala(grupo: str) -> str:
    return "la sala de scalping" if grupo == "scalping" else "la sala de trading"


def _nuevo_trader(b: dict, m: Mercado, mesa: int) -> dict:
    """Un trader que empieza a operar una estrategia del banco en una mesa, desde la próxima vela."""
    est = Estrategia.de_dict(b["estrategia"])
    grupo = _grupo(m.intervalo)
    capital = fondo.capital_mesa(grupo)
    return {
        "inicio": m.tiempo[-1].isoformat(), "mesa": mesa, "grupo": grupo, "intervalo": m.intervalo,
        "simbolo": est.simbolo, "direccion": est.direccion, "descripcion": b["descripcion"],
        "operaciones": [], "posicion": None, "aprobadas": [], "vetadas": [],
        "capital": capital, "patrimonio": capital, "resultado": 0.0, "comisiones": 0.0, "hoy": 0.0, "semana": 0.0,
    }


def _nuevo_incubado(b: dict, m: Mercado, plaza: int) -> dict:
    """Una estrategia que entra en la incubadora: opera con dinero de prueba (no del fondo) desde la próxima vela."""
    t = _nuevo_trader(b, m, 0)
    del t["mesa"]
    t.update(plaza=plaza, capital=CAPITAL_INCUBADORA, patrimonio=CAPITAL_INCUBADORA)
    return t


def _simular(t: dict, est: Estrategia, m: Mercado, fin: int | None = None):
    """Simula a un trader desde que entró (y, si se retiró, hasta ese momento). Las entradas vetadas por riesgo se
    ignoran y, si se pulsó el kill switch, lo abierto en ese momento se cierra al cierre de la última vela."""
    inicio = int(np.searchsorted(m.tiempo, pd.Timestamp(t["inicio"]), side="right"))
    if inicio >= (len(m) if fin is None else fin):
        return None
    vetadas = {int(i) for i in np.searchsorted(m.tiempo, pd.to_datetime(t["vetadas"])) if i < len(m)} if t.get("vetadas") else set()
    forzadas = set()
    if t.get("forzadas"):
        cierre = m.tiempo + pd.Timedelta(minutes=m.minutos)
        forzadas = {int(k) for k in np.searchsorted(cierre, pd.to_datetime(t["forzadas"]), side="right") - 1 if 0 <= k < len(m)}
    return est, m, inicio, simular(est, m, inicio=inicio, fin=fin, cerrar_al_final=fin is not None, vetadas=vetadas,
                                   forzadas=forzadas)


def _calcular(t: dict, sim, tramos: list | None, medianoche: pd.Timestamp, capital: float | None = None,
              riesgo_op: float | None = None) -> tuple[pd.Series | None, list[dict], dict | None]:
    """Resultados de un trader, con el tamaño de cada operación según el riesgo. Rellena capital, patrimonio,
    resultado, comisiones, hoy y semana, y devuelve su curva de resultado en $, las operaciones cerradas y la abierta.
    Con `capital` (la incubadora) el capital es fijo; si no, sigue el reparto del fondo (`tramos`)."""
    if capital is not None:
        tramos = [(pd.Timestamp("2000-01-01", tz="UTC"), capital, capital)]
    t["hoy"] = t["semana"] = 0.0
    t["capital"] = t["patrimonio"] = capital if capital is not None else fondo.capital_mesa(t["grupo"])
    t["resultado"] = t["comisiones"] = 0.0
    if not sim:
        return None, [], None
    cerradas, posicion = [], None
    col = 2 if t["grupo"] == "scalping" else 1
    est, m, inicio, res = sim
    atr = m.ind("atr", 14)
    d = 1 if est.direccion == "largo" else -1
    # el tamaño de cada operación se decide al entrar y se guarda: si luego cambia el riesgo (tuyo o el de Kelly),
    # solo afecta a las operaciones nuevas
    guardadas = t.setdefault("fracciones", {})
    riesgo_ahora = riesgo.limites()["riesgo_por_operacion"] if riesgo_op is None else riesgo_op
    fracciones = []
    for e, pe in zip(res.entradas, res.precio_entrada):
        clave = m.tiempo[e].isoformat()
        if clave not in guardadas:
            guardadas[clave] = riesgo.fraccion(est.stop_atr, atr[e - 1], pe, riesgo_ahora)
        fracciones.append(guardadas[clave])
    eq = _curva(res, m, inicio, est.direccion, fracciones, coste_de(m.intervalo))
    tiempos = m.tiempo[inicio - 1 :] + pd.Timedelta(minutes=m.minutos)
    valores, cortes = _por_tramos(eq, tiempos, tramos, col)
    curva = pd.Series(valores, index=tiempos)
    n0 = inicio - 1

    def capital_en(punto: int) -> float:
        return [c for p, c in cortes if p <= max(punto, 0)][-1]

    ini_ultimo, cap_ultimo = cortes[-1]
    t["capital"] = round(cap_ultimo, 2)
    t["patrimonio"] = round(float(cap_ultimo * eq[-1] / eq[ini_ultimo]), 2)
    t["resultado"] = round(float(valores[-1]), 2)
    t["comisiones"] = round(sum(capital_en(e - 1 - n0) * f * coste_de(m.intervalo) for e, f in zip(res.entradas, fracciones)), 2)
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
            "resultado_usd": round(float(valores[min(s, n0 + len(valores) - 1) - n0] - valores[e - 1 - n0]), 2),
            "movimiento_pct": round(float(r) * 100, 3),  # lo que se movió la operación, con costes
            "comision_usd": round(capital_en(e - 1 - n0) * f * coste_de(m.intervalo), 2),   # comisión y deslizamiento (ida y vuelta)
            "motivo": motivo,
        }
        if motivo == "abierta":
            op.update(stop=float(pe - d * est.stop_atr * atr[e - 1]),
                      objetivo=float(pe + d * est.objetivo_atr * atr[e - 1]),
                      velas=int(s - e + 1), max_velas=est.max_velas)
            posicion = op
        else:
            cerradas.append(op)
    return curva, cerradas, posicion


def _congelar(id_: str, t: dict, curva: pd.Series | None, cerradas: list[dict], motivo: str, por: str, fin: str,
              post_mortem: dict | None = None) -> dict:
    """Lo que queda de un trader cuando se retira su estrategia: su resultado ya no cambia, pero sigue contando en la
    sala y en tu fondo (lo perdido no desaparece al quitar la estrategia)."""
    serie = []
    if curva is not None and len(curva):
        horas = curva.resample("1h").last().ffill()
        previo = None
        for k, (momento, v) in enumerate(horas.items()):   # solo los puntos donde cambia (el resto se rellena)
            v = round(float(v), 2)
            if v != previo or k == len(horas) - 1:
                serie.append([momento.isoformat(), v])
                previo = v
    return {
        "id": id_, "grupo": t["grupo"], "mesa": t.get("mesa"), "simbolo": t["simbolo"], "direccion": t["direccion"],
        "intervalo": t.get("intervalo"), "descripcion": t.get("descripcion", ""), "inicio": t["inicio"], "fin": fin,
        "motivo": motivo, "por": por, "capital": t.get("capital"), "resultado": t.get("resultado", 0.0),
        "comisiones": t.get("comisiones", 0.0), "operaciones": [{**o, "motivo": "retirada" if o["motivo"] == "fin" else o["motivo"]}
                                                                for o in cerradas], "serie": serie,
        **({"post_mortem": post_mortem} if post_mortem else {}),
    }


def _prueba(t: dict, ahora: pd.Timestamp) -> tuple[dict, str | None]:
    """El periodo de prueba de un trader en su mesa, y el motivo para retirarle la estrategia si no es rentable.
    El supervisor solo actúa cuando el trader no tiene ninguna posición abierta."""
    p = PRUEBA[t["grupo"]]
    dias = max(0.0, (ahora - pd.Timestamp(t["inicio"])).total_seconds() / 86400)
    n = len(t["operaciones"])
    pct = t["resultado"] / t["capital"] * 100 if t.get("capital") else 0.0
    cumplida = dias >= p["dias"] and n >= p["operaciones"]
    motivo = None
    if cumplida and t["resultado"] < 0:
        motivo = (f"tras {dias:.0f} días y {n} operaciones va en pérdidas ({_precio(t['resultado'])} $, "
                  f"{_pct(pct)} de su capital)")
    elif pct <= -p["corte_pct"]:
        limite = f"{p['corte_pct']:g}".replace(".", ",")
        motivo = f"ya pierde un {_pct(-pct)[1:]} de su capital sin acabar la prueba (el límite es un {limite} %)"
    estado_ = "retirar" if motivo else ("rentable" if cumplida else "en_prueba")
    if motivo and t.get("posicion"):
        estado_ = "espera_cierre"
    info = {"dias": round(dias, 1), "dias_min": p["dias"], "operaciones": n, "operaciones_min": p["operaciones"],
            "corte_pct": p["corte_pct"], "resultado_pct": round(pct, 2), "cumplida": cumplida, "estado": estado_,
            "motivo": motivo}
    return info, motivo if estado_ == "retirar" else None


def _factor(movs: list[float]) -> float | None:
    """Factor de beneficio: lo ganado entre lo perdido (None si aún no ha perdido nada)."""
    perdido = -sum(x for x in movs if x < 0)
    ganado = sum(x for x in movs if x > 0)
    return round(ganado / perdido, 2) if perdido > 0 else (99.0 if ganado > 0 else None)


def _nota(movs: list[float]) -> float:
    """Nota del examen: media de sus operaciones entre su dispersión, por la raíz del número de operaciones (cuanto
    más alta, más clara es su ventaja). Sirve para elegir la mejor aprobada."""
    if len(movs) < 2:
        return 0.0
    sd = float(np.std(movs, ddof=1))
    return round(float(np.mean(movs)) / sd * len(movs) ** .5, 2) if sd > 0 else 9.99


def _examen(t: dict, ahora: pd.Timestamp) -> dict:
    """Examen de una estrategia en la incubadora: «en_examen», «aprobada» o «suspendida», con el motivo. Se decide solo
    cuando no tiene nada abierto (si no, el estado es el que tenía)."""
    p = INCUBADORA[t["grupo"]]
    dias = max(0.0, (ahora - pd.Timestamp(t["inicio"])).total_seconds() / 86400)
    movs = [o["retorno_pct"] for o in t["operaciones"]]   # en % del dinero de prueba, como el resultado
    n = len(movs)
    pct = t["resultado"] / CAPITAL_INCUBADORA * 100
    factor = _factor(movs)
    gana = t["resultado"] > 0 and (factor or 0) >= p["factor_min"]
    estado_, motivo = "en_examen", None
    fmt_f = f"{factor:g}".replace(".", ",") if factor is not None else "—"
    if pct <= -p["corte_pct"]:
        estado_, motivo = "suspendida", f"pierde un {_pct(-pct)[1:]} del dinero de prueba (el corte es un {p['corte_pct']:g} %)"
    elif n >= p["operaciones"] and dias >= p["dias_min"]:
        if gana:
            estado_, motivo = "aprobada", f"gana un {_pct(pct)[1:]} con {n} operaciones (factor de beneficio {fmt_f})"
        else:
            estado_, motivo = "suspendida", (f"tras {n} operaciones {'pierde' if t['resultado'] <= 0 else 'gana demasiado poco'} "
                                             f"({_pct(pct)}, factor de beneficio {fmt_f}; hace falta {p['factor_min']:g})")
    elif dias >= p["dias_max"]:
        if n >= p["operaciones_al_final"] and gana:
            estado_, motivo = "aprobada", f"en {p['dias_max']} días gana un {_pct(pct)[1:]} con {n} operaciones (factor {fmt_f})"
        else:
            estado_, motivo = "suspendida", (f"en {p['dias_max']} días solo ha hecho {n} operaciones" if n < p["operaciones_al_final"]
                                             else f"en {p['dias_max']} días no gana lo suficiente ({_pct(pct)}, factor {fmt_f})")
    pendiente = estado_ != "en_examen" and bool(t.get("posicion"))
    if pendiente:   # con una posición abierta no se decide nada: se espera a que cierre
        estado_ = "espera_cierre"
    return {"estado": estado_, "motivo": motivo.replace(".", ",") if motivo else None, "dias": round(dias, 1),
            "dias_min": p["dias_min"], "dias_max": p["dias_max"], "operaciones": n, "operaciones_min": p["operaciones"],
            "operaciones_al_final": p["operaciones_al_final"], "resultado_pct": round(pct, 2), "factor": factor,
            "factor_min": p["factor_min"], "corte_pct": p["corte_pct"], "nota": _nota(movs),
            "aciertos_pct": round(sum(x > 0 for x in movs) / n * 100, 1) if n else None}


def _kelly(movs: list[float], base: float) -> dict | None:
    """Kelly prudente: con KELLY_MIN_OPERACIONES operaciones reales o más, el riesgo por operación es una cuarta parte
    de lo que da la fórmula de Kelly (f = A − (1 − A) / R), usando un acierto A rebajado en un error estándar (por si
    ha tenido suerte) y R = ganancia media / pérdida media. Siempre entre KELLY_MINIMO y KELLY_TOPE veces tu riesgo."""
    n = len(movs)
    if n < KELLY_MIN_OPERACIONES:
        return None
    ganadas, perdidas = [x for x in movs if x > 0], [-x for x in movs if x <= 0]
    acierto = len(ganadas) / n
    prudente = max(0.0, acierto - (acierto * (1 - acierto) / n) ** .5)
    ratio = (np.mean(ganadas) / np.mean(perdidas)) if ganadas and perdidas and np.mean(perdidas) > 0 else (9.99 if ganadas else 0.0)
    f = prudente - (1 - prudente) / ratio if ratio > 0 else -1.0
    riesgo_k = min(KELLY_TOPE * base, max(KELLY_MINIMO, f * KELLY_FRACCION)) if f > 0 else KELLY_MINIMO
    return {"operaciones": n, "acierto_pct": round(acierto * 100, 1), "acierto_prudente_pct": round(prudente * 100, 1),
            "ratio": round(float(ratio), 2), "kelly_pct": round(f * 100, 2), "riesgo_pct": round(riesgo_k * 100, 3),
            "base_pct": round(base * 100, 3)}


def ciclo(estado: dict) -> list[dict]:
    """Actualiza el estado del paper trading con las velas nuevas. Devuelve los eventos nuevos."""
    en_banco = {b["id"]: b for b in banco.cargar()}
    traders = estado.setdefault("estrategias", {})       # en su mesa, con dinero del fondo
    incubadora = estado.setdefault("incubadora", {})     # de examen, con dinero de prueba
    retirados = estado.setdefault("retirados", {})
    suspendidas = estado.setdefault("suspendidas", [])
    precios = estado.setdefault("precios", {})
    precios_scalping = estado.setdefault("precios_scalping", {})
    estado.pop("reserva", None)   # versión anterior: las estrategias sin mesa ahora van a la incubadora
    fuera = [i for i in traders if i not in en_banco]   # las que han salido del banco desde el último ciclo
    fuera_inc = [i for i in incubadora if i not in en_banco]
    descartadas = {d["id"]: d for d in banco.descartadas()} if fuera or fuera_inc else {}

    eventos: list[dict] = []
    medianoche = pd.Timestamp(dt.datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0))
    ahora = pd.Timestamp.now(tz="UTC")
    tramos = fondo.capitales()
    lim = riesgo.limites()
    base = lim["riesgo_por_operacion"]

    def evento(tipo: str, texto: str, **datos) -> None:
        eventos.append({"t": _ahora(), "tipo": tipo, "texto": texto, **datos})

    def estrategia_de(id_: str) -> dict | None:
        b = en_banco.get(id_) or descartadas.get(id_)
        return b["estrategia"] if b else None

    def mercado_de(b: dict) -> Mercado:
        return mercados[(b["estrategia"]["simbolo"], b["estrategia"]["intervalo"])]

    # 1) Mercados y precios. Cada mercado se descarga con historia suficiente para simular a su trader más antiguo
    #    desde el principio (si no, sus primeras operaciones se perderían).
    edad: dict[tuple[str, str], int] = {}
    for id_, t in [*traders.items(), *incubadora.items()]:
        e = estrategia_de(id_)
        if e:
            clave = (e["simbolo"], e["intervalo"])
            edad[clave] = max(edad.get(clave, 0), (ahora - pd.Timestamp(t["inicio"])).days)
    mercados: dict[tuple[str, str], Mercado] = {}
    claves = [(b["estrategia"]["simbolo"], b["estrategia"]["intervalo"]) for b in en_banco.values()]
    claves += [(e["simbolo"], e["intervalo"]) for e in map(estrategia_de, fuera + fuera_inc) if e]
    for clave in claves:
        if clave in mercados:
            continue
        m = mercados[clave] = Mercado(velas(*clave, max(dias_de(clave[1]), edad.get(clave, 0) + 5)), *clave)
        velas_dia = max(1, 1440 // m.minutos)
        (precios_scalping if es_scalping(clave[1]) else precios)[clave[0]] = {
            "precio": float(m.c[-1]),
            "cambio_24h_pct": round(float(m.c[-1] / m.c[-1 - velas_dia] - 1) * 100, 2),
            "serie": [float(x) for x in m.c[-72:]],
            "vela": m.tiempo[-1].isoformat(),
        }
    estado["datos_mercado"] = [{"simbolo": s, "intervalo": iv, "ultima_vela": m.tiempo[-1].isoformat(),
                                "minutos": m.minutos} for (s, iv), m in mercados.items()]

    # 2) Kill switch: todo lo abierto con dinero del fondo se cierra al cierre de la última vela, y el freno manual
    #    impide abrir nada nuevo hasta que pulses «Reabrir». La incubadora sigue: no usa dinero del fondo.
    kill = control.cargar().get("kill_switch")
    if kill and estado.get("kill_aplicado") != kill:
        abiertas_kill = [t for t in traders.values() if t.get("posicion")]
        for t in abiertas_kill:
            t.setdefault("forzadas", []).append(kill)
        estado["kill_aplicado"] = kill
        n_kill = len(abiertas_kill)
        que = "no había ninguna posición abierta" if not n_kill else (
            "se cierra la única posición abierta" if n_kill == 1 else f"se cierran las {n_kill} posiciones abiertas")
        evento("kill", f"¡Kill switch! {que[0].upper() + que[1:]} del fondo al último precio y no se abre nada nuevo hasta que "
                       "pulses «Reabrir». La incubadora sigue: no usa dinero del fondo.",
               cerradas=len(abiertas_kill))

    # 3) Las que se han retirado desde fuera (tú, o por repetidas). En su mesa: lo abierto se cierra al precio del
    #    momento de la retirada y su resultado queda congelado (sigue contando). En la incubadora: no contaba en el fondo.
    for id_ in fuera:
        t, d = traders.pop(id_), descartadas.get(id_)
        if not d or "resultado" not in t:
            continue
        est = Estrategia.de_dict(d["estrategia"])
        m = mercados[(est.simbolo, est.intervalo)]
        t.setdefault("grupo", _grupo(est.intervalo))
        cierre = m.tiempo + pd.Timedelta(minutes=m.minutos)
        corte = int(np.searchsorted(cierre, pd.Timestamp(d["retirada"]), side="right"))
        curva, cerradas, _ = _calcular(t, _simular(t, est, m, fin=corte), tramos, medianoche)
        pm = postmortem.informe(d, cerradas, t["inicio"], pd.Timestamp(d["retirada"]), m, d.get("motivo", "retirada"), "mesa")
        banco.anotar(id_, post_mortem=pm)
        retirados[id_] = _congelar(id_, t, curva, cerradas, d.get("motivo", "retirada"), d.get("por", "jefe"), d["retirada"], pm)
        evento("baja", f"{id_} deja {_sala(t['grupo'])} ({d.get('motivo', 'retirada')}). Resultado final: "
                       f"{_precio(t['resultado'])} $, que sigue contando en tu fondo.",
               id=id_, mesa=t.get("mesa"), grupo=t["grupo"], simbolo=est.simbolo, resultado=t["resultado"])
    for id_ in fuera_inc:
        t, d = incubadora.pop(id_), descartadas.get(id_)
        if d:
            pm = postmortem.informe(d, t.get("operaciones", []), t["inicio"], pd.Timestamp(d["retirada"]),
                                    mercados.get((d["estrategia"]["simbolo"], d["estrategia"]["intervalo"])), d.get("motivo", ""), "incubadora")
            banco.anotar(id_, post_mortem=pm)
            suspendidas.insert(0, _suspendida(id_, t, d.get("motivo", "retirada"), d.get("por", "jefe"), pm))

    # 4) Mesas e incubadora. Cada trader tiene su mesa; cada estrategia en examen, su plaza en la incubadora. Las nuevas
    #    entran en la incubadora (primero las mejores fuera de muestra); si está llena, esperan en el banquillo.
    for lista in (traders, incubadora):
        for id_, t in lista.items():
            e = en_banco[id_]["estrategia"]
            t["intervalo"], t["grupo"] = e["intervalo"], _grupo(e["intervalo"])
    ocupadas = {g: {t["mesa"] for t in traders.values() if t["grupo"] == g and t.get("mesa") is not None} for g in MESAS}
    for id_ in sorted((i for i in traders if traders[i].get("mesa") is None), key=lambda i: (str(traders[i]["inicio"]), i)):
        g = traders[id_]["grupo"]   # traders de versiones anteriores: en el orden en que llegaron, como en la oficina
        libres = sorted(set(range(MESAS[g])) - ocupadas[g])
        if libres:
            traders[id_]["mesa"] = libres[0]
            ocupadas[g].add(libres[0])
    plazas = {g: {t["plaza"] for t in incubadora.values() if t["grupo"] == g} for g in INCUBADORA}
    antes_en_banquillo = {r["id"] for r in estado.get("banquillo", [])}
    banquillo = []
    for b in sorted((b for b in en_banco.values() if b["id"] not in traders and b["id"] not in incubadora),
                    key=banco.calidad, reverse=True):
        g = _grupo(b["estrategia"]["intervalo"])
        libres = sorted(set(range(INCUBADORA[g]["plazas"])) - plazas[g])
        if not libres:
            banquillo.append(b)
            if b["id"] not in antes_en_banquillo:
                evento("banquillo", f"{b['id']} ha superado las seis pruebas, pero las {INCUBADORA[g]['plazas']} plazas de la "
                                    f"incubadora de {'scalping' if g == 'scalping' else 'trading'} están ocupadas: espera en el banquillo.",
                       id=b["id"], simbolo=b["estrategia"]["simbolo"], grupo=g)
            continue
        plazas[g].add(libres[0])
        t = incubadora[b["id"]] = _nuevo_incubado(b, mercado_de(b), libres[0])
        p = INCUBADORA[g]
        evento("incubadora", f"{b['id']} entra en la incubadora (plaza {libres[0] + 1}): {('LARGO' if t['direccion'] == 'largo' else 'CORTO')} en "
                             f"{t['simbolo']} con {_precio(CAPITAL_INCUBADORA)} $ de prueba que no cuentan en tu fondo. Para subir a una "
                             f"mesa tiene que aprobar el examen: {p['operaciones']} operaciones ganando, con factor de beneficio de "
                             f"{p['factor_min']:g} o más.".replace("1.1", "1,1"),
               id=b["id"], simbolo=t["simbolo"], direccion=t["direccion"], grupo=g, plaza=libres[0])

    # 5) Simulación de las mesas con la gestión de riesgo: cada entrada nueva se aprueba o se veta una sola vez.
    def simular_trader(id_: str):
        b, t = en_banco[id_], traders[id_]
        est = Estrategia.de_dict(b["estrategia"])
        return _simular(t, est, mercados[(est.simbolo, est.intervalo)])

    sims = {id_: simular_trader(id_) for id_ in traders}
    for id_, sim in sims.items():  # estados de versiones anteriores: lo ya operado se da por aprobado
        t = traders[id_]
        if "aprobadas" not in t:
            t["vetadas"] = []
            t["aprobadas"] = [sim[1].tiempo[e].isoformat() for e in sim[3].entradas] if sim else []
    pausa_caida = estado.setdefault("pausa_caida", {})
    reabierto = control.cargar().get("reabierto")
    if reabierto and pausa_caida.get("hasta") and pd.Timestamp(reabierto) > pd.Timestamp(pausa_caida["desde"]):
        pausa_caida["hasta"] = reabierto   # pulsaste «Reabrir»: la pausa por caída termina ya y la caída se mide desde aquí
        riesgo.vigilar_caida(pausa_caida, estado.get("resumen"), estado.get("curva"))
    bloqueo = riesgo.bloqueo_general(estado.get("resumen"), estado.get("curva"), pausa_caida)
    vetos = estado.get("riesgo", {}).get("vetos", [])

    def abiertas_en(momento: pd.Timestamp, scalping: bool, salvo: str) -> list[tuple[str, str]]:
        """Posiciones aprobadas de la misma sala que estaban abiertas justo cuando entra `salvo`."""
        lista = []
        for i, s_ in sims.items():
            if not s_ or i == salvo or traders[i]["grupo"] != ("scalping" if scalping else "trading"):
                continue
            est_, m_, _, res_ = s_
            aprobadas_ = aprobadas[i]
            for k, e in enumerate(res_.entradas):
                if m_.tiempo[e] > momento:
                    break
                if m_.tiempo[e].isoformat() in aprobadas_ and (res_.motivos[k] == "abierta" or m_.tiempo[res_.salidas[k]] >= momento):
                    lista.append((est_.simbolo, est_.direccion))
        return lista

    aprobadas = {id_: set(t["aprobadas"]) for id_, t in traders.items()}
    for _ in range(6):
        pendientes = []
        for id_, sim in sims.items():
            if sim:
                est, m, _, res = sim
                for j, e in enumerate(res.entradas):
                    if m.tiempo[e].isoformat() not in aprobadas[id_]:
                        pendientes.append((m.tiempo[e], id_, j))
        if not pendientes:
            break
        cambiados = set()
        for momento, id_, j in sorted(pendientes, key=lambda x: (x[0], x[1])):
            if id_ in cambiados:
                continue  # tras un veto hay que volver a simular a este trader antes de seguir
            est, m, _, res = sims[id_]
            te = momento.isoformat()
            scalping = traders[id_]["grupo"] == "scalping"
            motivo = riesgo.evaluar_entrada(id_, est.simbolo, est.direccion, abiertas_en(momento, scalping, id_),
                                            bloqueo, scalping, lim)
            if motivo:
                traders[id_]["vetadas"].append(te)
                cambiados.add(id_)
                lado = "LARGO" if est.direccion == "largo" else "CORTO"
                evento("veto", f"Riesgos veta a {id_} ({lado} en {est.simbolo}): {motivo}",
                       id=id_, simbolo=est.simbolo, direccion=est.direccion, motivo=motivo)
                vetos = [{"t": _ahora(), "id": id_, "simbolo": est.simbolo, "direccion": est.direccion, "motivo": motivo}] + vetos
            else:
                traders[id_]["aprobadas"].append(te)
                aprobadas[id_].add(te)
        for id_ in cambiados:
            sims[id_] = simular_trader(id_)

    # 6) Resultados de cada trader. El tamaño de cada operación sale del riesgo por operación o, con 30 operaciones
    #    reales o más (contando las del examen), del Kelly prudente.
    curvas: dict[str, pd.Series] = {}
    for id_, t in traders.items():
        movs = list((t.get("examen") or {}).get("movimientos", [])) + [o["movimiento_pct"] for o in t.get("operaciones", [])]
        t["kelly"] = _kelly(movs, base)
        sim = sims[id_]
        curva, cerradas, posicion = _calcular(t, sim, tramos, medianoche,
                                              riesgo_op=t["kelly"]["riesgo_pct"] / 100 if t["kelly"] else base)
        if curva is not None:
            curvas[id_] = curva
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

    # 7) La incubadora: opera todas sus señales (sin vetos de sala: no usa dinero del fondo) con un capital de prueba
    #    fijo y el riesgo por operación de siempre. Después, el examen.
    for id_, t in list(incubadora.items()):
        b = en_banco[id_]
        est, m = Estrategia.de_dict(b["estrategia"]), mercado_de(b)
        sim = _simular(t, est, m)
        _, t["operaciones"], t["posicion"] = _calcular(t, sim, None, medianoche, capital=CAPITAL_INCUBADORA, riesgo_op=base)
        if sim:
            t["radar"] = _radar(est, m)
        t["examen"] = _examen(t, ahora)
        ex = t["examen"]
        if ex["estado"] == "suspendida":
            pm = postmortem.informe(b, t["operaciones"], t["inicio"], ahora, m, ex["motivo"], "incubadora")
            banco.descartar(id_, f"suspende el examen de la incubadora: {ex['motivo']}", por="incubadora", post_mortem=pm)
            del incubadora[id_], en_banco[id_]
            suspendidas.insert(0, _suspendida(id_, t, ex["motivo"], "incubadora", pm))
            evento("suspende", f"{id_} suspende el examen de la incubadora: {ex['motivo']}. Se descarta sin haber tocado tu dinero; "
                               f"el post mortem dice: {pm['causas'][0]['texto']}",
                   id=id_, grupo=t["grupo"], plaza=t.get("plaza"), simbolo=t["simbolo"], resultado=t["resultado"])
        elif ex["estado"] == "aprobada" and not t.get("aviso_aprobada"):
            t["aviso_aprobada"] = True
            evento("aprueba", f"{id_} aprueba el examen de la incubadora: {ex['motivo']}. Sube a una mesa con dinero del fondo "
                              "en cuanto haya una libre.", id=id_, grupo=t["grupo"], plaza=t.get("plaza"), simbolo=t["simbolo"])
    del suspendidas[40:]

    def aprobadas_de(g: str) -> list[str]:   # las aprobadas sin nada abierto, de la mejor nota a la peor
        return sorted((i for i, t in incubadora.items() if t["grupo"] == g and t["examen"]["estado"] == "aprobada"),
                      key=lambda i: incubadora[i]["examen"]["nota"], reverse=True)

    def promover(id_: str, mesa: int) -> dict:
        """Una aprobada de la incubadora sube a una mesa con dinero del fondo (desde la próxima vela)."""
        inc = incubadora.pop(id_)
        b = en_banco[id_]
        nuevo = traders[id_] = _nuevo_trader(b, mercado_de(b), mesa)
        ex = inc["examen"]
        nuevo["examen"] = {**{k: ex[k] for k in ("estado", "operaciones", "resultado_pct", "factor", "nota", "aciertos_pct", "dias")},
                           "inicio": inc["inicio"], "fin": _ahora(), "plaza": inc.get("plaza"),
                           "movimientos": [o["movimiento_pct"] for o in inc["operaciones"]]}
        nuevo["prueba"], _ = _prueba(nuevo, ahora)
        return nuevo

    # 8) El supervisor de cada sala revisa el periodo de prueba de sus traders. Al que no es rentable le retira la
    #    estrategia (cuando no tiene nada abierto) y le da la mejor aprobada de la incubadora, en la misma mesa.
    sin_recambio = set()
    for id_ in sorted(traders, key=lambda i: (traders[i]["grupo"], traders[i].get("mesa") or 0)):
        t = traders[id_]
        t["prueba"], motivo = _prueba(t, ahora)
        if not motivo:
            continue
        g, mesa = t["grupo"], t.get("mesa")
        sup = SUPERVISORES[g]
        b = en_banco[id_]
        pm = postmortem.informe(b, t["operaciones"], t["inicio"], ahora, mercado_de(b), motivo, "mesa")
        retirados[id_] = _congelar(id_, t, curvas.pop(id_, None), t["operaciones"], f"no era rentable: {motivo}", "supervisor",
                                   _ahora(), pm)
        banco.descartar(id_, f"no era rentable: {motivo}", por="supervisor", post_mortem=pm)
        del traders[id_], en_banco[id_]
        candidatas = aprobadas_de(g)
        datos = dict(anterior=id_, mesa=mesa, grupo=g, motivo=motivo, supervisor=sup, resultado=retirados[id_]["resultado"],
                     causa=pm["causas"][0]["texto"])
        if candidatas and mesa is not None:
            nuevo = promover(candidatas[0], mesa)
            ex = nuevo["examen"]
            lado = "LARGO" if nuevo["direccion"] == "largo" else "CORTO"
            evento("relevo", f"{sup} cambia la estrategia de la mesa {mesa + 1}: retira {id_} porque {motivo}. Ahora opera "
                             f"{candidatas[0]}, la mejor aprobada de la incubadora (ganó un {_pct(ex['resultado_pct'])[1:]} en "
                             f"{ex['operaciones']} operaciones de examen): {lado} en {nuevo['simbolo']}, desde la próxima vela.",
                   id=candidatas[0], simbolo=nuevo["simbolo"], direccion=nuevo["direccion"], **datos)
        else:
            donde = "" if mesa is None else f" de la mesa {mesa + 1}"
            evento("relevo", f"{sup} retira {id_}{donde} porque {motivo}. No hay ninguna estrategia aprobada en la incubadora: "
                             "la mesa espera a la próxima que apruebe el examen.",
                   id=None, simbolo=t["simbolo"], direccion=t["direccion"], **datos)
            sin_recambio.add(g)

    # 9) Las aprobadas suben a las mesas libres, la mejor nota primero.
    for g in MESAS:
        libres = sorted(set(range(MESAS[g])) - {t["mesa"] for t in traders.values() if t["grupo"] == g and t.get("mesa") is not None})
        for id_, mesa in zip(aprobadas_de(g), libres):
            nuevo = promover(id_, mesa)
            ex = nuevo["examen"]
            lado = "LARGO" if nuevo["direccion"] == "largo" else "CORTO"
            evento("alta", f"{id_} aprueba en la incubadora y sube a la mesa {mesa + 1} de {_sala(g)}: {lado} en {nuevo['simbolo']}, "
                           f"con {_precio(nuevo['capital'])} $ del fondo desde la próxima vela (examen: {_pct(ex['resultado_pct'])} "
                           f"en {ex['operaciones']} operaciones).",
                   id=id_, simbolo=nuevo["simbolo"], direccion=nuevo["direccion"], grupo=g, mesa=mesa,
                   plaza=ex.get("plaza"), graduada=True)

    # 10) Si el supervisor ha dejado una mesa sin recambio y no queda nada en la incubadora ni en el banquillo de esa
    #     sala, pide un ciclo de búsqueda (uno solo).
    for g in sin_recambio:
        en_camino = sum(t["grupo"] == g for t in incubadora.values()) + sum(_grupo(b["estrategia"]["intervalo"]) == g for b in banquillo)
        if not en_camino and control.pedir_busqueda(g, por="supervisor"):
            evento("busqueda", f"{SUPERVISORES[g]} pide una búsqueda de estrategias {'de scalping ' if g == 'scalping' else ''}"
                               "para tener recambio: la incubadora está vacía (un solo ciclo).", grupo=g, supervisor=SUPERVISORES[g])

    # 11) Cifras de las salas (con lo que hicieron las estrategias retiradas), de la incubadora y estado de riesgo.
    pnl = list(curvas.values()) + [_serie(r["serie"]) for r in retirados.values() if r["serie"]]
    estado["resumen"], estado["curva"], estado["diarios"] = _resumen(pnl, traders, retirados)
    estado["grupos"] = {g: _resumen_grupo([t for t in traders.values() if t["grupo"] == g],
                                          [r for r in retirados.values() if r.get("grupo") == g], medianoche) for g in MESAS}
    estado["grupos_incubadora"] = {g: {**_resumen_grupo([t for t in incubadora.values() if t["grupo"] == g], [], medianoche),
                                       "plazas": INCUBADORA[g]["plazas"],
                                       "aprobadas": sum(t["grupo"] == g and t["examen"]["estado"] == "aprobada" for t in incubadora.values()),
                                       "suspendidas": sum(s["grupo"] == g for s in suspendidas)} for g in INCUBADORA}
    estado["series"] = {g: _serie_horaria([c for i, c in curvas.items() if traders[i]["grupo"] == g]
                                          + [_serie(r["serie"]) for r in retirados.values() if r["grupo"] == g and r["serie"]])
                        for g in ("trading", "scalping")}   # para el fondo: toda la historia, hora a hora
    estado["banquillo"] = [{"id": b["id"], "grupo": _grupo(b["estrategia"]["intervalo"]), "simbolo": b["estrategia"]["simbolo"],
                            "direccion": b["estrategia"]["direccion"], "descripcion": b["descripcion"],
                            "calidad": round(banco.calidad(b), 3), "fuera_pct": (b.get("fuera") or {}).get("retorno_pct")}
                           for b in banquillo]
    cambio_caida = riesgo.vigilar_caida(pausa_caida, estado["resumen"], estado["curva"])
    nuevo_bloqueo = riesgo.bloqueo_general(estado["resumen"], estado["curva"], pausa_caida)
    anterior = estado.get("riesgo", {}).get("bloqueo")
    if nuevo_bloqueo and (not anterior or cambio_caida == "pausa"):
        evento("freno", f"¡Freno de riesgo! {nuevo_bloqueo[0].upper() + nuevo_bloqueo[1:]}. No se abren posiciones nuevas.",
               motivo=nuevo_bloqueo)
    elif anterior and not nuevo_bloqueo:
        evento("reanuda", "Se levanta el freno de riesgo: se vuelven a permitir entradas."
               + (" Acaba la pausa por caída y la caída se vuelve a contar desde el resultado de ahora." if cambio_caida == "reanuda" else ""))
    abiertas = {g: [(t["simbolo"], t["direccion"]) for t in traders.values() if t["posicion"] and t["grupo"] == g]
                for g in ("trading", "scalping")}
    estado["riesgo"] = riesgo.estado(estado["resumen"], estado["curva"], abiertas["trading"], nuevo_bloqueo, vetos,
                                     abiertas["scalping"], pausa_caida)
    estado["capital_por_estrategia"] = fondo.capital_mesa("trading")
    estado["capital_scalper"] = fondo.capital_mesa("scalping")
    estado["actividad"] = (eventos[::-1] + estado.get("actividad", []))[:ACTIVIDAD_MAX]
    estado["actualizado"] = _ahora()
    return eventos


def _suspendida(id_: str, t: dict, motivo: str, por: str, pm: dict) -> dict:
    """Lo que se guarda de una estrategia que deja la incubadora sin aprobar (no contaba en tu fondo)."""
    return {"id": id_, "grupo": t["grupo"], "plaza": t.get("plaza"), "simbolo": t["simbolo"], "direccion": t["direccion"],
            "descripcion": t.get("descripcion", ""), "inicio": t["inicio"], "fin": _ahora(), "motivo": motivo, "por": por,
            "resultado": t.get("resultado", 0.0), "operaciones": len(t.get("operaciones", [])),
            "examen": {k: v for k, v in (t.get("examen") or {}).items() if k != "motivo"}, "post_mortem": pm}


def operar(segundos: float = 20, telegram: bool = False, parar: threading.Event | None = None) -> None:
    """Bucle del paper trading: un ciclo cada `segundos` hasta que se pida parar. Cada vuelta deja en
    sistema.json cuánto ha tardado y si ha habido errores (lo enseña el equipo de infraestructura)."""
    parar = parar or threading.Event()
    print(f"[papel] Paper trading en marcha (dinero ficticio). Reviso el mercado cada {segundos:g} s.", flush=True)
    try:   # la primera vez con sala de tendencia, recibe parte del % de la sala de trading (una sola vez)
        from .tendencia import estrenar

        if texto := estrenar():
            print(f"[tendencia] {texto}", flush=True)
    except Exception as e:
        print(f"[tendencia] No he podido estrenar la sala de tendencia (lo reintento al volver a arrancar): {e}", flush=True)
    ultima_vela = None
    sistema = almacen.cargar("sistema", {})
    while not parar.is_set():
        t0 = time.monotonic()
        papel = sistema.setdefault("papel", {})
        try:
            estado = almacen.cargar("papel", {})
            eventos = ciclo(estado)
            almacen.guardar("papel", estado)
            papel.update(ok=_ahora(), ciclo_s=round(time.monotonic() - t0, 2), errores_seguidos=0,
                         traders=len(estado.get("estrategias", {})), incubadora=len(estado.get("incubadora", {})),
                         mercados=estado.get("datos_mercado", []))
            for ev in eventos:
                print(f"[papel {dt.datetime.now():%H:%M}] {ev['texto']}", flush=True)
                if telegram and ev["tipo"] in ("apertura", "cierre", "relevo", "kill"):
                    _telegram(f"📊 {ev['texto']}")
            traders = estado.get("estrategias", {})
            vela = max((p["vela"] for p in estado.get("precios", {}).values()), default=None)
            if traders and vela != ultima_vela:
                ultima_vela = vela
                total = sum(t["patrimonio"] for t in traders.values())
                inicial = sum(t.get("capital", CAPITAL_POR_ESTRATEGIA) for t in traders.values())
                abiertas = sum(1 for t in traders.values() if t["posicion"])
                print(f"[papel {dt.datetime.now():%H:%M}] Patrimonio {_precio(total)} $ "
                      f"({_pct((total / inicial - 1) * 100)}) · {len(traders)} traders · "
                      f"{len(estado.get('incubadora', {}))} en la incubadora · {abiertas} posiciones abiertas", flush=True)
        except Exception as e:  # sin conexión, etc.: se reintenta en el siguiente ciclo
            papel.update(errores_seguidos=papel.get("errores_seguidos", 0) + 1, ultimo_error=f"{type(e).__name__}: {e}"[:300],
                         error_t=_ahora())
            print(f"[papel] Error en el ciclo (lo reintento): {e}", flush=True)
        hold = sistema.setdefault("holding", {})
        try:
            from .holding import actualizar

            for ev in actualizar():
                print(f"[holding {dt.datetime.now():%H:%M}] {ev['texto']}", flush=True)
                if telegram and ev["tipo"] in ("compra", "venta", "aportacion"):
                    _telegram(f"💎 {ev['texto']}")
            hold.update(ok=_ahora(), errores_seguidos=0)
        except Exception as e:
            hold.update(errores_seguidos=hold.get("errores_seguidos", 0) + 1, ultimo_error=f"{type(e).__name__}: {e}"[:300],
                        error_t=_ahora())
            print(f"[holding] Error en el ciclo (lo reintento): {e}", flush=True)
        tend = sistema.setdefault("tendencia", {})
        try:
            from .tendencia import actualizar as actualizar_tendencia

            for ev in actualizar_tendencia():
                print(f"[tendencia {dt.datetime.now():%H:%M}] {ev['texto']}", flush=True)
                if telegram and ev["tipo"] in ("compra", "venta"):
                    _telegram(f"📈 {ev['texto']}")
            tend.update(ok=_ahora(), errores_seguidos=0)
        except Exception as e:
            tend.update(errores_seguidos=tend.get("errores_seguidos", 0) + 1, ultimo_error=f"{type(e).__name__}: {e}"[:300],
                        error_t=_ahora())
            print(f"[tendencia] Error en el ciclo (lo reintento): {e}", flush=True)
        papel["vuelta_s"] = round(time.monotonic() - t0, 2)
        try:
            almacen.guardar("sistema", sistema)
        except OSError:
            pass
        # Espera al siguiente ciclo, pero si entra una estrategia en el banco se pone en marcha ya.
        fin = time.monotonic() + segundos
        while not parar.is_set() and not banco.nueva.is_set() and time.monotonic() < fin:
            parar.wait(min(1.0, max(0.0, fin - time.monotonic())))
        banco.nueva.clear()
