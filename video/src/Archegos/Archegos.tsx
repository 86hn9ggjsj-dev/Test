// Reel con historia real (formato v2) "Perdió 20.000 millones de dólares en 2 días" (~33 s): Bill Hwang y Archegos (2021).
// Torres de cristal (las acciones) que se derrumban desde el fotograma 0 con el contador en rojo; el nombre que nadie
// conocía; un puñado de torres levantadas sobre un trozo pequeño «suyo» y un bloque enorme «prestado»; coronado mientras
// subían; el «sígueme» encima de la escena; una torre cae, los bancos piden garantías, no las tiene y lo venden todo; los
// barrotes y los 18 años; una sola columna sobre un palillo que cae con un error; y la pregunta.
// Tiempos en src/gen/archegos.json (scripts/archegos.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/archegos.json";
import { ANCHO } from "../Viral/util";
import { euros, L, mono, muelle } from "../Bot/piezas";
import { caja, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { cristal, ROJO, suelo, VERDE } from "../Bot/kit";
import { Clave, cuerpoEn } from "../Bot/stick";
import { anclaje, BRAZOS_ARRIBA, Corona, ENCOGE, Exclama, FlashRojo, HUNDIDO, MANOS_CABEZA, StickMundo } from "../Bot/comun";
import { CamaraTiembla, fr, PreguntaDos, Sello } from "../Bot/historia";
import { claves, CtaSeguir, golpe, Montaje, P, sacude } from "../Explica/Montaje";

export const ARCHEGOS_FPS = datos.fps;
export const ARCHEGOS_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;

// ------------------------------------------------------------------ piezas 3D
// Torres (las acciones): parte «suya» abajo (pequeña) y parte «prestada» encima (discontinua, en rojo suave)
const TX = [0.05, 0.24, 0.43, 0.62, 0.81];
const SUYO = 0.16;
const PRESTA = [0.62, 0.8, 1.0, 0.72, 0.55];
const ANCHO_T = 0.08;
const cajaDash = (tr: Trazo[], min: V3, max: V3, color: string, o = 1, w = 2) => {
  for (const [a, b] of caja(min, max)) tr.push({ t: "l", a, b, w, o, dash: "10 7", color });
};
const torre = (tr: Trazo[], i: number, suyo: number, presta: number, color: string, o = 1, luz = 0.3) => {
  const x = TX[i];
  if (suyo > 0.005) cristal(tr, [x - ANCHO_T, -1, -0.38], [x + ANCHO_T, -1 + suyo, -0.22], color, o, luz, 0.3);
  if (presta > 0.005) {
    cajaDash(tr, [x - ANCHO_T, -1 + suyo, -0.38], [x + ANCHO_T, -1 + suyo + presta, -0.22], color === "#fff" ? ROJO : color, 0.85 * o, 2.2);
    tr.push({ t: "p", pts: [[x - ANCHO_T, -1 + suyo, -0.22], [x + ANCHO_T, -1 + suyo, -0.22], [x + ANCHO_T, -1 + suyo + presta, -0.22], [x - ANCHO_T, -1 + suyo + presta, -0.22], [x - ANCHO_T, -1 + suyo, -0.22]], w: 0, o, relleno: ROJO, oRelleno: 0.06 * o });
  }
};
// Escombros: cubitos que salen despedidos con gravedad desde lo alto de una torre
const escombros = (tr: Trazo[], t: number, t0: number, x: number, y: number, n = 8, color = ROJO) => {
  const d = t - t0;
  if (d < 0 || d > 1.6) return;
  for (let k = 0; k < n; k++) {
    const vx = (fr(Math.sin(k * 12.9 + x * 7) * 431.1) - 0.5) * 1.4;
    const vy = 0.4 + fr(Math.sin(k * 7.3 + x * 3) * 911.7) * 0.9;
    const px = x + vx * d;
    const py = Math.max(-0.98, y + vy * d - 2.6 * d * d);
    const r = 0.025 + 0.015 * fr(k * 0.37);
    cristal(tr, [px - r, py - r, -0.3 - r], [px + r, py + r, -0.3 + r], color, Math.max(0, 1 - d / 1.6), 0.2, 0.2);
  }
};
// Cuánto queda en pie de una torre que se derrumba en t0 (1 → 0)
const enPie = (t: number, t0: number, dura = 0.55) => 1 - L(t, t0, t0 + dura, 0, 1, (u) => u * u);

// Banco de alambre: escalones, cuatro columnas y frontón
const banco = (tr: Trazo[], x: number, z: number, g: number) => {
  if (g <= 0.01) return;
  const k = Math.min(g, 1.05);
  const w = 0.26 * k;
  const y0 = -1;
  cristal(tr, [x - w, y0, z - 0.1], [x + w, y0 + 0.05 * k, z + 0.1], "#fff", 0.9, 0.1, 0.05);
  for (let c = 0; c < 4; c++) {
    const cx = x - w * 0.75 + (c * w * 1.5) / 3;
    tr.push({ t: "l", a: [cx, y0 + 0.05 * k, z + 0.06], b: [cx, y0 + 0.4 * k, z + 0.06], w: 2.2, o: 0.9 });
  }
  tr.push({ t: "p", pts: [[x - w * 1.05, y0 + 0.4 * k, z + 0.08], [x + w * 1.05, y0 + 0.4 * k, z + 0.08], [x, y0 + 0.58 * k, z + 0.08], [x - w * 1.05, y0 + 0.4 * k, z + 0.08]], w: 2.4, o: 1, relleno: "#fff", oRelleno: 0.08, luz: 0.3 });
};

const Pildora: React.FC<{ x?: number; y?: number; t: number; t0: number; color?: string; size?: number; children: React.ReactNode; ancla?: string }> = ({ x, y, t, t0, color = "#fff", size = 32, children, ancla = "translate(-50%, -100%)" }) => {
  const g = muelle(t, t0, 240, 13);
  if (g < 0.01) return null;
  // Sin x/y va en línea (dentro de un flex centrado)
  const sitio: React.CSSProperties = x === undefined ? { position: "relative" } : { position: "absolute", left: x, top: y };
  return (
    <div style={{ ...sitio, transform: `${ancla} scale(${0.6 + 0.4 * Math.min(g, 1.1)})`, opacity: Math.min(g * 1.5, 1) }}>
      <div style={{ ...mono(size), fontWeight: 700, color, padding: "10px 20px", borderRadius: 14, border: `3px solid ${color}`, background: "rgba(0,0,0,0.9)" }}>{children}</div>
    </div>
  );
};
const Rotulo: React.FC<{ x: number; y: number; size?: number; color?: string; o?: number; ancla?: string; children: React.ReactNode }> = ({ x, y, size = 30, color = "#fff", o = 1, ancla = "translate(-50%, -100%)", children }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: ancla, ...mono(size), fontWeight: 700, color, opacity: o, textShadow: "0 0 16px rgba(0,0,0,0.95)" }}>{children}</div>
);
const camTorres = (t: number, s: number, e: number, d0: number, d1: number, tg = -9) =>
  orbita([0.2, -0.25, 0], L(t, s, e, d0, d1) - 0.25 * golpe(t, tg), L(t, s, e, -0.22, 0.05) + sacude(t, tg, 0.03), 0.12, { apertura: 38, centroY: 1000 });

