"""Video "Cómo se prueba un bot antes de arriesgar un euro" (parte 2 de "Qué hace de verdad un bot de trading").

Uso: python scripts/prueba.py <ffmpeg>
Voz: input/prueba_voz.(mp3|wav) si existe; si no, Kokoro. Ver scripts/locucion.py.
Salida: public/gen/prueba_mezcla.wav, src/gen/prueba.json, guiones/como_se_prueba_un_bot.md
"""
import sys

from guion_prueba import GESTOS, GUION, PANTALLAS, TITULO
from locucion import escribir_guion, generar

escribir_guion("como_se_prueba_un_bot", TITULO,
               "Parte 2 de «Qué hace de verdad un bot de trading». Guion de voz en off (~60 s, 1080x1920), mismo formato: "
               "8 pantallas, 5 pasos («PASO 01 / 05»…). Cada bloque es una pantalla de motion graphics.",
               GUION, GESTOS, PANTALLAS)
generar(
    sys.argv[1], "prueba", TITULO, GUION,
    eventos={
        "pasado": "pasado", "nada": "nada", "probado": "probado",
        "pasas": "Pasas", "vela": "vela", "directo": "directo",
        "comisiones": "Comisiones", "spread": "spread", "deslizamiento": "deslizamiento", "perder": "perder",
        "ajustas": "ajustas", "otros": "otros", "sobre": "sobreoptimizado",
        "barajas": "Barajas", "mil": "mil", "peor": "peor", "caida": "caída", "listo": "listo",
        "semanas": "Semanas", "ficticio": "ficticio", "mismo": "mismo", "backtest": ("backtest", "demo"),
        "real": ("real", "real"), "poco": "Poco", "subiendo": "subiendo", "confirman": "confirman",
        "tres": "tres", "errores": "errores", "mienta": "mienta",
    },
    toques=("nada", "comisiones", "spread", "deslizamiento", "otros", "peor", "poco"),
    campanas=("probado", "directo", "sobre", "listo", "backtest", "confirman", "mienta"),
    intensidad={"hook": (1, 0, 1, 0), "backtest": (1, 1, 1, 1), "costes": (1, 1, 1, 1), "fuera": (1, 1, 1, 1),
                "estres": (1, 0, 1, 1), "demo": (1, 1, 1, 1), "real": (1, 0, 1, 1), "cta": (1, 1, 1, 1)},
)
