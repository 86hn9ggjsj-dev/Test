// Historia 5-30-10 «dopamina» "Un día, el petróleo valió menos que cero" (~34 s): el WTI a −37,63 $ (20-4-2020).
// Fotograma 0: la cotización del barril cayendo 18 → 0 → −37,63 $ mientras un barril atraviesa la línea del cero; la
// tarjeta de la prueba; los tanques que se llenan (LLENO); el contrato con el sello VENCE MAÑANA; el camión que trae los
// barriles a la puerta del stickman que no tiene dónde meterlos y el VENDER A CUALQUIER PRECIO; la regla como lista de tres
// preguntas y el cierre en el móvil. Tiempos en src/gen/petroleo.json (scripts/petroleo.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/petroleo.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { ORO, ROJO, VERDE } from "../Bot/kit";
import { cuerpoEn, Stick } from "../Bot/stick";
import { MANOS_CABEZA, ENCOGE } from "../Bot/comun";
import { CamaraTiembla, Sello } from "../Bot/historia";
import { Foco } from "../Bot/ui2d";
import { Boton, Marca, pulsa, Rotulito } from "../Bot/v3";
import { CierreMovil, Prueba, TarjetaAuditada } from "../Bot/dopa";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const PETROLEO_FPS = datos.fps;
export const PETROLEO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const min1 = (g: number, m = 1) => Math.min(g, m);

const Barril: React.FC<{ x: number; y: number; w?: number; rot?: number; color?: string; o?: number }> = ({ x, y, w = 150, rot = 0, color = "#fff", o = 1 }) => (
  <svg width={w} height={w * 1.3} viewBox="0 0 100 130" style={{ position: "absolute", left: x - w / 2, top: y - w * 0.65, transform: `rotate(${rot}deg)`, opacity: o, overflow: "visible" }}>
    <ellipse cx={50} cy={14} rx={40} ry={10} fill="#111" stroke={color} strokeWidth={4} />
    <path d="M10 14 V116 A40 10 0 0 0 90 116 V14" fill="#0a0a0a" stroke={color} strokeWidth={4} />
    <path d="M10 48 A40 10 0 0 0 90 48 M10 84 A40 10 0 0 0 90 84" fill="none" stroke={color} strokeWidth={3} opacity={0.7} />
    <text x={50} y={74} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={18} fill={color}>OIL</text>
  </svg>
);

