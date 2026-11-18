"""Reel 5-30-10 «dopamina»: el premortem (imaginar antes de entrar que la operación ha salido mal).

Uso: python scripts/premortem.py <ffmpeg>   ·   Voz: input/premortem_voz.(mp3|wav)
Salida: public/gen/premortem_mezcla.wav, src/gen/premortem.json, guiones/reel_premortem.md
"""
import sys

from guion_premortem import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "premortem"
EVENTOS = {'antes': ('Antes', 'hook'), 'imagina': 'imagina', 'salido': ('salido', 'hook'), 'mal': ('mal.', 'hook'), 'raro': 'raro,', 'equipos': 'equipos', 'grandes': 'grandes.', 'premortem': 'premortem.', 'obliga': 'obliga', 'ilusion': 'ilusión', 'sigueme': 'Sígueme,', 'diez': 'diez', 'seguro': ('seguro', 'dos'), 'bien': ('bien.', 'dos'), 'tamano': ('tamaño', 'dos'), 'manos': 'manos.', 'regla': 'regla:', 'pulsar': 'pulsar,', 'escribe': 'escribe', 'frase': 'frase:', 'porque': 'porque...', 'ocurre': 'ocurre', 'demasiado': 'demasiado', 'baja': 'baja', 'llegado': 'llegado', 'entrada': ('entrada.', 'cierre'), 'comenta': 'Comenta', 'bot': ('BOT', 'cierre'), 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_premortem", TITULO, "Reel 5-30-10 «dopamina» (~40 s): gancho de 5 s, una idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=('raro', 'equipos', 'seguro', 'regla', 'escribe', 'ocurre', 'comenta'), campanas=('sigueme', 'bot'), golpes=('antes', 'mal', 'premortem', 'ilusion', 'tamano', 'manos', 'porque', 'baja', 'privado'),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
