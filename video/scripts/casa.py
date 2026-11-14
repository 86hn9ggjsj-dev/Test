"""Reel 5-30-10 «dopamina»: el efecto dinero de la casa (Thaler y Johnson, 1990).

Uso: python scripts/casa.py <ffmpeg>   ·   Voz: input/casa_voz.(mp3|wav)
Salida: public/gen/casa_mezcla.wav, src/gen/casa.json, guiones/reel_casa.md
"""
import sys

from guion_casa import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "casa"
EVENTOS = {'tu': ('Tu', 'hook'), 'peligroso': 'peligroso', 'pierdes': 'pierdes.', 'ganas': ('ganas', 'hook'), 'mucho': 'mucho.', '400': ('400', 'uno'),
           'manana': 'mañana,', 'cabeza': 'cabeza', 'tuyo': 'tuyo.', 'siente': 'siente', 'casino': ('casino.', 'uno'), 'casino2': ('casino', 'uno'), 'apuesta': 'apuesta.',
           'sigueme': 'Sígueme,', 'buenas': 'buenas.', 'efecto': 'efecto', 'casa': ('casa,', 'dos'), '1990': '1990.', 'doblas': 'Doblas', 'mala': 'mala.',
           'devuelves': 'devuelves', 'algo': 'algo', 'regla': 'regla:', 'objetivo': 'objetivo', 'cierras': 'cierras.', 'sigues': 'sigues,', 'mitad': 'mitad',
           'doble': 'doble.', 'llegado': 'llegado', 'comenta': 'Comenta', 'bot': ('BOT', 'cierre'), 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_casa", TITULO, "Reel 5-30-10 «dopamina» (~44 s): gancho de 5 s, una idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("pierdes", "manana", "cabeza", "efecto", "mala", "objetivo", "mitad", "comenta"),
            campanas=("sigueme", "bot"), golpes=("tu", "mucho", "400", "apuesta", "doblas", "devuelves", "cierras", "privado"),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
