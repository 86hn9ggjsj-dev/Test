"""Reel de alcance "Tu cerebro juega en tu contra cada vez que operas" (~38 s, sígueme a mitad y pregunta al final).

Uso: python scripts/cerebro.py <ffmpeg>   ·   sin voz todavía: python scripts/estimar.py cerebro
Voz: input/cerebro_voz.(mp3|wav). Salida: public/gen/cerebro_mezcla.wav, src/gen/cerebro.json, guiones/reel_cerebro.md
"""
import sys

from guion_cerebro import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "cerebro"
EVENTOS = {
    "demostrar": "demostrar",
    "cien": "100", "doble": "doble", "aversion": "aversión",
    "bueno": "bueno", "sigueme": "Sígueme",
    "ganas": ("ganas", "conducta"), "cierras": "cierras", "pierdes": ("pierdes", "conducta"), "aguantas": "aguantas",
    "midio": "midió", "cincuenta": "50%",
    "pequenas": "pequeñas", "grandes": "grandes", "reves": "revés",
    "cuentame": "Cuéntame", "pronto": "pronto",
}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_cerebro", TITULO,
                   "Reel de alcance (~38 s, 1080x1920): afirmación que reta, contexto, «sígueme» a mitad, estudio, giro y pregunta al final. La promo del bot va en la descripción y en un comentario fijado.",
                   GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("cien", "ganas", "pierdes", "midio"), campanas=("sigueme", "pronto"),
            golpes=("doble", "aguantas", "cincuenta", "reves"),
            intensidad={"hook": (1, 1, 1, 0), "dolor": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "conducta": (1, 1, 1, 1), "estudio": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "pregunta": (1, 0, 1, 1)})
