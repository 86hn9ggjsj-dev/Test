// Reel 5-30-10 «dopamina» "Tu operación no tiene que tocar el stop para estar mal" (~35 s): el stop por tiempo, sin jerga.
// Stickman («tú») delante de un gráfico plano. Fotograma 0: la línea del precio sin moverse, el stop muy abajo y un reloj
// de arena que se vacía mientras el stickman bosteza; contador de velas 1 → 10 → 100; el dinero con candado y la nube
// encima de la cabeza; lo que esperabas (flecha punteada) frente a lo que pasa (plano) = IDEA FALLIDA aunque el stop esté
// lejos; la regla con el temporizador junto a la entrada y el botón CERRAR; cierre en el móvil.
// Tiempos en src/gen/tiempo.json (scripts/tiempo.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/tiempo.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { ORO, ROJO, VERDE } from "../Bot/kit";
import { cuerpoEn, Stick } from "../Bot/stick";
import { CamaraTiembla, Sello } from "../Bot/historia";
import { Foco } from "../Bot/ui2d";
import { Boton, Marca, pulsa, Rotulito } from "../Bot/v3";
import { CierreMovil, Ficha3D, TarjetaAuditada } from "../Bot/dopa";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const TIEMPO_FPS = datos.fps;
export const TIEMPO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const min1 = (g: number, m = 1) => Math.min(g, m);

