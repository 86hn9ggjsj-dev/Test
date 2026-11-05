// Reel de alcance "Test de diez segundos: ¿trading o apuesta?" (~35 s), en blanco y negro con toques puntuales de verde y
// rojo, mezclando el stickman 2D y gráficos: elige entre la tarjeta de trading y la de apuesta, pulsa COMPRAR sin saber
// el riesgo, dos pulsos (ganando tranquilo, perdiendo desbocado), el «sígueme» a mitad, el stickman aburrido que abre una
// operación por aburrimiento, la pantalla convertida en tragaperras y trader frente a apostador (antes / después).
// Tiempos en src/gen/apostando.json (scripts/apostando.py).
import { useCurrentFrame } from "remotion";
import datos from "../gen/apostando.json";
import { ANCHO } from "../Viral/util";
import { Arriba, L, mono, muelle, Titular } from "../Bot/piezas";
import { ROJO, VERDE } from "../Bot/kit";
import { cabezaPx, Clave, cuerpoEn, Estado, R_CABEZA, Stick } from "../Bot/stick";
import { Camara, PANT, Pantalla, Reloj, Suelo, SUELO_Y } from "../Bot/plato";
import { Bocadillo, camara, CHOQUE, ENCOGE, ESC, Exclama, FlashRojo, MANOS_CABEZA, OX, Polvo, SiguemeStick } from "../Bot/comun";
import { claves, golpe, Kicker, Montaje, P, paseo, PreguntaComentarios, sacude } from "../Explica/Montaje";

export const APOSTANDO_FPS = datos.fps;
export const APOSTANDO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const inicio = (id: string) => datos.escenas.find((x) => x.id === id)!.s;
const fr = (v: number) => ((v % 1) + 1) % 1;

// ------------------------------------------------------------------ 1. Hook: ¿trading o apuesta? Mira una tarjeta, la otra, y se agobia
const Tarjeta: React.FC<{ x0: number; titulo: string; g: number; foco: number; children: React.ReactNode }> = ({ x0, titulo, g, foco, children }) => (
  <div
    style={{
      position: "absolute",
      left: x0,
      top: 520,
      width: 410,
      height: 280,
      borderRadius: 26,
      border: `3px solid rgba(255,255,255,${0.45 + 0.55 * foco})`,
      background: "#050505",
      opacity: Math.min(Math.max(g, 0) * 1.5, 1),
      transform: `scale(${(0.7 + 0.3 * Math.min(Math.max(g, 0), 1.1)) * (1 + 0.04 * foco)})`,
      boxShadow: foco > 0.05 ? `0 0 ${40 * foco}px rgba(255,255,255,0.25)` : undefined,
    }}
  >
    <div style={{ position: "absolute", top: 22, left: 0, width: "100%", textAlign: "center", ...mono(30, 0.9) }}>{titulo}</div>
    {children}
  </div>
);
const GLIFOS = ["7", "$", "?", "€", "7", "★"];
const HOOK: Clave[] = [
  [EV.trading - 0.25, { mira: -1, cabeza: -0.06, mIx: -0.5, mIy: 0.05, cejas: 0.3, boca: 0.3 }],
  [EV.apostando - 0.25, { mira: 1, cabeza: 0.06, mIx: -0.15, mIy: -0.52, mDx: 0.5, mDy: 0.05 }],
  [EV.rapido - 0.3, { mira: 0, cabeza: 0, mDx: 0.12, mDy: 0.3, cejas: -0.6, boca: -0.3, agobio: 0.7, ojos: 1.2 }],
];
const Hook: React.FC<P> = (p) => {
  const { t, s, e } = p;
  const c = cuerpoEn(t, HOOK, { boca: 0.2 });
  const focoI = L(t, EV.trading - 0.2, EV.trading, 0, 1) * (1 - L(t, EV.apostando - 0.3, EV.apostando - 0.1, 0, 1));
  const focoD = L(t, EV.apostando - 0.2, EV.apostando, 0, 1) * (1 - L(t, EV.rapido - 0.3, EV.rapido, 0, 1));
  const gira = t < EV.rapido;
  return (
    <>
      <Polvo {...p} />
      <Camara {...camara(t, s, e)}>
        <Suelo />
        <Tarjeta x0={80} titulo="TRADING" g={muelle(t, EV.trading - 0.3, 220, 14)} foco={focoI}>
          <svg width={410} height={280} style={{ position: "absolute", inset: 0 }}>
            {[0, 1, 2, 3, 4].map((i) => {
              const sube = i !== 2;
              const base = 220 - i * 22;
              return (
                <g key={i}>
                  <line x1={95 + i * 55} x2={95 + i * 55} y1={base - 70} y2={base + 8} stroke="#fff" strokeWidth={2.4} />
                  <rect x={80 + i * 55} y={base - 58} width={30} height={50} rx={3} fill={sube ? "#fff" : "#050505"} stroke="#fff" strokeWidth={2.4} />
                </g>
              );
            })}
          </svg>
        </Tarjeta>
        <Tarjeta x0={590} titulo="APUESTA" g={muelle(t, EV.apostando - 0.3, 220, 14)} foco={focoD}>
          <div style={{ position: "absolute", top: 92, left: 0, width: "100%", display: "flex", justifyContent: "center", gap: 18 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 92, height: 130, borderRadius: 14, border: "3px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", ...mono(76), fontWeight: 700 }}>
                {gira ? GLIFOS[Math.floor(t * 14 + i * 2) % GLIFOS.length] : "7"}
              </div>
            ))}
          </div>
        </Tarjeta>
        <Stick c={c} ox={540} oy={SUELO_Y} s={330} t={t} />
      </Camara>
      <Kicker t={t} t0={0.05} texto="TEST · 10 SEGUNDOS" />
      <Arriba>
        <Titular t={t} t0={-0.6} fin={EV.trading - 0.45} texto="test de *10 segundos*" size={96} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.trading - 0.4} texto="¿*trading* o apuesta?" size={100} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 2. Pregunta 1: pulsa COMPRAR sin saber cuánto puede perder
