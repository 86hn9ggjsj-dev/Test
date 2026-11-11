"""Reel con historia (5-30-10, ~42 s): Marcos (personaje ficticio, gorra) pierde 200 € y entra a recuperarlos.

Idea única: después de perder, la cabeza no busca ganar, busca dejar de sentirse mal (operar por venganza).
Regla: 2 pérdidas seguidas y se acabó el día. Cierre de conversión: «comenta BOT» → cuenta auditada (sin afirmaciones).
"""

TITULO = 'Tu peor operación es la que abres justo después de perder'
GANCHO = {'lineas': ['Tu peor operación', 'es la de *después_de_perder*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Tu peor operación es la que abres justo después de perder.']),
    ('uno', ['Marcos perdió 200 euros a las 10 de la mañana.', 'Dos minutos después ya estaba dentro otra vez. Con el doble. Para recuperar.']),
    ('dos', ['Volvió a perder. Y volvió a entrar. Con más.']),
    ('sigueme', ['Sígueme, que esto nos ha pasado a todos.']),
    ('tres', ['A las 11 había perdido 1.400 euros. En menos de una hora.', 'Después de perder, tu cabeza no busca ganar: busca dejar de sentirse mal. Y para eso, cualquier operación le vale.']),
    ('giro', ['La regla: 2 pérdidas seguidas y se acabó el día. Cierras la plataforma. Mañana el mercado sigue ahí.', 'Mándaselo al que siempre quiere recuperarlo hoy.']),
    ('cierre', ['¿Quieres ver cómo opera mi bot, con sus días buenos y sus días malos? Comenta BOT y te paso por privado la cuenta auditada.']),
]

GESTOS = {
    'hook': '[serious] Tu peor operación es la que abres justo después de perder.',
    'uno': '[curious] Marcos perdió doscientos euros a las diez de la mañana. Dos minutos después ya estaba dentro otra vez. [mischievously] Con el doble. Para recuperar.',
    'dos': 'Volvió a perder. Y volvió a entrar. Con más.',
    'sigueme': '[warmly] Sígueme, que esto nos ha pasado a todos.',
    'tres': '[inhales] A las once había perdido mil cuatrocientos euros. [serious] En menos de una hora. Después de perder, tu cabeza no busca ganar: busca dejar de sentirse mal. Y para eso, cualquier operación le vale.',
    'giro': 'La regla: dos pérdidas seguidas y se acabó el día. [short pause] Cierras la plataforma. Mañana el mercado sigue ahí. [mischievously] Mándaselo al que siempre quiere recuperarlo hoy.',
    'cierre': '[warmly] ¿Quieres ver cómo opera mi bot, con sus días buenos y sus días malos? Comenta BOT y te paso por privado la cuenta auditada.',
}

PANTALLAS = [
    ('hook', "", 'fotograma 0 en plena acción: Marcos en su escritorio de casa (monitor, taza, ventana), aporreando COMPRAR con la cara roja; marcador −200 € → −1.400 € y reloj de pared'),
    ('uno', "", 'reloj de pared a las 10:00; vela roja −200 €; a las 10:02 el botón COMPRAR con «×2» y una nota adhesiva «RECUPERAR»'),
    ('dos', "", 'bucle rápido: pierde, entra, pierde, entra; el lote crece en cada vuelta (×2, ×4, ×8)'),
    ('sigueme', "", '«sígueme» encima de la escena, que sigue viva y desenfocada'),
    ('tres', "", 'reloj a las 11:00 y −1.400 € en rojo; cerebro con un termómetro de «sentirse mal» y Marcos pulsando cualquier botón'),
    ('giro', "", 'dos cruces rojas = «HOY SE ACABÓ»; cierra el portátil, coge la chaqueta y sale a la calle; amanece: «MAÑANA SIGUE AHÍ»'),
    ('cierre', "", 'caja de comentario que escribe «BOT», se envía, llega el mensaje directo y la tarjeta «CUENTA AUDITADA ✓»'),
]
