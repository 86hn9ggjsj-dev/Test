// Reel de alcance "¿Cuántas pérdidas seguidas aguanta tu cuenta?" (~38 s): una cuenta que pierde un trozo con cada ✕
// hasta la mitad, el deslizador del riesgo por operación, el «sígueme» a mitad, tres columnas (10 %, 5 %, 1 %) que
// llegan a la mitad en 7, 14 y 69 pérdidas, 7 ✕ frente a 69 ✕ y la pregunta a los espectadores al final.
// Tiempos en src/gen/aguanta.json (scripts/aguanta.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/aguanta.json";
import { salida } from "../Premium/ui";
import { ANCHO } from "../Viral/util";
import { Arriba, Etiqueta, L, mono, muelle, Titular } from "../Bot/piezas";
import { Escena, orbita, polvo, proyector, Trazo } from "../Bot/tres";
import { cristal, fondoTinte, ORO, ROJO, suelo, VERDE } from "../Bot/kit";
import { claves, CtaSeguir, Destello, golpe, Kicker, Montaje, P, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const AGUANTA_FPS = datos.fps;
export const AGUANTA_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const BASE = -0.8;
const H = 1.3;
const MITAD = BASE + H / 2;

// Columna de cristal: verde mientras está por encima de la mitad, roja al llegar
const columna = (tr: Trazo[], x: number, h: number, ancho: number, luz = 0.2, color?: string) =>
  cristal(tr, [x - ancho, BASE, -ancho], [x + ancho, BASE + h, ancho], color ?? (BASE + h > MITAD + 0.01 ? VERDE : ROJO), 1, luz, 0.14);
const lineaMitad = (tr: Trazo[], x0 = -1.0, x1 = 1.0) => tr.push({ t: "l", a: [x0, MITAD, 0], b: [x1, MITAD, 0], w: 2, o: 0.9, dash: "8 6", color: ORO, luz: 0.4 });

// ------------------------------------------------------------------ 1. Hook: una cuenta que baja pérdida a pérdida hasta la mitad
const Hook: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.15, 0], L(t, s, e, 6.2, 5.8), L(t, s, e, -0.35, 0.05) + sacude(t, EV.cosa - 0.1, 0.02), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, BASE, 0.2, ROJO);
  const n = Math.floor(L(t, 0.3, EV.cosa - 0.2, 0, 7, (u) => u));
  const g = muelle(t, -0.6, 160, 15);
  columna(tr, 0, H * Math.pow(0.9, n) * Math.min(g, 1.05), 0.35, 0.2 + 0.5 * golpe(t, EV.cosa - 0.2));
  lineaMitad(tr, -0.8, 0.8);
  const pr = proyector(cam);
  const q = pr([0.8, MITAD, 0]);
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      <Etiqueta t={t} t0={0} x={Math.min(q.x, 1040)} y={q.y - 26} size={24} o={0.75} alinea="der">
        <span style={{ color: ORO }}>LA MITAD</span>
      </Etiqueta>
      <div style={{ position: "absolute", top: 450, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 10 }}>
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} style={{ ...mono(52), color: ROJO, opacity: i < n ? 1 : 0.15 }}>
            ✕
          </span>
        ))}
      </div>
      <Arriba>
        <Titular t={t} t0={-0.6} texto="¿cuántas *aguantas*?" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Riesgo: depende de cuánto arriesgas por operación
