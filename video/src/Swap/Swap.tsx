// Reel 5-30-10 "Marcos acertó 3 meses seguidos. Y casi todo se lo quedó el bróker" (~41 s). Marcos (gorra) celebra +500 €
// en su despacho mientras las monedas vuelan al edificio del bróker; 1.000 € de garantía que mueven 30.000 €; el
// calendario que pasa 90 días con el gráfico subiendo y bajando; el «sígueme» encima de la escena; noche tras noche una
// moneda sale hacia el bróker (swap) hasta −450 € y un día ×3; la ficha del activo con la línea del swap; y el cierre de
// conversión. Tiempos en src/gen/swap.json (scripts/swap.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/swap.json";
import { ANCHO, SANS } from "../Viral/util";
import { euros, L, mono, muelle } from "../Bot/piezas";
import { Camara, Escena, orbita, polvo, proyector, Trazo } from "../Bot/tres";
import { ROJO, VERDE } from "../Bot/kit";
import { cuerpoEn, Estado } from "../Bot/stick";
import { anclaje, BRAZOS_ARRIBA, ENCOGE, FlashRojo, MANOS_CABEZA, StickMundo } from "../Bot/comun";
import { FlashVerde } from "../Bot/historia";
import { bancoEdificio, DESPACHO, despachoCasa } from "../Bot/decorados";
import { Abajo, Arriba, Ficha, Moneda, PantallaPC, Pildora, Rotulo } from "../Bot/ui2d";
import { CierreComenta } from "../Bot/conversion";
import { claves, CtaSeguir, golpe, Montaje, P, sacude } from "../Explica/Montaje";

export const SWAP_FPS = datos.fps;
export const SWAP_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;

// ------------------------------------------------------------------ piezas
const camDesp = (t: number, s: number, e: number, d0: number, d1: number, az0: number, az1: number, tg = -9) =>
  orbita([0.42, -0.35, -0.35], L(t, s, e, d0, d1) - 0.2 * golpe(t, tg), L(t, s, e, az0, az1) + sacude(t, tg, 0.02), 0.1, { apertura: 6, centroY: 980 });
const ANCLA: [number, number, number] = [0.02, -1, -0.15];
// Pantalla con el resultado grande y una curva (sube, baja, sube…)
const CURVA = [0.3, 0.45, 0.4, 0.62, 0.55, 0.35, 0.3, 0.5, 0.48, 0.66, 0.72, 0.8];
const Resultado: React.FC<{ w: number; h: number; pyg: number; n?: number; titulo?: string }> = ({ w, h, pyg, n = CURVA.length, titulo = "EUR/USD" }) => {
  const pts = CURVA.slice(0, Math.max(2, n)).map((v, i) => `${(w * 0.06 + (w * 0.88 * i) / (CURVA.length - 1)).toFixed(1)},${(h * 0.88 - v * h * 0.55).toFixed(1)}`);
  const col = pyg >= 0 ? VERDE : ROJO;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: w * 0.05, top: h * 0.05, ...mono(h * 0.065, 0.6) }}>{titulo}</div>
      <div style={{ position: "absolute", right: w * 0.05, top: h * 0.03, ...mono(h * 0.17), fontWeight: 800, color: col, textShadow: `0 0 20px ${col}88` }}>{`${pyg >= 0 ? "+" : "−"}${euros(Math.abs(pyg))} €`}</div>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <polyline points={pts.join(" ")} fill="none" stroke="#fff" strokeWidth={3} strokeLinejoin="round" />
      </svg>
    </div>
  );
};
// Calendario de pared en 2D
const Calendario: React.FC<{ x: number; y: number; dia: number; s?: number; rojo?: boolean }> = ({ x, y, dia, s = 1, rojo }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, width: 200, borderRadius: 18, border: "4px solid #fff", background: "#000", overflow: "hidden", textAlign: "center" }}>
    <div style={{ background: rojo ? ROJO : "#fff", color: "#000", ...mono(30), fontWeight: 800, padding: "6px 0" }}>DÍA</div>
    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 96, lineHeight: 1.1, color: "#fff", padding: "6px 0 10px" }}>{dia}</div>
  </div>
);

