"""Reel de alcance "¿Cuántos años tardas en duplicar tu dinero?" (regla del 72, ~20 s, con CTA de seguir).

Uso: python scripts/regla72.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py regla72
Voz: input/regla72_voz.(mp3|wav). Salida: public/gen/regla72_mezcla.wav, src/gen/regla72.json, guiones/reel_regla_72.md
"""
import sys

from guion_regla72 import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "regla72"
EVENTOS = {
    "duplicar": "duplicar", "segundos": "segundos",
    "divide": "Divide", "setentaydos": "72", "ano": ("año", "regla"),
    "diez": ("10%", "ejemplo"), "siete": "7", "dos": ("2%", "ejemplo"), "deposito": "depósito", "treintayseis": "36",
    "inflacion": "inflación", "parado": "parado", "mitad": "mitad", "veinticuatro": "24",
    "guardalo": "Guárdalo", "sigueme": "sígueme",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_regla_72", TITULO,
                   "Reel de alcance (~20 s, 1080x1920): pregunta que choca, cuenta sencilla, giro y CTA de seguir. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("segundos", "diez", "dos", "inflacion"), campanas=("siete", "guardalo"),
            golpes=("setentaydos", "treintayseis", "mitad"),
            intensidad={"hook": (1, 1, 1, 0), "regla": (1, 1, 1, 1), "ejemplo": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cta": (1, 1, 1, 1)})
