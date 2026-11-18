// Reel de alcance "¿Por qué el casino nunca pierde?" (~38 s), en blanco y negro: una ruleta con sus casillas rellenas y
// el cero que se enciende, el «sígueme» a mitad, el saldo del casino en verde con su pila de fichas que choca con el tope de
// apuesta, la lección en tres golpes y la pregunta final. Tiempos en src/gen/casino.json (scripts/casino.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/casino.json";
import { salida } from "../Premium/ui";
import { ANCHO } from "../Viral/util";
import { Arriba, Etiqueta, euros, L, mono, muelle, Titular } from "../Bot/piezas";
import { circulo, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { fichas, suelo } from "../Bot/kit";
import { claves, CtaSeguir, Destello, golpe, Kicker, Montaje, P, paseo, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const CASINO_FPS = datos.fps;
export const CASINO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;

// Ruleta europea vista desde arriba (plano y): casillas rellenas de su color, el cero en verde, aros dorados
const ruleta = (tr: Trazo[], giro: number, rojas: number, cero: number, g = 1) => {
  const R = 0.95 * g;
  const arco = (r: number, a0: number, a1: number, n = 4): V3[] => Array.from({ length: n + 1 }, (_, k) => [Math.cos(a0 + ((a1 - a0) * k) / n) * r, 0, Math.sin(a0 + ((a1 - a0) * k) / n) * r]);
  for (let i = 0; i < 37; i++) {
    const a0 = giro + (i / 37) * Math.PI * 2;
    const a1 = giro + ((i + 1) / 37) * Math.PI * 2;
    const pts = [...arco(R, a0, a1), ...arco(R * 0.72, a1, a0)];
    pts.push(pts[0]);
    const esCero = i === 0;
    const roja = !esCero && i % 2 === 1;
    // Rojas: blanco translúcido · negras: casi negro · el cero: blanco que se enciende cuando es la ventaja
    const color = esCero || roja ? "#fff" : "#0d0d0d";
    const oR = esCero ? 0.2 + 0.75 * cero : roja ? 0.1 + 0.32 * rojas : 0.85;
    tr.push({ t: "p", pts, w: 1, o: 0.7, relleno: color, oRelleno: oR, luz: esCero ? 0.9 * cero : roja ? 0.2 * rojas : 0 });
  }
  tr.push({ t: "p", pts: circulo([0, 0, 0], R * 1.06, "y", 90), w: 3, o: 1, color: "#ffffff", luz: 0.3 });
  tr.push({ t: "p", pts: circulo([0, 0, 0], R * 0.72, "y", 70), w: 1.6, o: 0.9, color: "#ffffff" });
  tr.push({ t: "p", pts: circulo([0, 0, 0], R * 0.5, "y", 60), w: 1, o: 0.5, color: "#ffffff" });
  tr.push({ t: "p", pts: circulo([0, 0.06, 0], R * 0.14, "y", 30), w: 2, o: 1, color: "#ffffff", relleno: "#ffffff", oRelleno: 0.25 });
  for (let k = 0; k < 4; k++) {
    const a = giro * 1.3 + (k / 4) * Math.PI * 2;
    tr.push({ t: "l", a: [Math.cos(a) * R * 0.14, 0.06, Math.sin(a) * R * 0.14], b: [Math.cos(a) * R * 0.45, 0.02, Math.sin(a) * R * 0.45], w: 2.4, o: 0.9, color: "#ffffff" });
  }
};
const bola = (tr: Trazo[], ang: number) => {
  for (let k = 5; k >= 0; k--) {
    const a = ang + k * 0.09;
    tr.push({ t: "e", c: [Math.cos(a) * 1.0, 0.05, Math.sin(a) * 1.0], r: 0.04 * (1 - k * 0.12), tipo: "punto", o: k ? 0.5 * (1 - k / 6) : 1, luz: k ? 0 : 1 });
  }
};

// ------------------------------------------------------------------ 1. Hook: la ruleta gira y la bola corre
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 6.0, 5.4), L(t, s, e, -0.4, 0.2), L(t, s, e, 0.62, 0.78) + sacude(t, EV.suerte - 0.05, 0.02), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.25)];
  ruleta(tr, t * 1.4, 0.4, 0.4, Math.min(muelle(t, -0.6, 150, 15), 1.05));
  bola(tr, -t * 4.2);
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
  const cam = orbita([0, 0, 0], L(t, s, e, 5.6, 5.2), L(t, s, e, -0.1, 0.15) + sacude(t, EV.dos7 - 0.05, 0.02), L(t, s, e, 1.05, 1.2), { apertura: 35, centroY: 1000 });
  const tr: Trazo[] = [...polvo(0.25)];
  const giro = 0.4 + (t - s) * 0.05;
  const cero = L(t, EV.dos7 - 0.3, EV.dos7, 0, 1);
  ruleta(tr, giro, L(t, EV.rojo - 0.2, EV.rojo + 0.2, 0, 1) * (1 - 0.6 * cero), cero);
  const pr = proyector(cam);
  const a = giro + (0.5 / 37) * Math.PI * 2;
  const q0 = pr([Math.cos(a) * 1.12, 0, Math.sin(a) * 1.12]);
  const k = golpe(t, EV.dos7 - 0.05);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", top: 470, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 24, opacity: L(t, EV.dieciocho - 0.2, EV.dieciocho + 0.1, 0, 1) * (1 - 0.5 * cero) }}>
        <span style={mono(46)}>ROJO 18/37</span>
        <span style={mono(46, 0.7)}>{`= ${(1800 / 37).toFixed(1).replace(".", ",")} %`}</span>
      </div>
      <div style={{ position: "absolute", left: Math.min(Math.max(q0.x, 170), 910), top: q0.y + (q0.y > 1000 ? 30 : -110), transform: `translateX(-50%) scale(${0.9 + 0.25 * k})`, opacity: cero, textAlign: "center" }}>
        <div style={mono(90)}>0</div>
        <div style={mono(32)}>LA VENTAJA</div>
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

