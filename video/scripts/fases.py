"""Reel de alcance "Las cuatro fases de todo el que empieza en trading" (~32 s, sígueme a mitad y pregunta al final).

Uso: python scripts/fases.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py fases
Voz: input/fases_voz.(mp3|wav). Salida: public/gen/fases_mezcla.wav, src/gen/fases.json, guiones/reel_fases.md
"""
import sys

from guion_fases import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "fases"
EVENTOS = {
    "cuatro0": ("cuatro", "hook"), "cual": "cuál",
    "tres": ("tres", "uno"), "genio": "genio.",
    "pierdes": ("pierdes,", "dos"), "manipulado": "manipulado.",
    "sigueme": "Sígueme,", "buena": "buena.",
    "doblas": "doblas", "recuperar": "recuperar...", "todo": ("todo", "tres"),
    "perfecta": "perfecta", "controlar": "controlar", "quedan": "quedan.",
    "fase": ("fase", "pregunta"), "etiqueta": "etiqueta",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_fases", TITULO,
                   "Reel de alcance (~32 s, 1080x1920): lista de fases con la que identificarse, «sígueme» a mitad y pregunta + etiqueta al final. Stickman mezclado con gráficos.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("tres", "pierdes", "doblas", "perfecta"), campanas=("sigueme", "etiqueta"),
            golpes=("genio", "manipulado", "todo", "quedan"),
            intensidad={"hook": (1, 1, 1, 0), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "cuatro": (1, 0, 1, 1), "pregunta": (1, 0, 1, 1)})
