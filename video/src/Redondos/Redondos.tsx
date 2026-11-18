// Reel de alcance "¿Por qué el precio frena en los números redondos?" (~39 s), en blanco y negro: velas que suben hacia
// 1,1000 y 1,0987 y frenan en el redondo, el libro de órdenes con el muro de take profit, el «sígueme» a mitad, los stops
// justo al otro lado (Osler, Reserva Federal de Nueva York), la rotura con los stops saltando en cadena, el montón de stops
// donde los pone todo el mundo y la pregunta final. Tiempos en src/gen/redondos.json (scripts/redondos.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/redondos.json";
import { salida } from "../Premium/ui";
import { ANCHO, ruido } from "../Viral/util";
import { Arriba, Etiqueta, L, mono, muelle, Titular } from "../Bot/piezas";
import { Escena, orbita, polvo, proyector, Trazo } from "../Bot/tres";
import { cristal, velas } from "../Bot/kit";
import { claves, CtaSeguir, Destello, golpe, Kicker, Montaje, P, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const REDONDOS_FPS = datos.fps;
export const REDONDOS_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;

// Precio → altura en la escena (de 1,0960 a 1,1030)
const Y = (p: number) => -0.6 + ((p - 1.096) / 0.007) * 1.2;
const coma = (p: number) => p.toFixed(4).replace(".", ",");
// Sube hacia el redondo, lo toca y rebota; luego consolida y rompe con los stops
const SUBIDA = Array.from({ length: 26 }, (_, i) =>
  i < 18 ? Math.min(1.0999, 1.0965 + (0.0033 * i) / 17 + 0.0004 * Math.sin(i * 1.7)) : 1.0999 - (i - 18) * 0.0003 + 0.0002 * Math.sin(i * 2.1),
);
const CADENA = [...SUBIDA, 1.0992, 1.0995, 1.0993, 1.0997, 1.0998, 1.1004, 1.1011, 1.1018, 1.1024, 1.1027];
const XV = (i: number, n: number) => -0.85 + (1.6 * i) / (n - 1);

const niveles = (tr: Trazo[], o987: number, brillo: number) => {
  tr.push({ t: "l", a: [-0.95, Y(1.1), 0], b: [0.95, Y(1.1), 0], w: 2, o: 0.9, dash: "8 6", luz: 0.2 + 0.6 * brillo });
  if (o987 > 0) tr.push({ t: "l", a: [-0.95, Y(1.0987), 0], b: [0.95, Y(1.0987), 0], w: 1.2, o: 0.5 * o987, dash: "3 6" });
};

// ------------------------------------------------------------------ 1. Hook: ¿1,1000 o 1,0987? Frena en el redondo
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 5.0, 4.6), L(t, s, e, -0.2, 0.15) + sacude(t, EV.primero - 0.05), L(t, s, e, 0.06, 0.1), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const n = Math.round(L(t, -0.4, EV.primero, 4, SUBIDA.length, (u) => u));
  velas(tr, SUBIDA.map(Y), -0.85, 0.75, n, 0.034, 1, 0.025, true);
  const k = golpe(t, EV.primero - 0.05);
  niveles(tr, 1, k);
  const pr = proyector(cam);
  const q1 = pr([0.95, Y(1.1), 0]);
  const q2 = pr([0.95, Y(1.0987), 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: Math.min(q1.x, 1050), top: q1.y - 50, transform: `translateX(-100%) scale(${1 + 0.2 * k})`, ...mono(40) }}>1,1000</div>
      <div style={{ position: "absolute", left: Math.min(q2.x, 1050), top: q2.y + 10, transform: "translateX(-100%)", opacity: t >= EV.primero ? 0.35 : 0.8, ...mono(34) }}>1,0987</div>
      <Etiqueta t={t} t0={EV.primero - 0.05} x={pr([0.2, Y(1.1), 0]).x} y={pr([0.2, Y(1.1), 0]).y - 50} size={34} alinea="centro">
        FRENA AQUÍ
      </Etiqueta>
      <Destello t={t} t0={EV.primero - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={-0.6} fin={EV.primero - 0.45} texto="¿dónde *frena*?" size={116} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.primero - 0.4} texto="en el *redondo*" size={116} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ libro de órdenes: barras por nivel de precio
