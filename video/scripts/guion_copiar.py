"""Reel 5-30-10 (~40 s): elegir a quién copiar por el último mes (suele ser riesgo que salió bien). Regla: mirar cuánto tiempo lleva y su peor caída, y preguntarse si la aguantarías con tu dinero."""

TITULO = 'Copias al que más ganó el mes pasado. Y llegas justo a su peor racha'
GANCHO = {'lineas': ['Copias al que *más_ganó*', 'y llegas a su *peor_racha*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Copias al que más ganó el mes pasado. Y llegas justo a su peor racha.']),
    ('uno', ['Un mes de +40 % suele ser mucho riesgo que, esta vez, salió bien. Y lo que sube con mucho riesgo, baja igual de rápido.']),
    ('sigueme', ['Sígueme, que te digo los dos números que sí importan.']),
    ('dos', ['Uno: cuánto tiempo lleva. Menos de un año no te dice nada. Dos: su peor caída. Si alguna vez perdió la mitad, puede volver a perderla, contigo dentro.']),
    ('giro', ['La regla: antes de copiar a nadie, mira su peor caída y pregúntate si la aguantarías con tu dinero.']),
    ('cierre', ['Si has llegado hasta aquí, mira esos dos números antes de copiar. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Copias al que más ganó el mes pasado. [short pause] Y llegas justo a su peor racha.',
    'uno': 'Un mes de más cuarenta por ciento suele ser mucho riesgo que, esta vez, salió bien. [short pause] Y lo que sube con mucho riesgo, baja igual de rápido.',
    'sigueme': '[warmly] Sígueme, que te digo los dos números que sí importan.',
    'dos': '[curious] Uno: cuánto tiempo lleva. Menos de un año no te dice nada. [short pause] Dos: su peor caída. [serious] Si alguna vez perdió la mitad, puede volver a perderla, contigo dentro.',
    'giro': 'La regla: antes de copiar a nadie, mira su peor caída [short pause] y pregúntate si la aguantarías con tu dinero.',
    'cierre': '[warmly] Si has llegado hasta aquí, mira esos dos números antes de copiar. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: ranking «TOP DEL MES +40 %»; el stickman pulsa COPIAR y la curva se da la vuelta'),
    ('uno', "", 'curva con un pico de riesgo que se desploma'),
    ('sigueme', "", '«sígueme»'),
    ('dos', "", 'dos fichas: TIEMPO (años) y PEOR CAÍDA (−50 %)'),
    ('giro', "", 'el stickman mirando la peor caída antes de pulsar COPIAR'),
    ('cierre', "", 'móvil: BOT → mensaje directo → cuenta auditada'),
]
