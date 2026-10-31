// Reel de alcance "¿100 € al mes desde los 25 o 200 € desde los 35?" (~37 s): dos pilas de monedas, las dos curvas de
// los 25 a los 65 (262.000 € contra 244.000 €), las columnas de lo aportado frente a lo crecido y la línea de tiempo de
// «hace 10 años» a «hoy». Tiempos en src/gen/ahorro.json (scripts/ahorro.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/ahorro.json";
import { salida } from "../Premium/ui";
import { Arriba, Etiqueta, euros, L, mono, muelle, Titular } from "../Bot/piezas";
import { caja, circulo, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { claves, CtaSeguir, Destello, Gigante, golpe, Kicker, Montaje, P, sacude } from "../Explica/Montaje";

export const AHORRO_FPS = datos.fps;
export const AHORRO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;

// Valor de una aportación mensual al 7 % anual tras n meses
const R = 0.07 / 12;
const fv = (m: number, meses: number) => (meses <= 0 ? 0 : (m * (Math.pow(1 + R, meses) - 1)) / R);
const A = (edad: number) => fv(100, 12 * (edad - 25));
const B = (edad: number) => fv(200, 12 * (edad - 35));
const miles = (v: number) => `${euros(Math.round(v / 1000) * 1000)} €`;

// ------------------------------------------------------------------ 1. Hook: dos pilas de monedas, la de 200 es el doble
const pila = (tr: Trazo[], x: number, n: number, t: number, t0: number, luz: number) => {
  for (let i = 0; i < n; i++) {
    const g = muelle(t, t0 + i * 0.05, 240, 15);
    if (g <= 0) continue;
    const y = -0.6 + i * 0.075 + (1 - Math.min(g, 1)) * 0.6;
    const o = Math.min(g * 1.5, 1);
    tr.push({ t: "p", pts: circulo([x, y, 0], 0.3, "y", 36), w: 1.6, o, luz });
    tr.push({ t: "p", pts: circulo([x, y + 0.045, 0], 0.3, "y", 36), w: 1, o: 0.6 * o, luz });
  }
};
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.25, 0], L(t, s, e, 5.4, 5.0), L(t, s, e, -0.25, 0.1), L(t, s, e, 0.32, 0.38), { apertura: 35, centroY: 890 });
  const tr: Trazo[] = [...polvo(0.3)];
  const brillo = muelle(t, EV.doble - 0.15, 160, 14);
  pila(tr, -0.55, 5, t, -0.5, 0.15);
  pila(tr, 0.55, 10, t, EV.doscientos - 0.6, 0.15 + 0.6 * Math.max(Math.min(brillo, 1), 0));
  const pr = proyector(cam);
  const qa = pr([-0.55, -0.6, 0.3]);
  const qb = pr([0.55, -0.6, 0.3]);
  const sb = pr([0.55, -0.6 + 10 * 0.075, 0]);
  const rotulo = (q: { x: number; y: number }, l1: string, l2: string, o: number) => (
    <div style={{ position: "absolute", left: q.x, top: q.y + 30, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: o }}>
      <span style={mono(46)}>{l1}</span>
      <span style={mono(24, 0.65)}>{l2}</span>
    </div>
  );
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {rotulo(qa, "100 €/MES", "DESDE LOS 25", 1)}
      {rotulo(qb, "200 €/MES", "DESDE LOS 35", L(t, EV.doscientos - 0.4, EV.doscientos, 0, 1, salida))}
      <Etiqueta t={t} t0={EV.doble - 0.1} x={sb.x} y={sb.y - 70} size={64} alinea="centro">
        ×2
      </Etiqueta>
      <Arriba>
        <Titular t={t} t0={-0.6} fin={EV.facil - 0.4} texto="¿*100 €* o *200 €*?" size={120} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.facil - 0.35} texto="¿el *doble*?" size={120} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Cuenta: dos curvas de los 25 a los 65
