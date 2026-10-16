// Motor 3D mínimo para motion graphics de alambre: cámara en perspectiva, profundidad de campo por capas y brillo.
// Todo se dibuja en un único SVG a pantalla completa; las coordenadas del mundo usan y hacia arriba.
import React from "react";
import { Easing, interpolate } from "remotion";
import { ALTO, ANCHO } from "../Viral/util";

export type V3 = [number, number, number];
export type Camara = { pos: V3; mira: V3; fov?: number; foco?: number; apertura?: number; centroY?: number };

const resta = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cruz = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const mezcla = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];

// Cámara en órbita alrededor de un punto: acimut en torno al eje vertical, elevación sobre el horizonte
export const orbita = (mira: V3, dist: number, azim: number, elev: number, extra?: Partial<Camara>): Camara => ({
  pos: [mira[0] + dist * Math.cos(elev) * Math.sin(azim), mira[1] + dist * Math.sin(elev), mira[2] + dist * Math.cos(elev) * Math.cos(azim)],
  mira,
  foco: dist,
  ...extra,
});

export type Proy = { x: number; y: number; z: number; k: number };
export const proyector = (cam: Camara) => {
  const f = unit(resta(cam.mira, cam.pos));
  const r = unit(cruz(f, [0, 1, 0]));
  const u = cruz(r, f);
  const F = ALTO / 2 / Math.tan(((cam.fov ?? 34) * Math.PI) / 360);
  const cy = cam.centroY ?? ALTO * 0.42;
  return (p: V3): Proy => {
    const d = resta(p, cam.pos);
    const z = Math.max(dot(d, f), 0.05);
    const k = F / z; // píxeles por unidad del mundo a esa profundidad
    return { x: ANCHO / 2 + dot(d, r) * k, y: cy - dot(d, u) * k, z, k };
  };
};

// ------------------------------------------------------------------ geometría
// Circunferencia en el plano perpendicular al eje dado
export const circulo = (c: V3, r: number, eje: "x" | "y" | "z" = "y", n = 64, a0 = 0, a1 = Math.PI * 2): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    const p = Math.cos(a) * r;
    const q = Math.sin(a) * r;
    return eje === "y" ? [c[0] + p, c[1], c[2] + q] : eje === "x" ? [c[0], c[1] + q, c[2] + p] : [c[0] + p, c[1] + q, c[2]];
  });

// Rectángulo de esquinas redondeadas en un plano horizontal
export const rectRedondo = (c: V3, w: number, d: number, radio: number, n = 5): V3[] => {
  const pts: V3[] = [];
  const esquinas: [number, number, number][] = [
    [w / 2 - radio, d / 2 - radio, 0],
    [-w / 2 + radio, d / 2 - radio, Math.PI / 2],
    [-w / 2 + radio, -d / 2 + radio, Math.PI],
    [w / 2 - radio, -d / 2 + radio, (Math.PI * 3) / 2],
  ];
  for (const [x, z, a0] of esquinas) {
    for (let i = 0; i <= n; i++) {
      const a = a0 + (Math.PI / 2) * (i / n);
      pts.push([c[0] + x + Math.cos(a) * radio, c[1], c[2] + z + Math.sin(a) * radio]);
    }
  }
  pts.push(pts[0]);
  return pts;
};

// Aristas de una caja (12 segmentos)
export const caja = (min: V3, max: V3): [V3, V3][] => {
  const [x0, y0, z0] = min;
  const [x1, y1, z1] = max;
  const v: V3[] = [
    [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1],
    [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1],
  ];
  const e: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  return e.map(([a, b]) => [v[a], v[b]]);
};

