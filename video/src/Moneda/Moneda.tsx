// Reel de alcance "¿Tu estrategia acierta el 60 %? Una moneda también" (~40 s): una moneda de alambre que gira, la
// pregunta a los espectadores, cuatro tandas de 20 tiradas (una saca 12 caras), 200 tiradas que se quedan en el 52 % y
// la barra de operaciones de 0 a 200. Tiempos en src/gen/moneda.json (scripts/moneda.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/moneda.json";
import { salida } from "../Premium/ui";
import { ANCHO } from "../Viral/util";
import { Arriba, Etiqueta, L, mono, muelle, Titular } from "../Bot/piezas";
import { caja, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { claves, CtaSeguir, Destello, Gigante, golpe, Kicker, Montaje, P, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const MONEDA_FPS = datos.fps;
export const MONEDA_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;

// Tiradas de ejemplo: cuatro tandas de 20 (9, 12, 10 y 8 caras) y una de 200 (104 caras)
const TANDAS = ["00111001100011100010", "01111100011110101010", "00001001011101100111", "01110001010011010000"];
const DOSCIENTAS =
  "11110101000001011010000101101001110101001010111110111101010100010101001100101111100010100011100111111000101110000100000111111001100010110011010000110001001111111110101100001001100000111010110111100110";

const cuadro = (tr: Trazo[], x: number, y: number, r: number, o: number, luz = 0, dash?: string) => {
  tr.push({ t: "p", pts: [[x - r, y - r, 0], [x + r, y - r, 0], [x + r, y + r, 0], [x - r, y + r, 0], [x - r, y - r, 0]], w: 1.2, o, luz, dash });
};

// ------------------------------------------------------------------ 1. Hook: ¿aciertas el 60 %? una moneda también
const aro = (c: V3, r: number, fi: number, desfase: number): V3[] =>
  Array.from({ length: 65 }, (_, i) => {
    const a = (i / 64) * Math.PI * 2;
    const n: V3 = [0, -Math.sin(fi), Math.cos(fi)];
    return [c[0] + r * Math.cos(a) + n[0] * desfase, c[1] + r * Math.sin(a) * Math.cos(fi) + n[1] * desfase, c[2] + r * Math.sin(a) * Math.sin(fi) + n[2] * desfase];
  });
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.35, 0], L(t, s, e, 6.2, 5.8), L(t, s, e, -0.2, 0.15) + sacude(t, EV.moneda - 0.05), L(t, s, e, 0.1, 0.16), { apertura: 35, centroY: 1080 });
  const tr: Trazo[] = [...polvo(0.3)];
  const g = muelle(t, -0.5, 150, 14);
  const fi = t * 5.5;
  const c: V3 = [0, -0.35, 0];
  const r = 0.55 * Math.min(g, 1.05);
  const luz = 0.3 + 0.6 * golpe(t, EV.moneda - 0.05);
  tr.push({ t: "p", pts: aro(c, r, fi, 0.03), w: 2.2, o: 1, luz });
  tr.push({ t: "p", pts: aro(c, r, fi, -0.03), w: 1.4, o: 0.7, luz });
  tr.push({ t: "p", pts: aro(c, r * 0.8, fi, 0.03), w: 1, o: 0.6 });
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Gigante t={t} t0={-0.45} texto="60 %" top={440} size={220} pie="DE ACIERTOS" />
      <Destello t={t} t0={EV.moneda - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={-0.6} fin={EV.moneda - 0.4} texto="¿aciertas el *60 %*?" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.moneda - 0.35} texto="una *moneda* también" size={96} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Pregunta a los espectadores
const Pregunta: React.FC<P> = (p) => <PreguntaComentarios {...p} lineas={["¿cuántas operaciones", "*llevas*?"]} size={84} />;

// ------------------------------------------------------------------ 3. Veinte: cuatro tandas de 20, una saca 12 caras
const XV = (j: number) => -0.95 + j * 0.08;
const YV = (f: number) => 0.3 - f * 0.22;
const Veinte: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 6.2, 5.9), L(t, s, e, -0.15, 0.1) + sacude(t, EV.nada - 0.05, 0.02), L(t, s, e, 0.08, 0.12), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const elige = muelle(t, EV.uno - 0.15, 200, 15);
  const el = Math.max(Math.min(elige, 1), 0);
  for (let f = 0; f < 4; f++) {
    const t0 = EV.lanza + 0.1 + f * ((EV.uno - EV.lanza - 0.4) / 4);
    for (let j = 0; j < 20; j++) {
      const g = muelle(t, t0 + j * 0.03, 240, 15);
      if (g <= 0) continue;
      const cara = TANDAS[f][j] === "1";
      const foco = f === 1 ? 1 : 1 - 0.6 * el;
      cuadro(tr, XV(j), YV(f), 0.028 * Math.min(g, 1.1), (cara ? 1 : 0.45) * foco, cara && f === 1 ? 0.2 + 0.6 * el : cara ? 0.15 : 0, cara ? undefined : "2 3");
    }
  }
  const pr = proyector(cam);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {TANDAS.map((p, f) => {
        const caras = p.split("").filter((c) => c === "1").length;
        const q = pr([XV(19) + 0.08, YV(f), 0]);
        const t0 = EV.lanza + 0.1 + f * ((EV.uno - EV.lanza - 0.4) / 4) + 0.6;
        return (
          <div key={f} style={{ position: "absolute", left: q.x, top: q.y - 20, opacity: L(t, t0, t0 + 0.2, 0, 1) * (f === 1 ? 1 : 1 - 0.6 * el), ...mono(f === 1 ? 36 : 30) }}>
            {`${caras}/20`}
          </div>
        );
      })}
      <Etiqueta t={t} t0={EV.sesenta2 - 0.1} x={540} y={pr([0, YV(3) - 0.2, 0]).y} size={40} alinea="centro">
        12 CARAS = 60 %
      </Etiqueta>
      <div style={{ position: "absolute", top: 1250, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 30, opacity: L(t, s + 0.3, s + 0.6, 0, 1, salida) * (1 - L(t, EV.sesenta2 - 0.3, EV.sesenta2 - 0.1, 0, 1)) }}>
        <span style={mono(28, 0.8)}>▢ CARA</span>
        <span style={mono(28, 0.5)}>┄ CRUZ</span>
      </div>
      <Destello t={t} t0={EV.nada - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.uno - 0.4} texto="*20* tiradas" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.uno - 0.35} fin={EV.nada - 0.6} texto="*1* de cada *4*" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.nada - 0.55} texto="no demuestra *nada*" size={96} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. Doscientas: se quedan en el 52 %; un 60 % pasa 3 de cada mil
