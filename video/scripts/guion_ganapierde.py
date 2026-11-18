"""Reel de alcance (~16 s): ganas un 50 % y pierdes un 50 %. Mismo patrón que «Pierdes un 50 %»: pregunta que casi
todos responden mal, cuenta sencilla, giro y CTA."""

TITULO = "Ganas un 50 % y pierdes un 50 %: ¿estás igual?"
GUION = [
    ("hook", ["Ganas un 50%.", "Luego pierdes un 50%.", "¿Estás igual?"]),
    ("giro", ["No.", "Has perdido un 25%."]),
    ("cuenta", ["100 euros, más un 50%: 150.", "Menos un 50%: 75."]),
    ("leccion", ["Por eso las caídas pesan más que las subidas."]),
    ("cta", ["Sígueme para más cuentas que nadie te hace."]),
]

GESTOS = {
    "hook": "[inhales] Ganas un 50%. Luego pierdes un 50%. [short pause] ¿Estás igual?",
    "giro": "[short pause] No. Has perdido un 25%.",
    "cuenta": "100 euros, más un 50%: 150. [short pause] Menos un 50%: 75.",
    "leccion": "[exhales] Por eso las caídas pesan más que las subidas.",
    "cta": "[warmly] Sígueme para más cuentas que nadie te hace.",
}

PANTALLAS = [
    ("hook", "+50 % −50 % = *¿0?*", "«+50 %» y «−50 %» gigantes en el centro desde el primer fotograma, con un «= ¿0 %?»"),
    ("giro", "*−25 %*", "el «0 %» se tacha y cae a «−25 %»"),
    ("cuenta", "100 → 150 → *75*", "una barra que sube a 150 y baja a 75, por debajo de la línea de 100"),
    ("leccion", "las caídas *pesan más*", "balanza: la caída pesa más que la subida del mismo tamaño"),
    ("cta", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
]
