// Reel de alcance "Una rentabilidad media del 10 % al año que te hace perder dinero" (~40 s): el +10 % de media que se
// tacha, tres columnas 1.000 → 1.600 → 960, la cuenta de la media frente al −40 € real, SUMA contra MULTIPLICA con una
// balanza que se vence hacia la caída y la curva de una cuenta con su caída máxima. Tiempos en src/gen/media.json
// (scripts/media.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/media.json";
import { salida } from "../Premium/ui";
import { ANCHO } from "../Viral/util";
import { Arriba, Etiqueta, euros, L, mono, muelle, Titular } from "../Bot/piezas";
import { caja, circulo, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { Abajo, claves, CtaSeguir, cuando, Destello, Gigante, golpe, Montaje, P, sacude } from "../Explica/Montaje";

export const MEDIA_FPS = datos.fps;
export const MEDIA_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const en = cuando(datos);

const bloque = (tr: Trazo[], x: number, y0: number, y1: number, r: number, o = 1, luz = 0.2, dash?: string) => {
  for (const [a, b] of caja([x - r, y0, -r], [x + r, y1, r])) tr.push({ t: "l", a, b, w: 1.8, o, luz, dash });
};

// ------------------------------------------------------------------ 1. Hook: +10 % de media… y has perdido dinero
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 7.4, 6.8), L(t, s, e, -0.3, -0.1) + sacude(t, EV.dinero), L(t, s, e, 0.12, 0.18), { apertura: 35, centroY: 1050 });
  const tr: Trazo[] = [...polvo(0.3)];
  // Sube un 60 % y cae un 40 %: acaba por debajo de donde empezó
  tr.push({ t: "l", a: [-1.05, -0.2, 0], b: [1.05, -0.2, 0], w: 1.2, o: 0.5, dash: "6 8" });
  const prog = L(t, -0.3, EV.perder, 0, 1, (u) => u);
  tr.push({ t: "p", pts: [[-0.9, -0.2, 0], [0, 0.35, 0], [0.9, -0.25, 0]], w: 2.6, o: 1, luz: 0.4, prog });
  if (prog >= 1) tr.push({ t: "e", c: [0.9, -0.25, 0], r: 0.05, tipo: "punto", o: 1, luz: 1 });
  const k = golpe(t, EV.dinero - 0.1);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Gigante t={t} t0={-0.45} texto="+10 %" top={500} size={210} pie="DE MEDIA AL AÑO" tacha={EV.perder - 0.1} />
      <Abajo top={1250} o={t >= EV.perder - 0.2 ? 1 : 0}>
        <span style={mono(26, 0.6)}>TU DINERO</span>
        <span style={{ ...mono(100), display: "inline-block", transform: `scale(${1 + 0.3 * k})` }}>−40 €</span>
      </Abajo>
      <Destello t={t} t0={EV.dinero - 0.1} />
      <Arriba>
        <Titular t={t} t0={-0.6} fin={EV.perder - 0.4} texto="media del *10 %*" size={104} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.perder - 0.35} texto="y *pierdes* dinero" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Cuenta: 1.000 → +60 % → 1.600 → −40 % → 960
