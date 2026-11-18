"""Reel 5-30-10 (~40 s): el premortem (Gary Klein, Harvard Business Review, 2007): imaginar antes de entrar que la operación ya ha salido mal. Regla: escribir una frase «ha salido mal porque…»; si no se te ocurre nada, bajar el tamaño."""

TITULO = 'Antes de entrar, imagina que la operación ya ha salido mal'
GANCHO = {'lineas': ['Imagina que', '*ya_ha_salido_mal*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Antes de entrar, imagina que la operación ya ha salido mal.']),
    ('uno', ['Suena raro, pero lo usan equipos profesionales antes de decisiones grandes. Se llama premortem. Te obliga a ver lo que tu ilusión no te deja ver.']),
    ('sigueme', ['Sígueme, que te enseño a hacerlo en diez segundos.']),
    ('dos', ['Cuando estás seguro de una operación, solo ves por qué va a salir bien. Y el tamaño se te va de las manos.']),
    ('giro', ['La regla: antes de pulsar, escribe una frase: esta operación ha salido mal porque... Si no se te ocurre nada, estás demasiado seguro: baja el tamaño.']),
    ('cierre', ['Si has llegado hasta aquí, hazlo en tu próxima entrada. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Antes de entrar, imagina que la operación [short pause] ya ha salido mal.',
    'uno': 'Suena raro, pero lo usan equipos profesionales antes de decisiones grandes. [curious] Se llama premortem. [short pause] Te obliga a ver lo que tu ilusión no te deja ver.',
    'sigueme': '[warmly] Sígueme, que te enseño a hacerlo en diez segundos.',
    'dos': '[serious] Cuando estás seguro de una operación, solo ves por qué va a salir bien. [short pause] Y el tamaño se te va de las manos.',
    'giro': 'La regla: antes de pulsar, escribe una frase: esta operación ha salido mal porque... [short pause] Si no se te ocurre nada, estás demasiado seguro: baja el tamaño.',
    'cierre': '[warmly] Si has llegado hasta aquí, hazlo en tu próxima entrada. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: el stickman con el dedo sobre COMPRAR y una bola de cristal que muestra la operación en rojo'),
    ('uno', "", 'equipo de stickmen en una mesa con «¿POR QUÉ HA FALLADO?»'),
    ('sigueme', "", '«sígueme»'),
    ('dos', "", 'gafas de color de rosa: solo ve flechas verdes; el dial de tamaño subiendo'),
    ('giro', "", 'nota «HA SALIDO MAL PORQUE…»; si está vacía, el tamaño baja'),
    ('cierre', "", 'móvil: BOT → mensaje directo → cuenta auditada'),
]
