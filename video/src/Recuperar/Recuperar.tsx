// Reel de alcance "¿Cuánto tardas en recuperar una mala semana?" (~39 s): −20 % gigante con una curva que se desploma, el
// bloque que baja a 800 y necesita un +25 % (no un +20 %), la pregunta a los espectadores, las curvas al 2 % mensual que
// tardan 11 y 18 meses en volver, y una semana frente a las 52 de un año. Tiempos en src/gen/recuperar.json.
import { useCurrentFrame } from "remotion";
import datos from "../gen/recuperar.json";
import { salida } from "../Premium/ui";
import { Arriba, Etiqueta, euros, L, mono, muelle, Titular } from "../Bot/piezas";
import { caja, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { claves, CtaSeguir, Destello, Gigante, golpe, Kicker, Montaje, P, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const RECUPERAR_FPS = datos.fps;
export const RECUPERAR_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;

// ------------------------------------------------------------------ 1. Hook: −20 % en una mala semana
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.35, 0], L(t, s, e, 6.4, 6.0), L(t, s, e, -0.3, -0.1) + sacude(t, EV.doler - 0.05, 0.02), L(t, s, e, 0.12, 0.18), { apertura: 35, centroY: 1060 });
  const tr: Trazo[] = [...polvo(0.3)];
  const pts: V3[] = [[-0.9, -0.15, 0], [-0.6, -0.08, 0], [-0.3, -0.12, 0], [-0.05, -0.05, 0], [0.15, -0.3, 0], [0.4, -0.45, 0], [0.6, -0.6, 0], [0.9, -0.65, 0]];
  tr.push({ t: "l", a: [-1.0, -0.05, 0], b: [1.0, -0.05, 0], w: 1.2, o: 0.5, dash: "6 8" });
  tr.push({ t: "p", pts, w: 2.6, o: 1, luz: 0.5, prog: L(t, -0.4, EV.doler, 0.3, 1, (u) => u) });
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Gigante t={t} t0={-0.45} texto="−20 %" top={440} size={220} pie="EN UNA MALA SEMANA" />
      <Arriba>
        <Titular t={t} t0={-0.6} texto="¿cuánto *tardas*?" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Cuenta: de 1.000 a 800; un +20 % se queda en 960, hace falta un +25 %
const BASE = -0.8;
const ALT = (v: number) => (v / 1000) * 1.2;
const bloque = (tr: Trazo[], y0: number, y1: number, o = 1, luz = 0.2, dash?: string) => {
  for (const [a, b] of caja([-0.45, y0, -0.3], [0.45, y1, 0.3])) tr.push({ t: "l", a, b, w: 1.8, o, luz, dash });
};
const Cuenta: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.15, 0], L(t, s, e, 6.6, 6.2), L(t, s, e, -0.35, 0.05) + sacude(t, EV.veinticinco - 0.05), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const g = muelle(t, s + 0.05, 170, 15);
  const baja = L(t, EV.veinte - 0.1, EV.veinte + 0.4, 1000, 800, salida);
  bloque(tr, BASE, BASE + ALT(baja) * Math.min(g, 1.05));
  tr.push({ t: "l", a: [-0.95, BASE + ALT(1000), 0], b: [0.95, BASE + ALT(1000), 0], w: 1.2, o: 0.6, dash: "6 6" });
  const v20 = L(t, EV.volver, EV.volver + 0.6, 800, 960, salida);
  const v25 = L(t, EV.veinticinco - 0.15, EV.veinticinco + 0.3, 960, 1000, salida);
  const fase25 = t >= EV.veinticinco - 0.15;
  if (t >= EV.volver) bloque(tr, BASE + ALT(800), BASE + ALT(fase25 ? v25 : v20), 1, fase25 ? 0.7 : 0.2, "5 4");
  const pr = proyector(cam);
  const qTop = pr([0, BASE + ALT(t >= EV.volver ? (fase25 ? v25 : v20) : baja), 0.3]);
  const qRef = pr([-0.95, BASE + ALT(1000), 0]);
  const k = golpe(t, EV.veinticinco - 0.05);
  const valor = t >= EV.volver ? (fase25 ? v25 : v20) : baja;
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: qTop.x, top: qTop.y - 74, transform: `translateX(-50%) scale(${1 + 0.25 * k})`, opacity: Math.min(g * 1.5, 1), ...mono(56) }}>{`${euros(valor)} €`}</div>
      <Etiqueta t={t} t0={EV.veinte - 0.05} x={qRef.x} y={qRef.y - 26} size={24} o={0.7}>
        DONDE ESTABAS
      </Etiqueta>
      <Etiqueta t={t} t0={EV.volver + 0.1} x={pr([0.5, BASE + ALT(900), 0.3]).x} y={pr([0.5, BASE + ALT(900), 0.3]).y} size={40} o={fase25 ? 0.4 : 1}>
        +20 %
      </Etiqueta>
      <Etiqueta t={t} t0={EV.veinticinco - 0.1} x={pr([0.5, BASE + ALT(1000), 0.3]).x} y={pr([0.5, BASE + ALT(1000), 0.3]).y - 70} size={52}>
        +25 %
      </Etiqueta>
      <Destello t={t} t0={EV.veinticinco - 0.05} o={0.18} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.volver - 0.35} texto="pierdes un *20 %*" size={104} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.volver - 0.3} fin={EV.veinticinco - 0.35} texto="¿un *20 %* para volver?" size={88} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.veinticinco - 0.3} texto="necesitas un *25 %*" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Pregunta a los espectadores
