"""Reel de alcance (~39 s): el stop loss no siempre protege (el franco suizo, jueves 15-1-2015).
El BNS retira el suelo de 1,20 a las 10:30; el EUR/CHF cae hasta cerca de 0,85 (≈ −29 %) en minutos. FXCM: ~2.800 cuentas en
negativo y un préstamo de rescate de 300 millones de dólares; Alpari UK entra en insolvencia."""

TITULO = "Tu stop loss no siempre te protege"
GUION = [
    ("hook", ["Tu stop loss no siempre te protege.", "Y un jueves de 2015 lo demostró."]),
    ("anuncio", ["El banco central suizo anuncia, sin avisar, que deja de frenar al franco.", "El euro-franco cae casi un 30% en minutos."]),
    ("sigueme", ["Sígueme, que lo que viene ahora casi nadie lo sabe."]),
    ("stops", ["Los stops no saltaron donde estaban puestos.", "Saltaron muchísimo más abajo, porque el precio bajó de golpe."]),
    ("quiebra", ["Miles de cuentas acabaron en negativo.", "Un bróker grande necesitó un rescate de 300 millones de dólares.", "Otro quebró."]),
    ("leccion", ["Un stop no es un precio garantizado: es una orden que se ejecuta al siguiente precio que haya."]),
    ("pregunta", ["¿Alguna vez te ha saltado un stop mucho más lejos de donde lo pusiste?"]),
]

GESTOS = {
    "hook": "[serious] Tu stop loss no siempre te protege. [short pause] Y un jueves de 2015 lo demostró.",
    "anuncio": "El banco central suizo anuncia, sin avisar, que deja de frenar al franco. El euro-franco cae casi un 30% en minutos.",
    "sigueme": "[warmly] Sígueme, que lo que viene ahora casi nadie lo sabe.",
    "stops": "[inhales] Los stops no saltaron donde estaban puestos. Saltaron muchísimo más abajo, porque el precio bajó de golpe.",
    "quiebra": "[short pause] Miles de cuentas acabaron en negativo. Un bróker grande necesitó un rescate de 300 millones de dólares. Otro quebró.",
    "leccion": "[serious] Un stop no es un precio garantizado: es una orden que se ejecuta al siguiente precio que haya.",
    "pregunta": "[curious] ¿Alguna vez te ha saltado un stop mucho más lejos de donde lo pusiste?",
}

PANTALLAS = [
    ("hook", "tu stop *no siempre*", "un escudo de alambre con «STOP LOSS» que se agrieta y se rompe"),
    ("anuncio", "*−30 %* en minutos", "el euro-franco pegado a 1,20 y la caída vertical a las 10:30"),
    ("sigueme", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
    ("stops", "saltan *más abajo*", "el stop puesto en 1,19 y la ejecución muy por debajo, tras el hueco"),
    ("quiebra", "*300 M$* de rescate", "cuentas que se ponen en negativo; un bróker apuntalado y otro que se derrumba"),
    ("leccion", "el *siguiente* precio", "escalera de precios con peldaños que faltan: el stop baja hasta el siguiente"),
    ("pregunta", "¿más *lejos*?", "bocadillo de comentario escribiendo"),
]
