"""Reel 5-30-10 «dopamina»: mover el stop a la entrada demasiado pronto.

Uso: python scripts/breakeven.py <ffmpeg>   ·   Voz: input/breakeven_voz.(mp3|wav)
Salida: public/gen/breakeven_mezcla.wav, src/gen/breakeven.json, guiones/reel_breakeven.md
"""
import sys

from guion_breakeven import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "breakeven"
EVENTOS = {'mueves': ('Mueves', 'hook'), 'entrada': ('entrada', 'hook'), 'perder': ('perder.', 'hook'), 'pierdes': ('pierdes.', 'hook'), 'favor': ('favor', 'uno'), 'subes': 'subes', 'entrada2': ('entrada.', 'uno'), 'puedes': ('puedes', 'uno'), 'vuelve': 'Vuelve,', 'cero': 'cero...', 'directo': 'directo', 'objetivo': ('objetivo.', 'uno'), 'sigueme': 'Sígueme,', 'arreglo': 'arreglo.', 'recta': 'recta:', 'avanza': 'avanza', 'retrocede': 'retrocede.', 'entrada3': ('entrada,', 'dos'), 'retroceso': 'retroceso', 'echa': 'echa.', 'regla': 'regla:', 'muevas': 'muevas', 'favor2': ('favor', 'giro'), 'menos': ('menos', 'giro'), 'arriesgas': ('arriesgas.', 'giro'), 'llegado': 'llegado', 'pasado': 'pasado.', 'comenta': 'Comenta', 'bot': ('BOT', 'cierre'), 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_breakeven", TITULO, "Reel 5-30-10 «dopamina» (~40 s): gancho de 5 s, una idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("subes", "vuelve", "avanza", "retrocede", "regla", "muevas", "comenta"), campanas=("sigueme", "bot"), golpes=("mueves", "pierdes", "puedes", "cero", "objetivo", "echa", "arriesgas", "privado"),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
