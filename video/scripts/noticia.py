"""Reel 5-30-10 «dopamina»: el precio se mueve por la sorpresa, no por si el dato es bueno (NVIDIA, agosto de 2024).

Uso: python scripts/noticia.py <ffmpeg>   ·   Voz: input/noticia_voz.(mp3|wav)
Salida: public/gen/noticia_mezcla.wav, src/gen/noticia.json, guiones/reel_noticia.md
"""
import sys

from guion_noticia import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "noticia"
EVENTOS = {'nvidia': ('NVIDIA', 'hook'), 'gano': ('ganó', 'hook'), 'esperaban': ('esperaban.', 'hook'), 'hundio': ('hundió.', 'hook'), 'esfumaron': 'esfumaron', '200000': '200.000', 'valor': 'valor.', 'mercado': ('mercado', 'uno'), 'bueno': ('bueno', 'uno'), 'malo': 'malo.', 'diferencia': 'diferencia', 'esperaba': ('esperaba.', 'uno'), 'sigueme': 'Sígueme,', 'sustos': 'sustos.', 'todos': ('todos', 'dos'), 'antes': ('antes.', 'dos'), 'sale': ('sale,', 'dos'), 'venden': 'venden.', 'rumor': 'rumor', 'noticia': ('noticia.', 'dos'), 'regla': 'regla:', 'prevision': 'previsión.', 'sorpresa': ('sorpresa,', 'giro'), 'noticia2': ('noticia.', 'giro'), 'llegado': 'llegado', 'pillara': 'pillará', 'comenta': 'Comenta', 'bot': ('BOT', 'cierre'), 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_noticia", TITULO, "Reel 5-30-10 «dopamina» (~40 s): gancho de 5 s, una idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("esfumaron", "mercado", "todos", "sale", "regla", "prevision", "comenta"), campanas=("sigueme", "bot"), golpes=("nvidia", "hundio", "200000", "diferencia", "venden", "noticia", "sorpresa", "privado"),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
