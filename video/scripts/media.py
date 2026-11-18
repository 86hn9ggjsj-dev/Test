"""Reel de alcance "Una rentabilidad media del 10 % al año que te hace perder dinero" (~38 s, con CTA de seguir).

Uso: python scripts/media.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py media
Voz: input/media_voz.(mp3|wav). Salida: public/gen/media_mezcla.wav, src/gen/media.json, guiones/reel_media_10.md
"""
import sys

from guion_media import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "media"
EVENTOS = {
    "perder": "perder", "dinero": ("dinero", "hook"),
    "metes": "Metes", "mil": "1.000", "sesenta": ("60%", "cuenta"), "milseis": "1.600", "cae": "cae", "cuarenta": ("40%", "cuenta"), "novecientos": "960",
    "media": ("Media", "media"), "mas60": ("60", "media"), "menos40": ("40", "media"), "dos": ("dos", "media"), "diez": ("10%", "media"), "euros": ("euros", "media"),
    "suma": "suma", "multiplica": "multiplica", "caidas": "caídas", "pesan": "pesan",
    "alguien": "alguien", "gana": "gana", "caido": "caído",
    "sigueme": "Sígueme",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_media_10", TITULO,
                   "Reel de alcance (~38 s, 1080x1920): dato que choca, cuenta sencilla, giro y CTA de seguir. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("metes", "mas60", "menos40", "suma", "multiplica", "alguien"), campanas=("diez", "sigueme"),
            golpes=("perder", "novecientos", "euros", "pesan", "caido"),
            intensidad={"hook": (1, 1, 1, 0), "cuenta": (1, 1, 1, 1), "media": (1, 1, 1, 1), "giro": (1, 0, 1, 1), "pregunta": (1, 1, 1, 1), "cta": (1, 1, 1, 1)})
