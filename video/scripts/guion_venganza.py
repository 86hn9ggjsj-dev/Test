"""Reel de alcance (~22 s): operar por venganza después de perder. Gancho, contexto y CTA."""

TITULO = "Operar por venganza: la pérdida que se convierte en tres"
GUION = [
    ("hook", ["Si después de perder entras otra vez para recuperarlo, para."]),
    ("contexto", ["Se llama operar por venganza.", "Entras sin plan, con más tamaño y con rabia.", "Y una pérdida se convierte en tres."]),
    ("regla", ["Regla: dos pérdidas seguidas, y cierras la plataforma hasta mañana."]),
    ("cta", ["Sígueme si quieres dejar de regalarle dinero al mercado."]),
]

GESTOS = {
    "hook": "[inhales] Si después de perder entras otra vez para recuperarlo... [short pause] para.",
    "contexto": "Se llama operar por venganza. [exhales] Entras sin plan, con más tamaño y con rabia. [short pause] Y una pérdida se convierte en tres.",
    "regla": "Regla: dos pérdidas seguidas... y cierras la plataforma hasta mañana.",
    "cta": "[warmly] Sígueme si quieres dejar de regalarle dinero al mercado.",
}

PANTALLAS = [
    ("hook", "*para*", "una pérdida en rojo y el cursor yendo directo a COMPRAR otra vez; STOP gigante"),
    ("contexto", "una pérdida → *tres*", "tres operaciones seguidas, cada una más grande (×1, ×2, ×3), todas en ✕"),
    ("regla", "2 ✕ = *cerrar*", "dos ✕ seguidas y la plataforma se apaga; «hasta mañana»"),
    ("cta", "*sígueme*", "botón Seguir que se pulsa; debajo, «cuenta auditada del bot en la bio»"),
]
