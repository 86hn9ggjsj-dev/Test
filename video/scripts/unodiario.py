"""Reel de alcance "¿Ganar un 1 % al día? Parece poco" (~18 s, con CTA de seguir).

Uso: python scripts/unodiario.py <ffmpeg>
Voz: input/unodiario_voz.(mp3|wav) si existe; si no, Kokoro. Ver scripts/locucion.py.
Salida: public/gen/unodiario_mezcla.wav, src/gen/unodiario.json, guiones/reel_uno_por_ciento_diario.md
"""
import sys

from guion_unodiario import GESTOS, GUION, PANTALLAS, TITULO
from locucion import escribir_guion, generar

escribir_guion("reel_uno_por_ciento_diario", TITULO,
               "Reel de alcance (~18 s, 1080x1920): pregunta que choca, cuenta sencilla, giro y CTA de seguir. La promo del bot va en la descripción y en un comentario fijado.",
               GUION, GESTOS, PANTALLAS)
generar(
    sys.argv[1], "unodiario", TITULO, GUION,
    eventos={
        "poco": "poco", "treintayocho": "38.000", "dos": ("dos", "cuenta"), "millon": "millón",
        "nadie": "Nadie", "fondos": "fondos", "promete": "promete", "sabes": "sabes", "sigueme": "Sígueme",
    },
    toques=("poco", "dos", "nadie", "promete"),
    campanas=("treintayocho", "millon", "sabes", "sigueme"),
    intensidad={"hook": (1, 1, 1, 0), "cuenta": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "leccion": (1, 1, 1, 1), "cta": (1, 1, 1, 1)},
)
