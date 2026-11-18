// Historia 5-30-10 «dopamina» "Pagaste 2.000 euros por un curso. Y por eso sigues perdiendo con él" (~33 s), con
// stickman («tú») encadenado a un recibo de 2.000 €. Fotograma 0: el recibo y la cadena al tobillo mientras pulsa COMPRAR
// y salen números rojos; tres meses en negativo y «si lo dejo, he tirado el dinero»; COSTE HUNDIDO: el recibo cae al pozo
// y no vuelve; seguir (−más) o dejarlo; la regla: la nota «sigo porque… la pagué» y la cadena que se rompe.
// Cierre en el móvil. Tiempos en src/gen/curso.json (scripts/curso.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/curso.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { ORO, ROJO, VERDE } from "../Bot/kit";
import { Clave, cuerpoEn, Stick } from "../Bot/stick";
import { BRAZOS_ARRIBA, HUNDIDO } from "../Bot/comun";
import { Sello } from "../Bot/historia";
import { Foco } from "../Bot/ui2d";
import { Boton, Marca, pulsa, Rotulito } from "../Bot/v3";
import { CierreMovil, Ficha3D, TarjetaAuditada } from "../Bot/dopa";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const CURSO_FPS = datos.fps;
export const CURSO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const min1 = (g: number, m = 1) => Math.min(g, m);

// ------------------------------------------------------------------ piezas: el recibo y la cadena
const Recibo: React.FC<{ x: number; y: number; rot?: number; s?: number; o?: number; sello?: number }> = ({ x, y, rot = -6, s = 1, o = 1, sello = 1 }) => (
  <div style={{ position: "absolute", left: x - 150, top: y - 110, width: 300, height: 220, transform: `rotate(${rot}deg) scale(${s})`, opacity: o }}>
    <div style={{ position: "absolute", inset: 0, background: "#f4f1e8", clipPath: "polygon(0 0, 100% 0, 100% 92%, 90% 100%, 80% 92%, 70% 100%, 60% 92%, 50% 100%, 40% 92%, 30% 100%, 20% 92%, 10% 100%, 0 92%)", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }} />
    <div style={{ position: "absolute", left: 22, top: 20, ...mono(22), fontWeight: 800, color: "#555" }}>RECIBO</div>
    <div style={{ position: "absolute", left: 22, top: 52, ...mono(24), fontWeight: 800, color: "#222" }}>CURSO DE TRADING</div>
    <div style={{ position: "absolute", left: 0, width: 300, top: 96, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 62, color: "#111" }}>2.000 €</div>
    <div style={{ position: "absolute", right: 16, top: 150, ...mono(26), fontWeight: 800, color: ROJO, border: `3px solid ${ROJO}`, padding: "2px 10px", borderRadius: 6, transform: `rotate(-10deg) scale(${0.6 + 0.4 * sello})`, opacity: sello }}>PAGADO</div>
  </div>
);
// Cadena de eslabones entre dos puntos (con algo de comba); «rota» la parte en dos y cada mitad cae
const Cadena: React.FC<{ a: [number, number]; b: [number, number]; rota?: number; t: number }> = ({ a, b, rota = 0, t }) => {
  const n = 14;
  const out: React.ReactNode[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const mitad = u < 0.5 ? 0 : 1;
    let x = a[0] + (b[0] - a[0]) * u;
    let y = a[1] + (b[1] - a[1]) * u + 50 * Math.sin(u * Math.PI) + 3 * Math.sin(t * 6 + i);
    if (rota > 0) {
      const d = mitad === 0 ? u / 0.5 : (1 - u) / 0.5;
      y += 160 * rota * d * d;
      x += (mitad === 0 ? -1 : 1) * 30 * rota * d;
    }
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * (180 / Math.PI) + (i % 2 ? 90 : 0);
    out.push(<ellipse key={i} cx={x} cy={y} rx={17} ry={10} fill="none" stroke="#c9c9d1" strokeWidth={6} transform={`rotate(${ang} ${x} ${y})`} />);
  }
  return <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.8))" }}>{out}</svg>;
};
const Grillete: React.FC<{ x: number; y: number }> = ({ x, y }) => <div style={{ position: "absolute", left: x - 26, top: y - 30, width: 52, height: 34, borderRadius: 10, border: "7px solid #c9c9d1" }} />;

