// Reel de alcance "Tu estrategia gana el 55 %: ¿cuántas pérdidas seguidas vas a ver?" (~20 s): una cinta de
// operaciones que pasa sin parar, se dispara a 1.000 y frena en 8 pérdidas seguidas; luego dos cuentas que encajan esa
// racha con un 10 % y con un 1 % de riesgo. Tiempos en src/gen/rachas.json (scripts/rachas.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/rachas.json";
import { salida } from "../Premium/ui";
import { ruido } from "../Viral/util";
import { Arriba, Etiqueta, euros, L, mono, muelle, Titular } from "../Bot/piezas";
import { caja, clave, Escena, orbita, polvo, Proy, proyector, Trazo, V3 } from "../Bot/tres";
import { Abajo, claves, CtaSeguir, cuando, Destello, Gigante, golpe, Montaje, P, sacude } from "../Explica/Montaje";

export const RACHAS_FPS = datos.fps;
export const RACHAS_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const en = cuando(datos);

// Cinta de operaciones (55 % de aciertos) con una racha de 8 pérdidas en 150-157
const N = 200;
const RACHA = 150;
const GANA: boolean[] = Array.from({ length: N }, (_, i) => (i >= RACHA && i < RACHA + 8 ? false : i === RACHA - 1 || i === RACHA + 8 ? true : ruido(i * 4.7 + 1) < 0.55));
const PASO = 0.21;
const cinta = (tr: Trazo[], pos: number, y: number, marca = 0) => {
  for (let i = Math.max(0, Math.floor(pos - 8)); i <= Math.min(N - 1, Math.ceil(pos + 8)); i++) {
    const x = (i - pos) * PASO;
    const lejos = Math.min(Math.abs(x) / 1.6, 1);
    const enRacha = i >= RACHA && i < RACHA + 8;
    const r = 0.075;
    for (const [a, b] of caja([x - r, y - r, -r], [x + r, y + r, r])) {
      tr.push({ t: "l", a, b, w: GANA[i] ? 1.6 : 1.2, o: (GANA[i] ? 1 : 0.5 + 0.5 * marca * (enRacha ? 1 : 0)) * (1 - 0.7 * lejos), dash: GANA[i] ? undefined : "3 4", luz: GANA[i] ? 0.15 : enRacha ? 0.6 * marca : 0 });
    }
  }
};

// ✓ / ✕ encima de cada operación visible de la cinta
const Marcas: React.FC<{ pr: (p: V3) => Proy; pos: number; y: number; marca?: number }> = ({ pr, pos, y, marca = 0 }) => (
  <>
    {Array.from({ length: 17 }, (_, j) => Math.floor(pos - 8) + j)
      .filter((i) => i >= 0 && i < N)
      .map((i) => {
        const x = (i - pos) * PASO;
        const q = pr([x, y + 0.16, 0]);
        const enRacha = i >= RACHA && i < RACHA + 8;
        const o = (1 - Math.min(Math.abs(x) / 1.6, 1) * 0.8) * (GANA[i] ? 0.9 : enRacha ? 0.6 + 0.4 * marca : 0.6);
        return (
          <div key={i} style={{ position: "absolute", left: q.x, top: q.y - 46, transform: "translateX(-50%)", opacity: o, ...mono(GANA[i] ? 34 : 38) }}>
            {GANA[i] ? "✓" : "✕"}
          </div>
        );
      })}
  </>
);

// ------------------------------------------------------------------ 1. Hook: 55 % y la cinta pasando
const Hook: React.FC<P> = ({ t, s, e }) => {
  const tCuantas = en("cuántas", s);
  const cam = orbita([0, -0.2, 0], L(t, s, e, 6.6, 6.2), L(t, s, e, -0.25, -0.1), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 900 });
  const tr: Trazo[] = [...polvo(0.3)];
  cinta(tr, 20 + t * 3.5, -0.75);
  const pr = proyector(cam);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Marcas pr={pr} pos={20 + t * 3.5} y={-0.75} />
      <Gigante t={t} t0={-0.45} texto="55 %" top={520} size={240} pie="DE ACIERTOS" />
      <Arriba>
        <Titular t={t} t0={-0.6} fin={tCuantas - 0.05} texto="tu estrategia gana el *55 %*" size={76} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tCuantas} texto="¿cuántas *seguidas*?" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Respuesta: en 1.000 operaciones, lo normal es encadenar 8