const NIVELES = Array.from({ length: 9 }, (_, i) => 1.098 + i * 0.0005);
const libro = (tr: Trazo[], t: number, tp: number, stops: number) => {
  NIVELES.forEach((p, i) => {
    const redondo = Math.abs(p - 1.1) < 1e-6;
    const base = 0.12 + 0.18 * ruido(i * 3.3 + 1);
    const largo = redondo ? base + 1.15 * tp : base;
    const y = Y(p);
    cristal(tr, [-0.35, y - 0.028, -0.03], [-0.35 + largo, y + 0.028, 0.03], "#fff", 1, redondo ? 0.2 + 0.5 * tp : 0, redondo ? 0.45 : 0.08);
  });
  if (stops > 0) {
    const y = Y(1.1005);
    cristal(tr, [-0.35, y - 0.028, -0.03], [-0.35 + 0.15 + 1.0 * stops, y + 0.028, 0.03], "#fff", 1, 0.4 * stops, 0.03);
    for (let k = 0; k < Math.round(14 * stops); k++) tr.push({ t: "e", c: [-0.33 + k * 0.08, y, 0.04], r: 0.012, tipo: "aro", o: 0.9 });
  }
};
const etiquetasLibro = (pr: (p: [number, number, number]) => { x: number; y: number }, o: number) =>
  NIVELES.map((p) => {
    const q = pr([-0.42, Y(p), 0]);
    return (
      <div key={p} style={{ position: "absolute", left: q.x, top: q.y - 14, transform: "translateX(-100%)", opacity: o * (Math.abs(p - 1.1) < 1e-6 ? 1 : 0.5), ...mono(24) }}>
        {coma(p)}
      </div>
    );
  });

// ------------------------------------------------------------------ 2. Órdenes: los take profit se amontonan en el redondo
const Ordenes: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0.05, 0], L(t, s, e, 5.0, 4.7), L(t, s, e, 0.25, -0.05) + sacude(t, EV.redondos - 0.05, 0.02), L(t, s, e, 0.08, 0.12), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const tp = muelle(t, EV.redondos - 0.5, 120, 13);
  libro(tr, t, Math.max(tp, 0), 0);
  const pr = proyector(cam);
  const qtp = pr([-0.35 + 0.15 + 1.15 * Math.max(Math.min(tp, 1), 0), Y(1.1), 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {etiquetasLibro(pr, L(t, s, s + 0.4, 0, 1))}
      <Etiqueta t={t} t0={EV.redondos - 0.1} x={Math.min(qtp.x + 16, 1040)} y={qtp.y - 40} size={30} alinea="der">
        TAKE PROFIT
      </Etiqueta>
      <Kicker t={t} t0={s + 0.05} texto="LIBRO DE ÓRDENES" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.redondos - 0.45} texto="se *amontonan*…" size={116} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.redondos - 0.4} texto="…en los *redondos*" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Sígueme a mitad
const Sigueme: React.FC<P> = (p) => <CtaSeguir {...p} lema="QUÉDATE HASTA EL FINAL" />;

// ------------------------------------------------------------------ 4. Estudio: take profit en el redondo y stops justo al otro lado
const Estudio: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0.05, 0], L(t, s, e, 4.9, 4.6), L(t, s, e, -0.05, 0.2) + sacude(t, EV.stops - 0.05, 0.02), L(t, s, e, 0.08, 0.12), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const st = muelle(t, EV.stops - 0.35, 130, 13);
  libro(tr, t, 1, Math.max(Math.min(st, 1.05), 0));
  const pr = proyector(cam);
  const qtp = pr([-0.35 + 0.15 + 1.15, Y(1.1), 0]);
  const qst = pr([-0.35 + 0.15 + 1.0, Y(1.1005), 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {etiquetasLibro(pr, 1)}
      <div style={{ position: "absolute", left: Math.min(qtp.x, 1040), top: qtp.y + 22, transform: "translateX(-100%)", ...mono(26, 0.85) }}>TAKE PROFIT</div>
      <Etiqueta t={t} t0={EV.stops - 0.1} x={Math.min(qst.x, 1040)} y={qst.y - 34} size={30} alinea="der">
        STOPS
      </Etiqueta>
      <Kicker t={t} t0={s + 0.05} texto="C. OSLER · RESERVA FEDERAL DE NUEVA YORK" />
      <Destello t={t} t0={EV.stops - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.recoger - 0.45} texto="órdenes *reales*" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.recoger - 0.4} fin={EV.stops - 0.45} texto="beneficios: *el redondo*" size={86} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.stops - 0.4} texto="stops: *justo detrás*" size={96} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Cadena: frena en el redondo… y si lo rompe, los stops lo aceleran
