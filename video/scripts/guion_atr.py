"""Reel 5-30-10 «dopamina» (~40 s): el stop a distancia fija frente al stop según la volatilidad (ATR).

Cuando la volatilidad sube, un stop de distancia fija queda dentro del ruido. ATR = rango medio de las últimas velas
(normalmente 14). Regla práctica: stop a 1,5 × ATR y tamaño ajustado para arriesgar lo mismo en euros.
"""

TITULO = 'Si tu stop siempre está a la misma distancia, el mercado te lo salta'
GANCHO = {'lineas': ['Tu stop, siempre igual:', 'el mercado *te_lo_salta*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Si tu stop siempre está a la misma distancia, el mercado te lo salta.']),
    ('uno', ['El mes pasado, el precio se movía 20 puntos por vela. Esta semana se mueve 60.', 'Tu stop de 20 antes era un colchón. Ahora es ruido.']),
    ('sigueme', ['Sígueme, que esto se arregla con un número.']),
    ('dos', ['Ese número se llama ATR: lo que se mueve de media cada vela. Casi todas las plataformas lo tienen gratis.']),
    ('giro', ['La regla: pon el stop a una vez y media el ATR, y ajusta el tamaño para arriesgar lo mismo en euros.']),
    ('cierre', ['Si has llegado hasta aquí, mira hoy el ATR de lo que operas. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Si tu stop siempre está a la misma distancia, [short pause] el mercado te lo salta.',
    'uno': 'El mes pasado, el precio se movía veinte puntos por vela. [short pause] Esta semana se mueve sesenta. [serious] Tu stop de veinte antes era un colchón. Ahora es ruido.',
    'sigueme': '[warmly] Sígueme, que esto se arregla con un número.',
    'dos': '[curious] Ese número se llama ATR: lo que se mueve de media cada vela. [short pause] Casi todas las plataformas lo tienen gratis.',
    'giro': 'La regla: pon el stop a una vez y media el ATR, [short pause] y ajusta el tamaño para arriesgar lo mismo en euros.',
    'cierre': '[warmly] Si has llegado hasta aquí, mira hoy el ATR de lo que operas. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: velas que crecen de golpe y una línea de stop fija que salta en pedazos'),
    ('uno', "", 'dos gráficos: velas de 20 frente a velas de 60; el mismo stop dentro del ruido'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('dos', "", 'regla que mide las últimas 14 velas = ATR; el indicador debajo del gráfico'),
    ('giro', "", 'stop a 1,5 × ATR y el dial de tamaño que baja para que los euros en riesgo no cambien'),
    ('cierre', "", 'móvil: comentario BOT → mensaje directo → cuenta auditada'),
]
