// Reel 5-30-10 "Marcos compra siempre 100 acciones. Por eso a veces pierde 10 € y a veces 80 €" (~42 s). Marcos (gorra) con
// su caja de «100 ACCIONES» y los tickets −10 € / −80 €; dos gráficos con el stop cerca y lejos (×8); Lucía (coleta)
// decide primero cuánto acepta perder (20 €) y luego coloca el stop; el «sígueme» encima de la escena; la pizarra con
// TAMAÑO = RIESGO ÷ DISTANCIA AL STOP y los dos ejemplos (50 y 20 acciones, siempre −20 €); el stop lo pone el gráfico y
// el tamaño tu cuenta; y el cierre de conversión. Tiempos en src/gen/tamano.json (scripts/tamano.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/tamano.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { Camara, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { ROJO, VERDE } from "../Bot/kit";
import { cuerpoEn, Estado } from "../Bot/stick";
import { Ancla, anclaje, ENCOGE, Exclama, StickMundo } from "../Bot/comun";
import { FlashVerde } from "../Bot/historia";
import { despachoCasa, pizarra, rectXY } from "../Bot/decorados";
import { Abajo, Arriba, Ficha, PantallaPC, Pildora } from "../Bot/ui2d";
import { CierreComenta } from "../Bot/conversion";
import { claves, CtaSeguir, golpe, Montaje, P } from "../Explica/Montaje";

export const TAMANO_FPS = datos.fps;
export const TAMANO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;

// ------------------------------------------------------------------ piezas
const camDesp = (t: number, s: number, e: number, d0: number, d1: number, az0: number, az1: number) =>
  orbita([0.42, -0.35, -0.35], L(t, s, e, d0, d1), L(t, s, e, az0, az1), 0.1, { apertura: 6, centroY: 980 });
