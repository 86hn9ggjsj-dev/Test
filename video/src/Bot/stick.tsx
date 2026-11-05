// Stickman 2D con física: cuerpo macizo (cabeza blanca, extremidades gruesas y curvas), cinemática inversa para que las
// rodillas y los codos se doblen solos con los pies plantados, y muelles por canal para que todo tenga inercia
// (la cabeza se retrasa, las manos rebotan, los saltos se anticipan y se amortiguan). Se dibuja en SVG encima de la escena.
import React from "react";

// Unidades del cuerpo: suelo en y = 0 y la cadera de pie a 0,79 (y hacia arriba)
export type Cuerpo = {
  x: number;
  y: number; // cadera
  incl: number; // inclinación lateral del tronco (rad, + hacia la derecha de la pantalla)
  cabeza: number; // ladeo extra de la cabeza (rad)
  agacha: number; // 0…1 cabeza caída hacia el pecho
  mira: number; // mirada −1…1
  mIx: number;
  mIy: number;
  mDx: number;
  mDy: number; // manos, relativas al hombro (en el marco del tronco)
  pIx: number;
  pIy: number;
  pDx: number;
  pDy: number; // pies, absolutos
  boca: number; // −1 triste … 1 sonrisa
  abre: number; // boca abierta 0…1
  cejas: number; // −1 preocupado … 1 sorpresa
  ojos: number; // 1 normal, más de 1 sorpresa, menos de 1 cansado
  agobio: number; // 0…1 rayas y gota de sudor
};

export const REPOSO: Cuerpo = {
  x: 0, y: 0.79, incl: 0, cabeza: 0, agacha: 0, mira: 0,
  mIx: -0.15, mIy: -0.52, mDx: 0.15, mDy: -0.52,
  pIx: -0.14, pIy: 0, pDx: 0.14, pDy: 0,
  boca: 0.2, abre: 0, cejas: 0, ojos: 1, agobio: 0,
};

// Frecuencia (ω) y amortiguamiento (ζ) de cada canal: menos ω = más retraso; ζ < 1 = rebota un poco
const MUELLES: Record<keyof Cuerpo, [number, number]> = {
  x: [10, 0.85], y: [17, 0.6], incl: [11, 0.7], cabeza: [9, 0.55], agacha: [9, 0.75], mira: [16, 1],
  mIx: [14, 0.5], mIy: [14, 0.5], mDx: [16, 0.5], mDy: [16, 0.5],
  pIx: [22, 0.9], pIy: [24, 0.85], pDx: [22, 0.9], pDy: [24, 0.85],
  boca: [18, 0.9], abre: [22, 0.75], cejas: [16, 0.7], ojos: [22, 0.5], agobio: [8, 1],
};

// Claves de animación: cada una cambia solo los canales que nombra y los muelles se encargan del recorrido
export type Clave = [number, Partial<Cuerpo>];
export type Estado = Cuerpo & { vy: number; vx: number };

const CANALES = Object.keys(REPOSO) as (keyof Cuerpo)[];

// Simula los muelles desde el principio (determinista: el mismo fotograma da siempre lo mismo)
export const cuerpoEn = (t: number, claves: Clave[], inicio: Partial<Cuerpo> = {}, dt = 1 / 240): Estado => {
  const metas: [number, Cuerpo][] = [];
  let acum: Cuerpo = { ...REPOSO, ...inicio };
  const x = { ...acum };
  for (const [ti, c] of claves) {
    acum = { ...acum, ...c };
    metas.push([ti, acum]);
  }
  const v = {} as Record<keyof Cuerpo, number>;
  for (const k of CANALES) v[k] = 0;
  let meta: Cuerpo = { ...REPOSO, ...inicio };
  let i = 0;
  for (let s = 0; s < t; s += dt) {
    while (i < metas.length && metas[i][0] <= s) meta = metas[i++][1];
    for (const k of CANALES) {
      const [w, z] = MUELLES[k];
      v[k] += (w * w * (meta[k] - x[k]) - 2 * z * w * v[k]) * dt;
      x[k] += v[k] * dt;
    }
  }
  return { ...x, vy: v.y, vx: v.x };
};

const TORSO = 0.55;
const CUELLO = 0.06;
const R = 0.18;
const BRAZO = [0.3, 0.29];
const PIERNA = [0.41, 0.4];

