"""Reel con historia (5-30-10): Marcos opera por venganza después de perder.

Uso: python scripts/venganza.py <ffmpeg>   ·   Voz: input/venganza_voz.(mp3|wav)
Salida: public/gen/venganza_mezcla.wav, src/gen/venganza.json, guiones/reel_venganza.md
"""
import sys

from guion_venganza import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "venganza"
EVENTOS = {"perder0": ("perder.", "hook"), "200": "200", "10": "10", "manana": "mañana.", "dos": "Dos", "dentro": "dentro", "doble": "doble.",
           "recuperar": "recuperar.", "volvio": ("Volvió", "dos"), "perder2": ("perder.", "dos"), "entrar": "entrar.", "sigueme": "Sígueme,",
           "todos": "todos.", "11": "11", "1400": "1.400", "despues": ("Después", "tres"), "ganar": "ganar:", "mal": "mal.", "solucion": "solución:",
           "escribelo": "escríbelo", "plataforma": "plataforma.", "2": ("2", "giro"), "dia": "día.", "manana2": ("Mañana", "giro"), "ahi": "ahí.",
           "llegado": "llegado", "pasado": ("pasado.", "cierre"), "comenta": "Comenta", "bot": "BOT", "privado": "privado", "auditada": "auditada"}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_venganza", TITULO,
                   "Reel 5-30-10 (~41 s, 1080x1920): gancho de 5 s, una sola idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT → mensaje directo y cuenta auditada).",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("dos", "volvio", "entrar", "escribelo", "comenta"), campanas=("sigueme", "bot"),
            golpes=("doble", "1400", "mal", "dia"),
            intensidad={"hook": (1, 1, 1, 0), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
