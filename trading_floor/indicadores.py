"""Indicadores técnicos sobre arrays de numpy."""

from __future__ import annotations

import numpy as np
import pandas as pd


def sma(x: np.ndarray, n: int) -> np.ndarray:
    return pd.Series(x).rolling(n).mean().to_numpy()


def desviacion(x: np.ndarray, n: int) -> np.ndarray:
    return pd.Series(x).rolling(n).std(ddof=0).to_numpy()


def ema(x: np.ndarray, n: int) -> np.ndarray:
    return pd.Series(x).ewm(span=n, adjust=False, min_periods=n).mean().to_numpy()


def _wilder(x: np.ndarray, n: int) -> np.ndarray:
    return pd.Series(x).ewm(alpha=1 / n, adjust=False, min_periods=n).mean().to_numpy()


def rsi(c: np.ndarray, n: int) -> np.ndarray:
    d = np.diff(c, prepend=np.nan)
    sube = _wilder(np.where(d > 0, d, 0.0), n)
    baja = _wilder(np.where(d < 0, -d, 0.0), n)
    with np.errstate(divide="ignore", invalid="ignore"):
        return 100 - 100 / (1 + sube / baja)


def atr(h: np.ndarray, l: np.ndarray, c: np.ndarray, n: int) -> np.ndarray:
    previo = np.concatenate([[np.nan], c[:-1]])
    rango = np.fmax(h - l, np.fmax(np.abs(h - previo), np.abs(l - previo)))
    return _wilder(rango, n)


def maximo_previo(h: np.ndarray, n: int) -> np.ndarray:
    """Máximo de las `n` velas anteriores (sin contar la actual)."""
    return pd.Series(h).rolling(n).max().shift(1).to_numpy()


def minimo_previo(l: np.ndarray, n: int) -> np.ndarray:
    return pd.Series(l).rolling(n).min().shift(1).to_numpy()


def macd_hist(c: np.ndarray) -> np.ndarray:
    linea = ema(c, 12) - ema(c, 26)
    return linea - pd.Series(linea).ewm(span=9, adjust=False, min_periods=9).mean().to_numpy()


def roc(c: np.ndarray, n: int) -> np.ndarray:
    """Variación respecto a hace `n` velas."""
    out = np.full(len(c), np.nan)
    out[n:] = c[n:] / c[:-n] - 1
    return out
