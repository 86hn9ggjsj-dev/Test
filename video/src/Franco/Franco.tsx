// Reel de alcance "Tu stop loss no siempre te protege" (~39 s), en blanco y negro: un escudo «STOP LOSS» que se agrieta,
// el euro-franco pegado a 1,20 que cae casi un 30 % a las 10:30 del 15-1-2015, el «sígueme» a mitad, el stop en 1,19 que
// se ejecuta muy por debajo tras el hueco, cuentas en negativo, un bróker apuntalado y otro que se derrumba, la escalera
// de precios con peldaños que faltan y la pregunta final. Tiempos en src/gen/franco.json (scripts/franco.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/franco.json";
import { salida } from "../Premium/ui";
import { ANCHO, ruido } from "../Viral/util";
import { Arriba, Etiqueta, L, mono, muelle, Titular } from "../Bot/piezas";
import { Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { cristal, suelo } from "../Bot/kit";
import { claves, CtaSeguir, Destello, golpe, Kicker, Montaje, P, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const FRANCO_FPS = datos.fps;
export const FRANCO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;

// ------------------------------------------------------------------ 1. Hook: el escudo del stop se agrieta y se rompe
const ESCUDO: V3[] = [[-0.45, 0.5, 0], [0.45, 0.5, 0], [0.45, 0.05, 0], [0.3, -0.35, 0], [0, -0.6, 0], [-0.3, -0.35, 0], [-0.45, 0.05, 0], [-0.45, 0.5, 0]];
const GRIETA: V3[] = [[0.05, 0.5, 0.01], [-0.04, 0.3, 0.01], [0.08, 0.12, 0.01], [-0.06, -0.08, 0.01], [0.04, -0.3, 0.01], [0, -0.6, 0.01]];
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 4.2, 3.8), L(t, s, e, -0.3, 0.2) + sacude(t, EV.jueves - 0.05), L(t, s, e, 0.06, 0.1), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.3)];
  const g = Math.min(muelle(t, -0.6, 150, 14), 1.05);
  const grieta = L(t, EV.protege - 0.3, EV.protege + 0.2, 0, 1, salida);
  const rompe = L(t, EV.jueves - 0.1, EV.jueves + 0.9, 0, 1, (u) => u * u);
  // Cada mitad del escudo (cortada por la grieta) se separa y cae al romperse
  const esc = (p: V3): V3 => [p[0] * g, p[1] * g, p[2]];
  const vuelta = GRIETA.slice(1, -1).reverse();
  const mitades: V3[][] = [
    [GRIETA[0], [-0.45, 0.5, 0], [-0.45, 0.05, 0], [-0.3, -0.35, 0], [0, -0.6, 0], ...vuelta, GRIETA[0]],
    [GRIETA[0], [0.45, 0.5, 0], [0.45, 0.05, 0], [0.3, -0.35, 0], [0, -0.6, 0], ...vuelta, GRIETA[0]],
  ];
  if (rompe <= 0) tr.push({ t: "p", pts: ESCUDO.map(esc), w: 2.6, o: 1, relleno: "#fff", oRelleno: 0.08, luz: 0.3 });
  else
    mitades.forEach((m, i) => {
      const lado = i ? 1 : -1;
      const desp = (p: V3): V3 => [p[0] * g + lado * 0.35 * rompe, p[1] * g - 0.9 * rompe * rompe, p[2]];
      tr.push({ t: "p", pts: m.map(desp), w: 2.6, o: 1 - 0.6 * rompe, relleno: "#fff", oRelleno: 0.08 * (1 - rompe), luz: 0.3 * (1 - rompe) });
    });
  if (grieta > 0) tr.push({ t: "p", pts: GRIETA.map(([x, y, z]): V3 => [x * g, y * g, z]), w: 2.4, o: 1 - rompe, luz: 0.9, prog: grieta });
  const pr = proyector(cam);
  const q = pr([0, 0.18, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: q.x, top: q.y, transform: `translate(-50%, -50%) translateY(${rompe * 400}px)`, opacity: 1 - rompe, ...mono(46) }}>STOP LOSS</div>
      <Kicker t={t} t0={EV.jueves - 0.2} texto="JUEVES · 15 DE ENERO DE 2015" />
      <Destello t={t} t0={EV.jueves - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={-0.6} fin={EV.jueves - 0.45} texto="tu stop *no siempre*" size={104} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.jueves - 0.4} texto="te *protege*" size={120} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ gráfico del euro-franco: pegado a 1,20 y caída vertical