const Doscientas: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.4, 0], L(t, s, e, 6.4, 6.0), L(t, s, e, -0.15, 0.1) + sacude(t, EV.tres - 0.05), L(t, s, e, 0.08, 0.12), { apertura: 35, centroY: 1080 });
  const tr: Trazo[] = [...polvo(0.3)];
  const n = Math.floor(L(t, EV.ahora - 0.1, EV.sesenta3 - 0.2, 0, 200, (u) => u));
  for (let i = 0; i < n; i++) {
    const cara = DOSCIENTAS[i] === "1";
    cuadro(tr, -0.95 + (i % 20) * 0.1, -0.05 - Math.floor(i / 20) * 0.075, 0.025, cara ? 1 : 0.4, cara ? 0.15 : 0, cara ? undefined : "2 3");
  }
  const caras = DOSCIENTAS.slice(0, n).split("").filter((c) => c === "1").length;
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", top: 1290, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 16, alignItems: "baseline", opacity: n > 0 ? 1 : 0 }}>
        <span style={mono(60)}>{`${caras}/${n}`}</span>
        <span style={mono(30, 0.7)}>{n ? `${Math.round((100 * caras) / n)} % CARAS` : ""}</span>
      </div>
      <Gigante t={t} t0={EV.tres - 0.12} texto="3 / 1.000" top={440} size={150} pie="UN 60 % POR SUERTE" />
      <Destello t={t} t0={EV.tres - 0.05} o={0.18} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.tres - 0.4} texto="*200* tiradas" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.tres - 0.35} texto="*3* de cada *mil*" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: ni por una mala semana ni por una buena; primero, 200
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 6.4, 6.0), L(t, s, e, -0.2, 0.1) + sacude(t, EV.primero - 0.05, 0.02), L(t, s, e, 0.12, 0.18), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.3)];
  const X0 = -0.9;
  const X1 = 0.9;
  const XN = (n: number) => X0 + ((X1 - X0) * n) / 200;
  const g = muelle(t, s + 0.05, 170, 15);
  for (const [a, b] of caja([X0, -0.08, -0.08], [X0 + (X1 - X0) * Math.min(g, 1), 0.08, 0.08])) tr.push({ t: "l", a, b, w: 1.4, o: 0.7 });
  const n = Math.round(L(t, EV.primero - 0.2, EV.hablamos, 20, 200, salida));
  for (const [a, b] of caja([X0, -0.08, -0.08], [XN(n), 0.08, 0.08])) tr.push({ t: "l", a, b, w: 2, o: 1, luz: 0.5 });
  for (const m of [20, 200]) tr.push({ t: "l", a: [XN(m), -0.18, 0], b: [XN(m), 0.18, 0], w: 1.6, o: 0.9, dash: m === 20 ? "4 4" : undefined });
  const pr = proyector(cam);
  const q20 = pr([XN(20), -0.2, 0]);
  const q200 = pr([XN(200), -0.2, 0]);
  const k = golpe(t, EV.hablamos - 0.05);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", left: q20.x, top: q20.y + 20, transform: "translateX(-30%)", textAlign: "center", ...mono(26, 0.7) }}>
        20
        <br />
        NADA
      </div>
      <div style={{ position: "absolute", left: q200.x, top: q200.y + 20, transform: "translateX(-80%)", textAlign: "center", opacity: L(t, EV.primero, EV.primero + 0.3, 0.4, 1), ...mono(26) }}>
        200
        <br />
        AHORA SÍ
      </div>
      <div style={{ position: "absolute", top: 1250, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 16, alignItems: "baseline" }}>
        <span style={{ ...mono(80), display: "inline-block", transform: `scale(${1 + 0.2 * k})` }}>{n}</span>
        <span style={mono(26, 0.6)}>OPERACIONES</span>
      </div>
      <Kicker t={t} t0={s + 0.05} texto="ANTES DE CAMBIAR NADA" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.buena - 0.35} texto="ni por una *mala*…" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.buena - 0.3} fin={EV.primero - 0.35} texto="…ni por una *buena*" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.primero - 0.3} texto="primero, *200*" size={116} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. CTA
const Cta: React.FC<P> = (p) => <CtaSeguir {...p} lema="MÁS CUENTAS QUE NADIE TE HACE" />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, pregunta: Pregunta, veinte: Veinte, doscientas: Doscientas, giro: Giro, cta: Cta };
export const CLAVES = claves(["60%", "moneda", "comentarios", "20", "1", "4", "12", "nada", "200", "3", "mil", "mala", "buena", "sígueme"]);

export const Moneda: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/moneda_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
