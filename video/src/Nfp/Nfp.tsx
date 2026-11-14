// Reel de alcance "Hay un viernes al mes en el que, a las 14:30, el mercado se vuelve loco" (~35 s). Solo subtítulos abajo
// y el «sígueme» grande en medio. Escenas 3D en wireframe (blanco y negro con rojo y verde puntuales) con el stickman 2D
// dentro: calendario con el primer viernes y reloj a 14:30 cuando el precio explota; la ficha del dato de empleo y los
// 12 primeros viernes del año (sin stickman); tres monitores que se disparan; el «sígueme»; la orden que se ejecuta lejos
// de su precio (deslizamiento); el calendario económico con la fila en rojo; y la pregunta NUNCA o ME PILLÓ.
// Tiempos en src/gen/nfp.json (scripts/nfp.py).
import React from "react";
import { useCurrentFrame } from "remotion";
import datos from "../gen/nfp.json";
import { ANCHO } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { cristal, ROJO, suelo, VERDE } from "../Bot/kit";
import { monitor } from "../Bot/monigote";
import { Clave, cuerpoEn, Estado, Stick } from "../Bot/stick";
import { Suelo, SUELO_Y } from "../Bot/plato";
import { anclaje, CHOQUE, Exclama, FlashRojo, MANOS_CABEZA, SiguemeStick, StickMundo } from "../Bot/comun";
import { CamaraTiembla, fr, PreguntaDos } from "../Bot/historia";
import { claves, golpe, Montaje, P, sacude } from "../Explica/Montaje";

export const NFP_FPS = datos.fps;
export const NFP_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;

// Línea de precio con latigazos: tranquila hasta t0 y desbocada después (picos que alternan rojo y verde)
const latigazos = (tr: Trazo[], t: number, t0: number, x0: number, x1: number, y: number, z: number, amp: number, n = 40, semilla = 1) => {
  const loco = t < t0 ? 0 : Math.min(1, (t - t0) / 0.25);
  const pts: V3[] = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const ruido = Math.sin(i * 1.7 + semilla + t * 2) * 0.012;
    const pico = loco * amp * Math.sin(i * 2.3 + semilla * 3 + t * 18) * (0.4 + 0.6 * fr(Math.sin(i * 12.9 + semilla) * 437.5)) * (u > 0.45 ? 1 : 0.15);
    pts.push([x0 + (x1 - x0) * u, y + ruido + pico, z]);
  }
  tr.push({ t: "p", pts: pts.slice(0, Math.ceil(n * 0.5)), w: 2.4, o: 1, luz: 0.3 });
  if (loco > 0) {
    for (let i = Math.ceil(n * 0.5) - 1; i < n - 1; i++) tr.push({ t: "l", a: pts[i], b: pts[i + 1], w: 3, o: 1, color: pts[i + 1][1] > pts[i][1] ? VERDE : ROJO, luz: 0.5 });
  } else tr.push({ t: "p", pts: pts.slice(Math.ceil(n * 0.5) - 1), w: 2.4, o: 1, luz: 0.3 });
  return pts[n - 1];
};