// ------------------------------------------------------------------ 1. Hook: 18 $ → 0 → −37,63 $ y el barril que atraviesa el cero
const precioHook = (t: number) => {
  if (t < EV.cero) return 18.27 - 18.27 * L(t, 0, EV.cero, 0, 1, (u) => u * u);
  return -37.63 * L(t, EV.cero, EV.pagaban, 0, 1, (u) => 1 - Math.pow(1 - u, 3));
};
const fmt = (v: number) => (v < 0 ? "−" : "") + Math.abs(v).toFixed(2).replace(".", ",") + " $";
const Hook: React.FC<P> = ({ t }) => {
  const v = precioHook(t);
  const Y0 = 980;
  const yb = Y0 - 120 + (Math.max(-37.63, Math.min(18.27, v)) * -1 + 18.27) * 5.5;
  const neg = v < 0;
  return (
    <CamaraTiembla t={t} t0={EV.cero} a={0.02}>
      <div style={{ position: "absolute", left: 0, width: ANCHO, top: 560, textAlign: "center", ...mono(34), fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.7)" }}>BARRIL DE TEXAS</div>
      <div style={{ position: "absolute", left: 0, width: ANCHO, top: 610, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 150, letterSpacing: "-0.04em", color: neg ? ROJO : "#fff", textShadow: neg ? `0 0 40px ${ROJO}88` : undefined }}>{fmt(v)}</div>
      <div style={{ position: "absolute", left: 110, width: 860, top: Y0, borderTop: "5px dashed #fff" }} />
      <div style={{ position: "absolute", left: 110, top: Y0 + 12, ...mono(36), fontWeight: 800 }}>0 $</div>
      <Foco x={540} y={Y0} w={700} h={60} o={0.12} />
      <Barril x={830} y={yb} rot={neg ? 12 : -4} color={neg ? ROJO : "#fff"} />
      {t > EV.pagaban - 0.1 && <div style={{ position: "absolute", left: 160, top: 1120, ...mono(40), fontWeight: 800, color: VERDE, transform: `scale(${0.6 + 0.4 * min1(muelle(t, EV.pagaban - 0.1, 240, 12), 1.1)})`, transformOrigin: "0% 50%" }}>+37 $ POR LLEVÁRTELO</div>}
    </CamaraTiembla>
  );
};

// ------------------------------------------------------------------ 2. Uno: la prueba · los tanques llenos
const Tanque: React.FC<{ x: number; k: number; lleno: boolean }> = ({ x, k, lleno }) => (
  <div style={{ position: "absolute", left: x - 120, top: 760, width: 240, height: 420, borderRadius: "40px 40px 10px 10px", border: `5px solid ${lleno ? ROJO : "#fff"}`, background: "#050505", overflow: "hidden", boxShadow: lleno ? `0 0 40px ${ROJO}66` : undefined }}>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${k * 100}%`, background: "linear-gradient(180deg, #333 0%, #111 100%)", borderTop: `4px solid ${lleno ? ROJO : ORO}` }} />
    {[0.25, 0.5, 0.75].map((h) => <div key={h} style={{ position: "absolute", left: 0, right: 0, top: `${h * 100}%`, height: 2, background: "rgba(255,255,255,0.15)" }} />)}
  </div>
);
const Uno: React.FC<P> = ({ t }) => {
  const tarjeta = 1 - L(t, EV.guardarlo - 0.9, EV.guardarlo - 0.65, 0, 1);
  const tanques = L(t, EV.guardarlo - 0.8, EV.guardarlo - 0.55, 0, 1);
  const k = L(t, EV.guardarlo - 0.7, EV.guardarlo + 0.1, 0.55, 1);
  const lleno = k >= 0.99;
  return (
    <>
      {tarjeta > 0.01 && (
        <AbsoluteFill style={{ opacity: tarjeta }}>
          <Prueba t={t} t0={EV["2020"] - 0.3} x={540} y={830} cabecera="WTI · PETRÓLEO DE TEXAS · 20-4-2020" cifra="−37,63 $" pie="primer cierre negativo de la historia" color={ROJO} />
        </AbsoluteFill>
      )}
      {tanques > 0.01 && (
        <AbsoluteFill style={{ opacity: tanques }}>
          {[290, 540, 790].map((x) => <Tanque key={x} x={x} k={k} lleno={lleno} />)}
          <div style={{ position: "absolute", left: 0, width: ANCHO, top: 640, textAlign: "center", ...mono(40), fontWeight: 800 }}>DEPÓSITOS DE CUSHING</div>
          {lleno && <Sello t={t} t0={EV.guardarlo + 0.1} texto="LLENO" top={900} color={ROJO} size={110} />}
        </AbsoluteFill>
      )}
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

// ------------------------------------------------------------------ 4. Dos: el contrato que vence mañana · el camión de barriles · vender a cualquier precio
const Camion: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={420} height={220} viewBox="0 0 210 110" style={{ position: "absolute", left: x - 210, top: y - 110, overflow: "visible" }}>
    <rect x={10} y={20} width={130} height={60} rx={6} fill="#060606" stroke="#fff" strokeWidth={3} />
    <path d="M140 40 H175 L195 60 V80 H140 Z" fill="#060606" stroke="#fff" strokeWidth={3} />
    {[40, 165].map((cx) => <circle key={cx} cx={cx} cy={86} r={13} fill="#000" stroke="#fff" strokeWidth={3} />)}
    {[30, 62, 94, 120].map((bx) => <g key={bx}><rect x={bx - 12} y={4} width={24} height={30} rx={4} fill="#0a0a0a" stroke={ORO} strokeWidth={2.5} /></g>)}
  </svg>
);
const Dos: React.FC<P> = ({ t, s }) => {
  const contrato = 1 - L(t, EV.recibir - 0.5, EV.recibir - 0.25, 0, 1);
  const escena = L(t, EV.recibir - 0.4, EV.recibir - 0.15, 0, 1);
  const llega = L(t, EV.recibir - 0.4, EV.barriles + 0.2, 0, 1, (u) => 1 - Math.pow(1 - u, 3));
  const c = cuerpoEn(t, [[EV.barriles, { ...MANOS_CABEZA }], [EV.tanque - 0.1, { ...ENCOGE }], [EV.cualquier - 0.15, { mDx: 0.48, mDy: -0.12, agobio: 1, cejas: -1, boca: -0.6 }]], {}, s);
  const g = muelle(t, EV.contrato - 0.15, 220, 13);
  return (
    <>
      {contrato > 0.01 && (
        <AbsoluteFill style={{ opacity: contrato }}>
          <div style={{ position: "absolute", left: 240, top: 520, width: 600, height: 720, borderRadius: 20, border: "4px solid #fff", background: "#080808", padding: "40px 44px", boxSizing: "border-box", color: "#fff", transform: `rotate(-3deg) scale(${0.6 + 0.4 * min1(g, 1.08)})`, opacity: min1(g * 2) }}>
            <div style={{ ...mono(34), fontWeight: 800 }}>CONTRATO DE FUTUROS</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 58, marginTop: 14 }}>Petróleo · mayo</div>
            {[0.9, 0.7, 0.85, 0.6, 0.75].map((w, i) => <div key={i} style={{ width: 500 * w, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.25)", marginTop: 26 }} />)}
            <div style={{ ...mono(32), fontWeight: 800, marginTop: 40, color: ORO }}>AL VENCER: ENTREGA DE LOS BARRILES</div>
          </div>
          <Sello t={t} t0={EV.vencia - 0.1} texto="VENCE MAÑANA" top={900} color={ROJO} size={88} />
        </AbsoluteFill>
      )}
      {escena > 0.01 && (
        <AbsoluteFill style={{ opacity: escena }}>
          <div style={{ position: "absolute", left: 100, right: 100, top: 1300, height: 4, background: "rgba(255,255,255,0.5)" }} />
          <Camion x={1300 - 560 * llega} y={1300} />
          {llega > 0.95 && [0, 1, 2, 3, 4].map((i) => <Barril key={i} x={560 + (i % 3) * 70} y={1240 - Math.floor(i / 3) * 110} w={90} color={ORO} />)}
          <Foco x={300} y={1300} w={360} h={70} o={0.15} />
          <Stick c={c} ox={300} oy={1300} s={250} t={t} />
          {t > EV.tanque - 0.15 && <div style={{ position: "absolute", left: 140, top: 830, ...mono(40), fontWeight: 800, color: ROJO, padding: "8px 18px", border: `3px solid ${ROJO}`, borderRadius: 12, background: "#000", transform: `rotate(-4deg) scale(${0.6 + 0.4 * min1(muelle(t, EV.tanque - 0.15, 240, 12), 1.1)})` }}>SIN TANQUE</div>}
          {t > EV.cualquier - 0.3 && <Boton x={720} y={700} w={520} h={150} texto="VENDER YA" color={ROJO} lleno={pulsa(t, EV.cualquier)} k={pulsa(t, EV.cualquier)} o={L(t, EV.cualquier - 0.3, EV.cualquier - 0.1, 0, 1)} />}
          {t > EV.cualquier + 0.1 && <div style={{ position: "absolute", left: 460, width: 520, top: 800, textAlign: "center", ...mono(34), fontWeight: 800, color: ROJO }}>A CUALQUIER PRECIO</div>}
        </AbsoluteFill>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: lista de tres preguntas antes de operar algo
const PREGUNTAS: [string, number][] = [["¿Qué compro?", EV.compras], ["¿Vence?", EV.frase], ["¿Qué pasa ese día?", EV.vence]];
const Giro: React.FC<P> = ({ t }) => (
  <>
    <Rotulito t={t} t0={EV.regla - 0.15} texto="ANTES DE OPERAR ALGO" top={380} />
    {PREGUNTAS.map(([q, t0], i) => {
      const g = muelle(t, t0 - 0.35, 220, 13);
      if (g <= 0.01) return null;
      return (
        <div key={q} style={{ position: "absolute", left: 120, top: 520 + i * 200, width: 840, height: 160, borderRadius: 30, border: "4px solid #fff", background: "#060606", display: "flex", alignItems: "center", gap: 30, padding: "0 36px", boxSizing: "border-box", opacity: min1(g * 2), transform: `translateX(${(1 - min1(g)) * -100}px)` }}>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 90, color: ORO, lineHeight: 1 }}>{i + 1}</span>
          <span style={{ flex: 1, fontFamily: SANS, fontWeight: 800, fontSize: 60, color: "#fff" }}>{q}</span>
          <div style={{ position: "relative", width: 100, height: 100 }}><Marca t={t} t0={t0 + 0.1} x={50} y={50} size={100} color={VERDE} tipo="ok" /></div>
        </div>
      );
    })}
    <Sello t={t} t0={EV.operes - 0.1} texto="SI NO LO SABES: NO" top={1150} color={ROJO} size={76} />
  </>
);

// ------------------------------------------------------------------ 6. Cierre: comenta BOT en el móvil → mensaje directo → cuenta auditada
const Cierre: React.FC<P> = (p) => <CierreMovil {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tFinal={EV.auditada} palabra="BOT" mensaje="Te explico cómo lo hago ↓" final={<TarjetaAuditada />} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["petróleo", ORO], ["cero", ROJO], ["pagaban", VERDE], "2020", "texas", ["37", ROJO], ["guardarlo", ROJO], "sígueme", "problema", ["contrato", ORO], ["vencía", ROJO], "recibir", "barriles", "tanque", ["cualquier", ROJO], "regla", "compras", "frase", "vence", ["operes", ROJO], "llegado", "bot", ["auditada", VERDE]]);
const GOLPES: [number, string?][] = [[0.02], [EV.petroleo], [EV.cero, ROJO], [EV.pagaban, VERDE], [EV["2020"]], [EV.dolares, ROJO], [EV.guardarlo, ROJO], [EV.problema], [EV.contrato, ORO], [EV.vencia, ROJO], [EV.recibir], [EV.barriles, ORO], [EV.tanque], [EV.cualquier, ROJO], [EV.regla], [EV.compras, VERDE], [EV.frase, VERDE], [EV.vence, VERDE], [EV.operes, ROJO], [EV.llegado], [EV.bot], [EV.privado], [EV.auditada, VERDE]];

const GANCHO = { lineas: ["El petróleo", "valió *menos_que_cero*"], hasta: inicio("uno") - 0.05, color: ROJO };
export const Petroleo: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/petroleo_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.08} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} />
);
