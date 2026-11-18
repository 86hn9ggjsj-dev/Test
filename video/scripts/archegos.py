"""Reel con historia real (formato v2): Bill Hwang y Archegos (2021).

Uso: python scripts/archegos.py <ffmpeg>   ·   Voz: input/archegos_voz.(mp3|wav)
Salida: public/gen/archegos_mezcla.wav, src/gen/archegos.json, guiones/reel_archegos.md
"""
import sys

from guion_archegos import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "archegos"
EVENTOS = {"20000": "20.000", "2": ("2", "hook"), "llamaba": "llamaba.", "hwang": "Hwang,", "2021": "2021.", "punado": "puñado", "prestado": "prestado.",
           "mucho": "Mucho.", "subian": "subían,", "genio": "genio.", "sigueme": "Sígueme,", "caida": "caída.", "cae": "cae.", "bancos": "bancos",
           "garantias": "garantías.", "tiene": "tiene.", "golpe": "golpe.", "condenado": "condenado", "18": "18", "concentrado": "concentrado",
           "apalancado": "apalancado:", "vez": ("vez.", "giro"), "cuanto": "¿Cuánto", "mandaselo": "Mándaselo"}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_archegos", TITULO,
                   "Reel de prueba (~32 s, 1080x1920, formato v2): historia real con cifra enorme, «sígueme» sobre la escena, regla práctica y pregunta + mándaselo.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("hwang", "punado", "subian", "bancos", "concentrado"), campanas=("sigueme", "cuanto"),
            golpes=("2", "mucho", "cae", "golpe", "18", "vez"),
            intensidad={"hook": (1, 1, 1, 0), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "pregunta": (1, 0, 1, 1)})
