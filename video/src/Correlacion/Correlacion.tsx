// Reel de alcance "¿Abres cinco operaciones para repartir el riesgo?" (~38 s), en blanco y negro: cinco cubos de cristal de un
// 1 % sobre una cuadrícula, tres gráficos de velas (euro, libra y australiano contra el dólar) casi calcados, el «sígueme»
// a mitad, el dólar que se dispara y las tres que caen a la vez, los cinco cubos que se funden en uno de un
// 5 %, velas calcadas frente a curvas que van cada una a lo suyo y la pregunta final.
// Tiempos en src/gen/correlacion.json (scripts/correlacion.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/correlacion.json";
import { salida } from "../Premium/ui";
import { Arriba, Etiqueta, L, mono, muelle, Titular } from "../Bot/piezas";
import { Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { cristal, suelo, velas } from "../Bot/kit";
import { claves, CtaSeguir, Destello, golpe, Kicker, Montaje, P, paseo, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const CORRELACION_FPS = datos.fps;
export const CORRELACION_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;

// Tres pares contra el dólar: el mismo movimiento de fondo más un poco de ruido propio (30 velas cada uno)
const N = 30;
const FONDO = paseo(N, 3, 0.55, 0.03);
const PARES = [0, 1, 2].map((k) => {
  const r = paseo(N, 11 + k * 5, 0.16);
  return FONDO.map((v, i) => v + r[i]);
});
const NOMBRES = ["EUR/USD", "GBP/USD", "AUD/USD"];
const LIBRES = [0, 1, 2].map((k) => paseo(40, 40 + k * 9, 0.55, (k - 1) * 0.04));
// Sin color, las tres curvas libres se distinguen por el trazo
const TRAZOS_LIBRES = [undefined, "10 6", "3 5"];

// Serie escalada a una banda vertical; «caida» hunde las últimas 9 velas
const escala = (v: number[], y0: number, alto: number, caida = 0) => {
  const lo = Math.min(...v);
  const hi = Math.max(...v);
  return v.map((x, i) => y0 + ((x - lo) / (hi - lo)) * alto - caida * Math.max(0, (i - (v.length - 10)) / 9) * 0.32);
};
const graficos = (t: number, tr: Trazo[], pr: (p: V3) => { x: number; y: number }, t0s: number[], caida: number) => (
  <>
    {PARES.map((v, k) => {
      const y0 = 0.32 - k * 0.42;
      const prog = L(t, t0s[k] - 0.2, t0s[k] + 0.8, 0, 1, salida);
      if (prog > 0) velas(tr, escala(v, y0, 0.28, caida), -0.85, 0.85, Math.max(2, Math.round(N * prog)), 0.032, 1, 0.02, true);
      const q = pr([-0.85, y0 + 0.36, 0]);
      return (
        <div key={k} style={{ position: "absolute", left: q.x, top: q.y - 22, opacity: Math.min(prog * 2, 1), ...mono(28, 0.9) }}>
          {NOMBRES[k]}
        </div>
      );
    })}
  </>
);

const cincoCubos = (tr: Trazo[], t: number, junta: number, aparece = -0.6) => {
  for (let k = 0; k < 5; k++) {
    const g = muelle(t, aparece + k * 0.1, 200, 14);
    if (g <= 0) continue;
    const x = (-0.64 + k * 0.32) * (1 - junta);
    const r = 0.1 * Math.min(g, 1.1);
    cristal(tr, [x - r, -0.3 - r, -r], [x + r, -0.3 + r, r], "#fff", 1 - 0.7 * junta, 0.3, 0.1);
  }
};

// ------------------------------------------------------------------ 1. Hook: cinco operaciones de un 1 %
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.3, 0], L(t, s, e, 5.6, 5.2), L(t, s, e, -0.35, 0.05) + sacude(t, EV.cuidado - 0.05, 0.02), L(t, s, e, 0.18, 0.24), { apertura: 35, centroY: 1000 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -0.42, 0.22);
  cincoCubos(tr, t, 0);
  const pr = proyector(cam);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {Array.from({ length: 5 }, (_, k) => {
        const q = pr([-0.64 + k * 0.32, -0.15, 0]);
        return (
          <div key={k} style={{ position: "absolute", left: q.x, top: q.y - 46, transform: "translateX(-50%)", opacity: L(t, -0.3 + k * 0.1, k * 0.1, 0, 1), ...mono(32) }}>
            1 %
          </div>
        );
      })}
      <Arriba>
        <Titular t={t} t0={-0.6} fin={EV.cuidado - 0.4} texto="¿*5* operaciones?" size={116} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.cuidado - 0.35} texto="*cuidado*" size={130} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Pares: euro, libra y australiano contra el dólar; 1 % en cada uno
const Pares: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.1, 0], L(t, s, e, 5.6, 5.3), L(t, s, e, -0.2, 0.12), L(t, s, e, 0.08, 0.12), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.25)];
  const pr = proyector(cam);
  const html = graficos(t, tr, pr, [EV.euro, EV.libra, EV.australiano], 0);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {html}
      <div style={{ position: "absolute", top: 1290, left: 0, width: 1080, display: "flex", justifyContent: "center", opacity: L(t, EV.uno - 0.2, EV.uno + 0.1, 0, 1), ...mono(40) }}>1 % EN CADA UNA</div>
      <Arriba>
        <Titular t={t} t0={s + 0.1} texto="*3* pares, *1 %* cada uno" size={84} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Sígueme a mitad
