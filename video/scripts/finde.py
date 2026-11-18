"""Reel 5-30-10: el stop y el fin de semana (hueco del lunes).

Uso: python scripts/finde.py <ffmpeg>   ·   Voz: input/finde_voz.(mp3|wav)
Salida: public/gen/finde_mezcla.wav, src/gen/finde.json, guiones/reel_finde.md
"""
import sys

from guion_finde import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "finde"
EVENTOS = {'semana': ('semana.', 'hook'), 'viernes': ('Viernes', 'uno'), 'abierta': 'abierta.', 'stop1': ('Stop', 'uno'), '30': ('30', 'uno'), 'dormir': 'dormir', 'tranquilo': 'tranquilo.', 'domingo': 'domingo', 'noticia': 'noticia', 'esperaba': 'esperaba.', 'sigueme': 'Sígueme,', 'sorpresa': 'sorpresa.', 'lunes': ('lunes', 'tres'), 'cerro': 'cerró:', 'abajo': 'abajo.', 'hueco': ('hueco.', 'tres'), 'salta': 'salta', 'precio': 'precio', '140': '140', '30b': ('30.', 'tres'), 'solucion': 'solución:', 'cierre': ('cierre,', 'giro'), 'cierras': 'cierras', 'tamano': 'tamaño', 'hueco2': ('hueco.', 'giro'), 'controlas': 'controlas.', 'llegado': 'llegado', 'pilla': 'pilla.', 'comenta': 'Comenta', 'bot': 'BOT', 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_finde", TITULO,
                   "Reel 5-30-10 (~45 s, 1080x1920, estilo limpio): gancho de 5 s, una sola idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("viernes", "domingo", "lunes", "cierras", "comenta"), campanas=("sigueme", "bot"),
            golpes=("semana", "hueco", "140", "controlas"),
            intensidad={"hook": (1, 1, 1, 0), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
