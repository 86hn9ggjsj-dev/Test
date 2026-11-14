"""Reel de alcance "¿Compras más cuando el precio baja para promediar?" (~36 s, con CTA de seguir).

Uso: python scripts/promediar.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py promediar
Voz: input/promediar_voz.(mp3|wav). Salida: public/gen/promediar_mezcla.wav, src/gen/promediar.json, guiones/reel_promediar.md
"""
import sys

from guion_promediar import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "promediar"
EVENTOS = {
    "baja": "baja", "mira": "Mira",
    "cien": ("100", "cuenta"), "ochenta": ("80", "cuenta"), "vuelves": "Vuelves", "medio": "medio", "noventa": ("90", "cuenta"),
    "suba": "suba", "pierdes": ("pierdes", "magia"), "doce": "12,5%", "veinticinco": "25", "magia": "magia",
    "cayendo": "cayendo", "cincuenta": ("50", "caida"), "ochenta2": ("80", "caida"),
    "reduce": "reduce", "duplica": "duplica", "peor": "peor", "decide": "Decide", "despues": "después",
    "sigueme": "Sígueme",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_promediar", TITULO,
                   "Reel de alcance (~36 s, 1080x1920): pregunta que choca, cuenta sencilla, giro y CTA de seguir. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("cien", "vuelves", "suba", "cayendo", "decide"), campanas=("magia", "sigueme"),
            golpes=("ochenta2", "duplica"),
            intensidad={"hook": (1, 1, 1, 0), "cuenta": (1, 1, 1, 1), "magia": (1, 1, 1, 1), "caida": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cta": (1, 1, 1, 1)})
