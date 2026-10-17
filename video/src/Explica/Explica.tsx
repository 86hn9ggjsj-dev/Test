// "Qué hace de verdad un bot de trading": video 100 % motion graphics con guion, voz, música y SFX propios.
// Ocho pantallas encadenadas con fundido; cada una ilustra una frase del guion y se anima con los tiempos
// de las palabras (src/gen/explica.json, generado por scripts/explica.py).
import { AbsoluteFill, Audio, Easing, staticFile, useCurrentFrame } from "remotion";
import datos from "../gen/explica.json";
import { Progreso, salida } from "../Premium/ui";
import { Subtitulos } from "../Viral/Subtitulos";
import { ANCHO, lerp, ruido, SANS } from "../Viral/util";
import { Arriba, Etiqueta, L, mono, muelle, Reticula, Teclea, Titular } from "../Bot/piezas";
import { caja, circulo, clave, Escena, io, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";

export const EXPLICA_FPS = datos.fps;
export const EXPLICA_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const norm = (w: string) => w.toLowerCase().replace(/[^\wáéíóúñü%]/g, "");
// Momento en que se dice una palabra (la primera vez a partir de "desde")
const en = (w: string, desde = 0) => datos.palabras.find((p) => p.s >= desde - 0.1 && norm(p.w) === w)?.s ?? desde;

type P = { t: number; s: number; e: number };

// Paseo aleatorio suave y reproducible
const paseo = (n: number, semilla: number, paso: number, deriva = 0): number[] => {
  const v = [0];
  for (let i = 1; i < n; i++) v.push(v[i - 1] + deriva + (ruido(semilla * 131 + i * 17) - 0.5) * paso);
  return v;
};
const Kicker: React.FC<{ t: number; t0: number; texto: string }> = ({ t, t0, texto }) => (
  <div style={{ position: "absolute", top: 228, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
    <Teclea t={t} t0={t0} texto={texto} size={26} o={0.6} />
  </div>
);

// ------------------------------------------------------------------ 1. Hook: el futuro es un abanico de caminos; el bot no lo adivina
const PASADO: V3[] = paseo(36, 3, 0.16, 0.012).map((y, i) => [-3.2 + i * (3.2 / 35), y * 1.1 - 0.35, 0]);
const AHORA = PASADO[35];
const FUTUROS: V3[][] = Array.from({ length: 24 }, (_, c) =>
  paseo(26, 50 + c, 0.22, (c - 11.5) * 0.006).map((y, i): V3 => [AHORA[0] + i * 0.1, AHORA[1] + y * 1.2, (c - 11.5) * 0.04]),
);
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0.2, AHORA[1] + 0.1, 0], L(t, s, e, 7.8, 6.8), L(t, s, e, -0.62, -0.28), L(t, s, e, 0.16, 0.22), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.3)];
  const dib = L(t, s, s + 0.9, 0, 1, salida);
  tr.push({ t: "p", pts: PASADO, w: 3, o: 1, prog: dib, luz: 0.45 });
  PASADO.forEach((p, i) => {
    if (i / 35 <= dib && i % 2 === 0) tr.push({ t: "l", a: p, b: [p[0], -1.6, 0], w: 1, o: 0.1 });
  });
  // Plano del "ahora"
  const plano = L(t, s + 0.5, s + 1.0, 0, 1, salida);
  const pl: V3[] = [[0, -1.6, -0.7], [0, 1.2, -0.7], [0, 1.2, 0.7], [0, -1.6, 0.7], [0, -1.6, -0.7]];
  tr.push({ t: "p", pts: pl, w: 1.4, o: 0.55, prog: plano });
  // El abanico de futuros crece, parpadea y se recoge cuando dice "futuro"
  const crece = L(t, s + 0.7, s + 1.4, 0, 1, salida);
  const recoge = L(t, EV.futuro + 0.05, EV.futuro + 0.75, 0, 1, io);
  const abanico = crece * (1 - recoge);
  FUTUROS.forEach((pts, c) => {
    if (abanico > 0.01) tr.push({ t: "p", pts, w: 1.4, o: 0.4 + 0.22 * Math.sin(t * 9 + c * 1.7), prog: abanico, dash: "3 7" });
  });
  // "Algo mucho más aburrido": marcas idénticas a ritmo constante
  const nMarcas = Math.max(0, Math.min(18, Math.floor((t - (EV.aburrido - 0.15)) / 0.11)));
  for (let k = 0; k < nMarcas; k++) {
    const x = AHORA[0] + 0.14 * (k + 1);
    tr.push({ t: "l", a: [x, AHORA[1] - 0.07, 0], b: [x, AHORA[1] + 0.07, 0], w: 2, o: 0.9 });
  }
  if (nMarcas > 0) tr.push({ t: "l", a: AHORA, b: [AHORA[0] + 0.14 * nMarcas, AHORA[1], 0], w: 1.4, o: 0.6 });
  tr.push({ t: "e", c: AHORA, r: 0.05, tipo: "punto", o: dib >= 1 ? 1 : 0, luz: 1 });
  const pr = proyector(cam);
  const cima = pr([0, 1.2, 0]);
  const centro = pr([AHORA[0] + 1.3, AHORA[1] + 0.9, 0]);
  const regla = pr([AHORA[0] + 1.3, AHORA[1] - 0.35, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={s + 0.9} x={cima.x} y={cima.y - 30} size={26} o={0.7} alinea="centro">
        AHORA
      </Etiqueta>
      <div style={{ position: "absolute", left: centro.x, top: centro.y, transform: "translate(-50%, -50%)", opacity: abanico }}>
        <span style={mono(30, 0.8)}>¿FUTURO?</span>
      </div>
      <div style={{ position: "absolute", left: regla.x, top: regla.y, transform: "translate(-50%, -50%)" }}>
        <Teclea t={t} t0={EV.aburrido + 0.45} texto="MISMAS REGLAS · SIEMPRE" size={24} o={0.7} />
      </div>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.aburrido - 0.25} texto="no adivina el *futuro*" size={84} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.aburrido - 0.2} fin={EV.util - 0.6} texto="hace algo *aburrido*" size={84} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.util - 0.55} texto="y por eso es *útil*" size={84} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Lee: precio, volumen y spread entrando sin parar
