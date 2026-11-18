// Historia 5-30-10 «dopamina» "Copias al que más ganó el mes pasado. Y llegas justo a su peor racha" (~36 s). Sin
// stickman: todo es la pantalla de una app de copiar operaciones. Fotograma 0: el ranking «TOP DEL MES» con el +40 %
// brillando; COPIAR → su curva se da la vuelta; el pico de +40 % con la banda de riesgo y el dado («esta vez salió bien»);
// lo que sube así baja igual de rápido; los dos números: cuánto tiempo lleva y su peor caída (−50 %, contigo dentro); la
// regla: mira su peor caída y si la aguantarías con tu dinero. Cierre en el móvil. Tiempos en src/gen/copiar.json.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/copiar.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { ORO, ROJO, VERDE } from "../Bot/kit";
import { Sello } from "../Bot/historia";
import { Marca, pulsa, Rotulito } from "../Bot/v3";
import { CierreMovil, TarjetaAuditada } from "../Bot/dopa";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const COPIAR_FPS = datos.fps;
export const COPIAR_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const min1 = (g: number, m = 1) => Math.min(g, m);
const AZUL_APP = "#4f8cff";

const Mano: React.FC<{ x: number; y: number; k?: number }> = ({ x, y, k = 0 }) => (
  <svg width={90} height={110} viewBox="0 0 44 52" style={{ position: "absolute", left: x - 20, top: y - 10, transform: `scale(${1 - 0.15 * k})`, filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.9))" }}>
    <path d="M4 2 L4 40 L14 31 L21 47 L28 44 L21 28 L35 28 Z" fill="#fff" stroke="#000" strokeWidth={2.5} strokeLinejoin="round" />
  </svg>
);
const Avatar: React.FC<{ letra: string; color: string; size?: number }> = ({ letra, color, size = 76 }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: `${color}33`, border: `4px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: size * 0.45, color }}>{letra}</div>
);
const Mini: React.FC<{ pts: number[]; color: string; w?: number; h?: number }> = ({ pts, color, w = 150, h = 60 }) => (
  <svg width={w} height={h}><polyline points={pts.map((v, i) => `${(i / (pts.length - 1)) * w},${h - v * h}`).join(" ")} fill="none" stroke={color} strokeWidth={5} strokeLinejoin="round" /></svg>
);

// ------------------------------------------------------------------ 1. Hook: TOP DEL MES · +40 % · COPIAR → su peor racha
const Hook: React.FC<P> = ({ t }) => {
  const tap = EV.llegas - 0.15;
  const copiado = t > tap;
  const racha = L(t, EV.racha - 0.35, EV.racha + 0.2, 0, 1);
  const pct = copiado ? 40 - 58 * racha : 40;
  const k = pulsa(t, tap);
  const mano = L(t, 0.6, tap, 0, 1, (u) => 1 - Math.pow(1 - u, 3));
  const filas = [
    { n: "@cohete", l: "C", c: VERDE },
    { n: "@tortuga", l: "T", c: AZUL_APP },
    { n: "@zorro", l: "Z", c: ORO },
  ];
  const sube = [0.1, 0.2, 0.15, 0.35, 0.3, 0.55, 0.5, 0.75, 0.9];
  const baja = [0.1, 0.2, 0.15, 0.35, 0.3, 0.55, 0.5, 0.75, 0.9, 0.6, 0.35, 0.1];
  return (
    <>
      <div style={{ position: "absolute", left: 100, top: 540, width: 880, height: 690, borderRadius: 36, background: "#0b0d12", border: "3px solid rgba(255,255,255,0.18)", boxShadow: "0 30px 80px rgba(0,0,0,0.8)" }}>
        <div style={{ position: "absolute", left: 40, top: 30, ...mono(36), fontWeight: 800, color: "#fff", letterSpacing: "0.1em" }}>TOP DEL MES</div>
        <div style={{ position: "absolute", right: 40, top: 34, ...mono(26), fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>COPIAR TRADERS</div>
        {filas.map((f, i) => {
          const o = L(t, -0.2 + i * 0.12, 0.1 + i * 0.12, 0, 1);
          const top = 100 + i * 150;
          const uno = i === 0;
          const col = uno && copiado && racha > 0.4 ? ROJO : VERDE;
          return (
            <div key={i} style={{ position: "absolute", left: 24, right: 24, top, height: 132, borderRadius: 24, background: uno ? `${col}14` : "rgba(255,255,255,0.03)", border: uno ? `3px solid ${col}` : "2px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 22, padding: "0 22px", opacity: o, transform: `translateX(${(1 - o) * 80}px)`, boxShadow: uno ? `0 0 30px ${col}44` : undefined }}>
              <div style={{ ...mono(34), fontWeight: 800, color: "rgba(255,255,255,0.6)", width: 40 }}>{i + 1}</div>
              <Avatar letra={f.l} color={f.c} />
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: "#fff", width: 200 }}>{f.n}</div>
              {uno ? <Mini pts={copiado ? baja.slice(0, 9 + Math.round(3 * racha)) : sube} color={col} w={150} /> : <Mini pts={[0.3, 0.4, 0.35, 0.5, 0.45, 0.55]} color={VERDE} w={150} />}
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: uno ? col : VERDE, width: 170, textAlign: "right", transform: uno && t > EV.gano - 0.1 && t < EV.gano + 0.4 ? `scale(${1 + 0.15 * Math.sin((t - EV.gano + 0.1) * 6)})` : undefined }}>
                {uno ? `${pct >= 0 ? "+" : "−"}${Math.abs(Math.round(pct))} %` : ["", "+6 %", "+4 %"][i]}
              </div>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 230, top: 570, width: 420, height: 90, borderRadius: 45, background: copiado ? VERDE : AZUL_APP, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 40, color: "#000", transform: `translateY(${10 * k}px)`, boxShadow: `0 ${12 - 10 * k}px 0 ${copiado ? VERDE : AZUL_APP}66` }}>{copiado ? "COPIANDO ✓" : "COPIAR @cohete"}</div>
      </div>
      {t < tap + 0.5 && <Mano x={980 - 540 * mano} y={1420 - 270 * mano} k={k} />}
      <Sello t={t} t0={EV.racha - 0.05} texto="SU PEOR RACHA" top={1270} color={ROJO} size={64} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: el pico de +40 % · la banda de riesgo · el dado · baja igual de rápido
const X0 = 130;
const X1 = 950;
const yv = (v: number) => 1080 - v * 11;
const curva = (u: number) => (u < 0.55 ? 40 * Math.pow(u / 0.55, 1.6) : 40 - 52 * Math.pow((u - 0.55) / 0.45, 1.3));
const Dado: React.FC<{ t: number; t0: number; x: number; y: number }> = ({ t, t0, x, y }) => {
  const g = muelle(t, t0, 220, 10);
  if (g <= 0.01) return null;
  const rueda = L(t, t0 - 0.6, t0, 360 * 2, 0, (u) => 1 - Math.pow(1 - u, 3));
  const pips = [[30, 30], [30, 60], [30, 90], [90, 30], [90, 60], [90, 90]];
  return (
    <div style={{ position: "absolute", left: x - 60, top: y - 60, width: 120, height: 120, borderRadius: 24, background: "#fff", transform: `rotate(${rueda}deg) scale(${0.5 + 0.5 * min1(g, 1.1)})`, boxShadow: `0 0 40px ${VERDE}88` }}>
      {pips.map(([px, py], i) => <div key={i} style={{ position: "absolute", left: px - 11, top: py - 11, width: 22, height: 22, borderRadius: 11, background: "#111" }} />)}
    </div>
  );
};
const Uno: React.FC<P> = ({ t, s }) => {
  const hasta = t < EV.sube - 0.1 ? L(t, s, EV.mes + 0.6, 0.05, 0.55, (v) => 1 - Math.pow(1 - v, 2)) : L(t, EV.sube - 0.1, EV.rapido + 0.2, 0.55, 1, (v) => v);
  const banda = L(t, EV.riesgo - 0.3, EV.riesgo + 0.2, 0, 1);
  const arriba: string[] = [];
  const abajo: string[] = [];
  const linea: string[] = [];
  for (let k = 0; k <= 200 * hasta; k++) {
    const u = k / 200;
    const v = curva(u);
    const x = X0 + u * (X1 - X0);
    const amp = (4 + 26 * Math.min(u / 0.55, 1)) * banda;
    linea.push(`${x},${yv(v) + 5 * Math.sin(u * 80)}`);
    arriba.push(`${x},${yv(v + amp)}`);
    abajo.unshift(`${x},${yv(v - amp)}`);
  }
  const roja = t > EV.baja - 0.2;
  return (
    <>
      <div style={{ position: "absolute", left: X0, top: 450, display: "flex", alignItems: "center", gap: 18 }}>
        <Avatar letra="C" color={VERDE} size={64} />
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, color: "#fff" }}>@cohete</span>
      </div>
      <div style={{ position: "absolute", left: X0 - 20, width: X1 - X0 + 40, top: yv(0) - 2, borderTop: "4px dashed rgba(255,255,255,0.3)" }} />
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
        {banda > 0 && linea.length > 1 && <polygon points={[...arriba, ...abajo].join(" ")} fill={`${ROJO}2a`} stroke={`${ROJO}88`} strokeWidth={2} />}
        {linea.length > 1 && <polyline points={linea.join(" ")} fill="none" stroke={roja ? ROJO : VERDE} strokeWidth={8} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 12px ${roja ? ROJO : VERDE})` }} />}
      </svg>
      <div style={{ position: "absolute", left: X0 + 0.55 * (X1 - X0) - 150, width: 300, top: yv(40) - 120, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 76, color: VERDE, opacity: L(t, EV.mes - 0.1, EV.mes + 0.2, 0, 1) }}>+40 %</div>
      <div style={{ position: "absolute", left: 600, top: 980, ...mono(36), fontWeight: 800, color: ROJO, opacity: banda * (1 - L(t, EV.sube - 0.3, EV.sube, 0, 1)) }}>MUCHO RIESGO</div>
      <Dado t={t} t0={EV.bien - 0.1} x={870} y={500} />
      <div style={{ position: "absolute", left: 540, width: 400, top: 620, textAlign: "right", ...mono(30), fontWeight: 800, color: VERDE, opacity: L(t, EV.bien, EV.bien + 0.2, 0, 1) * (1 - L(t, EV.baja - 0.3, EV.baja, 0, 1)) }}>ESTA VEZ SALIÓ BIEN</div>
      <div style={{ position: "absolute", left: 0, width: ANCHO, top: 1230, textAlign: "center", ...mono(42), fontWeight: 800, color: ROJO, opacity: L(t, EV.rapido - 0.3, EV.rapido, 0, 1) }}>BAJA IGUAL DE RÁPIDO</div>
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

