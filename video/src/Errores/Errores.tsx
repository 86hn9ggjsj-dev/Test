// "Los tres errores que hacen que un backtest mienta" (parte 3 de Explica): 100 % motion graphics con el mismo lenguaje.
// Siete pantallas: el gancho, los tres errores (mirar el futuro, supervivencia y suerte), la señal de alarma, el cierre
// y el CTA. Se animan con los tiempos de las palabras (src/gen/errores.json, generado por scripts/errores.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/errores.json";
import { salida } from "../Premium/ui";
import { ANCHO, MONO, ruido } from "../Viral/util";
import { Arriba, dos, Etiqueta, euros, L, mono, muelle, Titular } from "../Bot/piezas";
import { caja, clave, Escena, io, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { Abajo, BotonSeguir, claves, cuando, escala, Kicker, Montaje, P, paseo, pct } from "../Explica/Montaje";

export const ERRORES_FPS = datos.fps;
export const ERRORES_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const en = cuando(datos);

// Vela de alambre entre dos precios (cuerpo de caja + mecha)
const vela = (tr: Trazo[], x: number, a: number, c: number, g: number, w = 0.04, o = 1) => {
  const lo = Math.min(a, c);
  const alto = Math.max(Math.abs(c - a), 0.012) * g;
  for (const [pa, pb] of caja([x - w, lo, -w], [x + w, lo + alto, w])) tr.push({ t: "l", a: pa, b: pb, w: 1.3, o: (c > a ? 0.9 : 0.45) * o });
  const mecha = (0.04 + 0.06 * ruido(x * 31)) * g;
  tr.push({ t: "l", a: [x, lo - mecha, 0], b: [x, lo + alto + mecha, 0], w: 1, o: 0.5 * o });
};

// ------------------------------------------------------------------ 1. Hook: todos los años en positivo… hasta que asoma la realidad
const ANOS = [2019, 2020, 2021, 2022, 2023, 2024];
const BT_ANUAL = [0.45, 0.62, 0.38, 0.72, 0.5, 0.8]; // 1 unidad = 40 %
const REAL_ANUAL = [0.28, -0.32, 0.12, -0.48, -0.18, 0.22];
const BASE = -0.1;
const XB = (k: number) => -1.0 + k * 0.4;
const Hook: React.FC<P> = ({ t, s, e }) => {
  const tY = en("y", s);
  const sacude = t > EV.mintiendo ? 0.05 * Math.exp(-(t - EV.mintiendo) * 6) * Math.sin((t - EV.mintiendo) * 40) : 0;
  const cam = orbita([0, 0.05, 0], L(t, s, e, 8.2, 7.4), L(t, s, e, -0.38, -0.12) + sacude, L(t, s, e, 0.16, 0.24), { apertura: 35, centroY: 900 });
  const tr: Trazo[] = [...polvo(0.3)];
  const linea = L(t, s + 0.1, s + 0.6, 0, 1, salida);
  tr.push({ t: "p", pts: [[-1.35, BASE, 0], [1.35, BASE, 0]], w: 1.4, o: 0.6, prog: linea });
  const miente = muelle(t, EV.mintiendo - 0.05, 120, 11);
  const altos = ANOS.map((_, k) => {
    const g = muelle(t, s + 0.3 + (k * (EV.anos - s - 0.3)) / 5, 160, 14);
    return (BT_ANUAL[k] + (REAL_ANUAL[k] - BT_ANUAL[k]) * miente) * g;
  });
  altos.forEach((h, k) => {
    if (h === 0) return;
    const x = XB(k);
    const w = 0.11;
    for (const [a, b] of caja([x - w, Math.min(BASE, BASE + h), -w], [x + w, Math.max(BASE, BASE + h) + 0.002, w])) {
      tr.push({ t: "l", a, b, w: 1.5, o: h >= 0 ? 0.95 : 0.55, dash: h < 0 ? "4 6" : undefined, luz: h >= 0 ? 0.15 * (1 - miente) : 0 });
    }
  });
  const pr = proyector(cam);
  const total = altos.reduce((a, h) => a + h * 40, 0);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {altos.map((h, k) => {
        const x = XB(k);
        const anio = pr([x, BASE, 0.11]);
        const cifra = pr([x, BASE + h + (h >= 0 ? 0.12 : -0.12), 0]);
        return (
          <div key={k}>
            <div style={{ position: "absolute", left: anio.x, top: anio.y + (h < -0.02 ? -40 : 30), transform: "translate(-50%, -50%)", opacity: linea, ...mono(22, 0.5) }}>{ANOS[k]}</div>
            {h !== 0 && <div style={{ position: "absolute", left: cifra.x, top: cifra.y, transform: "translate(-50%, -50%)", ...mono(26, h >= 0 ? 1 : 0.75) }}>{pct(h * 40)}</div>}
          </div>
        );
      })}
      <Abajo o={t >= s + 0.4 ? 1 : 0}>
        <span style={mono(56)}>{pct(total)}</span>
        <span style={mono(24, 0.55)}>{miente > 0.5 ? "REAL" : "BACKTEST"}</span>
      </Abajo>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={tY - 0.05} texto="gana *todos* los años" size={84} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tY} texto="te está *mintiendo*" size={88} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Mirar el futuro: decide con un cierre que aún no existe
const NPV = 10;
const VALS = escala(paseo(NPV + 1, 13, 0.22, 0.01), -0.55, 0.1);
const XF = (i: number) => -1.1 + i * 0.17;
const SALTO = 0.55;
const ENTRADAS = [2, 4, 6, 8];
const Futuro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.3, 0.15, 0], L(t, s, e, 7.0, 6.4), L(t, s, e, 0.26, 0.06), L(t, s, e, 0.12, 0.2), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const acierta = L(t, EV.acierta - 0.1, EV.acierta + 0.3, 0, 1, salida);
  const nunca = L(t, EV.nunca - 0.1, EV.nunca + 0.4, 0, 1, salida);
  for (let i = 0; i < NPV; i++) {
    const g = muelle(t, s + 0.2 + i * 0.05, 170, 16);
    if (g > 0) vela(tr, XF(i), VALS[i], VALS[i + 1], g);
    // En el backtest, cada entrada cae justo en el mínimo
    if (ENTRADAS.indexOf(i) >= 0 && acierta > 0) tr.push({ t: "e", c: [XF(i), Math.min(VALS[i], VALS[i + 1]) - 0.16, 0], r: 0.035, tipo: "aro", o: acierta * (1 - 0.6 * nunca), luz: 0.5 * acierta * (1 - nunca) });
  }
  // La vela actual se sigue formando: el precio aún oscila cerca de la apertura
  const x = XF(NPV);
  const ab = VALS[NPV];
  const vive = muelle(t, s + 0.6, 170, 16);
  const precio = ab + 0.1 * Math.sin(t * 2.1) + 0.05 * Math.sin(t * 5.3 + 1);
  if (vive > 0) vela(tr, x, ab, ab + (precio - ab) * Math.min(vive, 1), 1, 0.05);
  // El cierre que todavía no existe: un fantasma de la vela terminada
  const fantasma = L(t, EV.cierre - 0.15, EV.cierre + 0.35, 0, 1, salida);
  if (fantasma > 0) {
    for (const [pa, pb] of caja([x - 0.05, ab, -0.05], [x + 0.05, ab + SALTO * fantasma, 0.05])) tr.push({ t: "l", a: pa, b: pb, w: 1.2, o: 0.55, dash: "4 6" });
    tr.push({ t: "l", a: [x - 0.5, ab + SALTO, 0], b: [x + 0.12, ab + SALTO, 0], w: 1.4, o: 0.8 * fantasma, dash: "6 7" });
  }
  // La entrada usa ese cierre: la información viaja del futuro al pasado
  const ent: V3 = [x - 0.06, ab, 0];
  const top: V3 = [x, ab + SALTO, 0];
  const ctl: V3 = [x + 0.42, ab + SALTO * 0.55, 0];
  const arco: V3[] = Array.from({ length: 31 }, (_, i) => {
    const u = i / 30;
    const p = (a: number, b: number, c: number) => (1 - u) * (1 - u) * a + 2 * (1 - u) * u * b + u * u * c;
    return [p(top[0], ctl[0], ent[0]), p(top[1], ctl[1], ent[1]), 0] as V3;
  });
  const viaja = L(t, EV.entra - 0.3, EV.entra + 0.45, 0, 1, io);
  if (viaja > 0) tr.push({ t: "p", pts: arco, w: 2, o: 1 - 0.65 * nunca, dash: "5 7", prog: viaja, luz: 0.5 * (1 - nunca) });
  if (t >= EV.entra + 0.3) tr.push({ t: "e", c: ent, r: 0.045, tipo: "punto", o: 1, luz: 1 - nunca });
  const pr = proyector(cam);
  const reloj = pr([x, ab + SALTO + 0.3, 0]);
  const qc = pr([x - 0.5, ab + SALTO, 0]);
  const qe = pr(ent);
  const qa = pr([x + 0.24, ab + SALTO * 0.55, 0]);
  const segundos = Math.floor(L(t, s + 0.6, e + 0.3, 0, 59, (u) => u));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: reloj.x, top: reloj.y, transform: "translate(-50%, -100%)", opacity: Math.min(vive, 1), display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <span style={mono(20, 0.5)}>VELA ACTUAL</span>
        <span style={mono(34)}>{`00:${dos(segundos)}`}</span>
      </div>
      <Etiqueta t={t} t0={EV.cierre} x={qc.x - 14} y={qc.y - 16} size={24} o={0.85} alinea="der">
        CIERRE
      </Etiqueta>
      <Etiqueta t={t} t0={EV.cierre + 0.4} x={qc.x - 14} y={qc.y + 16} size={20} o={0.55} alinea="der">
        AÚN NO EXISTE
      </Etiqueta>
      <Etiqueta t={t} t0={EV.entra + 0.2} x={qe.x - 26} y={qe.y + 34} size={26} alinea="der">
        {t >= EV.nunca ? "ENTRADA ✕" : "ENTRADA"}
      </Etiqueta>
      <Etiqueta t={t} t0={EV.entra + 0.3} x={Math.min(qa.x + 20, 840)} y={qa.y} size={22} o={0.7}>
        LEE EL FUTURO
      </Etiqueta>
      <Abajo o={t >= EV.acierta - 0.1 && t < EV.nunca - 0.1 ? 1 : 0}>
        <span style={mono(56)}>100 %</span>
        <span style={mono(24, 0.55)}>ACIERTOS EN EL BACKTEST</span>
      </Abajo>
      <Abajo o={nunca}>
        <span style={mono(52)}>✕ EN REAL, IMPOSIBLE</span>
      </Abajo>
      <Kicker t={t} t0={s + 0.05} texto="ERROR 01 / 03" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.acierta - 0.35} texto="mirar el *futuro*" size={92} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.acierta - 0.3} fin={EV.nunca - 0.3} texto="acierta *siempre*" size={92} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.nunca - 0.25} texto="en real, *nunca*" size={92} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Supervivencia: solo las empresas que siguen en bolsa
