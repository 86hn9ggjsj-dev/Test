"""Banco de estrategias: las que han superado todo el embudo de pruebas."""

from __future__ import annotations

import threading

from . import almacen

# Se activa al entrar una estrategia nueva: el paper trading le asigna trader al momento, sin esperar
# a su siguiente revisión (cuando la minería y la sala van en el mismo programa).
nueva = threading.Event()
_cerrojo = threading.Lock()  # la minería añade y la oficina retira: que no se pisen al guardar


def cargar() -> list[dict]:
    return almacen.cargar("banco", [])


def anadir(entrada: dict) -> None:
    with _cerrojo:
        items = [b for b in cargar() if b["id"] != entrada["id"]]
        almacen.guardar("banco", items + [entrada])
    nueva.set()


def borrar(id_: str) -> bool:
    with _cerrojo:
        items = cargar()
        restantes = [b for b in items if b["id"].upper() != id_.upper()]
        almacen.guardar("banco", restantes)
    return len(restantes) != len(items)


def _calidad(b: dict) -> float:
    """Cuánto valía en datos no vistos: rentabilidad / caída fuera de muestra (mejor cuanto más alta)."""
    fuera = b.get("fuera") or {}
    return float(fuera.get("ret_dd") or fuera.get("retorno_pct") or 0.0)


def repetidas(items: list[dict] | None = None) -> list[tuple[dict, list[dict]]]:
    """Grupos de estrategias con la misma idea: (la que se queda, las que sobran). Se queda la mejor fuera de muestra."""
    from .estrategia import Estrategia

    grupos: dict[str, list[dict]] = {}
    for b in cargar() if items is None else items:
        grupos.setdefault(Estrategia.de_dict(b["estrategia"]).idea(), []).append(b)
    salida = []
    for lista in grupos.values():
        if len(lista) > 1:
            lista = sorted(lista, key=_calidad, reverse=True)
            salida.append((lista[0], lista[1:]))
    return salida


def ocupacion(simbolo: str, intervalo: str) -> int:
    """Estrategias del banco de ese activo y tipo de vela (cada una ocupa una mesa)."""
    return sum(b["estrategia"]["simbolo"] == simbolo.upper() and b["estrategia"]["intervalo"] == intervalo for b in cargar())
