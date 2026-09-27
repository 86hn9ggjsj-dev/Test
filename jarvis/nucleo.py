"""Núcleo conversacional de Jarvis."""

from __future__ import annotations

import platform

import anthropic

from .config import MODEL
from .herramientas import TOOLS

MAX_PAUSE_RESTARTS = 5

SYSTEM_PROMPT = """Eres J.A.R.V.I.S., el asistente personal de tu usuario, al estilo del de Tony Stark: \
educado, eficiente, con un toque de humor británico seco. Te diriges al usuario como "señor" \
salvo que te pida otra cosa. Respondes en el idioma del usuario (por defecto, español).

Sé breve: tus respuestas pueden leerse en voz alta, así que evita tablas y markdown pesado \
salvo que te lo pidan.

Usa tus herramientas cuando aporten algo:
- Memoria persistente: guarda lo que el usuario te pida recordar y consúltala cuando pregunte \
por algo que podría haberte contado antes.
- Mercado: cotizaciones en tiempo real y alertas de precio. Las alertas avisan con llamada y \
WhatsApp mientras el modo vigilancia (`python -m jarvis --vigilar`) esté en marcha; recuérdaselo \
al crear una.
- Correo: leer la bandeja de entrada y enviar correos (el usuario confirma cada envío).
- Avisos: llamar al usuario o enviarle un WhatsApp, solo cuando lo pida.
- Búsqueda web para información actual, abrir webs y ejecutar comandos en el equipo \
(explica en una frase qué hará el comando antes de ejecutarlo).

Si una herramienta dice "No configurado", explica qué falta en el archivo .env sin tecnicismos. \
No puedes leer mensajes privados de Instagram ni de WhatsApp: Meta no lo permite para cuentas \
personales; dilo con franqueza si te lo piden."""


class Jarvis:
    def __init__(self) -> None:
        self.client = anthropic.Anthropic()
        self.messages: list[dict] = []
        self.system = f"{SYSTEM_PROMPT}\n\nSistema operativo del usuario: {platform.system()}."

    def ask(self, user_input: str) -> str:
        checkpoint = len(self.messages)
        try:
            return self._ask(user_input)
        except BaseException:
            # Descarta el turno a medias para que el historial siga siendo válido.
            del self.messages[checkpoint:]
            raise

    def _ask(self, user_input: str) -> str:
        self.messages.append({"role": "user", "content": user_input})
        restarts = 0
        while True:
            runner = self.client.beta.messages.tool_runner(
                model=MODEL,
                max_tokens=16000,
                system=self.system,
                thinking={"type": "adaptive"},
                tools=TOOLS,
                messages=self.messages,
                betas=["server-side-fallback-2026-07-01"],
                fallbacks="default",
            )
            last = None
            for message in runner:
                last = message
                self.messages.append({"role": "assistant", "content": message.content})
                tool_response = runner.generate_tool_call_response()
                if tool_response is not None:
                    self.messages.append(tool_response)
            if last is None or last.stop_reason != "pause_turn":
                break
            restarts += 1
            if restarts > MAX_PAUSE_RESTARTS:
                break

        if last is None:
            return "Me temo que no he obtenido respuesta, señor."
        if last.stop_reason == "refusal":
            return "Me temo que no puedo ayudarle con eso, señor."
        text = "".join(b.text for b in last.content if b.type == "text").strip()
        return text or "Hecho, señor."
