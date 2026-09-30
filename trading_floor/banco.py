"""Banco de estrategias: las que han superado todo el embudo de pruebas."""

from __future__ import annotations

import threading

from . import almacen

# Se activa al entrar una estrategia nueva: el paper trading le asigna trader al momento, sin esperar
# a su siguiente revisión (cuando la minería y la sala van en el mismo programa).
nueva = threading.Event()


def cargar() -> list[dict]:
    return almacen.cargar("banco", [])


def anadir(entrada: dict) -> None:
    items = [b for b in cargar() if b["id"] != entrada["id"]]
    almacen.guardar("banco", items + [entrada])
    nueva.set()


def borrar(id_: str) -> bool:
    items = cargar()
    restantes = [b for b in items if b["id"].upper() != id_.upper()]
    almacen.guardar("banco", restantes)
    return len(restantes) != len(items)
