"""Reel de alcance (~32 s): compras y después buscas vídeos de por qué va a subir — el sesgo de confirmación.

Concepto: el sesgo de confirmación (buscar e interpretar información que confirma lo que ya creemos). Remedio práctico:
escribir antes de entrar qué tendría que pasar para estar equivocado (la invalidación) y cerrar si pasa.
"""

TITULO = "Compras y luego buscas vídeos de por qué va a subir"
GUION = [
    ("hook", ["Compras...", "y después te pones a buscar vídeos de por qué va a subir."]),
    ("uno", ["Se llama sesgo de confirmación: tu cerebro busca razones para lo que ya has decidido."]),
    ("dos", ["Ignoras las noticias en contra, y cada vela verde te parece una señal."]),
    ("sigueme", ["Sígueme, que tiene truco para evitarlo."]),
    ("tres", ["Antes de entrar, escribe en una frase qué tendría que pasar para que te hayas equivocado."]),
    ("giro", ["Si pasa, cierras.", "Sin buscar vídeos y sin preguntar en el grupo."]),
    ("pregunta", ["¿Cuántos vídeos viste la última vez que ibas perdiendo? Etiqueta al que siempre pregunta si va a subir."]),
]

GESTOS = {
    "hook": "[mischievously] Compras... [short pause] y después te pones a buscar vídeos de por qué va a subir.",
    "uno": "[curious] Se llama sesgo de confirmación: tu cerebro busca razones para lo que ya has decidido.",
    "dos": "Ignoras las noticias en contra, [short pause] y cada vela verde te parece una señal.",
    "sigueme": "[warmly] Sígueme, que tiene truco para evitarlo.",
    "tres": "[serious] Antes de entrar, escribe en una frase qué tendría que pasar para que te hayas equivocado.",
    "giro": "Si pasa, cierras. [short pause] Sin buscar vídeos y sin preguntar en el grupo.",
    "pregunta": "[curious] ¿Cuántos vídeos viste la última vez que ibas perdiendo? Etiqueta al que siempre pregunta si va a subir.",
}

PANTALLAS = [
    ("hook", "", "el stickman pulsa COMPRAR y enseguida abre un buscador: «¿VA A SUBIR?»; miniaturas de vídeos con flechas verdes"),
    ("uno", "", "embudo: entran noticias rojas y verdes y solo pasan las verdes"),
    ("dos", "", "las velas rojas se desenfocan y las verdes brillan con «SEÑAL»"),
    ("sigueme", "", "«sígueme» grande, botón Seguir y cuenta auditada"),
    ("tres", "", "una libreta 3D: «ME EQUIVOCO SI CIERRA POR DEBAJO DE…» y una línea en el gráfico"),
    ("giro", "", "el precio cruza la línea y la operación se cierra sola; el buscador y el grupo se cierran"),
    ("pregunta", "", "contador de pestañas abiertas y bocadillo de comentarios"),
]
