"""Historia de prueba (v3, ~35 s): las cuentas del challenge de fondeo.

Cuentas: con un 40 % de acierto y ratio 1:2, la esperanza es 0,4·2 − 0,6·1 = 0,2 R por operación; arriesgando un 1 %,
+0,2 % de media por operación → un objetivo del 10 % pide unas 50 operaciones (sin contar el interés compuesto). Para
hacerlo en 10 habría que arriesgar 5 veces más (5 %), y en muchos challenges (p. ej. FTMO) el límite de pérdida diaria es
del 5 %: una sola pérdida lo agota.
"""

TITULO = 'Quieres pasar el challenge de fondeo en una semana y por eso lo suspendes'
GANCHO = {'lineas': ['¿El challenge', 'en *una_semana*?'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Quieres pasar el challenge de fondeo en una semana. Por eso lo suspendes.']),
    ('uno', ['Haz las cuentas: aciertas el 40 %, con ratio 1 a 2, y arriesgas un 1 %.']),
    ('dos', ['Cada operación te deja, de media, un 0,2 %.', 'Para el 10 % del objetivo necesitas unas 50 operaciones.']),
    ('sigueme', ['Sígueme, que aquí es donde casi todos la lían.']),
    ('tres', ['Para hacerlo en 10, tendrías que arriesgar 5 veces más: un 5 % por operación.', 'En muchos challenges, eso es el límite diario entero.']),
    ('giro', ['La regla: en el challenge, la prisa es el riesgo.']),
    ('cierre', ['Comenta BOT y te paso por privado la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Quieres pasar el challenge de fondeo en una semana. [short pause] Por eso lo suspendes.',
    'uno': '[curious] Haz las cuentas: aciertas el cuarenta por ciento, con ratio uno a dos, y arriesgas un uno por ciento.',
    'dos': 'Cada operación te deja, de media, un cero coma dos por ciento. [short pause] Para el diez por ciento del objetivo necesitas unas cincuenta operaciones.',
    'sigueme': '[warmly] Sígueme, que aquí es donde casi todos la lían.',
    'tres': '[serious] Para hacerlo en diez, tendrías que arriesgar cinco veces más: un cinco por ciento por operación. [short pause] En muchos challenges, eso es el límite diario entero.',
    'giro': 'La regla: en el challenge, la prisa es el riesgo.',
    'cierre': '[warmly] Comenta BOT y te paso por privado la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: barra del objetivo +10 % y un calendario de 7 días que se tacha rápido; sello «SUSPENDIDO»'),
    ('uno', "", 'tres fichas: 40 % · 1:2 · 1 %'),
    ('dos', "", 'cuenta en pantalla: 0,4·2 − 0,6·1 = 0,2 R → +0,2 %; barra de progreso que avanza 50 pasos hasta +10 %'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('tres', "", '10 pasos gigantes de 5 %; la barra del límite diario (−5 %) se vacía con una sola pérdida'),
    ('giro', "", 'reloj de arena y la barra avanzando poco a poco'),
    ('cierre', "", 'caja de comentario «BOT» → mensaje directo → tarjeta «CUENTA AUDITADA ✓»'),
]