const Respuesta: React.FC<P> = ({ t, s, e }) => {
  const parada = RACHA + 3.5;
  const pos = clave(t, [[s, 20 + s * 3.5], [EV.mil, 60], [EV.ocho - 0.15, parada]], (u) => u);
  const marca = muelle(t, EV.ocho - 0.1, 200, 14);
  const cam = orbita([0, -0.2, 0], L(t, s, e, 6.2, 5.6), L(t, s, e, 0.25, 0.05) + sacude(t, EV.ocho - 0.1), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 860 });
  const tr: Trazo[] = [...polvo(0.3)];
  cinta(tr, pos, -0.2, Math.min(marca, 1));
  // Corchete sobre las 8 pérdidas
  if (marca > 0) {
    const x0 = (RACHA - parada) * PASO - 0.1;
    const x1 = (RACHA + 7 - parada) * PASO + 0.1;
    const y = 0.02 + 0.1 * Math.min(marca, 1);
    const pts: V3[] = [[x0, y - 0.08, 0], [x0, y, 0], [x1, y, 0], [x1, y - 0.08, 0]];
    tr.push({ t: "p", pts, w: 2, o: 1, luz: 0.4, prog: Math.min(marca, 1) });
  }
  const pr = proyector(cam);
  const sobre = pr([0, 0.2, 0]);
  const ops = Math.round(L(t, EV.crees, EV.ocho - 0.2, 0, 1000, (u) => u * u));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Marcas pr={pr} pos={pos} y={-0.2} marca={Math.min(marca, 1)} />
      <Etiqueta t={t} t0={EV.ocho - 0.05} x={sobre.x} y={sobre.y - 70} size={56} alinea="centro">
        8 SEGUIDAS
      </Etiqueta>
      <Abajo top={1180}>
        <span style={mono(80)}>{euros(ops)}</span>
        <span style={mono(26, 0.6)}>OPERACIONES</span>
      </Abajo>
      <Destello t={t} t0={EV.ocho - 0.1} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.ocho - 0.35} texto="más de las que *crees*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.ocho - 0.3} texto="*8* seguidas" size={130} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Giro: la misma racha con un 10 % y con un 1 % de riesgo
const H = 1.6;
const columna = (tr: Trazo[], x: number, riesgo: number, t: number, t0: number, t1: number) => {
  let h = H;
  for (let k = 0; k < 8; k++) {
    const tk = t0 + (k * (t1 - t0)) / 7;
    const nuevo = h * (1 - riesgo);
    if (t >= tk) {
      // El trozo perdido cae y se desvanece
      const u = Math.min((t - tk) / 0.6, 1);
      if (u < 1) for (const [a, b] of caja([x - 0.28, nuevo - 0.9 - u * u * 1.2, -0.28], [x + 0.28, h - 0.9 - u * u * 1.2, 0.28])) tr.push({ t: "l", a, b, w: 1.2, o: 0.8 * (1 - u), dash: "4 5" });
      h = nuevo;
    }
  }
  for (const [a, b] of caja([x - 0.28, -0.9, -0.28], [x + 0.28, -0.9 + h, 0.28])) tr.push({ t: "l", a, b, w: 1.8, o: 1, luz: 0.25 });
  return h / H;
};
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.1, 0], L(t, s, e, 6.8, 6.3), L(t, s, e, -0.25, -0.05) + sacude(t, EV.mitad), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 900 });
  const tr: Trazo[] = [...polvo(0.3)];
  tr.push({ t: "l", a: [-1.1, -0.9 + H / 2, 0], b: [1.1, -0.9 + H / 2, 0], w: 1.2, o: 0.6, dash: "6 8" });
  const r10 = columna(tr, -0.5, 0.1, t, EV.diez + 0.2, EV.mitad - 0.1);
  const r1 = columna(tr, 0.5, 0.01, t, EV.uno + 0.1, EV.ochopct - 0.1);
  const pr = proyector(cam);
  const q10 = pr([-0.5, -0.9 + r10 * H, 0]);
  const q1 = pr([0.5, -0.9 + r1 * H, 0]);
  const b10 = pr([-0.5, -0.9, 0.28]);
  const b1 = pr([0.5, -0.9, 0.28]);
  const mitad = pr([1.1, -0.9 + H / 2, 0]);
  const k = golpe(t, EV.mitad - 0.1);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: q10.x, top: q10.y - 80, transform: `translateX(-50%) scale(${1 + 0.25 * k})`, ...mono(64) }}>{`${Math.round(r10 * 100)} %`}</div>
      <div style={{ position: "absolute", left: q1.x, top: q1.y - 80, transform: "translateX(-50%)", opacity: t >= EV.uno - 0.2 ? 1 : 0.35, ...mono(64) }}>{`${Math.round(r1 * 100)} %`}</div>
      <div style={{ position: "absolute", left: b10.x, top: b10.y + 24, transform: "translateX(-50%)", ...mono(26, 0.8) }}>RIESGO 10 %</div>
      <div style={{ position: "absolute", left: b1.x, top: b1.y + 24, transform: "translateX(-50%)", opacity: t >= EV.uno - 0.2 ? 1 : 0.35, ...mono(26, 0.8) }}>RIESGO 1 %</div>
      <Etiqueta t={t} t0={EV.mitad - 0.2} x={Math.min(mitad.x, 1030)} y={mitad.y - 24} size={22} o={0.7} alinea="der">
        LA MITAD
      </Etiqueta>
      <Destello t={t} t0={EV.mitad - 0.1} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.uno - 0.3} texto="si arriesgas un *10 %*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.uno - 0.25} texto="y con un *1 %*" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. CTA
const Cta: React.FC<P> = (p) => <CtaSeguir {...p} lema="MÁS CUENTAS QUE NADIE TE HACE" />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, respuesta: Respuesta, giro: Giro, cta: Cta };
export const CLAVES = claves(["55%", "seguidas", "crees", "1.000", "8", "10%", "mitad", "1%", "8%", "sígueme"]);

export const Rachas: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/rachas_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
