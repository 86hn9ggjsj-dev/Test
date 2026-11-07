"""Reel de alcance "Escribió un número en la casilla equivocada y le costó 200 millones" (~35 s, sígueme a mitad y
pregunta al final). Solo subtítulos abajo: las cifras clave van dentro de la animación.

Uso: python scripts/dedo.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py dedo
Voz: input/dedo_voz.(mp3|wav). Salida: public/gen/dedo_mezcla.wav, src/gen/dedo.json, guiones/reel_dedo.md
"""
import sys

from guion_dedo import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "dedo"
EVENTOS = {
    "casilla": "casilla", "equivocada": "equivocada...", "costo": "costó", "dolares": ("dólares.", "hook"),
    "vender": "vender", "vendio": "Vendió", "acciones": "acciones...", "yen": "yen.",
    "tokio": "Tokio,", "cancelarla": "cancelarla.", "sistema": "sistema",
    "loco": "loco.", "sigueme": "Sígueme,",
    "chaval": "chaval", "compro": "compró", "desplome": "desplome...", "quince": "15", "minutos": "minutos.",
    "mismo": ("Mismo", "giro"), "pulso": "pulsó", "otro": ("otro", "giro"), "mirando": "mirando.",
    "comprado": "comprado", "miedo": "miedo?", "etiqueta": "Etiqueta",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_dedo", TITULO,
                   "Reel de alcance (~35 s, 1080x1920): historia real con cifra en el gancho, bucle abierto antes del «sígueme», giro y pregunta de sí/no + etiqueta al final. Solo subtítulos abajo.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("casilla", "vendio", "cancelarla", "compro", "pulso"), campanas=("sigueme", "etiqueta"),
            golpes=("dolares", "yen", "sistema", "quince", "mirando"),
            intensidad={"hook": (1, 1, 1, 0), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "pregunta": (1, 0, 1, 1)})