const EMPRESAS = Array.from({ length: 40 }, (_, i) => ({ x: -1.05 + (i % 8) * 0.3, z: -0.9 + Math.floor(i / 8) * 0.3, quiebra: ruido(i * 7.7 + 1) < 0.43 }));
const NQ = EMPRESAS.filter((x) => x.quiebra).length;
const SUELO = -0.55;
const VIVAS = escala(paseo(31, 51, 0.1, 0.03), -0.15, 0.55);
const TODAS = paseo(31, 57, 0.12, -0.012).map((v) => VIVAS[0] + v * 0.5);
const XV = (i: number) => -1.0 + i * (2.0 / 30);
const Supervivencia: React.FC<P> = ({ t, s, e }) => {
  const curvas = L(t, EV.cualquier - 0.2, EV.cualquier + 0.4, 0, 1, salida);
  const cam = orbita([0.12, -0.15, -0.3 * (1 - curvas)], L(t, s, e, 8.6, 7.8), L(t, s, e, -0.3, -0.08), 0.42 - 0.24 * curvas, { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const hoy = L(t, EV.acciones - 0.1, EV.acciones + 0.4, 0, 1, salida);
  EMPRESAS.forEach((c, i) => {
    const g = muelle(t, s + 0.25 + i * 0.02, 170, 15);
    if (g <= 0) return;
    const cae = c.quiebra ? L(t, EV.quebraron - 0.1 + ruido(i * 3.1) * 0.5, EV.quebraron + 0.5 + ruido(i * 3.1) * 0.5, 0, 1, io) : 0;
    const y0 = SUELO - 0.9 * cae * cae;
    const h = 0.16 * Math.min(g, 1.1);
    const brillo = c.quiebra ? 0.55 : 0.55 + 0.45 * hoy;
    const o = (c.quiebra ? brillo * (1 - cae) + 0.08 * cae : brillo) * (1 - 0.8 * curvas);
    for (const [a, b] of caja([c.x - 0.08, y0, c.z - 0.08], [c.x + 0.08, y0 + h, c.z + 0.08])) {
      tr.push({ t: "l", a, b, w: 1.2, o, dash: cae > 0.5 ? "3 5" : undefined, luz: c.quiebra ? 0 : 0.3 * hoy * (1 - curvas) });
    }
  });
  if (curvas > 0) {
    tr.push({ t: "p", pts: VIVAS.map((v, i): V3 => [XV(i), v, 0.3]), w: 2.8, o: 1, prog: curvas, luz: 0.4 });
    tr.push({ t: "p", pts: TODAS.map((v, i): V3 => [XV(i), v, 0.3]), w: 1.8, o: 0.75, prog: curvas, dash: "6 8" });
  }
  const pr = proyector(cam);
  const finV = pr([XV(30), VIVAS[30], 0.3]);
  const finT = pr([XV(30), TODAS[30], 0.3]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.cualquier + 0.3} x={Math.min(finV.x, 1030)} y={finV.y - 36} size={26} alinea="der">
        SOLO SUPERVIVIENTES +142 %
      </Etiqueta>
      <Etiqueta t={t} t0={EV.cualquier + 0.45} x={Math.min(finT.x, 1030)} y={finT.y + 36} size={26} o={0.75} alinea="der">
        TODAS −18 %
      </Etiqueta>
      <Abajo o={t >= s + 0.5 && t < EV.cualquier - 0.2 ? 1 : 0}>
        {t < EV.quebraron ? (
          <>
            <span style={mono(56)}>40</span>
            <span style={mono(24, 0.55)}>{t < EV.acciones ? "EMPRESAS" : "EMPRESAS · LAS QUE HOY SIGUEN"}</span>
          </>
        ) : (
          <>
            <span style={mono(56)}>{NQ}</span>
            <span style={mono(24, 0.55)}>QUEBRARON · FUERA DEL BACKTEST</span>
          </>
        )}
      </Abajo>
      <Kicker t={t} t0={s + 0.05} texto="ERROR 02 / 03" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.cualquier - 0.35} texto="solo lo que *sobrevivió*" size={76} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.cualquier - 0.3} texto="parece *buena*" size={96} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. Suerte: de mil versiones al azar, una siempre parece genial
const NS = 60;
const AZAR = Array.from({ length: NS }, (_, k) => paseo(31, 100 + k * 3, 0.24));
const MIN_AZ = Math.min(...AZAR.map((c) => Math.min(...c)));
const MAX_AZ = Math.max(...AZAR.map((c) => Math.max(...c)));
const YA = (v: number) => -0.85 + ((v - MIN_AZ) / (MAX_AZ - MIN_AZ)) * 1.7;
const XA = (i: number) => -1.3 + i * 0.06;
const MEJOR = AZAR.reduce((b, c, k) => (c[30] > AZAR[b][30] ? k : b), 0);
const DESPUES: V3[] = paseo(14, 9, 0.24, -0.08).map((v, i): V3 => [XA(30) + i * 0.06, YA(AZAR[MEJOR][30] + v), 0]);
const Suerte: React.FC<P> = ({ t, s, e }) => {
  const tEso = en("eso", s);
  const cam = orbita([0.1, -0.05, 0], L(t, s, e, 8.6, 7.8), L(t, s, e, -0.3, -0.06), L(t, s, e, 0.12, 0.2), { apertura: 35, centroY: 950 });
  const tr: Trazo[] = [...polvo(0.3)];
  const t0 = EV.mil - 0.2;
  const t1 = EV.alguna - 0.3;
  const destaca = L(t, EV.alguna - 0.1, EV.alguna + 0.3, 0, 1, salida);
  AZAR.forEach((c, k) => {
    const ti = t0 + (k / (NS - 1)) * (t1 - t0);
    const prog = L(t, ti, ti + 0.35, 0, 1, salida);
    if (prog <= 0) return;
    const pts = c.map((v, i): V3 => [XA(i), YA(v), -0.01 * k]);
    if (k === MEJOR) tr.push({ t: "p", pts, w: 1.1 + 2 * destaca, o: 0.25 + 0.75 * destaca, prog, luz: 0.6 * destaca });
    else tr.push({ t: "p", pts, w: 1.1, o: 0.25 * (1 - 0.6 * destaca), prog });
  });
  const plano = L(t, s + 0.3, s + 0.8, 0, 1, salida);
  const xa = XA(30);
  tr.push({ t: "p", pts: [[xa, -1.0, -0.5], [xa, 1.0, -0.5], [xa, 1.0, 0.5], [xa, -1.0, 0.5], [xa, -1.0, -0.5]], w: 1.2, o: 0.45, prog: plano });
  // Después de "ahora", la mejor versión vuelve a ser azar
  const sigue = L(t, tEso - 0.1, EV.loteria + 0.4, 0, 1, salida);
  if (sigue > 0) tr.push({ t: "p", pts: DESPUES, w: 2.2, o: 0.85, dash: "6 7", prog: sigue });
  const pr = proyector(cam);
  const fin = pr([xa, YA(AZAR[MEJOR][30]), 0]);
  const finD = pr(DESPUES[DESPUES.length - 1]);
  const cima = pr([xa, 1.0, 0]);
  const loteria = muelle(t, EV.loteria - 0.05, 200, 14);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={s + 0.8} x={cima.x} y={cima.y - 28} size={24} o={0.7} alinea="centro">
        AHORA
      </Etiqueta>
      <Etiqueta t={t} t0={EV.alguna + 0.2} x={fin.x - 20} y={fin.y - 40} size={26} alinea="der">
        {`LA MEJOR DE 1.000 · ${pct(((AZAR[MEJOR][30] - AZAR[MEJOR][0]) / (MAX_AZ - MIN_AZ)) * 160)}`}
      </Etiqueta>
      <Etiqueta t={t} t0={EV.loteria + 0.3} x={Math.min(finD.x, 1030)} y={finD.y + 36} size={24} o={0.8} alinea="der">
        EN REAL
      </Etiqueta>
      <Abajo o={t >= t0 && t < EV.suerte - 0.1 ? 1 : 0}>
        <span style={mono(56)}>{euros(L(t, t0, t1 + 0.35, 0, 1000, salida))}</span>
        <span style={mono(24, 0.55)}>VERSIONES</span>
      </Abajo>
      <Abajo o={t >= EV.suerte - 0.1 && t < EV.loteria - 0.1 ? 1 : 0}>
        <span style={mono(52)}>PURO AZAR</span>
      </Abajo>
      <Abajo o={Math.min(loteria * 1.5, 1)}>
        <span style={{ ...mono(52), display: "inline-block", transform: `scale(${0.85 + 0.15 * Math.min(loteria, 1.1)})` }}>= LOTERÍA</span>
      </Abajo>
      <Kicker t={t} t0={s + 0.05} texto="ERROR 03 / 03" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.alguna - 0.35} texto="*mil* versiones" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.alguna - 0.3} fin={EV.loteria - 0.3} texto="pura *suerte*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.loteria - 0.25} texto="es una *lotería*" size={92} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Alarma: una curva casi recta es sospechosa
