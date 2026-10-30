"""Reel de alcance "Tu estrategia gana el 55 %: ¿cuántas pérdidas seguidas vas a ver?" (~20 s, con CTA de seguir).

Uso: python scripts/rachas.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py rachas
Voz: input/rachas_voz.(mp3|wav). Salida: public/gen/rachas_mezcla.wav, src/gen/rachas.json, guiones/reel_rachas_55.md
"""
import sys

from guion_rachas import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "rachas"
EVENTOS = {
    "cincuentaycinco": "55%", "seguidas": "seguidas",
    "crees": "crees", "mil": "1.000", "encadenar": "encadenar", "ocho": ("8", "respuesta"),
    "diez": ("10%", "giro"), "mitad": "mitad", "uno": ("1%", "giro"), "ochopct": "8%",
    "sigueme": "Sígueme",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_rachas_55", TITULO,
                   "Reel de alcance (~20 s, 1080x1920): pregunta que choca, cuenta sencilla, giro y CTA de seguir. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("seguidas", "mil", "diez", "uno"), campanas=("ochopct", "sigueme"),
            golpes=("cincuentaycinco", "ocho", "mitad"),
            intensidad={"hook": (1, 1, 1, 0), "respuesta": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cta": (1, 1, 1, 1)})