const ANCLA: [number, number, number] = [0.02, -1, -0.15];
// Caja de cartón con el número de acciones
const Caja: React.FC<{ x: number; y: number; n: number; size: number; color?: string; o?: number }> = ({ x, y, n, size, color = "#fff", o = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", opacity: o }}>
    <svg width={size} height={size * 0.95} viewBox="0 0 100 95" style={{ overflow: "visible" }}>
      <path d="M8 30 L50 18 L92 30 L92 86 L50 94 L8 86 Z" fill="#000" stroke={color} strokeWidth={3.5} strokeLinejoin="round" />
      <path d="M8 30 L50 42 L92 30 M50 42 L50 94" fill="none" stroke={color} strokeWidth={3} />
      <path d="M8 30 L0 16 L42 4 L50 18 M92 30 L100 16 L58 4 L50 18" fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" />
      <text x={29} y={72} textAnchor="middle" fontFamily="sans-serif" fontWeight={800} fontSize={24} fill={color} transform="skewY(15) translate(0,-8)">{n}</text>
      <text x={71} y={60} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={9} fill={color} transform="skewY(-15) translate(0,22)">ACCIONES</text>
    </svg>
  </div>
);
// Caja en las manos del personaje
const CajaMano: React.FC<{ c: Estado; a: Ancla; n: number }> = ({ c, a, n }) => <Caja x={a.ox + (c.x + 0.05) * a.s} y={a.oy - (c.y + 0.42) * a.s} n={n} size={0.55 * a.s} />;
const MANOS_CAJA = { mIx: -0.22, mIy: -0.2, mDx: 0.22, mDy: -0.2 };
// Gráfico 2D de velas con entrada y stop (distancia en «céntimos»)
const SERIE = [0.5, 0.56, 0.52, 0.6, 0.58, 0.64, 0.6, 0.66];
const Grafico: React.FC<{ w: number; h: number; stop: number; t: number; tStop: number; etiqueta?: string; color?: string }> = ({ w, h, stop, t, tStop, etiqueta, color = ROJO }) => {
  const yv = (v: number) => h * 0.1 + (0.75 - v) * h * 1.6;
  const paso = (w * 0.8) / SERIE.length;
  const entrada = SERIE[SERIE.length - 1];
  const yE = yv(entrada);
  const k = L(t, tStop - 0.3, tStop + 0.1, 0, 1);
  const yS = yv(entrada - stop * k);
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      {SERIE.map((v, i) => {
        const a = i ? SERIE[i - 1] : v - 0.03;
        const x = w * 0.05 + paso * (i + 0.5);
        return <rect key={i} x={x - paso * 0.3} y={Math.min(yv(a), yv(v))} width={paso * 0.6} height={Math.max(3, Math.abs(yv(v) - yv(a)))} fill={v >= a ? "#fff" : "#000"} stroke="#fff" strokeWidth={2.5} />;
      })}
      <line x1={0} x2={w} y1={yE} y2={yE} stroke="#fff" strokeWidth={3} strokeDasharray="10 8" />
      <text x={6} y={yE - 10} fontFamily="monospace" fontWeight={700} fontSize={24} fill="#fff">ENTRADA</text>
      {k > 0 && (
        <>
          <line x1={0} x2={w} y1={yS} y2={yS} stroke={color} strokeWidth={4} />
          <text x={6} y={yS + 30} fontFamily="monospace" fontWeight={800} fontSize={26} fill={color}>STOP</text>
          <line x1={w - 24} x2={w - 24} y1={yE} y2={yS} stroke={color} strokeWidth={3} />
          {etiqueta && <text x={w - 34} y={(yE + yS) / 2 + 9} textAnchor="end" fontFamily="monospace" fontWeight={800} fontSize={28} fill={color}>{etiqueta}</text>}
        </>
      )}
    </svg>
  );
};
const Panel: React.FC<{ x: number; y: number; w: number; h: number; titulo: string; children: React.ReactNode; g: number; color?: string }> = ({ x, y, w, h, titulo, children, g, color = "#fff" }) =>
  g < 0.01 ? null : (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 24, border: `4px solid ${color}`, background: "rgba(0,0,0,0.92)", padding: 22, boxSizing: "border-box", color: "#fff", opacity: Math.min(g * 1.5, 1), transform: `scale(${0.8 + 0.2 * Math.min(g, 1.05)})` }}>
      <div style={{ ...mono(32), fontWeight: 800, color, marginBottom: 10 }}>{titulo}</div>
      {children}
    </div>
  );

// ------------------------------------------------------------------ 1. Hook: siempre 100 acciones · −10 € o −80 €
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = camDesp(t, s, e, 4.3, 4.0, -0.1, -0.03);
  const tr: Trazo[] = [...polvo(0.1)];
  despachoCasa(tr, t, { hora: 11 });
  const c = cuerpoEn(t, [[0, { ...MANOS_CAJA, boca: 0.7, cejas: 0.4, mira: 0.4 }], [EV["80"] - 0.3, { ...MANOS_CAJA, boca: -0.7, cejas: -0.8, ojos: 1.3, agobio: 0.7, mira: 0.6 }]], { ...MANOS_CAJA }, -0.5);
  const a = anclaje(cam, ANCLA, 0.48);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <StickMundo a={a} c={c} t={t} gorra />
      <CajaMano c={c} a={a} n={100} />
      <Ficha t={t} t0={EV["10"] - 0.3} texto="−10 €" color={ROJO} size={70} x={640} y={1060} />
      <Ficha t={t} t0={EV["80"] - 0.3} texto="−80 €" color={ROJO} size={130} x={760} y={1260} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: stop cerca (−10 €) y stop lejos (−80 €), con las mismas 100 acciones
