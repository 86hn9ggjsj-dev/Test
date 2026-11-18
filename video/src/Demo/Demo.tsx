// Reel con historia (formato v2) "En demo, Marcos hizo un 300 %. Con dinero real duró 11 días" (~29 s). Marcos (gorra):
// coronado delante del monitor DEMO con la curva verde disparada y, con un barrido de cámara, hundido delante del REAL con
// la curva roja hasta el fondo; los dos monitores idénticos; el pulso tranquilo en demo y desbocado en real, el dedo que
// tiembla sobre CERRAR y las barras de ganancias cortas y pérdidas largas; el «sígueme» encima de la escena; un billete
// de 20 € para aprender a perder; la escalera 20 → 50 → 100 € y la pregunta. Tiempos en src/gen/demo.json (scripts/demo.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/demo.json";
import { ANCHO } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { cristal, ROJO, suelo, VERDE } from "../Bot/kit";
import { Clave, cuerpoEn, Estado } from "../Bot/stick";
import { anclaje, BRAZOS_ARRIBA, Corona, ENCOGE, Exclama, FlashRojo, MANOS_CABEZA, StickMundo } from "../Bot/comun";
import { CamaraTiembla, FlashVerde, fr, PreguntaDos } from "../Bot/historia";
import { claves, CtaSeguir, golpe, Montaje, P, sacude } from "../Explica/Montaje";

export const DEMO_FPS = datos.fps;
export const DEMO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const suave = (u: number) => u * u * (3 - 2 * u);

const saltitos = (c: Estado, t: number, a: number, vel = 9): Estado => {
  const h = a * Math.max(0, Math.sin(t * vel));
  return { ...c, y: c.y + h, pIy: c.pIy + h * 1.1, pDy: c.pDy + h * 1.1 };
};

// Monitor de alambre con una curva (serie en 0…1) que se dibuja hasta «prog»
const monitor = (tr: Trazo[], cx: number, cy: number, w: number, h: number, z: number, serie: number[], prog: number, color: string, o = 1, luz = 0.4) => {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const y0 = cy - h / 2;
  const y1 = cy + h / 2;
  tr.push({ t: "p", pts: [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [x0, y0, z]], w: 2.6, o, relleno: "#000", oRelleno: 0.85 * o, luz: 0.2 });
  tr.push({ t: "l", a: [cx, y0, z], b: [cx, -1, z], w: 2.4, o: 0.8 * o });
  tr.push({ t: "l", a: [cx - 0.2, -1, z], b: [cx + 0.2, -1, z], w: 3, o: 0.9 * o });
  for (let k = 1; k < 4; k++) tr.push({ t: "l", a: [x0 + 0.05, y0 + (h * k) / 4, z + 0.005], b: [x1 - 0.05, y0 + (h * k) / 4, z + 0.005], w: 1, o: 0.12 * o });
  const pts = serie.map((v, i): V3 => [x0 + 0.08 + ((w - 0.16) * i) / (serie.length - 1), y0 + 0.08 + (h - 0.3) * v, z + 0.01]);
  tr.push({ t: "p", pts, w: 3.2, o, color, luz, prog });
};
const SUBE = [0.04, 0.12, 0.09, 0.22, 0.3, 0.26, 0.42, 0.5, 0.46, 0.63, 0.72, 0.69, 0.86, 1.0];
const BAJA = [0.92, 0.86, 0.88, 0.72, 0.76, 0.6, 0.52, 0.57, 0.4, 0.31, 0.35, 0.17, 0.08, 0.0];
const IGUAL = [0.2, 0.32, 0.26, 0.45, 0.38, 0.55, 0.5, 0.68, 0.6, 0.74];

