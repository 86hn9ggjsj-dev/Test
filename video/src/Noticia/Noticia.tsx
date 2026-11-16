// Reel 5-30-10 «dopamina» "NVIDIA ganó más de lo esperado. Y su acción se hundió" (~36 s), con stickmen (son «tú» y el
// resto del mercado). Fotograma 0: el titular verde de resultados récord con el stickman celebrando… y la vela roja que
// cae encima; el contador −200.000 M $; las barras «lo que esperaba el mercado» frente a «el dato»; la fila de stickmen
// que compran antes, sale el dato y venden todos a la vez (compra el rumor, vende la noticia); el calendario económico con
// la columna PREVISIÓN y la SORPRESA (ejemplo); y el cierre en el móvil. Tiempos en src/gen/noticia.json (scripts/noticia.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/noticia.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { ORO, ROJO, VERDE } from "../Bot/kit";
import { cuerpoEn, Stick } from "../Bot/stick";
import { BRAZOS_ARRIBA, CHOQUE } from "../Bot/comun";
import { CamaraTiembla } from "../Bot/historia";
import { Foco } from "../Bot/ui2d";
import { Cifra, Marca, Rotulito } from "../Bot/v3";
import { CierreMovil, Ficha3D, TarjetaAuditada } from "../Bot/dopa";
import { claves, CtaSeguir, Montaje, P } from "../Explica/Montaje";

export const NOTICIA_FPS = datos.fps;
export const NOTICIA_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const min1 = (g: number, m = 1) => Math.min(g, m);

// ------------------------------------------------------------------ 1. Hook: titular récord, el stickman celebra… y la vela roja
const Hook: React.FC<P> = ({ t, s }) => {
  const c = cuerpoEn(t, [[s, { ...BRAZOS_ARRIBA, boca: 1, abre: 0.5 }], [EV.hundio - 0.05, { ...CHOQUE }]], { ...BRAZOS_ARRIBA, boca: 1 }, s - 0.6);
  const cae = L(t, EV.hundio - 0.3, EV.hundio, 0, 1, (u) => u * u);
  const salto = t < EV.hundio ? Math.abs(Math.sin(t * 7)) * 22 : 0;
  return (
    <CamaraTiembla t={t} t0={EV.hundio} a={0.03}>
      <div style={{ position: "absolute", left: 110, top: 590, width: 860, padding: "26px 34px", borderRadius: 26, border: `4px solid ${VERDE}`, background: "#04120b", boxShadow: `0 0 50px ${VERDE}44`, color: "#fff", transform: `rotate(-2deg) scale(${0.7 + 0.3 * min1(muelle(t, -0.2, 220, 12), 1.05)})` }}>
        <div style={{ ...mono(30), fontWeight: 800, color: VERDE, letterSpacing: "0.12em" }}>ÚLTIMA HORA · NVIDIA</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, lineHeight: 1.05, marginTop: 10 }}>Resultados por encima de lo esperado <span style={{ color: VERDE }}>▲</span></div>
      </div>
      <Foco x={330} y={1360} w={380} h={80} o={0.15} />
      <Stick c={c} ox={330} oy={1360 - salto} s={230} t={t} />
      {cae > 0 && <div style={{ position: "absolute", left: 700, top: 560 + 260 * cae, width: 150, height: 560 * cae, borderRadius: 14, background: ROJO, boxShadow: `0 0 50px ${ROJO}` }} />}
    </CamaraTiembla>
  );
};