const s1 = inicio("uno");
const Uno: React.FC<P> = ({ t, s, e }) => {
  const cam = camDesp(t, s, e, 4.6, 4.4, 0.04, 0.0);
  const tr: Trazo[] = [...polvo(0.25)];
  despachoCasa(tr, t, { hora: 11 });
  const c = cuerpoEn(t, [[s, { ...MANOS_CAJA, mira: -0.5, boca: 0.2 }], [EV.lejos - 0.2, { ...MANOS_CAJA, mira: 0.6, boca: -0.4 }], [EV.cuenta0 - 0.4, { ...ENCOGE, mira: 0, boca: -0.2 }]], { ...MANOS_CAJA }, s - 0.4);
  const a = anclaje(orbita([0.0, -0.35, 0], 4.2, 0, 0.1, { centroY: 1000 }), [0, -1, 0.6], 0.42);
  const g1 = muelle(t, EV.cerca - 0.35, 220, 14);
  const g2 = muelle(t, EV.lejos - 0.35, 220, 14);
  return (
    <>
      <AbsoluteFill style={{ filter: "blur(6px)", opacity: 0.5 }}>
        <Escena cam={cam} trazos={tr} />
      </AbsoluteFill>
      <Panel x={110} y={330} w={420} h={560} titulo="STOP CERCA" g={g1}>
        <Grafico w={370} h={340} stop={0.06} t={t} tStop={EV.cerca} etiqueta="0,10 €" />
        <div style={{ ...mono(31), fontWeight: 800, color: ROJO, textAlign: "center", marginTop: 26 }}>100 × 0,10 = −10 €</div>
      </Panel>
      <Panel x={550} y={330} w={420} h={560} titulo="STOP LEJOS" g={g2} color={ROJO}>
        <Grafico w={370} h={340} stop={0.38} t={t} tStop={EV.lejos} etiqueta="0,80 €" />
        <div style={{ ...mono(31), fontWeight: 800, color: ROJO, textAlign: "center", marginTop: 26 }}>100 × 0,80 = −80 €</div>
      </Panel>
      <StickMundo a={a} c={c} t={t} gorra />
      <CajaMano c={c} a={a} n={100} />
      <Exclama t={t} t0={EV.cuenta0 - 0.3} c={c} {...a} signo="?" dura={0.8} />
      <Ficha t={t} t0={EV["8"] - 0.3} texto="×8" color={ROJO} size={120} x={830} y={1020} sub="MÁS PÉRDIDA" />
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: Lucía decide primero cuánto acepta perder (20 €) y luego pone el stop
const s2 = inicio("dos");
const Dos: React.FC<P> = ({ t, s, e }) => {
  const cam = camDesp(t, s, e, 4.3, 4.0, 0.06, -0.02);
  const tr: Trazo[] = [...polvo(0.1)];
  despachoCasa(tr, t, { hora: 10 });
  const c = cuerpoEn(t, [[s, { mira: 0.3, boca: 0.6, cejas: 0.4, mDx: 0.2, mDy: 0.35 }], [EV["20"] - 0.3, { mira: 0, boca: 0.8, mDx: 0.3, mDy: 0.45, mIx: -0.15, mIy: -0.5 }], [EV.stop2 - 0.8, { mira: 0.8, mDx: 0.45, mDy: 0.05, boca: 0.4 }]], { mira: 0.3 }, s - 0.4);
  const a = anclaje(cam, ANCLA, 0.48);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <PantallaPC cam={cam}>{(w, h) => <div style={{ position: "absolute", left: w * 0.06, top: h * 0.06 }}><Grafico w={w * 0.86} h={h * 0.8} stop={0.25} t={t} tStop={EV.stop2 - 0.2} /></div>}</PantallaPC>
      <StickMundo a={a} c={c} t={t} coleta />
      <Arriba>
        <Pildora t={t} t0={EV.reves - 0.3} size={44} color={VERDE}>LUCÍA, AL REVÉS</Pildora>
        <Pildora t={t} t0={EV.reves + 0.5} size={36}>1º LO QUE ACEPTA PERDER · 2º EL STOP</Pildora>
      </Arriba>
      <Ficha t={t} t0={EV["20"] - 0.3} texto="20 €" color={VERDE} size={120} x={760} y={1230} sub="LO QUE ACEPTA PERDER" />
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

// ------------------------------------------------------------------ 5. Tres: la pizarra con la fórmula y los dos ejemplos (siempre −20 €)
const s3 = inicio("tres");
const PIZ = { c: [0.12, 0.0, -0.9] as V3, w: 1.25, h: 0.85 };
const FORMULA = "TAMAÑO = RIESGO ÷ DISTANCIA AL STOP";
const Fila: React.FC<{ t: number; t0: number; cuenta: string; n: number; tN: number; tFin: number }> = ({ t, t0, cuenta, n, tN, tFin }) => {
  const g = muelle(t, t0, 220, 14);
  if (g < 0.01) return null;
  const ok = t > tFin - 0.2;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: Math.min(g * 1.5, 1), transform: `translateX(${(1 - Math.min(g, 1)) * -40}px)` }}>
      <span style={{ fontFamily: "monospace", fontSize: 36, color: "#fff", whiteSpace: "nowrap" }}>{cuenta}</span>
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: VERDE, opacity: L(t, tN - 0.2, tN + 0.1, 0, 1), whiteSpace: "nowrap" }}>{`= ${n}`}</span>
      {ok && <span style={{ ...mono(30), fontWeight: 800, color: VERDE, marginLeft: 4, whiteSpace: "nowrap" }}>→ −20 € ✓</span>}
    </div>
  );
};
const Tres: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.12, -0.25, -0.4], L(t, s, e, 4.4, 4.1), L(t, s, e, -0.04, 0.04), 0.08, { apertura: 6, centroY: 940 });
  const tr: Trazo[] = [...polvo(0.1)];
  for (let x = -1.6; x <= 1.61; x += 0.32) tr.push({ t: "l", a: [x, -1, -0.95], b: [x, -1, 1], w: 1, o: 0.12 });
  tr.push({ t: "l", a: [-1.6, -1, -0.95], b: [1.6, -1, -0.95], w: 1.8, o: 0.6 });
  pizarra(tr, PIZ.c, PIZ.w, PIZ.h);
  const pr = proyector(cam);
  const a1 = pr([PIZ.c[0] - PIZ.w / 2 + 0.06, PIZ.c[1] + PIZ.h / 2 - 0.05, PIZ.c[2]]);
  const b1 = pr([PIZ.c[0] + PIZ.w / 2 - 0.06, PIZ.c[1] - PIZ.h / 2 + 0.05, PIZ.c[2]]);
  const letras = Math.floor(L(t, EV.tamano - 0.2, EV.distancia + 0.6, 0, FORMULA.length, (u) => u));
  const c = cuerpoEn(t, [[s, { mDx: 0.5, mDy: 0.3, mira: 0.8, boca: 0.4 }], [EV.siempre - 0.3, { mDx: 0.3, mDy: 0.45, mIx: -0.3, mIy: 0.45, boca: 1, abre: 0.4, mira: 0 }]], { mira: 0.8 }, s - 0.4);
  const a = anclaje(cam, [-0.3, -1, 0.35], 0.42);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: a1.x + 24, top: a1.y + 22, width: b1.x - a1.x - 48, display: "flex", flexDirection: "column", gap: 26 }}>
        <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 31, color: "#fff", whiteSpace: "nowrap", borderBottom: "3px solid rgba(255,255,255,0.4)", paddingBottom: 14 }}>{FORMULA.slice(0, letras)}</span>
        <Fila t={t} t0={EV["20b"] - 0.3} cuenta="20 € ÷ 0,40 €" n={50} tN={EV["50"]} tFin={EV.siempre} />
        <Fila t={t} t0={EV["1"] - 0.5} cuenta="20 € ÷ 1,00 €" n={20} tN={EV["1"] + 0.6} tFin={EV.siempre} />
      </div>
      <Caja x={a1.x + 420} y={b1.y + 130} n={50} size={170} color={VERDE} o={L(t, EV["50"] - 0.2, EV["50"] + 0.1, 0, 1)} />
      <Caja x={a1.x + 620} y={b1.y + 140} n={20} size={110} color={VERDE} o={L(t, EV["1"] + 0.4, EV["1"] + 0.7, 0, 1)} />
      <StickMundo a={a} c={c} t={t} coleta />
      <Abajo top={1250}>
        <Pildora t={t} t0={EV.siempre - 0.3} size={48} color={VERDE}>SIEMPRE −20 €</Pildora>
      </Abajo>
      <FlashVerde t={t} t0={EV.siempre - 0.1} o={0.12} />
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: el stop lo pone el gráfico · el tamaño, tu cuenta
const sG = inicio("giro");
const Tarjeta: React.FC<{ t: number; t0: number; x: number; titulo: string; pie: string; color: string; icono: React.ReactNode }> = ({ t, t0, x, titulo, pie, color, icono }) => {
  const g = muelle(t, t0, 220, 13);
  if (g < 0.01) return null;
  return (
    <div style={{ position: "absolute", left: x, top: 460, width: 400, height: 560, borderRadius: 30, border: `5px solid ${color}`, background: "rgba(0,0,0,0.94)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, color: "#fff", opacity: Math.min(g * 1.5, 1), transform: `translateY(${(1 - Math.min(g, 1)) * 120}px) scale(${0.8 + 0.2 * Math.min(g, 1.05)})`, boxShadow: `0 0 ${40 * golpe(t, t0 + 0.2)}px ${color}` }}>
      {icono}
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 66, color }}>{titulo}</span>
      <span style={{ ...mono(32), fontWeight: 700, textAlign: "center", whiteSpace: "normal", lineHeight: 1.2, padding: "0 20px" }}>{pie}</span>
    </div>
  );
};
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = camDesp(t, s, e, 4.6, 4.4, 0.0, 0.05);
  const tr: Trazo[] = [...polvo(0.25)];
  despachoCasa(tr, t, { hora: 10 });
  return (
    <>
      <AbsoluteFill style={{ filter: "blur(6px)", opacity: 0.5 }}>
        <Escena cam={cam} trazos={tr} />
      </AbsoluteFill>
      <Arriba>
        <Pildora t={t} t0={EV.solucion - 0.2} size={44} color={VERDE}>LA SOLUCIÓN</Pildora>
      </Arriba>
      <Tarjeta t={t} t0={EV.grafico - 0.9} x={110} titulo="STOP" pie="LO PONE EL GRÁFICO" color={ROJO}
        icono={<svg width={190} height={140} viewBox="0 0 95 70"><path d="M5 50 L20 38 L32 44 L48 22 L60 30 L78 10" fill="none" stroke="#fff" strokeWidth={4} /><line x1={2} x2={93} y1={58} y2={58} stroke={ROJO} strokeWidth={4} strokeDasharray="6 4" /></svg>} />
      <Tarjeta t={t} t0={EV.cuenta2 - 0.8} x={570} titulo="TAMAÑO" pie="LO PONE TU CUENTA" color={VERDE}
        icono={<svg width={130} height={160} viewBox="0 0 65 80"><rect x={4} y={4} width={57} height={72} rx={8} fill="none" stroke="#fff" strokeWidth={4} /><rect x={12} y={12} width={41} height={16} fill="none" stroke={VERDE} strokeWidth={3} />{[0, 1, 2].map((r) => [0, 1, 2].map((k) => <rect key={`${r}${k}`} x={12 + k * 15} y={36 + r * 13} width={10} height={8} fill="#fff" />))}</svg>} />
    </>
  );
};

// ------------------------------------------------------------------ 7. Cierre de conversión
const Cierre: React.FC<P> = (p) => <CierreComenta {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tCuenta={EV.auditada} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, cierre: Cierre };
export const CLAVES = claves(["100", ["10", ROJO], ["80", ROJO], "cerca", "lejos", ["8", ROJO], "lucía", "revés", ["20", VERDE], "stop", "sígueme", "guardar", "tamaño", "distancia", ["50", VERDE], ["siempre", VERDE], ["solución", VERDE], "gráfico", "cuenta", "llegado", "bot", "privado", ["auditada", VERDE]]);

const GANCHO = { lineas: ["Siempre *100_acciones*:", "pierde *10_€* o *80_€*"], hasta: EV["80"] + 0.4, color: ROJO };
export const Tamano: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/tamano_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.1} empujes={0.05} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} />
);
