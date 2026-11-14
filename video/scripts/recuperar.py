"""Reel de alcance "¿Cuánto tardas en recuperar una mala semana?" (~40 s, pregunta a mitad y CTA de seguir).

Uso: python scripts/recuperar.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py recuperar
Voz: input/recuperar_voz.(mp3|wav). Salida: public/gen/recuperar_mezcla.wav, src/gen/recuperar.json, guiones/reel_recuperar.md
"""
import sys

from guion_recuperar import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "recuperar"
EVENTOS = {
    "doler": "doler",
    "veinte": ("20%", "cuenta"), "volver": "volver", "veinticinco": "25%",
    "antes": ("Antes", "pregunta"), "racha": "racha",
    "dos": "2%", "once": "11", "meses": "meses", "treinta": "30%", "cuarentaytres": "43%", "medio": "medio",
    "costar": "costar", "entero": "entero", "ganar": ("ganar", "giro"), "perder": ("perder", "giro"),
    "sigueme": "Sígueme",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_recuperar", TITULO,
                   "Reel de alcance (~40 s, 1080x1920): pregunta que choca, pregunta a los espectadores a mitad, cuenta, giro y CTA de seguir. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("veinte", "antes", "dos", "treinta", "ganar"), campanas=("racha", "sigueme"),
            golpes=("veinticinco", "once", "medio", "perder"),
            intensidad={"hook": (1, 1, 1, 0), "cuenta": (1, 1, 1, 1), "pregunta": (1, 0, 1, 0), "tiempo": (1, 1, 1, 1), "giro": (1, 0, 1, 1), "cta": (1, 1, 1, 1)})
