// Pantallas de motion graphics del video "bot" en el estilo de la referencia: monocromo, diagramas 3D de alambre
// (nodos esféricos, líneas finas, rejillas de puntos, capas apiladas), cámara que se mueve en 3D de forma continua,
// profundidad de campo, cifras en monoespaciada y frases en serif cursiva con resplandor.
import { AbsoluteFill, Easing, spring } from "remotion";
import datos from "../gen/bot.json";
import { recogida, salida } from "../Premium/ui";
import { limpia } from "../Viral/Subtitulos";
import { ANCHO, FPS, lerp, MONO, ruido, SANS, SERIF } from "../Viral/util";
import { bokeh, caja, circulo, clave, Escena, io, mezcla, orbita, proyector, rectRedondo, Trazo, V3 } from "./tres";

const EV = datos.eventos;

type Tramo = { id: string; s: number; e: number };
export const PANTALLAS: Tramo[] = ["intro", "reloj", "auto", "noventa", "gestion", "prop", "cta"].map((id) => ({
  id,
  s: EV[`p_${id}_s` as keyof typeof EV] as number,
  e: EV[`p_${id}_e` as keyof typeof EV] as number,
}));

// Tramos contiguos (< 0.2 s de separación) comparten fondo: no se ve el video "parpadear" entre ellos
const BLOQUES: { s: number; e: number }[] = [];
for (const p of PANTALLAS) {
  const ult = BLOQUES[BLOQUES.length - 1];
  if (ult && p.s - ult.e < 0.2) ult.e = p.e;
  else BLOQUES.push({ s: p.s, e: p.e });
}

export const fondoEn = (t: number) => {
  const b = BLOQUES.find((x) => t >= x.s && t < x.e);
  if (!b) return 0;
  const entrada = b.s <= 0.01 ? 1 : lerp(t, b.s, b.s + 0.3, 0, 1, salida);
  const fin = b.e >= datos.duracion - 0.01 ? 0 : lerp(t, b.e - 0.25, b.e, 0, 1, recogida);
  return entrada * (1 - fin);
};

// ------------------------------------------------------------------ primitivas
const muelle = (t: number, t0: number, rigidez = 140, amort = 15, masa = 0.9) =>
  t < t0 ? 0 : spring({ frame: (t - t0) * FPS, fps: FPS, config: { stiffness: rigidez, damping: amort, mass: masa } });
const rad = (g: number) => (g * Math.PI) / 180;
const L = (t: number, a: number, b: number, va: number, vb: number, e = io) => lerp(t, a, b, va, vb, e);
const dos = (n: number) => (n < 10 ? "0" : "") + n;
const euros = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const LUZ = "0 0 2px rgba(255,255,255,0.8), 0 0 18px rgba(255,255,255,0.42), 0 0 48px rgba(255,255,255,0.18)";
const serifLuz = (size: number): React.CSSProperties => ({
  fontFamily: SERIF,
  fontStyle: "italic",
  fontWeight: 400,
  fontSize: size,
  lineHeight: 1.05,
  color: "#fff",
  textShadow: LUZ,
  whiteSpace: "nowrap",
});
const mono = (size: number, o = 1): React.CSSProperties => ({
  fontFamily: MONO,
  fontWeight: 500,
  fontSize: size,
  lineHeight: 1.1,
  color: `rgba(255,255,255,${o})`,
  letterSpacing: "0.02em",
  whiteSpace: "nowrap",
  textShadow: "0 0 12px rgba(255,255,255,0.3)",
});

// El texto entra enfocándose (de desenfocado a nítido) y sale desenfocándose
const Enfoca: React.FC<{ t: number; t0: number; fin?: number; d?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, t0, fin, d = 0.5, children, style }) => {
  const k = lerp(t, t0, t0 + d, 0, 1, salida);
  const f = fin === undefined ? 0 : lerp(t, fin - 0.3, fin, 0, 1, recogida);
  const v = k * (1 - f);
  if (v <= 0.002) return null;
  return <div style={{ opacity: v, filter: `blur(${(1 - k) * 14 + f * 10}px)`, transform: `translateY(${(1 - k) * 18}px)`, ...style }}>{children}</div>;
};

// Frase en serif cursiva: cada palabra se enfoca un poco después de la anterior
const Frase: React.FC<{ t: number; t0: number; texto: string; size: number; fin?: number; paso?: number }> = ({ t, t0, texto, size, fin, paso = 0.08 }) => (
  <div style={{ display: "flex", gap: size * 0.24 }}>
    {texto.split(" ").map((p, i) => (
      <Enfoca key={i} t={t} t0={t0 + i * paso} fin={fin}>
        <span style={serifLuz(size)}>{p}</span>
      </Enfoca>
    ))}
  </div>
);