const YF = (v: number) => -0.55 + ((v - 0.82) / 0.42) * 1.1;
const PEGADO = Array.from({ length: 40 }, (_, i) => 1.2015 + 0.0012 * Math.abs(Math.sin(i * 1.9)));
const DESPUES = [0.98, 0.86, 0.85, 0.92, 0.99, 1.02, 1.01, 1.03, 1.02, 1.04];
const XF = (i: number) => -0.85 + (1.7 * i) / 49;
const euroFranco = (tr: Trazo[], hasta: number) => {
  const serie = [...PEGADO, ...DESPUES];
  const n = Math.max(2, Math.min(serie.length, Math.round(hasta)));
  const pts: V3[] = serie.slice(0, n).map((v, i) => [XF(i), YF(v), 0]);
  tr.push({ t: "p", pts, w: 2.4, o: 1, luz: 0.4 });
  tr.push({ t: "e", c: pts[pts.length - 1], r: 0.03, tipo: "punto", o: 1, luz: 1 });
  tr.push({ t: "l", a: [-0.95, YF(1.2), 0], b: [0.95, YF(1.2), 0], w: 1.4, o: 0.6, dash: "6 6" });
};

// ------------------------------------------------------------------ 2. Anuncio: el banco central suizo deja de frenar al franco
const Anuncio: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 5.0, 4.7), L(t, s, e, -0.15, 0.12) + sacude(t, EV.treinta - 0.1), L(t, s, e, 0.05, 0.09), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const hasta = t < EV.frenar ? L(t, s, EV.frenar, 10, 40, (u) => u) : L(t, EV.frenar, EV.treinta, 40, 43, (u) => u * u);
  euroFranco(tr, hasta);
  const k = golpe(t, EV.treinta - 0.1);
  const pr = proyector(cam);
  const qs = pr([0.95, YF(1.2), 0]);
  const qmin = pr([XF(42), YF(0.85), 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: Math.min(qs.x, 1050), top: qs.y - 44, transform: "translateX(-100%)", ...mono(30, 0.8) }}>SUELO 1,20</div>
      <div style={{ position: "absolute", top: 470, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, EV.anuncia - 0.3, EV.anuncia, 0, 1), ...mono(54) }}>10:30</div>
      {t >= EV.treinta - 0.15 && <div style={{ position: "absolute", left: qmin.x - 30, top: qmin.y - 40, transform: `translateX(-100%) scale(${1 + 0.3 * k})`, transformOrigin: "right center", ...mono(64) }}>−30 %</div>}
      <Kicker t={t} t0={s + 0.05} texto="EUR/CHF" />
      <Destello t={t} t0={EV.treinta - 0.1} o={0.25} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.treinta - 0.45} texto="*sin avisar*" size={120} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.treinta - 0.4} texto="*−30 %* en minutos" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Sígueme a mitad
const Sigueme: React.FC<P> = (p) => <CtaSeguir {...p} lema="LO QUE VIENE CASI NADIE LO SABE" />;

