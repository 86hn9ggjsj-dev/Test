// Reel de alcance "¿Tu stop salta justo antes de que el precio gire?" (~25 s): el precio barre el stop puesto bajo el
// último mínimo y se da la vuelta; todos los stops están ahí; la regla es dejar margen y ajustar el tamaño; CTA de seguir.
// Tiempos en src/gen/cazastop.json (scripts/cazastop.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/cazastop.json";
import { salida } from "../Premium/ui";
import { ruido } from "../Viral/util";
import { Arriba, Etiqueta, L, mono, muelle, Titular } from "../Bot/piezas";
import { caja, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { Abajo, claves, CtaSeguir, Kicker, Montaje, P } from "../Explica/Montaje";

export const CAZASTOP_FPS = datos.fps;
export const CAZASTOP_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;

const X0 = -1.15;
const X1 = 1.05;
const MINIMO = 0;
const STOP = -0.07;
// Recorrido del precio: baja al mínimo, rebota, vuelve a bajar un pelín por debajo (salta el stop) y se dispara
const CLAVES_P: [number, number][] = [
  [-1.15, 0.75],
  [-0.8, 0.38],
  [-0.55, MINIMO],
  [-0.3, 0.45],
  [-0.05, 0.3],
  [0.2, 0.12],
  [0.38, -0.13],
  [0.52, 0.25],
  [0.78, 0.78],
  [1.05, 1.08],
];
const N = 54;
const PRECIO: V3[] = Array.from({ length: N + 1 }, (_, i) => {
  const x = X0 + (i * (X1 - X0)) / N;
  let k = 0;
  while (k < CLAVES_P.length - 2 && x > CLAVES_P[k + 1][0]) k++;
  const [xa, ya] = CLAVES_P[k];
  const [xb, yb] = CLAVES_P[k + 1];
  const u = (x - xa) / (xb - xa);
  return [x, ya + (yb - ya) * u + (ruido(i * 7) - 0.5) * 0.04, 0] as V3;
});
const I_BARRIDO = PRECIO.reduce((b, p, i) => (p[1] < PRECIO[b][1] ? i : b), 0);
const MIRA: V3 = [-0.05, 0.25, 0];

const grafico = (tr: Trazo[], prog: number, o = 1) => {
  tr.push({ t: "p", pts: PRECIO, w: 2.6, o, prog, luz: 0.35 * o });
  tr.push({ t: "l", a: [-0.7, MINIMO, 0], b: [0.6, MINIMO, 0], w: 1.2, o: 0.5 * o, dash: "4 7" });
};

// ------------------------------------------------------------------ 1. Hook: salta el stop y el precio se da la vuelta
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita(MIRA, L(t, s, e, 6.6, 6.2), L(t, s, e, -0.28, -0.1), L(t, s, e, 0.12, 0.18), { apertura: 35, centroY: 900 });
  const tr: Trazo[] = [...polvo(0.3)];
  const prog = L(t, -0.5, EV.vuelta + 0.4, 0.3, 1, (u) => u);
  grafico(tr, prog);
  const barrido = prog * N >= I_BARRIDO;
  tr.push({ t: "l", a: [-0.2, STOP, 0], b: [X1, STOP, 0], w: 1.8, o: barrido ? 0.35 : 0.95, dash: "8 9", luz: barrido ? 0 : 0.2 });
  const cabeza = PRECIO[Math.min(N, Math.round(prog * N))];
  tr.push({ t: "e", c: cabeza, r: 0.045, tipo: "punto", o: 1, luz: 1 });
  const pr = proyector(cam);
  const qS = pr([X1, STOP, 0]);
  const qM = pr([-0.55, MINIMO, 0]);
  const qB = pr(PRECIO[I_BARRIDO]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={-0.3} x={qM.x} y={qM.y + 34} size={22} o={0.75} alinea="centro">
        ÚLTIMO MÍNIMO
      </Etiqueta>
      <Etiqueta t={t} t0={-0.25} x={Math.min(qS.x, 1030)} y={qS.y + 30} size={28} o={barrido ? 0.5 : 1} alinea="der">
        TU STOP
      </Etiqueta>
      {barrido && (
        <div style={{ position: "absolute", left: qB.x, top: qB.y + 40, transform: "translateX(-50%)", ...mono(44) }}>✕ SALTA</div>
      )}
      <Abajo o={t >= EV.vuelta - 0.1 ? 1 : 0}>
        <span style={mono(48)}>… Y SE DA LA VUELTA ↑</span>
      </Abajo>
      <Arriba>
        <Titular t={t} t0={-0.6} texto="¿te *cazan* el stop?" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Contexto: todos ponen el stop en el mismo sitio
const STOPS = Array.from({ length: 26 }, (_, k) => ({ x: -0.3 + ruido(k * 3.1) * 0.95, y: -0.025 - ruido(k * 5.7) * 0.13, d: ruido(k * 9.3) }));
const Contexto: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita(MIRA, L(t, s, e, 6.6, 6.0), L(t, s, e, 0.25, 0.05), L(t, s, e, 0.12, 0.18), { apertura: 35, centroY: 900 });
  const tr: Trazo[] = [...polvo(0.3)];
  const vela = muelle(t, EV.girar - 0.6, 120, 13);
  grafico(tr, 1, 1 - 0.55 * Math.min(vela, 1));
  const llenos = Math.round(STOPS.length * L(t, EV.todo - 0.1, EV.minimo + 0.6, 0, 1, salida));
  STOPS.slice(0, llenos).forEach((p) => tr.push({ t: "l", a: [p.x, p.y, 0], b: [p.x + 0.14, p.y, 0], w: 2, o: 0.55 + 0.4 * p.d, luz: t >= EV.ordenes ? 0.3 : 0 }));
  // La mecha que baja a por los stops y gira
  if (vela > 0) {
    const x = 0.38;
    const cuerpo0 = 0.05;
    const cuerpo1 = 0.3;
    for (const [a, b] of caja([x - 0.06, cuerpo0, -0.06], [x + 0.06, cuerpo0 + (cuerpo1 - cuerpo0) * Math.min(vela, 1.05), 0.06])) tr.push({ t: "l", a, b, w: 2, o: 1, luz: 0.4 });
    tr.push({ t: "l", a: [x, cuerpo0, 0], b: [x, cuerpo0 - 0.27 * Math.min(vela, 1.05), 0], w: 2.4, o: 1, luz: 0.5 });
  }
  const pr = proyector(cam);
  const qM = pr([0.62, MINIMO, 0]);
  const qO = pr([0.2, -0.22, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.minimo - 0.2} x={Math.min(qM.x, 1030)} y={qM.y - 26} size={24} o={0.8} alinea="der">
        ÚLTIMO MÍNIMO
      </Etiqueta>
      <Etiqueta t={t} t0={EV.ordenes - 0.05} x={qO.x} y={qO.y + 40} size={30} alinea="centro">
        {`${llenos} STOPS AQUÍ`}
      </Etiqueta>
      <Abajo o={Math.min(muelle(t, EV.girar - 0.1, 200, 15) * 1.5, 1)}>
        <span style={mono(46)}>BAJA A POR ELLOS… Y GIRA</span>
      </Abajo>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.todo - 0.3} texto="no es mala *suerte*" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.todo - 0.25} texto="donde lo pone *todo* *el* *mundo*" size={68} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Regla: margen bajo el mínimo y tamaño ajustado
const Regla: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita(MIRA, L(t, s, e, 7.0, 6.6), L(t, s, e, -0.25, -0.05), L(t, s, e, 0.12, 0.18), { apertura: 35, centroY: 820 });
  const tr: Trazo[] = [...polvo(0.3)];
  grafico(tr, 1, 0.45);
  const baja = muelle(t, EV.margen - 0.1, 130, 14);
  const yStop = STOP - 0.3 * baja;
  tr.push({ t: "l", a: [-0.2, STOP, 0], b: [X1, STOP, 0], w: 1.2, o: 0.25 * Math.min(baja, 1), dash: "4 7" });
  tr.push({ t: "l", a: [-0.2, yStop, 0], b: [X1, yStop, 0], w: 1.8, o: 0.95, dash: "8 9", luz: 0.3 * Math.min(baja, 1) });
  // Tamaño de la posición: un bloque que encoge para que el riesgo no cambie
  const encoge = muelle(t, EV.tamano - 0.1, 130, 14);
  const ancho = 640 - 280 * Math.min(encoge, 1.05);
  const pr = proyector(cam);
  const qS = pr([X1, yStop, 0]);
  const mismo = t >= EV.mismo - 0.1;
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.margen} x={Math.min(qS.x, 1030)} y={qS.y + 30} size={28} alinea="der">
        STOP CON MARGEN
      </Etiqueta>
      <div style={{ position: "absolute", top: 1170, left: 220, display: "flex", flexDirection: "column", gap: 10, opacity: L(t, s + 0.2, s + 0.5, 0, 1, salida) }}>
        <span style={mono(26, 0.85)}>{encoge > 0.5 ? "TAMAÑO ↓" : "TAMAÑO"}</span>
        <div style={{ width: ancho, height: 54, border: "2px solid #fff", borderRadius: 10, background: "rgba(255,255,255,0.12)" }} />
      </div>
      <Abajo top={1300}>
        <span style={mono(52)}>RIESGO −1 %</span>
        <span style={{ ...mono(52), opacity: mismo ? 1 : 0 }}>✓ IGUAL</span>
      </Abajo>
      <Kicker t={t} t0={s + 0.05} texto="SOLUCIÓN" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.tamano - 0.3} texto="deja *margen*" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.tamano - 0.25} texto="ajusta el *tamaño*" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. CTA
const Cta: React.FC<P> = (p) => <CtaSeguir {...p} lema="MÁS TRUCOS DE GESTIÓN DEL RIESGO" />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, contexto: Contexto, regla: Regla, cta: Cta };
export const CLAVES = claves(["stop", "vuelta", "suerte", "mundo", "mínimo", "órdenes", "girar", "margen", "tamaño", "mismo", "sígueme"]);

export const Cazastop: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/cazastop_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
