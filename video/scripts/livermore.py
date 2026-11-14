"""Reel de alcance con historia y consejo (Livermore: 100 millones en 1929, bancarrota en 1934). Solo subtítulos abajo y el «sígueme» grande en medio.

Uso: python scripts/livermore.py <ffmpeg>   ·   Voz: input/livermore_voz.(mp3|wav)
Salida: public/gen/livermore_mezcla.wav, src/gen/livermore.json, guiones/reel_livermore.md
"""
import sys

from guion_livermore import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "livermore"
EVENTOS = {"1929": "1929,", "arruinaba": "arruinaba,", "100": "100", "dolares": "dólares.", "livermore": "Livermore", "caeria": "caería", "lleno": "lleno.", "famoso": "famoso", "reglas1": ("reglas.", "uno"), "dinero": "dinero,", "confianza": "confianza", "respeto": "respeto", "sigueme": "Sígueme,", "final": "final", "1934": "1934,", "bancarrota": "bancarrota.", "consejo": "Consejo:", "cuaderno": "cuaderno.", "leelas": "Léelas", "ganes": "ganes,", "estricto": "estricto.", "cual": "¿Cuál", "saltas": "saltas", "mandaselo": "Mándaselo", "cumple": "cumple."}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_livermore", TITULO,
                   "Reel de alcance (~36 s, 1080x1920): historia con personaje, «sígueme» en el momento de suspense, consejo práctico y pregunta + etiqueta al final. Solo subtítulos abajo.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("caeria", "dinero", "leelas"), campanas=("sigueme", "mandaselo"),
            golpes=("dolares", "lleno", "bancarrota", "estricto"),
            intensidad={"hook": (1, 1, 1, 0), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "pregunta": (1, 0, 1, 1)})
