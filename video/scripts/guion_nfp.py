"""Reel de alcance (~32 s): el dato de empleo de EE. UU. (Non-Farm Payrolls), el primer viernes de cada mes a las 14:30.

Datos: el informe de empleo de EE. UU. sale normalmente el primer viernes de cada mes a las 8:30 de Nueva York (14:30 en
España casi todo el año); es de los datos de mayor impacto del calendario económico: el dólar, el oro y los índices se
mueven con fuerza en segundos y las órdenes pueden ejecutarse más lejos de su precio (deslizamiento).
"""

TITULO = "Hay un viernes al mes en el que, a las 14:30, el mercado se vuelve loco"
GUION = [
    ("hook", ["Hay un viernes al mes en el que, a las dos y media, el mercado se vuelve loco."]),
    ("uno", ["Es el dato de empleo de Estados Unidos.", "Sale normalmente el primer viernes de cada mes."]),
    ("dos", ["Y en segundos, el dólar, el oro y los índices pegan saltos de un lado a otro."]),
    ("sigueme", ["Sígueme, que ahora viene lo que le pasa a tu orden."]),
    ("tres", ["Con tanto movimiento, tu orden puede ejecutarse bastante más lejos de donde la pusiste."]),
    ("giro", ["Por eso, antes de abrir nada, mira el calendario económico.", "Esa hora sale marcada en rojo."]),
    ("pregunta", ["¿Te ha pillado alguna vez un dato con una operación abierta? Etiqueta al que opera sin mirar el calendario."]),
]

GESTOS = {
    "hook": "[curious] Hay un viernes al mes en el que, a las dos y media... [short pause] el mercado se vuelve loco.",
    "uno": "Es el dato de empleo de Estados Unidos. [short pause] Sale normalmente el primer viernes de cada mes.",
    "dos": "[inhales] Y en segundos, el dólar, el oro y los índices pegan saltos de un lado a otro.",
    "sigueme": "[warmly] Sígueme, que ahora viene lo que le pasa a tu orden.",
    "tres": "[serious] Con tanto movimiento, tu orden puede ejecutarse bastante más lejos de donde la pusiste.",
    "giro": "Por eso, antes de abrir nada, mira el calendario económico. [short pause] Esa hora sale marcada en rojo.",
    "pregunta": "[curious] ¿Te ha pillado alguna vez un dato con una operación abierta? Etiqueta al que opera sin mirar el calendario.",
}

PANTALLAS = [
    ("hook", "", "calendario 3D del mes; el primer viernes se enciende; reloj 14:29:57 → 14:30 y el gráfico explota"),
    ("uno", "", "ficha «EMPLEO EE. UU.» con tres marcas de impacto en rojo"),
    ("dos", "", "tres gráficos (USD, ORO, ÍNDICES) que pegan latigazos a la vez"),
    ("sigueme", "", "«sígueme» grande, botón Seguir y cuenta auditada"),
    ("tres", "", "una orden con su precio marcado; el precio la salta y se ejecuta mucho más abajo, con la distancia medida"),
    ("giro", "", "calendario económico con la fila de las 14:30 en rojo; el stickman lo consulta antes de pulsar"),
    ("pregunta", "", "botones SÍ / NO y bocadillo de comentarios"),
]
