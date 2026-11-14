"""Reel de alcance "¿Tu stop salta justo antes de que el precio gire?" (~25 s, con CTA de seguir).

Uso: python scripts/cazastop.py <ffmpeg>
Voz: input/cazastop_voz.(mp3|wav) si existe; si no, Kokoro. Ver scripts/locucion.py.
Salida: public/gen/cazastop_mezcla.wav, src/gen/cazastop.json, guiones/reel_stop_cazado.md
"""
import sys

from guion_cazastop import GESTOS, GUION, PANTALLAS, TITULO
from locucion import escribir_guion, generar

escribir_guion("reel_stop_cazado", TITULO,
               "Reel de alcance (~22 s, 1080x1920): gancho, contexto y CTA de seguir. La promo del bot va en la descripción y en un comentario fijado.",
               GUION, GESTOS, PANTALLAS)
generar(
    sys.argv[1], "cazastop", TITULO, GUION,
    eventos={
        "salta": "salta", "vuelta": "vuelta",
        "suerte": "suerte", "todo": "todo", "minimo": ("mínimo", "contexto"), "ordenes": "órdenes", "girar": "girar",
        "margen": "margen", "tamano": "tamaño", "mismo": "mismo",
        "sigueme": "Sígueme",
    },
    toques=("salta", "todo", "ordenes", "margen", "tamano"),
    campanas=("vuelta", "girar", "mismo", "sigueme"),
    intensidad={"hook": (1, 1, 1, 0), "contexto": (1, 1, 1, 1), "regla": (1, 1, 1, 1), "cta": (1, 1, 1, 1)},
)