// ------------------------------------------------------------------ 4. Stops: no saltaron donde estaban puestos, sino mucho más abajo
const Stops: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0.05, 0], L(t, s, e, 4.4, 4.1), L(t, s, e, 0.2, -0.1) + sacude(t, EV.golpe - 0.05), L(t, s, e, 0.05, 0.09), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  euroFranco(tr, 43);
  // El stop en 1,19 y el punto donde de verdad se ejecuta, tras el hueco
  tr.push({ t: "l", a: [-0.95, YF(1.19), 0], b: [0.95, YF(1.19), 0], w: 2, o: 1, dash: "3 5", luz: 0.4 });
  const flecha = L(t, EV.abajo - 0.3, EV.abajo + 0.4, 0, 1, salida);
  const xg = XF(41) + 0.12;
  if (flecha > 0) tr.push({ t: "p", pts: [[xg, YF(1.19), 0], [xg, YF(1.19) + (YF(0.9) - YF(1.19)) * flecha, 0]], w: 2.6, o: 1, luz: 0.7 });
  if (flecha >= 1) tr.push({ t: "e", c: [xg, YF(0.9), 0], r: 0.04, tipo: "aro", o: 1, luz: 1 });
  const hueco = L(t, EV.golpe - 0.3, EV.golpe, 0, 1);
  if (hueco > 0) tr.push({ t: "p", pts: [[xg + 0.06, YF(1.18), 0], [xg + 0.1, YF(1.18), 0], [xg + 0.1, YF(0.92), 0], [xg + 0.06, YF(0.92), 0]], w: 1.4, o: hueco, dash: "4 4" });
  const pr = proyector(cam);
  const qs = pr([-0.95, YF(1.19), 0]);
  const qe = pr([xg, YF(0.9), 0]);
  const qh = pr([xg + 0.1, YF(1.05), 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.puestos - 0.2} x={Math.max(qs.x + 10, 40)} y={qs.y + 26} size={30}>
        TU STOP · 1,1900
      </Etiqueta>
      <Etiqueta t={t} t0={EV.abajo + 0.3} x={qe.x - 24} y={qe.y + 10} size={30} alinea="der">
        SE EJECUTA AQUÍ
      </Etiqueta>
      <Etiqueta t={t} t0={EV.golpe - 0.1} x={qh.x - 150} y={qh.y} size={26} o={0.8} alinea="der">
        SIN PRECIOS EN MEDIO
      </Etiqueta>
      <Destello t={t} t0={EV.golpe - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.abajo - 0.45} texto="donde lo *pusiste*" size={104} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.abajo - 0.4} texto="*mucho* más abajo" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Quiebra: cuentas en negativo, un rescate de 300 M$ y un bróker que quiebra
