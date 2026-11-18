// Reel con historia "Marcos tenía nueve indicadores y no sabía cuándo entrar" (~41 s). Solo subtítulos abajo y el «sígueme»
// grande en medio. Marcos (stickman con gorra) ante un monitor 3D: se le llena de indicadores con cada pérdida hasta
// parecer un árbol de Navidad; el cableado que demuestra que todos salen del precio y llegan tarde (sin Marcos); las líneas
// caen como confeti y queda el precio con su soporte y su ruptura; precio + volumen; y la pregunta.
// Tiempos en src/gen/indicadores.json (scripts/indicadores.py).
import React from "react";
import { useCurrentFrame } from "remotion";
import datos from "../gen/indicadores.json";
import { ANCHO } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { AZUL, cristal, ORO, ROJO, suelo, VERDE } from "../Bot/kit";
import { Clave, cuerpoEn, Estado } from "../Bot/stick";
import { anclaje, ENCOGE, Exclama, SiguemeStick, StickMundo } from "../Bot/comun";
import { fr, PreguntaDos } from "../Bot/historia";
import { claves, golpe, Montaje, P, sacude } from "../Explica/Montaje";

export const INDICADORES_FPS = datos.fps;
export const INDICADORES_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;

// ------------------------------------------------------------------ el monitor de Marcos
const N = 40;
const PRECIO = Array.from({ length: N }, (_, i) => 0.06 * Math.sin(i * 0.45) + 0.035 * Math.sin(i * 1.3 + 1) + (i > 22 && i < 30 ? -0.07 : 0) + (i >= 33 ? 0.03 * (i - 32) : 0));
const MON = { x0: -0.35, x1: 1.15, y0: -0.45, y1: 0.55, z: -0.2 };
const xm = (i: number) => MON.x0 + 0.06 + (i / (N - 1)) * (MON.x1 - MON.x0 - 0.12);
const ym = (v: number) => 0.12 + v * 1.6;
const media = (k: number) => PRECIO.map((_, i) => { const a = PRECIO.slice(Math.max(0, i - k + 1), i + 1); return a.reduce((s, v) => s + v, 0) / a.length; });
const LINEAS: { nombre: string; serie: number[]; dash?: string }[] = [
  { nombre: "MEDIA 9", serie: media(4) },
  { nombre: "MEDIA 21", serie: media(8) },
  { nombre: "MEDIA 50", serie: media(14) },
  { nombre: "BOLLINGER", serie: media(6).map((v) => v + 0.09), dash: "6 6" },
  { nombre: "BOLLINGER", serie: media(6).map((v) => v - 0.09), dash: "6 6" },
];
const COLORES = [ORO, VERDE, ROJO, AZUL, "#fff"];
// Monitor con el precio; capas: cuántas líneas/paneles de indicadores; caen: 0…1 (se desploman como confeti); navidad: luces
const monitorMarcos = (tr: Trazo[], t: number, capas: number, caen = 0, navidad = 0, extras?: (y: (v: number) => number) => void) => {
  const { x0, x1, y0, y1, z } = MON;
  tr.push({ t: "p", pts: [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [x0, y0, z]], w: 2.6, o: 1, relleno: "#000", oRelleno: 0.85, luz: 0.2 });
  tr.push({ t: "l", a: [(x0 + x1) / 2, y0, z], b: [(x0 + x1) / 2, -1, z], w: 2.4, o: 0.8 });
  tr.push({ t: "l", a: [(x0 + x1) / 2 - 0.2, -1, z], b: [(x0 + x1) / 2 + 0.2, -1, z], w: 3, o: 0.9 });
  tr.push({ t: "p", pts: PRECIO.map((v, i): V3 => [xm(i), ym(v), z + 0.01]), w: 3, o: 1, luz: 0.3 });
  // Líneas sobre el gráfico
  LINEAS.slice(0, Math.min(capas, LINEAS.length)).forEach((l, k) => {
    const col = navidad > 0 && Math.floor(t * 6 + k) % 2 ? COLORES[k % COLORES.length] : "#fff";
    const pts = l.serie.map((v, i): V3 => {
      const u = caen * (1 + 0.3 * k);
      return [xm(i) + 0.1 * u * Math.sin(i + k), ym(v) - 1.4 * u * u * (0.6 + 0.4 * fr(Math.sin(i * 3.1 + k) * 77.7)), z + 0.012 + 0.1 * u];
    });
    tr.push({ t: "p", pts, w: 1.8, o: (1 - caen) * 0.9, dash: l.dash, color: col, luz: navidad * 0.5 });
  });
  // Paneles de abajo (RSI, MACD, estocástico, CCI) que se apilan por debajo del monitor
  const paneles = Math.max(0, capas - LINEAS.length);
  for (let k = 0; k < paneles; k++) {
    const yb = y0 - 0.02 - (k + 1) * 0.15 - 1.4 * caen * caen * (1 + 0.2 * k);
    const pts = PRECIO.map((v, i): V3 => [xm(i), yb + 0.065 + 0.05 * Math.sin(i * (0.5 + 0.15 * k) + k) + 0.25 * (v - (PRECIO[i - 1] ?? v)), z]);
    tr.push({ t: "p", pts: [[x0, yb, z], [x1, yb, z], [x1, yb + 0.13, z], [x0, yb + 0.13, z], [x0, yb, z]], w: 1.4, o: (1 - caen) * 0.8, relleno: "#000", oRelleno: 0.85 * (1 - caen) });
    const col = navidad > 0 && Math.floor(t * 5 + k * 2) % 2 ? COLORES[(k + 2) % COLORES.length] : "#fff";
    tr.push({ t: "p", pts, w: 1.6, o: (1 - caen) * 0.9, color: col, luz: navidad * 0.5 });
  }
  extras?.(ym);
};
const PANELES = ["RSI", "MACD", "ESTOCÁSTICO", "CCI"];
const camMonitor = (t: number, s: number, e: number, d0 = 5.0, d1 = 4.6, golpeT = -9) => orbita([0.3, -0.25, 0], L(t, s, e, d0, d1) - 0.25 * golpe(t, golpeT), L(t, s, e, -0.18, 0.12) + sacude(t, golpeT, 0.03), 0.1, { apertura: 38, centroY: 850 });

