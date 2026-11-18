"""Reel 5-30-10 (~38 s): «ha caído un 50 %, ya no puede bajar más». Cuenta: −50 % y después −80 % = −90 % (0,5 × 0,2 = 0,1). Regla: que algo haya caído no es razón para comprar; entrar solo con la señal y con stop."""

TITULO = 'Ha caído un 50 %. Ya no puede bajar más. Error'
GANCHO = {'lineas': ['−50 %:', '«ya no puede *bajar_más*»'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Ha caído un 50 %. Ya no puede bajar más. Error.']),
    ('uno', ['Todo lo que ha caído un 90 %, antes cayó un 50. Y alguien compró ahí, porque ya estaba barato.']),
    ('sigueme', ['Sígueme, que la cuenta asusta.']),
    ('dos', ['Si cae un 50, y luego otro 80 desde ahí, has perdido el 90 %. Cada vez que pensaste ya está barato, te equivocaste.']),
    ('giro', ['La regla: que algo haya caído no es una razón para comprar. Entra solo cuando se dé tu señal, y siempre con tu stop.']),
    ('cierre', ['Si has llegado hasta aquí, ya no compras porque está barato. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Ha caído un cincuenta por ciento. Ya no puede bajar más. [short pause] Error.',
    'uno': 'Todo lo que ha caído un noventa por ciento, antes cayó un cincuenta. [short pause] Y alguien compró ahí, [mischievously] porque ya estaba barato.',
    'sigueme': '[warmly] Sígueme, que la cuenta asusta.',
    'dos': '[serious] Si cae un cincuenta, y luego otro ochenta desde ahí, has perdido el noventa por ciento. [short pause] Cada vez que pensaste ya está barato, te equivocaste.',
    'giro': 'La regla: que algo haya caído no es una razón para comprar. [short pause] Entra solo cuando se dé tu señal, y siempre con tu stop.',
    'cierre': '[warmly] Si has llegado hasta aquí, ya no compras porque está barato. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: etiqueta de rebajas −50 % sobre un gráfico que sigue cayendo'),
    ('uno', "", 'escalera hacia abajo: −50 %… −90 %, stickmen comprando en cada escalón'),
    ('sigueme', "", '«sígueme»'),
    ('dos', "", 'la cuenta: 100 → 50 → 10'),
    ('giro', "", 'señal + stop antes de COMPRAR'),
    ('cierre', "", 'móvil: BOT → mensaje directo → cuenta auditada'),
]
