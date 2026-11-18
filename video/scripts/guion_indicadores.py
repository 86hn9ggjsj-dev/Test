"""Reel de alcance (~36 s) con historia: Marcos (personaje ficticio, el stickman con gorra) y sus nueve indicadores.

Consejo: casi todos los indicadores salen del precio (RSI, MACD, medias, Bollinger) y llegan tarde; quédate con el precio
y, como mucho, un indicador que mida otra cosa, como el volumen.
"""

TITULO = 'Marcos tenía nueve indicadores y no sabía cuándo entrar'
GUION = [
    ('hook', ['Marcos tenía nueve indicadores en el gráfico...', 'y aun así no sabía cuándo entrar.']),
    ('uno', ['Cada vez que perdía, añadía uno más: RSI, MACD, medias, Bollinger...', 'La pantalla parecía un árbol de Navidad.']),
    ('dos', ['Lo que no sabía es que casi todos se calculan con lo mismo: el precio.', 'Eran nueve formas de decir lo mismo... y tarde.']),
    ('sigueme', ['Sígueme, que ahora viene lo que lo cambió todo.']),
    ('tres', ['Un día lo quitó todo y dejó solo el precio.', 'Por primera vez vio dónde rebotaba y dónde se rompía.']),
    ('giro', ['Mi consejo: el precio y, como mucho, un indicador que mida otra cosa, como el volumen.', 'Menos líneas, decisiones más claras.']),
    ('pregunta', ['¿Cuántos indicadores tienes tú ahora mismo? Etiqueta a tu Marcos.']),
]

GESTOS = {
    'hook': '[curious] Marcos tenía nueve indicadores en el gráfico... [short pause] y aun así no sabía cuándo entrar.',
    'uno': 'Cada vez que perdía, añadía uno más: RSI, MACD, medias, Bollinger... [short pause] [chuckles] La pantalla parecía un árbol de Navidad.',
    'dos': '[inhales] Lo que no sabía es que casi todos se calculan con lo mismo: el precio. [short pause] Eran nueve formas de decir lo mismo... y tarde.',
    'sigueme': '[warmly] Sígueme, que ahora viene lo que lo cambió todo.',
    'tres': 'Un día lo quitó todo y dejó solo el precio. [short pause] Por primera vez vio dónde rebotaba... y dónde se rompía.',
    'giro': '[serious] Mi consejo: el precio y, como mucho, un indicador que mida otra cosa, como el volumen. [short pause] Menos líneas, decisiones más claras.',
    'pregunta': '[curious] ¿Cuántos indicadores tienes tú ahora mismo? [mischievously] Etiqueta a tu Marcos.',
}

PANTALLAS = [
    ('hook', "", 'Marcos (stickman con gorra) frente a un monitor 3D cubierto de líneas de colores; mira a un lado y a otro, perdido'),
    ('uno', "", 'cada pérdida (vela roja) hace aparecer un indicador nuevo con su nombre; la pantalla se llena de luces como un árbol de Navidad'),
    ('dos', "", 'de la línea del precio salen nueve cables hacia los indicadores; todos encienden «COMPRA» a la vez y tarde, con un reloj de retraso'),
    ('sigueme', "", '«sígueme» grande, botón Seguir y cuenta auditada; Marcos señala'),
    ('tres', "", 'las líneas caen como confeti y queda el precio limpio; se marcan solos el soporte (rebota) y la ruptura'),
    ('giro', "", 'precio + barras de volumen debajo; balanza «MENOS LÍNEAS = DECISIONES MÁS CLARAS»'),
    ('pregunta', "", 'contador de indicadores y bocadillo de comentarios con «@marcos»'),
]
