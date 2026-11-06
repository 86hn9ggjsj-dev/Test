// Reel de alcance "¿Doblas la apuesta después de perder?" (~41 s): el ×2, la escalera 10 → 20 → … → 320, la pregunta a
// los espectadores, ocho columnas perdidas (2.550 €) frente a la novena de 2.560 € para ganar 10 €, la racha de 8 que es
// lo normal y la columna gigante que se derrumba (−5.110 €). Tiempos en src/gen/doblar.json (scripts/doblar.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/doblar.json";
import { salida } from "../Premium/ui";
import { Arriba, Etiqueta, euros, L, mono, muelle, Titular } from "../Bot/piezas";
import { caja, Escena, orbita, polvo, proyector, Trazo } from "../Bot/tres";
import { claves, CtaSeguir, Destello, Gigante, golpe, Montaje, P, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const DOBLAR_FPS = datos.fps;
export const DOBLAR_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const APUESTAS = [10, 20, 40, 80, 160, 320, 640, 1280, 2560];
const BASE = -0.8;

const columna = (tr: Trazo[], x: number, h: number, ancho: number, o = 1, luz = 0.25, dash?: string, dy = 0) => {
  for (const [a, b] of caja([x - ancho, BASE + dy, -ancho], [x + ancho, BASE + dy + h, ancho])) tr.push({ t: "l", a, b, w: 1.6, o, luz, dash });
};

// ------------------------------------------------------------------ 1. Hook: ×2 después de perder
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.3, 0], L(t, s, e, 6.6, 6.2), L(t, s, e, -0.3, -0.1), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 1040 });
  const tr: Trazo[] = [...polvo(0.3)];
  for (let k = 0; k < 6; k++) {
    const g = muelle(t, -0.5 + k * 0.12, 200, 14);
    if (g > 0) columna(tr, -0.75 + k * 0.3, (APUESTAS[k] / 320) * 0.9 * Math.min(g, 1.05), 0.09, 0.7, 0.2);
  }
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Gigante t={t} t0={-0.45} texto="×2" top={440} size={240} pie="DESPUÉS DE PERDER" />
      <Arriba>
        <Titular t={t} t0={-0.6} texto="¿doblas tras *perder*?" size={96} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Escalera: 10, 20, 40, 80, 160, 320…
const Escalera: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.15, 0], L(t, s, e, 6.6, 6.2), L(t, s, e, -0.3, 0.05), L(t, s, e, 0.12, 0.18), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const tiempos = [EV.diez, EV.veinte, EV.cuarenta, EV.ochenta, EV.c160, EV.c320];
  tr.push({ t: "l", a: [-1.0, BASE, 0], b: [1.0, BASE, 0], w: 1.2, o: 0.5 });
  const pr = proyector(cam);
  const etiquetas: React.ReactNode[] = [];
  for (let k = 0; k < 6; k++) {
    const g = muelle(t, tiempos[k] - 0.15, 200, 14);
    if (g <= 0) continue;
    const perdida = k < 5 && t >= tiempos[k + 1] - 0.15;
    const h = (APUESTAS[k] / 320) * 1.3 * Math.min(g, 1.05);
    const x = -0.75 + k * 0.3;
    columna(tr, x, Math.max(h, 0.02), 0.1, perdida ? 0.55 : 1, perdida ? 0 : 0.5, perdida ? "4 4" : undefined);
    const q = pr([x, BASE + h, 0.1]);
    etiquetas.push(
      <div key={k} style={{ position: "absolute", left: q.x, top: q.y - 54, transform: "translateX(-50%)", opacity: Math.min(g * 1.5, 1) * (perdida ? 0.6 : 1), ...mono(perdida ? 28 : 38) }}>
        {`${APUESTAS[k]} €`}
      </div>,
    );
  }
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {etiquetas}
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.veinte - 0.4} texto="empiezas con *10 €*" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.veinte - 0.35} texto="pierdes y *doblas*" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Pregunta a los espectadores
const Pregunta: React.FC<P> = (p) => <PreguntaComentarios {...p} lineas={["¿te ha pasado", "*alguna vez*?"]} pie="DÍMELO EN COMENTARIOS" />;

// ------------------------------------------------------------------ 4. Cuenta: 2.550 € perdidos, 2.560 € en juego para ganar 10 €
const XC = (k: number) => -0.85 + k * 0.2125;
const ALTO = (v: number) => (v / 2560) * 1.8;
const Cuenta: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0.05, 0], L(t, s, e, 7.4, 7.0), L(t, s, e, -0.2, 0.05) + sacude(t, EV.r2560 - 0.05), L(t, s, e, 0.1, 0.16), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  tr.push({ t: "l", a: [-1.05, BASE, 0], b: [1.05, BASE, 0], w: 1.2, o: 0.5 });
  for (let k = 0; k < 8; k++) {
    const g = muelle(t, s + 0.05 + k * 0.08, 220, 15);
    if (g > 0) columna(tr, XC(k), Math.max(ALTO(APUESTAS[k]), 0.015) * Math.min(g, 1.05), 0.075, 0.6, 0, "4 4");
  }
  const g9 = muelle(t, EV.r2560 - 0.35, 150, 13);
  if (g9 > 0) columna(tr, XC(8), ALTO(2560) * Math.min(g9, 1.05), 0.075, 1, 0.6);
  const llave = muelle(t, EV.r2550 - 0.15, 200, 16);
  const yL = BASE + ALTO(1280) + 0.12;
  if (llave > 0) tr.push({ t: "p", pts: [[XC(0) - 0.08, yL - 0.06, 0], [XC(0) - 0.08, yL, 0], [XC(7) + 0.08, yL, 0], [XC(7) + 0.08, yL - 0.06, 0]], w: 1.6, o: 1, luz: 0.3, prog: Math.min(llave, 1) });
  const pr = proyector(cam);
  const qL = pr([(XC(0) + XC(7)) / 2, yL, 0]);
  const q9 = pr([XC(8), BASE + ALTO(2560) * Math.max(Math.min(g9, 1), 0), 0.075]);
  const k = golpe(t, EV.r2560 - 0.05);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.r2550 - 0.1} x={qL.x} y={qL.y - 40} size={48} alinea="centro">
        −2.550 €
      </Etiqueta>
      {g9 > 0 && <div style={{ position: "absolute", left: Math.min(q9.x, 900), top: q9.y - 70, transform: `translateX(-50%) scale(${1 + 0.25 * k})`, ...mono(52) }}>2.560 €</div>}
      <Destello t={t} t0={EV.r2560 - 0.05} o={0.2} />
      <Destello t={t} t0={EV.diez2 - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.r2560 - 0.4} texto="has perdido *2.550 €*" size={92} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.r2560 - 0.35} fin={EV.ganar - 0.35} texto="arriesgas *2.560 €*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.ganar - 0.3} texto="para ganar *10 €*" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: 8 pérdidas seguidas es lo normal