const XE = (edad: number) => -0.9 + (1.8 * (edad - 25)) / 40;
const YV = (v: number) => -0.65 + (1.2 * v) / 262000;
const curva = (f: (e: number) => number, e0: number, e1: number): V3[] => {
  const pts: V3[] = [];
  for (let k = 0; k <= 40; k++) {
    const ed = e0 + ((e1 - e0) * k) / 40;
    pts.push([XE(ed), YV(f(ed)), 0]);
  }
  return pts;
};
const Cuenta: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.05, 0], L(t, s, e, 6.9, 6.5), L(t, s, e, -0.25, -0.05) + sacude(t, EV.r244 - 0.05), L(t, s, e, 0.1, 0.16), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.3)];
  const raiz = L(t, s, s + 0.5, 0, 1, salida);
  tr.push({ t: "p", pts: [[XE(25), YV(0), 0], [XE(65), YV(0), 0]], w: 1.4, o: 0.6, prog: raiz });
  for (const ed of [25, 35, 45, 55, 65]) tr.push({ t: "l", a: [XE(ed), YV(0) - 0.04, 0], b: [XE(ed), YV(0) + 0.04, 0], w: 1.2, o: 0.6 * raiz });
  const eA = L(t, s + 0.3, EV.r262 - 0.15, 25, 65, (u) => u);
  const eB = L(t, EV.doscientos2 - 0.3, EV.r244 - 0.1, 35, 65, (u) => u);
  if (eA > 25) tr.push({ t: "p", pts: curva(A, 25, eA), w: 2.6, o: 1, luz: 0.5 });
  if (t >= EV.doscientos2 - 0.3) tr.push({ t: "p", pts: curva(B, 35, Math.max(eB, 35.01)), w: 2.6, o: 1, luz: 0.3, dash: "10 6" });
  if (t >= EV.r262 - 0.15) tr.push({ t: "e", c: [XE(65), YV(A(65)), 0], r: 0.045, tipo: "punto", o: 1, luz: 1 });
  if (t >= EV.r244 - 0.1) tr.push({ t: "e", c: [XE(65), YV(B(65)), 0], r: 0.045, tipo: "punto", o: 1, luz: 1 });
  const pr = proyector(cam);
  const fa = pr([XE(eA), YV(A(eA)), 0]);
  const fb = pr([XE(Math.max(eB, 35)), YV(B(Math.max(eB, 35))), 0]);
  const k = golpe(t, EV.r244 - 0.05);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {[25, 35, 45, 55, 65].map((ed) => {
        const q = pr([XE(ed), YV(0), 0]);
        return (
          <div key={ed} style={{ position: "absolute", left: q.x, top: q.y + 22, transform: "translateX(-50%)", opacity: raiz, ...mono(24, 0.6) }}>
            {ed}
          </div>
        );
      })}
      {eA > 25.5 && <div style={{ position: "absolute", left: fa.x, top: fa.y - 70, transform: "translateX(-90%)", ...mono(44) }}>{miles(A(eA))}</div>}
      {eB > 35.5 && <div style={{ position: "absolute", left: fb.x, top: fb.y + 24, transform: `translateX(-90%) scale(${1 + 0.25 * k})`, ...mono(44, 0.9) }}>{miles(B(eB))}</div>}
      <Kicker t={t} t0={s + 0.05} texto="AL 7 % ANUAL · HASTA LOS 65" />
      <Destello t={t} t0={EV.r244 - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.doscientos2 - 0.35} texto="*100 €* desde los 25" size={92} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.doscientos2 - 0.3} texto="*200 €* desde los 35" size={92} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Giro: pone 24.000 € más… y tiene menos
