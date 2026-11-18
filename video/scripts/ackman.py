"""Reel 5-30-10 «dopamina»: Bill Ackman y la cobertura de marzo de 2020 frente a la «cobertura» del minorista.

Uso: python scripts/ackman.py <ffmpeg>   ·   Voz: input/ackman_voz.(mp3|wav)
Salida: public/gen/ackman_mezcla.wav, src/gen/ackman.json, guiones/reel_ackman.md
"""
import sys

from guion_ackman import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "ackman"
EVENTOS = {'pago': ('Pagó', 'hook'), '27': ('27', 'hook'), 'seguro': ('seguro.', 'hook'), 'mes': ('mes', 'hook'), 'cobro': 'cobró', '2600': '2.600.', 'ackman': 'Ackman,', '2020': ('2020.', 'uno'), 'compro': 'Compró', 'caida': ('caída', 'uno'), 'hundio': 'hundió,', 'cien': 'cien', 'sigueme': 'Sígueme,', 'cobertura': ('cobertura.', 'sigueme'), 'contraria': 'contraria', 'perdiendo': 'perdiendo,', 'cerrar': ('cerrar.', 'dos'), 'seguro2': ('seguro:', 'dos'), 'congelar': 'congelar', 'dos': ('dos.', 'dos'), 'regla': 'regla:', 'antes': ('antes,', 'giro'), 'barata': 'barata', 'concreto': 'concreto.', 'pierdes': 'pierdes,', 'cierra': ('cierra.', 'giro'), 'llegado': 'llegado', 'hablo': 'hablo.', 'comenta': 'Comenta', 'bot': ('BOT', 'cierre'), 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_ackman", TITULO, "Reel 5-30-10 «dopamina» (~40 s): gancho de 5 s, una idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=('ackman', 'compro', 'contraria', 'congelar', 'regla', 'barata', 'comenta'), campanas=('sigueme', 'bot'), golpes=('pago', '27', '2600', 'hundio', 'cien', 'perdiendo', 'dos', 'cierra', 'privado'),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
