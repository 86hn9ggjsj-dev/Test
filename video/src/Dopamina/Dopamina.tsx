// Reel de alcance "Una tragaperras y un gráfico de un minuto tienen el mismo truco" (~39 s), en blanco y negro: una
// tragaperras de alambre con los rodillos girando sobre un gráfico de velas, la curva de dopamina que es máxima cuando
// el premio es incierto, el «sígueme» a mitad, tiradas que pagan sin patrón y velas que dan y quitan, el contador de
// operaciones que se dispara, las reglas y el robot sin dopamina, y la pregunta final.
// Tiempos en src/gen/dopamina.json (scripts/dopamina.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/dopamina.json";
import { salida } from "../Premium/ui";
import { ANCHO, ruido } from "../Viral/util";
import { Arriba, Etiqueta, L, mono, muelle, Teclea, Titular } from "../Bot/piezas";
import { caja, circulo, Escena, orbita, polvo, proyector, Trazo, V3 } from "../Bot/tres";
import { cristal, velas } from "../Bot/kit";
import { Abajo, claves, CtaSeguir, Destello, golpe, Kicker, Montaje, P, paseo, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const DOPAMINA_FPS = datos.fps;
export const DOPAMINA_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const SIMBOLOS = ["7", "€", "$", "%", "×"];

// ------------------------------------------------------------------ tragaperras de alambre
const Y0 = 0.15;
const VENTANAS = [-0.34, 0, 0.34];
const maquina = (tr: Trazo[], g: number, palanca: number, luz = 0.2) => {
  const k = Math.min(g, 1.05);
  cristal(tr, [-0.6 * k, (Y0 - 0.5) * k, -0.25 * k], [0.6 * k, (Y0 + 0.45) * k, 0.25 * k], "#fff", 1, luz, 0.05);
  // Cartel de arriba
  tr.push({ t: "p", pts: [[-0.45 * k, (Y0 + 0.47) * k, 0.25 * k], [0.45 * k, (Y0 + 0.47) * k, 0.25 * k], [0.45 * k, (Y0 + 0.66) * k, 0.25 * k], [-0.45 * k, (Y0 + 0.66) * k, 0.25 * k], [-0.45 * k, (Y0 + 0.47) * k, 0.25 * k]], w: 1.6, o: 0.9 });
  // Ventanas de los rodillos
  for (const x of VENTANAS) {
    const p: V3[] = [[(x - 0.14) * k, (Y0 - 0.18) * k, 0.26 * k], [(x + 0.14) * k, (Y0 - 0.18) * k, 0.26 * k], [(x + 0.14) * k, (Y0 + 0.2) * k, 0.26 * k], [(x - 0.14) * k, (Y0 + 0.2) * k, 0.26 * k]];
    tr.push({ t: "p", pts: [...p, p[0]], w: 1.8, o: 1, relleno: "#fff", oRelleno: 0.05 });
  }
  // Palanca: baja cuando se tira
  const a = -0.9 * palanca + 1.2;
  const base: V3 = [0.62 * k, (Y0 - 0.05) * k, 0];
  const punta: V3 = [base[0] + 0.12 * k, base[1] + Math.sin(a) * 0.45 * k, Math.cos(a) * 0.12 * k];
  tr.push({ t: "l", a: base, b: punta, w: 2.4, o: 1 });
  tr.push({ t: "p", pts: circulo(punta, 0.05 * k, "z", 20), w: 2, o: 1, relleno: "#fff", oRelleno: 0.5, luz: 0.4 });
};
// Símbolos de los rodillos: giran hasta su hora de parar y se quedan en el resultado
const Rodillos: React.FC<{ t: number; pr: (p: V3) => { x: number; y: number }; tiradas: { t0: number; res: string[] }[]; g?: number }> = ({ t, pr, tiradas, g = 1 }) => {
  const actual = [...tiradas].reverse().find((r) => t >= r.t0) ?? tiradas[0];
  return (
    <>
      {VENTANAS.map((x, i) => {
        const q = pr([x * g, Y0 * g, 0.27 * g]);
        const para = actual.t0 + 0.45 + i * 0.18;
        const gira = t < para;
        const idx = gira ? Math.floor(t * 18 + i * 3) % SIMBOLOS.length : -1;
        const sim = gira ? SIMBOLOS[idx] : actual.res[i];
        return (
          <div key={i} style={{ position: "absolute", left: q.x, top: q.y, transform: `translate(-50%, -50%) translateY(${gira ? ((t * 18) % 1) * 30 - 15 : 0}px)`, opacity: gira ? 0.55 : 1, filter: gira ? "blur(2px)" : undefined, ...mono(84) }}>
            {sim}
          </div>
        );
      })}
    </>
  );
};
const premio = (res: string[]) => res[0] === res[1] && res[1] === res[2];

// Velas de un minuto: suben y bajan sin parar
const MINUTO = paseo(40, 21, 0.6);
const escalaVelas = (y0: number, alto: number) => {
  const lo = Math.min(...MINUTO);
  const hi = Math.max(...MINUTO);
  return MINUTO.map((v) => y0 + ((v - lo) / (hi - lo)) * alto);
};

// ------------------------------------------------------------------ 1. Hook: la tragaperras y el gráfico, el mismo truco
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.1, 0], L(t, s, e, 5.8, 5.3), L(t, s, e, -0.3, 0.15) + sacude(t, EV.truco - 0.05, 0.02), L(t, s, e, 0.08, 0.12), { apertura: 35, centroY: 900 });
  const tr: Trazo[] = [...polvo(0.3)];
  maquina(tr, muelle(t, -0.6, 150, 14), L(t, 0.2, 0.6, 0, 1, salida) * (1 - L(t, 0.6, 1.0, 0, 1)));
  velas(tr, escalaVelas(-0.95, 0.25), -0.85, 0.85, Math.round(L(t, 0, EV.truco, 4, MINUTO.length)), 0.026, 0.85, 0.02, true);
  const pr = proyector(cam);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Rodillos t={t} pr={pr} tiradas={[{ t0: 0.3, res: ["7", "€", "7"] }, { t0: 2.3, res: ["$", "$", "%"] }]} />
      <Destello t={t} t0={EV.truco - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={-0.6} fin={EV.enganchando - 0.45} texto="el mismo *truco*" size={116} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.enganchando - 0.4} texto="te está *enganchando*" size={92} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Dopamina: más cuanto más incierto es el premio
