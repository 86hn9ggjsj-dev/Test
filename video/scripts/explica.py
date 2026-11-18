"""Video "Qué hace de verdad un bot de trading": guion, voz, música, SFX, mezcla y timeline. Todo desde cero.

Uso: python scripts/explica.py <ffmpeg>
Voz: input/explica_voz.(mp3|wav) si existe; si no, Kokoro. Ver scripts/locucion.py.
Salida: public/gen/explica_mezcla.wav, src/gen/explica.json, guiones/que_hace_un_bot.md
"""
import sys

from guion_explica import GESTOS, GUION, TITULO
from locucion import escribir_guion, generar

escribir_guion("que_hace_un_bot", TITULO, "Guion de voz en off (~50 s, 1080x1920). Cada bloque es una pantalla de motion graphics.",
               GUION, GESTOS)
generar(
    sys.argv[1], "explica", TITULO, GUION,
    eventos={
        "futuro": "futuro", "aburrido": "aburrido", "util": "útil",
        "mercado": "mercado", "precio": ("precio", "lee"), "volumen": ("volumen", "lee"), "spread": "spread", "miles": "Miles",
        "reglas": "reglas", "rompe": "rompe", "volumen2": ("volumen", "decide"), "entra": "entra", "espera": "espera",
        "perder": "perder", "stop": "stop", "tamano": "tamaño", "calculados": "calculados",
        "milisegundos": "milisegundos", "tres": "tres", "noticia": "noticia",
        "miedo": "miedo", "avaricia": "avaricia", "programado": "programado", "menos": "menos",
        "magia": "magia", "disciplina": "disciplina", "codigo": "código",
        "prueba": "prueba", "euro": "euro",
    },
    toques=("futuro", "rompe", "volumen2", "stop", "tamano", "milisegundos", "miedo", "avaricia"),
    campanas=("util", "entra", "calculados", "codigo", "euro"),
    intensidad={"hook": (1, 0, 1, 0), "lee": (1, 1, 1, 1), "decide": (1, 1, 1, 1), "protege": (1, 1, 1, 1),
                "ejecuta": (1, 1, 1, 1), "emocion": (1, 0, 1, 1), "codigo": (1, 1, 1, 1), "cta": (1, 1, 1, 1)},
)
