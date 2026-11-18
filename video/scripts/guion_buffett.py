"""Historia 5-30-10 (~42 s): la apuesta de Buffett (2008-2017): un fondo del S&P 500 ganó un 125,8 % en diez años frente a un ~36 % de media de los cinco fondos de fondos de Protégé Partners (Buffett, carta de 2017). Regla: compararse cada mes con el índice."""

TITULO = 'Buffett apostó un millón a que no hacer nada ganaba a los profesionales'
GANCHO = {'lineas': ['No hacer nada', 'contra *los_profesionales*'], 'color': 'VERDE'}
GUION = [
    ('hook', ['Buffett apostó un millón a que no hacer nada ganaba a los profesionales.']),
    ('uno', ['En 2008 retó a cualquier gestor: un fondo que copia la bolsa americana, contra cinco fondos de los caros. Diez años.']),
    ('sigueme', ['Sígueme, que el resultado no fue ni parecido.']),
    ('dos', ['El índice, sin tocar nada: más de un 125 % en diez años. Los fondos: un 36. Con sus análisis y sus comisiones, perdieron contra no hacer nada.']),
    ('giro', ['La regla: cada mes, compara tu resultado con lo que habría hecho el índice. Si en un año no le ganas, estás trabajando gratis.']),
    ('cierre', ['Si has llegado hasta aquí, este mes te comparas. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Buffett apostó un millón a que no hacer nada [short pause] ganaba a los profesionales.',
    'uno': 'En dos mil ocho retó a cualquier gestor: un fondo que copia la bolsa americana, contra cinco fondos de los caros. [short pause] Diez años.',
    'sigueme': '[warmly] Sígueme, que el resultado no fue ni parecido.',
    'dos': '[serious] El índice, sin tocar nada: más de un ciento veinticinco por ciento en diez años. [short pause] Los fondos: un treinta y seis. Con sus análisis y sus comisiones, perdieron contra no hacer nada.',
    'giro': 'La regla: cada mes, compara tu resultado con lo que habría hecho el índice. [short pause] Si en un año no le ganas, estás trabajando gratis.',
    'cierre': '[warmly] Si has llegado hasta aquí, este mes te comparas. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: dos corredores: un sofá (el índice) adelanta a cinco trajeados con gráficos'),
    ('uno', "", 'tarjeta de la apuesta (2008-2017 · 1.000.000 $)'),
    ('sigueme', "", '«sígueme»'),
    ('dos', "", 'barras +125,8 % frente a +36 %'),
    ('giro', "", 'tu resultado frente al índice, mes a mes'),
    ('cierre', "", 'móvil: BOT → mensaje directo → cuenta auditada'),
]
