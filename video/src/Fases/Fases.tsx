// Reel de alcance "Las cuatro fases de todo el que empieza en trading" (~32 s), en blanco y negro con toques puntuales
// de verde y rojo, mezclando stickman y gráficos: el stickman camina hacia cuatro hitos, salta con corona tras tres velas
// ganadoras, un ojo gigante y el sello «manipulado», el «sígueme» a mitad, bloques que se doblan y se derrumban, el
// stickman relajado ante una curva que sube y la pregunta final. Tiempos en src/gen/fases.json (scripts/fases.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/fases.json";
import { salida } from "../Premium/ui";
import { ANCHO } from "../Viral/util";
import { Arriba, L, mono, muelle, Titular } from "../Bot/piezas";
import { circulo, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { cristal, ROJO, suelo, velas, VERDE } from "../Bot/kit";
import { andando, corona, escritorio, monigote, monitor, POSES, poseEn, silla } from "../Bot/monigote";
import { claves, CtaSeguir, Destello, golpe, Kicker, Montaje, P, paseo, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const FASES_FPS = datos.fps;
export const FASES_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const SUELO = -0.9;

// ------------------------------------------------------------------ 1. Hook: el stickman camina hacia cuatro hitos
const HITOS = [-0.3, 0.15, 0.6, 1.05];
const Hook: React.FC<P> = ({ t, s, e }) => {
  const x = L(t, -0.6, e, -0.95, 0.35, (u) => u);
  const cam = orbita([x * 0.6 + 0.1, -0.35, 0], 4.2, L(t, s, e, -0.35, -0.15), 0.1, { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, SUELO, 0.16, "#fff", 0);
  tr.push({ t: "l", a: [-1.6, SUELO, 0], b: [1.6, SUELO, 0], w: 2, o: 0.8 });
  HITOS.forEach((hx, i) => {
    const g = muelle(t, -0.4 + i * 0.15, 200, 14);
    if (g <= 0) return;
    tr.push({ t: "l", a: [hx, SUELO, 0], b: [hx, SUELO + 0.75 * Math.min(g, 1.05), 0], w: 2.4, o: 1 });
    tr.push({ t: "p", pts: [[hx - 0.09, SUELO + 0.62, 0], [hx + 0.09, SUELO + 0.62, 0], [hx + 0.09, SUELO + 0.8, 0], [hx - 0.09, SUELO + 0.8, 0], [hx - 0.09, SUELO + 0.62, 0]].map((p) => [p[0], SUELO + (p[1] - SUELO) * Math.min(g, 1.05), p[2]] as V3), w: 2, o: 1, relleno: "#000", oRelleno: 0.9 });
  });
  // Rebote del paso
  const bote = 0.02 * Math.abs(Math.sin(t * 7));
  monigote(tr, [x, SUELO + 0.5 + bote, 0], andando(t), "lado", 1, 1, t);
  const pr = proyector(cam);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {HITOS.map((hx, i) => {
        const q = pr([hx, SUELO + 0.71, 0.01]);
        return (
          <div key={i} style={{ position: "absolute", left: q.x, top: q.y, transform: "translate(-50%, -50%)", opacity: L(t, -0.3 + i * 0.15, i * 0.15, 0, 1), ...mono(40) }}>
            {i + 1}
          </div>
        );
      })}
      <Arriba>
        <Titular t={t} t0={-0.6} fin={EV.cual - 0.45} texto="las *4 fases*" size={124} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.cual - 0.4} texto="¿en cuál *estás*?" size={112} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Fase uno: tres operaciones ganadas y te crees un genio
const Uno: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.25, 0], L(t, s, e, 5.4, 5.0) - 0.3 * golpe(t, EV.genio - 0.05), L(t, s, e, -0.2, 0.15) + sacude(t, EV.genio - 0.05, 0.02), 0.08, { apertura: 35, centroY: 1020 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, SUELO, 0.16);
  // Tres velas que suben, una detrás de otra, con un verde muy suave
  for (let i = 0; i < 3; i++) {
    const g = muelle(t, EV.tres - 0.3 + i * 0.35, 200, 13);
    if (g <= 0) continue;
    const x = 0.25 + i * 0.22;
    const y0 = -0.5 + i * 0.22;
    tr.push({ t: "l", a: [x, y0 - 0.05, 0], b: [x, y0 + 0.32 * Math.min(g, 1.05) + 0.05, 0], w: 1.6, o: 0.9, color: VERDE });
    cristal(tr, [x - 0.06, y0, -0.06], [x + 0.06, y0 + 0.3 * Math.min(g, 1.05), 0.06], VERDE, 0.9, 0.3, 0.3);
  }
  // Salta de alegría y, al decir «genio», le sale la corona
  const salto = t >= EV.tres ? 0.12 * Math.abs(Math.sin((t - EV.tres) * 6)) : 0;
  const pose = poseEn(t, [[s - 1, POSES.dePie], [EV.tres, POSES.celebra]], 0.3);
  const cabeza = monigote(tr, [-0.4, SUELO + 0.5 + salto, 0], pose, "frente", 1, 1.05, t);
  const gc = muelle(t, EV.genio - 0.15, 220, 12);
  if (gc > 0) corona(tr, [cabeza[0], cabeza[1] + 0.04 * (1 - Math.min(gc, 1)), cabeza[2]], 1.05 * Math.min(gc, 1.1), 1, 0.4 + 0.5 * golpe(t, EV.genio - 0.05));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Kicker t={t} t0={s + 0.02} texto="FASE 1" />
      <Destello t={t} t0={EV.genio - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.05} fin={EV.genio - 0.45} texto="*3* seguidas" size={124} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.genio - 0.4} texto="te crees un *genio*" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Fase dos: pierdes y el mercado está manipulado (sin stickman)
const CAE = paseo(26, 17, 0.5, -0.12);
const Dos: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 5.2, 4.8), L(t, s, e, 0.15, -0.15) + sacude(t, EV.manipulado - 0.05), 0.05, { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.25)];
  const lo = Math.min(...CAE);
  const hi = Math.max(...CAE);
  const ys = CAE.map((v) => -0.75 + ((v - lo) / (hi - lo)) * 0.6);
  velas(tr, ys, -0.85, 0.85, Math.round(L(t, s, EV.pierdes + 0.4, 8, CAE.length)), 0.026, 1, 0.02, true);
  // Vela grande en rojo suave al perder
  const gv = muelle(t, EV.pierdes, 200, 14);
  if (gv > 0) cristal(tr, [0.9, ys[ys.length - 1] - 0.35 * Math.min(gv, 1.05), -0.03], [0.96, ys[ys.length - 1], 0.03], ROJO, 0.9, 0.4, 0.3);
  // El ojo que lo vigila todo: mira a un lado y a otro y parpadea
  const g = Math.min(muelle(t, s + 0.1, 150, 14), 1.05);
  const c: V3 = [0, 0.35, 0];
  const parpado = (t % 2.4) < 0.12 ? 0.15 : 1;
  const ojo: V3[] = Array.from({ length: 41 }, (_, i) => {
    const a = (i / 40) * Math.PI * 2;
    return [c[0] + Math.cos(a) * 0.55 * g, c[1] + Math.sin(a) * 0.24 * g * parpado * (Math.sin(a) > 0 ? 1 : 1), 0];
  });
  tr.push({ t: "p", pts: ojo, w: 2.6, o: 1, relleno: "#fff", oRelleno: 0.04, luz: 0.25 });
  const mira = 0.22 * Math.sin((t - s) * 2.2);
  if (parpado > 0.5) {
    tr.push({ t: "p", pts: circulo([c[0] + mira * g, c[1], 0.01], 0.13 * g, "z", 30), w: 2.4, o: 1 });
    tr.push({ t: "p", pts: circulo([c[0] + mira * g, c[1], 0.02], 0.06 * g, "z", 20), w: 1, o: 1, relleno: "#fff", oRelleno: 0.9 });
  }
  const sello = muelle(t, EV.manipulado - 0.15, 260, 11);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {sello > 0 && (
        <div style={{ position: "absolute", top: 1180, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
          <span style={{ ...mono(70), padding: "10px 30px", border: "5px solid #fff", borderRadius: 10, transform: `rotate(-8deg) scale(${2 - Math.min(sello, 1.1)})`, opacity: Math.min(sello * 1.5, 1) }}>MANIPULADO</span>
        </div>
      )}
      <Kicker t={t} t0={s + 0.02} texto="FASE 2" />
      <Destello t={t} t0={EV.manipulado - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.05} fin={EV.manipulado - 0.45} texto="*pierdes*" size={124} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.manipulado - 0.4} texto="está *manipulado*" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. Sígueme a mitad, con el stickman señalando
const Sigueme: React.FC<P> = (p) => {
  const { t, s, e } = p;
  const cam = orbita([0, -0.3, 0], 4.2, L(t, s, e, -0.2, 0.2), 0.05, { apertura: 35, centroY: 1020 });
  const tr: Trazo[] = [];
  const pose = poseEn(t, [[s - 1, POSES.dePie], [s + 0.1, POSES.senala], [s + 1.3, POSES.celebra]], 0.3);
  monigote(tr, [0, -0.98 + 0.06 * Math.max(0, Math.sin((t - s - 1.3) * 6)) * (t > s + 1.3 ? 1 : 0), 0], pose, "frente", 1, 1.0, t);
  return (
    <>
      <CtaSeguir {...p} lema="LA CUATRO ES LA BUENA" />
      <Escena cam={cam} trazos={tr} />
    </>
  );
};

// ------------------------------------------------------------------ 5. Fase tres: doblas el lote y lo pierdes todo (sin stickman)
const Tres: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.35, 0], L(t, s, e, 5.0, 4.6), L(t, s, e, -0.2, 0.1) + sacude(t, EV.todo - 0.05), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 1000 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, SUELO, 0.16);
  const cae = L(t, EV.todo - 0.15, EV.todo + 0.8, 0, 1, (u) => u * u);
  const lotes = [1, 2, 4, 8];
  lotes.forEach((n, i) => {
    const t0 = EV.doblas - 0.2 + i * ((EV.recuperar - EV.doblas + 0.6) / 4);
    const g = muelle(t, t0, 200, 13);
    if (g <= 0) return;
    const x = -0.6 + i * 0.4;
    const h = 0.1 * n * Math.min(g, 1.05);
    const dx = (i - 1.5) * 0.25 * cae;
    const dy = -1.2 * cae * cae;
    cristal(tr, [x - 0.15 + dx, SUELO + dy, -0.15], [x + 0.15 + dx, SUELO + h + dy, 0.15], cae > 0 ? ROJO : "#fff", 1 - 0.5 * cae, 0.25, cae > 0 ? 0.2 : 0.1);
  });
  const pr = proyector(cam);
  const saldo = t < EV.todo - 0.1 ? null : "0 €";
  const k = golpe(t, EV.todo - 0.05);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {lotes.map((n, i) => {
        const t0 = EV.doblas - 0.2 + i * ((EV.recuperar - EV.doblas + 0.6) / 4);
        const q = pr([-0.6 + i * 0.4, SUELO + 0.1 * n + 0.08, 0.15]);
        return (
          <div key={n} style={{ position: "absolute", left: q.x, top: q.y - 40, transform: "translateX(-50%)", opacity: L(t, t0, t0 + 0.2, 0, 1) * (1 - cae), ...mono(36) }}>
            {`×${n}`}
          </div>
        );
      })}
      {saldo && (
        <div style={{ position: "absolute", top: 1220, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 16, alignItems: "baseline", transform: `scale(${1 + 0.3 * k})` }}>
          <span style={mono(26, 0.6)}>SALDO</span>
          <span style={{ ...mono(120), color: ROJO, opacity: 0.92 }}>{saldo}</span>
        </div>
      )}
      <Kicker t={t} t0={s + 0.02} texto="FASE 3" />
      <Destello t={t} t0={EV.todo - 0.05} o={0.22} />
      <Arriba>
        <Titular t={t} t0={s + 0.05} fin={EV.todo - 0.45} texto="doblas el *lote*" size={116} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.todo - 0.4} texto="lo pierdes *todo*" size={112} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Fase cuatro: controlas cuánto pierdes (stickman relajado)
