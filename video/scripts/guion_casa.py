"""Corto v3 (~25 s) de psicología: el efecto «dinero de la casa» (Thaler y Johnson, Management Science, 1990).

Tras una ganancia, la gente asume más riesgo con lo ganado (lo siente como dinero del casino). Ejemplo dicho en
segunda persona, sin cifras de estudio: ganas 400 € por la mañana, doblas el tamaño y lo devuelves.
Regla: objetivo del día alcanzado = cerrar; si sigues, con la mitad de tamaño, nunca el doble.
"""

TITULO = 'Tu día más peligroso es cuando ganas mucho'
GANCHO = {'lineas': ['Tu día más peligroso:', 'cuando *ganas_mucho*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Tu día más peligroso no es cuando pierdes. Es cuando ganas mucho.']),
    ('uno', ['Ganas 400 euros por la mañana, y sientes que ese dinero ya no es tuyo.']),
    ('sigueme', ['Sígueme, que esto te salva las semanas buenas.']),
    ('dos', ['Se llama efecto dinero de la casa. Doblas el tamaño. Y lo devuelves todo.']),
    ('giro', ['La regla: si llegas a tu objetivo del día, cierras. Y si sigues, con la mitad de tamaño.']),
    ('cierre', ['Guárdalo para tu próximo día verde.']),
]
GESTOS = {
    'hook': '[serious] Tu día más peligroso no es cuando pierdes. [short pause] Es cuando ganas mucho.',
    'uno': 'Ganas cuatrocientos euros por la mañana, [short pause] y sientes que ese dinero ya no es tuyo.',
    'sigueme': '[warmly] Sígueme, que esto te salva las semanas buenas.',
    'dos': '[curious] Se llama efecto dinero de la casa. [short pause] Doblas el tamaño. [serious] Y lo devuelves todo.',
    'giro': 'La regla: si llegas a tu objetivo del día, cierras. [short pause] Y si sigues, con la mitad de tamaño.',
    'cierre': '[warmly] Guárdalo para tu próximo día verde.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: P&L del día subiendo en verde a toda velocidad con una alarma roja parpadeando'),
    ('uno', "", '+400 € que se convierten en fichas de casino'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('dos', "", 'ficha ×2 al centro; el P&L se da la vuelta y baja a 0'),
    ('giro', "", 'barra de objetivo del día que se llena: CERRAR; o el tamaño que se parte por la mitad'),
    ('cierre', "", 'icono de guardar; vuelve al P&L subiendo (bucle)'),
]
