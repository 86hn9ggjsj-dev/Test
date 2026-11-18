"""Reel de alcance (~38 s): el criterio de Kelly (Edward Thorp lo usó en el blackjack y en su fondo).
f* = p − q/b; con p = 0,55 y b = 1 → 10 %. Crecimiento por operación g(f) = p·ln(1+f) + q·ln(1−f): g(0,1) = +0,50 %,
g(0,2) ≈ 0, g(0,3) = −1,6 %."""

TITULO = "La fórmula del matemático que ganó al blackjack"
GUION = [
    ("hook", ["Un matemático ganó al blackjack con una fórmula.", "Y luego la usó para ganar en Wall Street."]),
    ("kelly", ["Se llamaba Edward Thorp, y la fórmula, criterio de Kelly.", "Te dice cuánto apostar cuando tienes ventaja."]),
    ("sigueme", ["Guárdalo, que esta fórmula te va a hacer falta. Y sígueme."]),
    ("cuenta", ["Si aciertas el 55% de las veces y ganas lo mismo que arriesgas, Kelly dice: un 10% por operación."]),
    ("exceso", ["Con un 20%, ya no creces nada.", "Con un 30%, a la larga te arruinas... aunque ganes más veces de las que pierdes."]),
    ("pros", ["Por eso muchos profesionales apuestan la mitad de lo que dice Kelly."]),
    ("pregunta", ["Sé sincero: ¿tú apuestas de menos... o de más?"]),
]

GESTOS = {
    "hook": "[curious] Un matemático ganó al blackjack con una fórmula. [short pause] Y luego la usó para ganar en Wall Street.",
    "kelly": "Se llamaba Edward Thorp, y la fórmula, criterio de Kelly. Te dice cuánto apostar cuando tienes ventaja.",
    "sigueme": "[warmly] Guárdalo, que esta fórmula te va a hacer falta. Y sígueme.",
    "cuenta": "[inhales] Si aciertas el 55% de las veces y ganas lo mismo que arriesgas, Kelly dice: un 10% por operación.",
    "exceso": "[short pause] Con un 20%, ya no creces nada. Con un 30%, a la larga te arruinas... aunque ganes más veces de las que pierdes.",
    "pros": "[serious] Por eso muchos profesionales apuestan la mitad de lo que dice Kelly.",
    "pregunta": "[curious] Sé sincero: ¿tú apuestas de menos... o de más?",
}

PANTALLAS = [
    ("hook", "ganó al *blackjack*", "cartas de alambre que se reparten y se convierten en velas de bolsa"),
    ("kelly", "criterio de *Kelly*", "la fórmula f = p − q / b que se escribe sola"),
    ("sigueme", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
    ("cuenta", "*10 %*", "0,55 − 0,45 / 1 = 10 %"),
    ("exceso", "*20 %* · *30 %*", "tres curvas de crecimiento: el 10 % sube, el 20 % se queda plano, el 30 % se hunde"),
    ("pros", "*medio* Kelly", "una regla de riesgo con el 5 % marcado"),
    ("pregunta", "¿de menos o *de más*?", "bocadillo de comentario escribiendo"),
]