const ESTABLE = Array.from({ length: 30 }, (_, i) => i * 0.11 + 0.25 * Math.sin(i * 1.3) * (i % 7 === 3 ? 1.6 : 0.6));
const Cuatro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.2, 0], L(t, s, e, 4.4, 4.1), L(t, s, e, -0.15, 0.15) + sacude(t, EV.quedan - 0.05, 0.015), L(t, s, e, 0.05, 0.1), { apertura: 35, centroY: 930 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -1.0, 0.16, "#fff", 0.2);
  escritorio(tr, -0.05, 0.85, -0.32);
  silla(tr, -0.5, -0.56);
  const n = Math.round(L(t, s, EV.quedan, 4, ESTABLE.length, (u) => u));
  monitor(tr, [0.42, 0.05, 0], 0.7, 0.5, (p) => {
    const lo = Math.min(...ESTABLE);
    const hi = Math.max(...ESTABLE);
    const pts = ESTABLE.slice(0, n).map((v, i) => p(i / (ESTABLE.length - 1), 0.1 + ((v - lo) / (hi - lo)) * 0.8));
    tr.push({ t: "p", pts, w: 2.4, o: 1, luz: 0.4 });
    tr.push({ t: "e", c: pts[pts.length - 1], r: 0.015, tipo: "punto", o: 1, luz: 1 });
  });
  const pose = poseEn(t, [[s - 1, POSES.sentado], [EV.controlar, POSES.relajado]], 0.4);
  monigote(tr, [-0.42, -0.52, 0], pose, "lado", 1, 1, t);
  const pr = proyector(cam);
  const qm = pr([0.42, 0.38, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: qm.x, top: qm.y - 30, transform: "translateX(-50%)", opacity: L(t, EV.controlar - 0.2, EV.controlar + 0.1, 0, 1), ...mono(40) }}>
        RIESGO <span style={{ color: VERDE }}>1 %</span>
      </div>
      <Kicker t={t} t0={s + 0.02} texto="FASE 4" />
      <Arriba>
        <Titular t={t} t0={s + 0.05} fin={EV.controlar - 0.45} texto="ni *perfecta*" size={124} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.controlar - 0.4} fin={EV.quedan - 0.8} texto="controlas lo que *pierdes*" size={84} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.quedan - 0.75} texto="y *te quedas*" size={120} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta final: ¿en qué fase estás? (sin stickman)
