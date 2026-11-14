"""Reel de alcance "¿Doblas la apuesta después de perder?" (~40 s, pregunta a mitad y CTA de seguir).

Uso: python scripts/doblar.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py doblar
Voz: input/doblar_voz.(mp3|wav). Salida: public/gen/doblar_mezcla.wav, src/gen/doblar.json, guiones/reel_doblar.md
"""
import sys

from guion_doblar import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "doblar"
EVENTOS = {
    "perder": ("perder", "hook"), "mira": "Mira",
    "diez": ("10", "escalera"), "veinte": "20", "cuarenta": "40", "ochenta": "80", "c160": "160", "c320": "320",
    "antes": ("Antes", "pregunta"), "pasado": "pasado",
    "ocho": ("8", "cuenta"), "r2550": "2.550", "siguiente": "siguiente", "r2560": "2.560", "ganar": "ganar", "diez2": ("10", "cuenta"),
    "suerte": "suerte", "c55": "55%", "normal": "normal",
    "recupera": "recupera", "grande": "grande", "llega": "llega",
    "sigueme": "Sígueme",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_doblar", TITULO,
                   "Reel de alcance (~40 s, 1080x1920): pregunta que choca, pregunta a los espectadores a mitad, cuenta, giro y CTA de seguir. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("diez", "veinte", "cuarenta", "ochenta", "c160", "c320", "antes"), campanas=("pasado", "sigueme"),
            golpes=("r2560", "diez2", "normal", "llega"),
            intensidad={"hook": (1, 1, 1, 0), "escalera": (1, 1, 1, 1), "pregunta": (1, 0, 1, 0), "cuenta": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1), "cta": (1, 1, 1, 1)})
