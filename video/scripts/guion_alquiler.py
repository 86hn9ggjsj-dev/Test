"""Corto de alcance (v3, ~18 s): Marcos (personaje ficticio, gorra) opera con el dinero del alquiler.

Idea: con dinero que vas a necesitar se opera con miedo y se cierra en el peor momento. Regla: opera solo con dinero que no
vayas a necesitar. Formato v3: gancho visual de 2 s, «sígueme» a mitad, regla y «etiqueta» (sin cierre largo).
"""

TITULO = 'Marcos operó con el dinero del alquiler'
GANCHO = {'lineas': ['Operó con el dinero', 'del *alquiler*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Marcos operó con el dinero del alquiler.']),
    ('uno', ['Primera semana: +300 euros.']),
    ('sigueme', ['Sígueme, que esto acaba mal.']),
    ('dos', ['Día 28: toca pagar. La operación va en −400.', 'Y cierra, porque no puede esperar.']),
    ('giro', ['La regla: opera solo con dinero que no vayas a necesitar.', 'Con miedo, se opera fatal.']),
    ('cierre', ['Etiqueta a quien lo está haciendo ahora mismo.']),
]
GESTOS = {
    'hook': '[serious] Marcos operó con el dinero del alquiler.',
    'uno': '[mischievously] Primera semana: más trescientos euros.',
    'sigueme': '[warmly] Sígueme, que esto acaba mal.',
    'dos': '[serious] Día veintiocho: toca pagar. La operación va en menos cuatrocientos. [short pause] Y cierra, porque no puede esperar.',
    'giro': 'La regla: opera solo con dinero que no vayas a necesitar. [short pause] Con miedo, se opera fatal.',
    'cierre': '[mischievously] Etiqueta a quien lo está haciendo ahora mismo.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: un sobre «ALQUILER» que se abre y los billetes vuelan hacia el monitor; Marcos sonriendo'),
    ('uno', "", '+300 € gigante en verde con golpe de zoom y fogonazo verde'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('dos', "", 'calendario que salta al 28 con un casero llamando a la puerta (bocadillo «¿Y EL ALQUILER?»); −400 € en rojo; pulsa CERRAR temblando'),
    ('giro', "", 'dos huchas: «ALQUILER» (candado) y «PARA OPERAR»; solo se toca la segunda'),
    ('cierre', "", 'la puerta y el casero esperando; vuelve al principio (bucle)'),
]
