"""Consejo de trading: puedes fallar 6 de cada 10 operaciones y ganar dinero (riesgo/beneficio)."""

TITULO = "Puedes fallar 6 de cada 10 operaciones y ganar dinero"
GUION = [
    ("hook", ["Puedes fallar 6 de cada 10 operaciones y aun así ganar dinero."]),
    ("clave", ["La clave es cuánto ganas cuando aciertas, frente a cuánto pierdes cuando fallas."]),
    ("ejemplo", ["Arriesgas 100 euros para ganar 200.", "Fallas 6 veces: menos 600.", "Aciertas 4: más 800."]),
    ("resultado", ["Has fallado más que acertado, y vas 200 euros arriba."]),
    ("error", ["El novato hace lo contrario: corta las ganancias rápido y deja correr las pérdidas."]),
    ("regla", ["Regla: no entres si no puedes ganar al menos el doble de lo que arriesgas."]),
    ("cta", ["Y si no quieres operar a mano, tienes la cuenta auditada de mi bot en la bio.", "Sígueme para más consejos."]),
]

GESTOS = {
    "hook": "[inhales] Puedes fallar 6 de cada 10 operaciones... y aun así ganar dinero.",
    "clave": "La clave es cuánto ganas cuando aciertas, frente a cuánto pierdes cuando fallas.",
    "ejemplo": "Arriesgas 100 euros para ganar 200. [short pause] Fallas 6 veces: menos 600. Aciertas 4: más 800.",
    "resultado": "[short pause] Has fallado más que acertado... y vas 200 euros arriba.",
    "error": "[exhales] El novato hace lo contrario: corta las ganancias rápido y deja correr las pérdidas.",
    "regla": "Regla: no entres si no puedes ganar al menos el doble de lo que arriesgas.",
    "cta": "[warmly] Y si no quieres operar a mano, tienes la cuenta auditada de mi bot en la bio. [short pause] Sígueme para más consejos.",
}

PANTALLAS = [
    ("hook", "fallar *6 de 10*", "diez casillas: seis ✕ y cuatro ✓; un saldo que aun así sube"),
    ("clave", "cuánto ganas vs cuánto *pierdes*", "barra de ganancia el doble de larga que la de pérdida"),
    ("ejemplo", "−600 / *+800*", "seis bloques de −100 caen y cuatro bloques de +200 suben"),
    ("resultado", "*+200* €", "saldo final con retícula: más fallos, más dinero"),
    ("error", "al *revés*", "la misma barra invertida: ganancias cortas, pérdidas largas"),
    ("regla", "mínimo *1:2*", "regla R:R con la entrada, el stop y el objetivo al doble"),
    ("cta", "cuenta *auditada*", "ficha de promo: cuenta auditada en la bio, Seguir y Mensaje"),
]
