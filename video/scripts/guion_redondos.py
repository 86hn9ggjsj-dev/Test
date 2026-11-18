"""Reel de alcance (~40 s): por qué el precio frena en los números redondos.
Osler (Reserva Federal de Nueva York, 2000-2003), órdenes de un gran banco: los take profit se agolpan en los redondos y los
stops justo al otro lado; al romperse, los stops encadenados aceleran el precio (Osler, 2005)."""

TITULO = "¿Por qué el precio frena en los números redondos?"
GUION = [
    ("hook", ["1,1000 o 1,0987. ¿En cuál crees que frena el precio?", "Más a menudo en el primero. Y no es casualidad."]),
    ("ordenes", ["Los objetivos de beneficio se amontonan justo en los números redondos."]),
    ("sigueme", ["Sígueme y quédate, que al final te digo dónde no poner el stop."]),
    ("estudio", ["Un estudio de la Reserva Federal de Nueva York, con órdenes reales de un banco, lo confirmó: las de recoger beneficios se agolpan en el número redondo, y los stops, justo al otro lado."]),
    ("cadena", ["Por eso el precio suele frenar en el redondo... y si lo rompe, se acelera: salta una cadena de stops."]),
    ("consejo", ["No pongas tu stop donde lo pone todo el mundo."]),
    ("pregunta", ["¿Tú dónde lo pones: en el redondo o lejos de él? Te leo en comentarios."]),
]

GESTOS = {
    "hook": "[curious] 1,1000 o 1,0987. ¿En cuál crees que frena el precio? [short pause] Más a menudo en el primero. Y no es casualidad.",
    "ordenes": "Los objetivos de beneficio se amontonan justo en los números redondos.",
    "sigueme": "[warmly] Sígueme y quédate, que al final te digo dónde no poner el stop.",
    "estudio": "[inhales] Un estudio de la Reserva Federal de Nueva York, con órdenes reales de un banco, lo confirmó: las de recoger beneficios se agolpan en el número redondo, y los stops, justo al otro lado.",
    "cadena": "[serious] Por eso el precio suele frenar en el redondo... y si lo rompe, se acelera: salta una cadena de stops.",
    "consejo": "[exhales] No pongas tu stop donde lo pone todo el mundo.",
    "pregunta": "[curious] ¿Tú dónde lo pones: en el redondo o lejos de él? Te leo en comentarios.",
}

PANTALLAS = [
    ("hook", "¿*1,1000* o *1,0987*?", "velas que suben hacia dos niveles y frenan en el redondo"),
    ("ordenes", "se *amontonan*", "libro de órdenes con un muro de take profit en 1,1000"),
    ("sigueme", "*sígueme*", "botón Seguir que se pulsa; «cuenta auditada del bot en la bio»"),
    ("estudio", "y los *stops*", "el muro de take profit en el redondo y los stops justo encima"),
    ("cadena", "se *acelera*", "el precio rompe y los stops saltan en cadena"),
    ("consejo", "no donde *todos*", "un montón de stops en el mismo sitio y el tuyo aparte"),
    ("pregunta", "¿redondo o *lejos*?", "bocadillo de comentario escribiendo"),
]