const ondas = (x: number, k: number) => Math.sin(x * 1.7 + k) * 0.5 + Math.sin(x * 4.3 + k * 2.1) * 0.25 + Math.sin(x * 9.1 + k * 0.7) * 0.12;
const Lee: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 9.2, 8.4), L(t, s, e, 0.5, 0.2), L(t, s, e, 0.2, 0.3), { apertura: 35, centroY: 940 });
  const acelera = Math.max(0, t - EV.miles);
  const fase = (t - s) * 0.9 + acelera * acelera * 1.4;
  const tr: Trazo[] = [...polvo(0.3)];
  const ver = (t0: number) => L(t, t0, t0 + 0.4, 0, 1, salida);
  const vP = ver(s + 0.2);
  const vV = ver(EV.volumen - 0.25);
  const vS = ver(EV.spread - 0.25);
  // Precio
  tr.push({ t: "p", pts: Array.from({ length: 91 }, (_, i): V3 => [-3.2 + i * 0.071, 0.8 + 0.3 * ondas(-3.2 + i * 0.071 + fase, 1), 0]), w: 2.6, o: vP, luz: 0.4 * vP });
  // Volumen: barras que se desplazan con el precio
  const ancho = 0.16;
  const base = Math.floor(fase / ancho);
  for (let k = 0; k < 41; k++) {
    const x = -3.2 + k * ancho - (fase % ancho);
    const h = 0.12 + 0.55 * ruido(base + k) * (0.6 + 0.4 * Math.sin((base + k) * 0.3));
    tr.push({ t: "l", a: [x, -0.35, 0], b: [x, -0.35 + h, 0], w: 4, o: 0.55 * vV });
  }
  // Spread: dos líneas casi pegadas
  const sp = (signo: number) => Array.from({ length: 61 }, (_, i): V3 => [-3.2 + i * 0.107, -0.95 + signo * (0.05 + 0.025 * Math.sin((-3.2 + i * 0.107 + fase) * 3)), 0]);
  tr.push({ t: "p", pts: sp(1), w: 1.4, o: 0.8 * vS });
  tr.push({ t: "p", pts: sp(-1), w: 1.4, o: 0.8 * vS });
  const pr = proyector(cam);
  const fila = (y: number) => pr([-1.4, y, 0]);
  const precio = 2384.61 + ondas(fase, 1) * 3.2 + Math.sin(t * 37) * 0.04;
  const cuenta = Math.round(L(t, EV.miles - 0.05, EV.miles + 1.2, 0, 12480, Easing.bezier(0.2, 0, 0.1, 1)));
  const etiqueta = (y: number, k: number, nombre: string, valor: string) => {
    const q = fila(y);
    return (
      <div style={{ position: "absolute", left: 80, top: q.y - 34, transform: "translateY(-100%)", opacity: k, display: "flex", gap: 16, alignItems: "baseline" }}>
        <span style={mono(22, 0.5)}>{nombre}</span>
        <span style={mono(32)}>{valor}</span>
      </div>
    );
  };
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {etiqueta(1.25, vP, "PRECIO", precio.toFixed(2).replace(".", ","))}
      {etiqueta(0.4, vV, "VOLUMEN", String(1200 + Math.round(ruido(base) * 300)))}
      {etiqueta(-0.8, vS, "SPREAD", (0.16 + 0.04 * ruido(Math.floor(t * 12))).toFixed(2).replace(".", ","))}
      <div style={{ position: "absolute", top: 1300, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 18, alignItems: "baseline", opacity: t >= EV.miles - 0.05 ? 1 : 0 }}>
        <span style={mono(56)}>{cuenta.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</span>
        <span style={mono(24, 0.55)}>DATOS</span>
      </div>
      <Kicker t={t} t0={s + 0.05} texto="PASO 01 / 05" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} texto="lee el *mercado*" size={92} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Decide: reglas si/entonces sobre un nivel que se rompe