// ------------------------------------------------------------------ 1. Hook: encadenado al recibo · pulsa COMPRAR · números rojos
const SX = 640;
const SY = 1360;
const SS = 210;
const Hook: React.FC<P> = ({ t, s }) => {
  const golpe = (k: number) => s + 0.25 + k * 0.75;
  const ks: Clave[] = [];
  for (let k = 0; k < 5; k++) ks.push([golpe(k), { mDx: 0.55, mDy: 0.18, boca: -0.2 }], [golpe(k) + 0.3, { mDx: 0.5, mDy: 0.32, boca: -0.4, cejas: -0.5 }]);
  const c = cuerpoEn(t, ks, { mDx: 0.5, mDy: 0.32, mira: 0.7 }, s - 0.4);
  const pie: [number, number] = [SX + c.pIx * SS, SY - 20];
  const k = Math.max(...[0, 1, 2, 3, 4].map((i) => pulsa(t, golpe(i) + 0.1)));
  return (
    <>
      <Recibo x={270} y={1240} sello={L(t, EV["2000"] - 0.2, EV["2000"] + 0.1, 0, 1)} />
      <Cadena a={[350, 1290]} b={pie} t={t} />
      <Grillete x={pie[0]} y={pie[1]} />
      <Boton x={830} y={1010} w={270} h={105} texto="COMPRAR" color={ROJO} k={k} />
      {[0, 1, 2, 3].map((i) => {
        const t0 = golpe(i) + 0.15;
        const u = L(t, t0, t0 + 0.9, 0, 1, (v) => v);
        return u > 0 && u < 1 ? <div key={i} style={{ position: "absolute", left: 620 + (i % 2) * 130, top: 900 - 260 * u, ...mono(44), fontWeight: 800, color: ROJO, opacity: 1 - u * u }}>{["−80 €", "−45 €", "−120 €", "−60 €"][i]}</div> : null;
      })}
      <Foco x={SX} y={SY} w={340} h={60} o={0.15} />
      <Stick c={c} ox={SX} oy={SY} s={SS} t={t} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: la estrategia no funciona · 3 meses en rojo · «si lo dejo, he tirado el dinero»
const MESES = ["MES 1", "MES 2", "MES 3"];
const Uno: React.FC<P> = ({ t, s }) => {
  const c = cuerpoEn(t, [[EV.funciona, { ...HUNDIDO, y: 0.79, agacha: 0.2 }], [EV.piensas - 0.1, { mIx: -0.1, mIy: 0.2, mDx: 0.15, mDy: -0.5, boca: -0.4, cejas: -0.6, mira: 0.6, agacha: 0, cabeza: 0.15 }]], { mDx: 0.5, mDy: 0.32, mira: 0.7 }, s - 0.3);
  const pie: [number, number] = [SX + c.pIx * SS, SY - 20];
  const nube = muelle(t, EV.piensas - 0.1, 210, 13);
  return (
    <>
      <div style={{ position: "absolute", left: 0, width: ANCHO, top: 430, textAlign: "center", ...mono(36), fontWeight: 800, color: "#fff", opacity: L(t, s, s + 0.2, 0, 1) }}>
        LA ESTRATEGIA DEL CURSO <span style={{ color: ROJO, opacity: L(t, EV.funciona - 0.1, EV.funciona + 0.1, 0, 1) }}>✗</span>
      </div>
      <div style={{ position: "absolute", left: 90, top: 500, display: "flex", gap: 24 }}>
        {MESES.map((m, i) => {
          const g = muelle(t, EV.tres - 0.25 + i * 0.22, 230, 12);
          return (
            <div key={i} style={{ width: 284, height: 200, borderRadius: 22, border: `4px solid ${g > 0.5 ? ROJO : "rgba(255,255,255,0.3)"}`, background: g > 0.5 ? "rgba(255,70,70,0.14)" : "#050505", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${0.85 + 0.15 * min1(g, 1.08)})` }}>
              <div style={{ ...mono(30), fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>{m}</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 62, color: ROJO, opacity: min1(g * 2) }}>{["−180 €", "−240 €", "−310 €"][i]}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, width: ANCHO, top: 730, textAlign: "center", ...mono(40), fontWeight: 800, color: ROJO, opacity: L(t, EV.negativo - 0.2, EV.negativo, 0, 1) }}>3 MESES EN NEGATIVO</div>
      {nube > 0.01 && (
        <div style={{ position: "absolute", left: 90, top: 830, width: 560, transform: `scale(${0.5 + 0.5 * min1(nube, 1.08)})`, transformOrigin: "90% 100%", opacity: min1(nube * 2) }}>
          <div style={{ background: "#fff", borderRadius: 60, padding: "26px 34px", fontFamily: SANS, fontWeight: 800, fontSize: 46, lineHeight: 1.15, color: "#111", textAlign: "center" }}>
            «Si lo dejo, <span style={{ color: ROJO, opacity: L(t, EV.tirado - 0.2, EV.tirado, 0.25, 1) }}>he tirado el dinero</span>»
          </div>
          <div style={{ position: "absolute", right: 30, top: "100%", marginTop: 10, width: 34, height: 34, borderRadius: 17, background: "#fff" }} />
          <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 56, width: 18, height: 18, borderRadius: 9, background: "#fff" }} />
        </div>
      )}
      <Recibo x={250} y={1290} s={0.8} />
      <Cadena a={[320, 1320]} b={pie} t={t} />
      <Grillete x={pie[0]} y={pie[1]} />
      <Stick c={c} ox={SX} oy={SY} s={SS} t={t} />
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

// ------------------------------------------------------------------ 4. Dos: COSTE HUNDIDO · el recibo cae al pozo y no vuelve · seguir (−más) o dejarlo
const Dos: React.FC<P> = ({ t, s }) => {
  const f = EV.decides - 0.25;
  const pozo = L(t, s, s + 0.3, 0, 1) * (1 - L(t, f - 0.2, f, 0, 1));
  const cae = L(t, EV.hundido - 0.1, EV["2000b"] + 0.3, 0, 1, (u) => u * u);
  const elige = muelle(t, EV.decides - 0.2, 220, 13);
  const mas = L(t, EV.mas - 0.2, fin("dos"), 0, 1, (u) => u);
  return (
    <>
      <Ficha3D t={t} t0={EV.coste - 0.15} texto="COSTE HUNDIDO" y={500} size={96} color={ORO} fin={f} />
      {pozo > 0.01 && (
        <div style={{ opacity: pozo }}>
          <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
            <defs><radialGradient id="hueco" cx="50%" cy="40%" r="60%"><stop offset="0%" stopColor="#000" /><stop offset="80%" stopColor="#0b0b0b" /><stop offset="100%" stopColor="#2a2a2a" /></radialGradient></defs>
            <ellipse cx={540} cy={1010} rx={330} ry={110} fill="url(#hueco)" stroke="#555" strokeWidth={8} />
          </svg>
          {cae < 1 && (
            <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 ${1920 - 1010 - 40 * (1 - cae)}px 0)` }}>
              <Recibo x={540} y={720 + 420 * cae} rot={-6 + 40 * cae} s={1 - 0.5 * cae} />
            </div>
          )}
          <div style={{ position: "absolute", left: 0, width: ANCHO, top: 1150, textAlign: "center", ...mono(44), fontWeight: 800, color: ROJO, opacity: L(t, EV.vuelven - 0.25, EV.vuelven, 0, 1) }}>NO VUELVEN · SIGAS O NO</div>
        </div>
      )}
      {elige > 0.01 && (
        <div style={{ position: "absolute", inset: 0, opacity: min1(elige * 2) }}>
          <div style={{ position: "absolute", left: 0, width: ANCHO, top: 470, textAlign: "center", ...mono(38), fontWeight: 800, color: "#fff" }}>LO ÚNICO QUE DECIDES:</div>
          <Boton x={320} y={680} w={360} h={140} texto="SEGUIR" color={ROJO} />
          <Boton x={760} y={680} w={360} h={140} texto="DEJARLO" color={VERDE} />
          <div style={{ position: "absolute", left: 100, width: 400, top: 800, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 70, color: ROJO, opacity: L(t, EV.mas - 0.25, EV.mas, 0, 1) }}>−{Math.round(40 + 460 * mas)} € más</div>
          <div style={{ position: "absolute", left: 580, width: 400, top: 800, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 70, color: VERDE, opacity: L(t, EV.mas - 0.25, EV.mas, 0, 1) }}>0 € más</div>
        </div>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: «sigo con esta estrategia porque…» → «la pagué» → la cadena se rompe
const FRASE = "Sigo con esta estrategia porque…";
const Giro: React.FC<P> = ({ t, s }) => {
  const nota = muelle(t, EV.escribe - 0.2, 200, 14);
  const n = Math.floor(L(t, EV.escribe, EV.razon - 0.2, 0, FRASE.length, (u) => u));
  const pague = L(t, EV.pague - 0.2, EV.pague + 0.1, 0, 1);
  const rota = L(t, EV.dejala - 0.05, EV.dejala + 0.5, 0, 1, (u) => 1 - Math.pow(1 - u, 2));
  const c = cuerpoEn(t, [[EV.dejala + 0.05, { ...BRAZOS_ARRIBA, y: 0.92, boca: 1, abre: 0.6, ojos: 1.2, cejas: 0.6 }], [EV.dejala + 0.35, { y: 0.79 }]], { ...HUNDIDO, y: 0.79, agacha: 0.3 }, s - 0.3);
  const pie: [number, number] = [SX + c.pIx * SS, SY - 20];
  const recY = 1290 + 500 * L(t, EV.dejala + 0.1, EV.dejala + 0.8, 0, 1, (u) => u * u);
  return (
    <>
      <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" top={360} />
      {nota > 0.01 && (
        <div style={{ position: "absolute", left: 120, top: 450, width: 840, height: 360, background: "#ffe98a", borderRadius: 10, transform: `rotate(-2deg) scale(${0.6 + 0.4 * min1(nota, 1.05)})`, opacity: min1(nota * 2), boxShadow: "0 30px 70px rgba(0,0,0,0.75)" }}>
          <div style={{ position: "absolute", left: 30, top: 18, ...mono(26), fontWeight: 800, color: "rgba(0,0,0,0.45)", opacity: L(t, EV.linea - 0.2, EV.linea, 0, 1) }}>EN UNA LÍNEA:</div>
          <div style={{ position: "absolute", left: 50, top: 70, right: 50, fontFamily: SANS, fontWeight: 800, fontSize: 58, lineHeight: 1.2, color: "#1b1b1b" }}>
            {FRASE.slice(0, n)}
            {n < FRASE.length && <span style={{ color: ROJO }}>|</span>}
          </div>
          <div style={{ position: "absolute", left: 50, top: 230, fontFamily: SANS, fontWeight: 800, fontStyle: "italic", fontSize: 76, color: ROJO, opacity: pague, transform: `rotate(-3deg) scale(${1.3 - 0.3 * pague})` }}>«la pagué»</div>
        </div>
      )}
      <Sello t={t} t0={EV.dejala - 0.1} texto="DÉJALA HOY" top={880} color={VERDE} size={70} />
      <Recibo x={250} y={recY} s={0.8} o={1 - L(t, EV.dejala + 0.5, EV.dejala + 0.8, 0, 1)} />
      {rota < 1 && <Cadena a={[320, 1320]} b={pie} t={t} rota={rota} />}
      {rota > 0 && rota < 0.5 && <AbsoluteFill style={{ background: VERDE, opacity: 0.25 * (1 - rota * 2) }} />}
      <Grillete x={pie[0]} y={pie[1]} />
      <Marca t={t} t0={EV.dejala} x={450} y={1300} size={100} color={VERDE} tipo="ok" />
      <Stick c={c} ox={SX} oy={SY} s={SS} t={t} />
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: comenta BOT en el móvil → mensaje directo → cuenta auditada
const Cierre: React.FC<P> = (p) => <CierreMovil {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tFinal={EV.auditada} palabra="BOT" mensaje="Te explico cómo lo hago ↓" final={<TarjetaAuditada />} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["2000", ORO], "curso", ["perdiendo", ROJO], "estrategia", ["funciona", ROJO], ["tres", ROJO], ["negativo", ROJO], "dejo", ["tirado", ROJO], "sígueme", ["doble", ROJO], ["coste", ORO], ["hundido", ORO], ["vuelven", ROJO], "decides", ["más", ROJO], "regla", "escribe", "línea", ["pagué", ROJO], ["déjala", VERDE], "llegado", "bot", ["auditada", VERDE]]);
const GOLPES: [number, string?][] = [[0.02], [EV["2000"], ORO], [EV.curso], [EV.perdiendo, ROJO], [EV.funciona, ROJO], [EV.tres, ROJO], [EV.negativo, ROJO], [EV.piensas], [EV.tirado, ROJO], [EV.doble, ROJO], [EV.coste, ORO], [EV.hundido], [EV.vuelven, ROJO], [EV.decides], [EV.mas, ROJO], [EV.regla], [EV.escribe], [EV.razon], [EV.pague, ROJO], [EV.dejala, VERDE], [EV.llegado], [EV.bot], [EV.privado], [EV.auditada, VERDE]];

const GANCHO = { lineas: ["Pagaste 2.000 € por un curso", "y por eso *sigues_perdiendo*"], hasta: inicio("uno") - 0.05, color: ROJO };
export const Curso: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/curso_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.08} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} />
);