const ESC = 1 / 200000;
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.15, 0], L(t, s, e, 6.8, 6.4), L(t, s, e, 0.3, 0.05) + sacude(t, EV.menos - 0.05), L(t, s, e, 0.12, 0.2), { apertura: 35, centroY: 1000 });
  const tr: Trazo[] = [...polvo(0.3)];
  const BASE = -0.8;
  const g = muelle(t, s + 0.05, 160, 15);
  const col = (x: number, puesto: number, total: number, luzP: number, luzT: number) => {
    const hp = puesto * ESC * Math.min(g, 1.05);
    const ht = total * ESC * Math.min(g, 1.05);
    for (const [a, b] of caja([x - 0.25, BASE, -0.25], [x + 0.25, BASE + hp, 0.25])) tr.push({ t: "l", a, b, w: 1.8, o: 1, luz: luzP });
    for (const [a, b] of caja([x - 0.25, BASE + hp, -0.25], [x + 0.25, BASE + ht, 0.25])) tr.push({ t: "l", a, b, w: 1.4, o: 0.85, dash: "6 5", luz: luzT });
  };
  const kP = muelle(t, EV.r24 - 0.1, 180, 14);
  const kT = golpe(t, EV.menos - 0.05);
  col(-0.5, 48000, A(65), 0.15, 0.2 + 0.5 * kT);
  col(0.5, 72000, B(65), 0.15 + 0.6 * Math.max(Math.min(kP, 1), 0), 0.2);
  const pr = proyector(cam);
  const top = (x: number, v: number) => pr([x, BASE + v * ESC, 0.25]);
  const mid = (x: number, v: number) => pr([x, BASE + (v * ESC) / 2, 0.25]);
  const bajo = (x: number) => pr([x, BASE, 0.25]);
  const o = Math.min(g * 1.5, 1);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: top(-0.5, A(65)).x, top: top(-0.5, A(65)).y - 66, transform: `translateX(-50%) scale(${1 + 0.25 * kT})`, opacity: o, ...mono(44) }}>262.000 €</div>
      <div style={{ position: "absolute", left: top(0.5, B(65)).x, top: top(0.5, B(65)).y - 66, transform: "translateX(-50%)", opacity: o, ...mono(44, 0.85) }}>244.000 €</div>
      {[
        [-0.5, 48000, "PUSO 48.000"],
        [0.5, 72000, "PUSO 72.000"],
      ].map(([x, v, txt]) => (
        <div key={txt as string} style={{ position: "absolute", left: mid(x as number, v as number).x, top: mid(x as number, v as number).y - 14, transform: "translateX(-50%)", opacity: o, ...mono(22, 0.8) }}>
          {txt}
        </div>
      ))}
      <div style={{ position: "absolute", left: bajo(-0.5).x, top: bajo(-0.5).y + 22, transform: "translateX(-50%)", opacity: o, ...mono(28, 0.8) }}>DESDE LOS 25</div>
      <div style={{ position: "absolute", left: bajo(0.5).x, top: bajo(0.5).y + 22, transform: "translateX(-50%)", opacity: o, ...mono(28, 0.8) }}>DESDE LOS 35</div>
      <Etiqueta t={t} t0={EV.r24 - 0.1} x={mid(0.5, 72000).x + 140} y={mid(0.5, 72000).y} size={34}>
        +24.000
      </Etiqueta>
      <Etiqueta t={t} t0={EV.menos - 0.1} x={top(0.5, B(65)).x} y={top(0.5, B(65)).y - 110} size={34} alinea="centro">
        −18.000 €
      </Etiqueta>
      <Destello t={t} t0={EV.menos - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.menos - 0.4} texto="pone *más*…" size={120} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.menos - 0.35} fin={EV.esos - 0.35} texto="…y tiene *menos*" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.esos - 0.3} texto="*10 años* valen más" size={96} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. Cierre: el mejor momento fue hace 10 años; el segundo, hoy
const Cierre: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 7.0, 6.6), L(t, s, e, -0.2, 0.1), L(t, s, e, 0.1, 0.16), { apertura: 35, centroY: 1100 });
  const tr: Trazo[] = [...polvo(0.3)];
  const raiz = L(t, s, s + 0.5, 0, 1, salida);
  tr.push({ t: "p", pts: [[-1.0, 0, 0], [1.0, 0, 0]], w: 1.4, o: 0.6, prog: raiz });
  const apaga = L(t, EV.segundo - 0.2, EV.segundo + 0.3, 0, 1, salida);
  const hoy = muelle(t, EV.hoy - 0.15, 200, 14);
  tr.push({ t: "e", c: [-0.6, 0, 0], r: 0.06, tipo: "punto", o: 1 - 0.6 * apaga, luz: 1 - apaga });
  if (hoy > 0) tr.push({ t: "e", c: [0.6, 0, 0], r: 0.06 * Math.min(hoy, 1.2), tipo: "punto", o: 1, luz: 1 });
  const pr = proyector(cam);
  const qa = pr([-0.6, 0, 0]);
  const qh = pr([0.6, 0, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.hace - 0.1} x={qa.x} y={qa.y + 50} size={30} o={1 - 0.6 * apaga} alinea="centro">
        HACE 10 AÑOS
      </Etiqueta>
      <Etiqueta t={t} t0={EV.hoy - 0.1} x={qh.x} y={qh.y + 50} size={30} alinea="centro">
        HOY
      </Etiqueta>
      <Gigante t={t} t0={EV.hoy - 0.15} texto="HOY" top={560} size={220} />
      <Destello t={t} t0={EV.hoy - 0.1} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.segundo - 0.35} texto="hace *10 años*" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.segundo - 0.3} texto="o *hoy*" size={120} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. CTA
const Cta: React.FC<P> = (p) => <CtaSeguir {...p} lema="MÁS CUENTAS QUE NADIE TE HACE" />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, cuenta: Cuenta, giro: Giro, cierre: Cierre, cta: Cta };
export const CLAVES = claves(["100", "25", "200", "35", "doble", "7%", "65", "262.000", "244.000", "24.000", "menos", "diez", "hoy", "sígueme"]);

export const Ahorro: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/ahorro_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
