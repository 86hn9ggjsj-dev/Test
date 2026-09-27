"""Pequeño almacén JSON en disco para memoria, alertas y estado de la vigilancia."""

from __future__ import annotations

import json
from typing import Any

from .config import DATA_DIR


def load(name: str, default: Any) -> Any:
    try:
        return json.loads((DATA_DIR / f"{name}.json").read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def save(name: str, value: Any) -> None:
    path = DATA_DIR / f"{name}.json"
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(path)
