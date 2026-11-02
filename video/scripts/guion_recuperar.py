"""Reel de alcance (~40 s): cuánto se tarda en recuperar una mala semana.
−20 % necesita +25 % (al 2 % mensual: 11,3 meses); −30 % necesita +42,9 % (18 meses)."""

TITULO = "¿Cuánto tardas en recuperar una mala semana?"
GUION = [
    ("hook", ["¿Cuánto tardas en recuperar una mala semana?", "Te va a doler."]),
    ("cuenta", ["Pierdes un 20%.", "Para volver a donde estabas no necesitas un 20%: necesitas un 25%."]),
    ("pregunta", ["Antes de seguir, dime: ¿cuál ha sido tu peor racha?", "Te leo en comentarios."]),
    ("tiempo", ["Si ganas un 2% al mes, que ya es muy bueno, tardas más de 11 meses en recuperarlo.", "Si pierdes un 30%, necesitas un 43%: año y medio."]),
    ("giro", ["Una semana mala te puede costar un año entero.", "Por eso lo primero no es ganar más. Es perder menos."]),
    ("cta", ["Sígueme para más cuentas que nadie te hace."]),
]

GESTOS = {
    "hook": "[curious] ¿Cuánto tardas en recuperar una mala semana? [short pause] Te va a doler.",
    "cuenta": "Pierdes un 20%. Para volver a donde estabas no necesitas un 20%: necesitas un 25%.",
    "pregunta": "[curious] Antes de seguir, dime: ¿cuál ha sido tu peor racha? Te leo en comentarios.",
    "tiempo": "[inhales] Si ganas un 2% al mes, que ya es muy bueno, tardas más de 11 meses en recuperarlo. [short pause] Si pierdes un 30%, necesitas un 43%: año y medio.",
    "giro": "[serious] Una semana mala te puede costar un año entero. [exhales] Por eso lo primero no es ganar más. Es perder menos.",
    "cta": "[warmly] Sígueme para más cuentas que nadie te hace.",
}

PANTALLAS = [
    ("hook", "¿cuánto *tardas*?", "−20 % gigante y una curva que se desploma"),
    ("cuenta", "no un 20 %: un *25 %*", "el bloque baja a 800; un +20 % se queda corto, hace falta un +25 %"),
    ("pregunta", "¿tu peor *racha*?", "bocadillo de comentario escribiendo"),
    ("tiempo", "*11 meses* / *18 meses*", "dos curvas al 2 % mensual hasta la línea de donde estabas"),
    ("giro", "perder *menos*", "una semana frente a las 52 de un año"),
    ("cta", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
]
