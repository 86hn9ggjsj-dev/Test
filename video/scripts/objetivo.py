"""Reel 5-30-10 «dopamina»: mover el objetivo más arriba (avaricia).

Uso: python scripts/objetivo.py <ffmpeg>   ·   Voz: input/objetivo_voz.(mp3|wav)
Salida: public/gen/objetivo_mezcla.wav, src/gen/objetivo.json, guiones/reel_objetivo.md
"""
import sys

from guion_objetivo import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "objetivo"
EVENTOS = {'llego': ('Llegó', 'hook'), 'objetivo': ('objetivo.', 'hook'), 'moviste': 'moviste', 'arriba': ('arriba.', 'hook'), 'ganar': 'ganar', '100': ('100', 'uno'), 'llega': ('Llega', 'uno'), 'seguir': 'seguir.', 'subes': 'Subes', 'vuelta': 'vuelta,', 'cierras': ('cierras', 'uno'), 'cero': ('cero.', 'uno'), 'perdidas': 'pérdidas.', 'sigueme': 'Sígueme,', 'sencilla': 'sencilla.', 'fria': 'fría.', 'moverlo': 'Moverlo', 'avaricia': 'avaricia', 'regla': 'regla:', 'llegue': 'llegue', 'mitad': ('mitad.', 'giro'), 'otra': 'otra', 'entrada': ('entrada.', 'giro'), 'ganado': 'ganado.', 'llegado': 'llegado', 'vez': ('vez.', 'cierre'), 'comenta': 'Comenta', 'bot': ('BOT', 'cierre'), 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_objetivo", TITULO, "Reel 5-30-10 «dopamina» (~40 s): gancho de 5 s, una idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=('ganar', 'subes', 'moverlo', 'regla', 'otra', 'comenta'), campanas=('sigueme', 'bot'), golpes=('llego', 'arriba', '100', 'vuelta', 'cero', 'avaricia', 'mitad', 'ganado', 'privado'),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