// Pulso (electro) en SVG: la línea de los dos últimos segundos
const latido = (u: number) => {
  if (u < 0.36) return 0.04 * Math.sin(u * 40);
  if (u < 0.4) return (u - 0.36) / 0.04;
  if (u < 0.44) return 1 - ((u - 0.4) / 0.04) * 1.5;
  if (u < 0.48) return -0.5 + ((u - 0.44) / 0.04) * 0.5;
  if (u < 0.6) return 0.18 * Math.sin(((u - 0.48) / 0.12) * Math.PI);
  return 0.03 * Math.sin(u * 30);
};
const Pulso: React.FC<{ x: number; y: number; w: number; h: number; t: number; lpm: number; color: string; titulo: string; o?: number; tiembla?: number }> = ({ x, y, w, h, t, lpm, color, titulo, o = 1, tiembla = 0 }) => {
  const pts = Array.from({ length: 141 }, (_, i) => {
    const tiempo = t - 2 + (2 * i) / 140;
    const yy = h / 2 - (h / 2) * 0.85 * latido(fr((tiempo * lpm) / 60));
    return `${((w * i) / 140).toFixed(1)},${yy.toFixed(1)}`;
  });
  const ult = pts[pts.length - 1].split(",").map(Number);
  return (
    <div style={{ position: "absolute", left: x + tiembla * Math.sin(t * 61) * 6, top: y, width: w + 40, padding: "18px 20px 14px", borderRadius: 22, border: `3px solid ${color}`, background: "rgba(0,0,0,0.88)", opacity: o }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={mono(26, 0.75)}>{titulo}</span>
        <span style={{ ...mono(44), fontWeight: 700, color }}>{`${lpm} LPM`}</span>
      </div>
      <svg width={w} height={h} style={{ display: "block" }}>
        <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={ult[0]} cy={ult[1]} r={7} fill={color} />
      </svg>
    </div>
  );
};

// Rótulo encima de un punto de la escena
const Rotulo: React.FC<{ x: number; y: number; children: React.ReactNode; size?: number; color?: string; o?: number; ancla?: string }> = ({ x, y, children, size = 34, color = "#fff", o = 1, ancla = "translate(-50%, -100%)" }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: ancla, ...mono(size), fontWeight: 700, color, opacity: o, textShadow: "0 0 18px rgba(0,0,0,0.9)" }}>{children}</div>
);

