"""Corto v3 (~25 s): operar más te hace ganar menos (Barber y Odean, «Trading Is Hazardous to Your Wealth», J. of Finance 2000).

66.465 hogares de un bróker de descuento, 1991-1996: los que más operaban ganaron un 11,4 % neto al año; el mercado,
un 17,9 %; los que menos operaban, un 18,5 %. Antes de costes ganaban parecido: la diferencia son las comisiones por
operar de más, y los autores lo atribuyen al exceso de confianza. Regla: máximo de operaciones al día.
"""

TITULO = 'Los que más operaban ganaron menos'
GANCHO = {'lineas': ['Operar más', 'te hace *ganar_menos*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Los que más operaban ganaron un 11,4 % al año. Los que menos, un 18 y medio.']),
    ('uno', ['Más de 60.000 familias, seis años, operaciones reales.']),
    ('sigueme', ['Sígueme, que la razón te va a escocer.']),
    ('dos', ['Antes de comisiones ganaban casi lo mismo. Lo perdían operando de más, porque se creían más listos que el mercado.']),
    ('giro', ['La regla: ponte un máximo de operaciones al día. Y cuando llegues, cierra.']),
    ('cierre', ['Mándaselo al que hace 40 operaciones al día.']),
]
GESTOS = {
    'hook': '[serious] Los que más operaban ganaron un once coma cuatro por ciento al año. [short pause] Los que menos, un dieciocho y medio.',
    'uno': 'Más de sesenta mil familias, seis años, operaciones reales.',
    'sigueme': '[warmly] Sígueme, que la razón te va a escocer.',
    'dos': '[serious] Antes de comisiones ganaban casi lo mismo. [short pause] Lo perdían operando de más, porque se creían más listos que el mercado.',
    'giro': 'La regla: ponte un máximo de operaciones al día. [short pause] Y cuando llegues, cierra.',
    'cierre': '[mischievously] Mándaselo al que hace cuarenta operaciones al día.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: dos contadores en carrera, 11,4 % (rojo, con un dedo que no para de pulsar) frente a 18,5 % (verde, quieto)'),
    ('uno', "", 'mapa de 60.000 casas que se encienden; calendario 1991 → 1996'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('dos', "", 'las dos barras igual de altas antes de costes; caen monedas de comisión de la roja hasta quedar por debajo'),
    ('giro', "", 'contador de operaciones del día 1, 2, 3… al llegar al máximo, la plataforma se cierra'),
    ('cierre', "", 'icono de enviar; vuelve a la carrera (bucle)'),
]
