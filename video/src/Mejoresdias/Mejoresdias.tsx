// Reel 5-30-10 «dopamina» "Diez días en veinte años valen la mitad" (~37 s), con stickman (es «tú»). Datos: J.P. Morgan
// Asset Management, Guide to Retirement 2024 (S&P 500, 2004-2023: 9,8 % al año invertido todo el tiempo; 5,6 % sin los 10
// mejores días; 7 de esos 10 llegaron a menos de dos semanas de los 10 peores). Fotograma 0: el calendario de 20 años
// barriéndose con 10 casillas que se encienden en verde y se borran; la tarjeta de la fuente; 9,8 % con el stickman
// tumbado «sin tocar nada» frente a 5,6 %; el gráfico con las peores velas y, pegadas, las mejores; el stickman que vende
// por miedo justo antes de la vela verde; la regla (la nota «vuelvo a entrar en…» antes de vender) y el cierre en el móvil.
// Tiempos en src/gen/mejoresdias.json (scripts/mejoresdias.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import datos from "../gen/mejoresdias.json";
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";
import { ORO, ROJO, VERDE } from "../Bot/kit";
import { cuerpoEn, Stick } from "../Bot/stick";
import { CHOQUE } from "../Bot/comun";
import { Foco } from "../Bot/ui2d";
import { Boton, Marca, pulsa, Rotulito } from "../Bot/v3";
import { CierreMovil, Ficha3D, Prueba, TarjetaAuditada } from "../Bot/dopa";
import { claves, CtaSeguir, cuando, Montaje, P } from "../Explica/Montaje";

export const MEJORESDIAS_FPS = datos.fps;
export const MEJORESDIAS_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const en = cuando(datos);
const T98 = en("98", EV["2023"]);
const T56 = en("56", EV.mejores);
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fin = (id: string) => datos.escenas.find((x) => x.id === id)!.e;
const min1 = (g: number, m = 1) => Math.min(g, m);

// ------------------------------------------------------------------ 1. Hook: el calendario de 20 años y los 10 días verdes
const COLS = 40;
const FILAS = 30;
const CELDA = 20;
const MEJORES = [57, 212, 388, 431, 590, 702, 815, 940, 1066, 1150];
const Hook: React.FC<P> = ({ t }) => {
  const x0 = (ANCHO - COLS * CELDA) / 2;
  const y0 = 650;
  const barrido = L(t, 0, 1.6, 0, 1, (u) => u);
  const anio = Math.round(2004 + 19 * barrido);
  const borra = L(t, EV.pierdes - 0.05, EV.pierdes + 0.4, 0, 1);
  return (
    <>
      <div style={{ position: "absolute", left: 0, width: ANCHO, top: 575, textAlign: "center", ...mono(42), fontWeight: 800, letterSpacing: "0.14em" }}>{anio} · 20 AÑOS</div>
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: COLS * FILAS }, (_, i) => {
          const fila = Math.floor(i / COLS);
          const visto = fila / FILAS < barrido;
          const k = MEJORES.indexOf(i);
          const on = k >= 0 && t >= 0.15 + k * 0.09;
          const ido = k >= 0 && borra > 0;
          return (
            <rect key={i} x={x0 + (i % COLS) * CELDA + 2} y={y0 + fila * CELDA + 2} width={CELDA - 4} height={CELDA - 4} rx={3}
              fill={on && !ido ? VERDE : ido ? "#000" : visto ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.06)"}
              stroke={ido ? ROJO : "none"} strokeWidth={2.5}
              style={on && !ido ? { filter: `drop-shadow(0 0 8px ${VERDE})` } : undefined}
              transform={on && !ido ? `translate(${x0 + (i % COLS) * CELDA + CELDA / 2} ${y0 + fila * CELDA + CELDA / 2}) scale(2.2) translate(${-(x0 + (i % COLS) * CELDA + CELDA / 2)} ${-(y0 + fila * CELDA + CELDA / 2)})` : undefined} />
          );
        })}
        <line x1={x0 - 10} x2={x0 + COLS * CELDA + 10} y1={y0 + FILAS * CELDA * barrido} y2={y0 + FILAS * CELDA * barrido} stroke="#fff" strokeWidth={4} opacity={barrido < 1 ? 0.9 : 0} style={{ filter: "drop-shadow(0 0 10px #fff)" }} />
      </svg>
      <Ficha3D t={t} t0={EV.mitad - 0.1} texto="≈ ½" y={1330} size={150} color={ROJO} sub="LO QUE GANAS" />
    </>
  );
};

