"""Avisos al móvil del usuario mediante un bot de Telegram (gratis)."""

from __future__ import annotations

import json
import urllib.error
import urllib.request

from .config import require


def _api(metodo: str, datos: dict | None = None) -> dict:
    (token,) = require("TELEGRAM_TOKEN")
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/{metodo}",
        data=json.dumps(datos or {}).encode(),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            respuesta = json.load(resp)
    except urllib.error.HTTPError as e:
        try:
            respuesta = json.load(e)
        except ValueError:
            raise RuntimeError(f"Telegram respondió con error {e.code}") from e
    if not respuesta.get("ok"):
        raise RuntimeError(respuesta.get("description", "error de Telegram"))
    return respuesta["result"]


def telegram(mensaje: str) -> None:
    """Envía un mensaje al usuario por Telegram."""
    _, chat_id = require("TELEGRAM_TOKEN", "TELEGRAM_CHAT_ID")
    _api("sendMessage", {"chat_id": chat_id, "text": mensaje[:4000]})


def buscar_chat_id() -> list[tuple[int, str]]:
    """Chats que han escrito recientemente al bot, para averiguar TELEGRAM_CHAT_ID."""
    chats = {}
    for update in _api("getUpdates"):
        chat = (update.get("message") or {}).get("chat")
        if chat:
            chats[chat["id"]] = chat.get("first_name") or chat.get("title") or ""
    return list(chats.items())