// ------------------------------------------------------------------ 1. Hook: el primer viernes, el reloj llega a 14:30 y el precio explota
const Hook: React.FC<P> = ({ t, s, e }) => {
  const baja = L(t, EV.media - 0.2, EV.media + 0.5, 0, 1, (u) => u * u * (3 - 2 * u));
  const cam = orbita([0, 0.42 - 0.6 * baja, 0], L(t, s, e, 5.4, 4.9), L(t, s, e, -0.2, 0.15) + sacude(t, EV.loco - 0.05, 0.05), 0.12, { apertura: 38, centroY: 820 });
  const tr: Trazo[] = [...polvo(0.3)];
  suelo(tr, t, -1.0, 0.16, "#fff", 0.2);
  // Calendario del mes, flotando detrás
  const explota = L(t, EV.loco - 0.05, EV.loco + 0.6, 0, 1, (u) => u * u);
  for (let f = 0; f < 5; f++)
    for (let c = 0; c < 7; c++) {
      const idx = f * 7 + c;
      if (idx < 2 || idx > 32) continue;
      const g = Math.min(muelle(t, -0.4 + idx * 0.012, 220, 14), 1.05);
      if (g <= 0) continue;
      const primero = f === 0 && c === 4;
      const dx = explota * (c - 3) * 0.25 * (1 + fr(Math.sin(idx * 7.1) * 99.3));
      const dy = explota * (2 - f) * 0.2 - explota * explota * 0.8;
      const x = -0.84 + c * 0.28 + dx;
      const y = 0.95 - f * 0.26 + dy;
      const lado = 0.11 * g;
      const luce = primero ? L(t, EV.viernes - 0.1, EV.viernes + 0.2, 0, 1) : 0;
      cristal(tr, [x - lado, y - lado, -0.9], [x + lado, y + lado, -0.86], primero && luce > 0 ? ROJO : "#fff", primero ? 1 : 0.45, 0.1 + 0.8 * luce * (0.7 + 0.3 * Math.sin(t * 8)), primero ? 0.1 + 0.4 * luce : 0.03);
    }
  // Línea de precio delante: tranquila… y loca a las 14:30
  latigazos(tr, t, EV.loco - 0.15, -1.2, 1.2, -0.45, 0.2, 0.32, 48, 2);
  const pr = proyector(cam);
  const segs = Math.min(60, Math.max(57, 57 + Math.floor((t - (EV.media - 2.6)) / 0.9)));
  const llega = t >= EV.media - 0.05;
  const hora = llega ? "14:30:00" : `14:29:${segs}`;
  const qv = pr([-0.84 + 4 * 0.28, 0.95 + 0.17, -0.86]);
  const dias = ["L", "M", "X", "J", "V", "S", "D"];
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <CamaraTiembla t={t} t0={EV.loco - 0.05}>
        {explota < 0.3 &&
          dias.map((d, c) => {
            const q = pr([-0.84 + c * 0.28, 1.13, -0.86]);
            return (
              <div key={d} style={{ position: "absolute", left: q.x, top: q.y, transform: "translate(-50%, -50%)", ...mono(28, c === 4 ? 1 : 0.5), color: c === 4 && t > EV.viernes ? ROJO : undefined, opacity: 1 - explota * 3 }}>
                {d}
              </div>
            );
          })}
        {t > EV.viernes && explota < 0.3 && (
          <div style={{ position: "absolute", left: qv.x, top: qv.y - 20, transform: "translate(-50%, -100%)", ...mono(26), color: ROJO, opacity: 1 - explota * 3 }}>PRIMER VIERNES</div>
        )}
        <div style={{ position: "absolute", top: 220, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, EV.viernes + 0.6, EV.viernes + 0.9, 0, 1) }}>
          <span style={{ ...mono(120), fontWeight: 700, fontVariantNumeric: "tabular-nums", color: llega ? ROJO : "#fff", textShadow: llega ? "0 0 40px rgba(255,77,94,0.7)" : undefined, transform: `scale(${1 + 0.15 * golpe(t, EV.media - 0.05)})` }}>{hora}</span>
        </div>
      </CamaraTiembla>
      <FlashRojo t={t} t0={EV.loco - 0.05} o={0.2} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: la ficha del dato de empleo y los 12 primeros viernes del año (sin stickman)
