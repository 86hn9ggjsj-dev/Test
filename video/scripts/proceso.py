"""Corto v3 «dopamina»: una operación que pierde puede ser buena (proceso frente a resultado).

Uso: python scripts/proceso.py <ffmpeg>   ·   Voz: input/proceso_voz.(mp3|wav)
Salida: public/gen/proceso_mezcla.wav, src/gen/proceso.json, guiones/reel_proceso.md
"""
import sys

from guion_proceso import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "proceso"
EVENTOS = {'una': ('Una', 'hook'), 'pierde': ('pierde', 'hook'), 'buena': 'buena', 'gana': 'gana', 'malisima': 'malísima', 'plan': ('plan', 'uno'), 'stop': ('stop', 'uno'),
           'tamano': 'tamaño', 'perdiste': 'perdiste', 'hiciste': 'hiciste', 'trabajo': 'trabajo', 'sigueme': 'Sígueme', 'impulso': 'impulso',
           'ganaste': 'ganaste', 'mercado': 'mercado', 'mal': ('mal', 'dos'), 'habito': 'hábito', 'repetir': 'repetir', 'regla': 'regla', 'puntua': 'puntúa',
           '0': '0', '10': '10', 'seguiste': 'seguiste', 'plan2': ('plan', 'giro'), 'dinero': 'dinero', 'guardalo': 'Guárdalo', 'racha': 'racha'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_proceso", TITULO, "Corto v3 «dopamina» (~22 s, 1080x1920): una idea, «sígueme» a mitad y final para guardar.", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("pierde", "gana", "plan", "stop", "tamano", "impulso", "0"), campanas=("sigueme", "guardalo"),
            golpes=("una", "buena", "malisima", "trabajo", "ganaste", "habito", "10", "dinero"),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 1, 1, 1)})
