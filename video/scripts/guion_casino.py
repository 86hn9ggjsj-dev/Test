"""Reel de alcance (~39 s): por qué el casino nunca pierde.
Ruleta europea: 37 casillas; al rojo se gana 18 de 37; ventaja de la casa 1/37 = 2,7 % (2,70 € de cada 100 € apostados)."""

TITULO = "¿Por qué el casino nunca pierde?"
GUION = [
    ("hook", ["¿Por qué el casino nunca pierde?", "No es suerte."]),
    ("ruleta", ["En la ruleta hay 37 casillas.", "Si apuestas al rojo, ganas 18 veces de cada 37.", "El casino solo tiene un 2,7% de ventaja."]),
    ("sigueme", ["Si te está sirviendo, sígueme para más cuentas que nadie te hace."]),
    ("giro", ["El casino pierde muchísimas jugadas. Le da igual: de cada 100 euros apostados, se queda 2,70.", "Millones de veces.",
              "Y limita las apuestas para que nadie le haga daño con una sola."]),
    ("leccion", ["Ventaja pequeña, muchas veces, apuesta controlada. Eso es operar bien."]),
    ("pregunta", ["Y dime en comentarios: ¿tú eres el casino o el jugador? Te leo."]),
]

GESTOS = {
    "hook": "[curious] ¿Por qué el casino nunca pierde? [short pause] No es suerte.",
    "ruleta": "En la ruleta hay 37 casillas. Si apuestas al rojo, ganas 18 veces de cada 37. El casino solo tiene un 2,7% de ventaja.",
    "sigueme": "[warmly] Si te está sirviendo, sígueme para más cuentas que nadie te hace.",
    "giro": "[inhales] El casino pierde muchísimas jugadas. Le da igual: de cada 100 euros apostados, se queda 2,70. Millones de veces. [short pause] Y limita las apuestas para que nadie le haga daño con una sola.",
    "leccion": "[serious] Ventaja pequeña, muchas veces, apuesta controlada. Eso es operar bien.",
    "pregunta": "[curious] Y dime en comentarios: ¿tú eres el casino o el jugador? Te leo.",
}

PANTALLAS = [
    ("hook", "¿por qué *nunca* pierde?", "ruleta de alambre girando con la bola"),
    ("ruleta", "ventaja: *2,7 %*", "37 casillas: 18 rojas, 18 negras y el cero, que es la ventaja"),
    ("sigueme", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
    ("giro", "se queda *2,70 €*", "el saldo del casino: muchas caídas, pero sube; tope de apuesta"),
    ("leccion", "eso es *operar*", "ventaja pequeña · muchas veces · apuesta controlada"),
    ("pregunta", "¿casino o *jugador*?", "bocadillo de comentario escribiendo"),
]
