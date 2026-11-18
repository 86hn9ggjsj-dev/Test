// Reel 5-30-10 «dopamina» "Llegó a tu objetivo. Y lo moviste más arriba" (~35 s), con stickman («tú») y un gráfico
// grande. Fotograma 0: el precio toca la línea OBJETIVO y una mano la arrastra hacia arriba; luego +100 €, «esto va a
// seguir», el objetivo sube, el precio se da la vuelta, 0 € y pérdidas; cabeza fría frente a avaricia; y la regla: la
// mitad cerrada en el objetivo y la otra mitad con el stop en la entrada. Cierre en el móvil.
// Tiempos en src/gen/objetivo.json (scripts/objetivo.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/objetivo.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { AZUL, ORO, ROJO, VERDE } from "../Bot/kit";
import { cuerpoEn, Stick } from "../Bot/stick";
import { BRAZOS_ARRIBA, MANOS_CABEZA } from "../Bot/comun";
import { Sello } from "../Bot/historia";
import { Foco } from "../Bot/ui2d";
import { Marca, Rotulito } from "../Bot/v3";
import { CierreMovil, Ficha3D, TarjetaAuditada } from "../Bot/dopa";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const OBJETIVO_FPS = datos.fps;
export const OBJETIVO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const min1 = (g: number, m = 1) => Math.min(g, m);

// ------------------------------------------------------------------ gráfico (niveles en «euros de la operación»: 0 = entrada, 100 = objetivo)
const X0 = 150;
const X1 = 950;
const Y_ENT = 1000;
const PX = 3; // px por euro
const ye = (eur: number) => Y_ENT - eur * PX;
type Pt = [number, number];
const valor = (pts: Pt[], u: number) => {
  for (let i = 1; i < pts.length; i++)
    if (u <= pts[i][0]) {
      const [u0, v0] = pts[i - 1];
      const [u1, v1] = pts[i];
      const k = (u - u0) / (u1 - u0 || 1);
      return v0 + (v1 - v0) * k + 4 * Math.sin(u * 80) * Math.sin(k * Math.PI);
    }
  return pts[pts.length - 1][1];
};
const camino = (pts: Pt[], u0: number, u1: number) => {
  const out: string[] = [];
  for (let u = u0; u <= u1 + 1e-6; u += 0.005) out.push(`${(X0 + u * (X1 - X0)).toFixed(1)},${ye(valor(pts, u)).toFixed(1)}`);
  return out.join(" ");
};
const Linea: React.FC<{ y: number; color: string; texto: string; dash?: boolean; abajo?: boolean; o?: number }> = ({ y, color, texto, dash, abajo, o = 1 }) => (
  <div style={{ opacity: o }}>
    <div style={{ position: "absolute", left: X0 - 20, width: X1 - X0 + 40, top: y - 2.5, borderTop: `5px ${dash ? "dashed" : "solid"} ${color}`, boxShadow: dash ? undefined : `0 0 16px ${color}` }} />
    <div style={{ position: "absolute", left: abajo ? X0 - 10 : X1 - 420, width: 420, textAlign: abajo ? "left" : "right", top: abajo ? y + 12 : y - 52, ...mono(34), fontWeight: 800, color }}>{texto}</div>
  </div>
);
const Mano: React.FC<{ x: number; y: number; color?: string }> = ({ x, y, color = "#fff" }) => (
  <svg width={90} height={110} viewBox="0 0 44 52" style={{ position: "absolute", left: x - 20, top: y - 10, filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.9))" }}>
    <path d="M4 2 L4 40 L14 31 L21 47 L28 44 L21 28 L35 28 Z" fill={color} stroke="#000" strokeWidth={2.5} strokeLinejoin="round" />
  </svg>
);

