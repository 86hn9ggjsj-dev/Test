// Reel de alcance "Un bot perdió casi 10 millones de dólares por minuto durante 45 minutos" (~36 s). Solo subtítulos
// abajo. Escenas 3D en wireframe (blanco y negro con rojo y verde puntuales) con dos personajes 2D: el bot (robot con
// ojos LED) y el ingeniero (stickman). El bot desbocado escupiendo órdenes con el reloj de 45 minutos; el rack de ocho
// servidores que se actualizan menos uno; la campana de apertura y el bot loco; el «sígueme»; el ingeniero tira del
// enchufe (−440 M $); lo que le faltaba: límite de pérdidas y botón de apagado; y la pregunta SÍ o NO.
// Tiempos en src/gen/knight.json (scripts/knight.py).
import React from "react";
import { useCurrentFrame } from "remotion";
import datos from "../gen/knight.json";
import { ANCHO } from "../Viral/util";
import { euros, L, mono, muelle } from "../Bot/piezas";
import { Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { cristal, ROJO, suelo, VERDE } from "../Bot/kit";
import { Clave, cuerpoEn, Estado } from "../Bot/stick";
import { anclaje, BRAZOS_ARRIBA, CHOQUE, ENCOGE, FlashRojo, MANOS_CABEZA, SiguemeStick, StickMundo } from "../Bot/comun";
import { CamaraTiembla, FlashVerde, fr, Marcador, PreguntaDos } from "../Bot/historia";
import { claves, golpe, Montaje, P, sacude } from "../Explica/Montaje";

export const KNIGHT_FPS = datos.fps;
export const KNIGHT_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;

// Órdenes que salen disparadas desde un punto: papelitos que giran y se alejan
const ordenes = (tr: Trazo[], t: number, desde: V3, cada: number, t0: number, t1: number, fuerza = 1, color = "#fff") => {
  for (let k = 0; k < 40; k++) {
    const nace = t0 + (Math.floor((t - t0) / cada) - k) * cada;
    if (nace < t0 || nace > t1) continue;
    const u = (t - nace) / 0.9;
    if (u < 0 || u > 1) continue;
    const semilla = Math.floor(nace / cada);
    const ang = -0.3 + fr(Math.sin(semilla * 12.9898) * 43758.5) * 1.6;
    const v = (0.9 + 0.8 * fr(Math.sin(semilla * 78.233) * 9631.1)) * fuerza;
    const x = desde[0] + Math.cos(ang) * v * u;
    const y = desde[1] + Math.sin(ang) * v * u * 0.8 + 0.5 * u - 0.7 * u * u;
    const z = desde[2] + (fr(Math.sin(semilla * 3.7) * 512.3) - 0.5) * 0.6 * u;
    const g = semilla * 1.7 + u * 6;
    const w = 0.045;
    const h = 0.03;
    const p = (dx: number, dy: number): V3 => [x + dx * Math.cos(g) - dy * Math.sin(g), y + dx * Math.sin(g) + dy * Math.cos(g), z];
    tr.push({ t: "p", pts: [p(-w, -h), p(w, -h), p(w, h), p(-w, h), p(-w, -h)], w: 1.4, o: 1 - u * 0.6, color, relleno: color, oRelleno: 0.25 });
  }
};

// Rack de servidores; viejo: índice del que se queda con el código antiguo; hecho: cuántos se han actualizado (0…8)
const rack = (tr: Trazo[], c: V3, t: number, hecho: number, viejo: number, apagado = 0, alarma = 0) => {
  const [x, y, z] = c;
  cristal(tr, [x - 0.36, y, z - 0.3], [x + 0.36, y + 1.6, z + 0.3], "#fff", 0.9, 0.12, 0.04);
  const unidades: V3[] = [];
  for (let i = 0; i < 8; i++) {
    const y0 = y + 0.08 + i * 0.19;
    const zf = z + 0.301;
    tr.push({ t: "p", pts: [[x - 0.32, y0, zf], [x + 0.32, y0, zf], [x + 0.32, y0 + 0.15, zf], [x - 0.32, y0 + 0.15, zf], [x - 0.32, y0, zf]], w: 1.6, o: 0.9, relleno: "#000", oRelleno: 0.8 });
    tr.push({ t: "l", a: [x - 0.05, y0 + 0.075, zf], b: [x + 0.26, y0 + 0.075, zf], w: 1, o: 0.35 });
    const malo = i === viejo;
    const ok = !malo && i < hecho;
    const parpadeo = malo ? (Math.floor(t * 6) % 2 ? 1 : 0.25) : 1;
    const col = malo && (hecho >= 8 || alarma > 0) ? ROJO : ok ? VERDE : "#fff";
    for (let k = 0; k < 3; k++) tr.push({ t: "e", c: [x - 0.26 + k * 0.06, y0 + 0.075, zf + 0.002], r: 0.012, tipo: "punto", o: (1 - apagado) * (malo ? parpadeo : ok ? 1 : 0.5), luz: 0.8 * (1 - apagado), color: col });
    unidades.push([x + 0.33, y0 + 0.075, zf]);
  }
  return unidades;
};

// ------------------------------------------------------------------ 1. Hook: el bot desbocado, casi 10 millones por minuto durante 45 minutos
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.15, -0.3, 0], L(t, s, e, 5.0, 4.4), L(t, s, e, -0.25, 0.15) + 0.01 * Math.sin(t * 37), 0.12, { apertura: 38, centroY: 900 });
  const tr: Trazo[] = [...polvo(0.3)];
  suelo(tr, t, -1.0, 0.16, "#fff", 0.6);
  ordenes(tr, t, [0.05, -0.35, 0.35], 0.07, -0.5, 99, 1.1);
  const c: Estado = { ...cuerpoEn(t, [], { mira: 0.9, mDx: 0.5, mDy: -0.05, mIx: -0.3, mIy: 0.2, boca: -0.3 }), mDy: -0.05 + 0.12 * Math.sin(t * 19), mIy: 0.2 + 0.15 * Math.sin(t * 17 + 1), x: 0.012 * Math.sin(t * 40) };
  const a = anclaje(cam, [-0.28, -1, 0.3], 0.6);
  // Reloj de 0 a 45 minutos y pérdida acumulada (9,8 M $ por minuto)
  const min = L(t, EV["10"] - 0.2, EV["45"] + 0.4, 0, 45, (u) => u);
  const perdida = Math.round((min / 45) * 440) * 1000000;
  const late = 1 + 0.06 * Math.max(0, Math.sin(t * 22));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", top: 300, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: L(t, EV["10"] - 0.3, EV["10"], 0, 1) }}>
        <span style={mono(28, 0.7)}>CADA MINUTO</span>
        <span style={{ ...mono(84), color: ROJO, fontWeight: 600, transform: `scale(${late})` }}>≈ −10.000.000 $</span>
      </div>
      <div style={{ position: "absolute", top: 520, left: 0, width: ANCHO, display: "flex", justifyContent: "center", alignItems: "center", gap: 40, opacity: L(t, EV["45"] - 0.5, EV["45"] - 0.2, 0, 1) }}>
        <svg width={150} height={150} viewBox="-75 -75 150 150">
          <circle r={62} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={8} />
          <circle r={62} fill="none" stroke="#fff" strokeWidth={8} strokeDasharray={`${(min / 45) * 389.6} 400`} transform="rotate(-90)" strokeLinecap="round" />
          <text y={14} textAnchor="middle" fill="#fff" style={{ ...mono(40), fontWeight: 700 }}>{Math.floor(min)}</text>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={mono(26, 0.6)}>{`MINUTO ${Math.floor(min)} DE 45`}</span>
          <span style={{ ...mono(52), color: ROJO, fontVariantNumeric: "tabular-nums" }}>{`−${euros(perdida)} $`}</span>
        </div>
      </div>
      <StickMundo a={a} c={c} t={t} robot ojosColor={ROJO} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: actualizan el software… y se olvidan de un servidor
