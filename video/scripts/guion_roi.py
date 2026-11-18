"""Historia de prueba (v3, ~34 s): cuentas fondeadas con datos reales (realista: lo bueno y lo malo, juego de ROI).

Fuente: Finance Magnates, sept. 2024, datos de FPFX Tech (más de 300.000 cuentas de 100.000 traders en 10 empresas):
el 14 % de los traders aprobó el challenge; de esos, ~45 % cobró algo (= 7 % del total); cobro medio = 4 % del tamaño
de la cuenta. https://www.financemagnates.com/forex/analysis/exclusive-only-7-of-300000-prop-trading-accounts-achieved-payouts/
Lo bueno (cierto): solo se arriesga la cuota, no el capital propio.
Ejemplo (condicional, dicho como ejemplo): 100 € por intento y 1 de cada 7 aprobado → 700 € por cuenta aprobada.
El 14 % es por trader (varios intentos cada uno), así que por intento suele ser menor: el ejemplo se queda corto, no exagera.
Regla: apuntar lo pagado en challenges y lo cobrado: ese es el ROI real.
"""

TITULO = 'De cada 100 que pagan un challenge, solo 7 cobran'
GANCHO = {'lineas': ['De 100 que pagan', 'un challenge,', 'solo *7* cobran'], 'color': 'ROJO'}
GUION = [
    ('hook', ['De cada 100 traders que pagan un challenge, solo 7 llegan a cobrar.']),
    ('uno', ['Son datos de más de 300.000 cuentas: aprueba 1 de cada 7, y cobra menos de la mitad.']),
    ('dos', ['Lo bueno: solo arriesgas la cuota, no tus ahorros.']),
    ('sigueme', ['Sígueme, que aquí está la cuenta que nadie hace.']),
    ('tres', ['Es un juego de ROI: si cada intento cuesta 100 euros, cada cuenta aprobada te sale por 700.']),
    ('giro', ['La regla: apunta lo que has pagado en challenges y lo que has cobrado. Ese es tu ROI real.']),
    ('cierre', ['Comenta cuántos challenges llevas pagados. Y cuántos has cobrado.']),
]
GESTOS = {
    'hook': '[serious] De cada cien traders que pagan un challenge, [short pause] solo siete llegan a cobrar.',
    'uno': 'Son datos de más de trescientas mil cuentas: aprueba uno de cada siete, [short pause] y cobra menos de la mitad.',
    'dos': '[warmly] Lo bueno: solo arriesgas la cuota, no tus ahorros.',
    'sigueme': '[warmly] Sígueme, que aquí está la cuenta que nadie hace.',
    'tres': '[serious] Es un juego de ROI: si cada intento cuesta cien euros, cada cuenta aprobada te sale por setecientos.',
    'giro': 'La regla: apunta lo que has pagado en challenges y lo que has cobrado. [short pause] Ese es tu ROI real.',
    'cierre': '[warmly] Comenta cuántos challenges llevas pagados. [short pause] Y cuántos has cobrado.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: 100 puntos que ya se están apagando en rojo hasta quedar 7 en verde; contador 100 → 7'),
    ('uno', "", 'embudo limpio: 100 PAGAN → 14 APRUEBAN → 7 COBRAN; fuente pequeña «FPFX Tech · 2024 · +300.000 cuentas»'),
    ('dos', "", 'escudo verde: lo máximo que pierdes = la cuota (tus ahorros intactos)'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('tres', "", 'siete tickets de 100 € que se apilan, 6 rojos y 1 verde: = 700 € por cuenta aprobada'),
    ('giro', "", 'libreta con dos columnas PAGADO / COBRADO y la resta = ROI'),
    ('cierre', "", 'caja de comentarios con «3 pagados · 0 cobrados»… (sin promo del bot: el bot opera capital real)'),
]
