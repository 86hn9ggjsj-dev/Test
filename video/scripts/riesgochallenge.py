"""Reel 5-30-10 «dopamina» de fondeo, sin bot: un 5 % por operación en el challenge te suspende tú solo.

Uso: python scripts/riesgochallenge.py <ffmpeg>   ·   Voz: input/riesgochallenge_voz.(mp3|wav)
Salida: public/gen/riesgochallenge_mezcla.wav, src/gen/riesgochallenge.json, guiones/reel_riesgochallenge.md
"""
import sys

from guion_riesgochallenge import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "riesgochallenge"
EVENTOS = {'si': ('Si', 'hook'), 'arriesgas': ('arriesgas', 'hook'), 'challenge': ('challenge,', 'hook'), 'suspendes': 'suspendes', 'solo': ('solo.', 'hook'),
           'cuenta': ('cuenta', 'uno'), 'perder': ('perder', 'uno'), 'dos': ('dos', 'uno'), 'seguidas': ('seguidas', 'uno'), 'fuera': 'fuera.', 'mitad': ('mitad,', 'uno'),
           'cuatro': 'cuatro', 'primeras': 'primeras', 'sigueme': 'Sígueme,', 'nadie': 'nadie', 'echen': 'echen', 'rapido': 'rápido', 'diez': 'diez',
           'mil': 'mil.', 'lento': 'lento,', 'vivo': 'vivo.', 'regla': 'regla:', 'decimo': 'décimo', 'perder2': ('perder.', 'giro'), 'llegado': 'llegado',
           'comenta': 'Comenta', 'riesgo': ('RIESGO', 'cierre'), 'privado': 'privado', 'calcular': 'calcular', 'cuentafin': ('cuenta.', 'cierre')}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_riesgochallenge", TITULO, "Reel 5-30-10 «dopamina» de fondeo (~45 s): gancho de 5 s, una idea con el «sígueme» a mitad y 10 s de conversión con la palabra RIESGO (sin bot).", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("cuenta", "seguidas", "mitad", "primeras", "echen", "lento", "regla", "comenta"),
            campanas=("sigueme", "riesgo"), golpes=("si", "suspendes", "fuera", "cuatro", "diez", "mil", "vivo", "decimo", "privado"),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
