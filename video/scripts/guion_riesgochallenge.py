"""Historia de prueba v3 (~34 s) de fondeo, realista y SIN promo del bot (el bot opera capital real).

Supuestos dichos en el guion: la cuenta deja perder un 10 % en total y aciertas la mitad (operaciones independientes).
Con un 5 % por operación, dos pérdidas seguidas = −10 % = fuera: P(las dos primeras pierden) = 0,5² = 1/4.
Con un 1 %, para salir igual de rápido hacen falta diez pérdidas seguidas: 0,5¹⁰ = 1/1.024 ≈ una de cada mil.
(No se dice que con un 1 % solo se suspenda con diez seguidas: se compara la velocidad a la que te echan.)
"""

TITULO = 'Con un 5 % por operación, te suspendes tú solo'
GANCHO = {'lineas': ['Un 5 % por operación:', 'te *suspendes_tú_solo*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Si en tu challenge arriesgas un 5 % por operación, te suspendes tú solo.']),
    ('uno', ['Si la cuenta te deja perder un 10 %, con dos pérdidas seguidas estás fuera.']),
    ('dos', ['Acertando la mitad, eso pasa una de cada cuatro veces. En tus dos primeras operaciones.']),
    ('sigueme', ['Sígueme, que ahora viene la cuenta buena.']),
    ('tres', ['Con un 1 %, para que te echen igual de rápido necesitas diez pérdidas seguidas. Eso pasa una vez de cada mil.']),
    ('giro', ['Vas más lento, sí. Pero un challenge no lo gana el rápido: lo gana el que sigue vivo.']),
    ('cierre', ['Comenta cuánto arriesgas tú por operación. Te leo.']),
]
GESTOS = {
    'hook': '[serious] Si en tu challenge arriesgas un cinco por ciento por operación, [short pause] te suspendes tú solo.',
    'uno': 'Si la cuenta te deja perder un diez por ciento, con dos pérdidas seguidas estás fuera.',
    'dos': '[curious] Acertando la mitad, eso pasa una de cada cuatro veces. [short pause] En tus dos primeras operaciones.',
    'sigueme': '[warmly] Sígueme, que ahora viene la cuenta buena.',
    'tres': '[serious] Con un uno por ciento, para que te echen igual de rápido necesitas diez pérdidas seguidas. [short pause] Eso pasa una vez de cada mil.',
    'giro': 'Vas más lento, sí. [short pause] Pero un challenge no lo gana el rápido: lo gana el que sigue vivo.',
    'cierre': '[warmly] Comenta cuánto arriesgas tú por operación. Te leo.',
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