const Pregunta: React.FC<P> = (p) => <PreguntaComentarios {...p} lineas={["¿cuál ha sido", "tu peor *racha*?"]} />;

// ------------------------------------------------------------------ 4. Tiempo: al 2 % mensual, 11 meses desde −20 % y 18 desde −30 %
const XM = (m: number) => -0.9 + (1.8 * m) / 20;
const YE = (v: number) => -0.55 + ((v - 680) / 340) * 1.1;
const curva = (v0: number, hasta: number): V3[] => {
  const pts: V3[] = [];
  for (let m = 0; m <= hasta + 0.001; m += 0.5) pts.push([XM(m), YE(Math.min(v0 * Math.pow(1.02, m), 1000)), 0]);
  return pts;
};
const Tiempo: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 6.4, 6.0), L(t, s, e, -0.25, 0.05) + sacude(t, EV.medio - 0.05), L(t, s, e, 0.1, 0.16), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const raiz = L(t, s, s + 0.5, 0, 1, salida);
  tr.push({ t: "p", pts: [[XM(0), YE(1000), 0], [XM(20), YE(1000), 0]], w: 1.4, o: 0.7, dash: "6 6", prog: raiz });
  tr.push({ t: "p", pts: [[XM(0), YE(680), 0], [XM(20), YE(680), 0]], w: 1.2, o: 0.5, prog: raiz });
  for (let m = 0; m <= 20; m += 2) tr.push({ t: "l", a: [XM(m), YE(680) - 0.03, 0], b: [XM(m), YE(680) + 0.03, 0], w: 1, o: 0.5 * raiz });
  const MA = Math.log(1.25) / Math.log(1.02);
  const MB = Math.log(1 / 0.7) / Math.log(1.02);
  const mA = L(t, EV.dos - 0.2, EV.meses, 0, MA, (u) => u);
  const mB = L(t, EV.treinta - 0.1, EV.medio, 0, MB, (u) => u);
  if (t >= EV.dos - 0.2) tr.push({ t: "p", pts: curva(800, mA), w: 2.6, o: 1, luz: 0.5 });
  if (t >= EV.treinta - 0.1) tr.push({ t: "p", pts: curva(700, mB), w: 2.6, o: 1, luz: 0.5, dash: "10 6" });
  if (t >= EV.meses) tr.push({ t: "e", c: [XM(MA), YE(1000), 0], r: 0.045, tipo: "punto", o: 1, luz: 1 });
  if (t >= EV.medio) tr.push({ t: "e", c: [XM(MB), YE(1000), 0], r: 0.045, tipo: "punto", o: 1, luz: 1 });
  const pr = proyector(cam);
  const qA = pr([XM(MA), YE(1000), 0]);
  const qB = pr([XM(MB), YE(1000), 0]);
  const i800 = pr([XM(0), YE(800), 0]);
  const i700 = pr([XM(0), YE(700), 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {[0, 6, 12, 18].map((m) => {
        const q = pr([XM(m), YE(680), 0]);
        return (
          <div key={m} style={{ position: "absolute", left: q.x, top: q.y + 20, transform: "translateX(-50%)", opacity: raiz, ...mono(22, 0.55) }}>
            {`MES ${m}`}
          </div>
        );
      })}
      <Etiqueta t={t} t0={EV.dos - 0.1} x={i800.x - 10} y={i800.y - 30} size={26}>
        −20 %
      </Etiqueta>
      <Etiqueta t={t} t0={EV.treinta - 0.05} x={i700.x - 10} y={i700.y + 30} size={26}>
        −30 %
      </Etiqueta>
      <Etiqueta t={t} t0={EV.meses - 0.05} x={qA.x} y={qA.y - 50} size={36} alinea="centro">
        11 MESES
      </Etiqueta>
      <Etiqueta t={t} t0={EV.medio - 0.05} x={Math.min(qB.x, 900)} y={qB.y - 50} size={36} alinea="centro">
        18 MESES
      </Etiqueta>
      <Kicker t={t} t0={s + 0.05} texto="GANANDO UN 2 % AL MES" />
      <Destello t={t} t0={EV.medio - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.treinta - 0.35} texto="*11 meses*" size={120} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.treinta - 0.3} texto="*año y medio*" size={120} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: una semana te cuesta un año; perder menos
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 6.4, 6.0), L(t, s, e, -0.2, 0.1) + sacude(t, EV.perder - 0.05, 0.02), L(t, s, e, 0.1, 0.16), { apertura: 35, centroY: 1000 });
  const tr: Trazo[] = [...polvo(0.3)];
  // 52 semanas: la primera es la mala; las otras 51 se encienden mientras la recuperas
  const n = Math.floor(L(t, s + 0.3, EV.entero, 1, 52, (u) => u));
  for (let i = 0; i < 52; i++) {
    const x = -0.92 + (i % 13) * 0.153;
    const y = 0.25 - Math.floor(i / 13) * 0.17;
    const r = 0.06;
    const mala = i === 0;
    const on = i < n;
    tr.push({ t: "p", pts: [[x - r, y - r, 0], [x + r, y - r, 0], [x + r, y + r, 0], [x - r, y + r, 0], [x - r, y - r, 0]], w: mala ? 2.4 : 1.2, o: on ? 1 : 0.3, luz: mala ? 0.8 : on ? 0.2 : 0, dash: on || mala ? undefined : "2 3" });
  }
  const pr = proyector(cam);
  const q0 = pr([-0.92, 0.25 + 0.1, 0]);
  const tacha = L(t, EV.perder - 0.2, EV.perder + 0.2, 0, 1, salida);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={s + 0.2} x={q0.x - 20} y={q0.y - 24} size={26}>
        LA MALA
      </Etiqueta>
      <div style={{ position: "absolute", top: 1250, left: 0, width: 1080, display: "flex", justifyContent: "center", gap: 16, alignItems: "baseline" }}>
        <span style={mono(80)}>{n}</span>
        <span style={mono(26, 0.6)}>{`SEMANA${n === 1 ? "" : "S"}`}</span>
      </div>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.ganar - 0.4} texto="1 semana = *1 año*" size={104} />
      </Arriba>
      <Arriba>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ position: "relative" }}>
            <Titular t={t} t0={EV.ganar - 0.35} texto="ganar *más*" size={84} />
            <div style={{ position: "absolute", left: -10, top: "55%", height: 7, width: `calc(${tacha * 100}% + ${tacha * 20}px)`, background: "#fff" }} />
          </div>
          <Titular t={t} t0={EV.perder - 0.3} texto="perder *menos*" size={104} />
        </div>
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. CTA
const Cta: React.FC<P> = (p) => <CtaSeguir {...p} lema="MÁS CUENTAS QUE NADIE TE HACE" />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, cuenta: Cuenta, pregunta: Pregunta, tiempo: Tiempo, giro: Giro, cta: Cta };
export const CLAVES = claves(["semana", "doler", "20%", "25%", "racha", "comentarios", "2%", "11", "meses", "30%", "43%", "medio", "año", "entero", "menos", "sígueme"]);

export const Recuperar: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/recuperar_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