const Riesgo: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], 9, L(t, s, e, -0.2, 0.2), 0.2, { apertura: 40 });
  const g = L(t, s, s + 0.4, 0, 1, salida);
  const v = 5.5 + 4.5 * Math.sin((t - s) * 2.4);
  const X0 = 140;
  const X1 = 940;
  const xv = X0 + ((X1 - X0) * (v - 1)) / 9;
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <div style={{ position: "absolute", top: 760, left: X0, width: X1 - X0, height: 4, background: "rgba(255,255,255,0.5)", opacity: g }} />
      {[1, 5, 10].map((m) => (
        <div key={m} style={{ position: "absolute", top: 800, left: X0 + ((X1 - X0) * (m - 1)) / 9, transform: "translateX(-50%)", opacity: g, ...mono(30, 0.7) }}>{`${m} %`}</div>
      ))}
      <div style={{ position: "absolute", top: 740, left: xv, width: 44, height: 44, marginLeft: -22, borderRadius: 22, background: "#fff", opacity: g, boxShadow: "0 0 30px rgba(255,255,255,0.6)" }} />
      <div style={{ position: "absolute", top: 600, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: g, ...mono(90) }}>{`${v.toFixed(1).replace(".", ",")} %`}</div>
      <div style={{ position: "absolute", top: 900, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: g, ...mono(30, 0.7) }}>RIESGO POR OPERACIÓN</div>
      <Arriba>
        <Titular t={t} t0={s + 0.05} texto="tu *riesgo*" size={120} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Sígueme a mitad
const Sigueme: React.FC<P> = (p) => <CtaSeguir {...p} lema="SI TE ESTÁ SIRVIENDO" />;

// ------------------------------------------------------------------ 4. Cuenta: 10 % → 7, 5 % → 14, 1 % → 69 pérdidas hasta la mitad
const COLS = [
  { x: -0.6, r: 0.1, n: 7, txt: "10 %" },
  { x: 0, r: 0.05, n: 14, txt: "5 %" },
  { x: 0.6, r: 0.01, n: 69, txt: "1 %" },
];
const Cuenta: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, -0.15, 0], L(t, s, e, 6.6, 6.2), L(t, s, e, -0.25, 0.1) + sacude(t, EV.sesentaynueve - 0.05), L(t, s, e, 0.14, 0.2), { apertura: 35, centroY: 980 });
  const tr: Trazo[] = [...polvo(0.25)];
  suelo(tr, t, BASE, 0.18, "#fff", 0.4);
  const tramos = [
    [EV.diez, EV.mitad2],
    [EV.cinco, EV.catorce],
    [EV.uno, EV.sesentaynueve],
  ];
  const ns = COLS.map((c, i) => Math.floor(L(t, tramos[i][0], tramos[i][1], 0, c.n, (u) => u)));
  const g = muelle(t, s + 0.05, 170, 15);
  COLS.forEach((c, i) => {
    const act = t >= tramos[i][0] - 0.2;
    columna(tr, c.x, H * Math.pow(1 - c.r, ns[i]) * Math.min(g, 1.05), 0.17, act ? 0.2 + 0.6 * golpe(t, tramos[i][1] - 0.05) : 0.1);
  });
  lineaMitad(tr);
  const pr = proyector(cam);
  const k = [golpe(t, EV.mitad2 - 0.05), golpe(t, EV.catorce - 0.05), golpe(t, EV.sesentaynueve - 0.05)];
  return (
    <>
      <Escena cam={cam} trazos={tr} />
      {COLS.map((c, i) => {
        const top = pr([c.x, BASE + H * Math.pow(1 - c.r, ns[i]), 0.17]);
        const bajo = pr([c.x, BASE, 0.17]);
        const act = t >= tramos[i][0] - 0.2;
        return (
          <div key={i}>
            <div style={{ position: "absolute", left: top.x, top: top.y - 70, transform: `translateX(-50%) scale(${1 + 0.3 * k[i]})`, opacity: act ? 1 : 0.3, ...mono(52), color: ns[i] === c.n ? ROJO : "#fff" }}>{`${ns[i]} ✕`}</div>
            <div style={{ position: "absolute", left: bajo.x, top: bajo.y + 22, transform: "translateX(-50%)", opacity: act ? 1 : 0.4, ...mono(32) }}>{c.txt}</div>
          </div>
        );
      })}
      <Kicker t={t} t0={s + 0.05} texto="PÉRDIDAS SEGUIDAS HASTA LA MITAD" />
      <Destello t={t} t0={EV.sesentaynueve - 0.05} o={0.15} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.cinco - 0.35} texto="10 % → *7*" size={120} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.cinco - 0.3} fin={EV.uno - 0.35} texto="5 % → *14*" size={120} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.uno - 0.3} texto="1 % → *69*" size={120} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 5. Giro: 7 le pasan a cualquiera; 69, casi a nadie
