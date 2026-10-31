"""Reel de alcance (~16 s): aciertas 9 de cada 10 operaciones y pierdes dinero."""

TITULO = "Aciertas 9 de cada 10 operaciones y pierdes dinero"
GUION = [
    ("hook", ["Aciertas 9 de cada 10 operaciones, y pierdes dinero."]),
    ("cuenta", ["Ganas 10 euros nueve veces: 90.", "Pierdes 100 una vez.", "Total: menos 10."]),
    ("giro", ["Da igual cuánto aciertes, si una sola pérdida se come todo lo demás."]),
    ("cta", ["Sígueme para más cuentas que nadie te hace."]),
]

GESTOS = {
    "hook": "[inhales] Aciertas 9 de cada 10 operaciones... [short pause] y pierdes dinero.",
    "cuenta": "Ganas 10 euros nueve veces: 90. [short pause] Pierdes 100 una vez. [short pause] Total: menos 10.",
    "giro": "[exhales] Da igual cuánto aciertes, si una sola pérdida se come todo lo demás.",
    "cta": "[warmly] Sígueme para más cuentas que nadie te hace.",
}

PANTALLAS = [
    ("hook", "*9 de 10* ✓", "nueve ✓ y una ✕ gigantes desde el primer fotograma; el saldo en rojo"),
    ("cuenta", "+90 −100 = *−10*", "nueve bloques verdes de +10 y uno rojo de −100 que los aplasta"),
    ("giro", "una sola *pérdida*", "el bloque rojo se come los verdes uno a uno"),
    ("cta", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
]
