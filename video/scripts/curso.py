"""Reel 5-30-10 «dopamina»: el coste hundido (el curso de 2.000 €).

Uso: python scripts/curso.py <ffmpeg>   ·   Voz: input/curso_voz.(mp3|wav)
Salida: public/gen/curso_mezcla.wav, src/gen/curso.json, guiones/reel_curso.md
"""
import sys

from guion_curso import GESTOS, GUION, PANTALLAS, TITULO

NOMBRE = "curso"
EVENTOS = {'pagaste': 'Pagaste', '2000': ('2.000', 'hook'), 'curso': 'curso.', 'sigues': ('sigues', 'hook'), 'perdiendo': 'perdiendo', 'estrategia': ('estrategia', 'uno'), 'funciona': 'funciona.', 'tres': 'Tres', 'negativo': 'negativo.', 'piensas': 'piensas:', 'dejo': 'dejo,', 'tirado': 'tirado', 'sigueme': 'Sígueme,', 'nombre': 'nombre,', 'doble': 'doble.', 'coste': 'coste', 'hundido': 'hundido.', '2000b': ('2.000', 'dos'), 'vuelven': 'vuelven,', 'decides': 'decides', 'mas': ('más.', 'dos'), 'regla': 'regla:', 'escribe': 'escribe', 'linea': 'línea', 'razon': 'razón', 'pague': 'pagué,', 'dejala': 'déjala', 'llegado': 'llegado', 'dejar': 'dejar.', 'comenta': 'Comenta', 'bot': ('BOT', 'cierre'), 'privado': 'privado', 'auditada': 'auditada'}

if __name__ == "__main__":
    from locucion import escribir_guion, generar

    escribir_guion("reel_curso", TITULO, "Reel 5-30-10 «dopamina» (~40 s): gancho de 5 s, una idea con el «sígueme» a mitad y 10 s de conversión (comenta BOT).", GUION, GESTOS, PANTALLAS)
    generar(sys.argv[1], NOMBRE, TITULO, GUION, eventos=EVENTOS, toques=('estrategia', 'tres', 'piensas', 'coste', 'regla', 'escribe', 'comenta'), campanas=('sigueme', 'bot'), golpes=('pagaste', 'perdiendo', 'negativo', 'tirado', 'hundido', 'vuelven', 'pague', 'dejala', 'privado'),
            intensidad={"hook": (1, 1, 1, 1), "uno": (1, 1, 1, 1), "sigueme": (1, 0, 1, 1), "dos": (1, 1, 1, 1), "giro": (1, 1, 1, 1), "cierre": (1, 0, 1, 1)})
