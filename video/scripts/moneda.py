"""Reel de alcance "¿Tu estrategia acierta el 60 %? Una moneda también" (~40 s, pregunta a mitad y CTA de seguir).

Uso: python scripts/moneda.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py moneda
Voz: input/moneda_voz.(mp3|wav). Salida: public/gen/moneda_mezcla.wav, src/gen/moneda.json, guiones/reel_moneda.md
"""
import sys

from guion_moneda import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "moneda"
EVENTOS = {
    "moneda": ("moneda", "hook"),
    "antes": ("Antes", "pregunta"), "leo": "leo",
    "lanza": "Lanza", "uno": ("1", "veinte"), "doce": "12", "sesenta2": ("60%", "veinte"), "ninguna": "ninguna", "nada": "nada",
    "ahora": "Ahora", "sesenta3": ("60%", "doscientas"), "tres": ("3", "doscientas"), "mil": "mil",
    "mala": "mala", "buena": "buena", "primero": "Primero", "hablamos": "hablamos",
    "sigueme": "Sígueme",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_moneda", TITULO,
                   "Reel de alcance (~40 s, 1080x1920): pregunta que choca, pregunta a los espectadores a mitad, cuenta, giro y CTA de seguir. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("lanza", "doce", "ahora", "primero"), campanas=("leo", "sigueme"),
            golpes=("moneda", "nada", "tres"),
            intensidad={"hook": (1, 1, 1, 0), "pregunta": (1, 0, 1, 0), "veinte": (1, 1, 1, 1), "doscientas": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cta": (1, 1, 1, 1)})