const INICIOS = [3, 6, 0, 3, 5, 1, 3, 6, 2, 4, 0, 2]; // día de la semana en que empieza cada mes (0 = lunes)
const Uno: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.85, 0.05], L(t, s, e, 3.7, 3.3), L(t, s, e, 0.15, -0.12), 0.85, { apertura: 38, centroY: 1020 });
  const tr: Trazo[] = [...polvo(0.25)];
  // Doce meses en una mesa 4×3, cada uno con su primer viernes que se enciende en rojo
  INICIOS.forEach((ini, m) => {
    const g = Math.min(muelle(t, s + 0.1 + m * 0.04, 220, 14), 1.05);
    if (g <= 0) return;
    const cx = -0.9 + (m % 4) * 0.6;
    const cz = -0.5 + Math.floor(m / 4) * 0.55;
    const y = -0.85;
    const w = 0.24 * g;
    tr.push({ t: "p", pts: [[cx - w, y, cz - w * 0.75], [cx + w, y, cz - w * 0.75], [cx + w, y, cz + w * 0.75], [cx - w, y, cz + w * 0.75], [cx - w, y, cz - w * 0.75]], w: 1.6, o: 0.8 });
    const viernes = ((4 - ini + 7) % 7) + ini;
    const enciende = t >= EV.primer - 0.1 + m * 0.11;
    for (let k = 0; k < 35; k++) {
      const col = k % 7;
      const fil = Math.floor(k / 7);
      const px = cx - w + (col + 0.5) * ((2 * w) / 7);
      const pz = cz - w * 0.75 + (fil + 0.5) * ((1.5 * w) / 5);
      const esV = k === viernes;
      if (k < ini) continue;
      tr.push({ t: "e", c: [px, y + 0.002, pz], r: esV && enciende ? 0.014 : 0.006, tipo: "punto", o: esV && enciende ? 1 : 0.45, luz: esV && enciende ? 1 : 0.2, color: esV && enciende ? ROJO : undefined });
    }
  });
  const ficha = muelle(t, EV.empleo - 0.3, 200, 14);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {ficha > 0.01 && (
        <div style={{ position: "absolute", left: 90, top: 360, width: 900, perspective: 1500, opacity: Math.min(ficha * 1.5, 1) }}>
          <div style={{ borderRadius: 22, border: "3px solid #fff", background: "rgba(5,5,5,0.92)", padding: "26px 34px", display: "flex", alignItems: "center", gap: 30, transform: `rotateX(${(1 - Math.min(ficha, 1)) * 60 + 8}deg) scale(${0.8 + 0.2 * Math.min(ficha, 1.05)})` }}>
            <span style={{ ...mono(58), fontWeight: 700 }}>14:30</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              <span style={mono(26, 0.6)}>{t > EV.unidos - 0.3 ? "EE. UU. · USD" : "· · ·"}</span>
              <span style={{ ...mono(40), whiteSpace: "nowrap" }}>EMPLEO (NFP)</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 22, height: 44, borderRadius: 5, background: t > EV.empleo + 0.2 + i * 0.12 ? ROJO : "rgba(255,255,255,0.2)", boxShadow: t > EV.empleo + 0.2 + i * 0.12 ? "0 0 14px rgba(255,77,94,0.8)" : undefined }} />
              ))}
            </div>
          </div>
        </div>
      )}
      <div style={{ position: "absolute", top: 600, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, EV.primer - 0.2, EV.primer + 0.1, 0, 1) }}>
        <span style={{ ...mono(32), color: ROJO }}>{`${Math.min(12, Math.max(0, Math.floor((t - EV.primer + 0.1) / 0.11) + 1))} / 12 PRIMEROS VIERNES`}</span>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: dólar, oro e índices se disparan uno tras otro
