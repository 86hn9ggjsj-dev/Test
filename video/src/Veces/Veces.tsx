// Reel con historia (formato v2) "Marcos miró el gráfico 143 veces en un día" (~30 s). Marcos (gorra) pegado al móvil con
// el contador ya disparado en el fotograma 0; tres viñetas rápidas (metro, baño y la cena con su novia, Lucía, de brazos
// cruzados); un «0» gigante que pasa a «1»; la vez 120: vela roja, susto y CERRAR; el «sígueme» encima de la escena; el
// precio que llega al objetivo sin él; la regla en tres fichas (stop, objetivo, alerta), el móvil boca abajo; y la
// pregunta. Tiempos en src/gen/veces.json (scripts/veces.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/veces.json";
import { ANCHO } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { caja, circulo, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { cristal, ROJO, suelo, velas, VERDE } from "../Bot/kit";
import { Clave, cuerpoEn, Cuerpo, Estado } from "../Bot/stick";
import { Ancla, anclaje, CHOQUE, Exclama, FlashRojo, MANOS_CABEZA, StickMundo } from "../Bot/comun";
import { CamaraTiembla, FlashVerde, PreguntaDos } from "../Bot/historia";
import { claves, CtaSeguir, cuando, golpe, Montaje, P, sacude } from "../Explica/Montaje";

export const VECES_FPS = datos.fps;
export const VECES_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;

// ------------------------------------------------------------------ piezas
// Manos sujetando el móvil delante, a su derecha, y la mirada clavada en él
const MOVIL_MANOS: Partial<Cuerpo> = { mDx: 0.3, mDy: -0.06, mIx: 0.2, mIy: -0.12, mira: 0.8, agacha: 0.15, incl: 0.03 };
// Dónde queda el móvil (en píxeles) para un stickman anclado en «a»
const enManos = (c: Estado, a: Ancla) => ({ x: a.ox + (c.x + 0.36) * a.s, y: a.oy - (c.y + 0.52) * a.s, w: 0.26 * a.s });

const SERIE = [0.35, 0.47, 0.42, 0.55, 0.5, 0.62, 0.57, 0.68, 0.63, 0.72];
// Móvil 2D: velas (la última puede ponerse roja y caer), botón CERRAR opcional y giro boca abajo (0…1)
const Movil: React.FC<{ x: number; y: number; w: number; rojo?: number; boton?: number; giro?: number; brillo?: number; o?: number }> = ({ x, y, w, rojo = 0, boton, giro = 0, brillo = 0.5, o = 1 }) => {
  const h = w * 1.9;
  const cs = Math.cos(giro * Math.PI);
  const sw = Math.max(2.5, w * 0.025);
  const x0 = w * 0.14;
  const x1 = w * 0.86;
  const y0 = h * 0.16;
  const y1 = boton === undefined ? h * 0.84 : h * 0.68;
  const paso = (x1 - x0) / SERIE.length;
  const vy = (v: number) => y1 - (v - 0.2) * (y1 - y0) / 0.6;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: o, transform: `scaleY(${Math.max(Math.abs(cs), 0.04)})`, filter: cs > 0 ? `drop-shadow(0 0 ${30 * brillo}px rgba(255,255,255,${0.5 * brillo}))` : undefined }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <rect x={sw / 2} y={sw / 2} width={w - sw} height={h - sw} rx={w * 0.14} fill={cs > 0 ? "#050505" : "#000"} stroke="#fff" strokeWidth={sw} />
        {cs > 0 ? (
          <>
            <line x1={w * 0.4} x2={w * 0.6} y1={h * 0.055} y2={h * 0.055} stroke="#fff" strokeWidth={sw} strokeLinecap="round" opacity={0.6} />
            {SERIE.map((v, i) => {
              const abre = i === 0 ? v - 0.05 : SERIE[i - 1];
              let cierra = v;
              let col = "#fff";
              if (i === SERIE.length - 1 && rojo > 0) {
                cierra = abre - 0.42 * rojo;
                col = ROJO;
              }
              const cx = x0 + paso * (i + 0.5);
              const a = vy(abre);
              const b = vy(cierra);
              const arriba = Math.min(a, b);
              const alto = Math.max(3, Math.abs(b - a));
              return (
                <g key={i}>
                  <line x1={cx} x2={cx} y1={arriba - h * 0.02} y2={arriba + alto + h * 0.02} stroke={col} strokeWidth={sw * 0.7} />
                  <rect x={cx - paso * 0.3} y={arriba} width={paso * 0.6} height={alto} fill={cierra >= abre && col === "#fff" ? col : "#050505"} stroke={col} strokeWidth={sw * 0.7} />
                </g>
              );
            })}
            {boton !== undefined && (
              <g>
                <rect x={w * 0.14} y={h * 0.75} width={w * 0.72} height={h * 0.12} rx={h * 0.03} fill={boton > 0.5 ? ROJO : "#050505"} stroke={ROJO} strokeWidth={sw} />
                <text x={w / 2} y={h * 0.83} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={h * 0.055} fill={boton > 0.5 ? "#000" : ROJO}>CERRAR</text>
              </g>
            )}
          </>
        ) : (
          <rect x={w * 0.3} y={h * 0.1} width={w * 0.18} height={w * 0.18} rx={w * 0.05} fill="none" stroke="#fff" strokeWidth={sw} opacity={0.7} />
        )}
      </svg>
    </div>
  );
};
const Pildora: React.FC<{ t: number; t0: number; color?: string; size?: number; children: React.ReactNode; fin?: number }> = ({ t, t0, color = "#fff", size = 40, children, fin: f }) => {
  const g = muelle(t, t0, 240, 13);
  const fuera = f === undefined ? 0 : L(t, f - 0.2, f, 0, 1);
  if (g < 0.01 || fuera >= 1) return null;
  return <div style={{ ...mono(size), fontWeight: 700, color, padding: "10px 24px", borderRadius: 14, border: `3px solid ${color}`, background: "rgba(0,0,0,0.9)", opacity: Math.min(g * 1.5, 1) * (1 - fuera), transform: `scale(${0.6 + 0.4 * Math.min(g, 1.1)})` }}>{children}</div>;
};
const Arriba: React.FC<{ top?: number; children: React.ReactNode }> = ({ top = 300, children }) => (
  <div style={{ position: "absolute", top, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>{children}</div>
);
// Contador de miradas del día (sube a saltos de una en una)
const veces = (t: number) => Math.round(t < 2 ? L(t, 0, 2, 96, 143, (u) => 1 - Math.pow(1 - u, 2)) : 143);
const fondoGrafico = (tr: Trazo[], t: number, o = 0.35) => {
  const serie = Array.from({ length: 30 }, (_, i) => -0.2 + 0.25 * Math.sin(i * 0.5 + 1) + 0.012 * i + 0.06 * Math.sin(i * 2.3));
  velas(tr, serie, -1.6, 2.2, Math.min(30, 12 + Math.floor(t * 4)), 0.06, o, 0.03, true);
};

// ------------------------------------------------------------------ 1. Hook: pegado al móvil, contador ya disparado
const HOOK: Clave[] = [
  [0, { ...MOVIL_MANOS, ojos: 1.45, cejas: 0.7, boca: -0.2, abre: 0.2 }],
  [EV["143"] + 0.6, { ojos: 1.3, cejas: 0.4, agobio: 0.6 }],
];
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.3, 0, -1], L(t, s, e, 6.0, 5.6), L(t, s, e, -0.2, 0.1), 0.05, { apertura: 38, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.3)];
  suelo(tr, t, -1.6, 0.14, "#fff", 0.6);
  fondoGrafico(tr, t + 3, 0.3);
  const c = cuerpoEn(t, HOOK, { ...MOVIL_MANOS, ojos: 1.45 }, -0.5);
  const a: Ancla = { ox: 330, oy: 1700, s: 440 };
  const m = enManos(c, a);
  const n = veces(t);
  const bote = 1 + 0.12 * golpe(t, Math.floor(t * 12) / 12) * (t < 2 ? 1 : 0);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <AbsoluteFill style={{ background: `radial-gradient(circle 360px at ${m.x}px ${m.y}px, rgba(255,255,255,0.10), transparent 70%)` }} />
      <StickMundo a={a} c={c} t={t} gorra />
      <Movil x={m.x} y={m.y} w={m.w} brillo={0.8} />
      <div style={{ position: "absolute", left: 640, top: 1020, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
        <span style={mono(30, 0.7)}>VECES HOY</span>
        <span style={{ ...mono(170), fontWeight: 700, color: ROJO, fontVariantNumeric: "tabular-nums", transform: `scale(${bote})`, transformOrigin: "0% 50%", textShadow: "0 0 40px rgba(255,77,94,0.45)" }}>{n}</span>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: metro, baño, cena con su novia
const s1 = inicio("uno");
const cBano = EV.bano - 0.3;
const cCena = EV.novia - 0.75;
const Contador: React.FC<{ n: number }> = ({ n }) => (
  <div style={{ position: "absolute", top: 400, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "8px 20px", borderRadius: 12, border: `3px solid ${ROJO}`, background: "#000" }}>
      <span style={mono(28, 0.75)}>VECES HOY</span>
      <span style={{ ...mono(60), fontWeight: 700, color: ROJO, fontVariantNumeric: "tabular-nums" }}>{n}</span>
    </div>
  </div>
);
const Metro: React.FC<P> = ({ t, s }) => {
  const cam = orbita([0.1, -0.2, 0], L(t, s, cBano, 4.6, 4.3), L(t, s, cBano, -0.25, -0.1), 0.06, { apertura: 38, centroY: 1000 });
  const tr: Trazo[] = [...polvo(0.25)];
  // Vagón: suelo, techo, ventanas con luces que pasan y la barra
  for (const [a, b] of caja([-1.6, -1, -0.8], [1.8, 0.75, 0.9])) if (a[2] < 0 || b[2] < 0) tr.push({ t: "l", a, b, w: 2, o: 0.6 });
  for (let k = 0; k < 4; k++) {
    const x = -1.3 + k * 0.85;
    tr.push({ t: "p", pts: [[x, -0.2, -0.79], [x + 0.6, -0.2, -0.79], [x + 0.6, 0.35, -0.79], [x, 0.35, -0.79], [x, -0.2, -0.79]], w: 2.2, o: 0.9, relleno: "#fff", oRelleno: 0.05 });
    const luz = ((t * 3.5 + k * 0.37) % 1) * 0.6;
    tr.push({ t: "l", a: [x + luz, -0.05, -0.8], b: [x + luz + 0.12, -0.05, -0.8], w: 3, o: 0.7, luz: 0.6 });
  }
  tr.push({ t: "l", a: [-0.55, -1, 0.3], b: [-0.55, 0.75, 0.3], w: 4, o: 1, luz: 0.3 });
  const c = cuerpoEn(t, [[s, { ...MOVIL_MANOS, mIx: -0.2, mIy: 0.32, ojos: 1.2 }]], { ...MOVIL_MANOS }, s - 0.4);
  const traq = 0.012 * Math.sin(t * 23);
  const a = anclaje(cam, [-0.3 + traq, -1, 0.3], 0.5);
  const m = enManos(c, a);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <StickMundo a={a} c={c} t={t} gorra />
      <Movil x={m.x} y={m.y} w={m.w} />
      <Arriba><Pildora t={t} t0={s - 0.1} size={52}>EN EL METRO</Pildora></Arriba>
    </>
  );
};
const Bano: React.FC<P> = ({ t }) => {
  const cam = orbita([0.1, -0.35, 0], L(t, cBano, cCena, 4.2, 4.0), L(t, cBano, cCena, 0.2, 0.05), 0.12, { apertura: 38, centroY: 1020 });
  const tr: Trazo[] = [...polvo(0.25)];
  // Azulejos al fondo
  for (let i = 0; i < 9; i++) tr.push({ t: "l", a: [-1.6 + i * 0.4, -1, -0.7], b: [-1.6 + i * 0.4, 1.0, -0.7], w: 1, o: 0.25 });
  for (let j = 0; j < 6; j++) tr.push({ t: "l", a: [-1.6, -1 + j * 0.4, -0.7], b: [1.6, -1 + j * 0.4, -0.7], w: 1, o: 0.25 });
  // Váter: cisterna, taza y asiento
  cristal(tr, [-0.42, -0.35, -0.65], [0.12, 0.15, -0.45], "#fff", 1, 0.2, 0.06);
  tr.push({ t: "p", pts: circulo([-0.15, -0.5, -0.15], 0.3, "y", 40), w: 2.6, o: 1, relleno: "#fff", oRelleno: 0.06 });
  tr.push({ t: "l", a: [-0.38, -0.5, -0.15], b: [-0.3, -1, -0.15], w: 2.4, o: 0.8 });
  tr.push({ t: "l", a: [0.08, -0.5, -0.15], b: [0.0, -1, -0.15], w: 2.4, o: 0.8 });
  // Sentado en el váter con el móvil
  const c = cuerpoEn(t, [[cBano, { ...MOVIL_MANOS, y: 0.4, agacha: 0.4, pIx: -0.3, pDx: 0.3, ojos: 1.1 }]], { ...MOVIL_MANOS, y: 0.4, pIx: -0.3, pDx: 0.3 }, cBano - 0.4);
  const a = anclaje(cam, [-0.15, -1, -0.05], 0.55);
  const m = enManos(c, a);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <StickMundo a={a} c={c} t={t} gorra />
      <Movil x={m.x} y={m.y} w={m.w} />
      <Arriba><Pildora t={t} t0={cBano - 0.05} size={52}>EN EL BAÑO</Pildora></Arriba>
    </>
  );
};
const Cena: React.FC<P> = ({ t, e }) => {
  const cam = orbita([0.0, -0.35, 0], L(t, cCena, e, 5.0, 4.8), L(t, cCena, e, -0.06, 0.06), 0.14, { apertura: 38, centroY: 1020 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  // Mesa con dos platos y una vela
  cristal(tr, [-0.42, -0.5, -0.35], [0.42, -0.44, 0.35], "#fff", 0.9, 0.15, 0.06);
  for (const x of [-0.34, 0.34]) tr.push({ t: "l", a: [x, -0.5, 0], b: [x, -1, 0], w: 2.4, o: 0.7 });
  for (const x of [-0.22, 0.22]) tr.push({ t: "p", pts: circulo([x, -0.43, 0.05], 0.11, "y", 32), w: 2, o: 1 });
  tr.push({ t: "l", a: [0, -0.43, -0.1], b: [0, -0.25, -0.1], w: 4, o: 1 });
  tr.push({ t: "e", c: [0, -0.21, -0.1], r: 0.025, tipo: "punto", o: 1, luz: 1, color: "#ffd27a" });
  const c = cuerpoEn(t, [[cCena, { ...MOVIL_MANOS, ojos: 1.15 }]], { ...MOVIL_MANOS }, cCena - 0.4);
  const a = anclaje(cam, [-0.5, -1, 0.15], 0.46);
  const m = enManos(c, a);
  // Lucía, de brazos cruzados
  const cl = cuerpoEn(t, [[cCena, { mIx: 0.14, mIy: -0.24, mDx: -0.14, mDy: -0.24, boca: -0.8, cejas: -0.9, mira: -0.8, cabeza: -0.08 }]], { mira: -0.8 }, cCena - 0.4);
  const al = anclaje(cam, [0.5, -1, 0.15], 0.44);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <StickMundo a={a} c={c} t={t} gorra />
      <Movil x={m.x} y={m.y} w={m.w} />
      <StickMundo a={al} c={cl} t={t} coleta />
      <Arriba><Pildora t={t} t0={cCena - 0.05} size={52}>CENANDO CON SU NOVIA</Pildora></Arriba>
    </>
  );
};
const Uno: React.FC<P> = (p) => {
  const n = Math.round(L(p.t, p.s, p.e, 37, 119, (u) => u));
  return (
    <>
      {p.t < cBano ? <Metro {...p} /> : p.t < cCena ? <Bano {...p} /> : <Cena {...p} />}
      <Contador n={n} />
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: ¿cuántas veces cambió algo? Cero (bueno, una) · la vez 120: vela roja y CERRAR
const s2 = inicio("dos");
const corte2 = EV["120"] - 0.5;
const DosA: React.FC<P> = ({ t, s }) => {
  const cam = orbita([0.2, -0.3, 0], L(t, s, corte2, 5.0, 4.7), L(t, s, corte2, -0.15, 0.08), 0.1, { apertura: 38, centroY: 1020 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  const c = cuerpoEn(t, [[s, { ...MOVIL_MANOS }], [EV.cero - 0.3, { ...MOVIL_MANOS, mira: -0.6, agacha: 0, ojos: 1.2, cejas: 0.6, cabeza: -0.08 }]], { ...MOVIL_MANOS }, s - 0.4);
  const a = anclaje(cam, [-0.22, -1, 0.5], 0.5);
  const m = enManos(c, a);
  const g = muelle(t, EV.cero - 0.15, 260, 11);
  const uno = t > EV["120"] - 0.85;
  const cambio = golpe(t, EV["120"] - 0.85);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <StickMundo a={a} c={c} t={t} gorra />
      <Movil x={m.x} y={m.y} w={m.w} />
      <Exclama t={t} t0={EV.cambio - 0.2} c={c} {...a} signo="?" dura={1} />
      {g > 0.01 && (
        <div style={{ position: "absolute", left: 700, top: 700, transform: `translate(-50%, -50%) scale(${Math.min(g, 1.1) * (1 + 0.15 * cambio)})`, display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(g * 1.5, 1) }}>
          <span style={mono(30, 0.75)}>VECES QUE CAMBIÓ ALGO</span>
          <span style={{ ...mono(420), fontWeight: 700, lineHeight: 1, color: uno ? ROJO : "#fff" }}>{uno ? "1" : "0"}</span>
        </div>
      )}
    </>
  );
};
const DosB: React.FC<P> = ({ t }) => {
  const cam = orbita([0.0, -0.3, 0], L(t, corte2, fin("dos"), 4.8, 4.5), L(t, corte2, fin("dos"), 0.1, -0.06) + sacude(t, EV.asusto - 0.1, 0.03), 0.1, { apertura: 38, centroY: 1020 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  const c = cuerpoEn(t, [
    [corte2, { ...MOVIL_MANOS, mDx: 0.45, mDy: 0.05, mIx: -0.15, mIy: -0.52, mira: 0.8, agacha: 0 }],
    [EV.asusto - 0.15, { ...CHOQUE, y: 0.9, mira: 0.8 }],
    [EV.asusto + 0.2, { y: 0.79, mDx: 0.48, mDy: 0.1, mIx: -0.2, mIy: 0.2, cejas: -1, boca: -0.8, abre: 0.5, ojos: 1.3, agobio: 1 }],
    [EV.cerro - 0.2, { mDx: 0.55, mDy: -0.05 }],
  ], { ...MOVIL_MANOS, mDx: 0.45, mDy: 0.05 }, corte2 - 0.4);
  const a = anclaje(cam, [-0.32, -1, 0.5], 0.48);
  const rojo = L(t, EV.roja - 0.8, EV.roja, 0, 1);
  const boton = t > EV.cerro - 0.12 ? 1 : 0;
  return (
    <>
      <CamaraTiembla t={t} t0={EV.asusto - 0.1} a={0.02}>
        <Escena cam={cam} trazos={tr} />
        <Movil x={700} y={860} w={340} rojo={rojo} boton={boton} brillo={0.6} />
        <StickMundo a={a} c={c} t={t} gorra />
        <Exclama t={t} t0={EV.asusto - 0.15} c={c} {...a} />
      </CamaraTiembla>
      <Arriba>
        <Pildora t={t} t0={EV["120"] - 0.3} size={50} color={ROJO}>VEZ Nº 120</Pildora>
      </Arriba>
      {boton > 0 && (
        <div style={{ position: "absolute", top: 1250, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
          <Pildora t={t} t0={EV.cerro - 0.1} size={40} color={ROJO}>OPERACIÓN CERRADA</Pildora>
        </div>
      )}
      <FlashRojo t={t} t0={EV.asusto - 0.1} o={0.16} />
    </>
  );
};
const Dos: React.FC<P> = (p) => (p.t < corte2 ? <DosA {...p} /> : <DosB {...p} />);

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

// ------------------------------------------------------------------ 5. Tres: diez minutos después llegó al objetivo. Sin él.
const s3 = inicio("tres");
const CAMINO: V3[] = [[0.0, -0.45, -0.3], [0.12, -0.5, -0.3], [0.24, -0.35, -0.3], [0.36, -0.38, -0.3], [0.48, -0.15, -0.3], [0.6, -0.2, -0.3], [0.72, 0.05, -0.3], [0.84, 0.0, -0.3], [0.98, 0.3, -0.3]];
const Tres: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.42, -0.3, 0], L(t, s, e, 4.6, 4.3), L(t, s, e, -0.12, -0.02), 0.1, { apertura: 38, centroY: 1020 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  // Línea de cierre (donde salió) y objetivo en verde
  tr.push({ t: "l", a: [-0.05, -0.45, -0.31], b: [1.05, -0.45, -0.31], w: 2, o: 0.6, dash: "8 8" });
  tr.push({ t: "l", a: [-0.05, 0.3, -0.31], b: [1.05, 0.3, -0.31], w: 2.6, o: 1, dash: "12 8", color: VERDE, luz: 0.4 });
  const prog = L(t, EV.diez - 0.1, EV.objetivo, 0.05, 1, (u) => u);
  tr.push({ t: "p", pts: CAMINO, w: 3.4, o: 1, luz: 0.4, prog, color: t > EV.objetivo - 0.1 ? VERDE : "#fff" });
  const pr = proyector(cam);
  const qo = pr([1.05, 0.3, -0.31]);
  const qc = pr([1.05, -0.45, -0.31]);
  const c = cuerpoEn(t, [[s, { mira: 0.8, cejas: 0.3 }], [EV.objetivo - 0.2, { ...MANOS_CABEZA, mira: 0.7 }], [EV.sin - 0.1, { agacha: 0.7, mira: 0, boca: -1, cejas: -1, mIx: -0.15, mIy: -0.52, mDx: 0.15, mDy: -0.52, agobio: 0.6 }]], { mira: 0.8 }, s - 0.4);
  const a = anclaje(cam, [-0.02, -1, 0.5], 0.45);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: Math.min(qo.x, 1000), top: qo.y, transform: "translate(-100%, -130%)", ...mono(34), fontWeight: 700, color: VERDE }}>{t > EV.objetivo - 0.1 ? "OBJETIVO ✓" : "OBJETIVO"}</div>
      <div style={{ position: "absolute", left: Math.min(qc.x, 1000), top: qc.y, transform: "translate(-100%, 20%)", ...mono(26, 0.75) }}>AQUÍ CERRÓ</div>
      <Arriba>
        <Pildora t={t} t0={EV.diez - 0.2} size={52}>⏱ +10 MIN</Pildora>
        <Pildora t={t} t0={EV.sin - 0.15} size={44} color={ROJO}>MARCOS: FUERA</Pildora>
      </Arriba>
      <StickMundo a={a} c={c} t={t} gorra />
      <FlashVerde t={t} t0={EV.objetivo - 0.1} o={0.16} />
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: la regla (stop, objetivo, alerta) y el móvil boca abajo
const sG = inicio("giro");
const Icono: React.FC<{ tipo: "stop" | "obj" | "alerta"; color: string }> = ({ tipo, color }) => (
  <svg width={110} height={110} viewBox="0 0 100 100">
    {tipo === "stop" && <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill="none" stroke={color} strokeWidth={6} />}
    {tipo === "stop" && <line x1={28} x2={72} y1={50} y2={50} stroke={color} strokeWidth={8} />}
    {tipo === "obj" && [44, 30, 14].map((r) => <circle key={r} cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={6} />)}
    {tipo === "alerta" && <path d="M50 10 C30 10 25 30 25 45 L25 65 L15 78 L85 78 L75 65 L75 45 C75 30 70 10 50 10 Z" fill="none" stroke={color} strokeWidth={6} strokeLinejoin="round" />}
    {tipo === "alerta" && <circle cx={50} cy={88} r={7} fill={color} />}
  </svg>
);
const FICHAS: { tipo: "stop" | "obj" | "alerta"; txt: string; color: string; t0: number }[] = [
  { tipo: "stop", txt: "STOP", color: ROJO, t0: EV.stop - 0.3 },
  { tipo: "obj", txt: "OBJETIVO", color: VERDE, t0: cuando(datos)("objetivo", sG) - 0.3 },
  { tipo: "alerta", txt: "ALERTA", color: "#fff", t0: EV.alerta - 0.3 },
];
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.2, -0.35, 0], L(t, s, e, 5.0, 4.6), L(t, s, e, -0.15, 0.12), 0.1, { apertura: 38, centroY: 1060 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  // El mercado sigue a su ritmo al fondo
  fondoGrafico(tr, t - s, 0.3);
  // Mesa donde deja el móvil
  cristal(tr, [0.25, -0.55, -0.3], [1.0, -0.5, 0.3], "#fff", 0.9, 0.15, 0.06);
  for (const x of [0.35, 0.9]) tr.push({ t: "l", a: [x, -0.55, 0], b: [x, -1, 0], w: 2.4, o: 0.7 });
  const deja = L(t, EV.cierras - 0.3, EV.cierras + 0.3, 0, 1);
  const giro = L(t, EV.cierras, EV.aplicacion + 0.1, 0, 1);
  const c = cuerpoEn(t, [
    [s, { ...MOVIL_MANOS, agacha: 0 }],
    [EV.cierras - 0.2, { mDx: 0.5, mDy: -0.25, mIx: -0.15, mIy: -0.52, mira: 0.6, agacha: 0.1 }],
    [EV.aplicacion + 0.3, { mIx: -0.1, mIy: 0.42, mDx: 0.1, mDy: 0.42, mira: -0.3, boca: 0.8, cejas: 0.2, agacha: 0, incl: -0.05, ojos: 0.85 }],
  ], { ...MOVIL_MANOS }, s - 0.4);
  const a = anclaje(cam, [-0.35, -1, 0.5], 0.48);
  const enMano = enManos(c, a);
  const pr = proyector(cam);
  const qm = pr([0.62, -0.47, 0]);
  const mx = enMano.x + (qm.x - enMano.x) * deja;
  const my = enMano.y + (qm.y - 20 - enMano.y) * deja;
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", top: 300, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <Pildora t={t} t0={EV.regla - 0.3} size={40}>LA REGLA, ANTES DE ENTRAR</Pildora>
        <div style={{ display: "flex", gap: 26 }}>
          {FICHAS.map((f) => {
            const g = muelle(t, f.t0, 220, 12);
            return (
              <div key={f.txt} style={{ width: 270, height: 250, borderRadius: 24, border: `4px solid ${f.color}`, background: "rgba(0,0,0,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, opacity: Math.min(g * 1.5, 1), transform: `translateY(${(1 - Math.min(g, 1)) * -120}px) scale(${0.7 + 0.3 * Math.min(g, 1.08)})`, boxShadow: `0 0 ${30 * golpe(t, f.t0 + 0.2)}px ${f.color}` }}>
                <Icono tipo={f.tipo} color={f.color} />
                <span style={{ ...mono(40), fontWeight: 700, color: f.color }}>{f.txt}</span>
              </div>
            );
          })}
        </div>
        <Pildora t={t} t0={EV.mires - 1.2} size={40} color={VERDE}>MIRARLO NO LO MUEVE</Pildora>
      </div>
      <StickMundo a={a} c={c} t={t} gorra />
      <Movil x={mx} y={my} w={enMano.w * (1 + 0.15 * deja)} giro={giro} brillo={0.4 * (1 - giro)} />
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta: ¿cuántas veces lo has mirado hoy?
const Pregunta: React.FC<P> = (p) => <PreguntaDos {...p} izq={{ texto: "0-5", sub: "CON ALERTAS", t0: EV.hoy - 0.5 }} der={{ texto: "+50", sub: "NI LO SÉ", t0: EV.hoy + 0.2 }} pie="ETIQUETA AL QUE OPERA EN EL BAÑO" tPie={EV.etiqueta} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, pregunta: Pregunta };
export const CLAVES = claves([["143", ROJO], "metro", "baño", "novia", "cero", ["120", ROJO], ["roja", ROJO], "cerró", "sígueme", "duele", ["objetivo", VERDE], "sin", "regla", ["stop", ROJO], "alerta", "aplicación", "mires", "hoy", "etiqueta"]);

const GANCHO = { lineas: ["Miró el gráfico", "*143_veces* en un día"], hasta: EV.dia + 0.3, color: ROJO };
export const Veces: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/veces_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.1} empujes={0.05} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} />
);
