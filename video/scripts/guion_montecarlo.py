"""Reel de alcance (~34 s): Montecarlo, 18-8-1913, sale negro 26 veces seguidas; la falacia del jugador en el gráfico.

Datos: en la ruleta del casino de Montecarlo salió negro 26 veces seguidas el 18 de agosto de 1913 y muchos jugadores
perdieron fortunas apostando al rojo; cada tirada sigue siendo 18/37 (casi un 50 %).
"""

TITULO = "Montecarlo, 1913: sale negro 26 veces seguidas"
GUION = [
    ('hook', ['Agosto de 1913, casino de Montecarlo: sale negro...', '26 veces seguidas.']),
    ('uno', ['A partir de la décima, la gente empieza a apostar fortunas al rojo.', '«Ya toca», pensaban.']),
    ('dos', ['Pero la ruleta no tiene memoria: cada tirada seguía siendo casi un 50 %.']),
    ('sigueme', ['Sígueme, que esto lo haces tú con los gráficos.']),
    ('tres', ['Cinco velas rojas seguidas, y piensas: ya toca rebote. Y compras.']),
    ('giro', ['El mercado no te debe nada.', '«Ya toca» no es una señal: es la frase que arruinó a medio casino.']),
    ('pregunta', ['¿Has comprado alguna vez porque «ya tocaba»? Etiqueta al que siempre dice que ya toca.']),
]

GESTOS = {
    'hook': '[curious] Agosto de mil novecientos trece, casino de Montecarlo: sale negro... [short pause] veintiséis veces seguidas.',
    'uno': 'A partir de la décima, la gente empieza a apostar fortunas al rojo. [short pause] [whispers] «Ya toca», pensaban.',
    'dos': '[serious] Pero la ruleta no tiene memoria: cada tirada seguía siendo casi un cincuenta por ciento.',
    'sigueme': '[warmly] Sígueme, que esto lo haces tú con los gráficos.',
    'tres': '[inhales] Cinco velas rojas seguidas, y piensas: ya toca rebote. [short pause] Y compras.',
    'giro': '[serious] El mercado no te debe nada. [short pause] «Ya toca» no es una señal: es la frase que arruinó a medio casino.',
    'pregunta': '[curious] ¿Has comprado alguna vez porque «ya tocaba»? Etiqueta al que siempre dice que ya toca.',
}

PANTALLAS = [
    ("hook", "", "ruleta 3D en wireframe girando; contador de negros 1→26 encendiéndose uno a uno"),
    ("uno", "", "fichas que se amontonan sobre el ROJO; bocadillos «YA TOCA» de varios stickmen"),
    ("dos", "", "la bola cae otra vez en negro; balanza 18/37 frente a 18/37 que no se mueve"),
    ("sigueme", "", "«sígueme» grande, botón Seguir y cuenta auditada"),
    ("tres", "", "cinco velas rojas en 3D; el stickman pulsa COMPRAR con «YA TOCA REBOTE»; sale la sexta roja"),
    ("giro", "", "la ruleta se convierte en un gráfico; el rótulo «YA TOCA» se tacha"),
    ("pregunta", "", "botones SÍ / NO y bocadillo de comentarios"),
]
