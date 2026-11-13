"""Historia de prueba (v3, ~33 s) de matemáticas del trading: medir las operaciones en R.

R = lo que arriesgas en una operación (distancia al stop × tamaño). Arriesgar 50 € y ganar 150 € = +3 R; saltar el stop
= −1 R. La media en R de una muestra suficiente (50 operaciones) es la esperanza del sistema: si es negativa, cambiar el
tamaño no la vuelve positiva (solo hace más grandes las pérdidas).
"""

TITULO = 'Si mides tus operaciones en euros, no sabes si eres buen trader'
GANCHO = {'lineas': ['¿Lo mides *en_euros*?', 'Así *no_lo_sabes*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Si mides tus operaciones en euros, no sabes si eres buen trader.']),
    ('uno', ['Mídelas en R. R es lo que arriesgas en cada operación.']),
    ('dos', ['Arriesgas 50 euros y ganas 150: eso es +3 R. Te salta el stop: −1 R.']),
    ('sigueme', ['Sígueme, que ahora viene la cuenta que importa.']),
    ('tres', ['Suma tus últimas 50 operaciones en R y divide entre 50.', 'Si sale positivo, tu sistema tiene ventaja. Si sale negativo, ningún tamaño lo arregla.']),
    ('giro', ['La regla: primero, que ese número salga positivo. Después, sube el tamaño.']),
    ('cierre', ['Comenta BOT y te paso por privado la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Si mides tus operaciones en euros, no sabes si eres buen trader.',
    'uno': '[curious] Mídelas en R. [short pause] R es lo que arriesgas en cada operación.',
    'dos': 'Arriesgas cincuenta euros y ganas ciento cincuenta: eso es más tres R. [short pause] Te salta el stop: menos uno R.',
    'sigueme': '[warmly] Sígueme, que ahora viene la cuenta que importa.',
    'tres': 'Suma tus últimas cincuenta operaciones en R y divide entre cincuenta. [short pause] Si sale positivo, tu sistema tiene ventaja. [serious] Si sale negativo, ningún tamaño lo arregla.',
    'giro': 'La regla: primero, que ese número salga positivo. [short pause] Después, sube el tamaño.',
    'cierre': '[warmly] Comenta BOT y te paso por privado la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: una columna de resultados en euros (+300, −120, +80…) que parpadea sin sentido y se tacha'),
    ('uno', "", 'la letra R gigante = «LO QUE ARRIESGAS»'),
    ('dos', "", '50 € → +150 € = +3 R (verde); stop = −1 R (rojo), con golpe en cada cifra'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('tres', "", '50 fichas de R que caen en una suma; el resultado medio aparece (+0,3 R verde) y su versión negativa (−0,2 R rojo) con un candado'),
    ('giro', "", 'orden: 1º número positivo ✓ → 2º tamaño ↑'),
    ('cierre', "", 'caja de comentario «BOT» → mensaje directo → tarjeta «CUENTA AUDITADA ✓»'),
]
