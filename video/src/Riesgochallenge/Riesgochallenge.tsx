// Reel 5-30-10 «dopamina» de fondeo, SIN bot: "Si arriesgas un 5 % por operación en tu challenge, te suspendes tú solo"
// (~35 s). Supuestos dichos en el guion: la cuenta deja perder un 10 % y aciertas la mitad. Fotograma 0 en plena acción:
// la barra de vida de la cuenta (como en un videojuego) recibe dos golpes del 5 % y SUSPENDIDO; el móvil que se lanza a
// cámara; el gráfico con el límite −10 % y dos velas rojas; la moneda y 1 de cada 4 cuentas; la misma barra en bloques
// del 1 % (diez golpes seguidos: 1 de cada 1.000); la carrera 5 % frente a 1 %; la regla en fichas 3D (−10 % ÷ 10 = 1 %)
// y el cierre en el móvil con la palabra RIESGO. Tiempos en src/gen/riesgochallenge.json (scripts/riesgochallenge.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/riesgochallenge.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { ORO, ROJO, VERDE } from "../Bot/kit";
import { CamaraTiembla, Sello } from "../Bot/historia";
import { Foco } from "../Bot/ui2d";
import { Marca, Rotulito } from "../Bot/v3";
import { CierreMovil, Ficha3D, MovilACamara } from "../Bot/dopa";
import { claves, CtaSeguir, cuando, Montaje, P } from "../Explica/Montaje";

export const RIESGO_FPS = datos.fps;
export const RIESGO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const UNO = cuando(datos)("1", inicio("dos"));
const min1 = (g: number, m = 1) => Math.min(g, m);
const sal = (u: number) => 1 - Math.pow(1 - u, 3);