// Edificio del bróker en 2D (frontón, columnas y escalones) donde acaban las monedas
const BANCO: [number, number] = [870, 1240];
const BancoIcono: React.FC<{ t: number; brillo?: number }> = ({ t, brillo = 0 }) => (
  <div style={{ position: "absolute", left: BANCO[0], top: BANCO[1], transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, filter: brillo > 0.02 ? `drop-shadow(0 0 ${24 * brillo}px rgba(255,77,94,0.9))` : undefined }}>
    <svg width={220} height={180} viewBox="0 0 110 90">
      <path d="M8 30 L55 6 L102 30 Z" fill="#000" stroke="#fff" strokeWidth={3} strokeLinejoin="round" />
      {[22, 42, 62, 82].map((x) => (
        <rect key={x} x={x - 4} y={34} width={8} height={36} fill="#000" stroke="#fff" strokeWidth={2.5} />
      ))}
      <rect x={10} y={72} width={90} height={7} fill="#000" stroke="#fff" strokeWidth={2.5} />
      <rect x={4} y={80} width={102} height={7} fill="#000" stroke="#fff" strokeWidth={2.5} />
      <text x={55} y={26} textAnchor="middle" fontFamily="monospace" fontWeight={800} fontSize={12} fill={ROJO}>€</text>
    </svg>
    <span style={{ ...mono(34), fontWeight: 800, padding: "4px 14px", border: "3px solid #fff", borderRadius: 10, background: "#000" }}>BRÓKER</span>
  </div>
);

// ------------------------------------------------------------------ 1. Hook: +500 € y las monedas que se van al bróker
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = camDesp(t, s, e, 4.4, 4.1, -0.12, -0.05);
  const tr: Trazo[] = [...polvo(0.1)];
  despachoCasa(tr, t, { hora: 18 });
  const c = cuerpoEn(t, [[0, { ...BRAZOS_ARRIBA, boca: 1, abre: 0.5, ojos: 1.2, mira: 0.6 }], [EV.broker - 0.4, { ...MANOS_CABEZA, mira: 0.8 }]], { ...BRAZOS_ARRIBA, boca: 1 }, -0.5);
  const a = anclaje(cam, ANCLA, 0.48);
  const pr = proyector(cam);
  const qm = pr([DESPACHO.MON.c[0] + 0.2, DESPACHO.MON.c[1] + 0.12, DESPACHO.MON.c[2]]);
  const pyg = Math.round(L(t, 0.3, EV.broker + 0.3, 500, 50, (u) => u) / 10) * 10;
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <PantallaPC cam={cam}>{(w, h) => <Resultado w={w} h={h} pyg={pyg} />}</PantallaPC>
      <BancoIcono t={t} brillo={0.6} />
      {Array.from({ length: 9 }, (_, i) => (
        <Moneda key={i} t={t} t0={-0.3 + i * 0.42} t1={0.5 + i * 0.42} a={[qm.x, qm.y]} b={[BANCO[0], BANCO[1] - 40]} color={ROJO} />
      ))}
      <StickMundo a={a} c={c} t={t} gorra />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: 1.000 € de garantía mueven una operación de 30.000 €
