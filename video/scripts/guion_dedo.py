"""Reel de alcance (~33 s): el error de dedo de Mizuho con J-Com (Tokio, 8-12-2005) y el chaval que se hizo rico con él.

Datos: orden de vender 610.000 acciones a 1 yen en vez de 1 acción a 610.000 yenes; J-Com tenía unas 14.500 acciones
(la orden era más de 40 veces la empresa); Mizuho no pudo cancelarla y perdió más de 27.000 millones de yenes (más de
200 millones de dólares); Takashi Kotegawa, 27 años, ganó unos 2.000 millones de yenes (más de 15 millones de dólares).
"""

TITULO = 'Escribió un número en la casilla equivocada y le costó 200 millones'
GUION = [
    ('hook', ['Un trader escribió un número en la casilla equivocada... y le costó más de doscientos millones de dólares.']),
    ('uno', ['Quería vender una acción a seiscientos diez mil yenes.', 'Vendió seiscientas diez mil acciones... a un yen.']),
    ('dos', ['Tokio, dos mil cinco. Intentaron cancelarla. El sistema no les dejó.']),
    ('sigueme', ['Y eso no es lo más loco. Sígueme, que viene ahora.']),
    ('tres', ['Un chaval de veintisiete años lo vio desde su casa, compró en pleno desplome...', 'y ganó más de quince millones en minutos.']),
    ('giro', ['Mismo error, mismo minuto: uno pulsó sin mirar. El otro estaba mirando.']),
    ('pregunta', ['¿Tú habrías comprado o te habría dado miedo? Etiqueta al que pulsa sin mirar.']),
]

GESTOS = {
    'hook': '[curious] Un trader escribió un número en la casilla equivocada... [short pause] y le costó más de doscientos millones de dólares.',
    'uno': 'Quería vender una acción a seiscientos diez mil yenes. [short pause] Vendió seiscientas diez mil acciones... [short pause] a un yen.',
    'dos': 'Tokio, dos mil cinco. Intentaron cancelarla. [short pause] El sistema no les dejó.',
    'sigueme': '[mischievously] Y eso no es lo más loco. [warmly] Sígueme, que viene ahora.',
    'tres': '[inhales] Un chaval de veintisiete años lo vio desde su casa, compró en pleno desplome... [short pause] y ganó más de quince millones en minutos.',
    'giro': '[serious] Mismo error, mismo minuto: uno pulsó sin mirar. [short pause] El otro estaba mirando.',
    'pregunta': '[curious] ¿Tú habrías comprado o te habría dado miedo? Etiqueta al que pulsa sin mirar.',
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