const PATRON = [true, false, true, false, false, false, false, false, false, false, false, true, true, false, true];
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.3, 0], L(t, s, e, 6.4, 6.0), L(t, s, e, -0.25, -0.05) + sacude(t, EV.normal - 0.05), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 1040 });
  const tr: Trazo[] = [...polvo(0.3)];
  const marca = muelle(t, EV.normal - 0.15, 200, 14);
  const y = -0.4;
  const X = (i: number) => -0.98 + i * 0.14;
  for (let i = 0; i < PATRON.length; i++) {
    const g = muelle(t, s + 0.05 + i * 0.05, 220, 15);
    if (g <= 0) continue;
    const enRacha = i >= 3 && i <= 10;
    const r = 0.05 * Math.min(g, 1.1);
    for (const [a, b] of caja([X(i) - r, y - r, -r], [X(i) + r, y + r, r])) tr.push({ t: "l", a, b, w: 1.5, o: PATRON[i] ? 1 : 0.55 + 0.45 * Math.min(Math.max(marca, 0), 1) * (enRacha ? 1 : 0), dash: PATRON[i] ? undefined : "3 3", luz: PATRON[i] ? 0.2 : enRacha ? 0.6 * Math.max(Math.min(marca, 1), 0) : 0 });
  }
  if (marca > 0) tr.push({ t: "p", pts: [[X(3) - 0.07, y + 0.14, 0], [X(3) - 0.07, y + 0.2, 0], [X(10) + 0.07, y + 0.2, 0], [X(10) + 0.07, y + 0.14, 0]], w: 1.8, o: 1, luz: 0.4, prog: Math.min(marca, 1) });
  const pr = proyector(cam);
  const qB = pr([(X(3) + X(10)) / 2, y + 0.2, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {PATRON.map((gana, i) => {
        const q = pr([X(i), y + 0.08, 0]);
        return (
          <div key={i} style={{ position: "absolute", left: q.x, top: q.y - 40, transform: "translateX(-50%)", opacity: L(t, s + 0.1 + i * 0.05, s + 0.4 + i * 0.05, 0, 0.85), ...mono(26) }}>
            {gana ? "✓" : "✕"}
          </div>
        );
      })}
      <Etiqueta t={t} t0={EV.normal - 0.1} x={qB.x} y={qB.y - 70} size={40} alinea="centro">
        8 SEGUIDAS
      </Etiqueta>
      <Gigante t={t} t0={EV.c55 - 0.12} texto="55 %" top={440} size={220} pie="DE ACIERTOS · 1.000 OPERACIONES" />
      <Destello t={t} t0={EV.normal - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.c55 - 0.4} texto="no es *mala suerte*" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.c55 - 0.35} texto="es lo *normal*" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Cierre: doblar no recupera nada; la columna gigante se derrumba
const Cierre: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0.05, 0], L(t, s, e, 7.4, 7.0), L(t, s, e, 0.05, -0.15) + sacude(t, EV.llega - 0.05), L(t, s, e, 0.1, 0.16), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  tr.push({ t: "l", a: [-1.05, BASE, 0], b: [1.05, BASE, 0], w: 1.2, o: 0.5 });
  for (let k = 0; k < 8; k++) columna(tr, XC(k), Math.max(ALTO(APUESTAS[k]), 0.015), 0.075, 0.6, 0, "4 4");
  const cae = L(t, EV.llega - 0.25, EV.llega + 0.6, 0, 1, (u) => u * u);
  columna(tr, XC(8), ALTO(2560) * (1 - 0.85 * cae), 0.075, 1 - 0.4 * cae, 0.6 * (1 - cae), cae > 0 ? "4 4" : undefined);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Gigante t={t} t0={EV.llega - 0.15} texto={`−${euros(5110)} €`} top={440} size={150} pie="SI LA NOVENA TAMBIÉN SALE MAL" />
      <Destello t={t} t0={EV.llega - 0.05} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.grande - 0.4} texto="no *recupera* nada" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.grande - 0.35} texto="agranda la *pérdida*" size={96} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 7. CTA
const Cta: React.FC<P> = (p) => <CtaSeguir {...p} lema="MÁS CUENTAS QUE NADIE TE HACE" />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, escalera: Escalera, pregunta: Pregunta, cuenta: Cuenta, giro: Giro, cierre: Cierre, cta: Cta };
export const CLAVES = claves(["Doblas", "perder", "10", "20", "40", "320", "comentarios", "8", "2.550", "2.560", "ganar", "suerte", "55%", "normal", "recupera", "pérdida", "sígueme"]);

export const Doblar: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/doblar_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
