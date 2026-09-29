"""Pruebas de robustez: el embudo que separa las estrategias con ventaja de las que tuvieron suerte.

Si pruebas miles de estrategias al azar, algunas salen espectaculares en el pasado por pura
casualidad. Cada prueba intenta pillar una forma distinta de "suerte":

- Fuera de muestra: ¿sigue ganando en el 30 % final de los datos, que la minería nunca vio?
- Costes x2:        ¿aguanta si comisiones y deslizamiento son el doble de lo previsto?
- Consistencia:     ¿gana en la mayoría de los tramos del periodo, o solo en una racha?
- Monte Carlo:      barajando el orden de sus operaciones, ¿el peor 5 % de casos sigue en positivo?
- Estabilidad:      con parámetros vecinos (RSI 21 en vez de 14...), ¿sigue ganando?
- Test del mono:    en los datos que no vio, ¿gana a "monos" que entran en momentos al azar
                    con las mismas salidas?
"""

from __future__ import annotations

from collections.abc import Iterator

import numpy as np

from .backtest import simular
from .config import COSTE_IDA_VUELTA
from .estrategia import Estrategia, vecina
from .mercado import Mercado

# Filtro de entrada al embudo, sobre el 70 % inicial de los datos.
MIN_OPERACIONES = 60
MIN_FACTOR_BENEFICIO = 1.25
MAX_DRAWDOWN_PCT = 35.0

ETAPAS = [
    "Generadas",
    "Rentables en muestra",
    "Fuera de muestra",
    "Costes x2",
    "Consistencia",
    "Monte Carlo",
    "Estabilidad",
    "Test del mono",
    "Distinta a las del banco",
]

TRAMOS = 6
REMUESTREOS = 1000
VECINAS = 20
MONOS = 100


def rentable_en_muestra(met: dict) -> bool:
    return (
        met["operaciones"] >= MIN_OPERACIONES
        and met["factor_beneficio"] >= MIN_FACTOR_BENEFICIO
        and met["retorno_pct"] > 0
        and met["max_dd_pct"] <= MAX_DRAWDOWN_PCT
    )


def _pct(x: float) -> str:
    return f"{x:+.1f} %".replace(".", ",")


def _dec(x: float) -> str:
    return f"{x:.2f}".replace(".", ",")


def pruebas(est: Estrategia, m: Mercado, corte: int, rng: np.random.Generator) -> Iterator[tuple[str, bool, str, dict]]:
    """Pasa la estrategia por el embudo. Genera (etapa, superada, detalle, datos) y se
    detiene en la primera prueba que no supera."""
    fuera = simular(est, m, inicio=corte).metricas
    yield (
        "Fuera de muestra",
        fuera["operaciones"] >= 15 and fuera["factor_beneficio"] >= 1.1 and fuera["retorno_pct"] > 0,
        f"{_pct(fuera['retorno_pct'])} con {fuera['operaciones']} operaciones, "
        f"factor de beneficio {_dec(fuera['factor_beneficio'])}",
        {"fuera": fuera},
    )

    caro = simular(est, m, coste=2 * COSTE_IDA_VUELTA).metricas
    yield (
        "Costes x2",
        caro["retorno_pct"] > 0 and caro["factor_beneficio"] >= 1.05,
        f"con el doble de costes: {_pct(caro['retorno_pct'])}",
        {},
    )

    total = simular(est, m)
    limites = np.linspace(1, len(m), TRAMOS + 1).astype(int)
    tramo = np.searchsorted(limites, total.salidas, side="right") - 1
    suma = np.bincount(tramo, weights=np.log1p(np.maximum(total.retornos, -0.99)), minlength=TRAMOS)
    con_ops = np.bincount(tramo, minlength=TRAMOS) > 0
    ganadores = int((suma[con_ops] > 0).sum())
    yield (
        "Consistencia",
        con_ops.sum() >= 4 and ganadores >= 2 / 3 * con_ops.sum(),
        f"gana en {ganadores} de {int(con_ops.sum())} tramos del periodo",
        {"total": total.metricas},
    )

    muestras = rng.choice(total.retornos, size=(REMUESTREOS, len(total.retornos)), replace=True)
    curvas = np.cumprod(1 + muestras, axis=1)
    picos = np.maximum.accumulate(np.concatenate([np.ones((REMUESTREOS, 1)), curvas], axis=1), axis=1)[:, 1:]
    peor_retorno = float(np.percentile(curvas[:, -1] - 1, 5)) * 100
    peor_dd = float(np.percentile((1 - curvas / picos).max(axis=1), 95)) * 100
    yield (
        "Monte Carlo",
        peor_retorno > 0 and peor_dd < 50,
        f"peor 5 % de {REMUESTREOS} barajados: {_pct(peor_retorno)}, caída máx. {peor_dd:.0f} %",
        {"monte_carlo": {"peor_retorno_pct": round(peor_retorno, 2), "peor_dd_pct": round(peor_dd, 2)}},
    )

    ganan = sum(
        (r := simular(vecina(est, rng), m).metricas)["retorno_pct"] > 0 and r["factor_beneficio"] > 1
        for _ in range(VECINAS)
    )
    yield (
        "Estabilidad",
        ganan >= 0.7 * VECINAS,
        f"{ganan} de {VECINAS} variantes con parámetros vecinos también ganan",
        {},
    )

    senal = est.senal(m)
    desplazamientos = rng.integers(int(0.05 * len(m)), int(0.95 * len(m)), size=MONOS)
    monos = np.array([
        simular(est, m, inicio=corte, senal=np.roll(senal, int(s))).metricas["retorno_pct"]
        for s in desplazamientos
    ])
    supera = float((monos < fuera["retorno_pct"]).mean()) * 100
    yield (
        "Test del mono",
        supera >= 90,
        f"fuera de muestra, mejor que el {supera:.0f} % de {MONOS} monos que entran al azar",
        {"mono_pct": supera},
    )
