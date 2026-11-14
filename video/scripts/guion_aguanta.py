"""Reel de alcance (~40 s): cuántas pérdidas seguidas aguanta tu cuenta antes de perder la mitad.
ln(0,5)/ln(1 − r): 10 % → 6,6 (7); 5 % → 13,5 (14); 1 % → 69. Con un 55 % de aciertos, P(racha ≥ 7 en 1.000) ≈ 0,87."""

TITULO = "¿Cuántas pérdidas seguidas aguanta tu cuenta?"
GUION = [
    ("hook", ["¿Cuántas pérdidas seguidas aguanta tu cuenta antes de perder la mitad?", "Depende de una sola cosa."]),
    ("riesgo", ["De cuánto arriesgas en cada operación."]),
    ("sigueme", ["Si te está sirviendo, sígueme para más cuentas que nadie te hace."]),
    ("cuenta", ["Arriesgando un 10%: con 7 pérdidas seguidas, ya has perdido la mitad.", "Con un 5%: 14.", "Con un 1%: 69."]),
    ("giro", ["7 pérdidas seguidas le pasan a cualquiera. 69, casi a nadie.", "Tu estrategia decide cuánto ganas. Tu riesgo decide si sigues vivo para verlo."]),
    ("pregunta", ["Y dime en comentarios: ¿cuánto arriesgas tú por operación? Te leo."]),
]

GESTOS = {
    "hook": "[curious] ¿Cuántas pérdidas seguidas aguanta tu cuenta antes de perder la mitad? [short pause] Depende de una sola cosa.",
    "riesgo": "De cuánto arriesgas en cada operación.",
    "sigueme": "[warmly] Si te está sirviendo, sígueme para más cuentas que nadie te hace.",
    "cuenta": "[inhales] Arriesgando un 10%: con 7 pérdidas seguidas, ya has perdido la mitad. [short pause] Con un 5%: 14. [short pause] Con un 1%: 69.",
    "giro": "[serious] 7 pérdidas seguidas le pasan a cualquiera. 69, casi a nadie. [exhales] Tu estrategia decide cuánto ganas. Tu riesgo decide si sigues vivo para verlo.",
    "pregunta": "[curious] Y dime en comentarios: ¿cuánto arriesgas tú por operación? Te leo.",
}

PANTALLAS = [
    ("hook", "¿cuántas *aguantas*?", "una cuenta que pierde un trozo con cada ✕ hasta la línea de la mitad"),
    ("riesgo", "tu *riesgo*", "deslizador de riesgo por operación de 1 % a 10 %"),
    ("sigueme", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
    ("cuenta", "*7* · *14* · *69*", "tres columnas (10 %, 5 %, 1 %) que bajan pérdida a pérdida hasta la mitad"),
    ("giro", "¿sigues *vivo*?", "7 ✕ que le pasan a cualquiera frente a 69 ✕ que casi a nadie"),
    ("pregunta", "¿cuánto arriesgas *tú*?", "bocadillo de comentario escribiendo"),
]