const s2 = inicio("dos");
const DOS: Clave[] = [
  [EV.dolar - 0.2, { mira: -1, cabeza: -0.08, ojos: 1.2, cejas: 0.5 }],
  [EV.oro - 0.2, { mira: 0, cabeza: 0 }],
  [EV.indices - 0.2, { mira: 1, cabeza: 0.08 }],
  [EV.saltos - 0.1, { ...CHOQUE, agobio: 0.9, mira: 0 }],
  [EV.otro - 0.3, { ...MANOS_CABEZA }],
];
const Dos: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.3, 0], L(t, s, e, 5.6, 5.1) - 0.2 * golpe(t, EV.saltos), L(t, s, e, -0.12, 0.12) + sacude(t, EV.saltos - 0.05, 0.04), 0.12, { apertura: 38, centroY: 900 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.16, "#fff", 0.3);
  const pantallas: [number, number, number, string][] = [
    [-0.68, -0.3, EV.dolar, "USD"],
    [0, -0.55, EV.oro, "ORO"],
    [0.68, -0.3, EV.indices, "ÍNDICES"],
  ];
  const pr = proyector(cam);
  const rotulos = pantallas.map(([x, z, t0, nombre], i) => {
    tr.push({ t: "l", a: [x, -1, z], b: [x, -0.22, z], w: 2, o: 0.8 });
    monitor(tr, [x, 0.0, z], 0.56, 0.4, (p) => {
      const a = p(0, 0.5);
      const b = p(1, 0.5);
      latigazos(tr, t, t0, a[0] + 0.02, b[0] - 0.02, a[1], a[2], 0.13 + 0.04 * Math.min(1, Math.max(0, t - EV.saltos)), 30, i + 1);
    });
    return { q: pr([x, 0.27, z]), nombre, activo: t >= t0 };
  });
  const base = cuerpoEn(t, DOS, { mira: 0.2 }, s - 0.3);
  const c: Estado = t > EV.saltos ? { ...base, cabeza: base.cabeza + 0.12 * Math.sin(t * 9), x: base.x + 0.02 * Math.sin(t * 13) } : base;
  const a = anclaje(cam, [0, -1, 0.55], 0.5);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {rotulos.map(({ q, nombre, activo }) => (
        <div key={nombre} style={{ position: "absolute", left: q.x, top: q.y, transform: `translate(-50%, -100%) scale(${activo ? 1.1 : 1})`, ...mono(32), fontWeight: 700, color: activo ? ROJO : "#fff", letterSpacing: "0.1em" }}>
          {nombre}
        </div>
      ))}
      <StickMundo a={a} c={c} t={t} />
      <Exclama t={t} t0={EV.saltos - 0.05} c={c} {...a} />
    </>
  );
};

// ------------------------------------------------------------------ 4. Sígueme
const Sigueme: React.FC<P> = (p) => <SiguemeStick {...p} lema="" />;

