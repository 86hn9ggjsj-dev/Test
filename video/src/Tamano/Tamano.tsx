// Reel 5-30-10 "Marcos compra siempre 100 acciones. Por eso a veces pierde 10 € y a veces 80 €" (~42 s), en ESTILO LIMPIO:
// escenario de escenario (suelo y foco), un elemento principal y un solo texto a la vez. Marcos (gorra) con su caja de
// 100 acciones y los tickets −10 € / −80 €; dos gráficos con el stop cerca y lejos (×8); Lucía (coleta) decide primero
// 20 € y luego pone el stop; el «sígueme» encima; la fórmula y los dos ejemplos (siempre −20 €); el stop lo pone el
// gráfico y el tamaño tu cuenta; y el cierre de conversión. Tiempos en src/gen/tamano.json (scripts/tamano.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/tamano.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { Escena, orbita, Trazo } from "../Bot/tres";
import { ROJO, VERDE } from "../Bot/kit";
import { cuerpoEn, Estado } from "../Bot/stick";
import { Ancla, anclaje, StickMundo } from "../Bot/comun";
import { FlashVerde } from "../Bot/historia";
import { horizonte } from "../Bot/decorados";
import { Ficha, Foco } from "../Bot/ui2d";
import { CierreComenta } from "../Bot/conversion";
import { claves, CtaSeguir, golpe, Montaje, P } from "../Explica/Montaje";

export const TAMANO_FPS = datos.fps;
export const TAMANO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;

// ------------------------------------------------------------------ piezas
const camEscenario = orbita([0, -0.4, 0], 4.0, 0, 0.08, { apertura: 4, centroY: 1000 });
const Suelo: React.FC = () => {
  const tr: Trazo[] = [];
  horizonte(tr, -0.4, 0.4);
  return <Escena cam={camEscenario} trazos={tr} />;
};
// Caja de acciones (cartón en alambre) con el número
const Caja: React.FC<{ x: number; y: number; n: number; size: number; color?: string }> = ({ x, y, n, size, color = "#fff" }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)" }}>
    <svg width={size} height={size * 0.95} viewBox="0 0 100 95" style={{ overflow: "visible" }}>
      <path d="M8 30 L50 18 L92 30 L92 86 L50 94 L8 86 Z" fill="#000" stroke={color} strokeWidth={3.5} strokeLinejoin="round" />
      <path d="M8 30 L50 42 L92 30 M50 42 L50 94" fill="none" stroke={color} strokeWidth={3} />
      <text x={29} y={64} textAnchor="middle" fontFamily="sans-serif" fontWeight={800} fontSize={24} fill={color}>{n}</text>
    </svg>
  </div>
);
const CajaMano: React.FC<{ c: Estado; a: Ancla; n: number }> = ({ c, a, n }) => <Caja x={a.ox + (c.x + 0.05) * a.s} y={a.oy - (c.y + 0.42) * a.s} n={n} size={0.55 * a.s} />;
const MANOS_CAJA = { mIx: -0.22, mIy: -0.2, mDx: 0.22, mDy: -0.2 };
// Gráfico limpio: 5 velas, la entrada y el stop
const SERIE = [0.5, 0.58, 0.54, 0.62, 0.66];
const Grafico: React.FC<{ w: number; h: number; stop: number; k: number; etiqueta?: string }> = ({ w, h, stop, k, etiqueta }) => {
  const yv = (v: number) => h * 0.1 + (0.75 - v) * h * 1.6;
  const paso = (w * 0.7) / SERIE.length;
  const entrada = SERIE[SERIE.length - 1];
  const yE = yv(entrada);
  const yS = yv(entrada - stop * k);
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      {SERIE.map((v, i) => {
        const a = i ? SERIE[i - 1] : v - 0.04;
        const x = w * 0.08 + paso * (i + 0.5);
        return <rect key={i} x={x - paso * 0.28} y={Math.min(yv(a), yv(v))} width={paso * 0.56} height={Math.max(4, Math.abs(yv(v) - yv(a)))} fill={v >= a ? "#fff" : "#000"} stroke="#fff" strokeWidth={3} />;
      })}
      <line x1={0} x2={w} y1={yE} y2={yE} stroke="#fff" strokeWidth={3} strokeDasharray="12 9" opacity={0.8} />
      {k > 0 && (
        <>
          <line x1={0} x2={w} y1={yS} y2={yS} stroke={ROJO} strokeWidth={5} />
          <line x1={w - 30} x2={w - 30} y1={yE} y2={yS} stroke={ROJO} strokeWidth={3} />
          {etiqueta && <text x={w - 42} y={(yE + yS) / 2 + 10} textAnchor="end" fontFamily="monospace" fontWeight={800} fontSize={30} fill={ROJO}>{etiqueta}</text>}
          <text x={6} y={yS + 34} fontFamily="monospace" fontWeight={800} fontSize={26} fill={ROJO}>STOP</text>
        </>
      )}
    </svg>
  );
};
const Panel: React.FC<{ x: number; y: number; w: number; g: number; titulo: string; children: React.ReactNode; color?: string }> = ({ x, y, w, g, titulo, children, color = "rgba(255,255,255,0.85)" }) =>
  g < 0.01 ? null : (
    <div style={{ position: "absolute", left: x, top: y, width: w, borderRadius: 26, border: `3px solid ${color}`, background: "rgba(0,0,0,0.9)", padding: "22px 22px 26px", boxSizing: "border-box", color: "#fff", opacity: Math.min(g * 1.5, 1), transform: `translateY(${(1 - Math.min(g, 1)) * 40}px)` }}>
      <div style={{ ...mono(30, 0.7), fontWeight: 700, marginBottom: 14, letterSpacing: "0.1em" }}>{titulo}</div>
      {children}
    </div>
  );

