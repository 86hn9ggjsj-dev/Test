"""Reel de alcance (~33 s): FOMO — ves una vela verde enorme y entras justo arriba del todo.

Concepto: FOMO (miedo a quedarte fuera): ver subir el precio sin estar dentro se siente como perder; se entra tarde y sin
plan. Regla práctica: si el precio se ha ido sin ti, ya no es tu operación.
"""

TITULO = "Ves una vela verde enorme y entras justo arriba del todo"
GUION = [
    ("hook", ["Ves una vela verde enorme...", "y entras justo arriba del todo."]),
    ("uno", ["Se llama FOMO: miedo a quedarte fuera.", "Ves subir el precio sin ti y sientes que pierdes dinero, aunque no hayas perdido nada."]),
    ("dos", ["Así que entras tarde, sin plan, cuando el movimiento ya está hecho."]),
    ("sigueme", ["Sígueme, que te doy la regla para no caer."]),
    ("tres", ["Si el precio se ha ido sin ti, ya no es tu operación.", "Hay otra mañana, y pasado, y la semana que viene."]),
    ("giro", ["El mercado abre todos los días.", "Las oportunidades no se acaban. Tu cuenta, sí."]),
    ("pregunta", ["¿Cuál fue la última vela que perseguiste? Etiqueta al que siempre entra en el máximo."]),
]

GESTOS = {
    "hook": "[excited] Ves una vela verde enorme... [short pause] [serious] y entras justo arriba del todo.",
    "uno": "Se llama FOMO: miedo a quedarte fuera. [short pause] Ves subir el precio sin ti y sientes que pierdes dinero... aunque no hayas perdido nada.",
    "dos": "[inhales] Así que entras tarde, sin plan, cuando el movimiento ya está hecho.",
    "sigueme": "[warmly] Sígueme, que te doy la regla para no caer.",
    "tres": "[serious] Si el precio se ha ido sin ti, ya no es tu operación. [short pause] Hay otra mañana, y pasado, y la semana que viene.",
    "giro": "El mercado abre todos los días. [short pause] Las oportunidades no se acaban. [serious] Tu cuenta, sí.",
    "pregunta": "[curious] ¿Cuál fue la última vela que perseguiste? Etiqueta al que siempre entra en el máximo.",
}

PANTALLAS = [
    ("hook", "", "vela verde 3D gigante creciendo; el stickman corre detrás y salta encima justo en la punta; la vela se da la vuelta"),
    ("uno", "", "el stickman al otro lado de un cristal viendo la vela subir; contador «LO QUE TE ESTÁS PERDIENDO» que sube en rojo, pero su saldo no se mueve"),
    ("dos", "", "el stickman entra en el máximo; la vela retrocede y la entrada queda arriba"),
    ("sigueme", "", "«sígueme» grande, botón Seguir y cuenta auditada"),
    ("tres", "", "trenes que salen de una estación: se va uno, llega otro; el stickman espera en el andén"),
    ("giro", "", "calendario infinito de días de mercado; frente a él, una cuenta que se vacía si persigue cada tren"),
    ("pregunta", "", "vela verde con una diana en la punta y bocadillo de comentarios"),
]
