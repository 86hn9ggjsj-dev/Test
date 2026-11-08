"""Reel de alcance (~33 s): te saltó el stop y el gráfico dice que el precio nunca llegó — el spread.

Datos: en la mayoría de plataformas el gráfico muestra el precio de venta (bid); una posición corta se cierra al precio de
compra (ask), que está por encima (el spread); el spread se ensancha con noticias y en el cambio de sesión de medianoche,
con poca liquidez.
"""

TITULO = "Te saltó el stop y el precio nunca llegó ahí"
GUION = [
    ("hook", ["Te saltó el stop...", "y en el gráfico el precio nunca llegó ahí."]),
    ("uno", ["No es magia: en casi todas las plataformas el gráfico solo enseña el precio de venta."]),
    ("dos", ["Pero si vas corto, tu operación se cierra con el precio de compra, que está un poco más arriba: el spread."]),
    ("sigueme", ["Sígueme, que ahora viene la hora peligrosa."]),
    ("tres", ["Hay momentos en los que ese spread se dispara: con noticias y a medianoche, cuando casi no hay liquidez."]),
    ("giro", ["Tu stop no lo tocó el gráfico.", "Lo tocó el spread."]),
    ("pregunta", ["¿Te ha pasado alguna vez? Cuéntamelo, y etiqueta al que pone el stop pegado al precio."]),
]

GESTOS = {
    "hook": "[curious] Te saltó el stop... [short pause] y en el gráfico el precio nunca llegó ahí.",
    "uno": "No es magia: [short pause] en casi todas las plataformas el gráfico solo enseña el precio de venta.",
    "dos": "[inhales] Pero si vas corto, tu operación se cierra con el precio de compra, que está un poco más arriba: [short pause] el spread.",
    "sigueme": "[warmly] Sígueme, que ahora viene la hora peligrosa.",
    "tres": "[serious] Hay momentos en los que ese spread se dispara: con noticias y a medianoche, cuando casi no hay liquidez.",
    "giro": "Tu stop no lo tocó el gráfico. [short pause] [serious] Lo tocó el spread.",
    "pregunta": "[curious] ¿Te ha pasado alguna vez? Cuéntamelo, y etiqueta al que pone el stop pegado al precio.",
}

PANTALLAS = [
    ("hook", "", "gráfico 3D con la línea del stop por encima de todas las velas; aun así, «STOP EJECUTADO» en rojo; el stickman se rasca la cabeza"),
    ("uno", "", "una sola línea en el gráfico con la etiqueta VENTA (BID)"),
    ("dos", "", "aparece una segunda línea fantasma por encima, COMPRA (ASK); el hueco entre las dos es el SPREAD"),
    ("sigueme", "", "«sígueme» grande, botón Seguir y cuenta auditada"),
    ("tres", "", "reloj 23:00 y un rayo de noticia; la línea ASK se separa de golpe y toca el stop"),
    ("giro", "", "el stop se ilumina justo donde lo toca la línea fantasma, no las velas"),
    ("pregunta", "", "botones SÍ / NO y bocadillo de comentarios"),
]
