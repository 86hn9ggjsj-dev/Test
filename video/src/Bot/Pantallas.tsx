// Pantallas de motion graphics a pantalla completa para el video "bot".
// El video sigue detrás, desenfocado y oscurecido; cada pantalla anima su contenido con curvas expo.
import { AbsoluteFill } from "remotion";
import datos from "../gen/bot.json";
import { etiqueta, recogida, Revela, salida, sans, serif } from "../Premium/ui";
import { ORO } from "../Viral/Subtitulos";
import { ANCHO, C, lerp, SANS, suave } from "../Viral/util";

const EV = datos.eventos;
const ROJO = "#e5484d";

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

// 0..1: cuánto tapa el fondo de pantalla en el instante t
export const fondoEn = (t: number) => {
  const b = BLOQUES.find((x) => t >= x.s && t < x.e);
  if (!b) return 0;
  const entrada = b.s <= 0.01 ? 1 : lerp(t, b.s, b.s + 0.3, 0, 1, salida);
  const fin = b.e >= datos.duracion - 0.01 ? 0 : lerp(t, b.e - 0.25, b.e, 0, 1, recogida);
  return entrada * (1 - fin);
};

const v = (t: number, t0: number, d = 0.6) => lerp(t, t0, t0 + d, 0, 1, salida);

