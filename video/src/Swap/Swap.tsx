// Reel 5-30-10 "Marcos acertó 3 meses seguidos. Y casi todo se lo quedó el bróker" (~41 s), en ESTILO LIMPIO: un escenario
// sencillo por escena (personaje, un objeto y una cifra), sin partículas ni rejillas y un solo texto a la vez.
// Marcos (gorra) en su escritorio con +500 € que se van al bróker; 1.000 € que mueven 30.000 €; la línea de 90 días que
// sube, baja y vuelve a subir; el «sígueme» encima; de noche, una moneda cada noche al bróker hasta −450 € y un día ×3;
// la ficha del activo con el swap; y el cierre de conversión. Tiempos en src/gen/swap.json (scripts/swap.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/swap.json";
import { ANCHO, SANS } from "../Viral/util";
import { euros, L, mono, muelle } from "../Bot/piezas";
import { Escena, orbita, proyector, Trazo } from "../Bot/tres";
import { ROJO, VERDE } from "../Bot/kit";
import { cuerpoEn, Estado } from "../Bot/stick";
import { anclaje, BRAZOS_ARRIBA, MANOS_CABEZA, StickMundo } from "../Bot/comun";
import { FlashVerde } from "../Bot/historia";
import { DESPACHO, escritorioLimpio } from "../Bot/decorados";
import { Ficha, Foco, Moneda, PantallaPC, Rotulo } from "../Bot/ui2d";
import { CierreComenta } from "../Bot/conversion";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const SWAP_FPS = datos.fps;
export const SWAP_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;

// ------------------------------------------------------------------ piezas
const camDesp = (t: number, s: number, e: number, d0: number, d1: number) => orbita([0.42, -0.35, -0.35], L(t, s, e, d0, d1), -0.06, 0.1, { apertura: 4, centroY: 980 });
const ANCLA: [number, number, number] = [0.02, -1, -0.15];
// Pantalla: solo el resultado, grande
const Resultado: React.FC<{ w: number; h: number; pyg: number }> = ({ w, h, pyg }) => {
  const col = pyg >= 0 ? VERDE : ROJO;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: h * 0.36, color: col, textShadow: `0 0 30px ${col}66`, letterSpacing: "-0.02em" }}>{`${pyg >= 0 ? "+" : "−"}${euros(Math.abs(pyg))} €`}</span>
      <span style={{ position: "absolute", left: w * 0.05, top: h * 0.07, ...mono(h * 0.07, 0.5) }}>EUR/USD</span>
    </div>
  );
};
// El bróker: un edificio de banco limpio con su nombre
const BANCO: [number, number] = [880, 1190];
const BancoIcono: React.FC<{ brillo?: number; cifra?: React.ReactNode }> = ({ brillo = 0, cifra }) => (
  <div style={{ position: "absolute", left: BANCO[0], top: BANCO[1], transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, filter: brillo > 0.02 ? `drop-shadow(0 0 ${22 * brillo}px rgba(255,77,94,0.8))` : undefined }}>
    <svg width={200} height={164} viewBox="0 0 110 90">
      <path d="M8 30 L55 6 L102 30 Z" fill="#000" stroke="#fff" strokeWidth={3} strokeLinejoin="round" />
      {[22, 42, 62, 82].map((x) => (
        <line key={x} x1={x} x2={x} y1={36} y2={70} stroke="#fff" strokeWidth={4} />
      ))}
      <line x1={8} x2={102} y1={76} y2={76} stroke="#fff" strokeWidth={4} />
      <line x1={2} x2={108} y1={85} y2={85} stroke="#fff" strokeWidth={4} />
    </svg>
    <span style={{ ...mono(30), fontWeight: 800, letterSpacing: "0.12em" }}>BRÓKER</span>
    {cifra}
  </div>
);

