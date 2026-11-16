"""Historia de prueba 5-30-10 «dopamina» (~42 s): FTX (noviembre de 2022) y el riesgo de dejar el dinero en un bróker o exchange.

Hechos: FTX, exchange de cripto valorado en 32.000 millones de dólares (enero de 2022), quebró en noviembre de 2022 tras una
estampida de retiradas; bloqueó las retiradas; más de un millón de usuarios afectados (declaración en el Congreso de EE. UU.);
el dinero de los clientes se había prestado a Alameda Research, otra empresa del fundador, para sus apuestas; Sam Bankman-Fried
fue condenado a 25 años de cárcel (marzo de 2024). En España, los clientes de empresas de servicios de inversión adheridas
al FOGAIN tienen cobertura de hasta 100.000 € si la entidad no puede devolver el efectivo o los valores (no cubre pérdidas
de mercado). Regla: el dinero no es tuyo hasta que lo sacas: entidad regulada y no dejar más de lo necesario para operar.
"""

TITULO = 'Un millón de personas fueron a sacar su dinero. Y no estaba'
GANCHO = {'lineas': ['Fueron a sacar', 'su dinero… *y_no_estaba*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Un millón de personas fueron a sacar su dinero. Y ya no estaba.']),
    ('uno', ['Pasó en FTX, un exchange de cripto valorado en 32.000 millones de dólares.', 'En pocos días todos quisieron sacar su dinero, y cerraron las retiradas.']),
    ('sigueme', ['Sígueme, que lo que pasó dentro es lo que importa.']),
    ('dos', ['El dinero de los clientes se había usado para apostar en otra empresa del dueño.', 'Su fundador acabó condenado a 25 años de cárcel.']),
    ('giro', ['La regla: tu dinero en un bróker no es tuyo hasta que lo sacas. Que esté regulado, y no dejes más de lo que necesitas para operar.']),
    ('cierre', ['Si has llegado hasta aquí, ya sabes qué mirar. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Un millón de personas fueron a sacar su dinero. [short pause] Y ya no estaba.',
    'uno': 'Pasó en FTX, un exchange de cripto valorado en treinta y dos mil millones de dólares. [short pause] En pocos días todos quisieron sacar su dinero, [serious] y cerraron las retiradas.',
    'sigueme': '[warmly] Sígueme, que lo que pasó dentro es lo que importa.',
    'dos': '[serious] El dinero de los clientes se había usado para apostar en otra empresa del dueño. [short pause] Su fundador acabó condenado a veinticinco años de cárcel.',
    'giro': 'La regla: tu dinero en un bróker no es tuyo hasta que lo sacas. [short pause] Que esté regulado, y no dejes más de lo que necesitas para operar.',
    'cierre': '[warmly] Si has llegado hasta aquí, ya sabes qué mirar. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: un millón de botones «RETIRAR» pulsándose a la vez y todos dando ERROR; saldo que se congela'),
    ('uno', "", 'tarjeta de prueba (FTX · 32.000 M $ · nov. 2022); cola de notificaciones «Retirada pendiente…»'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('dos', "", 'el dinero que sale por una puerta trasera hacia otra empresa; el mazo del juez: 25 AÑOS'),
    ('giro', "", 'stickman sacando su dinero del bróker y dejando solo lo justo; sello REGULADO ✓'),
    ('cierre', "", 'móvil: comentario BOT → mensaje directo → cuenta auditada'),
]
