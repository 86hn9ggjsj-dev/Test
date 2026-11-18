"""Reel 5-30-10: Marcos acierta 3 meses y el swap se come la ganancia.

Uso: python scripts/swap.py <ffmpeg>   ·   Voz: input/swap_voz.(mp3|wav)
Salida: public/gen/swap_mezcla.wav, src/gen/swap.json, guiones/reel_swap.md
"""
import sys

from guion_swap import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "swap"
EVENTOS = {'seguidos': 'seguidos.', 'broker': ('bróker.', 'hook'), '30000': '30.000', '1000': '1.000', 'correr': 'correr.', 'subio': 'Subió.', 'bajo': 'Bajó.', 'volvio': 'Volvió', 'tres': ('Tres', 'dos'), '500': '500', 'ganancia': 'ganancia.', 'sigueme': 'Sígueme,', 'pequena': 'pequeña.', 'noche': 'noche', 'cobra': ('cobra', 'tres'), 'swap': ('swap.', 'tres'), '450': '450', 'triple': 'triple.', 'solucion': 'solución:', 'ficha': 'ficha', 'objetivo': 'objetivo,', 'entres': 'entres.', 'llegado': 'llegado', 'susto': 'susto.', 'comenta': 'Comenta', 'bot': 'BOT', 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_swap", TITULO,
                   "Reel 5-30-10 (~45 s, 1080x1920): gancho de 5 s, una sola idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=('subio', 'bajo', 'volvio', 'noche', 'ficha', 'comenta'), campanas=("sigueme", "bot"),
            golpes=('broker', 'ganancia', 'swap', 'triple', 'entres'),
            intensidad={"hook": (1, 1, 1, 0), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
