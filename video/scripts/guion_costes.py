"""Reel de alcance (~37 s): lo que cuestan 10 operaciones al día.
3 € × 10 × 250 sesiones = 7.500 € al año = 150 % de una cuenta de 5.000 €."""

TITULO = "¿Cuánto te cuesta hacer 10 operaciones al día?"
GUION = [
    ("hook", ["¿Cuánto te cuesta hacer 10 operaciones al día?", "Agárrate."]),
    ("coste", ["Pongamos que entre spread y comisión pagas 3 euros por operación.", "Parece nada."]),
    ("pregunta", ["Antes de seguir, dime: ¿cuántas operaciones haces tú al día?", "Te leo en comentarios."]),
    ("cuenta", ["10 al día son 30 euros.", "Al año, unas 250 sesiones: 7.500 euros."]),
    ("giro", ["Con una cuenta de 5.000, tienes que ganar un 150% al año solo para quedarte igual."]),
    ("cierre", ["No te arruina una mala operación.", "Te arruinan cien operaciones que no hacían falta."]),
    ("cta", ["Sígueme para más cuentas que nadie te hace."]),
]

GESTOS = {
    "hook": "[curious] ¿Cuánto te cuesta hacer 10 operaciones al día? [short pause] Agárrate.",
    "coste": "Pongamos que entre spread y comisión pagas 3 euros por operación. Parece nada.",
    "pregunta": "[curious] Antes de seguir, dime: ¿cuántas operaciones haces tú al día? Te leo en comentarios.",
    "cuenta": "[inhales] 10 al día son 30 euros. Al año, unas 250 sesiones: 7.500 euros.",
    "giro": "[serious] Con una cuenta de 5.000, tienes que ganar un 150% al año solo para quedarte igual.",
    "cierre": "[exhales] No te arruina una mala operación. Te arruinan cien operaciones que no hacían falta.",
    "cta": "[warmly] Sígueme para más cuentas que nadie te hace.",
}

PANTALLAS = [
    ("hook", "¿cuánto te *cuesta*?", "fila de 10 operaciones"),
    ("coste", "*3 €* por operación", "a un cubo se le cae una loncha: −3 €"),
    ("pregunta", "¿cuántas haces *al día*?", "bocadillo de comentario escribiendo"),
    ("cuenta", "*7.500 €* al año", "calendario de 250 sesiones que se llena mientras sube el contador"),
    ("giro", "*+150 %* para empatar", "la cuenta de 5.000 € frente a una columna de costes de 7.500 €"),
    ("cierre", "son *cien*", "una operación mala frente a cien que sobraban"),
    ("cta", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
]