// ------------------------------------------------------------------ 1. Hook: todo se derrumba ya en el fotograma 0; −20.000 millones en 48 h
const HOOK: Clave[] = [
  [0, { ...MANOS_CABEZA }],
  [EV.llamaba - 1.6, { mIx: -0.15, mIy: -0.52, mDx: 0.15, mDy: -0.52, agobio: 0, cejas: 0, boca: -0.2, ojos: 1, mira: 0.3, cabeza: 0.1 }],
];
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.2, -0.3, 0], L(t, s, e, 4.8, 5.6), L(t, s, e, -0.25, 0.05), 0.12, { apertura: 38, centroY: 1080 });
  const tr: Trazo[] = [...polvo(0.3)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.6);
  // Cada torre cae a su hora (ya cayendo en el fotograma 0)
  const horas = [-0.2, 0.35, 0.9, 1.5, 2.1];
  TX.forEach((x, i) => {
    const k = enPie(t, horas[i], 0.7);
    torre(tr, i, SUYO * Math.max(k, 0.25), PRESTA[i] * k, ROJO, 1, 0.3);
    escombros(tr, t, horas[i], x, -1 + SUYO + PRESTA[i] * 0.6, 7);
  });
  const c = cuerpoEn(t, HOOK, { ...MANOS_CABEZA }, -0.5);
  const a = anclaje(cam, [-0.3, -1, 0.55], 0.5);
  const valor = L(t, 0, EV["2"] + 0.2, 6.2e9, 2e10, (u) => 1 - Math.pow(1 - u, 2));
  const cifra = 1 - L(t, EV["2"] + 0.3, EV["2"] + 0.6, 0, 1);
  return (
    <>
      <CamaraTiembla t={t} t0={EV["2"] - 0.05} a={0.02}>
        <Escena cam={cam} trazos={tr} />
        <StickMundo a={a} c={c} t={t} />
        <Exclama t={t} t0={EV.llamaba - 0.6} c={c} {...a} signo="?" dura={1.2} />
      </CamaraTiembla>
      {cifra > 0.01 && (
        <div style={{ position: "absolute", top: 1330, left: 170, width: ANCHO - 170, display: "flex", justifyContent: "center", alignItems: "center", gap: 20, opacity: cifra }}>
          <span style={{ ...mono(70), fontWeight: 700, color: ROJO, fontVariantNumeric: "tabular-nums", textShadow: "0 0 30px rgba(255,77,94,0.5)" }}>{`−${euros(valor)} $`}</span>
        </div>
      )}
      {t > EV.llamaba - 1.8 && (
        <div style={{ position: "absolute", top: 330, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, EV.llamaba - 1.8, EV.llamaba - 1.5, 0, 1) }}>
          <span style={{ ...mono(46), fontWeight: 700, padding: "12px 28px", border: "3px solid #fff", borderRadius: 14, background: "#000" }}>{`NOMBRE: ${"?".repeat(Math.min(7, 1 + Math.floor((t - EV.llamaba + 1.8) * 6)))}`}</span>
        </div>
      )}
      <FlashRojo t={t} t0={EV["2"] - 0.05} o={0.16} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: Bill Hwang, 2021 · un puñado de acciones · con dinero prestado. Mucho.
