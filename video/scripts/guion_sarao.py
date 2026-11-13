"""Historia real (v3, ~34 s): Navinder Sarao y el «flash crash» del 6 de mayo de 2010.

Datos: el Dow Jones llegó a caer casi 1.000 puntos (cerca del 9 %) en minutos y se recuperó en buena parte en el mismo
rato; en 2015 EE. UU. acusó a Navinder Sarao, que operaba desde casa de sus padres en Hounslow (Londres), de «spoofing»
(órdenes falsas que se cancelan antes de ejecutarse) y de contribuir a las condiciones de aquel día; se declaró culpable
de spoofing y fraude en 2016. Aquel día muchas órdenes stop se ejecutaron a precios absurdos antes del rebote.
"""

TITULO = 'Casi 1.000 puntos en minutos y uno de los señalados operaba desde casa de sus padres'
GANCHO = {'lineas': ['*−1.000_puntos*', 'en *minutos*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Casi 1.000 puntos de caída en minutos.', 'Y uno de los señalados operaba desde casa de sus padres.']),
    ('uno', ['Navinder Sarao. Lanzaba órdenes falsas y las cancelaba antes de ejecutarse.']),
    ('dos', ['Así movía el precio.', 'El 6 de mayo de 2010, el Dow Jones se desplomó en minutos... y luego volvió.']),
    ('sigueme', ['Sígueme, que esto te afecta más de lo que crees.']),
    ('tres', ['Ese día, muchos stops saltaron en el peor precio. Justo antes del rebote.']),
    ('giro', ['La regla: un desplome de minutos sin noticia no es una señal.', 'Espera a que el precio se calme.']),
    ('cierre', ['Comenta BOT y te paso por privado la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Casi mil puntos de caída en minutos. [whispers] Y uno de los señalados operaba desde casa de sus padres.',
    'uno': '[curious] Navinder Sarao. Lanzaba órdenes falsas y las cancelaba antes de ejecutarse.',
    'dos': 'Así movía el precio. [inhales] El seis de mayo de dos mil diez, el Dow Jones se desplomó en minutos... [short pause] y luego volvió.',
    'sigueme': '[warmly] Sígueme, que esto te afecta más de lo que crees.',
    'tres': '[serious] Ese día, muchos stops saltaron en el peor precio. Justo antes del rebote.',
    'giro': 'La regla: un desplome de minutos sin noticia no es una señal. [short pause] Espera a que el precio se calme.',
    'cierre': '[warmly] Comenta BOT y te paso por privado la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: vela roja gigante que cae a toda velocidad con contador −998 y temblor; corte seco a un dormitorio con un PC'),
    ('uno', "", 'órdenes que aparecen en el libro y desaparecen (parpadeo) antes de tocar el precio'),
    ('dos', "", 'el precio empujado hacia abajo; la «V» del 6 de mayo: cae y vuelve'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('tres', "", 'stops que saltan en el fondo de la «V» (chispas rojas) y el precio que vuelve sin ellos'),
    ('giro', "", 'reloj de arena: «ESPERA»; el precio se calma'),
    ('cierre', "", 'caja de comentario «BOT» → mensaje directo → tarjeta «CUENTA AUDITADA ✓»'),
]
