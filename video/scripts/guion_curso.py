"""Reel 5-30-10 (~38 s): el coste hundido (pagaste 2.000 € por un curso y sigues con su estrategia aunque pierda). Regla: escribir por qué sigues; si la razón es «porque pagué», dejarla hoy."""

TITULO = 'Pagaste 2.000 € por un curso. Y por eso sigues perdiendo con él'
GANCHO = {'lineas': ['Pagaste *2.000_€*', 'y por eso *sigues_perdiendo*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Pagaste 2.000 euros por un curso. Y por eso sigues perdiendo con él.']),
    ('uno', ['La estrategia no funciona. Tres meses en negativo. Pero piensas: si lo dejo, he tirado el dinero.']),
    ('sigueme', ['Sígueme, que esto tiene nombre, y te está costando el doble.']),
    ('dos', ['Se llama coste hundido. Los 2.000 euros ya no vuelven, sigas o no. Lo único que decides es si pierdes más.']),
    ('giro', ['La regla: escribe en una línea por qué sigues con esa estrategia. Si la razón es porque la pagué, déjala hoy.']),
    ('cierre', ['Si has llegado hasta aquí, ya sabes cuál toca dejar. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Pagaste dos mil euros por un curso. [short pause] Y por eso sigues perdiendo con él.',
    'uno': 'La estrategia no funciona. Tres meses en negativo. [short pause] Pero piensas: [mischievously] si lo dejo, he tirado el dinero.',
    'sigueme': '[warmly] Sígueme, que esto tiene nombre, y te está costando el doble.',
    'dos': '[curious] Se llama coste hundido. [serious] Los dos mil euros ya no vuelven, sigas o no. [short pause] Lo único que decides es si pierdes más.',
    'giro': 'La regla: escribe en una línea por qué sigues con esa estrategia. [short pause] Si la razón es porque la pagué, déjala hoy.',
    'cierre': '[warmly] Si has llegado hasta aquí, ya sabes cuál toca dejar. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: un recibo de 2.000 € atado con una cadena al tobillo del stickman, que sigue pulsando COMPRAR en rojo'),
    ('uno', "", 'calendario de 3 meses en rojo'),
    ('sigueme', "", '«sígueme»'),
    ('dos', "", 'el recibo cae a un pozo (HUNDIDO) y no vuelve; la cadena sigue'),
    ('giro', "", 'nota «SIGO PORQUE…»: «LA PAGUÉ» → se corta la cadena'),
    ('cierre', "", 'móvil: BOT → mensaje directo → cuenta auditada'),
]
