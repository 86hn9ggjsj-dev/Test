"""Corto v3 «dopamina»: al mercado le da igual a qué precio compraste (anclaje).

Uso: python scripts/anclaje.py <ffmpeg>   ·   Voz: input/anclaje_voz.(mp3|wav)
Salida: public/gen/anclaje_mezcla.wav, src/gen/anclaje.json, guiones/reel_anclaje.md
"""
import sys

from guion_anclaje import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "anclaje"
EVENTOS = {'al': ('Al', 'hook'), 'mercado': 'mercado', 'igual': 'igual', 'precio': ('precio', 'hook'), 'compraste': 'compraste', 'cierras': 'cierras', 'recuperar': 'recuperar',
           'pagaste': 'pagaste', 'esperas': ('esperas', 'uno'), 'sigueme': 'Sígueme', 'pregunta': ('pregunta', 'sigueme'), 'ahorrar': 'ahorrar',
           'anclaje': 'anclaje', 'cabeza': 'cabeza', 'entrada': 'entrada', 'referencia': 'referencia', 'nada': 'nada', 'pregunta2': ('pregunta', 'giro'),
           'hoy': 'hoy', 'abririas': 'abrirías', 'precio2': ('precio', 'giro'), 'respuesta': 'respuesta', 'no': ('no', 'giro'), 'ciérrala': 'ciérrala',
           'mandaselo': 'Mándaselo', 'meses': 'meses', 'salir': 'salir', 'tablas': 'tablas'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_anclaje", TITULO, "Corto v3 «dopamina» (~24 s, 1080x1920): una idea, «sígueme» a mitad y final para mandar.", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("cierras", "esperas", "cabeza", "hoy", "mandaselo"), campanas=("sigueme",),
            golpes=("al", "compraste", "anclaje", "nada", "ciérrala", "tablas"),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 1, 1, 1)})
