"""Video "Las tres cifras que miro antes de fiarme de un bot" (parte 4 de "Qué hace de verdad un bot de trading").

Uso: python scripts/cifras.py <ffmpeg>
Voz: input/cifras_voz.(mp3|wav) si existe; si no, Kokoro. Ver scripts/locucion.py.
Salida: public/gen/cifras_mezcla.wav, src/gen/cifras.json, guiones/tres_cifras_bot.md
"""
import sys

from guion_cifras import GESTOS, GUION, PANTALLAS, TITULO
from locucion import escribir_guion, generar

escribir_guion("tres_cifras_bot", TITULO,
               "Parte 4 de «Qué hace de verdad un bot de trading». Guion de voz en off (~60 s, 1080x1920): 7 pantallas, "
               "3 cifras («CIFRA 01 / 03»…) y cierre con promo del bot (cuenta auditada en la bio).",
               GUION, GESTOS, PANTALLAS)
generar(
    sys.argv[1], "cifras", TITULO, GUION,
    eventos={
        "gana": ("gana", "hook"), "cifras": ("cifras", "hook"), "nadie": "nadie",
        "caida": ("caída", "caida"), "perder": "perder", "momento": "momento", "treinta": "treinta",
        "aguantarias": "aguantarías", "apagarlo": "apagarlo",
        "beneficio": "beneficio", "gana2": ("gana", "factor"), "pierde": ("pierde", "factor"), "debajo": "debajo",
        "cerca": "cerca", "tumba": "tumba",
        "operaciones": ("operaciones", "operaciones"), "veinte": "veinte", "suerte": "suerte", "cientos": "cientos",
        "real": ("real", "operaciones"),
        "juntas": "juntas", "caida2": ("caída", "juntas"), "factor2": ("factor", "juntas"), "muchas": "muchas",
        "falla": "falla", "desconfia": "desconfía",
        "serio": "serio", "pidas": "pidas",
        "auditada": "auditada", "link": "link", "sigueme": "Sígueme", "escribeme": "escríbeme", "info": "info",
    },
    toques=("gana", "caida", "treinta", "beneficio", "pierde", "veinte", "cientos", "caida2", "factor2", "muchas", "sigueme"),
    campanas=("cifras", "apagarlo", "tumba", "real", "desconfia", "pidas", "link", "info"),
    intensidad={"hook": (1, 0, 1, 0), "caida": (1, 1, 1, 1), "factor": (1, 1, 1, 1), "operaciones": (1, 1, 1, 1),
                "juntas": (1, 1, 1, 1), "cierre": (1, 0, 1, 1), "cta": (1, 1, 1, 1)},
)
