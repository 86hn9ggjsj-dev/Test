// Historia 5-30-10 «dopamina» "Ha caído un 50 %. Ya no puede bajar más. Error." (~34 s). Sin stickman: etiquetas de
// rebajas sobre un gráfico que no deja de caer. Fotograma 0: la línea bajando y la etiqueta −50 % balanceándose; el
// «suelo» que se rompe; −50 % antes del −90 %; la cuenta 100 → 50 → 10 (−90 %); tres etiquetas «BARATO» tachadas; y la
// regla: haber caído no es razón para comprar, solo tu señal y tu stop. Cierre en el móvil.
// Tiempos en src/gen/barato.json (scripts/barato.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/barato.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { ORO, ROJO, VERDE } from "../Bot/kit";
import { Sello } from "../Bot/historia";
import { Foco } from "../Bot/ui2d";
import { Boton, Marca, Rotulito, Ticket } from "../Bot/v3";
import { CierreMovil, Ficha3D, TarjetaAuditada } from "../Bot/dopa";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const BARATO_FPS = datos.fps;
export const BARATO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const min1 = (g: number, m = 1) => Math.min(g, m);

// ------------------------------------------------------------------ gráfico (precio 100 = arriba del todo)
const X0 = 130;
const X1 = 950;
const yp = (p: number) => 640 + (100 - p) * 6.2;
type Pt = [number, number];
const valor = (pts: Pt[], u: number) => {
  for (let i = 1; i < pts.length; i++)
    if (u <= pts[i][0]) {
      const [u0, v0] = pts[i - 1];
      const [u1, v1] = pts[i];
      const k = (u - u0) / (u1 - u0 || 1);
      return v0 + (v1 - v0) * k + 1.6 * Math.sin(u * 90) * Math.sin(k * Math.PI);
    }
  return pts[pts.length - 1][1];
};
const xu = (u: number) => X0 + u * (X1 - X0);
const camino = (pts: Pt[], u1: number) => {
  const out: string[] = [];
  for (let u = 0; u <= u1 + 1e-6; u += 0.004) out.push(`${xu(u).toFixed(1)},${yp(valor(pts, u)).toFixed(1)}`);
  return out.join(" ");
};
const Curva: React.FC<{ pts: Pt[]; u: number; color?: string }> = ({ pts, u, color = ROJO }) => (
  <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
    <polyline points={camino(pts, u)} fill="none" stroke={color} strokeWidth={8} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 12px ${color}88)` }} />
    <circle cx={xu(u)} cy={yp(valor(pts, u))} r={15} fill="#fff" />
  </svg>
);
// Etiqueta de rebajas colgando de un hilo, balanceándose
const Etiqueta: React.FC<{ t: number; t0: number; x: number; y: number; texto: string; sub?: string; color?: string; size?: number; fin?: number }> = ({ t, t0, x, y, texto, sub, color = ROJO, size = 1, fin }) => {
  const g = muelle(t, t0, 200, 9);
  const fuera = fin === undefined ? 0 : L(t, fin - 0.2, fin, 0, 1);
  if (g <= 0.01 || fuera >= 1) return null;
  const giro = 14 * Math.sin((t - t0) * 4.5) * Math.exp(-(t - t0) * 0.6) + 4;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${giro}deg) scale(${size * (0.4 + 0.6 * min1(g, 1.1))})`, transformOrigin: "0 0", opacity: min1(g * 2) * (1 - fuera) }}>
      <svg width={80} height={90} style={{ position: "absolute", left: -40, top: -6, overflow: "visible" }}><path d="M40 0 C40 30 40 60 40 86" stroke="#fff" strokeWidth={3} fill="none" /><circle cx={40} cy={2} r={7} fill="#fff" /></svg>
      <div style={{ position: "absolute", left: -130, top: 80, width: 260, padding: "34px 0 22px", clipPath: "polygon(50% 0, 100% 22%, 100% 100%, 0 100%, 0 22%)", background: color, textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
        <div style={{ width: 22, height: 22, borderRadius: 11, background: "#000", margin: "-14px auto 10px" }} />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: texto.length > 5 ? 50 : 70, color: "#fff", lineHeight: 1 }}>{texto}</div>
        {sub && <div style={{ ...mono(26), fontWeight: 800, color: "#fff", marginTop: 8 }}>{sub}</div>}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ 1. Hook: −50 % · «ya no puede bajar más» · el suelo se rompe · ERROR