const BASE = -0.8;
const ALT = (v: number) => (v / 1000) * 0.9;
const XC = [-0.75, 0, 0.75];
const Cuenta: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.1, 0], L(t, s, e, 7.2, 6.9), L(t, s, e, 0.3, 0.05) + sacude(t, EV.novecientos), L(t, s, e, 0.12, 0.2), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.3)];
  tr.push({ t: "l", a: [-1.15, BASE, 0], b: [1.15, BASE, 0], w: 1.4, o: 0.6 });
  const g0 = muelle(t, EV.mil - 0.15, 170, 15);
  const g1 = muelle(t, EV.sesenta - 0.25, 200, 15);
  const g2 = muelle(t, EV.cae - 0.2, 200, 15);
  const v1 = L(t, EV.sesenta, EV.milseis, 1000, 1600, salida);
  const v2 = t < EV.cuarenta ? 1600 : L(t, EV.cuarenta, EV.novecientos - 0.1, 1600, 960, salida);
  if (g0 > 0) bloque(tr, XC[0], BASE, BASE + ALT(1000) * Math.min(g0, 1.05), 0.22);
  if (g1 > 0) bloque(tr, XC[1], BASE, BASE + ALT(v1) * Math.min(g1, 1.05), 0.22, 1, 0.2 + 0.4 * (v1 - 1000) / 600);
  if (g2 > 0) {
    bloque(tr, XC[2], BASE, BASE + ALT(t < EV.cuarenta ? 1600 : 960) * Math.min(g2, 1.05), 0.22);
    // El 40 % se desprende y cae
    const u = L(t, EV.cuarenta, EV.cuarenta + 0.9, 0, 1, (x) => x);
    if (t >= EV.cuarenta && u < 1) {
      const dx = 0.35 * u;
      const dy = -1.6 * u * u;
      for (const [a, b] of caja([XC[2] - 0.22 + dx, BASE + ALT(960) + dy, -0.22], [XC[2] + 0.22 + dx, BASE + ALT(1600) + dy, 0.22])) tr.push({ t: "l", a, b, w: 1.4, o: 0.9 * (1 - u), dash: "4 5" });
    }
  }
  // Línea de lo que metiste: el 960 se queda por debajo
  const ref = L(t, EV.cae - 0.2, EV.cae + 0.4, 0, 1, salida);
  if (ref > 0) tr.push({ t: "p", pts: [[-1.15, BASE + ALT(1000), 0], [1.15, BASE + ALT(1000), 0]], w: 1.4, o: 0.8, dash: "6 6", prog: ref });
  const pr = proyector(cam);
  const sobre = (i: number, v: number) => pr([XC[i], BASE + ALT(v), 0.22]);
  const bajo = (i: number) => pr([XC[i], BASE, 0.22]);
  const k = golpe(t, EV.novecientos - 0.1);
  const valor = (i: number, v: number, g: number, escala = 1) => {
    const q = sobre(i, v);
    return (
      <div key={i} style={{ position: "absolute", left: q.x, top: q.y - 64, transform: `translateX(-50%) scale(${escala})`, opacity: Math.min(g * 1.5, 1), ...mono(46) }}>
        {`${euros(v)} €`}
      </div>
    );
  };
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {g0 > 0 && valor(0, 1000, g0)}
      {g1 > 0 && valor(1, v1, g1)}
      {g2 > 0 && valor(2, v2, g2, 1 + 0.3 * k)}
      {["INICIO", "AÑO 1", "AÑO 2"].map((txt, i) => {
        const q = bajo(i);
        const g = [g0, g1, g2][i];
        return (
          <div key={txt} style={{ position: "absolute", left: q.x, top: q.y + 22, transform: "translateX(-50%)", opacity: Math.min(g * 1.5, 1), ...mono(26, 0.7) }}>
            {txt}
          </div>
        );
      })}
      <Etiqueta t={t} t0={EV.sesenta - 0.1} x={sobre(1, v1).x + 105} y={sobre(1, v1).y + 50} size={44}>
        +60 %
      </Etiqueta>
      <Destello t={t} t0={EV.novecientos - 0.1} o={0.2} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.sesenta - 0.35} texto="metes *1.000 €*" size={104} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.sesenta - 0.3} fin={EV.cae - 0.35} texto="año 1: *+60 %*" size={104} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.cae - 0.3} texto="año 2: *−40 %*" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Media: (+60 − 40) ÷ 2 = +10 %… y tú, −40 €
