"""Datos de mercado en arrays de numpy, con cada indicador calculado una sola vez."""

from __future__ import annotations

import numpy as np
import pandas as pd

from . import indicadores as ind
from .datos import MINUTOS

_CALCULOS = {
    "atr": lambda m, n: ind.atr(m.h, m.l, m.c, n),
    "atr_media": lambda m, n: ind.sma(m.ind("atr", 14), n),
    "desv": lambda m, n: ind.desviacion(m.c, n),
    "ema": lambda m, n: ind.ema(m.c, n),
    "macd_hist": lambda m: ind.macd_hist(m.c),
    "max": lambda m, n: ind.maximo_previo(m.h, n),
    "min": lambda m, n: ind.minimo_previo(m.l, n),
    "roc": lambda m, n: ind.roc(m.c, n),
    "rsi": lambda m, n: ind.rsi(m.c, n),
    "sma": lambda m, n: ind.sma(m.c, n),
}


class Mercado:
    def __init__(self, velas: pd.DataFrame, simbolo: str, intervalo: str) -> None:
        self.simbolo = simbolo
        self.intervalo = intervalo
        self.tiempo = velas.index
        self.o = velas["open"].to_numpy(float)
        self.h = velas["high"].to_numpy(float)
        self.l = velas["low"].to_numpy(float)
        self.c = velas["close"].to_numpy(float)
        dias = self.tiempo.values.astype("datetime64[D]")
        self.dia = (dias - dias[0]).astype(np.int64)  # nº de día de cada vela, para el Sharpe diario
        self._cache: dict[tuple, np.ndarray] = {}

    def __len__(self) -> int:
        return len(self.c)

    def ind(self, nombre: str, *params) -> np.ndarray:
        clave = (nombre, *params)
        if clave not in self._cache:
            self._cache[clave] = _CALCULOS[nombre](self, *params)
        return self._cache[clave]

    @property
    def minutos(self) -> int:
        return MINUTOS[self.intervalo]
