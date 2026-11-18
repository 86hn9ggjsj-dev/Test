"""Corto (v3, ~26 s) de psicología: una operación que pierde puede ser buena (proceso frente a resultado).

Sin personajes. Regla: puntuar cada operación de 0 a 10 por si seguiste el plan, no por el dinero.
"""

TITULO = 'Una operación que pierde puede ser buena'
GANCHO = {'lineas': ['Perder puede ser', 'una *buena_operación*'], 'color': 'VERDE'}
GUION = [
    ('hook', ['Una operación que pierde puede ser buena. Y una que gana, malísima.']),
    ('uno', ['Si entraste con tu plan, tu stop y tu tamaño, y perdiste: hiciste bien tu trabajo.']),
    ('sigueme', ['Sígueme, que esto te cambia la cabeza.']),
    ('dos', ['Si entraste por impulso y ganaste, el mercado te acaba de enseñar un mal hábito.', 'Y lo vas a repetir.']),
    ('giro', ['La regla: puntúa cada operación de 0 a 10 por si seguiste el plan. No por el dinero.']),
    ('cierre', ['Guárdalo para tu próxima racha mala.']),
]
GESTOS = {
    'hook': '[serious] Una operación que pierde puede ser buena. [short pause] Y una que gana, malísima.',
    'uno': 'Si entraste con tu plan, tu stop y tu tamaño, y perdiste: hiciste bien tu trabajo.',
    'sigueme': '[warmly] Sígueme, que esto te cambia la cabeza.',
    'dos': '[serious] Si entraste por impulso y ganaste, el mercado te acaba de enseñar un mal hábito. [short pause] Y lo vas a repetir.',
    'giro': 'La regla: puntúa cada operación de cero a diez por si seguiste el plan. [short pause] No por el dinero.',
    'cierre': '[warmly] Guárdalo para tu próxima racha mala.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: dos tickets enfrentados: −50 € con un ✓ verde y +200 € con una ✗ roja, girando'),
    ('uno', "", 'casillas PLAN ✓ · STOP ✓ · TAMAÑO ✓ que se marcan; resultado −50 € pequeño'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('dos', "", 'un dedo que pulsa COMPRAR sin plan; +200 € grande; una cadena que se engancha (hábito)'),
    ('giro', "", 'nota de 0 a 10 que sube a 10 con el plan y baja a 2 con el impulso'),
    ('cierre', "", 'vuelve a los dos tickets (bucle)'),
]
