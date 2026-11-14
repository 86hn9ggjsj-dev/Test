"""Reel de alcance "¿Abres cinco operaciones para repartir el riesgo?" (~38 s, sígueme a mitad y pregunta al final).

Uso: python scripts/correlacion.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py correlacion
Voz: input/correlacion_voz.(mp3|wav). Salida: public/gen/correlacion_mezcla.wav, src/gen/correlacion.json, guiones/reel_correlacion.md
"""
import sys

from guion_correlacion import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "correlacion"
EVENTOS = {
    "cuidado": "Cuidado",
    "euro": "euro-dólar", "libra": "libra-dólar", "australiano": "australiano-dólar...", "uno": ("1%", "pares"),
    "sigueme": "sígueme",
    "juntos": "juntos", "dolar": ("dólar", "dolar"), "dispara": "dispara", "caen": "caen",
    "cincopct": "5%", "sola": "sola",
    "repartir": ("Repartir", "leccion"), "igual": "igual",
    "comentarios": ("comentarios", "pregunta"), "abiertas": "abiertas",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_correlacion", TITULO,
                   "Reel de alcance (~38 s, 1080x1920): pregunta que choca, contexto, «sígueme» a mitad, cuenta, giro y pregunta a los espectadores al final. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("euro", "libra", "australiano", "juntos", "repartir"), campanas=("sigueme", "abiertas"),
            golpes=("caen", "cincopct", "igual"),
            intensidad={"hook": (1, 1, 1, 0), "pares": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dolar": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "leccion": (1, 0, 1, 1), "pregunta": (1, 0, 1, 1)})
