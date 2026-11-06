"""Reel de alcance (~40 s): una moneda también acierta el 60 %.
P(≥ 12 caras en 20) = 0,252; P(≥ 120 caras en 200) ≈ 0,003."""

TITULO = "¿Tu estrategia acierta el 60 %? Una moneda también"
GUION = [
    ("hook", ["¿Tu estrategia acierta el 60%?", "Una moneda también."]),
    ("pregunta", ["Antes de seguir, dime: ¿cuántas operaciones llevas con tu estrategia?", "Te leo en comentarios."]),
    ("veinte", ["Lanza una moneda 20 veces.", "1 de cada 4 veces, sale cara 12 veces o más.", "Un 60%. Sin estrategia ninguna.",
                "Con 20 operaciones, tu estrategia no ha demostrado nada."]),
    ("doscientas", ["Ahora lánzala 200 veces.", "Que salga cara el 60% pasa 3 veces de cada mil."]),
    ("giro", ["Por eso no se cambia de estrategia tras una mala semana, ni se mete todo tras una buena.", "Primero, 200 operaciones. Luego hablamos."]),
    ("cta", ["Sígueme para más cuentas que nadie te hace."]),
]

GESTOS = {
    "hook": "[curious] ¿Tu estrategia acierta el 60%? [short pause] Una moneda también.",
    "pregunta": "Antes de seguir, dime: ¿cuántas operaciones llevas con tu estrategia? Te leo en comentarios.",
    "veinte": "[inhales] Lanza una moneda 20 veces. 1 de cada 4 veces, sale cara 12 veces o más. Un 60%. Sin estrategia ninguna. Con 20 operaciones, tu estrategia no ha demostrado nada.",
    "doscientas": "[serious] Ahora lánzala 200 veces. Que salga cara el 60% pasa 3 veces de cada mil.",
    "giro": "[exhales] Por eso no se cambia de estrategia tras una mala semana, ni se mete todo tras una buena. Primero, 200 operaciones. Luego hablamos.",
    "cta": "[warmly] Sígueme para más cuentas que nadie te hace.",
}

PANTALLAS = [
    ("hook", "¿aciertas el *60 %*?", "moneda de alambre girando"),
    ("pregunta", "¿cuántas *llevas*?", "bocadillo de comentario escribiendo"),
    ("veinte", "*1 de cada 4*", "cuatro tandas de 20 tiradas; una saca 12 caras"),
    ("doscientas", "*3* de cada *mil*", "200 tiradas que se quedan cerca del 50 %"),
    ("giro", "primero, *200*", "barra de operaciones de 0 a 200"),
    ("cta", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
]
