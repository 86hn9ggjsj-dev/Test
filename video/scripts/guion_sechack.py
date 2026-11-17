"""Reel 5-30-10 «dopamina» (~42 s): la noticia falsa de la SEC sobre los ETF de bitcoin (9 de enero de 2024).

Hechos: la cuenta oficial de la SEC en X publicó que aprobaba los ETF de bitcoin al contado; bitcoin subió más de 1.000 $ en
minutos; era falso (cuenta comprometida); Gary Gensler lo desmintió en minutos (entre 15 y 30 según las fuentes) y bitcoin
se dio la vuelta. La aprobación real llegó al día siguiente. Regla: no operar titulares de redes: comprobarlo en la web
oficial de quien lo dice.
"""

TITULO = 'Una noticia falsa movió bitcoin mil dólares en minutos'
GANCHO = {'lineas': ['Una noticia *falsa*', 'movió bitcoin *1.000_$*'], 'color': 'ROJO'}
GUION = [
    ('hook', ['Una noticia falsa movió bitcoin mil dólares en minutos.']),
    ('uno', ['9 de enero de 2024. La cuenta oficial de la SEC en X anuncia que aprueba los ETF de bitcoin.', 'Bitcoin sube más de mil dólares.']),
    ('sigueme', ['Sígueme, que lo que pasó después te puede pasar a ti.']),
    ('dos', ['Era falso: les habían hackeado la cuenta. En minutos lo desmintieron, y bitcoin se dio la vuelta.', 'Los que compraron por el titular, compraron arriba.']),
    ('giro', ['La regla: no operes un titular de redes. Búscalo en la web oficial de quien lo dice. Si no está ahí, no ha pasado.']),
    ('cierre', ['Si has llegado hasta aquí, ya no te la cuelan. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.']),
]
GESTOS = {
    'hook': '[serious] Una noticia falsa movió bitcoin mil dólares en minutos.',
    'uno': 'Nueve de enero de dos mil veinticuatro. La cuenta oficial de la SEC en X anuncia que aprueba los ETF de bitcoin. [short pause] Bitcoin sube más de mil dólares.',
    'sigueme': '[warmly] Sígueme, que lo que pasó después te puede pasar a ti.',
    'dos': '[serious] Era falso: les habían hackeado la cuenta. [short pause] En minutos lo desmintieron, y bitcoin se dio la vuelta. [mischievously] Los que compraron por el titular, compraron arriba.',
    'giro': 'La regla: no operes un titular de redes. [short pause] Búscalo en la web oficial de quien lo dice. Si no está ahí, no ha pasado.',
    'cierre': '[warmly] Si has llegado hasta aquí, ya no te la cuelan. Comenta BOT y te explico por privado cómo lo hago yo, y te paso la cuenta auditada de mi bot.',
}
PANTALLAS = [
    ('hook', "", 'fotograma 0: un tuit con el sello oficial y el gráfico de bitcoin disparándose; un contador +1.000 $'),
    ('uno', "", 'el tuit falso en grande («The SEC grants approval…») y la vela verde enorme'),
    ('sigueme', "", '«sígueme» encima de la escena'),
    ('dos', "", 'el tuit se rompe con el sello HACKEADO; la vela se da la vuelta; stickmen que compraron arriba'),
    ('giro', "", 'stickman que, antes de pulsar COMPRAR, abre la web oficial (sec.gov) y no está: NO HA PASADO'),
    ('cierre', "", 'móvil: comentario BOT → mensaje directo → cuenta auditada'),
]