type P2 = [number, number];
const lim = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Cinemática inversa de dos huesos; la articulación se dobla hacia fuera (lado −1 izquierda, +1 derecha)
const ik = (raiz: P2, obj: P2, a: number, b: number, lado: number, abajo = 0): [P2, P2] => {
  let dx = obj[0] - raiz[0];
  let dy = obj[1] - raiz[1];
  let d = Math.hypot(dx, dy);
  const max = (a + b) * 0.999;
  if (d > max) {
    dx *= max / d;
    dy *= max / d;
    d = max;
  }
  d = Math.max(d, Math.abs(a - b) + 0.02);
  const ang = Math.atan2(dy, dx);
  const off = Math.acos(lim((a * a + d * d - b * b) / (2 * a * d), -1, 1));
  const cand = [ang + off, ang - off].map((q): P2 => [raiz[0] + Math.cos(q) * a, raiz[1] + Math.sin(q) * a]);
  const nota = (j: P2) => lado * (j[0] - raiz[0]) - abajo * (j[1] - raiz[1]);
  return [nota(cand[0]) >= nota(cand[1]) ? cand[0] : cand[1], [raiz[0] + dx, raiz[1] + dy]];
};

// Curva suave que pasa por la articulación (cuadrática con el control calculado para cruzarla a mitad de recorrido)
const curva = (a: P2, j: P2, b: P2): string => {
  const c: P2 = [2 * j[0] - (a[0] + b[0]) / 2, 2 * j[1] - (a[1] + b[1]) / 2];
  return `M${a[0].toFixed(1)},${a[1].toFixed(1)} Q${c[0].toFixed(1)},${c[1].toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}`;
};

