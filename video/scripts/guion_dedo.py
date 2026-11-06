"""Reel de alcance (~33 s): el error de dedo de Mizuho con J-Com (Tokio, 8-12-2005) y el chaval que se hizo rico con él.

Datos: orden de vender 610.000 acciones a 1 yen en vez de 1 acción a 610.000 yenes; J-Com tenía unas 14.500 acciones
(la orden era más de 40 veces la empresa); Mizuho no pudo cancelarla y perdió más de 27.000 millones de yenes (más de
200 millones de dólares); Takashi Kotegawa, 27 años, ganó unos 2.000 millones de yenes (más de 15 millones de dólares).
"""

TITULO = "Quería vender una acción a 610.000 yenes y vendió 610.000 acciones a un yen"
GUION = [
    ("hook", ["Un trader quería vender una acción a seiscientos diez mil yenes...", "y vendió seiscientas diez mil acciones a un yen."]),
    ("uno", ["Pasó de verdad: Tokio, diciembre de dos mil cinco.", "La orden era más de cuarenta veces más grande que la empresa entera."]),
    ("dos", ["Intentaron cancelarla. El sistema no les dejó."]),
    ("sigueme", ["Sígueme, que lo mejor viene ahora."]),
    ("tres", ["Mientras el banco perdía más de doscientos millones de dólares, un chaval de veintisiete años compró desde su casa en pleno desplome...", "y ganó más de quince millones en minutos."]),
    ("giro", ["La misma pantalla y el mismo minuto: uno pierde una fortuna por un error de dedo y otro se hace rico porque estaba preparado.", "En trading, el error más caro no suele ser el del mercado. Es el tuyo."]),
    ("pregunta", ["¿Tú has metido alguna vez una orden mal? Cuéntamelo, y etiqueta al que siempre pulsa sin mirar."]),
]

GESTOS = {
    "hook": "[curious] Un trader quería vender una acción a seiscientos diez mil yenes... [short pause] y vendió seiscientas diez mil acciones a un yen.",
    "uno": "Pasó de verdad: Tokio, diciembre de dos mil cinco. [short pause] La orden era más de cuarenta veces más grande que la empresa entera.",
    "dos": "Intentaron cancelarla. [short pause] El sistema no les dejó.",
    "sigueme": "[warmly] Sígueme, que lo mejor viene ahora.",
    "tres": "[inhales] Mientras el banco perdía más de doscientos millones de dólares, un chaval de veintisiete años compró desde su casa en pleno desplome... [short pause] y ganó más de quince millones en minutos.",
    "giro": "[serious] La misma pantalla y el mismo minuto: uno pierde una fortuna por un error de dedo y otro se hace rico porque estaba preparado. [short pause] En trading, el error más caro no suele ser el del mercado. Es el tuyo.",
    "pregunta": "[curious] ¿Tú has metido alguna vez una orden mal? Cuéntamelo, y etiqueta al que siempre pulsa sin mirar.",
}

PANTALLAS = [
    ("hook", "", "ticket de orden 3D: «1 acción × 610.000 ¥» y los números se intercambian a «610.000 acciones × 1 ¥»; el stickman pulsa ENTER"),
    ("uno", "", "skyline de Tokio en wireframe y una torre de 14.500 acciones al lado de una montaña de 610.000 que la aplasta"),
    ("dos", "", "botón CANCELAR 3D que se pulsa una y otra vez y no responde; reloj del sistema"),
    ("sigueme", "", "botón Seguir; el stickman lo señala"),
    ("tres", "", "pantalla partida: el banco en rojo bajando y un stickman en su habitación comprando, saldo en verde subiendo"),
    ("giro", "", "las dos mitades se juntan en la misma vela; tecla ENTER gigante"),
    ("pregunta", "", "bocadillo de comentario y tecla ENTER"),
]