// ------------------------------------------------------------------ 4. Dos: 1 · cuánto tiempo lleva · 2 · su peor caída (−50 %, contigo dentro)
const Dos: React.FC<P> = ({ t }) => {
  const c1 = muelle(t, EV.uno - 0.2, 220, 13);
  const c2 = muelle(t, EV.dos - 0.2, 220, 13);
  const regla = L(t, EV.tiempo - 0.1, EV.tiempo + 0.6, 0, 1);
  const dd = L(t, EV.caida - 0.1, EV.mitad + 0.1, 0, 1, (u) => u);
  const tuyo = L(t, EV.dentro - 0.4, EV.dentro + 0.1, 0, 1, (u) => u * u);
  const ddPts: string[] = [];
  for (let k = 0; k <= 60 * dd; k++) {
    const u = k / 60;
    const v = u < 0.25 ? u / 0.25 : 1 - 0.5 * Math.min(1, (u - 0.25) / 0.6) - 0.03 * Math.sin(u * 40);
    ddPts.push(`${170 + u * 740},${1210 - v * 200}`);
  }
  return (
    <>
      <div style={{ position: "absolute", left: 100, top: 440, width: 880, height: 330, borderRadius: 30, border: "3px solid rgba(255,255,255,0.25)", background: "#0b0d12", opacity: min1(c1 * 2), transform: `scale(${0.8 + 0.2 * min1(c1, 1.05)})` }}>
        <div style={{ position: "absolute", left: 40, top: 26, ...mono(36), fontWeight: 800, color: ORO }}>1 · CUÁNTO TIEMPO LLEVA</div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 130, height: 40, display: "flex", gap: 6 }}>
          {Array.from({ length: 12 }, (_, i) => <div key={i} style={{ flex: 1, borderRadius: 6, background: i === 0 ? VERDE : "rgba(255,255,255,0.12)", opacity: i === 0 ? 1 : regla }} />)}
        </div>
        <div style={{ position: "absolute", left: 40, top: 186, ...mono(26), fontWeight: 800, color: VERDE }}>1 MES</div>
        <div style={{ position: "absolute", right: 40, top: 186, ...mono(26), fontWeight: 800, color: "rgba(255,255,255,0.6)", opacity: regla }}>1 AÑO</div>
        <div style={{ position: "absolute", left: 0, width: 880, top: 240, textAlign: "center", ...mono(38), fontWeight: 800, color: ROJO, opacity: L(t, EV.ano - 0.2, EV.ano + 0.1, 0, 1) }}>MENOS DE 1 AÑO = NO DICE NADA</div>
      </div>
      {c2 > 0.01 && (
        <div style={{ position: "absolute", left: 100, top: 810, width: 880, height: 470, borderRadius: 30, border: "3px solid rgba(255,255,255,0.25)", background: "#0b0d12", opacity: min1(c2 * 2), transform: `scale(${0.8 + 0.2 * min1(c2, 1.05)})` }}>
          <div style={{ position: "absolute", left: 40, top: 26, ...mono(36), fontWeight: 800, color: ORO }}>2 · SU PEOR CAÍDA</div>
        </div>
      )}
      {c2 > 0.5 && (
        <>
          <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
            {ddPts.length > 1 && <polyline points={ddPts.join(" ")} fill="none" stroke={ROJO} strokeWidth={8} strokeLinejoin="round" />}
            {dd > 0.3 && <line x1={170 + 0.25 * 740} x2={910} y1={1010} y2={1010} stroke="rgba(255,255,255,0.35)" strokeWidth={3} strokeDasharray="10 8" />}
          </svg>
          <div style={{ position: "absolute", left: 420, top: 1100, fontFamily: SANS, fontWeight: 800, fontSize: 92, color: ROJO, opacity: L(t, EV.mitad - 0.2, EV.mitad + 0.05, 0, 1), transform: `scale(${1 + 0.2 * (1 - L(t, EV.mitad - 0.2, EV.mitad + 0.2, 0, 1))})` }}>−50 %</div>
          <div style={{ position: "absolute", left: 600, top: 920, ...mono(30), fontWeight: 800, color: "#fff", opacity: L(t, EV.perderla - 0.2, EV.perderla, 0, 1) }}>PUEDE VOLVER A PASAR</div>
          {tuyo > 0 && <div style={{ position: "absolute", left: 720, top: 880 + 200 * tuyo, ...mono(30), fontWeight: 800, color: "#000", background: ORO, padding: "8px 16px", borderRadius: 30, boxShadow: `0 0 20px ${ORO}` }}>TU DINERO</div>}
        </>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: antes de COPIAR, mira su peor caída · ¿la aguantarías con tu dinero?
const Giro: React.FC<P> = ({ t, s }) => {
  const perfil = muelle(t, s + 0.05, 220, 13);
  const lupa = L(t, EV.caida2 - 0.3, EV.caida2, 0, 1);
  const preg = muelle(t, EV.aguantarias - 0.2, 220, 12);
  const abierto = t > EV.aguantarias + 0.3;
  return (
    <>
      <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" top={360} />
      <div style={{ position: "absolute", left: 100, top: 450, width: 880, height: 560, borderRadius: 36, background: "#0b0d12", border: "3px solid rgba(255,255,255,0.18)", opacity: min1(perfil * 2), transform: `scale(${0.8 + 0.2 * min1(perfil, 1.05)})` }}>
        <div style={{ position: "absolute", left: 40, top: 34, display: "flex", alignItems: "center", gap: 18 }}>
          <Avatar letra="C" color={VERDE} size={70} />
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, color: "#fff" }}>@cohete</span>
        </div>
        {[["ÚLTIMO MES", "+40 %", VERDE], ["TIEMPO", "4 meses", "#fff"], ["PEOR CAÍDA", "−50 %", ROJO]].map(([a, b, c], i) => (
          <div key={i} style={{ position: "absolute", left: 40, right: 40, top: 140 + i * 100, height: 84, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderRadius: 18, background: i === 2 ? `rgba(255,70,70,${0.2 * lupa})` : "rgba(255,255,255,0.04)", border: i === 2 ? `3px solid rgba(255,70,70,${lupa})` : "2px solid transparent", transform: i === 2 ? `scale(${1 + 0.05 * lupa})` : undefined }}>
            <span style={{ ...mono(32), fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>{a}</span>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 48, color: c as string }}>{b}</span>
          </div>
        ))}
        <div style={{ position: "absolute", left: 230, top: 450, width: 420, height: 84, borderRadius: 42, background: abierto ? AZUL_APP : "#2a2d35", display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: SANS, fontWeight: 800, fontSize: 38, color: abierto ? "#000" : "rgba(255,255,255,0.45)" }}>
          {!abierto && <svg width={30} height={36}><rect x={3} y={15} width={24} height={19} rx={4} fill="rgba(255,255,255,0.45)" /><path d="M8 15 V10 a7 7 0 0 1 14 0 V15" stroke="rgba(255,255,255,0.45)" strokeWidth={4} fill="none" /></svg>}
          COPIAR
        </div>
      </div>
      {lupa > 0 && (
        <svg width={170} height={170} style={{ position: "absolute", left: 590 + 30 * (1 - lupa), top: 735, opacity: lupa }}>
          <circle cx={70} cy={70} r={52} fill="rgba(255,255,255,0.08)" stroke="#fff" strokeWidth={9} />
          <line x1={108} y1={108} x2={160} y2={160} stroke="#fff" strokeWidth={14} strokeLinecap="round" />
        </svg>
      )}
      {preg > 0.01 && (
        <div style={{ position: "absolute", left: 0, width: ANCHO, top: 1060, textAlign: "center", opacity: min1(preg * 2), transform: `scale(${0.5 + 0.5 * min1(preg, 1.08)})` }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 70, color: "#fff" }}>¿La aguantarías?</div>
          <div style={{ ...mono(36), fontWeight: 800, color: ORO, marginTop: 10, opacity: L(t, EV.aguantarias + 0.2, EV.aguantarias + 0.4, 0, 1) }}>TU CUENTA: 2.000 € → 1.000 €</div>
        </div>
      )}
      <Marca t={t} t0={EV.dinero - 0.05} x={160} y={1110} size={90} color={VERDE} tipo="ok" />
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: comenta BOT en el móvil → mensaje directo → cuenta auditada
const Cierre: React.FC<P> = (p) => <CierreMovil {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tFinal={EV.auditada} palabra="BOT" mensaje="Te explico cómo lo hago ↓" final={<TarjetaAuditada />} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["copias", ORO], ["ganó", VERDE], ["racha", ROJO], ["40", VERDE], ["riesgo", ROJO], ["bien", VERDE], "sube", ["baja", ROJO], ["rápido", ROJO], "sígueme", ["números", ORO], ["tiempo", ORO], ["año", ORO], ["caída", ROJO], ["mitad", ROJO], ["perderla", ROJO], ["dentro", ROJO], "regla", "copiar", ["aguantarías", ORO], ["dinero", ORO], "llegado", "bot", ["auditada", VERDE]]);
const GOLPES: [number, string?][] = [[0.02], [EV.gano, VERDE], [EV.llegas], [EV.racha, ROJO], [EV.mes, VERDE], [EV.riesgo, ROJO], [EV.bien, VERDE], [EV.sube], [EV.baja, ROJO], [EV.rapido, ROJO], [EV.numeros, ORO], [EV.uno], [EV.ano, ROJO], [EV.dos], [EV.caida, ROJO], [EV.mitad, ROJO], [EV.dentro, ORO], [EV.regla], [EV.copiar], [EV.caida2, ROJO], [EV.aguantarias, ORO], [EV.llegado], [EV.bot], [EV.privado], [EV.auditada, VERDE]];

const GANCHO = { lineas: ["Copias al que más ganó", "y llegas a *su_peor_racha*"], hasta: inicio("uno") - 0.05, color: ROJO };
export const Copiar: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/copiar_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.08} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} />
);
