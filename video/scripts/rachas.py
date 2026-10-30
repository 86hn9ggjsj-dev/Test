"""Reel de alcance "Tu estrategia gana el 55 %: ¿cuántas pérdidas seguidas vas a ver?" (~40 s, con CTA de seguir).

Uso: python scripts/rachas.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py rachas
Voz: input/rachas_voz.(mp3|wav). Salida: public/gen/rachas_mezcla.wav, src/gen/rachas.json, guiones/reel_rachas_55.md
"""
import sys

from guion_rachas import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "rachas"
EVENTOS = {
    "gana": ("gana", "hook"), "perder": "perder", "ocho0": ("8", "hook"), "suerte": "suerte", "matematicas": "matemáticas",
    "cincuentaycinco": "55%", "cuarentaycinco": "45", "mil": "mil", "encadenes": "encadenes", "ocho": ("8", "respuesta"), "justo": "Justo", "abandona": "abandona",
    "racha": ("racha", "giro"), "eliges": "eliges", "diez": ("10%", "giro"), "cuarentaytres": "43%", "uno": ("1%", "giro"), "noventaydos": "92",
    "misma": "Misma", "hundida": "hundida", "otra": ("otra", "cierre"), "entera": "entera",
    "sigueme": "Sígueme",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_rachas_55", TITULO,
                   "Reel de alcance (~40 s, 1080x1920): pregunta que choca, cuenta sencilla, giro y CTA de seguir. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("cincuentaycinco", "mil", "eliges", "diez", "uno", "misma"), campanas=("noventaydos", "sigueme"),
            golpes=("ocho0", "ocho", "cuarentaytres", "hundida"),
            intensidad={"hook": (1, 1, 1, 0), "respuesta": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1), "cta": (1, 1, 1, 1)})