// Dibuja el stickman. (ox, oy): punto del suelo bajo x = 0, en píxeles; s: píxeles por unidad
export const Stick: React.FC<{ c: Estado; ox: number; oy: number; s: number; t: number; o?: number }> = ({ c, ox, oy, s, t, o = 1 }) => {
  // Vida: respira, la cadera reparte el peso y parpadea de vez en cuando
  const resp = Math.sin(t * 2.4);
  const parpadeo = t % 2.9 > 2.78 ? 0.12 : 1;
  // Estirar y encoger con la velocidad vertical (squash & stretch) y manos que se quedan atrás
  const estira = lim(c.vy * 0.035, -0.07, 0.09);
  const retraso = lim(c.vy * 0.05, -0.09, 0.09);
  const P = (p: P2): P2 => [ox + p[0] * s, oy - p[1] * s];
  const cadera: P2 = [c.x + 0.008 * Math.sin(t * 1.4), c.y];
  const torso = TORSO * (1 + 0.012 * resp + estira);
  const sn = Math.sin(c.incl);
  const cs = Math.cos(c.incl);
  const cuello: P2 = [cadera[0] + sn * torso, cadera[1] + cs * torso];
  const hombro: P2 = [cuello[0] - sn * 0.05, cuello[1] - cs * 0.05];
  const angC = c.incl + c.cabeza + 0.03 * Math.sin(t * 1.7 + 1);
  const alzada = CUELLO + R - c.agacha * 0.1;
  const cab: P2 = [cuello[0] + Math.sin(angC) * alzada, cuello[1] + Math.cos(angC) * alzada];
  // Manos en el marco del tronco: si se inclina, las manos acompañan (las de la cabeza siguen en la cabeza)
  const mano = (mx: number, my: number): P2 => {
    const yy = my - retraso;
    return [hombro[0] + mx * cs + yy * sn, hombro[1] - mx * sn + yy * cs];
  };
  const brazos = ([[-1, c.mIx, c.mIy], [1, c.mDx, c.mDy]] as [number, number, number][]).map(([lado, mx, my]) => {
    const [codo, fin] = ik(hombro, mano(mx, my), BRAZO[0], BRAZO[1], lado, 0.5);
    return { codo, fin, lado };
  });
  const piernas = ([[-1, c.pIx, c.pIy], [1, c.pDx, c.pDy]] as [number, number, number][]).map(([lado, px, py]) => {
    const [rodilla, pie] = ik(cadera, [px, Math.max(0, py)], PIERNA[0], PIERNA[1], lado);
    return { rodilla, pie, lado };
  });
  const w = 0.06 * s;
  const sombra = lim(1 - (Math.min(c.pIy, c.pDy) + Math.max(0, c.y - 0.79)) * 1.6, 0.25, 1);
  const [hx, hy] = P(cab);
  const giro = (-angC * 180) / Math.PI;
  const u = s;
  const cara = c.agacha * 0.055 * u;
  const ojoY = parpadeo * c.ojos * (1 - 0.35 * c.agacha);
  // Cejas: con sorpresa suben enteras; con preocupación sube la punta interior
  const sube = (interior: boolean) => (c.cejas > 0 ? 0.035 * c.cejas : interior ? 0.032 * -c.cejas : -0.012 * -c.cejas);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: o }}>
      <defs>
        <radialGradient id="sombraStick">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.22} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={P([c.x, 0])[0]} cy={oy + 6} rx={0.42 * s * sombra} ry={0.06 * s * sombra} fill="url(#sombraStick)" />
      <g fill="none" stroke="#fff" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
        {piernas.map(({ rodilla, pie, lado }) => {
          const [fx, fy] = P(pie);
          return (
            <g key={`p${lado}`}>
              <path d={curva(P(cadera), P(rodilla), P(pie))} />
              <path d={`M${fx.toFixed(1)},${fy.toFixed(1)} L${(fx + lado * 0.085 * s).toFixed(1)},${(fy + 0.004 * s).toFixed(1)}`} />
            </g>
          );
        })}
        <path d={curva(P(cadera), P([(cadera[0] + cuello[0]) / 2 + cs * 0.012, (cadera[1] + cuello[1]) / 2]), P(cuello))} />
        {brazos.map(({ codo, fin, lado }) => (
          <path key={`b${lado}`} d={curva(P(hombro), P(codo), P(fin))} />
        ))}
      </g>
      {brazos.map(({ fin, lado }) => (
        <circle key={`m${lado}`} cx={P(fin)[0]} cy={P(fin)[1]} r={w * 0.68} fill="#fff" />
      ))}
      {/* Cabeza maciza; la cara se gira con el cuello y baja cuando agacha la cabeza */}
      <g transform={`translate(${hx.toFixed(1)},${hy.toFixed(1)}) rotate(${giro.toFixed(2)})`}>
        <circle r={R * u} fill="#fff" />
        <g transform={`translate(${(c.mira * 0.035 * u).toFixed(1)},${cara.toFixed(1)})`}>
          {[-1, 1].map((d) => {
            const ex = d * 0.068 * u;
            const by = -0.088 * u;
            return (
              <g key={d}>
                <ellipse cx={ex + c.mira * 0.012 * u} cy={-0.018 * u} rx={0.026 * u * lim(c.ojos, 0.85, 1.3)} ry={0.034 * u * Math.max(0.1, ojoY)} fill="#000" />
                <path
                  d={`M${(ex - d * 0.036 * u).toFixed(1)},${(by - sube(true) * u).toFixed(1)} L${(ex + d * 0.036 * u).toFixed(1)},${(by - sube(false) * u).toFixed(1)}`}
                  stroke="#000"
                  strokeWidth={0.018 * u}
                  strokeLinecap="round"
                />
              </g>
            );
          })}
          {c.abre > 0.12 && c.boca > 0.4 ? (
            // Sonrisa abierta en forma de D
            <path d={`M${-0.058 * u},${0.052 * u} L${0.058 * u},${0.052 * u} Q0,${(0.052 + 0.13 * c.abre) * u} ${-0.058 * u},${0.052 * u} Z`} fill="#000" />
          ) : c.abre > 0.12 ? (
            <ellipse cx={0} cy={0.078 * u} rx={0.034 * u * (1 - 0.2 * c.abre)} ry={0.048 * u * c.abre} fill="#000" />
          ) : (
            <path d={`M${-0.052 * u},${0.072 * u} Q0,${(0.072 + c.boca * 0.06) * u} ${0.052 * u},${0.072 * u}`} stroke="#000" strokeWidth={0.019 * u} fill="none" strokeLinecap="round" />
          )}
        </g>
      </g>
      {/* Agobio: rayas que tiemblan y una gota de sudor que resbala */}
      {c.agobio > 0.05 && (
        <g opacity={Math.min(1, c.agobio)} stroke="#fff" strokeWidth={0.022 * u} strokeLinecap="round">
          {[0, 1, 2].map((i) => {
            const a = ((-58 + i * 30) * Math.PI) / 180 + 0.07 * Math.sin(t * 34 + i * 2);
            const r0 = R * u * 1.32;
            const r1 = R * u * 1.72;
            return <line key={i} x1={hx + Math.sin(a) * r0} y1={hy - Math.cos(a) * r0} x2={hx + Math.sin(a) * r1} y2={hy - Math.cos(a) * r1} />;
          })}
          {(() => {
            const fase = (t * 0.9) % 1;
            const gx = hx + R * u * 0.98;
            const gy = hy - R * u * 0.25 + fase * 0.16 * u;
            return (
              <path
                d={`M${gx},${gy} q${0.028 * u},${0.05 * u} 0,${0.062 * u} q${-0.028 * u},${-0.012 * u} 0,${-0.062 * u}`}
                fill="#fff"
                stroke="none"
                opacity={1 - fase * 0.8}
              />
            );
          })()}
        </g>
      )}
    </svg>
  );
};