const s1 = inicio("uno");
const UNO: Clave[] = [
  [s1 + 0.1, { mira: 0.7, boca: 0.4, cejas: 0.3 }],
  [EV.punado - 0.5, { mDx: 0.48, mDy: 0.2, mira: 0.8, boca: 0.6 }],
  [EV.mucho - 0.3, { ...ENCOGE, boca: 0.8, mira: 0 }],
];
const crecePresta = (t: number) => L(t, EV.prestado - 0.5, EV.prestado + 0.1, 0, 0.45) + L(t, EV.mucho - 0.25, EV.mucho + 0.2, 0, 0.55, (u) => 1 - Math.pow(1 - u, 3));
const Uno: React.FC<P> = ({ t, s, e }) => {
  const cam = camTorres(t, s, e, 4.9, 5.7, EV.mucho - 0.05);
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  const k = crecePresta(t);
  TX.forEach((_, i) => {
    const g = muelle(t, EV.punado - 0.55 + i * 0.12, 200, 13);
    torre(tr, i, SUYO * Math.min(g, 1.05), PRESTA[i] * k, "#fff", g > 0.01 ? 1 : 0, 0.3 + 0.6 * golpe(t, EV.mucho - 0.05));
  });
  const pr = proyector(cam);
  const qs = pr([TX[0] - ANCHO_T, -1 + SUYO / 2, -0.22]);
  const qp = pr([0.43, -1 + SUYO + PRESTA[2] * k + 0.05, -0.3]);
  const c = cuerpoEn(t, UNO, { mira: 0.7 }, s - 0.3);
  const a = anclaje(cam, [-0.3, -1, 0.55], 0.48);
  const etiq = L(t, EV.punado - 0.1, EV.punado + 0.2, 0, 1);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", top: 300, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
        <Pildora t={t} t0={EV.hwang - 0.3} size={46} ancla="">
          BILL HWANG · 2021
        </Pildora>
      </div>
      <Rotulo x={qs.x - 10} y={qs.y} ancla="translate(-100%, -50%)" size={32} o={etiq}>
        SUYO →
      </Rotulo>
      <Rotulo x={qp.x} y={qp.y} ancla="translate(-50%, -100%)" color={ROJO} size={44} o={L(t, EV.prestado - 0.4, EV.prestado - 0.1, 0, 1)}>
        PRESTADO
      </Rotulo>
      <StickMundo a={a} c={c} t={t} />
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: mientras subían, era un genio (corona)
const s2 = inicio("dos");
const DOS: Clave[] = [
  [s2 + 0.05, { ...BRAZOS_ARRIBA, boca: 1, abre: 0.6, ojos: 1.2, cejas: 0.6, mira: 0.5 }],
  [EV.genio - 0.15, { mIx: -0.13, mIy: -0.42, mDx: 0.13, mDy: -0.42, boca: 1, abre: 0, ojos: 0.8, cejas: 0.5, cabeza: 0.1, mira: 0 }],
];
const Dos: React.FC<P> = ({ t, s, e }) => {
  const cam = camTorres(t, s, e, 5.9, 5.5, EV.genio - 0.05);
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.4);
  const sube = 1 + L(t, s, e + 3, 0, 0.18, (u) => u);
  TX.forEach((_, i) => torre(tr, i, SUYO, PRESTA[i] * sube, VERDE, 1, 0.4 + 0.2 * Math.sin(t * 5 + i)));
  const c = cuerpoEn(t, DOS, { ...ENCOGE, boca: 0.8 }, s - 0.3);
  const a = anclaje(cam, [-0.3, -1, 0.55], 0.48);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <StickMundo a={a} c={c} t={t} />
      <Corona c={c} a={a} g={muelle(t, EV.genio - 0.25, 220, 12)} brillo={golpe(t, EV.genio - 0.05)} />
      <div style={{ position: "absolute", top: 300, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, EV.subian - 0.2, EV.subian + 0.1, 0, 1) }}>
        <span style={{ ...mono(46), fontWeight: 700, color: VERDE, padding: "12px 28px", border: `3px solid ${VERDE}`, borderRadius: 14, background: "#000" }}>TODO SUBE ↑</span>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 4. Sígueme encima de la escena
