"""Historia de prueba (v3, ~34 s): las cuentas fondeadas como juego de ROI (no es trading).

Cifras de ejemplo, dichas como ejemplo: cuota de 150 € por challenge; si pasas 1 de cada 4, cada cuenta cuesta 600 €;
con una cuenta de 10.000 € y un 80 % para ti, hay que ganar 600 / (10.000 × 0,8) = 7,5 % solo para recuperarlo.
Regla: apuntar lo pagado en challenges y lo cobrado: ese es el ROI real.
"""

TITULO = 'Las cuentas fondeadas no son trading: son un juego de ROI'
GANCHO = {'lineas': ['Las fondeadas', 'no son trading: *son_ROI*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Las cuentas fondeadas no son trading. Son un juego de ROI.']),
    ('uno', ['Pagas una cuota. Si suspendes, la pierdes. Si pasas, cobras parte de lo que ganes.']),
    ('dos', ['Ejemplo: cuota de 150 euros. Si pasas 1 de cada 4, cada cuenta te cuesta 600.']),
    ('sigueme', ['Sígueme, que aquí está la cuenta que nadie hace.']),
    ('tres', ['Con una cuenta de 10.000 y un 80 % para ti, tienes que ganar un 7,5 % solo para recuperar esos 600.']),
    ('giro', ['La regla: apunta cuánto llevas pagado en challenges y cuánto has cobrado. Ese es tu ROI real.']),
    ('cierre', ['Comenta BOT y te paso por privado la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Las cuentas fondeadas no son trading. [short pause] Son un juego de ROI.',
    'uno': 'Pagas una cuota. Si suspendes, la pierdes. Si pasas, cobras parte de lo que ganes.',
    'dos': '[curious] Ejemplo: cuota de ciento cincuenta euros. Si pasas uno de cada cuatro, cada cuenta te cuesta seiscientos.',
    'sigueme': '[warmly] Sígueme, que aquí está la cuenta que nadie hace.',
    'tres': '[serious] Con una cuenta de diez mil y un ochenta por ciento para ti, tienes que ganar un siete coma cinco por ciento solo para recuperar esos seiscientos.',
    'giro': 'La regla: apunta cuánto llevas pagado en challenges y cuánto has cobrado. [short pause] Ese es tu ROI real.',
    'cierre': '[warmly] Comenta BOT y te paso por privado la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: la palabra TRADING tachada y ROI en grande, con un ticket de pago que sale de una caja registradora'),
    ('uno', "", 'flujo limpio: CUOTA → SUSPENDES (la cuota se va) / PASAS (cobras %)'),
    ('dos', "", 'cuatro tickets de 150 € que se apilan: = 600 € por cuenta'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('tres', "", 'cuenta en pantalla: 600 ÷ (10.000 × 80 %) = 7,5 %; barra que tiene que llenarse solo para quedar a cero'),
    ('giro', "", 'una libreta con dos columnas PAGADO / COBRADO y la resta = ROI'),
    ('cierre', "", 'caja de comentario «BOT» → mensaje directo → tarjeta «CUENTA AUDITADA ✓»'),
]
