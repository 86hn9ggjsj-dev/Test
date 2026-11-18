"""Consejo de trading: la regla del 1 % por operación."""

TITULO = "La regla del 1 % que te salva la cuenta"
GUION = [
    ("hook", ["Si arriesgas más de un 1% por operación, una mala racha te puede hundir la cuenta."]),
    ("racha", ["Las rachas de 10 pérdidas seguidas pasan."]),
    ("compara", ["Con un 10% por operación, después de 10 pérdidas te queda un 35%.", "Con un 1%, te queda un 90%."]),
    ("recuperar", ["Y desde un 35%, para volver a donde estabas, necesitas casi triplicar la cuenta."]),
    ("regla", ["Por eso la regla de oro es arriesgar un 1% por operación, 2 como mucho."]),
    ("ojo", ["Ojo: no es meter un 1% de tu dinero.", "Es que, si salta el stop, pierdas un 1%."]),
    ("cta", ["Mi bot arriesga así en cada operación, y tienes su cuenta auditada en la bio.", "Sígueme."]),
]

GESTOS = {
    "hook": "[inhales] Si arriesgas más de un 1% por operación... una mala racha te puede hundir la cuenta.",
    "racha": "Las rachas de 10 pérdidas seguidas pasan.",
    "compara": "Con un 10% por operación, después de 10 pérdidas te queda un 35%. [short pause] Con un 1%, te queda un 90%.",
    "recuperar": "[exhales] Y desde un 35%, para volver a donde estabas... necesitas casi triplicar la cuenta.",
    "regla": "Por eso la regla de oro es arriesgar un 1% por operación, 2 como mucho.",
    "ojo": "[short pause] Ojo: no es meter un 1% de tu dinero. Es que, si salta el stop, pierdas un 1%.",
    "cta": "[warmly] Mi bot arriesga así en cada operación, y tienes su cuenta auditada en la bio. Sígueme.",
}

PANTALLAS = [
    ("hook", "más de un *1 %*", "una cuenta de alambre que se hunde con una racha de pérdidas"),
    ("racha", "*10* seguidas", "diez ✕ que caen una tras otra"),
    ("compara", "*35 %* vs 90 %", "dos curvas a la vez: la del 10 % se desploma, la del 1 % apenas se mueve"),
    ("recuperar", "casi *×3*", "escalera desde el 35 % hasta el 100 % que no se acaba nunca"),
    ("regla", "la regla de *oro*", "1 % grabado en grande; zona 1–2 % marcada en una regla"),
    ("ojo", "no es el *dinero*, es el *stop*", "posición grande con stop cerca = mismo 1 % de riesgo"),
    ("cta", "cuenta *auditada*", "ficha de promo: cuenta auditada en la bio, Seguir y Mensaje"),
]