// ------------------------------------------------------------------ 1. Hook: nueve indicadores y Marcos sin saber cuándo entrar
const HOOK: Clave[] = [
  [0.6, { mira: -0.6, cabeza: -0.08 }],
  [1.4, { mira: 0.9, cabeza: 0.08 }],
  [2.2, { mira: -0.4, cabeza: -0.05, mDx: 0.12, mDy: 0.3, cejas: -0.5, boca: -0.3 }],
  [EV.entrar - 0.3, { ...ENCOGE, mira: 0, cabeza: 0.12 }],
];
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = camMonitor(t, s, e);
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  monitorMarcos(tr, t, 9);
  const c = cuerpoEn(t, HOOK, { mira: 0.8 });
  const a = anclaje(cam, [-0.1, -1, 0.6], 0.5);
  const n = Math.min(9, Math.max(1, Math.floor(L(t, 0, EV.nueve + 0.2, 1, 9.99, (u) => u))));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", top: 250, left: 0, width: ANCHO, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 18 }}>
        <span style={mono(30, 0.7)}>INDICADORES</span>
        <span style={{ ...mono(110), fontWeight: 700, fontVariantNumeric: "tabular-nums", transform: `scale(${1 + 0.12 * golpe(t, EV.nueve)})` }}>{n}</span>
      </div>
      <StickMundo a={a} c={c} t={t} gorra />
      <Exclama t={t} t0={EV.entrar - 0.2} c={c} {...a} signo="?" dura={0.9} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: cada pérdida, un indicador más… hasta el árbol de Navidad
