"""Reel de alcance (~25 s): la fórmula del tamaño de la posición. Gancho, contexto y CTA."""

TITULO = "La fórmula para saber cuántas acciones comprar"
GUION = [
    ("hook", ["Si no sabes cuántas acciones comprar, apunta esta fórmula."]),
    ("riesgo", ["Primero, cuánto quieres arriesgar: un 1% de 1.000 euros son 10 euros."]),
    ("distancia", ["Después, a qué distancia está tu stop: por ejemplo, 50 céntimos."]),
    ("formula", ["Divides: 10 entre 0,50.", "20 acciones."]),
    ("resultado", ["Así, si salta el stop, pierdes 10 euros.", "Ni uno más."]),
    ("cta", ["Guárdalo, y sígueme para más fórmulas como esta."]),
]

GESTOS = {
    "hook": "[inhales] Si no sabes cuántas acciones comprar... apunta esta fórmula.",
    "riesgo": "Primero, cuánto quieres arriesgar: un 1% de 1.000 euros son 10 euros.",
    "distancia": "[short pause] Después, a qué distancia está tu stop: por ejemplo, 50 céntimos.",
    "formula": "[short pause] Divides: 10 entre 0,50... 20 acciones.",
    "resultado": "[exhales] Así, si salta el stop, pierdes 10 euros. Ni uno más.",
    "cta": "[warmly] Guárdalo, y sígueme para más fórmulas como esta.",
}

PANTALLAS = [
    ("hook", "¿cuántas *acciones*?", "la fórmula gigante en el centro desde el primer fotograma: TAMAÑO = RIESGO ÷ DISTANCIA AL STOP"),
    ("riesgo", "riesgo: *10 €*", "1.000 € → 1 % → 10 € (la casilla RIESGO de la fórmula se rellena)"),
    ("distancia", "distancia: *0,50 €*", "gráfico con entrada y stop; la distancia entre ambos se mide: 0,50 €"),
    ("formula", "*20* acciones", "10 ÷ 0,50 = 20 se resuelve en la fórmula; 20 casillas de acciones"),
    ("resultado", "ni un euro *más*", "el precio toca el stop: −20 × 0,50 = −10 €"),
    ("cta", "*guárdalo*", "botón Guardar y botón Seguir que se pulsan; «cuenta auditada del bot en la bio»"),
]