const s1 = inicio("una");
const SERIE1 = paseo(20, 21, 0.45, 0.05);
const UNA: Clave[] = [
  [s1 + 0.05, { mDx: 0.5, mDy: -0.05, cejas: 0.3, boca: 0.5, ojos: 1.1, incl: 0.06 }],
  [EV.entrar - 0.25, { ...ENCOGE, mira: 0, incl: 0, boca: -0.3 }],
];
const Una: React.FC<P> = (p) => {
  const { t, s, e } = p;
  const c = cuerpoEn(t, UNA, { mira: 0.8, incl: 0.04 }, s - 0.3);
  const pulsa = golpe(t, s + 0.45);
  const riesgo = muelle(t, EV.perder - 0.2, 240, 12);
  const late = 1 + 0.08 * Math.sin((t - s) * 9);
  return (
    <>
      <Polvo {...p} />
      <Camara {...camara(t, s, e)}>
        <Suelo />
        <Pantalla
          serie={SERIE1}
          hijos={
            <div style={{ position: "absolute", left: PANT.x1 - 190, top: PANT.y1 - 86, width: 160, padding: "10px 0", textAlign: "center", borderRadius: 14, border: "3px solid #fff", background: pulsa > 0.05 ? "#fff" : "#000", color: pulsa > 0.05 ? "#000" : "#fff", transform: `scale(${1 - 0.08 * pulsa})`, ...mono(30), fontWeight: 700 }}>COMPRAR</div>
          }
        />
        {riesgo > 0 && (
          <div style={{ position: "absolute", left: PANT.x0, width: PANT.x1 - PANT.x0, top: PANT.y0 - 118, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: Math.min(riesgo * 1.5, 1) }}>
            <div style={mono(22, 0.55)}>RIESGO DE ESTA OPERACIÓN</div>
            <div style={{ ...mono(64), color: ROJO, transform: `scale(${(0.7 + 0.3 * Math.min(riesgo, 1.1)) * late})` }}>¿ ? €</div>
          </div>
        )}
        <Stick c={c} ox={OX} oy={SUELO_Y} s={ESC} t={t} />
        <Exclama t={t} t0={EV.entrar - 0.15} c={c} signo="?" dura={0.9} />
      </Camara>
      <Kicker t={t} t0={s + 0.02} texto="PREGUNTA 1" />
      <Arriba>
        <Titular t={t} t0={s + 0.05} texto="¿sabes cuánto *pierdes*?" size={92} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 3. Pregunta 2: ganando el pulso va tranquilo; perdiendo se desboca (sin stickman)
const fase = (tiempo: number, t0: number, lpm0: number, lpm1: number) => (tiempo < t0 ? (tiempo * lpm0) / 60 : (t0 * lpm0) / 60 + ((tiempo - t0) * lpm1) / 60);
const latido = (u: number) => {
  if (u < 0.36) return 0.04 * Math.sin(u * 40);
  if (u < 0.4) return ((u - 0.36) / 0.04) * 1;
  if (u < 0.44) return 1 - ((u - 0.4) / 0.04) * 1.5;
  if (u < 0.48) return -0.5 + ((u - 0.44) / 0.04) * 0.5;
  if (u < 0.6) return 0.18 * Math.sin(((u - 0.48) / 0.12) * Math.PI);
  return 0.03 * Math.sin(u * 30);
};
const Pulso: React.FC<{ x0: number; y0: number; w: number; h: number; t: number; t0: number; lpm0: number; lpm1: number; color: string }> = ({ x0, y0, w, h, t, t0, lpm0, lpm1, color }) => {
  const pts = Array.from({ length: 141 }, (_, i) => {
    const tiempo = t - 2 + (2 * i) / 140;
    const y = y0 + h / 2 - (h / 2) * 0.9 * latido(fr(fase(tiempo, t0, lpm0, lpm1)));
    return `${(x0 + (w * i) / 140).toFixed(1)},${y.toFixed(1)}`;
  });
  const ultimo = pts[pts.length - 1].split(",").map(Number);
  return (
    <>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={ultimo[0]} cy={ultimo[1]} r={8} fill={color} />
    </>
  );
};
const Panel: React.FC<{ x0: number; titulo: string; punto: string; t: number; t0: number; lpm0: number; lpm1: number; color: string; ops: number; lote: number; g: number; tiembla: number }> = ({ x0, titulo, punto, t, t0, lpm0, lpm1, color, ops, lote, g, tiembla }) => (
  <div style={{ position: "absolute", left: x0 + tiembla, top: 540, width: 450, height: 640, borderRadius: 28, border: `3px solid ${color === "#fff" ? "rgba(255,255,255,0.8)" : color}`, background: "#050505", opacity: Math.min(Math.max(g, 0) * 1.5, 1), transform: `scale(${0.7 + 0.3 * Math.min(Math.max(g, 0), 1.1)})` }}>
    <div style={{ position: "absolute", top: 30, left: 0, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 14, ...mono(34) }}>
      <span style={{ width: 16, height: 16, borderRadius: 8, background: punto, display: "inline-block" }} />
      {titulo}
    </div>
    <svg width={450} height={640} style={{ position: "absolute", inset: 0 }}>
      <Pulso x0={30} y0={110} w={390} h={190} t={t} t0={t0} lpm0={lpm0} lpm1={lpm1} color={color} />
    </svg>
    <div style={{ position: "absolute", top: 330, left: 0, width: "100%", textAlign: "center", ...mono(24, 0.55) }}>OPERACIONES</div>
    <div style={{ position: "absolute", top: 368, left: 0, width: "100%", textAlign: "center", ...mono(110), color }}>{ops}</div>
    <div style={{ position: "absolute", top: 530, left: 0, width: "100%", textAlign: "center", ...mono(40), color }}>{`LOTE ×${lote}`}</div>
  </div>
);
const Dos: React.FC<P> = (p) => {
  const { t, s, e } = p;
  const loco = t >= EV.perdiendo - 0.15;
  const k = golpe(t, EV.perdiendo - 0.1);
  const opsD = loco ? Math.min(14, 1 + Math.floor((t - EV.perdiendo + 0.15) * 14)) : 1;
  const loteD = loco ? [1, 2, 4, 8][Math.min(3, Math.floor((t - EV.perdiendo + 0.15) * 5))] : 1;
  const tiembla = loco ? 6 * Math.sin(t * 70) * (0.4 + 0.6 * k) : 0;
  return (
    <>
      <Polvo {...p} />
      <Camara zoom={L(t, s, e, 1, 1.04) + 0.03 * k} dx={sacude(t, EV.perdiendo - 0.1, 0.03) * 420}>
        <Panel x0={70} titulo="GANANDO" punto={VERDE} t={t} t0={99} lpm0={66} lpm1={66} color="#fff" ops={t > EV.ganando ? 2 : 1} lote={1} g={muelle(t, EV.ganando - 0.45, 200, 14)} tiembla={0} />
        <Panel x0={560} titulo="PERDIENDO" punto={ROJO} t={t} t0={EV.perdiendo - 0.15} lpm0={66} lpm1={190} color={loco ? ROJO : "#fff"} ops={opsD} lote={loteD} g={muelle(t, EV.perdiendo - 0.55, 200, 14)} tiembla={tiembla} />
      </Camara>
      <FlashRojo t={t} t0={EV.perdiendo - 0.1} o={0.12} />
      <Kicker t={t} t0={s + 0.02} texto="PREGUNTA 2" />
      <Arriba>
        <Titular t={t} t0={s + 0.05} texto="¿operas *igual*?" size={110} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 4. Sígueme a mitad
const Sigueme: React.FC<P> = (p) => <SiguemeStick {...p} lema="LA TRES PILLA A CASI TODOS" />;

// ------------------------------------------------------------------ 5. Pregunta 3: se aburre, bosteza y abre una operación… que sale roja
const s3 = inicio("tres");
const PLANA = [...Array.from({ length: 20 }, (_, i) => 100 + 0.12 * Math.sin(i * 1.7) + 0.05 * Math.cos(i * 3.1)), 97.6];
const TRES: Clave[] = [
  [s3 + 0.1, { mDx: 0.3, mDy: -0.12, mIx: -0.15, mIy: -0.52 }],
  [EV.abierto - 0.35, { abre: 0.95, boca: 0, ojos: 0.15, mIx: -0.18, mIy: 0.52, cejas: 0.4, agacha: 0 }],
  [EV.abierto + 0.55, { abre: 0, ojos: 0.5, mIx: -0.15, mIy: -0.52, cejas: -0.2, agacha: 0.2 }],
  [EV.aburrias - 0.75, { mira: 0.9, ojos: 1, cejas: 0.6, boca: 0.5, mDx: 0.5, mDy: -0.05, agacha: 0, y: 0.79, incl: 0.06 }],
  [EV.aburrias - 0.05, { ...CHOQUE, incl: -0.07 }],
  [EV.aburrias + 0.35, { ...MANOS_CABEZA }],
];
const Tres: React.FC<P> = (p) => {
  const { t, s, e } = p;
  const base = cuerpoEn(t, TRES, { mira: 0.6, ojos: 0.55, boca: -0.2, cejas: -0.2, y: 0.76, agacha: 0.2, x: 0.04 }, s - 0.3);
  // Tamborilea con los dedos mientras se aburre
  const aburre = t < EV.aburrias - 0.8;
  const c: Estado = aburre ? { ...base, mDy: base.mDy + 0.025 * Math.sin(t * 22) } : base;
  const compra = golpe(t, EV.aburrias - 0.2);
  const [hx, hy] = cabezaPx(c, OX, SUELO_Y, ESC);
  return (
    <>
      <Polvo {...p} />
      <Camara {...camara(t, s, e, EV.aburrias - 0.05)}>
        <Suelo />
        <Pantalla
          serie={PLANA}
          n={t < EV.aburrias - 0.05 ? PLANA.length - 1 : PLANA.length}
          ultima={ROJO}
          k={L(t, EV.aburrias - 0.05, EV.aburrias + 0.15, 0, 1)}
          hijos={
            <div style={{ position: "absolute", left: PANT.x1 - 190, top: PANT.y1 - 86, width: 160, padding: "10px 0", textAlign: "center", borderRadius: 14, border: "3px solid #fff", background: compra > 0.05 ? "#fff" : "#000", color: compra > 0.05 ? "#000" : "#fff", ...mono(30), fontWeight: 700 }}>COMPRAR</div>
          }
        />
        <Reloj x={PANT.x1 - 56} y={PANT.y0 + 68} r={30} t={t - s} vel={1.2} />
        <Stick c={c} ox={OX} oy={SUELO_Y} s={ESC} t={t} />
        {/* Zzz que suben mientras se aburre */}
        {aburre &&
          [0, 1, 2].map((i) => {
            const u = fr((t - s) / 1.4 + i / 3);
            return (
              <div key={i} style={{ position: "absolute", left: hx - 150 - u * 50, top: hy - R_CABEZA * ESC - 40 - u * 170, opacity: Math.sin(u * Math.PI) * 0.9, ...mono(40 + 24 * u), fontWeight: 700 }}>
                z
              </div>
            );
          })}
        <Exclama t={t} t0={EV.aburrias - 0.05} c={c} />
      </Camara>
      <FlashRojo t={t} t0={EV.aburrias - 0.05} o={0.18} />
      <Kicker t={t} t0={s + 0.02} texto="PREGUNTA 3" />
      <Arriba>
        <Titular t={t} t0={s + 0.05} fin={EV.abierto + 0.55} texto="¿has *abierto* una…" size={100} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.abierto + 0.6} texto="porque te *aburrías*?" size={96} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 6. Giro: si fallas una es un casino con gráficos bonitos; trader frente a apostador
const PREGUNTAS = ["SABES LO QUE PIERDES", "OPERAS IGUAL", "NO OPERAS POR ABURRIMIENTO"];
const SIMBOLOS = ["sube", "baja", "7", "sube", "baja", "7"];
const Simbolo: React.FC<{ tipo: string; cx: number; cy: number; rojo?: boolean }> = ({ tipo, cx, cy, rojo }) => {
  const col = rojo ? ROJO : "#fff";
  if (tipo === "7")
    return (
      <text x={cx} y={cy + 26} textAnchor="middle" fill="#fff" style={{ ...mono(78), fontWeight: 700 }}>
        7
      </text>
    );
  const sube = tipo === "sube";
  return (
    <g>
      <line x1={cx} x2={cx} y1={cy - 46} y2={cy + 46} stroke={col} strokeWidth={4} />
      <rect x={cx - 22} y={cy - 32} width={44} height={64} rx={4} fill={sube || rojo ? col : "#050505"} stroke={col} strokeWidth={4} />
    </g>
  );
};
const Rodillo: React.FC<{ i: number; t: number; t0: number; para: number }> = ({ i, t, t0, para }) => {
  const x = 290 + i * 175;
  const y0 = 770;
  const alto = 220;
  const paso = 175;
  const vel = 9; // símbolos por segundo
  const giro = (tt: number) => vel * Math.max(0, tt - t0);
  // Se detiene en una vela roja que baja (índice 1 del ciclo)
  const final = Math.ceil((giro(para) + 3) / 6) * 6 + 1;
  const pos = t < para - 0.5 ? giro(t) : (() => {
    const a = giro(para - 0.5);
    const u = Math.min(1, (t - (para - 0.5)) / 0.5);
    return a + (final - a) * (1 - Math.pow(1 - u, 3));
  })();
  const parado = t >= para;
  const k0 = Math.floor(pos);
  return (
    <g>
      <clipPath id={`rodillo${i}`}>
        <rect x={x} y={y0} width={150} height={alto} rx={14} />
      </clipPath>
      <rect x={x} y={y0} width={150} height={alto} rx={14} fill="#050505" stroke={parado ? ROJO : "#fff"} strokeWidth={3} />
      <g clipPath={`url(#rodillo${i})`}>
        {[-1, 0, 1, 2].map((d) => {
          const k = k0 + d;
          const tipo = SIMBOLOS[((k % 6) + 6) % 6];
          const cy = y0 + alto / 2 + (pos - k) * paso;
          return <Simbolo key={d} tipo={tipo} cx={x + 75} cy={cy} rojo={parado && k === final} />;
        })}
      </g>
    </g>
  );
};
const sG = inicio("giro");
const T_B = EV.sabe - 0.35; // cambio a trader frente a apostador
const TRADER: Clave[] = [[EV.sabe + 0.1, { cabeza: 0.08 }], [EV.sabe + 0.35, { cabeza: 0 }]];
const APOSTADOR: Clave[] = [
  [EV.despues - 0.1, { ...CHOQUE }],
  [EV.despues + 0.3, { ...MANOS_CABEZA }],
];
const Giro: React.FC<P> = (p) => {
  const { t, s, e } = p;
  const aO = 1 - L(t, T_B - 0.2, T_B + 0.1, 0, 1);
  const bO = L(t, T_B, T_B + 0.3, 0, 1);
  const casino = muelle(t, EV.casino - 0.2, 180, 14);
  const lista = 1 - L(t, EV.casino - 0.5, EV.casino - 0.25, 0, 1);
  const palanca = t < EV.casino - 0.1 ? 0 : Math.max(0, Math.sin(Math.min(1, (t - EV.casino + 0.1) / 0.5) * Math.PI));
  const bombillas = Math.floor(t * 8) % 2;
  const trader = cuerpoEn(t, TRADER, { mIx: 0.13, mIy: -0.17, mDx: -0.13, mDy: -0.17, boca: 0.5, ojos: 0.9, mira: 0.3 }, T_B - 0.3);
  const apBase = cuerpoEn(t, APOSTADOR, { boca: 0.8, ojos: 1.1, cejas: 0.4, mIx: -0.27, mIy: 0.48, mDx: 0.27, mDy: 0.48, mira: -0.3 }, T_B - 0.3);
  // El apostador baila tan contento hasta que ve la cuenta
  const baila = t < EV.despues - 0.1 ? Math.sin(t * 7) : 0;
  const apostador: Estado = { ...apBase, x: apBase.x + 0.04 * baila, mIy: apBase.mIy + 0.08 * baila, mDy: apBase.mDy - 0.08 * baila };
  const [ax, ay] = cabezaPx(apostador, 800, SUELO_Y, 250);
  const pierde = muelle(t, EV.despues - 0.05, 240, 11);
  return (
    <>
      <Polvo {...p} />
      <Camara {...camara(t, s, e, t < T_B ? EV.casino - 0.1 : EV.despues - 0.05)}>
        {/* A: lista de las tres preguntas, con la que falla en rojo */}
        {lista > 0.01 && aO > 0.01 && (
          <div style={{ position: "absolute", top: 640, left: 110, display: "flex", flexDirection: "column", gap: 34, opacity: lista * aO }}>
            {PREGUNTAS.map((q, i) => {
              const falla = i === 2;
              const marca = falla ? muelle(t, EV.fallado - 0.1, 260, 12) : muelle(t, s + 0.15 + i * 0.12, 260, 14);
              return (
                <div key={q} style={{ display: "flex", alignItems: "center", gap: 26, opacity: L(t, s + i * 0.1, s + 0.25 + i * 0.1, 0, 1) }}>
                  <div style={{ width: 70, height: 70, borderRadius: 14, border: `3px solid ${falla && marca > 0 ? ROJO : "#fff"}`, display: "flex", alignItems: "center", justifyContent: "center", ...mono(52), fontWeight: 700, color: falla ? ROJO : "#fff" }}>
                    <span style={{ transform: `scale(${Math.min(Math.max(marca, 0), 1.2)})` }}>{falla ? "✗" : "✓"}</span>
                  </div>
                  <span style={mono(36)}>{q}</span>
                </div>
              );
            })}
          </div>
        )}
        {/* A: la pantalla convertida en tragaperras */}
        {casino > 0.01 && aO > 0.01 && (
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: Math.min(casino * 1.5, 1) * aO }}>
            <g transform={`translate(540 860) scale(${0.75 + 0.25 * Math.min(casino, 1.1)}) translate(-540 -860)`}>
              <rect x={240} y={600} width={600} height={540} rx={40} fill="#050505" stroke="#fff" strokeWidth={4} />
              <rect x={280} y={630} width={520} height={100} rx={20} fill="#000" stroke="#fff" strokeWidth={3} />
              <text x={540} y={700} textAnchor="middle" fill="#fff" style={{ ...mono(58), fontWeight: 700 }}>
                TRADING
              </text>
              {Array.from({ length: 16 }, (_, i) => {
                const x = i < 8 ? 300 + i * 68.5 : 300 + (i - 8) * 68.5;
                const y = i < 8 ? 622 : 738;
                return <circle key={i} cx={x} cy={y} r={6} fill="#fff" opacity={(i + bombillas) % 2 ? 1 : 0.25} />;
              })}
              {[0, 1, 2].map((i) => (
                <Rodillo key={i} i={i} t={t} t0={EV.casino - 0.1} para={EV.bonitos + 0.15 + i * 0.25} />
              ))}
              <rect x={300} y={1030} width={480} height={70} rx={14} fill="none" stroke="#fff" strokeWidth={3} opacity={0.6} />
              <line x1={870} x2={870} y1={880} y2={880 - 190 * (1 - palanca) + 190 * palanca * 0.4} stroke="#fff" strokeWidth={6} strokeLinecap="round" />
              <circle cx={870} cy={880 - 190 * (1 - palanca) + 190 * palanca * 0.4} r={24} fill="#fff" />
            </g>
          </svg>
        )}
        {/* B: trader (sabe antes) frente a apostador (lo descubre después) */}
        {bO > 0.01 && (
          <>
            <Suelo />
            <div style={{ position: "absolute", top: 640, left: 0, width: ANCHO, display: "flex", opacity: bO }}>
              {[
                ["TRADER", "ANTES DE ENTRAR"],
                ["APOSTADOR", "DESPUÉS"],
              ].map(([a, b], i) => (
                <div key={a} style={{ width: ANCHO / 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: i === 1 ? L(t, EV.apostador - 0.3, EV.apostador, 0.35, 1) : 1 }}>
                  <span style={{ ...mono(40), fontWeight: 700 }}>{a}</span>
                  <span style={{ ...mono(24, 0.6), padding: "6px 16px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.5)" }}>{b}</span>
                </div>
              ))}
            </div>
            <div style={{ position: "absolute", left: 540, top: 700, width: 2, height: 680, background: "rgba(255,255,255,0.25)", opacity: bO }} />
            <Stick c={trader} ox={280} oy={SUELO_Y} s={250} t={t} o={bO} />
            <Stick c={apostador} ox={800} oy={SUELO_Y} s={250} t={t + 1.3} o={bO} />
            <Bocadillo t={t} t0={EV.sabe + 0.15} c={trader} ox={280} s={250} texto="MÁX. −1 %" limite={530} />
            {pierde > 0.01 && <div style={{ position: "absolute", left: ax, top: ay - R_CABEZA * 250 - 40, transform: `translate(-50%, -100%) scale(${Math.min(pierde, 1.15)})`, transformOrigin: "50% 100%", ...mono(84), fontWeight: 700, color: ROJO }}>−37 %</div>}
          </>
        )}
      </Camara>
      <FlashRojo t={t} t0={EV.despues - 0.05} o={0.16} />
      <Arriba>
        <Titular t={t} t0={s + 0.05} fin={EV.casino - 0.45} texto="si fallas *una*…" size={110} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.casino - 0.4} fin={T_B - 0.1} texto="un *casino* con gráficos" size={88} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={T_B - 0.05} fin={EV.apostador - 0.45} texto="sabe *antes* de entrar" size={92} />
      </Arriba>
      <Arriba>
        <Titular t={t} t0={EV.apostador - 0.4} texto="o lo ve *después*" size={104} />
      </Arriba>
    </>
  );
};

// ------------------------------------------------------------------ 7. Pregunta final: ¿cuántas has pasado? (sin stickman)
const Pregunta: React.FC<P> = (p) => {
  const { t, s } = p;
  return (
    <>
      <PreguntaComentarios {...p} lineas={["¿cuántas has", "*pasado*?"]} kicker="DÍMELO" pie="PÁSASELO AL QUE OPERA CUANDO SE ABURRE" size={104} />
      <div style={{ position: "absolute", top: 1090, left: 0, width: ANCHO, display: "flex", justifyContent: "center", gap: 26 }}>
        {[0, 1, 2, 3].map((n, i) => {
          const g = muelle(t, s + 0.6 + i * 0.1, 220, 14);
          return (
            <div key={n} style={{ padding: "18px 22px", borderRadius: 18, border: "3px solid #fff", opacity: Math.min(Math.max(g, 0) * 1.5, 1), transform: `scale(${0.6 + 0.4 * Math.min(Math.max(g, 0), 1.1)})`, ...mono(44) }}>
              {n}
              <span style={{ opacity: 0.5 }}>/3</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ------------------------------------------------------------------ composición
export const PIEZAS: Record<string, React.FC<P>> = { hook: Hook, una: Una, dos: Dos, sigueme: Sigueme, tres: Tres, giro: Giro, pregunta: Pregunta };
export const CLAVES = claves(["Test", "trading", ["apostando", ROJO], "rápido", "perder", "entrar", "ganando", ["perdiendo", ROJO], "Sígueme", "todos", "aburrías", "fallado", ["casino", ROJO], "bonitos", "sabe", "apostador", ["después", ROJO], "Cuántas", "pásaselo"]);

export const Apostando: React.FC = () => <Montaje t={useCurrentFrame() / datos.fps} datos={datos} audio="gen/apostando_mezcla.wav" piezas={PIEZAS} claves={CLAVES} transicion="variada" vineta />;
