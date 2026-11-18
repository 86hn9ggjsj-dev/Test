// Reel 5-30-10 «dopamina» "Mueves el stop a la entrada para no perder. Y por eso pierdes" (~32 s), con stickman (es «tú»)
// delante de un gráfico grande. Fotograma 0: el stickman arrastra la línea roja del stop hasta la entrada y aparece el
// candado «0 €»; el candado se rompe. Después: el precio va a favor, sube el stop, el precio vuelve, le saca a 0 € y se va
// al objetivo sin él (manos a la cabeza); el zigzag (avanza / retrocede) que toca la entrada; y la regla con la regla de
// medir: el stop sube a la entrada solo cuando el precio ha ido a favor lo mismo que arriesgas. Cierre en el móvil.
// Tiempos en src/gen/breakeven.json (scripts/breakeven.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/breakeven.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { ORO, ROJO, VERDE } from "../Bot/kit";
import { cuerpoEn, Stick } from "../Bot/stick";
import { MANOS_CABEZA } from "../Bot/comun";
import { CamaraTiembla, Sello } from "../Bot/historia";
import { Foco } from "../Bot/ui2d";
import { Marca, Rotulito } from "../Bot/v3";
import { CierreMovil, Ficha3D, TarjetaAuditada } from "../Bot/dopa";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const BREAKEVEN_FPS = datos.fps;
export const BREAKEVEN_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const min1 = (g: number, m = 1) => Math.min(g, m);

// ------------------------------------------------------------------ gráfico: niveles en R (0 = entrada, −1 = stop, +2,5 = objetivo)
const X0 = 150;
const X1 = 950;
const Y_ENT = 900;
const R_PX = 136;
const yR = (r: number) => Y_ENT - r * R_PX;
type Pt = [number, number]; // [u 0…1, precio en R]
const valor = (pts: Pt[], u: number) => {
  for (let i = 1; i < pts.length; i++) {
    if (u <= pts[i][0]) {
      const [u0, v0] = pts[i - 1];
      const [u1, v1] = pts[i];
      const k = (u - u0) / (u1 - u0 || 1);
      return v0 + (v1 - v0) * k + 0.06 * Math.sin(u * 90) * Math.sin(k * Math.PI);
    }
  }
  return pts[pts.length - 1][1];
};
const camino = (pts: Pt[], u0: number, u1: number) => {
  const out: string[] = [];
  for (let u = u0; u <= u1 + 1e-6; u += 0.005) out.push(`${(X0 + u * (X1 - X0)).toFixed(1)},${yR(valor(pts, u)).toFixed(1)}`);
  return out.join(" ");
};
// El rótulo del stop va debajo a la izquierda para no pisar el de la entrada cuando las dos líneas coinciden
const Linea: React.FC<{ y: number; color: string; texto: string; dash?: boolean; o?: number; ancho?: number; abajo?: boolean }> = ({ y, color, texto, dash, o = 1, ancho = 5, abajo }) => (
  <div style={{ opacity: o }}>
    <div style={{ position: "absolute", left: X0 - 20, width: X1 - X0 + 40, top: y - ancho / 2, height: 0, borderTop: `${ancho}px ${dash ? "dashed" : "solid"} ${color}`, boxShadow: dash ? undefined : `0 0 16px ${color}` }} />
    <div style={{ position: "absolute", left: abajo ? X0 - 10 : X1 - 400, width: 400, top: abajo ? y + 12 : y - 52, textAlign: abajo ? "left" : "right", ...mono(34), fontWeight: 800, color }}>{texto}</div>
  </div>
);
const Candado: React.FC<{ x: number; y: number; g: number; roto: number }> = ({ x, y, g, roto }) => (
  <div style={{ position: "absolute", left: x - 130, top: y - 150, width: 260, height: 300, transform: `scale(${0.5 + 0.5 * min1(g, 1.1)})`, opacity: min1(g * 2) }}>
    <svg width={260} height={300} viewBox="0 0 100 115" style={{ overflow: "visible", filter: `drop-shadow(0 0 22px ${roto > 0.5 ? ROJO : VERDE})` }}>
      <path d="M28 52 L28 34 A22 22 0 0 1 72 34 L72 52" fill="none" stroke={roto > 0.5 ? ROJO : VERDE} strokeWidth={8} strokeLinecap="round" />
      <rect x={12} y={50} width={76} height={60} rx={10} fill="#000" stroke={roto > 0.5 ? ROJO : VERDE} strokeWidth={6} />
      <text x={50} y={90} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={26} fill={roto > 0.5 ? ROJO : VERDE}>0 €</text>
      {roto > 0 && <path d={`M30 50 L44 ${50 + 30 * roto} L38 ${60 + 30 * roto} L56 ${110 * roto}`} fill="none" stroke={ROJO} strokeWidth={5} strokeLinecap="round" />}
    </svg>
  </div>
);