const RUPTURA = 30;
const PRECIO_D: number[] = (() => {
  const v = paseo(50, 9, 0.14).map((y, i) => (i < RUPTURA ? -0.15 + y * 0.6 + Math.sin(i * 0.5) * 0.12 : 0.1 + (i - RUPTURA) * 0.045 + y * 0.25));
  v[RUPTURA] = 0.45;
  return v;
})();
const NIVEL = 0.32;
const Decide: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.15, 0], L(t, s, e, 7.4, 6.8), L(t, s, e, 0.42, 0.12), 0.2, { apertura: 35, centroY: 1090 });
  const X = (i: number) => -2 + i * (4 / 49);
  const prog = clave(t, [[s + 0.2, 0], [EV.rompe, RUPTURA / 49], [EV.entra + 0.5, 1]]);
  const tr: Trazo[] = [...polvo(0.3)];
  tr.push({ t: "l", a: [-2.1, NIVEL, 0], b: [2.1, NIVEL, 0], w: 1.6, o: 0.7, dash: "8 9" });
  tr.push({ t: "p", pts: PRECIO_D.map((y, i): V3 => [X(i), y, 0]), w: 2.6, o: 1, prog, luz: 0.35 });
  PRECIO_D.forEach((_, i) => {
    if (i / 49 > prog) return;
    const pico = i >= RUPTURA - 1 && i <= RUPTURA + 1;
    const h = pico ? 0.75 * Math.min(muelle(t, EV.volumen2 - 0.1, 180, 12), 1.2) + 0.12 : 0.1 + 0.25 * ruido(i * 3);
    tr.push({ t: "l", a: [X(i), -1.25, 0], b: [X(i), -1.25 + h, 0], w: 5, o: pico ? 0.95 : 0.4 });
  });
  const pr = proyector(cam);
  const ruptura = pr([X(RUPTURA), PRECIO_D[RUPTURA], 0]);
  const nivel = pr([2.1, NIVEL, 0]);
  const FILAS: [string, string, number][] = [
    ["SI", "precio > nivel", EV.rompe],
    ["Y", "volumen ↑", EV.volumen2],
    ["→", "ENTRA", EV.entra],
    ["SI NO", "→ ESPERA", EV.espera],
  ];
  return (
    <>
      <Escena cam={cam} trazos={tr} encima={() => <Reticula q={ruptura} r={30} k={muelle(t, EV.entra, 220, 14)} />} />
      <Etiqueta t={t} t0={s + 0.4} x={Math.min(nivel.x, 1030)} y={nivel.y - 24} size={24} o={0.7} alinea="der">
        NIVEL
      </Etiqueta>
      <div style={{ position: "absolute", top: 470, left: 140, width: 800, display: "flex", flexDirection: "column", gap: 10 }}>
        {FILAS.map(([a, b, t1], i) => {
          const aparece = muelle(t, s + 0.35 + i * 0.12, 200, 18);
          const activa = muelle(t, t1 - 0.05, 220, 16);
          const entra = i === 2 ? Math.min(activa, 1) : 0;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                height: 66,
                padding: "0 26px",
                borderRadius: 14,
                border: `1.5px solid rgba(255,255,255,${0.15 + 0.45 * Math.min(activa, 1)})`,
                background: `rgba(255,255,255,${entra})`,
                opacity: Math.min(aparece * 1.6, 1) * (0.4 + 0.6 * Math.min(activa, 1)),
                transform: `translateX(${(1 - Math.min(aparece, 1)) * -40}px)`,
              }}
            >
              <span style={{ ...mono(30, 0.55), width: 120, ...(entra > 0.5 ? { color: "#000" } : {}) }}>{a}</span>
              <span style={{ ...mono(34), flex: 1, ...(entra > 0.5 ? { color: "#000" } : {}) }}>{b}</span>
              {i < 2 && <span style={{ ...mono(34), opacity: Math.min(activa, 1) }}>✓</span>}
            </div>
          );
        })}
      </div>
      <Kicker t={t} t0={s + 0.05} texto="PASO 02 / 05" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} texto="decide con *reglas*" size={88} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. Protege: antes de entrar ya están el stop, el riesgo y el tamaño