const Arriba: React.FC<{ top?: number; children: React.ReactNode }> = ({ top = 290, children }) => (
  <div style={{ position: "absolute", top, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>{children}</div>
);

// Etiqueta monoespaciada anclada a un punto de pantalla
const Etiqueta: React.FC<{ t: number; t0: number; x: number; y: number; size?: number; o?: number; alinea?: "izq" | "der" | "centro"; children: React.ReactNode }> = ({
  t,
  t0,
  x,
  y,
  size = 34,
  o = 1,
  alinea = "izq",
  children,
}) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(${alinea === "izq" ? 0 : alinea === "der" ? -100 : -50}%, -50%)` }}>
    <Enfoca t={t} t0={t0} d={0.35}>
      <span style={mono(size, o)}>{children}</span>
    </Enfoca>
  </div>
);

// Pulso de luz que recorre un segmento (u de 0 a 1)
const pulso = (a: V3, b: V3, u: number, largo = 0.16): Trazo | null =>
  u > 0 && u < 1 + largo ? { t: "l", a: mezcla(a, b, Math.max(u - largo, 0)), b: mezcla(a, b, Math.min(u, 1)), w: 3.2, o: 1, luz: 1 } : null;
const empuja = (tr: Trazo[], x: Trazo | null) => {
  if (x) tr.push(x);
};

// ------------------------------------------------------------------ contenedor
export const Pantallas: React.FC<{ t: number }> = ({ t }) => {
  const f = fondoEn(t);
  if (f <= 0) return null;
  const actual = PANTALLAS.find((p) => t >= p.s && t < p.e);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: f }} />
      {actual && <Contenido t={t} p={actual} />}
    </AbsoluteFill>
  );
};

const Contenido: React.FC<{ t: number; p: Tramo }> = ({ t, p }) => {
  const entra = p.s <= 0.01 ? 1 : lerp(t, p.s, p.s + 0.35, 0, 1, salida);
  // Salida: la cámara "atraviesa" la escena (escala y desenfoque) mientras se funde
  const sale = p.e >= datos.duracion - 0.01 ? 0 : lerp(t, p.e - 0.3, p.e, 0, 1, recogida);
  const Pieza = { intro: Intro, reloj: Reloj, auto: Auto, noventa: Noventa, gestion: Gestion, prop: Prop, cta: Cta }[p.id]!;
  return (
    <AbsoluteFill style={{ opacity: entra * (1 - sale), filter: sale > 0.01 ? `blur(${sale * 12}px)` : undefined, transform: `scale(${1 + sale * 0.07})` }}>
      <Pieza t={t} s={p.s} e={p.e} />
    </AbsoluteFill>
  );
};

type P = { t: number; s: number; e: number };

// ------------------------------------------------------------------ 1. Intro: un nodo reparte luz a tres nodos (las tres ventajas)
const Intro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e + 0.5, 10.5, 8.6), L(t, s, e + 0.5, -0.65, 0.5), L(t, s, e + 0.5, 0.32, 0.1), { apertura: 55, centroY: 1000 });
  const T: V3 = [0, 0.85, 0];
  const B = [210, 90, 330].map((g) => [1.1 * Math.cos(rad(g)), -0.9, 1.1 * Math.sin(rad(g))] as V3);
  const tr: Trazo[] = [...bokeh("fondo", 0.09)];
  const haz = L(t, s, s + 0.45, 0, 1, salida);
  tr.push({ t: "l", a: [0, 9, 0], b: mezcla([0, 9, 0], T, haz), w: 1.6, o: 0.55 });
  // Abanico secundario más tenue
  for (let i = 0; i < 6; i++) {
    const a = rad(i * 60 + 30);
    const q: V3 = [0.62 * Math.cos(a), -0.9, 0.62 * Math.sin(a)];
    const d = L(t, s + 0.4 + i * 0.03, s + 0.85 + i * 0.03, 0, 1, salida);
    tr.push({ t: "l", a: T, b: mezcla(T, q, d), w: 1, o: 0.28 });
    tr.push({ t: "e", c: q, r: 0.04, tipo: "nodo", o: d * 0.6 });
  }
  tr.push({ t: "p", pts: circulo(mezcla(T, [0, -0.9, 0], 0.55), 0.5, "y", 64), w: 1, o: 0.3 * haz });
  B.forEach((b, i) => {
    const d = L(t, s + 0.35 + i * 0.06, s + 0.8 + i * 0.06, 0, 1, salida);
    tr.push({ t: "l", a: T, b: mezcla(T, b, d), w: 1.8, o: 0.85 });
    tr.push({ t: "p", pts: circulo(mezcla(T, b, 0.55), 0.14, "y", 32), w: 1.4, o: 0.75 * d });
    for (let n = 0; n < 3; n++) empuja(tr, pulso(T, b, (t - (s + 0.55 + i * 0.1 + n * 0.62)) / 0.5));
    const kb = muelle(t, s + 0.7 + i * 0.07, 170, 14);
    const enc = muelle(t, EV.tres + i * 0.12, 200, 12);
    tr.push({ t: "e", c: b, r: (0.1 + 0.05 * enc) * kb, tipo: "esfera", o: Math.min(kb * 1.5, 1), luz: 0.9 * Math.min(enc, 1) });
    const ond = L(t, EV.tres + i * 0.12, EV.tres + i * 0.12 + 0.7, 0, 1, salida);
    if (ond > 0 && ond < 1) tr.push({ t: "p", pts: circulo(b, 0.16 + 0.5 * ond, "y", 40), w: 1.6, o: 1 - ond });
  });
  const kT = muelle(t, s + 0.25, 170, 14);
  tr.push({ t: "e", c: T, r: 0.22 * kT, tipo: "esfera", o: Math.min(kT * 1.5, 1), luz: 0.35 });
  const pr = proyector(cam);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {B.map((b, i) => {
        const q = pr(b);
        return (
          <Etiqueta key={i} t={t} t0={EV.tres + i * 0.12} x={q.x + 30} y={q.y - 34}>
            {`0${i + 1}`}
          </Etiqueta>
        );
      })}
      <Arriba>
        <Frase t={t} t0={EV.tres - 0.05} texto="tres ventajas" size={128} />
        <Enfoca t={t} t0={EV.tres + 0.45}>
          <span style={mono(28, 0.7)}>DE UN BOT DE TRADING</span>
        </Enfoca>
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Reloj: esfera en perspectiva, las horas vuelan
const Reloj: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0.1, 0], L(t, s, e, 9.6, 8.2), L(t, s, e, 0.4, -0.45), L(t, s, e, 0.86, 0.62), { apertura: 50, centroY: 960 });
  const R = 1.25;
  const pos = (th: number, r: number, y = 0): V3 => [r * Math.sin(th), y, -r * Math.cos(th)];
  const tr: Trazo[] = [...bokeh("suelo", 0.08)];
  const dib = L(t, s + 0.05, s + 0.9, 0, 1, salida);
  tr.push({ t: "p", pts: circulo([0, 0, 0], R, "y", 120, -Math.PI / 2, Math.PI * 1.5), w: 1.8, o: 0.9, prog: dib });
  tr.push({ t: "p", pts: circulo([0, 0, 0], R * 1.1, "y", 120), w: 1, o: 0.22 * dib });
  tr.push({ t: "p", pts: circulo([0, 0, 0], R * 0.36, "y", 60), w: 1, o: 0.35 * dib, dash: "4 8" });
  for (let i = 0; i < 60; i++) {
    if (dib < i / 60) break;
    const th = (i / 60) * Math.PI * 2;
    if (i % 5 === 0) tr.push({ t: "l", a: pos(th, R * 0.8), b: pos(th, R * 0.93), w: 2.4, o: 0.95 });
    else tr.push({ t: "e", c: pos(th, R * 0.89), r: 0.016, tipo: "punto", o: 0.55 });
  }
  // De las 08:00 a las 20:00: arranca despacio, vuela y frena
  const curva = Easing.bezier(0.55, 0, 0.3, 1);
  const minutos = (x: number) => 8 * 60 + L(x, s + 0.3, e - 0.15, 0, 1, curva) * 12 * 60;
  const m = minutos(t);
  const thM = ((m % 60) / 60) * Math.PI * 2;
  const thH = (m / 720) * Math.PI * 2;
  const paso = ((m - minutos(t - 1 / 30)) / 60) * Math.PI * 2;
  const kH = muelle(t, s + 0.45, 150, 15);
  // Estela del minutero: arco que se desvanece detrás de la aguja
  const estela = Math.min(paso * 5, 2.4);
  for (let j = 0; j < 10 && estela > 0.02; j++) {
    const a1 = thM - (estela * j) / 10;
    const a0 = thM - (estela * (j + 1)) / 10;
    tr.push({ t: "p", pts: Array.from({ length: 6 }, (_, q) => pos(a0 + ((a1 - a0) * q) / 5, R * 0.74)), w: 3, o: 0.5 * (1 - j / 10) * kH });
  }
  tr.push({ t: "l", a: [0, 0, 0], b: pos(thH, R * 0.48 * kH), w: 4.2, o: 0.9 });
  tr.push({ t: "l", a: [0, 0, 0], b: pos(thM, R * 0.74 * kH), w: 2.6, o: 1 });
  tr.push({ t: "e", c: pos(thM, R * 0.74 * kH), r: 0.06, tipo: "esfera", o: kH, luz: 0.8 });
  tr.push({ t: "e", c: [0, 0, 0], r: 0.1 * kH, tipo: "esfera", o: kH });
  // Haz vertical con la hora en lo alto
  const hz = muelle(t, s + 0.7, 120, 16);
  const cima: V3 = [0, 1.0 * hz, 0];
  tr.push({ t: "l", a: [0, 0, 0], b: cima, w: 1.4, o: 0.6 });
  tr.push({ t: "e", c: cima, r: 0.05, tipo: "punto", o: hz, luz: 0.7 });
  tr.push({ t: "p", pts: circulo([0, 0.55 * hz, 0], 0.1, "y", 24), w: 1.2, o: 0.6 * hz });
  const q = proyector(cam)(cima);
  const hm = Math.floor(m);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={s + 0.75} x={q.x + 28} y={q.y} size={44}>
        {`${dos(Math.floor(hm / 60) % 24)}:${dos(hm % 60)}`}
      </Etiqueta>
      <Arriba>
        <Enfoca t={t} t0={s + 0.15}>
          <span style={mono(28, 0.7)}>LIBERTAD DE TIEMPO</span>
        </Enfoca>
        <Frase t={t} t0={EV.grafico - 0.1} texto="sin mirar el gráfico" size={88} />
        <Frase t={t} t0={EV.pendiente - 0.1} texto="ni estar pendiente" size={88} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Automático: esfera con su curva, el anillo se completa
const Auto: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0.05, 0], L(t, s, e, 8.6, 7.4), L(t, s, e, -0.3, 0.25), L(t, s, e, 0.22, 0.08), { apertura: 45, centroY: 960 });
  const C: V3 = [0, 0.4, 0];
  const R = 0.78;
  const kS = muelle(t, s + 0.02, 150, 15);
  const pie: V3 = [0, C[1] - R * 0.92, 0];
  const tr: Trazo[] = [...bokeh("fondo", 0.09)];
  for (let i = 0; i < 9; i++) {
    const a = rad(i * 40 + 20);
    const q: V3 = [1.55 * Math.cos(a), -1.6, 1.55 * Math.sin(a)];
    const d = L(t, s + 0.08 + i * 0.03, s + 0.5 + i * 0.03, 0, 1, salida);
    tr.push({ t: "l", a: q, b: mezcla(q, pie, d), w: 1.5, o: 0.4 });
    tr.push({ t: "e", c: q, r: 0.05, tipo: "nodo", o: d });
    for (let n = 0; n < 2; n++) empuja(tr, pulso(q, pie, (t - (s + 0.3 + i * 0.06 + n * 0.55)) / 0.45, 0.2));
  }
  const pct = L(t, EV.auto1 - 0.2, EV.auto1 + 0.6, 0, 1, salida);
  const anillo = circulo(C, R * 1.55, "y", 120, Math.PI / 2, Math.PI * 2.5);
  tr.push({ t: "p", pts: anillo, w: 1.2, o: 0.2 * kS });
  tr.push({ t: "p", pts: anillo, w: 3.4, o: 1, prog: pct, luz: 0.6 });
  if (pct > 0 && pct < 1) tr.push({ t: "e", c: anillo[Math.round(pct * (anillo.length - 1))], r: 0.045, tipo: "punto", luz: 1 });
  const ond = L(t, EV.auto1 + 0.6, EV.auto1 + 1.2, 0, 1, salida);
  if (ond > 0 && ond < 1) tr.push({ t: "p", pts: circulo(C, R * 1.55 + 0.7 * ond, "y", 90), w: 2, o: 1 - ond });
  tr.push({ t: "e", c: C, r: R * kS, tipo: "esfera", o: Math.min(kS * 1.4, 1), luz: 0.2 });
  // Curva de capital dibujada dentro de la esfera, sobre sus ejes
  const dentro = (p: (x: V3) => { x: number; y: number; k: number }) => {
    const c = p(C);
    const r = R * kS * c.k;
    const trazo = Math.min(Math.max((t - (EV.auto1 - 0.3)) / 0.8, 0), 1);
    const n = 40;
    const pts = Array.from({ length: n + 1 }, (_, i) => {
      const x = -0.55 + (1.1 * i) / n;
      const y = Math.tanh(x * 2.6) * 0.36 + 0.035 * Math.sin(x * 17);
      return [c.x + x * r, c.y - y * r] as [number, number];
    }).slice(0, Math.max(2, Math.round(trazo * n) + 1));
    const ult = pts[pts.length - 1];
    return (
      <g opacity={Math.min(kS * 1.4, 1)}>
        <line x1={c.x - 0.6 * r} y1={c.y} x2={c.x + 0.6 * r} y2={c.y} stroke="#fff" strokeOpacity={0.35} strokeWidth={1.2} />
        <line x1={c.x} y1={c.y - 0.55 * r} x2={c.x} y2={c.y + 0.55 * r} stroke="#fff" strokeOpacity={0.35} strokeWidth={1.2} />
        {trazo > 0 && (
          <>
            <path d={pts.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join("")} fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={ult[0]} cy={ult[1]} r={6} fill="#fff" />
          </>
        )}
      </g>
    );
  };
  return (
    <>
      <Escena cam={cam} trazos={tr} encima={dentro} />
      <Arriba top={250}>
        <Enfoca t={t} t0={EV.auto1 - 0.25}>
          <span style={mono(110)}>{`${Math.round(pct * 100)}%`}</span>
        </Enfoca>
        <Frase t={t} t0={EV.auto1 + 0.45} texto="en automático" size={96} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. 99 %: plano de 100 puntos, caen 99 y uno se eleva
const ELEGIDO = 4 * 10 + 5;
const Noventa: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 10.5, 9), L(t, s, e, 0.6, -0.35), L(t, s, e, 0.72, 0.45), { apertura: 30, centroY: 930 });
  const sep = 0.3;
  const tr: Trazo[] = [...bokeh("suelo", 0.07)];
  const red = L(t, s + 0.3, s + 0.9, 0, 1, salida);
  for (let j = 0; j < 10; j++) {
    const z = (j - 4.5) * sep;
    tr.push({ t: "l", a: [-4.5 * sep, 0, z], b: [4.5 * sep, 0, z], w: 1, o: 0.1 * red });
    tr.push({ t: "l", a: [z, 0, -4.5 * sep], b: [z, 0, 4.5 * sep], w: 1, o: 0.1 * red });
  }
  for (let j = 0; j < 10; j++) {
    for (let i = 0; i < 10; i++) {
      const idx = j * 10 + i;
      const x = (i - 4.5) * sep;
      const z = (j - 4.5) * sep;
      const k = muelle(t, s + 0.05 + Math.hypot(i - 4.5, j - 4.5) * 0.06, 160, 14);
      let y = -0.9 * (1 - k);
      const o = Math.min(k * 1.5, 1);
      if (idx === ELEGIDO) {
        const sube = muelle(t, EV.n99 + 0.85, 110, 13);
        y += 1.1 * sube;
        tr.push({ t: "l", a: [x, 0, z], b: [x, y, z], w: 2, o: 0.8 * Math.min(sube, 1), luz: 0.5 * Math.min(sube, 1) });
        const ond = L(t, EV.n99 + 0.85, EV.n99 + 1.6, 0, 1, salida);
        if (ond > 0 && ond < 1) tr.push({ t: "p", pts: circulo([x, 0, z], 0.12 + 0.6 * ond, "y", 48), w: 1.6, o: 1 - ond });
        tr.push({ t: "e", c: [x, y, z], r: 0.055 + 0.07 * Math.min(sube, 1.2), tipo: "esfera", o, luz: 0.9 * Math.min(sube, 1) });
      } else {
        const tf = EV.n99 + 0.2 + ruido(idx) * 0.55;
        const c = L(t, tf, tf + 0.45, 0, 1);
        tr.push({ t: "e", c: [x, y - 0.45 * c, z], r: 0.04, tipo: "nodo", o: o * (1 - 0.72 * c) });
      }
    }
  }
  const cuenta = Math.round(L(t, EV.n99 - 0.05, EV.n99 + 0.6, 0, 99, salida));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Arriba top={270}>
        <Enfoca t={t} t0={EV.n99 - 0.1}>
          <span style={mono(124)}>{`${cuenta}%`}</span>
        </Enfoca>
        <div style={{ position: "relative", height: 96, width: ANCHO, display: "flex", justifyContent: "center" }}>
          <div style={{ position: "absolute" }}>
            <Frase t={t} t0={EV.n99 + 0.95} fin={EV.psicologica - 0.05} texto="de los traders" size={84} />
          </div>
          <div style={{ position: "absolute" }}>
            <Frase t={t} t0={EV.psicologica - 0.05} texto="gestión psicológica" size={84} />
          </div>
        </div>
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Gestión: velas 3D, entrada, stop a breakeven y TP
const CIERRES = [-0.95, -0.8, -0.9, -0.7, -0.78, -0.55, -0.62, -0.42, -0.5, -0.28, -0.35, -0.1, 0.05, -0.02, 0.25, 0.42, 0.33, 0.7].map((c) => c * 1.2);
const XV = (i: number) => (i - 8.5) * 0.3;
const ENTRADA = 4;
const NIV = { entrada: CIERRES[ENTRADA], sl: -1.35, tp: 0.76 };
const Gestion: React.FC<P> = ({ t, s, e }) => {
  const tv = (i: number) => s + 0.25 + i * 0.34;
  // La cámara sigue a la última vela con un ligero retraso
  const cam = orbita(
    [clave(t, [[s, XV(1)], [tv(4), XV(3)], [tv(17), XV(15.3)], [e, XV(15.6)]]), clave(t, [[s, -0.85], [EV.operacion + 0.3, -0.4], [EV.mueves, -0.35], [e, -0.12]]), 0],
    L(t, s, e, 7.4, 6.7),
    L(t, s, e, -0.42, 0.3),
    L(t, s, e, 0.2, 0.08),
    { apertura: 50, centroY: 910 },
  );
  const tr: Trazo[] = [...bokeh("fondo", 0.08)];
  // Suelo en rejilla
  const suelo = L(t, s, s + 0.6, 0, 1, salida);
  for (const z of [-0.45, 0, 0.45]) tr.push({ t: "l", a: [XV(-1), -1.6, z], b: [XV(18), -1.6, z], w: 1, o: 0.16 * suelo });
  for (let i = -1; i <= 18; i++) tr.push({ t: "l", a: [XV(i), -1.6, -0.45], b: [XV(i), -1.6, 0.45], w: 1, o: 0.1 * suelo });
  let ultima = -1;
  let cierreAct = CIERRES[0];
  CIERRES.forEach((c, i) => {
    if (t < tv(i)) return;
    ultima = i;
    const g = muelle(t, tv(i), 160, 16);
    const ab = i ? CIERRES[i - 1] : -1.25;
    const ci = ab + (c - ab) * g;
    cierreAct = ci;
    const alto = Math.max(ab, c) + 0.06 + 0.08 * ruido(i);
    const bajo = Math.min(ab, c) - 0.06 - 0.08 * ruido(i + 50);
    const sube = c > ab;
    const w = 0.075;
    for (const [a, b] of caja([XV(i) - w, Math.min(ab, ci), -w], [XV(i) + w, Math.max(ab, ci) + 0.004, w])) {
      tr.push({ t: "l", a, b, w: sube ? 1.6 : 1.2, o: (sube ? 0.95 : 0.45) * Math.min(g * 2, 1) });
    }
    tr.push({ t: "l", a: [XV(i), ab + (bajo - ab) * g, 0], b: [XV(i), ab + (alto - ab) * g, 0], w: 1.1, o: 0.55 });
  });
  // Niveles: aparecen con la entrada y llegan hasta la última vela
  const xFin = XV(Math.max(ultima, ENTRADA)) + 0.45;
  const niv = L(t, EV.operacion, EV.operacion + 0.6, 0, 1, salida);
  const be = muelle(t, EV.mueves, 120, 14);
  const ySL = NIV.sl + (NIV.entrada - NIV.sl) * be;
  const tocaTP = cierreAct >= NIV.tp;
  const tTP = tv(17) + 0.12;
  const flash = tocaTP ? 1 - L(t, tTP, tTP + 0.8, 0, 1, salida) : 0;
  const linea = (y: number, o: number, dash?: string, luz?: number): Trazo => ({ t: "p", pts: [[XV(ENTRADA) - 0.4, y, 0], [xFin, y, 0]], w: 1.6, o, prog: niv, dash, luz });
  if (niv > 0) {
    tr.push(linea(NIV.entrada, 0.85));
    tr.push(linea(ySL, 0.75, "8 10"));
    tr.push(linea(NIV.tp, 0.75, "8 10", flash));
  }
  const ond = L(t, EV.operacion, EV.operacion + 0.7, 0, 1, salida);
  if (ond > 0 && ond < 1) tr.push({ t: "p", pts: circulo([XV(ENTRADA), NIV.entrada, 0], 0.08 + 0.4 * ond, "z", 40), w: 1.6, o: 1 - ond });
  if (t >= EV.operacion) tr.push({ t: "e", c: [XV(ENTRADA), NIV.entrada, 0], r: 0.07, tipo: "esfera", luz: 0.4 });
  if (ultima >= 0) tr.push({ t: "e", c: [XV(ultima), cierreAct, 0], r: 0.05, tipo: "punto", luz: 1 });
  const pr = proyector(cam);
  // Etiquetas sobre cada nivel, pegadas a su extremo derecho sin salirse de pantalla
  const et = (y: number) => {
    const q = pr([xFin, y, 0]);
    return { x: Math.min(q.x, 1030), y: q.y - 24 };
  };
  const slTxt = be < 0.02 ? "SL" : be < 0.98 ? "SL → BE" : "BE";
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {niv > 0 && (
        <>
          <Etiqueta t={t} t0={EV.operacion + 0.2} x={et(NIV.entrada).x} y={et(NIV.entrada).y - (be > 0.5 ? 34 : 0)} size={28} alinea="der">
            ENTRADA
          </Etiqueta>
          <Etiqueta t={t} t0={EV.operacion + 0.3} x={et(ySL).x} y={et(ySL).y} size={28} o={0.85} alinea="der">
            {slTxt}
          </Etiqueta>
          <Etiqueta t={t} t0={EV.operacion + 0.4} x={et(NIV.tp).x} y={et(NIV.tp).y} size={28} o={0.85} alinea="der">
            {tocaTP ? "TP ✓" : "TP"}
          </Etiqueta>
        </>
      )}
      <Arriba>
        <Frase t={t} t0={EV.gestiona + 0.05} fin={EV.cierras - 0.1} texto="gestiona cada operación" size={84} />
      </Arriba>
      <Arriba>
        <Frase t={t} t0={EV.cierras} texto="sin que tú hagas nada" size={84} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Proporcional: torre de capas que crece, ×10 en cada tramo
const NIVELES: [number, number, number][] = [
  [1, 1000, 505],
  [6, 10000, 5052],
  [11, 100000, 50520],
];
const Prop: React.FC<P> = ({ t, s, e }) => {
  const h = 0.36;
  const grosor = 0.2;
  const ancho = 1.25;
  const fondo = 0.85;
  const cx = -0.45;
  const ts = (i: number) => s + 0.12 + i * 0.118;
  const cam = orbita(
    [0, clave(t, [[s, 0.5], [s + 1.5, 3.0], [e, 2.1]]), 0],
    clave(t, [[s, 7.5], [s + 1.5, 8.6], [e, 13]]),
    clave(t, [[s, 0.6], [e, 0.2]]),
    clave(t, [[s, -0.32], [s + 1.5, -0.18], [e, -0.04]]),
    { apertura: 50, centroY: 900 },
  );
  const tr: Trazo[] = [...bokeh("fondo", 0.08)];
  for (let i = 0; i < 12; i++) {
    const k = muelle(t, ts(i), 170, 15);
    if (k <= 0) continue;
    const y = i * h + 0.9 * (1 - k);
    const o = Math.min(k * 1.4, 1);
    const abajo = rectRedondo([cx, y, 0], ancho, fondo, 0.12);
    const arriba = rectRedondo([cx, y + grosor, 0], ancho, fondo, 0.12);
    tr.push({ t: "p", pts: abajo, w: 1.4, o: 0.8 * o });
    tr.push({ t: "p", pts: arriba, w: 1.4, o: 0.95 * o });
    for (const [sx, sz] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) {
      tr.push({ t: "l", a: [cx + (sx * ancho) / 2, y, (sz * fondo) / 2], b: [cx + (sx * ancho) / 2, y + grosor, (sz * fondo) / 2], w: 1, o: 0.5 * o });
    }
    // Arcos dentro de cada capa, como en la referencia
    for (const [dx, a] of [[-0.18, 0.32], [0.16, 0.26]]) {
      tr.push({ t: "p", pts: Array.from({ length: 17 }, (_, q) => [cx + dx + a * Math.cos((Math.PI * q) / 16), y + 0.02 + grosor * 0.75 * Math.sin((Math.PI * q) / 16), 0] as V3), w: 1, o: 0.4 * o });
    }
  }
  const pr = proyector(cam);
  return (
    <>
      <Escena
        cam={cam}
        trazos={[
          ...tr,
          ...NIVELES.map(([n]): Trazo => {
            const y = n * h + grosor / 2;
            return { t: "p", pts: [[cx + ancho / 2, y, 0], [cx + ancho / 2 + 0.42, y, 0]], w: 1.4, o: 0.75, prog: L(t, ts(n) + 0.1, ts(n) + 0.4, 0, 1, salida) };
          }),
        ]}
      />
      {NIVELES.map(([n, capital, ben], k) => {
        const y = n * h + grosor / 2;
        const q = pr([cx + ancho / 2 + 0.47, y, 0]);
        const t0 = ts(n) + 0.15;
        const cuenta = L(t, t0, t0 + 0.6, 0, 1, (x) => 1 - Math.pow(1 - x, 3));
        const x10 = pr([cx - ancho / 2 - 0.12, y - 2.5 * h, 0]);
        return (
          <div key={n}>
            <div style={{ position: "absolute", left: q.x, top: q.y, transform: "translateY(-50%)" }}>
              <Enfoca t={t} t0={t0} d={0.35}>
                <div style={mono(24, 0.6)}>{`${euros(capital)} €`}</div>
                <div style={mono(44)}>{`+${euros(ben * cuenta)} €`}</div>
              </Enfoca>
            </div>
            {k > 0 && (
              <Etiqueta t={t} t0={t0 + 0.1} x={x10.x} y={x10.y} size={26} o={0.6} alinea="der">
                ×10
              </Etiqueta>
            )}
          </div>
        );
      })}
      <Arriba top={250}>
        <Frase t={t} t0={EV.proporcional - 0.05} texto="directamente proporcional" size={78} paso={0.1} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 7. CTA: fondo blanco, la frase en píldoras unidas por arcos
const FILAS = [["queréis", "más", "información"], ["escribidme", "directamente"], ["al", "privado"]];
const PILDORA = 62;
const anchoPildora = (w: string) => w.length * PILDORA * 0.56 + 52;
const momento = (w: string) => datos.palabras.find((p) => p.s >= EV.p_cta_s - 0.1 && limpia(p.w) === w)?.s ?? EV.p_cta_s;
const Cta: React.FC<P> = ({ t, s }) => {
  const alto = PILDORA * 1.4;
  const hueco = 16;
  const sepFila = 70;
  const top0 = 900 - (FILAS.length * alto + (FILAS.length - 1) * sepFila) / 2;
  const piezas: { w: string; r: number; x: number; y: number; ancho: number; t0: number }[] = [];
  FILAS.forEach((fila, r) => {
    const total = fila.reduce((a, w) => a + anchoPildora(w), 0) + hueco * (fila.length - 1);
    let x = (ANCHO - total) / 2;
    for (const w of fila) {
      piezas.push({ w, r, x, y: top0 + r * (alto + sepFila), ancho: anchoPildora(w), t0: momento(w) });
      x += anchoPildora(w) + hueco;
    }
  });
  const fondo = lerp(t, s, s + 0.3, 0, 1, salida);
  const rayas = 1 - L(t, piezas[0].t0 - 0.2, piezas[0].t0 + 0.4, 0, 1);
  const final = muelle(t, EV.privado + 0.02, 220, 15);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 60% at 50% 46%, #fbfbf9, #e9e9e6)`, opacity: fondo }}>
      {/* Texto de fondo emborronado en rayas grises, como en la referencia */}
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0, opacity: rayas * 0.9 }}>
        {Array.from({ length: 16 }).map((_, f) => {
          let x = 150;
          const out = [];
          for (let k = 0; x < 930; k++) {
            const w = 40 + ruido(f * 31 + k) * 90;
            if (x + w > 930) break;
            out.push(<rect key={k} x={x} y={560 + f * 46} width={w} height={11} rx={5.5} fill="#cfcfcb" />);
            x += w + 18;
          }
          return <g key={f}>{out}</g>;
        })}
      </svg>
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
        {piezas.map((b, j) =>
          piezas.slice(0, j).map((a, i) => {
            if (a.r !== b.r) return null;
            const prog = L(t, b.t0, b.t0 + 0.5, 0, 1, salida);
            const xa = a.x + a.ancho / 2;
            const xb = b.x + b.ancho / 2;
            return [0, 1, 2].map((m) => {
              const hgt = 70 + Math.abs(xb - xa) * (0.35 + m * 0.14);
              const peso = 0.25 + ruido(i * 7 + j * 13 + m) * 0.75;
              return (
                <path
                  key={`${i}-${j}-${m}`}
                  d={`M${xb + (m - 1) * 6},${b.y} C${xb},${b.y - hgt} ${xa},${a.y - hgt} ${xa + (m - 1) * 6},${a.y}`}
                  fill="none"
                  stroke="#111"
                  strokeOpacity={0.25 + 0.6 * peso}
                  strokeWidth={1 + 3.2 * peso}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - prog}
                />
              );
            });
          }),
        )}
      </svg>
      {piezas.map((p) => {
        const k = muelle(t, p.t0 - 0.04, 200, 14);
        if (k <= 0) return null;
        const marca = p.w === "privado" ? final : 0;
        const gris = 1 - L(t, p.t0, p.t0 + 0.5, 0, 1, salida);
        const fondoP = marca > 0.02 ? `rgba(17,17,17,${Math.min(marca, 1)})` : `rgb(${255 - 38 * gris},${255 - 38 * gris},${255 - 38 * gris})`;
        return (
          <div
            key={p.w}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              width: p.ancho,
              height: alto,
              borderRadius: 999,
              border: "3px solid #111",
              background: fondoP,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: PILDORA,
              letterSpacing: "-0.01em",
              color: marca > 0.5 ? "#fff" : "#111",
              opacity: Math.min(k * 1.6, 1),
              transform: `scale(${0.7 + 0.3 * k + 0.06 * Math.sin(Math.min(marca, 1) * Math.PI)})`,
            }}
          >
            {p.w}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
