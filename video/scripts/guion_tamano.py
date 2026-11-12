"""Reel con historia (5-30-10, ~45 s): Marcos compra siempre 100 acciones; Lucía calcula el tamaño desde el stop.

Idea única: tamaño = lo que aceptas perder ÷ distancia al stop (20 € ÷ 0,40 € = 50 acciones; 20 € ÷ 1 € = 20 acciones).
Con tamaño fijo, la pérdida depende de dónde esté el stop (100 acciones: 0,10 € → 10 €; 0,80 € → 80 €).
"""

TITULO = 'Marcos compra siempre 100 acciones y por eso pierde 10 € o 80 €'
GANCHO = {'lineas': ['Siempre *100_acciones*:', 'pierde *10_€* o *80_€*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Marcos compra siempre 100 acciones. Por eso a veces pierde 10 euros... y a veces 80.']),
    ('uno', ['Con el stop cerca, pierde poco. Con el stop lejos, pierde 8 veces más. Y no se da cuenta.']),
    ('dos', ['Lucía lo hace al revés: primero decide cuánto acepta perder. 20 euros.', 'Luego mira dónde va el stop.']),
    ('sigueme', ['Sígueme, que esta fórmula te la vas a guardar.']),
    ('tres', ['Tamaño igual a lo que aceptas perder, entre la distancia al stop.', '20 euros entre 40 céntimos de stop: 50 acciones. Si el stop está a 1 euro: 20 acciones.', 'Pierda donde pierda, siempre son 20 euros.']),
    ('giro', ['La solución: el stop lo pone el gráfico. El tamaño, tu cuenta.']),
    ('cierre', ['Si has llegado hasta el final, guárdatelo.', 'Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]

GESTOS = {
    'hook': '[mischievously] Marcos compra siempre cien acciones. [serious] Por eso a veces pierde diez euros... y a veces ochenta.',
    'uno': 'Con el stop cerca, pierde poco. Con el stop lejos, pierde ocho veces más. Y no se da cuenta.',
    'dos': '[curious] Lucía lo hace al revés: primero decide cuánto acepta perder. Veinte euros. Luego mira dónde va el stop.',
    'sigueme': '[warmly] Sígueme, que esta fórmula te la vas a guardar.',
    'tres': 'Tamaño igual a lo que aceptas perder, entre la distancia al stop. Veinte euros entre cuarenta céntimos de stop: cincuenta acciones. Si el stop está a un euro: veinte acciones. [short pause] Pierda donde pierda, siempre son veinte euros.',
    'giro': 'La solución: el stop lo pone el gráfico. [serious] El tamaño, tu cuenta.',
    'cierre': '[warmly] Si has llegado hasta el final, guárdatelo. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}

PANTALLAS = [
    ('hook', "", 'fotograma 0: Marcos con una caja «100 ACCIONES» en brazos; dos tickets: −10 € y −80 € (el segundo enorme)'),
    ('uno', "", 'dos gráficos con velas: stop a 0,10 € (cerca) y a 0,80 € (lejos) con la misma caja de 100'),
    ('dos', "", 'Lucía con una hucha y un cartel «ARRIESGO 20 €»; luego coloca el stop en el gráfico'),
    ('sigueme', "", '«sígueme» encima de la escena, que sigue viva y desenfocada'),
    ('tres', "", 'pizarra con la fórmula TAMAÑO = RIESGO ÷ DISTANCIA AL STOP; 20 ÷ 0,40 = 50 y 20 ÷ 1 = 20 con cajas de acciones que cambian de tamaño; ambas cuentas terminan en −20 €'),
    ('giro', "", 'el gráfico pone el stop (mano del gráfico) y la cuenta pone el tamaño (calculadora)'),
    ('cierre', "", 'caja de comentario que escribe «BOT», se envía, llega el mensaje directo y la tarjeta «CUENTA AUDITADA ✓»'),
]
