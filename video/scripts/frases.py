"""Reel de alcance "Tres frases que dice un trader justo antes de quemar la cuenta" (~28 s, sígueme a mitad y pregunta al final).

Uso: python scripts/frases.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py frases
Voz: input/frases_voz.(mp3|wav). Salida: public/gen/frases_mezcla.wav, src/gen/frases.json, guiones/reel_frases.md
"""
import sys

from guion_frases import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "frases"
EVENTOS = {
    "quemar": "quemar", "tercera": ("tercera", "hook"), "duele": "duele",
    "diferente": "diferente.»",
    "volvera": "volverá.»", "vuelve": "vuelve.",
    "sigueme": "Sígueme",
    "solo": "«Solo", "recuperar": "recuperar...", "dejo": "dejo.»",
    "estrategia": "estrategia.", "excusas": "excusas", "pequena": "pequeña...", "grande": "grande.",
    "cual": "¿Cuál", "envia": "envíaselo",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_frases", TITULO,
                   "Reel de alcance (~28 s, 1080x1920): lista con promesa en el gancho, «sígueme» a mitad, giro y pregunta + envío al final. Con stickman.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("diferente", "volvera", "solo", "excusas"), campanas=("sigueme", "envia"),
            golpes=("duele", "vuelve", "dejo", "grande"),
            intensidad={"hook": (1, 1, 1, 0), "una": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "pregunta": (1, 0, 1, 1)})
