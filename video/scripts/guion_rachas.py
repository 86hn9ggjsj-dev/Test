"""Reel de alcance (~20 s): con una estrategia que gana el 55 %, ¿cuántas pérdidas seguidas vas a ver?
Mediana de la peor racha en 1.000 operaciones con p = 0,55: 8 (simulado); 0,9^8 = 0,43; 0,99^8 = 0,92."""

TITULO = "Tu estrategia gana el 55 %: ¿cuántas pérdidas seguidas vas a ver?"
GUION = [
    ("hook", ["Tu estrategia gana el 55% de las veces.", "¿Cuántas pérdidas seguidas vas a ver?"]),
    ("respuesta", ["Más de las que crees: en 1.000 operaciones, lo normal es encadenar 8."]),
    ("giro", ["Si arriesgas un 10% en cada una, esa racha te deja con menos de la mitad.", "Con un 1%, pierdes solo un 8%."]),
    ("cta", ["Sígueme para más cuentas que nadie te hace."]),
]

GESTOS = {
    "hook": "[inhales] Tu estrategia gana el 55% de las veces. [short pause] ¿Cuántas pérdidas seguidas vas a ver?",
    "respuesta": "Más de las que crees: en 1.000 operaciones... lo normal es encadenar 8.",
    "giro": "[exhales] Si arriesgas un 10% en cada una, esa racha te deja con menos de la mitad. [short pause] Con un 1%... pierdes solo un 8%.",
    "cta": "[warmly] Sígueme para más cuentas que nadie te hace.",
}

PANTALLAS = [
    ("hook", "gana el *55 %*", "«55 %» gigante y una tira de operaciones ✓/✕ que pasa rápido desde el primer fotograma"),
    ("respuesta", "*8* seguidas", "la tira se para en ocho ✕ seguidas, marcadas con un corchete"),
    ("giro", "10 % → *−57 %* · 1 % → *−8 %*", "dos cuentas a la vez: la del 10 % se hunde por debajo de la mitad, la del 1 % apenas baja"),
    ("cta", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
]
