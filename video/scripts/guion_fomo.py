"""Reel de alcance (~35 s) con historia: Lucía (personaje ficticio, stickman con coleta) y el FOMO.

Concepto: FOMO, miedo a quedarte fuera; ver subir algo sin ti se siente como perder. Consejo: si no estaba en tu plan de
ayer, hoy no es tu operación; si te interesa, espera a que retroceda; si no retrocede, déjala ir.
"""

TITULO = 'Lucía vio una acción subir un 20 % y entró justo arriba'
GUION = [
    ('hook', ['Lucía vio una acción subir un 20 % en una mañana...', 'y no pudo aguantarse.']),
    ('uno', ['Entró justo arriba del todo.', 'A los 10 minutos ya perdía un 5 %.']),
    ('dos', ['Eso tiene nombre: FOMO, miedo a quedarte fuera.', 'Ver subir algo sin ti duele como perder, aunque no hayas perdido nada.']),
    ('sigueme', ['Sígueme, que te doy la regla que la habría salvado.']),
    ('tres', ['Si no estaba en tu plan de ayer, hoy no es tu operación.', 'Y si te interesa, espera a que retroceda. Si no retrocede, déjala ir.']),
    ('giro', ['El mercado abre todos los días. Las oportunidades no se acaban.', 'Tu cuenta, sí.']),
    ('pregunta', ['¿Cuál fue la última vela que perseguiste? Etiqueta a la Lucía de tu grupo.']),
]

GESTOS = {
    'hook': '[excited] Lucía vio una acción subir un veinte por ciento en una mañana... [short pause] y no pudo aguantarse.',
    'uno': 'Entró justo arriba del todo. [short pause] [serious] A los diez minutos ya perdía un cinco por ciento.',
    'dos': 'Eso tiene nombre: FOMO, miedo a quedarte fuera. [short pause] Ver subir algo sin ti duele como perder... aunque no hayas perdido nada.',
    'sigueme': '[warmly] Sígueme, que te doy la regla que la habría salvado.',
    'tres': '[serious] Si no estaba en tu plan de ayer, hoy no es tu operación. [short pause] Y si te interesa, espera a que retroceda. Si no retrocede... déjala ir.',
    'giro': 'El mercado abre todos los días. Las oportunidades no se acaban. [short pause] [serious] Tu cuenta, sí.',
    'pregunta': '[curious] ¿Cuál fue la última vela que perseguiste? [mischievously] Etiqueta a la Lucía de tu grupo.',
}

PANTALLAS = [
    ('hook', "", 'Lucía (stickman con coleta) ve en el móvil una vela verde que crece +20 %; da saltitos nerviosos'),
    ('uno', "", 'salta a la punta de la vela, que se da la vuelta: −5 % en rojo y reloj de 10 minutos'),
    ('dos', "", 'Lucía al otro lado de un cristal viendo subir la vela; contador «LO QUE TE PIERDES» en rojo mientras su saldo no se mueve'),
    ('sigueme', "", '«sígueme» grande, botón Seguir y cuenta auditada'),
    ('tres', "", 'libreta «PLAN DE AYER» sin esa acción → ✗; luego el precio retrocede hasta una zona marcada (ESPERA ✓) o se va (DÉJALA IR)'),
    ('giro', "", 'andén con trenes que llegan cada día; una cuenta que se vacía si persigue cada tren'),
    ('pregunta', "", 'vela verde con diana en la punta y bocadillo de comentarios con «@lucía»'),
]
