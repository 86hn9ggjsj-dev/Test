"""Reel 5-30-10 «dopamina»: el sesgo retrospectivo (el gráfico de ayer).

Uso: python scripts/ayer.py <ffmpeg>   ·   Voz: input/ayer_voz.(mp3|wav)
Salida: public/gen/ayer_mezcla.wav, src/gen/ayer.json, guiones/reel_ayer.md
"""
import sys

from guion_ayer import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "ayer"
EVENTOS = {'grafico': ('gráfico', 'hook'), 'ayer': ('ayer', 'hook'), 'obvio': 'obvio.', 'aprendes': 'aprendes', 'vela': ('vela', 'uno'), 'subio': 'subió', 'clarisimo': 'clarísimo,', 'entre': 'entré?', 'pero': ('Pero', 'uno'), 'medias': 'medias,', 'veias': 'veías.', 'nadie': ('Nadie', 'uno'), 'sigueme': 'Sígueme,', 'truco': 'truco', 'sesgo': 'sesgo', 'final': 'final,', 'reescribe': 'reescribe', 'sabias': 'sabías.', 'trampas': 'trampas.', 'regla': 'regla:', 'tapa': 'tapa', 'derecha': 'derecha', 'decide': 'Decide', 'entro': ('entro', 'giro'), 'stop': ('stop.', 'giro'), 'apuntalo': 'Apúntalo.', 'destapa': 'destapa.', 'llegado': 'llegado', 'cinco': ('cinco', 'cierre'), 'comenta': 'Comenta', 'bot': ('BOT', 'cierre'), 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_ayer", TITULO, "Reel 5-30-10 «dopamina» (~40 s): gancho de 5 s, una idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=('vela', 'pero', 'truco', 'sesgo', 'regla', 'decide', 'apuntalo', 'comenta'), campanas=('sigueme', 'bot'), golpes=('grafico', 'obvio', 'clarisimo', 'veias', 'reescribe', 'trampas', 'tapa', 'destapa', 'privado'),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
