"""Reel 5-30-10: LTCM, el fondo con dos premios Nobel que perdió 4.600 millones en 1998.

Uso: python scripts/ltcm.py <ffmpeg>   ·   Voz: input/ltcm_voz.(mp3|wav)
Salida: public/gen/ltcm_mezcla.wav, src/gen/ltcm.json, guiones/reel_ltcm.md
"""
import sys

from guion_ltcm import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "ltcm"
EVENTOS = {'nobel': 'Nobel', '4600': '4.600', 'meses': 'meses.', 'capital': 'Capital.', '40': '40', 'ano': 'año.', 'modelos': ('modelos', 'uno'), 'prestado': 'prestado.', 'imposible': ('imposible.', 'dos'), 'sigueme': 'Sígueme,', 'pasar': 'pasar.', 'agosto': 'Agosto', 'rusia': 'Rusia', 'deuda': 'deuda.', 'esperaba': 'esperaba.', 'reserva': 'Reserva', '14': '14', '3600': '3.600', 'solucion': 'solución:', 'peor': 'peor', 'vivo': 'vivo?', 'tamano': 'tamaño.', 'sigues': 'sigues', 'riesgo': 'riesgo.', 'comenta': 'Comenta', 'bot': 'BOT', 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_ltcm", TITULO,
                   "Reel 5-30-10 (~45 s, 1080x1920): gancho de 5 s, una sola idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=('capital', 'agosto', 'reserva', 'peor', 'comenta'), campanas=("sigueme", "bot"),
            golpes=('4600', 'imposible', 'deuda', 'esperaba', 'vivo'),
            intensidad={"hook": (1, 1, 1, 0), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