// ------------------------------------------------------------------ 5. Tres: tu orden se ejecuta mucho más lejos de donde la pusiste
const s3 = inicio("tres");
const NIVELES = [1.086, 1.0855, 1.085, 1.0845, 1.084, 1.0835, 1.083, 1.0825];
const yNivel = (p: number) => -0.85 + ((p - 1.0825) / (1.086 - 1.0825)) * 1.3;
const ORDEN = 1.085;
const EJECUTA = 1.0832;
const TRES: Clave[] = [
  [s3 + 0.05, { mDx: 0.5, mDy: 0.2, mira: 0.8, boca: 0.3, cejas: 0.2 }],
  [EV.lejos - 0.1, { ...CHOQUE, incl: -0.06 }],
  [EV.pusiste + 0.2, { ...MANOS_CABEZA }],
];
const Tres: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.0, -0.2, 0], L(t, s, e, 4.9, 4.4) - 0.25 * golpe(t, EV.lejos), L(t, s, e, -0.12, 0.1) + sacude(t, EV.lejos - 0.05, 0.03), 0.1, { apertura: 38, centroY: 880 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  // Escala de precios
  const xe = 0.42;
  tr.push({ t: "l", a: [xe, -0.9, 0], b: [xe, 0.5, 0], w: 2, o: 0.8 });
  NIVELES.forEach((p) => tr.push({ t: "l", a: [xe - 0.04, yNivel(p), 0], b: [xe + 0.04, yNivel(p), 0], w: 1.6, o: 0.7 }));
  // La orden: línea discontinua con su bandera
  const yo = yNivel(ORDEN);
  tr.push({ t: "l", a: [-0.25, yo, 0], b: [xe + 0.5, yo, 0], w: 2, o: 0.9, dash: "10 8" });
  // El precio: baja tranquilo, se acelera y salta la orden; se ejecuta mucho más abajo
  const u = L(t, EV.movimiento + 0.2, EV.lejos - 0.05, 0, 1, (v) => v * v * v);
  const precio = 1.0858 - (1.0858 - EJECUTA) * u + (u < 1 ? 0.00008 * Math.sin(t * 40) * u : 0);
  const yp = yNivel(precio);
  cristal(tr, [xe + 0.12, yp, -0.03], [xe + 0.18, yNivel(1.0858), 0.03], u > 0.05 ? ROJO : "#fff", 1, 0.4, 0.3);
  tr.push({ t: "e", c: [xe + 0.15, yp, 0.04], r: 0.02, tipo: "punto", o: 1, luz: 1, color: ROJO });
  const ye = yNivel(EJECUTA);
  const ejec = muelle(t, EV.lejos - 0.05, 260, 12);
  if (ejec > 0.01) {
    tr.push({ t: "l", a: [-0.25, ye, 0], b: [xe + 0.5, ye, 0], w: 2.4, o: Math.min(1, ejec), color: ROJO, luz: 0.5 });
    const k = Math.min(1, Math.max(0, (t - EV.pusiste + 0.3) / 0.4));
    if (k > 0) {
      const xm = xe + 0.36;
      tr.push({ t: "l", a: [xm, yo, 0.02], b: [xm, yo + (ye - yo) * k, 0.02], w: 3, o: 1, color: ROJO, luz: 0.6 });
      tr.push({ t: "l", a: [xm - 0.04, yo, 0.02], b: [xm + 0.04, yo, 0.02], w: 3, o: 1, color: ROJO });
      if (k >= 1) tr.push({ t: "l", a: [xm - 0.04, ye, 0.02], b: [xm + 0.04, ye, 0.02], w: 3, o: 1, color: ROJO });
    }
  }
  const pr = proyector(cam);
  const etiquetas = NIVELES.map((p) => ({ p, q: pr([xe + 0.06, yNivel(p), 0]) }));
  const qo = pr([-0.25, yo, 0]);
  const qe = pr([-0.25, ye, 0]);
  const qm = pr([xe + 0.42, (yo + ye) / 2, 0.02]);
  const c = cuerpoEn(t, TRES, { mira: 0.8 }, s - 0.3);
  const a = anclaje(cam, [-0.5, -1, 0.4], 0.55);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <CamaraTiembla t={t} t0={EV.lejos - 0.05} a={0.02}>
        {etiquetas.map(({ p, q }) => (
          <div key={p} style={{ position: "absolute", left: q.x + 6, top: q.y, transform: "translateY(-50%)", ...mono(22, 0.55) }}>{p.toFixed(4)}</div>
        ))}
        <div style={{ position: "absolute", left: qo.x, top: qo.y - 8, transform: "translateY(-100%)", padding: "6px 14px", borderRadius: 8, border: "2px solid #fff", background: "#000", ...mono(28), whiteSpace: "nowrap" }}>{`⚑ TU ORDEN ${ORDEN.toFixed(4)}`}</div>
        {ejec > 0.01 && (
          <div style={{ position: "absolute", left: qe.x, top: qe.y + 10, transform: `scale(${Math.min(ejec, 1.08)})`, transformOrigin: "0% 0%", padding: "6px 14px", borderRadius: 8, border: `2px solid ${ROJO}`, background: "#000", ...mono(28), color: ROJO, whiteSpace: "nowrap" }}>{`EJECUTADA ${EJECUTA.toFixed(4)}`}</div>
        )}
        {t > EV.pusiste && (
          <div style={{ position: "absolute", left: qm.x - 50, top: qm.y, transform: "translate(-100%, -50%)", ...mono(26), color: ROJO, fontWeight: 700, opacity: L(t, EV.pusiste, EV.pusiste + 0.3, 0, 1), whiteSpace: "nowrap" }}>DESLIZAMIENTO</div>
        )}
        <StickMundo a={a} c={c} t={t} />
        <Exclama t={t} t0={EV.lejos - 0.05} c={c} {...a} />
      </CamaraTiembla>
      <FlashRojo t={t} t0={EV.lejos - 0.05} o={0.16} />
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: antes de abrir nada, mira el calendario; esa hora sale en rojo
const sG = inicio("giro");
const FILAS: [string, string, string, number][] = [
  ["10:00", "EUR", "PMI SERVICIOS", 1],
  ["14:30", "USD", "EMPLEO (NFP)", 3],
  ["16:00", "USD", "CONFIANZA MICHIGAN", 2],
];
const GIRO: Clave[] = [
  [sG + 0.1, { mDx: 0.06, mDy: 0.13, mira: 0.7, boca: 0.1, cejas: 0.3 }],
  [EV.hora - 0.2, { mDx: 0.5, mDy: 0.35, mira: 0.8, cejas: 0.6, ojos: 1.15 }],
  [EV.rojo + 0.1, { mDx: 0.15, mDy: -0.45, mIx: -0.13, mIy: -0.42, boca: 0.5, ojos: 0.9, cabeza: 0.08 }],
];
const Giro: React.FC<P> = ({ t, s, e }) => {
  const tabla = muelle(t, EV.calendario - 0.35, 180, 14);
  const marca = L(t, EV.hora - 0.25, EV.hora + 0.05, 0, 1);
  const rojo = t >= EV.rojo - 0.05;
  const late = rojo ? 0.6 + 0.4 * Math.sin((t - EV.rojo) * 7) : 0;
  const c = cuerpoEn(t, GIRO, { mira: 0.6 }, s - 0.3);
  return (
    <>
      <Escena cam={orbita([0, -0.3, 0], 6, L(t, s, e, -0.25, 0.2), 0.15, { apertura: 40, centroY: 900 })} trazos={[...polvo(0.3)]} />
      <div style={{ position: "absolute", left: 70, top: 360, width: 940, perspective: 1600, opacity: Math.min(Math.max(tabla, 0) * 1.5, 1) }}>
        <div style={{ borderRadius: 24, border: "3px solid #fff", background: "rgba(5,5,5,0.94)", padding: "22px 0 10px", transform: `rotateX(${(1 - Math.min(Math.max(tabla, 0), 1)) * 70 + 6}deg) rotateY(${-6 + 4 * Math.sin(t * 0.6)}deg)` }}>
          <div style={{ padding: "0 30px 16px", display: "flex", justifyContent: "space-between", borderBottom: "2px solid rgba(255,255,255,0.3)" }}>
            <span style={mono(28, 0.85)}>CALENDARIO ECONÓMICO</span>
            <span style={mono(28, 0.5)}>VIERNES</span>
          </div>
          {FILAS.map(([h, mon, ev, imp], i) => {
            const clave = i === 1;
            const g = muelle(t, EV.calendario - 0.15 + i * 0.12, 220, 14);
            return (
              <div key={h} style={{ margin: "10px 14px", padding: "16px 18px", borderRadius: 14, display: "flex", alignItems: "center", gap: 22, opacity: Math.min(Math.max(g, 0) * 1.5, 1), border: clave ? `3px solid ${rojo ? ROJO : `rgba(255,255,255,${marca})`}` : "3px solid transparent", background: clave && rojo ? `rgba(255,77,94,${0.12 + 0.12 * late})` : "transparent", boxShadow: clave && rojo ? `0 0 ${40 * late}px rgba(255,77,94,0.5)` : undefined }}>
                <span style={{ ...mono(36), fontWeight: 700, color: clave && rojo ? ROJO : "#fff" }}>{h}</span>
                <span style={mono(28, 0.6)}>{mon}</span>
                <span style={{ ...mono(30), flex: 1, whiteSpace: "nowrap", color: clave && rojo ? ROJO : "#fff" }}>{ev}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {[0, 1, 2].map((k) => (
                    <div key={k} style={{ width: 14, height: 30, borderRadius: 4, background: k < imp ? (imp === 3 && rojo ? ROJO : "#fff") : "rgba(255,255,255,0.2)" }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Suelo />
      <Stick c={c} ox={300} oy={SUELO_Y} s={300} t={t} />
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta: ¿te ha pillado un dato con una operación abierta?
const Pregunta: React.FC<P> = (p) => <PreguntaDos {...p} izq={{ texto: "NUNCA", t0: EV.pillado + 0.4 }} der={{ texto: "ME PILLÓ", t0: EV.abierta - 0.3 }} pie="ETIQUETA AL QUE OPERA SIN MIRAR EL CALENDARIO" tPie={EV.etiqueta} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, pregunta: Pregunta };
export const CLAVES = claves(["viernes", ["loco", ROJO], "empleo", "primer", "dólar", "oro", "índices", ["saltos", ROJO], "sígueme", "orden", ["lejos", ROJO], "calendario", ["rojo", ROJO], "pillado", "etiqueta"]);

export const Nfp: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/nfp_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />;
