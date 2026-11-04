"""Reel de alcance "¿Por qué el precio frena en los números redondos?" (~40 s, sígueme a mitad y pregunta al final).

Uso: python scripts/redondos.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py redondos
Voz: input/redondos_voz.(mp3|wav). Salida: public/gen/redondos_mezcla.wav, src/gen/redondos.json, guiones/reel_redondos.md
"""
import sys

from guion_redondos import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "redondos"
EVENTOS = {
    "r0987": "1,0987.", "frena": ("frena", "hook"), "primero": "primero", "casualidad": "casualidad",
    "objetivos": "objetivos", "redondos": "redondos",
    "sigueme": "Sígueme", "stop": ("stop", "sigueme"),
    "reserva": "Reserva", "confirmo": "confirmó", "recoger": "recoger", "stops": ("stops", "estudio"), "lado": "lado",
    "frenar": "frenar", "rompe": "rompe", "acelera": "acelera", "cadena": "cadena",
    "mundo": "mundo",
    "lejos": "lejos", "leo": "leo",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_redondos", TITULO,
                   "Reel de alcance (~40 s, 1080x1920): adivinanza con cifra, contexto, «sígueme» a mitad, estudio, giro y pregunta al final. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("r0987", "objetivos", "recoger", "stops", "mundo"), campanas=("sigueme", "leo"),
            golpes=("primero", "rompe", "cadena"),
            intensidad={"hook": (1, 1, 1, 0), "ordenes": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "estudio": (1, 1, 1, 1), "cadena": (1, 1, 1, 1), "consejo": (1, 0, 1, 1), "pregunta": (1, 0, 1, 1)})
