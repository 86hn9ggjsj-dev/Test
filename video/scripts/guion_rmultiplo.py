"""Historia de prueba (v3, ~33 s) de matemáticas del trading: medir las operaciones en R.

R = lo que arriesgas en una operación (distancia al stop × tamaño). Arriesgar 50 € y ganar 150 € = +3 R; saltar el stop
= −1 R. La media en R de una muestra suficiente (50 operaciones) es la esperanza del sistema: si es negativa, cambiar el
tamaño no la vuelve positiva (solo hace más grandes las pérdidas).
"""

TITULO = 'Si mides tus operaciones en euros, no sabes si eres buen trader'
GANCHO = {'lineas': ['¿Lo mides *en_euros*?', 'Así *no_lo_sabes*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Si mides tus operaciones en euros, no sabes si eres buen trader.']),
    ('uno', ['Mídelas en R: lo que arriesgas en cada una. Arriesgas 50 y ganas 150: +3 R. Te salta el stop: −1 R.']),
    ('sigueme', ['Sígueme, que ahora viene la cuenta que importa.']),
    ('dos', ['Suma tus últimas 50 operaciones en R y divide entre 50. Ese número es tu ventaja.', 'Más 0,2: ganas, de media, una quinta parte de lo que arriesgas. Negativo: ningún tamaño lo arregla.']),
    ('giro', ['La regla: primero, que ese número salga positivo. Después, sube el tamaño.']),
    ('cierre', ['Si has llegado hasta aquí, esta noche sacas tu número. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Si mides tus operaciones en euros, no sabes si eres buen trader.',
    'uno': '[curious] Mídelas en R: lo que arriesgas en cada una. [short pause] Arriesgas cincuenta y ganas ciento cincuenta: más tres R. [short pause] Te salta el stop: menos uno R.',
    'sigueme': '[warmly] Sígueme, que ahora viene la cuenta que importa.',
    'dos': 'Suma tus últimas cincuenta operaciones en R y divide entre cincuenta. [short pause] Ese número es tu ventaja. Más cero coma dos: ganas, de media, una quinta parte de lo que arriesgas. [serious] Negativo: ningún tamaño lo arregla.',
    'giro': 'La regla: primero, que ese número salga positivo. [short pause] Después, sube el tamaño.',
    'cierre': '[warmly] Si has llegado hasta aquí, esta noche sacas tu número. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: columna de resultados en euros (+300, −120, +80…) que parpadea sin sentido y se tacha'),
    ('uno', "", 'la R gigante = LO QUE ARRIESGAS; +3 R en verde, −1 R en rojo'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('dos', "", '50 fichas en R que caen en una calculadora: ÷ 50 = media; si sale negativa, el dial de tamaño no la cambia'),
    ('cierre', "", 'icono de guardar; vuelve a la columna de euros (bucle)'),
]