const s1 = inicio("uno");
const Uno: React.FC<P> = ({ t, s, e }) => {
  const cam = camDesp(t, s, e, 4.2, 4.0, 0.08, 0.02);
  const tr: Trazo[] = [...polvo(0.1)];
  despachoCasa(tr, t, { hora: 9 });
  const c = cuerpoEn(t, [[s, { mDx: 0.38, mDy: -0.1, mira: 0.7, boca: 0.4, cejas: 0.3 }], [EV.correr - 0.3, { mIx: -0.1, mIy: 0.42, mDx: 0.1, mDy: 0.42, mira: 0.3, boca: 0.8, ojos: 0.85, incl: -0.05 }]], { mira: 0.7 }, s - 0.4);
  const a = anclaje(cam, ANCLA, 0.48);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <PantallaPC cam={cam}>{(w, h) => <Resultado w={w} h={h} pyg={0} n={2} />}</PantallaPC>
      <StickMundo a={a} c={c} t={t} gorra />
      <Ficha t={t} t0={EV["1000"] - 0.3} texto="1.000 €" size={90} x={290} y={380} sub="TU DINERO" />
      <Ficha t={t} t0={EV["30000"] - 0.3} texto="30.000 €" color={ROJO} size={110} x={700} y={560} sub="LO QUE MUEVES" />
      {t > EV["1000"] && <Rotulo x={480} y={470} size={60} color={ROJO} o={L(t, EV["1000"], EV["1000"] + 0.3, 0, 1)}>×30</Rotulo>}
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: 90 días: sube, baja, vuelve a subir · +500 €
const s2 = inicio("dos");
const Dos: React.FC<P> = ({ t, s, e }) => {
  const cam = camDesp(t, s, e, 3.9, 3.6, -0.06, 0.04, EV.ganancia - 0.05);
  const tr: Trazo[] = [...polvo(0.1)];
  const dias = Math.min(90, Math.max(1, Math.round(L(t, s, EV.tres + 0.3, 1, 90, (u) => u))));
  despachoCasa(tr, t, { hora: 9 + ((t * 6) % 12), dia: 0.5 + 0.5 * Math.sin(t * 5) });
  const n = Math.round(L(t, s, EV.tres, 2, CURVA.length, (u) => u));
  const cerrada = t > EV["500"] - 0.2;
  const c = cuerpoEn(t, [[s, { mira: 0.7, mDx: 0.15, mDy: -0.52 }], [EV.subio - 0.1, { boca: 0.6, cejas: 0.4 }], [EV.bajo - 0.1, { boca: -0.5, cejas: -0.6, agobio: 0.4 }], [EV.volvio, { boca: 0.4, cejas: 0.2, agobio: 0 }], [EV.ganancia - 0.35, { ...BRAZOS_ARRIBA, boca: 1, abre: 0.5, ojos: 1.2 }]], { mira: 0.7 }, s - 0.4);
  const a = anclaje(cam, ANCLA, 0.48);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <PantallaPC cam={cam}>{(w, h) => <Resultado w={w} h={h} pyg={cerrada ? 500 : Math.round(L(t, s, EV.tres, 0, 420) / 10) * 10 * (t > EV.bajo && t < EV.volvio ? -0.4 : 1)} n={n} />}</PantallaPC>
      <StickMundo a={a} c={c} t={t} gorra />
      <Calendario x={260} y={420} dia={dias} rojo={dias >= 90} s={0.9 + 0.1 * golpe(t, EV.tres - 0.1)} />
      <Abajo top={1200}>
        <Pildora t={t} t0={EV["500"] - 0.25} size={44} color={VERDE}>CERRADA: +500 € ✓</Pildora>
      </Abajo>
      <FlashVerde t={t} t0={EV.ganancia - 0.1} o={0.12} />
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

// ------------------------------------------------------------------ 5. Tres: cada noche una moneda al bróker (swap) · −450 € · un día ×3
const s3 = inicio("tres");
const cTriple = EV.triple - 2.2;
const Tres: React.FC<P> = ({ t, s, e }) => {
  const cam = camDesp(t, s, e, 4.5, 4.2, -0.1, 0.0);
  const tr: Trazo[] = [...polvo(0.1)];
  // Noches que pasan: la ventana alterna luna y sol deprisa
  const ciclo = (t - s) * 1.6;
  const dia = t < cTriple ? Math.max(0, Math.sin(ciclo * Math.PI)) ** 2 : 0;
  despachoCasa(tr, t, { hora: 22 + ((t * 5) % 12), dia, flexo: 1 - dia });
  const c: Estado = cuerpoEn(t, [[s, { agacha: 0.8, ojos: 0.3, boca: 0, mIx: -0.15, mIy: -0.52, mDx: 0.15, mDy: -0.52, incl: 0.1, mira: 0 }], [EV.cobra - 0.2, { agacha: 0, ojos: 1.3, cejas: 1, boca: -0.6, abre: 0.5, mira: 0.8, incl: 0 }], [EV["450"] + 0.2, { ...MANOS_CABEZA, mira: 0.8 }]], { agacha: 0.8 }, s - 0.4);
  const a = anclaje(cam, ANCLA, 0.48);
  const pr = proyector(cam);
  const qm = pr([DESPACHO.MON.c[0] + 0.2, DESPACHO.MON.c[1] + 0.12, DESPACHO.MON.c[2]]);
  const noches = Math.floor(L(t, s, EV["450"], 0, 90, (u) => u));
  const coste = Math.round(noches * 5);
  const monedas = Array.from({ length: 12 }, (_, i) => s + 0.2 + i * 0.75).filter((t0) => t0 < cTriple);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <PantallaPC cam={cam}>{(w, h) => <Resultado w={w} h={h} pyg={500 - coste} titulo="TU GANANCIA" />}</PantallaPC>
      <BancoIcono t={t} brillo={0.4 + 0.4 * Math.sin(t * 6)} />
      {monedas.map((t0, i) => (
        <Moneda key={i} t={t} t0={t0} t1={t0 + 0.7} a={[qm.x, qm.y]} b={[BANCO[0], BANCO[1] - 40]} color={ROJO} />
      ))}
      {t >= cTriple && [0, 1, 2].map((k) => <Moneda key={`t${k}`} t={t} t0={EV.triple - 0.6 + k * 0.12} t1={EV.triple + 0.3 + k * 0.12} a={[qm.x, qm.y]} b={[BANCO[0], BANCO[1] - 40]} color={ROJO} size={70} />)}
      <StickMundo a={a} c={c} t={t} gorra />
      {t < EV.cobra - 0.2 && <Rotulo x={a.ox - 60} y={a.oy - 1.3 * a.s} size={54}>Zzz</Rotulo>}
      <Arriba>
        <Pildora t={t} t0={s + 0.1} size={38} fin={EV.swap - 0.3}>{`NOCHE ${Math.max(1, noches)}`}</Pildora>
        <Pildora t={t} t0={EV.swap - 0.3} size={38} color={ROJO}>SWAP = LO QUE PAGAS CADA NOCHE</Pildora>
      </Arriba>
      <Ficha t={t} t0={EV["450"] - 0.3} texto="−450 €" color={ROJO} size={110} x={420} y={1180} sub="EN 90 NOCHES" fin={cTriple} />
      <Ficha t={t} t0={cTriple + 0.3} texto="×3" color={ROJO} size={120} x={420} y={1180} sub="UN DÍA A LA SEMANA" />
      <FlashRojo t={t} t0={EV.triple - 0.05} o={0.14} />
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: la ficha del activo con el swap · si se come el objetivo, no entres
const sG = inicio("giro");
const FilaFicha: React.FC<{ k: string; v: string; resalta?: number; color?: string }> = ({ k, v, resalta = 0, color = "#fff" }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 18px", borderRadius: 12, background: resalta > 0.5 ? "rgba(255,77,94,0.18)" : "transparent", border: `3px solid ${resalta > 0.5 ? ROJO : "transparent"}`, ...mono(38) }}>
    <span style={{ opacity: 0.75 }}>{k}</span>
    <span style={{ fontWeight: 800, color }}>{v}</span>
  </div>
);
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = camDesp(t, s, e, 4.6, 4.4, 0.0, 0.05);
  const tr: Trazo[] = [...polvo(0.25)];
  despachoCasa(tr, t, { hora: 10 });
  const g = muelle(t, s + 0.15, 200, 15);
  const resalta = L(t, EV.ficha - 0.3, EV.ficha, 0, 1);
  const compara = muelle(t, EV.objetivo - 0.3, 220, 14);
  const no = muelle(t, EV.entres - 0.2, 260, 12);
  return (
    <>
      <AbsoluteFill style={{ filter: "blur(6px)", opacity: 0.6 }}>
        <Escena cam={cam} trazos={tr} />
      </AbsoluteFill>
      <Arriba top={290}>
        <Pildora t={t} t0={EV.solucion - 0.2} size={44} color={VERDE}>LA SOLUCIÓN</Pildora>
      </Arriba>
      <div style={{ position: "absolute", left: 140, top: 400, width: 800, borderRadius: 30, border: "4px solid #fff", background: "rgba(0,0,0,0.94)", padding: "26px 26px 20px", color: "#fff", opacity: Math.min(g * 1.5, 1), transform: `scale(${0.85 + 0.15 * Math.min(g, 1)})` }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, marginBottom: 16 }}>Ficha del activo · EUR/USD</div>
        <FilaFicha k="Spread" v="0,8 pips" />
        <FilaFicha k="Apalancamiento" v="1:30" />
        <FilaFicha k="Swap compra" v="−5,10 € / noche" resalta={resalta} color={ROJO} />
        <FilaFicha k="Swap venta" v="−1,20 € / noche" />
      </div>
      {compara > 0.01 && (
        <div style={{ position: "absolute", left: 140, top: 820, width: 800, display: "flex", gap: 20, opacity: Math.min(compara * 1.5, 1), transform: `scale(${0.8 + 0.2 * Math.min(compara, 1)})` }}>
          <div style={{ flex: 1, borderRadius: 22, border: `4px solid ${VERDE}`, padding: "18px 0", textAlign: "center", background: "#000" }}>
            <div style={mono(28, 0.7)}>OBJETIVO</div>
            <div style={{ ...mono(58), fontWeight: 800, color: VERDE }}>+300 €</div>
          </div>
          <div style={{ flex: 1, borderRadius: 22, border: `4px solid ${ROJO}`, padding: "18px 0", textAlign: "center", background: "#000" }}>
            <div style={mono(28, 0.7)}>SWAP 90 NOCHES</div>
            <div style={{ ...mono(58), fontWeight: 800, color: ROJO }}>−450 €</div>
          </div>
        </div>
      )}
      {no > 0.01 && (
        <div style={{ position: "absolute", top: 1100, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
          <span style={{ ...mono(70), fontWeight: 800, color: ROJO, padding: "8px 30px", border: `6px solid ${ROJO}`, borderRadius: 14, background: "rgba(0,0,0,0.85)", transform: `rotate(-6deg) scale(${2 - Math.min(no, 1.1)})`, opacity: Math.min(no * 1.5, 1) }}>✗ NO ENTRES</span>
        </div>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 7. Cierre de conversión
const Cierre: React.FC<P> = (p) => <CierreComenta {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tCuenta={EV.auditada} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, cierre: Cierre };
export const CLAVES = claves(["seguidos", ["bróker", ROJO], "30000", "1000", "correr", "subió", "bajó", ["500", VERDE], "sígueme", "pequeña", "noche", ["swap", ROJO], ["450", ROJO], ["triple", ROJO], ["solución", VERDE], "ficha", "objetivo", ["entres", ROJO], "llegado", "bot", "privado", ["auditada", VERDE]]);

const GANCHO = { lineas: ["Acertó *3_meses*", "y se lo quedó *el_bróker*"], hasta: EV.broker + 0.45, colores: [VERDE, ROJO] };
export const Swap: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/swap_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.1} empujes={0.05} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} />
);
