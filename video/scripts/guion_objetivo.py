"""Reel 5-30-10 (~40 s): mover el objetivo más arriba cuando el precio llega (avaricia). Regla: cerrar al menos la mitad en el objetivo y dejar la otra mitad con el stop en la entrada."""

TITULO = 'Llegó a tu objetivo. Y lo moviste más arriba'
GANCHO = {'lineas': ['Llegó a tu objetivo', 'y lo *moviste_más_arriba*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Llegó a tu objetivo. Y lo moviste más arriba.']),
    ('uno', ['Ibas a ganar 100 euros. Llega a 100, y piensas: esto va a seguir. Subes el objetivo. El precio se da la vuelta, y cierras en cero. O en pérdidas.']),
    ('sigueme', ['Sígueme, que esto tiene una solución muy sencilla.']),
    ('dos', ['El objetivo lo pusiste con la cabeza fría. Moverlo con el precio delante es la avaricia decidiendo por ti.']),
    ('giro', ['La regla: cuando llegue al objetivo, cierra al menos la mitad. La otra mitad, con el stop en la entrada. Así, pase lo que pase, ya has ganado.']),
    ('cierre', ['Si has llegado hasta aquí, te ha pasado más de una vez. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Llegó a tu objetivo. [short pause] Y lo moviste más arriba.',
    'uno': 'Ibas a ganar cien euros. Llega a cien, y piensas: [mischievously] esto va a seguir. [serious] Subes el objetivo. El precio se da la vuelta, y cierras en cero. [short pause] O en pérdidas.',
    'sigueme': '[warmly] Sígueme, que esto tiene una solución muy sencilla.',
    'dos': '[curious] El objetivo lo pusiste con la cabeza fría. [serious] Moverlo con el precio delante es la avaricia decidiendo por ti.',
    'giro': 'La regla: cuando llegue al objetivo, cierra al menos la mitad. [short pause] La otra mitad, con el stop en la entrada. Así, pase lo que pase, ya has ganado.',
    'cierre': '[warmly] Si has llegado hasta aquí, te ha pasado más de una vez. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: el precio toca la línea OBJETIVO y una mano la arrastra hacia arriba; el precio se da la vuelta'),
    ('uno', "", 'contador +100 € que se convierte en 0 €'),
    ('sigueme', "", '«sígueme»'),
    ('dos', "", 'cabeza fría (azul) frente a avaricia (rojo)'),
    ('giro', "", 'la mitad cerrada ✓ y la otra mitad con el stop en la entrada'),
    ('cierre', "", 'móvil: BOT → mensaje directo → cuenta auditada'),
]
