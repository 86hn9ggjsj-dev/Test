// Reel de alcance "Escondió sus pérdidas en la cuenta 88888 y hundió un banco de 233 años" (~41 s). Solo subtítulos abajo.
// Escenas 3D en wireframe (blanco y negro con rojo y verde puntuales) con el stickman 2D dentro: mete velas rojas a
// escondidas en la caja fuerte «88888» y la cámara gira hasta el banco de 1762, que se derrumba; el trader estrella en
// Singapur doblando fichas; Londres viendo beneficios (sin stickman); el «sígueme» con claqueta; el terremoto de Kobe
// con el suelo en ondas y la caja que revienta (−827 M £); «vendido por 1 £» y el cubito de −20.000 £ que lo empezó
// todo; y la pregunta CERRAR o ESCONDER. Tiempos en src/gen/leeson.json (scripts/leeson.py).
import React from "react";
import { useCurrentFrame } from "remotion";
import datos from "../gen/leeson.json";
import { L, mono, muelle } from "../Bot/piezas";
import { circulo, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { cristal, fichas, ROJO, suelo, velas, VERDE } from "../Bot/kit";
import { monitor } from "../Bot/monigote";
import { Clave, cuerpoEn, Estado } from "../Bot/stick";
import { anclaje, BRAZOS_ARRIBA, CHOQUE, Exclama, FlashRojo, MANOS_CABEZA, SiguemeStick, StickMundo } from "../Bot/comun";
import { CamaraTiembla, fr, Marcador, PreguntaDos, Sello } from "../Bot/historia";
import { claves, golpe, Montaje, P, paseo, sacude } from "../Explica/Montaje";

export const LEESON_FPS = datos.fps;
export const LEESON_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;

// ------------------------------------------------------------------ decorados
// Caja fuerte con su display; puerta: 0 cerrada … 1 abierta de golpe
const cajaFuerte = (tr: Trazo[], c: V3, s: number, t: number, puerta = 0, color = "#fff", luz = 0.2) => {
  const [x, y, z] = c;
  const h = 0.5 * s;
  cristal(tr, [x - h / 2, y, z - h / 2], [x + h / 2, y + h, z + h / 2], color, 1, luz, 0.06);
  const zf = z + h / 2 + 0.003;
  // Puerta: gira sobre su bisagra izquierda
  const a = puerta * 1.9;
  const bx = x - h / 2 + 0.04 * s;
  const ancho = h - 0.08 * s;
  const esq = (u: number, v: number): V3 => [bx + Math.cos(a) * ancho * u, y + 0.04 * s + v * (h - 0.08 * s), zf + Math.sin(a) * ancho * u];
  tr.push({ t: "p", pts: [esq(0, 0), esq(1, 0), esq(1, 1), esq(0, 1), esq(0, 0)], w: 2.2, o: 1, color, relleno: "#000", oRelleno: 0.85, luz });
  const centro = esq(0.5, 0.42);
  tr.push({ t: "p", pts: circulo(centro, 0.085 * s, "z", 28).map((p) => [p[0], p[1], centro[2]] as V3), w: 2, o: puerta > 0.2 ? 0.3 : 1, color });
  const g = t * 3;
  if (puerta < 0.2) {
    tr.push({ t: "l", a: centro, b: [centro[0] + Math.sin(g) * 0.07 * s, centro[1] + Math.cos(g) * 0.07 * s, centro[2]], w: 2, o: 1, color });
    tr.push({ t: "l", a: esq(0.88, 0.32), b: esq(0.88, 0.55), w: 3, o: 1, color });
    tr.push({ t: "p", pts: [esq(0.22, 0.72), esq(0.78, 0.72), esq(0.78, 0.86), esq(0.22, 0.86), esq(0.22, 0.72)], w: 1.6, o: 0.9, color });
  }
  return { display: esq(0.5, 0.79), h };
};

// Banco de columnas; colapso: 0 en pie … 1 en el suelo
const banco = (tr: Trazo[], bx: number, t: number, colapso = 0, grieta = 0) => {
  const rojo = colapso > 0.001 || grieta > 0.5;
  const col = rojo ? ROJO : "#fff";
  const u = colapso;
  cristal(tr, [bx - 0.95, -1, -0.5], [bx + 0.95, -0.94, 0.5], "#fff", 0.9, 0.12, 0.04);
  cristal(tr, [bx - 0.88, -0.94, -0.45], [bx + 0.88, -0.88, 0.45], "#fff", 0.9, 0.12, 0.04);
  // Columnas que se inclinan y caen
  for (let i = 0; i < 6; i++) {
    const x = bx - 0.7 + i * 0.28;
    const dir = i % 2 ? 1 : -1;
    const th = dir * (0.9 + 0.3 * fr(Math.sin(i * 7.7) * 13.1)) * u * u * 1.5;
    const hh = 1.0;
    const w = 0.055;
    const base: V3 = [x, -0.88 - 0.1 * u * u, 0.3];
    const rot = (dx: number, dy: number): V3 => [base[0] + dx * Math.cos(th) + dy * Math.sin(th), base[1] - dx * Math.sin(th) + dy * Math.cos(th), base[2]];
    tr.push({ t: "p", pts: [rot(-w, 0), rot(w, 0), rot(w, hh), rot(-w, hh), rot(-w, 0)], w: 2, o: 1, color: col, relleno: col, oRelleno: 0.08, luz: 0.15 });
    tr.push({ t: "l", a: rot(0, 0.05), b: rot(0, hh - 0.05), w: 1, o: 0.4, color: col });
  }
  // Entablamento y frontón: bajan y se inclinan
  const dy = -1.05 * u * u;
  const ang = 0.35 * u * u;
  const cx = bx;
  const cy = 0.26 + dy;
  const r = (x: number, y: number): V3 => [cx + (x - cx) * Math.cos(ang) - (y - 0.26) * Math.sin(ang), cy + (x - cx) * Math.sin(ang) + (y - 0.26) * Math.cos(ang), 0.42];
  tr.push({ t: "p", pts: [r(bx - 0.85, 0.12), r(bx + 0.85, 0.12), r(bx + 0.85, 0.26), r(bx - 0.85, 0.26), r(bx - 0.85, 0.12)], w: 2.4, o: 1, color: col, relleno: "#000", oRelleno: 0.85, luz: 0.2 });
  tr.push({ t: "p", pts: [r(bx - 0.88, 0.26), r(bx, 0.62), r(bx + 0.88, 0.26), r(bx - 0.88, 0.26)], w: 2.4, o: 1, color: col, relleno: "#000", oRelleno: 0.85, luz: 0.2 });
  // Grieta que baja por la fachada
  if (grieta > 0 && u < 0.05) {
    const pts: V3[] = [];
    for (let k = 0; k <= 8 * grieta; k++) pts.push([bx + 0.06 * Math.sin(k * 2.3) - 0.1, 0.55 - k * 0.17, 0.43]);
    if (pts.length > 1) tr.push({ t: "p", pts, w: 2.6, o: 0.95, color: ROJO, luz: 0.5 });
  }
  // Polvo al caer
  if (u > 0.05) for (let k = 0; k < 30; k++) {
    const px = bx - 1 + fr(Math.sin(k * 3.1) * 77.7) * 2;
    const py = -1 + u * (0.1 + fr(Math.sin(k * 5.7) * 31.3) * 0.5);
    tr.push({ t: "e", c: [px, py, 0.5 + fr(Math.sin(k * 9.1) * 11.9) * 0.3], r: 0.006, tipo: "punto", o: 0.6 * (1 - u * 0.5), color: ROJO });
  }
  return { rotulo: r(bx, 0.19) as V3 };
};

// Estrella de cinco puntas en 3D (plano z)
const estrella = (tr: Trazo[], c: V3, r: number, o = 1, luz = 0.5) => {
  const pts: V3[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push([c[0] + Math.cos(a) * rr, c[1] - Math.sin(a) * rr, c[2]]);
  }
  tr.push({ t: "p", pts, w: 2.4, o, relleno: "#fff", oRelleno: 0.25 * o, luz });
};

// ------------------------------------------------------------------ 1. Hook: la caja 88888 y el banco de 1762 que se derrumba
const BX = 2.1;
const LANZA = [0.15, 1.1, 1.75, EV["88888"] + 1.5, EV["88888"] + 2.15];
const T_PAN = EV.hundio - 0.6;
const HOOK: Clave[] = [
  [0.55, { mira: -1, cabeza: -0.08 }],
  [1.0, { mira: 0.9, cabeza: 0, mDx: 0.5, mDy: -0.15 }],
  [1.35, { mDx: 0.3, mDy: -0.42 }],
  [1.6, { mDx: 0.5, mDy: -0.15 }],
  [1.95, { mDx: 0.2, mDy: -0.5, mira: -1 }],
  [EV["88888"] - 0.3, { mIx: 0.02, mIy: 0.16, mira: 0.1, cabeza: 0.06, boca: 0, cejas: 0.4, ojos: 0.85 }],
  [EV["88888"] + 1.3, { mIx: -0.15, mIy: -0.52, mDx: 0.5, mDy: -0.15, mira: 0.9, cabeza: 0, cejas: -0.5 }],
  [EV["88888"] + 1.85, { mDx: 0.3, mDy: -0.42 }],
  [EV["88888"] + 2.05, { mDx: 0.5, mDy: -0.15 }],
];
const Hook: React.FC<P> = ({ t, s, e }) => {
  const pan = L(t, T_PAN, T_PAN + 0.6, 0, 1, (u) => u * u * (3 - 2 * u));
  const caida = L(t, EV["233"] - 0.15, EV["233"] + 1.1, 0, 1);
  const cam = orbita([-0.65 + (BX + 0.65) * pan, -0.4 + 0.15 * pan, 0], 4.3 + 2.0 * pan, -0.25 + 0.2 * Math.sin(t * 0.4) + 0.15 * pan + sacude(t, EV["233"] - 0.05), 0.12, { apertura: 38, centroY: 880 });
  const tr: Trazo[] = [...polvo(0.3)];
  suelo(tr, t, -1.0, 0.16, "#fff", 0.2);
  const caja = cajaFuerte(tr, [-0.55, -1, 0], 1, t, 0, "#fff", 0.2 + 0.4 * golpe(t, EV["88888"]));
  // Velas rojas que vuelan de su mano a la caja
  LANZA.forEach((t0) => {
    const u = (t - t0) / 0.38;
    if (u < 0 || u > 1) return;
    const x = -0.92 + 0.37 * u;
    const y = -0.42 - 0.3 * u + 0.18 * Math.sin(Math.PI * u);
    cristal(tr, [x - 0.022, y - 0.07, 0.27], [x + 0.022, y + 0.07, 0.31], ROJO, 1, 0.5, 0.4);
  });
  const b = banco(tr, BX, t, caida, L(t, EV.hundio - 0.2, EV["233"] - 0.2, 0, 1));
  const c = cuerpoEn(t, HOOK, { mira: 0.9, boca: -0.2, cejas: -0.5, ojos: 0.85, incl: 0.04, mDx: 0.2, mDy: -0.5 });
  const a = anclaje(cam, [-1.15, -1, 0.3], 0.55);
  const pr = proyector(cam);
  const qd = pr(caja.display);
  const qr = pr(b.rotulo);
  const luce = L(t, EV["88888"] - 0.1, EV["88888"] + 0.1, 0, 1);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <CamaraTiembla t={t} t0={EV["233"] - 0.05}>
        <div style={{ position: "absolute", left: qd.x, top: qd.y, transform: `translate(-50%, -50%) scale(${(qd.k / 700) * (1 + 0.25 * golpe(t, EV["88888"]))})`, ...mono(40), fontWeight: 700, color: luce > 0.5 ? ROJO : "rgba(255,255,255,0.5)", textShadow: luce > 0.5 ? "0 0 18px rgba(255,77,94,0.9)" : undefined, letterSpacing: "0.1em" }}>
          {luce > 0.5 ? "88888" : "-----"}
        </div>
        {pan > 0.5 && (
          <div style={{ position: "absolute", left: qr.x, top: qr.y, transform: `translate(-50%, -50%) rotate(${-20 * caida * caida}deg)`, ...mono(30), fontWeight: 700, color: caida > 0.01 ? ROJO : "#fff", letterSpacing: "0.15em", opacity: Math.min(1, (pan - 0.5) * 3) }}>
            BARINGS · 1762
          </div>
        )}
        <StickMundo a={a} c={c} t={t} o={1 - pan} />
      </CamaraTiembla>
      <FlashRojo t={t} t0={EV["233"] - 0.05} o={0.2} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: el trader estrella de Singapur pierde, lo esconde y dobla las fichas
const s1 = inicio("uno");
const MERCADO = paseo(18, 7, 0.4, -0.05);
const UNO: Clave[] = [
  [EV.perdia - 0.1, { mira: 0.9, boca: -0.4, cejas: -0.6, ojos: 1.2, mIx: -0.15, mIy: -0.52, mDx: 0.15, mDy: -0.52, incl: 0.04 }],
  [EV.escondia - 0.15, { mira: -0.7, mDx: 0.52, mDy: -0.38 }],
  [EV.escondia + 0.35, { mira: 0.9, mDx: 0.2, mDy: -0.5 }],
  [EV.doblaba - 0.1, { mDx: 0.55, mDy: -0.25, mira: 0.8, ojos: 1.1, boca: 0.3, cejas: 0.2 }],
];
const Uno: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.05, -0.3, 0], L(t, s, e, 5.6, 4.8), L(t, s, e, -0.28, 0.18), 0.12, { apertura: 38, centroY: 880 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.16, "#fff", 0.2);
  // Pantalla del mercado detrás, con la última vela en rojo cuando pierde
  const n = Math.round(L(t, s, EV.perdia, 10, MERCADO.length, (u) => u));
  monitor(tr, [0.3, 0.05, -0.55], 1.25, 0.7, (p) => {
    const lo = Math.min(...MERCADO) - 0.5;
    const hi = Math.max(...MERCADO);
    const ys = MERCADO.map((v) => p(0, 0.1 + ((v - lo) / (hi - lo)) * 0.8)[1]);
    if (t >= EV.perdia - 0.1) ys[ys.length - 1] = p(0, 0.08)[1];
    velas(tr, ys, p(0.05, 0)[0], p(0.95, 0)[0], n, 0.022, 1, 0.014, true);
    if (t >= EV.perdia - 0.1) {
      const x = p(0.95, 0)[0];
      tr.push({ t: "l", a: [x, ys[ys.length - 2], -0.54], b: [x, ys[ys.length - 1], -0.54], w: 6, o: 0.95, color: ROJO, luz: 0.5 });
    }
  });
  tr.push({ t: "l", a: [0.3, -0.3, -0.55], b: [0.3, -1, -0.55], w: 2, o: 0.7 });
  // Caja 88888 a su lado
  cajaFuerte(tr, [0.02, -1, 0.35], 0.6, t, 0, "#fff", 0.2 + 0.5 * golpe(t, EV.escondia + 0.25));
  // La vela roja salta de la pantalla a la caja
  const u = (t - EV.escondia) / 0.45;
  if (u > 0 && u < 1) {
    const x = 0.85 - 0.83 * u;
    const y = -0.2 - 0.5 * u + 0.35 * Math.sin(Math.PI * u);
    cristal(tr, [x - 0.025, y - 0.08, 0.3 - 0.02], [x + 0.025, y + 0.08, 0.3 + 0.02], ROJO, 1, 0.5, 0.4);
  }
  // Doblaba la apuesta: montones de fichas que se doblan
  [2, 4, 8, 16].forEach((nf, i) => {
    const g = Math.min(muelle(t, EV.doblaba - 0.15 + i * 0.22, 220, 14), 1);
    if (g <= 0.02) return;
    fichas(tr, [0.42 + i * 0.2, -1, 0.42], Math.max(1, Math.round(nf * g)), 0.07, 1, true);
  });
  const c = cuerpoEn(t, UNO, { mira: 0.6, boca: 0.8, cejas: 0.5, incl: -0.05, mIx: -0.13, mIy: -0.42, mDx: 0.13, mDy: -0.42, ojos: 0.85 }, s - 0.3);
  const a = anclaje(cam, [-0.5, -1, 0.35], 0.6);
  // Estrella encima de la cabeza del trader estrella
  const ge = Math.min(muelle(t, EV.barings - 0.7, 220, 12), 1.1) * (1 - L(t, EV.perdia - 0.2, EV.perdia + 0.2, 0, 1));
  if (ge > 0.02) estrella(tr, [-0.5, -1 + 1.95 * 0.6 + 0.14, 0.35], 0.09 * ge, 1, 0.5);
  const pr = proyector(cam);
  const qn = pr([-0.95, 0.22, 0.35]);
  const qs = pr([0.3, 0.44, -0.55]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: qs.x, top: qs.y, transform: "translate(-50%, -100%)", ...mono(30, 0.7), letterSpacing: "0.12em", opacity: L(t, EV.singapur - 0.3, EV.singapur, 0, 1) }}>SIMEX · SINGAPUR</div>
      <div style={{ position: "absolute", left: Math.max(qn.x, 190), top: qn.y, transform: `translate(-50%, -100%) scale(${Math.min(muelle(t, EV.leeson - 0.1, 240, 14), 1.05)})`, padding: "8px 18px", borderRadius: 10, border: "2px solid #fff", background: "#000", ...mono(28) }}>NICK LEESON · 28</div>
      <StickMundo a={a} c={c} t={t} />
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: en Londres creían que ganaba millones (sin stickman)
const Dos: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.25, 0], L(t, s, e, 5.0, 4.6), L(t, s, e, 0.2, -0.1), 0.12, { apertura: 38, centroY: 880 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.16, "#fff", 0.2);
  // Big Ben en wireframe
  const bb = -0.72;
  cristal(tr, [bb - 0.14, -1, -0.6], [bb + 0.14, 0.45, -0.32], "#fff", 0.9, 0.15, 0.05);
  const rc: V3 = [bb, 0.28, -0.319];
  tr.push({ t: "p", pts: circulo(rc, 0.1, "z", 32), w: 2.2, o: 1, relleno: "#000", oRelleno: 0.9 });
  tr.push({ t: "l", a: rc, b: [rc[0] + Math.sin(t * 2) * 0.07, rc[1] + Math.cos(t * 2) * 0.07, rc[2]], w: 2, o: 1 });
  tr.push({ t: "l", a: rc, b: [rc[0] + 0.045, rc[1] + 0.02, rc[2]], w: 2.6, o: 1 });
  for (const [dx, dz] of [[-0.14, -0.32], [0.14, -0.32], [0.14, -0.6], [-0.14, -0.6]]) tr.push({ t: "l", a: [bb + dx, 0.45, dz], b: [bb, 0.82, -0.46], w: 2, o: 0.9 });
  // Gráfico de «beneficios» que sube en verde
  const n = Math.max(2, Math.round(L(t, s, EV.ganaba + 0.3, 2, 14, (u) => u)));
  const pts: V3[] = Array.from({ length: n }, (_, i) => [-0.38 + i * 0.1, -0.65 + i * 0.075 + 0.04 * Math.sin(i * 2.1), -0.2]);
  tr.push({ t: "p", pts, w: 3.2, o: 1, color: VERDE, luz: 0.5 });
  tr.push({ t: "e", c: pts[pts.length - 1], r: 0.02, tipo: "punto", o: 1, luz: 1, color: VERDE });
  const pr = proyector(cam);
  const qb = pr([bb, -1, -0.3]);
  const qg = pr(pts[pts.length - 1]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: qb.x, top: qb.y + 10, transform: "translateX(-50%)", ...mono(30, 0.7), letterSpacing: "0.12em", opacity: L(t, EV.londres - 0.2, EV.londres + 0.1, 0, 1) }}>LONDRES</div>
      <div style={{ position: "absolute", left: Math.min(qg.x, 820), top: qg.y - 30, transform: "translate(-50%, -100%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <span style={mono(24, 0.6)}>LO QUE VEÍAN</span>
        <span style={{ ...mono(58), color: VERDE, fontWeight: 600 }}>BENEFICIOS ↑</span>
      </div>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 1240, display: "flex", justifyContent: "center", opacity: 0.35 + 0.25 * Math.sin(t * 6) }}>
        <span style={{ ...mono(30), color: ROJO, letterSpacing: "0.1em" }}>CUENTA 88888: −£ ▼</span>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 4. Sígueme con claqueta de cine
