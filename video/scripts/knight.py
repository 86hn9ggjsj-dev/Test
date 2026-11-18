"""Reel de alcance "Un bot perdió casi 10 millones de dólares por minuto durante 45 minutos" (~36 s). Solo subtítulos abajo.

Uso: python scripts/knight.py <ffmpeg>   ·   Voz: input/knight_voz.(mp3|wav)
Salida: public/gen/knight_mezcla.wav, src/gen/knight.json, guiones/reel_knight.md
"""
import sys

from guion_knight import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "knight"
EVENTOS = {
    "bot": ("bot", "hook"), "10": "10", "minuto": "minuto.", "45": "45",
    "knight": "Knight", "2012": "2012.", "actualizan": "Actualizan", "olvidan": "olvidan", "servidor": "servidor.",
    "abre": "Abre", "loco": "loco:", "4": "4", "pidio": "pidió.",
    "sigueme": "Sígueme,", "cualquier": "cualquier",
    "apagan": "apagan,", "440": "440", "millones3": ("millones.", "tres"),
    "listo": "listo.", "limite": "límite", "apagado": "apagado.",
    "dejarias": "dejarías", "si": "Sí", "pasaselo": "pásaselo", "magia": "magia.",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_knight", TITULO,
                   "Reel de alcance (~36 s, 1080x1920): cifra imposible en el gancho, historia real, «sígueme» a mitad, lección y pregunta de sí/no + envío al final. Solo subtítulos abajo.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("actualizan", "abre", "limite"), campanas=("sigueme", "pasaselo"),
            golpes=("minuto", "olvidan", "440", "apagado"),
            intensidad={"hook": (1, 1, 1, 0), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "pregunta": (1, 0, 1, 1)})
