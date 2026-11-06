"""Reel de alcance (~38 s): cinco operaciones correlacionadas no reparten el riesgo.
Comprar EUR/USD, GBP/USD y AUD/USD es, en los tres casos, vender dólares: si el dólar sube, caen a la vez."""

TITULO = "¿Abres cinco operaciones para repartir el riesgo?"
GUION = [
    ("hook", ["¿Abres cinco operaciones para repartir el riesgo?", "Cuidado."]),
    ("pares", ["Compras euro-dólar, libra-dólar, australiano-dólar... y arriesgas un 1% en cada una."]),
    ("sigueme", ["Si te está sirviendo, sígueme para más cuentas que nadie te hace."]),
    ("dolar", ["Esos pares suelen moverse juntos, porque todos dependen del dólar.", "Si el dólar se dispara, caen todos a la vez."]),
    ("giro", ["No has abierto cinco operaciones del 1%. Es casi como una sola del 5%."]),
    ("leccion", ["Repartir el riesgo no es abrir más operaciones. Es abrir operaciones que no se muevan igual."]),
    ("pregunta", ["Y dime en comentarios: ¿cuántas operaciones tienes abiertas ahora mismo? Te leo."]),
]

GESTOS = {
    "hook": "[curious] ¿Abres cinco operaciones para repartir el riesgo? [short pause] Cuidado.",
    "pares": "Compras euro-dólar, libra-dólar, australiano-dólar... y arriesgas un 1% en cada una.",
    "sigueme": "[warmly] Si te está sirviendo, sígueme para más cuentas que nadie te hace.",
    "dolar": "[inhales] Esos pares suelen moverse juntos, porque todos dependen del dólar. [short pause] Si el dólar se dispara, caen todos a la vez.",
    "giro": "[serious] No has abierto cinco operaciones del 1%. Es casi como una sola del 5%.",
    "leccion": "[exhales] Repartir el riesgo no es abrir más operaciones. Es abrir operaciones que no se muevan igual.",
    "pregunta": "[curious] Y dime en comentarios: ¿cuántas operaciones tienes abiertas ahora mismo? Te leo.",
}

PANTALLAS = [
    ("hook", "¿*5* operaciones?", "cinco cubos de un 1 % separados"),
    ("pares", "*1 %* en cada una", "tres gráficos de euro, libra y australiano contra el dólar, casi calcados"),
    ("sigueme", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
    ("dolar", "caen *a la vez*", "el dólar se dispara y las tres curvas se desploman juntas"),
    ("giro", "una del *5 %*", "los cinco cubos se funden en uno de un 5 %"),
    ("leccion", "que no se muevan *igual*", "curvas calcadas frente a curvas que van cada una a lo suyo"),
    ("pregunta", "¿cuántas tienes *abiertas*?", "bocadillo de comentario escribiendo"),
]