const Sigueme: React.FC<P> = (p) => <CtaSeguir {...p} lema="SI TE ESTÁ SIRVIENDO" />;

// ------------------------------------------------------------------ 4. Dólar: se mueven juntos; el dólar se dispara y caen a la vez
const Dolar: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.1, 0], L(t, s, e, 5.5, 5.2), L(t, s, e, 0.12, -0.1) + sacude(t, EV.caen - 0.05), L(t, s, e, 0.08, 0.12), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.25)];
  const pr = proyector(cam);
  const caida = L(t, EV.dispara - 0.1, EV.caen + 0.3, 0, 1, (u) => u * u);
  const html = graficos(t, tr, pr, [s - 2, s - 2, s - 2], caida);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {html}
      <div style={{ position: "absolute", top: 1290, left: 0, width: 1080, display: "flex", justifyContent: "center", gap: 18, opacity: L(t, EV.dispara - 0.3, EV.dispara, 0, 1) }}>
        <span style={mono(50)}>USD ↑</span>
        <span style={mono(50, 0.75)}>LOS TRES ↓</span>
      </div>
      <Destello t={t} t0={EV.caen - 0.05} o={0.18} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.dispara - 0.4} texto="todos *dólar*" size={116} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.dispara - 0.35} texto="caen *a la vez*" size={116} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: cinco del 1 % son casi una del 5 %
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.3, 0], L(t, s, e, 5.6, 5.1), L(t, s, e, -0.35, 0.1) + sacude(t, EV.cincopct - 0.05), L(t, s, e, 0.18, 0.26), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -0.42, 0.22, "#fff", 0.9);
  const junta = L(t, EV.sola - 0.6, EV.sola, 0, 1, salida);
  const k = golpe(t, EV.cincopct - 0.05);
  if (junta < 1) cincoCubos(tr, t, junta, s - 3);
  const lado = 0.2 * Math.cbrt(5) * Math.min(muelle(t, EV.sola - 0.15, 180, 13), 1.08);
  if (junta >= 1 && lado > 0) cristal(tr, [-lado / 2, -0.4, -lado / 2], [lado / 2, -0.4 + lado, lado / 2], "#fff", 1, 0.5 + 0.5 * k, 0.28);
  const pr = proyector(cam);
  const q = pr([0, 0.05, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: q.x, top: q.y - 120, transform: `translateX(-50%) scale(${1 + 0.25 * k})`, ...mono(84) }}>{junta < 1 ? "5 × 1 %" : "1 × 5 %"}</div>
      <Destello t={t} t0={EV.cincopct - 0.05} o={0.18} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.sola - 0.4} texto="no son *cinco*" size={116} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.sola - 0.35} texto="es una del *5 %*" size={108} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Lección: repartir es abrir operaciones que no se muevan igual
const Leccion: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.1, 0], L(t, s, e, 5.8, 5.5), L(t, s, e, -0.1, 0.1) + sacude(t, EV.igual - 0.05, 0.02), L(t, s, e, 0.06, 0.1), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.25)];
  const a = L(t, s + 0.1, s + 0.8, 0, 1, salida);
  const b = L(t, EV.igual - 1.2, EV.igual - 0.3, 0, 1, salida);
  PARES.forEach((v, k) => velas(tr, escala(v, 0.3 - k * 0.38, 0.24), -0.92, -0.1, Math.max(2, Math.round(N * a)), 0.018, 1 - 0.45 * b, 0.02, true));
  LIBRES.forEach((v, k) => {
    if (b <= 0) return;
    const ys = escala(v, 0.3 - k * 0.38, 0.24);
    tr.push({ t: "p", pts: ys.map((y, i) => [0.1 + (0.82 * i) / (ys.length - 1), y, 0]), w: 2.6, o: 1, dash: TRAZOS_LIBRES[k], luz: 0.6, prog: b });
  });
  const pr = proyector(cam);
  const qa = pr([-0.51, -0.66, 0]);
  const qb = pr([0.51, -0.66, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={s + 0.3} x={qa.x} y={qa.y} size={26} o={0.8} alinea="centro">
        SE MUEVEN IGUAL
      </Etiqueta>
      <Etiqueta t={t} t0={EV.igual - 0.9} x={qb.x} y={qb.y} size={26} alinea="centro">
        CADA UNA A LO SUYO
      </Etiqueta>
      <Kicker t={t} t0={s + 0.05} texto="REPARTIR DE VERDAD" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.igual - 1.3} texto="no *más* operaciones" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.igual - 1.25} texto="que no se muevan *igual*" size={84} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta al final
const Pregunta: React.FC<P> = (p) => <PreguntaComentarios {...p} lineas={["¿cuántas tienes", "*abiertas*?"]} kicker="Y DIME" />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, pares: Pares, sigueme: Sigueme, dolar: Dolar, giro: Giro, leccion: Leccion, pregunta: Pregunta };
export const CLAVES = claves(["cinco", "Cuidado", "1%", "sígueme", "juntos", "dólar", "dispara", "caen", "5%", "Repartir", "igual", "abiertas"]);

export const Correlacion: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/correlacion_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />
);
