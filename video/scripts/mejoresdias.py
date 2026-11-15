"""Reel 5-30-10 «dopamina»: los 10 mejores días de la bolsa (J.P. Morgan, Guide to Retirement 2024).

Uso: python scripts/mejoresdias.py <ffmpeg>   ·   Voz: input/mejoresdias_voz.(mp3|wav)
Salida: public/gen/mejoresdias_mezcla.wav, src/gen/mejoresdias.json, guiones/reel_mejoresdias.md
"""
import sys

from guion_mejoresdias import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "mejoresdias"
EVENTOS = {'diez': ('Diez', 'hook'), 'veinte': ('veinte', 'hook'), 'pierdes': 'pierdes,', 'mitad': ('mitad.', 'hook'), 'bolsa': 'Bolsa', '2004': '2004', '2023': '2023:', 'tocar': 'tocar', 'sin': ('Sin', 'uno'), 'mejores': ('mejores', 'uno'), 'sigueme': 'Sígueme,', 'cuando': 'cuándo', 'siete': ('Siete', 'dos'), 'semanas': 'semanas', 'peores': 'peores', 'justo': 'justo', 'vendiste': 'vendiste', 'miedo': 'miedo.', 'regla': 'regla:', 'panico': 'pánico,', 'escribe': 'escribe', 'precio': ('precio', 'giro'), 'fecha': ('fecha', 'giro'), 'vuelves': 'vuelves', 'sabes': ('sabes,', 'giro'), 'vendas': 'vendas.', 'llegado': 'llegado', 'plan': 'plan.', 'comenta': 'Comenta', 'bot': ('BOT', 'cierre'), 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_mejoresdias", TITULO, "Reel 5-30-10 «dopamina» (~40 s): gancho de 5 s, una idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("veinte", "bolsa", "tocar", "semanas", "regla", "escribe", "fecha", "comenta"), campanas=("sigueme", "bot"), golpes=("diez", "mitad", "2023", "mejores", "siete", "vendiste", "panico", "vendas", "privado"),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
