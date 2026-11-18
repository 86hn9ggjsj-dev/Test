"""Reel 5-30-10 «dopamina»: la noticia falsa de la SEC sobre los ETF de bitcoin (9 de enero de 2024).

Uso: python scripts/sechack.py <ffmpeg>   ·   Voz: input/sechack_voz.(mp3|wav)
Salida: public/gen/sechack_mezcla.wav, src/gen/sechack.json, guiones/reel_sechack.md
"""
import sys

from guion_sechack import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "sechack"
EVENTOS = {'una': ('Una', 'hook'), 'falsa': ('falsa', 'hook'), 'movio': 'movió', 'mil': ('mil', 'hook'), 'minutos': ('minutos.', 'hook'), 'enero': 'enero', 'cuenta': ('cuenta', 'uno'), 'sec': 'SEC', 'aprueba': 'aprueba', 'etf': 'ETF', 'sube': 'sube', 'mil2': ('mil', 'uno'), 'sigueme': 'Sígueme,', 'despues': 'después', 'falso': 'falso:', 'hackeado': 'hackeado', 'desmintieron': 'desmintieron,', 'vuelta': 'vuelta.', 'titular': ('titular,', 'dos'), 'arriba': 'arriba.', 'regla': 'regla:', 'redes': 'redes.', 'buscalo': 'Búscalo', 'web': 'web', 'pasado': ('pasado.', 'giro'), 'llegado': 'llegado', 'cuelan': 'cuelan.', 'comenta': 'Comenta', 'bot': ('BOT', 'cierre'), 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_sechack", TITULO, "Reel 5-30-10 «dopamina» (~38 s): gancho de 5 s, una idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("cuenta", "aprueba", "despues", "hackeado", "regla", "buscalo", "comenta"), campanas=("sigueme", "bot"), golpes=("una", "minutos", "sec", "mil2", "falso", "vuelta", "arriba", "pasado", "privado"),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