const HOOK: Pt[] = [[0, 100], [0.15, 90], [0.22, 95], [0.45, 60], [0.52, 66], [0.7, 50], [0.8, 53], [1, 18]];
const Hook: React.FC<P> = ({ t }) => {
  const u = t < EV.error - 0.1 ? L(t, 0, EV["50"] + 0.3, 0.5, 0.78, (v) => 1 - Math.pow(1 - v, 2)) : L(t, EV.error - 0.1, EV.error + 0.45, 0.78, 1, (v) => v * v);
  const suelo = L(t, EV.bajar - 0.3, EV.bajar, 0, 1);
  const rompe = L(t, EV.error - 0.1, EV.error + 0.3, 0, 1);
  const xr = xu(0.86);
  return (
    <>
      {suelo > 0 && (
        <>
          <div style={{ position: "absolute", left: X0 - 20, width: xr - X0 + 20, top: yp(50) + 40, borderTop: "6px dashed #fff", opacity: suelo, transformOrigin: "100% 0", transform: `rotate(${12 * rompe}deg) translateY(${60 * rompe * rompe}px)` }} />
          <div style={{ position: "absolute", left: xr, width: X1 + 40 - xr, top: yp(50) + 40, borderTop: "6px dashed #fff", opacity: suelo * (1 - rompe), transformOrigin: "0 0", transform: `rotate(${-20 * rompe}deg)` }} />
          <div style={{ position: "absolute", left: X0 - 10, top: yp(50) + 60, ...mono(32), fontWeight: 800, color: "#fff", opacity: suelo * (1 - rompe) }}>SUELO: «NO PUEDE BAJAR MÁS»</div>
        </>
      )}
      <Curva pts={HOOK} u={u} />
      <Etiqueta t={t} t0={-0.15} x={xu(0.7)} y={yp(50) - 330} texto="−50 %" sub="REBAJAS" />
      {rompe > 0 && rompe < 1 && <AbsoluteFill style={{ background: ROJO, opacity: 0.18 * (1 - rompe) }} />}
      <Sello t={t} t0={EV.error - 0.05} texto="ERROR" top={1240} color={ROJO} size={84} />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: todo lo que cae un 90 %, antes cayó un 50 % · alguien compró ahí
const UNO: Pt[] = [[0, 100], [0.12, 92], [0.2, 96], [0.4, 50], [0.48, 58], [0.7, 30], [0.78, 34], [1, 10]];
const Uno: React.FC<P> = ({ t, s }) => {
  const u = L(t, s, EV["90"] + 0.15, 0.05, 1, (v) => 1 - Math.pow(1 - v, 2));
  const anillo = muelle(t, EV["50b"] - 0.2, 220, 10);
  const flecha = L(t, EV.barato - 0.4, EV.barato + 0.2, 0, 1, (v) => v);
  const x50 = xu(0.4);
  const y50 = yp(50);
  return (
    <>
      <Curva pts={UNO} u={u} />
      <Etiqueta t={t} t0={EV["90"] - 0.15} x={xu(1) - 10} y={yp(10) - 400} texto="−90 %" />
      {anillo > 0.01 && <div style={{ position: "absolute", left: x50 - 60, top: y50 - 60, width: 120, height: 120, borderRadius: 60, border: `6px solid ${ORO}`, transform: `scale(${0.5 + 0.5 * min1(anillo, 1.2)})`, boxShadow: `0 0 30px ${ORO}` }} />}
      <div style={{ position: "absolute", left: x50 - 200, width: 400, top: y50 + 80, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 64, color: ORO, opacity: min1(anillo * 2) }}>−50 %</div>
      {t > EV.alguien - 0.2 && (
        <Ticket x={300} y={1290} w={420} h={170} rot={-4} s={0.5 + 0.5 * min1(muelle(t, EV.alguien - 0.2, 220, 12), 1.08)} color={VERDE}>
          <div style={{ ...mono(30), fontWeight: 800, color: VERDE }}>COMPRADO EN −50 %</div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, marginTop: 8 }}>«ya está barato»</div>
        </Ticket>
      )}
      {flecha > 0 && (
        <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
          <line x1={x50} y1={y50} x2={x50 + (xu(1) - x50) * flecha} y2={y50 + (yp(10) - y50) * flecha} stroke={ROJO} strokeWidth={6} strokeDasharray="14 10" />
        </svg>
      )}
      {flecha > 0.6 && <div style={{ position: "absolute", left: 560, top: 800, ...mono(40), fontWeight: 800, color: ROJO, padding: "6px 16px", background: "#000", border: `3px solid ${ROJO}`, borderRadius: 10 }}>OTRO −80 %</div>}
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

// ------------------------------------------------------------------ 4. Dos: la cuenta 100 → 50 → 10 = −90 % · tres veces «barato», tres errores
const Caja: React.FC<{ t: number; t0: number; y: number; texto: string; color: string; fin: number }> = ({ t, t0, y, texto, color, fin: f }) => {
  const g = muelle(t, t0, 230, 13);
  const o = min1(g * 2) * (1 - L(t, f - 0.2, f, 0, 1));
  if (o <= 0.01) return null;
  return <div style={{ position: "absolute", left: 120, width: 380, top: y, height: 150, borderRadius: 28, border: `5px solid ${color}`, background: "#050505", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 88, color, opacity: o, transform: `scale(${0.6 + 0.4 * min1(g, 1.08)})`, boxShadow: `0 0 30px ${color}44` }}>{texto}</div>;
};
const Paso: React.FC<{ t: number; t0: number; y: number; texto: string; fin: number }> = ({ t, t0, y, texto, fin: f }) => {
  const o = L(t, t0 - 0.2, t0 + 0.05, 0, 1) * (1 - L(t, f - 0.2, f, 0, 1));
  if (o <= 0.01) return null;
  return (
    <div style={{ position: "absolute", left: 270, top: y, display: "flex", alignItems: "center", gap: 24, opacity: o }}>
      <svg width={80} height={90}><path d="M40 0 V70 M14 46 L40 76 L66 46" stroke={ROJO} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <span style={{ ...mono(46), fontWeight: 800, color: ROJO }}>{texto}</span>
    </div>
  );
};
const Dos: React.FC<P> = ({ t, s }) => {
  const f = EV.pensaste - 0.15;
  const llave = L(t, EV["90b"] - 0.3, EV["90b"], 0, 1);
  return (
    <>
      <Caja t={t} t0={s} y={470} texto="100 €" color="#fff" fin={f} />
      <Paso t={t} t0={EV["50c"]} y={630} texto="−50 %" fin={f} />
      <Caja t={t} t0={EV["50c"] + 0.1} y={730} texto="50 €" color={ORO} fin={f} />
      <Paso t={t} t0={EV["80"]} y={890} texto="−80 %" fin={f} />
      <Caja t={t} t0={EV["80"] + 0.15} y={990} texto="10 €" color={ROJO} fin={f} />
      {llave > 0 && t < f && (
        <>
          <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0, opacity: llave }}>
            <path d="M520 545 C580 545 580 545 580 600 V1000 C580 1065 580 1065 520 1065" stroke={ROJO} strokeWidth={7} fill="none" />
          </svg>
        </>
      )}
      <Ficha3D t={t} t0={EV["90b"] - 0.1} texto="−90 %" x={800} y={800} size={115} color={ROJO} fin={f} />
      {[0, 1, 2].map((k) => (
        <React.Fragment key={k}>
          <Etiqueta t={t} t0={EV.pensaste - 0.1 + k * 0.22} x={230 + k * 310} y={520 + k * 40} texto="BARATO" sub={["A 50 €", "A 30 €", "A 10 €"][k]} color={ORO} size={0.9} />
          <Marca t={t} t0={EV.equivocaste - 0.15 + k * 0.14} x={300 + k * 310} y={800 + k * 40} size={110} color={ROJO} tipo="no" />
        </React.Fragment>
      ))}
      <Sello t={t} t0={EV.equivocaste + 0.3} texto="3 ERRORES" top={1180} color={ROJO} size={66} />
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: haber caído ≠ comprar · tu señal ✓ · tu stop ✓ · COMPRAR
const Giro: React.FC<P> = ({ t, s }) => {
  const ec = muelle(t, s + 0.25, 220, 13);
  const dist = L(t, EV.razon - 0.2, EV.razon + 0.05, 0, 1);
  const listo = L(t, EV.stop + 0.1, EV.stop + 0.35, 0, 1);
  const item = (txt: string, t0: number, y: number) => {
    const o = L(t, t0 - 0.5, t0 - 0.25, 0, 1);
    const ok = t >= t0 - 0.05;
    return (
      <div style={{ position: "absolute", left: 200, top: y, display: "flex", alignItems: "center", gap: 34, opacity: o }}>
        <div style={{ width: 92, height: 92, borderRadius: 18, border: `6px solid ${ok ? VERDE : "#fff"}`, background: ok ? "rgba(47,224,138,0.15)" : "#000" }} />
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 74, color: ok ? VERDE : "#fff" }}>{txt}</span>
      </div>
    );
  };
  return (
    <>
      <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" top={360} />
      <div style={{ position: "absolute", left: 0, width: ANCHO, top: 470, display: "flex", justifyContent: "center", alignItems: "center", gap: 30, opacity: min1(ec * 2), transform: `scale(${0.6 + 0.4 * min1(ec, 1.06)})` }}>
        <span style={{ ...mono(46), fontWeight: 800, color: ROJO, padding: "14px 22px", border: `4px solid ${ROJO}`, borderRadius: 16 }}>HA CAÍDO</span>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 110, color: "#fff", opacity: dist, transform: `scale(${0.5 + 0.5 * dist})` }}>≠</span>
        <span style={{ ...mono(46), fontWeight: 800, color: VERDE, padding: "14px 22px", border: `4px solid ${VERDE}`, borderRadius: 16 }}>COMPRA</span>
      </div>
      {item("TU SEÑAL", EV.senal, 720)}
      {item("TU STOP", EV.stop, 870)}
      <Marca t={t} t0={EV.senal - 0.05} x={246} y={766} size={110} color={VERDE} tipo="ok" circulo={false} />
      <Marca t={t} t0={EV.stop - 0.05} x={246} y={916} size={110} color={VERDE} tipo="ok" circulo={false} />
      <Foco x={540} y={1160} w={700} h={160} o={0.18 * listo} color="47,224,138" />
      <Boton x={540} y={1150} w={680} h={130} texto={listo > 0.5 ? "AHORA SÍ, ENTRA" : "ENTRAR"} color={listo > 0 ? VERDE : "rgba(255,255,255,0.35)"} lleno={listo} o={L(t, EV.senal - 0.4, EV.senal - 0.1, 0, 1)} />
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: comenta BOT en el móvil → mensaje directo → cuenta auditada
const Cierre: React.FC<P> = (p) => <CierreMovil {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tFinal={EV.auditada} palabra="BOT" mensaje="Te explico cómo lo hago ↓" final={<TarjetaAuditada />} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["50", ORO], ["error", ROJO], ["90", ROJO], "antes", "alguien", ["barato", ORO], "sígueme", ["asusta", ROJO], ["80", ROJO], "pensaste", ["equivocaste", ROJO], "regla", "razón", ["señal", VERDE], ["stop", VERDE], "llegado", "bot", ["auditada", VERDE]]);
const GOLPES: [number, string?][] = [[0.02], [EV["50"], ROJO], [EV.bajar], [EV.error, ROJO], [EV["90"], ROJO], [EV["50b"], ORO], [EV.alguien, VERDE], [EV.barato, ROJO], [EV.asusta, ROJO], [EV["50c"], ORO], [EV["80"], ROJO], [EV["90b"], ROJO], [EV.pensaste, ORO], [EV.equivocaste, ROJO], [EV.regla], [EV.razon], [EV.senal, VERDE], [EV.stop, VERDE], [EV.llegado], [EV.bot], [EV.privado], [EV.auditada, VERDE]];

const GANCHO = { lineas: ["«Ya no puede", "*bajar_más*»"], hasta: inicio("uno") - 0.05, color: ROJO };
export const Barato: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/barato_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.08} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} />
);
