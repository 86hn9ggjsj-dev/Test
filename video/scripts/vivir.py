"""Reel de alcance "¿Cuánto dinero necesitas para vivir del trading?" (~38 s, pregunta a mitad y CTA de seguir).

Uso: python scripts/vivir.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py vivir
Voz: input/vivir_voz.(mp3|wav). Salida: public/gen/vivir_mezcla.wav, src/gen/vivir.json, guiones/reel_vivir.md
"""
import sys

from guion_vivir import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "vivir"
EVENTOS = {
    "vivir": "vivir",
    "dosmil": "2.000", "r24": "24.000",
    "antes": ("Antes", "pregunta"), "empezaste": "empezaste",
    "veinte": ("20%", "cuenta"), "excelente": "excelente", "fondos": "fondos", "necesitas": ("necesitas", "cuenta"), "r120": "120.000",
    "diez": "10.000", "r240": "240%", "todos": "Todos",
    "queman": "queman", "arriesgando": "arriesgando",
    "sigueme": "Sígueme",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_vivir", TITULO,
                   "Reel de alcance (~38 s, 1080x1920): pregunta que choca, pregunta a los espectadores a mitad, cuenta, giro y CTA de seguir. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("dosmil", "antes", "veinte", "diez", "queman"), campanas=("empezaste", "sigueme"),
            golpes=("r24", "r120", "r240"),
            intensidad={"hook": (1, 1, 1, 0), "sueldo": (1, 1, 1, 1), "pregunta": (1, 0, 1, 0), "cuenta": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1), "cta": (1, 1, 1, 1)})