const Cadena: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, L(t, s, e, 0, 0.12), 0], L(t, s, e, 5.0, 4.5), L(t, s, e, -0.2, 0.15) + sacude(t, EV.cadena - 0.05), L(t, s, e, 0.06, 0.1), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const n = t < EV.rompe - 0.2 ? Math.round(L(t, s, EV.rompe - 0.2, 26, 31, (u) => u)) : Math.round(L(t, EV.rompe - 0.2, EV.cadena + 0.5, 31, CADENA.length, (u) => u));
  velas(tr, CADENA.map(Y), -0.85, 0.8, n, 0.03, 1, 0.025, true);
  niveles(tr, 0, golpe(t, EV.frenar - 0.05));
  // Los stops por encima del redondo saltan uno detrás de otro
  const xs = XV(31, CADENA.length) * 0.97;
  for (let i = 0; i < 8; i++) {
    const p = 1.1002 + i * 0.0003;
    const ti = EV.acelera - 0.3 + i * 0.12;
    const salto = L(t, ti, ti + 0.5, 0, 1, salida);
    tr.push({ t: "e", c: [xs + 0.18, Y(p), 0], r: 0.014 + 0.05 * salto, tipo: salto > 0 ? "aro" : "punto", o: salto > 0 ? 1 - salto : 0.8, luz: salto > 0 ? 1 - salto : 0 });
  }
  const pr = proyector(cam);
  const qr = pr([0.95, Y(1.1), 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: Math.min(qr.x, 1050), top: qr.y + 10, transform: "translateX(-100%)", ...mono(34, 0.8) }}>1,1000</div>
      <Etiqueta t={t} t0={EV.cadena - 0.1} x={pr([xs + 0.18, Y(1.1015), 0]).x + 24} y={pr([xs + 0.18, Y(1.1015), 0]).y} size={30}>
        STOPS EN CADENA
      </Etiqueta>
      <Destello t={t} t0={EV.cadena - 0.05} o={0.18} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.rompe - 0.45} texto="frena en el *redondo*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.rompe - 0.4} texto="si lo rompe, *se acelera*" size={84} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Consejo: no pongas el stop donde lo pone todo el mundo
const Consejo: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 5.0, 4.7), L(t, s, e, 0.15, -0.1) + sacude(t, EV.mundo - 0.05, 0.02), L(t, s, e, 0.08, 0.12), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  niveles(tr, 0, 0.3);
  for (let i = 0; i < 46; i++) {
    const g = muelle(t, s + 0.05 + i * 0.012, 240, 15);
    if (g <= 0) continue;
    tr.push({ t: "e", c: [-0.7 + 1.4 * ruido(i * 2.7), Y(1.1004) + 0.08 * (ruido(i * 5.1) - 0.5), 0.1 * ruido(i * 7.7)], r: 0.02 * Math.min(g, 1.1), tipo: "aro", o: 0.7 });
  }
  const tuyo = muelle(t, EV.mundo - 0.2, 180, 13);
  if (tuyo > 0) tr.push({ t: "e", c: [0.2, Y(1.0975), 0], r: 0.04 * Math.min(tuyo, 1.1), tipo: "punto", o: 1, luz: 1 });
  const pr = proyector(cam);
  const qt = pr([0.2, Y(1.0975), 0]);
  const qm = pr([0, Y(1.1004) + 0.08, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={s + 0.4} x={qm.x} y={qm.y - 40} size={30} o={0.8} alinea="centro">
        LOS STOPS DE TODOS
      </Etiqueta>
      <Etiqueta t={t} t0={EV.mundo - 0.1} x={qt.x} y={qt.y + 50} size={34} alinea="centro">
        EL TUYO, APARTE
      </Etiqueta>
      <div style={{ position: "absolute", left: 0, width: ANCHO, top: pr([0, Y(1.1), 0]).y + 8, display: "flex", justifyContent: "flex-end", paddingRight: 40, boxSizing: "border-box", ...mono(30, 0.7) }}>1,1000</div>
      <Arriba>
        <Titular t={t} t0={s + 0.1} texto="no donde *todos*" size={116} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta al final
const Pregunta: React.FC<P> = (p) => <PreguntaComentarios {...p} lineas={["¿en el redondo", "o *lejos*?"]} kicker="Y TÚ" size={100} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, ordenes: Ordenes, sigueme: Sigueme, estudio: Estudio, cadena: Cadena, consejo: Consejo, pregunta: Pregunta };
export const CLAVES = claves(["1,1000", "frena", "primero", "casualidad", "redondos", "Sígueme", "stop", "Reserva", "confirmó", "stops", "rompe", "acelera", "cadena", "mundo", "lejos"]);

export const Redondos: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/redondos_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />;
