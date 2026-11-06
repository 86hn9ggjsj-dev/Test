"""Reel de alcance "¿Por qué el casino nunca pierde?" (~39 s, sígueme a mitad y pregunta al final).

Uso: python scripts/casino.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py casino
Voz: input/casino_voz.(mp3|wav). Salida: public/gen/casino_mezcla.wav, src/gen/casino.json, guiones/reel_casino.md
"""
import sys

from guion_casino import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "casino"
EVENTOS = {
    "suerte": "suerte",
    "treintaysiete": ("37", "ruleta"), "rojo": "rojo", "dieciocho": "18", "dos7": "2,7%",
    "sigueme": "sígueme",
    "pierde": ("pierde", "giro"), "cien": ("100", "giro"), "r270": "2,70", "millones": "Millones", "limita": "limita", "sola": "sola",
    "pequena": "pequeña", "operar": "operar",
    "comentarios": ("comentarios", "pregunta"), "jugador": "jugador",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_casino", TITULO,
                   "Reel de alcance (~39 s, 1080x1920): pregunta que choca, contexto, «sígueme» a mitad, cuenta, giro y pregunta a los espectadores al final. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("rojo", "dieciocho", "pierde", "limita", "pequena"), campanas=("sigueme", "jugador"),
            golpes=("dos7", "r270", "operar"),
            intensidad={"hook": (1, 1, 1, 0), "ruleta": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "giro": (1, 1, 1, 1), "leccion": (1, 1, 1, 1), "pregunta": (1, 0, 1, 1)})
