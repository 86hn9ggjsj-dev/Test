"""Reel de alcance (~38 s): cuánto dinero hace falta para vivir del trading.
2.000 €/mes = 24.000 €/año; al 20 % anual hace falta una cuenta de 120.000 €; con 10.000 €, un 240 % al año."""

TITULO = "¿Cuánto dinero necesitas para vivir del trading?"
GUION = [
    ("hook", ["¿Cuánto dinero necesitas para vivir del trading?", "Hagamos la cuenta."]),
    ("sueldo", ["Quieres sacar 2.000 euros al mes.", "Son 24.000 al año."]),
    ("pregunta", ["Antes de seguir, dime: ¿con cuánto empezaste tú?", "Te leo en comentarios."]),
    ("cuenta", ["Un 20% al año ya sería un resultado excelente: muchos fondos profesionales no lo consiguen.", "Con un 20%, necesitas una cuenta de 120.000 euros."]),
    ("giro", ["¿Con 10.000? Tendrías que ganar un 240% al año.", "Todos los años."]),
    ("cierre", ["Por eso tantas cuentas pequeñas se queman: intentan sacar un sueldo arriesgando de más."]),
    ("cta", ["Sígueme para más cuentas que nadie te hace."]),
]

GESTOS = {
    "hook": "[curious] ¿Cuánto dinero necesitas para vivir del trading? [short pause] Hagamos la cuenta.",
    "sueldo": "Quieres sacar 2.000 euros al mes. Son 24.000 al año.",
    "pregunta": "[curious] Antes de seguir, dime: ¿con cuánto empezaste tú? Te leo en comentarios.",
    "cuenta": "[inhales] Un 20% al año ya sería un resultado excelente: muchos fondos profesionales no lo consiguen. Con un 20%, necesitas una cuenta de 120.000 euros.",
    "giro": "[serious] ¿Con 10.000? Tendrías que ganar un 240% al año. Todos los años.",
    "cierre": "[exhales] Por eso tantas cuentas pequeñas se queman: intentan sacar un sueldo arriesgando de más.",
    "cta": "[warmly] Sígueme para más cuentas que nadie te hace.",
}

PANTALLAS = [
    ("hook", "¿cuánto para *vivir*?", "fajo de billetes de alambre girando"),
    ("sueldo", "*24.000 €* al año", "doce bloques de 2.000 € en fila"),
    ("pregunta", "¿con cuánto *empezaste*?", "bocadillo de comentario escribiendo"),
    ("cuenta", "*120.000 €*", "un 20 % excelente; el bloque de cuenta que hace falta con su loncha de 24.000 €"),
    ("giro", "un *240 %*", "10.000 € frente a los 24.000 € que tendría que sacar"),
    ("cierre", "se *queman*", "el bloque pequeño se rompe en trozos"),
    ("cta", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
]
