"""Reel de alcance "Una tragaperras y un gráfico de un minuto tienen el mismo truco" (~40 s, sígueme a mitad y pregunta al final).

Uso: python scripts/dopamina.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py dopamina
Voz: input/dopamina_voz.(mp3|wav). Salida: public/gen/dopamina_mezcla.wav, src/gen/dopamina.json, guiones/reel_dopamina.md
"""
import sys

from guion_dopamina import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "dopamina"
EVENTOS = {
    "truco": "truco", "enganchando": "enganchando",
    "premio": "premio", "sabe": "sabe", "llegara": "llegará",
    "sigueme": "sígueme",
    "siempre": "siempre", "patron": "patrón", "engancha": "engancha", "grafico": ("gráfico", "patron"), "dan": "dan", "quitan": "quitan",
    "operas": "operas", "subidon": "subidón",
    "voluntad": "voluntad", "reglas": "reglas", "bot": "bot", "dopamina2": ("dopamina", "reglas"),
    "sincero": "sincero", "hoy": "hoy",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_dopamina", TITULO,
                   "Reel de alcance (~40 s, 1080x1920): comparación que sorprende, contexto, «sígueme» a mitad, mecanismo, giro y pregunta al final. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("premio", "siempre", "grafico", "voluntad"), campanas=("sigueme", "engancha", "hoy"),
            golpes=("truco", "sabe", "subidon", "bot"),
            intensidad={"hook": (1, 1, 1, 0), "dopamina": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "patron": (1, 1, 1, 1), "operas": (1, 1, 1, 1), "reglas": (1, 0, 1, 1), "pregunta": (1, 0, 1, 1)})
