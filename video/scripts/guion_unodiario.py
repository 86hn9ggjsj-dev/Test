"""Reel de alcance (~18 s): ganar un 1 % al día parece poco. Interés compuesto que desmonta las promesas de «1 % diario»."""

TITULO = "¿Ganar un 1 % al día? Parece poco"
GUION = [
    ("hook", ["¿Ganar un 1% al día?", "Parece poco."]),
    ("cuenta", ["Con 1.000 euros, en un año tendrías casi 38.000.", "En dos años, casi un millón y medio."]),
    ("giro", ["Nadie lo consigue.", "Ni los mejores fondos del mundo."]),
    ("leccion", ["Así que si alguien te promete un 1% diario, ya sabes lo que es."]),
    ("cta", ["Sígueme para más cuentas que nadie te hace."]),
]

GESTOS = {
    "hook": "[inhales] ¿Ganar un 1% al día? [short pause] Parece poco.",
    "cuenta": "Con 1.000 euros, en un año tendrías casi 38.000. [short pause] En dos años... casi un millón y medio.",
    "giro": "[exhales] Nadie lo consigue. Ni los mejores fondos del mundo.",
    "leccion": "Así que si alguien te promete un 1% diario... ya sabes lo que es.",
    "cta": "[warmly] Sígueme para más cuentas que nadie te hace.",
}

PANTALLAS = [
    ("hook", "*+1 %* al día", "«+1 %» gigante en el centro desde el primer fotograma, con «AL DÍA» debajo"),
    ("cuenta", "1.000 € → *1.400.000 €*", "un contador que se dispara mientras la curva del interés compuesto se pone vertical"),
    ("giro", "*nadie*", "la curva se tacha; «NI LOS MEJORES FONDOS»"),
    ("leccion", "1 % diario = *🚩*", "«1 % DIARIO» con un sello de alerta"),
    ("cta", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
]
