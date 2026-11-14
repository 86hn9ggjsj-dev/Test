"""Historia de prueba (v3, ~33 s) de matemáticas del trading: medir las operaciones en R.

R = lo que arriesgas en una operación (distancia al stop × tamaño). Arriesgar 50 € y ganar 150 € = +3 R; saltar el stop
= −1 R. La media en R de una muestra suficiente (50 operaciones) es la esperanza del sistema: si es negativa, cambiar el
tamaño no la vuelve positiva (solo hace más grandes las pérdidas).
"""

TITULO = 'Si mides tus operaciones en euros, no sabes si eres buen trader'
GANCHO = {'lineas': ['¿Lo mides *en_euros*?', 'Así *no_lo_sabes*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Si mides tus operaciones en euros, no sabes si eres buen trader.']),
    ('uno', ['Mídelas en R: lo que arriesgas. Arriesgas 50 y ganas 150: +3 R. Te salta el stop: −1 R.']),
    ('sigueme', ['Sígueme, que ahora viene la cuenta que importa.']),
    ('dos', ['Suma tus últimas 50 operaciones en R y divide entre 50. Si sale negativo, ningún tamaño lo arregla.']),
    ('cierre', ['Guárdalo y hazlo esta noche.']),
]
GESTOS = {
    'hook': '[serious] Si mides tus operaciones en euros, no sabes si eres buen trader.',
    'uno': '[curious] Mídelas en R: lo que arriesgas. [short pause] Arriesgas cincuenta y ganas ciento cincuenta: más tres R. [short pause] Te salta el stop: menos uno R.',
    'sigueme': '[warmly] Sígueme, que ahora viene la cuenta que importa.',
    'dos': '[serious] Suma tus últimas cincuenta operaciones en R y divide entre cincuenta. [short pause] Si sale negativo, ningún tamaño lo arregla.',
    'cierre': '[warmly] Guárdalo y hazlo esta noche.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: columna de resultados en euros (+300, −120, +80…) que parpadea sin sentido y se tacha'),
    ('uno', "", 'la R gigante = LO QUE ARRIESGAS; +3 R en verde, −1 R en rojo'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('dos', "", '50 fichas en R que caen en una calculadora: ÷ 50 = media; si sale negativa, el dial de tamaño no la cambia'),
    ('cierre', "", 'icono de guardar; vuelve a la columna de euros (bucle)'),
]