const Sigueme: React.FC<P> = (p) => (
  <>
    <AbsoluteFill style={{ filter: "blur(9px)" }}>
      <Dos t={p.t} s={s2} e={fin("dos")} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "rgba(0,0,0,0.6)" }} />
    <CtaSeguir {...p} lema="" sinFondo />
  </>
);

// ------------------------------------------------------------------ 5. Tres: una cae · los bancos piden garantías · no las tiene · lo venden todo
const s3 = inicio("tres");
const TRES: Clave[] = [
  [EV.cae - 0.1, { ...MANOS_CABEZA, ojos: 1.3, cejas: 1, mira: 0.6 }],
  [EV.bancos - 0.1, { mIx: -0.15, mIy: -0.52, mDx: 0.15, mDy: -0.52, agobio: 1, mira: -0.2, cejas: -0.8, boca: -0.6, ojos: 1.1 }],
  [EV.tiene - 0.35, { ...ENCOGE, cejas: -0.8, boca: -0.6, agobio: 1 }],
  [EV.golpe - 0.3, { ...MANOS_CABEZA }],
];
const BANCOS: [number, number][] = [[-0.15, -1.7], [0.4, -1.9], [0.95, -1.7]];
const Tres: React.FC<P> = ({ t, s, e }) => {
  const cam = camTorres(t, s, e, 5.9, 5.4, EV.cae - 0.05);
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  BANCOS.forEach(([x, z], i) => banco(tr, x, z, muelle(t, EV.bancos - 0.3 + i * 0.15, 200, 14)));
  TX.forEach((x, i) => {
    const primera = i === 2;
    const k = primera ? enPie(t, EV.cae - 0.1) : enPie(t, EV.golpe - 0.25 + i * 0.04);
    const color = primera ? (t > EV.cae - 0.2 ? ROJO : "#fff") : t > EV.golpe - 0.3 ? ROJO : "#fff";
    torre(tr, i, SUYO * Math.max(k, 0.3), PRESTA[i] * k, color);
    escombros(tr, t, primera ? EV.cae - 0.1 : EV.golpe - 0.25 + i * 0.04, x, -1 + SUYO + PRESTA[i] * 0.6, primera ? 9 : 6);
  });
  const pr = proyector(cam);
  const c = cuerpoEn(t, TRES, { mira: 0.6 }, s - 0.3);
  const a = anclaje(cam, [-0.3, -1, 0.55], 0.48);
  return (
    <>
      <CamaraTiembla t={t} t0={EV.golpe - 0.1} a={0.03}>
        <Escena cam={cam} trazos={tr} />
        {BANCOS.map(([x, z], i) => {
          const q = pr([x, -1 + 0.62, z]);
          return (
            <Pildora key={i} x={q.x} y={q.y - (i === 1 ? 40 : 0)} t={t} t0={EV.garantias - 0.6 + i * 0.22} size={28} color={ROJO} ancla={`translate(${[-30, -50, -70][i]}%, -100%)`}>
              MÁS GARANTÍAS
            </Pildora>
          );
        })}
        <StickMundo a={a} c={c} t={t} />
        <Exclama t={t} t0={EV.cae - 0.1} c={c} {...a} />
      </CamaraTiembla>
      <div style={{ position: "absolute", top: 300, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
        <Pildora t={t} t0={EV.tiene - 0.45} size={44} color={ROJO} ancla="">
          GARANTÍAS: 0 $
        </Pildora>
      </div>
      <Sello t={t} t0={EV.golpe - 0.15} texto="VENDIDO" top={560} size={90} />
      <FlashRojo t={t} t0={EV.cae - 0.05} o={0.14} />
      <FlashRojo t={t} t0={EV.golpe - 0.1} o={0.2} />
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: barrotes y 18 años · una sola columna sobre un palillo que cae con un error
const sG = inicio("giro");
const corteG = EV.concentrado - 0.25;
const GIRO: Clave[] = [
  [sG + 0.1, { ...HUNDIDO }],
];
const Carcel: React.FC<P> = ({ t, s }) => {
  const cam = orbita([-0.2, -0.45, 0.4], L(t, s, corteG, 3.8, 3.5), L(t, s, corteG, 0.1, -0.08), 0.06, { apertura: 38, centroY: 1020 });
  const fondo: Trazo[] = [...polvo(0.25)];
  suelo(fondo, t, -1.0, 0.14, "#fff", 0.2);
  const tr: Trazo[] = [];
  const baja = L(t, EV.condenado - 0.35, EV.condenado + 0.05, 1.6, 0, (u) => u * u);
  for (let k = 0; k < 8; k++) {
    const x = -0.8 + k * 0.17;
    tr.push({ t: "l", a: [x, -1 + baja, 0.85], b: [x, 0.5 + baja, 0.85], w: 4, o: 1, luz: 0.3 });
  }
  for (const y of [-0.1, 0.45]) tr.push({ t: "l", a: [-0.85, y + baja, 0.85], b: [0.45, y + baja, 0.85], w: 4, o: 1, luz: 0.3 });
  const c = cuerpoEn(t, GIRO, { ...HUNDIDO }, s - 0.3);
  const a = anclaje(cam, [-0.2, -1, 0.45], 0.5);
  const g = muelle(t, EV["18"] - 0.15, 240, 12);
  return (
    <>
      <Escena cam={cam} trazos={fondo} />
      <StickMundo a={a} c={c} t={t} />
      <Escena cam={cam} trazos={tr} />
      {g > 0.01 && (
        <div style={{ position: "absolute", top: 300, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: Math.min(g * 1.5, 1), transform: `scale(${0.6 + 0.4 * Math.min(g, 1.08)})` }}>
          <span style={{ ...mono(130), fontWeight: 700, color: ROJO, textShadow: "0 0 40px rgba(255,77,94,0.5)" }}>18 AÑOS</span>
        </div>
      )}
    </>
  );
};
// Columna que gira sobre el pie de su palillo (aristas de la caja rotadas en el plano x-y)
const rota = (p: V3, c: [number, number], a: number): V3 => {
  const dx = p[0] - c[0];
  const dy = p[1] - c[1];
  return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a), p[2]];
};
const Columna: React.FC<P> = ({ t, e }) => {
  const cam = orbita([0.05, -0.2, 0], L(t, corteG, e, 5.6, 5.2), L(t, corteG, e, -0.2, 0.1) + sacude(t, EV.vez - 0.1, 0.03), 0.12, { apertura: 38, centroY: 1120 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  const cae = L(t, EV.vez - 0.45, EV.vez + 0.25, 0, 1, (u) => u * u);
  const ang = -1.35 * cae + 0.03 * Math.sin(t * 3) * (1 - cae);
  const piv: [number, number] = [0.3, -1];
  const col = cae > 0.05 ? ROJO : "#fff";
  // Palillo (apalancado) y columna enorme (concentrado)
  const palo = L(t, EV.apalancado - 0.4, EV.apalancado, 0, 1);
  const alto = muelle(t, EV.concentrado - 0.3, 200, 13);
  const y0 = -1 + 0.55 * palo;
  const min: V3 = [0.3 - 0.2, y0, -0.15];
  const max: V3 = [0.3 + 0.2, y0 + 1.05 * Math.min(alto, 1.05), 0.15];
  for (const [p, q] of caja(min, max)) tr.push({ t: "l", a: rota(p, piv, ang), b: rota(q, piv, ang), w: 2.6, o: 1, luz: 0.35, color: col });
  const cara: V3[] = [[min[0], min[1], max[2]], [max[0], min[1], max[2]], [max[0], max[1], max[2]], [min[0], max[1], max[2]], [min[0], min[1], max[2]]];
  tr.push({ t: "p", pts: cara.map((p) => rota(p, piv, ang)), w: 0, o: 1, relleno: col, oRelleno: 0.12 });
  if (palo > 0.01) tr.push({ t: "l", a: rota([0.3, -1, 0], piv, ang), b: rota([0.3, y0, 0], piv, ang), w: 5, o: 1, color: col });
  // El error pequeño: un cubito rojo que la empuja
  const empuje = L(t, EV.vez - 0.8, EV.vez - 0.45, 0, 1);
  if (empuje > 0 && cae < 0.4) cristal(tr, [0.75 - 0.25 * empuje, y0 + 0.7, -0.05], [0.83 - 0.25 * empuje, y0 + 0.78, 0.03], ROJO, 1, 0.6, 0.4);
  escombros(tr, t, EV.vez + 0.2, -0.8, -0.95, 10);
  const pr = proyector(cam);
  const qe = pr([0.85, y0 + 0.85, 0]);
  const c = cuerpoEn(t, [[corteG, { mira: 0.8, cejas: 0.3 }], [EV.vez - 0.2, { ...MANOS_CABEZA }]], { mira: 0.8 }, corteG - 0.3);
  const a = anclaje(cam, [-0.45, -1, 0.6], 0.4);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", top: 300, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <Pildora t={t} t0={EV.concentrado - 0.3} size={44} ancla="">
          MUY CONCENTRADO
        </Pildora>
        <Pildora t={t} t0={EV.apalancado - 0.3} size={44} color={ROJO} ancla="">
          MUY APALANCADO
        </Pildora>
      </div>
      {empuje > 0 && cae < 0.4 && (
        <Rotulo x={qe.x} y={qe.y} size={28} color={ROJO} ancla="translate(-10%, -120%)">
          1 ERROR
        </Rotulo>
      )}
      <StickMundo a={a} c={c} t={t} />
      <FlashRojo t={t} t0={EV.vez - 0.05} o={0.2} />
    </>
  );
};
const Giro: React.FC<P> = (p) => (p.t < corteG ? <Carcel {...p} /> : <Columna {...p} />);

// ------------------------------------------------------------------ 7. Pregunta: ¿cuánto metes tú en una sola operación?
const Pregunta: React.FC<P> = (p) => <PreguntaDos {...p} izq={{ texto: "POCO", sub: "UNA PARTE PEQUEÑA", t0: EV.cuanto + 0.5 }} der={{ texto: "TODO", sub: "O NADA", t0: EV.cuanto + 1.2 }} pie="MÁNDASELO AL DEL TODO O NADA" tPie={EV.mandaselo} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, pregunta: Pregunta };
export const CLAVES = claves([["20000", ROJO], "hwang", "puñado", ["prestado", ROJO], "mucho", ["genio", VERDE], "sígueme", ["cae", ROJO], "garantías", "golpe", ["18", ROJO], "concentrado", "apalancado", ["vez", ROJO], "mándaselo"]);

const GANCHO = { lineas: ["Perdió *20.000_millones*", "en *2_días*"], hasta: EV["2"] + 0.45, color: ROJO };
export const Archegos: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/archegos_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.1} empujes={0.05} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} />
);
