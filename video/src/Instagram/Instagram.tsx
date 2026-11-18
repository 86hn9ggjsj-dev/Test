// Reel de alcance "¿Por qué todos los traders de Instagram parecen ganar siempre?" (~39 s): un móvil de alambre con una
// curva que solo sube, mil puntos que se apagan tirada a tirada hasta que queda uno con diez caras, la pregunta a los
// espectadores, el único que ves frente a los 999 que no suben vídeos, diez aciertos tachados frente a una cuenta auditada
// y la de mi bot en la bio. Tiempos en src/gen/instagram.json (scripts/instagram.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/instagram.json";
import { salida } from "../Premium/ui";
import { ANCHO, ruido } from "../Viral/util";
import { Arriba, Etiqueta, euros, L, mono, muelle, Titular } from "../Bot/piezas";
import { circulo, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { claves, CtaSeguir, Destello, golpe, Kicker, Montaje, P, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const INSTAGRAM_FPS = datos.fps;
export const INSTAGRAM_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;

// Mil personas lanzan una moneda diez veces: cuántas caras seguidas saca cada una antes de la primera cruz
const GANADOR = 500;
const RACHA = Array.from({ length: 1000 }, (_, i) => (i === GANADOR ? 10 : Math.min(9, Math.floor(-Math.log2(ruido(i * 7.31 + 2.7) + 1e-6)))));
const PX = (i: number) => -0.9 + (i % 40) * 0.046;
const PY = (i: number) => 0.55 - Math.floor(i / 40) * 0.046;

const rectRed = (cx: number, cy: number, w: number, h: number, r: number): V3[] => {
  const pts: V3[] = [];
  const esq: [number, number, number][] = [[cx + w / 2 - r, cy + h / 2 - r, 0], [cx - w / 2 + r, cy + h / 2 - r, Math.PI / 2], [cx - w / 2 + r, cy - h / 2 + r, Math.PI], [cx + w / 2 - r, cy - h / 2 + r, (3 * Math.PI) / 2]];
  for (const [x, y, a0] of esq) for (let k = 0; k <= 6; k++) pts.push([x + r * Math.cos(a0 + (k / 6) * (Math.PI / 2)), y + r * Math.sin(a0 + (k / 6) * (Math.PI / 2)), 0]);
  pts.push(pts[0]);
  return pts;
};

// ------------------------------------------------------------------ 1. Hook: un móvil con una curva que solo sube
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.15, 0], L(t, s, e, 5.6, 5.2), L(t, s, e, -0.35, 0.2) + sacude(t, EV.estadistica - 0.05), L(t, s, e, 0.08, 0.14), { apertura: 35, centroY: 1000 });
  const tr: Trazo[] = [...polvo(0.3)];
  const g = muelle(t, -0.6, 150, 14);
  const k = Math.min(g, 1.05);
  tr.push({ t: "p", pts: rectRed(0, -0.15, 0.72 * k, 1.32 * k, 0.09), w: 2, o: 1, luz: 0.2 });
  tr.push({ t: "l", a: [-0.08, 0.42, 0], b: [0.08, 0.42, 0], w: 2, o: 0.7 });
  const linea: V3[] = [[-0.26, -0.55, 0], [-0.15, -0.42, 0], [-0.08, -0.47, 0], [0.02, -0.25, 0], [0.08, -0.3, 0], [0.16, 0.0, 0], [0.26, 0.2, 0]];
  tr.push({ t: "p", pts: linea, w: 2.4, o: 1, luz: 0.6, prog: L(t, -0.3, 1.2, 0, 1, salida) });
  const pr = proyector(cam);
  const q = pr([0.26, 0.2, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={1.0} x={q.x - 10} y={q.y - 40} size={44} alinea="der">
        +347 %
      </Etiqueta>
      <Destello t={t} t0={EV.estadistica - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={-0.6} fin={EV.estadistica - 0.4} texto="¿por qué *siempre* ganan?" size={92} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.estadistica - 0.35} texto="*estadística*" size={120} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Monedas: mil personas, diez tiradas, queda una
const puntos = (tr: Trazo[], ronda: number, oOtros: number, brillo = 0) => {
  for (let i = 0; i < 1000; i++) {
    const vivo = RACHA[i] >= ronda;
    const gana = i === GANADOR;
    if (!vivo && oOtros <= 0.01) continue;
    tr.push({ t: "e", c: [PX(i), PY(i), 0], r: gana && ronda >= 10 ? 0.022 + 0.01 * brillo : 0.011, tipo: "punto", o: vivo ? 1 : oOtros, luz: vivo ? (gana && ronda >= 10 ? 1 : 0.3) : 0 });
  }
};
const Monedas: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 6.0, 5.7), L(t, s, e, -0.1, 0.1), L(t, s, e, 0.06, 0.1), { apertura: 35, centroY: 940 });
  const tr: Trazo[] = [...polvo(0.25)];
  const ronda = Math.floor(L(t, EV.mil + 0.4, EV.caras - 0.1, 0, 10, (u) => u));
  puntos(tr, ronda, 0.14, golpe(t, EV.caras - 0.1));
  const quedan = RACHA.filter((k) => k >= ronda).length;
  const pr = proyector(cam);
  const qg = pr([PX(GANADOR), PY(GANADOR), 0]);
  const k = golpe(t, EV.caras - 0.1);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", top: 1250, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 18, alignItems: "baseline" }}>
        <span style={mono(26, 0.6)}>{`TIRADA ${ronda}`}</span>
        <span style={{ ...mono(80), display: "inline-block", transform: `scale(${1 + 0.25 * k})` }}>{euros(quedan)}</span>
        <span style={mono(26, 0.6)}>{quedan === 1 ? "QUEDA" : "QUEDAN"}</span>
      </div>
      <Etiqueta t={t} t0={EV.caras - 0.05} x={qg.x} y={qg.y - 46} size={30} alinea="centro">
        10 CARAS SEGUIDAS
      </Etiqueta>
      <Destello t={t} t0={EV.caras - 0.1} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.probable - 0.4} texto="*1.000* personas" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.probable - 0.35} texto="queda *una*" size={120} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Pregunta a los espectadores
