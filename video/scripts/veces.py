"""Reel con historia (formato v2): Marcos mira el gráfico 143 veces en un día.

Uso: python scripts/veces.py <ffmpeg>   ·   Voz: input/veces_voz.(mp3|wav)
Salida: public/gen/veces_mezcla.wav, src/gen/veces.json, guiones/reel_veces.md
"""
import sys

from guion_veces import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "veces"
EVENTOS = {"143": "143", "dia": "día.", "metro": "metro.", "bano": ("baño.", "uno"), "novia": "novia.", "cambio": "cambió", "cero": "Cero.",
           "120": "120", "asusto": "asustó", "roja": "roja", "cerro": "cerró.", "sigueme": "Sígueme,", "duele": "duele.", "diez": "Diez",
           "objetivo": ("objetivo.", "tres"), "sin": "Sin", "regla": "regla:", "stop": "stop,", "alerta": "alerta.", "cierras": "cierras",
           "aplicacion": "aplicación.", "mires": "mires.", "hoy": "hoy?", "etiqueta": "Etiqueta"}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_veces", TITULO,
                   "Reel de alcance (~32 s, 1080x1920, formato v2): Marcos pegado al gráfico, «sígueme» sobre la escena, regla práctica (stop, objetivo, alerta) y pregunta + etiqueta.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("metro", "bano", "novia", "stop", "objetivo", "alerta"), campanas=("sigueme", "etiqueta"),
            golpes=("cero", "cerro", "sin", "cierras"),
            intensidad={"hook": (1, 1, 1, 0), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "pregunta": (1, 0, 1, 1)})
