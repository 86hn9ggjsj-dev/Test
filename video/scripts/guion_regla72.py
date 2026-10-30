"""Reel de alcance (~20 s): la regla del 72 para saber cuánto tardas en duplicar tu dinero.
72/10 = 7,2 (1,1^7,2 = 1,99); 72/2 = 36 (1,02^36 = 2,04); 72/3 = 24 (1/1,03^24 = 0,49)."""

TITULO = "¿Cuántos años tardas en duplicar tu dinero?"
GUION = [
    ("hook", ["¿Cuántos años tardas en duplicar tu dinero?", "Hay una cuenta de 3 segundos."]),
    ("regla", ["Divide 72 entre lo que ganas al año."]),
    ("ejemplo", ["Al 10%, unos 7 años.", "Al 2% de un depósito, 36."]),
    ("giro", ["Y con una inflación del 3%, tu dinero parado pierde la mitad de su valor en 24 años."]),
    ("cta", ["Guárdalo, y sígueme para más cuentas que nadie te hace."]),
]

GESTOS = {
    "hook": "[inhales] ¿Cuántos años tardas en duplicar tu dinero? [short pause] Hay una cuenta de 3 segundos.",
    "regla": "Divide 72... entre lo que ganas al año.",
    "ejemplo": "Al 10%, unos 7 años. [short pause] Al 2% de un depósito... 36.",
    "giro": "[exhales] Y con una inflación del 3%, tu dinero parado pierde la mitad de su valor en 24 años.",
    "cta": "[warmly] Guárdalo, y sígueme para más cuentas que nadie te hace.",
}

PANTALLAS = [
    ("hook", "¿cuándo *×2*?", "«×2» gigante y un reloj de años girando desde el primer fotograma"),
    ("regla", "*72* ÷ %", "la fórmula 72 ÷ RENTABILIDAD en grande"),
    ("ejemplo", "10 % → *7 años* · 2 % → *36*", "dos barras de tiempo: una corta y otra que no se acaba"),
    ("giro", "inflación 3 % → *−50 %*", "un billete de 100 € que se va desvaneciendo hasta valer 50 € en 24 años"),
    ("cta", "*guárdalo*", "botones Guardar y Seguir que se pulsan; «cuenta auditada del bot en la bio»"),
]
