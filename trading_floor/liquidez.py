"""Liquidez remunerada: el dinero del fondo que no está invertido cobra intereses, como en un fondo monetario.

Un fondo de verdad no deja su liquidez quieta: la tiene en letras del Tesoro o en un monetario. Aquí, todo el dinero
que no está dentro del mercado cobra el tipo de las letras del Tesoro de EE. UU. a 3 meses (^IRX, de Yahoo Finance, el
mismo dato que enseña la sala de macro; si no lo hay, TIPO_LIQUIDEZ de config.py):
- el % del fondo que no repartes;
- el capital de las mesas vacías y el de los traders sin posición (o lo que no usa su posición);
- el efectivo de las carteras de holding y de la sala de tendencia.
Lo invertido (posiciones abiertas, monedas del holding y de la tendencia) no cobra.

Los intereses se suman en cada vuelta del paper trading. El tiempo que el programa estuvo cerrado también cuenta (como
en un monetario de verdad), hasta 7 días, con el efectivo que había al volver. Empiezan a contar desde la primera vez
que se pone en marcha (no se pagan intereses de antes). Cuentan en tu fondo como una parte más: «Intereses».
"""

from __future__ import annotations

import datetime as dt
import threading

import pandas as pd

from . import almacen
from .config import CAPITAL_POR_ESTRATEGIA, TIPO_LIQUIDEZ

MAX_HUECO = pd.Timedelta(days=7)   # si el programa estuvo cerrado más tiempo, solo se cuentan 7 días
_cerrojo = threading.Lock()


def _ahora() -> str:
    return dt.datetime.now().astimezone().isoformat(timespec="seconds")


def tipo_actual() -> tuple[float, str]:
    """Tipo anual en % y de dónde sale: las letras del Tesoro a 3 meses que descarga la sala de macro, o el de config."""
    irx = ((almacen.cargar("macro", {}).get("indicadores") or {}).get("^IRX") or {}).get("valor")
    if irx is not None and 0 <= float(irx) < 25:
        return float(irx), "letras del Tesoro de EE. UU. a 3 meses"
    return TIPO_LIQUIDEZ, "tipo por defecto (sin dato de las letras del Tesoro)"


def invertido(papel: dict, holding: dict, tendencia: dict, vivo: dict | None = None) -> float:
    """Dinero que está dentro del mercado: posiciones abiertas de trading y scalping y monedas del holding y la tendencia."""
    vivo = vivo or {}
    total = sum(t.get("patrimonio", CAPITAL_POR_ESTRATEGIA) * t["posicion"].get("fraccion", 0)
                for t in (papel.get("estrategias") or {}).values() if t.get("posicion"))
    for p in [*(holding.get("planes") or {}).values(), *((tendencia or {}).get("monedas") or {}).values()]:
        total += p.get("unidades", 0) * (vivo.get(p.get("simbolo")) or p.get("precio") or 0)
    return float(total)


def actualizar(ahora: pd.Timestamp | None = None) -> dict:
    """Suma los intereses desde la última vuelta y guarda el estado (liquidez.json)."""
    from . import fondo

    ahora = ahora or pd.Timestamp.now(tz="UTC")
    papel, holding, tendencia = almacen.cargar("papel", {}), almacen.cargar("holding", {}), almacen.cargar("tendencia", {})
    patrimonio = fondo.calcular(papel, holding, completo=False, tendencia=tendencia)["resumen"]["patrimonio"]
    efectivo = max(0.0, patrimonio - invertido(papel, holding, tendencia))
    tipo, fuente = tipo_actual()
    with _cerrojo:
        estado = almacen.cargar("liquidez", {})
        acumulado = float(estado.get("acumulado", 0.0))
        serie = estado.get("serie") or []
        if estado.get("ultimo"):
            hueco = min(max(ahora - pd.Timestamp(estado["ultimo"]), pd.Timedelta(0)), MAX_HUECO)
            # con el efectivo de la vuelta anterior (el de ahora si es la primera vez tras arrancar)
            base = float(estado.get("efectivo", efectivo))
            acumulado += base * float(estado.get("tipo_pct", tipo)) / 100 * hueco.total_seconds() / (365 * 86400)
        hora = ahora.floor("h").isoformat()
        if serie and serie[-1][0] == hora:
            serie[-1][1] = round(acumulado, 4)
        else:
            serie.append([hora, round(acumulado, 4)])
        estado.update(ultimo=ahora.isoformat(), efectivo=round(efectivo, 2), tipo_pct=round(tipo, 3), fuente=fuente,
                      acumulado=round(acumulado, 4), serie=serie, al_dia=round(efectivo * tipo / 100 / 365, 2),
                      actualizado=_ahora())
        almacen.guardar("liquidez", estado)
    return estado
