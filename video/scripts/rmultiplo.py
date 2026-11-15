"""Reel 5-30-10 «dopamina»: medir las operaciones en R (la media en R de 50 operaciones es la ventaja).

Uso: python scripts/rmultiplo.py <ffmpeg>   ·   Voz: input/rmultiplo_voz.(mp3|wav)
Salida: public/gen/rmultiplo_mezcla.wav, src/gen/rmultiplo.json, guiones/reel_rmultiplo.md
"""
import sys

from guion_rmultiplo import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "rmultiplo"
EVENTOS = {'si': ('Si', 'hook'), 'euros': ('euros,', 'hook'), 'sabes': ('sabes', 'hook'), 'trader': ('trader.', 'hook'), 'midelas': 'Mídelas', 'arriesgas': ('arriesgas', 'uno'), 'cada': ('cada', 'uno'), '50': ('50', 'uno'), '150': ('150:', 'uno'), 'salta': 'salta', 'stop': ('stop:', 'uno'), 'sigueme': 'Sígueme,', 'importa': 'importa.', 'suma': 'Suma', 'divide': 'divide', 'numero': ('número', 'dos'), 'ventaja': 'ventaja.', 'mas': ('Más', 'dos'), 'quinta': 'quinta', 'negativo': 'Negativo:', 'arregla': 'arregla.', 'regla': 'regla:', 'positivo': 'positivo.', 'despues': ('Después,', 'giro'), 'tamano': ('tamaño.', 'giro'), 'llegado': 'llegado', 'numero2': ('número.', 'cierre'), 'comenta': 'Comenta', 'bot': ('BOT', 'cierre'), 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_rmultiplo", TITULO, "Reel 5-30-10 «dopamina» (~40 s): gancho de 5 s, una idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("euros", "midelas", "arriesgas", "suma", "divide", "regla", "despues", "comenta"), campanas=("sigueme", "bot"), golpes=("si", "sabes", "150", "salta", "ventaja", "negativo", "positivo", "tamano", "privado"),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
