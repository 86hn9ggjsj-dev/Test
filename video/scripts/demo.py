"""Reel con historia (formato v2): Marcos, de la cuenta demo a la real.

Uso: python scripts/demo.py <ffmpeg>   ·   Voz: input/demo_voz.(mp3|wav)
Salida: public/gen/demo_mezcla.wav, src/gen/demo.json, guiones/reel_demo.md
"""
import sys

from guion_demo import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "demo"
EVENTOS = {"300": "300", "real0": ("real", "hook"), "11": "11", "estrategia": "estrategia.", "grafico": "gráfico.", "marcos1": ("Marcos.", "uno"),
           "cambio": "cambió?", "duele": "duele.", "temblaba": "temblaba", "ganaba": "ganaba", "perdia": "perdía.", "sigueme": "Sígueme,",
           "arreglo": "arreglo.", "ridicula": "ridícula:", "20": ("20", "tres"), "ganar": "ganar:", "verdad": "verdad.", "pulso": "pulso,",
           "sube": "sube.", "millonario": "millonario", "etiqueta": "Etiqueta"}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_demo", TITULO,
                   "Reel de alcance (~30 s, 1080x1920, formato v2): gancho escrito desde el fotograma 0, historia de Marcos, «sígueme» sobre la escena, regla práctica y pregunta + etiqueta.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("estrategia", "grafico", "marcos1", "ridicula", "pulso"), campanas=("sigueme", "etiqueta"),
            golpes=("11", "duele", "verdad", "sube"),
            intensidad={"hook": (1, 1, 1, 0), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "pregunta": (1, 0, 1, 1)})
