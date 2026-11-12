"""Reel con historia real (5-30-10, ~45 s): Long-Term Capital Management (LTCM), 1998.

Datos: fondo fundado en 1994 por John Meriwether; entre sus socios, Myron Scholes y Robert Merton (Nobel de Economía en
1997); ganó un 42,8 % neto en 1995 y un 40,8 % en 1996; muy apalancado (unos 25 a 1); tras el impago de Rusia de agosto de
1998 perdió unos 4.600 millones de dólares en menos de cuatro meses; la Reserva Federal de Nueva York reunió a 14
entidades que aportaron 3.625 millones para rescatarlo (septiembre de 1998).
Idea única: lo que tus modelos dan por casi imposible, pasa; operar para sobrevivir al peor día.
"""

TITULO = 'Un fondo con dos premios Nobel perdió 4.600 millones en menos de 4 meses'
GANCHO = {'lineas': ['Un fondo con *2_Nobel*', 'perdió *4.600_millones*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Un fondo con dos premios Nobel perdió 4.600 millones de dólares en menos de 4 meses.']),
    ('uno', ['Se llamaba Long-Term Capital. Llegó a ganar más de un 40 % en un año.', 'Con modelos matemáticos... y mucho dinero prestado.']),
    ('dos', ['Sus modelos decían que una pérdida grande era casi imposible.']),
    ('sigueme', ['Sígueme, que lo imposible está a punto de pasar.']),
    ('tres', ['Agosto de 1998: Rusia deja de pagar su deuda.', 'Y el mercado hace justo lo que el modelo no esperaba.', 'La Reserva Federal reunió a 14 bancos para rescatarlo con 3.600 millones.']),
    ('giro', ['La solución: antes de entrar, pregúntate: si mañana pasa lo peor que nunca he visto, ¿sigo vivo?', 'Si no, baja el tamaño.']),
    ('cierre', ['Si sigues aquí, piensas en el riesgo.', 'Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]

GESTOS = {
    'hook': '[curious] Un fondo con dos premios Nobel perdió cuatro mil seiscientos millones de dólares en menos de cuatro meses.',
    'uno': 'Se llamaba Long-Term Capital. Llegó a ganar más de un cuarenta por ciento en un año. [mischievously] Con modelos matemáticos... y mucho dinero prestado.',
    'dos': '[serious] Sus modelos decían que una pérdida grande era casi imposible.',
    'sigueme': '[warmly] Sígueme, que lo imposible está a punto de pasar.',
    'tres': '[inhales] Agosto de mil novecientos noventa y ocho: Rusia deja de pagar su deuda. Y el mercado hace justo lo que el modelo no esperaba. [serious] La Reserva Federal reunió a catorce bancos para rescatarlo con tres mil seiscientos millones.',
    'giro': 'La solución: antes de entrar, pregúntate: si mañana pasa lo peor que nunca he visto, ¿sigo vivo? [short pause] Si no, baja el tamaño.',
    'cierre': '[warmly] Si sigues aquí, piensas en el riesgo. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}

PANTALLAS = [
    ('hook', "", 'fotograma 0: dos medallas del Nobel delante de un rascacielos que se tiñe de rojo; contador −4.600.000.000 $'),
    ('uno', "", 'sala con pizarras llenas de fórmulas; curva que sube +40 %; una torre de bloques «PRESTADO» que crece debajo'),
    ('dos', "", 'campana de probabilidad con la cola minúscula señalada: «CASI IMPOSIBLE»'),
    ('sigueme', "", '«sígueme» encima de la escena, que sigue viva y desenfocada'),
    ('tres', "", 'calendario «AGOSTO 1998» y el Kremlin con «IMPAGO»; la bolita cae justo en la cola; 14 edificios de bancos con maletines «3.600 M» hacia el fondo'),
    ('giro', "", 'pregunta en una ficha: «SI PASA LO PEOR, ¿SIGO VIVO?»; si no, el tamaño encoge'),
    ('cierre', "", 'caja de comentario que escribe «BOT», se envía, llega el mensaje directo y la tarjeta «CUENTA AUDITADA ✓»'),
]
