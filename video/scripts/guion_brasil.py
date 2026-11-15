"""Historia de prueba v3 (~35 s) con dato real: day traders de Brasil (Chague, De-Losso y Giovannetti, «Day Trading for a Living?», 2019-2020).

Futuros del índice en Brasil, 2013-2015: de los que hicieron day trading más de 300 días, el 97 % perdió dinero; solo el
1,1 % ganó más que el salario mínimo (0,5 % más que el sueldo inicial de un cajero de banco); no hay pruebas de que
mejoraran con el tiempo. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3423101
Regla: un stop para ti como trader: fecha y cifra (si en seis meses no ganas más de lo que pierdes, paras y cambias de sistema).
"""

TITULO = 'El 97 % de los que hicieron day trading más de 300 días perdió dinero'
GANCHO = {'lineas': ['300 días de trading:', 'el *97_%* perdió'], 'color': 'ROJO'}
GUION = [
    ('hook', ['300 días haciendo day trading. El 97 % perdió dinero.']),
    ('uno', ['No es una encuesta: son los datos reales de la bolsa de Brasil, trader por trader.', 'Y solo uno de cada cien ganó más que el salario mínimo.']),
    ('sigueme', ['Sígueme, que lo peor del estudio no es eso.']),
    ('dos', ['Lo peor: los que siguieron más tiempo no mejoraron. Repetir sin medir no te hace mejor.']),
    ('giro', ['La regla: ponte un stop también a ti. Una fecha y una cifra: si en seis meses no ganas más de lo que pierdes, paras y cambias de sistema.']),
    ('cierre', ['Si has llegado hasta aquí, quieres estar en el otro 3 %. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Trescientos días haciendo day trading. [short pause] El noventa y siete por ciento perdió dinero.',
    'uno': 'No es una encuesta: son los datos reales de la bolsa de Brasil, trader por trader. [curious] Y solo uno de cada cien ganó más que el salario mínimo.',
    'sigueme': '[warmly] Sígueme, que lo peor del estudio no es eso.',
    'dos': '[serious] Lo peor: los que siguieron más tiempo no mejoraron. [short pause] Repetir sin medir no te hace mejor.',
    'giro': 'La regla: ponte un stop también a ti. [short pause] Una fecha y una cifra: si en seis meses no ganas más de lo que pierdes, paras y cambias de sistema.',
    'cierre': '[warmly] Si has llegado hasta aquí, quieres estar en el otro tres por ciento. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: 100 stickmen en sus mesas con el contador de días 1 → 300; se van apagando en rojo hasta quedar 3'),
    ('uno', "", 'el sello de la bolsa (B3) y tabla de operaciones reales desplazándose'),
    ('dos', "", 'una nómina de salario mínimo y 1 de cada 100 en verde'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('tres', "", 'stickman repitiendo lo mismo día tras día (300, 400, 500…) con la curva de aprendizaje plana'),
    ('giro', "", 'calendario con una fecha marcada y la cifra; al llegar, la línea STOP corta la curva'),
    ('cierre', "", 'caja de comentario «BOT» → mensaje directo → tarjeta «CUENTA AUDITADA ✓»'),
]