const RECTA: V3[] = Array.from({ length: 41 }, (_, i): V3 => [-1.2 + i * 0.06, -0.75 + i * 0.0375 + (ruido(i * 5) - 0.5) * 0.02, 0]);
const MERCADO: V3[] = escala(paseo(41, 33, 0.3, 0.035), -0.85, 0.55).map((v, i): V3 => [-1.2 + i * 0.06, v, 0.05]);
const Alarma: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.05, 0], L(t, s, e, 8.0, 7.3), L(t, s, e, 0.32, 0.1), L(t, s, e, 0.12, 0.2), { apertura: 35, centroY: 950 });
  const tr: Trazo[] = [...polvo(0.3)];
  const real = L(t, EV.mercados - 0.1, EV.mercados + 1.2, 0, 1, salida);
  tr.push({ t: "p", pts: RECTA, w: 3, o: 1 - 0.45 * L(t, EV.real - 0.1, EV.real + 0.3, 0, 1), prog: L(t, s + 0.3, EV.perfecta + 0.3, 0, 1, salida), luz: 0.5 });
  if (real > 0) tr.push({ t: "p", pts: MERCADO, w: 2, o: 0.8, dash: "6 7", prog: real });
  const pr = proyector(cam);
  const finR = pr(RECTA[40]);
  const finM = pr(MERCADO[40]);
  const aviso = muelle(t, EV.alarma - 0.05, 220, 12);
  const parpadeo = t > EV.alarma + 0.4 ? (Math.floor(t * 3) % 2 ? 0.35 : 1) : 1;
  const triangulo = (cx: number, cy: number, r: number) => `M${cx},${cy - r} L${cx + r * 0.95},${cy + r * 0.7} L${cx - r * 0.95},${cy + r * 0.7} Z`;
  return (
    <>
      <Escena
        cam={cam}
        trazos={tr}
        encima={() =>
          aviso > 0.001 ? (
            <g opacity={Math.min(aviso * 1.5, 1) * parpadeo} transform={`translate(250 660) scale(${Math.min(aviso, 1.15)}) translate(-250 -660)`}>
              <path d={triangulo(250, 660, 70)} fill="none" stroke="#fff" strokeWidth={3} strokeLinejoin="round" />
              <text x={250} y={690} textAnchor="middle" fill="#fff" style={{ fontFamily: MONO, fontWeight: 500, fontSize: 64 }}>
                !
              </text>
            </g>
          ) : null
        }
      />
      <Etiqueta t={t} t0={EV.perfecta + 0.2} x={Math.min(finR.x, 1030)} y={finR.y - 40} size={24} alinea="der">
        DEMASIADO PERFECTA
      </Etiqueta>
      <Etiqueta t={t} t0={EV.mercados + 1.0} x={Math.min(finM.x + 16, 1030)} y={finM.y + 36} size={24} o={0.8} alinea="der">
        ASÍ ES EL MERCADO
      </Etiqueta>
      <Abajo o={t >= EV.perfecta - 0.1 ? 1 : 0}>
        <span style={mono(56)}>R² 0,99</span>
        <span style={mono(24, 0.55)}>CASI UNA RECTA</span>
      </Abajo>
      <Kicker t={t} t0={s + 0.05} texto="SEÑAL DE ALARMA" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.mercados - 0.3} texto="demasiado *perfecta*" size={86} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.mercados - 0.25} texto="casi nunca es *real*" size={86} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: la idea tiene que atravesar los tres filtros