const Dopamina: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], L(t, s, e, 5.4, 5.0), L(t, s, e, -0.15, 0.12) + sacude(t, EV.sabe - 0.05, 0.02), L(t, s, e, 0.06, 0.1), { apertura: 35, centroY: 960 });
  const tr: Trazo[] = [...polvo(0.3)];
  const X = (p: number) => -0.8 + 1.6 * p;
  const Y = (d: number) => -0.5 + 1.0 * d;
  const raiz = L(t, s, s + 0.5, 0, 1, salida);
  tr.push({ t: "p", pts: [[X(0), Y(0), 0], [X(1), Y(0), 0]], w: 1.4, o: 0.7, prog: raiz });
  tr.push({ t: "p", pts: [[X(0), Y(0), 0], [X(0), Y(1.05), 0]], w: 1.4, o: 0.7, prog: raiz });
  const curva: V3[] = Array.from({ length: 41 }, (_, i) => { const p = i / 40; return [X(p), Y(4 * p * (1 - p)), 0]; });
  tr.push({ t: "p", pts: curva, w: 2.6, o: 1, luz: 0.4, prog: L(t, s + 0.2, EV.premio + 0.4, 0, 1, salida) });
  tr.push({ t: "p", pts: [...curva, [X(1), Y(0), 0], [X(0), Y(0), 0]], w: 0, o: 1, relleno: "#fff", oRelleno: 0.06 * L(t, EV.premio, EV.premio + 0.5, 0, 1) });
  // El punto va del premio seguro (100 %) al incierto (50 %)
  const p = L(t, EV.sabe - 0.4, EV.llegara, 1, 0.5, salida);
  const k = golpe(t, EV.sabe - 0.05);
  if (t >= EV.premio - 0.1) tr.push({ t: "e", c: [X(p), Y(4 * p * (1 - p)), 0], r: 0.045 + 0.02 * k, tipo: "punto", o: 1, luz: 1 });
  const pr = proyector(cam);
  const ticks = [0, 0.5, 1].map((v) => ({ v, q: pr([X(v), Y(0), 0]) }));
  const qy = pr([X(0), Y(1.05), 0]);
  const qp = pr([X(p), Y(4 * p * (1 - p)), 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {ticks.map(({ v, q }) => (
        <div key={v} style={{ position: "absolute", left: q.x, top: q.y + 16, transform: "translateX(-50%)", opacity: raiz, ...mono(26, 0.7) }}>{`${v * 100} %`}</div>
      ))}
      <div style={{ position: "absolute", left: 0, width: ANCHO, top: ticks[1].q.y + 60, display: "flex", justifyContent: "center", opacity: raiz, ...mono(24, 0.6) }}>PROBABILIDAD DEL PREMIO</div>
      <div style={{ position: "absolute", left: qy.x + 14, top: qy.y - 14, opacity: raiz, ...mono(24, 0.6) }}>DOPAMINA</div>
      {t >= EV.premio - 0.1 && (
        <div style={{ position: "absolute", left: Math.min(Math.max(qp.x, 200), 860), top: qp.y - 64, transform: `translateX(-50%) scale(${1 + 0.25 * k})`, ...mono(30) }}>{p > 0.9 ? "PREMIO SEGURO" : "¿LLEGARÁ?"}</div>
      )}
      <Destello t={t} t0={EV.sabe - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.sabe - 0.45} texto="espera un *premio*" size={104} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.sabe - 0.4} texto="*no sabe* si llega" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Sígueme a mitad
const Sigueme: React.FC<P> = (p) => <CtaSeguir {...p} lema="GUARDA ESTE VÍDEO" />;

// ------------------------------------------------------------------ 4. Patrón: paga a veces, sin patrón; las velas dan y quitan
const Patron: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.1, 0], L(t, s, e, 5.8, 5.4), L(t, s, e, 0.2, -0.15) + sacude(t, EV.engancha - 0.05, 0.02), L(t, s, e, 0.08, 0.12), { apertura: 35, centroY: 930 });
  const tr: Trazo[] = [...polvo(0.3)];
  const cambio = L(t, EV.grafico - 0.5, EV.grafico, 0, 1, salida);
  const paso = (EV.grafico - 0.6 - s) / 4;
  const tiradas = [
    { t0: s + 0.1, res: ["7", "€", "$"] },
    { t0: s + 0.1 + paso, res: ["$", "$", "%"] },
    { t0: s + 0.1 + 2 * paso, res: ["7", "7", "7"] },
    { t0: s + 0.1 + 3 * paso, res: ["%", "€", "×"] },
  ];
  const actual = [...tiradas].reverse().find((r) => t >= r.t0) ?? tiradas[0];
  const tPremio = actual.t0 + 0.45 + 2 * 0.18;
  const gano = premio(actual.res) && t >= tPremio;
  if (cambio < 1) maquina(tr, 1 - 0.3 * cambio, L(t, actual.t0 - 0.2, actual.t0, 0, 1) * (1 - L(t, actual.t0, actual.t0 + 0.3, 0, 1)), gano ? 0.8 : 0.2);
  // Las velas: cada una que cierra da o quita
  const nVelas = Math.round(L(t, EV.grafico - 0.3, e, 2, MINUTO.length, (u) => u));
  if (cambio > 0) velas(tr, escalaVelas(-0.45, 0.8), -0.85, 0.85, nVelas, 0.03, cambio, 0.03, true);
  const pr = proyector(cam);
  const ys = escalaVelas(-0.45, 0.8);
  const ultima = Math.max(1, Math.min(nVelas - 1, MINUTO.length - 1));
  const qv = pr([-0.85 + (1.7 * ultima) / (MINUTO.length - 1), ys[ultima] + 0.08, 0]);
  const dif = Math.round((MINUTO[ultima] - MINUTO[ultima - 1]) * 40);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {cambio < 1 && (
        <div style={{ opacity: 1 - cambio }}>
          <Rodillos t={t} pr={pr} tiradas={tiradas} g={1 - 0.3 * cambio} />
        </div>
      )}
      {gano && cambio < 0.5 && (
        <div style={{ position: "absolute", top: 1250, left: 0, width: ANCHO, display: "flex", justifyContent: "center", transform: `scale(${1 + 0.3 * golpe(t, tPremio)})`, ...mono(80) }}>¡PREMIO!</div>
      )}
      {cambio > 0.5 && dif !== 0 && (
        <div style={{ position: "absolute", left: Math.min(qv.x, 980), top: qv.y - 50, transform: "translateX(-50%)", ...mono(34, dif > 0 ? 1 : 0.6) }}>{`${dif > 0 ? "+" : "−"}${Math.abs(dif)} €`}</div>
      )}
      <Destello t={t} t0={tiradas[2].t0 + 0.81} o={0.18} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.grafico - 0.45} texto="paga *a veces*" size={116} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.grafico - 0.4} texto="te dan… y te *quitan*" size={96} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Operas: el contador de operaciones se dispara
