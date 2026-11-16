"""Reel 5-30-10 «dopamina»: FTX y el riesgo de dejar el dinero en un bróker o exchange.

Uso: python scripts/ftx.py <ffmpeg>   ·   Voz: input/ftx_voz.(mp3|wav)
Salida: public/gen/ftx_mezcla.wav, src/gen/ftx.json, guiones/reel_ftx.md
"""
import sys

from guion_ftx import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "ftx"
EVENTOS = {'millon': ('millón', 'hook'), 'sacar': ('sacar', 'hook'), 'estaba': ('estaba.', 'hook'), 'ftx': ('FTX,', 'uno'), 'cripto': 'cripto', '32000': '32.000', 'dolares': ('dólares.', 'uno'), 'dias': ('días', 'uno'), 'quisieron': 'quisieron', 'cerraron': 'cerraron', 'retiradas': 'retiradas.', 'sigueme': 'Sígueme,', 'dentro': 'dentro', 'importa': 'importa.', 'clientes': 'clientes', 'apostar': 'apostar', 'empresa': 'empresa', 'dueno': 'dueño.', 'fundador': 'fundador', 'condenado': 'condenado', '25': ('25', 'dos'), 'carcel': 'cárcel.', 'regla': 'regla:', 'tuyo': 'tuyo', 'sacas': 'sacas.', 'regulado': 'regulado,', 'dejes': 'dejes', 'operar': ('operar.', 'giro'), 'llegado': 'llegado', 'mirar': 'mirar.', 'comenta': 'Comenta', 'bot': ('BOT', 'cierre'), 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_ftx", TITULO, "Reel 5-30-10 «dopamina» (~40 s): gancho de 5 s, una idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("ftx", "dias", "clientes", "fundador", "regla", "regulado", "comenta"), campanas=("sigueme", "bot"), golpes=("millon", "estaba", "32000", "cerraron", "apostar", "25", "sacas", "privado"),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