const Media: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], 9, L(t, s, e, -0.2, 0.2) + sacude(t, EV.euros - 0.1), 0.2, { apertura: 40 });
  const pieza = (t0: number, txt: string) => {
    const g = muelle(t, t0 - 0.08, 220, 15);
    return (
      <span style={{ display: "inline-block", opacity: Math.min(Math.max(g, 0) * 1.5, 1), transform: `translateY(${(1 - Math.min(g, 1)) * 40}px)` }}>{txt}</span>
    );
  };
  const k = golpe(t, EV.euros - 0.1);
  const tu = muelle(t, EV.euros - 0.5, 200, 15);
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <div style={{ position: "absolute", top: 520, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 26, ...mono(80) }}>
        {pieza(EV.mas60, "(+60")}
        {pieza(EV.menos40, "− 40)")}
        {pieza(EV.dos, "÷ 2")}
      </div>
      <Gigante t={t} t0={EV.diez - 0.12} texto="+10 %" top={680} size={210} pie="DE MEDIA AL AÑO" tacha={EV.euros - 0.1} />
      <Abajo top={1180} o={Math.min(Math.max(tu, 0) * 1.5, 1)}>
        <span style={mono(26, 0.6)}>TÚ</span>
        <span style={{ ...mono(120), display: "inline-block", transform: `scale(${(0.8 + 0.2 * Math.min(tu, 1.1)) * (1 + 0.3 * k)})` }}>−40 €</span>
      </Abajo>
      <Destello t={t} t0={EV.euros - 0.1} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.euros - 0.45} texto="la *media*" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.euros - 0.4} texto="y tú, *−40 €*" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. Giro: la media suma, tu dinero multiplica; las caídas pesan más
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.2, 0], L(t, s, e, 6.8, 6.4), L(t, s, e, 0.3, -0.15) + sacude(t, EV.pesan - 0.05), L(t, s, e, 0.12, 0.2), { apertura: 35, centroY: 1150 });
  const tr: Trazo[] = [...polvo(0.3)];
  // Balanza: el +60 % abulta más, pero el −40 % pesa más
  const th = -0.3 * muelle(t, EV.pesan - 0.15, 90, 8);
  const pivote: V3 = [0, 0.3, 0];
  const brazo = (lado: number): V3 => [lado * 0.55 * Math.cos(th), pivote[1] + lado * 0.55 * Math.sin(th), 0];
  const k = muelle(t, s + 0.1, 150, 16);
  tr.push({ t: "l", a: [0, -0.5, 0], b: [0, -0.5 + 0.8 * k, 0], w: 2, o: 0.9 });
  const plato = (lado: number): V3 => [brazo(lado)[0], brazo(lado)[1] - 0.42, 0];
  if (k > 0.6) {
    tr.push({ t: "l", a: brazo(-1), b: brazo(1), w: 2.4, o: 1 });
    for (const lado of [-1, 1]) {
      const ext = brazo(lado);
      const p = plato(lado);
      tr.push({ t: "l", a: ext, b: [p[0] - 0.18, p[1], 0], w: 1, o: 0.6 });
      tr.push({ t: "l", a: ext, b: [p[0] + 0.18, p[1], 0], w: 1, o: 0.6 });
      tr.push({ t: "p", pts: circulo(p, 0.22, "y", 40), w: 1.6, o: 1 });
      const r = lado < 0 ? 0.15 : 0.09;
      bloque(tr, p[0], p[1], p[1] + 2 * r, r, 1, lado < 0 ? 0.1 : 0.2 + 0.6 * muelle(t, EV.pesan - 0.15, 160, 14));
    }
  }
  const pr = proyector(cam);
  const etq = (lado: number) => pr([plato(lado)[0], plato(lado)[1], 0.22]);
  const tacha = L(t, EV.multiplica - 0.15, EV.multiplica + 0.25, 0, 1, salida);
  const fila = (t0: number, rotulo: string, cuenta: string, o = 1, raya = 0) => {
    const g = muelle(t, t0 - 0.1, 200, 16);
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: Math.min(Math.max(g, 0) * 1.5, 1) * o, transform: `translateY(${(1 - Math.min(g, 1)) * 30}px)` }}>
        <span style={mono(26, 0.6)}>{rotulo}</span>
        <span style={{ position: "relative", ...mono(64) }}>
          {cuenta}
          <span style={{ position: "absolute", left: -12, top: "52%", height: 6, width: `calc(${raya * 100}% + ${raya * 24}px)`, background: "#fff" }} />
        </span>
      </div>
    );
  };
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", top: 450, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        {fila(EV.suma, "LA MEDIA SUMA", "+60 − 40 = +20", 1 - 0.55 * tacha, tacha)}
        {fila(EV.multiplica, "TU DINERO MULTIPLICA", "×1,6 × 0,6 = ×0,96")}
      </div>
      {k > 0.6 && (
        <>
          <Etiqueta t={t} t0={s + 0.4} x={etq(-1).x} y={etq(-1).y + 34} size={34} o={0.85} alinea="centro">
            +60 %
          </Etiqueta>
          <Etiqueta t={t} t0={s + 0.5} x={etq(1).x} y={etq(1).y + 34} size={34} alinea="centro">
            −40 %
          </Etiqueta>
        </>
      )}
      <Destello t={t} t0={EV.pesan - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.multiplica - 0.35} texto="la media *suma*" size={104} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.multiplica - 0.3} fin={EV.caidas - 0.35} texto="tu dinero *multiplica*" size={92} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.caidas - 0.3} texto="las caídas *pesan*" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Pregunta: no cuánto gana, cuánto ha caído
