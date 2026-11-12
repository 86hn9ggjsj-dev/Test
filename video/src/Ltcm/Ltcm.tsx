// Reel 5-30-10 de historia real "Un fondo con dos premios Nobel perdió 4.600 millones en menos de 4 meses" (~43 s):
// Long-Term Capital Management (1998), en ESTILO LIMPIO: un elemento principal y un solo texto a la vez. Dos medallas
// Nobel y el contador en rojo; la curva que sube +40 %; la pizarra con fórmulas y ×25 prestado; la campana con la cola
// «casi imposible»; el «sígueme» encima; cúpulas de Moscú e IMPAGO; la bola que cae en la cola; 14 bancos y 3.600 M;
// la pregunta «si pasa lo peor, ¿sigo vivo?» y el tamaño que encoge; y el cierre de conversión.
// Tiempos en src/gen/ltcm.json (scripts/ltcm.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/ltcm.json";
import { ANCHO, SANS } from "../Viral/util";
import { euros, L, mono, muelle } from "../Bot/piezas";
import { Escena, orbita, proyector, Trazo, V3 } from "../Bot/tres";
import { ROJO, VERDE } from "../Bot/kit";
import { FlashRojo } from "../Bot/comun";
import { CamaraTiembla, Sello } from "../Bot/historia";
import { horizonte, pizarra, rectXY } from "../Bot/decorados";
import { Ficha, Foco } from "../Bot/ui2d";
import { CierreComenta } from "../Bot/conversion";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const LTCM_FPS = datos.fps;
export const LTCM_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;

// ------------------------------------------------------------------ piezas
const Titulo: React.FC<{ t: number; t0: number; texto: string; top?: number; color?: string }> = ({ t, t0, texto, top = 400, color = "#fff" }) => (
  <div style={{ position: "absolute", top, left: 0, width: ANCHO, textAlign: "center", ...mono(38), fontWeight: 700, letterSpacing: "0.14em", color, opacity: L(t, t0, t0 + 0.3, 0, 0.85) }}>{texto}</div>
);
const Medalla: React.FC<{ x: number; y: number; g: number; giro?: number }> = ({ x, y, g, giro = 0 }) =>
  g < 0.01 ? null : (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${Math.min(g, 1.08)}) rotate(${giro}deg)`, opacity: Math.min(g * 1.5, 1) }}>
      <svg width={220} height={300} viewBox="0 0 68 92">
        <path d="M18 2 L30 34 L38 34 L26 2 Z M50 2 L38 34 L30 34 L42 2 Z" fill="#000" stroke="#fff" strokeWidth={2} strokeLinejoin="round" />
        <circle cx={34} cy={60} r={26} fill="#000" stroke="#fff" strokeWidth={2.6} />
        <circle cx={34} cy={60} r={20} fill="none" stroke="#fff" strokeWidth={1.2} opacity={0.5} />
        <text x={34} y={64} textAnchor="middle" fontFamily="monospace" fontWeight={800} fontSize={10} fill="#fff">NOBEL</text>
      </svg>
    </div>
  );
// Campana de probabilidad con la cola izquierda en rojo; bola 0…1 cae en la cola
const Campana: React.FC<{ marca: number; bola: number }> = ({ marca, bola }) => {
  const x = 120;
  const y = 560;
  const w = 840;
  const h = 520;
  const pts = Array.from({ length: 81 }, (_, i) => {
    const u = i / 80;
    const z = (u - 0.55) * 7;
    return [u * w, h - h * 0.92 * Math.exp((-z * z) / 2)];
  });
  const d = pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`).join("");
  const cola = pts.filter(([px]) => px < w * 0.16);
  const dCola = `M0,${h} ` + cola.map(([px, py]) => `L${px.toFixed(1)},${py.toFixed(1)}`).join(" ") + ` L${(w * 0.16).toFixed(1)},${h} Z`;
  const by = -80 + (h - 18 + 80) * Math.min(1, bola * bola);
  return (
    <svg width={w} height={h + 80} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      <line x1={0} x2={w} y1={h} y2={h} stroke="#fff" strokeWidth={2} opacity={0.5} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
      <path d={dCola} fill={ROJO} opacity={0.2 + 0.55 * marca} />
      {bola > 0 && <circle cx={w * 0.07} cy={by} r={18} fill={ROJO} style={{ filter: `drop-shadow(0 0 14px ${ROJO})` }} />}
      {marca > 0.01 && (
        <g opacity={marca}>
          <line x1={w * 0.08} x2={w * 0.2} y1={h - 40} y2={h - 170} stroke={ROJO} strokeWidth={3} />
          <text x={w * 0.21} y={h - 180} fontFamily="monospace" fontWeight={800} fontSize={42} fill={ROJO}>CASI IMPOSIBLE</text>
        </g>
      )}
    </svg>
  );
};
// Cúpulas de Moscú en alambre
const cupulas = (tr: Trazo[], x: number, z: number, k = 1) => {
  for (const [dx, h, r] of [[-0.35, 0.55, 0.12], [0, 0.8, 0.16], [0.35, 0.6, 0.12]] as [number, number, number][]) {
    const cx = x + dx * k;
    const y0 = -1 + h * k;
    tr.push({ t: "p", pts: rectXY(cx - r * 0.7 * k, -1, cx + r * 0.7 * k, y0, z), w: 2.2, o: 0.9, relleno: "#fff", oRelleno: 0.03 });
    const bulbo: V3[] = Array.from({ length: 25 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      const yy = Math.sin(a);
      const ancho = Math.cos(a) * (yy > 0 ? 1 - yy * 0.85 : 1);
      return [cx + ancho * r * k, y0 + r * k + yy * r * 1.25 * k, z];
    });
    tr.push({ t: "p", pts: bulbo, w: 2.4, o: 1, relleno: "#fff", oRelleno: 0.05, luz: 0.2 });
    tr.push({ t: "l", a: [cx, y0 + r * 2.5 * k, z], b: [cx, y0 + r * 3.1 * k, z], w: 2, o: 1 });
  }
};
const Banquito: React.FC<{ g: number }> = ({ g }) => (
  <svg width={92} height={76} viewBox="0 0 110 90" style={{ opacity: Math.min(g * 1.5, 1), transform: `scale(${0.6 + 0.4 * Math.min(g, 1.05)})` }}>
    <path d="M8 30 L55 6 L102 30 Z" fill="#000" stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
    {[24, 44, 64, 84].map((x) => (
      <line key={x} x1={x} x2={x} y1={36} y2={70} stroke="#fff" strokeWidth={5} />
    ))}
    <line x1={6} x2={104} y1={80} y2={80} stroke="#fff" strokeWidth={5} />
  </svg>
);

