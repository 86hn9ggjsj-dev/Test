"""Reel 5-30-10 «dopamina» (~40 s): mover el stop a la entrada (break even) demasiado pronto.

El precio no va en línea recta: avanza y retrocede. Con el stop en la entrada, cada retroceso normal te saca a cero y te
pierdes operaciones que habrían llegado al objetivo. Regla práctica: no mover el stop a la entrada hasta que el precio
haya ido a favor al menos lo mismo que arriesgas (1 R).
"""

TITULO = 'Mueves el stop a la entrada para no perder. Y por eso pierdes'
GANCHO = {'lineas': ['Stop a la entrada', 'para no perder… *y_pierdes*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Mueves el stop a la entrada para no perder. Y justo por eso pierdes.']),
    ('uno', ['El precio va un poco a tu favor y subes el stop a tu entrada. Ya no puedes perder.', 'Vuelve, te saca a cero... y se va directo a tu objetivo.']),
    ('sigueme', ['Sígueme, que esto tiene arreglo.']),
    ('dos', ['El precio no va en línea recta: avanza y retrocede. Con el stop en la entrada, cada retroceso normal te echa.']),
    ('giro', ['La regla: no muevas el stop a la entrada hasta que el precio haya ido a tu favor al menos lo mismo que arriesgas.']),
    ('cierre', ['Si has llegado hasta aquí, te ha pasado. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Mueves el stop a la entrada para no perder. [short pause] Y justo por eso pierdes.',
    'uno': 'El precio va un poco a tu favor y subes el stop a tu entrada. [mischievously] Ya no puedes perder. [serious] Vuelve, te saca a cero... [short pause] y se va directo a tu objetivo.',
    'sigueme': '[warmly] Sígueme, que esto tiene arreglo.',
    'dos': '[curious] El precio no va en línea recta: avanza y retrocede. [serious] Con el stop en la entrada, cada retroceso normal te echa.',
    'giro': 'La regla: no muevas el stop a la entrada hasta que el precio haya ido a tu favor [short pause] al menos lo mismo que arriesgas.',
    'cierre': '[warmly] Si has llegado hasta aquí, te ha pasado. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: stickman arrastrando la línea del stop hasta la entrada con cara de alivio; candado «0 €»'),
    ('uno', "", 'el precio toca la entrada (CERRADA A 0 €) y sale disparado hasta el OBJETIVO; el stickman se lleva las manos a la cabeza'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('dos', "", 'el camino del precio en zigzag; cada retroceso toca la línea del stop en la entrada'),
    ('giro', "", 'regla de medir: 1 R de riesgo; el stop solo sube cuando el precio ha recorrido 1 R a favor'),
    ('cierre', "", 'móvil: comentario BOT → mensaje directo → cuenta auditada'),
]
