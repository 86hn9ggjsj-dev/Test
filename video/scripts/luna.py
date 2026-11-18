"""Reel 5-30-10 «dopamina»: Terra Luna (mayo de 2022): un 20 % al año «sin riesgo».

Uso: python scripts/luna.py <ffmpeg>   ·   Voz: input/luna_voz.(mp3|wav)
Salida: public/gen/luna_mezcla.wav, src/gen/luna.json, guiones/reel_luna.md
"""
import sys

from guion_luna import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "luna"
EVENTOS = {'un': ('Un', 'hook'), '20': ('20', 'hook'), 'riesgo': ('riesgo.', 'hook'), 'semana': 'semana,', 'perdido': 'perdido.', 'mayo': 'Mayo', 'terra': 'Terra', 'ofrecia': 'ofrecía', 'guardar': 'guardar', 'estable': 'estable.', 'dias': 'días,', 'dolar': 'dólar', 'luna': ('Luna', 'uno'), 'cero': 'cero.', 'sigueme': 'Sígueme,', 'clave': 'clave.', '40000': '40.000', 'evaporados': 'evaporados.', 'nadie': ('nadie', 'dos'), 'explicar': ('explicar', 'dos'), 'regla': 'regla:', 'paga': 'paga', 'pregunta': ('pregunta', 'giro'), 'sale': ('sale', 'giro'), 'eres': 'eres', 'llegado': 'llegado', 'preguntar': 'preguntar.', 'comenta': 'Comenta', 'bot': ('BOT', 'cierre'), 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_luna", TITULO, "Reel 5-30-10 «dopamina» (~40 s): gancho de 5 s, una idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=('mayo', 'terra', 'dias', 'nadie', 'regla', 'pregunta', 'comenta'), campanas=('sigueme', 'bot'), golpes=('un', 'riesgo', 'perdido', 'dolar', 'cero', '40000', 'sale', 'eres', 'privado'),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
