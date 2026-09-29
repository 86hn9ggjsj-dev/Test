"""Pequeño almacén JSON en disco (banco de estrategias, estado de la minería y del paper trading)."""

from __future__ import annotations

import json
import time
from typing import Any

from .config import DATA_DIR


def cargar(nombre: str, defecto: Any) -> Any:
    for _ in range(5):
        try:
            return json.loads((DATA_DIR / f"{nombre}.json").read_text(encoding="utf-8"))
        except (FileNotFoundError, json.JSONDecodeError):
            return defecto
        except PermissionError:  # Windows: otro proceso lo está reemplazando justo ahora
            time.sleep(0.05)
    return defecto


def guardar(nombre: str, valor: Any) -> None:
    ruta = DATA_DIR / f"{nombre}.json"
    tmp = ruta.with_suffix(".tmp")
    tmp.write_text(json.dumps(valor, ensure_ascii=False, indent=1), encoding="utf-8")
    for intento in range(5):
        try:
            tmp.replace(ruta)
            return
        except PermissionError:  # Windows: alguien lo está leyendo; reintentamos
            if intento == 4:
                raise
            time.sleep(0.05)
