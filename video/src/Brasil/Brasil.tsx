// Reel 5-30-10 «dopamina» "300 días de day trading: el 97 % perdió dinero" (~35 s), con stickmen (el stickman es «tú»,
// sin historias de Marcos). Datos: Chague, De-Losso y Giovannetti, «Day Trading for a Living?» (bolsa de Brasil). Fotograma
// 0 con 100 stickmen y el contador de días: se van apagando con una ✗ roja hasta quedar 3 en verde; «ENCUESTA» tachada y
// las tarjetas del estudio; 1 de cada 100 encima de una nómina de salario mínimo; el stickman en una cinta de correr con la
// curva plana (repetir sin medir); la regla (un STOP para ti: fecha y cifra; si no, paras y cambias de sistema) y el cierre
// en el móvil. Tiempos en src/gen/brasil.json (scripts/brasil.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/brasil.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { ORO, ROJO, VERDE } from "../Bot/kit";
import { Clave, cuerpoEn, Stick } from "../Bot/stick";
import { BRAZOS_ARRIBA } from "../Bot/comun";
import { Foco } from "../Bot/ui2d";
import { Rotulito } from "../Bot/v3";
import { CierreMovil, Ficha3D, Prueba, TarjetaAuditada } from "../Bot/dopa";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const BRASIL_FPS = datos.fps;
export const BRASIL_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const min1 = (g: number, m = 1) => Math.min(g, m);

