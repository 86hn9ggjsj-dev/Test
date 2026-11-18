"""Reel de alcance (~40 s): con una estrategia que gana el 55 %, vas a ver 8 pérdidas seguidas.
Mediana de la peor racha en 1.000 operaciones con p = 0,55: 8 (P(racha >= 8) = 0,6); 0,9^8 = 0,43; 0,99^8 = 0,92."""

TITULO = "Tu estrategia gana y aun así vas a perder 8 veces seguidas"
GUION = [
    ("hook", ["Tu estrategia gana dinero.", "Y aun así vas a perder 8 veces seguidas.", "No es mala suerte. Son matemáticas."]),
    ("respuesta", ["Si aciertas el 55%, fallas el 45.", "Y en mil operaciones, lo normal es que en algún momento encadenes 8 pérdidas.",
                   "Justo ahí es donde mucha gente abandona una estrategia que funcionaba."]),
    ("giro", ["La racha no la puedes evitar. Lo que eliges es cuánto te cuesta.", "Arriesgando un 10% por operación, tras 8 pérdidas te queda el 43% de la cuenta.",
              "Arriesgando un 1%, te queda el 92."]),
    ("cierre", ["Misma estrategia. Misma racha. Una cuenta hundida y otra que ni se entera."]),
    ("cta", ["Sígueme para más cuentas que nadie te hace."]),
]

GESTOS = {
    "hook": "[serious] Tu estrategia gana dinero. [short pause] Y aun así vas a perder 8 veces seguidas. No es mala suerte. Son matemáticas.",
    "respuesta": "[inhales] Si aciertas el 55%, fallas el 45. Y en mil operaciones, lo normal es que en algún momento encadenes 8 pérdidas. [short pause] Justo ahí es donde mucha gente abandona una estrategia que funcionaba.",
    "giro": "La racha no la puedes evitar. Lo que eliges es cuánto te cuesta. Arriesgando un 10% por operación, tras 8 pérdidas te queda el 43% de la cuenta. [short pause] Arriesgando un 1%, te queda el 92.",
    "cierre": "[exhales] Misma estrategia. Misma racha. Una cuenta hundida y otra que ni se entera.",
    "cta": "[warmly] Sígueme para más cuentas que nadie te hace.",
}

PANTALLAS = [
    ("hook", "*8* seguidas", "cinta de operaciones ✓ / ✕ pasando sin parar; el 8 cae de golpe"),
    ("respuesta", "en *mil* operaciones", "la cinta se acelera hasta 1.000 y frena en seco en 8 ✕ seguidas"),
    ("giro", "un *10 %* / un *1 %*", "dos cuentas encajan la misma racha: una baja al 43 %, la otra al 92 %"),
    ("cierre", "una *hundida*, otra *intacta*", "la cuenta del 10 % se hunde; la del 1 % sigue en pie"),
    ("cta", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
]
