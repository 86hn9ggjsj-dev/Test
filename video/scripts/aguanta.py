"""Reel de alcance "¿Cuántas pérdidas seguidas aguanta tu cuenta?" (~40 s, sígueme a mitad y pregunta al final).

Uso: python scripts/aguanta.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py aguanta
Voz: input/aguanta_voz.(mp3|wav). Salida: public/gen/aguanta_mezcla.wav, src/gen/aguanta.json, guiones/reel_aguanta.md
"""
import sys

from guion_aguanta import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "aguanta"
EVENTOS = {
    "cosa": "cosa", "arriesgas": ("arriesgas", "riesgo"), "sigueme": "sígueme",
    "diez": "10%", "siete": ("7", "cuenta"), "mitad2": ("mitad", "cuenta"), "cinco": "5%", "catorce": "14", "uno": "1%", "sesentaynueve": ("69", "cuenta"),
    "cualquiera": "cualquiera", "nadie": ("nadie", "giro"), "ganas": "ganas", "vivo": "vivo",
    "comentarios": ("comentarios", "pregunta"), "leo": "leo",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_aguanta", TITULO,
                   "Reel de alcance (~40 s, 1080x1920): pregunta que choca, contexto, «sígueme» a mitad, cuenta, giro y pregunta a los espectadores al final. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("arriesgas", "diez", "cinco", "uno", "ganas"), campanas=("sigueme", "leo"),
            golpes=("mitad2", "catorce", "sesentaynueve", "vivo"),
            intensidad={"hook": (1, 1, 1, 0), "riesgo": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "cuenta": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "pregunta": (1, 0, 1, 1)})