const Claqueta: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const g = muelle(t, t0 - 0.9, 200, 14);
  const cierra = t < t0 - 0.05 ? -28 * Math.min(1, (t - (t0 - 0.9)) / 0.4) : -28 * (1 - Math.min(1, (t - t0 + 0.05) / 0.08));
  const x = 700;
  const y = 1040;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: Math.min(Math.max(g, 0) * 1.5, 1) }}>
      <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * Math.min(Math.max(g, 0), 1.1)})`}>
        <rect x={0} y={0} width={280} height={180} rx={10} fill="#000" stroke="#fff" strokeWidth={4} />
        <text x={24} y={80} fill="#fff" style={{ ...mono(26) }}>BARINGS</text>
        <text x={24} y={124} fill="#fff" style={{ ...mono(26) }}>1995 · TOMA 1</text>
        <g transform={`rotate(${cierra} 0 0)`}>
          <rect x={0} y={-46} width={280} height={42} rx={6} fill="#000" stroke="#fff" strokeWidth={4} />
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M${20 + i * 56},-46 l28,0 l-24,42 l-28,0 z`} fill="#fff" />
          ))}
        </g>
      </g>
    </svg>
  );
};
const Sigueme: React.FC<P> = (p) => (
  <>
    <SiguemeStick {...p} lema="" sinTitulo />
    <Claqueta t={p.t} t0={EV.pelicula} />
  </>
);

