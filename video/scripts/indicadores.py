"""Reel de alcance con historia y consejo (Marcos y sus nueve indicadores). Solo subtítulos abajo y el «sígueme» grande en medio.

Uso: python scripts/indicadores.py <ffmpeg>   ·   Voz: input/indicadores_voz.(mp3|wav)
Salida: public/gen/indicadores_mezcla.wav, src/gen/indicadores.json, guiones/reel_indicadores.md
"""
import sys

from guion_indicadores import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "indicadores"
EVENTOS = {"marcos": "Marcos", "nueve": ("nueve", "hook"), "entrar": "entrar.", "perdia": "perdía,", "rsi": "RSI,", "macd": "MACD,", "medias": "medias,", "bollinger": "Bollinger...", "navidad": "Navidad.", "precio1": ("precio.", "dos"), "nueve2": ("nueve", "dos"), "tarde": "tarde.", "sigueme": "Sígueme,", "quito": "quitó", "solo": "solo", "rebotaba": "rebotaba", "rompia": "rompía.", "consejo": "consejo:", "volumen": "volumen.", "lineas": "líneas,", "claras": "claras.", "cuantos": "¿Cuántos", "etiqueta": "Etiqueta"}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_indicadores", TITULO,
                   "Reel de alcance (~36 s, 1080x1920): historia con personaje, «sígueme» en el momento de suspense, consejo práctico y pregunta + etiqueta al final. Solo subtítulos abajo.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("perdia", "rsi", "macd", "medias", "bollinger"), campanas=("sigueme", "etiqueta"),
            golpes=("navidad", "tarde", "quito", "claras"),
            intensidad={"hook": (1, 1, 1, 0), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "pregunta": (1, 0, 1, 1)})
