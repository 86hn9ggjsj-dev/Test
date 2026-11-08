"""Reel de alcance "Compras y luego buscas vídeos de por qué va a subir" (~32 s). Solo subtítulos abajo y el «sígueme» grande en medio.

Uso: python scripts/confirmacion.py <ffmpeg>   ·   Voz: input/confirmacion_voz.(mp3|wav)
Salida: public/gen/confirmacion_mezcla.wav, src/gen/confirmacion.json, guiones/reel_confirmacion.md
"""
import sys

from guion_confirmacion import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "confirmacion"
EVENTOS = {
    "compras": "Compras...", "videos": ("vídeos", "hook"), "subir0": ("subir.", "hook"),
    "sesgo": "sesgo", "confirmacion": "confirmación:", "decidido": "decidido.",
    "ignoras": "Ignoras", "contra": "contra,", "verde": "verde", "senal": "señal.",
    "sigueme": "Sígueme,", "truco": "truco",
    "escribe": "escribe", "frase": "frase", "equivocado": "equivocado.",
    "pasa": ("pasa,", "giro"), "cierras": "cierras.", "grupo": "grupo.",
    "cuantos": "¿Cuántos", "perdiendo": "perdiendo?", "etiqueta": "Etiqueta",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_confirmacion", TITULO,
                   "Reel de alcance (~32 s, 1080x1920): situación reconocible en el gancho, sesgo con nombre, «sígueme» a mitad, truco práctico y pregunta + etiqueta al final. Solo subtítulos abajo.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("videos", "ignoras", "escribe", "pasa"), campanas=("sigueme", "etiqueta"),
            golpes=("subir0", "confirmacion", "senal", "cierras"),
            intensidad={"hook": (1, 1, 1, 0), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "pregunta": (1, 0, 1, 1)})
