// Reel 5-30-10 "Tu peor operación es la que abres justo después de perder" (~36 s). Marcos (gorra) en el despacho de su
// casa: aporrea COMPRAR con −200 € en pantalla desde el fotograma 0; el reloj de pared marca las 10:00 y las 10:02, entra
// con el doble y pega la nota «RECUPERAR»; pierde y vuelve a entrar (×4); el «sígueme» encima de la escena; a las 11:00,
// −1.400 €; un cruce de calles con dos señales (GANAR / DEJAR DE SENTIRSE MAL) y él corriendo hacia la segunda; de noche,
// la nota «2 PÉRDIDAS SEGUIDAS = SE ACABÓ EL DÍA», apaga y se va; amanece y el mercado sigue ahí; y el cierre de
// conversión (comenta BOT). Tiempos en src/gen/venganza.json (scripts/venganza.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/venganza.json";
import { ANCHO, SANS } from "../Viral/util";
import { euros, L, mono, muelle } from "../Bot/piezas";
import { Camara, Escena, orbita, polvo, proyector, Trazo } from "../Bot/tres";
import { ROJO, VERDE } from "../Bot/kit";
import { Clave, cuerpoEn, Estado } from "../Bot/stick";
import { anclaje, Exclama, FlashRojo, HUNDIDO, MANOS_CABEZA, StickMundo } from "../Bot/comun";
import { CamaraTiembla, FlashVerde } from "../Bot/historia";
import { CRUCE, cruce, DESPACHO, despachoCasa } from "../Bot/decorados";
import { CierreComenta } from "../Bot/conversion";
import { claves, CtaSeguir, golpe, Montaje, P, sacude } from "../Explica/Montaje";

export const VENGANZA_FPS = datos.fps;
export const VENGANZA_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;

