// Pantallas de motion graphics a pantalla completa para el video "bot".
// Estilo limpio: sin partículas ni brillos. La calidad está en el movimiento: muelles con asentamiento,
// coreografía escalonada, elementos que se recolocan entre fases y transiciones de empuje entre pantallas.
import { AbsoluteFill, spring } from "remotion";
import datos from "../gen/bot.json";
import { etiqueta, recogida, salida, sans } from "../Premium/ui";
import { ORO } from "../Viral/Subtitulos";
import { ANCHO, C, FPS, lerp, SANS, SERIF } from "../Viral/util";

const EV = datos.eventos;
const ROJO = "#e5484d";
const SOMBRA = "drop-shadow(0 2px 6px rgba(0,0,0,0.55)) drop-shadow(0 10px 30px rgba(0,0,0,0.4))";

type Tramo = { id: string; s: number; e: number };
export const PANTALLAS: Tramo[] = ["intro", "reloj", "auto", "noventa", "gestion", "prop", "cta"].map((id) => ({
  id,
  s: EV[`p_${id}_s` as keyof typeof EV] as number,
  e: EV[`p_${id}_e` as keyof typeof EV] as number,
}));

// Tramos contiguos (< 0.2 s de separación) comparten fondo: no se ve el video "parpadear" entre ellos
const BLOQUES: { s: number; e: number }[] = [];
for (const p of PANTALLAS) {
  const ult = BLOQUES[BLOQUES.length - 1];
  if (ult && p.s - ult.e < 0.2) ult.e = p.e;
  else BLOQUES.push({ s: p.s, e: p.e });
}

export const fondoEn = (t: number) => {
  const b = BLOQUES.find((x) => t >= x.s && t < x.e);
  if (!b) return 0;
  const entrada = b.s <= 0.01 ? 1 : lerp(t, b.s, b.s + 0.3, 0, 1, salida);
  const fin = b.e >= datos.duracion - 0.01 ? 0 : lerp(t, b.e - 0.25, b.e, 0, 1, recogida);
  return entrada * (1 - fin);
};

// ------------------------------------------------------------------ primitivas de movimiento
const v = (t: number, t0: number, d = 0.6) => lerp(t, t0, t0 + d, 0, 1, salida);
// Muelle: arranca, se pasa un poco y se asienta (0 antes de t0)
const muelle = (t: number, t0: number, rigidez = 140, amort = 15, masa = 0.9) =>
  t < t0 ? 0 : spring({ frame: (t - t0) * FPS, fps: FPS, config: { stiffness: rigidez, damping: amort, mass: masa } });
const rad = (g: number) => (g * Math.PI) / 180;
const oro = (size: number): React.CSSProperties => ({ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: size, lineHeight: 1, color: ORO, filter: SOMBRA });

// Entra desde abajo con muelle y sale hacia arriba: la pieza básica de toda la coreografía
const Sube: React.FC<{ t: number; t0: number; fin?: number; dist?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, t0, fin, dist = 60, children, style }) => {
  const k = muelle(t, t0);
  const o = fin === undefined ? 0 : lerp(t, fin - 0.25, fin, 0, 1, recogida);
  return <div style={{ opacity: Math.min(k * 1.6, 1) * (1 - o), transform: `translateY(${(1 - k) * dist - o * 40}px)`, ...style }}>{children}</div>;
};

// Palabras que suben por separado desde detrás de una máscara
const Palabras: React.FC<{ t: number; t0: number; texto: string; estilo: React.CSSProperties; paso?: number }> = ({ t, t0, texto, estilo, paso = 0.07 }) => (
  <span style={{ display: "inline-flex", gap: (Number(estilo.fontSize) || 40) * 0.26, filter: SOMBRA }}>
    {texto.split(" ").map((p, i) => {
      const k = muelle(t, t0 + i * paso, 170, 17);
      return (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.12em", marginBottom: "-0.12em" }}>
          <span style={{ display: "inline-block", ...estilo, textShadow: "none", transform: `translateY(${(1 - k) * 110}%)` }}>{p}</span>
        </span>
      );
    })}
  </span>
);

