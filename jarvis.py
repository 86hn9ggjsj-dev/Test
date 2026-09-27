#!/usr/bin/env python3
"""J.A.R.V.I.S. — asistente personal de terminal impulsado por Claude.

Uso:
    python jarvis.py            # modo texto
    python jarvis.py --voz      # habla y escucha (requiere dependencias de voz)
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import platform
import subprocess
import sys
import webbrowser
from pathlib import Path

import anthropic
from anthropic import beta_tool

MODEL = "claude-opus-5"
MEMORY_FILE = Path.home() / ".jarvis_memoria.json"
MAX_PAUSE_RESTARTS = 5

SYSTEM_PROMPT = """Eres J.A.R.V.I.S., el asistente personal de tu usuario, al estilo del de Tony Stark: \
educado, eficiente, con un toque de humor británico seco. Te diriges al usuario como "señor" \
salvo que te pida otra cosa. Respondes en el idioma del usuario (por defecto, español).

Sé breve: tus respuestas pueden leerse en voz alta, así que evita tablas y markdown pesado \
salvo que te lo pidan. Usa tus herramientas cuando aporten algo: la hora y la fecha, la memoria \
persistente (guarda lo que el usuario te pida recordar y consúltala cuando pregunte por algo \
que podría haberte contado antes), la búsqueda web para información actual, abrir webs y \
ejecutar comandos en el equipo. Antes de ejecutar un comando, explica en una frase qué hará."""


# ---------------------------------------------------------------- memoria --

def _load_memory() -> list[dict]:
    try:
        return json.loads(MEMORY_FILE.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def _save_memory(items: list[dict]) -> None:
    MEMORY_FILE.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")


# -------------------------------------------------------------- herramientas --

@beta_tool
def obtener_fecha_hora() -> str:
    """Devuelve la fecha y hora local actuales del equipo del usuario."""
    now = dt.datetime.now().astimezone()
    return now.strftime("%A %d/%m/%Y, %H:%M:%S (%Z)")


@beta_tool
def recordar(dato: str) -> str:
    """Guarda un dato en la memoria persistente de Jarvis para futuras conversaciones.

    Args:
        dato: El dato a recordar, redactado de forma autocontenida.
    """
    items = _load_memory()
    items.append({"id": max((i["id"] for i in items), default=0) + 1,
                  "dato": dato,
                  "fecha": dt.datetime.now().isoformat(timespec="minutes")})
    _save_memory(items)
    return f"Guardado con id {items[-1]['id']}."


@beta_tool
def consultar_memoria() -> str:
    """Devuelve todos los datos guardados en la memoria persistente de Jarvis."""
    items = _load_memory()
    if not items:
        return "La memoria está vacía."
    return "\n".join(f"[{i['id']}] ({i['fecha']}) {i['dato']}" for i in items)


@beta_tool
def olvidar(id: int) -> str:
    """Borra un dato de la memoria persistente.

    Args:
        id: Identificador del dato, tal como aparece en consultar_memoria.
    """
    items = _load_memory()
    remaining = [i for i in items if i["id"] != id]
    if len(remaining) == len(items):
        return f"No existe ningún dato con id {id}."
    _save_memory(remaining)
    return f"Dato {id} olvidado."


@beta_tool
def abrir_web(url: str) -> str:
    """Abre una URL en el navegador predeterminado del usuario.

    Args:
        url: URL completa, incluyendo http:// o https://.
    """
    if not url.startswith(("http://", "https://")):
        return "Error: la URL debe empezar por http:// o https://."
    ok = webbrowser.open(url)
    return "Abierta en el navegador." if ok else "No se encontró un navegador disponible."


@beta_tool
def ejecutar_comando(comando: str) -> str:
    """Ejecuta un comando de shell en el equipo del usuario, previa confirmación suya.

    Args:
        comando: El comando exacto a ejecutar.
    """
    print(f"\n⚠️  Jarvis quiere ejecutar: {comando}")
    if input("   ¿Permitir? [s/N] ").strip().lower() not in ("s", "si", "sí", "y", "yes"):
        return "El usuario ha denegado la ejecución."
    try:
        proc = subprocess.run(comando, shell=True, capture_output=True, text=True, timeout=60)
    except subprocess.TimeoutExpired:
        return "Error: el comando superó el límite de 60 segundos."
    out = (proc.stdout + proc.stderr).strip() or "(sin salida)"
    if len(out) > 8000:
        out = out[:8000] + "\n...(salida recortada a 8000 caracteres)"
    return f"Código de salida {proc.returncode}\n{out}"


TOOLS = [
    obtener_fecha_hora,
    recordar,
    consultar_memoria,
    olvidar,
    abrir_web,
    ejecutar_comando,
    {"type": "web_search_20260209", "name": "web_search", "max_uses": 5},
]


# ------------------------------------------------------------------- voz --

class Voice:
    """Entrada por micrófono y salida hablada. Dependencias opcionales."""

    def __init__(self) -> None:
        try:
            import pyttsx3
            import speech_recognition as sr
        except ImportError:
            sys.exit("Para el modo voz instala: pip install -r requirements-voz.txt")
        self._sr = sr
        self._recognizer = sr.Recognizer()
        self._tts = pyttsx3.init()

    def listen(self) -> str:
        with self._sr.Microphone() as source:
            self._recognizer.adjust_for_ambient_noise(source, duration=0.5)
            print("🎙️  Escuchando...")
            audio = self._recognizer.listen(source)
        try:
            text = self._recognizer.recognize_google(audio, language="es-ES")
        except (self._sr.UnknownValueError, self._sr.RequestError):
            return ""
        print(f"Tú: {text}")
        return text

    def say(self, text: str) -> None:
        self._tts.say(text)
        self._tts.runAndWait()


# ----------------------------------------------------------------- núcleo --

class Jarvis:
    def __init__(self) -> None:
        self.client = anthropic.Anthropic()
        self.messages: list[dict] = []

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
                system=f"{SYSTEM_PROMPT}\n\nSistema operativo del usuario: {platform.system()}.",
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


def main() -> None:
    parser = argparse.ArgumentParser(description="J.A.R.V.I.S. — asistente personal con Claude")
    parser.add_argument("--voz", action="store_true", help="activa entrada y salida por voz")
    args = parser.parse_args()

    voice = Voice() if args.voz else None
    jarvis = Jarvis()

    greeting = "A su servicio, señor. ¿En qué puedo ayudarle?"
    print(f"Jarvis: {greeting}  (escriba 'salir' para terminar)\n")
    if voice:
        voice.say(greeting)

    while True:
        try:
            user_input = voice.listen() if voice else input("Tú: ")
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if not user_input.strip():
            continue
        if user_input.strip().lower() in ("salir", "adiós", "adios", "exit", "quit"):
            break

        try:
            reply = jarvis.ask(user_input)
        except anthropic.AuthenticationError:
            sys.exit("Error: configura tu clave con la variable de entorno ANTHROPIC_API_KEY.")
        except anthropic.RateLimitError:
            reply = "Estamos saturados, señor. Inténtelo de nuevo en unos segundos."
        except anthropic.APIStatusError as e:
            reply = f"Error de la API ({e.status_code}): {e.message}"
        except anthropic.APIConnectionError:
            reply = "No consigo conectar con mis servidores, señor. Revise la conexión."

        print(f"\nJarvis: {reply}\n")
        if voice:
            voice.say(reply)

    farewell = "Hasta luego, señor."
    print(f"Jarvis: {farewell}")
    if voice:
        voice.say(farewell)


if __name__ == "__main__":
    main()
