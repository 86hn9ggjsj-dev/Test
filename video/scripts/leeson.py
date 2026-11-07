"""Reel de alcance "Escondió sus pérdidas en la cuenta 88888 y hundió un banco de 233 años" (~38 s). Solo subtítulos abajo.

Uso: python scripts/leeson.py <ffmpeg>   ·   Voz: input/leeson_voz.(mp3|wav)
Salida: public/gen/leeson_mezcla.wav, src/gen/leeson.json, guiones/reel_leeson.md
"""
import sys

from guion_leeson import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "leeson"
EVENTOS = {
    "escondio": "Escondió", "88888": "88888...", "hundio": "hundió", "233": "233",
    "leeson": "Leeson,", "barings": "Barings", "singapur": "Singapur.", "perdia": "perdía,", "escondia": "escondía", "doblaba": "doblaba",
    "londres": "Londres", "ganaba": "ganaba",
    "sigueme": "Sígueme,", "pelicula": "película.",
    "terremoto": "terremoto", "hunde": "hunde", "cerrar": "cerrar,", "apuesta": ("apuesta", "tres"), "perdida": "Pérdida:", "827": "827", "libras": "libras.",
    "vendio": "vendió", "libra": "libra.", "error": ("error", "giro"), "20000": "20.000", "aceptar": "aceptar.",
    "primera": "primera", "mandaselo": "Mándaselo",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_leeson", TITULO,
                   "Reel de alcance (~38 s, 1080x1920): historia real con secreto en el gancho, bucle abierto antes del «sígueme», giro y pregunta + envío al final. Solo subtítulos abajo.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("escondia", "doblaba", "terremoto", "error"), campanas=("sigueme", "mandaselo"),
            golpes=("hundio", "hunde", "827", "libra"),
            intensidad={"hook": (1, 1, 1, 0), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "pregunta": (1, 0, 1, 1)})