const FILTROS: [number, string][] = [
  [-0.75, "FUTURO"],
  [0, "SUPERVIVENCIA"],
  [0.75, "SUERTE"],
];
const Cierre: React.FC<P> = ({ t, s, e }) => {
  const tTe = en("te", EV.ganar);
  const cam = orbita([0, 0, 0], L(t, s, e, 8.0, 7.2), L(t, s, e, -0.62, -0.32), L(t, s, e, 0.16, 0.24), { apertura: 35, centroY: 940 });
  const tr: Trazo[] = [...polvo(0.3)];
  const p = clave(t, [[s + 0.4, 0], [EV.realidad + 0.2, 1]]);
  const xn = -1.5 + 3 * p;
  tr.push({ t: "l", a: [-1.6, 0, 0], b: [1.6, 0, 0], w: 1, o: 0.25, dash: "3 7" });
  FILTROS.forEach(([x], k) => {
    const g = muelle(t, s + 0.15 + k * 0.12, 170, 15);
    if (g <= 0) return;
    const pasa = xn >= x ? Math.exp(-((xn - x) / 0.35)) : 0;
    const r = 0.5 * Math.min(g, 1.1);
    tr.push({ t: "p", pts: [[x, -r, -r], [x, r, -r], [x, r, r], [x, -r, r], [x, -r, -r]], w: 1.5, o: 0.6 + 0.4 * (xn >= x ? 1 : 0), luz: pasa });
  });
  if (p > 0) {
    tr.push({ t: "l", a: [-1.5, 0, 0], b: [xn, 0, 0], w: 2.4, o: 0.9, luz: 0.3 });
    tr.push({ t: "e", c: [xn, 0, 0], r: 0.08, tipo: "nodo", o: 1, luz: 0.8 });
  }
  const pr = proyector(cam);
  const idea = pr([xn, 0, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {FILTROS.map(([x, nombre], k) => {
        const q = pr([x, 0.62, 0]);
        return (
          <Etiqueta key={nombre} t={t} t0={s + 0.3 + k * 0.12} x={q.x} y={q.y} size={22} o={xn >= x ? 1 : 0.6} alinea="centro">
            {xn >= x ? `${nombre} ✓` : nombre}
          </Etiqueta>
        );
      })}
      <Etiqueta t={t} t0={s + 0.5} x={idea.x} y={idea.y + 52} size={22} o={0.75} alinea="centro">
        TU IDEA
      </Etiqueta>
      <Abajo o={Math.min(muelle(t, EV.realidad, 200, 15) * 1.5, 1)}>
        <span style={mono(52)}>SOBREVIVE ✓</span>
      </Abajo>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={tTe - 0.05} texto="no es cuánto *ganas*" size={88} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tTe} texto="¿*sobrevive* a la realidad?" size={70} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 7. CTA: seguir para la parte 4, las tres cifras
const VELADAS = ["−12 %", "1,8", "214"];
const Cta: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], 9, L(t, s, e, -0.3, 0.2), 0.2, { apertura: 40 });
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <BotonSeguir t={t} t0={s} />
      <div style={{ position: "absolute", top: 820, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 30, perspective: 1200 }}>
        {VELADAS.map((v, k) => {
          const g = muelle(t, EV.cifras - 0.1 + k * 0.15, 170, 15);
          return (
            <div
              key={k}
              style={{
                width: 280,
                height: 230,
                borderRadius: 22,
                border: "1.5px solid rgba(255,255,255,0.45)",
                background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 22,
                opacity: Math.min(g * 1.6, 1),
                transform: `translateY(${(1 - Math.min(g, 1)) * 80}px) rotateX(${(1 - Math.min(g, 1)) * 30}deg)`,
              }}
            >
              <span style={mono(22, 0.55)}>{`CIFRA ${dos(k + 1)}`}</span>
              <span style={{ ...mono(60), filter: `blur(${9 + 2 * Math.sin(t * 3 + k)}px)` }}>{v}</span>
            </div>
          );
        })}
      </div>
      <Kicker t={t} t0={EV.tres - 0.7} texto="PRÓXIMO VÍDEO · PARTE 4" />
      <Arriba>
        <Titular t={t} t0={s + 0.05} fin={EV.tres - 0.75} texto="*sígueme*" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.tres - 0.7} texto="las tres *cifras*" size={92} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ composición
const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, futuro: Futuro, supervivencia: Supervivencia, suerte: Suerte, alarma: Alarma, cierre: Cierre, cta: Cta };
const CLAVES = claves(["mintiendo", "futuro", "siempre", "nunca", "sobrevivió", "quebraron", "buena", "mil", "suerte", "lotería", "alarma", "perfecta", "real", "ganar", "sobrevive", "realidad", "cifras"]);

export const Errores: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/errores_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