// ------------------------------------------------------------------ piezas
// Pantalla 2D encima del monitor del despacho (se adapta al rectángulo proyectado)
const PantallaPC: React.FC<{ cam: Camara; o?: number; children: (w: number, h: number) => React.ReactNode }> = ({ cam, o = 1, children }) => {
  const pr = proyector(cam);
  const { c, w, h } = DESPACHO.MON;
  const a = pr([c[0] - w / 2 + 0.018, c[1] + h / 2 - 0.018, c[2] + 0.01]);
  const b = pr([c[0] + w / 2 - 0.018, c[1] - h / 2 + 0.018, c[2] + 0.01]);
  return <div style={{ position: "absolute", left: a.x, top: a.y, width: b.x - a.x, height: b.y - a.y, overflow: "hidden", borderRadius: 6, opacity: o }}>{children(b.x - a.x, b.y - a.y)}</div>;
};
const SERIE = [0.62, 0.66, 0.6, 0.64, 0.58, 0.55, 0.6, 0.5, 0.46, 0.5, 0.38, 0.3];
// Plataforma: velas, resultado y botones; rojas = cuántas de las últimas velas caen; pulsa = COMPRAR pulsado
const Plataforma: React.FC<{ w: number; h: number; pyg: number; sinPyg?: boolean; pulsa?: boolean; rojas?: number; apagada?: number; t: number; nota?: React.ReactNode }> = ({ w, h, pyg, sinPyg = false, pulsa = false, rojas = 3, apagada = 0, t, nota }) => {
  const n = SERIE.length;
  const x0 = w * 0.05;
  const paso = (w * 0.9) / n;
  const yv = (v: number) => h * 0.2 + (1 - v) * h * 0.5;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#030303" }}>
      <div style={{ position: "absolute", left: w * 0.05, top: h * 0.05, ...mono(h * 0.065, 0.6) }}>EUR/USD · 1M</div>
      <div style={{ display: sinPyg ? "none" : "block", position: "absolute", right: w * 0.05, top: h * 0.03, ...mono(h * 0.15), fontWeight: 700, color: pyg < 0 ? ROJO : VERDE, textShadow: `0 0 20px ${pyg < 0 ? "rgba(255,77,94,0.5)" : "rgba(47,224,138,0.5)"}` }}>{`${pyg < 0 ? "−" : "+"}${euros(Math.abs(pyg))} €`}</div>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        {SERIE.map((v, i) => {
          const abre = i === 0 ? v + 0.02 : SERIE[i - 1];
          const roja = i >= n - rojas;
          const cierra = roja ? Math.min(v, abre - 0.04) : v;
          const col = roja ? ROJO : "#fff";
          const a = yv(abre);
          const b = yv(cierra);
          const x = x0 + paso * (i + 0.5);
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={Math.min(a, b) - 6} y2={Math.max(a, b) + 6} stroke={col} strokeWidth={2} />
              <rect x={x - paso * 0.3} y={Math.min(a, b)} width={paso * 0.6} height={Math.max(3, Math.abs(b - a))} fill={roja ? ROJO : cierra >= abre ? "#fff" : "#030303"} stroke={col} strokeWidth={2} />
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: w * 0.05, right: w * 0.05, bottom: h * 0.05, display: "flex", gap: w * 0.04 }}>
        <div style={{ flex: 1, textAlign: "center", padding: `${h * 0.03}px 0`, borderRadius: 10, border: `3px solid ${ROJO}`, ...mono(h * 0.08), fontWeight: 700, color: ROJO }}>VENDER</div>
        <div style={{ flex: 1, textAlign: "center", padding: `${h * 0.03}px 0`, borderRadius: 10, border: `3px solid ${VERDE}`, background: pulsa ? VERDE : "transparent", ...mono(h * 0.08), fontWeight: 700, color: pulsa ? "#000" : VERDE, transform: `scale(${pulsa ? 0.94 : 1})`, boxShadow: pulsa ? `0 0 30px ${VERDE}` : undefined }}>COMPRAR</div>
      </div>
      {nota}
      {apagada > 0.01 && (
        <div style={{ position: "absolute", inset: 0, background: "#000", opacity: apagada, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={h * 0.3} height={h * 0.3} viewBox="0 0 100 100">
            <path d="M30 28 A32 32 0 1 0 70 28" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={7} strokeLinecap="round" />
            <line x1={50} x2={50} y1={12} y2={50} stroke="rgba(255,255,255,0.5)" strokeWidth={7} strokeLinecap="round" />
          </svg>
        </div>
      )}
      {apagada < 0.99 && <div style={{ position: "absolute", inset: 0, opacity: 0.05 + 0.03 * Math.sin(t * 9), background: "linear-gradient(180deg, transparent 50%, #fff 50%)", backgroundSize: "100% 6px", pointerEvents: "none" }} />}
    </div>
  );
};
// Ficha grande (como las de un marcador): para cifras y multiplicadores
const Ficha: React.FC<{ t: number; t0: number; texto: string; color?: string; size?: number; x?: number; y?: number; fin?: number }> = ({ t, t0, texto, color = "#fff", size = 150, x = ANCHO / 2, y = 760, fin: f }) => {
  const g = muelle(t, t0, 260, 13);
  const fuera = f === undefined ? 0 : L(t, f - 0.2, f, 0, 1);
  if (g < 0.01 || fuera >= 1) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${(0.5 + 0.5 * Math.min(g, 1.1)) * (1 - 0.3 * fuera)}) rotate(${-3 + 3 * Math.min(g, 1)}deg)`, opacity: Math.min(g * 1.6, 1) * (1 - fuera) }}>
      <div style={{ position: "relative", padding: `${size * 0.12}px ${size * 0.22}px`, borderRadius: size * 0.16, background: "linear-gradient(180deg, #1a1a1a 0%, #111 49%, #000 51%, #0a0a0a 100%)", border: `4px solid ${color}`, boxShadow: `0 ${size * 0.08}px 0 #000, 0 0 40px ${color}55` }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 1, color, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>{texto}</span>
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 3, background: "#000" }} />
      </div>
    </div>
  );
};
const Pildora: React.FC<{ t: number; t0: number; color?: string; size?: number; fin?: number; children: React.ReactNode }> = ({ t, t0, color = "#fff", size = 44, fin: f, children }) => {
  const g = muelle(t, t0, 240, 13);
  const fuera = f === undefined ? 0 : L(t, f - 0.2, f, 0, 1);
  if (g < 0.01 || fuera >= 1) return null;
  return <div style={{ ...mono(size), fontWeight: 700, color, padding: "10px 24px", borderRadius: 14, border: `3px solid ${color}`, background: "rgba(0,0,0,0.9)", opacity: Math.min(g * 1.5, 1) * (1 - fuera), transform: `scale(${0.6 + 0.4 * Math.min(g, 1.1)})` }}>{children}</div>;
};
const Arriba: React.FC<{ top?: number; children: React.ReactNode }> = ({ top = 300, children }) => (
  <div style={{ position: "absolute", top, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>{children}</div>
);
// Reloj digital junto al de pared
const Hora: React.FC<{ cam: Camara; texto: string; t: number; t0: number; color?: string }> = ({ cam, texto, t, t0, color = "#fff" }) => {
  const q = proyector(cam)([DESPACHO.RELOJ[0], DESPACHO.RELOJ[1] - 0.15, DESPACHO.RELOJ[2]]);
  const g = muelle(t, t0, 240, 13);
  if (g < 0.01) return null;
  return <div key={texto} style={{ position: "absolute", left: q.x, top: q.y, transform: `translate(-50%, 0) scale(${0.6 + 0.4 * Math.min(g, 1.1)})`, ...mono(46), fontWeight: 700, color, padding: "6px 16px", borderRadius: 12, border: `3px solid ${color}`, background: "#000", opacity: Math.min(g * 1.5, 1) }}>{texto}</div>;
};
// Aporrear la tecla: la mano derecha sube y baja deprisa
const aporrea = (c: Estado, t: number, k: number): Estado => ({ ...c, mDy: c.mDy + k * 0.16 * Math.max(0, Math.sin(t * 13)), mDx: c.mDx + k * 0.02 * Math.sin(t * 13) });
const camDespacho = (t: number, s: number, e: number, d0: number, d1: number, az0: number, az1: number, tg = -9) =>
  orbita([0.42, -0.35, -0.35], L(t, s, e, d0, d1) - 0.2 * golpe(t, tg), L(t, s, e, az0, az1) + sacude(t, tg, 0.025), 0.1, { apertura: 6, centroY: 980 });
const ANCLA_M: [number, number, number] = [0.02, -1, -0.15];

// ------------------------------------------------------------------ 1. Hook: aporreando COMPRAR con −200 € en pantalla
const HOOK: Clave[] = [[0, { mDx: 0.36, mDy: -0.12, mIx: -0.15, mIy: -0.45, cejas: -1, boca: -0.7, abre: 0.4, ojos: 1.2, agobio: 0.7, mira: 0.7, incl: 0.06 }]];
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = camDespacho(t, s, e, 4.3, 4.1, -0.1, -0.05);
  const tr: Trazo[] = [...polvo(0.1)];
  despachoCasa(tr, t, { hora: 10.1 });
  const c = aporrea(cuerpoEn(t, HOOK, HOOK[0][1], -0.5), t, 1);
  const a = anclaje(cam, ANCLA_M, 0.48);
  const pulsa = Math.sin(t * 13) > 0.6;
  return (
    <AbsoluteFill style={{ transform: `translateY(${pulsa ? 5 : 0}px)` }}>
      <Escena cam={cam} trazos={tr} />
      <PantallaPC cam={cam}>{(w, h) => <Plataforma w={w} h={h} pyg={-200} pulsa={pulsa} rojas={3} t={t} />}</PantallaPC>
      <StickMundo a={a} c={c} t={t} gorra />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 2. Uno: −200 € a las 10:00 · a las 10:02 dentro con el doble · «RECUPERAR»
const s1 = inicio("uno");
const UNO: Clave[] = [
  [s1, { mDx: 0.15, mDy: -0.52, mIx: -0.15, mIy: -0.52, cejas: -0.8, boca: -0.8, ojos: 1, agobio: 0.3, mira: 0.7, incl: 0 }],
  [EV.dos - 0.2, { cejas: -0.6, boca: -0.3, mira: 0.8, mDx: 0.3, mDy: -0.2 }],
  [EV.dentro - 0.25, { mDx: 0.38, mDy: -0.1, cejas: -1, boca: -0.2, ojos: 1.15 }],
  [EV.doble - 0.2, { mIx: -0.3, mIy: 0.25, boca: 0.4, abre: 0.3, cejas: -0.6 }],
  [EV.recuperar - 0.2, { mIx: -0.15, mIy: -0.45, mDx: 0.45, mDy: 0.1, boca: -0.2, abre: 0, cejas: -1 }],
];
const Uno: React.FC<P> = ({ t, s, e }) => {
  const cam = camDespacho(t, s, e, 4.1, 3.9, 0.08, 0.02, EV.doble - 0.05);
  const tr: Trazo[] = [...polvo(0.1)];
  const hora = 10 + L(t, EV.dos - 0.1, EV.dos + 0.6, 0, 2 / 60);
  despachoCasa(tr, t, { hora });
  const c = cuerpoEn(t, UNO, UNO[0][1], s - 0.4);
  const a = anclaje(cam, ANCLA_M, 0.48);
  const pulsa = t > EV.dentro - 0.1 && t < EV.dentro + 0.2;
  const nota = muelle(t, EV.recuperar - 0.15, 260, 11);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <PantallaPC cam={cam}>
        {(w, h) => (
          <Plataforma w={w} h={h} pyg={t < EV["200"] - 0.4 ? -40 : -200} pulsa={pulsa} rojas={t < EV["200"] - 0.4 ? 1 : 3} t={t}
            nota={nota > 0.01 && (
              <div style={{ position: "absolute", left: w * 0.08, top: h * 0.26, transform: `rotate(-7deg) scale(${Math.min(nota, 1.1)})`, padding: `${h * 0.04}px ${w * 0.05}px`, background: "#fff", ...mono(h * 0.14), color: ROJO, fontWeight: 800, boxShadow: "0 8px 20px rgba(0,0,0,0.6)" }}>RECUPERAR!</div>
            )}
          />
        )}
      </PantallaPC>
      <Hora cam={cam} texto={t < EV.dos - 0.1 ? "10:00" : "10:02"} t={t} t0={t < EV.dos - 0.1 ? EV["10"] - 0.3 : EV.dos - 0.1} color={t < EV.dos - 0.1 ? "#fff" : ROJO} />
      <StickMundo a={a} c={c} t={t} gorra />
      <Ficha t={t} t0={EV.doble - 0.2} texto="×2" color={ROJO} x={300} y={420} size={140} />
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: volvió a perder (−400 €) y volvió a entrar (×4)
const s2 = inicio("dos");
const Dos: React.FC<P> = ({ t, s, e }) => {
  const cam = camDespacho(t, s, e, 3.7, 3.5, 0.12, 0.06, EV.perder2 - 0.05);
  const tr: Trazo[] = [...polvo(0.1)];
  despachoCasa(tr, t, { hora: 10 + 9 / 60 });
  const base = cuerpoEn(t, [[s, { mDx: 0.36, mDy: -0.12, cejas: -1, boca: -0.8, abre: 0.3, ojos: 1.25, agobio: 0.9, mira: 0.7 }], [EV.perder2 - 0.1, { ...MANOS_CABEZA, mira: 0.6 }], [EV.entrar - 0.4, { mIx: -0.15, mIy: -0.45, mDx: 0.36, mDy: -0.12, agobio: 1, cejas: -1, boca: -0.4 }]], { mDx: 0.36, mDy: -0.12 }, s - 0.4);
  const c = t > EV.entrar - 0.3 ? aporrea(base, t, 1) : base;
  const a = anclaje(cam, ANCLA_M, 0.48);
  return (
    <>
      <CamaraTiembla t={t} t0={EV.perder2 - 0.05} a={0.02}>
        <Escena cam={cam} trazos={tr} />
        <PantallaPC cam={cam}>{(w, h) => <Plataforma w={w} h={h} pyg={t < EV.perder2 - 0.15 ? -200 : -600} pulsa={t > EV.entrar - 0.2 && Math.sin(t * 13) > 0.5} rojas={t < EV.perder2 - 0.15 ? 3 : 6} t={t} />}</PantallaPC>
        <StickMundo a={a} c={c} t={t} gorra />
        <Exclama t={t} t0={EV.perder2 - 0.1} c={c} {...a} />
      </CamaraTiembla>
      <Ficha t={t} t0={EV.entrar - 0.3} texto="×4" color={ROJO} x={300} y={420} size={140} />
      <FlashRojo t={t} t0={EV.perder2 - 0.05} o={0.18} />
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

// ------------------------------------------------------------------ 5. Tres: a las 11:00, −1.400 € · el cruce: ganar o dejar de sentirse mal
const s3 = inicio("tres");
const corte3 = EV.despues - 0.25;
const TresA: React.FC<P> = ({ t, s }) => {
  const cam = camDespacho(t, s, corte3, 4.4, 4.1, -0.05, 0.05, EV["1400"] - 0.05);
  const tr: Trazo[] = [...polvo(0.1)];
  despachoCasa(tr, t, { hora: 11 });
  const c = cuerpoEn(t, [[s, { ...MANOS_CABEZA, mira: 0.5 }], [EV["1400"] + 0.2, { ...HUNDIDO }]], { ...MANOS_CABEZA }, s - 0.4);
  const a = anclaje(cam, ANCLA_M, 0.48);
  return (
    <>
      <CamaraTiembla t={t} t0={EV["1400"] - 0.05} a={0.02}>
        <Escena cam={cam} trazos={tr} />
        <PantallaPC cam={cam}>{(w, h) => <Plataforma w={w} h={h} pyg={-Math.round(L(t, s, EV["1400"], 600, 1400, (u) => u) / 10) * 10} rojas={9} t={t} />}</PantallaPC>
        <Hora cam={cam} texto="11:00" t={t} t0={EV["11"] - 0.3} color={ROJO} />
        <StickMundo a={a} c={c} t={t} gorra />
      </CamaraTiembla>
      <Ficha t={t} t0={EV["1400"] - 0.25} texto="−1.400 €" color={ROJO} x={ANCHO / 2} y={430} size={120} />
      <FlashRojo t={t} t0={EV["1400"] - 0.05} o={0.2} />
    </>
  );
};
const TresB: React.FC<P> = ({ t, e }) => {
  const cam = orbita([0, -0.3, -1.4], L(t, corte3, e, 4.2, 3.9), L(t, corte3, e, -0.06, 0.05), 0.12, { apertura: 6, centroY: 1000 });
  const tr: Trazo[] = [...polvo(0.12)];
  cruce(tr, t);
  const pr = proyector(cam);
  const qi = pr(CRUCE.izq);
  const qd = pr(CRUCE.der);
  // Marcos mira las dos señales y sale corriendo hacia la de la derecha
  const corre = L(t, EV.ganar + 0.6, e + 0.3, 0, 1, (u) => u * u);
  const px = -0.3 + 1.0 * corre;
  const pz = -0.8 - 1.5 * corre;
  const base = cuerpoEn(t, [[corte3, { mira: -0.8, cabeza: -0.1, cejas: 0.3 }], [EV.ganar - 0.3, { mira: 0.8, cabeza: 0.1, cejas: -0.5, boca: -0.4 }], [EV.ganar + 0.5, { incl: 0.15, mira: 0.8, mIx: -0.35, mIy: -0.2, mDx: 0.35, mDy: -0.05 }]], { mira: -0.8 }, corte3 - 0.4);
  const fase = t * 11;
  const c: Estado = corre > 0.01 ? { ...base, y: base.y + 0.04 * Math.abs(Math.sin(fase)), pIx: -0.14 + 0.2 * Math.sin(fase), pDx: 0.14 - 0.2 * Math.sin(fase), pIy: 0.08 * Math.max(0, Math.cos(fase)), pDy: 0.08 * Math.max(0, -Math.cos(fase)) } : base;
  const a = anclaje(cam, [px, -1, pz], 0.44);
  const tacha = L(t, EV.ganar - 0.1, EV.ganar + 0.2, 0, 1);
  const brilla = 0.5 + 0.5 * Math.sin(t * 6);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: qi.x, top: qi.y, transform: "translate(-50%, -50%)", ...mono(40), fontWeight: 700 }}>
        <span style={{ position: "relative" }}>
          GANAR
          <span style={{ position: "absolute", left: -8, top: "50%", height: 6, width: `calc(${tacha * 100}% + 16px)`, background: ROJO, opacity: tacha > 0 ? 1 : 0 }} />
        </span>
      </div>
      <div style={{ position: "absolute", left: qd.x, top: qd.y, transform: "translate(-50%, -50%)", ...mono(30), fontWeight: 700, color: ROJO, textAlign: "center", lineHeight: 1.1, textShadow: `0 0 ${16 * brilla}px rgba(255,77,94,0.8)` }}>
        DEJAR DE
        <br />
        SENTIRSE MAL
      </div>
      <StickMundo a={a} c={c} t={t} gorra perfil={corre > 0.01 ? 1 : 0} />
      <Arriba>
        <Pildora t={t} t0={corte3 + 0.1} size={40}>TU CABEZA, DESPUÉS DE PERDER</Pildora>
      </Arriba>
    </>
  );
};
const Tres: React.FC<P> = (p) => (p.t < corte3 ? <TresA {...p} /> : <TresB {...p} />);

// ------------------------------------------------------------------ 6. Giro: la nota antes de abrir · 2 pérdidas = se acabó el día · amanece y sigue ahí
const sG = inicio("giro");
const NOTA = "2 PÉRDIDAS SEGUIDAS = SE ACABÓ EL DÍA";
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = camDespacho(t, s, e, 4.3, 4.0, -0.1, 0.05);
  const tr: Trazo[] = [...polvo(0.1)];
  const amanece = L(t, EV.manana2 - 0.2, EV.manana2 + 0.5, 0, 1);
  const hora = amanece > 0 ? 7 + 2 * amanece : 22;
  despachoCasa(tr, t, { hora, dia: amanece, flexo: 1 - L(t, EV.dia - 0.1, EV.dia + 0.1, 0, 1) });
  // Escribe la nota (antes de abrir la plataforma), mira los dos fallos y se va
  const sale = L(t, EV.dia - 0.15, EV.manana2 + 0.3, 0, 1, (u) => u * u);
  const base = cuerpoEn(t, [
    [s, { mDx: 0.32, mDy: -0.25, mIx: -0.15, mIy: -0.5, mira: 0.7, cejas: 0.3, boca: 0.1, agacha: 0.2 }],
    [EV["2"] - 0.3, { mDx: 0.15, mDy: 0.35, mira: 0.2, agacha: 0, boca: 0.3 }],
    [EV.dia - 0.3, { mIx: -0.15, mIy: -0.52, mDx: 0.3, mDy: 0.25, boca: 0.6, mira: 0.8 }],
  ], { mDx: 0.32, mDy: -0.25 }, s - 0.4);
  const escribe = t > EV.escribelo - 0.2 && t < EV.plataforma ? 0.04 * Math.sin(t * 30) : 0;
  const fase = t * 9;
  const c: Estado = sale > 0.01 ? { ...base, pIx: -0.12 + 0.18 * Math.sin(fase), pDx: 0.12 - 0.18 * Math.sin(fase), pIy: 0.06 * Math.max(0, Math.cos(fase)), pDy: 0.06 * Math.max(0, -Math.cos(fase)) } : { ...base, mDx: base.mDx + escribe };
  const a = anclaje(cam, [ANCLA_M[0] + 1.4 * sale, -1, ANCLA_M[2]], 0.48);
  const letras = Math.floor(L(t, EV.escribelo - 0.2, EV.plataforma + 0.3, 0, NOTA.length, (u) => u));
  const apagada = amanece > 0.3 ? 1 - L(t, EV.manana2 + 0.2, EV.manana2 + 0.5, 0, 1) : 1;
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <PantallaPC cam={cam}>
        {(w, h) => (
          <Plataforma w={w} h={h} pyg={0} sinPyg rojas={0} t={t} apagada={apagada}
            nota={letras > 0 && amanece < 0.5 && (
              <div style={{ position: "absolute", left: w * 0.06, right: w * 0.06, top: h * 0.2, zIndex: 2, transform: "rotate(-3deg)", padding: `${h * 0.05}px ${w * 0.04}px`, background: "#fff", ...mono(h * 0.1), color: "#000", fontWeight: 800, whiteSpace: "normal", lineHeight: 1.15, boxShadow: "0 8px 20px rgba(0,0,0,0.6)" }}>
                {NOTA.slice(0, letras)}
              </div>
            )}
          />
        )}
      </PantallaPC>
      <Arriba>
        <Pildora t={t} t0={EV.solucion - 0.2} size={44} color={VERDE} fin={EV.manana2 - 0.1}>LA SOLUCIÓN</Pildora>
        <Pildora t={t} t0={EV.manana2 - 0.1} size={44} color={VERDE}>MAÑANA SIGUE AHÍ ☀</Pildora>
      </Arriba>
      <div style={{ position: "absolute", top: 1180, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 30 }}>
        {[0, 1].map((i) => {
          const g = muelle(t, EV["2"] - 0.2 + i * 0.25, 260, 12);
          const fuera = L(t, EV.dia + 0.2, EV.dia + 0.5, 0, 1);
          return g > 0.01 && fuera < 1 ? (
            <div key={i} style={{ width: 150, height: 150, borderRadius: 26, border: `5px solid ${ROJO}`, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 110, color: ROJO, opacity: Math.min(g * 1.5, 1) * (1 - fuera), transform: `scale(${0.5 + 0.5 * Math.min(g, 1.1)})` }}>✗</div>
          ) : null;
        })}
      </div>
      <StickMundo a={a} c={c} t={t} gorra perfil={sale > 0.01 ? 1 : 0} />
      <FlashVerde t={t} t0={EV.manana2 - 0.05} o={0.12} />
    </>
  );
};

// ------------------------------------------------------------------ 7. Cierre de conversión (los últimos ~10 s)
const Cierre: React.FC<P> = (p) => <CierreComenta {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tCuenta={EV.auditada} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["200", ROJO], "10", ["doble", ROJO], "recuperar", "volvió", "entrar", "sígueme", "11", ["1400", ROJO], "ganar", ["mal", ROJO], ["solución", VERDE], "escríbelo", ["2", ROJO], "día", ["mañana", VERDE], "llegado", "bot", "privado", ["auditada", VERDE]]);

const GANCHO = { lineas: ["Tu peor operación", "es la de *después_de_perder*"], hasta: EV.perder0 + 0.45, color: ROJO };
export const Venganza: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/venganza_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.1} empujes={0.05} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} />
);
