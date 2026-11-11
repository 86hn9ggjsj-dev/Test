"""Reel con historia (5-30-10): Lucía y su diario de 30 operaciones.

Uso: python scripts/diario.py <ffmpeg>   ·   Voz: input/diario_voz.(mp3|wav)
Salida: public/gen/diario_mezcla.wav, src/gen/diario.json, guiones/reel_diario.md
"""
import sys

from guion_diario import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "diario"
EVENTOS = {"300": "300", "cosa": "cosa.", "estrategia": "estrategia.", "apunto": "apuntó", "hora": ("hora,", "uno"), "motivo": ("motivo", "uno"),
           "sentia": "sentía.", "30": ("30,", "dos"), "vio": "vio.", "sigueme": "Sígueme,", "escuece": "escuece.", "manana": "mañana,", "ganaba": "ganaba.",
           "noche": ("noche:", "tres"), "10": "10,", "cansada": "cansada", "aburrimiento": "aburrimiento.", "indicador": "indicador.", "sobraban": "sobraban",
           "quito": "Quitó", "solucion": "solución:", "apunta": "apunta", "30b": ("30", "giro"), "emocion": "emoción.", "quitar": "quitar.",
           "llegado": "llegado", "serio": "serio.", "comenta": "Comenta", "bot": "BOT", "privado": "privado", "auditada": "auditada"}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_diario", TITULO,
                   "Reel 5-30-10 (~43 s, 1080x1920): promesa con cifra, una sola idea (el diario de 30 operaciones) con el «sígueme» a mitad y 10 s de conversión.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("apunto", "hora", "motivo", "manana", "apunta", "comenta"), campanas=("sigueme", "bot"),
            golpes=("vio", "noche", "sobraban", "quito"),
            intensidad={"hook": (1, 1, 1, 0), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
