"""Reel "Deja de mover el stop" (consejo de trading).

Uso: python scripts/stop.py <ffmpeg>
Voz: input/stop_voz.(mp3|wav) si existe; si no, Kokoro. Ver scripts/locucion.py.
Salida: public/gen/stop_mezcla.wav, src/gen/stop.json, guiones/tip_mover_el_stop.md
"""
import sys

from guion_stop import GESTOS, GUION, PANTALLAS, TITULO
from locucion import escribir_guion, generar

escribir_guion("tip_mover_el_stop", TITULO,
               "Reel de consejo de trading (~40 s, 1080x1920): gancho en la primera frase, un consejo, una regla y promo corta del bot.",
               GUION, GESTOS, PANTALLAS)
generar(
    sys.argv[1], "stop", TITULO, GUION,
    eventos={
        "movido": "movido", "aire": "aire",
        "precio": "precio", "vuelta": "vuelta", "alejas": "alejas",
        "pequena": "pequeña", "grande": "grande", "siguiente": "siguiente", "vuelves": "vuelves",
        "analisis": "análisis", "cerebro": "cerebro", "doble": "doble", "ganar": "ganar",
        "antes": "antes", "favor": "favor", "nunca": "Nunca",
        "trampas": "trampas", "auditada": "auditada", "bio": "bio", "sigueme": "Sígueme",
    },
    toques=("movido", "alejas", "grande", "cerebro", "antes", "favor", "sigueme"),
    campanas=("aire", "vuelves", "doble", "nunca", "bio"),
    intensidad={"hook": (1, 1, 1, 0), "situacion": (1, 1, 1, 1), "consecuencia": (1, 1, 1, 1), "cerebro": (1, 0, 1, 1),
                "regla": (1, 1, 1, 1), "cta": (1, 1, 1, 1)},
)