const Pregunta: React.FC<P> = (p) => <PreguntaComentarios {...p} lineas={["¿cuántos cursos", "has *comprado*?"]} size={88} />;

// ------------------------------------------------------------------ 4. Suerte: el único que ves; los otros 999 no suben vídeos
const Suerte: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 5.7, 5.2), L(t, s, e, 0.1, -0.1), L(t, s, e, 0.1, 0.06), { apertura: 35, centroY: 940 });
  const tr: Trazo[] = [...polvo(0.25)];
  const apaga = L(t, EV.videos - 0.6, EV.videos, 0.14, 0, (u) => u);
  puntos(tr, 10, apaga, 0.5 + 0.5 * Math.sin(t * 6));
  const pr = proyector(cam);
  const qg = pr([PX(GANADOR), PY(GANADOR), 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.unico - 0.05} x={qg.x} y={qg.y - 46} size={30} alinea="centro">
        EL QUE VES
      </Etiqueta>
      <div style={{ position: "absolute", top: 1250, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, EV.videos - 0.5, EV.videos - 0.1, 0, 1, salida) }}>
        <span style={mono(40)}>999 NO SUBEN VÍDEOS</span>
      </div>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.suerte - 0.4} texto="no es un *genio*" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.suerte - 0.35} fin={EV.unico - 0.35} texto="es *suerte*" size={120} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.unico - 0.3} texto="el único que *ves*" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: diez aciertos no demuestran nada; una cuenta auditada sí
