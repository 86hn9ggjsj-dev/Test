"""Reel 5-30-10 «dopamina»: el stop por tiempo.

Uso: python scripts/tiempo.py <ffmpeg>   ·   Voz: input/tiempo_voz.(mp3|wav)
Salida: public/gen/tiempo_mezcla.wav, src/gen/tiempo.json, guiones/reel_tiempo.md
"""
import sys

from guion_tiempo import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "tiempo"
EVENTOS = {'tu': ('Tu', 'hook'), 'tocar': 'tocar', 'stop': ('stop', 'hook'), 'mal': ('mal.', 'hook'), 'entras': 'Entras,', 'nada': ('nada.', 'uno'), 'vela': 'vela.', 'diez': 'Diez.', 'cien': 'Cien.', 'bloqueado': 'bloqueado,', 'cabeza': 'cabeza', 'sigueme': 'Sígueme,', 'usa': 'usa.', 'esperando': 'esperando', 'llega': 'llega,', 'fallado': 'fallado.', 'lejos': 'lejos.', 'tiempo': ('tiempo.', 'dos'), 'regla': 'regla:', 'decide': 'decide', 'tiempo2': ('tiempo', 'giro'), 'favor': 'favor,', 'cierras': 'cierras,', 'poco': 'poco.', 'llegado': 'llegado', 'hoy': 'hoy.', 'comenta': 'Comenta', 'bot': ('BOT', 'cierre'), 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_tiempo", TITULO, "Reel 5-30-10 «dopamina» (~38 s): gancho de 5 s, una idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("entras", "vela", "diez", "esperando", "regla", "decide", "comenta"), campanas=("sigueme", "bot"), golpes=("tu", "mal", "cien", "bloqueado", "fallado", "tiempo", "cierras", "privado"),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
