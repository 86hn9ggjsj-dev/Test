// Historia v3 «dopamina» "De cada 100 que pagan un challenge, solo 7 cobran" (~30 s), sin personajes y en estilo limpio.
// Datos reales (FPFX Tech vía Finance Magnates, sept. 2024, +300.000 cuentas): 100 puntos que se apagan hasta quedar 7,
// el contador de cuentas y el embudo 100 → 14 → 7, lo bueno (solo arriesgas la cuota), el «sígueme» encima, ROI y los 7
// tickets de 100 € que suman 700 € por cuenta aprobada, la libreta PAGADO / COBRADO y el cierre «comenta BOT».
// Golpe de zoom (y color) en cada cifra y final en bucle. Tiempos en src/gen/roi.json (scripts/roi.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/roi.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono } from "../Bot/piezas";
import { ROJO, VERDE } from "../Bot/kit";
import { Foco } from "../Bot/ui2d";
import { CierreComenta } from "../Bot/conversion";
import { Cifra, Golpe, Marca, pop, Rotulito, sal, Ticket } from "../Bot/v3";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const ROI_FPS = datos.fps;
export const ROI_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;

// ------------------------------------------------------------------ 1. Hook: 100 puntos que se apagan hasta quedar 7
const QUEDAN = new Set([13, 26, 38, 51, 67, 74, 92]);
const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const ORDEN = Array.from({ length: 100 }, (_, i) => i)
  .filter((i) => !QUEDAN.has(i))
  .sort((a, b) => hash(a) - hash(b));
const APAGA: Record<number, number> = {};
ORDEN.forEach((i, k) => (APAGA[i] = 0.05 + (k / ORDEN.length) * (EV["7"] - 0.25)));

