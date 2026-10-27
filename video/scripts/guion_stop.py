"""Consejo de trading: deja de mover el stop."""

TITULO = "Deja de mover el stop"
GUION = [
    ("hook", ["Si alguna vez has movido el stop para darle aire, esto es para ti."]),
    ("situacion", ["El precio va hacia tu stop.", "Piensas: ya se dará la vuelta.", "Y lo alejas un poco."]),
    ("consecuencia", ["Una pérdida pequeña y controlada se convierte en una grande.", "Y la siguiente vez, lo vuelves a hacer."]),
    ("cerebro", ["No es un fallo de análisis.", "Es tu cerebro: perder duele el doble de lo que alegra ganar."]),
    ("regla", ["Regla: el stop se pone antes de entrar, y solo se mueve a favor.", "Nunca en contra."]),
    ("cta", ["Mi bot no puede hacer trampas con el stop.", "Tienes su cuenta auditada en la bio.", "Sígueme."]),
]

GESTOS = {
    "hook": "[inhales] Si alguna vez has movido el stop para darle aire... esto es para ti.",
    "situacion": "El precio va hacia tu stop. [short pause] Piensas: ya se dará la vuelta. Y lo alejas un poco.",
    "consecuencia": "[exhales] Una pérdida pequeña y controlada se convierte en una grande. Y la siguiente vez... lo vuelves a hacer.",
    "cerebro": "No es un fallo de análisis. [short pause] Es tu cerebro: perder duele el doble de lo que alegra ganar.",
    "regla": "Regla: el stop se pone antes de entrar, y solo se mueve a favor. [short pause] Nunca en contra.",
    "cta": "[warmly] Mi bot no puede hacer trampas con el stop. Tienes su cuenta auditada en la bio. Sígueme.",
}

PANTALLAS = [
    ("hook", "darle *aire*", "una línea de stop que alguien arrastra hacia abajo con el cursor"),
    ("situacion", "ya se dará la *vuelta*", "el precio baja hacia el stop; el stop se aleja; el precio sigue"),
    ("consecuencia", "pequeña → *grande*", "la zona de pérdida rayada que se estira −1 % → −4 %"),
    ("cerebro", "duele el *doble*", "balanza: la pérdida pesa el doble que una ganancia igual"),
    ("regla", "solo a *favor*", "stop fijo antes de entrar; flecha que solo sube; ✕ hacia abajo"),
    ("cta", "cuenta *auditada*", "ficha de promo: cuenta auditada en la bio, Seguir y Mensaje"),
]