const VELAS_P = [-0.62, -0.5, -0.56, -0.38, -0.44, -0.24, -0.3, -0.08, 0.0];
const Protege: React.FC<P> = ({ t, s, e }) => {
  const tAntes = en("antes", s);
  const cam = orbita([0.6, -0.2, 0], L(t, s, e, 8.4, 7.6), L(t, s, e, -0.25, 0.02), L(t, s, e, 0.16, 0.22), { apertura: 35, centroY: 1000 });
  const tr: Trazo[] = [...polvo(0.3)];
  const XV = (i: number) => -2.2 + i * 0.24;
  VELAS_P.forEach((c, i) => {
    const g = muelle(t, s + 0.15 + i * 0.07, 170, 16);
    if (g <= 0) return;
    const ab = i ? VELAS_P[i - 1] : -0.7;
    const w = 0.07;
    for (const [a, b] of caja([XV(i) - w, Math.min(ab, c), -w], [XV(i) + w, Math.min(ab, c) + Math.abs(c - ab) * g + 0.004, w])) tr.push({ t: "l", a, b, w: 1.4, o: c > ab ? 0.9 : 0.45 });
  });
  const x0 = XV(8) + 0.2;
  const x1 = 1.75;
  tr.push({ t: "p", pts: [[x0, 0, 0], [x1, 0, 0]], w: 1.8, o: 0.9, prog: L(t, tAntes - 0.1, tAntes + 0.4, 0, 1, salida) });
  // Stop: baja desde la entrada y deja la zona de riesgo rayada
  const baja = muelle(t, EV.perder - 0.15, 130, 14);
  const yStop = -0.75 * baja;
  if (baja > 0) tr.push({ t: "p", pts: [[x0, yStop, 0], [x1, yStop, 0]], w: 1.6, o: 0.85, dash: "8 9" });
  const rayas = Math.round(18 * L(t, EV.perder, EV.perder + 0.6, 0, 1, salida));
  const listo = L(t, EV.calculados, EV.calculados + 0.6, 1, 0, salida);
  for (let r = 0; r < rayas; r++) {
    const x = x0 + ((x1 - x0) * r) / 17;
    tr.push({ t: "l", a: [x, yStop, 0], b: [Math.min(x + 0.25, x1), 0, 0], w: 1, o: 0.35, luz: t >= EV.calculados ? listo : 0 });
  }
  // Tamaño de la posición: un bloque que se ajusta a su medida
  const tam = muelle(t, EV.tamano - 0.1, 160, 13);
  if (tam > 0) {
    for (const [a, b] of caja([x1 - 0.7, 0.04, -0.22], [x1 - 0.7 + 0.45 * tam, 0.04 + 0.5 * tam, 0.22])) tr.push({ t: "l", a, b, w: 1.6, o: 0.95 });
  }
  const pr = proyector(cam);
  const zona = pr([(x0 + x1) / 2, yStop / 2, 0]);
  const stop = pr([x1, yStop, 0]);
  const bloque = pr([x1 - 0.48, 0.72, 0]);
  const ok = t >= EV.calculados ? " ✓" : "";
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.perder + 0.2} x={zona.x} y={zona.y} size={30} alinea="centro">
        RIESGO −1%
      </Etiqueta>
      <Etiqueta t={t} t0={EV.stop - 0.05} x={Math.min(stop.x, 1030)} y={stop.y + 30} size={26} o={0.85} alinea="der">
        {`STOP${ok}`}
      </Etiqueta>
      <Etiqueta t={t} t0={EV.tamano} x={bloque.x} y={bloque.y} size={26} o={0.85} alinea="centro">
        {`TAMAÑO${ok}`}
      </Etiqueta>
      <Kicker t={t} t0={s + 0.05} texto="PASO 03 / 05" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={tAntes - 0.1} texto="se *protege*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tAntes - 0.05} texto="sabe cuánto puede *perder*" size={74} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Ejecuta: la orden llega al bróker en milisegundos, a cualquier hora