const RAPIDO = paseo(80, 33, 0.5);
const Operas: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.05, 0], L(t, s, e, 5.2, 4.8), L(t, s, e, -0.2, 0.15) + sacude(t, EV.subidon - 0.05), L(t, s, e, 0.06, 0.1), { apertura: 35, centroY: 940 });
  const tr: Trazo[] = [...polvo(0.3)];
  const lo = Math.min(...RAPIDO);
  const hi = Math.max(...RAPIDO);
  const ys = RAPIDO.map((v) => -0.45 + ((v - lo) / (hi - lo)) * 0.9);
  const n = Math.round(L(t, s, e, 10, RAPIDO.length, (u) => u));
  velas(tr, ys, -0.9, 0.9, n, 0.016, 1, 0.025, true);
  // Una operación cada pocas velas: marca de entrada
  const ops = Math.round(L(t, s + 0.2, EV.subidon, 3, 37, (u) => u * u));
  for (let i = 3; i < n; i += 2) {
    if (ruido(i * 5.3) > 0.55) continue;
    tr.push({ t: "e", c: [-0.9 + (1.8 * i) / (RAPIDO.length - 1), ys[i] + 0.09, 0], r: 0.018, tipo: "aro", o: 0.9, luz: 0.5 });
  }
  const k = golpe(t, EV.subidon - 0.05);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Abajo top={1220}>
        <span style={{ ...mono(110), display: "inline-block", transform: `scale(${1 + 0.25 * k})` }}>{ops}</span>
        <span style={mono(26, 0.6)}>OPERACIONES HOY</span>
      </Abajo>
      <Destello t={t} t0={EV.subidon - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.subidon - 0.45} texto="operas *de más*" size={116} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.subidon - 0.4} texto="buscas el *subidón*" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Reglas: no es voluntad, son reglas; un bot no necesita dopamina
