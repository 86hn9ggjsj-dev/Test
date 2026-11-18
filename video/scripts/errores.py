"""Video "Los tres errores que hacen que un backtest mienta" (parte 3 de "Qué hace de verdad un bot de trading").

Uso: python scripts/errores.py <ffmpeg>
Voz: input/errores_voz.(mp3|wav) si existe; si no, Kokoro. Ver scripts/locucion.py.
Salida: public/gen/errores_mezcla.wav, src/gen/errores.json, guiones/tres_errores_backtest.md
"""
import sys

from guion_errores import GESTOS, GUION, PANTALLAS, TITULO
from locucion import escribir_guion, generar

escribir_guion("tres_errores_backtest", TITULO,
               "Parte 3 de «Qué hace de verdad un bot de trading». Guion de voz en off (~60 s, 1080x1920), mismo formato: "
               "7 pantallas, 3 errores («ERROR 01 / 03»…). Cada bloque es una pantalla de motion graphics.",
               GUION, GESTOS, PANTALLAS)
generar(
    sys.argv[1], "errores", TITULO, GUION,
    eventos={
        "anos": "años", "mintiendo": "mintiendo",
        "futuro": "futuro", "cierre": ("cierre", "futuro"), "entra": "entra", "acierta": "acierta", "nunca": ("nunca", "futuro"),
        "sobrevivio": "sobrevivió", "acciones": "acciones", "quebraron": "quebraron", "cualquier": "cualquier",
        "mil": "mil", "cambias": "cambias", "alguna": "alguna", "suerte": "suerte", "loteria": "lotería",
        "alarma": "alarma", "perfecta": "perfecta", "mercados": "mercados", "real": ("real", "alarma"),
        "ganar": "ganar", "sobrevive": "sobrevive", "realidad": "realidad",
        "tres": ("tres", "cta"), "cifras": "cifras",
    },
    toques=("anos", "futuro", "entra", "acciones", "quebraron", "mil", "alguna", "perfecta", "sobrevive"),
    campanas=("mintiendo", "nunca", "cualquier", "loteria", "real", "realidad", "cifras"),
    intensidad={"hook": (1, 0, 1, 0), "futuro": (1, 1, 1, 1), "supervivencia": (1, 1, 1, 1), "suerte": (1, 1, 1, 1),
                "alarma": (1, 0, 1, 1), "cierre": (1, 1, 1, 1), "cta": (1, 1, 1, 1)},
)
