"""Corto (v3, ~26 s) de psicología: el anclaje al precio de entrada.

Sin personajes. Regla: si hoy no tuvieras esta operación, ¿la abrirías a este precio? Si no, ciérrala.
"""

TITULO = 'Al mercado le da igual a qué precio compraste'
GANCHO = {'lineas': ['Al mercado le da igual', 'a qué precio *compraste*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Al mercado le da igual a qué precio compraste tú.']),
    ('uno', ["Pero tú no cierras hasta 'recuperar lo que pagaste'. Y esperas. Y esperas."]),
    ('sigueme', ['Sígueme, que esta pregunta te va a ahorrar mucho dinero.']),
    ('dos', ['Se llama anclaje: tu cabeza usa tu precio de entrada como referencia, aunque ya no signifique nada.']),
    ('giro', ['La pregunta: si hoy no tuvieras esta operación, ¿la abrirías a este precio?', 'Si la respuesta es no, ciérrala.']),
    ('cierre', ["Mándaselo al que lleva meses esperando a 'salir en tablas'."]),
]
GESTOS = {
    'hook': '[serious] Al mercado le da igual a qué precio compraste tú.',
    'uno': '[mischievously] Pero tú no cierras hasta "recuperar lo que pagaste". Y esperas. [short pause] Y esperas.',
    'sigueme': '[warmly] Sígueme, que esta pregunta te va a ahorrar mucho dinero.',
    'dos': '[curious] Se llama anclaje: tu cabeza usa tu precio de entrada como referencia, aunque ya no signifique nada.',
    'giro': 'La pregunta: si hoy no tuvieras esta operación, ¿la abrirías a este precio? [short pause] Si la respuesta es no, ciérrala.',
    'cierre': '[mischievously] Mándaselo al que lleva meses esperando a "salir en tablas".',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: una línea «TU PRECIO» con un ancla colgando, y el precio bajando lejos de ella'),
    ('uno', "", 'un calendario que pasa semanas mientras el precio no vuelve a la línea'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('dos', "", 'el ancla que tira del gráfico hacia la línea vieja; la palabra ANCLAJE'),
    ('giro', "", 'la pregunta en grande con SÍ / NO; al decir no, se corta la cadena del ancla'),
    ('cierre', "", 'vuelve a la línea con el ancla (bucle)'),
]