const SENAL: V3 = [-0.85, 0, 0.35];
const BROKER: V3 = [0.85, 0, -0.55];
const RUTA_E: V3[] = Array.from({ length: 41 }, (_, i) => {
  const u = i / 40;
  return [SENAL[0] + (BROKER[0] - SENAL[0]) * u, Math.sin(u * Math.PI) * 0.75, SENAL[2] + (BROKER[2] - SENAL[2]) * u] as V3;
});
const Ejecuta: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0.2, -0.1], L(t, s, e, 7.8, 7.2), L(t, s, e, 0.28, -0.12), L(t, s, e, 0.34, 0.26), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const k = muelle(t, s + 0.1, 160, 16);
  for (const c of [SENAL, BROKER]) {
    for (const [a, b] of caja([c[0] - 0.26, c[1] - 0.26 * k, c[2] - 0.26], [c[0] + 0.26, c[1] + 0.26 * k, c[2] + 0.26])) tr.push({ t: "l", a, b, w: 1.6, o: 0.9 });
  }
  tr.push({ t: "p", pts: RUTA_E, w: 1.2, o: 0.4, dash: "4 8", prog: L(t, s + 0.2, s + 0.8, 0, 1, salida) });
  const salidas = [EV.milisegundos - 0.1, EV.tres + 0.1, EV.noticia + 0.02];
  let llegadas = 0;
  for (const t0 of salidas) {
    const u = (t - t0) / 0.32;
    if (u >= 1) llegadas++;
    if (u > 0 && u < 1.25) {
      const cabeza = Math.min(u, 1) * 40;
      const cola = Math.max(cabeza - 9, 0);
      const pts = RUTA_E.slice(Math.floor(cola), Math.ceil(cabeza) + 1);
      if (pts.length > 1) tr.push({ t: "p", pts, w: 3.4, o: 1 - Math.max(0, u - 1) * 4, luz: 1 });
    }
    const flash = L(t, t0 + 0.32, t0 + 0.9, 1, 0, salida);
    if (t >= t0 + 0.32 && flash > 0) tr.push({ t: "p", pts: circulo(BROKER, 0.38 + 0.35 * (1 - flash), "y", 40), w: 1.6, o: flash });
  }
  // Noticia: barras de volatilidad junto a la ruta
  const nota = L(t, EV.noticia - 0.1, EV.noticia + 0.25, 0, 1, salida);
  if (nota > 0) {
    for (let i = 0; i < 14; i++) {
      const p = RUTA_E[12 + i];
      const h = (0.2 + 0.8 * ruido(i * 7)) * nota * (0.7 + 0.3 * Math.sin(t * 20 + i));
      tr.push({ t: "l", a: [p[0], -0.9, p[2]], b: [p[0], -0.9 + h, p[2]], w: 3, o: 0.6 });
    }
  }
  const pr = proyector(cam);
  const qS = pr(SENAL);
  const qB = pr(BROKER);
  const ms = Math.min(4, Math.max(0, ((t - salidas[0]) / 0.32) * 4));
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={s + 0.3} x={qS.x} y={qS.y + 90} size={26} alinea="centro">
        SEÑAL
      </Etiqueta>
      <Etiqueta t={t} t0={s + 0.4} x={qB.x} y={qB.y + 70} size={26} alinea="centro">
        {llegadas ? `BRÓKER ✓${llegadas > 1 ? ` ×${llegadas}` : ""}` : "BRÓKER"}
      </Etiqueta>
      <div style={{ position: "absolute", top: 1250, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 60 }}>
        <span style={{ ...mono(52), opacity: t >= salidas[0] ? 1 : 0 }}>{`${ms.toFixed(0)} ms`}</span>
        <span style={{ ...mono(52, 0.85), opacity: t >= EV.tres - 0.05 ? 1 : 0 }}>03:00</span>
        <span style={{ ...mono(52, 0.85), opacity: nota }}>NOTICIA</span>
      </div>
      <Kicker t={t} t0={s + 0.05} texto="PASO 04 / 05" />
      <Arriba>
        <Titular t={t} t0={s + 0.1} texto="ejecuta en *milisegundos*" size={76} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Emoción: una balanza entre miedo y avaricia que no se inclina
