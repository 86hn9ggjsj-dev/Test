"""Reel de alcance "Aciertas 9 de cada 10 operaciones y pierdes dinero" (~16 s, con CTA de seguir).

Uso: python scripts/nueve.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py nueve
Voz: input/nueve_voz.(mp3|wav). Salida: public/gen/nueve_mezcla.wav, src/gen/nueve.json, guiones/reel_aciertas_9_de_10.md
"""
import sys

from guion_nueve import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "nueve"
EVENTOS = {
    "pierdes": ("pierdes", "hook"), "dinero": "dinero",
    "ganas": "Ganas", "noventa": "90", "pierdes2": ("Pierdes", "cuenta"), "cien": ("100", "cuenta"), "total": "Total", "menos": "menos",
    "igual": "igual", "sola": "sola", "todo": "todo",
    "sigueme": "Sígueme",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_aciertas_9_de_10", TITULO,
                   "Reel de alcance (~16-18 s, 1080x1920): pregunta o dato que choca, cuenta sencilla, giro y CTA de seguir. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("ganas", "pierdes2", "sola"), campanas=("noventa", "sigueme"),
            golpes=("dinero", "cien", "menos", "todo"),
            intensidad={"hook": (1, 1, 1, 0), "cuenta": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cta": (1, 1, 1, 1)})