const edificio = (tr: Trazo[], x: number, g: number, cae = 0, puntales = 0) => {
  const k = Math.min(g, 1.05);
  const dy = -0.8 * cae * cae;
  const o = 1 - 0.6 * cae;
  const dash = cae > 0.05 ? "5 5" : undefined;
  cristal(tr, [x - 0.36, -0.7, -0.2], [x + 0.36, -0.62 * k, 0.2], "#fff", o, 0.1, 0.05);
  for (let c = 0; c < 4; c++) {
    const cx = x - 0.27 + c * 0.18;
    const ang = cae * (c - 1.5) * 0.35;
    tr.push({ t: "l", a: [cx, -0.62, 0.18], b: [cx + Math.sin(ang) * 0.5, -0.62 + 0.55 * k * Math.cos(ang) + dy, 0.18], w: 2.2, o, dash });
  }
  tr.push({ t: "p", pts: [[x - 0.4, -0.07 * k + dy, 0.2], [x + 0.4, -0.07 * k + dy, 0.2], [x, 0.2 * k + dy, 0.2], [x - 0.4, -0.07 * k + dy, 0.2]], w: 2.2, o, dash, relleno: "#fff", oRelleno: 0.06 * o });
  // Puntales del rescate
  if (puntales > 0) for (const d of [-1, 1]) tr.push({ t: "l", a: [x + d * 0.62, -0.7, 0.1], b: [x + d * 0.4, -0.12, 0.2], w: 2.4, o: puntales, luz: 0.5 * puntales });
};
const Quiebra: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.25, 0], L(t, s, e, 5.2, 4.8), L(t, s, e, -0.2, 0.15) + sacude(t, EV.quebro - 0.05), L(t, s, e, 0.12, 0.18), { apertura: 35, centroY: 1000 });
  const tr: Trazo[] = [...polvo(0.3)];
  suelo(tr, t, -0.7, 0.18, "#fff", 0.3);
  const fase = t >= EV.rescate - 0.6;
  const pr = proyector(cam);
  let html: React.ReactNode = null;
  if (!fase) {
    // Fichas de cuentas que se ponen en negativo
    const neg = L(t, EV.negativo - 0.4, EV.negativo + 0.6, 0, 1);
    html = (
      <div style={{ position: "absolute", top: 600, left: 90, width: 900, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
        {Array.from({ length: 24 }, (_, i) => {
          const malo = ruido(i * 3.7) < neg;
          return (
            <div key={i} style={{ width: 130, height: 70, border: "2px solid rgba(255,255,255,0.8)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: malo ? "rgba(255,255,255,0.85)" : "transparent", ...mono(28), color: malo ? "#000" : "#fff" }}>
              {malo ? "− €" : "+ €"}
            </div>
          );
        })}
      </div>
    );
  } else {
    const g1 = muelle(t, EV.rescate - 0.5, 160, 15);
    const g2 = muelle(t, EV.rescate - 0.3, 160, 15);
    edificio(tr, -0.48, g1, 0, L(t, EV.trescientos - 0.2, EV.trescientos + 0.3, 0, 1, salida));
    edificio(tr, 0.48, g2, L(t, EV.quebro - 0.1, EV.quebro + 0.8, 0, 1));
    const q1 = pr([-0.48, 0.32, 0.2]);
    const q2 = pr([0.48, 0.32, 0.2]);
    html = (
      <>
        <Etiqueta t={t} t0={EV.trescientos - 0.05} x={q1.x} y={q1.y} size={30} alinea="centro">
          RESCATE 300 M$
        </Etiqueta>
        <Etiqueta t={t} t0={EV.quebro - 0.05} x={q2.x} y={q2.y} size={30} alinea="centro">
          QUEBRÓ
        </Etiqueta>
      </>
    );
  }
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {html}
      <Destello t={t} t0={EV.quebro - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.rescate - 0.6} texto="cuentas en *negativo*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.rescate - 0.55} fin={EV.quebro - 0.45} texto="*300 M$* de rescate" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.quebro - 0.4} texto="otro *quebró*" size={120} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Lección: un stop se ejecuta al siguiente precio que haya
const Leccion: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 4.7, 4.4), L(t, s, e, -0.3, -0.1) + sacude(t, EV.siguiente - 0.05, 0.02), L(t, s, e, 0.1, 0.14), { apertura: 35, centroY: 1010 });
  const tr: Trazo[] = [...polvo(0.3)];
  // Escalera de precios: los peldaños del medio no existen
  for (const x of [-0.3, 0.3]) tr.push({ t: "l", a: [x, -0.7, 0], b: [x, 0.7, 0], w: 2, o: 0.9 });
  for (let i = 0; i < 12; i++) {
    const y = 0.65 - i * 0.12;
    const falta = i >= 3 && i <= 8;
    const g = muelle(t, s + 0.05 + i * 0.04, 220, 15);
    if (g <= 0) continue;
    tr.push({ t: "l", a: [-0.3, y, 0], b: [-0.3 + 0.6 * Math.min(g, 1), y, 0], w: falta ? 1 : 2.4, o: falta ? 0.25 : 1, dash: falta ? "3 6" : undefined });
  }
  const yStop = 0.65 - 2 * 0.12;
  const yFill = 0.65 - 9 * 0.12;
  const baja = L(t, EV.siguiente - 0.4, EV.siguiente + 0.3, 0, 1, (u) => u * u);
  tr.push({ t: "e", c: [0, yStop + (yFill - yStop) * baja, 0.02], r: 0.05, tipo: "punto", o: 1, luz: 1 });
  const pr = proyector(cam);
  const qs = pr([0.32, yStop, 0]);
  const qf = pr([0.32, yFill, 0]);
  const tacha = L(t, EV.garantizado - 0.1, EV.garantizado + 0.3, 0, 1, salida);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: qs.x + 20, top: qs.y - 18, ...mono(30) }}>TU STOP</div>
      <Etiqueta t={t} t0={EV.siguiente - 0.1} x={Math.min(qf.x + 20, 700)} y={qf.y} size={30}>
        EL SIGUIENTE PRECIO
      </Etiqueta>
      <div style={{ position: "absolute", top: 430, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
        <span style={{ position: "relative", ...mono(34, 0.85) }}>
          PRECIO GARANTIZADO
          <span style={{ position: "absolute", left: -10, top: "52%", height: 5, width: `calc(${tacha * 100}% + ${tacha * 20}px)`, background: "#fff" }} />
        </span>
      </div>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.siguiente - 0.45} texto="no está *garantizado*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.siguiente - 0.4} texto="el *siguiente* precio" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta al final
const Pregunta: React.FC<P> = (p) => <PreguntaComentarios {...p} lineas={["¿te ha saltado", "*más lejos*?"]} kicker="¿TE HA PASADO?" size={100} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, anuncio: Anuncio, sigueme: Sigueme, stops: Stops, quiebra: Quiebra, leccion: Leccion, pregunta: Pregunta };
export const CLAVES = claves(["protege", "2015", "suizo", "30%", "minutos", "Sígueme", "abajo", "golpe", "negativo", "300", "quebró", "garantizado", "siguiente", "lejos"]);

export const Franco: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/franco_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />;