const s1 = inicio("uno");
const VIEJO = 5;
const ING1: Clave[] = [
  [EV.actualizan - 0.2, { mDx: 0.5, mDy: 0.05, mira: 0.8, boca: 0.5, cejas: 0.3 }],
  [EV.olvidan - 0.3, { mDx: 0.2, mDy: 0.28, boca: 1, abre: 0, ojos: 0.85, mira: -0.2 }],
];
const Uno: React.FC<P> = ({ t, s, e }) => {
  const zoom = L(t, EV.olvidan - 0.2, EV.servidor + 0.2, 0, 1, (u) => u * u * (3 - 2 * u));
  const cam = orbita([0.4 + 0.1 * zoom, -0.25 + 0.05 * zoom, 0], L(t, s, e, 5.2, 4.6) - 2.0 * zoom, L(t, s, e, -0.3, 0.05) + 0.15 * zoom + sacude(t, EV.servidor - 0.05, 0.02), 0.12, { apertura: 38, centroY: 860 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.16, "#fff", 0.2);
  const hecho = L(t, EV.actualizan, EV.olvidan - 0.1, 0, 8.99, (u) => u);
  rack(tr, [0.55, -1, -0.1], t, hecho, VIEJO, 0, t > EV.olvidan ? 1 : 0);
  // Barrido de la actualización
  if (t > EV.actualizan && t < EV.olvidan) {
    const yb = -0.92 + (hecho / 8) * 1.52;
    tr.push({ t: "l", a: [0.15, yb, 0.21], b: [0.95, yb, 0.21], w: 3, o: 0.9, color: VERDE, luz: 0.6 });
  }
  const c = cuerpoEn(t, ING1, { mira: 0.8, boca: 0.3 }, s - 0.3);
  const a = anclaje(cam, [-0.22, -1, 0.35], 0.6);
  const pr = proyector(cam);
  const qr = pr([0.55, 0.68, 0.2]);
  const qv = pr([0.92, -0.92 + VIEJO * 0.19 + 0.075, 0.2]);
  const alarma = muelle(t, EV.olvidan - 0.05, 240, 12);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: qr.x, top: qr.y, transform: "translate(-50%, -100%)", ...mono(30, 0.75), letterSpacing: "0.12em", opacity: L(t, EV.knight - 0.2, EV.knight + 0.1, 0, 1) * (1 - zoom) }}>KNIGHT CAPITAL · 2012</div>
      {t > EV.actualizan && t < EV.olvidan + 0.2 && (
        <div style={{ position: "absolute", left: qr.x, top: qr.y + 50, transform: "translate(-50%, 0)", ...mono(30), color: VERDE }}>{`ACTUALIZANDO… ${Math.min(7, Math.floor(hecho))}/8`}</div>
      )}
      {alarma > 0.01 && (
        <div style={{ position: "absolute", left: Math.min(qv.x + 20, 760), top: qv.y, transform: `translateY(-50%) scale(${Math.min(alarma, 1.08)})`, transformOrigin: "0% 50%", padding: "10px 18px", borderRadius: 12, border: `3px solid ${ROJO}`, background: "#000", ...mono(32), color: ROJO, whiteSpace: "nowrap" }}>← CÓDIGO VIEJO</div>
      )}
      <StickMundo a={a} c={c} t={t} o={1 - zoom} />
      <FlashRojo t={t} t0={EV.servidor - 0.05} o={0.12} />
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: suena la campana, abre el mercado y el bot se vuelve loco
const Campana: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const g = muelle(t, t0 - 0.25, 220, 13);
  if (g <= 0.01) return null;
  const vaiven = 18 * Math.sin((t - t0) * 18) * Math.exp(-Math.max(0, t - t0) * 1.5);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: Math.min(g * 1.5, 1) }}>
      <g transform={`translate(190 360) rotate(${vaiven}) scale(${Math.min(g, 1.05)})`}>
        <line x1={0} y1={-70} x2={0} y2={-40} stroke="#fff" strokeWidth={6} />
        <path d="M-58,50 Q-58,-40 0,-42 Q58,-40 58,50 L72,62 L-72,62 Z" fill="#000" stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
        <circle cx={0} cy={74} r={12} fill="#fff" />
      </g>
      {t > t0 && [0, 1, 2].map((i) => {
        const u = fr((t - t0) * 1.6 - i / 3);
        return <circle key={i} cx={190} cy={370} r={80 + u * 120} fill="none" stroke="#fff" strokeWidth={3} opacity={(1 - u) * 0.6 * Math.exp(-Math.max(0, t - t0) * 0.8)} />;
      })}
      <text x={190} y={500} textAnchor="middle" fill="#fff" style={{ ...mono(28) }} opacity={0.8}>APERTURA</text>
    </svg>
  );
};
const Dos: React.FC<P> = ({ t, s, e }) => {
  const loco = L(t, EV.abre + 0.4, EV.loco - 0.1, 0, 1);
  const cam = orbita([0, -0.3, 0], L(t, s, e, 5.0, 4.4) - 0.25 * golpe(t, EV.loco - 0.05), L(t, s, e, 0.25, -0.2) + 0.015 * loco * Math.sin(t * 41) + sacude(t, EV.loco - 0.05), 0.12, { apertura: 38, centroY: 900 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.16, "#fff", 0.2 + 1.2 * loco);
  rack(tr, [1.05, -1, -0.75], t, 9, VIEJO, 0, 1);
  if (t > EV.abre + 0.3) ordenes(tr, t, [0.0, -0.3, 0.35], 0.04 - 0.02 * loco, EV.abre + 0.3, 99, 1.2 + 0.6 * loco);
  const base = cuerpoEn(t, [[EV.abre + 0.3, { ...BRAZOS_ARRIBA, boca: 0, abre: 0.7, ojos: 1.3 }]], { mira: 0.5, boca: 0.2 }, s - 0.3);
  const c: Estado = { ...base, mIx: base.mIx - 0.12 * loco * Math.sin(t * 15), mIy: base.mIy - 0.25 * loco * Math.abs(Math.sin(t * 13)), mDx: base.mDx + 0.12 * loco * Math.sin(t * 14 + 1), mDy: base.mDy - 0.25 * loco * Math.abs(Math.sin(t * 12 + 2)), cabeza: 0.2 * loco * Math.sin(t * 11), x: 0.02 * loco * Math.sin(t * 33), agobio: loco };
  const a = anclaje(cam, [0, -1, 0.3], 0.62);
  const ops = Math.round(L(t, EV.abre + 0.3, EV["4"] + 0.2, 0, 4000000, (u) => u * u));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Campana t={t} t0={EV.abre} />
      <CamaraTiembla t={t} t0={EV["4"]} a={0.02}>
        <div style={{ position: "absolute", top: 330, right: 70, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, opacity: L(t, EV.abre + 0.2, EV.abre + 0.5, 0, 1) }}>
          <span style={mono(26, 0.7)}>OPERACIONES</span>
          <span style={{ ...mono(76), fontWeight: 600, fontVariantNumeric: "tabular-nums", color: t > EV["4"] ? ROJO : "#fff" }}>{`${euros(ops)}${t > EV["4"] ? "+" : ""}`}</span>
          <span style={{ ...mono(24, 0.6), opacity: L(t, EV.pidio - 0.6, EV.pidio - 0.3, 0, 1) }}>NADIE LAS PIDIÓ</span>
        </div>
        <StickMundo a={a} c={c} t={t} robot ojosColor={t > EV.abre + 0.3 ? ROJO : "#000"} />
      </CamaraTiembla>
    </>
  );
};

