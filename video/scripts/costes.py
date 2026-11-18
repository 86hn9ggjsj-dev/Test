"""Reel de alcance "¿Cuánto te cuesta hacer 10 operaciones al día?" (~37 s, pregunta a mitad y CTA de seguir).

Uso: python scripts/costes.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py costes
Voz: input/costes_voz.(mp3|wav). Salida: public/gen/costes_mezcla.wav, src/gen/costes.json, guiones/reel_costes.md
"""
import sys

from guion_costes import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "costes"
EVENTOS = {
    "agarrate": "Agárrate", "tres": ("3", "coste"), "nada": "nada",
    "antes": ("Antes", "pregunta"), "leo": "leo",
    "diez2": ("10", "cuenta"), "treinta": "30", "ano": ("año", "cuenta"), "r250": "250", "r7500": "7.500",
    "cinco": "5.000", "r150": "150%", "igual": "igual",
    "arruina": "arruina", "cien": "cien",
    "sigueme": "Sígueme",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_costes", TITULO,
                   "Reel de alcance (~37 s, 1080x1920): pregunta que choca, pregunta a los espectadores a mitad, cuenta, giro y CTA de seguir. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("tres", "antes", "diez2", "cinco", "arruina"), campanas=("leo", "sigueme"),
            golpes=("r7500", "r150", "cien"),
            intensidad={"hook": (1, 1, 1, 0), "coste": (1, 1, 1, 1), "pregunta": (1, 0, 1, 0), "cuenta": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1), "cta": (1, 1, 1, 1)})
