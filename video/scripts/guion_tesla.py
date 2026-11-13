"""Corto de alcance con dato real (v3, ~24 s): las posiciones cortas contra Tesla en 2020.

Datos: según S3 Partners, los vendedores en corto de Tesla acumularon unos 38.000 millones de dólares de pérdidas (a valor
de mercado) en 2020; la acción pasó de unos 86 $ (2-1-2020, antes de los desdoblamientos) a 705,67 $ (31-12-2020), más de 8
veces. Regla: que algo haya subido mucho no es motivo para venderlo.
"""

TITULO = 'Los que apostaron contra Tesla en 2020 perdieron 38.000 millones'
GANCHO = {'lineas': ['Apostaron contra Tesla:', '*−38.000_millones*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Los que apostaron contra Tesla en 2020 perdieron 38.000 millones de dólares.']),
    ('uno', ['Su argumento: "ya ha subido demasiado, tiene que bajar".']),
    ('sigueme', ['Sígueme, que esto lo piensa casi todo el mundo.']),
    ('dos', ['Ese año, la acción se multiplicó por más de 8.']),
    ('giro', ['La regla: que algo haya subido mucho no es motivo para venderlo.', 'El precio no sabe lo que tú crees que es demasiado.']),
    ('cierre', ['Mándaselo al que siempre dice "esto ya está muy caro".']),
]
GESTOS = {
    'hook': '[curious] Los que apostaron contra Tesla en dos mil veinte perdieron treinta y ocho mil millones de dólares.',
    'uno': '[mischievously] Su argumento: "ya ha subido demasiado, tiene que bajar".',
    'sigueme': '[warmly] Sígueme, que esto lo piensa casi todo el mundo.',
    'dos': '[serious] Ese año, la acción se multiplicó por más de ocho.',
    'giro': 'La regla: que algo haya subido mucho no es motivo para venderlo. [short pause] El precio no sabe lo que tú crees que es demasiado.',
    'cierre': '[mischievously] Mándaselo al que siempre dice "esto ya está muy caro".',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: contador rojo −38.000.000.000 $ girando a toda velocidad con temblor; flecha verde atravesando el techo'),
    ('uno', "", 'Marcos con un cartel «YA ESTÁ MUY ALTO» apostando a la baja'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('dos', "", 'línea verde que sube ×8 con golpes de zoom en ×2, ×4, ×8 y fogonazo verde'),
    ('giro', "", 'una regla gigante con «DEMASIADO» tachado'),
    ('cierre', "", 'vuelve al contador del principio (bucle)'),
]
