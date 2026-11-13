"""Reel con historia (5-30-10, ~45 s): Marcos deja una operación abierta el fin de semana y el lunes abre con un hueco.

Idea única: el mercado cierra el fin de semana; si pasa algo, el lunes el precio abre en otro sitio (hueco) y un stop
normal se ejecuta en el primer precio disponible (deslizamiento). Cifras de ejemplo: stop de −30 € que acaba en −140 €.
Regla: los viernes, antes del cierre, o cierras o dejas solo un tamaño que aguante un hueco.
"""

TITULO = 'Tu stop no te protege el fin de semana'
GANCHO = {'lineas': ['Tu stop *no_te_protege*', 'el *fin_de_semana*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Tu stop no te protege el fin de semana.']),
    ('uno', ['Viernes por la noche. Marcos deja una operación abierta.', 'Stop puesto: como mucho, pierde 30 euros.']),
    ('dos', ['Se va a dormir tranquilo.', 'El domingo sale una noticia que nadie esperaba.']),
    ('sigueme', ['Sígueme, que el lunes viene la sorpresa.']),
    ('tres', ['El lunes el mercado no abre donde cerró: abre mucho más abajo. Un hueco.', 'El stop salta en el primer precio que hay.', 'Y Marcos pierde 140 euros, no 30.']),
    ('giro', ['La solución: los viernes, antes del cierre, decide con calma.', 'O cierras la operación, o la dejas con un tamaño que aguante un hueco.', 'El fin de semana no lo controlas.']),
    ('cierre', ['Si has llegado hasta aquí, este viernes ya no te pilla.', 'Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]

GESTOS = {
    'hook': '[serious] Tu stop no te protege el fin de semana.',
    'uno': '[curious] Viernes por la noche. Marcos deja una operación abierta. Stop puesto: como mucho, pierde treinta euros.',
    'dos': '[mischievously] Se va a dormir tranquilo. [short pause] El domingo sale una noticia que nadie esperaba.',
    'sigueme': '[warmly] Sígueme, que el lunes viene la sorpresa.',
    'tres': '[inhales] El lunes el mercado no abre donde cerró: abre mucho más abajo. Un hueco. [serious] El stop salta en el primer precio que hay. Y Marcos pierde ciento cuarenta euros, no treinta.',
    'giro': 'La solución: los viernes, antes del cierre, decide con calma. O cierras la operación, o la dejas con un tamaño que aguante un hueco. [short pause] El fin de semana no lo controlas.',
    'cierre': '[warmly] Si has llegado hasta aquí, este viernes ya no te pilla. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}

PANTALLAS = [
    ('hook', "", 'fotograma 0: un stop rojo (línea) con un candado abierto encima de un calendario «SÁB · DOM»'),
    ('uno', "", 'escritorio limpio de noche: monitor con la operación abierta y la línea del stop «−30 €»; Marcos se levanta'),
    ('dos', "", 'Marcos dormido en la cama con la luna; el domingo, un móvil que vibra con «NOTICIA»'),
    ('sigueme', "", '«sígueme» encima de la escena, que sigue viva y desenfocada'),
    ('tres', "", 'gráfico con un hueco: la vela del lunes abre muy por debajo del cierre del viernes y salta por encima del stop; −30 € tachado → −140 €'),
    ('giro', "", 'viernes: dos opciones limpias «CERRAR» o «TAMAÑO PEQUEÑO»; candado cerrado sobre el fin de semana'),
    ('cierre', "", 'caja de comentario que escribe «BOT», se envía, llega el mensaje directo y la tarjeta «CUENTA AUDITADA ✓»'),
]
