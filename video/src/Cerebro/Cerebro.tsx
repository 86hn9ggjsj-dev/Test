// Reel de alcance "Tu cerebro juega en tu contra cada vez que operas" (~37 s), en blanco y negro: un cerebro de alambre
// recorrido por impulsos, la balanza en la que −100 € pesa el doble que +100 €, el «sígueme» a mitad, la operación que
// gana y se corta pronto frente a la que pierde y se aguanta, las dos columnas del estudio de Odean (+50 %), el
// histograma que se da la vuelta y la pregunta final. Tiempos en src/gen/cerebro.json (scripts/cerebro.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/cerebro.json";
import { salida } from "../Premium/ui";
import { Arriba, Etiqueta, L, mono, muelle, Titular } from "../Bot/piezas";
import { circulo, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { cristal, suelo } from "../Bot/kit";
import { claves, CtaSeguir, Destello, Gigante, golpe, Kicker, Montaje, P, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const CEREBRO_FPS = datos.fps;
export const CEREBRO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;

// ------------------------------------------------------------------ cerebro: dos hemisferios con circunvoluciones
const RX = 0.3;
const RY = 0.42;
const RZ = 0.6;
const anillo = (lado: number, k: number, g = 1): V3[] => {
  const v = -1 + k * 0.25;
  const s = Math.sqrt(1 - v * v);
  return Array.from({ length: 61 }, (_, j) => {
    const a = (j / 60) * Math.PI * 2;
    const w = 1 + 0.08 * Math.sin(a * 7 + k * 1.7 + lado);
    return [(lado * 0.31 + RX * s * Math.cos(a) * w) * g, v * RY * g, RZ * s * Math.sin(a) * w * g];
  });
};
const cerebro = (tr: Trazo[], t: number, g = 1, chispas = 1) => {
  for (const lado of [-1, 1]) {
    for (let k = 1; k < 8; k++) tr.push({ t: "p", pts: anillo(lado, k, g), w: 1.4, o: 0.85 });
    for (let m = 0; m < 5; m++) {
      const b = (m / 5) * Math.PI;
      tr.push({ t: "p", pts: Array.from({ length: 25 }, (_, j) => { const f = (j / 24) * Math.PI; return [(lado * 0.31 + RX * Math.sin(f) * Math.cos(b)) * g, RY * Math.cos(f) * g, RZ * Math.sin(f) * Math.sin(b) * g] as V3; }), w: 0.8, o: 0.35 });
    }
  }
  tr.push({ t: "p", pts: [[0, -0.36 * g, -0.12 * g], [0.02, -0.6 * g, -0.18 * g], [0, -0.78 * g, -0.2 * g]], w: 2.4, o: 0.8 });
  // Impulsos que recorren las circunvoluciones
  for (let i = 0; i < 8; i++) {
    const lado = i % 2 ? 1 : -1;
    const k = 1 + (i % 7);
    const pts = anillo(lado, k, g);
    const u = (t * (0.35 + 0.05 * i) + i * 0.137) % 1;
    const p = pts[Math.floor(u * (pts.length - 1))];
    tr.push({ t: "e", c: p, r: 0.022, tipo: "punto", o: chispas, luz: chispas });
  }
};

// ------------------------------------------------------------------ 1. Hook: tu cerebro juega en tu contra
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 4.4, 3.9), t * 0.35 - 0.6, L(t, s, e, 0.18, 0.28) + sacude(t, EV.demostrar - 0.05, 0.02), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  cerebro(tr, t, Math.min(muelle(t, -0.6, 140, 14), 1.05), 0.6 + 0.4 * golpe(t, EV.demostrar - 0.1));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Destello t={t} t0={EV.demostrar - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={-0.6} fin={EV.demostrar - 0.45} texto="tu cerebro, *en contra*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.demostrar - 0.4} texto="te lo *demuestro*" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Dolor: perder 100 € pesa el doble que ganarlos
const Dolor: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.15, 0], L(t, s, e, 6.2, 5.8), L(t, s, e, 0.3, -0.1) + sacude(t, EV.doble - 0.05), L(t, s, e, 0.12, 0.2), { apertura: 35, centroY: 1080 });
  const tr: Trazo[] = [...polvo(0.3)];
  const th = -0.32 * muelle(t, EV.doble - 0.25, 90, 8);
  const pivote: V3 = [0, 0.25, 0];
  const brazo = (lado: number): V3 => [lado * 0.6 * Math.cos(th), pivote[1] + lado * 0.6 * Math.sin(th), 0];
  const k = muelle(t, s + 0.05, 150, 16);
  tr.push({ t: "l", a: [0, -0.6, 0], b: [0, -0.6 + 0.85 * k, 0], w: 2.4, o: 0.9 });
  tr.push({ t: "p", pts: circulo([0, -0.6, 0], 0.22, "y", 30), w: 1.6, o: 0.7 });
  const plato = (lado: number): V3 => [brazo(lado)[0], brazo(lado)[1] - 0.45, 0];
  if (k > 0.6) {
    tr.push({ t: "l", a: brazo(-1), b: brazo(1), w: 2.6, o: 1 });
    for (const lado of [-1, 1]) {
      const ext = brazo(lado);
      const p = plato(lado);
      for (const d of [-0.2, 0.2]) tr.push({ t: "l", a: ext, b: [p[0] + d, p[1], 0], w: 1, o: 0.6 });
      tr.push({ t: "p", pts: circulo(p, 0.24, "y", 40), w: 1.8, o: 1 });
      const r = 0.12;
      // La alegría es hueca; el dolor, macizo
      cristal(tr, [p[0] - r, p[1], -r], [p[0] + r, p[1] + 2 * r, r], "#fff", 1, lado > 0 ? 0.3 + 0.5 * golpe(t, EV.doble - 0.05) : 0.1, lado > 0 ? 0.55 : 0.04);
    }
  }
  const pr = proyector(cam);
  const etq = (lado: number) => pr([plato(lado)[0], plato(lado)[1], 0.24]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {k > 0.6 && (
        <>
          <Etiqueta t={t} t0={s + 0.3} x={etq(-1).x} y={etq(-1).y + 40} size={36} o={0.8} alinea="centro">
            +100 €
          </Etiqueta>
          <Etiqueta t={t} t0={s + 0.4} x={etq(1).x} y={etq(1).y + 40} size={36} alinea="centro">
            −100 €
          </Etiqueta>
          <Etiqueta t={t} t0={s + 0.5} x={etq(-1).x} y={etq(-1).y + 84} size={22} o={0.6} alinea="centro">
            ALEGRÍA
          </Etiqueta>
          <Etiqueta t={t} t0={s + 0.6} x={etq(1).x} y={etq(1).y + 84} size={22} o={0.9} alinea="centro">
            DOLOR
          </Etiqueta>
        </>
      )}
      <Gigante t={t} t0={EV.doble - 0.12} texto="×2" top={430} size={190} pie="LO QUE DUELE PERDER" />
      <Destello t={t} t0={EV.doble - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.aversion - 0.4} texto="duele *el doble*" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.aversion - 0.35} texto="aversión a la *pérdida*" size={84} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Sígueme a mitad
