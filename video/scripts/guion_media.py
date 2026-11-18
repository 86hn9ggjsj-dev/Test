"""Reel de alcance (~38 s): una rentabilidad media del 10 % al año que te hace perder dinero."""

TITULO = "Una rentabilidad media del 10 % al año que te hace perder dinero"
GUION = [
    ("hook", ["Esta inversión tiene una rentabilidad media del 10% al año...", "y te ha hecho perder dinero."]),
    ("cuenta", ["Mira. Metes 1.000 euros.", "El primer año sube un 60%: tienes 1.600.", "El segundo cae un 40%: te quedan 960."]),
    ("media", ["Media: más 60, menos 40, entre dos.", "10% al año.", "Y tú, 40 euros menos."]),
    ("giro", ["Porque la media suma porcentajes, pero tu dinero los multiplica.", "Y al multiplicar, las caídas pesan más de lo que parece."]),
    ("pregunta", ["Por eso, cuando alguien te enseñe su rentabilidad media, no le preguntes cuánto gana.", "Pregúntale cuánto ha caído."]),
    ("cta", ["Sígueme para más cuentas que nadie te hace."]),
]

GESTOS = {
    "hook": "[serious] Esta inversión tiene una rentabilidad media del 10% al año... [short pause] y te ha hecho perder dinero.",
    "cuenta": "[inhales] Mira. Metes 1.000 euros. El primer año sube un 60%: tienes 1.600. [short pause] El segundo cae un 40%: te quedan 960.",
    "media": "Media: más 60, menos 40, entre dos. 10% al año. [short pause] Y tú, 40 euros menos.",
    "giro": "[exhales] Porque la media suma porcentajes, pero tu dinero los multiplica. Y al multiplicar, las caídas pesan más de lo que parece.",
    "pregunta": "Por eso, cuando alguien te enseñe su rentabilidad media, no le preguntes cuánto gana. [short pause] Pregúntale cuánto ha caído.",
    "cta": "[warmly] Sígueme para más cuentas que nadie te hace.",
}

PANTALLAS = [
    ("hook", "media *+10 %*", "«+10 %» gigante que se tacha; «−40 €» cae de golpe"),
    ("cuenta", "*+60 %* / *−40 %*", "tres columnas: 1.000, 1.600 y 960; el trozo perdido se cae bajo la línea de 1.000"),
    ("media", "media *+10 %* · tú *−40 €*", "la cuenta (+60 − 40) ÷ 2 escrita en grande frente al −40 € real"),
    ("giro", "las caídas *pesan*", "SUMA tachada frente a MULTIPLICA; balanza que se vence hacia el −40 %"),
    ("pregunta", "¿cuánto ha *caído*?", "curva de una cuenta con su caída máxima marcada"),
    ("cta", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
]
