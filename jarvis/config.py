"""Configuración de Jarvis: lee variables de entorno (y un archivo .env si existe)."""

from __future__ import annotations

import os
from pathlib import Path

ENV_FILE = Path(__file__).resolve().parent.parent / ".env"

try:
    from dotenv import load_dotenv

    load_dotenv(ENV_FILE)
    load_dotenv()  # también un .env en la carpeta actual, si lo hay
except ImportError:
    pass

MODEL = "claude-opus-5"

DATA_DIR = Path(os.environ.get("JARVIS_DATA_DIR", Path.home() / ".jarvis"))
DATA_DIR.mkdir(parents=True, exist_ok=True)


def env(name: str) -> str | None:
    value = os.environ.get(name, "").strip()
    return value or None


class NotConfigured(Exception):
    """Falta configuración para una función opcional."""


def require(*names: str) -> list[str]:
    missing = [n for n in names if not env(n)]
    if missing:
        raise NotConfigured(
            "Falta configurar " + ", ".join(missing) + " en el archivo .env (ver .env.example)."
        )
    return [env(n) for n in names]  # type: ignore[misc]