// ------------------------------------------------------------------ piezas: gráfico plano y reloj de arena
const X0 = 150;
const X1 = 950;
const Y_ENT = 760;
const Y_STOP = 1080;
const plano = (u0: number, u1: number, amp = 14) => {
  const out: string[] = [];
  for (let u = u0; u <= u1 + 1e-6; u += 0.01) out.push(`${(X0 + u * (X1 - X0)).toFixed(1)},${(Y_ENT + Math.sin(u * 47) * amp * 0.6 + Math.sin(u * 13 + 1) * amp * 0.4).toFixed(1)}`);
  return out.join(" ");
};
const Grafico: React.FC<{ t: number; u: number; stopTexto?: string }> = ({ t, u, stopTexto = "STOP" }) => (
  <>
    <div style={{ position: "absolute", left: X0 - 20, width: X1 - X0 + 40, top: Y_STOP - 3, borderTop: `6px solid ${ROJO}`, boxShadow: `0 0 16px ${ROJO}` }} />
    <div style={{ position: "absolute", left: X1 - 300, width: 300, textAlign: "right", top: Y_STOP + 12, ...mono(34), fontWeight: 800, color: ROJO }}>{stopTexto}</div>
    <div style={{ position: "absolute", left: X0 - 20, width: X1 - X0 + 40, top: Y_ENT - 2, borderTop: "4px dashed rgba(255,255,255,0.45)" }} />
    <div style={{ position: "absolute", left: X1 - 300, width: 300, top: Y_ENT - 56, textAlign: "right", ...mono(32), fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>ENTRADA</div>
    <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
      <polyline points={plano(0, u)} fill="none" stroke="#fff" strokeWidth={7} strokeLinejoin="round" />
      <circle cx={X0 + u * (X1 - X0)} cy={Y_ENT + Math.sin(u * 47) * 14 * 0.6 + Math.sin(u * 13 + 1) * 14 * 0.4} r={13} fill="#fff" />
      <circle cx={X0 + u * (X1 - X0)} cy={Y_ENT} r={13 + 20 * ((t * 1.4) % 1)} fill="none" stroke="#fff" strokeWidth={3} opacity={1 - ((t * 1.4) % 1)} />
    </svg>
  </>
);
const Reloj: React.FC<{ x: number; y: number; k: number; size?: number; color?: string }> = ({ x, y, k, size = 170, color = ORO }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 100 140" style={{ position: "absolute", left: x - size / 2, top: y - size * 0.7, overflow: "visible", filter: `drop-shadow(0 0 16px ${color}88)` }}>
    <path d="M15 8 H85 M15 132 H85 M22 8 C22 50 48 58 50 70 C52 82 78 90 78 132 M78 8 C78 50 52 58 50 70 C48 82 22 90 22 132" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" />
    <path d={`M${30 + 20 * k} ${20 + 40 * k} H${70 - 20 * k} L50 66 Z`} fill={color} opacity={1 - k * 0.95} />
    <path d={`M28 128 H72 L50 ${128 - 40 * k} Z`} fill={color} />
    <line x1={50} y1={66} x2={50} y2={128} stroke={color} strokeWidth={2} strokeDasharray="3 5" opacity={k < 1 ? 0.8 : 0} />
  </svg>
);

// ------------------------------------------------------------------ 1. Hook: el precio no se mueve, el stop lejos, el reloj se vacía
const Hook: React.FC<P> = ({ t, s }) => {
  const c = cuerpoEn(t, [[0.3, { abre: 0.8, ojos: 0.35, mIx: -0.05, mIy: 0.05, boca: 0 }], [1.3, { abre: 0, ojos: 0.6, mIx: -0.15, mIy: -0.52 }], [EV.mal - 0.1, { cejas: -0.6, boca: -0.4, ojos: 1 }]], { ojos: 0.6 }, s - 0.4);
  return (
    <CamaraTiembla t={t} t0={EV.mal} a={0.015}>
      <Grafico t={t} u={0.25 + t * 0.06} />
      <Reloj x={830} y={960} k={L(t, 0, 3, 0.25, 0.9, (u) => u)} />
      <Foco x={250} y={1400} w={360} h={70} o={0.15} />
      <Stick c={c} ox={250} oy={1400} s={200} t={t} />
      {t < 1.4 && <div style={{ position: "absolute", left: 300, top: 1080, ...mono(40), fontWeight: 800, opacity: L(t, 0.3, 0.5, 0, 1) * (1 - L(t, 1.2, 1.4, 0, 1)) }}>zzz…</div>}
    </CamaraTiembla>
  );
};

// ------------------------------------------------------------------ 2. Uno: 1 vela, 10, 100 · el dinero bloqueado y la cabeza también
const Nube: React.FC<{ x: number; y: number; o: number; t: number }> = ({ x, y, o, t }) => (
  <svg width={260} height={180} viewBox="0 0 130 90" style={{ position: "absolute", left: x - 130, top: y - 90 + Math.sin(t * 2) * 6, opacity: o, overflow: "visible" }}>
    <path d="M25 55 C10 55 8 35 24 33 C24 18 45 12 55 24 C62 10 88 12 90 30 C106 28 112 52 96 55 Z" fill="#2a2a2a" stroke="#888" strokeWidth={3} />
    {[0, 1, 2, 3].map((k) => <line key={k} x1={35 + k * 18} y1={62 + ((t * 120 + k * 9) % 22)} x2={31 + k * 18} y2={72 + ((t * 120 + k * 9) % 22)} stroke="#6aa0ff" strokeWidth={3} strokeLinecap="round" />)}
  </svg>
);
const Uno: React.FC<P> = ({ t, s }) => {
  const velas = t < EV.vela - 0.05 ? 0 : t < EV.diez - 0.05 ? 1 : t < EV.cien - 0.05 ? 10 : 100;
  const u = L(t, s, EV.cabeza, 0.12, 0.98, (v) => v);
  const c = cuerpoEn(t, [[EV.entras, { mDx: 0.4, mDy: -0.1, boca: 0.4 }], [EV.vela, { mDx: 0.15, mDy: -0.52, boca: 0, mira: 0.5 }], [EV.cien, { agacha: 0.4, boca: -0.4, ojos: 0.6 }], [EV.cabeza, { agacha: 0.6, boca: -0.7, cejas: -0.8, agobio: 0.6 }]], {}, s - 0.4);
  const candado = muelle(t, EV.bloqueado - 0.15, 230, 12);
  return (
    <>
      <Grafico t={t} u={u} />
      {velas > 0 && <Ficha3D key={velas} t={t} t0={velas === 1 ? EV.vela - 0.05 : velas === 10 ? EV.diez - 0.05 : EV.cien - 0.05} texto={`${velas} ${velas === 1 ? "VELA" : "VELAS"}`} y={470} size={120} color={velas === 100 ? ROJO : "#fff"} />}
      {candado > 0.01 && (
        <div style={{ position: "absolute", left: 700, top: 860, width: 240, opacity: min1(candado * 2), transform: `scale(${0.5 + 0.5 * min1(candado, 1.1)})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <svg width={120} height={138} viewBox="0 0 100 115" style={{ filter: `drop-shadow(0 0 16px ${ROJO})` }}>
            <path d="M28 52 L28 34 A22 22 0 0 1 72 34 L72 52" fill="none" stroke={ROJO} strokeWidth={9} strokeLinecap="round" />
            <rect x={12} y={50} width={76} height={60} rx={10} fill="#000" stroke={ROJO} strokeWidth={7} />
            <text x={50} y={90} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={30} fill={ROJO}>€</text>
          </svg>
          <span style={{ ...mono(30), fontWeight: 800, color: ROJO }}>BLOQUEADO</span>
        </div>
      )}
      <Foco x={250} y={1400} w={360} h={70} o={0.15} />
      <Stick c={c} ox={250} oy={1400} s={200} t={t} />
      <Nube x={250} y={1010} o={L(t, EV.cabeza - 0.2, EV.cabeza + 0.2, 0, 1)} t={t} />
    </>
  );
};

// ------------------------------------------------------------------ 3. Sígueme encima de la escena
const s1 = inicio("uno");
const Sigueme: React.FC<P> = (p) => (
  <>
    <AbsoluteFill style={{ filter: "blur(9px)" }}>
      <Uno t={p.t} s={s1} e={fin("uno")} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "rgba(0,0,0,0.6)" }} />
    <CtaSeguir {...p} lema="" sinFondo />
  </>
);

// ------------------------------------------------------------------ 4. Dos: lo que esperabas frente a lo que pasa · IDEA FALLIDA aunque el stop esté lejos
const Dos: React.FC<P> = ({ t }) => {
  const espera = L(t, EV.esperando - 0.1, EV.esperando + 0.6, 0, 1);
  const real = L(t, EV.llega - 0.2, EV.llega + 0.8, 0, 1);
  const lejos = L(t, EV.lejos - 0.2, EV.lejos + 0.2, 0, 1);
  const xa = X0 + 0.15 * (X1 - X0);
  return (
    <>
      <div style={{ position: "absolute", left: X0 - 20, width: X1 - X0 + 40, top: Y_STOP - 3, borderTop: `6px solid ${ROJO}`, boxShadow: `0 0 ${16 + 30 * lejos}px ${ROJO}` }} />
      <div style={{ position: "absolute", left: X0 - 10, top: Y_STOP + 12, ...mono(34 + 8 * lejos), fontWeight: 800, color: ROJO }}>{lejos > 0.5 ? "STOP: AÚN LEJOS" : "STOP"}</div>
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
        <polyline points={plano(0, 0.15)} fill="none" stroke="#fff" strokeWidth={7} />
        {espera > 0 && <path d={`M${xa} ${Y_ENT} Q${xa + 300} ${Y_ENT - 40} ${xa + 620 * espera} ${Y_ENT - 380 * espera}`} fill="none" stroke={VERDE} strokeWidth={7} strokeDasharray="18 12" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${VERDE})` }} />}
        {real > 0 && <polyline points={plano(0.15, 0.15 + 0.85 * real)} fill="none" stroke="#fff" strokeWidth={7} />}
      </svg>
      {espera > 0.5 && <div style={{ position: "absolute", left: xa + 300, top: Y_ENT - 430, ...mono(36), fontWeight: 800, color: VERDE }}>LO QUE ESPERABAS</div>}
      {real > 0.5 && <div style={{ position: "absolute", left: X1 - 380, width: 380, top: Y_ENT + 30, textAlign: "right", ...mono(36), fontWeight: 800 }}>LO QUE PASA</div>}
      <Sello t={t} t0={EV.fallado - 0.1} texto="IDEA FALLIDA" top={880} color={ROJO} size={86} fin={EV.tiempo - 0.2} />
      <Ficha3D t={t} t0={EV.tiempo - 0.15} texto="STOP POR TIEMPO" y={930} size={96} color={ORO} />
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: el temporizador junto a la entrada → CERRAR, gane o pierda poco
const Giro: React.FC<P> = ({ t, s }) => {
  const timer = muelle(t, EV.decide - 0.1, 220, 13);
  const queda = L(t, EV.tiempo2, EV.favor + 0.3, 1, 0, (u) => u);
  const cierra = t > EV.cierras - 0.3;
  const c = cuerpoEn(t, [[EV.decide, { mDx: 0.38, mDy: 0.05, mira: 0.7, boca: 0.3 }], [EV.cierras - 0.15, { mDx: 0.5, mDy: -0.15, cejas: 0.4 }], [EV.poco, { mDx: 0.15, mDy: -0.52, boca: 0.8, ojos: 0.8 }]], {}, s - 0.3);
  const R = 120;
  return (
    <>
      <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" top={360} />
      <Grafico t={t} u={L(t, s, EV.favor + 0.3, 0.1, 0.55, (v) => v)} />
      {timer > 0.01 && (
        <div style={{ position: "absolute", left: 760 - R, top: 560 - R, width: R * 2, height: R * 2, opacity: min1(timer * 2), transform: `scale(${0.5 + 0.5 * min1(timer, 1.1)})` }}>
          <svg width={R * 2} height={R * 2} style={{ position: "absolute", inset: 0 }}>
            <circle cx={R} cy={R} r={R - 12} fill="#050505" stroke="rgba(255,255,255,0.2)" strokeWidth={14} />
            <circle cx={R} cy={R} r={R - 12} fill="none" stroke={queda > 0.3 ? ORO : ROJO} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={`${queda} 1`} transform={`rotate(-90 ${R} ${R})`} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 72, color: "#fff" }}>{Math.ceil(20 * queda)}</span>
            <span style={{ ...mono(24), fontWeight: 800 }}>VELAS</span>
          </div>
        </div>
      )}
      {cierra && <Boton x={700} y={1250} w={420} h={140} texto="CERRAR" color={VERDE} lleno={0.9} k={pulsa(t, EV.cierras)} o={L(t, EV.cierras - 0.3, EV.cierras - 0.1, 0, 1)} />}
      <Marca t={t} t0={EV.cierras + 0.15} x={930} y={1180} size={100} color={VERDE} tipo="ok" />
      {t > EV.poco - 0.2 && <div style={{ position: "absolute", left: 500, width: 420, top: 1350, textAlign: "center", ...mono(32), fontWeight: 800, color: VERDE, opacity: L(t, EV.poco - 0.2, EV.poco + 0.1, 0, 1) }}>GANE O PIERDA POCO</div>}
      <Foco x={250} y={1400} w={360} h={70} o={0.15} />
      <Stick c={c} ox={250} oy={1400} s={200} t={t} />
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: comenta BOT en el móvil → mensaje directo → cuenta auditada
const Cierre: React.FC<P> = (p) => <CierreMovil {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tFinal={EV.auditada} palabra="BOT" mensaje="Te explico cómo lo hago ↓" final={<TarjetaAuditada />} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["stop", ROJO], ["mal", ROJO], "nada", "vela", "diez", ["cien", ROJO], ["bloqueado", ROJO], "cabeza", "sígueme", ["esperando", VERDE], ["fallado", ROJO], "lejos", ["tiempo", ORO], "regla", "decide", ["favor", VERDE], ["cierras", VERDE], "llegado", "hoy", "bot", ["auditada", VERDE]]);
const GOLPES: [number, string?][] = [[0.02], [EV.stop, ROJO], [EV.mal, ROJO], [EV.entras], [EV.vela], [EV.diez], [EV.cien, ROJO], [EV.bloqueado, ROJO], [EV.cabeza], [EV.esperando, VERDE], [EV.llega], [EV.fallado, ROJO], [EV.lejos, ROJO], [EV.tiempo, ORO], [EV.regla], [EV.decide, ORO], [EV.favor], [EV.cierras, VERDE], [EV.poco, VERDE], [EV.llegado], [EV.bot], [EV.privado], [EV.auditada, VERDE]];

const GANCHO = { lineas: ["No tiene que tocar el stop", "para *estar_mal*"], hasta: inicio("uno") - 0.05, color: ROJO };
export const Tiempo: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/tiempo_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.08} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} />
);
