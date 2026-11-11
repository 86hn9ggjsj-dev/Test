"""Reel con historia (5-30-10, ~40 s): Lucía (personaje ficticio, coleta) apunta 30 operaciones en un diario.

Idea única: el diario de trading enseña qué operaciones sobran (las de la noche, cansada y aburrida).
Regla: apunta tus próximas 30 operaciones: hora, motivo y emoción. Cierre de conversión: «comenta BOT» → cuenta auditada.
"""

TITULO = 'Lucía dejó de perder dinero cambiando una sola cosa'
GANCHO = {'lineas': ['Dejó de perder', 'con *una_sola_cosa*'], 'color': 'VERDE'}
GUION = [
    ('hook', ['Lucía dejó de perder dinero cambiando una sola cosa. Y no era su estrategia.']),
    ('uno', ['Durante un mes apuntó cada operación: la hora, el motivo y cómo se sentía.']),
    ('dos', ['Al llegar a 30 operaciones, lo vio.']),
    ('sigueme', ['Sígueme, que esto escuece.']),
    ('tres', ['Por la mañana, con su plan, ganaba.', 'Todo lo que perdía en el mes lo perdía de noche: después de las 10, cansada y por aburrimiento.', 'No le faltaba un indicador. Le sobraban las operaciones de la noche.']),
    ('giro', ['La regla: apunta tus próximas 30 operaciones. Hora, motivo y emoción. Tus propios números te dirán qué quitar.', 'Etiqueta a quien opera en pijama.']),
    ('cierre', ['¿Quieres ver los números reales de mi bot? Comenta BOT y te paso por privado la cuenta auditada.']),
]

GESTOS = {
    'hook': '[curious] Lucía dejó de perder dinero cambiando una sola cosa. [whispers] Y no era su estrategia.',
    'uno': 'Durante un mes apuntó cada operación: la hora, el motivo y cómo se sentía.',
    'dos': '[short pause] Al llegar a treinta operaciones, lo vio.',
    'sigueme': '[warmly] Sígueme, que esto escuece.',
    'tres': 'Por la mañana, con su plan, ganaba. [serious] Todo lo que perdía en el mes lo perdía de noche: después de las diez, cansada y por aburrimiento. [short pause] No le faltaba un indicador. Le sobraban las operaciones de la noche.',
    'giro': 'La regla: apunta tus próximas treinta operaciones. Hora, motivo y emoción. Tus propios números te dirán qué quitar. [mischievously] Etiqueta a quien opera en pijama.',
    'cierre': '[warmly] ¿Quieres ver los números reales de mi bot? Comenta BOT y te paso por privado la cuenta auditada.',
}

PANTALLAS = [
    ('hook', "", 'fotograma 0: Lucía en su escritorio con un cuaderno abierto y la curva de su cuenta que deja de bajar y empieza a subir'),
    ('uno', "", 'el cuaderno de cerca: columnas HORA · MOTIVO · EMOCIÓN que se van llenando, con caritas'),
    ('dos', "", 'contador 1 → 30 y las páginas pasando; bombilla'),
    ('sigueme', "", '«sígueme» encima de la escena, que sigue viva y desenfocada'),
    ('tres', "", 'ventana de día (sol) con operaciones en verde; ventana de noche (luna, 22:00) con Lucía en pijama bostezando y operaciones en rojo; tijeras que cortan la franja de la noche'),
    ('giro', "", 'el cuaderno con «30» y tres casillas HORA / MOTIVO / EMOCIÓN que se marcan'),
    ('cierre', "", 'caja de comentario que escribe «BOT», se envía, llega el mensaje directo y la tarjeta «CUENTA AUDITADA ✓»'),
]
