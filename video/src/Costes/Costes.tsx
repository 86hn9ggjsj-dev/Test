// Reel de alcance "¿Cuánto te cuesta hacer 10 operaciones al día?" (~37 s): diez operaciones, la loncha de 3 € que se
// lleva cada una, la pregunta a los espectadores, el calendario de 250 sesiones que suma 7.500 €, la cuenta de 5.000 €
// frente a la columna de costes y cien operaciones que sobraban. Tiempos en src/gen/costes.json (scripts/costes.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/costes.json";
import { salida } from "../Premium/ui";
import { Arriba, Etiqueta, euros, L, mono, muelle, Titular } from "../Bot/piezas";
import { caja, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { Abajo, claves, CtaSeguir, Destello, Gigante, golpe, Kicker, Montaje, P, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const COSTES_FPS = datos.fps;
export const COSTES_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;

const cubo = (tr: Trazo[], c: V3, lado: number, o = 1, luz = 0.25, dash?: string) => {
  const r = lado / 2;
  for (const [a, b] of caja([c[0] - r, c[1] - r, c[2] - r], [c[0] + r, c[1] + r, c[2] + r])) tr.push({ t: "l", a, b, w: 1.6, o, luz, dash });
};
const cuadro = (tr: Trazo[], x: number, y: number, r: number, o: number, luz = 0, dash?: string) => {
  tr.push({ t: "p", pts: [[x - r, y - r, 0], [x + r, y - r, 0], [x + r, y + r, 0], [x - r, y + r, 0], [x - r, y - r, 0]], w: 1.2, o, luz, dash });
};

// ------------------------------------------------------------------ 1. Hook: diez operaciones al día
const XH = (k: number) => -0.95 + k * 0.21;
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.3, 0], L(t, s, e, 6.4, 6.0), L(t, s, e, -0.3, -0.1) + sacude(t, EV.agarrate - 0.05, 0.02), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 1020 });
  const tr: Trazo[] = [...polvo(0.3)];
  for (let k = 0; k < 10; k++) {
    const g = muelle(t, -0.6 + k * 0.08, 220, 14);
    if (g > 0) cubo(tr, [XH(k), -0.45, 0], 0.15 * Math.min(g, 1.1));
  }
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Gigante t={t} t0={-0.45} texto="10" top={460} size={240} pie="OPERACIONES AL DÍA" />
      <Arriba>
        <Titular t={t} t0={-0.6} texto="¿cuánto te *cuesta*?" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Coste: 3 € por operación
const Coste: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 6.2, 5.8), L(t, s, e, -0.35, 0.1), L(t, s, e, 0.25, 0.3), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.3)];
  const g = muelle(t, s + 0.05, 170, 15);
  const R = 0.42 * Math.min(g, 1.05);
  const corte = t >= EV.tres - 0.15;
  const LONCHA = 0.1;
  for (const [a, b] of caja([-R, -R, -R], [R, corte ? R - LONCHA : R, R])) tr.push({ t: "l", a, b, w: 1.8, o: 1, luz: 0.2 });
  // La loncha de 3 € se separa y sale volando
  const u = L(t, EV.tres - 0.15, EV.tres + 0.8, 0, 1, salida);
  if (corte) {
    const dy = 0.35 * u;
    const dx = 0.35 * u;
    for (const [a, b] of caja([-R + dx, R - LONCHA + dy, -R], [R + dx, R + dy, R])) tr.push({ t: "l", a, b, w: 1.8, o: 1, luz: 0.7, dash: "5 4" });
  }
  const pr = proyector(cam);
  const q = pr([R + 0.35 * u, R + 0.35 * u + 0.05, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.tres - 0.05} x={Math.min(q.x + 20, 900)} y={q.y - 40} size={64}>
        −3 €
      </Etiqueta>
      <div style={{ position: "absolute", top: 1250, left: 0, width: 1080, display: "flex", justifyContent: "center", opacity: L(t, s + 0.3, s + 0.6, 0, 1, salida) }}>
        <span style={mono(30, 0.7)}>SPREAD + COMISIÓN</span>
      </div>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.nada - 0.4} texto="*3 €* por operación" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.nada - 0.35} texto="parece *nada*" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Pregunta a los espectadores
const Pregunta: React.FC<P> = (p) => <PreguntaComentarios {...p} lineas={["¿cuántas haces", "tú *al día*?"]} />;

