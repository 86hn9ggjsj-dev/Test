"""Velas históricas de Binance (API pública de solo lectura, sin claves) con caché en disco."""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request

import pandas as pd

from .config import DATA_DIR, DIAS_HISTORICO, INTERVALO

URL = "https://data-api.binance.vision/api/v3/klines"
MINUTOS = {"15m": 15, "30m": 30, "1h": 60, "4h": 240, "1d": 1440}
COLUMNAS = ["open", "high", "low", "close", "volume"]


def _pedir(simbolo: str, intervalo: str, desde_ms: int) -> list[list]:
    consulta = urllib.parse.urlencode(
        {"symbol": simbolo, "interval": intervalo, "startTime": desde_ms, "limit": 1000}
    )
    req = urllib.request.Request(f"{URL}?{consulta}", headers={"User-Agent": "trading-floor"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        if e.code == 400:
            raise ValueError(f"Binance no reconoce el símbolo {simbolo} (ejemplos: BTCUSDT, ETHUSDT).") from e
        raise


def velas(simbolo: str, intervalo: str = INTERVALO, dias: int = DIAS_HISTORICO) -> pd.DataFrame:
    """Velas cerradas de los últimos `dias` días. Solo descarga lo que falta en la caché."""
    if intervalo not in MINUTOS:
        raise ValueError(f"Intervalo no soportado: {intervalo} (usa uno de {', '.join(MINUTOS)}).")
    simbolo = simbolo.upper()
    ruta = DATA_DIR / "datos" / f"{simbolo}_{intervalo}.csv"
    ruta.parent.mkdir(exist_ok=True)

    ahora_ms = int(time.time() * 1000)
    desde_ms = ahora_ms - dias * 86_400_000
    cache = None
    if ruta.exists():
        cache = pd.read_csv(ruta, index_col=0, parse_dates=True)
        primera_ms = int(cache.index[0].timestamp() * 1000) if len(cache) else ahora_ms
        if len(cache) and primera_ms <= desde_ms + 2 * 86_400_000:
            desde_ms = int(cache.index[-1].timestamp() * 1000) + 1
        else:
            cache = None  # la caché tiene menos historia de la que se pide: se descarga entera

    filas = []
    while desde_ms < ahora_ms:
        lote = _pedir(simbolo, intervalo, desde_ms)
        filas += [k for k in lote if k[6] < ahora_ms]  # solo velas ya cerradas
        if len(lote) < 1000:
            break
        desde_ms = lote[-1][0] + 1

    nuevas = pd.DataFrame(
        [[float(x) for x in k[1:6]] for k in filas],
        index=pd.to_datetime([k[0] for k in filas], unit="ms", utc=True),
        columns=COLUMNAS,
    )
    df = nuevas if cache is None else pd.concat([cache, nuevas])
    df = df[~df.index.duplicated(keep="last")].sort_index()
    if len(nuevas) or cache is None:
        df.to_csv(ruta)
    if df.empty:
        raise ValueError(f"No hay datos de {simbolo} en Binance.")
    return df[df.index >= pd.Timestamp(ahora_ms - dias * 86_400_000, unit="ms", tz="UTC")]