const Hook: React.FC<P> = ({ t }) => {
  const verde = pop(t, EV["7"] - 0.05);
  return (
    <>
      <Foco x={ANCHO / 2} y={1100} w={900} h={700} o={0.05} />
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {Array.from({ length: 100 }, (_, i) => {
          const cx = 540 + ((i % 10) - 4.5) * 60;
          const cy = 830 + Math.floor(i / 10) * 60;
          if (QUEDAN.has(i)) {
            const k = Math.min(verde, 1.15);
            return <circle key={i} cx={cx} cy={cy} r={20 * (1 + 0.35 * k)} fill={verde > 0.01 ? VERDE : "#fff"} style={verde > 0.01 ? { filter: `drop-shadow(0 0 ${18 * k}px ${VERDE})` } : undefined} />;
          }
          const u = L(t, APAGA[i], APAGA[i] + 0.12, 0, 1, (v) => v);
          return <circle key={i} cx={cx} cy={cy} r={20 * (1 - 0.25 * u)} fill={u < 1 ? `rgba(255,255,255,${1 - u})` : "none"} stroke={u > 0 ? `rgba(255,77,94,${0.45 * u})` : "none"} strokeWidth={3} />;
        })}
      </svg>
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: +300.000 cuentas · embudo 100 → 14 → 7
const Barra: React.FC<{ t: number; t0: number; y: number; de: number; a: number; color: string; cifra: string; texto: string; dentro?: boolean; brillo?: number }> = ({ t, t0, y, de, a, color, cifra, texto, dentro, brillo = 0 }) => {
  const g = pop(t, t0);
  if (g <= 0.01) return null;
  const w = 780 * (de + (a - de) * sal(L(t, t0 + 0.1, t0 + 0.55, 0, 1, (u) => u)));
  return (
    <div style={{ position: "absolute", left: 150, top: y, height: 140, opacity: Math.min(g * 1.5, 1), transform: `translateX(${(1 - Math.min(g, 1)) * -60}px)` }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: 140, borderRadius: 20, border: `4px solid ${color}`, background: dentro ? "rgba(255,255,255,0.1)" : color, boxShadow: `0 0 ${24 + 40 * brillo}px ${color}${brillo > 0.05 ? "aa" : "44"}` }} />
      <div style={{ position: "absolute", left: dentro ? 34 : w + 26, top: 0, height: 140, display: "flex", alignItems: "center", gap: 18, whiteSpace: "nowrap" }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 96, color: dentro ? "#fff" : color, letterSpacing: "-0.03em" }}>{cifra}</span>
        <span style={{ ...mono(44), fontWeight: 800, color: dentro ? "#fff" : color }}>{texto}</span>
      </div>
    </div>
  );
};
const Uno: React.FC<P> = ({ t }) => {
  const sale = 1 - L(t, EV.aprueba - 0.45, EV.aprueba - 0.2, 0, 1);
  const cuentas = pop(t, EV.cuentas - 0.1);
  const brillo = Math.max(0, 1 - Math.abs(t - EV.mitad - 0.1) * 2.5);
  return (
    <>
      <Rotulito t={t} t0={EV.datos - 0.1} texto="FPFX TECH · 2024" color="rgba(255,255,255,0.75)" />
      {sale > 0.01 && t >= EV["300000"] - 0.15 && (
        <>
          <Cifra t={t} t0={EV["300000"] - 0.15} t1={EV["300000"] + 0.6} de={0} a={300000} y={800} size={190} pre="+" o={sale} />
          {cuentas > 0.01 && <div style={{ position: "absolute", left: 0, width: ANCHO, top: 920, textAlign: "center", ...mono(56), fontWeight: 800, letterSpacing: "0.2em", opacity: Math.min(cuentas * 1.5, 1) * sale }}>CUENTAS</div>}
        </>
      )}
      {sale < 1 && (
        <>
          <Barra t={t} t0={EV.aprueba - 0.35} y={680} de={1} a={1} color="#fff" cifra="100" texto="PAGAN" dentro />
          <Barra t={t} t0={EV.aprueba - 0.05} y={900} de={1} a={0.14} color="#fff" cifra="14" texto="APRUEBAN" />
          <Barra t={t} t0={EV.cobra - 0.1} y={1120} de={0.14} a={0.07} color={VERDE} cifra="7" texto="COBRAN" brillo={brillo} />
        </>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: lo bueno · solo arriesgas la cuota, no tus ahorros
const CajaFuerte: React.FC<{ x: number; y: number; g: number }> = ({ x, y, g }) => (
  <div style={{ position: "absolute", left: x - 150, top: y - 130, width: 300, height: 260, opacity: Math.min(g * 1.5, 1), transform: `scale(${0.6 + 0.4 * Math.min(g, 1.1)})` }}>
    <svg width={300} height={260} viewBox="0 0 300 260" style={{ overflow: "visible", filter: `drop-shadow(0 0 20px ${VERDE}66)` }}>
      <rect x={6} y={6} width={288} height={230} rx={22} fill="#050505" stroke={VERDE} strokeWidth={6} />
      <rect x={30} y={30} width={240} height={182} rx={12} fill="none" stroke={VERDE} strokeWidth={3} opacity={0.5} />
      <circle cx={150} cy={121} r={46} fill="none" stroke={VERDE} strokeWidth={6} />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <line key={a} x1={150} y1={121} x2={150 + 30 * Math.cos((a * Math.PI) / 180)} y2={121 + 30 * Math.sin((a * Math.PI) / 180)} stroke={VERDE} strokeWidth={4} />
      ))}
      <rect x={40} y={236} width={40} height={18} rx={4} fill={VERDE} />
      <rect x={220} y={236} width={40} height={18} rx={4} fill={VERDE} />
    </svg>
  </div>
);
const Dos: React.FC<P> = ({ t }) => {
  const cuota = pop(t, EV.arriesgas - 0.1);
  const caja = pop(t, EV.ahorros - 0.3);
  return (
    <>
      <Rotulito t={t} t0={EV.bueno - 0.1} texto="LO BUENO" color={VERDE} />
      <Foco x={ANCHO / 2} y={1080} w={900} h={130} o={0.08} />
      {cuota > 0.01 && (
        <Ticket x={335} y={880} w={320} h={230} rot={-5} s={0.6 + 0.4 * Math.min(cuota, 1.1)} o={Math.min(cuota * 1.5, 1)} color={ROJO}>
          <span style={{ ...mono(30, 0.75), fontWeight: 700 }}>SOLO PIERDES</span>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 80, color: ROJO }}>CUOTA</span>
        </Ticket>
      )}
      {caja > 0.01 && (
        <>
          <CajaFuerte x={750} y={870} g={caja} />
          <div style={{ position: "absolute", left: 600, width: 300, top: 1030, textAlign: "center", ...mono(44), fontWeight: 800, color: VERDE, opacity: Math.min(caja * 1.5, 1) }}>AHORROS</div>
          <Marca t={t} t0={EV.ahorros} x={860} y={760} size={120} color={VERDE} tipo="ok" />
        </>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 4. Sígueme encima de la escena
const s2 = inicio("dos");
const Sigueme: React.FC<P> = (p) => (
  <>
    <AbsoluteFill style={{ filter: "blur(9px)" }}>
      <Dos t={p.t} s={s2} e={fin("dos")} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "rgba(0,0,0,0.6)" }} />
    <CtaSeguir {...p} lema="" sinFondo />
  </>
);

// ------------------------------------------------------------------ 5. Tres: ROI · 7 intentos de 100 € = 700 € por cuenta aprobada
const N = 7;
const tTicket = (i: number) => EV.intento + (i * (EV.aprobada - EV.intento)) / (N - 1);
const Tres: React.FC<P> = ({ t }) => {
  const n = Array.from({ length: N }, (_, i) => i).filter((i) => t >= tTicket(i) - 0.05).length;
  const total = pop(t, EV.intento - 0.05);
  const final = pop(t, EV["700"] - 0.05);
  const salto = t >= EV["700"] - 0.05 ? 1 + 0.15 * Math.max(0, 1 - Math.abs(final - 1) * 3) : 1;
  return (
    <>
      <Golpe t={t} t0={EV.roi - 0.05} texto="ROI" y={820} size={320} fin={EV.intento - 0.1} />
      {total > 0.01 && (
        <>
          <div style={{ position: "absolute", left: 0, width: ANCHO, top: 520, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 170, lineHeight: 1, letterSpacing: "-0.04em", color: t >= EV["700"] - 0.05 ? ROJO : "#fff", transform: `translateY(-50%) scale(${(0.6 + 0.4 * Math.min(total, 1.05)) * salto})`, textShadow: t >= EV["700"] - 0.05 ? `0 0 40px ${ROJO}88` : undefined }}>
            {n * 100} €
          </div>
          <Rotulito t={t} t0={EV["700"] - 0.05} texto="POR CUENTA APROBADA" top={630} color={ROJO} />
        </>
      )}
      {Array.from({ length: N }, (_, i) => {
        const t0 = tTicket(i);
        const g = pop(t, t0 - 0.05);
        if (g <= 0.01) return null;
        const ok = i === N - 1;
        const x = 540 + (i % 2 ? 22 : -22);
        const y = 1230 - i * 62;
        return (
          <React.Fragment key={i}>
            <Ticket x={x} y={y - (1 - Math.min(g, 1)) * 80} w={440} h={160} rot={i % 2 ? 3 : -3} o={Math.min(g * 1.5, 1)} color={ok ? VERDE : "#fff"}>
              <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
                <span style={{ ...mono(28, 0.7), fontWeight: 700 }}>INTENTO {i + 1}</span>
                <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, color: ok ? VERDE : "#fff" }}>100 €</span>
              </div>
            </Ticket>
            {i === n - 1 && <Marca t={t} t0={t0 + 0.08} x={x + 250} y={y} size={100} color={ok ? VERDE : ROJO} tipo={ok ? "ok" : "no"} />}
          </React.Fragment>
        );
      })}
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: la libreta PAGADO / COBRADO = ROI real
const Giro: React.FC<P> = ({ t }) => {
  const g = pop(t, EV.regla - 0.1);
  const filas = [0, 1, 2].map((i) => pop(t, EV.pagado - 0.1 + i * 0.2));
  const totalP = pop(t, EV.pagado + 0.7);
  const cobrado = pop(t, EV.cobrado - 0.1);
  const roi = pop(t, EV.roi2 - 0.15);
  const real = L(t, EV.real - 0.05, EV.real + 0.15, 0, 1);
  const latido = 1 + 0.08 * Math.sin(t * 7) * L(t, EV.cobrado, EV.cobrado + 0.3, 0, 1);
  const ap = (k: number): React.CSSProperties => ({ opacity: Math.min(k * 1.5, 1), transform: `scale(${0.6 + 0.4 * Math.min(k, 1.1)})` });
  return (
    <>
      <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" />
      <div style={{ position: "absolute", left: 150, top: 440, width: 780, height: 820, borderRadius: 30, border: "3px solid rgba(255,255,255,0.85)", background: "rgba(0,0,0,0.92)", overflow: "hidden", opacity: Math.min(g * 1.5, 1), transform: `translateY(${(1 - Math.min(g, 1)) * 60}px)` }}>
        {[1, 2, 3, 4, 5, 6].map((k) => (
          <div key={k} style={{ position: "absolute", left: 0, right: 0, top: 90 + k * 90, height: 2, background: "rgba(255,255,255,0.1)" }} />
        ))}
        <div style={{ position: "absolute", left: 389, top: 30, width: 2, height: 560, background: "rgba(255,255,255,0.35)" }} />
        <div style={{ position: "absolute", left: 0, width: 390, top: 40, textAlign: "center", ...mono(44), fontWeight: 800, color: ROJO }}>PAGADO</div>
        <div style={{ position: "absolute", left: 390, width: 390, top: 40, textAlign: "center", ...mono(44), fontWeight: 800, color: VERDE }}>COBRADO</div>
        {filas.map((k, i) => (
          <div key={i} style={{ position: "absolute", left: 0, width: 390, top: 120 + i * 90, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 60, color: "#fff", ...ap(k) }}>100 €</div>
        ))}
        <div style={{ position: "absolute", left: 0, width: 390, top: 390, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 60, color: "rgba(255,255,255,0.6)", ...ap(filas[2]) }}>…</div>
        <div style={{ position: "absolute", left: 30, width: 330, top: 480, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 84, color: ROJO, borderTop: `3px solid ${ROJO}`, paddingTop: 6, ...ap(totalP) }}>700 €</div>
        <div style={{ position: "absolute", left: 390, width: 390, top: 220, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 260, lineHeight: 1, color: VERDE, textShadow: `0 0 40px ${VERDE}66`, opacity: Math.min(cobrado * 1.5, 1), transform: `scale(${(0.6 + 0.4 * Math.min(cobrado, 1.1)) * latido})` }}>?</div>
        <div style={{ position: "absolute", left: 30, right: 30, top: 620, height: 3, background: "rgba(255,255,255,0.5)", opacity: Math.min(roi * 1.5, 1) }} />
        <div style={{ position: "absolute", left: 0, width: 780, top: 660, display: "flex", justifyContent: "center", ...ap(roi) }}>
          <span style={{ ...mono(46), fontWeight: 800, color: real > 0.5 ? "#000" : "#fff", background: `rgba(47,224,138,${real})`, padding: "14px 26px", borderRadius: 14 }}>ROI = COBRADO − PAGADO</span>
        </div>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 7. Cierre de conversión
const Cierre: React.FC<P> = (p) => <CierreComenta {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tCuenta={EV.auditada} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["7", VERDE], ["cobrar", VERDE], "300000", "aprueba", ["cobra", VERDE], ["mitad", ROJO], ["bueno", VERDE], ["cuota", ROJO], ["ahorros", VERDE], "sígueme", "nadie", "roi", "100", ["700", ROJO], "regla", ["pagado", ROJO], ["cobrado", VERDE], ["real", VERDE], "bot", ["auditada", VERDE]]);
const GOLPES: [number, string?][] = [[0.02], [EV.pagan], [EV["7"], VERDE], [EV.datos], [EV["300000"]], [EV.aprueba], [EV.cobra, VERDE], [EV.mitad], [EV.bueno, VERDE], [EV.cuota, ROJO], [EV.ahorros, VERDE], [EV.roi], [EV.intento], [EV.euros], [EV.aprobada, VERDE], [EV["700"], ROJO], [EV.regla], [EV.pagado, ROJO], [EV.cobrado, VERDE], [EV.roi2], [EV.real, VERDE], [EV.bot], [EV.auditada, VERDE]];

const GANCHO = { lineas: ["De 100 que pagan", "un challenge,", "solo *7* cobran"], hasta: inicio("uno") - 0.05, color: VERDE, size: 110 };
export const Roi: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/roi_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.1} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} />
);
