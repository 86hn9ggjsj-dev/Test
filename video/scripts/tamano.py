"""Reel 5-30-10: Marcos compra siempre 100 acciones; Lucía calcula el tamaño desde el stop.

Uso: python scripts/tamano.py <ffmpeg>   ·   Voz: input/tamano_voz.(mp3|wav)
Salida: public/gen/tamano_mezcla.wav, src/gen/tamano.json, guiones/reel_tamano.md
"""
import sys

from guion_tamano import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "tamano"
EVENTOS = {'100': '100', '10': '10', '80': '80.', 'cerca': 'cerca,', 'poco': 'poco.', 'lejos': 'lejos,', '8': '8', 'cuenta0': ('cuenta.', 'uno'), 'lucia': 'Lucía', 'reves': 'revés:', '20': ('20', 'dos'), 'stop2': ('stop.', 'dos'), 'sigueme': 'Sígueme,', 'guardar': 'guardar.', 'tamano': ('Tamaño', 'tres'), 'distancia': 'distancia', '20b': ('20', 'tres'), '40': '40', '50': '50', '1': ('1', 'tres'), 'siempre': ('siempre', 'tres'), 'solucion': 'solución:', 'grafico': 'gráfico.', 'tamano2': ('tamaño,', 'giro'), 'cuenta2': ('cuenta.', 'giro'), 'llegado': 'llegado', 'guardatelo': 'guárdatelo.', 'comenta': 'Comenta', 'bot': 'BOT', 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_tamano", TITULO,
                   "Reel 5-30-10 (~45 s, 1080x1920): gancho de 5 s, una sola idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=('cerca', 'lejos', 'lucia', 'tamano', 'comenta'), campanas=("sigueme", "bot"),
            golpes=('80', '8', '50', 'siempre', 'cuenta2'),
            intensidad={"hook": (1, 1, 1, 0), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