const s1 = inicio("uno");
const T_CAPA = [EV.perdia + 0.4, EV.rsi - 0.15, EV.macd - 0.15, EV.medias - 0.15, EV.bollinger - 0.15, EV.bollinger + 0.6, EV.bollinger + 1.0, EV.bollinger + 1.4];
const UNO: Clave[] = [
  [EV.perdia - 0.1, { boca: -0.6, cejas: -0.8, ojos: 1.15, mira: 0.8 }],
  [EV.rsi - 0.3, { mDx: 0.5, mDy: 0.1, boca: 0, cejas: 0.2 }],
  [EV.navidad - 0.4, { ...ENCOGE, mira: 0, boca: -0.2 }],
];
const Uno: React.FC<P> = ({ t, s, e }) => {
  const cam = camMonitor(t, s, e, 4.4, 3.9);
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  const capas = 1 + T_CAPA.filter((t0) => t >= t0).length;
  const navidad = L(t, EV.navidad - 0.6, EV.navidad - 0.3, 0, 1);
  monitorMarcos(tr, t, capas, 0, navidad);
  // Vela roja de la pérdida en la esquina del monitor
  const gp = Math.min(muelle(t, EV.perdia - 0.15, 220, 12), 1.05);
  if (gp > 0.01) cristal(tr, [MON.x1 - 0.12, 0.3 - 0.25 * gp, MON.z + 0.02], [MON.x1 - 0.06, 0.3, MON.z + 0.06], ROJO, 1, 0.5, 0.4);
  // Estrella de árbol de Navidad encima del monitor
  if (navidad > 0) {
    const c: V3 = [(MON.x0 + MON.x1) / 2, MON.y1 + 0.14, MON.z];
    const r = 0.11 * Math.min(1, navidad * 1.2);
    const pts: V3[] = Array.from({ length: 11 }, (_, i) => { const a = (i / 10) * Math.PI * 2 - Math.PI / 2; const rr = i % 2 ? r * 0.45 : r; return [c[0] + Math.cos(a) * rr, c[1] - Math.sin(a) * rr, c[2]]; });
    tr.push({ t: "p", pts, w: 2.4, o: 1, color: ORO, relleno: ORO, oRelleno: 0.5, luz: 0.6 + 0.4 * Math.sin(t * 8) });
  }
  const pr = proyector(cam);
  const nombres = ["RSI", "MACD", "MEDIAS", "BOLLINGER"];
  const c = cuerpoEn(t, UNO, { mira: 0.8 }, s - 0.3);
  const a = anclaje(cam, [-0.1, -1, 0.6], 0.5);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {nombres.map((nb, i) => {
        const t0 = [EV.rsi, EV.macd, EV.medias, EV.bollinger][i] - 0.15;
        const g = muelle(t, t0, 260, 13);
        if (g <= 0.01) return null;
        const q = pr([MON.x1 + 0.04, MON.y1 - 0.1 - i * 0.16, MON.z]);
        return (
          <div key={nb} style={{ position: "absolute", left: Math.min(q.x, 860), top: q.y, transform: `translateY(-50%) scale(${Math.min(g, 1.08)})`, transformOrigin: "0% 50%", padding: "6px 14px", borderRadius: 10, border: "2px solid #fff", background: "#000", ...mono(26), whiteSpace: "nowrap" }}>{`+ ${nb}`}</div>
        );
      })}
      <StickMundo a={a} c={c} t={t} gorra />
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: todos salen del precio y llegan tarde (cableado, sin Marcos)
const NOMBRES9 = ["RSI", "MACD", "MEDIA 9", "MEDIA 21", "MEDIA 50", "BOLLINGER", "ESTOCÁSTICO", "CCI", "MOMENTUM"];
const Dos: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0.0, 0], L(t, s, e, 5.0, 4.6), L(t, s, e, 0.25, -0.2), 0.15, { apertura: 38, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.25)];
  // El precio, abajo: una sola fuente
  const raiz: V3 = [0, -0.8, 0];
  const brilla = L(t, EV.precio1 - 0.3, EV.precio1, 0, 1);
  cristal(tr, [-0.35, -0.9, -0.1], [0.35, -0.7, 0.1], "#fff", 1, 0.2 + 0.6 * brilla, 0.1 + 0.3 * brilla);
  // Nueve cajas en abanico; cables que salen todos del precio
  const cajas: V3[] = NOMBRES9.map((_, i) => {
    const a = -1.15 + (i / 8) * 2.3;
    return [Math.sin(a) * 1.0, 0.1 + Math.cos(a) * 0.45, -0.2 - Math.cos(a) * 0.3];
  });
  const todos = t >= EV.nueve2 - 0.1;
  cajas.forEach((c, i) => {
    const g = Math.min(muelle(t, s + 0.15 + i * 0.07, 220, 14), 1.05);
    if (g <= 0) return;
    const k = Math.min(1, Math.max(0, (t - (s + 0.3 + i * 0.07)) / 0.5));
    tr.push({ t: "l", a: raiz, b: [raiz[0] + (c[0] - raiz[0]) * k, raiz[1] + (c[1] - raiz[1]) * k, raiz[2] + (c[2] - raiz[2]) * k], w: 1.6, o: 0.5 + 0.5 * brilla, luz: 0.4 * brilla });
    const w = 0.13 * g;
    // Se encienden a la vez («compra») y con retraso respecto al precio
    const enciende = todos ? 1 : 0;
    cristal(tr, [c[0] - w, c[1] - 0.05 * g, c[2] - 0.04], [c[0] + w, c[1] + 0.05 * g, c[2] + 0.04], enciende ? VERDE : "#fff", 1, 0.2 + 0.6 * enciende, 0.06 + 0.3 * enciende);
  });
  const pr = proyector(cam);
  const qr = pr([0, -0.68, 0.1]);
  const retraso = muelle(t, EV.tarde - 0.4, 240, 12);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {cajas.map((c, i) => {
        const q = pr([c[0], c[1] + 0.09, c[2]]);
        return (
          <div key={i} style={{ position: "absolute", left: q.x, top: q.y, transform: "translate(-50%, -100%)", ...mono(22, 0.85), whiteSpace: "nowrap", opacity: L(t, s + 0.2 + i * 0.07, s + 0.4 + i * 0.07, 0, 1), color: todos ? VERDE : "#fff" }}>{NOMBRES9[i]}</div>
        );
      })}
      <div style={{ position: "absolute", left: qr.x, top: qr.y - 6, transform: "translate(-50%, -100%)", ...mono(40), fontWeight: 700, opacity: 0.5 + 0.5 * brilla }}>PRECIO</div>
      {todos && (
        <div style={{ position: "absolute", top: 300, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 16, alignItems: "baseline" }}>
          <span style={{ ...mono(70), fontWeight: 700, color: VERDE }}>COMPRA ×9</span>
          <span style={{ ...mono(70), fontWeight: 700, opacity: L(t, EV.nueve2 + 0.8, EV.nueve2 + 1.1, 0, 1) }}>= 1</span>
        </div>
      )}
      {retraso > 0.01 && (
        <div style={{ position: "absolute", top: 1180, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
          <span style={{ padding: "10px 22px", borderRadius: 14, border: `2px solid ${ROJO}`, background: "#000", ...mono(34), color: ROJO, transform: `scale(${Math.min(retraso, 1.08)})` }}>⏱ Y LLEGAN TARDE</span>
        </div>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 4. Sígueme (Marcos con su gorra)
const Sigueme: React.FC<P> = (p) => <SiguemeStick {...p} lema="" gorra />;

// ------------------------------------------------------------------ 5. Tres: lo quita todo y ve el precio: dónde rebota y dónde se rompe
const s3 = inicio("tres");
const TRES: Clave[] = [
  [EV.quito - 0.3, { mDx: 0.5, mDy: 0.25, mira: 0.8, boca: 0.3, cejas: 0.3 }],
  [EV.solo, { mDx: 0.15, mDy: -0.5, ojos: 1.2, boca: 0.6, cejas: 0.6 }],
  [EV.rebotaba - 0.2, { mDx: 0.5, mDy: 0.0, mira: 0.9 }],
  [EV.rompia - 0.1, { boca: 1, abre: 0.4, ojos: 1.25 }],
];
const Tres: React.FC<P> = ({ t, s, e }) => {
  const cam = camMonitor(t, s, e, 4.4, 3.8);
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  const caen = L(t, EV.quito - 0.1, EV.quito + 0.9, 0, 1, (u) => u);
  const soporte = L(t, EV.rebotaba - 0.5, EV.rebotaba, 0, 1);
  const rotura = L(t, EV.rompia - 0.5, EV.rompia, 0, 1);
  monitorMarcos(tr, t, caen >= 1 ? 0 : 9, caen, 0, (y) => {
    const ys = y(-0.075);
    if (soporte > 0) tr.push({ t: "l", a: [xm(4), ys, MON.z + 0.02], b: [xm(4) + (xm(31) - xm(4)) * soporte, ys, MON.z + 0.02], w: 2.4, o: 1, dash: "10 8", color: VERDE, luz: 0.5 });
    const yr = y(0.06);
    if (rotura > 0) {
      tr.push({ t: "l", a: [xm(6), yr, MON.z + 0.02], b: [xm(6) + (xm(36) - xm(6)) * rotura, yr, MON.z + 0.02], w: 2.4, o: 1, dash: "10 8", color: "#fff", luz: 0.5 });
      if (rotura >= 1) tr.push({ t: "e", c: [xm(35), yr, MON.z + 0.03], r: 0.03, tipo: "aro", o: 1, luz: 1, color: VERDE });
    }
  });
  const pr = proyector(cam);
  const qs = pr([xm(31) + 0.02, ym(-0.075), MON.z]);
  const qr = pr([xm(36), ym(0.06) + 0.03, MON.z]);
  const c = cuerpoEn(t, TRES, { mira: 0.8, boca: -0.2 }, s - 0.3);
  const a = anclaje(cam, [-0.1, -1, 0.6], 0.5);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {soporte > 0.5 && <div style={{ position: "absolute", left: Math.min(qs.x + 10, 930), top: qs.y, transform: "translate(-100%, 20%)", ...mono(26), fontWeight: 700, color: VERDE }}>REBOTA ↑</div>}
      {rotura > 0.5 && <div style={{ position: "absolute", left: Math.min(qr.x, 980), top: qr.y, transform: "translate(-100%, -120%)", ...mono(26), fontWeight: 700 }}>SE ROMPE ↗</div>}
      <StickMundo a={a} c={c} t={t} gorra />
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: el precio y, como mucho, el volumen
const sG = inicio("giro");
const VOL = Array.from({ length: N }, (_, i) => 0.25 + 0.6 * fr(Math.sin(i * 9.7) * 431.7) + (i > 31 && i < 36 ? 0.7 : 0));
const GIRO: Clave[] = [
  [sG + 0.1, { mDx: 0.06, mDy: 0.13, mira: 0.8, cejas: 0.3 }],
  [EV.volumen - 0.3, { mDx: 0.5, mDy: -0.15, mira: 0.9, boca: 0.5 }],
  [EV.claras - 0.4, { mDx: 0.2, mDy: 0.45, boca: 0.9, ojos: 0.9, cabeza: 0.08 }],
];
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = camMonitor(t, s, e, 4.3, 3.9);
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  const vol = L(t, EV.volumen - 0.6, EV.volumen + 0.2, 0, 1);
  monitorMarcos(tr, t, 0, 0, 0, () => {
    for (let i = 0; i < N && vol > 0; i++) {
      const h = 0.14 * VOL[i] * Math.min(1, vol * 1.5 - i / N);
      if (h <= 0) continue;
      const x = xm(i);
      tr.push({ t: "p", pts: [[x - 0.012, MON.y0 + 0.03, MON.z + 0.01], [x + 0.012, MON.y0 + 0.03, MON.z + 0.01], [x + 0.012, MON.y0 + 0.03 + h, MON.z + 0.01], [x - 0.012, MON.y0 + 0.03 + h, MON.z + 0.01], [x - 0.012, MON.y0 + 0.03, MON.z + 0.01]], w: 1, o: 0.9, relleno: "#fff", oRelleno: 0.5, color: i > 31 && i < 36 ? VERDE : undefined });
    }
  });
  const pr = proyector(cam);
  const qv = pr([MON.x0 + 0.08, MON.y0 + 0.2, MON.z]);
  const c = cuerpoEn(t, GIRO, { mira: 0.8 }, s - 0.3);
  const a = anclaje(cam, [-0.1, -1, 0.6], 0.5);
  const chips = [
    ["PRECIO", EV.consejo + 0.6, "#fff"],
    ["+ VOLUMEN", EV.volumen - 0.2, VERDE],
  ] as const;
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {vol > 0.5 && <div style={{ position: "absolute", left: qv.x, top: qv.y, transform: "translateY(-100%)", ...mono(24), fontWeight: 700, color: VERDE }}>VOLUMEN</div>}
      <div style={{ position: "absolute", top: 260, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 18 }}>
        {chips.map(([txt, t0, col]) => {
          const g = muelle(t, t0, 240, 13);
          return g > 0.01 ? <span key={txt} style={{ padding: "10px 22px", borderRadius: 14, border: `2px solid ${col}`, background: "#000", ...mono(40), fontWeight: 700, color: col, transform: `scale(${Math.min(g, 1.08)})` }}>{txt}</span> : null;
        })}
      </div>
      {t > EV.lineas - 0.2 && (
        <div style={{ position: "absolute", top: 370, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 24, alignItems: "center", opacity: L(t, EV.lineas - 0.2, EV.lineas + 0.1, 0, 1) }}>
          <span style={{ ...mono(30), color: ROJO, textDecoration: "line-through" }}>9 LÍNEAS</span>
          <span style={mono(30, 0.6)}>→</span>
          <span style={{ ...mono(30), color: VERDE }}>{t > EV.claras - 0.3 ? "DECISIONES CLARAS ✓" : "2 LÍNEAS"}</span>
        </div>
      )}
      <StickMundo a={a} c={c} t={t} gorra />
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta: ¿cuántos indicadores tienes? Etiqueta a tu Marcos
const Pregunta: React.FC<P> = (p) => <PreguntaDos {...p} izq={{ texto: "1 O 2", t0: EV.cuantos + 0.5 }} der={{ texto: "5 O MÁS", t0: EV.cuantos + 1.0 }} pie="ETIQUETA A TU MARCOS" tPie={EV.etiqueta} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, pregunta: Pregunta };
export const CLAVES = claves(["marcos", "nueve", "entrar", "perdía", ["navidad", VERDE], "precio", ["tarde", ROJO], "sígueme", "quitó", "solo", ["rebotaba", VERDE], "rompía", "consejo", ["volumen", VERDE], "claras", "etiqueta"]);

export const Indicadores: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/indicadores_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />;
