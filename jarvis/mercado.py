"""Cotizaciones (acciones, índices, cripto, divisas) vía Yahoo Finance y alertas de precio."""

from __future__ import annotations

import datetime as dt
import logging

from . import almacen

logging.getLogger("yfinance").setLevel(logging.CRITICAL)


def cotizacion(simbolo: str) -> dict:
    import yfinance as yf

    try:
        info = yf.Ticker(simbolo.upper()).fast_info
        precio = info["last_price"]
        cierre = info["previous_close"]
    except Exception:
        precio = None
    if precio is None:
        raise ValueError(f"Símbolo no encontrado o sin datos: {simbolo}")
    variacion = (precio - cierre) / cierre * 100 if cierre else 0.0
    return {
        "simbolo": simbolo.upper(),
        "precio": round(float(precio), 4),
        "cierre_anterior": round(float(cierre), 4) if cierre else None,
        "variacion_pct": round(variacion, 2),
        "moneda": info["currency"],
    }


def alertas() -> list[dict]:
    return almacen.load("alertas", [])


def crear_alerta(simbolo: str, condicion: str, precio: float) -> dict:
    if condicion not in ("mayor", "menor"):
        raise ValueError("La condición debe ser 'mayor' o 'menor'.")
    items = alertas()
    alerta = {
        "id": max((a["id"] for a in items), default=0) + 1,
        "simbolo": simbolo.upper(),
        "condicion": condicion,
        "precio": precio,
        "creada": dt.datetime.now().isoformat(timespec="minutes"),
    }
    items.append(alerta)
    almacen.save("alertas", items)
    return alerta


def borrar_alerta(alerta_id: int) -> bool:
    items = alertas()
    restantes = [a for a in items if a["id"] != alerta_id]
    almacen.save("alertas", restantes)
    return len(restantes) != len(items)


def revisar_alertas() -> list[tuple[dict, dict]]:
    """Comprueba las alertas; devuelve las disparadas (y las elimina)."""
    disparadas = []
    for alerta in alertas():
        try:
            c = cotizacion(alerta["simbolo"])
        except Exception:
            continue
        if (alerta["condicion"] == "mayor" and c["precio"] >= alerta["precio"]) or (
            alerta["condicion"] == "menor" and c["precio"] <= alerta["precio"]
        ):
            disparadas.append((alerta, c))
    for alerta, _ in disparadas:
        borrar_alerta(alerta["id"])
    return disparadas