// ------------------------------------------------------------------ 1. Hook: dos medallas Nobel y el contador en rojo
const Hook: React.FC<P> = ({ t }) => {
  const valor = L(t, 0, EV["4600"] + 0.6, 1.2e9, 4.6e9, (u) => 1 - Math.pow(1 - u, 2));
  return (
    <>
      <Foco x={ANCHO / 2} y={1010} w={760} h={140} o={0.12} />
      <CamaraTiembla t={t} t0={EV["4600"] - 0.05} a={0.015}>
        <Medalla x={410} y={820} g={muelle(t, -0.5, 200, 13)} giro={-7 + 3 * Math.sin(t * 2)} />
        <Medalla x={670} y={820} g={muelle(t, -0.35, 200, 13)} giro={7 + 3 * Math.sin(t * 2 + 1)} />
      </CamaraTiembla>
      <div style={{ position: "absolute", top: 1140, left: 0, width: ANCHO, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 84, color: ROJO, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em", textShadow: "0 0 30px rgba(255,77,94,0.45)" }}>{`−${euros(valor)} $`}</div>
      <FlashRojo t={t} t0={EV["4600"] - 0.05} o={0.12} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: la curva que sube +40 % · la pizarra de fórmulas · ×25 prestado
const s1 = inicio("uno");
const cPizarra = EV.modelos - 0.4;
const SUBE = [0.05, 0.12, 0.1, 0.22, 0.3, 0.27, 0.42, 0.5, 0.48, 0.66, 0.78, 0.92];
const PIZ = { c: [0.0, -0.15, -0.6] as V3, w: 1.3, h: 0.8 };
const FORMULAS = ["σ = √ Σ(x − μ)² / n", "VaR 99 % = 2,33 · σ", "P(pérdida grande) ≈ 0"];
const Uno: React.FC<P> = ({ t, s, e }) => {
  if (t < cPizarra) {
    const prog = L(t, s + 0.1, EV["40"], 0.1, 1, (u) => u);
    const x0 = 140;
    const x1 = 940;
    const y0 = 1080;
    const y1 = 560;
    const n = SUBE.length;
    const k = Math.floor(prog * (n - 1));
    const pts = SUBE.slice(0, k + 1).map((v, i) => [x0 + ((x1 - x0) * i) / (n - 1), y0 - (y0 - y1) * v]);
    const ult = pts[pts.length - 1];
    return (
      <>
        <Foco x={ANCHO / 2} y={1110} w={900} h={140} o={0.08} />
        <Titulo t={t} t0={EV.capital - 0.4} texto="LONG-TERM CAPITAL" />
        <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
          <line x1={x0} x2={x1} y1={y0 + 40} y2={y0 + 40} stroke="#fff" strokeWidth={2} opacity={0.4} />
          <polyline points={pts.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke={VERDE} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={ult[0]} cy={ult[1]} r={13} fill={VERDE} style={{ filter: `drop-shadow(0 0 12px ${VERDE})` }} />
        </svg>
        {t > EV["40"] - 0.2 && <div style={{ position: "absolute", left: ult[0], top: ult[1] - 40, transform: "translate(-90%, -100%)", fontFamily: SANS, fontWeight: 800, fontSize: 90, color: VERDE }}>+40 %</div>}
      </>
    );
  }
  const cam = orbita([0, -0.25, -0.3], L(t, cPizarra, e, 3.9, 3.7), 0, 0.06, { apertura: 4, centroY: 880 });
  const tr: Trazo[] = [];
  horizonte(tr, -0.65);
  pizarra(tr, PIZ.c, PIZ.w, PIZ.h);
  const pr = proyector(cam);
  const a = pr([PIZ.c[0] - PIZ.w / 2 + 0.07, PIZ.c[1] + PIZ.h / 2 - 0.07, PIZ.c[2]]);
  const lineas = Math.floor(L(t, cPizarra + 0.2, EV.prestado - 0.6, 1, FORMULAS.length + 0.99, (u) => u));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: a.x + 20, top: a.y + 24, display: "flex", flexDirection: "column", gap: 30 }}>
        {FORMULAS.slice(0, lineas).map((f, i) => (
          <span key={i} style={{ fontFamily: "monospace", fontSize: 46, color: i === 2 ? ROJO : "#fff", whiteSpace: "nowrap" }}>{f}</span>
        ))}
      </div>
      <Ficha t={t} t0={EV.prestado - 0.35} texto="×25" color={ROJO} size={120} x={ANCHO / 2} y={1210} sub="CON DINERO PRESTADO" />
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: la campana: una pérdida grande, «casi imposible»
const s2 = inicio("dos");
const Dos: React.FC<P> = ({ t, s }) => (
  <>
    <Titulo t={t} t0={s + 0.05} texto="LO QUE DECÍAN SUS MODELOS" />
    <Campana marca={L(t, EV.imposible - 0.6, EV.imposible - 0.2, 0, 1)} bola={0} />
  </>
);

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

// ------------------------------------------------------------------ 5. Tres: Moscú e IMPAGO · la bola cae en la cola · 14 bancos y 3.600 M
const s3 = inicio("tres");
const cBola = EV.esperaba - 1.3;
const cBancos = EV.reserva - 0.4;
const Tres: React.FC<P> = (p) => {
  const { t, s } = p;
  if (t < cBola) {
    const cam = orbita([0, -0.4, -0.6], L(t, s, cBola, 4.0, 3.8), 0, 0.08, { apertura: 4, centroY: 1020 });
    const tr: Trazo[] = [];
    horizonte(tr, -0.9);
    cupulas(tr, 0, -1.2, 1.15);
    return (
      <>
        <Foco x={ANCHO / 2} y={1270} w={800} h={130} o={0.12} />
        <CamaraTiembla t={t} t0={EV.deuda - 0.05} a={0.015}>
          <Escena cam={cam} trazos={tr} />
        </CamaraTiembla>
        <Titulo t={t} t0={s + 0.05} texto="AGOSTO 1998 · RUSIA" />
        <Sello t={t} t0={EV.deuda - 0.15} texto="IMPAGO" top={1080} size={110} />
        <FlashRojo t={t} t0={EV.deuda - 0.05} o={0.12} />
      </>
    );
  }
  if (t < cBancos) {
    return (
      <>
        <CamaraTiembla t={t} t0={EV.esperaba} a={0.02}>
          <Campana marca={1} bola={L(t, EV.esperaba - 0.7, EV.esperaba, 0, 1)} />
        </CamaraTiembla>
        <Titulo t={t} t0={cBola + 0.05} texto="Y PASA" color={ROJO} />
        <FlashRojo t={t} t0={EV.esperaba} o={0.16} />
      </>
    );
  }
  return (
    <>
      <Titulo t={t} t0={cBancos + 0.05} texto="RESERVA FEDERAL + 14 BANCOS" />
      <div style={{ position: "absolute", left: 140, top: 520, width: 800, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 30, justifyItems: "center" }}>
        {Array.from({ length: 14 }, (_, k) => (
          <Banquito key={k} g={muelle(t, EV["14"] - 0.7 + k * 0.06, 220, 13)} />
        ))}
      </div>
      <Ficha t={t} t0={EV["3600"] - 0.3} texto="3.600 M $" color={ROJO} size={120} x={ANCHO / 2} y={1010} sub="DE RESCATE" />
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: si mañana pasa lo peor, ¿sigo vivo? Si no, baja el tamaño
const Giro: React.FC<P> = ({ t }) => {
  const g = muelle(t, EV.solucion - 0.2, 220, 14);
  const no = t > EV.vivo + 0.1;
  const encoge = L(t, EV.vivo + 0.3, EV.tamano, 1, 0.45, (u) => 1 - Math.pow(1 - u, 2));
  return (
    <>
      <Foco x={ANCHO / 2} y={1200} w={800} h={130} o={0.1} />
      <div style={{ position: "absolute", left: 150, top: 470, width: 780, padding: "34px 30px", borderRadius: 30, border: "3px solid rgba(255,255,255,0.85)", background: "rgba(0,0,0,0.9)", color: "#fff", textAlign: "center", opacity: Math.min(g * 1.5, 1), transform: `scale(${0.88 + 0.12 * Math.min(g, 1.04)})` }}>
        <div style={{ ...mono(30, 0.6), marginBottom: 16 }}>ANTES DE ENTRAR</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 62, lineHeight: 1.1 }}>
          Si pasa lo peor,
          <br />
          ¿sigo vivo?
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 30, marginTop: 28, opacity: L(t, EV.peor, EV.peor + 0.3, 0, 1) }}>
          <span style={{ ...mono(46), fontWeight: 800, padding: "8px 40px", borderRadius: 14, border: `3px solid ${VERDE}`, color: VERDE, opacity: no ? 0.3 : 1 }}>SÍ</span>
          <span style={{ ...mono(46), fontWeight: 800, padding: "8px 40px", borderRadius: 14, border: `3px solid ${ROJO}`, color: no ? "#000" : ROJO, background: no ? ROJO : "transparent" }}>NO</span>
        </div>
      </div>
      {t > EV.vivo + 0.25 && (
        <div style={{ position: "absolute", left: ANCHO / 2, top: 1100, transform: "translate(-50%, -50%)", display: "flex", alignItems: "center", gap: 30 }}>
          <div style={{ width: 190 * encoge, height: 190 * encoge, border: `4px solid ${VERDE}`, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", ...mono(34 * Math.max(encoge, 0.65)), fontWeight: 800, color: VERDE }}>TAMAÑO</div>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 60, color: VERDE }}>↓</span>
        </div>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 7. Cierre de conversión
const Cierre: React.FC<P> = (p) => <CierreComenta {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tCuenta={EV.auditada} mensaje="Así controlo yo lo peor ↓" />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["nobel", VERDE], ["4600", ROJO], ["40", VERDE], ["prestado", ROJO], ["imposible", ROJO], "sígueme", ["deuda", ROJO], "esperaba", "14", ["3600", ROJO], ["solución", VERDE], "peor", ["vivo", VERDE], "tamaño", "bot", ["auditada", VERDE]]);

const GANCHO = { lineas: ["Un fondo con *2_Nobel*", "perdió *4.600_millones*"], hasta: EV.meses + 0.45, colores: [VERDE, ROJO] };
export const Ltcm: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/ltcm_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.1} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} />
);