const Sigueme: React.FC<P> = (p) => <CtaSeguir {...p} lema="Y AHORA VIENE LO BUENO" />;

// ------------------------------------------------------------------ 4. Conducta: la que gana se corta pronto; la que pierde se aguanta
const camino = (x0: number, x1: number, y0: number, pend: number, n: number, semilla: number, hasta = 1): V3[] => {
  const pts: V3[] = [];
  let y = y0;
  for (let i = 0; i <= Math.round(n * hasta); i++) {
    pts.push([x0 + ((x1 - x0) * i) / n, y, 0]);
    y += pend + 0.03 * Math.sin(i * 1.9 + semilla);
  }
  return pts;
};
const Conducta: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.05, 0], L(t, s, e, 5.6, 5.3), L(t, s, e, -0.15, 0.12) + sacude(t, EV.aguantas - 0.05, 0.02), L(t, s, e, 0.08, 0.12), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  for (const [x0, x1] of [[-0.95, -0.1], [0.1, 0.95]]) tr.push({ t: "l", a: [x0, 0, 0], b: [x1, 0, 0], w: 1.2, o: 0.45, dash: "5 6" });
  // Izquierda: gana y la cierras enseguida; lo que habría seguido subiendo, en discontinua
  const corte = 8;
  const gana = camino(-0.95, -0.1, 0, 0.03, 24, 1);
  const pg = L(t, EV.ganas - 0.2, EV.cierras, 0, 1, (u) => u);
  tr.push({ t: "p", pts: gana.slice(0, Math.max(2, Math.round(corte * pg) + 1)), w: 2.6, o: 1, luz: 0.4 });
  const fantasma = L(t, EV.cierras, EV.cierras + 1.2, 0, 1, salida);
  if (fantasma > 0) tr.push({ t: "p", pts: gana.slice(corte), w: 1.4, o: 0.5, dash: "4 5", prog: fantasma });
  if (t >= EV.cierras) tr.push({ t: "e", c: gana[corte], r: 0.04, tipo: "aro", o: 1, luz: 0.8 });
  // Derecha: pierde y la aguantas; la caída sigue
  const pierde = camino(0.1, 0.9, 0, -0.026, 24, 4);
  const pp = L(t, EV.pierdes - 0.2, e, 0, 1, (u) => u);
  if (pp > 0) tr.push({ t: "p", pts: pierde, w: 2.6, o: 1, luz: 0.3, prog: pp });
  const pr = proyector(cam);
  const qc = pr(gana[corte]);
  const qp = pr(pierde[Math.max(0, Math.floor((pierde.length - 1) * pp))]);
  const ql = pr([-0.52, 0.62, 0]);
  const qr = pr([0.52, 0.62, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.ganas - 0.2} x={ql.x} y={ql.y} size={30} o={0.75} alinea="centro">
        GANAS
      </Etiqueta>
      <Etiqueta t={t} t0={EV.pierdes - 0.2} x={qr.x} y={qr.y} size={30} o={0.75} alinea="centro">
        PIERDES
      </Etiqueta>
      <Etiqueta t={t} t0={EV.cierras - 0.05} x={qc.x} y={qc.y - 50} size={34} alinea="centro">
        CIERRAS YA
      </Etiqueta>
      {pp > 0.3 && <div style={{ position: "absolute", left: Math.min(qp.x, 900), top: qp.y + 30, transform: "translateX(-50%)", ...mono(34) }}>AGUANTAS…</div>}
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.pierdes - 0.4} texto="ganas: *cierras ya*" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.pierdes - 0.35} texto="pierdes: *aguantas*" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Estudio: venden lo que gana un 50 % más a menudo
const Estudio: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.2, 0], L(t, s, e, 6.0, 5.6), L(t, s, e, -0.3, 0.1) + sacude(t, EV.cincuenta - 0.05), L(t, s, e, 0.16, 0.22), { apertura: 35, centroY: 1000 });
  const tr: Trazo[] = [...polvo(0.3)];
  suelo(tr, t, -0.8, 0.2);
  const g1 = muelle(t, EV.midio - 0.3, 150, 14);
  const g2 = muelle(t, EV.midio, 150, 14);
  const H = 0.8;
  if (g1 > 0) cristal(tr, [-0.6, -0.8, -0.2], [-0.2, -0.8 + 1.5 * H * Math.min(g1, 1.05), 0.2], "#fff", 1, 0.3 + 0.5 * golpe(t, EV.cincuenta - 0.05), 0.4);
  if (g2 > 0) cristal(tr, [0.2, -0.8, -0.2], [0.6, -0.8 + H * Math.min(g2, 1.05), 0.2], "#fff", 1, 0.1, 0.06);
  const pr = proyector(cam);
  const t1 = pr([-0.4, -0.8 + 1.5 * H, 0.2]);
  const b1 = pr([-0.4, -0.8, 0.2]);
  const b2 = pr([0.4, -0.8, 0.2]);
  const k = golpe(t, EV.cincuenta - 0.05);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Kicker t={t} t0={s + 0.05} texto="ODEAN, 1998 · 10.000 CUENTAS" />
      {t >= EV.cincuenta - 0.15 && <div style={{ position: "absolute", left: t1.x, top: t1.y - 80, transform: `translateX(-50%) scale(${1 + 0.3 * k})`, ...mono(64) }}>+50 %</div>}
      <div style={{ position: "absolute", left: b1.x, top: b1.y + 22, transform: "translateX(-50%)", textAlign: "center", opacity: Math.min(Math.max(g1, 0) * 1.5, 1), ...mono(24, 0.85) }}>
        VENDEN LO
        <br />
        QUE GANA
      </div>
      <div style={{ position: "absolute", left: b2.x, top: b2.y + 22, transform: "translateX(-50%)", textAlign: "center", opacity: Math.min(Math.max(g2, 0) * 1.5, 1), ...mono(24, 0.6) }}>
        VENDEN LO
        <br />
        QUE PIERDE
      </div>
      <Destello t={t} t0={EV.cincuenta - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.cincuenta - 0.4} texto="miles de *inversores*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.cincuenta - 0.35} texto="un *50 %* más" size={116} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: ganancias pequeñas, pérdidas grandes… al revés
