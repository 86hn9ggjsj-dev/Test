"""Reel 5-30-10 «dopamina»: el 97 % de los que hicieron day trading más de 300 días perdió dinero (Chague, De-Losso y Giovannetti).

Uso: python scripts/brasil.py <ffmpeg>   ·   Voz: input/brasil_voz.(mp3|wav)
Salida: public/gen/brasil_mezcla.wav, src/gen/brasil.json, guiones/reel_brasil.md
"""
import sys

from guion_brasil import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "brasil"
EVENTOS = {'300': ('300', 'hook'), 'trading': ('trading.', 'hook'), '97': ('97', 'hook'), 'perdio': 'perdió', 'encuesta': 'encuesta:', 'datos': 'datos', 'brasil': 'Brasil,', 'uno': ('uno', 'uno'), 'cien': 'cien', 'salario': 'salario', 'sigueme': 'Sígueme,', 'estudio': 'estudio', 'peor': ('peor:', 'dos'), 'siguieron': 'siguieron', 'mejoraron': 'mejoraron.', 'repetir': 'Repetir', 'medir': 'medir', 'mejor': ('mejor.', 'dos'), 'regla': 'regla:', 'stop': ('stop', 'giro'), 'fecha': 'fecha', 'cifra': 'cifra:', 'seis': 'seis', 'pierdes': 'pierdes,', 'paras': 'paras', 'sistema': 'sistema.', 'llegado': 'llegado', 'otro': 'otro', 'comenta': 'Comenta', 'bot': ('BOT', 'cierre'), 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_brasil", TITULO, "Reel 5-30-10 «dopamina» (~40 s): gancho de 5 s, una idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("datos", "brasil", "cien", "estudio", "repetir", "fecha", "cifra", "comenta"), campanas=("sigueme", "bot"), golpes=("300", "97", "salario", "mejoraron", "medir", "stop", "seis", "paras", "privado"),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
