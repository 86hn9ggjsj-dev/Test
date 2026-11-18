"""Reel 5-30-10 «dopamina»: la apuesta de Buffett contra los fondos (2008-2017).

Uso: python scripts/buffett.py <ffmpeg>   ·   Voz: input/buffett_voz.(mp3|wav)
Salida: public/gen/buffett_mezcla.wav, src/gen/buffett.json, guiones/reel_buffett.md
"""
import sys

from guion_buffett import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "buffett"
EVENTOS = {'buffett': ('Buffett', 'hook'), 'millon': ('millón', 'hook'), 'nada': ('nada', 'hook'), 'profesionales': ('profesionales.', 'hook'), '2008': '2008', 'reto': 'retó', 'fondo': ('fondo', 'uno'), 'copia': 'copia', 'cinco': ('cinco', 'uno'), 'caros': 'caros.', 'diez': ('Diez', 'uno'), 'sigueme': 'Sígueme,', 'parecido': 'parecido.', 'indice': ('índice,', 'dos'), '125': '125', 'fondos': ('fondos:', 'dos'), '36': '36.', 'comisiones': 'comisiones,', 'perdieron': 'perdieron', 'regla': 'regla:', 'compara': 'compara', 'indice2': ('índice.', 'giro'), 'gratis': 'gratis.', 'llegado': 'llegado', 'comparas': 'comparas.', 'comenta': 'Comenta', 'bot': ('BOT', 'cierre'), 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_buffett", TITULO, "Reel 5-30-10 «dopamina» (~40 s): gancho de 5 s, una idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=('2008', 'fondo', 'cinco', 'indice', 'regla', 'compara', 'comenta'), campanas=('sigueme', 'bot'), golpes=('buffett', 'profesionales', 'diez', '125', '36', 'perdieron', 'gratis', 'privado'),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