// ------------------------------------------------------------------ 1. Hook: coronado en DEMO (+300 %) → barrido → hundido en REAL (día 11)
const MD = -1.8;
const MR = 1.8;
const barrido = (t: number) => suave(L(t, EV.real0 - 0.55, EV.real0 - 0.1, 0, 1, (u) => u));
const HOOK: Clave[] = [
  [0, { ...BRAZOS_ARRIBA, boca: 1, abre: 0.6, ojos: 1.25, cejas: 0.6, mira: 0.7 }],
  [EV.real0 - 0.45, { mIx: -0.15, mIy: -0.52, mDx: 0.15, mDy: -0.52, boca: -0.2, abre: 0, ojos: 1.1, cejas: -0.3, mira: 0.7 }],
  [EV["11"] - 0.25, { ...MANOS_CABEZA, mira: 0 }],
];
const Hook: React.FC<P> = ({ t, s, e }) => {
  const w = barrido(t);
  const mx = MD + (MR - MD) * w;
  const cam = orbita([mx, -0.2, 0], L(t, s, e, 4.9, 4.6), -0.1 + 0.08 * Math.sin(t * 0.9) + sacude(t, EV["11"] - 0.05, 0.03), 0.08, { apertura: 38, centroY: 1120 });
  const tr: Trazo[] = [...polvo(0.3)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.6);
  // DEMO: la curva verde ya está arriba en el fotograma 0 y la punta sigue subiendo
  const punta = L(t, 0, EV["300"] + 0.4, 0.9, 1.0);
  monitor(tr, MD, 0.2, 1.2, 0.8, -0.3, [...SUBE.slice(0, -1), punta], 1, VERDE, 1, 0.5 + 0.3 * Math.sin(t * 7));
  // REAL: la curva roja se dibuja hasta el fondo
  monitor(tr, MR, 0.2, 1.2, 0.8, -0.3, BAJA, L(t, EV.real0 - 0.3, EV["11"] + 0.15, 0.08, 1, (u) => u), ROJO, 1, 0.3 + 0.6 * golpe(t, EV["11"]));
  const pr = proyector(cam);
  const qd = pr([MD + 0.55, 0.53, -0.3]);
  const qr = pr([MR + 0.55, 0.53, -0.3]);
  const ld = pr([MD - 0.53, 0.53, -0.3]);
  const lr = pr([MR - 0.53, 0.53, -0.3]);
  const pct = Math.round(L(t, 0, EV["300"] + 0.3, 241, 300));
  const dia = Math.max(1, Math.round(L(t, EV.real0 - 0.2, EV["11"], 1, 11, (u) => u)));
  const base = cuerpoEn(t, HOOK, { ...BRAZOS_ARRIBA, boca: 1, abre: 0.6, ojos: 1.25, mira: 0.7 }, -0.6);
  const c = t < EV.real0 - 0.5 ? saltitos(base, t, 0.07) : base;
  const a = anclaje(cam, [mx - 0.25, -1, 0.75], 0.5);
  const corona = muelle(t, -1, 220, 12) * (1 - L(t, EV.real0 - 0.5, EV.real0 - 0.3, 0, 1));
  return (
    <>
      <CamaraTiembla t={t} t0={EV["11"] - 0.05} a={0.02}>
        <Escena cam={cam} trazos={tr} />
        <Rotulo x={ld.x} y={ld.y} ancla="translate(0, 30%)" size={30} o={0.8}>DEMO</Rotulo>
        <Rotulo x={qd.x} y={qd.y} ancla="translate(-100%, 20%)" size={64} color={VERDE}>{`+${pct} %`}</Rotulo>
        <Rotulo x={lr.x} y={lr.y} ancla="translate(0, 30%)" size={30} o={0.8}>REAL</Rotulo>
        <Rotulo x={qr.x} y={qr.y} ancla="translate(-100%, 20%)" size={64} color={ROJO}>{`DÍA ${dia}`}</Rotulo>
        <StickMundo a={a} c={c} t={t} gorra />
        <Corona c={c} a={a} g={corona} brillo={0.4 + 0.3 * Math.sin(t * 8)} />
      </CamaraTiembla>
      <FlashRojo t={t} t0={EV["11"] - 0.05} o={0.2} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: misma estrategia, mismo gráfico, mismo Marcos
const s1 = inicio("uno");
const LISTA: [string, number][] = [["MISMA ESTRATEGIA", EV.estrategia], ["MISMO GRÁFICO", EV.grafico], ["MISMO MARCOS", EV.marcos1]];
const Uno: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.3, 0], L(t, s, e, 6.6, 6.2) - 0.2 * golpe(t, EV.marcos1 - 0.1), L(t, s, e, 0.12, -0.12), 0.1, { apertura: 38, centroY: 1080 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  const dib = L(t, s, EV.grafico + 0.2, 0.3, 1, (u) => u);
  const brillo = 0.3 + 0.7 * golpe(t, EV.grafico - 0.1);
  monitor(tr, -0.6, 0.05, 0.9, 0.62, -0.3, IGUAL, dib, "#fff", 1, brillo);
  monitor(tr, 0.6, 0.05, 0.9, 0.62, -0.3, IGUAL, dib, "#fff", 1, brillo);
  const pr = proyector(cam);
  const l1 = pr([-0.6, 0.4, -0.3]);
  const l2 = pr([0.6, 0.4, -0.3]);
  const ig = pr([0, 0.05, -0.3]);
  // Los dos Marcos aparecen a la vez, idénticos
  const g = muelle(t, EV.marcos1 - 0.35, 220, 12);
  const c = cuerpoEn(t, [[EV.marcos1 - 0.2, { mira: 0, boca: 0.3, cejas: 0.3 }], [EV.marcos1 + 0.3, { ...ENCOGE }]], { mira: 0 }, s - 0.3);
  const a1 = anclaje(cam, [-0.48, -1, 0.7], 0.45 * Math.min(g, 1.05));
  const a2 = anclaje(cam, [0.48, -1, 0.7], 0.45 * Math.min(g, 1.05));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Rotulo x={l1.x} y={l1.y} size={34}>DEMO</Rotulo>
      <Rotulo x={l2.x} y={l2.y} size={34}>REAL</Rotulo>
      <Rotulo x={ig.x} y={ig.y} ancla="translate(-50%, -50%)" size={110} o={L(t, EV.estrategia - 0.3, EV.estrategia, 0, 1)}>=</Rotulo>
      <div style={{ position: "absolute", top: 300, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {LISTA.map(([txt, t0]) => {
          const k = muelle(t, t0 - 0.3, 240, 14);
          return (
            <div key={txt} style={{ ...mono(46), fontWeight: 700, padding: "10px 26px", borderRadius: 14, border: "3px solid #fff", background: "#000", opacity: Math.min(k * 1.5, 1), transform: `scale(${0.7 + 0.3 * Math.min(k, 1.08)})` }}>
              {txt} <span style={{ color: VERDE }}>✓</span>
            </div>
          );
        })}
      </div>
      {g > 0.02 && (
        <>
          <StickMundo a={a1} c={c} t={t} gorra />
          <StickMundo a={a2} c={c} t={t} gorra />
        </>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: en demo perder no duele · en real tiembla el dedo
const s2 = inicio("dos");
const corte2 = EV.temblaba - 1.0; // «Con dinero real…»
const DOS_A: Clave[] = [
  [s2 + 0.1, { mira: 0.6, cejas: 0.8, boca: 0, ojos: 1.15 }],
  [EV.duele - 0.5, { ...ENCOGE, boca: 0.6, mira: 0 }],
];
const DOS_B: Clave[] = [
  [corte2, { mDx: 0.42, mDy: 0.1, mIx: -0.1, mIy: -0.2, mira: 0.8, cejas: -0.7, boca: -0.5, abre: 0.3, ojos: 1.2, agobio: 0.8, incl: 0.06 }],
];
const DosA: React.FC<P> = ({ t, s }) => {
  const cam = orbita([0.2, -0.25, 0], L(t, s, corte2, 5.0, 4.7), L(t, s, corte2, -0.15, 0.05), 0.1, { apertura: 38, centroY: 1080 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  monitor(tr, 0.55, 0.15, 1.0, 0.7, -0.3, [0.8, 0.7, 0.74, 0.55, 0.6, 0.42, 0.36, 0.2, 0.25, 0.1], L(t, s, EV.duele, 0.3, 1, (u) => u), "#fff", 1, 0.3);
  const pr = proyector(cam);
  const q = pr([0.55, 0.15, -0.3]);
  const l = pr([0.1, 0.45, -0.3]);
  const c = cuerpoEn(t, DOS_A, { mira: 0.6 }, s - 0.3);
  const a = anclaje(cam, [-0.12, -1, 0.7], 0.46);
  const perdida = Math.round(L(t, EV.duele - 1.2, EV.duele, 0, 500));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Rotulo x={l.x} y={l.y} ancla="translate(0, 30%)" size={30} o={0.8}>DEMO</Rotulo>
      <Rotulo x={q.x} y={q.y} ancla="translate(-50%, -20%)" size={70} o={0.55}>{`−${perdida} €`}</Rotulo>
      <Pulso x={300} y={300} w={440} h={120} t={t} lpm={62} color="#fff" titulo="TU PULSO" o={L(t, EV.duele - 0.7, EV.duele - 0.3, 0, 1)} />
      <StickMundo a={a} c={c} t={t} gorra />
      <Exclama t={t} t0={EV.cambio - 0.2} c={c} {...a} signo="?" dura={0.9} />
    </>
  );
};
const BARRAS: { txt: string; t0: number; color: string; largo: number; nota: string }[] = [
  { txt: "LO QUE GANABA", t0: EV.ganaba - 0.5, color: VERDE, largo: 0.18, nota: "CERRADA YA" },
  { txt: "LO QUE PERDÍA", t0: EV.perdia - 0.6, color: ROJO, largo: 1, nota: "AGUANTANDO…" },
];
const DosB: React.FC<P> = ({ t }) => {
  const cam = orbita([0.0, -0.3, 0], L(t, corte2, fin("dos"), 4.6, 4.3), L(t, corte2, fin("dos"), 0.1, -0.08), 0.08, { apertura: 38, centroY: 1100 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  const base = cuerpoEn(t, DOS_B, { mira: 0.8 }, corte2 - 0.3);
  // El dedo tiembla sobre el botón
  const temb = L(t, EV.temblaba - 0.3, EV.temblaba, 0, 1);
  const c: Estado = { ...base, mDx: base.mDx + 0.03 * temb * Math.sin(t * 55), mDy: base.mDy + 0.025 * temb * Math.sin(t * 43 + 1) };
  const a = anclaje(cam, [-0.3, -1, 0.6], 0.47);
  const pulsa = t > EV.ganaba - 0.2 && t < EV.ganaba + 0.1;
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Pulso x={300} y={290} w={440} h={110} t={t} lpm={142} color={ROJO} titulo="PULSO EN REAL" tiembla={temb} />
      <div style={{ position: "absolute", left: 700, top: 1060, transform: `translate(-50%, -50%) scale(${pulsa ? 0.92 : 1})` }}>
        <div style={{ padding: "30px 54px", borderRadius: 26, border: `5px solid ${ROJO}`, background: pulsa ? ROJO : "#000", ...mono(64), fontWeight: 700, color: pulsa ? "#000" : ROJO }}>CERRAR</div>
      </div>
      <div style={{ position: "absolute", top: 530, left: 120, width: 840, display: "flex", flexDirection: "column", gap: 30 }}>
        {BARRAS.map((b) => {
          const g = muelle(t, b.t0, 200, 15);
          if (g < 0.01) return null;
          const crece = b.largo < 1 ? b.largo : L(t, b.t0, fin("dos") + 1.5, 0.25, 1, (u) => u);
          return (
            <div key={b.txt} style={{ opacity: Math.min(g * 1.5, 1) }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ ...mono(38), fontWeight: 700 }}>{b.txt}</span>
                <span style={{ ...mono(38), fontWeight: 700, color: b.color }}>{b.nota}</span>
              </div>
              <div style={{ height: 64, width: `${100 * crece * Math.min(g, 1)}%`, borderRadius: 10, background: b.color, boxShadow: `0 0 30px ${b.color}66` }} />
            </div>
          );
        })}
      </div>
      <StickMundo a={a} c={c} t={t} gorra />
    </>
  );
};
const Dos: React.FC<P> = (p) => (p.t < corte2 ? <DosA {...p} /> : <DosB {...p} />);

// ------------------------------------------------------------------ 4. Sígueme encima de la escena (sigue viva, desenfocada)
const Sigueme: React.FC<P> = (p) => (
  <>
    <AbsoluteFill style={{ filter: "blur(9px)" }}>
      <Dos t={p.t} s={s2} e={fin("dos")} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "rgba(0,0,0,0.6)" }} />
    <CtaSeguir {...p} lema="" sinFondo />
  </>
);

// ------------------------------------------------------------------ 5. Tres: 20 € para aprender a perder dinero de verdad
const s3 = inicio("tres");
const TRES: Clave[] = [
  [s3 + 0.1, { mDx: 0.45, mDy: 0.25, mira: 0.8, boca: 0.4, cejas: 0.3 }],
  [EV["20"] + 0.3, { mDx: 0.15, mDy: -0.52, ...ENCOGE, mira: 0.6, boca: 0.5 }],
  [EV.verdad - 0.6, { mIx: -0.15, mIy: -0.52, mDx: 0.15, mDy: -0.52, mira: 0.6, boca: 0.2, cejas: 0, cabeza: 0.06 }],
];
const Billete: React.FC<{ t: number; t0: number; x: number; y: number; rojo: number }> = ({ t, t0, x, y, rojo }) => {
  const g = muelle(t, t0, 180, 11);
  if (g < 0.01) return null;
  const col = rojo > 0.5 ? ROJO : "#fff";
  return (
    <div style={{ position: "absolute", left: x, top: y - 260 * (1 - Math.min(g, 1)), transform: `translate(-50%, -50%) perspective(900px) rotateX(${18 + 8 * Math.sin(t * 2.2)}deg) rotateY(${14 * Math.sin(t * 1.6)}deg) rotate(-6deg)`, opacity: Math.min(g * 2, 1) }}>
      <div style={{ width: 420, height: 220, borderRadius: 18, border: `4px solid ${col}`, background: "rgba(0,0,0,0.9)", boxShadow: `0 0 40px ${col}44`, position: "relative" }}>
        <div style={{ position: "absolute", inset: 14, borderRadius: 10, border: `2px solid ${col}`, opacity: 0.5 }} />
        <div style={{ position: "absolute", left: 30, top: 24, ...mono(34), color: col }}>20</div>
        <div style={{ position: "absolute", right: 30, bottom: 22, ...mono(34), color: col }}>20</div>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", ...mono(92), fontWeight: 700, color: col }}>{rojo > 0.5 ? "−20 €" : "20 €"}</div>
      </div>
    </div>
  );
};
const Tres: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.3, -0.3, 0], L(t, s, e, 5.0, 4.6) - 0.2 * golpe(t, EV["20"] - 0.05), L(t, s, e, -0.12, 0.12), 0.1, { apertura: 38, centroY: 1080 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  // Mesa
  cristal(tr, [0.15, -0.55, -0.4], [1.0, -0.48, 0.3], "#fff", 0.9, 0.15, 0.06);
  for (const x of [0.25, 0.9]) tr.push({ t: "l", a: [x, -0.55, -0.05], b: [x, -1, -0.05], w: 2.4, o: 0.7 });
  const pr = proyector(cam);
  const qb = pr([0.58, -0.1, 0]);
  const c = cuerpoEn(t, TRES, { mira: 0.8 }, s - 0.3);
  const a = anclaje(cam, [-0.12, -1, 0.6], 0.46);
  const rojo = L(t, EV.verdad - 0.7, EV.verdad - 0.4, 0, 1);
  const tachaGanar = L(t, EV.ganar - 0.1, EV.ganar + 0.2, 0, 1);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", top: 300, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ ...mono(40), opacity: L(t, s + 0.2, s + 0.5, 0, 1), padding: "10px 24px", border: "3px solid #fff", borderRadius: 14, background: "#000" }}>CANTIDAD RIDÍCULA</div>
        <div style={{ position: "relative", ...mono(50), fontWeight: 700, opacity: L(t, EV.ganar - 0.5, EV.ganar - 0.2, 0, 1) }}>
          PARA GANAR
          <div style={{ position: "absolute", left: -10, top: "50%", height: 7, width: `${(tachaGanar * 100 + 4).toFixed(0)}%`, background: ROJO, opacity: tachaGanar > 0 ? 1 : 0 }} />
        </div>
        <div style={{ ...mono(50), fontWeight: 700, color: VERDE, opacity: L(t, EV.verdad - 1.2, EV.verdad - 0.8, 0, 1) }}>PARA APRENDER A PERDER ✓</div>
      </div>
      <Billete t={t} t0={EV["20"] - 0.35} x={qb.x} y={qb.y} rojo={rojo} />
      <StickMundo a={a} c={c} t={t} gorra />
      <FlashRojo t={t} t0={EV.verdad - 0.45} o={0.1} />
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: cuando perder 20 no te cambie el pulso, sube (20 → 50 → 100)
const sG = inicio("giro");
const ESCALONES: [number, string][] = [[-0.35, "20 €"], [0.2, "50 €"], [0.75, "100 €"]];
const GIRO: Clave[] = [
  [sG + 0.1, { mira: 0.6, boca: 0.3 }],
  [EV.sube - 0.35, { y: 0.55, mIx: -0.3, mIy: -0.3, mDx: 0.3, mDy: -0.3 }],
  [EV.sube - 0.1, { y: 0.95, ...BRAZOS_ARRIBA, boca: 1, abre: 0.5, ojos: 1.15, pIy: 0.2, pDy: 0.2 }],
  [EV.sube + 0.15, { y: 0.79, pIy: 0, pDy: 0, mIx: -0.15, mIy: -0.52, mDx: 0.15, mDy: -0.52, boca: 0.6, abre: 0 }],
];
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.2, -0.35, 0], L(t, s, e, 5.0, 4.6), L(t, s, e, -0.2, -0.02), 0.12, { apertura: 38, centroY: 1080 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  ESCALONES.forEach(([x], i) => {
    const alto = 0.22 + i * 0.22;
    const activo = i === 0 || (i === 1 && t > EV.sube - 0.1);
    cristal(tr, [x - 0.25, -1, -0.3], [x + 0.25, -1 + alto, 0.3], activo ? VERDE : "#fff", activo ? 1 : 0.6, activo ? 0.4 : 0.1, activo ? 0.2 : 0.05);
  });
  const salto = suave(L(t, EV.sube - 0.25, EV.sube + 0.05, 0, 1, (u) => u));
  const px = ESCALONES[0][0] + (ESCALONES[1][0] - ESCALONES[0][0]) * salto;
  const py = -1 + 0.22 + 0.22 * salto + 0.25 * Math.sin(Math.PI * salto);
  const a = anclaje(cam, [px, py, 0.05], 0.45);
  const c = cuerpoEn(t, GIRO, { mira: 0.6 }, s - 0.3);
  const pr = proyector(cam);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {ESCALONES.map(([x, txt], i) => {
        const q = pr([x, -1 + 0.22 + i * 0.22, 0.3]);
        return (
          <Rotulo key={txt} x={q.x} y={q.y} ancla="translate(-50%, 30%)" size={40} color={i === 0 || (i === 1 && t > EV.sube - 0.1) ? VERDE : "#fff"}>
            {txt}
          </Rotulo>
        );
      })}
      <Pulso x={250} y={300} w={500} h={110} t={t} lpm={70} color={VERDE} titulo="PIERDES 20 € · PULSO" o={L(t, s, s + 0.3, 0, 1)} />
      <StickMundo a={a} c={c} t={t} gorra />
      <FlashVerde t={t} t0={EV.sube - 0.05} o={0.12} />
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta: ¿tú también eras millonario en demo?
const Pregunta: React.FC<P> = (p) => <PreguntaDos {...p} izq={{ texto: "NO", sub: "EMPECÉ EN REAL", t0: EV.millonario - 0.4 }} der={{ texto: "SÍ", sub: "MILLONARIO EN DEMO", t0: EV.millonario + 0.3 }} pie="ETIQUETA A ESE AMIGO" tPie={EV.etiqueta} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, pregunta: Pregunta };
export const CLAVES = claves([["300", VERDE], ["11", ROJO], "estrategia", "gráfico", "duele", "temblaba", ["ganaba", VERDE], ["perdía", ROJO], "sígueme", "ridícula", ["20", VERDE], "ganar", "perder", "pulso", ["sube", VERDE], "millonario", "etiqueta"]);

const GANCHO = { lineas: ["En demo: *+300_%*", "En real: *11_días*"], hasta: EV["11"] + 0.5, colores: [VERDE, ROJO] };
export const Demo: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/demo_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.1} empujes={0.05} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} />
);
