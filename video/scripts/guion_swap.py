"""Reel de alcance (~34 s): el swap y el miércoles triple — te cobran por dejar operaciones abiertas por la noche.

Datos: las posiciones apalancadas que pasan el cierre de sesión (17:00 de Nueva York, 23:00 en España) pagan o cobran swap;
en forex, el miércoles se aplica por triplicado para cubrir el fin de semana (liquidación a dos días). Puede ser positivo
o negativo según el par y la dirección.
"""

TITULO = "Hay un día de la semana en el que tu bróker te cobra el triple por dormir"
GUION = [
    ("hook", ["Hay un día de la semana en el que tu bróker te cobra el triple...", "por dormir."]),
    ("uno", ["Cada noche que dejas una operación abierta con apalancamiento, pagas un interés: el swap."]),
    ("dos", ["Y en forex, el miércoles a las once de la noche te lo cobran por tres noches de golpe."]),
    ("sigueme", ["Sígueme, que ahora viene lo que casi nadie calcula."]),
    ("tres", ["Una operación que aguantas semanas puede ir ganando en el gráfico...", "y perdiendo en la cuenta."]),
    ("giro", ["Antes de dejar algo abierto, mira el swap.", "A veces te pagan, a veces te cobran... y el miércoles, por tres."]),
    ("pregunta", ["¿Sabías lo del miércoles? Mándaselo al que deja operaciones abiertas meses hasta que vuelvan."]),
]

GESTOS = {
    "hook": "[curious] Hay un día de la semana en el que tu bróker te cobra el triple... [short pause] por dormir.",
    "uno": "Cada noche que dejas una operación abierta con apalancamiento, pagas un interés: [short pause] el swap.",
    "dos": "[serious] Y en forex, el miércoles a las once de la noche te lo cobran por tres noches de golpe.",
    "sigueme": "[warmly] Sígueme, que ahora viene lo que casi nadie calcula.",
    "tres": "[inhales] Una operación que aguantas semanas puede ir ganando en el gráfico... [short pause] y perdiendo en la cuenta.",
    "giro": "[serious] Antes de dejar algo abierto, mira el swap. [short pause] A veces te pagan, a veces te cobran... y el miércoles, por tres.",
    "pregunta": "[curious] ¿Sabías lo del miércoles? Mándaselo al que deja operaciones abiertas meses hasta que vuelvan.",
}

PANTALLAS = [
    ("hook", "", "calendario 3D de lunes a domingo; el miércoles se enciende en rojo con «×3»; el stickman duerme"),
    ("uno", "", "reloj 23:00 y una moneda que sale de la cuenta cada noche"),
    ("dos", "", "el miércoles salen tres monedas de golpe"),
    ("sigueme", "", "«sígueme» grande, botón Seguir y cuenta auditada"),
    ("tres", "", "pantalla partida: gráfico en verde arriba, saldo bajando abajo por los cobros nocturnos"),
    ("giro", "", "ficha de la operación con la línea SWAP resaltada; +/− y el ×3 del miércoles"),
    ("pregunta", "", "botones SÍ / NO y bocadillo de comentarios"),
]
