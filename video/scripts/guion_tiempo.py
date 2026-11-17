"""Reel 5-30-10 «dopamina» (~38 s): el stop por tiempo (una operación que no se mueve también está mal).

Sin jerga técnica (el usuario rechazó el ATR: «qué es el ATR»). Si entraste esperando un movimiento y no llega en el tiempo
que esperabas, la idea ha fallado aunque el stop siga lejos. Regla: al entrar, decidir cuánto tiempo se le da; si en ese
tiempo no ha ido a favor, cerrarla, gane o pierda poco.
"""

TITULO = 'Tu operación no tiene que tocar el stop para estar mal'
GANCHO = {'lineas': ['No tiene que tocar el stop', 'para *estar_mal*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Tu operación no tiene que tocar el stop para estar mal.']),
    ('uno', ['Entras, y el precio no hace nada. Una vela. Diez. Cien.', 'Mientras, tu dinero está bloqueado, y tu cabeza también.']),
    ('sigueme', ['Sígueme, que esto casi nadie lo usa.']),
    ('dos', ['Si entraste esperando un movimiento y no llega, tu idea ya ha fallado. Aunque el stop siga lejos.', 'Se llama stop por tiempo.']),
    ('giro', ['La regla: al entrar, decide cuánto tiempo le das. Si en ese tiempo no ha ido a tu favor, la cierras, gane o pierda poco.']),
    ('cierre', ['Si has llegado hasta aquí, ya sabes qué operación vas a cerrar hoy. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Tu operación no tiene que tocar el stop [short pause] para estar mal.',
    'uno': 'Entras, y el precio no hace nada. [short pause] Una vela. Diez. Cien. [serious] Mientras, tu dinero está bloqueado, y tu cabeza también.',
    'sigueme': '[warmly] Sígueme, que esto casi nadie lo usa.',
    'dos': 'Si entraste esperando un movimiento y no llega, tu idea ya ha fallado. [short pause] Aunque el stop siga lejos. [curious] Se llama stop por tiempo.',
    'giro': 'La regla: al entrar, decide cuánto tiempo le das. [short pause] Si en ese tiempo no ha ido a tu favor, la cierras, gane o pierda poco.',
    'cierre': '[warmly] Si has llegado hasta aquí, ya sabes qué operación vas a cerrar hoy. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: el gráfico plano con el stop lejos y un reloj de arena que se vacía; el stickman bostezando delante'),
    ('uno', "", 'contador de velas 1 → 10 → 100 con la línea plana; candado sobre el dinero y una nube gris sobre la cabeza del stickman'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('dos', "", 'la flecha del movimiento esperado (punteada) frente a la línea real plana: IDEA FALLIDA aunque el stop esté lejos'),
    ('giro', "", 'al entrar, el stickman pone un temporizador junto al stop; cuando llega a 0 sin ir a favor, CERRAR'),
    ('cierre', "", 'móvil: comentario BOT → mensaje directo → cuenta auditada'),
]