const Giro: React.FC<P> = ({ t, s, e }) => {
  const cam = orbita([0, 0, 0], 9, L(t, s, e, -0.2, 0.2) + sacude(t, EV.vivo - 0.05), 0.2, { apertura: 40 });
  const siete = L(t, s + 0.1, s + 0.6, 0, 1, salida);
  const n69 = Math.floor(L(t, EV.nadie - 0.6, EV.nadie + 0.2, 0, 69, (u) => u));
  const fuera = L(t, EV.ganas - 0.5, EV.ganas - 0.2, 0, 1);
  const k = golpe(t, EV.vivo - 0.05);
  return (
    <>
      <Escena cam={cam} trazos={polvo(0.35)} />
      <div style={{ position: "absolute", top: 500, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: siete * (1 - 0.75 * fuera) }}>
        <span style={{ ...mono(80), color: ROJO }}>✕✕✕✕✕✕✕</span>
        <span style={mono(28, 0.75)}>LE PASA A CUALQUIERA</span>
      </div>
      <div style={{ position: "absolute", top: 760, left: 140, width: 800, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 4, opacity: 1 - 0.75 * fuera }}>
        {Array.from({ length: n69 }, (_, i) => (
          <span key={i} style={{ ...mono(30, 0.7), color: VERDE }}>
            ✕
          </span>
        ))}
      </div>
      <div style={{ position: "absolute", top: 1010, left: 0, width: ANCHO, display: "flex", justifyContent: "center", opacity: L(t, EV.nadie, EV.nadie + 0.3, 0, 1) * (1 - 0.75 * fuera), ...mono(28, 0.75) }}>CASI A NADIE</div>
      <div style={{ position: "absolute", top: 1180, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: L(t, EV.ganas - 0.3, EV.ganas, 0, 1, salida) }}>
        <span style={mono(34, 0.75)}>ESTRATEGIA → CUÁNTO GANAS</span>
        <span style={{ ...mono(40), color: ORO, opacity: L(t, EV.vivo - 1.0, EV.vivo - 0.6, 0.2, 1), display: "inline-block", transform: `scale(${1 + 0.15 * k})` }}>RIESGO → SI SIGUES VIVO</span>
      </div>
      <Destello t={t} t0={EV.vivo - 0.05} o={0.12} />
      <Arriba>
        <Titular t={t} t0={s + 0.1} fin={EV.ganas - 0.4} texto="*7* sí · *69* no" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.ganas - 0.35} texto="¿sigues *vivo*?" size={116} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Pregunta al final
const Pregunta: React.FC<P> = (p) => <PreguntaComentarios {...p} lineas={["¿cuánto arriesgas", "*tú*?"]} kicker="Y DIME" />;

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, riesgo: Riesgo, sigueme: Sigueme, cuenta: Cuenta, giro: Giro, pregunta: Pregunta };
export const CLAVES = claves([["mitad", ORO], "cosa", "arriesgas", "sígueme", ["10%", ROJO], ["7", ROJO], "5%", "14", ["1%", VERDE], ["69", VERDE], "cualquiera", "nadie", "ganas", ["vivo", ORO], "comentarios"]);

export const Aguanta: React.FC = () => (
  <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/aguanta_mezcla.wav" piezas={PIEZAS} claves={CLAVES} fondo={fondoTinte("#3a0c14")} transicion="variada" vineta />
);
