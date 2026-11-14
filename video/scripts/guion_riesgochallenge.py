"""Historia de prueba v3 (~34 s) de fondeo, realista y SIN promo del bot (el bot opera capital real).

Supuestos dichos en el guion: la cuenta deja perder un 10 % en total y aciertas la mitad (operaciones independientes).
Con un 5 % por operación, dos pérdidas seguidas = −10 % = fuera: P(las dos primeras pierden) = 0,5² = 1/4.
Con un 1 %, para salir igual de rápido hacen falta diez pérdidas seguidas: 0,5¹⁰ = 1/1.024 ≈ una de cada mil.
(No se dice que con un 1 % solo se suspenda con diez seguidas: se compara la velocidad a la que te echan.)
"""

TITULO = 'Si arriesgas un 5 % por operación en tu challenge, te suspendes tú solo'
GANCHO = {'lineas': ['Un 5 % por operación:', 'te *suspendes_tú_solo*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Si arriesgas un 5 % por operación en tu challenge, te suspendes tú solo.']),
    ('uno', ['Si tu cuenta te deja perder un 10 %, con dos pérdidas seguidas estás fuera.', 'Acertando la mitad, eso te pasa una de cada cuatro veces en tus dos primeras operaciones.']),
    ('sigueme', ['Sígueme, que ahora viene la cuenta que casi nadie hace.']),
    ('dos', ['Con un 1 %, para que te echen igual de rápido hacen falta diez seguidas: una vez de cada mil.', 'Vas más lento, pero un challenge lo gana el que sigue vivo.']),
    ('giro', ['La regla: nunca arriesgues más de un décimo de lo que la cuenta te deja perder.']),
    ('cierre', ['Si has llegado hasta aquí, vas en serio con tu challenge. Comenta RIESGO y te explico por privado cómo calcular el tuyo según tu cuenta.']),
]
GESTOS = {
    'hook': '[serious] Si arriesgas un cinco por ciento por operación en tu challenge, [short pause] te suspendes tú solo.',
    'uno': 'Si tu cuenta te deja perder un diez por ciento, con dos pérdidas seguidas estás fuera. [curious] Acertando la mitad, eso te pasa una de cada cuatro veces en tus dos primeras operaciones.',
    'sigueme': '[warmly] Sígueme, que ahora viene la cuenta que casi nadie hace.',
    'dos': '[serious] Con un uno por ciento, para que te echen igual de rápido hacen falta diez seguidas: [short pause] una vez de cada mil. Vas más lento, pero un challenge lo gana el que sigue vivo.',
    'giro': 'La regla: nunca arriesgues más de un décimo de lo que la cuenta te deja perder.',
    'cierre': '[warmly] Si has llegado hasta aquí, vas en serio con tu challenge. Comenta RIESGO y te explico por privado cómo calcular el tuyo según tu cuenta.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: barra de vida de la cuenta (como en un videojuego) que pierde dos bloques enormes del 5 %'),
    ('uno', "", 'línea de −10 % y dos velas rojas que la tocan: SUSPENDIDO'),
    ('dos', "", 'cuatro cuentas, una se apaga; dos monedas que salen cruz'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('tres', "", 'la misma barra en bloques de 1 %: diez bloques; contador 1 de cada 1.024'),
    ('giro', "", 'tortuga que sigue en pie frente a la cuenta del 5 % en el suelo (en alambre)'),
    ('cierre', "", 'caja de comentarios con «1 %», «2 %», «5 %…»'),
]
