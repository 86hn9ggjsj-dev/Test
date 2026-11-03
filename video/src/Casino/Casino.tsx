// Reel de alcance "¿Por qué el casino nunca pierde?" (~38 s): una ruleta de alambre con sus 37 casillas (18 rojas, 18
// negras y el cero, que es la ventaja del 2,7 %), el «sígueme» a mitad, el saldo del casino que cae muchas veces pero
// sube, con su tope de apuesta, la lección (ventaja pequeña · muchas veces · apuesta controlada) y la pregunta final.
// Tiempos en src/gen/casino.json (scripts/casino.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/casino.json";
import { salida } from "../Premium/ui";
import { ANCHO } from "../Viral/util";
import { Arriba, Etiqueta, euros, L, mono, muelle, Titular } from "../Bot/piezas";
import { circulo, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { claves, CtaSeguir, Destello, golpe, Kicker, Montaje, P, paseo, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const CASINO_FPS = datos.fps;
export const CASINO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;

// Ruleta europea vista desde arriba (plano y): el cero, luego rojas y negras alternas
const ruleta = (tr: Trazo[], giro: number, rojas: number, cero: number, g = 1) => {
  const R = 0.95 * g;
  tr.push({ t: "p", pts: circulo([0, 0, 0], R, "y", 90), w: 2, o: 1, luz: 0.15 });
  tr.push({ t: "p", pts: circulo([0, 0, 0], R * 0.72, "y", 70), w: 1.2, o: 0.7 });
  tr.push({ t: "p", pts: circulo([0, 0, 0], R * 0.25, "y", 40), w: 1.2, o: 0.7 });
  for (let i = 0; i < 37; i++) {
    const a0 = giro + (i / 37) * Math.PI * 2;
    const a1 = giro + ((i + 1) / 37) * Math.PI * 2;
    tr.push({ t: "l", a: [Math.cos(a0) * R * 0.72, 0, Math.sin(a0) * R * 0.72], b: [Math.cos(a0) * R, 0, Math.sin(a0) * R], w: 1, o: 0.6 });
    const arco: V3[] = Array.from({ length: 5 }, (_, k) => {
      const a = a0 + ((a1 - a0) * (k + 0.5)) / 5.5;
      return [Math.cos(a) * R * 0.86, 0, Math.sin(a) * R * 0.86];
    });
    const esCero = i === 0;
    const roja = !esCero && i % 2 === 1;
    if (esCero) tr.push({ t: "p", pts: arco, w: 5, o: 1, luz: cero });
    else if (roja) tr.push({ t: "p", pts: arco, w: 4, o: 0.4 + 0.6 * rojas, luz: 0.5 * rojas });
    else tr.push({ t: "p", pts: arco, w: 2, o: 0.35, dash: "3 3" });
  }
};

// ------------------------------------------------------------------ 1. Hook: la ruleta gira
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 6.6, 6.2), L(t, s, e, -0.3, 0.1), L(t, s, e, 0.7, 0.8) + sacude(t, EV.suerte - 0.05, 0.02), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  ruleta(tr, t * 1.6, 0, 0.3, Math.min(muelle(t, -0.6, 150, 15), 1.05));
  const ab = -t * 4.2;
  tr.push({ t: "e", c: [Math.cos(ab) * 0.82, 0.05, Math.sin(ab) * 0.82], r: 0.04, tipo: "punto", o: 1, luz: 1 });
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Arriba>
        <Titular t={t} t0={-0.6} fin={EV.suerte - 0.4} texto="¿por qué *nunca* pierde?" size={92} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.suerte - 0.35} texto="no es *suerte*" size={120} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Ruleta: 37 casillas; 18 rojas; el cero es la ventaja
const Ruleta: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 6.4, 6.1), L(t, s, e, -0.1, 0.15) + sacude(t, EV.dos7 - 0.05, 0.02), L(t, s, e, 1.0, 1.1), { apertura: 35, centroY: 940 });
  const tr: Trazo[] = [...polvo(0.3)];
  const giro = 0.4 + (t - s) * 0.05;
  ruleta(tr, giro, L(t, EV.rojo - 0.2, EV.rojo + 0.2, 0, 1), 0.3 + 0.7 * L(t, EV.dos7 - 0.3, EV.dos7, 0, 1));
  const pr = proyector(cam);
  const a = giro + (0.5 / 37) * Math.PI * 2;
  const q0 = pr([Math.cos(a) * 1.05, 0, Math.sin(a) * 1.05]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.dos7 - 0.1} x={Math.min(Math.max(q0.x, 120), 960)} y={q0.y + (q0.y > 940 ? 40 : -40)} size={34} alinea="centro">
        EL CERO
      </Etiqueta>
      <div style={{ position: "absolute", top: 470, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 30, opacity: L(t, EV.dieciocho - 0.2, EV.dieciocho + 0.1, 0, 1) }}>
        <span style={mono(40)}>ROJO 18/37</span>
        <span style={mono(40, 0.6)}>{`= ${(1800 / 37).toFixed(1).replace(".", ",")} %`}</span>
      </div>
      <Destello t={t} t0={EV.dos7 - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.dieciocho - 0.4} texto="*37* casillas" size={120} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.dieciocho - 0.35} fin={EV.dos7 - 0.4} texto="ganas *18* de 37" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.dos7 - 0.35} texto="ventaja: *2,7 %*" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Sígueme a mitad
