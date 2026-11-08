"""Reel de alcance (~36 s): Long-Term Capital Management (1998), dos premios Nobel y 4.600 millones perdidos.

Datos: LTCM tenía entre sus socios a Myron Scholes y Robert Merton (Nobel de Economía 1997); a principios de 1998 operaba
con un apalancamiento de unas 25 veces; tras el impago de Rusia (agosto de 1998) perdió 4.600 millones de dólares en
menos de cuatro meses; la Reserva Federal de Nueva York organizó un rescate de 3.625 millones aportados por 14 bancos.
"""

TITULO = "Tenían dos premios Nobel y perdieron 4.600 millones en cuatro meses"
GUION = [
    ('hook', ['Tenían dos premios Nobel...', 'y perdieron 4.600 millones de dólares en menos de cuatro meses.']),
    ('uno', ['Long-Term Capital, 1998. Sus modelos decían que algo así era casi imposible.']),
    ('dos', ['Y para ganar más, por cada dólar suyo movían unos 25 prestados.']),
    ('sigueme', ['Sígueme, que el final es aún más loco.']),
    ('tres', ['Rusia deja de pagar su deuda, pasa lo «imposible»...', 'y en semanas el fondo está al borde de la quiebra.']),
    ('giro', ['La Reserva Federal tuvo que organizar un rescate con 14 bancos para que no arrastrara a Wall Street.', 'Ser muy listo no te salva del apalancamiento.']),
    ('pregunta', ['¿Con cuánto apalancamiento operas tú? Mándaselo al que dice que con equis cien se gana más rápido.']),
]

GESTOS = {
    'hook': '[curious] Tenían dos premios Nobel... [short pause] y perdieron cuatro mil seiscientos millones de dólares en menos de cuatro meses.',
    'uno': 'Long-Term Capital, mil novecientos noventa y ocho. [short pause] Sus modelos decían que algo así era casi imposible.',
    'dos': 'Y para ganar más, por cada dólar suyo movían unos veinticinco prestados.',
    'sigueme': '[warmly] Sígueme, que el final es aún más loco.',
    'tres': '[inhales] Rusia deja de pagar su deuda, pasa lo «imposible»... [short pause] y en semanas el fondo está al borde de la quiebra.',
    'giro': '[serious] La Reserva Federal tuvo que organizar un rescate con catorce bancos para que no arrastrara a Wall Street. [short pause] Ser muy listo no te salva del apalancamiento.',
    'pregunta': '[curious] ¿Con cuánto apalancamiento operas tú? Mándaselo al que dice que con equis cien se gana más rápido.',
}

PANTALLAS = [
    ("hook", "", "dos medallas Nobel en 3D girando sobre un contador rojo que cae a −4.600.000.000 $"),
    ("uno", "", "pizarra con una campana de Gauss; la cola de la izquierda marcada «CASI IMPOSIBLE»"),
    ("dos", "", "una torre: un bloque propio y 25 prestados encima, tambaleándose"),
    ("sigueme", "", "«sígueme» grande, botón Seguir y cuenta auditada"),
    ("tres", "", "mapa de Rusia en wireframe con «IMPAGO»; la torre de 26 bloques se derrumba"),
    ("giro", "", "14 bloques de bancos sujetando la torre; edificio de la Reserva Federal; rótulo «×25»"),
    ("pregunta", "", "selector ×1 ×5 ×25 ×100 y bocadillo de comentarios"),
]
