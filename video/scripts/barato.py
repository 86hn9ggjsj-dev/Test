"""Reel 5-30-10 «dopamina»: «ha caído un 50 %, ya no puede bajar más».

Uso: python scripts/barato.py <ffmpeg>   ·   Voz: input/barato_voz.(mp3|wav)
Salida: public/gen/barato_mezcla.wav, src/gen/barato.json, guiones/reel_barato.md
"""
import sys

from guion_barato import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "barato"
EVENTOS = {'ha': ('Ha', 'hook'), '50': ('50', 'hook'), 'bajar': 'bajar', 'error': 'Error.', 'todo': ('Todo', 'uno'), '90': ('90', 'uno'), 'antes': ('antes', 'uno'), '50b': ('50.', 'uno'), 'alguien': 'alguien', 'barato': ('barato.', 'uno'), 'sigueme': 'Sígueme,', 'asusta': 'asusta.', 'cae': ('cae', 'dos'), '50c': ('50,', 'dos'), '80': '80', '90b': ('90', 'dos'), 'pensaste': 'pensaste', 'equivocaste': 'equivocaste.', 'regla': 'regla:', 'razon': 'razón', 'senal': 'señal,', 'stop': ('stop.', 'giro'), 'llegado': 'llegado', 'compras': 'compras', 'comenta': 'Comenta', 'bot': ('BOT', 'cierre'), 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_barato", TITULO, "Reel 5-30-10 «dopamina» (~40 s): gancho de 5 s, una idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=('todo', 'antes', 'cae', 'pensaste', 'regla', 'senal', 'comenta'), campanas=('sigueme', 'bot'), golpes=('ha', 'error', '90', 'barato', '80', '90b', 'equivocaste', 'stop', 'privado'),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
