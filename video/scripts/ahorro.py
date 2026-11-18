"""Reel de alcance "¿100 € al mes desde los 25 o 200 € desde los 35?" (~37 s, con CTA de seguir).

Uso: python scripts/ahorro.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py ahorro
Voz: input/ahorro_voz.(mp3|wav). Salida: public/gen/ahorro_mezcla.wav, src/gen/ahorro.json, guiones/reel_ahorro_25_35.md
"""
import sys

from guion_ahorro import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "ahorro"
EVENTOS = {
    "cien": ("100", "hook"), "doscientos": ("200", "hook"), "facil": "fácil", "doble": ("doble", "hook"),
    "siete": "7%", "acaba": "acaba", "r262": "262.000", "doscientos2": ("200", "cuenta"), "r244": "244.000",
    "puesto": "puesto", "r24": "24.000", "menos": "menos", "esos": "Esos", "esfuerzo": "esfuerzo",
    "mejor": ("mejor", "cierre"), "hace": "hace", "segundo": "segundo", "hoy": "hoy",
    "sigueme": "Sígueme",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_ahorro_25_35", TITULO,
                   "Reel de alcance (~37 s, 1080x1920): pregunta que choca, cuenta sencilla, giro y CTA de seguir. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("doscientos", "siete", "doscientos2", "esos", "segundo"), campanas=("r262", "hoy", "sigueme"),
            golpes=("r244", "menos"),
            intensidad={"hook": (1, 1, 1, 0), "cuenta": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1), "cta": (1, 1, 1, 1)})