// ------------------------------------------------------------------ 1. Hook: 100 stickmen, 300 días, quedan 3
const QUEDAN = new Set([23, 61, 88]);
const hash = (i: number) => {
  const x = Math.sin(i * 91.7 + 17.3) * 43758.5453;
  return x - Math.floor(x);
};
const ORDEN = Array.from({ length: 100 }, (_, i) => i).filter((i) => !QUEDAN.has(i)).sort((a, b) => hash(a) - hash(b));
const APAGA: Record<number, number> = {};
ORDEN.forEach((i, k) => (APAGA[i] = 0.1 + (k / ORDEN.length) * (EV["97"] - 0.3)));
const Hook: React.FC<P> = ({ t }) => {
  const dia = Math.max(1, Math.round(L(t, 0, EV.trading + 0.3, 1, 300, (u) => u)));
  const verde = muelle(t, EV["97"] - 0.05, 230, 12);
    return (
    <>
      <div style={{ position: "absolute", left: 0, width: ANCHO, top: 570, textAlign: "center", ...mono(46), fontWeight: 800, letterSpacing: "0.14em" }}>DÍA {dia}</div>
      {Array.from({ length: 100 }, (_, i) => {
        const ox = 162 + (i % 10) * 84;
        const oy = 720 + Math.floor(i / 10) * 72;
        const vivo = QUEDAN.has(i);
        const u = vivo ? 0 : L(t, APAGA[i], APAGA[i] + 0.15, 0, 1, (v) => v);
        const salto = vivo ? 10 * Math.max(0, Math.sin(Math.max(0, t - EV["97"]) * 6)) * min1(verde) : 0;
        const col = vivo && verde > 0.01 ? VERDE : "#fff";
        const k = vivo ? 1 + 0.3 * min1(verde, 1.1) : 1;
        return (
          <React.Fragment key={i}>
            {vivo && verde > 0.01 && <div style={{ position: "absolute", left: ox - 34, top: oy - 8, width: 68, height: 18, borderRadius: "50%", background: VERDE, opacity: 0.6 * min1(verde), boxShadow: `0 0 20px ${VERDE}` }} />}
            {/* persona en pictograma (se lee mejor que un stickman a este tamaño) */}
            <svg width={60} height={70} viewBox="0 0 60 70" style={{ position: "absolute", left: ox - 30, top: oy - 66 - salto, opacity: 1 - 0.78 * u, transform: `scale(${k})`, transformOrigin: "50% 100%", overflow: "visible", filter: vivo && verde > 0.01 ? `drop-shadow(0 0 10px ${VERDE})` : undefined }}>
              <circle cx={30} cy={15} r={12} fill={col} />
              <path d="M8 66 V48 C8 36 16 31 30 31 C44 31 52 36 52 48 V66 Z" fill={col} />
            </svg>
            {u > 0 && (
              <svg width={34} height={34} style={{ position: "absolute", left: ox - 17, top: oy - 58, opacity: u }}>
                <path d="M6 6 L28 28 M28 6 L6 28" stroke={ROJO} strokeWidth={6} strokeLinecap="round" />
              </svg>
            )}
          </React.Fragment>
        );
      })}
      <Ficha3D t={t} t0={EV.perdio - 0.1} texto="97 %" y={1000} size={190} color={ROJO} sub="PERDIÓ DINERO" />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: no es una encuesta · el estudio · 1 de cada 100 sobre la nómina
const Nomina: React.FC<{ g: number }> = ({ g }) => (
  <div style={{ position: "absolute", left: 270, top: 980, width: 540, height: 300, borderRadius: 22, border: "4px solid #fff", background: "#060606", padding: "26px 30px", boxSizing: "border-box", opacity: min1(g * 2), transform: `translateY(${(1 - min1(g)) * 80}px)` }}>
    <div style={{ ...mono(30, 0.7), fontWeight: 800 }}>NÓMINA</div>
    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: ORO, marginTop: 8 }}>SALARIO MÍNIMO</div>
    {[0.8, 0.6, 0.7].map((w, i) => <div key={i} style={{ width: 460 * w, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.3)", marginTop: 18 }} />)}
  </div>
);
const Uno: React.FC<P> = ({ t, s }) => {
  const enc = 1 - L(t, EV.datos - 0.35, EV.datos - 0.1, 0, 1);
  const tacha = L(t, EV.encuesta + 0.15, EV.encuesta + 0.45, 0, 1, (u) => u);
  const tarjetas = L(t, EV.datos - 0.3, EV.datos, 0, 1) * (1 - L(t, EV.uno - 0.4, EV.uno - 0.15, 0, 1));
  const uno = L(t, EV.uno - 0.3, EV.uno - 0.05, 0, 1);
  const nom = muelle(t, EV.salario - 0.35, 220, 14);
  const c = cuerpoEn(t, [[EV.salario, { ...BRAZOS_ARRIBA, boca: 1, abre: 0.5, cejas: 0.6 }]], { boca: 0.4 }, s);
  return (
    <>
      {enc > 0.01 && (
        <div style={{ position: "absolute", left: 0, width: ANCHO, top: 760, textAlign: "center", opacity: enc * min1(muelle(t, s, 230, 13) * 2) }}>
          <span style={{ position: "relative", fontFamily: SANS, fontWeight: 800, fontSize: 150, letterSpacing: "-0.02em" }}>
            ENCUESTA
            <span style={{ position: "absolute", left: -20, top: "52%", width: `calc(${tacha * 100}% + 40px)`, height: 18, borderRadius: 9, background: ROJO, boxShadow: `0 0 20px ${ROJO}` }} />
          </span>
        </div>
      )}
      {tarjetas > 0.01 && (
        <AbsoluteFill style={{ opacity: tarjetas }}>
          <Prueba t={t} t0={EV.datos - 0.2} x={540} y={760} cabecera="SSRN · 2019-2020" titulo="«Day Trading for a Living?»" pie="Chague, De-Losso y Giovannetti" />
          <Prueba t={t} t0={EV.brasil - 0.2} x={560} y={1150} w={760} rot={3} desde={-1} cabecera="BOLSA DE BRASIL" cifra="300+ días" pie="day traders reales, uno a uno" color={ORO} />
        </AbsoluteFill>
      )}
      {uno > 0.01 && (
        <AbsoluteFill style={{ opacity: uno }}>
          <Ficha3D t={t} t0={EV.uno - 0.1} texto="1 DE 100" y={520} size={150} color={VERDE} />
          <Nomina g={nom} />
          {nom > 0.01 && (
            <>
              <Foco x={540} y={985} w={360} h={60} o={0.35} color="47,224,138" />
              <Stick c={c} ox={540} oy={985} s={200} t={t} o={min1(nom * 2)} />
            </>
          )}
        </AbsoluteFill>
      )}
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

// ------------------------------------------------------------------ 4. Dos: la cinta de correr y la curva plana (repetir sin medir)
const pasos = (s: number, e: number, ritmo: (t: number) => number): Clave[] => {
  const out: Clave[] = [];
  let t = s;
  let k = 0;
  while (t < e) {
    const a = k % 2 ? 1 : -1;
    out.push([t, { pIx: -0.14 + 0.16 * a, pDx: 0.14 - 0.16 * a, pIy: a > 0 ? 0.05 : 0, pDy: a < 0 ? 0.05 : 0, mIx: -0.15 - 0.14 * a, mDx: 0.15 - 0.14 * a, mIy: -0.5, mDy: -0.5, boca: -0.3, ojos: 0.8 }]);
    t += ritmo(t);
    k++;
  }
  return out;
};
const Dos: React.FC<P> = ({ t, s, e }) => {
  const rapido = (x: number) => (x > EV.repetir ? 0.17 : 0.28);
  const c = cuerpoEn(t, pasos(s, e, rapido), { mira: 0.3 }, s - 0.3);
  const dia = Math.round(300 + L(t, s, e, 0, 1, (u) => u * u) * 400);
  const plano = L(t, EV.mejoraron - 0.1, EV.mejoraron + 0.2, 0, 1);
  const vel = t > EV.repetir ? 2.2 : 1;
  const desliza = (t * 260 * vel) % 60;
  const X0 = 130;
  const X1 = 950;
  const pts = Array.from({ length: 60 }, (_, i) => `${X0 + (i / 59) * (X1 - X0) * min1(L(t, s, EV.mejoraron, 0.2, 1, (u) => u))},${760 + Math.sin(i * 1.3) * 26 + Math.sin(i * 0.4) * 14}`).join(" ");
  return (
    <>
      <div style={{ position: "absolute", left: 0, width: ANCHO, top: 380, textAlign: "center", ...mono(52), fontWeight: 800, letterSpacing: "0.12em", color: t > EV.repetir ? ORO : "#fff" }}>DÍA {dia}</div>
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={X0} x2={X0} y1={520} y2={960} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
        <line x1={X0} x2={X1} y1={960} y2={960} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
        <polyline points={pts} fill="none" stroke={plano > 0.5 ? ROJO : "#fff"} strokeWidth={7} strokeLinejoin="round" style={plano > 0.5 ? { filter: `drop-shadow(0 0 12px ${ROJO})` } : undefined} />
        {/* cinta de correr */}
        <rect x={270} y={1240} width={540} height={46} rx={23} fill="#050505" stroke="#fff" strokeWidth={5} />
        {Array.from({ length: 11 }, (_, i) => <line key={i} x1={290 + ((i * 60 - desliza + 600) % 600)} x2={290 + ((i * 60 - desliza + 600) % 600)} y1={1248} y2={1278} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />)}
        <line x1={300} x2={250} y1={1286} y2={1360} stroke="#fff" strokeWidth={5} />
        <line x1={780} x2={830} y1={1286} y2={1360} stroke="#fff" strokeWidth={5} />
        <line x1={790} x2={840} y1={1240} y2={1010} stroke="#fff" strokeWidth={5} />
        <rect x={810} y={985} width={90} height={44} rx={8} fill="#000" stroke="#fff" strokeWidth={4} />
      </svg>
      <div style={{ position: "absolute", left: X1 - 300, top: 560, width: 300, textAlign: "right", ...mono(40), fontWeight: 800, color: ROJO, opacity: plano }}>NO MEJORA</div>
      <div style={{ position: "absolute", left: X0 + 10, top: 975, ...mono(30, 0.6), fontWeight: 800 }}>DÍAS →</div>
      <Stick c={c} ox={540} oy={1240} s={250} t={t} perfil={1} />
      {t > EV.medir - 0.1 && <div style={{ position: "absolute", left: 140, top: 1080, ...mono(44), fontWeight: 800, color: ROJO, padding: "8px 18px", border: `3px solid ${ROJO}`, borderRadius: 12, transform: `rotate(-6deg) scale(${0.6 + 0.4 * min1(muelle(t, EV.medir - 0.1, 240, 12), 1.1)})` }}>SIN MEDIR</div>}
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: un STOP también para ti · fecha y cifra · paras y cambias de sistema
const Octogono: React.FC<{ x: number; y: number; size: number; g: number }> = ({ x, y, size, g }) => {
  const pts = Array.from({ length: 8 }, (_, i) => {
    const a = (Math.PI / 8) * (2 * i + 1);
    return `${50 + 46 * Math.cos(a)},${50 + 46 * Math.sin(a)}`;
  }).join(" ");
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", left: x - size / 2, top: y - size / 2, transform: `scale(${0.4 + 0.6 * min1(g, 1.1)}) rotate(${(1 - min1(g)) * -30}deg)`, opacity: min1(g * 2), filter: `drop-shadow(0 0 30px ${ROJO})`, overflow: "visible" }}>
      <polygon points={pts} fill={ROJO} stroke="#fff" strokeWidth={3} />
      <text x={50} y={60} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={26} fill="#fff">STOP</text>
    </svg>
  );
};
const Engranaje: React.FC<{ x: number; y: number; size: number; rot: number; o: number }> = ({ x, y, size, rot, o }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", left: x - size / 2, top: y - size / 2, opacity: o, transform: `rotate(${rot}deg)` }}>
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={44} y={2} width={12} height={20} rx={3} fill={VERDE} transform={`rotate(${i * 45} 50 50)`} />)}
    <circle cx={50} cy={50} r={32} fill="#000" stroke={VERDE} strokeWidth={8} />
    <circle cx={50} cy={50} r={11} fill={VERDE} />
  </svg>
);
const Giro: React.FC<P> = ({ t, s }) => {
  const a = 1 - L(t, EV.fecha - 0.35, EV.fecha - 0.1, 0, 1);
  const b = L(t, EV.fecha - 0.25, EV.fecha, 0, 1) * (1 - L(t, EV.paras - 0.35, EV.paras - 0.1, 0, 1));
  const cc = L(t, EV.paras - 0.25, EV.paras, 0, 1);
  const c = cuerpoEn(t, [[EV.stop - 0.1, { mDx: 0.02, mDy: -0.12, boca: -0.2, cejas: 0.4 }]], {}, s - 0.3);
  const c2 = cuerpoEn(t, [[EV.paras, { ...BRAZOS_ARRIBA, cejas: 1, ojos: 1.3, abre: 0.6 }], [EV.sistema + 0.2, { mIx: -0.15, mIy: -0.52, mDx: 0.4, mDy: -0.2, boca: 0.8, abre: 0, cejas: 0.3, ojos: 1 }]], {}, EV.paras - 1);
  return (
    <>
      <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" top={360} fin={EV.paras - 0.1} />
      {a > 0.01 && (
        <AbsoluteFill style={{ opacity: a }}>
          <Foco x={330} y={1240} w={400} h={80} o={0.15} />
          <Stick c={c} ox={330} oy={1240} s={300} t={t} />
          <Octogono x={760} y={860} size={360} g={muelle(t, EV.stop - 0.1, 220, 11)} />
          <div style={{ position: "absolute", left: 560, width: 400, top: 1080, textAlign: "center", ...mono(44), fontWeight: 800, color: ROJO, opacity: L(t, EV.stop + 0.3, EV.stop + 0.6, 0, 1) }}>PARA TI</div>
        </AbsoluteFill>
      )}
      {b > 0.01 && (
        <AbsoluteFill style={{ opacity: b }}>
          <Ficha3D t={t} t0={EV.fecha - 0.05} texto={t > EV.seis - 0.1 ? "6 MESES" : "FECHA"} y={640} size={150} color={ORO} sub="UNA FECHA" />
          <Ficha3D t={t} t0={EV.cifra - 0.05} texto="GANADO > PERDIDO" y={1000} size={96} color={t > EV.pierdes ? VERDE : "#fff"} sub="UNA CIFRA" giro={-1} />
        </AbsoluteFill>
      )}
      {cc > 0.01 && (
        <AbsoluteFill style={{ opacity: cc }}>
          <Octogono x={540} y={680} size={380} g={muelle(t, EV.paras - 0.1, 240, 10)} />
          <Stick c={c2} ox={330} oy={1260} s={240} t={t} />
          <Engranaje x={760} y={1110} size={200} rot={(t - EV.sistema) * 160} o={L(t, EV.sistema - 0.2, EV.sistema, 0, 1)} />
          <div style={{ position: "absolute", left: 600, width: 330, top: 1230, textAlign: "center", ...mono(38), fontWeight: 800, color: VERDE, opacity: L(t, EV.sistema - 0.1, EV.sistema + 0.1, 0, 1) }}>OTRO SISTEMA</div>
        </AbsoluteFill>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: comenta BOT en el móvil → mensaje directo → cuenta auditada
const Cierre: React.FC<P> = (p) => <CierreMovil {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tFinal={EV.auditada} palabra="BOT" mensaje="Te explico cómo lo hago ↓" final={<TarjetaAuditada />} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["97", ROJO], ["perdió", ROJO], ["encuesta", ROJO], "datos", "brasil", ["uno", VERDE], ["mínimo", ORO], "sígueme", "peor", ["mejoraron", ROJO], "repetir", ["medir", ROJO], "regla", ["stop", ROJO], "fecha", "cifra", ["seis", ORO], ["paras", ROJO], ["sistema", VERDE], "llegado", "3", "bot", ["auditada", VERDE]]);
const GOLPES: [number, string?][] = [[0.02], [EV.trading], [EV["97"], VERDE], [EV.perdio, ROJO], [EV.encuesta, ROJO], [EV.datos], [EV.brasil, ORO], [EV.uno, VERDE], [EV.salario, VERDE], [EV.peor], [EV.mejoraron, ROJO], [EV.repetir, ORO], [EV.medir, ROJO], [EV.regla], [EV.stop, ROJO], [EV.fecha, ORO], [EV.cifra], [EV.seis, ORO], [EV.paras, ROJO], [EV.sistema, VERDE], [EV.llegado], [EV.bot], [EV.privado], [EV.auditada, VERDE]];

const GANCHO = { lineas: ["300 días de trading:", "el *97_%* perdió"], hasta: inicio("uno") - 0.05, color: ROJO };
export const Brasil: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/brasil_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.08} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} />
);
