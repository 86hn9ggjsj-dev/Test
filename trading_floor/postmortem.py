"""Post mortem: por qué ha fallado una estrategia, comparando lo que prometía el backtest con lo que hizo en real.

Se genera solo al retirar una estrategia (por el supervisor, al suspender el examen de la incubadora o a mano).
Las causas son reglas sencillas y explicables, no adivinación: comisiones que se comen la ventaja, un mercado que
fue en contra, un acierto mucho más bajo que en el backtest, demasiados stops, una volatilidad distinta, una
frecuencia de operaciones muy diferente o, simplemente, muy pocas operaciones para saber nada.
La academia (academia.py) junta estos informes para que la minería aprenda.
"""

from __future__ import annotations

from collections import Counter

import numpy as np
import pandas as pd

from .config import coste_de
from .mercado import Mercado


def _num(x: float, d: int = 1) -> str:
    return f"{x:.{d}f}".replace(".", ",")


def _pct(x: float, d: int = 1) -> str:
    return f"{x:+.{d}f} %".replace(".", ",")


def informe(b: dict, ops: list[dict], inicio: str, fin: pd.Timestamp, m: Mercado | None, motivo: str, fase: str) -> dict:
    """`b` es la entrada del banco (con sus métricas fuera de muestra), `ops` las operaciones cerradas en real y
    `fase` dónde estaba: «incubadora» (dinero de prueba) o «mesa» (dinero del fondo)."""
    est = b["estrategia"]
    direccion, intervalo = est["direccion"], est["intervalo"]
    movs = [float(o.get("movimiento_pct", 0.0)) for o in ops]
    n = len(movs)
    ganadas, perdidas = [x for x in movs if x > 0], [x for x in movs if x <= 0]
    dias = max((pd.Timestamp(fin) - pd.Timestamp(inicio)).total_seconds() / 86400, 1 / 24)
    coste = coste_de(intervalo) * 100
    salidas = Counter(o.get("motivo", "") for o in ops)
    vivo = {
        "operaciones": n, "dias": round(dias, 1),
        "aciertos_pct": round(len(ganadas) / n * 100, 1) if n else None,
        "media_pct": round(float(np.mean(movs)), 3) if n else None,
        "factor": round(sum(ganadas) / abs(sum(perdidas)), 2) if perdidas and sum(perdidas) else None,
        "por_mes": round(n / dias * 30, 1),
        "suma_pct": round(sum(movs), 2),
        "sin_costes_pct": round(sum(movs) + n * coste, 2),
        "salidas": {k: v for k, v in salidas.items() if k},
    }
    fuera = b.get("fuera") or {}
    bt_dias = 0.0
    if fuera.get("desde") and fuera.get("hasta"):
        bt_dias = max((pd.Timestamp(fuera["hasta"]) - pd.Timestamp(fuera["desde"])).total_seconds() / 86400, 1.0)
    backtest = {
        "aciertos_pct": fuera.get("aciertos_pct"), "media_pct": fuera.get("media_op_pct"),
        "factor": fuera.get("factor_beneficio"), "retorno_pct": fuera.get("retorno_pct"),
        "por_mes": round(fuera.get("operaciones", 0) / bt_dias * 30, 1) if bt_dias else None,
    }
    mercado: dict = {}
    if m is not None and len(m):
        i0 = int(np.clip(np.searchsorted(m.tiempo, pd.Timestamp(inicio)), 0, len(m) - 1))
        i1 = int(np.clip(np.searchsorted(m.tiempo, pd.Timestamp(fin)) - 1, i0, len(m) - 1))
        mercado["cambio_pct"] = round(float(m.c[i1] / m.c[i0] - 1) * 100, 2)
        atr_pct = m.ind("atr", 14) / m.c
        vivo_atr = float(np.nanmean(atr_pct[i0:i1 + 1]))
        if fuera.get("desde"):
            r0 = int(np.searchsorted(m.tiempo, pd.Timestamp(fuera["desde"])))
            r1 = int(np.searchsorted(m.tiempo, pd.Timestamp(fuera.get("hasta") or m.tiempo[-1])))
        else:
            r0, r1 = max(0, i0 - 2000), i0
        ref = float(np.nanmean(atr_pct[r0:max(r1, r0 + 1)])) if r1 > r0 else float("nan")
        if np.isfinite(vivo_atr) and np.isfinite(ref) and ref > 0:
            mercado["volatilidad_ratio"] = round(vivo_atr / ref, 2)

    causas: list[dict] = []

    def causa(clave: str, texto: str) -> None:
        causas.append({"clave": clave, "texto": texto})

    if n < 5:
        causa("muestra_corta", f"Solo {n} operaciones: con tan pocas no se puede saber si la estrategia es mala o ha tenido "
                               "mala suerte. Se retira por prudencia, no porque esté demostrado que no sirve.")
    if n and vivo["sin_costes_pct"] > 0 >= vivo["suma_pct"]:
        causa("comisiones", f"Sin comisiones sus operaciones habrían sumado un {_pct(vivo['sin_costes_pct'])}; con ellas suman un "
                            f"{_pct(vivo['suma_pct'])}. Los costes ({_num(coste, 2)} % por operación) se comen su ventaja.")
    cambio = mercado.get("cambio_pct")
    if cambio is not None and ((direccion == "largo" and cambio < -5) or (direccion == "corto" and cambio > 5)):
        lado = "compra (largo)" if direccion == "largo" else "venta en corto"
        causa("mercado_en_contra", f"El mercado fue en contra: {est['simbolo'].replace('USDT', '')} se movió un {_pct(cambio)} "
                                   f"mientras operaba una estrategia de {lado}.")
    if n >= 5 and vivo["aciertos_pct"] is not None and backtest["aciertos_pct"] is not None \
            and vivo["aciertos_pct"] < backtest["aciertos_pct"] - 15:
        causa("acierta_menos", f"Acierta mucho menos que en el backtest ({_num(vivo['aciertos_pct'], 0)} % frente a "
                               f"{_num(backtest['aciertos_pct'], 0)} %): señal de sobreajuste o de que el mercado ha cambiado.")
    if n >= 5 and salidas.get("stop", 0) / n >= .7:
        causa("stops", f"El {_num(salidas['stop'] / n * 100, 0)} % de sus operaciones acabó en stop: el precio se mueve de otra "
                       "manera que en los datos con los que se encontró.")
    ratio = mercado.get("volatilidad_ratio")
    if ratio is not None and (ratio >= 1.5 or ratio <= .67):
        causa("volatilidad", f"El mercado estaba {'mucho más agitado' if ratio >= 1.5 else 'mucho más tranquilo'} que cuando se "
                             f"validó (volatilidad × {_num(ratio, 2)}): sus stops y objetivos dejan de encajar.")
    if backtest["por_mes"] and (n >= 5 or dias >= 14):
        r = vivo["por_mes"] / backtest["por_mes"] if backtest["por_mes"] else 1
        if r >= 2 or r <= .5:
            causa("frecuencia", f"Opera {'mucho más' if r >= 2 else 'mucho menos'} de lo previsto ({_num(vivo['por_mes'])} "
                                f"operaciones al mes frente a {_num(backtest['por_mes'])}): el mercado no es el del backtest.")
    if not causas:
        causa("azar", "No hay una causa clara: el resultado cabe dentro de lo que puede pasar por azar. Un buen backtest no "
                      "garantiza el futuro, por eso se vigila en real.")

    prometia = (f"El backtest prometía {_pct(backtest['retorno_pct'])} fuera de muestra con un "
                f"{_num(backtest['aciertos_pct'] or 0, 0)} % de acierto" if backtest["retorno_pct"] is not None else "")
    real = (f"en real hizo {n} operaciones con un {_num(vivo['aciertos_pct'] or 0, 0)} % de acierto, que suman un "
            f"{_pct(vivo['suma_pct'])}" if n else "en real no llegó a cerrar ninguna operación")
    donde = "en la incubadora (dinero de prueba)" if fase == "incubadora" else "en su mesa (dinero del fondo)"
    conclusion = f"{prometia}; {real} {donde}. {causas[0]['texto']}" if prometia else f"{real[0].upper() + real[1:]} {donde}. {causas[0]['texto']}"
    return {"fase": fase, "motivo": motivo, "fin": pd.Timestamp(fin).isoformat(), "vivo": vivo, "backtest": backtest,
            "mercado": mercado, "causas": causas, "conclusion": conclusion}
