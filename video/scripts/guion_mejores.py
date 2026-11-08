"""Reel de alcance (~34 s): perderse los 10 mejores días de la bolsa en 20 años y por qué llegan justo tras los peores.

Datos (J.P. Morgan, Guide to Retirement, S&P 500 en 20 años): quien se perdió solo los 10 mejores días acabó con menos de
la mitad que quien se quedó invertido; 7 de los 10 mejores días llegaron menos de dos semanas después de uno de los 10
peores. Veinte años son unas 5.000 sesiones.
"""

TITULO = "Te pierdes los 10 mejores días y acabas con menos de la mitad"
GUION = [
    ("hook", ["Si en 20 años de bolsa te pierdes solo los 10 mejores días...", "acabas con menos de la mitad."]),
    ("uno", ["Es un estudio de J.P. Morgan sobre el S&P 500: 10 días de unos 5.000."]),
    ("dos", ["¿Y cuándo llegan esos días? 7 de los 10, menos de dos semanas después de uno de los peores."]),
    ("sigueme", ["Sígueme, que aquí está la trampa."]),
    ("tres", ["Justo cuando el miedo te hace vender... llega el rebote que te pierdes."]),
    ("giro", ["El pánico no solo te hace perder en la caída.", "Te hace perder la subida."]),
    ("pregunta", ["¿Vendiste en el último susto? Cuéntamelo, y pásaselo al que vende cada vez que sale una noticia."]),
]

GESTOS = {
    "hook": "[curious] Si en veinte años de bolsa te pierdes solo los diez mejores días... [short pause] acabas con menos de la mitad.",
    "uno": "Es un estudio de J.P. Morgan sobre el S&P quinientos: [short pause] diez días de unos cinco mil.",
    "dos": "[curious] ¿Y cuándo llegan esos días? [short pause] Siete de los diez, menos de dos semanas después de uno de los peores.",
    "sigueme": "[warmly] Sígueme, que aquí está la trampa.",
    "tres": "[inhales] Justo cuando el miedo te hace vender... [short pause] llega el rebote que te pierdes.",
    "giro": "[serious] El pánico no solo te hace perder en la caída. [short pause] Te hace perder la subida.",
    "pregunta": "[curious] ¿Vendiste en el último susto? Cuéntamelo, y pásaselo al que vende cada vez que sale una noticia.",
}

PANTALLAS = [
    ("hook", "", "dos montones de monedas 3D que crecen 20 años; a uno le quitan 10 días y se queda en menos de la mitad"),
    ("uno", "", "rejilla de 5.000 casillas (días); 10 se encienden en verde"),
    ("dos", "", "calendario: 10 peores días en rojo y, pegados a ellos, 7 de los mejores en verde"),
    ("sigueme", "", "«sígueme» grande, botón Seguir y cuenta auditada"),
    ("tres", "", "el stickman vende en la vela roja y desde fuera ve la vela verde gigante del día siguiente"),
    ("giro", "", "dos curvas: la del que se quedó y la del que vendió y volvió tarde"),
    ("pregunta", "", "botones SÍ / NO y bocadillo de comentarios"),
]