// ------------------------------------------------------------------ 2. Uno: −200.000 M $ · lo que esperaba el mercado frente al dato
const Uno: React.FC<P> = ({ t }) => {
  const contador = 1 - L(t, EV.mercado - 0.4, EV.mercado - 0.15, 0, 1);
  const barras = L(t, EV.mercado - 0.3, EV.mercado, 0, 1);
  const tacha = L(t, EV.malo, EV.malo + 0.3, 0, 1);
  const dif = muelle(t, EV.diferencia - 0.1, 220, 12);
  const base = 1240;
  return (
    <>
      {contador > 0.01 && (
        <AbsoluteFill style={{ opacity: contador }}>
          <Cifra t={t} t0={EV.esfumaron} t1={EV["200000"] + 0.5} de={0} a={200000} y={820} size={128} color={ROJO} pre="−" suf=" M $" />
          <div style={{ position: "absolute", left: 0, width: ANCHO, top: 920, textAlign: "center", ...mono(44), fontWeight: 800, letterSpacing: "0.14em", color: ROJO }}>DE VALOR, FUERA</div>
          <div style={{ position: "absolute", left: 0, width: ANCHO, top: 1010, textAlign: "center", ...mono(28, 0.6), fontWeight: 700 }}>FORTUNE · 29-8-2024</div>
        </AbsoluteFill>
      )}
      {barras > 0.01 && (
        <AbsoluteFill style={{ opacity: barras }}>
          <div style={{ position: "absolute", left: 120, right: 120, top: base, height: 4, background: "rgba(255,255,255,0.6)" }} />
          <div style={{ position: "absolute", left: 200, top: base - 520 * barras, width: 260, height: 520 * barras, borderRadius: "20px 20px 4px 4px", background: "linear-gradient(180deg, #8a8a8a, #2a2a2a)", border: "4px solid #bbb" }} />
          <div style={{ position: "absolute", left: 140, width: 380, top: base + 18, textAlign: "center", ...mono(30), fontWeight: 800, whiteSpace: "normal", lineHeight: 1.2 }}>LO QUE YA ESPERABA EL MERCADO</div>
          <div style={{ position: "absolute", left: 620, top: base - 560 * barras, width: 260, height: 560 * barras, borderRadius: "20px 20px 4px 4px", background: `linear-gradient(180deg, ${VERDE}, ${VERDE}33)`, border: `4px solid ${VERDE}` }} />
          <div style={{ position: "absolute", left: 560, width: 380, top: base + 18, textAlign: "center", ...mono(30), fontWeight: 800, color: VERDE }}>EL DATO</div>
          {t > EV.bueno - 0.1 && (
            <div style={{ position: "absolute", left: 0, width: ANCHO, top: 380, display: "flex", justifyContent: "center", gap: 40 }}>
              {["¿BUENO?", "¿MALO?"].map((w) => (
                <span key={w} style={{ position: "relative", fontFamily: SANS, fontWeight: 800, fontSize: 80, color: "#fff" }}>
                  {w}
                  <span style={{ position: "absolute", left: -10, top: "50%", width: `calc(${tacha * 100}% + 20px)`, height: 12, background: ROJO, boxShadow: `0 0 14px ${ROJO}` }} />
                </span>
              ))}
            </div>
          )}
          {dif > 0.01 && (
            <div style={{ position: "absolute", left: 500, top: base - 560 - 10, width: 380, transform: `scale(${0.5 + 0.5 * min1(dif, 1.1)})`, transformOrigin: "0% 50%", opacity: min1(dif * 2) }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: 120, height: 50, borderTop: `5px dashed ${ORO}`, borderBottom: `5px dashed ${ORO}` }} />
              <div style={{ position: "absolute", left: -330, top: -6, width: 320, textAlign: "right", ...mono(44), fontWeight: 800, color: ORO }}>LA DIFERENCIA →</div>
            </div>
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

// ------------------------------------------------------------------ 4. Dos: compran antes · sale el dato · venden todos · compra el rumor, vende la noticia
const N = 5;
const Dos: React.FC<P> = ({ t, s }) => {
  const sube = L(t, EV.todos, EV.antes + 0.6, 0, 1, (u) => u);
  const baja = L(t, EV.venden - 0.1, EV.venden + 1.0, 0, 1, (u) => 1 - Math.pow(1 - u, 2));
  const finales = L(t, EV.rumor - 0.35, EV.rumor - 0.1, 0, 1);
  const pts: string[] = [];
  const X0 = 130;
  const X1 = 950;
  const total = 0.62 * sube + 0.38 * baja;
  for (let k = 0; k <= 60 * total; k++) {
    const u = k / 60;
    const v = u < 0.62 ? (u / 0.62) * 300 : 300 - ((u - 0.62) / 0.38) * 360;
    pts.push(`${X0 + u * (X1 - X0)},${900 - v + Math.sin(k * 1.9) * 12}`);
  }
  return (
    <>
      <AbsoluteFill style={{ opacity: 1 - 0.8 * finales, filter: finales > 0.01 ? `blur(${8 * finales}px)` : undefined }}>
        <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
          {pts.length > 1 && <polyline points={pts.join(" ")} fill="none" stroke={baja > 0 ? ROJO : VERDE} strokeWidth={8} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 10px ${baja > 0 ? ROJO : VERDE})` }} />}
          <line x1={X0 + 0.62 * (X1 - X0)} x2={X0 + 0.62 * (X1 - X0)} y1={520} y2={1000} stroke={ORO} strokeWidth={4} strokeDasharray="12 10" opacity={L(t, EV.sale - 0.2, EV.sale, 0, 1)} />
        </svg>
        <div style={{ position: "absolute", left: X0 + 0.62 * (X1 - X0) - 150, width: 300, top: 470, textAlign: "center", ...mono(38), fontWeight: 800, color: ORO, opacity: L(t, EV.sale - 0.2, EV.sale, 0, 1) }}>SALE EL DATO</div>
        {Array.from({ length: N }, (_, i) => {
          const x = 170 + i * 185;
          const compra = t >= EV.todos + i * 0.25;
          const vende = t >= EV.venden + i * 0.06;
          const c = cuerpoEn(t, [[EV.todos + i * 0.25, { mDx: 0.25, mDy: 0.35, boca: 0.8 }], [EV.venden + i * 0.06, { mIx: -0.4, mIy: 0.1, mDx: 0.4, mDy: 0.1, boca: -0.5, cejas: 0.8, abre: 0.6 }]], {}, s - 0.3);
          return (
            <React.Fragment key={i}>
              <Stick c={c} ox={x} oy={1340} s={150} t={t + i} />
              {compra && <div style={{ position: "absolute", left: x - 70, width: 140, top: 1100, textAlign: "center", ...mono(28), fontWeight: 800, color: vende ? ROJO : VERDE, padding: "4px 0", borderRadius: 10, border: `3px solid ${vende ? ROJO : VERDE}`, background: "#000", transform: `scale(${0.6 + 0.4 * min1(muelle(t, vende ? EV.venden + i * 0.06 : EV.todos + i * 0.25, 260, 12), 1.1)})` }}>{vende ? "VENDE" : "COMPRA"}</div>}
            </React.Fragment>
          );
        })}
      </AbsoluteFill>
      <Ficha3D t={t} t0={EV.rumor - 0.1} texto="COMPRA EL RUMOR" y={700} size={100} color={VERDE} />
      <Ficha3D t={t} t0={EV.noticia - 0.1} texto="VENDE LA NOTICIA" y={940} size={100} color={ROJO} giro={-1} />
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: el calendario económico · PREVISIÓN · SORPRESA (ejemplo)
const Giro: React.FC<P> = ({ t }) => {
  const g = muelle(t, EV.regla + 0.1, 220, 13);
  const prev = L(t, EV.prevision - 0.2, EV.prevision + 0.1, 0, 1);
  const sorpresa = muelle(t, EV.sorpresa - 0.1, 220, 12);
  const col = (k: number) => (k === 1 && prev > 0.5 ? ORO : "#fff");
  return (
    <>
      <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" top={360} />
      <div style={{ position: "absolute", left: 90, top: 540, width: 900, borderRadius: 28, border: "3px solid rgba(255,255,255,0.8)", background: "#060606", overflow: "hidden", opacity: min1(g * 2), transform: `translateY(${(1 - min1(g)) * 60}px)` }}>
        <div style={{ padding: "20px 28px", ...mono(30), fontWeight: 800, borderBottom: "2px solid #333", letterSpacing: "0.1em" }}>CALENDARIO ECONÓMICO · EJEMPLO</div>
        <div style={{ display: "flex", padding: "18px 28px", ...mono(30), fontWeight: 800, borderBottom: "2px solid #222" }}>
          {["DATO", "PREVISIÓN", "REAL"].map((h, k) => <span key={h} style={{ flex: k ? 1 : 1.3, color: col(k), textAlign: k ? "center" : "left" }}>{h}</span>)}
        </div>
        <div style={{ display: "flex", padding: "26px 28px", fontFamily: SANS, fontWeight: 800, fontSize: 54, alignItems: "center", color: "#fff" }}>
          <span style={{ flex: 1.3, fontSize: 42 }}>Inflación</span>
          <span style={{ flex: 1, textAlign: "center", color: col(1), padding: "6px 0", borderRadius: 14, background: prev > 0.5 ? "rgba(245,196,81,0.15)" : undefined, boxShadow: prev > 0.5 ? `0 0 30px ${ORO}55` : undefined }}>2,1 %</span>
          <span style={{ flex: 1, textAlign: "center" }}>2,4 %</span>
        </div>
      </div>
      {sorpresa > 0.01 && (
        <div style={{ position: "absolute", left: 0, width: ANCHO, top: 980, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transform: `scale(${0.5 + 0.5 * min1(sorpresa, 1.1)})`, opacity: min1(sorpresa * 2) }}>
          <span style={{ ...mono(40), fontWeight: 800, color: ORO }}>REAL − PREVISIÓN</span>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 130, color: ORO, textShadow: `0 0 40px ${ORO}88` }}>= SORPRESA</span>
        </div>
      )}
      <Marca t={t} t0={EV.noticia2 - 0.05} x={900} y={1250} size={110} color={VERDE} tipo="ok" />
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: comenta BOT en el móvil → mensaje directo → cuenta auditada
const Cierre: React.FC<P> = (p) => <CierreMovil {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tFinal={EV.auditada} palabra="BOT" mensaje="Te explico cómo lo hago ↓" final={<TarjetaAuditada />} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["nvidia", VERDE], ["esperaban", VERDE], ["hundió", ROJO], ["200000", ROJO], "mercado", "bueno", "malo", ["diferencia", ORO], "sígueme", "todos", ["compraron", VERDE], ["venden", ROJO], ["rumor", VERDE], ["noticia", ROJO], "regla", ["previsión", ORO], ["sorpresa", ORO], "llegado", "bot", ["auditada", VERDE]]);
const GOLPES: [number, string?][] = [[0.02, VERDE], [EV.esperaban, VERDE], [EV.hundio, ROJO], [EV["200000"], ROJO], [EV.mercado], [EV.malo, ROJO], [EV.diferencia, ORO], [EV.todos, VERDE], [EV.antes], [EV.sale, ORO], [EV.venden, ROJO], [EV.rumor, VERDE], [EV.noticia, ROJO], [EV.regla], [EV.prevision, ORO], [EV.sorpresa, ORO], [EV.noticia2, VERDE], [EV.llegado], [EV.bot], [EV.privado], [EV.auditada, VERDE]];

const GANCHO = { lineas: ["Ganó más de lo esperado", "y su acción *se_hundió*"], hasta: inicio("uno") - 0.05, color: ROJO };
export const Noticia: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/noticia_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.08} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} />
);