const Sigueme: React.FC<P> = (p) => <CtaSeguir {...p} lema="SI TE ESTÁ SIRVIENDO" />;

// ------------------------------------------------------------------ 4. Giro: pierde muchas jugadas, pero se queda 2,70 de cada 100; y limita la apuesta
const SALDO = paseo(240, 7, 0.9, 0.12);
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 6.2, 5.8), L(t, s, e, -0.2, 0.1) + sacude(t, EV.r270 - 0.05, 0.02), L(t, s, e, 0.08, 0.12), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const lo = Math.min(...SALDO);
  const hi = Math.max(...SALDO);
  const pts: V3[] = SALDO.map((v, i) => [-0.9 + (1.8 * i) / (SALDO.length - 1), -0.5 + ((v - lo) / (hi - lo)) * 1.0, 0]);
  tr.push({ t: "l", a: [-0.95, pts[0][1], 0], b: [0.95, pts[0][1], 0], w: 1, o: 0.4, dash: "5 6" });
  tr.push({ t: "p", pts, w: 2.2, o: 1, luz: 0.4, prog: L(t, s + 0.1, EV.millones + 0.5, 0.05, 1, (u) => u) });
  const tope = muelle(t, EV.limita - 0.15, 180, 15);
  const jug = Math.round(L(t, s + 0.1, EV.millones + 0.6, 0, 1000000, (u) => u * u * u));
  const k = golpe(t, EV.r270 - 0.05);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Kicker t={t} t0={s + 0.05} texto="SALDO DEL CASINO" />
      <div style={{ position: "absolute", top: 1240, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 16, alignItems: "baseline", opacity: 1 - L(t, EV.limita - 0.3, EV.limita - 0.1, 0, 1) }}>
        <span style={{ ...mono(70), display: "inline-block", transform: `scale(${1 + 0.2 * k})` }}>{t < EV.cien - 0.1 ? euros(jug) : "+2,70 €"}</span>
        <span style={mono(26, 0.6)}>{t < EV.cien - 0.1 ? "JUGADAS" : "DE CADA 100 €"}</span>
      </div>
      {tope > 0 && (
        <div style={{ position: "absolute", top: 1200, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: Math.min(tope * 1.5, 1) }}>
          <span style={{ ...mono(38), padding: "12px 26px", border: "2px solid #fff", borderRadius: 14, transform: `scale(${0.8 + 0.2 * Math.min(tope, 1.1)})` }}>APUESTA MÁXIMA DE LA MESA</span>
        </div>
      )}
      <Destello t={t} t0={EV.r270 - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.cien - 0.4} texto="pierde *muchas*" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.cien - 0.35} fin={EV.limita - 0.4} texto="se queda *2,70 €*" size={106} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.limita - 0.35} texto="y *limita* la apuesta" size={96} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Lección: ventaja pequeña · muchas veces · apuesta controlada
const Leccion: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], 9, L(t, s, e, -0.2, 0.2) + sacude(t, EV.operar - 0.05, 0.02), 0.2, { apertura: 40 });
  const filas = ["VENTAJA PEQUEÑA", "MUCHAS VECES", "APUESTA CONTROLADA"];
  const t0s = [EV.pequena - 0.1, EV.pequena + 1.0, EV.pequena + 2.0];
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <div style={{ position: "absolute", top: 560, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        {filas.map((f, i) => {
          const g = muelle(t, t0s[i], 200, 15);
          return (
            <div key={f} style={{ display: "flex", gap: 22, alignItems: "baseline", opacity: Math.min(Math.max(g, 0) * 1.5, 1), transform: `translateY(${(1 - Math.min(Math.max(g, 0), 1)) * 30}px)` }}>
              <span style={mono(40, 0.5)}>{`0${i + 1}`}</span>
              <span style={mono(58)}>{f}</span>
            </div>
          );
        })}
      </div>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.operar - 0.4} texto="como el *casino*" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.operar - 0.35} texto="eso es *operar*" size={116} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Pregunta al final
const Pregunta: React.FC<P> = (p) => <PreguntaComentarios {...p} lineas={["¿casino", "o *jugador*?"]} kicker="Y DIME" size={104} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, ruleta: Ruleta, sigueme: Sigueme, giro: Giro, leccion: Leccion, pregunta: Pregunta };
export const CLAVES = claves(["casino", "suerte", "37", "rojo", "18", "2,7%", "sígueme", "muchísimas", "2,70", "Millones", "limita", "pequeña", "operar", "jugador"]);

export const Casino: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/casino_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
