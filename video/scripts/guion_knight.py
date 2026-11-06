"""Reel de alcance (~35 s): Knight Capital, un bot que perdió más de 440 millones de dólares en 45 minutos (1-8-2012).

Datos (orden de la SEC): al actualizar el software, un servidor de ocho se quedó con código antiguo; al abrir el mercado
ejecutó más de 4 millones de operaciones en unos 45 minutos; pérdidas de más de 440 millones de dólares (la SEC habla de
más de 460); la acción cayó en torno a un 75 % en dos días y la empresa fue rescatada por inversores esa misma semana.
440 millones / 45 minutos = 9,8 millones por minuto.
"""

TITULO = 'Un bot perdió casi 10 millones de dólares por minuto durante 45 minutos'
GUION = [
    ('hook', ['Este bot perdió casi diez millones de dólares por minuto.', 'Durante cuarenta y cinco minutos seguidos.']),
    ('uno', ['Knight Capital, dos mil doce: una de las mayores empresas de trading de Estados Unidos actualiza su software...', 'y se olvida de un servidor.']),
    ('dos', ['A las nueve y media abre el mercado y el bot se vuelve loco.', 'Más de cuatro millones de operaciones que nadie le había pedido.']),
    ('sigueme', ['Sígueme, porque esto le puede pasar a cualquier bot.']),
    ('tres', ['Los ingenieros buscan el fallo en directo mientras el contador no para.', 'Cuando por fin lo apagan, han perdido más de cuatrocientos cuarenta millones. La empresa tiene que ser rescatada en días.']),
    ('giro', ['Lo que le faltaba no era un bot más listo.', 'Era un límite de pérdidas y un botón de apagado.']),
    ('pregunta', ['¿Tú le dejarías tu dinero a un bot? Sí o no, en comentarios. Y pásaselo al que cree que los bots son magia.']),
]

GESTOS = {
    'hook': '[curious] Este bot perdió casi diez millones de dólares por minuto. [short pause] Durante cuarenta y cinco minutos seguidos.',
    'uno': 'Knight Capital, dos mil doce: una de las mayores empresas de trading de Estados Unidos actualiza su software... [short pause] y se olvida de un servidor.',
    'dos': 'A las nueve y media abre el mercado y el bot se vuelve loco. [short pause] Más de cuatro millones de operaciones que nadie le había pedido.',
    'sigueme': '[warmly] Sígueme, porque esto le puede pasar a cualquier bot.',
    'tres': '[inhales] Los ingenieros buscan el fallo en directo mientras el contador no para. Cuando por fin lo apagan, han perdido más de cuatrocientos cuarenta millones. [short pause] La empresa tiene que ser rescatada en días.',
    'giro': '[serious] Lo que le faltaba no era un bot más listo. [short pause] Era un límite de pérdidas y un botón de apagado.',
    'pregunta': '[curious] ¿Tú le dejarías tu dinero a un bot? Sí o no, en comentarios. Y pásaselo al que cree que los bots son magia.',
}

PANTALLAS = [
    ("hook", "", "cronómetro 45:00 y un contador de pérdidas que gira sin parar; el stickman corre de un lado a otro"),
    ("uno", "", "rack de ocho servidores 3D; siete se iluminan con el código nuevo y uno se queda con el viejo, parpadeando"),
    ("dos", "", "chorro de órdenes saliendo del servidor como confeti de velas; contador 4.000.000"),
    ("sigueme", "", "botón Seguir; el stickman lo señala"),
    ("tres", "", "el stickman tira del cable; gráfico de la acción −75 % en dos velas"),
    ("giro", "", "bomba con mecha en forma de gráfico; al lado, un bot con «LÍMITE DE PÉRDIDA» y un botón rojo de apagado"),
    ("pregunta", "", "bocadillo de comentario con un robot y un signo de interrogación"),
]
