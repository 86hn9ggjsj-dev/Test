"""Reel de alcance (~40 s): doblar la apuesta después de perder (martingala).
10 + 20 + … + 1.280 = 2.550 € perdidos tras 8 pérdidas; la novena es de 2.560 € para ganar 10 €; si se pierde, −5.110 €.
Con un 55 % de aciertos, P(racha de 8 o más pérdidas en 1.000 operaciones) ≈ 0,6."""

TITULO = "¿Doblas la apuesta después de perder?"
GUION = [
    ("hook", ["¿Doblas la apuesta después de perder, para recuperar?", "Mira la cuenta."]),
    ("escalera", ["Empiezas con 10 euros.", "Pierdes: pones 20. Pierdes: 40. Luego 80, 160, 320..."]),
    ("pregunta", ["Antes de seguir, sé sincero: ¿te ha pasado alguna vez?", "Dímelo en comentarios."]),
    ("cuenta", ["Tras 8 pérdidas seguidas, ya has perdido 2.550 euros.", "Y la siguiente operación es de 2.560.", "¿Para qué? Para ganar 10 euros."]),
    ("giro", ["Y 8 pérdidas seguidas no es mala suerte: con un 55% de aciertos, en mil operaciones es lo normal."]),
    ("cierre", ["Doblar no recupera nada. Solo hace más grande la pérdida que, tarde o temprano, llega."]),
    ("cta", ["Sígueme para más cuentas que nadie te hace."]),
]

GESTOS = {
    "hook": "[curious] ¿Doblas la apuesta después de perder, para recuperar? [short pause] Mira la cuenta.",
    "escalera": "Empiezas con 10 euros. Pierdes: pones 20. Pierdes: 40. Luego 80, 160, 320...",
    "pregunta": "[curious] Antes de seguir, sé sincero: ¿te ha pasado alguna vez? Dímelo en comentarios.",
    "cuenta": "[inhales] Tras 8 pérdidas seguidas, ya has perdido 2.550 euros. [short pause] Y la siguiente operación es de 2.560. ¿Para qué? Para ganar 10 euros.",
    "giro": "[serious] Y 8 pérdidas seguidas no es mala suerte: con un 55% de aciertos, en mil operaciones es lo normal.",
    "cierre": "[exhales] Doblar no recupera nada. Solo hace más grande la pérdida que, tarde o temprano, llega.",
    "cta": "[warmly] Sígueme para más cuentas que nadie te hace.",
}

PANTALLAS = [
    ("hook", "¿doblas tras *perder*?", "×2 gigante y una escalera de cubos que se duplica"),
    ("escalera", "*10 → 20 → 40…*", "columnas que se duplican: 10, 20, 40, 80, 160, 320"),
    ("pregunta", "¿te ha pasado *alguna vez*?", "bocadillo de comentario escribiendo"),
    ("cuenta", "*2.560 €* para ganar *10 €*", "ocho columnas perdidas y una novena gigante"),
    ("giro", "es lo *normal*", "cinta de operaciones con 8 ✕ seguidas"),
    ("cierre", "agranda la *pérdida*", "la columna gigante se derrumba: −5.110 €"),
    ("cta", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
]
