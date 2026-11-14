"""Reel de alcance "Tres cifras del trading que dan más miedo que Halloween" (~37 s, con CTA de seguir).

Uso: python scripts/miedo.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py miedo
Voz: input/miedo_voz.(mp3|wav). Salida: public/gen/miedo_mezcla.wav, src/gen/miedo.json, guiones/reel_halloween.md
"""
import sys

from guion_miedo import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "miedo"
EVENTOS = {
    "noche": "noche", "tres": ("Tres", "hook"), "halloween": "Halloween",
    "uno": "Uno", "unopct": ("1%", "uno"), "cien": ("100", "uno"), "contra": "contra", "todo": "todo",
    "dos": "Dos", "ciento": "100%", "mitad": "mitad", "doblar": "doblar", "empezar": "empezar",
    "tres3": ("Tres", "tres"), "regulador": "regulador", "siete": "7", "nueve": "9", "pierden": "pierden",
    "cura": "cura", "poco": "poco",
    "sigueme": "Sígueme",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_halloween", TITULO,
                   "Reel de alcance (~37 s, 1080x1920, para la noche de Halloween): pregunta, tres cifras, cura y CTA de seguir. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("uno", "dos", "tres3", "regulador"), campanas=("halloween", "sigueme"),
            golpes=("unopct", "todo", "ciento", "nueve"),
            intensidad={"hook": (1, 0, 1, 0), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "tres": (1, 1, 1, 1), "cura": (1, 0, 1, 1), "cta": (1, 1, 1, 1)})
