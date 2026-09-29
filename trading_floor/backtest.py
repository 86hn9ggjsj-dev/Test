"""Simulador de operaciones (backtest) y sus métricas.

Reglas, iguales en el backtest y en el paper trading:
- La señal se mira al cierre de una vela y se entra a la apertura de la siguiente
  (nunca se usa información del futuro).
- Stop y objetivo se fijan a N veces el ATR(14) de la vela de la señal.
- Si en una misma vela se tocan el stop y el objetivo, se asume lo peor: el stop.
- Si el precio abre ya más allá del stop (hueco), se sale a ese precio, peor que el stop.
- Solo hay una operación abierta a la vez; cada operación paga comisión y deslizamiento.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from .config import CAPITAL_BACKTEST, COSTE_IDA_VUELTA
from .estrategia import Estrategia
from .mercado import Mercado


@dataclass
class Resultado:
    entradas: np.ndarray  # índice de la vela de entrada de cada operación
    salidas: np.ndarray  # índice de la vela de salida
    precio_entrada: np.ndarray
    precio_salida: np.ndarray
    retornos: np.ndarray  # rentabilidad de cada operación, ya con costes
    motivos: list[str]  # "stop", "objetivo", "tiempo", "fin" o "abierta"
    metricas: dict

    @property
    def abierta(self) -> bool:
        return bool(self.motivos) and self.motivos[-1] == "abierta"

    def en_mercado(self, n: int) -> np.ndarray:
        """Máscara de las velas en las que la estrategia tiene una posición abierta."""
        mascara = np.zeros(n, dtype=bool)
        for e, s in zip(self.entradas, self.salidas):
            mascara[e : s + 1] = True
        return mascara


def simular(
    est: Estrategia,
    m: Mercado,
    inicio: int = 1,
    fin: int | None = None,
    coste: float = COSTE_IDA_VUELTA,
    cerrar_al_final: bool = True,
    senal: np.ndarray | None = None,
) -> Resultado:
    """Simula la estrategia con entradas en las velas [inicio, fin).

    Con cerrar_al_final=False, una operación que sigue viva al acabar los datos se
    marca como "abierta" (lo usa el paper trading); si no, se cierra en la última vela.
    """
    fin = len(m) if fin is None else min(fin, len(m))
    inicio = max(inicio, 1)
    if senal is None:
        senal = est.senal(m)
    atr = m.ind("atr", 14)
    d = 1.0 if est.direccion == "largo" else -1.0
    avisos = np.flatnonzero(senal[inicio - 1 : fin - 1]) + (inicio - 1)

    entradas, salidas, p_ent, p_sal, motivos = [], [], [], [], []
    k = 0
    while k < len(avisos):
        i = int(avisos[k])
        if not atr[i] > 0:  # ATR aún sin calcular al principio de los datos
            k += 1
            continue
        e = i + 1
        precio = m.o[e]
        stop = precio - d * est.stop_atr * atr[i]
        objetivo = precio + d * est.objetivo_atr * atr[i]
        tope = min(e + est.max_velas, fin)
        altos, bajos = m.h[e:tope], m.l[e:tope]
        toca_stop, toca_obj = (bajos <= stop, altos >= objetivo) if d > 0 else (altos >= stop, bajos <= objetivo)
        n = len(altos)
        js = int(toca_stop.argmax()) if toca_stop.any() else n
        jo = int(toca_obj.argmax()) if toca_obj.any() else n
        if js < n and js <= jo:
            j = e + js
            salida = min(m.o[j], stop) if d > 0 else max(m.o[j], stop)
            motivo = "stop"
        elif jo < n:
            j, salida, motivo = e + jo, objetivo, "objetivo"
        elif e + est.max_velas <= fin:
            j = e + est.max_velas - 1
            salida, motivo = m.c[j], "tiempo"
        else:
            j = fin - 1
            salida, motivo = m.c[j], ("fin" if cerrar_al_final else "abierta")
        entradas.append(e)
        salidas.append(j)
        p_ent.append(precio)
        p_sal.append(salida)
        motivos.append(motivo)
        k = int(np.searchsorted(avisos, j))  # la siguiente señal puede darse en la vela de salida

    p_ent_a, p_sal_a = np.array(p_ent), np.array(p_sal)
    retornos = d * (p_sal_a / p_ent_a - 1) - coste if entradas else np.array([])
    res = Resultado(
        np.array(entradas, dtype=np.int64), np.array(salidas, dtype=np.int64),
        p_ent_a, p_sal_a, retornos, motivos, {},
    )
    res.metricas = metricas(res, m, inicio, fin)
    return res


def metricas(res: Resultado, m: Mercado, inicio: int, fin: int, capital: float = CAPITAL_BACKTEST) -> dict:
    r = res.retornos
    n = len(r)
    base = {"operaciones": n, "desde": m.tiempo[min(inicio, fin - 1)].isoformat(), "hasta": m.tiempo[fin - 1].isoformat()}
    if n == 0:
        return {**base, "retorno_pct": 0.0, "beneficio": 0.0, "anual_pct": 0.0, "max_dd_pct": 0.0,
                "factor_beneficio": 0.0, "aciertos_pct": 0.0, "sharpe": 0.0, "media_op_pct": 0.0,
                "ret_dd": 0.0, "en_mercado_pct": 0.0}

    curva = np.cumprod(1 + r)
    retorno = curva[-1] - 1
    pico = np.maximum.accumulate(np.concatenate([[1.0], curva]))[1:]
    max_dd = float(np.max(1 - curva / pico))
    ganado, perdido = r[r > 0].sum(), -r[r < 0].sum()
    factor = ganado / perdido if perdido > 0 else 99.0

    # Sharpe con la rentabilidad de cada día (365 días al año: el cripto no cierra nunca).
    dias = m.dia[res.salidas] - m.dia[inicio]
    n_dias = int(m.dia[fin - 1] - m.dia[inicio]) + 1
    diario = np.expm1(np.bincount(dias, weights=np.log1p(np.maximum(r, -0.99)), minlength=n_dias))
    sharpe = diario.mean() / diario.std() * np.sqrt(365) if diario.std() > 0 else 0.0

    anios = max((m.tiempo[fin - 1] - m.tiempo[inicio]).total_seconds() / (365.25 * 86400), 1 / 365)
    anual = (1 + retorno) ** (1 / anios) - 1 if retorno > -1 else -1.0
    velas_dentro = int((res.salidas - res.entradas + 1).sum())
    return {
        **base,
        "retorno_pct": round(float(retorno) * 100, 2),
        "beneficio": round(capital * float(retorno), 2),
        "anual_pct": round(float(anual) * 100, 2),
        "max_dd_pct": round(max_dd * 100, 2),
        "factor_beneficio": round(float(factor), 3),
        "aciertos_pct": round(float((r > 0).mean()) * 100, 1),
        "sharpe": round(float(sharpe), 3),
        "media_op_pct": round(float(r.mean()) * 100, 3),
        "ret_dd": round(float(retorno) * 100 / max(max_dd * 100, 1.0), 2),
        "en_mercado_pct": round(velas_dentro / max(fin - inicio, 1) * 100, 1),
    }
