"""Entrada por micrófono y salida hablada. Dependencias opcionales (requirements-voz.txt)."""

from __future__ import annotations

import sys


class Voz:
    def __init__(self) -> None:
        try:
            import pyttsx3
            import speech_recognition as sr
        except ImportError:
            sys.exit("Para el modo voz instala: pip install -r requirements-voz.txt")
        self._sr = sr
        self._recognizer = sr.Recognizer()
        self._tts = pyttsx3.init()

    def escuchar(self) -> str:
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

    def decir(self, text: str) -> None:
        self._tts.say(text)
        self._tts.runAndWait()
