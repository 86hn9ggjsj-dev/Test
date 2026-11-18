"""Historia 5-30-10 (~42 s): Bill Ackman (Pershing Square), marzo de 2020: pagó unos 27 millones de dólares en protección de crédito y la cerró el 23-3-2020 por 2.600 millones (casi 100 veces). Contraste con la «cobertura» del trader minorista (abrir la contraria cuando ya pierde). Regla: la cobertura se pone antes, barata y por un riesgo concreto; si ya pierdes, cierra."""

TITULO = 'Pagó 27 millones por un seguro. Un mes después, cobró 2.600'
GANCHO = {'lineas': ['Pagó *27_millones*', 'y cobró *2.600*'], 'color': 'VERDE'}
GUION = [
    ('hook', ['Pagó 27 millones por un seguro. Un mes después, cobró 2.600.']),
    ('uno', ['Bill Ackman, marzo de 2020. Compró protección contra una caída del mercado. La bolsa se hundió, y esa protección pasó a valer casi cien veces más.']),
    ('sigueme', ['Sígueme, que esto no es lo que tú haces cuando abres una cobertura.']),
    ('dos', ['Tú abres la contraria cuando ya vas perdiendo, para no cerrar. Eso no es un seguro: es congelar la pérdida, pagando por dos.']),
    ('giro', ['La regla: una cobertura se pone antes, cuando es barata y por un riesgo concreto. Si ya pierdes, no cubras: cierra.']),
    ('cierre', ['Si has llegado hasta aquí, sabes de qué hablo. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Pagó veintisiete millones por un seguro. [short pause] Un mes después, cobró dos mil seiscientos.',
    'uno': 'Bill Ackman, marzo de dos mil veinte. Compró protección contra una caída del mercado. [short pause] La bolsa se hundió, y esa protección pasó a valer casi cien veces más.',
    'sigueme': '[warmly] Sígueme, que esto no es lo que tú haces cuando abres una cobertura.',
    'dos': '[mischievously] Tú abres la contraria cuando ya vas perdiendo, para no cerrar. [serious] Eso no es un seguro: es congelar la pérdida, pagando por dos.',
    'giro': 'La regla: una cobertura se pone antes, cuando es barata y por un riesgo concreto. [short pause] Si ya pierdes, no cubras: cierra.',
    'cierre': '[warmly] Si has llegado hasta aquí, sabes de qué hablo. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: una póliza de 27 M $ que se convierte en un cheque de 2.600 M $'),
    ('uno', "", 'tarjeta (Pershing Square · marzo 2020 · ×96) y la bolsa cayendo'),
    ('sigueme', "", '«sígueme»'),
    ('dos', "", 'stickman con COMPRA y VENTA abiertas a la vez: la pérdida congelada y dos comisiones'),
    ('giro', "", 'paraguas antes de la lluvia ✓ / paraguas con la ropa mojada ✗'),
    ('cierre', "", 'móvil: BOT → mensaje directo → cuenta auditada'),
]