// ------------------------------------------------------------------ barra de vida de la cuenta (10 bloques = el 10 % que te deja perder)
const Vida: React.FC<{ t: number; y: number; golpes: number[]; etiqueta: string; o?: number }> = ({ t, y, golpes, etiqueta, o = 1 }) => {
  const W = 860;
  const n = golpes.length;
  const gap = 10;
  const w = (W - gap * (n - 1)) / n;
  const vivos = golpes.filter((g) => t < g).length;
  const color = vivos > n * 0.6 ? VERDE : vivos > n * 0.3 ? ORO : ROJO;
  return (
    <div style={{ position: "absolute", left: (ANCHO - W) / 2, top: y, width: W, opacity: o }}>
      <div style={{ ...mono(36), fontWeight: 800, letterSpacing: "0.1em", marginBottom: 18, display: "flex", justifyContent: "space-between" }}>
        <span>{etiqueta}</span>
        <span style={{ color }}>{vivos * (10 / n)} %</span>
      </div>
      <div style={{ position: "relative", height: 120 }}>
        {golpes.map((g, i) => {
          const u = L(t, g, g + 0.5, 0, 1, (v) => v);
          return (
            <React.Fragment key={i}>
              <div style={{ position: "absolute", left: i * (w + gap), top: 0, width: w, height: 120, borderRadius: 14, border: `3px dashed ${t >= g ? "rgba(255,77,94,0.5)" : "transparent"}` }} />
              {u < 1 && (
                <div style={{ position: "absolute", left: i * (w + gap), top: 0, width: w, height: 120, borderRadius: 14, background: t >= g ? ROJO : color, boxShadow: `0 0 26px ${t >= g ? ROJO : color}88`, transform: `translate(${u * (i % 2 ? 60 : -60)}px, ${-260 * u + 500 * u * u}px) rotate(${u * (i % 2 ? 50 : -50)}deg)`, opacity: 1 - u }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
const Danio: React.FC<{ t: number; t0: number; x: number; y: number; texto: string }> = ({ t, t0, x, y, texto }) => {
  if (t < t0 || t > t0 + 1.1) return null;
  const u = (t - t0) / 1.1;
  const g = muelle(t, t0, 300, 12);
  return <div style={{ position: "absolute", left: x, top: y - 160 * u, transform: `translate(-50%, -50%) scale(${0.5 + 0.7 * min1(g, 1.2)})`, fontFamily: SANS, fontWeight: 800, fontSize: 120, color: ROJO, opacity: 1 - L(u, 0.6, 1, 0, 1), textShadow: `0 0 30px ${ROJO}, 0 6px 0 #000` }}>{texto}</div>;
};
const Vela: React.FC<{ t: number; t0: number; x: number; y: number; h: number }> = ({ t, t0, x, y, h }) => {
  const u = L(t, t0 - 0.25, t0, 0, 1, (v) => v * v);
  if (u <= 0 || t > t0 + 0.15) return null;
  return <div style={{ position: "absolute", left: x - 45, top: y - 140 * (1 - u) - h, width: 90, height: h, borderRadius: 10, background: ROJO, boxShadow: `0 0 30px ${ROJO}`, opacity: Math.min(1, 0.4 + u * 2) }} />;
};

// ------------------------------------------------------------------ 1. Hook: dos golpes del 5 % y SUSPENDIDO
const G1 = EV.arriesgas;
const G2 = EV.challenge;
const Hook: React.FC<P> = ({ t }) => (
  <>
    <CamaraTiembla t={t} t0={t < G2 ? G1 : G2} a={0.03}>
      <Foco x={540} y={1170} w={900} h={150} o={0.1} />
      <Vela t={t} t0={G1} x={330} y={930} h={180} />
      <Vela t={t} t0={G2} x={750} y={930} h={180} />
      <Vida t={t} y={950} golpes={[G1, G1, G1, G1, G1, G2, G2, G2, G2, G2]} etiqueta="CUENTA · PUEDES PERDER" />
      <Danio t={t} t0={G1} x={330} y={890} texto="−5 %" />
      <Danio t={t} t0={G2} x={750} y={890} texto="−5 %" />
    </CamaraTiembla>
    <Sello t={t} t0={EV.suspendes - 0.1} texto="SUSPENDIDO" top={1160} color={ROJO} size={100} />
  </>
);

// ------------------------------------------------------------------ 2. Uno: el límite −10 % y dos velas rojas · la moneda · 1 de cada 4
const Y0 = 640;
const YL = 1140;
const Grafico: React.FC<{ t: number }> = ({ t }) => {
  const lim = muelle(t, EV.perder - 0.1, 220, 14);
  const v1 = L(t, EV.dos - 0.1, EV.dos + 0.25, 0, 1, sal);
  const v2 = L(t, EV.seguidas - 0.1, EV.seguidas + 0.25, 0, 1, sal);
  const fuera = t >= EV.fuera - 0.05;
  const mid = (Y0 + YL) / 2;
  return (
    <CamaraTiembla t={t} t0={EV.fuera - 0.05} a={0.03}>
      <div style={{ position: "absolute", left: 110, right: 110, top: Y0, height: 0, borderTop: "4px dashed rgba(255,255,255,0.6)" }} />
      <div style={{ position: "absolute", left: 110, top: Y0 - 56, ...mono(36), fontWeight: 800 }}>0 %</div>
      {lim > 0.01 && (
        <>
          <div style={{ position: "absolute", left: 110, top: YL, width: 860 * min1(lim), height: 8, background: ROJO, boxShadow: `0 0 ${fuera ? 50 : 20}px ${ROJO}` }} />
          <div style={{ position: "absolute", left: 110, top: YL + 22, ...mono(40), fontWeight: 800, color: ROJO, opacity: min1(lim) }}>−10 % · LÍMITE</div>
        </>
      )}
      {v1 > 0 && <div style={{ position: "absolute", left: 360, top: Y0, width: 130, height: (mid - Y0) * v1, borderRadius: 10, background: ROJO, boxShadow: `0 0 30px ${ROJO}88` }} />}
      {v1 > 0.5 && <div style={{ position: "absolute", left: 335, width: 180, top: mid + 14, textAlign: "center", ...mono(38), fontWeight: 800, color: ROJO }}>−5 %</div>}
      {v2 > 0 && <div style={{ position: "absolute", left: 560, top: mid, width: 130, height: (YL - mid) * v2, borderRadius: 10, background: ROJO, boxShadow: `0 0 30px ${ROJO}88` }} />}
      {v2 > 0.5 && <div style={{ position: "absolute", left: 710, top: (mid + YL) / 2 - 24, ...mono(38), fontWeight: 800, color: ROJO }}>−5 %</div>}
      <Sello t={t} t0={EV.fuera - 0.08} texto="FUERA" top={760} color={ROJO} size={110} />
    </CamaraTiembla>
  );
};
const Moneda: React.FC<{ t: number; o: number }> = ({ t, o }) => {
  const giro = Math.cos(t * 9);
  const cara = giro > 0;
  return (
    <div style={{ position: "absolute", left: 540 - 150, top: 640, width: 300, height: 300, borderRadius: 150, border: `10px solid ${ORO}`, background: "#0a0a0a", transform: `scaleX(${Math.abs(giro) * 0.9 + 0.1}) translateY(${-60 * Math.abs(Math.sin(t * 4.5))}px)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 160, color: cara ? VERDE : ROJO, opacity: o, boxShadow: `0 0 50px ${ORO}55` }}>
      {cara ? "✓" : "×"}
    </div>
  );
};
const CUENTAS: [number, number][] = [[390, 820], [690, 820], [390, 1090], [690, 1090]];
const Uno: React.FC<P> = ({ t }) => {
  const graf = 1 - L(t, EV.mitad - 0.35, EV.mitad - 0.1, 0, 1);
  const moneda = L(t, EV.mitad - 0.2, EV.mitad, 0, 1) * (1 - L(t, EV.cuatro - 0.35, EV.cuatro - 0.1, 0, 1));
  const cuentas = L(t, EV.cuatro - 0.25, EV.cuatro, 0, 1);
  return (
    <>
      {graf > 0.01 && <AbsoluteFill style={{ opacity: graf }}><Grafico t={t} /></AbsoluteFill>}
      {moneda > 0.01 && (
        <>
          <Moneda t={t} o={moneda} />
          <Ficha3D t={t} t0={EV.mitad - 0.05} texto="50 %" y={1120} size={150} color={ORO} sub="ACIERTAS LA MITAD" fin={EV.cuatro - 0.15} />
        </>
      )}
      {cuentas > 0.01 && (
        <AbsoluteFill style={{ opacity: cuentas }}>
          <Ficha3D t={t} t0={EV.cuatro - 0.05} texto="1 DE 4" y={520} size={140} color={ROJO} />
          {CUENTAS.map(([x, y], i) => {
            const mala = i === 1;
            const g = muelle(t, EV.cuatro - 0.2 + i * 0.07, 230, 13);
            const roja = mala && t >= EV.cuatro + 0.2;
            return (
              <div key={i} style={{ position: "absolute", left: x - 135, top: y - 110, width: 270, height: 220, borderRadius: 26, border: `4px solid ${roja ? ROJO : "#fff"}`, background: roja ? "rgba(255,77,94,0.14)" : "#070707", boxShadow: roja ? `0 0 40px ${ROJO}77` : undefined, transform: `scale(${0.5 + 0.5 * min1(g, 1.08)})`, opacity: min1(g * 2), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span style={{ ...mono(28, 0.7), fontWeight: 800 }}>CHALLENGE {i + 1}</span>
                <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: roja ? ROJO : "#fff" }}>{roja ? "FUERA" : "SIGUE"}</span>
                {roja && t >= EV.primeras - 0.1 && <span style={{ ...mono(26), fontWeight: 800, color: ROJO }}>OP. 1 × · OP. 2 ×</span>}
              </div>
            );
          })}
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
    <CtaSeguir {...p} lema="" sinFondo sinBot />
  </>
);

// ------------------------------------------------------------------ 4. Dos: bloques del 1 % (diez golpes seguidos: 1 de cada 1.000) · la carrera 5 % frente a 1 %
const GOLPES10 = Array.from({ length: 10 }, (_, i) => EV.echen + 0.05 + (i * (EV.diez - EV.echen + 0.1)) / 9);
const Carrera: React.FC<{ t: number; o: number }> = ({ t, o }) => {
  const u = L(t, EV.lento - 0.3, EV.vivo + 0.2, 0, 1, (v) => v);
  const X0 = 130;
  const X1 = 930;
  const yv = (p: number) => 900 - p * 30;
  const rojo: string[] = [];
  const verde: string[] = [];
  const N = 60;
  for (let i = 0; i <= N * u; i++) {
    const k = i / N;
    const pr = Math.max(-10, k < 0.35 ? (Math.sin(k * 40) * 5 - k * 30) : -10);
    if (k <= 0.42) rojo.push(`${X0 + k * (X1 - X0)},${yv(pr)}`);
    const pv = k * 9 + Math.sin(k * 30) * 1.2 - 0.6 * Math.sin(k * 11);
    verde.push(`${X0 + k * (X1 - X0)},${yv(pv)}`);
  }
  const vivo = t >= EV.vivo - 0.1;
  const ult = verde[verde.length - 1]?.split(",").map(Number) ?? [X0, yv(0)];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={X0} x2={X1} y1={yv(0)} y2={yv(0)} stroke="rgba(255,255,255,0.4)" strokeWidth={3} strokeDasharray="12 10" />
        <line x1={X0} x2={X1} y1={yv(-10)} y2={yv(-10)} stroke={ROJO} strokeWidth={6} />
        {rojo.length > 1 && <polyline points={rojo.join(" ")} fill="none" stroke={ROJO} strokeWidth={8} strokeLinejoin="round" />}
        {verde.length > 1 && <polyline points={verde.join(" ")} fill="none" stroke={VERDE} strokeWidth={8} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 12px ${VERDE})` }} />}
        <circle cx={ult[0]} cy={ult[1]} r={vivo ? 20 : 14} fill={VERDE} style={{ filter: `drop-shadow(0 0 16px ${VERDE})` }} />
      </svg>
      <div style={{ position: "absolute", left: X0, top: yv(-10) + 20, ...mono(36), fontWeight: 800, color: ROJO }}>−10 %</div>
      {u > 0.45 && <Marca t={t} t0={EV.lento + 0.3} x={X0 + 0.42 * (X1 - X0)} y={yv(-10)} size={110} color={ROJO} tipo="no" />}
      <div style={{ position: "absolute", left: 130, top: 340, ...mono(40), fontWeight: 800, color: ROJO }}>— 5 % POR OPERACIÓN</div>
      <div style={{ position: "absolute", left: 130, top: 400, ...mono(40), fontWeight: 800, color: VERDE }}>— 1 % POR OPERACIÓN</div>
      {vivo && <div style={{ position: "absolute", left: ult[0] - 300, top: ult[1] - 130, width: 300, textAlign: "right", ...mono(44), fontWeight: 800, color: VERDE, transform: `scale(${0.6 + 0.4 * min1(muelle(t, EV.vivo - 0.1, 240, 12), 1.1)})`, transformOrigin: "100% 50%" }}>SIGUE VIVA ✓</div>}
    </div>
  );
};
const Dos: React.FC<P> = ({ t, s }) => {
  const bloques = 1 - L(t, EV.lento - 0.45, EV.lento - 0.2, 0, 1);
  const carrera = L(t, EV.lento - 0.35, EV.lento - 0.1, 0, 1);
  const n = GOLPES10.filter((g) => t >= g).length;
  return (
    <>
      {bloques > 0.01 && (
        <AbsoluteFill style={{ opacity: bloques }}>
          <Ficha3D t={t} t0={Math.max(s, UNO - 0.1)} texto="1 %" y={560} size={170} color={VERDE} sub="POR OPERACIÓN" fin={EV.echen - 0.1} />
          {t >= EV.echen - 0.3 && t < EV.mil - 0.1 && (
            <div style={{ position: "absolute", left: 0, width: ANCHO, top: 470, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 170, color: n >= 10 ? ROJO : "#fff", transform: `scale(${1 + 0.15 * Math.max(0, 1 - (t - (GOLPES10[Math.max(0, n - 1)] ?? 0)) * 6)})` }}>
              {n}<span style={{ fontSize: 70, opacity: 0.6 }}> SEGUIDAS</span>
            </div>
          )}
          <Vida t={t} y={840} golpes={GOLPES10} etiqueta="CUENTA · PUEDES PERDER" />
          <Ficha3D t={t} t0={EV.mil - 0.1} texto="1 DE 1.000" y={560} size={140} color={VERDE} sub="QUE PASE EN TUS 10 PRIMERAS" />
        </AbsoluteFill>
      )}
      {carrera > 0.01 && <Carrera t={t} o={carrera} />}
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: la regla en fichas: −10 % ÷ 10 = 1 %
const Giro: React.FC<P> = ({ t }) => (
  <>
    <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" top={330} />
    <Ficha3D t={t} t0={EV.regla + 0.3} texto="10 %" y={560} size={150} sub="LO QUE TE DEJA PERDER" />
    <Ficha3D t={t} t0={EV.decimo - 0.05} texto="÷ 10" y={850} size={150} color={ORO} giro={-1} />
    <Ficha3D t={t} t0={EV.decimo + 0.55} texto="= 1 %" y={1150} size={170} color={VERDE} sub="MÁXIMO POR OPERACIÓN" />
  </>
);

// ------------------------------------------------------------------ 6. Cierre: comenta RIESGO → mensaje directo → el cálculo (sin nada del bot)
const Calculo: React.FC = () => (
  <div style={{ width: 470, borderRadius: 28, border: `4px solid ${VERDE}`, padding: "22px 24px", boxShadow: `0 0 40px ${VERDE}55`, background: "#000", display: "flex", flexDirection: "column", gap: 12 }}>
    <span style={{ ...mono(28), fontWeight: 800, color: VERDE }}>TU RIESGO POR OPERACIÓN</span>
    {[["Cuenta", "10.000 €"], ["Te deja perder", "1.000 €"]].map(([a, b]) => (
      <div key={a} style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontWeight: 600, fontSize: 30 }}>
        <span style={{ opacity: 0.75 }}>{a}</span>
        <span>{b}</span>
      </div>
    ))}
    <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderRadius: 14, background: VERDE, color: "#000", fontFamily: SANS, fontWeight: 800, fontSize: 34 }}>
      <span>Por operación</span>
      <span>100 €</span>
    </div>
  </div>
);
const Cierre: React.FC<P> = (p) => <CierreMovil {...p} tComenta={EV.comenta} tPalabra={EV.riesgo} tPrivado={EV.privado} tFinal={EV.calcular + 0.2} palabra="RIESGO" mensaje="¿De cuánto es tu cuenta y cuánto te deja perder? ↓" final={<Calculo />} />;

// ------------------------------------------------------------------ composición
const PantallaSuspendido: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, #3a0b10, #000)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
    <span style={{ ...mono(34, 0.8), fontWeight: 800 }}>CHALLENGE</span>
    <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 84, color: ROJO }}>SUSPENDIDO</span>
    <span style={{ ...mono(30, 0.7), fontWeight: 700 }}>−10 % alcanzado</span>
  </div>
);
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["5", ROJO], ["suspendes", ROJO], "challenge", ["10", ROJO], ["fuera", ROJO], "mitad", ["cuatro", ROJO], "sígueme", ["1", VERDE], "diez", ["mil", VERDE], "lento", ["vivo", VERDE], "regla", ["décimo", VERDE], "llegado", "riesgo", "calcular"]);
const GOLPES: [number, string?][] = [[G1, ROJO], [G2, ROJO], [EV.suspendes, ROJO], [EV.cuenta], [EV.perder, ROJO], [EV.dos, ROJO], [EV.seguidas, ROJO], [EV.fuera, ROJO], [EV.mitad], [EV.cuatro, ROJO], [EV.primeras], [UNO, VERDE], [EV.echen], [EV.diez, ROJO], [EV.mil, VERDE], [EV.lento], [EV.vivo, VERDE], [EV.regla], [EV.decimo], [EV.decimo + 0.55, VERDE], [EV.llegado], [EV.riesgo], [EV.privado], [EV.calcular + 0.2, VERDE]];
const Encima: React.FC<{ t: number }> = ({ t }) => (
  <MovilACamara t={t} t0={inicio("uno") - 0.5}>
    <PantallaSuspendido />
  </MovilACamara>
);

const GANCHO = { lineas: ["Un 5 % por operación:", "te *suspendes_tú_solo*"], hasta: inicio("uno") - 0.05, color: ROJO };
export const Riesgochallenge: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/riesgochallenge_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.08} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} encima={Encima} />
);
