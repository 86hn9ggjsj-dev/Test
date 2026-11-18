"""Reel de alcance "Test de diez segundos: ¿trading o apuesta?" (~32 s, sígueme a mitad y pregunta al final).

Uso: python scripts/apostando.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py apostando
Voz: input/apostando_voz.(mp3|wav). Salida: public/gen/apostando_mezcla.wav, src/gen/apostando.json, guiones/reel_apostando.md
"""
import sys

from guion_apostando import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "apostando"
EVENTOS = {
    "test": "Test", "trading": ("trading...", "hook"), "apostando": "apostando?", "rapido": "rápido.",
    "perder": ("perder", "una"), "entrar": ("entrar?", "una"),
    "ganando": "ganando", "perdiendo": "perdiendo?",
    "sigueme": "Sígueme,", "todos": "todos.",
    "abierto": "abierto", "aburrias": "aburrías?",
    "fallado": "fallado", "casino": "casino", "bonitos": "bonitos.", "sabe": "sabe", "apostador": "apostador", "despues": "después.",
    "cuantas": "¿Cuántas", "pasaselo": "pásaselo",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_apostando", TITULO,
                   "Reel de alcance (~32 s, 1080x1920): test de tres preguntas, «sígueme» a mitad, giro con frase final y pregunta + envío al final. Stickman mezclado con gráficos.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("perder", "ganando", "abierto", "fallado"), campanas=("sigueme", "pasaselo"),
            golpes=("apostando", "aburrias", "casino", "despues"),
            intensidad={"hook": (1, 1, 1, 0), "una": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "pregunta": (1, 0, 1, 1)})
