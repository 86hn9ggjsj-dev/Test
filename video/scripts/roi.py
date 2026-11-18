"""Historia v3 «dopamina» (~34 s): de cada 100 que pagan un challenge, solo 7 cobran (fondeadas como juego de ROI).

Uso: python scripts/roi.py <ffmpeg>   ·   Voz: input/roi_voz.(mp3|wav)
Salida: public/gen/roi_mezcla.wav, src/gen/roi.json, guiones/reel_roi.md
"""
import sys

from guion_roi import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "roi"
EVENTOS = {'de': ('De', 'hook'), 'cada': ('cada', 'hook'), '100': ('100', 'hook'), 'pagan': 'pagan', 'challenge': ('challenge,', 'hook'), 'solo': ('solo', 'hook'), '7': ('7', 'hook'),
           'cobrar': 'cobrar', 'datos': 'datos', '300000': '300.000', 'cuentas': ('cuentas:', 'uno'), 'aprueba': 'aprueba', '1': ('1', 'uno'), '7b': ('7,', 'uno'),
           'cobra': ('cobra', 'uno'), 'mitad': 'mitad', 'bueno': 'bueno:', 'arriesgas': 'arriesgas', 'cuota': 'cuota,', 'ahorros': 'ahorros',
           'sigueme': 'Sígueme', 'nadie': 'nadie', 'juego': 'juego', 'roi': ('ROI:', 'tres'), 'intento': 'intento', 'cuesta': 'cuesta', 'euros': 'euros,',
           'aprobada': 'aprobada', '700': '700', 'regla': 'regla:', 'apunta': 'apunta', 'pagado': 'pagado', 'cobrado': 'cobrado', 'roi2': ('ROI', 'giro'), 'real': 'real',
           'comenta': 'Comenta', 'bot': ('BOT', 'cierre'), 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_roi", TITULO, "Historia v3 «dopamina» (~34 s, 1080x1920): gancho con dato real, «sígueme» a mitad y cierre comenta BOT.", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=("pagan", "datos", "aprueba", "cobra", "cuota", "intento", "pagado", "cobrado", "comenta"),
            campanas=("sigueme", "bot"), golpes=("de", "7", "300000", "mitad", "ahorros", "roi", "700", "real"),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "dos": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "tres": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
