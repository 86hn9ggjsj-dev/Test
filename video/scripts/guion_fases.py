"""Reel de alcance (~32 s): las cuatro fases de todo el que empieza en trading (stickman mezclado con gráficos)."""

TITULO = "Las cuatro fases de todo el que empieza en trading"
GUION = [
    ("hook", ["Las cuatro fases de todo el que empieza en trading.", "¿En cuál estás tú?"]),
    ("uno", ["Fase uno: ganas tres operaciones seguidas y te crees un genio."]),
    ("dos", ["Fase dos: pierdes, y el mercado está manipulado."]),
    ("sigueme", ["Sígueme, que la cuatro es la buena."]),
    ("tres", ["Fase tres: doblas el lote para recuperar... y lo pierdes todo."]),
    ("cuatro", ["Fase cuatro: dejas de buscar la operación perfecta y empiezas a controlar cuánto pierdes.", "Los que llegan aquí, se quedan."]),
    ("pregunta", ["Dime en qué fase estás. Y etiqueta a quien sigue en la dos."]),
]

GESTOS = {
    "hook": "[curious] Las cuatro fases de todo el que empieza en trading. [short pause] ¿En cuál estás tú?",
    "uno": "Fase uno: ganas tres operaciones seguidas y te crees un genio.",
    "dos": "Fase dos: pierdes, y el mercado está manipulado.",
    "sigueme": "[warmly] Sígueme, que la cuatro es la buena.",
    "tres": "[inhales] Fase tres: doblas el lote para recuperar... y lo pierdes todo.",
    "cuatro": "[serious] Fase cuatro: dejas de buscar la operación perfecta y empiezas a controlar cuánto pierdes. Los que llegan aquí, se quedan.",
    "pregunta": "[curious] Dime en qué fase estás. Y etiqueta a quien sigue en la dos.",
}

PANTALLAS = [
    ("hook", "las *4 fases*", "el stickman camina por un camino con cuatro hitos"),
    ("uno", "te crees un *genio*", "tres velas ganadoras y el stickman con corona dando saltos"),
    ("dos", "está *manipulado*", "un ojo gigante que lo vigila todo y el sello de «manipulado»"),
    ("sigueme", "*sígueme*", "botón Seguir que se pulsa; el stickman lo señala"),
    ("tres", "lo pierdes *todo*", "bloques que se doblan 1-2-4-8 y se derrumban: 0 €"),
    ("cuatro", "controlas lo que *pierdes*", "el stickman relajado ante una curva que sube con caídas pequeñas"),
    ("pregunta", "¿en qué *fase* estás?", "cuatro fichas numeradas y el bocadillo de comentario"),
]
