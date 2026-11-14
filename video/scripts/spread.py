"""Reel de alcance "Te saltó el stop y el precio nunca llegó ahí" (~33 s). Solo subtítulos abajo y el «sígueme» grande en medio.

Uso: python scripts/spread.py <ffmpeg>   ·   Voz: input/spread_voz.(mp3|wav)
Salida: public/gen/spread_mezcla.wav, src/gen/spread.json, guiones/reel_spread.md
"""
import sys

from guion_spread import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "spread"
EVENTOS = {
    "salto": "saltó", "nunca": "nunca", "ahi": "ahí.",
    "magia": "magia:", "venta": "venta.",
    "corto": "corto,", "compra": "compra,", "arriba": "arriba:", "spread1": ("spread.", "dos"),
    "sigueme": "Sígueme,", "peligrosa": "peligrosa.",
    "dispara": "dispara:", "noticias": "noticias", "medianoche": "medianoche,", "liquidez": "liquidez.",
    "grafico": ("gráfico.", "giro"), "spread2": ("spread.", "giro"),
    "pasado": "pasado", "etiqueta": "etiqueta", "pegado": "pegado",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_spread", TITULO,
                   "Reel de alcance (~33 s, 1080x1920): misterio en el gancho, explicación visual, «sígueme» a mitad, giro y pregunta + etiqueta al final. Solo subtítulos abajo.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("venta", "compra", "noticias", "medianoche"), campanas=("sigueme", "etiqueta"),
            golpes=("salto", "spread1", "dispara", "spread2"),
            intensidad={"hook": (1, 1, 1, 0), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "pregunta": (1, 0, 1, 1)})
