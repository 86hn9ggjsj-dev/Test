"""Reel con historia real (5-30-10): GameStop y Melvin Capital (enero de 2021).

Uso: python scripts/gamestop.py <ffmpeg>   ·   Voz: input/gamestop_voz.(mp3|wav)
Salida: public/gen/gamestop_mezcla.wav, src/gen/gamestop.json, guiones/reel_gamestop.md
"""
import sys

from guion_gamestop import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "gamestop"
EVENTOS = {"millones": ("millones", "hook"), "mitad": "mitad", "mes": "mes.", "videojuegos": "videojuegos.", "enero": "enero", "melvin": "Melvin",
           "corto": ("corto:", "uno"), "caia": "caía.", "reddit": "Reddit", "comprar": "comprar.", "20": "20", "400": "400.", "sigueme": "Sígueme,",
           "trampa": "trampa.", "compras": "compras,", "pusiste": "pusiste.", "vendes": ("vendes", "tres"), "techo": "techo.", "2750": "2.750",
           "cerraron": "cerraron.", "solucion": "solución:", "stop": "stop", "entrar": "entrar.", "excepciones": "excepciones.", "sigues": "sigues",
           "comenta": "Comenta", "bot": "BOT", "privado": "privado", "auditada": "auditada"}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_gamestop", TITULO,
                   "Reel 5-30-10 (~44 s, 1080x1920): gancho con prueba, una sola idea (la pérdida en corto no tiene techo) con el «sígueme» a mitad y 10 s de conversión.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("melvin", "reddit", "compras", "vendes", "comenta"), campanas=("sigueme", "bot"),
            golpes=("videojuegos", "400", "techo", "cerraron", "excepciones"),
            intensidad={"hook": (1, 1, 1, 0), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
