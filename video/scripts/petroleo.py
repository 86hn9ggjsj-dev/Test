"""Reel 5-30-10 «dopamina»: el petróleo a −37,63 $ (20 de abril de 2020).

Uso: python scripts/petroleo.py <ffmpeg>   ·   Voz: input/petroleo_voz.(mp3|wav)
Salida: public/gen/petroleo_mezcla.wav, src/gen/petroleo.json, guiones/reel_petroleo.md
"""
import sys

from guion_petroleo import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "petroleo"
EVENTOS = {'un': ('Un', 'hook'), 'petroleo': ('petróleo', 'hook'), 'cero': ('cero.', 'hook'), 'pagaban': 'pagaban', 'llevartelo': 'llevártelo.', '2020': ('2020,', 'uno'), 'texas': 'Texas', 'cerro': 'cerró', 'dolares': ('dólares.', 'uno'), 'guardarlo': 'guardarlo.', 'sigueme': 'Sígueme,', 'problema': 'problema', 'precio': ('precio.', 'sigueme'), 'contrato': ('contrato.', 'dos'), 'vencia': 'Vencía', 'siguiente': 'siguiente,', 'recibir': 'recibir', 'barriles': 'barriles.', 'tanque': 'tanque,', 'cualquier': 'cualquier', 'regla': 'regla:', 'compras': 'compras.', 'frase': 'frase', 'vence': 'vence,', 'operes': 'operes.', 'llegado': 'llegado', 'mirar': 'mirar.', 'comenta': 'Comenta', 'bot': ('BOT', 'cierre'), 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_petroleo", TITULO, "Reel 5-30-10 «dopamina» (~38 s): gancho de 5 s, una idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("pagaban", "texas", "contrato", "vencia", "regla", "frase", "comenta"), campanas=("sigueme", "bot"), golpes=("un", "cero", "dolares", "guardarlo", "recibir", "cualquier", "operes", "privado"),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
