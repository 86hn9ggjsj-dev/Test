"""Reel de alcance (~35 s): Knight Capital, un bot que perdió más de 440 millones de dólares en 45 minutos (1-8-2012).

Datos (orden de la SEC): al actualizar el software, un servidor de ocho se quedó con código antiguo; al abrir el mercado
ejecutó más de 4 millones de operaciones en unos 45 minutos; pérdidas de más de 440 millones de dólares (la SEC habla de
más de 460); la acción cayó en torno a un 75 % en dos días.
"""

TITULO = "Un bot perdió 440 millones de dólares en 45 minutos"
GUION = [
    ("hook", ["Un bot perdió cuatrocientos cuarenta millones de dólares en cuarenta y cinco minutos.", "Y nadie en la empresa sabía cómo pararlo."]),
    ("uno", ["Uno de agosto de dos mil doce. Knight Capital, uno de los mayores operadores de bolsa de Estados Unidos, actualiza su software...", "y un servidor se queda con código viejo."]),
    ("dos", ["Al abrir el mercado, empieza a lanzar órdenes que nadie le ha pedido. Más de cuatro millones de operaciones."]),
    ("sigueme", ["Sígueme, porque esto le puede pasar a cualquier bot."]),
    ("tres", ["Cuando por fin lo paran, han perdido más de cuatrocientos cuarenta millones.", "En dos días, su acción se hunde un setenta y cinco por ciento."]),
    ("giro", ["La lección: un bot sin límite de pérdidas y sin botón de apagado no es un sistema.", "Es una bomba de relojería."]),
    ("pregunta", ["¿Tú le dejarías tu dinero a un bot? Dímelo en comentarios, y pásaselo al que cree que los bots son magia."]),
]

GESTOS = {
    "hook": "[curious] Un bot perdió cuatrocientos cuarenta millones de dólares en cuarenta y cinco minutos. [short pause] Y nadie en la empresa sabía cómo pararlo.",
    "uno": "Uno de agosto de dos mil doce. Knight Capital, uno de los mayores operadores de bolsa de Estados Unidos, actualiza su software... [short pause] y un servidor se queda con código viejo.",
    "dos": "Al abrir el mercado, empieza a lanzar órdenes que nadie le ha pedido. [short pause] Más de cuatro millones de operaciones.",
    "sigueme": "[warmly] Sígueme, porque esto le puede pasar a cualquier bot.",
    "tres": "[inhales] Cuando por fin lo paran, han perdido más de cuatrocientos cuarenta millones. [short pause] En dos días, su acción se hunde un setenta y cinco por ciento.",
    "giro": "[serious] La lección: un bot sin límite de pérdidas y sin botón de apagado no es un sistema. [short pause] Es una bomba de relojería.",
    "pregunta": "[curious] ¿Tú le dejarías tu dinero a un bot? Dímelo en comentarios, y pásaselo al que cree que los bots son magia.",
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
