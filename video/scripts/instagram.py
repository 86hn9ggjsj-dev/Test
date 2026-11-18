"""Reel de alcance "¿Por qué todos los traders de Instagram parecen ganar siempre?" (~40 s, pregunta a mitad y CTA de seguir).

Uso: python scripts/instagram.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py instagram
Voz: input/instagram_voz.(mp3|wav). Salida: public/gen/instagram_mezcla.wav, src/gen/instagram.json, guiones/reel_instagram.md
"""
import sys

from guion_instagram import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "instagram"
EVENTOS = {
    "estadistica": "Estadística",
    "mil": ("mil", "monedas"), "probable": "probable", "caras": "caras",
    "antes": ("Antes", "pregunta"), "cursos": "cursos",
    "genio": "genio", "suerte": ("suerte", "suerte"), "unico": "único", "videos": "vídeos",
    "nada": "nada", "auditada": "auditada",
    "fiarte": "fiarte", "bio": ("bio", "cierre"),
    "sigueme": "Sígueme",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_instagram", TITULO,
                   "Reel de alcance (~40 s, 1080x1920): pregunta que choca, pregunta a los espectadores a mitad, cuenta, giro y CTA de seguir. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("mil", "antes", "genio", "fiarte"), campanas=("caras", "bio", "sigueme"),
            golpes=("estadistica", "suerte", "auditada"),
            intensidad={"hook": (1, 1, 1, 0), "monedas": (1, 1, 1, 1), "pregunta": (1, 0, 1, 0), "suerte": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1), "cta": (1, 1, 1, 1)})