const Pregunta: React.FC<P> = (p) => {
  const { t, s } = p;
  return (
    <>
      <PreguntaComentarios {...p} lineas={["¿en qué fase", "*estás*?"]} kicker="DIME" pie="ETIQUETA A QUIEN SIGUE EN LA 2" size={104} />
      <div style={{ position: "absolute", top: 1090, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 34 }}>
        {[1, 2, 3, 4].map((n, i) => {
          const g = muelle(t, s + 0.6 + i * 0.1, 220, 14);
          const late = n === 2 ? 1 + 0.08 * Math.sin((t - s) * 8) : 1;
          return (
            <div key={n} style={{ width: 96, height: 96, borderRadius: 48, border: `3px solid #fff`, display: "flex", alignItems: "center", justifyContent: "center", opacity: Math.min(Math.max(g, 0) * 1.5, 1), transform: `scale(${(0.6 + 0.4 * Math.min(Math.max(g, 0), 1.1)) * late})`, background: n === 2 ? "rgba(255,255,255,0.12)" : "transparent", ...mono(48) }}>
              {n}
            </div>
          );
        })}
      </div>
    </>
  );
};

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, uno: Uno, dos: Dos, sigueme: Sigueme, tres: Tres, cuatro: Cuatro, pregunta: Pregunta };
export const CLAVES = claves(["cuatro", "fases", "cuál", "tres", "genio", "pierdes", "manipulado", "Sígueme", "buena", "doblas", ["todo", ROJO], "perfecta", "controlar", "quedan", "fase", "etiqueta"]);

export const Fases: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/fases_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />;
