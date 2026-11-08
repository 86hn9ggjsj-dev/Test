"""Reel de promo del bot (~35 s): «Mi bot pierde dinero. Y no lo escondo» — transparencia de la cuenta auditada.

Afirmaciones sobre el bot (todas ya usadas antes y verdaderas): tiene operaciones y rachas perdedoras como cualquier
sistema real; decide cuánto puede perder antes de entrar (stop y tamaño calculados); su cuenta está auditada por un
tercero y está en el link de la bio. No se dan cifras de rentabilidad.
"""

TITULO = "Mi bot pierde dinero. Y no lo escondo"
GUION = [
    ("hook", ["Mi bot pierde dinero.", "Y no lo escondo."]),
    ("uno", ["Pierde operaciones y tiene rachas malas, como cualquier sistema que opere de verdad."]),
    ("dos", ["Si te enseñan un bot que nunca pierde, te están enseñando la mitad."]),
    ("sigueme", ["Sígueme, que la diferencia viene ahora."]),
    ("tres", ["Cuando pierde, pierde lo que ya había decidido antes de entrar."]),
    ("giro", ["Y su cuenta está auditada por un tercero: se ven todas las operaciones, las buenas y las malas.", "Link en la bio."]),
    ("pregunta", ["¿Te fías más de un bot que enseña sus pérdidas o de uno que nunca pierde? Mándaselo al que solo enseña capturas en verde."]),
]

GESTOS = {
    "hook": "[serious] Mi bot pierde dinero. [short pause] Y no lo escondo.",
    "uno": "Pierde operaciones y tiene rachas malas... [short pause] como cualquier sistema que opere de verdad.",
    "dos": "[curious] Si te enseñan un bot que nunca pierde... te están enseñando la mitad.",
    "sigueme": "[warmly] Sígueme, que la diferencia viene ahora.",
    "tres": "[inhales] Cuando pierde, pierde lo que ya había decidido antes de entrar.",
    "giro": "[serious] Y su cuenta está auditada por un tercero: se ven todas las operaciones, las buenas y las malas. [short pause] [warmly] Link en la bio.",
    "pregunta": "[curious] ¿Te fías más de un bot que enseña sus pérdidas o de uno que nunca pierde? Mándaselo al que solo enseña capturas en verde.",
}

PANTALLAS = [
    ("hook", "", "el robot delante de su pantalla; una vela roja enorme; él no la tapa: la señala"),
    ("uno", "", "historial de operaciones 3D desfilando: verdes y rojas mezcladas, una racha roja resaltada"),
    ("dos", "", "una curva perfecta en un móvil que se rompe y deja ver la otra mitad, la roja, recortada"),
    ("sigueme", "", "«sígueme» grande, botón Seguir y la cuenta auditada; el robot señala"),
    ("tres", "", "antes de entrar se dibuja la línea del stop y el tamaño; la pérdida choca contra esa línea y se para"),
    ("giro", "", "sello AUDITADA POR UN TERCERO sobre el historial completo; flecha ↑ LINK EN LA BIO"),
    ("pregunta", "", "dos botones: «ENSEÑA SUS PÉRDIDAS» frente a «NUNCA PIERDE»"),
]
