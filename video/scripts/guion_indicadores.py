"""Reel de alcance (~34 s): tus indicadores dicen lo mismo porque todos salen del precio (y llegan tarde).

Datos: RSI, MACD, medias móviles y bandas de Bollinger se calculan a partir del precio (cierres, medias y desviaciones del
precio), así que están muy correlacionados; las medias móviles son retrasadas por construcción.
"""

TITULO = "Tienes cinco indicadores y los cinco te dicen lo mismo"
GUION = [
    ("hook", ["Tienes cinco indicadores en el gráfico...", "y los cinco te están diciendo lo mismo."]),
    ("uno", ["El RSI, el MACD, las medias móviles, las bandas de Bollinger: todos se calculan con el mismo dato, el precio."]),
    ("dos", ["Por eso, cuando uno dice compra, los demás suelen decir lo mismo.", "No son cinco opiniones: es una repetida cinco veces."]),
    ("sigueme", ["Sígueme, que esto te va a limpiar el gráfico."]),
    ("tres", ["Y además llegan tarde: una media móvil se mueve después del precio, nunca antes."]),
    ("giro", ["Más indicadores no es más información.", "Es más ruido... y más excusas para entrar."]),
    ("pregunta", ["¿Cuántos indicadores tienes ahora mismo en el gráfico? Etiqueta al que tiene la pantalla como un árbol de Navidad."]),
]

GESTOS = {
    "hook": "[curious] Tienes cinco indicadores en el gráfico... [short pause] y los cinco te están diciendo lo mismo.",
    "uno": "El RSI, el MACD, las medias móviles, las bandas de Bollinger: [short pause] todos se calculan con el mismo dato, el precio.",
    "dos": "[inhales] Por eso, cuando uno dice compra, los demás suelen decir lo mismo. [short pause] No son cinco opiniones: es una repetida cinco veces.",
    "sigueme": "[warmly] Sígueme, que esto te va a limpiar el gráfico.",
    "tres": "[serious] Y además llegan tarde: una media móvil se mueve después del precio, nunca antes.",
    "giro": "Más indicadores no es más información. [short pause] [mischievously] Es más ruido... y más excusas para entrar.",
    "pregunta": "[curious] ¿Cuántos indicadores tienes ahora mismo en el gráfico? Etiqueta al que tiene la pantalla como un árbol de Navidad.",
}

PANTALLAS = [
    ("hook", "", "gráfico 3D cargado de líneas y paneles; cinco luces COMPRA que se encienden a la vez"),
    ("uno", "", "de la línea del precio salen cinco cables hacia RSI, MACD, MEDIAS y BOLLINGER: todos nacen del mismo sitio"),
    ("dos", "", "cinco stickmen-indicador dicen «COMPRA» con la misma voz; se funden en uno ×5"),
    ("sigueme", "", "«sígueme» grande, botón Seguir y cuenta auditada"),
    ("tres", "", "el precio gira y la media móvil lo sigue con retraso; reloj con el desfase"),
    ("giro", "", "el gráfico se limpia de golpe y queda solo el precio; las líneas caen como confeti"),
    ("pregunta", "", "pantalla llena de luces de colores tipo árbol de Navidad y bocadillo de comentarios"),
]