const certificado = (tr: Trazo[], g: number, sello: number) => {
  const k = Math.min(g, 1.05);
  tr.push({ t: "p", pts: rectRed(0, -0.25, 1.1 * k, 0.8 * k, 0.04), w: 2, o: 1, luz: 0.2 });
  for (let i = 0; i < 4; i++) tr.push({ t: "l", a: [-0.42 * k, (0.02 - i * 0.12) * k - 0.05, 0], b: [(0.12 - (i % 2) * 0.18) * k, (0.02 - i * 0.12) * k - 0.05, 0], w: 1.2, o: 0.6 });
  if (sello > 0) {
    const c: V3 = [0.32 * k, -0.42 * k, 0];
    const r = 0.13 * Math.min(sello, 1.1);
    tr.push({ t: "p", pts: circulo(c, r, "z", 40), w: 2.2, o: 1, luz: 0.8 });
    tr.push({ t: "p", pts: [[c[0] - r * 0.45, c[1], 0], [c[0] - r * 0.1, c[1] - r * 0.35, 0], [c[0] + r * 0.5, c[1] + r * 0.4, 0]], w: 2.6, o: 1, luz: 0.8 });
  }
};
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.2, 0], L(t, s, e, 5.8, 5.4), L(t, s, e, -0.3, 0.1) + sacude(t, EV.auditada - 0.05), L(t, s, e, 0.1, 0.14), { apertura: 35, centroY: 1020 });
  const tr: Trazo[] = [...polvo(0.3)];
  const g = muelle(t, EV.auditada - 0.6, 150, 14);
  if (g > 0) certificado(tr, g, muelle(t, EV.auditada - 0.1, 200, 12));
  const tacha = L(t, EV.nada - 0.2, EV.nada + 0.2, 0, 1, salida);
  const fila = L(t, s + 0.1, s + 0.5, 0, 1, salida) * (1 - 0.5 * L(t, EV.auditada - 0.6, EV.auditada - 0.3, 0, 1));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", top: 520, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: fila }}>
        <span style={{ position: "relative", ...mono(52) }}>
          ✓✓✓✓✓✓✓✓✓✓
          <span style={{ position: "absolute", left: -14, top: "50%", height: 6, width: `calc(${tacha * 100}% + ${tacha * 28}px)`, background: "#fff" }} />
        </span>
      </div>
      <Etiqueta t={t} t0={EV.auditada - 0.05} x={540} y={1280} size={44} alinea="centro">
        CUENTA AUDITADA
      </Etiqueta>
      <Destello t={t} t0={EV.auditada - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.auditada - 0.6} texto="10 aciertos: *nada*" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.auditada - 0.55} texto="una cuenta *auditada*" size={92} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: pídele la suya; la de mi bot, en la bio
const Cierre: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.2, 0], L(t, s, e, 5.6, 5.4), L(t, s, e, 0.1, -0.15), L(t, s, e, 0.12, 0.1), { apertura: 35, centroY: 1020 });
  const tr: Trazo[] = [...polvo(0.3)];
  certificado(tr, 1, 1);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Kicker t={t} t0={s + 0.05} texto="ANTES DE FIARTE DE NADIE" />
      <div style={{ position: "absolute", top: 1260, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, EV.bio - 0.9, EV.bio - 0.5, 0, 1, salida) }}>
        <span style={{ ...mono(32, 0.95), padding: "16px 30px", borderRadius: 999, border: "2px solid rgba(255,255,255,0.7)" }}>↗ CUENTA AUDITADA DEL BOT EN LA BIO</span>
      </div>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.bio - 0.9} texto="pídele la *suya*" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.bio - 0.85} texto="la de mi bot: *bio*" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 7. CTA
const Cta: React.FC<P> = (p) => <CtaSeguir {...p} lema="MÁS CUENTAS QUE NADIE TE HACE" />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, monedas: Monedas, pregunta: Pregunta, suerte: Suerte, giro: Giro, cierre: Cierre, cta: Cta };
export const CLAVES = claves(["Instagram", "siempre", "Estadística", "mil", "diez", "caras", "cursos", "comentarios", "genio", "suerte", "999", "nada", "auditada", "bio", "sígueme"]);

export const Instagram: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/instagram_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
