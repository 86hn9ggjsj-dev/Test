// Corto v3 «dopamina» "Una operación que pierde puede ser buena" (~24 s), sin personajes y en estilo limpio: dos
// tickets (−50 € ✓ y +200 € ✗), la lista PLAN · STOP · TAMAÑO que se marca, el «sígueme» encima, el botón COMPRAR
// pulsado por impulso que da +200 € y se repite, la nota de 0 a 10 y el icono de guardar. Golpe de zoom (y color) en
// cada palabra clave y final en bucle. Tiempos en src/gen/proceso.json (scripts/proceso.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/proceso.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono } from "../Bot/piezas";
import { ROJO, VERDE } from "../Bot/kit";
import { Sello } from "../Bot/historia";
import { Foco } from "../Bot/ui2d";
import { Boton, Cifra, Guardar, Marca, pop, pulsa, Rotulito, sal, Ticket } from "../Bot/v3";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const PROCESO_FPS = datos.fps;
export const PROCESO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;

// ------------------------------------------------------------------ 1. Hook: −50 € ✓ frente a +200 € ✗
const Hook: React.FC<P> = ({ t }) => {
  const entra = sal(L(t, -0.25, 0.6, 0, 1, (u) => u));
  const flota = (k: number) => Math.sin(t * 2.2 + k) * 6;
  const bA = pop(t, EV.buena);
  const bB = pop(t, EV.gana);
  const cA = t >= EV.buena ? VERDE : "#fff";
  const cB = t >= EV.malisima ? ROJO : "#fff";
  return (
    <>
      <Foco x={ANCHO / 2} y={1080} w={860} h={140} o={0.1} />
      <Ticket x={320} y={900 + flota(0) + (1 - entra) * 60} w={350} h={260} rot={-7 + 3 * entra} s={1 + 0.06 * Math.max(0, 1 - Math.abs(bA - 1) * 3)} color={cA}>
        <span style={{ ...mono(30, 0.7), fontWeight: 700 }}>OPERACIÓN</span>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 104, color: ROJO, letterSpacing: "-0.03em" }}>−50 €</span>
      </Ticket>
      <Ticket x={760} y={900 + flota(2) + (1 - entra) * 60} w={350} h={260} rot={7 - 3 * entra} s={1 + 0.08 * Math.max(0, 1 - Math.abs(bB - 1) * 3)} color={cB}>
        <span style={{ ...mono(30, 0.7), fontWeight: 700 }}>OPERACIÓN</span>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 104, color: VERDE, letterSpacing: "-0.03em" }}>+200 €</span>
      </Ticket>
      <Marca t={t} t0={EV.buena} x={320} y={1090} size={150} color={VERDE} tipo="ok" />
      <Marca t={t} t0={EV.malisima} x={760} y={1090} size={150} color={ROJO} tipo="no" />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: PLAN ✓ · STOP ✓ · TAMAÑO ✓ · −50 € · BIEN HECHO
const FILAS: [string, number][] = [["PLAN", EV.plan], ["STOP", EV.stop], ["TAMAÑO", EV.tamano]];
const Uno: React.FC<P> = ({ t, s }) => {
  const g = pop(t, s - 0.1);
  const res = pop(t, EV.perdiste - 0.1);
  return (
    <>
      <Foco x={ANCHO / 2} y={1170} w={860} h={140} o={0.08} />
      <div style={{ position: "absolute", left: 190, top: 470, width: 700, height: 660, borderRadius: 36, border: "3px solid rgba(255,255,255,0.85)", background: "rgba(0,0,0,0.9)", opacity: Math.min(g * 1.5, 1), transform: `translateY(${(1 - Math.min(g, 1)) * 60}px)` }}>
        {FILAS.map(([texto, t0], i) => {
          const f = pop(t, t0 - 0.3);
          const hecho = t >= t0;
          return (
            <div key={texto} style={{ position: "absolute", left: 60, top: 60 + i * 150, display: "flex", alignItems: "center", gap: 40, opacity: Math.min(f * 1.5, 1), transform: `translateX(${(1 - Math.min(f, 1)) * -40}px)` }}>
              <div style={{ position: "relative", width: 96, height: 96, borderRadius: 18, border: `5px solid ${hecho ? VERDE : "#fff"}`, boxShadow: hecho ? `0 0 26px ${VERDE}88` : undefined }}>
                <Marca t={t} t0={t0} x={48} y={48} size={110} color={VERDE} tipo="ok" circulo={false} />
              </div>
              <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 84, letterSpacing: "0.01em", color: hecho ? "#fff" : "rgba(255,255,255,0.5)" }}>{texto}</span>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 50, right: 50, top: 500, height: 3, background: "rgba(255,255,255,0.3)", opacity: Math.min(res * 1.5, 1) }} />
        <div style={{ position: "absolute", left: 60, right: 60, top: 530, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: Math.min(res * 1.5, 1) }}>
          <span style={{ ...mono(40, 0.75), fontWeight: 700 }}>RESULTADO</span>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 84, color: ROJO }}>−50 €</span>
        </div>
      </div>
      <Sello t={t} t0={EV.trabajo - 0.12} texto="BIEN HECHO ✓" top={1000} color={VERDE} size={84} />
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