// ------------------------------------------------------------------ 4. Cuenta: 30 € al día; 250 sesiones, 7.500 €
const Cuenta: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 6.4, 6.0), L(t, s, e, -0.2, 0.1) + sacude(t, EV.r7500 - 0.05), L(t, s, e, 0.12, 0.18), { apertura: 35, centroY: 940 });
  const tr: Trazo[] = [...polvo(0.3)];
  const raiz = L(t, s, s + 0.5, 0, 1, salida);
  const n = Math.floor(L(t, EV.ano - 0.1, EV.r7500, 1, 250, (u) => u * u));
  for (let i = 0; i < 250; i++) {
    const col = i % 25;
    const fila = Math.floor(i / 25);
    const lleno = i < n;
    cuadro(tr, -0.92 + col * 0.0767, 0.35 - fila * 0.0767, 0.03, (lleno ? 1 : 0.3) * raiz, lleno ? 0.3 : 0, lleno ? undefined : "2 3");
  }
  const total = t < EV.ano - 0.1 ? 30 : 30 * n;
  const k = golpe(t, EV.r7500 - 0.05);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Kicker t={t} t0={s + 0.05} texto={`SESIÓN ${t < EV.ano - 0.1 ? 1 : n} DE 250`} />
      <Abajo top={1220}>
        <span style={{ ...mono(110), display: "inline-block", transform: `scale(${1 + 0.25 * k})` }}>{`${euros(total)} €`}</span>
        <span style={mono(26, 0.6)}>{t < EV.ano - 0.1 ? "AL DÍA" : "AL AÑO"}</span>
      </Abajo>
      <Destello t={t} t0={EV.r7500 - 0.05} o={0.18} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.ano - 0.35} texto="*30 €* al día" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.ano - 0.3} texto="*7.500 €* al año" size={106} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: con 5.000 € de cuenta, un 150 % solo para quedarte igual
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.1, 0], L(t, s, e, 6.8, 6.4), L(t, s, e, 0.3, 0.05) + sacude(t, EV.r150 - 0.05), L(t, s, e, 0.12, 0.2), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.3)];
  const BASE = -0.8;
  const g1 = muelle(t, s + 0.05, 170, 15);
  const g2 = muelle(t, EV.r150 - 0.4, 150, 13);
  const H1 = 0.9;
  for (const [a, b] of caja([-0.75, BASE, -0.25], [-0.25, BASE + H1 * Math.min(g1, 1.05), 0.25])) tr.push({ t: "l", a, b, w: 1.8, o: 1, luz: 0.2 });
  if (g2 > 0) for (const [a, b] of caja([0.25, BASE, -0.25], [0.75, BASE + 1.5 * H1 * Math.min(g2, 1.05), 0.25])) tr.push({ t: "l", a, b, w: 1.8, o: 1, luz: 0.5, dash: "6 5" });
  tr.push({ t: "l", a: [-1.0, BASE + H1, 0], b: [1.0, BASE + H1, 0], w: 1.2, o: 0.5, dash: "6 8" });
  const pr = proyector(cam);
  const t1 = pr([-0.5, BASE + H1, 0.25]);
  const t2 = pr([0.5, BASE + 1.5 * H1 * Math.max(Math.min(g2, 1), 0), 0.25]);
  const b1 = pr([-0.5, BASE, 0.25]);
  const b2 = pr([0.5, BASE, 0.25]);
  const k = golpe(t, EV.r150 - 0.05);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: t1.x, top: t1.y - 66, transform: "translateX(-50%)", opacity: Math.min(g1 * 1.5, 1), ...mono(46) }}>5.000 €</div>
      {g2 > 0 && <div style={{ position: "absolute", left: t2.x, top: t2.y - 66, transform: `translateX(-50%) scale(${1 + 0.25 * k})`, ...mono(46) }}>7.500 €</div>}
      <div style={{ position: "absolute", left: b1.x, top: b1.y + 22, transform: "translateX(-50%)", ...mono(28, 0.8) }}>TU CUENTA</div>
      <div style={{ position: "absolute", left: b2.x, top: b2.y + 22, transform: "translateX(-50%)", opacity: Math.min(Math.max(g2, 0) * 1.5, 1), ...mono(28, 0.8) }}>COSTES</div>
      <Destello t={t} t0={EV.r150 - 0.05} o={0.18} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.r150 - 0.4} texto="cuenta de *5.000 €*" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.r150 - 0.35} fin={EV.igual - 0.35} texto="ganar un *150 %*" size={104} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.igual - 0.3} texto="para quedarte *igual*" size={92} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: no es una mala operación, son cien que sobraban
const Cierre: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.1, 0], L(t, s, e, 6.6, 6.2), L(t, s, e, -0.2, 0.1) + sacude(t, EV.cien - 0.05), L(t, s, e, 0.12, 0.16), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const g = muelle(t, s + 0.05, 170, 15);
  cubo(tr, [-0.55, -0.1, 0], 0.4 * Math.min(g, 1.05), 1 - 0.5 * L(t, EV.cien - 0.3, EV.cien, 0, 1), 0.2);
  for (let i = 0; i < 100; i++) {
    const gi = muelle(t, EV.cien - 0.25 + (i % 10) * 0.02 + Math.floor(i / 10) * 0.02, 240, 15);
    if (gi <= 0) continue;
    cuadro(tr, 0.2 + (i % 10) * 0.08, 0.26 - Math.floor(i / 10) * 0.08, 0.028 * Math.min(gi, 1.1), 1, 0.4);
  }
  const pr = proyector(cam);
  const q1 = pr([-0.55, -0.32, 0.2]);
  const q2 = pr([0.56, -0.5, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: q1.x, top: q1.y + 22, transform: "translateX(-50%)", opacity: Math.min(g * 1.5, 1), ...mono(28, 0.8) }}>1 MALA</div>
      <Etiqueta t={t} t0={EV.cien - 0.05} x={q2.x} y={q2.y} size={28} alinea="centro">
        100 QUE SOBRABAN
      </Etiqueta>
      <Destello t={t} t0={EV.cien - 0.05} o={0.18} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.cien - 0.4} texto="no es *una*" size={120} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.cien - 0.35} texto="son *cien*" size={120} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 7. CTA
const Cta: React.FC<P> = (p) => <CtaSeguir {...p} lema="MÁS CUENTAS QUE NADIE TE HACE" />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, coste: Coste, pregunta: Pregunta, cuenta: Cuenta, giro: Giro, cierre: Cierre, cta: Cta };
export const CLAVES = claves(["10", "cuesta", "3", "nada", "comentarios", "30", "250", "7.500", "5.000", "150%", "igual", "cien", "sígueme"]);

export const Costes: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/costes_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
