"""Reel de alcance "Ganas un 50 % y pierdes un 50 %: ¿estás igual?" (~23 s, con CTA de seguir).

Uso: python scripts/ganapierde.py <ffmpeg>
Voz: input/ganapierde_voz.(mp3|wav) si existe; si no, Kokoro. Ver scripts/locucion.py.
Salida: public/gen/ganapierde_mezcla.wav, src/gen/ganapierde.json, guiones/reel_gana_pierde_50.md
"""
import sys

from guion_ganapierde import GESTOS, GUION, PANTALLAS, TITULO
from locucion import escribir_guion, generar

escribir_guion("reel_gana_pierde_50", TITULO,
               "Reel de alcance (~16-18 s, 1080x1920): pregunta o dato que choca, cuenta sencilla, giro y CTA de seguir. La promo del bot va en la descripción y en un comentario fijado.",
               GUION, GESTOS, PANTALLAS)
generar(
    sys.argv[1], "ganapierde", TITULO, GUION,
    eventos={
        "pierdes": "pierdes", "igual": "igual",
        "no": ("No", "giro"), "veinticinco": "25%",
        "ciento50": "150", "setenta5": "75",
        "caidas": "caídas", "subidas": "subidas",
        "sigueme": "Sígueme",
    },
    toques=("pierdes", "no", "ciento50"),
    campanas=("veinticinco", "setenta5", "subidas", "sigueme"),
    intensidad={"hook": (1, 1, 1, 0), "giro": (1, 1, 1, 1), "cuenta": (1, 1, 1, 1), "leccion": (1, 1, 1, 1), "cta": (1, 1, 1, 1)},
)
