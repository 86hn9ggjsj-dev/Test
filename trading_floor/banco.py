"""Banco de estrategias: las que han superado todo el embudo de pruebas."""

from __future__ import annotations

from . import almacen


def cargar() -> list[dict]:
    return almacen.cargar("banco", [])


def anadir(entrada: dict) -> None:
    items = [b for b in cargar() if b["id"] != entrada["id"]]
    almacen.guardar("banco", items + [entrada])


def borrar(id_: str) -> bool:
    items = cargar()
    restantes = [b for b in items if b["id"].upper() != id_.upper()]
    almacen.guardar("banco", restantes)
    return len(restantes) != len(items)
