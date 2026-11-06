"""Reel de alcance (~38 s): la aversión a la pérdida hace que cierres rápido lo que gana y aguantes lo que pierde.
Kahneman y Tversky: las pérdidas pesan unas 2 veces más (λ ≈ 2,25). Odean (1998), 10.000 cuentas: ganancias realizadas 1,5 veces más que pérdidas."""

TITULO = "Tu cerebro juega en tu contra cada vez que operas"
GUION = [
    ("hook", ["Tu cerebro juega en tu contra cada vez que operas.", "Y te lo puedo demostrar."]),
    ("dolor", ["Perder 100 euros duele más o menos el doble de lo que alegra ganarlos.", "Se llama aversión a la pérdida."]),
    ("sigueme", ["Y ahora viene lo bueno.", "Sígueme, que esto no te lo cuenta nadie."]),
    ("conducta", ["Cuando ganas, cierras ya, para asegurar el gusto.", "Cuando pierdes, aguantas, para no sentir el dolor."]),
    ("estudio", ["Un estudio con miles de inversores lo midió: venden lo que gana un 50% más a menudo que lo que pierde."]),
    ("giro", ["Ganancias pequeñas, pérdidas grandes.", "Justo al revés de lo que funciona."]),
    ("pregunta", ["Cuéntame: ¿cuál fue la última operación que cerraste demasiado pronto?"]),
]

GESTOS = {
    "hook": "[serious] Tu cerebro juega en tu contra cada vez que operas. [short pause] Y te lo puedo demostrar.",
    "dolor": "Perder 100 euros duele más o menos el doble de lo que alegra ganarlos. Se llama aversión a la pérdida.",
    "sigueme": "[warmly] Y ahora viene lo bueno. Sígueme, que esto no te lo cuenta nadie.",
    "conducta": "[inhales] Cuando ganas, cierras ya, para asegurar el gusto. Cuando pierdes, aguantas, para no sentir el dolor.",
    "estudio": "[short pause] Un estudio con miles de inversores lo midió: venden lo que gana un 50% más a menudo que lo que pierde.",
    "giro": "[serious] Ganancias pequeñas, pérdidas grandes. Justo al revés de lo que funciona.",
    "pregunta": "[curious] Cuéntame: ¿cuál fue la última operación que cerraste demasiado pronto?",
}

PANTALLAS = [
    ("hook", "tu cerebro *en contra*", "cerebro de alambre que gira con impulsos que lo recorren"),
    ("dolor", "duele *el doble*", "balanza: −100 € pesa el doble que +100 €"),
    ("sigueme", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
    ("conducta", "cierras / *aguantas*", "la operación que gana se corta pronto; la que pierde sigue cayendo"),
    ("estudio", "*+50 %*", "dos columnas: ventas de ganadoras frente a perdedoras (Odean, 1998)"),
    ("giro", "*al revés*", "histograma: muchas ganancias pequeñas y pocas pérdidas grandes que se da la vuelta"),
    ("pregunta", "¿demasiado *pronto*?", "bocadillo de comentario escribiendo"),
]
