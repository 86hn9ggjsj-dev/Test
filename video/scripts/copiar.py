"""Reel 5-30-10 «dopamina»: elegir a quién copiar por el último mes.

Uso: python scripts/copiar.py <ffmpeg>   ·   Voz: input/copiar_voz.(mp3|wav)
Salida: public/gen/copiar_mezcla.wav, src/gen/copiar.json, guiones/reel_copiar.md
"""
import sys

from guion_copiar import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "copiar"
EVENTOS = {'copias': 'Copias', 'gano': ('ganó', 'hook'), 'pasado': 'pasado.', 'llegas': 'llegas', 'racha': 'racha.', 'mes': ('mes', 'uno'), 'riesgo': ('riesgo', 'uno'), 'bien': ('bien.', 'uno'), 'sube': 'sube', 'baja': 'baja', 'rapido': 'rápido.', 'sigueme': 'Sígueme,', 'numeros': ('números', 'sigueme'), 'uno': ('Uno:', 'dos'), 'tiempo': 'tiempo', 'ano': ('año', 'dos'), 'dos': ('Dos:', 'dos'), 'caida': ('caída.', 'dos'), 'mitad': 'mitad,', 'perderla': 'perderla,', 'dentro': 'dentro.', 'regla': 'regla:', 'copiar': ('copiar', 'giro'), 'caida2': ('caída', 'giro'), 'aguantarias': 'aguantarías', 'dinero': ('dinero.', 'giro'), 'llegado': 'llegado', 'comenta': 'Comenta', 'bot': ('BOT', 'cierre'), 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_copiar", TITULO, "Reel 5-30-10 «dopamina» (~40 s): gancho de 5 s, una idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=('mes', 'sube', 'uno', 'dos', 'regla', 'copiar', 'comenta'), campanas=('sigueme', 'bot'), golpes=('copias', 'racha', 'bien', 'rapido', 'ano', 'caida', 'dentro', 'aguantarias', 'privado'),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
