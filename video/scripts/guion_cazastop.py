"""Reel de alcance (~22 s): por qué tu stop salta justo antes de que el precio se dé la vuelta. Gancho, contexto y CTA."""

TITULO = "Por qué tu stop salta justo antes de que el precio gire"
GUION = [
    ("hook", ["¿Tu stop salta siempre justo antes de que el precio se dé la vuelta?"]),
    ("contexto", ["No es mala suerte.", "Lo pones donde lo pone todo el mundo: justo debajo del último mínimo.",
                  "Ahí se acumulan muchísimas órdenes, y es normal que el precio pase por ahí antes de girar."]),
    ("regla", ["Solución: deja margen por debajo del mínimo, y ajusta el tamaño para arriesgar lo mismo."]),
    ("cta", ["Sígueme para más trucos de gestión del riesgo."]),
]

GESTOS = {
    "hook": "[inhales] ¿Tu stop salta siempre... justo antes de que el precio se dé la vuelta?",
    "contexto": "[short pause] No es mala suerte. Lo pones donde lo pone todo el mundo: justo debajo del último mínimo. [exhales] Ahí se acumulan muchísimas órdenes, y es normal que el precio pase por ahí antes de girar.",
    "regla": "Solución: deja margen por debajo del mínimo... y ajusta el tamaño para arriesgar lo mismo.",
    "cta": "[warmly] Sígueme para más trucos de gestión del riesgo.",
}

PANTALLAS = [
    ("hook", "¿te *cazan* el stop?", "el precio baja, toca el stop justo por debajo del mínimo (✕) y se dispara hacia arriba sin ti"),
    ("contexto", "donde lo pone *todo el mundo*", "decenas de stops apilados bajo el mismo mínimo; la mecha baja a por ellos y gira"),
    ("regla", "deja *margen*", "stop más abajo con margen; la posición encoge para que el riesgo siga siendo −1 %"),
    ("cta", "*sígueme*", "botón Seguir que se pulsa; debajo, «cuenta auditada del bot en la bio»"),
]
