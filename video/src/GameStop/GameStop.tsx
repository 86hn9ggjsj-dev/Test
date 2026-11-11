// Reel 5-30-10 de historia real "Un fondo de 12.000 millones perdió la mitad en un mes" (~42 s): Melvin Capital y
// GameStop (enero de 2021). El rascacielos del fondo con las ventanas en rojo y −53 % frente a una tienda de videojuegos;
// la sala de operaciones vendiendo en corto (gana si cae); miles de pequeños inversores con el móvil y la vela verde de
// 20 $ a más de 400 $; el «sígueme» encima de la escena; dos casas: la de comprar tiene suelo y la de vender en corto no
// tiene techo; la inyección de 2.750 M y el cartel de CERRADO; el stop como techo antes de entrar; y el cierre de
// conversión. Tiempos en src/gen/gamestop.json (scripts/gamestop.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/gamestop.json";
import { ANCHO, SANS } from "../Viral/util";
import { euros, L, mono, muelle } from "../Bot/piezas";
import { Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { cristal, ROJO, suelo, VERDE } from "../Bot/kit";
import { Clave, cuerpoEn } from "../Bot/stick";
import { anclaje, BRAZOS_ARRIBA, ENCOGE, FlashRojo, MANOS_CABEZA, StickMundo } from "../Bot/comun";
import { CamaraTiembla, FlashVerde, Sello } from "../Bot/historia";
import { monigote, POSES, mezclaPose } from "../Bot/monigote";
import { cartelTienda, casa, OFICINA, oficinaFondo, rascacielos, tiendaVideojuegos } from "../Bot/decorados";
import { CierreComenta } from "../Bot/conversion";
import { claves, CtaSeguir, golpe, Montaje, P, sacude } from "../Explica/Montaje";

export const GAMESTOP_FPS = datos.fps;
export const GAMESTOP_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;

// ------------------------------------------------------------------ piezas 2D
const Pildora: React.FC<{ t: number; t0: number; color?: string; size?: number; fin?: number; children: React.ReactNode }> = ({ t, t0, color = "#fff", size = 44, fin: f, children }) => {
  const g = muelle(t, t0, 240, 13);
  const fuera = f === undefined ? 0 : L(t, f - 0.2, f, 0, 1);
  if (g < 0.01 || fuera >= 1) return null;
  return <div style={{ ...mono(size), fontWeight: 700, color, padding: "10px 24px", borderRadius: 14, border: `3px solid ${color}`, background: "rgba(0,0,0,0.9)", opacity: Math.min(g * 1.5, 1) * (1 - fuera), transform: `scale(${0.6 + 0.4 * Math.min(g, 1.1)})`, whiteSpace: "nowrap" }}>{children}</div>;
};
const Arriba: React.FC<{ top?: number; children: React.ReactNode }> = ({ top = 300, children }) => (
  <div style={{ position: "absolute", top, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>{children}</div>
);
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
const Rotulo: React.FC<{ x: number; y: number; size?: number; color?: string; o?: number; ancla?: string; caja?: boolean; children: React.ReactNode }> = ({ x, y, size = 34, color = "#fff", o = 1, ancla = "translate(-50%, -50%)", caja, children }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: ancla, ...mono(size), fontWeight: 700, color, opacity: o, textShadow: "0 0 16px rgba(0,0,0,0.95)", ...(caja ? { padding: "6px 16px", borderRadius: 12, border: `3px solid ${color}`, background: "rgba(0,0,0,0.9)" } : {}) }}>{children}</div>
);
// Flecha 3D (para subidas y bajadas)
const flecha = (tr: Trazo[], a: V3, b: V3, color: string, w = 4, luz = 0.5) => {
  tr.push({ t: "l", a, b, w, o: 1, color, luz });
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l;
  const uy = dy / l;
  const p = 0.07;
  tr.push({ t: "p", pts: [[b[0] - ux * p - uy * p * 0.6, b[1] - uy * p + ux * p * 0.6, b[2]], b, [b[0] - ux * p + uy * p * 0.6, b[1] - uy * p - ux * p * 0.6, b[2]]], w, o: 1, color, luz });
};

// ------------------------------------------------------------------ 1. Hook: el rascacielos del fondo en rojo (−53 %) frente a una tienda de videojuegos
const TORRE: [number, number] = [-0.33, -0.3];
const TIENDA: [number, number] = [0.43, 0.0];
const Hook: React.FC<P> = ({ t, s, e }) => {
  const mira = L(t, EV.mes, EV.videojuegos - 0.2, 0.05, 0.2);
  const cam = orbita([mira, -0.3, -0.2], L(t, s, e, 4.7, 4.3), L(t, s, e, -0.14, 0.08) + sacude(t, EV.mitad - 0.05, 0.025), 0.1, { apertura: 6, centroY: 1080 });
  const tr: Trazo[] = [...polvo(0.12)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.3);
  rascacielos(tr, TORRE[0], TORRE[1], 0.5, 1.75, t, 1);
  tiendaVideojuegos(tr, TIENDA[0], TIENDA[1], t, 0.5 + 0.5 * L(t, EV.videojuegos - 0.6, EV.videojuegos - 0.2, 0, 1));
  const pr = proyector(cam);
  const qc = pr(cartelTienda(TIENDA[0], TIENDA[1]));
  const qt = pr([TORRE[0], -0.62, TORRE[1] + 0.2]);
  const valor = L(t, 0, EV.mitad + 0.4, 12000, 5900, (u) => 1 - Math.pow(1 - u, 2));
  return (
    <>
      <CamaraTiembla t={t} t0={EV.mitad - 0.05} a={0.02}>
        <Escena cam={cam} trazos={tr} />
        <Rotulo x={qt.x} y={qt.y} size={44} color={ROJO} caja>{`${euros(valor)} M $`}</Rotulo>
        <Rotulo x={qc.x} y={qc.y} size={30} o={0.5 + 0.5 * L(t, EV.videojuegos - 0.6, EV.videojuegos - 0.2, 0, 1)}>VIDEOJUEGOS</Rotulo>
      </CamaraTiembla>
      <Ficha t={t} t0={EV.mitad - 0.2} texto="−53 %" color={ROJO} x={ANCHO / 2} y={1330} size={120} fin={EV.mes + 0.5} />
      {t > EV.mes + 0.4 && (
        <div style={{ position: "absolute", top: 760, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
          <Pildora t={t} t0={EV.videojuegos - 0.5} size={70} color={ROJO}>VS</Pildora>
        </div>
      )}
      <FlashRojo t={t} t0={EV.mitad - 0.05} o={0.18} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: la sala de operaciones de Melvin Capital vende GameStop en corto
const s1 = inicio("uno");
const bajada = (u: number) => 0.8 - 0.6 * u + 0.06 * Math.sin(u * 19);
const Uno: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.12, -0.6], L(t, s, e, 4.1, 3.8), L(t, s, e, 0.1, -0.06), 0.1, { apertura: 6, centroY: 1000 });
  const tr: Trazo[] = [...polvo(0.1)];
  oficinaFondo(tr, t, bajada);
  // Flecha que baja en la pantalla central
  const kf = L(t, EV.corto - 0.4, EV.corto + 0.2, 0, 1);
  if (kf > 0) flecha(tr, [0.1, 0.38, OFICINA.ZW + 0.02], [0.1, 0.38 - 0.3 * kf, OFICINA.ZW + 0.02], ROJO, 5);
  const c = cuerpoEn(t, [[s, { mira: 0.6, boca: 0.5, cejas: 0.3, mDx: 0.3, mDy: -0.2 }], [EV.caia - 0.4, { ...ENCOGE, boca: 0.8, mira: 0 }]], { mira: 0.6 }, s - 0.4);
  const a = anclaje(cam, [-0.42, -1, -0.3], 0.42);
  const pr = proyector(cam);
  const qp = pr([0.6, 0.48, OFICINA.ZW]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Rotulo x={qp.x} y={qp.y} size={30}>GME</Rotulo>
      <StickMundo a={a} c={c} t={t} />
      <Arriba>
        <Pildora t={t} t0={EV.enero - 0.2} size={40}>ENERO 2021</Pildora>
        <Pildora t={t} t0={EV.melvin - 0.2} size={50}>MELVIN CAPITAL</Pildora>
      </Arriba>
      <div style={{ position: "absolute", top: 1220, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 20 }}>
        <Pildora t={t} t0={EV.corto - 0.3} size={42} color={ROJO}>VENTA EN CORTO</Pildora>
        <Pildora t={t} t0={EV.caia - 0.5} size={42} color={VERDE}>GANA SI CAE ↓</Pildora>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 3. Dos: miles de pequeños inversores compran y la vela sube de 20 $ a más de 400 $
const s2 = inicio("dos");
const corte2 = EV["20"] - 0.6;
const FILAS = 4;
const COLS = 7;
const Dos: React.FC<P> = ({ t, s, e }) => {
  const sube = L(t, corte2, EV["400"] + 0.2, 0, 1, (u) => u * u * (3 - 2 * u));
  const cam = orbita([0, -0.4 + 0.9 * sube, -0.8], L(t, s, e, 4.0, 4.6), L(t, s, e, -0.08, 0.08) + sacude(t, EV["400"] - 0.05, 0.02), 0.12 - 0.05 * sube, { apertura: 6, centroY: 1020 });
  const tr: Trazo[] = [...polvo(0.12)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.3);
  // Multitud con el móvil: aparecen fila a fila y pulsan COMPRAR (el móvil se pone verde)
  const compran = t > EV.comprar - 0.3;
  for (let f = 0; f < FILAS; f++)
    for (let k = 0; k < COLS; k++) {
      const g = muelle(t, EV.reddit - 0.8 + f * 0.12 + k * 0.03, 200, 14);
      if (g < 0.02) continue;
      const x = -1.05 + k * 0.35 + (f % 2) * 0.17;
      const z = 0.2 - f * 0.45;
      const salta = compran ? 0.05 * Math.max(0, Math.sin(t * 9 + k + f)) : 0;
      const pose = compran ? mezclaPose(POSES.dePie, POSES.celebra, Math.min(1, (t - EV.comprar + 0.3) * 3) * (0.5 + 0.5 * Math.sin(t * 4 + k))) : POSES.senala;
      const cad: V3 = [x, -1 + 0.2 + salta, z];
      monigote(tr, cad, pose, "frente", Math.min(g, 1) * (0.55 + 0.45 * (1 - f / FILAS)), 0.4, t);
      tr.push({ t: "p", pts: [[x + 0.06, -0.6 + salta, z + 0.03], [x + 0.1, -0.6 + salta, z + 0.03], [x + 0.1, -0.53 + salta, z + 0.03], [x + 0.06, -0.53 + salta, z + 0.03], [x + 0.06, -0.6 + salta, z + 0.03]], w: 1.4, o: Math.min(g, 1), color: compran ? VERDE : "#fff", relleno: compran ? VERDE : "#fff", oRelleno: 0.5, luz: compran ? 0.6 : 0.2 });
    }
  // La vela verde gigante detrás de la multitud
  const alto = 0.05 + 2.4 * sube;
  if (t > corte2 - 0.2) cristal(tr, [-0.16, -1, -2.2], [0.16, -1 + alto, -1.9], VERDE, 1, 0.5 + 0.3 * Math.sin(t * 8), 0.3);
  const pr = proyector(cam);
  const qv = pr([0.2, -1 + alto, -2.05]);
  const precio = Math.round(L(t, corte2, EV["400"], 20, 483, (u) => u * u));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {t > corte2 - 0.2 && <Rotulo x={Math.min(qv.x + 20, 980)} y={Math.max(qv.y, 330)} ancla="translate(0, -50%)" size={70} color={VERDE} caja>{`${precio} $`}</Rotulo>}
      <Arriba>
        <Pildora t={t} t0={EV.reddit - 0.5} size={38} fin={corte2}>MILES DE PEQUEÑOS INVERSORES</Pildora>
        <Pildora t={t} t0={EV.reddit - 0.2} size={38} color={VERDE} fin={corte2}>COMPRAR ↑</Pildora>
      </Arriba>
      <FlashVerde t={t} t0={EV["400"] - 0.05} o={0.18} />
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

// ------------------------------------------------------------------ 5. Tres: comprar tiene suelo · en corto no hay techo · 2.750 M y CERRADO
const s3 = inicio("tres");
const corte3 = EV["2750"] - 0.55;
const CASAS: [number, number] = [-0.4, 0.4];
const camCasas = (t: number, s: number, e: number) => orbita([0, -0.3, 0], L(t, s, e, 5.2, 4.9), 0, 0.1, { apertura: 6, centroY: 1060 });
const TresA: React.FC<P> = ({ t, s }) => {
  const cam = camCasas(t, s, corte3);
  const tr: Trazo[] = [...polvo(0.12)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  const izq = L(t, EV.compras - 0.4, EV.compras, 0, 1);
  const der = L(t, EV.vendes - 0.4, EV.vendes, 0, 1);
  casa(tr, CASAS[0], 0, 1, 0.5 + 0.5 * izq, izq > 0.5 && t < EV.vendes - 0.3 ? VERDE : "#fff", 0.5);
  casa(tr, CASAS[1], 0, 0, 0.5 + 0.5 * der, der > 0.5 ? ROJO : "#fff", 0.5);
  // Comprar: la pérdida baja y se para en el suelo
  const baja = L(t, EV.compras, EV.pusiste, 0, 1, (u) => u * u);
  if (baja > 0) flecha(tr, [CASAS[0], -0.55, 0.3], [CASAS[0], -0.55 - 0.42 * baja, 0.3], ROJO, 5);
  // En corto: sube y atraviesa donde iría el techo
  const subeF = L(t, EV.vendes, EV.techo + 0.6, 0, 1, (u) => u * u);
  if (subeF > 0) flecha(tr, [CASAS[1], -0.75, 0.3], [CASAS[1], -0.75 + 2.4 * subeF, 0.3], ROJO, 5, 0.8);
  const pr = proyector(cam);
  const q0 = pr([CASAS[0], -1, 0.3]);
  const q1 = pr([CASAS[1], -0.5 + 0.1, 0.3]);
  const qa = pr([CASAS[0], -0.1, 0]);
  const qb = pr([CASAS[1], -0.1, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Rotulo x={qa.x} y={qa.y} size={40} o={0.4 + 0.6 * izq} caja>COMPRAS</Rotulo>
      <Rotulo x={qb.x} y={qb.y} size={40} o={0.4 + 0.6 * der} color={der > 0.5 ? ROJO : "#fff"} caja>EN CORTO</Rotulo>
      {baja >= 1 && <Rotulo x={q0.x} y={q0.y} ancla="translate(-50%, 30%)" size={28} color={VERDE}>SUELO: LO QUE PUSISTE</Rotulo>}
      {subeF > 0.5 && <Rotulo x={Math.min(q1.x, 760)} y={Math.max(q1.y - 520, 430)} size={64} color={ROJO}>SIN TECHO ∞</Rotulo>}
      <FlashRojo t={t} t0={EV.techo - 0.05} o={0.14} />
    </>
  );
};
const TresB: React.FC<P> = ({ t, e }) => {
  const cam = orbita([-0.1, -0.15, -0.3], L(t, corte3, e, 4.4, 4.1), L(t, corte3, e, -0.1, 0.05) + sacude(t, EV.cerraron - 0.1, 0.02), 0.1, { apertura: 6, centroY: 1040 });
  const tr: Trazo[] = [...polvo(0.12)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  rascacielos(tr, TORRE[0] + 0.3, TORRE[1], 0.62, 1.75, t, t > EV.cerraron - 0.2 ? 1 : 0.3);
  // Maletín que entra en la torre
  const entra = L(t, EV["2750"] - 0.3, EV["2750"] + 0.6, 0, 1, (u) => 1 - Math.pow(1 - u, 2));
  const pr = proyector(cam);
  const qt = pr([TORRE[0] + 0.3, -0.15, TORRE[1] + 0.2]);
  return (
    <>
      <CamaraTiembla t={t} t0={EV.cerraron - 0.1} a={0.02}>
        <Escena cam={cam} trazos={tr} />
        {entra > 0 && entra < 0.999 + 1 && t < EV.cerraron - 0.3 && (
          <div style={{ position: "absolute", left: qt.x + (1 - entra) * 520, top: qt.y, transform: `translate(-50%, -50%) scale(${1 - 0.3 * entra})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ width: 160, height: 22, margin: "0 auto", border: "4px solid #fff", borderBottom: "none", borderRadius: "12px 12px 0 0" }} />
            <div style={{ padding: "18px 26px", borderRadius: 18, border: "4px solid #fff", background: "#000", fontFamily: SANS, fontWeight: 800, fontSize: 64, color: "#fff" }}>+2.750 M $</div>
          </div>
        )}
      </CamaraTiembla>
      <Arriba>
        <Pildora t={t} t0={EV["2750"] - 0.3} size={40} fin={EV.cerraron - 0.3}>INYECCIÓN</Pildora>
        <Pildora t={t} t0={EV.cerraron - 0.5} size={40} color={ROJO}>AL AÑO SIGUIENTE</Pildora>
      </Arriba>
      <Sello t={t} t0={EV.cerraron - 0.15} texto="CERRADO" top={820} size={110} />
      <FlashRojo t={t} t0={EV.cerraron - 0.1} o={0.16} />
    </>
  );
};
const Tres: React.FC<P> = (p) => (p.t < corte3 ? <TresA {...p} /> : <TresB {...p} />);

// ------------------------------------------------------------------ 6. Giro: el stop como techo, puesto antes de entrar
const sG = inicio("giro");
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.12, -0.25, 0], L(t, s, e, 4.0, 3.7), L(t, s, e, 0.04, -0.02), 0.1, { apertura: 6, centroY: 1060 });
  const tr: Trazo[] = [...polvo(0.12)];
  suelo(tr, t, -1.0, 0.14, "#fff", 0.2);
  casa(tr, 0.25, 0, 0, 1, "#fff", 0.55);
  // El stop baja como un techo rojo (antes de entrar)
  const pone = L(t, EV.stop - 0.45, EV.stop + 0.05, 1.2, 0, (u) => 1 - Math.pow(1 - u, 3));
  const yStop = -0.28 + pone;
  if (t > EV.stop - 0.5) {
    cristal(tr, [0.25 - 0.38, yStop, -0.3], [0.25 + 0.38, yStop + 0.06, 0.3], ROJO, 1, 0.6 + 0.4 * golpe(t, EV.entrar + 0.5), 0.35);
  }
  // Después entra: la flecha sube y se queda en el stop
  const subeF = L(t, EV.entrar - 0.2, EV.entrar + 0.5, 0, 1, (u) => u * u);
  if (subeF > 0) flecha(tr, [0.25, -0.75, 0.3], [0.25, -0.75 + Math.min(0.42, 0.9 * subeF), 0.3], ROJO, 5, 0.8);
  const pr = proyector(cam);
  const qs = pr([0.25, yStop + 0.03, 0.3]);
  const c = cuerpoEn(t, [[s, { mira: 0.7, cejas: 0.3 }], [EV.stop - 0.2, { mDx: 0.45, mDy: 0.35, mira: 0.8, boca: 0.4 }], [EV.excepciones - 0.3, { ...BRAZOS_ARRIBA, boca: 0.8, abre: 0.3, mira: 0 }]], { mira: 0.7 }, s - 0.4);
  const a = anclaje(cam, [-0.22, -1, 0.1], 0.42);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {t > EV.stop - 0.5 && <Rotulo x={qs.x} y={qs.y} size={40} color="#fff">STOP</Rotulo>}
      <StickMundo a={a} c={c} t={t} gorra />
      <Arriba>
        <Pildora t={t} t0={EV.solucion - 0.2} size={44} color={VERDE}>LA SOLUCIÓN</Pildora>
        <Pildora t={t} t0={EV.stop - 0.5} size={36}>1º EL STOP · 2º ENTRAS</Pildora>
      </Arriba>
      {subeF >= 0.47 && (
        <div style={{ position: "absolute", top: 1230, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
          <Pildora t={t} t0={EV.entrar + 0.3} size={40} color={VERDE}>PÉRDIDA CON TECHO ✓</Pildora>
        </div>
      )}
      <Sello t={t} t0={EV.excepciones - 0.1} texto="SIN EXCEPCIONES" top={600} size={70} color="#fff" />
    </>
  );
};

// ------------------------------------------------------------------ 7. Cierre de conversión
const Cierre: React.FC<P> = (p) => <CierreComenta {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tCuenta={EV.auditada} mensaje="Así gestiono yo el riesgo ↓" />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, cierre: Cierre };
export const CLAVES = claves(["12000", ["mitad", ROJO], "videojuegos", "melvin", ["corto", ROJO], "reddit", ["comprar", VERDE], ["400", VERDE], "sígueme", "trampa", ["techo", ROJO], ["2750", ROJO], ["cerraron", ROJO], ["solución", VERDE], ["stop", ROJO], "excepciones", "bot", "privado", ["auditada", VERDE]]);

const GANCHO = { lineas: ["Un fondo de *12.000_millones*", "perdió *la_mitad* en un mes"], hasta: EV.mes + 0.45, color: ROJO };
export const GameStop: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/gamestop_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.1} empujes={0.05} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} />
);
