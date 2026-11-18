"""Reel de alcance con historia y consejo (Lucía y la vela verde). Solo subtítulos abajo y el «sígueme» grande en medio.

Uso: python scripts/fomo.py <ffmpeg>   ·   Voz: input/fomo_voz.(mp3|wav)
Salida: public/gen/fomo_mezcla.wav, src/gen/fomo.json, guiones/reel_fomo.md
"""
import sys

from guion_fomo import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "fomo"
EVENTOS = {"lucia": "Lucía", "20": "20", "manana": "mañana...", "aguantarse": "aguantarse.", "entro": "Entró", "arriba": "arriba", "10": "10", "5": "5", "fomo": "FOMO,", "fuera": "fuera.", "perder": "perder,", "nada": "nada.", "sigueme": "Sígueme,", "salvado": "salvado.", "plan": "plan", "operacion": "operación.", "retroceda": "retroceda.", "dejala": "déjala", "dias": "días.", "acaban": "acaban.", "cuenta": "cuenta,", "si": "sí.", "ultima": "última", "etiqueta": "Etiqueta"}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_fomo", TITULO,
                   "Reel de alcance (~36 s, 1080x1920): historia con personaje, «sígueme» en el momento de suspense, consejo práctico y pregunta + etiqueta al final. Solo subtítulos abajo.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("entro", "fomo", "plan", "retroceda"), campanas=("sigueme", "etiqueta"),
            golpes=("aguantarse", "5", "dejala", "si"),
            intensidad={"hook": (1, 1, 1, 0), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "pregunta": (1, 0, 1, 1)})