// ------------------------------------------------------------------ 2. Uno: la fuente · 9,8 % sin tocar nada (stickman tumbado) · 5,6 % sin los 10 mejores
const Uno: React.FC<P> = ({ t, s }) => {
  const fuente = 1 - L(t, T98 - 0.4, T98 - 0.15, 0, 1);
  const cifras = L(t, T98 - 0.3, T98 - 0.05, 0, 1);
  const c = cuerpoEn(t, [[EV.tocar - 0.2, { mIx: -0.3, mIy: 0.2, mDx: 0.3, mDy: 0.2, boca: 0.9, ojos: 0.45, incl: -0.08 }], [T56, { boca: 0.4, ojos: 1, cejas: 0.5 }]], {}, s);
  return (
    <>
      {fuente > 0.01 && (
        <AbsoluteFill style={{ opacity: fuente }}>
          <Prueba t={t} t0={EV.bolsa - 0.2} x={540} y={850} cabecera="J.P. MORGAN ASSET MANAGEMENT · 2024" titulo="«Guide to Retirement»" cifra="S&P 500" pie="del 3-1-2004 al 29-12-2023" />
        </AbsoluteFill>
      )}
      {cifras > 0.01 && (
        <AbsoluteFill style={{ opacity: cifras }}>
          <Ficha3D t={t} t0={T98 - 0.1} texto="9,8 %" x={300} y={620} size={160} color={VERDE} sub="SIN TOCAR NADA" />
          <Ficha3D t={t} t0={T56 - 0.1} texto="5,6 %" x={780} y={620} size={160} color={ROJO} sub="SIN LOS 10 MEJORES" giro={-1} />
          {t > EV.tocar - 0.4 && (
            <>
              <Foco x={300} y={1240} w={420} h={80} o={0.25} color="47,224,138" />
              <Stick c={c} ox={300} oy={1240} s={260} t={t} o={L(t, EV.tocar - 0.4, EV.tocar - 0.1, 0, 1)} />
              <div style={{ position: "absolute", left: 160, top: 1290, width: 280, textAlign: "center", ...mono(30), fontWeight: 800, color: VERDE, opacity: L(t, EV.tocar, EV.tocar + 0.3, 0, 1) }}>AÑOS SIN VENDER</div>
            </>
          )}
          {t > T56 - 0.2 && (
            <svg width={300} height={300} viewBox="0 0 100 100" style={{ position: "absolute", left: 630, top: 900, opacity: L(t, T56 - 0.2, T56 + 0.1, 0, 1) }}>
              {Array.from({ length: 10 }, (_, k) => <rect key={k} x={6 + (k % 5) * 18} y={20 + Math.floor(k / 5) * 26} width={14} height={20} rx={3} fill="#000" stroke={ROJO} strokeWidth={2.5} />)}
              <text x={50} y={92} textAnchor="middle" fontFamily="monospace" fontWeight={800} fontSize={10} fill={ROJO}>10 DÍAS FUERA</text>
            </svg>
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

// ------------------------------------------------------------------ 4. Dos: las peores velas y, pegadas, las mejores · el stickman vende por miedo
// [apertura, cierre] en «puntos» (más alto = más arriba)
const VELAS: [number, number][] = [[50, 52], [52, 51], [51, 53], [53, 52], [52, 54], [54, 53], [53, 52], [52, 51], [51, 38], [38, 50], [50, 49], [49, 50], [50, 48], [48, 47], [47, 33], [33, 36], [36, 49], [49, 50], [50, 52], [52, 51]];
const PEORES = [8, 14];
const MEJORES_V = [9, 16];
const Dos: React.FC<P> = ({ t, s }) => {
  const X0 = 140;
  const paso = 40;
  const yv = (v: number) => 1080 - (v - 30) * 22;
  const visibles = Math.floor(L(t, s, EV.semanas - 0.3, 6, VELAS.length, (u) => u));
  const resalta = L(t, EV.peores - 0.1, EV.peores + 0.2, 0, 1);
  const vende = L(t, EV.justo - 0.4, EV.justo - 0.1, 0, 1);
  const verdeFinal = L(t, EV.miedo - 0.2, EV.miedo + 0.3, 0, 1);
  const c = cuerpoEn(t, [[EV.vendiste - 0.25, { mDx: 0.48, mDy: -0.15, agobio: 1, cejas: -1, boca: -0.7, mira: 0.8 }], [EV.miedo - 0.1, { ...CHOQUE, mira: 0.6 }]], { agobio: 0.4, boca: -0.3 }, EV.justo - 0.8);
  const ultima = VELAS.length;
  return (
    <>
      <Ficha3D t={t} t0={EV.siete - 0.05} texto="7 DE 10" y={360} size={110} color={ORO} sub="MEJORES DÍAS PEGADOS A LOS PEORES" fin={EV.semanas - 0.15} />
      <svg width={ANCHO} height={1920} style={{ position: "absolute", inset: 0, opacity: 1 - 0.45 * vende * (1 - verdeFinal) }}>
        {VELAS.slice(0, visibles).map(([a, b], i) => {
          const sube = b >= a;
          const peor = PEORES.indexOf(i) >= 0;
          const mejor = MEJORES_V.indexOf(i) >= 0;
          const col = sube ? (mejor && resalta > 0.5 ? VERDE : "#fff") : peor && resalta > 0.5 ? ROJO : "#fff";
          const y1 = yv(Math.max(a, b));
          const h = Math.max(6, Math.abs(yv(a) - yv(b)));
          return <rect key={i} x={X0 + i * paso} y={y1} width={28} height={h} rx={4} fill={sube ? col : "#000"} stroke={col} strokeWidth={4} style={(peor || mejor) && resalta > 0.5 ? { filter: `drop-shadow(0 0 12px ${col})` } : undefined} />;
        })}
        {t > EV.semanas - 0.1 && (
          <g opacity={L(t, EV.semanas - 0.1, EV.semanas + 0.2, 0, 1)}>
            <path d={`M${X0 + 8 * paso + 14} 560 V530 H${X0 + 9 * paso + 14} V560`} fill="none" stroke={ORO} strokeWidth={4} />
            <path d={`M${X0 + 14 * paso + 14} 560 V530 H${X0 + 16 * paso + 14} V560`} fill="none" stroke={ORO} strokeWidth={4} />
            <text x={X0 + 12 * paso} y={505} textAnchor="middle" fontFamily="monospace" fontWeight={800} fontSize={34} fill={ORO}>{"< 2 SEMANAS"}</text>
          </g>
        )}
        {verdeFinal > 0 && <rect x={X0 + ultima * paso} y={yv(52) - 380 * verdeFinal} width={28} height={380 * verdeFinal} rx={4} fill={VERDE} style={{ filter: `drop-shadow(0 0 20px ${VERDE})` }} />}
      </svg>
      {resalta > 0.5 && (
        <>
          <div style={{ position: "absolute", left: X0 + 8 * paso - 70, top: yv(38) + 20, ...mono(28), fontWeight: 800, color: ROJO }}>PEORES</div>
          <div style={{ position: "absolute", left: X0 + 16 * paso - 40, top: yv(52) - 70, ...mono(28), fontWeight: 800, color: VERDE }}>MEJORES</div>
        </>
      )}
      {vende > 0.01 && (
        <AbsoluteFill style={{ opacity: vende }}>
          <Foco x={260} y={1300} w={380} h={80} o={0.15} />
          <Stick c={c} ox={260} oy={1300} s={230} t={t} />
          <Boton x={560} y={1220} w={300} h={120} texto="VENDER" color={ROJO} lleno={pulsa(t, EV.vendiste)} k={pulsa(t, EV.vendiste)} />
          {verdeFinal > 0.3 && <div style={{ position: "absolute", left: 650, top: 760, ...mono(40), fontWeight: 800, color: VERDE, transform: `rotate(-6deg)` }}>SIN TI ↑</div>}
        </AbsoluteFill>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: antes de vender, la nota «vuelvo a entrar en…»
const Escribe: React.FC<{ t: number; t0: number; texto: string }> = ({ t, t0, texto }) => {
  const n = Math.max(0, Math.min(texto.length, Math.floor(L(t, t0, t0 + 0.5, 0, texto.length + 0.99, (u) => u))));
  return <span>{texto.slice(0, n)}</span>;
};
const Giro: React.FC<P> = ({ t, s }) => {
  const nota = muelle(t, EV.escribe - 0.15, 220, 13);
  const c = cuerpoEn(t, [[EV.escribe - 0.2, { mDx: 0.42, mDy: -0.05, boca: 0.3, mira: 0.7 }], [EV.sabes, { mDx: 0.15, mDy: -0.52, boca: 0.5, mira: 0.4 }]], {}, s - 0.3);
  const boton = L(t, EV.sabes - 0.3, EV.sabes, 0, 1);
  return (
    <>
      <Rotulito t={t} t0={EV.regla - 0.15} texto="LA REGLA" top={360} />
      <Rotulito t={t} t0={EV.panico - 0.1} texto="SI VAS A VENDER POR MIEDO…" top={440} color={ROJO} />
      <Foco x={300} y={1290} w={380} h={80} o={0.15} />
      <Stick c={c} ox={300} oy={1290} s={280} t={t} />
      {nota > 0.01 && (
        <div style={{ position: "absolute", left: 500, top: 620, width: 470, padding: "28px 30px", borderRadius: 20, border: `5px solid ${ORO}`, background: "#0a0803", boxShadow: `0 0 40px ${ORO}44`, transform: `rotate(-3deg) scale(${(0.6 + 0.4 * min1(nota, 1.08)) * (1 - 0.25 * boton)}) translateY(${-160 * boton}px)`, opacity: min1(nota * 2), color: "#fff" }}>
          <div style={{ ...mono(32), fontWeight: 800, color: ORO, whiteSpace: "normal", lineHeight: 1.2 }}>VUELVO A ENTRAR:</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 46, marginTop: 20 }}>Precio: <span style={{ color: VERDE }}><Escribe t={t} t0={EV.precio} texto="4.300" /></span></div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 46, marginTop: 12 }}>Fecha: <span style={{ color: VERDE }}><Escribe t={t} t0={EV.fecha} texto="1 de dic." /></span></div>
        </div>
      )}
      {boton > 0.01 && (
        <>
          <Boton x={730} y={1120} w={360} h={140} texto="VENDER" color={ROJO} o={boton * (t > EV.vendas ? 0.5 : 1)} />
          <Marca t={t} t0={EV.vendas - 0.05} x={900} y={1060} size={130} color={ROJO} tipo="no" />
        </>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: comenta BOT en el móvil → mensaje directo → cuenta auditada
const Cierre: React.FC<P> = (p) => <CierreMovil {...p} tComenta={EV.comenta} tPalabra={EV.bot} tPrivado={EV.privado} tFinal={EV.auditada} palabra="BOT" mensaje="Te explico cómo lo hago ↓" final={<TarjetaAuditada />} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, sigueme: Sigueme, dos: Dos, giro: Giro, cierre: Cierre };
export const CLAVES = claves([["diez", VERDE], "veinte", ["pierdes", ROJO], ["mitad", ROJO], "bolsa", ["98", VERDE], ["tocar", VERDE], ["mejores", VERDE], ["56", ROJO], "sígueme", ["siete", ORO], "semanas", ["peores", ROJO], ["vendiste", ROJO], ["miedo", ROJO], "regla", ["pánico", ROJO], "escribe", "precio", "fecha", ["vendas", ROJO], "llegado", "plan", "bot", ["auditada", VERDE]]);
const GOLPES: [number, string?][] = [[0.02, VERDE], [EV.veinte], [EV.pierdes, ROJO], [EV.mitad, ROJO], [EV.bolsa], [T98, VERDE], [EV.tocar], [T56, ROJO], [EV.siete, ORO], [EV.semanas], [EV.peores, ROJO], [EV.vendiste, ROJO], [EV.miedo, VERDE], [EV.regla], [EV.panico, ROJO], [EV.escribe], [EV.precio, VERDE], [EV.fecha, VERDE], [EV.vendas, ROJO], [EV.llegado], [EV.bot], [EV.privado], [EV.auditada, VERDE]];

const GANCHO = { lineas: ["10 días en 20 años", "valen *la_mitad*"], hasta: inicio("uno") - 0.05, color: VERDE };
export const Mejoresdias: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/mejoresdias_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta gancho={GANCHO} zoom={1.08} empujes={0.035} tinta={1.3} bucle subs={{ y: 0.785, tamano: 108, ancho: 900 }} golpes={GOLPES} />
);
