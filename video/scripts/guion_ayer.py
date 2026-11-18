"""Reel 5-30-10 (~40 s): el sesgo retrospectivo («en el gráfico de ayer todo era obvio»). Regla: tapar la parte derecha del gráfico, decidir y apuntarlo, y luego destapar."""

TITULO = 'En el gráfico de ayer todo era obvio'
GANCHO = {'lineas': ['En el gráfico de ayer', 'todo era *obvio*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['En el gráfico de ayer todo era obvio. Por eso no aprendes nada mirándolo.']),
    ('uno', ['Ves la vela que subió y piensas: estaba clarísimo, ¿cómo no entré? Pero ayer, con la vela a medias, no lo veías. Nadie lo veía.']),
    ('sigueme', ['Sígueme, que hay un truco para entrenar esto de verdad.']),
    ('dos', ['Se llama sesgo retrospectivo: cuando sabes el final, tu cabeza reescribe que lo sabías. Y entrenas con trampas.']),
    ('giro', ['La regla: tapa la parte derecha del gráfico. Decide con lo que ves: entro o no, y dónde va el stop. Apúntalo. Luego destapa.']),
    ('cierre', ['Si has llegado hasta aquí, prueba hoy con cinco gráficos. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] En el gráfico de ayer todo era obvio. [short pause] Por eso no aprendes nada mirándolo.',
    'uno': 'Ves la vela que subió y piensas: [mischievously] estaba clarísimo, ¿cómo no entré? [serious] Pero ayer, con la vela a medias, no lo veías. [short pause] Nadie lo veía.',
    'sigueme': '[warmly] Sígueme, que hay un truco para entrenar esto de verdad.',
    'dos': '[curious] Se llama sesgo retrospectivo: cuando sabes el final, tu cabeza reescribe que lo sabías. [short pause] Y entrenas con trampas.',
    'giro': 'La regla: tapa la parte derecha del gráfico. [short pause] Decide con lo que ves: entro o no, y dónde va el stop. Apúntalo. [short pause] Luego destapa.',
    'cierre': '[warmly] Si has llegado hasta aquí, prueba hoy con cinco gráficos. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: el stickman señalando una vela enorme con «¡ESTABA CLARÍSIMO!»'),
    ('uno', "", 'la misma vela a medias: niebla a la derecha'),
    ('sigueme', "", '«sígueme»'),
    ('dos', "", 'cerebro que reescribe un papel: «LO SABÍA»'),
    ('giro', "", 'una cartulina tapa la derecha; el stickman apunta ENTRO / STOP; destapa'),
    ('cierre', "", 'móvil: BOT → mensaje directo → cuenta auditada'),
]
