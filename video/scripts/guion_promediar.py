"""Reel de alcance (~36 s): promediar a la baja.
1 unidad a 100 y otra a 80 → precio medio 90; de 80 a 90 hay un 12,5 % (a 100, un 25 %). Si cae a 50: −50 € con una unidad, −80 € con dos."""

TITULO = "¿Compras más cuando el precio baja para promediar?"
GUION = [
    ("hook", ["¿Compras más cuando el precio baja, para promediar?", "Mira la cuenta."]),
    ("cuenta", ["Compras a 100. Cae a 80. Vuelves a comprar.", "Tu precio medio ahora es 90."]),
    ("magia", ["Con que suba a 90 ya no pierdes.", "Un 12,5% en vez de un 25.", "Parece magia."]),
    ("caida", ["Pero si sigue cayendo hasta 50, ya no pierdes 50 euros.", "Pierdes 80."]),
    ("giro", ["Promediar no reduce tu riesgo. Lo duplica.", "Has convertido una mala operación en una peor.", "Decide cuánto vas a meter antes de entrar, no después de perder."]),
    ("cta", ["Sígueme para más cuentas que nadie te hace."]),
]

GESTOS = {
    "hook": "[curious] ¿Compras más cuando el precio baja, para promediar? [short pause] Mira la cuenta.",
    "cuenta": "Compras a 100. Cae a 80. Vuelves a comprar. Tu precio medio ahora es 90.",
    "magia": "[inhales] Con que suba a 90 ya no pierdes. Un 12,5% en vez de un 25. Parece magia.",
    "caida": "[serious] Pero si sigue cayendo hasta 50, ya no pierdes 50 euros. Pierdes 80.",
    "giro": "[exhales] Promediar no reduce tu riesgo. Lo duplica. Has convertido una mala operación en una peor. Decide cuánto vas a meter antes de entrar, no después de perder.",
    "cta": "[warmly] Sígueme para más cuentas que nadie te hace.",
}

PANTALLAS = [
    ("hook", "¿compras más si *baja*?", "precio que cae con un cubo de compra al final"),
    ("cuenta", "precio medio *90*", "dos compras (100 y 80) y la línea del precio medio"),
    ("magia", "*+12,5 %* en vez de *+25 %*", "el precio rebota hasta 90 y la cuenta queda a cero"),
    ("caida", "pierdes *80 €*", "el precio sigue hasta 50; −50 € tachado y −80 € de golpe"),
    ("giro", "riesgo *×2*", "un cubo contra dos cubos; «decide antes de entrar»"),
    ("cta", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
]
