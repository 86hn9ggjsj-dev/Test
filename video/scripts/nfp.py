"""Reel de alcance "Hay un viernes al mes en el que, a las 14:30, el mercado se vuelve loco" (~33 s). Solo subtítulos abajo
y el «sígueme» grande en medio.

Uso: python scripts/nfp.py <ffmpeg>   ·   Voz: input/nfp_voz.(mp3|wav)
Salida: public/gen/nfp_mezcla.wav, src/gen/nfp.json, guiones/reel_nfp.md
"""
import sys

from guion_nfp import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "nfp"
EVENTOS = {
    "viernes": ("viernes", "hook"), "media": "media,", "loco": "loco.",
    "empleo": "empleo", "unidos": "Unidos.", "primer": "primer", "mes": ("mes.", "uno"),
    "segundos": "segundos,", "dolar": "dólar,", "oro": "oro", "indices": "índices", "saltos": "saltos", "otro": "otro.",
    "sigueme": "Sígueme,", "orden": ("orden.", "sigueme"),
    "movimiento": "movimiento,", "lejos": "lejos", "pusiste": "pusiste.",
    "calendario": ("calendario", "giro"), "hora": "hora", "rojo": "rojo.",
    "pillado": "pillado", "abierta": "abierta?", "etiqueta": "Etiqueta",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_nfp", TITULO,
                   "Reel de alcance (~33 s, 1080x1920): cita con hora en el gancho, «sígueme» a mitad, consejo práctico y pregunta + etiqueta al final. Solo subtítulos abajo.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("empleo", "dolar", "oro", "indices", "calendario"), campanas=("sigueme", "etiqueta"),
            golpes=("loco", "saltos", "lejos", "rojo"),
            intensidad={"hook": (1, 1, 1, 0), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "pregunta": (1, 0, 1, 1)})