export const Pantallas: React.FC<{ t: number }> = ({ t }) => {
  const f = fondoEn(t);
  if (f <= 0) return null;
  const actual = PANTALLAS.find((p) => t >= p.s && t < p.e);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backdropFilter: `blur(${34 * f}px) saturate(${1 - 0.3 * f})`, background: `rgba(8,8,10,${0.76 * f})` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 65% 42% at 50% 38%, rgba(242,201,107,${0.14 * f}), transparent 70%)` }} />
      <Rejilla t={t} opacidad={f} />
      {actual && <Contenido t={t} p={actual} />}
    </AbsoluteFill>
  );
};

const Rejilla: React.FC<{ t: number; opacidad: number }> = ({ t, opacidad }) => (
  <AbsoluteFill
    style={{
      opacity: opacidad * 0.6,
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
      backgroundSize: "90px 90px",
      backgroundPosition: `0 ${(t * 24) % 90}px`,
      maskImage: "radial-gradient(ellipse 70% 55% at 50% 42%, black 30%, transparent 80%)",
    }}
  />
);

const Contenido: React.FC<{ t: number; p: Tramo }> = ({ t, p }) => {
  // Cada pantalla entra con una leve escala y sale recogiéndose
  const a = (p.s <= 0.01 ? 1 : v(t, p.s, 0.35)) * (p.e >= datos.duracion - 0.01 ? 1 : 1 - lerp(t, p.e - 0.22, p.e, 0, 1, recogida));
  const Pieza = { intro: Intro, reloj: Reloj, auto: Auto, noventa: Noventa, gestion: Gestion, prop: Prop, cta: Cta }[p.id]!;
  return (
    <AbsoluteFill style={{ opacity: a, transform: `scale(${0.95 + 0.05 * a})` }}>
      <div style={{ position: "absolute", top: 300, left: 0, width: ANCHO, height: 900, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
        <Pieza t={t} s={p.s} e={p.e} />
      </div>
    </AbsoluteFill>
  );
};

type P = { t: number; s: number; e: number };

const Fila: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 16 }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap }}>{children}</div>
);

const Visto: React.FC<{ size?: number }> = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M4 12.5l5 5L20 6.5" fill="none" stroke={ORO} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ------------------------------------------------------------------ 1. Intro: "3 ventajas"
const Intro: React.FC<P> = ({ t }) => {
  const anillo = v(t, 0.1, 1.1);
  const tres = v(t, 0.05, 0.7);
  const ang = -90 + 360 * anillo;
  const r = 200;
  return (
    <>
      <Revela t={t} t0={0.1}>
        <div style={etiqueta}>Trading automático</div>
      </Revela>
      <div style={{ position: "relative", width: 460, height: 460 }}>
        <svg width={460} height={460} style={{ position: "absolute", inset: 0 }}>
          <circle cx={230} cy={230} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
          <circle cx={230} cy={230} r={r} fill="none" stroke={ORO} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - anillo} transform="rotate(-90 230 230)" />
          <circle cx={230 + r * Math.cos((ang * Math.PI) / 180)} cy={230 + r * Math.sin((ang * Math.PI) / 180)} r={9} fill={ORO} style={{ filter: `drop-shadow(0 0 10px ${ORO})` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ ...serif(360), transform: `translateY(${(1 - tres) * 40}px) scale(${0.7 + 0.3 * tres})`, opacity: tres }}>3</span>
        </div>
      </div>
      <Revela t={t} t0={0.35}>
        <div style={sans(96)}>ventajas</div>
      </Revela>
      <Revela t={t} t0={0.8}>
        <div style={{ ...sans(44), fontWeight: 600 }}>de tener un bot de trading</div>
      </Revela>
    </>
  );
};

// ------------------------------------------------------------------ 2. Reloj: libertad de tiempo
const Reloj: React.FC<P> = ({ t, s }) => {
  const aro = v(t, s + 0.1, 0.9);
  const d = Math.max(t - s, 0);
  // El tiempo pasa rápido: el minutero da una vuelta cada 1,4 s
  const minutos = (d / 1.4) * 360;
  const horas = minutos / 12 + 300;
  const mano = (ang: number, largo: number, grosor: number, color: string) => {
    const r = ((ang - 90) * Math.PI) / 180;
    return <line x1={210} y1={210} x2={210 + largo * Math.cos(r)} y2={210 + largo * Math.sin(r)} stroke={color} strokeWidth={grosor} strokeLinecap="round" />;
  };
  const filas: [string, number][] = [
    ["Sin mirar el gráfico", EV.grafico],
    ["Sin estar pendiente", EV.pendiente],
  ];
  return (
    <>
      <Revela t={t} t0={s + 0.05}>
        <Fila>
          <span style={sans(64)}>Libertad de</span>
          <span style={serif(112)}>tiempo</span>
        </Fila>
      </Revela>
      <svg width={420} height={420}>
        <circle cx={210} cy={210} r={190} fill="rgba(255,255,255,0.03)" stroke={ORO} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - aro} transform="rotate(-90 210 210)" />
        {Array.from({ length: 12 }).map((_, i) => {
          const r = ((i * 30 - 90) * Math.PI) / 180;
          const o = v(t, s + 0.2 + i * 0.04, 0.3);
          const largo = i % 3 === 0 ? 26 : 14;
          return (
            <line key={i} x1={210 + (170 - largo) * Math.cos(r)} y1={210 + (170 - largo) * Math.sin(r)} x2={210 + 170 * Math.cos(r)} y2={210 + 170 * Math.sin(r)} stroke={i % 3 === 0 ? ORO : "rgba(255,255,255,0.6)"} strokeWidth={i % 3 === 0 ? 5 : 3} strokeLinecap="round" opacity={o} />
          );
        })}
        <g opacity={aro}>
          {mano(horas, 90, 9, C.blanco)}
          {mano(minutos, 140, 5, ORO)}
          <circle cx={210} cy={210} r={11} fill={ORO} />
        </g>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
        {filas.map(([txt, t0]) => (
          <Revela key={txt} t={t} t0={t0 - 0.1}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Visto />
              <span style={{ ...sans(44), fontWeight: 600 }}>{txt}</span>
            </div>
          </Revela>
        ))}
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 3. Anillo 0 → 100 %
const Auto: React.FC<P> = ({ t, s }) => {
  const prog = lerp(t, s + 0.1, EV.auto1 + 0.55, 0, 1, suave);
  const lleno = v(t, EV.auto1 + 0.55, 0.5);
  const r = 230;
  return (
    <>
      <Revela t={t} t0={s + 0.05}>
        <div style={etiqueta}>Opera</div>
      </Revela>
      <div style={{ position: "relative", width: 540, height: 540 }}>
        <svg width={540} height={540} style={{ position: "absolute", inset: 0 }}>
          <circle cx={270} cy={270} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={20} />
          <circle cx={270} cy={270} r={r} fill="none" stroke={ORO} strokeWidth={20} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} transform="rotate(-90 270 270)" style={{ filter: `drop-shadow(0 0 ${6 + 18 * lleno}px ${ORO}aa)` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <span style={{ ...serif(200), transform: `scale(${1 + 0.06 * lleno * (1 - lerp(t, EV.auto1 + 0.9, EV.auto1 + 1.3, 0, 1))})` }}>{Math.round(prog * 100)}%</span>
          <span style={{ ...etiqueta, fontSize: 30 }}>en automático</span>
        </div>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 4. 99 de cada 100
const Noventa: React.FC<P> = ({ t, s }) => {
  const ESPECIAL = 54;
  const lado = 36;
  const hueco = 20;
  return (
    <>
      <Revela t={t} t0={s + 0.05}>
        <Fila>
          <span style={serif(140)}>99 %</span>
          <span style={sans(58)}>de los traders</span>
        </Fila>
      </Revela>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(10, ${lado}px)`, gap: hueco }}>
        {Array.from({ length: 100 }).map((_, i) => {
          const fila = Math.floor(i / 10);
          const col = i % 10;
          const aparece = v(t, s + 0.1 + (fila + col) * 0.025, 0.35);
          const especial = i === ESPECIAL;
          const apaga = especial ? 0 : v(t, EV.n99 + 0.3 + ((i * 37) % 100) * 0.009, 0.25);
          const brilla = especial ? v(t, EV.n99 + 0.6, 0.5) : 0;
          const color = especial ? (brilla > 0 ? ORO : C.blanco) : apaga > 0.5 ? ROJO : C.blanco;
          return (
            <div
              key={i}
              style={{
                width: lado,
                height: lado,
                borderRadius: lado / 2,
                background: color,
                opacity: aparece * (especial ? 1 : 0.85 - 0.35 * apaga),
                transform: `scale(${aparece * (1 + 0.35 * brilla)})`,
                boxShadow: brilla > 0 ? `0 0 ${24 * brilla}px ${ORO}` : undefined,
              }}
            />
          );
        })}
      </div>
      <Revela t={t} t0={EV.psicologica - 0.2}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ ...etiqueta, fontSize: 30 }}>Fallan en</span>
          <span style={serif(84)}>la gestión psicológica</span>
        </div>
      </Revela>
    </>
  );
};

