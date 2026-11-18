"""Corto v3 (~25 s): operar más te hace ganar menos (Barber y Odean, «Trading Is Hazardous to Your Wealth», J. of Finance 2000).

66.465 hogares de un bróker de descuento, 1991-1996: los que más operaban ganaron un 11,4 % neto al año; el mercado,
un 17,9 %; los que menos operaban, un 18,5 %. Antes de costes ganaban parecido: la diferencia son las comisiones por
operar de más, y los autores lo atribuyen al exceso de confianza. Regla: máximo de operaciones al día.
"""

TITULO = 'Operar más te hace ganar menos'
GANCHO = {'lineas': ['Operar más', 'te hace *ganar_menos*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Operar más te hace ganar menos. Y lo prueban 60.000 cuentas reales.']),
    ('uno', ['Un estudio siguió a más de 60.000 familias durante seis años.', 'Las que casi no tocaban nada ganaron un 18 y medio por ciento al año.']),
    ('sigueme', ['Sígueme, que ahora viene lo que les pasó a las que más operaban.']),
    ('dos', ['Un 11,4. Siete puntos menos, cada año.', 'Y antes de comisiones ganaban casi lo mismo. Lo perdieron operando de más, porque se creían más listos que el mercado.']),
    ('giro', ['La regla: ponte un máximo de operaciones al día. Y cuando llegues, cierra.']),
    ('cierre', ['Si has llegado hasta aquí, eres de los que operan con cabeza. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Operar más te hace ganar menos. [short pause] Y lo prueban sesenta mil cuentas reales.',
    'uno': 'Un estudio siguió a más de sesenta mil familias durante seis años. [short pause] Las que casi no tocaban nada ganaron un dieciocho y medio por ciento al año.',
    'sigueme': '[warmly] Sígueme, que ahora viene lo que les pasó a las que más operaban.',
    'dos': '[serious] Un once coma cuatro. [short pause] Siete puntos menos, cada año. [short pause] Y antes de comisiones ganaban casi lo mismo. Lo perdieron operando de más, porque se creían más listos que el mercado.',
    'giro': 'La regla: ponte un máximo de operaciones al día. [short pause] Y cuando llegues, cierra.',
    'cierre': '[warmly] Si has llegado hasta aquí, eres de los que operan con cabeza. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: dos contadores en carrera, 11,4 % (rojo, con un dedo que no para de pulsar) frente a 18,5 % (verde, quieto)'),
    ('uno', "", 'mapa de 60.000 casas que se encienden; calendario 1991 → 1996'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('dos', "", 'las dos barras igual de altas antes de costes; caen monedas de comisión de la roja hasta quedar por debajo'),
    ('giro', "", 'contador de operaciones del día 1, 2, 3… al llegar al máximo, la plataforma se cierra'),
    ('cierre', "", 'icono de enviar; vuelve a la carrera (bucle)'),
]