// ------------------------------------------------------------------ 1. Hook: arrastra el stop a la entrada · candado 0 € · se rompe
const Hook: React.FC<P> = ({ t, s }) => {
  const sube = L(t, 0.15, 1.3, 0, 1);
  const c = cuerpoEn(t, [[0.05, { mDx: 0.4, mDy: 0.05, cejas: 0.5, boca: 0.2, mira: 0.6 }], [1.4, { mDx: 0.15, mDy: -0.52, boca: 0.9, ojos: 0.6, cejas: 0 }], [EV.pierdes - 0.1, { boca: -0.6, cejas: -1, ojos: 1.3, abre: 0.6 }]], {}, s - 0.5);
  return (
    <CamaraTiembla t={t} t0={EV.pierdes} a={0.02}>
      <Linea y={Y_ENT} color="#fff" texto="ENTRADA" dash />
      <Linea y={yR(-1) + (Y_ENT - yR(-1)) * sube} color={ROJO} texto={sube > 0.95 ? "STOP = ENTRADA" : "STOP"} abajo />
      <Foco x={250} y={1400} w={360} h={70} o={0.15} />
      <Stick c={c} ox={250} oy={1400} s={200} t={t} />
      <Candado x={740} y={640} g={muelle(t, EV.entrada, 220, 12)} roto={L(t, EV.pierdes - 0.05, EV.pierdes + 0.25, 0, 1)} />
    </CamaraTiembla>
  );
};

