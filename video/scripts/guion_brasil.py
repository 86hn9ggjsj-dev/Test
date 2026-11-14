"""Historia de prueba v3 (~35 s) con dato real: day traders de Brasil (Chague, De-Losso y Giovannetti, «Day Trading for a Living?», 2019-2020).

Futuros del índice en Brasil, 2013-2015: de los que hicieron day trading más de 300 días, el 97 % perdió dinero; solo el
1,1 % ganó más que el salario mínimo (0,5 % más que el sueldo inicial de un cajero de banco); no hay pruebas de que
mejoraran con el tiempo. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3423101
Regla: apuntar todas las operaciones; si en cien la suma es negativa, no es mala racha: aún no hay ventaja.
"""

TITULO = 'El 97 % de los que hicieron day trading más de 300 días perdió dinero'
GANCHO = {'lineas': ['300 días de trading:', 'el *97_%* perdió'], 'color': 'ROJO'}
GUION = [
    ('hook', ['300 días haciendo day trading. El 97 % perdió dinero.']),
    ('uno', ['No es una encuesta: son los datos reales de la bolsa de Brasil, trader por trader.', 'Y solo uno de cada cien ganó más que el salario mínimo.']),
    ('sigueme', ['Sígueme, que lo peor del estudio no es eso.']),
    ('dos', ['Lo peor: los que siguieron más tiempo no mejoraron. Repetir sin medir no te hace mejor.']),
    ('giro', ['La regla: apunta todas tus operaciones. Si en cien la suma da negativo, no es mala racha: aún no tienes ventaja.']),
    ('cierre', ['Si has llegado hasta aquí, quieres estar en el otro 3 %. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Trescientos días haciendo day trading. [short pause] El noventa y siete por ciento perdió dinero.',
    'uno': 'No es una encuesta: son los datos reales de la bolsa de Brasil, trader por trader. [curious] Y solo uno de cada cien ganó más que el salario mínimo.',
    'sigueme': '[warmly] Sígueme, que lo peor del estudio no es eso.',
    'dos': '[serious] Lo peor: los que siguieron más tiempo no mejoraron. [short pause] Repetir sin medir no te hace mejor.',
    'giro': 'La regla: apunta todas tus operaciones. [short pause] Si en cien la suma da negativo, no es mala racha: aún no tienes ventaja.',
    'cierre': '[warmly] Si has llegado hasta aquí, quieres estar en el otro tres por ciento. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: contador de días 1 → 300 con 100 pantallas de trader que se apagan en rojo hasta quedar 3'),
    ('uno', "", 'el sello de la bolsa (B3) y tabla de operaciones reales desplazándose'),
    ('dos', "", 'una nómina de salario mínimo y 1 de cada 100 en verde'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('tres', "", 'curva de aprendizaje plana: día 300, día 400, día 500… no sube'),
    ('giro', "", 'libreta con 100 filas y la suma final en rojo / verde'),
    ('cierre', "", 'caja de comentario «BOT» → mensaje directo → tarjeta «CUENTA AUDITADA ✓»'),
]