export const Pantallas: React.FC<{ t: number }> = ({ t }) => {
  const f = fondoEn(t);
  if (f <= 0) return null;
  const actual = PANTALLAS.find((p) => t >= p.s && t < p.e);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backdropFilter: `blur(${34 * f}px) saturate(${1 - 0.3 * f})`, background: `rgba(8,8,10,${0.8 * f})` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 65% 42% at 50% 40%, rgba(242,201,107,${0.08 * f}), transparent 70%)` }} />
      {actual && <Contenido t={t} p={actual} />}
    </AbsoluteFill>
  );
};

const Contenido: React.FC<{ t: number; p: Tramo }> = ({ t, p }) => {
  // Transición de empuje: la pantalla entra desde abajo con muelle y la saliente sube y se desvanece
  const entra = p.s <= 0.01 ? 1 : muelle(t, p.s, 120, 17);
  const sale = p.e >= datos.duracion - 0.01 ? 0 : lerp(t, p.e - 0.28, p.e, 0, 1, recogida);
  // Empuje de cámara lento y continuo mientras la pantalla está en uso
  const empuje = lerp(t, p.s, p.e, 1, 1.035, (x) => x);
  const Pieza = { intro: Intro, reloj: Reloj, auto: Auto, noventa: Noventa, gestion: Gestion, prop: Prop, cta: Cta }[p.id]!;
  return (
    <AbsoluteFill style={{ opacity: Math.min(entra * 1.5, 1) * (1 - sale), transform: `translateY(${(1 - entra) * 160 - sale * 160}px) scale(${empuje})` }}>
      <div style={{ position: "absolute", top: 300, left: 0, width: ANCHO, height: 900, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
        <Pieza t={t} s={p.s} e={p.e} />
      </div>
    </AbsoluteFill>
  );
};

type P = { t: number; s: number; e: number };

const Fila: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 16 }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap }}>{children}</div>
);

// Check que se dibuja trazo a trazo
const Visto: React.FC<{ size?: number; k: number }> = ({ size = 38, k }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={11} fill="none" stroke={ORO} strokeWidth={1.4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(k * 1.5, 1)} transform="rotate(-90 12 12)" />
    <path d="M6.5 12.5l3.6 3.6L17.5 8.5" fill="none" stroke={ORO} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, k * 1.5 - 0.5)} />
  </svg>
);

const Lista: React.FC<{ t: number; items: [string, number][]; size?: number }> = ({ t, items, size = 44 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
    {items.map(([txt, t0]) => {
      const k = muelle(t, t0 - 0.1, 160, 16);
      return (
        <div key={txt} style={{ display: "flex", alignItems: "center", gap: 16, opacity: Math.min(k * 1.6, 1), transform: `translateX(${(1 - k) * -50}px)` }}>
          <Visto k={v(t, t0 - 0.05, 0.55)} size={size * 0.9} />
          <span style={{ ...sans(size), fontWeight: 600 }}>{txt}</span>
        </div>
      );
    })}
  </div>
);

// ------------------------------------------------------------------ 1. Intro: el 3 aparece dentro del anillo y se recoloca
const Intro: React.FC<P> = ({ t }) => {
  const anillo = v(t, 0.05, 0.9);
  const tres = muelle(t, 0.1, 110, 12);
  // A los 0,75 s el bloque "3 + anillo" sube para dejar sitio al texto (se recoloca, no desaparece)
  const recoloca = muelle(t, 0.75, 120, 18);
  const r = 190;
  return (
    <>
      <div style={{ position: "relative", width: 440, height: 440, transform: `translateY(${60 * (1 - recoloca)}px) scale(${1.12 - 0.12 * recoloca})` }}>
        <svg width={440} height={440} style={{ position: "absolute", inset: 0 }}>
          <circle cx={220} cy={220} r={r} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={2} />
          <circle cx={220} cy={220} r={r} fill="none" stroke={ORO} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - anillo} transform={`rotate(${-90 + 90 * anillo} 220 220)`} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ ...oro(340), transform: `scale(${0.4 + 0.6 * tres}) rotate(${(1 - tres) * -12}deg)`, opacity: Math.min(tres * 2, 1) }}>3</span>
        </div>
      </div>
      <div style={{ opacity: recoloca > 0 ? 1 : 0 }}>
        <Palabras t={t} t0={0.8} texto="ventajas" estilo={sans(104)} />
      </div>
      <Sube t={t} t0={1.05}>
        <div style={{ ...sans(44), fontWeight: 600 }}>de tener un bot de trading</div>
      </Sube>
    </>
  );
};

// ------------------------------------------------------------------ 2. Reloj: el minutero avanza a saltos, como un reloj real
const Reloj: React.FC<P> = ({ t, s }) => {
  const aro = v(t, s + 0.1, 0.8);
  const d = Math.max(t - s - 0.3, 0);
  // Cada 0,3 s el minutero salta 30° con un muelle (arranca, se pasa y se asienta)
  const PASO = 0.3;
  const n = Math.floor(d / PASO);
  const minutos = n * 30 + 30 * muelle(d - n * PASO, 0, 260, 13);
  const horas = 300 + minutos / 12;
  const mano = (ang: number, largo: number, grosor: number, color: string) => {
    const r = rad(ang - 90);
    return <line x1={220} y1={220} x2={220 + largo * Math.cos(r)} y2={220 + largo * Math.sin(r)} stroke={color} strokeWidth={grosor} strokeLinecap="round" />;
  };
  const reloj = muelle(t, s + 0.1, 120, 14);
  return (
    <>
      <Fila>
        <Palabras t={t} t0={s + 0.05} texto="Libertad de" estilo={sans(64)} />
        <Sube t={t} t0={s + 0.25} dist={40}>
          <span style={oro(116)}>tiempo</span>
        </Sube>
      </Fila>
      <svg width={440} height={440} style={{ transform: `scale(${0.6 + 0.4 * reloj})`, opacity: Math.min(reloj * 2, 1), overflow: "visible" }}>
        <circle cx={220} cy={220} r={200} fill="rgba(255,255,255,0.03)" stroke={ORO} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - aro} transform="rotate(-90 220 220)" />
        {Array.from({ length: 12 }).map((_, i) => {
          const r = rad(i * 30 - 90);
          const k = muelle(t, s + 0.25 + i * 0.03, 200, 14);
          const largo = (i % 3 === 0 ? 26 : 14) * k;
          return <line key={i} x1={220 + (180 - largo) * Math.cos(r)} y1={220 + (180 - largo) * Math.sin(r)} x2={220 + 180 * Math.cos(r)} y2={220 + 180 * Math.sin(r)} stroke={i % 3 === 0 ? ORO : "rgba(255,255,255,0.6)"} strokeWidth={i % 3 === 0 ? 5 : 3} strokeLinecap="round" />;
        })}
        <g opacity={aro}>
          {mano(horas, 95, 9, C.blanco)}
          {mano(minutos, 150, 5, ORO)}
          <circle cx={220} cy={220} r={11} fill={ORO} />
        </g>
      </svg>
      <Lista t={t} items={[["Sin mirar el gráfico", EV.grafico], ["Sin estar pendiente", EV.pendiente]]} />
    </>
  );
};

// ------------------------------------------------------------------ 3. Anillo 0 → 100 % e interruptor
const Auto: React.FC<P> = ({ t, s }) => {
  const tLleno = EV.auto1 + 0.55;
  const prog = lerp(t, s + 0.15, tLleno, 0, 1, (x) => 1 - Math.pow(1 - x, 3));
  const r = 220;
  const on = muelle(t, tLleno - 0.05, 220, 16);
  // Al completarse, el anillo da un pequeño "latido" con muelle
  const latido = t < tLleno ? 0 : 1 - muelle(t, tLleno, 260, 10);
  const entra = muelle(t, s + 0.05, 120, 15);
  return (
    <>
      <Sube t={t} t0={s + 0.05} dist={30}>
        <div style={{ ...etiqueta, fontSize: 32 }}>Opera</div>
      </Sube>
      <div style={{ position: "relative", width: 500, height: 500, transform: `scale(${(0.7 + 0.3 * entra) * (1 + 0.05 * latido)})`, opacity: Math.min(entra * 2, 1) }}>
        <svg width={500} height={500} style={{ position: "absolute", inset: 0 }}>
          <circle cx={250} cy={250} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={22} />
          <circle cx={250} cy={250} r={r} fill="none" stroke={ORO} strokeWidth={22} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} transform="rotate(-90 250 250)" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
          <span style={{ ...oro(190), fontVariantNumeric: "tabular-nums" }}>{Math.round(prog * 100)}%</span>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 92, height: 50, borderRadius: 25, background: on > 0.5 ? ORO : "rgba(255,255,255,0.18)", position: "relative" }}>
              <div style={{ position: "absolute", top: 5, left: 5 + 42 * on, width: 40, height: 40, borderRadius: 20, background: C.blanco, boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }} />
            </div>
            <span style={{ ...etiqueta, fontSize: 28, color: on > 0.5 ? ORO : C.blanco }}>Automático</span>
          </div>
        </div>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 4. 99 de cada 100: la cuadrícula se aparta y el punto dorado toma el foco
const Noventa: React.FC<P> = ({ t, s }) => {
  const ESPECIAL = 54;
  const lado = 36;
  const hueco = 20;
  const paso = lado + hueco;
  const tRojo = EV.n99 + 0.25;
  const tFoco = EV.n99 + 1.0;
  const foco = muelle(t, tFoco, 110, 17);
  const ex = (ESPECIAL % 10) * paso;
  const ey = Math.floor(ESPECIAL / 10) * paso;
  const centro = (10 * paso - hueco) / 2 - lado / 2;
  return (
    <>
      <Fila>
        <Sube t={t} t0={s + 0.05} dist={40}>
          <span style={oro(150)}>99 %</span>
        </Sube>
        <Palabras t={t} t0={s + 0.15} texto="de los traders" estilo={sans(58)} />
      </Fila>
      <div style={{ position: "relative", width: 10 * paso - hueco, height: 10 * paso - hueco }}>
        {Array.from({ length: 100 }).map((_, i) => {
          const fila = Math.floor(i / 10);
          const col = i % 10;
          // Cascada desde el centro hacia fuera
          const dist = Math.hypot(fila - 4.5, col - 4.5);
          const aparece = muelle(t, s + 0.15 + dist * 0.045, 200, 14);
          const especial = i === ESPECIAL;
          // El rojo avanza en diagonal como una ola
          const rojo = especial ? 0 : v(t, tRojo + (fila + col) * 0.02, 0.2);
          // En el foco, el resto se encoge y se apaga; el dorado viaja al centro y crece
          const x = especial ? ex + (centro - ex) * foco : col * paso;
          const y = especial ? ey + (centro - ey) * foco : fila * paso;
          const escala = especial ? aparece * (1 + 2.2 * foco) : aparece * (1 - 0.45 * foco);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: lado,
                height: lado,
                borderRadius: lado / 2,
                background: especial ? (t >= tRojo ? ORO : C.blanco) : rojo > 0.5 ? ROJO : C.blanco,
                opacity: especial ? 1 : (0.85 - 0.3 * rojo) * (1 - 0.65 * foco),
                transform: `scale(${escala})`,
                zIndex: especial ? 2 : 1,
              }}
            />
          );
        })}
      </div>
      <Sube t={t} t0={EV.psicologica - 0.2}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span style={{ ...etiqueta, fontSize: 30 }}>Fallan en</span>
          <span style={oro(84)}>la gestión psicológica</span>
        </div>
      </Sube>
    </>
  );
};

// ------------------------------------------------------------------ 5. El bot gestiona: velas con muelle, stop que sube a breakeven
const VELAS = [0.64, 0.6, 0.62, 0.55, 0.58, 0.52, 0.49, 0.53, 0.46, 0.42, 0.45, 0.38, 0.34, 0.37, 0.3, 0.26, 0.28, 0.22, 0.2];
const Gestion: React.FC<P> = ({ t, s, e }) => {
  const W = 860;
  const H = 480;
  const n = VELAS.length;
  const paso = (W - 80) / n;
  const yDe = (p: number) => p * H;
  const yEntrada = yDe(VELAS[1]);
  const yTP = yDe(0.2);
  const tFinVelas = e - 0.8;
  const stopK = muelle(t, EV.mueves, 130, 13);
  const stop = yDe(0.8) + (yEntrada - yDe(0.8)) * stopK;
  const panel = muelle(t, s + 0.1, 120, 16);
  const tp = muelle(t, tFinVelas + 0.1, 180, 14);
  return (
    <>
      <Fila>
        <Palabras t={t} t0={s + 0.05} texto="El bot" estilo={sans(60)} />
        <Sube t={t} t0={s + 0.2} dist={40}>
          <span style={oro(108)}>gestiona</span>
        </Sube>
        <Palabras t={t} t0={s + 0.3} texto="por ti" estilo={sans(60)} />
      </Fila>
      <div style={{ position: "relative", width: W, height: H, borderRadius: 26, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", overflow: "hidden", transform: `translateY(${(1 - panel) * 80}px) scale(${0.92 + 0.08 * panel})`, opacity: Math.min(panel * 2, 1) }}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <line x1={0} x2={W * v(t, s + 0.3, 0.6)} y1={yTP} y2={yTP} stroke={ORO} strokeWidth={2} strokeDasharray="10 10" />
          <text x={W - 24} y={yTP - 12} textAnchor="end" fill={ORO} fontFamily={SANS} fontWeight={700} fontSize={22} opacity={v(t, s + 0.6, 0.3)}>TAKE PROFIT</text>
          <line x1={0} x2={W * v(t, s + 0.4, 0.6)} y1={stop} y2={stop} stroke={t >= EV.mueves + 0.25 ? ORO : ROJO} strokeWidth={2} strokeDasharray="10 10" />
          <text x={W - 24} y={stop + 30} textAnchor="end" fill={t >= EV.mueves + 0.25 ? ORO : ROJO} fontFamily={SANS} fontWeight={700} fontSize={22} opacity={v(t, s + 0.7, 0.3)}>
            {t >= EV.mueves + 0.25 ? "STOP · BREAKEVEN" : "STOP"}
          </text>
          {VELAS.map((c, i) => {
            // Cada vela crece desde su apertura con un muelle corto
            const t0 = s + 0.35 + (i / n) * (tFinVelas - s - 0.35);
            const k = muelle(t, t0, 240, 16);
            if (k <= 0) return null;
            const o = i === 0 ? c + 0.02 : VELAS[i - 1];
            const cierre = o + (c - o) * k;
            const x = 40 + i * paso + paso / 2;
            const col = cierre <= o ? ORO : ROJO;
            const top = yDe(Math.min(o, cierre));
            const alto = Math.max(Math.abs(yDe(cierre) - yDe(o)), 4);
            return (
              <g key={i} opacity={Math.min(k * 2, 1)}>
                <line x1={x} x2={x} y1={top - 10 * k} y2={top + alto + 10 * k} stroke={col} strokeWidth={3} />
                <rect x={x - paso * 0.3} y={top} width={paso * 0.6} height={alto} rx={3} fill={col} />
              </g>
            );
          })}
          <circle cx={40 + paso * 1.5} cy={yEntrada} r={10 * muelle(t, s + 0.5, 220, 12)} fill={C.blanco} />
          <text x={40 + paso * 1.5 + 18} y={yEntrada + 34} fill={C.blanco} fontFamily={SANS} fontWeight={600} fontSize={22} opacity={v(t, s + 0.55, 0.3)}>Entrada</text>
        </svg>
        <div style={{ position: "absolute", left: "50%", top: yTP + 28, transform: `translateX(-50%) translateY(${(1 - tp) * 30}px) scale(${0.8 + 0.2 * tp})`, opacity: Math.min(tp * 2, 1), padding: "10px 22px", borderRadius: 999, background: ORO, color: "#1a1406", fontFamily: SANS, fontWeight: 800, fontSize: 26 }}>
          TP alcanzado
        </div>
      </div>
      <Lista t={t} size={40} items={[["Gestiona cada operación", EV.operacion], ["Cierra por ti", EV.cierras], ["Mueve los stops", EV.mueves]]} />
    </>
  );
};

// ------------------------------------------------------------------ 6. Proporcional: barras con muelle, contadores y ×10
const euros = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const Prop: React.FC<P> = ({ t, s }) => {
  const cols: [number, number, number][] = [
    [1000, 505.2, 110],
    [10000, 5052, 250],
    [100000, 50520, 440],
  ];
  const ancho = 150;
  const hueco = 90;
  const base = 560;
  const tBarra = (k: number) => s + 0.35 + k * 0.3;
  const curva = v(t, tBarra(2) + 0.45, 0.7);
  const cima = (k: number) => ({ x: k * (ancho + hueco) + ancho / 2, y: base - cols[k][2] - 110 });
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <Sube t={t} t0={s + 0.05} dist={30}>
          <span style={{ ...etiqueta, fontSize: 30 }}>Directamente</span>
        </Sube>
        <Sube t={t} t0={s + 0.15} dist={50}>
          <span style={oro(124)}>proporcional</span>
        </Sube>
      </div>
      <div style={{ position: "relative", width: 3 * ancho + 2 * hueco, height: base + 60 }}>
        <svg width={3 * ancho + 2 * hueco} height={base + 60} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path d={`M ${cima(0).x} ${cima(0).y} Q ${cima(1).x} ${cima(1).y - 40} ${cima(2).x} ${cima(2).y}`} fill="none" stroke={ORO} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - curva} opacity={0.8} />
        </svg>
        {cols.map(([inv, ben, h], k) => {
          const g = muelle(t, tBarra(k), 110, 12);
          const cuenta = lerp(t, tBarra(k), tBarra(k) + 0.9, 0, 1, (x) => 1 - Math.pow(1 - x, 3));
          return (
            <div key={inv} style={{ position: "absolute", left: k * (ancho + hueco), bottom: 60, width: ancho, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <span style={{ ...oro(54), opacity: Math.min(g * 2, 1), fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", transform: `translateY(${(1 - Math.min(g, 1)) * 20}px)` }}>+{euros(ben * cuenta)} €</span>
              <div style={{ width: ancho, height: Math.max(h * g, 0), borderRadius: "18px 18px 6px 6px", background: `linear-gradient(180deg, ${ORO}, #b8903f)` }} />
            </div>
          );
        })}
        {cols.map(([inv], k) => (
          <div key={inv} style={{ position: "absolute", left: k * (ancho + hueco), width: ancho, bottom: 12, textAlign: "center" }}>
            <Sube t={t} t0={tBarra(k) - 0.1} dist={20}>
              <span style={{ ...sans(32), fontWeight: 700 }}>{euros(inv)} €</span>
            </Sube>
          </div>
        ))}
        {[0, 1].map((k) => {
          const m = muelle(t, tBarra(k + 1) + 0.15, 200, 13);
          return (
            <div key={k} style={{ position: "absolute", left: (k + 1) * (ancho + hueco) - hueco / 2 - 34, bottom: 80 + cols[k][2] * 0.5, width: 68, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 26, color: ORO, opacity: Math.min(m * 2, 1), transform: `scale(${m})` }}>×10</div>
          );
        })}
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 7. CTA: el avión recorre una curva orientado según su dirección
const Cta: React.FC<P> = ({ t, s }) => {
  // Curva de Bézier cúbica: sale abajo-izquierda, hace un arco y aterriza en el centro
  const P0 = [-440, 360];
  const P1 = [-380, -60];
  const P2 = [-140, 50];
  const P3 = [0, 0];
  const bez = (q: number, i: 0 | 1) => (1 - q) ** 3 * P0[i] + 3 * (1 - q) ** 2 * q * P1[i] + 3 * (1 - q) * q * q * P2[i] + q ** 3 * P3[i];
  const q = lerp(t, s + 0.05, s + 1.15, 0, 1, (x) => 1 - Math.pow(1 - x, 3));
  // El icono apunta arriba-derecha (-45°): se suma 45° para que el morro siga la dirección de vuelo
  const qa = Math.min(q, 0.97);
  const rumbo = (Math.atan2(bez(Math.min(qa + 0.01, 1), 1) - bez(qa, 1), bez(Math.min(qa + 0.01, 1), 0) - bez(qa, 0)) * 180) / Math.PI + 45;
  const asienta = muelle(t, s + 1.1, 160, 14);
  const ang = rumbo * (1 - asienta);
  const aterriza = t < s + 1.15 ? 0 : 1 - muelle(t, s + 1.15, 260, 11);
  // Estela: el tramo ya recorrido de la curva, que se borra desde el origen
  const puntos = Array.from({ length: 40 }).map((_, i) => {
    const qi = (i / 39) * q;
    return `${i ? "L" : "M"}${(bez(qi, 0) + 260).toFixed(1)},${(bez(qi, 1) + 160).toFixed(1)}`;
  });
  const borra = v(t, s + 1.0, 0.7);
  return (
    <>
      <div style={{ position: "relative", width: 520, height: 320 }}>
        <svg width={520} height={320} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path d={puntos.join(" ")} fill="none" stroke={ORO} strokeWidth={3} strokeDasharray="6 12" pathLength={1} strokeDashoffset={-borra} opacity={0.7 * (1 - borra)} />
        </svg>
        <svg width={190} height={190} viewBox="0 0 24 24" style={{ position: "absolute", left: 260 - 95 + bez(q, 0), top: 160 - 95 + bez(q, 1), transform: `rotate(${ang}deg) scale(${1 + 0.12 * aterriza})`, filter: SOMBRA }}>
          <path d="M22 2L11 13" fill="none" stroke={ORO} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" fill="rgba(242,201,107,0.15)" stroke={ORO} strokeWidth={1.6} strokeLinejoin="round" />
        </svg>
      </div>
      <Palabras t={t} t0={s + 0.45} texto="Escríbeme" estilo={sans(96)} />
      <Sube t={t} t0={s + 0.65} dist={50}>
        <span style={oro(144)}>por privado</span>
      </Sube>
      <Sube t={t} t0={EV.privado - 0.1} dist={30}>
        <div style={{ ...etiqueta, fontSize: 28 }}>Más información por mensaje directo</div>
      </Sube>
    </>
  );
};

