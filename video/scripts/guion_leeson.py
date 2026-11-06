"""Reel de alcance (~35 s): Nick Leeson hunde Barings (1995) escondiendo pérdidas en la cuenta 88888.

Datos: Barings, fundado en 1762 (233 años en 1995); Leeson, 28 años, operaba en Singapur; escondió pérdidas en la cuenta
de errores 88888; el terremoto de Kobe (17-1-1995) hundió el Nikkei; pérdidas de 827 millones de libras; ING compró el
banco por una libra; Leeson fue condenado a seis años y medio de cárcel en Singapur.
"""

TITULO = "Un chaval de 28 años hundió un banco de 233 años"
GUION = [
    ("hook", ["En mil novecientos noventa y cinco, un chaval de veintiocho años hundió un banco de doscientos treinta y tres años.", "Él solo."]),
    ("uno", ["Nick Leeson operaba para Barings en Singapur.", "Cuando empezó a perder, no cerró: escondió las pérdidas en una cuenta secreta... la ocho, ocho, ocho, ocho, ocho."]),
    ("dos", ["Y para recuperarlas, apostó más. Y más."]),
    ("sigueme", ["Sígueme, que el final parece de película."]),
    ("tres", ["Entonces, un terremoto en Kobe hundió la bolsa japonesa.", "La pérdida llegó a ochocientos veintisiete millones de libras."]),
    ("giro", ["Barings acabó vendido por una libra, y Leeson, en la cárcel.", "No lo hundió una mala operación: lo hundió no aceptar la primera pérdida."]),
    ("pregunta", ["¿Tú has escondido alguna pérdida? Mándaselo a quien nunca cierra en negativo."]),
]

GESTOS = {
    "hook": "[curious] En mil novecientos noventa y cinco, un chaval de veintiocho años hundió un banco de doscientos treinta y tres años. [short pause] Él solo.",
    "uno": "Nick Leeson operaba para Barings en Singapur. Cuando empezó a perder, no cerró: escondió las pérdidas en una cuenta secreta... [whispers] la ocho, ocho, ocho, ocho, ocho.",
    "dos": "Y para recuperarlas, apostó más. [short pause] Y más.",
    "sigueme": "[warmly] Sígueme, que el final parece de película.",
    "tres": "[inhales] Entonces, un terremoto en Kobe hundió la bolsa japonesa. [short pause] La pérdida llegó a ochocientos veintisiete millones de libras.",
    "giro": "[serious] Barings acabó vendido por una libra, y Leeson, en la cárcel. [short pause] No lo hundió una mala operación: lo hundió no aceptar la primera pérdida.",
    "pregunta": "[curious] ¿Tú has escondido alguna pérdida? Mándaselo a quien nunca cierra en negativo.",
}

PANTALLAS = [
    ("hook", "", "edificio del banco en wireframe con «1762» en la fachada; el stickman delante, pequeño; grietas que bajan por las columnas"),
    ("uno", "", "el stickman ante su pantalla en Singapur; un cajón/caja fuerte con «88888» donde mete velas rojas a escondidas"),
    ("dos", "", "fichas que se apilan cada vez más altas sobre la mesa"),
    ("sigueme", "", "botón Seguir; el stickman lo señala"),
    ("tres", "", "el suelo tiembla (onda sísmica 3D), el gráfico del Nikkei se desploma y la caja «88888» revienta: −827 M £"),
    ("giro", "", "cartel «VENDIDO POR 1 £» sobre el banco y barrotes que bajan delante del stickman"),
    ("pregunta", "", "caja fuerte entreabierta y bocadillo de comentario"),
]
