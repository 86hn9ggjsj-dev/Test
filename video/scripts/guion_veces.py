"""Reel con historia (~32 s, formato nuevo): Marcos (personaje ficticio, gorra) mira el gráfico sin parar.

Consejo: antes de entrar, stop, objetivo y una alerta; y cerrar la aplicación. Sin cifras ni afirmaciones sobre el bot.
"""

TITULO = 'Marcos miró el gráfico 143 veces en un día'
# Titular escrito del primer fotograma (formato nuevo): líneas con *palabras clave*
GANCHO = {'lineas': ['Miró el gráfico', '*143_veces* en un día'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Marcos miró el gráfico 143 veces en un día.']),
    ('uno', ['En el metro. En el baño. En la cena con su novia.']),
    ('dos', ['¿Y cuántas veces cambió algo por mirar? Cero.', 'Bueno, una: a la vez 120 se asustó con una vela roja y cerró.']),
    ('sigueme', ['Sígueme, que ahora viene lo que duele.']),
    ('tres', ['Diez minutos después, el precio llegó a su objetivo. Sin él.']),
    ('giro', ['La regla: antes de entrar, stop, objetivo y una alerta. Y cierras la aplicación.', 'El mercado no se mueve más porque lo mires.']),
    ('pregunta', ['¿Cuántas veces lo has mirado hoy? Etiqueta al que opera hasta en el baño.']),
]

GESTOS = {
    'hook': '[curious] Marcos miró el gráfico ciento cuarenta y tres veces en un día.',
    'uno': '[mischievously] En el metro. En el baño. En la cena con su novia.',
    'dos': '[curious] ¿Y cuántas veces cambió algo por mirar? [serious] Cero. [chuckles] Bueno, una: a la vez ciento veinte se asustó con una vela roja y cerró.',
    'sigueme': '[warmly] Sígueme, que ahora viene lo que duele.',
    'tres': '[inhales] Diez minutos después, el precio llegó a su objetivo. [serious] Sin él.',
    'giro': 'La regla: antes de entrar, stop, objetivo y una alerta. Y cierras la aplicación. [short pause] El mercado no se mueve más porque lo mires.',
    'pregunta': '[curious] ¿Cuántas veces lo has mirado hoy? [mischievously] Etiqueta al que opera hasta en el baño.',
}

PANTALLAS = [
    ('hook', "", 'fotograma 0: Marcos pegado al móvil, ojos enormes inyectados, con un contador «143» que no para de subir'),
    ('uno', "", 'tres viñetas rápidas: en el metro agarrado a la barra, sentado en el váter, en la mesa con su novia (stickman con coleta) de brazos cruzados'),
    ('dos', "", 'un «0» gigante; luego la vez 120: vela roja, Marcos pega un bote y pulsa CERRAR'),
    ('sigueme', "", '«sígueme» encima de la escena, que sigue viva y desenfocada'),
    ('tres', "", 'el precio sube hasta la línea OBJETIVO ✓ mientras Marcos lo ve desde fuera, con la mano en la cara'),
    ('giro', "", 'tres fichas que encajan: STOP, OBJETIVO, ALERTA 🔔; el móvil se pone boca abajo y Marcos se va a vivir'),
    ('pregunta', "", 'contador de «veces hoy» y bocadillo de comentarios'),
]
