// Reel de alcance "¿Abres cinco operaciones para repartir el riesgo?" (~38 s): cinco cubos de un 1 %, tres pares contra
// el dólar casi calcados, el «sígueme» a mitad, el dólar que se dispara y los tres que caen a la vez, los cinco cubos
// que se funden en uno de un 5 %, curvas calcadas frente a curvas distintas y la pregunta final.
// Tiempos en src/gen/correlacion.json (scripts/correlacion.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/correlacion.json";
import { salida } from "../Premium/ui";
import { Arriba, Etiqueta, L, mono, muelle, Titular } from "../Bot/piezas";
import { caja, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { claves, CtaSeguir, Destello, golpe, Kicker, Montaje, P, paseo, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const CORRELACION_FPS = datos.fps;
export const CORRELACION_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;

const cubo = (tr: Trazo[], c: V3, lado: number, o = 1, luz = 0.25, dash?: string) => {
  const r = lado / 2;
  for (const [a, b] of caja([c[0] - r, c[1] - r, c[2] - r], [c[0] + r, c[1] + r, c[2] + r])) tr.push({ t: "l", a, b, w: 1.6, o, luz, dash });
};

// Tres pares contra el dólar: el mismo movimiento de fondo (el dólar al revés) más un poco de ruido propio
const N = 60;
const FONDO = paseo(N, 3, 0.5, 0.02);
const PARES = [0, 1, 2].map((k) => {
  const ruido = paseo(N, 11 + k * 5, 0.18);
  return FONDO.map((v, i) => v + ruido[i]);
});
const NOMBRES = ["EUR/USD", "GBP/USD", "AUD/USD"];
// Tres activos que van cada uno a lo suyo
const LIBRES = [0, 1, 2].map((k) => paseo(N, 40 + k * 9, 0.55, (k - 1) * 0.03));

const serie = (v: number[], y0: number, alto: number, hasta = N - 1, caida = 0): V3[] => {
  const lo = Math.min(...v);
  const hi = Math.max(...v);
  return v.slice(0, hasta + 1).map((x, i) => [-0.85 + (1.7 * i) / (N - 1), y0 + ((x - lo) / (hi - lo)) * alto - caida * Math.max(0, (i - (N - 12)) / 11) * 0.5, 0]);
};

// ------------------------------------------------------------------ 1. Hook: cinco operaciones de un 1 %
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.2, 0], L(t, s, e, 6.2, 5.8), L(t, s, e, -0.3, -0.05) + sacude(t, EV.cuidado - 0.05, 0.02), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 1000 });
  const tr: Trazo[] = [...polvo(0.3)];
  for (let k = 0; k < 5; k++) {
    const g = muelle(t, -0.6 + k * 0.1, 200, 14);
    if (g > 0) cubo(tr, [-0.8 + k * 0.4, -0.2, 0], 0.2 * Math.min(g, 1.1));
  }
  const pr = proyector(cam);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {Array.from({ length: 5 }, (_, k) => {
        const q = pr([-0.8 + k * 0.4, -0.35, 0.1]);
        return (
          <div key={k} style={{ position: "absolute", left: q.x, top: q.y + 16, transform: "translateX(-50%)", opacity: L(t, -0.3 + k * 0.1, k * 0.1, 0, 1), ...mono(30) }}>
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

// ------------------------------------------------------------------ gráficos de los tres pares
// Añade las curvas a los trazos y devuelve sus rótulos (se llama antes de pintar la escena)
const graficos = (t: number, tr: Trazo[], pr: (p: V3) => { x: number; y: number }, t0s: number[], caida: number, luz = 0.4) => (
  <>
    {PARES.map((v, k) => {
      const y0 = 0.35 - k * 0.42;
      const prog = L(t, t0s[k] - 0.2, t0s[k] + 0.8, 0, 1, salida);
      if (prog > 0) tr.push({ t: "p", pts: serie(v, y0, 0.3, Math.max(1, Math.round((N - 1) * prog)), caida), w: 2.2, o: 1, luz });
      const q = pr([-0.85, y0 + 0.36, 0]);
      return (
        <div key={k} style={{ position: "absolute", left: q.x, top: q.y - 20, opacity: Math.min(prog * 2, 1), ...mono(28, 0.85) }}>
          {NOMBRES[k]}
        </div>
      );
    })}
  </>
);

// ------------------------------------------------------------------ 2. Pares: euro, libra y australiano contra el dólar; 1 % en cada uno
const Pares: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.1, 0], L(t, s, e, 5.8, 5.5), L(t, s, e, -0.15, 0.1), L(t, s, e, 0.06, 0.1), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
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
  const cam = orbita([0, -0.1, 0], L(t, s, e, 5.8, 5.5), L(t, s, e, 0.1, -0.1) + sacude(t, EV.caen - 0.05), L(t, s, e, 0.06, 0.1), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const pr = proyector(cam);
  const caida = L(t, EV.dispara - 0.1, EV.caen + 0.3, 0, 1, (u) => u * u);
  const html = graficos(t, tr, pr, [s - 2, s - 2, s - 2], caida, 0.4 + 0.5 * golpe(t, EV.caen - 0.05));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {html}
      <div style={{ position: "absolute", top: 1290, left: 0, width: 1080, display: "flex", justifyContent: "center", gap: 16, opacity: L(t, EV.dispara - 0.3, EV.dispara, 0, 1) }}>
        <span style={mono(46)}>USD ↑</span>
        <span style={mono(46, 0.7)}>→ LOS TRES ↓</span>
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
  const cam = orbita([0, -0.1, 0], L(t, s, e, 6.0, 5.6), L(t, s, e, -0.3, 0.1) + sacude(t, EV.cincopct - 0.05), L(t, s, e, 0.16, 0.22), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.3)];
  const junta = L(t, EV.sola - 0.6, EV.sola, 0, 1, salida);
  const k = golpe(t, EV.cincopct - 0.05);
  if (junta < 1) for (let i = 0; i < 5; i++) cubo(tr, [(-0.8 + i * 0.4) * (1 - junta), -0.1, 0], 0.2, 1 - 0.6 * junta);
  const lado = 0.2 * Math.cbrt(5) * Math.min(muelle(t, EV.sola - 0.15, 180, 13), 1.08);
  if (junta >= 1 && lado > 0) cubo(tr, [0, -0.1, 0], lado, 1, 0.4 + 0.5 * k);
  const pr = proyector(cam);
  const q = pr([0, -0.1 + 0.25, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: q.x, top: q.y - 110, transform: `translateX(-50%) scale(${1 + 0.25 * k})`, ...mono(80) }}>{junta < 1 ? "5 × 1 %" : "1 × 5 %"}</div>
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
  const cam = orbita([0, -0.1, 0], L(t, s, e, 6.0, 5.7), L(t, s, e, -0.1, 0.1) + sacude(t, EV.igual - 0.05, 0.02), L(t, s, e, 0.06, 0.1), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const mitad = (v: number[], izq: boolean, y0: number): V3[] => serie(v, y0, 0.28).map(([x, y, z]) => [izq ? -0.92 + (x + 0.85) * 0.5 : 0.08 + (x + 0.85) * 0.5, y, z]);
  const a = L(t, s + 0.1, s + 0.8, 0, 1, salida);
  const b = L(t, EV.igual - 1.2, EV.igual - 0.3, 0, 1, salida);
  PARES.forEach((v, k) => tr.push({ t: "p", pts: mitad(v, true, 0.3 - k * 0.38), w: 2, o: a * (1 - 0.5 * b), luz: 0.2 }));
  LIBRES.forEach((v, k) => b > 0 && tr.push({ t: "p", pts: mitad(v, false, 0.3 - k * 0.38), w: 2, o: b, luz: 0.5, prog: b }));
  const pr = proyector(cam);
  const qa = pr([-0.5, -0.65, 0]);
  const qb = pr([0.5, -0.65, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={s + 0.3} x={qa.x} y={qa.y} size={26} o={0.75} alinea="centro">
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

export const Correlacion: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/correlacion_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
