// Historia 5-30-10 «dopamina» "Buffett apostó un millón a que no hacer nada ganaba a los profesionales" (~38 s).
// Datos: la apuesta de Buffett con Protégé Partners (2008-2017): un fondo del S&P 500 +125,8 % frente a ~36 % de media de
// cinco fondos de fondos. Fotograma 0: un stickman tumbado en el sofá frente a cinco stickmen con corbata que no paran;
// la ficha 1.000.000 $; la tarjeta de la apuesta; ÍNDICE contra 5 FONDOS CAROS y 10 AÑOS; la carrera de barras con los
// años corriendo; las comisiones que se escapan; la regla (tú frente al índice, mes a mes) y el cierre en el móvil.
// Tiempos en src/gen/buffett.json (scripts/buffett.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/buffett.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono } from "../Bot/piezas";
import { AZUL, ORO, ROJO, VERDE } from "../Bot/kit";
import { cuerpoEn, Stick } from "../Bot/stick";
import { Sello } from "../Bot/historia";
import { Foco, Moneda } from "../Bot/ui2d";
import { Rotulito } from "../Bot/v3";
import { CierreMovil, Ficha3D, Prueba, TarjetaAuditada } from "../Bot/dopa";
import { claves, CtaSeguir, cuando, Montaje, P } from "../Explica/Montaje";

export const BUFFETT_FPS = datos.fps;
export const BUFFETT_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const SINTOCAR = cuando(datos)("tocar", EV.indice);

// ------------------------------------------------------------------ piezas: el sofá y los cinco trajeados
const SENTADO = { y: 0.5, pIx: -0.32, pDx: 0.32, mIx: -0.17, mIy: 0.27, mDx: 0.17, mDy: 0.27, boca: 0.9, ojos: 0.55, incl: -0.08, cabeza: -0.12 };
const Sofa: React.FC<{ x: number; y: number; t: number; s?: number; o?: number }> = ({ x, y, t, s = 1, o = 1 }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: ANCHO, height: 1920, opacity: o, transform: `scale(${s})`, transformOrigin: `${x}px ${y}px` }}>
    <svg width={420} height={230} viewBox="0 0 420 230" style={{ position: "absolute", left: x - 210, top: y - 150 }}>
      <rect x={20} y={20} width={380} height={120} rx={30} fill="#08101f" stroke={AZUL} strokeWidth={5} />
      <rect x={0} y={100} width={420} height={80} rx={24} fill="#08101f" stroke={AZUL} strokeWidth={5} />
      <line x1={40} y1={180} x2={40} y2={210} stroke={AZUL} strokeWidth={7} />
      <line x1={380} y1={180} x2={380} y2={210} stroke={AZUL} strokeWidth={7} />
    </svg>
    <Stick c={cuerpoEn(t, [], SENTADO, t)} ox={x} oy={y + 25} s={150} t={t} />
  </div>
);
const Trajeados: React.FC<{ x: number; y: number; t: number; s?: number; o?: number; rojo?: boolean }> = ({ x, y, t, s = 120, o = 1, rojo }) => (
  <>
    {[0, 1, 2, 3, 4].map((i) => {
      const fase = t * 6 + i * 1.3;
      const c = { ...cuerpoEn(0, [], {}, 0), mDx: 0.3 + 0.15 * Math.sin(fase), mDy: 0.05 + 0.25 * Math.cos(fase), mIx: -0.3 - 0.1 * Math.cos(fase), mIy: -0.1 + 0.2 * Math.sin(fase * 1.3), agobio: 1, boca: -0.3, cejas: -0.6 };
      const xx = x + (i - 2) * 92;
      const yy = y + (i % 2) * 30;
      return (
        <React.Fragment key={i}>
          <Stick c={c} ox={xx} oy={yy} s={s} t={t + i} o={o} />
          <svg width={30} height={60} style={{ position: "absolute", left: xx - 15, top: yy - s * 1.15, opacity: o }}><path d="M15 0 L22 10 L15 60 L8 10 Z" fill={rojo ? ROJO : ORO} /></svg>
        </React.Fragment>
      );
    })}
  </>
);