// ------------------------------------------------------------------ 1. Hook: siempre 100 acciones · −10 € o −80 €
const Hook: React.FC<P> = ({ t }) => {
  const c = cuerpoEn(t, [[0, { ...MANOS_CAJA, boca: 0.7, cejas: 0.4, mira: 0.5 }], [EV["80"] - 0.3, { ...MANOS_CAJA, boca: -0.7, cejas: -0.8, ojos: 1.3, agobio: 0.7, mira: 0.6 }]], { ...MANOS_CAJA }, -0.5);
  const a = anclaje(camEscenario, [-0.4, -1, 0.3], 0.5);
  return (
    <>
      <Foco x={a.ox + 40} y={a.oy} w={620} h={130} />
      <Suelo />
      <StickMundo a={a} c={c} t={t} gorra />
      <CajaMano c={c} a={a} n={100} />
      <Ficha t={t} t0={EV["10"] - 0.3} texto="−10 €" color={ROJO} size={72} x={770} y={900} />
      <Ficha t={t} t0={EV["80"] - 0.3} texto="−80 €" color={ROJO} size={140} x={770} y={1110} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: stop cerca (−10 €) y stop lejos (−80 €), con las mismas 100 acciones
const Uno: React.FC<P> = ({ t }) => {
  const g1 = muelle(t, EV.cerca - 0.35, 220, 15);
  const g2 = muelle(t, EV.lejos - 0.35, 220, 15);
  return (
    <>
      <Panel x={110} y={420} w={420} g={g1} titulo="STOP CERCA">
        <Grafico w={376} h={330} stop={0.06} k={L(t, EV.cerca - 0.2, EV.cerca + 0.2, 0, 1)} etiqueta="0,10 €" />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 70, color: ROJO, textAlign: "center", marginTop: 10, opacity: L(t, EV.poco - 0.4, EV.poco - 0.1, 0, 1) }}>−10 €</div>
      </Panel>
      <Panel x={550} y={420} w={420} g={g2} titulo="STOP LEJOS" color={ROJO}>
        <Grafico w={376} h={330} stop={0.38} k={L(t, EV.lejos - 0.2, EV.lejos + 0.2, 0, 1)} etiqueta="0,80 €" />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 70, color: ROJO, textAlign: "center", marginTop: 10, opacity: L(t, EV["8"] - 0.5, EV["8"] - 0.2, 0, 1) }}>−80 €</div>
      </Panel>
      <div style={{ position: "absolute", top: 1100, left: 0, width: ANCHO, textAlign: "center", ...mono(40), fontWeight: 700, opacity: L(t, EV.cuenta0 - 0.6, EV.cuenta0 - 0.3, 0, 0.85) }}>MISMAS 100 ACCIONES</div>
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: Lucía decide primero cuánto acepta perder (20 €) y luego pone el stop
const s2 = inicio("dos");
const Dos: React.FC<P> = ({ t, s }) => {
  const c = cuerpoEn(t, [[s, { mira: 0.6, boca: 0.6, cejas: 0.4, mDx: 0.25, mDy: 0.4 }], [EV["20"] - 0.3, { mira: 0, boca: 0.8, mDx: 0.32, mDy: 0.48, mIx: -0.15, mIy: -0.5 }], [EV.stop2 - 0.8, { mira: 0.8, mDx: 0.5, mDy: 0.1, boca: 0.4 }]], { mira: 0.6 }, s - 0.4);
  const a = anclaje(camEscenario, [-0.55, -1, 0.3], 0.48);
  const gP = muelle(t, EV["20"] + 0.4, 220, 15);
  return (
    <>
      <Foco x={a.ox + 20} y={a.oy} w={520} h={120} />
      <Suelo />
      <StickMundo a={a} c={c} t={t} coleta />
      <Ficha t={t} t0={EV["20"] - 0.3} texto="20 €" color={VERDE} size={120} x={a.ox + 10} y={a.oy - 1.15 * a.s} sub="LO QUE ACEPTA PERDER" />
      <Panel x={500} y={520} w={470} g={gP} titulo="EL STOP, DESPUÉS">
        <Grafico w={426} h={330} stop={0.25} k={L(t, EV.stop2 - 0.5, EV.stop2, 0, 1)} />
      </Panel>
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

// ------------------------------------------------------------------ 5. Tres: la fórmula y los dos ejemplos (siempre −20 €)
const Fila: React.FC<{ t: number; t0: number; cuenta: string; n: number; tN: number; ok: boolean }> = ({ t, t0, cuenta, n, tN, ok }) => {
  const g = muelle(t, t0, 220, 15);
  if (g < 0.01) return null;
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 22, opacity: Math.min(g * 1.5, 1), transform: `translateY(${(1 - Math.min(g, 1)) * 30}px)` }}>
      <span style={{ fontFamily: "monospace", fontSize: 50, color: "#fff", whiteSpace: "nowrap" }}>{cuenta}</span>
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 76, color: VERDE, opacity: L(t, tN - 0.2, tN + 0.1, 0, 1), whiteSpace: "nowrap" }}>{`= ${n}`}</span>
      <span style={{ ...mono(34), fontWeight: 700, color: VERDE, opacity: ok ? 1 : 0, whiteSpace: "nowrap" }}>−20 €</span>
    </div>
  );
};
const Tres: React.FC<P> = ({ t }) => {
  const g = muelle(t, EV.tamano - 0.25, 200, 15);
  const ok = t > EV.siempre - 0.2;
  return (
    <>
      <Foco x={ANCHO / 2} y={1230} w={900} h={130} o={0.08} />
      <div style={{ position: "absolute", top: 420, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: Math.min(g * 1.5, 1), transform: `scale(${0.9 + 0.1 * Math.min(g, 1)})` }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 84, letterSpacing: "-0.02em" }}>TAMAÑO =</span>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 52, opacity: L(t, EV.tamano + 0.6, EV.tamano + 1.0, 0, 1) }}>
          <span style={{ color: VERDE }}>RIESGO</span> ÷ <span style={{ color: ROJO }}>DISTANCIA AL STOP</span>
        </span>
      </div>
      <div style={{ position: "absolute", top: 760, left: 0, width: ANCHO, display: "flex", flexDirection: "column", gap: 34 }}>
        <Fila t={t} t0={EV["20b"] - 0.3} cuenta="20 € ÷ 0,40 €" n={50} tN={EV["50"]} ok={ok} />
        <Fila t={t} t0={EV["1"] - 0.5} cuenta="20 € ÷ 1,00 €" n={20} tN={EV["1"] + 0.6} ok={ok} />
      </div>
      {ok && (
        <div style={{ position: "absolute", top: 1110, left: 0, width: ANCHO, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 70, color: VERDE, transform: `scale(${1 + 0.15 * golpe(t, EV.siempre - 0.2)})` }}>SIEMPRE −20 €</div>
      )}
      <FlashVerde t={t} t0={EV.siempre - 0.1} o={0.1} />
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: el stop lo pone el gráfico · el tamaño, tu cuenta
const Tarjeta: React.FC<{ t: number; t0: number; x: number; titulo: string; pie: string; color: string; icono: React.ReactNode }> = ({ t, t0, x, titulo, pie, color, icono }) => {
  const g = muelle(t, t0, 220, 14);
  if (g < 0.01) return null;
  return (
    <div style={{ position: "absolute", left: x, top: 470, width: 400, height: 540, borderRadius: 30, border: `3px solid ${color}`, background: "rgba(0,0,0,0.92)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28, color: "#fff", opacity: Math.min(g * 1.5, 1), transform: `translateY(${(1 - Math.min(g, 1)) * 80}px)` }}>
      {icono}
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 68, color }}>{titulo}</span>
      <span style={{ ...mono(30), fontWeight: 700, textAlign: "center", whiteSpace: "normal", lineHeight: 1.25, padding: "0 30px", opacity: 0.85 }}>{pie}</span>
    </div>
  );
};
const Giro: React.FC<P> = ({ t }) => (
  <>
    <Foco x={ANCHO / 2} y={1080} w={900} h={130} o={0.08} />
    <Tarjeta t={t} t0={EV.grafico - 0.9} x={110} titulo="STOP" pie="LO PONE EL GRÁFICO" color={ROJO}
      icono={<svg width={190} height={140} viewBox="0 0 95 70"><path d="M5 50 L20 38 L32 44 L48 22 L60 30 L78 10" fill="none" stroke="#fff" strokeWidth={4} strokeLinejoin="round" /><line x1={2} x2={93} y1={60} y2={60} stroke={ROJO} strokeWidth={4} /></svg>} />
    <Tarjeta t={t} t0={EV.cuenta2 - 0.8} x={570} titulo="TAMAÑO" pie="LO PONE TU CUENTA" color={VERDE}
      icono={<svg width={120} height={150} viewBox="0 0 65 80"><rect x={4} y={4} width={57} height={72} rx={8} fill="none" stroke="#fff" strokeWidth={4} /><rect x={12} y={12} width={41} height={16} fill="none" stroke={VERDE} strokeWidth={3} />{[0, 1, 2].map((r) => [0, 1, 2].map((k) => <rect key={`${r}${k}`} x={12 + k * 15} y={36 + r * 13} width={10} height={8} fill="#fff" />))}</svg>} />
  </>
);

// ------------------------------------------------------------------ 7. Cierre de conversión
const Cierre: React.FC<P> = (p) => <CierreComenta {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tCuenta={EV.auditada} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, cierre: Cierre };
export const CLAVES = claves(["100", ["10", ROJO], ["80", ROJO], ["8", ROJO], "lucía", ["20", VERDE], "sígueme", "tamaño", ["50", VERDE], ["siempre", VERDE], ["solución", VERDE], "gráfico", "bot", ["auditada", VERDE]]);

const GANCHO = { lineas: ["Siempre *100_acciones*:", "pierde *10_€* o *80_€*"], hasta: EV["80"] + 0.4, color: ROJO };
export const Tamano: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/tamano_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.1} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} />
);