const CURVA = [100, 108, 117, 129, 142, 160, 151, 133, 114, 96, 103, 115, 128, 141, 155, 170];
const PICO = 5;
const VALLE = 9;
const XP = (i: number) => -0.9 + (1.8 * i) / (CURVA.length - 1);
const YP = (v: number) => -0.5 + ((v - 96) / 74) * 1.0;
const Pregunta: React.FC<P> = ({ t, s, e }) => {
  const tPregunta = en("pregúntale", s);
  const cam = orbita([0, 0, 0], L(t, s, e, 7.2, 6.7), L(t, s, e, -0.28, -0.05) + sacude(t, EV.caido - 0.05), L(t, s, e, 0.12, 0.18), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.3)];
  const pts: V3[] = CURVA.map((v, i) => [XP(i), YP(v), 0]);
  tr.push({ t: "l", a: [-1.05, YP(100), 0], b: [1.05, YP(100), 0], w: 1.2, o: 0.45, dash: "6 8" });
  const prog = L(t, s + 0.1, EV.gana, 0, 1, (u) => u);
  tr.push({ t: "p", pts, w: 2.2, o: 0.9, luz: 0.3, prog });
  const caida = muelle(t, EV.caido - 0.15, 200, 16);
  if (caida > 0) {
    const c = Math.min(caida, 1);
    tr.push({ t: "p", pts: pts.slice(PICO, VALLE + 1), w: 4, o: 1, luz: 1 });
    tr.push({ t: "p", pts: [[XP(PICO), YP(160), 0], [XP(VALLE) + 0.12, YP(160), 0], [XP(VALLE) + 0.12, YP(96), 0]], w: 1.6, o: 0.9, dash: "5 5", prog: c });
  }
  if (t >= EV.gana - 0.1) tr.push({ t: "e", c: pts[CURVA.length - 1], r: 0.05, tipo: "punto", o: 1, luz: 1 });
  const pr = proyector(cam);
  const fin = pr(pts[CURVA.length - 1]);
  const valle = pr(pts[VALLE]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.gana - 0.1} x={fin.x} y={fin.y - 50} size={40} o={t >= EV.caido - 0.2 ? 0.45 : 1} alinea="der">
        +70 %
      </Etiqueta>
      <Etiqueta t={t} t0={EV.caido - 0.1} x={valle.x} y={valle.y + 70} size={44} alinea="centro">
        CAÍDA −40 %
      </Etiqueta>
      <Destello t={t} t0={EV.caido - 0.05} o={0.2} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={tPregunta - 0.3} texto="¿cuánto *gana*?" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tPregunta - 0.25} texto="¿cuánto ha *caído*?" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. CTA
const Cta: React.FC<P> = (p) => <CtaSeguir {...p} lema="MÁS CUENTAS QUE NADIE TE HACE" />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, cuenta: Cuenta, media: Media, giro: Giro, pregunta: Pregunta, cta: Cta };
export const CLAVES = claves(["10%", "perder", "1.000", "60%", "1.600", "40%", "960", "media", "menos", "suma", "multiplica", "caídas", "pesan", "gana", "caído", "sígueme"]);

export const MediaReel: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/media_mezcla.wav" piezas={PIEZAS} claves={CLAVES} />;
