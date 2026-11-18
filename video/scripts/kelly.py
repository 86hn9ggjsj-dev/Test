"""Reel de alcance "La fórmula del matemático que ganó al blackjack" (~38 s, sígueme a mitad y pregunta al final).

Uso: python scripts/kelly.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py kelly
Voz: input/kelly_voz.(mp3|wav). Salida: public/gen/kelly_mezcla.wav, src/gen/kelly.json, guiones/reel_kelly.md
"""
import sys

from guion_kelly import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "kelly"
EVENTOS = {
    "blackjack": "blackjack", "wall": "Wall",
    "thorp": "Thorp,", "kelly": ("Kelly.", "kelly"), "ventaja": "ventaja",
    "guardalo": "Guárdalo", "sigueme": "sígueme",
    "cincuentaycinco": "55%", "mismo": "mismo", "diez": "10%",
    "veinte": "20%", "nada": "nada", "treinta": "30%", "arruinas": "arruinas", "pierdes": "pierdes",
    "mitad": "mitad",
    "sincero": "sincero", "menos": ("menos", "pregunta"),
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_kelly", TITULO,
                   "Reel de alcance (~38 s, 1080x1920): historia que engancha, la fórmula, «sígueme» a mitad, la cuenta, el giro y pregunta al final. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("thorp", "cincuentaycinco", "veinte", "mitad"), campanas=("sigueme", "menos"),
            golpes=("blackjack", "diez", "treinta", "arruinas"),
            intensidad={"hook": (1, 1, 1, 0), "kelly": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "cuenta": (1, 1, 1, 1), "exceso": (1, 1, 1, 1), "pros": (1, 0, 1, 1), "pregunta": (1, 0, 1, 1)})
