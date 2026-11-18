"""Guion viral "El genio que perdió una fortuna en bolsa" (Isaac Newton y la burbuja de los Mares del Sur, 1720)."""

TITULO = "El genio que perdió una fortuna en bolsa"
GUION = [
    ("hook", ["Isaac Newton, uno de los mayores genios de la historia, perdió una fortuna en bolsa."]),
    ("compra", ["En 1720 compró acciones de la Compañía de los Mares del Sur.", "Ganó dinero, y vendió."]),
    ("fomo", ["Pero siguieron subiendo, y sus amigos se hacían ricos."]),
    ("cima", ["Así que volvió a entrar.", "Mucho más caro, casi en lo más alto."]),
    ("estalla", ["Meses después, la burbuja estalló, y perdió mucho más de lo que había ganado."]),
    ("frase", ["Dicen que dijo: puedo calcular el movimiento de los astros, pero no la locura de la gente."]),
    ("cta", ["Por eso yo opero con reglas, no con emociones.", "La cuenta auditada de mi bot está en la bio.", "Sígueme."]),
]

GESTOS = {
    "hook": "[inhales] Isaac Newton, uno de los mayores genios de la historia... perdió una fortuna en bolsa.",
    "compra": "En 1720 compró acciones de la Compañía de los Mares del Sur. [short pause] Ganó dinero, y vendió.",
    "fomo": "Pero siguieron subiendo... y sus amigos se hacían ricos.",
    "cima": "[sighs] Así que volvió a entrar. Mucho más caro... casi en lo más alto.",
    "estalla": "[short pause] Meses después, la burbuja estalló, y perdió mucho más de lo que había ganado.",
    "frase": "[softly] Dicen que dijo: puedo calcular el movimiento de los astros... pero no la locura de la gente.",
    "cta": "[warmly] Por eso yo opero con reglas, no con emociones. La cuenta auditada de mi bot está en la bio. Sígueme.",
}

PANTALLAS = [
    ("hook", "el genio que *perdió*", "retrato de alambre de Newton (perfil, peluca) que se rompe en una curva que cae"),
    ("compra", "Mares del *Sur*", "barco de alambre sobre un mapa; precio de la acción en 1720 subiendo; COMPRA → VENDE con beneficio"),
    ("fomo", "sus amigos se hacían *ricos*", "la curva sigue subiendo sin él; Newton fuera del gráfico, mirando"),
    ("cima", "casi en lo más *alto*", "Newton vuelve a entrar justo en el pico; retícula y COMPRA ×3"),
    ("estalla", "la *burbuja*", "una esfera de alambre que se infla y estalla; la curva se desploma"),
    ("frase", "la *locura* de la gente", "órbitas de planetas perfectas frente a un gráfico caótico"),
    ("cta", "reglas, no *emociones*", "ficha de promo: cuenta auditada en la bio, Seguir y Mensaje"),
]