// ------------------------------------------------------------------ 4. Giro: pierde muchas jugadas pero se queda 2,70 de cada 100; y limita la apuesta
const SALDO = paseo(160, 7, 0.9, 0.14);
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.1, 0], L(t, s, e, 6.0, 5.6), L(t, s, e, -0.25, 0.1) + sacude(t, EV.r270 - 0.05, 0.02), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 940 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, -0.75, 0.2);
  const lo = Math.min(...SALDO);
  const hi = Math.max(...SALDO);
  const prog = L(t, s + 0.1, EV.millones + 0.5, 0.05, 1, (u) => u);
  const n = Math.max(2, Math.round(SALDO.length * prog));
  const pts: V3[] = SALDO.slice(0, n).map((v, i) => [-0.82 + (1.2 * i) / (SALDO.length - 1), -0.35 + ((v - lo) / (hi - lo)) * 0.95, 0]);
  tr.push({ t: "p", pts: [...pts, [pts[pts.length - 1][0], -0.75, 0], [pts[0][0], -0.75, 0], pts[0]], w: 0, o: 1, relleno: "#ffffff", oRelleno: 0.1 });
  tr.push({ t: "p", pts, w: 2.4, o: 1, color: "#ffffff", luz: 0.5 });
  tr.push({ t: "e", c: pts[pts.length - 1], r: 0.035, tipo: "punto", o: 1, color: "#ffffff", luz: 1 });
  // Pila de fichas que crece con las jugadas hasta el tope de la mesa
  const nf = Math.min(12, Math.floor(L(t, s + 0.3, EV.limita, 1, 16)));
  fichas(tr, [0.72, -0.75, 0.2], nf, 0.15, 1, true);
  const tope = muelle(t, EV.limita - 0.15, 180, 15);
  if (tope > 0) tr.push({ t: "p", pts: circulo([0.72, -0.75 + 12 * 0.045 + 0.05, 0.2], 0.24 * Math.min(tope, 1.1), "y", 40), w: 2.4, o: 1, color: "#ffffff", dash: "6 4", luz: 0.6 });
  const pr = proyector(cam);
  const qt = pr([0.72, -0.75 + 12 * 0.045 + 0.05, 0.2]);
  const jug = Math.round(L(t, s + 0.1, EV.millones + 0.6, 0, 1000000, (u) => u * u * u));
  const k = golpe(t, EV.r270 - 0.05);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Kicker t={t} t0={s + 0.05} texto="SALDO DEL CASINO" />
      <div style={{ position: "absolute", top: 1240, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 16, alignItems: "baseline" }}>
        <span style={{ ...mono(70), display: "inline-block", transform: `scale(${1 + 0.2 * k})` }}>{t < EV.cien - 0.1 ? euros(jug) : "+2,70 €"}</span>
        <span style={mono(26, 0.6)}>{t < EV.cien - 0.1 ? "JUGADAS" : "DE CADA 100 €"}</span>
      </div>
      <Etiqueta t={t} t0={EV.limita - 0.05} x={Math.min(qt.x, 980)} y={qt.y - 50} size={28} alinea="centro">
        APUESTA MÁXIMA
      </Etiqueta>
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

// ------------------------------------------------------------------ 5. Lección: tres golpes que caen grandes y se colocan en lista
const Leccion: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], 9, L(t, s, e, -0.2, 0.2) + sacude(t, EV.operar - 0.05, 0.02), 0.2, { apertura: 40 });
  const filas: [string, string][] = [
    ["VENTAJA PEQUEÑA", "#ffffff"],
    ["MUCHAS VECES", "#ffffff"],
    ["APUESTA CONTROLADA", "#ffffff"],
  ];
  const t0s = [EV.pequena - 0.1, EV.pequena + 1.0, EV.pequena + 2.0];
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.3)} />
      {filas.map(([f, color], i) => {
        const g = muelle(t, t0s[i], 200, 15);
        if (g <= 0) return null;
        // Cae en grande en el centro y en 0,45 s se coloca en su fila
        const u = L(t, t0s[i] + 0.35, t0s[i] + 0.8, 0, 1, salida);
        const top = 860 - (860 - (560 + i * 120)) * u;
        const size = 96 - 38 * u;
        return (
          <div key={f} style={{ position: "absolute", top, left: 0, width: ANCHO, display: "flex", justifyContent: "center", alignItems: "center", gap: 22, opacity: Math.min(g * 1.5, 1), transform: `scale(${0.7 + 0.3 * Math.min(g, 1.1)})` }}>
            <span style={{ width: size * 0.42, height: size * 0.42, borderRadius: "50%", border: `3px solid ${color}`, background: `${color}33`, boxShadow: `0 0 24px ${color}88` }} />
            <span style={{ ...mono(size), color: u < 1 ? color : "#fff" }}>{f}</span>
          </div>
        );
      })}
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

export const Casino: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/casino_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />
);