// ------------------------------------------------------------------ 4. Sígueme: el bot señala el botón
const Sigueme: React.FC<P> = (p) => <SiguemeStick {...p} lema="" sinTitulo robot extra={[[EV.cualquier - 0.1, { ...ENCOGE, mira: 0 }]]} />;

// ------------------------------------------------------------------ 5. Tres: el ingeniero tira del enchufe; el bot se apaga y la cifra se congela
const s3 = inicio("tres");
const ENCHUFE: V3 = [-0.02, -0.97, 0.3];
const ING3: Clave[] = [
  [s3 + 0.05, { y: 0.62, incl: 0.12, mDx: 0.48, mDy: -0.5, mIx: 0.2, mIy: -0.5, mira: 0.8, cejas: -0.7, boca: -0.4, agobio: 0.8 }],
  [EV.apagan - 0.05, { y: 0.79, incl: -0.15, mDx: 0.05, mDy: -0.2, mIx: -0.15, mIy: -0.2 }],
  [EV["440"] - 0.1, { ...CHOQUE, incl: -0.05 }],
  [EV["440"] + 0.4, { ...MANOS_CABEZA }],
];
const BOT3: Clave[] = [
  [s3, { ...BRAZOS_ARRIBA, abre: 0.6 }],
  [EV.apagan + 0.05, { y: 0.55, agacha: 1, incl: 0.2, mIx: -0.2, mIy: -0.55, mDx: 0.2, mDy: -0.55, abre: 0, ojos: 0.15 }],
];
const Tres: React.FC<P> = ({ t, s, e }) => {
  const off = t >= EV.apagan;
  const cam = orbita([0.2, -0.3, 0], L(t, s, e, 4.9, 4.4) - 0.3 * golpe(t, EV.apagan), L(t, s, e, -0.2, 0.15) + sacude(t, EV.apagan), 0.12, { apertura: 38, centroY: 900 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.16, "#fff", off ? 0 : 1.2);
  rack(tr, [0.95, -1, -0.5], t, 9, VIEJO, off ? 1 : 0, 1);
  if (!off) ordenes(tr, t, [0.3, -0.3, 0.3], 0.03, s, EV.apagan, 1.4);
  // Cable del rack al enchufe; al apagar, el enchufe sale disparado hacia la mano del ingeniero
  const tira = L(t, EV.apagan - 0.05, EV.apagan + 0.2, 0, 1);
  const enchufe: V3 = [ENCHUFE[0] - 0.3 * tira, ENCHUFE[1] + 0.35 * tira, ENCHUFE[2]];
  const cable: V3[] = Array.from({ length: 12 }, (_, i) => {
    const u = i / 11;
    return [0.95 + (enchufe[0] - 0.95) * u, -0.99 + (enchufe[1] + 0.99) * u * u + 0.04 * Math.sin(u * 9) * (1 - u), -0.3 + (enchufe[2] + 0.3) * u];
  });
  tr.push({ t: "p", pts: cable, w: 3, o: 0.9 });
  cristal(tr, [enchufe[0] - 0.04, enchufe[1] - 0.03, enchufe[2] - 0.03], [enchufe[0] + 0.04, enchufe[1] + 0.05, enchufe[2] + 0.03], "#fff", 1, 0.4, 0.3);
  if (t > EV.apagan && t < EV.apagan + 0.5) {
    for (let k = 0; k < 10; k++) {
      const u = (t - EV.apagan) / 0.5;
      const ang = (k / 10) * Math.PI * 2;
      tr.push({ t: "l", a: [ENCHUFE[0] + Math.cos(ang) * 0.05 * u, ENCHUFE[1] + 0.02 + Math.sin(ang) * 0.05 * u, ENCHUFE[2]], b: [ENCHUFE[0] + Math.cos(ang) * 0.14 * u, ENCHUFE[1] + 0.02 + Math.sin(ang) * 0.14 * u, ENCHUFE[2]], w: 2.4, o: 1 - u, color: "#fff", luz: 1 });
    }
  }
  const ci = cuerpoEn(t, ING3, { mira: 0.8 }, s - 0.3);
  const cb0 = cuerpoEn(t, BOT3, { mira: 0.6 }, s - 0.3);
  const cb: Estado = off ? cb0 : { ...cb0, mIy: cb0.mIy - 0.2 * Math.abs(Math.sin(t * 13)), mDy: cb0.mDy - 0.2 * Math.abs(Math.sin(t * 12 + 2)), x: 0.02 * Math.sin(t * 33) };
  const ai = anclaje(cam, [-0.42, -1, 0.4], 0.6);
  const ab = anclaje(cam, [0.42, -1, 0.1], 0.58);
  const apaga = L(t, EV.apagan, EV.apagan + 0.15, 0, 1) * (1 - L(t, EV.apagan + 0.15, EV.apagan + 0.45, 0, 1));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <CamaraTiembla t={t} t0={EV.apagan}>
        <StickMundo a={ab} c={cb} t={t} robot ojosColor={off ? "#555" : ROJO} />
        <StickMundo a={ai} c={ci} t={t + 0.7} />
        <Marcador t={t} t0={EV["440"] - 0.6} t1={EV["440"] + 0.4} hasta={440000000} signo="−" color={ROJO} rotulo="PERDIDOS: MÁS DE" top={330} size={86} />
      </CamaraTiembla>
      {apaga > 0.01 && <div style={{ position: "absolute", left: 0, top: 960 - 2, width: ANCHO, height: 4 + 30 * (1 - apaga), background: "#fff", opacity: apaga, boxShadow: "0 0 40px #fff" }} />}
      <FlashRojo t={t} t0={EV["440"] - 0.1} o={0.18} />
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: no le faltaba ser más listo; le faltaba un límite de pérdidas y un botón de apagado
const Medidor: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const g = muelle(t, t0 - 0.2, 200, 14);
  if (g <= 0.01) return null;
  const aguja = -80 + 125 * Math.min(1, Math.max(0, (t - t0) / 0.8)) - 4 * Math.max(0, Math.sin((t - t0 - 0.8) * 12)) * Math.exp(-Math.max(0, t - t0 - 0.8) * 3);
  const lim = 45;
  const p = (ang: number, r: number) => [Math.sin((ang * Math.PI) / 180) * r, -Math.cos((ang * Math.PI) / 180) * r];
  const arco = (a0: number, a1: number, r: number) => `M${p(a0, r).join(",")} A${r},${r} 0 0 1 ${p(a1, r).join(",")}`;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: Math.min(g * 1.5, 1) }}>
      <g transform={`translate(270 560) scale(${Math.min(g, 1.05)})`}>
        <path d={arco(-90, lim, 150)} fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" opacity={0.85} />
        <path d={arco(lim, 90, 150)} fill="none" stroke={ROJO} strokeWidth={14} strokeLinecap="round" />
        <line x1={p(lim, 120)[0]} y1={p(lim, 120)[1]} x2={p(lim, 180)[0]} y2={p(lim, 180)[1]} stroke="#fff" strokeWidth={6} />
        <line x1={0} y1={0} x2={p(Math.min(aguja, lim), 132)[0]} y2={p(Math.min(aguja, lim), 132)[1]} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
        <circle r={16} fill="#fff" />
        <text y={70} textAnchor="middle" fill="#fff" style={{ ...mono(30) }}>LÍMITE DE</text>
        <text y={108} textAnchor="middle" fill="#fff" style={{ ...mono(30) }}>PÉRDIDAS</text>
      </g>
    </svg>
  );
};
const Seta: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const g = muelle(t, t0 - 0.35, 200, 14);
  if (g <= 0.01) return null;
  const pulsa = golpe(t, t0 + 0.05);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: Math.min(g * 1.5, 1) }}>
      <g transform={`translate(810 600) scale(${Math.min(g, 1.05)})`}>
        <rect x={-110} y={10} width={220} height={90} rx={14} fill="#000" stroke="#fff" strokeWidth={5} />
        <rect x={-60} y={-20 + 18 * pulsa} width={120} height={40} fill="#000" stroke="#fff" strokeWidth={4} />
        <path d={`M-95,${-20 + 18 * pulsa} Q-95,${-110 + 18 * pulsa} 0,${-112 + 18 * pulsa} Q95,${-110 + 18 * pulsa} 95,${-20 + 18 * pulsa} Z`} fill={ROJO} fillOpacity={0.35 + 0.5 * pulsa} stroke={ROJO} strokeWidth={6} />
        <text y={150} textAnchor="middle" fill="#fff" style={{ ...mono(30) }}>APAGADO</text>
      </g>
    </svg>
  );
};
const Birrete: React.FC<{ t: number; t0: number; x: number; y: number }> = ({ t, t0, x, y }) => {
  const g = muelle(t, t0 - 1.0, 220, 13);
  if (g <= 0.01) return null;
  const tacha = L(t, t0 - 0.1, t0 + 0.2, 0, 1);
  const fuera = L(t, t0 + 0.7, t0 + 1.0, 0, 1);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: Math.min(g * 1.5, 1) * (1 - fuera) }}>
      <g transform={`translate(${x} ${y}) scale(${Math.min(g, 1.05)})`}>
        <path d="M-90,0 L0,-40 L90,0 L0,40 Z" fill="#000" stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
        <path d="M-50,18 L-50,58 Q0,82 50,58 L50,18" fill="none" stroke="#fff" strokeWidth={5} />
        <line x1={70} y1={8} x2={78} y2={70} stroke="#fff" strokeWidth={4} />
        <text x={0} y={-60} textAnchor="middle" fill="#fff" style={{ ...mono(30) }}>MÁS LISTO</text>
        {tacha > 0 && <line x1={-110} y1={-90} x2={-110 + 220 * tacha} y2={-90 + 180 * tacha} stroke={ROJO} strokeWidth={12} strokeLinecap="round" />}
        {tacha > 0.5 && <line x1={110} y1={-90} x2={110 - 220 * (tacha - 0.5) * 2} y2={-90 + 180 * (tacha - 0.5) * 2} stroke={ROJO} strokeWidth={12} strokeLinecap="round" />}
      </g>
    </svg>
  );
};
const sG = inicio("giro");
const GIRO: Clave[] = [
  [sG + 0.1, { mira: 0, boca: 0.4, cejas: 0.3 }],
  [EV.limite - 0.2, { mIx: -0.45, mIy: 0.05, mira: -0.9, boca: 0.6 }],
  [EV.apagado - 0.35, { mIx: -0.15, mIy: -0.52, mDx: 0.48, mDy: 0.1, mira: 0.9, boca: 0.8 }],
];
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.35, 0], L(t, s, e, 4.6, 4.2), L(t, s, e, -0.15, 0.15), 0.12, { apertura: 38, centroY: 920 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.16, "#fff", 0.15);
  const c = cuerpoEn(t, GIRO, { mira: 0.2 }, s - 0.3);
  const a = anclaje(cam, [0, -1, 0.3], 0.62);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Birrete t={t} t0={EV.listo} x={540} y={520} />
      <Medidor t={t} t0={EV.limite} />
      <Seta t={t} t0={EV.apagado} />
      <StickMundo a={a} c={c} t={t} robot />
      <FlashVerde t={t} t0={EV.apagado + 0.05} o={0.1} />
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta: ¿le dejarías tu dinero a un bot? SÍ o NO
const Pregunta: React.FC<P> = (p) => {
  return (
    <PreguntaDos
      {...p}
      izq={{ texto: "SÍ", t0: EV.si - 0.05 }}
      der={{ texto: "NO", t0: EV.si + 0.35 }}
      pie="PÁSASELO AL QUE CREE QUE LOS BOTS SON MAGIA"
      tPie={EV.pasaselo}
    />
  );
};

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, pregunta: Pregunta };
export const CLAVES = claves(["bot", ["10", ROJO], "minuto", "45", "knight", "olvidan", "servidor", "loco", ["4", ROJO], "sígueme", "apagan", ["440", ROJO], "listo", ["límite", VERDE], ["apagado", VERDE], "bot", "sí", "no", "pásaselo"]);

export const Knight: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/knight_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />;
