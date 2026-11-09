"""Reel de alcance (~36 s): Jesse Livermore gana unos 100 millones de dólares con el crac de 1929 y en 1934 está en bancarrota.

Datos: Livermore, el especulador más famoso de Wall Street, se puso corto antes del crac de 1929 y ganó unos 100 millones
de dólares; tenía reglas de operativa conocidas; en 1934 se declaró en bancarrota.
"""

TITULO = "En 1929 ganó 100 millones con el crac; en 1934 estaba en bancarrota"
GUION = [
    ("hook", ["En 1929, mientras medio mundo se arruinaba, un hombre ganó 100 millones de dólares."]),
    ("uno", ["Jesse Livermore apostó a que la bolsa caería...", "y acertó de lleno con el crac del 29."]),
    ("dos", ["Era el especulador más famoso de Wall Street. Tenía hasta sus propias reglas para operar."]),
    ("sigueme", ["Sígueme, que el final no te lo esperas."]),
    ("tres", ["Cinco años después, en 1934, estaba en bancarrota."]),
    ("giro", ["No le faltaban reglas.", "Lo que lo hundió fue saltárselas cuando más dinero tenía."]),
    ("pregunta", ["¿Cuál es la regla que más te saltas tú? Mándaselo al que tiene un plan... y nunca lo cumple."]),
]

GESTOS = {
    "hook": "[curious] En mil novecientos veintinueve, mientras medio mundo se arruinaba... [short pause] un hombre ganó cien millones de dólares.",
    "uno": "Jesse Livermore apostó a que la bolsa caería... [short pause] y acertó de lleno con el crac del veintinueve.",
    "dos": "Era el especulador más famoso de Wall Street. [short pause] Tenía hasta sus propias reglas para operar.",
    "sigueme": "[warmly] Sígueme, que el final no te lo esperas.",
    "tres": "[inhales] Cinco años después, en mil novecientos treinta y cuatro... [short pause] [serious] estaba en bancarrota.",
    "giro": "[serious] No le faltaban reglas. [short pause] Lo que lo hundió fue saltárselas cuando más dinero tenía.",
    "pregunta": "[curious] ¿Cuál es la regla que más te saltas tú? Mándaselo al que tiene un plan... y nunca lo cumple.",
}

PANTALLAS = [
    ("hook", "", "Wall Street 1929 en wireframe, cinta de cotizaciones que cae; un stickman con sombrero en medio y +100.000.000 $ en verde"),
    ("uno", "", "gráfico del Dow de 1929 desplomándose; flecha CORTO ↓ que acierta"),
    ("dos", "", "el stickman con sombrero sobre un pedestal; una libreta «MIS REGLAS» con una lista"),
    ("sigueme", "", "«sígueme» grande, botón Seguir y cuenta auditada"),
    ("tres", "", "calendario que salta a 1934; sello BANCARROTA y la cuenta a 0"),
    ("giro", "", "la libreta de reglas abierta; las páginas se arrancan una a una"),
    ("pregunta", "", "lista de reglas con casillas y bocadillo de comentarios"),
]
