"""Reel de alcance "Pierdes un 50 %" (~20 s, sin promo hablada).

Uso: python scripts/cincuenta.py <ffmpeg>
Voz: input/cincuenta_voz.(mp3|wav) si existe; si no, Kokoro. Ver scripts/locucion.py.
Salida: public/gen/cincuenta_mezcla.wav, src/gen/cincuenta.json, guiones/reel_pierdes_50.md
"""
import sys

from guion_cincuenta import GESTOS, GUION, PANTALLAS, TITULO
from locucion import escribir_guion, generar

escribir_guion("reel_pierdes_50", TITULO,
               "Reel de alcance (~20 s, 1080x1920): gancho gigante en el centro desde el primer fotograma, una sola idea, sin promo "
               "hablada (la promo va en la descripción y en un comentario fijado) y final en seco para que se repita.",
               GUION, GESTOS, PANTALLAS)
generar(
    sys.argv[1], "cincuenta", TITULO, GUION,
    eventos={
        "recuperarte": "recuperarte", "no": ("No", "respuesta"), "cien": ("100%", "respuesta"),
        "quedan": "quedan", "duplicarse": "duplicarse",
        "noventa": ("90%", "escala"), "novecientos": "900%",
        "primero": "primero", "perder": "perder",
    },
    toques=("recuperarte", "no", "quedan", "noventa"),
    campanas=("cien", "duplicarse", "novecientos", "perder"),
    intensidad={"hook": (1, 1, 1, 0), "respuesta": (1, 1, 1, 1), "ejemplo": (1, 1, 1, 1), "escala": (1, 1, 1, 1), "leccion": (1, 1, 1, 1)},
)
