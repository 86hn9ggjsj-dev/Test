"""Reel de alcance "La bolsa sube por la escalera y baja en ascensor" (~39 s, sígueme a mitad y pregunta al final).

Uso: python scripts/ascensor.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py ascensor
Voz: input/ascensor_voz.(mp3|wav). Salida: public/gen/ascensor_mezcla.wav, src/gen/ascensor.json, guiones/reel_ascensor.md
"""
import sys

from guion_ascensor import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "ascensor"
EVENTOS = {
    "escalera": "escalera", "ascensor": ("ascensor", "hook"),
    "febrero": "Febrero", "maximos": "máximos", "treintaycuatro": "34%", "historia": "historia",
    "sigueme": "sígueme",
    "tardo": "tardó", "cinco": "cinco", "cuatro": "cuatro",
    "miedo": "miedo", "codicia": "codicia", "ascensor2": ("ascensor", "miedo"), "peor": "peor",
    "plan": "plan", "escribe": "escribe",
    "vender": ("vender", "pregunta"), "aguantar": "aguantar",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_ascensor", TITULO,
                   "Reel de alcance (~39 s, 1080x1920): metáfora que engancha, datos de 2020, «sígueme» a mitad, giro y pregunta al final. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("febrero", "tardo", "miedo", "plan"), campanas=("sigueme", "aguantar"),
            golpes=("ascensor", "treintaycuatro", "cuatro", "peor"),
            intensidad={"hook": (1, 1, 1, 0), "caida": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "recupera": (1, 1, 1, 1), "miedo": (1, 1, 1, 1), "plan": (1, 0, 1, 1), "pregunta": (1, 0, 1, 1)})