// ------------------------------------------------------------------ 1. Hook: toca el objetivo… y la mano lo sube
const HOOK: Pt[] = [[0, 30], [0.5, 80], [0.6, 100], [1, 95]];
const Hook: React.FC<P> = ({ t, s }) => {
  const u = L(t, -0.5, EV.objetivo + 0.3, 0.4, 0.62, (v) => v);
  const sube = L(t, EV.moviste - 0.1, EV.arriba, 0, 1);
  const yObj = ye(100) - 120 * sube;
  const c = cuerpoEn(t, [[s, { ...BRAZOS_ARRIBA, boca: 1, abre: 0.5 }], [EV.moviste - 0.2, { mDx: 0.45, mDy: 0.4, boca: 0.8, cejas: 0.6, mira: 0.7 }]], { ...BRAZOS_ARRIBA, boca: 1 }, s - 0.6);
  return (
    <>
      <Linea y={Y_ENT} color="#fff" texto="ENTRADA" dash />
      <Linea y={yObj} color={VERDE} texto={sube > 0.5 ? "OBJETIVO ↑" : "OBJETIVO"} dash />
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
        <polyline points={camino(HOOK, 0, u)} fill="none" stroke="#fff" strokeWidth={7} strokeLinejoin="round" />
        <circle cx={X0 + u * (X1 - X0)} cy={ye(valor(HOOK, u))} r={14} fill="#fff" />
      </svg>
      {sube > 0 && <Mano x={X1 - 160} y={yObj} color={ROJO} />}
      <Foco x={250} y={1400} w={360} h={70} o={0.15} />
      <Stick c={c} ox={250} oy={1400} s={200} t={t} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: +100 € · «esto va a seguir» · sube el objetivo · se da la vuelta · 0 € · pérdidas
const UNO: Pt[] = [[0, 0], [0.35, 100], [0.5, 112], [0.62, 60], [0.75, 0], [1, -40]];
const Uno: React.FC<P> = ({ t, s }) => {
  const u = L(t, s + 0.2, EV.perdidas + 0.3, 0, 1, (v) => v);
  const sube = L(t, EV.subes - 0.1, EV.subes + 0.5, 0, 1);
  const yObj = ye(100) - 300 * sube;
  const pnl = valor(UNO, u);
  const c = cuerpoEn(t, [[EV.llega, { ...BRAZOS_ARRIBA, boca: 1 }], [EV.seguir - 0.1, { mIx: -0.15, mIy: -0.52, mDx: 0.2, mDy: 0.3, boca: 0.8, cejas: 0.6, mira: 0.7 }], [EV.vuelta, { boca: -0.3, cejas: -0.5, ojos: 1.2 }], [EV.perdidas, { ...MANOS_CABEZA }]], {}, s - 0.3);
  const enCero = t >= EV.cero - 0.1;
  return (
    <>
      <Linea y={Y_ENT} color="#fff" texto="ENTRADA" dash />
      <Linea y={yObj} color={VERDE} texto={sube > 0.5 ? "OBJETIVO: +200 €" : "OBJETIVO: +100 €"} dash />
      {sube > 0.01 && sube < 1 && <Mano x={X1 - 160} y={yObj} color={ROJO} />}
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
        <polyline points={camino(UNO, 0, u)} fill="none" stroke={pnl < 0 ? ROJO : "#fff"} strokeWidth={7} strokeLinejoin="round" />
        <circle cx={X0 + u * (X1 - X0)} cy={ye(pnl)} r={14} fill={pnl < 0 ? ROJO : "#fff"} />
      </svg>
      <div style={{ position: "absolute", left: 0, width: ANCHO, top: 390, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 130, letterSpacing: "-0.03em", color: pnl >= 1 ? VERDE : pnl <= -1 ? ROJO : "#fff", textShadow: `0 0 40px ${pnl >= 0 ? VERDE : ROJO}55` }}>
        {pnl >= 0 ? "+" : "−"}{Math.abs(Math.round(pnl))} €
      </div>
      {t > EV.seguir - 0.2 && t < EV.vuelta && <div style={{ position: "absolute", left: 330, top: 1110, ...mono(36), fontWeight: 800, padding: "10px 18px", borderRadius: 16, border: "3px solid #fff", background: "#000", transform: `scale(${0.6 + 0.4 * min1(muelle(t, EV.seguir - 0.2, 240, 12), 1.1)})` }}>«ESTO VA A SEGUIR»</div>}
      {enCero && <Sello t={t} t0={EV.cero - 0.1} texto="0 €" top={Y_ENT + 40} color={ROJO} size={80} fin={EV.perdidas - 0.1} />}
      <Foco x={250} y={1400} w={360} h={70} o={0.15} />
      <Stick c={c} ox={250} oy={1400} s={200} t={t} />
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

// ------------------------------------------------------------------ 4. Dos: cabeza fría frente a avaricia
const Cabeza: React.FC<{ x: number; y: number; color: string; g: number; children?: React.ReactNode }> = ({ x, y, color, g, children }) => (
  <div style={{ position: "absolute", left: x - 170, top: y - 190, width: 340, height: 380, opacity: min1(g * 2), transform: `scale(${0.5 + 0.5 * min1(g, 1.08)})` }}>
    <svg width={340} height={380} viewBox="0 0 230 260" style={{ position: "absolute", inset: 0, overflow: "visible", filter: `drop-shadow(0 0 24px ${color}88)` }}>
      <path d="M70 255 V205 C35 195 22 160 24 125 C27 60 75 18 128 20 C180 22 212 68 207 118 L224 156 L205 163 C207 184 197 200 172 202 L154 204 V255" fill="#050505" stroke={color} strokeWidth={5} strokeLinejoin="round" />
    </svg>
    <div style={{ position: "absolute", left: 40, top: 90, width: 220, textAlign: "center" }}>{children}</div>
  </div>
);
const Dos: React.FC<P> = ({ t, s }) => {
  const fria = muelle(t, s + 0.05, 220, 13);
  const etiqueta = L(t, EV.fria - 0.25, EV.fria, 0, 1);
  const ava = muelle(t, EV.moverlo - 0.1, 220, 13);
  const sube = L(t, EV.moverlo, EV.avaricia + 0.3, 0, 1);
  return (
    <>
      <div style={{ position: "absolute", left: 60, width: 460, top: 470, textAlign: "center", ...mono(30), fontWeight: 800, color: AZUL, opacity: min1(fria * 2), whiteSpace: "normal" }}>ANTES DE ENTRAR</div>
      <Cabeza x={290} y={790} color={AZUL} g={fria}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 56, color: "#fff", marginTop: 30 }}>+100 €</div>
      </Cabeza>
      <div style={{ position: "absolute", left: 60, width: 460, top: 1010, textAlign: "center", ...mono(40), fontWeight: 800, color: AZUL, opacity: etiqueta, transform: `scale(${0.7 + 0.3 * etiqueta})` }}>CABEZA FRÍA</div>
      <div style={{ position: "absolute", left: 560, width: 460, top: 450, textAlign: "center", ...mono(30), fontWeight: 800, color: ROJO, opacity: min1(ava * 2), whiteSpace: "normal" }}>CON EL PRECIO<br />DELANTE</div>
      <Cabeza x={790} y={790} color={ROJO} g={ava}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 56, color: ROJO, marginTop: 30 }}>+{Math.round(100 + 400 * sube)} €</div>
      </Cabeza>
      <Sello t={t} t0={EV.avaricia - 0.1} texto="AVARICIA" top={1150} color={ROJO} size={84} />
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: la mitad en el objetivo y la otra mitad con el stop en la entrada
const GIRO: Pt[] = [[0, 0], [0.35, 100], [0.5, 120], [0.7, 70], [0.85, 30], [1, 10]];
const Giro: React.FC<P> = ({ t, s }) => {
  const u = L(t, s + 0.2, EV.ganado, 0, 1, (v) => v);
  const pnl = valor(GIRO, u);
  const mitad1 = t >= EV.mitad - 0.1;
  const stop = L(t, EV.entrada - 0.4, EV.entrada, 0, 1);
  return (
    <>
      <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" top={330} />
      <Linea y={ye(100)} color={VERDE} texto="OBJETIVO" dash />
      <Linea y={Y_ENT} color="#fff" texto="ENTRADA" dash />
      <Linea y={ye(-60) + (Y_ENT - ye(-60)) * stop} color={ROJO} texto={stop > 0.9 ? "STOP EN LA ENTRADA" : "STOP"} abajo />
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
        <polyline points={camino(GIRO, 0, u)} fill="none" stroke="#fff" strokeWidth={7} strokeLinejoin="round" />
        <circle cx={X0 + u * (X1 - X0)} cy={ye(pnl)} r={14} fill="#fff" />
      </svg>
      <div style={{ position: "absolute", left: 130, top: 440, display: "flex", gap: 20 }}>
        {[0, 1].map((k) => {
          const hecho = k === 0 ? mitad1 : stop > 0.9;
          const g = muelle(t, k === 0 ? EV.mitad - 0.1 : EV.otra - 0.1, 220, 13);
          return (
            <div key={k} style={{ width: 400, height: 160, borderRadius: 24, border: `4px solid ${hecho ? (k === 0 ? VERDE : ORO) : "rgba(255,255,255,0.4)"}`, background: hecho ? (k === 0 ? "rgba(47,224,138,0.12)" : "rgba(245,196,81,0.1)") : "#050505", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, opacity: 0.4 + 0.6 * min1(g * 2), transform: `scale(${0.8 + 0.2 * min1(g, 1.05)})` }}>
              <span style={{ ...mono(28), fontWeight: 800, color: "#fff" }}>{k === 0 ? "MITAD 1" : "MITAD 2"}</span>
              <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 38, color: k === 0 ? VERDE : ORO, whiteSpace: "nowrap" }}>{k === 0 ? (mitad1 ? "CERRADA +50 €" : "—") : stop > 0.9 ? "STOP EN ENTRADA" : "—"}</span>
            </div>
          );
        })}
      </div>
      <Ficha3D t={t} t0={EV.ganado - 0.1} texto="YA HAS GANADO" y={1250} size={100} color={VERDE} />
      <Marca t={t} t0={EV.mitad} x={530} y={440} size={90} color={VERDE} tipo="ok" />
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: comenta BOT en el móvil → mensaje directo → cuenta auditada
const Cierre: React.FC<P> = (p) => <CierreMovil {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tFinal={EV.auditada} palabra="BOT" mensaje="Te explico cómo lo hago ↓" final={<TarjetaAuditada />} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["objetivo", VERDE], ["arriba", ROJO], ["100", VERDE], "seguir", ["subes", ROJO], ["vuelta", ROJO], ["cero", ROJO], ["pérdidas", ROJO], "sígueme", ["fría", AZUL], ["avaricia", ROJO], "regla", ["mitad", VERDE], "entrada", ["ganado", VERDE], "llegado", "bot", ["auditada", VERDE]]);
const GOLPES: [number, string?][] = [[0.02], [EV.objetivo, VERDE], [EV.arriba, ROJO], [EV["100"], VERDE], [EV.llega, VERDE], [EV.seguir], [EV.subes, ROJO], [EV.vuelta, ROJO], [EV.cero, ROJO], [EV.perdidas, ROJO], [EV.fria, AZUL], [EV.moverlo], [EV.avaricia, ROJO], [EV.regla], [EV.mitad, VERDE], [EV.entrada, ORO], [EV.ganado, VERDE], [EV.llegado], [EV.bot], [EV.privado], [EV.auditada, VERDE]];

const GANCHO = { lineas: ["Llegó a tu objetivo", "y lo *moviste_más_arriba*"], hasta: inicio("uno") - 0.05, color: ROJO };
export const Objetivo: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/objetivo_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.08} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} />
);