// ------------------------------------------------------------------ 5. Tres: el terremoto de Kobe; apuesta más y la caja revienta (−827 M £)
const s3 = inicio("tres");
const TRES: Clave[] = [
  [EV.terremoto - 0.05, { mIx: -0.42, mIy: -0.18, mDx: 0.42, mDy: -0.18, ojos: 1.4, cejas: 1, abre: 0.6, boca: 0 }],
  [EV.cerrar - 0.3, { mira: 0.9, ojos: 1.1, cejas: -0.8, boca: -0.6, abre: 0, mIx: 0.25, mIy: -0.38, mDx: 0.52, mDy: -0.36, incl: 0.08 }],
  [EV.perdida - 0.05, { ...CHOQUE, incl: -0.08 }],
  [EV["827"] + 0.35, { ...MANOS_CABEZA }],
];
const Tres: React.FC<P> = ({ t, s, e }) => {
  const sismo = L(t, EV.terremoto - 0.1, EV.terremoto + 0.4, 0, 1) * (1 - L(t, EV.cerrar, EV.apuesta + 0.6, 0, 0.7));
  const cam = orbita([0, -0.3, 0], L(t, s, e, 5.6, 5.0) - 0.3 * golpe(t, EV.perdida), L(t, s, e, -0.25, 0.15) + 0.025 * sismo * Math.sin(t * 43) + sacude(t, EV.perdida), 0.13 + 0.015 * sismo * Math.sin(t * 37), { apertura: 38, centroY: 880 });
  const tr: Trazo[] = [...polvo(0.25)];
  // Suelo que ondula con el terremoto
  const onda = (x: number, z: number) => -1 + 0.06 * sismo * Math.sin(4 * Math.hypot(x + 1.5, z + 1) - 14 * t);
  for (let k = 0; k < 13; k++) {
    const z = -1.2 + k * 0.2;
    tr.push({ t: "p", pts: Array.from({ length: 30 }, (_, i) => [-1.6 + i * 0.11, onda(-1.6 + i * 0.11, z), z] as V3), w: 1.2, o: 0.22 });
  }
  for (let k = 0; k < 15; k++) {
    const x = -1.6 + k * 0.23;
    tr.push({ t: "p", pts: Array.from({ length: 14 }, (_, i) => [x, onda(x, -1.2 + i * 0.2), -1.2 + i * 0.2] as V3), w: 1.2, o: 0.16 });
  }
  // Nikkei que se hunde
  const caeN = L(t, EV.hunde - 0.2, EV.cerrar, 0, 1, (u) => 1 - Math.pow(1 - u, 2));
  const NP = 26;
  const nVis = Math.round(L(t, s, EV.cerrar, 10, NP, (u) => u));
  const yN = (i: number) => 0.45 - (i < 10 ? 0.01 * i : (i - 10) * 0.07 * caeN) + 0.025 * Math.sin(i * 2.7);
  const ptsN: V3[] = Array.from({ length: nVis }, (_, i) => [-1.3 + (i * 2.6) / (NP - 1), yN(i), -0.9]);
  tr.push({ t: "p", pts: ptsN.slice(0, Math.min(nVis, 11)), w: 2.8, o: 1, luz: 0.3 });
  if (nVis > 10) tr.push({ t: "p", pts: ptsN.slice(10), w: 3.4, o: 1, color: ROJO, luz: 0.5 });
  // Fichas que se amontonan y la caja que revienta
  const nf = Math.round(L(t, EV.cerrar - 0.2, EV.perdida - 0.2, 6, 24, (u) => u));
  fichas(tr, [-0.05, -1, 0.42], nf, 0.09, 1, true);
  const abre = Math.min(muelle(t, EV.perdida - 0.05, 220, 10), 1.05);
  cajaFuerte(tr, [0.62, -1, 0.25], 0.85, t, Math.max(0, abre), abre > 0.01 ? ROJO : "#fff", 0.2 + 0.7 * golpe(t, EV.perdida));
  if (t > EV.perdida) {
    for (let k = 0; k < 14; k++) {
      const u = Math.min(1, (t - EV.perdida) / 1.3);
      const ang = (k / 14) * Math.PI * 1.6 - 0.2;
      const v = 0.9 + 0.6 * fr(Math.sin(k * 4.3) * 17.7);
      const x = 0.62 + Math.cos(ang) * v * u * 0.9;
      const y = -0.78 + Math.sin(ang) * v * u * 0.9 - 1.6 * u * u;
      if (y < -1) continue;
      cristal(tr, [x - 0.02, y - 0.06, 0.45], [x + 0.02, y + 0.06, 0.49], ROJO, 1, 0.5, 0.4);
    }
  }
  const base = cuerpoEn(t, TRES, { mira: 0.7, ojos: 1.15, cejas: -0.6, boca: -0.3, agobio: 0.4 }, s - 0.3);
  const c: Estado = { ...base, x: base.x + 0.02 * sismo * Math.sin(t * 31), incl: base.incl + 0.05 * sismo * Math.sin(t * 23) };
  const a = anclaje(cam, [-0.62, -1, 0.38], 0.55);
  const pr = proyector(cam);
  const qn = pr([-1.3, 0.62, -0.9]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <CamaraTiembla t={t} t0={EV.perdida - 0.05}>
        <div style={{ position: "absolute", left: Math.max(qn.x, 60), top: qn.y, ...mono(30, 0.75), letterSpacing: "0.12em", opacity: L(t, EV.hunde - 0.4, EV.hunde - 0.1, 0, 1) }}>NIKKEI 225</div>
        <div style={{ position: "absolute", left: Math.max(qn.x, 60), top: qn.y + 40, ...mono(24, 0.6), letterSpacing: "0.12em", opacity: L(t, EV.terremoto - 0.2, EV.terremoto + 0.1, 0, 1) * (1 - L(t, EV.perdida - 0.4, EV.perdida - 0.1, 0, 1)) }}>KOBE · 17-1-1995</div>
        <StickMundo a={a} c={c} t={t} />
        <Exclama t={t} t0={EV.terremoto - 0.05} c={c} {...a} />
        <Marcador t={t} t0={EV.perdida} t1={EV.libras + 0.2} hasta={827000000} signo="−" color={ROJO} sufijo=" £" top={470} size={88} />
      </CamaraTiembla>
      <FlashRojo t={t} t0={EV.perdida - 0.05} o={0.22} />
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: vendido por 1 £… y todo empezó con un cubito de −20.000 £
const Giro: React.FC<P> = ({ t, s, e }) => {
  const baja = L(t, EV.error - 0.35, EV.error + 0.35, 0, 1, (u) => u * u * (3 - 2 * u));
  const sube = L(t, EV["20000"] + 0.5, EV.aceptar + 0.2, 0, 1, (u) => u * u * (3 - 2 * u));
  const foco = baja * (1 - sube);
  const cam = orbita([0, -0.25 - 0.7 * foco, 0.75 * foco], 6.2 - 3.9 * foco + 0.6 * sube, L(t, s, e, -0.2, 0.18), 0.14 + 0.15 * foco, { apertura: 38, centroY: 880 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.16, "#fff", 0.2);
  banco(tr, 0, t, 0, 0);
  // El cubito rojo de −20.000 £ y el fantasma de lo que llegó a ser
  const g = Math.min(muelle(t, EV.error - 0.2, 220, 13), 1.05);
  if (g > 0.01) cristal(tr, [-0.04, -1, 0.76], [0.04, -1 + 0.08 * g, 0.84], ROJO, 1, 0.5 + 0.4 * golpe(t, EV["20000"]), 0.35);
  const lado = 0.08 + 1.5 * sube;
  if (sube > 0.01) cristal(tr, [-lado / 2, -1, 0.8 - lado / 2], [lado / 2, -1 + lado, 0.8 + lado / 2], ROJO, 0.7, 0.15, 0.05);
  const pr = proyector(cam);
  const qc = pr([0, -0.88, 0.8]);
  const qf = pr([0, -1 + lado + 0.05, 0.8]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Sello t={t} t0={EV.libra - 0.25} fin={EV.error - 0.3} texto="VENDIDO POR 1 £" top={420} />
      {g > 0.01 && sube < 0.5 && (
        <div style={{ position: "absolute", left: qc.x, top: qc.y - 30, transform: `translate(-50%, -100%) scale(${Math.min(g, 1.05)})`, ...mono(56), color: ROJO, fontWeight: 700 }}>−20.000 £</div>
      )}
      {sube > 0.01 && (
        <div style={{ position: "absolute", left: qf.x, top: Math.max(qf.y - 20, 300), transform: "translate(-50%, -100%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: Math.min(1, sube * 2) }}>
          <span style={{ ...mono(46), color: ROJO, fontWeight: 600 }}>−827.000.000 £</span>
          <span style={{ ...mono(80), color: "#fff", fontWeight: 700 }}>×41.000</span>
        </div>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta: ¿CERRAR o ESCONDER esa primera pérdida?
const Pregunta: React.FC<P> = (p) => <PreguntaDos {...p} izq={{ texto: "CERRAR", sub: "−20.000 £", t0: EV.primera - 0.6 }} der={{ texto: "ESCONDER", sub: "CUENTA 88888", t0: EV.primera + 0.2 }} pie="MÁNDASELO AL QUE NUNCA CIERRA EN NEGATIVO" tPie={EV.mandaselo} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, pregunta: Pregunta };
export const CLAVES = claves([["88888", ROJO], "hundió", "233", "leeson", "estrella", "escondía", "doblaba", "sígueme", "película", "terremoto", "kobe", ["827", ROJO], ["libra", ROJO], ["20000", ROJO], "aceptar", "primera", "mándaselo"]);

export const Leeson: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/leeson_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />;
