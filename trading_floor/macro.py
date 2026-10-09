"""Sala de macroeconomía: bolsa, volatilidad, dólar, materias primas, bonos y sentimiento cripto.

Es contexto para el comité: las estrategias mineradas NO usan estos datos para operar.
Fuentes gratuitas: Yahoo Finance (vía yfinance) y el índice Fear & Greed de alternative.me.
"""

from __future__ import annotations

import datetime as dt
import json
import logging
import threading
import urllib.request

from . import almacen

logging.getLogger("yfinance").setLevel(logging.CRITICAL)

INDICADORES = {
    "^GSPC": ("S&P 500", "bolsa"),
    "^IXIC": ("Nasdaq", "bolsa"),
    "^VIX": ("VIX (miedo en bolsa)", "volatilidad"),
    "DX-Y.NYB": ("Dólar (DXY)", "divisas"),
    "EURUSD=X": ("EUR/USD", "divisas"),
    "GC=F": ("Oro", "materias"),
    "CL=F": ("Petróleo WTI", "materias"),
    "^TNX": ("Bono EE. UU. 10 años (%)", "tipos"),
    "^IRX": ("Letras EE. UU. 3 meses (%)", "tipos"),   # lo que cobra la liquidez del fondo (liquidez.py)
}
CLASES_FNG = {
    "Extreme Fear": "Miedo extremo", "Fear": "Miedo", "Neutral": "Neutral",
    "Greed": "Codicia", "Extreme Greed": "Codicia extrema",
}


def _fear_greed() -> dict | None:
    req = urllib.request.Request("https://api.alternative.me/fng/?limit=30", headers={"User-Agent": "trading-floor"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        datos = json.load(resp)["data"]
    return {
        "valor": int(datos[0]["value"]),
        "clase": CLASES_FNG.get(datos[0]["value_classification"], datos[0]["value_classification"]),
        "serie": [int(d["value"]) for d in reversed(datos)],
    }


def _regimen(ind: dict) -> tuple[str, str]:
    """Régimen de mercado muy simplificado: ¿apetito por el riesgo (RISK-ON) o huida (RISK-OFF)?"""
    sp, vix = ind.get("^GSPC"), ind.get("^VIX")
    if not sp or not vix:
        return "NEUTRAL", "Faltan datos de bolsa."
    encima = sp["valor"] > sp["media50"]
    if encima and vix["valor"] < 20:
        return "RISK-ON", f"El S&P 500 está sobre su media de 50 días y el VIX en {vix['valor']:.1f}: calma y apetito por el riesgo."
    if not encima and vix["valor"] > 22:
        return "RISK-OFF", f"El S&P 500 está bajo su media de 50 días y el VIX en {vix['valor']:.1f}: miedo, se huye del riesgo."
    return "NEUTRAL", f"Señales mixtas: S&P 500 {'sobre' if encima else 'bajo'} su media de 50 días y VIX en {vix['valor']:.1f}."


def actualizar() -> dict:
    import yfinance as yf

    cierres = yf.download(list(INDICADORES), period="6mo", interval="1d", progress=False, auto_adjust=True)["Close"]
    indicadores = {}
    for ticker, (nombre, grupo) in INDICADORES.items():
        serie = cierres[ticker].dropna() if ticker in cierres else None
        if serie is None or len(serie) < 55:
            continue
        valor = float(serie.iloc[-1])
        indicadores[ticker] = {
            "nombre": nombre,
            "grupo": grupo,
            "valor": round(valor, 4),
            "dia_pct": round((valor / float(serie.iloc[-2]) - 1) * 100, 2),
            "semana_pct": round((valor / float(serie.iloc[-6]) - 1) * 100, 2),
            "media50": round(float(serie.iloc[-50:].mean()), 4),
            "serie": [round(float(x), 4) for x in serie.iloc[-60:]],
        }
    try:
        fng = _fear_greed()
    except (OSError, ValueError, KeyError):
        fng = None
    regimen, explicacion = _regimen(indicadores)
    estado = {
        "actualizado": dt.datetime.now().astimezone().isoformat(timespec="seconds"),
        "indicadores": indicadores,
        "fear_greed": fng,
        "regimen": regimen,
        "explicacion": explicacion,
    }
    almacen.guardar("macro", estado)
    return estado


def vigilar(minutos: float = 15, parar: threading.Event | None = None) -> None:
    """Actualiza los datos macro cada `minutos` (en segundo plano en la oficina)."""
    parar = parar or threading.Event()
    while not parar.is_set():
        try:
            e = actualizar()
            fng = e["fear_greed"]
            print(f"[macro] {e['regimen']} · " + (f"Fear & Greed {fng['valor']} ({fng['clase']})" if fng else "sin Fear & Greed"),
                  flush=True)
        except Exception as ex:  # sin conexión, Yahoo caído...: se reintenta luego
            print(f"[macro] No he podido actualizar los datos macro: {ex}", flush=True)
        parar.wait(minutos * 60)
