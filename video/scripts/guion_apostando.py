"""Reel de alcance (~32 s): test de diez segundos, ¿estás haciendo trading o estás apostando? (stickman mezclado)."""

TITULO = "Test de diez segundos: ¿trading o apuesta?"
GUION = [
    ("hook", ["Test de diez segundos: ¿estás haciendo trading... o estás apostando?", "Responde rápido."]),
    ("una", ["Una: ¿sabes cuánto vas a perder antes de entrar?"]),
    ("dos", ["Dos: ¿operas igual cuando vas ganando que cuando vas perdiendo?"]),
    ("sigueme", ["Sígueme, que la tres es la que pilla a casi todos."]),
    ("tres", ["Y tres: ¿has abierto alguna vez una operación solo porque te aburrías?"]),
    ("giro", ["Si has fallado una, no es trading: es un casino con gráficos bonitos.", "Un trader sabe cuánto puede perder antes de entrar. Un apostador lo descubre después."]),
    ("pregunta", ["¿Cuántas has pasado? Dímelo en comentarios, y pásaselo al que opera cuando se aburre."]),
]

GESTOS = {
    "hook": "[curious] Test de diez segundos: ¿estás haciendo trading... [short pause] o estás apostando? [quickly] Responde rápido.",
    "una": "Una: ¿sabes cuánto vas a perder antes de entrar?",
    "dos": "Dos: ¿operas igual cuando vas ganando que cuando vas perdiendo?",
    "sigueme": "[warmly] Sígueme, que la tres es la que pilla a casi todos.",
    "tres": "[inhales] Y tres: ¿has abierto alguna vez una operación... solo porque te aburrías?",
    "giro": "[serious] Si has fallado una, no es trading: es un casino con gráficos bonitos. [short pause] Un trader sabe cuánto puede perder antes de entrar. Un apostador... lo descubre después.",
    "pregunta": "[curious] ¿Cuántas has pasado? Dímelo en comentarios, y pásaselo al que opera cuando se aburre.",
}

PANTALLAS = [
    ("hook", "¿*trading* o apuesta?", "cronómetro de 10 s y el stickman con dos puertas: gráfico o tragaperras"),
    ("una", "¿sabes cuánto *pierdes*?", "el stickman pulsa COMPRAR sin stop; signo de interrogación sobre el riesgo"),
    ("dos", "¿operas *igual*?", "balanza: ganando opera tranquilo, perdiendo clica sin parar"),
    ("sigueme", "*sígueme*", "botón Seguir que se pulsa; el stickman lo señala"),
    ("tres", "porque te *aburrías*", "el stickman bosteza, tamborilea y abre una operación"),
    ("giro", "un *casino* con gráficos", "el gráfico se convierte en tragaperras; antes / después en rojo"),
    ("pregunta", "¿cuántas has *pasado*?", "fichas 0-1-2-3 y el bocadillo de comentario"),
]
