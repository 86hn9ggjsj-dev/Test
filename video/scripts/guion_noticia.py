"""Reel 5-30-10 «dopamina» (~44 s): el precio se mueve por la sorpresa frente a lo esperado, no por si el dato es bueno.

Caso real: NVIDIA presentó resultados el 28-8-2024 por encima de lo esperado (ingresos de 30.000 M $ frente a 28.700 M $
esperados; beneficio por acción de 0,68 $ frente a 0,64 $) y su acción cayó al día siguiente; Fortune: la caída borró más
de 200.000 millones de dólares de valor. «Comprar el rumor y vender la noticia». Regla: mirar la previsión (consenso)
antes de operar un dato: mueve la sorpresa, no la noticia.
"""

TITULO = 'NVIDIA ganó más de lo esperado. Y su acción se hundió'
GANCHO = {'lineas': ['Ganó más de lo esperado', 'y su acción *se_hundió*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['NVIDIA ganó más de lo que todos esperaban. Y su acción se hundió.']),
    ('uno', ['Se esfumaron más de 200.000 millones de dólares de valor.', 'No es un error. El mercado no se mueve por si el dato es bueno o malo. Se mueve por la diferencia con lo que ya esperaba.']),
    ('sigueme', ['Sígueme, que esto te ahorra muchos sustos.']),
    ('dos', ['Si todos esperaban un dato muy bueno, ya compraron antes. Cuando sale, no queda nadie para comprar, y los que compraron venden.', 'Se llama comprar el rumor y vender la noticia.']),
    ('giro', ['La regla: antes de operar un dato, mira la previsión. Lo que mueve el precio es la sorpresa, no la noticia.']),
    ('cierre', ['Si has llegado hasta aquí, ya no te pillará por sorpresa. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] NVIDIA ganó más de lo que todos esperaban. [short pause] Y su acción se hundió.',
    'uno': 'Se esfumaron más de doscientos mil millones de dólares de valor. [curious] No es un error. El mercado no se mueve por si el dato es bueno o malo. [serious] Se mueve por la diferencia con lo que ya esperaba.',
    'sigueme': '[warmly] Sígueme, que esto te ahorra muchos sustos.',
    'dos': 'Si todos esperaban un dato muy bueno, ya compraron antes. [short pause] Cuando sale, no queda nadie para comprar, [mischievously] y los que compraron venden. [curious] Se llama comprar el rumor y vender la noticia.',
    'giro': 'La regla: antes de operar un dato, mira la previsión. [short pause] Lo que mueve el precio es la sorpresa, no la noticia.',
    'cierre': '[warmly] Si has llegado hasta aquí, ya no te pillará por sorpresa. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: titular verde «RESULTADOS RÉCORD» y debajo la vela roja cayendo; stickman con los brazos arriba que se queda congelado'),
    ('uno', "", 'contador −200.000 M $; báscula: ESPERADO frente a REAL'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('dos', "", 'cola de stickmen que compraron antes; al salir la noticia, todos venden a la vez'),
    ('giro', "", 'calendario económico con las columnas PREVISIÓN y REAL; la flecha marca la diferencia (SORPRESA)'),
    ('cierre', "", 'móvil: comentario BOT → mensaje directo → cuenta auditada'),
]