const robot = (tr: Trazo[], g: number, ojos: number) => {
  const k = Math.min(g, 1.05);
  for (const [a, b] of caja([-0.32 * k, -0.25 * k, -0.25 * k], [0.32 * k, 0.25 * k, 0.25 * k])) tr.push({ t: "l", a, b, w: 2, o: 1 });
  tr.push({ t: "l", a: [0, 0.25 * k, 0], b: [0, 0.45 * k, 0], w: 2, o: 1 });
  tr.push({ t: "e", c: [0, 0.48 * k, 0], r: 0.04 * k, tipo: "punto", o: 1, luz: 0.8 });
  for (const x of [-0.13, 0.13]) {
    const p: V3[] = [[(x - 0.06) * k, 0.02 * k, 0.26 * k], [(x + 0.06) * k, 0.02 * k, 0.26 * k], [(x + 0.06) * k, (0.02 + 0.1 * ojos) * k, 0.26 * k], [(x - 0.06) * k, (0.02 + 0.1 * ojos) * k, 0.26 * k]];
    tr.push({ t: "p", pts: [...p, p[0]], w: 1.6, o: 1, relleno: "#fff", oRelleno: 0.8, luz: 0.6 });
  }
  tr.push({ t: "l", a: [-0.14 * k, -0.12 * k, 0.26 * k], b: [0.14 * k, -0.12 * k, 0.26 * k], w: 2, o: 0.9 });
};
const Reglas: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0.05, 0], L(t, s, e, 4.4, 4.1), L(t, s, e, -0.35, 0.25) + sacude(t, EV.dopamina2 - 0.05, 0.02), L(t, s, e, 0.1, 0.14), { apertura: 35, centroY: 880 });
  const tr: Trazo[] = [...polvo(0.3)];
  const g = muelle(t, EV.bot - 0.4, 150, 14);
  // Parpadeo del robot
  const ojos = (t * 1.3) % 1 > 0.93 ? 0.15 : 1;
  if (g > 0) robot(tr, g, ojos);
  const k = golpe(t, EV.dopamina2 - 0.05);
  const reglas = ["SI SE CUMPLE → ENTRA", "SI NO → NADA", "SIN MIRAR EL GRÁFICO"];
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <div style={{ position: "absolute", top: L(t, EV.bot - 0.6, EV.bot - 0.2, 760, 1150), left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: 1 - L(t, EV.dopamina2 - 0.5, EV.dopamina2 - 0.2, 0, 1) }}>
        {reglas.map((r, i) => (
          <Teclea key={r} t={t} t0={s + 0.2 + i * 0.6} texto={r} size={40} o={0.95} cps={30} />
        ))}
      </div>
      {t >= EV.dopamina2 - 0.2 && (
        <div style={{ position: "absolute", top: 1230, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 16, alignItems: "baseline", transform: `scale(${1 + 0.25 * k})` }}>
          <span style={mono(26, 0.6)}>DOPAMINA</span>
          <span style={mono(110)}>0</span>
        </div>
      )}
      <Kicker t={t} t0={s + 0.05} texto="NI FUERZA DE VOLUNTAD NI SUBIDONES" />
      <Destello t={t} t0={EV.dopamina2 - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.bot - 0.45} texto="son *reglas*" size={120} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.bot - 0.4} texto="un *bot* no la necesita" size={92} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta al final
const Pregunta: React.FC<P> = (p) => <PreguntaComentarios {...p} lineas={["¿cuántas veces", "has mirado el *gráfico*?"]} kicker="SÉ SINCERO" size={80} />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, dopamina: Dopamina, sigueme: Sigueme, patron: Patron, operas: Operas, reglas: Reglas, pregunta: Pregunta };
export const CLAVES = claves(["tragaperras", "truco", "enganchando", "dopamina", "premio", "sabe", "sígueme", "patrón", "engancha", "quitan", "operas", "subidón", "reglas", "bot", "hoy"]);

export const DopaminaReel: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/dopamina_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />;