// ------------------------------------------------------------------ animación
export const io = Easing.bezier(0.65, 0, 0.35, 1);
// Interpolación por fotogramas clave con curva cinematográfica en cada tramo
export const clave = (t: number, puntos: [number, number][], easing = io) =>
  interpolate(
    t,
    puntos.map((p) => p[0]),
    puntos.map((p) => p[1]),
    { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

// ------------------------------------------------------------------ dibujo
// o: opacidad · w: grosor en px · luz: halo extra (0-1) · prog: fracción dibujada de una polilínea
export type Trazo =
  | { t: "l"; a: V3; b: V3; w?: number; o?: number; dash?: string; luz?: number }
  | { t: "p"; pts: V3[]; w?: number; o?: number; dash?: string; prog?: number; luz?: number; relleno?: string }
  | { t: "e"; c: V3; r: number; o?: number; tipo?: "esfera" | "nodo" | "punto" | "aro"; luz?: number; w?: number };

const DESENFOQUES = [0, 1.4, 3, 5.5, 9, 14];

const recorta = (pts: V3[], prog: number): V3[] => {
  if (prog >= 1) return pts;
  if (prog <= 0) return [];
  const pos = prog * (pts.length - 1);
  const i = Math.floor(pos);
  return [...pts.slice(0, i + 1), mezcla(pts[i], pts[Math.min(i + 1, pts.length - 1)], pos - i)];
};

export const Escena: React.FC<{ cam: Camara; trazos: Trazo[]; encima?: (pr: (p: V3) => Proy) => React.ReactNode }> = ({ cam, trazos, encima }) => {
  const pr = proyector(cam);
  const foco = cam.foco ?? 8;
  const apertura = cam.apertura ?? 0;
  const capas: React.ReactNode[][] = DESENFOQUES.map(() => []);
  const halos: React.ReactNode[] = [];
  // Más lejos primero: lo cercano se pinta encima
  const lista = trazos
    .map((tr, i) => {
      const z = tr.t === "l" ? (pr(tr.a).z + pr(tr.b).z) / 2 : tr.t === "e" ? pr(tr.c).z : tr.pts.length ? pr(tr.pts[Math.floor(tr.pts.length / 2)]).z : 0;
      return { tr, i, z };
    })
    .sort((a, b) => b.z - a.z);

  for (const { tr, i, z } of lista) {
    const coc = apertura * Math.abs(1 / foco - 1 / z) * 10;
    let capa = 0;
    for (let c = 0; c < DESENFOQUES.length; c++) if (coc >= DESENFOQUES[c] - 0.6) capa = c;
    const o = tr.o ?? 1;
    if (o <= 0.003) continue;
    let nodo: React.ReactNode = null;
    if (tr.t === "l") {
      const a = pr(tr.a);
      const b = pr(tr.b);
      nodo = <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#fff" strokeOpacity={o} strokeWidth={tr.w ?? 1.4} strokeDasharray={tr.dash} strokeLinecap="round" />;
    } else if (tr.t === "p") {
      const pts = recorta(tr.pts, tr.prog ?? 1);
      if (pts.length < 2) continue;
      const d = pts.map((p, j) => {
        const q = pr(p);
        return `${j ? "L" : "M"}${q.x.toFixed(1)},${q.y.toFixed(1)}`;
      });
      nodo = (
        <path key={i} d={d.join("")} fill={tr.relleno ?? "none"} stroke="#fff" strokeOpacity={o} fillOpacity={tr.relleno ? o : undefined} strokeWidth={tr.w ?? 1.4} strokeDasharray={tr.dash} strokeLinejoin="round" strokeLinecap="round" />
      );
    } else {
      const c = pr(tr.c);
      const r = Math.max(tr.r * c.k, 0.6);
      const tipo = tr.tipo ?? "esfera";
      nodo =
        tipo === "esfera" ? (
          <circle key={i} cx={c.x} cy={c.y} r={r} fill="url(#esfera)" stroke="#fff" strokeOpacity={0.85 * o} strokeWidth={Math.max(1, r * 0.035)} opacity={o} />
        ) : tipo === "nodo" ? (
          <circle key={i} cx={c.x} cy={c.y} r={r} fill="rgba(140,140,140,0.5)" stroke="#fff" strokeWidth={tr.w ?? 1.3} opacity={o} />
        ) : tipo === "aro" ? (
          <circle key={i} cx={c.x} cy={c.y} r={r} fill="none" stroke="#fff" strokeWidth={tr.w ?? 1.5} opacity={o} />
        ) : (
          <circle key={i} cx={c.x} cy={c.y} r={r} fill="#fff" opacity={o} />
        );
    }
    capas[capa].push(nodo);
    if (tr.luz) halos.push(<g key={`h${i}`} opacity={tr.luz}>{nodo}</g>);
  }

  const region = { filterUnits: "userSpaceOnUse" as const, x: -300, y: -300, width: ANCHO + 600, height: ALTO + 600 };
  return (
    <svg width={ANCHO} height={ALTO} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <radialGradient id="esfera" cx="40%" cy="34%" r="70%" fx="32%" fy="24%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.14" stopColor="#d9d9d9" />
          <stop offset="0.5" stopColor="#7d7d7d" />
          <stop offset="0.86" stopColor="#3b3b3b" />
          <stop offset="1" stopColor="#6a6a6a" />
        </radialGradient>
        {DESENFOQUES.map((b, c) =>
          b ? (
            <filter key={c} id={`dof${c}`} {...region}>
              <feGaussianBlur stdDeviation={b} />
            </filter>
          ) : null,
        )}
        <filter id="halo" {...region}>
          <feGaussianBlur stdDeviation={9} />
        </filter>
      </defs>
      {capas.map((g, c) =>
        g.length ? (
          <g key={c} filter={DESENFOQUES[c] ? `url(#dof${c})` : undefined}>
            {g}
          </g>
        ) : null,
      )}
      {halos.length ? (
        <g filter="url(#halo)" style={{ mixBlendMode: "screen" }}>
          <g>{halos}</g>
          <g>{halos}</g>
        </g>
      ) : null}
      {encima?.(pr)}
    </svg>
  );
};

// Campo de aros desenfocados al fondo (el bokeh de la referencia)
export const bokeh = (plano: "fondo" | "suelo", o = 0.1, desplaza = 0): Trazo[] => {
  const out: Trazo[] = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 8; j++) {
      const x = (i - 4) * 2.1 + (j % 2) * 1.05 + desplaza;
      const c: V3 = plano === "fondo" ? [x, (j - 3) * 1.9, -11] : [x, -4.5, (j - 6) * 2.1];
      out.push({ t: "e", c, r: 0.42, tipo: "aro", o, w: 2.5 });
    }
  }
  return out;
};