// ------------------------------------------------------------------ 4. Dos: COMPRAR por impulso · +200 € · el hábito que se repite
const Cursor: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => (
  <svg width={110} height={130} viewBox="0 0 44 52" style={{ position: "absolute", left: x, top: y, transform: `scale(${1 - 0.15 * k})`, transformOrigin: "0 0", filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.9))" }}>
    <path d="M4 2 L4 40 L14 31 L21 47 L28 44 L21 28 L35 28 Z" fill="#fff" stroke="#000" strokeWidth={2.5} strokeLinejoin="round" />
  </svg>
);
const REPES = [0, 0.17, 0.34];
const Dos: React.FC<P> = ({ t, s }) => {
  const toques = [EV.impulso, ...REPES.map((d) => EV.repetir + d)];
  const k = Math.max(...toques.map((t0) => pulsa(t, t0)));
  const llega = sal(L(t, s, EV.impulso - 0.05, 0, 1, (u) => u));
  const habito = L(t, EV.mal - 0.1, EV.habito + 0.35, 0, 1, (u) => u);
  const tenue = 1 - 0.55 * L(t, EV.mal - 0.2, EV.mal + 0.1, 0, 1);
  const r = 290;
  return (
    <>
      <Foco x={ANCHO / 2} y={1150} w={800} h={130} o={0.1} />
      {habito > 0 && (
        <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
          <circle cx={540} cy={1000} r={r} fill="none" stroke={ROJO} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={`${habito * 0.92} 1`} transform={`rotate(${-90 + (t - EV.mal) * 120} 540 1000)`} style={{ filter: `drop-shadow(0 0 14px ${ROJO})` }} />
        </svg>
      )}
      <Boton x={540} y={1000} texto="COMPRAR" color={VERDE} k={k} lleno={0.25 * k} />
      <Cursor x={640 + (1 - llega) * 220} y={1030 + (1 - llega) * 260} k={k} />
      {t >= EV.ganaste - 0.05 && <Cifra t={t} t0={EV.ganaste - 0.05} t1={EV.ganaste + 0.35} de={0} a={200} y={560} size={190} color={VERDE} pre="+" suf=" €" o={tenue} />}
      {REPES.map((d, i) => {
        const g = pop(t, EV.repetir + d);
        return g > 0.01 ? (
          <div key={i} style={{ position: "absolute", left: 170 + i * 270, top: 1250, width: 180, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 90, color: ROJO, transform: `scale(${0.5 + 0.5 * Math.min(g, 1.15)})`, opacity: Math.min(g * 2, 1) }}>
            ×{i + 2}
          </div>
        ) : null;
      })}
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: la nota de 0 a 10 (por el plan, no por el dinero)
const Giro: React.FC<P> = ({ t }) => {
  const g = pop(t, EV.puntua - 0.1);
  const v = t < EV["10"] ? 0 : Math.round(10 * sal(L(t, EV["10"], EV["10"] + 0.35, 0, 1, (u) => u)));
  const color = t < EV["0"] ? "#fff" : v >= 10 ? VERDE : ROJO;
  const plan = pop(t, EV.seguiste);
  const euro = pop(t, EV.dinero - 0.05);
  const tacha = L(t, EV.dinero + 0.1, EV.dinero + 0.3, 0, 1, (u) => u);
  const R = 250;
  return (
    <>
      <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" />
      <div style={{ position: "absolute", left: 540 - R, top: 800 - R, width: R * 2, height: R * 2, opacity: Math.min(g * 1.5, 1), transform: `scale(${0.7 + 0.3 * Math.min(g, 1.05)})` }}>
        <svg width={R * 2} height={R * 2} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <circle cx={R} cy={R} r={R - 14} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={22} />
          <circle cx={R} cy={R} r={R - 14} fill="none" stroke={color} strokeWidth={22} strokeLinecap="round" pathLength={1} strokeDasharray={`${v / 10} 1`} transform={`rotate(-90 ${R} ${R})`} style={{ filter: `drop-shadow(0 0 16px ${color})` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "baseline", justifyContent: "center", paddingTop: R * 0.55, boxSizing: "border-box", gap: 6 }}>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 210, lineHeight: 1, color, letterSpacing: "-0.04em" }}>{t < EV["0"] ? "?" : v}</span>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 80, color: "rgba(255,255,255,0.55)" }}>/10</span>
        </div>
      </div>
      {plan > 0.01 && (
        <div style={{ position: "absolute", left: euro > 0.01 ? 150 : 330, top: 1130, width: 420, display: "flex", justifyContent: "center", transform: `scale(${0.6 + 0.4 * Math.min(plan, 1.1)})`, opacity: Math.min(plan * 1.5, 1) }}>
          <span style={{ ...mono(56), fontWeight: 800, color: VERDE, padding: "12px 30px", borderRadius: 16, border: `4px solid ${VERDE}`, background: "#000" }}>PLAN ✓</span>
        </div>
      )}
      {euro > 0.01 && (
        <div style={{ position: "absolute", left: 640, top: 1100, width: 150, height: 150, borderRadius: 75, border: "6px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 90, color: "#fff", transform: `scale(${0.5 + 0.5 * Math.min(euro, 1.1)})`, opacity: Math.min(euro * 1.5, 1) }}>
          €
          <div style={{ position: "absolute", left: -20, top: 69, width: 190 * tacha, height: 12, borderRadius: 6, background: ROJO, transform: "rotate(-35deg)", transformOrigin: "95px 6px", boxShadow: `0 0 16px ${ROJO}` }} />
        </div>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: guárdalo para tu próxima racha mala
const Cierre: React.FC<P> = ({ t, s }) => {
  const g = pop(t, s - 0.05);
  const lleno = L(t, EV.guardalo, EV.guardalo + 0.2, 0, 1);
  const golpe = pop(t, EV.guardalo);
  return (
    <>
      <Foco x={ANCHO / 2} y={1080} w={600} h={120} o={0.12} />
      <Guardar x={540} y={820} size={340} lleno={lleno} s={(0.6 + 0.4 * Math.min(g, 1.05)) * (1 + 0.1 * Math.max(0, 1 - Math.abs(golpe - 1) * 3))} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Marca key={i} t={t} t0={EV.racha + i * 0.09} x={260 + i * 140} y={1180} size={110} color={ROJO} tipo="no" />
      ))}
    </>
  );
};

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["pierde", ROJO], ["buena", VERDE], ["malísima", ROJO], "plan", "stop", "tamaño", ["trabajo", VERDE], "sígueme", ["impulso", ROJO], ["ganaste", VERDE], ["hábito", ROJO], ["repetir", ROJO], "regla", ["10", VERDE], ["dinero", ROJO], "guárdalo", ["racha", ROJO]]);
const GOLPES: [number, string?][] = [[0.02], [EV.buena, VERDE], [EV.malisima, ROJO], [EV.plan], [EV.stop], [EV.tamano], [EV.perdiste], [EV.trabajo, VERDE], [EV.impulso], [EV.ganaste, VERDE], [EV.habito, ROJO], [EV.repetir], [EV.puntua], [EV["10"], VERDE], [EV.seguiste], [EV.dinero, ROJO], [EV.guardalo], [EV.racha, ROJO]];

const GANCHO = { lineas: ["Perder puede ser", "una *buena_operación*"], hasta: EV.gana - 0.15, color: VERDE };
export const Proceso: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/proceso_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.1} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} />
);