// ------------------------------------------------------------------ 5. El bot gestiona: gráfico con stop a breakeven
const PRECIO = [0.62, 0.58, 0.64, 0.55, 0.6, 0.5, 0.56, 0.47, 0.5, 0.41, 0.45, 0.36, 0.4, 0.3, 0.33, 0.24, 0.27, 0.18];
const Gestion: React.FC<P> = ({ t, s, e }) => {
  const W = 860;
  const H = 480;
  const traza = lerp(t, s + 0.2, e - 0.6, 0, 1, (x) => x);
  const pts = PRECIO.map((y, i) => [40 + (i / (PRECIO.length - 1)) * (W - 80), y * H] as const);
  const ruta = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const yEntrada = pts[1][1];
  const stop = lerp(t, EV.mueves, EV.mueves + 0.6, 0.8 * H, yEntrada, salida);
  const yTP = 0.2 * H;
  const pulso = 0.5 + 0.5 * Math.sin(t * 6);
  const filas: [string, number][] = [
    ["Gestiona cada operación", EV.operacion],
    ["Cierra por ti", EV.cierras],
    ["Mueve los stops", EV.mueves],
  ];
  return (
    <>
      <Revela t={t} t0={s + 0.05}>
        <Fila>
          <span style={sans(60)}>El bot</span>
          <span style={serif(104)}>gestiona</span>
          <span style={sans(60)}>por ti</span>
        </Fila>
      </Revela>
      <div style={{ position: "relative", width: W, height: H, borderRadius: 26, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 24, top: 20, display: "flex", alignItems: "center", gap: 10, fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.18em", color: C.blanco }}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: ORO, boxShadow: `0 0 ${8 + 10 * pulso}px ${ORO}` }} />
          BOT ACTIVO
        </div>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <line x1={0} x2={W} y1={yTP} y2={yTP} stroke={ORO} strokeWidth={2} strokeDasharray="10 10" opacity={0.8} />
          <text x={W - 24} y={yTP - 12} textAnchor="end" fill={ORO} fontFamily={SANS} fontWeight={700} fontSize={22}>TAKE PROFIT</text>
          <line x1={0} x2={W} y1={stop} y2={stop} stroke={ROJO} strokeWidth={2} strokeDasharray="10 10" />
          <text x={W - 24} y={stop + 30} textAnchor="end" fill={ROJO} fontFamily={SANS} fontWeight={700} fontSize={22}>
            {t >= EV.mueves + 0.3 ? "STOP · BREAKEVEN" : "STOP"}
          </text>
          <path d={ruta} fill="none" stroke={C.blanco} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - traza} />
          <circle cx={pts[1][0]} cy={yEntrada} r={10} fill={ORO} opacity={v(t, s + 0.4, 0.3)} />
          <text x={pts[1][0] + 18} y={yEntrada + 34} fill={C.blanco} fontFamily={SANS} fontWeight={600} fontSize={22} opacity={v(t, s + 0.4, 0.3)}>Entrada</text>
        </svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
        {filas.map(([txt, t0]) => (
          <Revela key={txt} t={t} t0={t0 - 0.1}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Visto size={30} />
              <span style={{ ...sans(40), fontWeight: 600 }}>{txt}</span>
            </div>
          </Revela>
        ))}
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 6. Proporcional: barras con contadores (datos de su tabla)
const euros = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const Prop: React.FC<P> = ({ t, s }) => {
  const cols: [number, number, number][] = [
    [1000, 505.2, 110],
    [10000, 5052, 250],
    [100000, 50520, 470],
  ];
  return (
    <>
      <Revela t={t} t0={s + 0.05}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <span style={{ ...etiqueta, fontSize: 30 }}>Directamente</span>
          <span style={serif(120)}>proporcional</span>
        </div>
      </Revela>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 70, height: 620 }}>
        {cols.map(([inv, ben, h], k) => {
          const g = v(t, s + 0.35 + k * 0.35, 0.8);
          return (
            <div key={inv} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <span style={{ ...serif(58), opacity: g }}>+{euros(ben * g)} €</span>
              <div style={{ width: 150, height: h * g, borderRadius: "18px 18px 6px 6px", background: `linear-gradient(180deg, ${ORO}, #b8903f)`, boxShadow: `0 0 ${30 * g}px ${ORO}55` }} />
              <span style={{ ...sans(34), fontWeight: 700, opacity: v(t, s + 0.25 + k * 0.35, 0.4) }}>{euros(inv)} €</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 7. CTA: avión de papel
const Cta: React.FC<P> = ({ t, s }) => {
  const vuelo = v(t, s + 0.05, 1.0);
  // Trayectoria curva de abajo-izquierda al centro
  const x = lerp(vuelo, 0, 1, -380, 0, (q) => q);
  const y = lerp(vuelo, 0, 1, 260, 0, (q) => 1 - (1 - q) * (1 - q));
  const rot = lerp(vuelo, 0, 1, -35, 0, (q) => q);
  const pulso = v(t, s + 1.0, 0.8);
  return (
    <>
      <div style={{ position: "relative", width: 300, height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", width: 300 * (0.6 + 0.4 * pulso), height: 300 * (0.6 + 0.4 * pulso), borderRadius: "50%", border: `2px solid ${ORO}`, opacity: pulso * (1 - pulso) * 3 }} />
        <svg width={220} height={220} viewBox="0 0 24 24" style={{ transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`, filter: `drop-shadow(0 8px 24px rgba(0,0,0,0.5)) drop-shadow(0 0 16px ${ORO}66)` }}>
          <path d="M22 2L11 13" fill="none" stroke={ORO} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" fill="rgba(242,201,107,0.15)" stroke={ORO} strokeWidth={1.6} strokeLinejoin="round" />
        </svg>
      </div>
      <Revela t={t} t0={s + 0.35}>
        <div style={sans(92)}>Escríbeme</div>
      </Revela>
      <Revela t={t} t0={s + 0.5}>
        <div style={serif(140)}>por privado</div>
      </Revela>
      <Revela t={t} t0={EV.privado - 0.1}>
        <div style={{ ...etiqueta, fontSize: 28 }}>Más información por mensaje directo</div>
      </Revela>
    </>
  );
};
