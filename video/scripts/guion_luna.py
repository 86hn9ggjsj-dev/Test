"""Historia 5-30-10 (~42 s): Terra Luna (mayo de 2022): Anchor pagaba ~19,5-20 % al año por depositar la moneda estable UST; UST perdió la paridad con el dólar y LUNA pasó de ~87 $ (5-5-2022) a casi cero en una semana; se evaporaron más de 40.000 millones de dólares. Regla: si algo paga mucho «sin riesgo», preguntar de dónde sale el dinero."""

TITULO = 'Un 20 % al año sin riesgo. En una semana, casi todo perdido'
GANCHO = {'lineas': ['Un 20 % al año', '*«sin_riesgo»*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Un 20 % al año, sin riesgo. En una semana, casi todo perdido.']),
    ('uno', ['Mayo de 2022. Terra Luna ofrecía casi un 20 % al año por guardar su moneda estable. En pocos días, esa moneda dejó de valer un dólar y Luna cayó casi a cero.']),
    ('sigueme', ['Sígueme, que la pregunta que nadie se hizo es la clave.']),
    ('dos', ['Más de 40.000 millones, evaporados. Y nadie sabía explicar de dónde salía ese 20 %.']),
    ('giro', ['La regla: si algo te paga mucho sin riesgo, pregunta de dónde sale el dinero. Si nadie te lo sabe explicar, el riesgo eres tú.']),
    ('cierre', ['Si has llegado hasta aquí, ya sabes qué preguntar. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Un veinte por ciento al año, sin riesgo. [short pause] En una semana, casi todo perdido.',
    'uno': 'Mayo de dos mil veintidós. Terra Luna ofrecía casi un veinte por ciento al año por guardar su moneda estable. [short pause] En pocos días, esa moneda dejó de valer un dólar y Luna cayó casi a cero.',
    'sigueme': '[warmly] Sígueme, que la pregunta que nadie se hizo es la clave.',
    'dos': '[serious] Más de cuarenta mil millones, evaporados. [short pause] Y nadie sabía explicar de dónde salía ese veinte por ciento.',
    'giro': 'La regla: si algo te paga mucho sin riesgo, pregunta de dónde sale el dinero. [short pause] Si nadie te lo sabe explicar, el riesgo eres tú.',
    'cierre': '[warmly] Si has llegado hasta aquí, ya sabes qué preguntar. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: un cartel luminoso «20 % AL AÑO · SIN RIESGO» que se apaga y se rompe'),
    ('uno', "", 'tarjeta (Terra Luna · mayo 2022) y la moneda estable que se despega de 1 $'),
    ('sigueme', "", '«sígueme»'),
    ('dos', "", 'contador −40.000 M $ y una tubería «¿DE DÓNDE SALE?» vacía'),
    ('giro', "", 'stickman preguntando ¿DE DÓNDE SALE? antes de depositar'),
    ('cierre', "", 'móvil: BOT → mensaje directo → cuenta auditada'),
]
