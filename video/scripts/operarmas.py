"""Reel 5-30-10 «dopamina»: operar más te hace ganar menos (Barber y Odean, 2000).

Uso: python scripts/operarmas.py <ffmpeg>   ·   Voz: input/operarmas_voz.(mp3|wav)
Salida: public/gen/operarmas_mezcla.wav, src/gen/operarmas.json, guiones/reel_operarmas.md
"""
import sys

from guion_operarmas import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "operarmas"
EVENTOS = {'operar': ('Operar', 'hook'), 'menos': ('menos.', 'hook'), 'prueban': 'prueban', '60000': ('60.000', 'hook'), 'estudio': 'estudio', 'familias': 'familias',
           'anos': ('años.', 'uno'), 'tocaban': 'tocaban', '18': ('18', 'uno'), 'ano': ('año.', 'uno'), 'sigueme': 'Sígueme,', 'operaban': 'operaban.',
           '114': ('11,4.', 'dos'), 'siete': ('Siete', 'dos'), 'cada': ('cada', 'dos'), 'comisiones': 'comisiones', 'mismo': 'mismo.', 'perdieron': 'perdieron',
           'listos': 'listos', 'mercado': ('mercado.', 'dos'), 'regla': 'regla:', 'maximo': 'máximo', 'dia': ('día.', 'giro'), 'llegues': 'llegues,',
           'cierra': ('cierra.', 'giro'), 'llegado': 'llegado', 'cabeza': 'cabeza.', 'comenta': 'Comenta', 'bot': ('BOT', 'cierre'), 'privado': 'privado',
           'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_operarmas", TITULO, "Reel 5-30-10 «dopamina» (~44 s): gancho de 5 s, una idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("estudio", "familias", "tocaban", "siete", "comisiones", "regla", "maximo", "comenta"),
            campanas=("sigueme", "bot"), golpes=("operar", "60000", "18", "114", "perdieron", "cierra", "privado"),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