const Emocion: React.FC<P> = ({ t, s, e }) => {
  const tNi = en("ni", EV.programado);
  const cam = orbita([0, -0.1, 0], L(t, s, e, 7.2, 6.6), L(t, s, e, 0.35, -0.25), L(t, s, e, 0.14, 0.24), { apertura: 35, centroY: 1000 });
  const golpe = (t0: number, signo: number) => (t < t0 ? 0 : signo * 0.2 * Math.exp(-(t - t0) * 2.6) * Math.sin((t - t0) * 9));
  const fija = 1 - L(t, EV.programado - 0.1, EV.programado + 0.35, 0, 1, salida);
  const th = (golpe(EV.miedo, 1) + golpe(EV.avaricia, -1)) * fija;
  const pivote: V3 = [0, 0.6, 0];
  const brazo = (lado: number): V3 => [lado * 1.05 * Math.cos(th), pivote[1] + lado * 1.05 * Math.sin(th), 0];
  const tr: Trazo[] = [...polvo(0.3)];
  const k = muelle(t, s + 0.1, 150, 16);
  tr.push({ t: "l", a: [0, -1.4, 0], b: [0, -1.4 + 2.0 * k, 0], w: 2, o: 0.9 });
  tr.push({ t: "p", pts: [[-0.5, -1.4, 0.3], [0.5, -1.4, 0.3], [0.5, -1.4, -0.3], [-0.5, -1.4, -0.3], [-0.5, -1.4, 0.3]], w: 1.4, o: 0.7 });
  if (k > 0.6) {
    tr.push({ t: "l", a: brazo(-1), b: brazo(1), w: 2.4, o: 1, luz: t > EV.programado ? 0.4 * (1 - fija) : 0 });
    for (const lado of [-1, 1]) {
      const ext = brazo(lado);
      const plato: V3 = [ext[0], ext[1] - 0.85, 0];
      tr.push({ t: "l", a: ext, b: [plato[0] - 0.3, plato[1], 0], w: 1, o: 0.6 });
      tr.push({ t: "l", a: ext, b: [plato[0] + 0.3, plato[1], 0], w: 1, o: 0.6 });
      tr.push({ t: "p", pts: circulo(plato, 0.34, "y", 40), w: 1.6, o: 0.9 });
      tr.push({ t: "p", pts: circulo([plato[0], plato[1] - 0.07, 0], 0.24, "y", 32), w: 1, o: 0.4 });
    }
    tr.push({ t: "p", pts: circulo(pivote, 0.06, "z", 20), w: 2, o: 1 });
  }
  const pr = proyector(cam);
  const plato = (lado: number) => pr([brazo(lado)[0], brazo(lado)[1] - 1.12, 0]);
  const grados = Math.abs(th * 57.3);
  const igual = muelle(t, tNi + 0.3, 220, 14);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={EV.miedo - 0.05} x={plato(-1).x} y={plato(-1).y} size={30} alinea="centro">
        MIEDO
      </Etiqueta>
      <Etiqueta t={t} t0={EV.avaricia - 0.05} x={plato(1).x} y={plato(1).y} size={30} alinea="centro">
        AVARICIA
      </Etiqueta>
      <div style={{ position: "absolute", top: 1255, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: t >= EV.miedo - 0.05 ? 1 : 0 }}>
        <span style={mono(56)}>{`${grados.toFixed(1).replace(".", ",")}°`}</span>
      </div>
      <div style={{ position: "absolute", left: ANCHO / 2, top: pr([0, -0.15, 0]).y, transform: `translate(-50%, -50%) scale(${igual})`, opacity: Math.min(igual * 1.5, 1) }}>
        <span style={mono(72)}>=</span>
      </div>
      <Kicker t={t} t0={s + 0.05} texto="PASO 05 / 05 · LO MÁS IMPORTANTE" />
      <Arriba>
        <Titular t={t} t0={EV.miedo - 0.35} fin={tNi - 0.2} texto="sin *miedo* ni *avaricia*" size={76} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={tNi - 0.15} texto="ni más, ni *menos*" size={88} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 7. Código: la disciplina escrita línea a línea
const CODIGO: [string, string][] = [
  ["si ", "precio > nivel y volumen > media:"],
  ["    ", "abrir(stop=calcular_stop(), riesgo=1%)"],
  ["si no:", ""],
  ["    ", "esperar()"],
];
const Codigo: React.FC<P> = ({ t, s, e }) => {
  const panel = muelle(t, s + 0.05, 140, 17);
  const total = CODIGO.reduce((a, [x, y]) => a + x.length + y.length, 0);
  const cps = total / Math.max(EV.codigo - (s + 0.25), 1);
  let quedan = Math.max(0, Math.floor((t - (s + 0.25)) * cps));
  const cam = orbita([0, 0, 0], 9, L(t, s, e, 0.3, -0.2), 0.25, { apertura: 40 });
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <div style={{ position: "absolute", top: 600, left: 0, width: ANCHO, height: 600, perspective: 1300, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: 940,
            padding: "34px 0",
            borderRadius: 22,
            border: "1.5px solid rgba(255,255,255,0.45)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))",
            transform: `rotateX(${L(t, s, e, 22, 10)}deg) rotateY(${L(t, s, e, -20, -6)}deg) translateY(${(1 - panel) * 140}px)`,
            opacity: Math.min(panel * 1.6, 1),
          }}
        >
          {CODIGO.map(([clave_, resto], i) => {
            const n1 = Math.min(clave_.length, quedan);
            quedan -= n1;
            const n2 = Math.min(resto.length, quedan);
            quedan -= n2;
            const activa = n1 + n2 > 0 && (n1 + n2 < clave_.length + resto.length || i === CODIGO.length - 1);
            return (
              <div key={i} style={{ display: "flex", gap: 24, height: 66, alignItems: "center", padding: "0 34px" }}>
                <span style={{ ...mono(26, 0.3), width: 30 }}>{i + 1}</span>
                <span style={{ ...mono(30), whiteSpace: "pre" }}>
                  <span style={{ opacity: 0.5 }}>{clave_.slice(0, n1)}</span>
                  {resto.slice(0, n2)}
                  {activa && Math.floor(t * 2.6) % 2 === 0 && <span style={{ opacity: 0.9 }}>▍</span>}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.disciplina - 0.3} texto="no es *magia*" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.disciplina - 0.25} texto="disciplina en *código*" size={84} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 8. CTA: seguir para la parte 2, el backtest
const BACKTEST: V3[] = paseo(61, 21, 0.2, 0.03).map((y, i): V3 => [-1.9 + i * (3.8 / 60), y * 0.7 - 0.6, 0]);
const Cta: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.2, 0], L(t, s, e, 9, 8.2), L(t, s, e, -0.4, 0.05), 0.2, { apertura: 35, centroY: 900 });
  const boton = muelle(t, s + 0.05, 200, 16);
  const pulsa = muelle(t, s + 0.5, 260, 15);
  const onda = L(t, s + 0.5, s + 1.1, 0, 1, salida);
  const dib = L(t, EV.prueba - 0.6, EV.euro - 0.05, 0, 1, Easing.bezier(0.3, 0, 0.3, 1));
  const tr: Trazo[] = [...polvo(0.3)];
  const eje = L(t, s + 0.6, s + 1.2, 0, 1, salida);
  tr.push({ t: "p", pts: [[-2.0, -1.3, 0], [2.0, -1.3, 0]], w: 1.2, o: 0.5, prog: eje });
  for (let a = 0; a <= 6; a++) tr.push({ t: "l", a: [-1.9 + a * (3.8 / 6), -1.3, 0], b: [-1.9 + a * (3.8 / 6), -1.2, 0], w: 1.2, o: 0.5 * eje });
  tr.push({ t: "p", pts: BACKTEST, w: 2.6, o: 1, prog: dib, luz: 0.4 });
  const cabeza = BACKTEST[Math.min(60, Math.round(dib * 60))];
  if (dib > 0 && dib < 1) tr.push({ t: "l", a: [cabeza[0], -1.3, 0], b: [cabeza[0], 1.2, 0], w: 1, o: 0.5 });
  const pr = proyector(cam);
  const fin = pr(BACKTEST[60]);
  const blanco = pulsa > 0.5;
  return (
    <>
      <Escena cam={cam} trazos={tr} encima={() => <Reticula q={fin} r={30} k={muelle(t, EV.euro, 220, 14)} />} />
      {[2019, 2020, 2021, 2022, 2023, 2024, 2025].map((a, i) => {
        const q = pr([-1.9 + i * (3.8 / 6), -1.3, 0]);
        return (
          <div key={a} style={{ position: "absolute", left: q.x, top: q.y + 26, transform: "translateX(-50%)", opacity: eje, ...mono(24, 0.55) }}>
            {a}
          </div>
        );
      })}
      <Etiqueta t={t} t0={EV.prueba - 0.5} x={pr([-1.9, 1.0, 0]).x} y={pr([-1.9, 1.0, 0]).y} size={26} o={0.7}>
        BACKTEST
      </Etiqueta>
      <Etiqueta t={t} t0={EV.euro} x={Math.min(fin.x + 20, 1030)} y={fin.y - 64} size={30} alinea="der">
        0 € EN RIESGO
      </Etiqueta>
      <div style={{ position: "absolute", top: 470, left: 0, width: ANCHO, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", opacity: Math.min(boton * 1.6, 1), transform: `scale(${(0.8 + 0.2 * boton) * (1 - 0.06 * Math.sin(Math.min(pulsa, 1) * Math.PI))})` }}>
          {onda > 0 && onda < 1 && <div style={{ position: "absolute", inset: -20 - 40 * onda, borderRadius: 999, border: "2px solid #fff", opacity: 1 - onda }} />}
          <div style={{ padding: "26px 60px", borderRadius: 999, border: "2px solid #fff", background: blanco ? "#fff" : "transparent", color: blanco ? "#000" : "#fff", fontFamily: SANS, fontWeight: 700, fontSize: 52, letterSpacing: "-0.01em" }}>
            {blanco ? "Siguiendo ✓" : "Seguir"}
          </div>
        </div>
      </div>
      <Kicker t={t} t0={EV.prueba - 0.7} texto="PRÓXIMO VÍDEO · PARTE 2" />
      <Arriba>
        <Titular t={t} t0={s + 0.05} fin={EV.prueba - 0.75} texto="*sígueme*" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.prueba - 0.7} texto="cómo se *prueba* un bot" size={80} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ composición
const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, lee: Lee, decide: Decide, protege: Protege, ejecuta: Ejecuta, emocion: Emocion, codigo: Codigo, cta: Cta };
const FUNDE = 0.16;
const CLAVES: Record<string, string> = {};
for (const w of ["futuro", "aburrido", "útil", "mercado", "reglas", "entra", "protege", "perder", "milisegundos", "miedo", "avaricia", "magia", "código", "prueba"]) CLAVES[w] = "#ffffff";
const CORTES = datos.escenas.map((x) => x.s);

export const Explica: React.FC = () => {
  const t = useCurrentFrame() / datos.fps;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 70% at 50% 45%, #0b0b0c, #000)" }}>
      <Audio src={staticFile("gen/explica_mezcla.wav")} />
      {datos.escenas
        .filter((p) => t >= p.s - FUNDE && t < p.e + FUNDE)
        .map((p) => {
          const Pieza = PIEZAS[p.id];
          const entra = p.s <= 0.01 ? 1 : lerp(t, p.s - FUNDE, p.s + FUNDE, 0, 1, io);
          const sale = p.e >= datos.duracion - 0.01 ? 0 : lerp(t, p.e - FUNDE, p.e + FUNDE, 0, 1, io);
          return (
            <AbsoluteFill key={p.id} style={{ opacity: entra * (1 - sale), transform: `translateY(${(1 - entra) * 40 - sale * 40}px)` }}>
              <Pieza t={t} s={p.s} e={p.e} />
            </AbsoluteFill>
          );
        })}
      <Subtitulos t={t} palabras={datos.palabras} cortes={CORTES} claves={CLAVES} duracion={datos.duracion} y={() => 0.765} estilo="premium" dinamico />
      <Progreso t={t} duracion={datos.duracion} />
    </AbsoluteFill>
  );
};
