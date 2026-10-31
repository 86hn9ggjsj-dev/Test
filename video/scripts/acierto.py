"""Reel "Puedes fallar 6 de cada 10 operaciones y ganar dinero" (consejo de trading: riesgo/beneficio).

Uso: python scripts/acierto.py <ffmpeg>
Voz: input/acierto_voz.(mp3|wav) si existe; si no, Kokoro. Ver scripts/locucion.py.
Salida: public/gen/acierto_mezcla.wav, src/gen/acierto.json, guiones/tip_fallar_6_de_10.md
"""
import sys

from guion_acierto import GESTOS, GUION, PANTALLAS, TITULO
from locucion import escribir_guion, generar

escribir_guion("tip_fallar_6_de_10", TITULO,
               "Reel de consejo de trading (~40 s, 1080x1920): gancho en la primera frase, un consejo, una regla y promo corta del bot.",
               GUION, GESTOS, PANTALLAS)
generar(
    sys.argv[1], "acierto", TITULO, GUION,
    eventos={
        "fallar": "fallar", "ganar": ("ganar", "hook"),
        "ganas": "ganas", "pierdes": ("pierdes", "clave"),
        "arriesgas": ("Arriesgas", "ejemplo"), "fallas": ("Fallas", "ejemplo"), "menos600": "600",
        "aciertas": ("Aciertas", "ejemplo"), "mas800": "800",
        "fallado": "fallado", "arriba": "arriba",
        "novato": "novato", "corta": "corta", "correr": "correr",
        "regla": "Regla", "doble": "doble",
        "mano": "mano", "auditada": "auditada", "bio": "bio", "sigueme": "Sígueme",
    },
    toques=("fallar", "ganas", "pierdes", "fallas", "aciertas", "novato", "regla", "sigueme"),
    campanas=("ganar", "mas800", "arriba", "doble", "bio"),
    intensidad={"hook": (1, 1, 1, 0), "clave": (1, 1, 1, 1), "ejemplo": (1, 1, 1, 1), "resultado": (1, 1, 1, 1),
                "error": (1, 1, 1, 1), "regla": (1, 1, 1, 1), "cta": (1, 1, 1, 1)},
)