// ------------------------------------------------------------------ 1. Hook: +500 € que se van al bróker
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = camDesp(t, s, e, 4.4, 4.2);
  const tr: Trazo[] = [];
  escritorioLimpio(tr, t);
  const c = cuerpoEn(t, [[0, { ...BRAZOS_ARRIBA, boca: 1, abre: 0.5, ojos: 1.2, mira: 0.6 }], [EV.broker - 0.4, { ...MANOS_CABEZA, mira: 0.8 }]], { ...BRAZOS_ARRIBA, boca: 1 }, -0.5);
  const a = anclaje(cam, ANCLA, 0.48);
  const pr = proyector(cam);
  const qm = pr(DESPACHO.MON.c);
  const pyg = Math.round(L(t, 0.3, EV.broker + 0.3, 500, 50, (u) => u) / 10) * 10;
  return (
    <>
      <Foco x={a.ox + 120} y={a.oy} w={760} h={150} />
      <Escena cam={cam} trazos={tr} />
      <PantallaPC cam={cam}>{(w, h) => <Resultado w={w} h={h} pyg={pyg} />}</PantallaPC>
      <BancoIcono brillo={0.5} />
      {Array.from({ length: 8 }, (_, i) => (
        <Moneda key={i} t={t} t0={-0.2 + i * 0.45} t1={0.55 + i * 0.45} a={[qm.x, qm.y]} b={[BANCO[0], BANCO[1] - 40]} color={ROJO} />
      ))}
      <StickMundo a={a} c={c} t={t} gorra />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: una operación de 30.000 € con 1.000 € de garantía (×30)
const Uno: React.FC<P> = ({ t }) => (
  <>
    <Foco x={ANCHO / 2} y={1120} w={900} h={160} o={0.1} />
    <Ficha t={t} t0={EV["30000"] - 0.35} texto="30.000 €" color={ROJO} size={140} x={ANCHO / 2} y={600} sub="LA OPERACIÓN" />
    <Rotulo x={ANCHO / 2} y={790} size={56} color={ROJO} o={L(t, EV["1000"] + 0.2, EV["1000"] + 0.5, 0, 1)}>↑ ×30</Rotulo>
    <Ficha t={t} t0={EV["1000"] - 0.3} texto="1.000 €" size={100} x={ANCHO / 2} y={960} sub="TU GARANTÍA" />
  </>
);

// ------------------------------------------------------------------ 3. Dos: 90 días que suben, bajan y vuelven a subir · +500 €
const s2 = inicio("dos");
const LINEA = [0.2, 0.5, 0.42, 0.62, 0.3, 0.18, 0.28, 0.5, 0.46, 0.68, 0.74, 0.86];
const Dos: React.FC<P> = ({ t, s }) => {
  const prog = L(t, s, EV.tres + 0.3, 0.08, 1, (u) => u);
  const n = LINEA.length;
  const x0 = 140;
  const x1 = 940;
  const y0 = 1080;
  const y1 = 560;
  const pts = LINEA.map((v, i) => [x0 + ((x1 - x0) * i) / (n - 1), y0 - (y0 - y1) * v] as [number, number]);
  const hasta = prog * (n - 1);
  const k = Math.floor(hasta);
  const visibles = pts.slice(0, k + 1);
  if (k < n - 1) {
    const u = hasta - k;
    visibles.push([pts[k][0] + (pts[k + 1][0] - pts[k][0]) * u, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * u]);
  }
  const ult = visibles[visibles.length - 1];
  const dias = Math.min(90, Math.max(1, Math.round(prog * 90)));
  const cerrada = t > EV["500"] - 0.2;
  return (
    <>
      <Foco x={ANCHO / 2} y={1100} w={900} h={140} o={0.08} />
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={x0} x2={x1} y1={y0 + 40} y2={y0 + 40} stroke="#fff" strokeWidth={2} opacity={0.4} />
        <polyline points={visibles.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke="#fff" strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={ult[0]} cy={ult[1]} r={13} fill={cerrada ? VERDE : "#fff"} style={{ filter: `drop-shadow(0 0 12px ${cerrada ? VERDE : "#fff"})` }} />
      </svg>
      <div style={{ position: "absolute", left: x0, top: 400, ...mono(40), fontWeight: 700, opacity: 0.85 }}>{`DÍA ${dias}`}</div>
      {cerrada && <Rotulo x={Math.min(ult[0], 900)} y={ult[1] - 70} size={64} color={VERDE} ancla="translate(-70%, -50%)">+500 €</Rotulo>}
      <FlashVerde t={t} t0={EV["500"] - 0.1} o={0.1} />
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

// ------------------------------------------------------------------ 5. Tres: de noche, una moneda cada noche al bróker · −450 € · un día ×3
const s3 = inicio("tres");
const cTriple = EV.triple - 2.2;
const Tres: React.FC<P> = ({ t, s, e }) => {
  const cam = camDesp(t, s, e, 4.4, 4.2);
  const tr: Trazo[] = [];
  escritorioLimpio(tr, t, { ventana: "noche" });
  const c: Estado = cuerpoEn(t, [[s, { agacha: 0.8, ojos: 0.3, boca: 0, mIx: -0.15, mIy: -0.52, mDx: 0.15, mDy: -0.52, incl: 0.1, mira: 0 }], [EV.cobra - 0.2, { agacha: 0, ojos: 1.3, cejas: 1, boca: -0.6, abre: 0.5, mira: 0.8, incl: 0 }], [EV["450"] + 0.2, { ...MANOS_CABEZA, mira: 0.8 }]], { agacha: 0.8 }, s - 0.4);
  const a = anclaje(cam, ANCLA, 0.48);
  const qm = proyector(cam)(DESPACHO.MON.c);
  const noches = Math.floor(L(t, s, EV["450"], 0, 90, (u) => u));
  const monedas = Array.from({ length: 12 }, (_, i) => s + 0.2 + i * 0.75).filter((t0) => t0 < cTriple);
  const swapG = muelle(t, EV.swap - 0.3, 220, 13) * (1 - L(t, EV["450"] - 0.6, EV["450"] - 0.3, 0, 1));
  return (
    <>
      <Foco x={a.ox + 120} y={a.oy} w={760} h={150} />
      <Escena cam={cam} trazos={tr} />
      <PantallaPC cam={cam}>{(w, h) => <Resultado w={w} h={h} pyg={500 - noches * 5} />}</PantallaPC>
      <BancoIcono brillo={0.3 + 0.3 * Math.sin(t * 6)} cifra={t > EV["450"] - 0.4 ? <span style={{ ...mono(52), fontWeight: 800, color: ROJO }}>{t > cTriple ? "×3" : "−450 €"}</span> : undefined} />
      {monedas.map((t0, i) => (
        <Moneda key={i} t={t} t0={t0} t1={t0 + 0.7} a={[qm.x, qm.y]} b={[BANCO[0], BANCO[1] - 40]} color={ROJO} />
      ))}
      {t >= cTriple && [0, 1, 2].map((k) => <Moneda key={`t${k}`} t={t} t0={EV.triple - 0.6 + k * 0.14} t1={EV.triple + 0.3 + k * 0.14} a={[qm.x, qm.y]} b={[BANCO[0], BANCO[1] - 40]} color={ROJO} size={66} />)}
      <StickMundo a={a} c={c} t={t} gorra />
      {t < EV.cobra - 0.2 && <Rotulo x={a.ox - 70} y={a.oy - 1.3 * a.s} size={50} o={0.8}>Zzz</Rotulo>}
      {swapG > 0.01 && (
        <div style={{ position: "absolute", top: 400, left: 60, width: 560, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: Math.min(swapG * 1.5, 1), transform: `scale(${0.7 + 0.3 * Math.min(swapG, 1.05)})` }}>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 130, color: ROJO, letterSpacing: "-0.02em" }}>SWAP</span>
          <span style={{ ...mono(32), fontWeight: 700, opacity: 0.85 }}>LO QUE PAGAS CADA NOCHE</span>
        </div>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: la línea del swap en la ficha del activo · si se come el objetivo, no entres
const Giro: React.FC<P> = ({ t, s }) => {
  const g = muelle(t, s + 0.15, 200, 15);
  const resalta = L(t, EV.ficha - 0.3, EV.ficha, 0, 1);
  const compara = muelle(t, EV.objetivo - 0.3, 220, 14);
  const no = muelle(t, EV.entres - 0.2, 260, 12);
  return (
    <>
      <Foco x={ANCHO / 2} y={1180} w={900} h={140} o={0.08} />
      <div style={{ position: "absolute", left: 140, top: 420, width: 800, borderRadius: 30, border: "3px solid rgba(255,255,255,0.85)", background: "rgba(0,0,0,0.9)", padding: "28px 30px", color: "#fff", opacity: Math.min(g * 1.5, 1), transform: `scale(${0.88 + 0.12 * Math.min(g, 1)})` }}>
        <div style={{ ...mono(30, 0.6), marginBottom: 20 }}>EUR/USD · FICHA DEL ACTIVO</div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "18px 20px", borderRadius: 14, border: `3px solid ${resalta > 0.5 ? ROJO : "transparent"}`, background: resalta > 0.5 ? "rgba(255,77,94,0.14)" : "transparent", ...mono(42) }}>
          <span>Swap</span>
          <span style={{ fontWeight: 800, color: ROJO }}>−5,10 € / noche</span>
        </div>
      </div>
      {compara > 0.01 && (
        <div style={{ position: "absolute", left: 140, top: 690, width: 800, display: "flex", gap: 24, opacity: Math.min(compara * 1.5, 1), transform: `scale(${0.85 + 0.15 * Math.min(compara, 1)})` }}>
          {[["OBJETIVO", "+300 €", VERDE], ["SWAP 90 NOCHES", "−450 €", ROJO]].map(([k, v, col]) => (
            <div key={k} style={{ flex: 1, borderRadius: 24, border: `3px solid ${col}`, padding: "22px 0", textAlign: "center", background: "#000" }}>
              <div style={mono(28, 0.7)}>{k}</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 76, color: col }}>{v}</div>
            </div>
          ))}
        </div>
      )}
      {no > 0.01 && (
        <div style={{ position: "absolute", top: 1010, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 84, color: ROJO, opacity: Math.min(no * 1.5, 1), transform: `scale(${1.6 - 0.6 * Math.min(no, 1)})` }}>NO ENTRES</span>
        </div>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 7. Cierre de conversión
const Cierre: React.FC<P> = (p) => <CierreComenta {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tCuenta={EV.auditada} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["bróker", ROJO], "30000", "1000", ["500", VERDE], "sígueme", ["swap", ROJO], ["450", ROJO], ["triple", ROJO], ["solución", VERDE], "objetivo", ["entres", ROJO], "bot", ["auditada", VERDE]]);

const GANCHO = { lineas: ["Acertó *3_meses*", "y se lo quedó *el_bróker*"], hasta: EV.broker + 0.45, colores: [VERDE, ROJO] };
export const Swap: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/swap_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.1} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} />
);
