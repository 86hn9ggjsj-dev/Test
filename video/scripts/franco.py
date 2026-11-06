"""Reel de alcance "Tu stop loss no siempre te protege" (~39 s, sígueme a mitad y pregunta al final).

Uso: python scripts/franco.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py franco
Voz: input/franco_voz.(mp3|wav). Salida: public/gen/franco_mezcla.wav, src/gen/franco.json, guiones/reel_franco.md
"""
import sys

from guion_franco import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "franco"
EVENTOS = {
    "protege": "protege", "jueves": "jueves",
    "anuncia": "anuncia", "frenar": "frenar", "treinta": "30%", "minutos": "minutos",
    "sigueme": "Sígueme",
    "puestos": "puestos", "abajo": "abajo", "golpe": "golpe",
    "negativo": "negativo", "rescate": "rescate", "trescientos": "300", "quebro": "quebró",
    "garantizado": "garantizado", "siguiente": "siguiente",
    "lejos": "lejos", "pusiste": "pusiste",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_franco", TITULO,
                   "Reel de alcance (~39 s, 1080x1920): afirmación que choca, el caso del franco suizo, «sígueme» a mitad, lección y pregunta al final. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("jueves", "anuncia", "puestos", "negativo", "garantizado"), campanas=("sigueme", "pusiste"),
            golpes=("protege", "treinta", "golpe", "quebro"),
            intensidad={"hook": (1, 1, 1, 0), "anuncio": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "stops": (1, 1, 1, 1), "quiebra": (1, 1, 1, 1), "leccion": (1, 0, 1, 1), "pregunta": (1, 0, 1, 1)})