// ------------------------------------------------------------------ 1. Hook: el sofá frente a los cinco trajeados · 1.000.000 $
const Hook: React.FC<P> = ({ t }) => (
  <>
    <Foco x={540} y={1330} w={1000} h={120} o={0.1} />
    <Sofa x={260} y={1300} t={t} />
    <Trajeados x={750} y={1250} t={t} s={110} />
    <div style={{ position: "absolute", left: 120, width: 360, top: 1360, textAlign: "center", ...mono(30), fontWeight: 800, color: AZUL }}>NO HACER NADA</div>
    <div style={{ position: "absolute", left: 560, width: 420, top: 1360, textAlign: "center", ...mono(30), fontWeight: 800, color: ORO, opacity: L(t, EV.profesionales - 0.2, EV.profesionales, 0.3, 1) }}>LOS PROFESIONALES</div>
    <Ficha3D t={t} t0={EV.millon - 0.1} texto="1.000.000 $" y={720} size={130} color={ORO} sub="LA APUESTA" />
  </>
);

// ------------------------------------------------------------------ 2. Uno: la apuesta (2008-2017) · ÍNDICE contra 5 FONDOS CAROS · 10 AÑOS
const Uno: React.FC<P> = ({ t }) => {
  const tarjeta = 1 - L(t, EV.fondo - 0.4, EV.fondo - 0.15, 0, 1);
  const duelo = L(t, EV.fondo - 0.3, EV.fondo, 0, 1);
  return (
    <>
      {tarjeta > 0.01 && (
        <AbsoluteFill style={{ opacity: tarjeta }}>
          <Prueba t={t} t0={EV["2008"] - 0.2} x={540} y={820} cabecera="BUFFETT · 2008-2017" titulo="«Un fondo del índice contra cinco fondos de fondos»" pie="10 años · 1 millón en juego" color={ORO} />
        </AbsoluteFill>
      )}
      {duelo > 0.01 && (
        <AbsoluteFill style={{ opacity: duelo }}>
          <div style={{ position: "absolute", left: 90, top: 560, width: 420, height: 560, borderRadius: 30, border: `4px solid ${AZUL}`, background: "#050a14" }} />
          <div style={{ position: "absolute", left: 90, width: 420, top: 590, textAlign: "center", ...mono(40), fontWeight: 800, color: AZUL }}>EL ÍNDICE</div>
          <div style={{ position: "absolute", left: 90, width: 420, top: 640, textAlign: "center", ...mono(26), fontWeight: 700, color: "rgba(255,255,255,0.7)", whiteSpace: "normal" }}>copia la bolsa americana</div>
          <Sofa x={300} y={1040} t={t} s={0.85} />
          <div style={{ position: "absolute", left: 570, top: 560, width: 420, height: 560, borderRadius: 30, border: `4px solid ${ORO}`, background: "#140f05", opacity: L(t, EV.cinco - 0.3, EV.cinco, 0, 1) }} />
          <div style={{ position: "absolute", left: 570, width: 420, top: 590, textAlign: "center", ...mono(40), fontWeight: 800, color: ORO, opacity: L(t, EV.cinco - 0.3, EV.cinco, 0, 1) }}>5 FONDOS CAROS</div>
          {t > EV.cinco - 0.3 && <div style={{ position: "absolute", inset: 0, opacity: L(t, EV.cinco - 0.3, EV.cinco, 0, 1), transform: "scale(0.7)", transformOrigin: "780px 1040px" }}><Trajeados x={780} y={1040} t={t} s={120} /></div>}
          <div style={{ position: "absolute", left: ANCHO / 2 - 70, width: 140, height: 140, borderRadius: 70, top: 770, display: "flex", alignItems: "center", justifyContent: "center", background: "#000", border: "5px solid #fff", fontFamily: SANS, fontWeight: 800, fontSize: 64, color: "#fff", opacity: L(t, EV.cinco, EV.cinco + 0.3, 0, 1), transform: `scale(${0.6 + 0.4 * L(t, EV.cinco, EV.cinco + 0.3, 0, 1)})` }}>VS</div>
          <Ficha3D t={t} t0={EV.diez - 0.1} texto="10 AÑOS" y={1260} size={110} />
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

// ------------------------------------------------------------------ 4. Dos: la carrera de barras (2008 → 2017) · comisiones · PERDIERON
const BASE = 1150;
const ESC = 4.6; // px por punto porcentual
const Dos: React.FC<P> = ({ t, s }) => {
  const anios = L(t, s, EV["36"] + 0.3, 0, 1, (u) => u);
  const anio = Math.round(2008 + 9 * anios);
  const vi = 125.8 * L(t, s + 0.1, EV["125"] + 0.2, 0, 1, (u) => u * u);
  const vf = 36 * L(t, EV.fondos - 0.3, EV["36"] + 0.2, 0, 1, (u) => u);
  const comis = t > EV.comisiones - 0.3;
  return (
    <>
      <div style={{ position: "absolute", left: 0, width: ANCHO, top: 380, textAlign: "center", ...mono(52), fontWeight: 800, letterSpacing: "0.14em" }}>{anio}</div>
      <div style={{ position: "absolute", left: 120, right: 120, top: BASE, height: 4, background: "rgba(255,255,255,0.6)" }} />
      <div style={{ position: "absolute", left: 200, top: BASE - vi * ESC, width: 260, height: vi * ESC, borderRadius: "20px 20px 4px 4px", background: `linear-gradient(180deg, ${VERDE}, ${VERDE}33)`, border: `4px solid ${VERDE}`, boxShadow: `0 0 40px ${VERDE}55` }} />
      <div style={{ position: "absolute", left: 130, width: 400, top: BASE - vi * ESC - 110, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 90, color: VERDE }}>+{vi.toFixed(1).replace(".", ",")} %</div>
      <div style={{ position: "absolute", left: 130, width: 400, top: BASE + 20, textAlign: "center", ...mono(32), fontWeight: 800, color: VERDE }}>EL ÍNDICE</div>
      {t > EV.fondos - 0.3 && (
        <>
          <div style={{ position: "absolute", left: 620, top: BASE - vf * ESC, width: 260, height: vf * ESC, borderRadius: "20px 20px 4px 4px", background: `linear-gradient(180deg, ${ORO}, ${ORO}33)`, border: `4px solid ${ORO}` }} />
          <div style={{ position: "absolute", left: 550, width: 400, top: BASE - vf * ESC - 110, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 90, color: ORO }}>+{Math.round(vf)} %</div>
          <div style={{ position: "absolute", left: 550, width: 400, top: BASE + 20, textAlign: "center", ...mono(32), fontWeight: 800, color: ORO }}>LOS 5 FONDOS</div>
        </>
      )}
      {comis && Array.from({ length: 6 }, (_, i) => (
        <Moneda key={i} t={t} t0={EV.comisiones - 0.2 + i * 0.18} t1={EV.comisiones - 0.2 + i * 0.18 + 0.7} a={[750, BASE - 36 * ESC]} b={[980, 700]} size={56} color={ROJO} texto="€" />
      ))}
      {comis && <div style={{ position: "absolute", left: 640, width: 380, top: 560, textAlign: "center", ...mono(34), fontWeight: 800, color: ROJO, opacity: L(t, EV.comisiones - 0.2, EV.comisiones + 0.1, 0, 1) }}>COMISIONES →</div>}
      <Sello t={t} t0={EV.perdieron - 0.1} texto="PERDIERON" top={1250} color={ROJO} size={84} />
      {t > SINTOCAR - 0.2 && t < EV.fondos - 0.3 && <div style={{ position: "absolute", left: 130, width: 400, top: BASE + 70, textAlign: "center", ...mono(28), fontWeight: 800, color: AZUL }}>SIN TOCAR NADA</div>}
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: tú frente al índice, mes a mes
const MESES = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const Giro: React.FC<P> = ({ t, s }) => {
  const u = L(t, s + 0.1, EV.indice2 + 1.2, 0, 1, (v) => v);
  const X0 = 140;
  const X1 = 940;
  const yv = (v: number) => 1050 - v * 44;
  const tu: string[] = [];
  const ind: string[] = [];
  for (let k = 0; k <= 11 * u; k++) {
    const x = X0 + (k / 11) * (X1 - X0);
    tu.push(`${x},${yv(Math.sin(k * 1.7) * 3 + k * 0.15)}`);
    ind.push(`${x},${yv(k * 0.75 + Math.sin(k) * 0.8)}`);
  }
  return (
    <>
      <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" top={360} />
      <div style={{ position: "absolute", left: 140, top: 450, display: "flex", gap: 40, ...mono(36), fontWeight: 800 }}>
        <span style={{ color: "#fff" }}>— TÚ</span>
        <span style={{ color: AZUL }}>— EL ÍNDICE</span>
      </div>
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={X0} x2={X1} y1={1050} y2={1050} stroke="rgba(255,255,255,0.3)" strokeWidth={3} strokeDasharray="10 10" />
        {tu.length > 1 && <polyline points={tu.join(" ")} fill="none" stroke="#fff" strokeWidth={7} strokeLinejoin="round" />}
        {ind.length > 1 && <polyline points={ind.join(" ")} fill="none" stroke={AZUL} strokeWidth={7} strokeLinejoin="round" style={{ filter: t > EV.indice2 ? `drop-shadow(0 0 14px ${AZUL})` : undefined }} />}
      </svg>
      {MESES.map((m, k) => <div key={k} style={{ position: "absolute", left: X0 + (k / 11) * (X1 - X0) - 15, width: 30, top: 1240, textAlign: "center", ...mono(26), fontWeight: 700, opacity: k <= 11 * u ? 0.8 : 0.2 }}>{m}</div>)}
      <Sello t={t} t0={EV.gratis - 0.1} texto="TRABAJANDO GRATIS" top={1060} color={ROJO} size={70} />
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: comenta BOT en el móvil → mensaje directo → cuenta auditada
const Cierre: React.FC<P> = (p) => <CierreMovil {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tFinal={EV.auditada} palabra="BOT" mensaje="Te explico cómo lo hago ↓" final={<TarjetaAuditada />} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["millón", ORO], ["nada", AZUL], "profesionales", "2008", "fondo", "cinco", "caros", ["diez", ORO], "sígueme", ["índice", AZUL], ["125", VERDE], ["36", ORO], "comisiones", ["perdieron", ROJO], "regla", "compara", ["gratis", ROJO], "llegado", "bot", ["auditada", VERDE]]);
const GOLPES: [number, string?][] = [[0.02], [EV.millon, ORO], [EV.nada, AZUL], [EV.profesionales, ORO], [EV["2008"]], [EV.fondo, AZUL], [EV.cinco, ORO], [EV.diez], [EV.indice, AZUL], [EV["125"], VERDE], [EV.fondos], [EV["36"], ORO], [EV.comisiones, ROJO], [EV.perdieron, ROJO], [EV.regla], [EV.compara], [EV.indice2, AZUL], [EV.gratis, ROJO], [EV.llegado], [EV.bot], [EV.privado], [EV.auditada, VERDE]];

const GANCHO = { lineas: ["No hacer nada", "contra *los_profesionales*"], hasta: inicio("uno") - 0.05, color: ORO };
export const Buffett: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/buffett_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.08} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} />
);
