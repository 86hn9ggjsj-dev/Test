"""Reel de alcance (~35 s): Nick Leeson hunde Barings (1995) escondiendo pérdidas en la cuenta 88888.

Datos: Barings, fundado en 1762 (233 años en 1995); Leeson, 28 años, operaba en Singapur; escondió pérdidas en la cuenta
de errores 88888; el terremoto de Kobe (17-1-1995) hundió el Nikkei; pérdidas de 827 millones de libras; ING compró el
banco por una libra; el primer error escondido fue de unas 20.000 libras; Leeson fue condenado a seis años y medio de cárcel en Singapur.
"""

TITULO = 'Escondió sus pérdidas en la cuenta 88888 y hundió un banco de 233 años'
GUION = [
    ('hook', ['Escondió sus pérdidas en una cuenta llamada ocho, ocho, ocho, ocho, ocho... y hundió un banco de doscientos treinta y tres años.']),
    ('uno', ['Nick Leeson, veintiocho años, el trader estrella de Barings en Singapur.', 'Todo empezó con un error de veinte mil libras que no quiso enseñar.']),
    ('dos', ['Cada vez que perdía, lo escondía en la cuenta secreta y doblaba la apuesta.', 'Y en Londres creían que ganaba millones.']),
    ('sigueme', ['Sígueme, que el final parece de película.']),
    ('tres', ['Entonces, un terremoto en Kobe hundió la bolsa japonesa. Y él, en vez de cerrar, apostó todavía más.', 'La pérdida llegó a ochocientos veintisiete millones de libras.']),
    ('giro', ['El banco de inversión más antiguo de Reino Unido se vendió por una libra.', 'Y todo empezó con una pérdida pequeña que no quiso aceptar.']),
    ('pregunta', ['¿Qué habrías hecho tú con esa primera pérdida? Mándaselo al que nunca cierra en negativo.']),
]

GESTOS = {
    'hook': '[whispers] Escondió sus pérdidas en una cuenta llamada ocho, ocho, ocho, ocho, ocho... [short pause] [curious] y hundió un banco de doscientos treinta y tres años.',
    'uno': 'Nick Leeson, veintiocho años, el trader estrella de Barings en Singapur. [short pause] Todo empezó con un error de veinte mil libras que no quiso enseñar.',
    'dos': 'Cada vez que perdía, lo escondía en la cuenta secreta y doblaba la apuesta. [short pause] Y en Londres creían que ganaba millones.',
    'sigueme': '[warmly] Sígueme, que el final parece de película.',
    'tres': '[inhales] Entonces, un terremoto en Kobe hundió la bolsa japonesa. Y él, en vez de cerrar, apostó todavía más. [short pause] La pérdida llegó a ochocientos veintisiete millones de libras.',
    'giro': '[serious] El banco de inversión más antiguo de Reino Unido se vendió por una libra. [short pause] Y todo empezó con una pérdida pequeña que no quiso aceptar.',
    'pregunta': '[curious] ¿Qué habrías hecho tú con esa primera pérdida? Mándaselo al que nunca cierra en negativo.',
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
