"""Video "Cómo detectar un bot estafa en 30 segundos" (parte 5 de "Qué hace de verdad un bot de trading").

Uso: python scripts/estafa.py <ffmpeg>
Voz: input/estafa_voz.(mp3|wav) si existe; si no, Kokoro. Ver scripts/locucion.py.
Salida: public/gen/estafa_mezcla.wav, src/gen/estafa.json, guiones/detectar_bot_estafa.md
"""
import sys

from guion_estafa import GESTOS, GUION, PANTALLAS, TITULO
from locucion import escribir_guion, generar

escribir_guion("detectar_bot_estafa", TITULO,
               "Parte 5 de «Qué hace de verdad un bot de trading». Guion de voz en off (~60 s, 1080x1920): 7 pantallas, "
               "4 señales («SEÑAL 01 / 04»…) y cierre con promo del bot (cuenta auditada en la bio).",
               GUION, GESTOS, PANTALLAS)
generar(
    sys.argv[1], "estafa", TITULO, GUION,
    eventos={
        "rico": "rico", "duermes": "duermes", "estafa": "estafa", "treinta": "treinta",
        "garantiza": "garantiza", "diez": "diez", "fijo": "fijo", "nada": "nada",
        "capturas": "capturas", "edita": "edita", "minuto": "minuto", "auditada": ("auditada", "capturas"), "tercero": "tercero",
        "deja": "deja", "doblan": "doblan", "ganan": "Ganan", "todo": "todo",
        "prisa": "prisa", "plazas": "Plazas", "hoy": "hoy", "amigos": "amigos", "marketing": "marketing",
        "numeros": "números", "buenos": "buenos", "malos": "malos",
        "auditada2": ("auditada", "cta"), "link": "link", "sigueme": "Sígueme", "escribeme": "escríbeme", "info": "info",
    },
    toques=("rico", "garantiza", "capturas", "edita", "doblan", "prisa", "plazas", "amigos", "buenos", "sigueme"),
    campanas=("estafa", "nada", "tercero", "todo", "marketing", "malos", "link", "info"),
    intensidad={"hook": (1, 0, 1, 0), "garantia": (1, 1, 1, 1), "capturas": (1, 1, 1, 1), "martingala": (1, 1, 1, 1),
                "prisa": (1, 1, 1, 1), "cierre": (1, 0, 1, 1), "cta": (1, 1, 1, 1)},
)