// ------------------------------------------------------------------ 2. Uno: va a favor · sube el stop · vuelve · fuera a 0 € · se va al objetivo sin ti
const UNO: Pt[] = [[0, 0], [0.3, 0.75], [0.55, -0.02], [0.62, 0.3], [1, 2.5]];
const Uno: React.FC<P> = ({ t, s }) => {
  const u = L(t, s + 0.2, EV.objetivo, 0, 1, (v) => v);
  const uFuera = 0.55;
  const fuera = u >= uFuera;
  const stopSube = L(t, EV.subes - 0.1, EV.entrada2, 0, 1);
  const c = cuerpoEn(t, [[EV.subes - 0.1, { mDx: 0.45, mDy: 0.0, mira: 0.7 }], [EV.puedes - 0.2, { mDx: 0.15, mDy: -0.52, boca: 0.9, ojos: 0.55 }], [EV.cero - 0.1, { boca: -0.5, cejas: -0.8, ojos: 1.2 }], [EV.directo, { ...MANOS_CABEZA }]], {}, s - 0.3);
  const xHead = X0 + Math.min(u, uFuera) * (X1 - X0);
  return (
    <>
      <Linea y={yR(2.5)} color={VERDE} texto="OBJETIVO" dash o={0.9} />
      <Linea y={Y_ENT} color="#fff" texto="ENTRADA" dash />
      <Linea y={yR(-1) + (Y_ENT - yR(-1)) * stopSube} color={ROJO} texto="STOP" abajo />
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
        <polyline points={camino(UNO, 0, Math.min(u, uFuera))} fill="none" stroke="#fff" strokeWidth={7} strokeLinejoin="round" />
        {fuera && <polyline points={camino(UNO, uFuera, u)} fill="none" stroke={VERDE} strokeWidth={7} strokeDasharray="16 12" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 10px ${VERDE})` }} />}
        {!fuera && <circle cx={xHead} cy={yR(valor(UNO, u))} r={14} fill="#fff" />}
      </svg>
      {fuera && <Sello t={t} t0={EV.cero - 0.05} texto="FUERA · 0 €" top={Y_ENT + 30} color={ROJO} size={70} />}
      {u > 0.97 && <div style={{ position: "absolute", left: X1 - 340, top: yR(2.5) - 130, width: 340, textAlign: "right", ...mono(44), fontWeight: 800, color: VERDE, transform: `scale(${0.6 + 0.4 * min1(muelle(t, EV.objetivo - 0.05, 240, 12), 1.1)})`, transformOrigin: "100% 50%" }}>SIN TI ✓</div>}
      <Foco x={250} y={1400} w={360} h={70} o={0.15} />
      <Stick c={c} ox={250} oy={1400} s={200} t={t} />
      {t > EV.puedes - 0.2 && t < EV.cero && <div style={{ position: "absolute", left: 330, top: 1090, ...mono(34), fontWeight: 800, padding: "10px 18px", borderRadius: 16, border: "3px solid #fff", background: "#000", transform: `scale(${0.6 + 0.4 * min1(muelle(t, EV.puedes - 0.2, 240, 12), 1.1)})` }}>«YA NO PIERDO»</div>}
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

// ------------------------------------------------------------------ 4. Dos: el precio no va en línea recta · cada retroceso toca la entrada
const ZIG: Pt[] = [[0, 0], [0.16, 0.9], [0.27, -0.03], [0.42, 1.3], [0.52, 0.55], [0.68, 1.9], [0.78, 1.15], [1, 2.6]];
const Dos: React.FC<P> = ({ t, s }) => {
  const u = L(t, s + 0.2, EV.echa - 0.2, 0, 1, (v) => v);
  const linea = L(t, EV.entrada3 - 0.3, EV.entrada3, 0, 1);
  return (
    <>
      <Linea y={Y_ENT} color={linea > 0.5 ? ROJO : "#fff"} texto={linea > 0.5 ? "STOP EN LA ENTRADA" : "ENTRADA"} dash={linea < 0.5} abajo />
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
        <polyline points={camino(ZIG, 0, u)} fill="none" stroke="#fff" strokeWidth={7} strokeLinejoin="round" />
        {t > EV.avanza - 0.1 && <path d={`M${X0 + 0.04 * 800} ${yR(0.1)} L${X0 + 0.14 * 800} ${yR(0.85)}`} stroke={VERDE} strokeWidth={8} strokeLinecap="round" markerEnd="" opacity={L(t, EV.avanza - 0.1, EV.avanza + 0.1, 0, 1)} />}
      </svg>
      {t > EV.avanza - 0.1 && <div style={{ position: "absolute", left: X0 - 10, top: yR(1.4), ...mono(40), fontWeight: 800, color: VERDE, opacity: L(t, EV.avanza - 0.1, EV.avanza + 0.1, 0, 1) }}>AVANZA ↑</div>}
      {t > EV.retrocede - 0.1 && <div style={{ position: "absolute", left: X0 + 0.2 * 800, top: yR(-0.6), ...mono(40), fontWeight: 800, color: ROJO, opacity: L(t, EV.retrocede - 0.1, EV.retrocede + 0.1, 0, 1) }}>RETROCEDE ↓</div>}
      {linea > 0.5 && <Marca t={t} t0={EV.retroceso} x={X0 + 0.27 * 800} y={Y_ENT} size={110} color={ROJO} tipo="no" />}
      <Sello t={t} t0={EV.echa - 0.1} texto="TE ECHA" top={1060} color={ROJO} size={90} />
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: la regla con la regla de medir (+1 R a favor → stop a la entrada)
const SUBE: Pt[] = [[0, 0], [0.25, 0.45], [0.35, 0.2], [0.7, 1.05], [0.78, 0.85], [1, 1.35]];
const Giro: React.FC<P> = ({ t, s }) => {
  const u = L(t, EV.muevas, EV.arriesgas + 0.2, 0, 1, (v) => v);
  const cruza = t >= EV.arriesgas - 0.05;
  const stop = L(t, EV.arriesgas - 0.05, EV.arriesgas + 0.4, 0, 1);
  const verde = muelle(t, EV.favor2 - 0.1, 220, 13);
  return (
    <>
      <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" top={330} />
      <Linea y={Y_ENT} color="#fff" texto="ENTRADA" dash />
      <Linea y={yR(-1) + (Y_ENT - yR(-1)) * stop} color={ROJO} texto={stop > 0.9 ? "STOP → ENTRADA ✓" : "STOP"} abajo />
      {verde > 0.01 && <Linea y={yR(1)} color={VERDE} texto="+1 R" dash o={min1(verde)} />}
      {/* regla de medir: lo que arriesgas (rojo) y lo mismo a favor (verde) */}
      <div style={{ position: "absolute", left: X0 - 10, top: Y_ENT, width: 22, height: R_PX, borderTop: `5px solid ${ROJO}`, borderBottom: `5px solid ${ROJO}`, borderLeft: `5px solid ${ROJO}`, opacity: L(t, s, s + 0.3, 0, 1) }} />
      <div style={{ position: "absolute", left: X0 + 30, top: Y_ENT + R_PX - 48, ...mono(34), fontWeight: 800, color: ROJO, opacity: L(t, s, s + 0.3, 0, 1) }}>ARRIESGAS</div>
      {verde > 0.01 && (
        <>
          <div style={{ position: "absolute", left: X0 - 10, top: yR(1), width: 22, height: R_PX, borderTop: `5px solid ${VERDE}`, borderBottom: `5px solid ${VERDE}`, borderLeft: `5px solid ${VERDE}`, opacity: min1(verde) }} />
          <div style={{ position: "absolute", left: X0 + 30, top: yR(0.5) - 22, ...mono(34), fontWeight: 800, color: VERDE, opacity: min1(verde) }}>LO MISMO A FAVOR</div>
        </>
      )}
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
        <polyline points={camino(SUBE, 0, u).split(" ").map((p) => { const [x, y] = p.split(",").map(Number); return `${X0 + 300 + (x - X0) * 0.6},${y}`; }).join(" ")} fill="none" stroke={cruza ? VERDE : "#fff"} strokeWidth={7} strokeLinejoin="round" />
      </svg>
      {cruza && <Ficha3D t={t} t0={EV.arriesgas - 0.05} texto="AHORA SÍ" x={600} y={500} size={110} color={VERDE} />}
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: comenta BOT en el móvil → mensaje directo → cuenta auditada
const Cierre: React.FC<P> = (p) => <CierreMovil {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tFinal={EV.auditada} palabra="BOT" mensaje="Te explico cómo lo hago ↓" final={<TarjetaAuditada />} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["entrada", ORO], ["perder", VERDE], ["pierdes", ROJO], ["favor", VERDE], "subes", ["cero", ROJO], ["objetivo", VERDE], "sígueme", "arreglo", ["avanza", VERDE], ["retrocede", ROJO], ["echa", ROJO], "regla", ["arriesgas", VERDE], "llegado", "pasado", "bot", ["auditada", VERDE]]);
const GOLPES: [number, string?][] = [[0.02], [EV.entrada, VERDE], [EV.pierdes, ROJO], [EV.favor, VERDE], [EV.subes], [EV.puedes, VERDE], [EV.vuelve], [EV.cero, ROJO], [EV.objetivo, VERDE], [EV.recta], [EV.avanza, VERDE], [EV.retrocede, ROJO], [EV.retroceso, ROJO], [EV.echa, ROJO], [EV.regla], [EV.favor2, VERDE], [EV.arriesgas, VERDE], [EV.llegado], [EV.bot], [EV.privado], [EV.auditada, VERDE]];

const GANCHO = { lineas: ["Stop a la entrada", "para no perder… *y_pierdes*"], hasta: inicio("uno") - 0.05, color: ROJO };
export const Breakeven: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/breakeven_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.08} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} />
);