const BARRAS = [0.14, 0.12, 0.16, -0.62, 0.13, 0.15, 0.11, -0.7, 0.14, 0.12];
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.05, 0], L(t, s, e, 5.8, 5.4), L(t, s, e, -0.25, 0.15) + sacude(t, EV.reves - 0.05), L(t, s, e, 0.12, 0.18), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  tr.push({ t: "l", a: [-1.0, 0, 0], b: [1.0, 0, 0], w: 1.4, o: 0.7 });
  const flip = L(t, EV.reves - 0.25, EV.reves + 0.35, 1, -1, salida);
  BARRAS.forEach((h, i) => {
    const g = muelle(t, s + 0.05 + i * 0.05, 220, 15);
    if (g <= 0) return;
    const x = -0.85 + i * 0.19;
    const hh = h * flip * Math.min(g, 1.05);
    const grande = Math.abs(h) > 0.3;
    cristal(tr, [x - 0.06, Math.min(0, hh), -0.06], [x + 0.06, Math.max(0, hh) + 0.001, 0.06], "#fff", 1, grande ? 0.3 : 0.1, hh > 0 ? 0.45 : 0.04);
  });
  const pr = proyector(cam);
  const arriba = pr([0.75, 0.75, 0]);
  const abajo = pr([0.75, -0.75, 0]);
  const fase = t >= EV.reves - 0.1;
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: Math.min(arriba.x, 960), top: arriba.y - 20, transform: "translateX(-60%)", ...mono(26, 0.8) }}>{fase ? "GANANCIAS GRANDES" : "GANANCIAS PEQUEÑAS"}</div>
      <div style={{ position: "absolute", left: Math.min(abajo.x, 960), top: abajo.y, transform: "translateX(-60%)", ...mono(26, 0.8) }}>{fase ? "PÉRDIDAS PEQUEÑAS" : "PÉRDIDAS GRANDES"}</div>
      <Kicker t={t} t0={EV.reves - 0.1} texto="LO QUE FUNCIONA" />
      <Destello t={t} t0={EV.reves - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.grandes - 0.4} texto="ganancias *pequeñas*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.grandes - 0.35} fin={EV.reves - 0.4} texto="pérdidas *grandes*" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.reves - 0.35} texto="justo *al revés*" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta al final
const Pregunta: React.FC<P> = (p) => <PreguntaComentarios {...p} lineas={["¿cuál cerraste", "*demasiado pronto*?"]} kicker="CUÉNTAME" size={84} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, dolor: Dolor, sigueme: Sigueme, conducta: Conducta, estudio: Estudio, giro: Giro, pregunta: Pregunta };
export const CLAVES = claves(["cerebro", "contra", "demostrar", "100", "doble", "aversión", "Sígueme", "cierras", "aguantas", "50%", "pequeñas", "grandes", "revés", "pronto"]);

export const Cerebro: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/cerebro_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />;
