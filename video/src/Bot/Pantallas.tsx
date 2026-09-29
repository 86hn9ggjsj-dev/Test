// Pantallas de motion graphics a pantalla completa para el video "bot".
// El video sigue detrás, desenfocado y oscurecido. Cada pantalla combina: partículas doradas, barrido de luz,
// títulos letra a letra, números con brillo y una animación propia con curvas expo.
import { AbsoluteFill } from "remotion";
import datos from "../gen/bot.json";
import { etiqueta, recogida, Revela, salida, sans } from "../Premium/ui";
import { ORO } from "../Viral/Subtitulos";
import { ANCHO, ALTO, C, lerp, pop, ruido, SANS, SERIF, suave } from "../Viral/util";

const EV = datos.eventos;
const ROJO = "#e5484d";
const ORO_CLARO = "#fff1c9";
const SOMBRA = "drop-shadow(0 2px 6px rgba(0,0,0,0.6)) drop-shadow(0 8px 30px rgba(0,0,0,0.45))";

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
const rad = (g: number) => (g * Math.PI) / 180;

export const Pantallas: React.FC<{ t: number }> = ({ t }) => {
  const f = fondoEn(t);
  if (f <= 0) return null;
  const actual = PANTALLAS.find((p) => t >= p.s && t < p.e);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backdropFilter: `blur(${34 * f}px) saturate(${1 - 0.3 * f})`, background: `rgba(8,8,10,${0.78 * f})` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 65% 42% at 50% 38%, rgba(242,201,107,${0.16 * f}), transparent 70%)` }} />
      <Rejilla t={t} opacidad={f} />
      <Particulas t={t} opacidad={f} />
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

// Motas doradas que suben despacio y titilan (deterministas: mismo resultado en cada render)
const Particulas: React.FC<{ t: number; opacidad: number }> = ({ t, opacidad }) => (
  <AbsoluteFill style={{ opacity: opacidad }}>
    {Array.from({ length: 46 }).map((_, i) => {
      const vel = 18 + ruido(i + 100) * 46;
      const y = (((ruido(i + 50) * ALTO - t * vel) % ALTO) + ALTO) % ALTO;
      const x = ruido(i) * ANCHO + 18 * Math.sin(t * 0.8 + i);
      const r = 1.5 + ruido(i + 200) * 3.5;
      const brillo = 0.15 + 0.4 * (0.5 + 0.5 * Math.sin(t * (1.5 + ruido(i + 300) * 2) + i));
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: r, background: ORO, opacity: brillo, boxShadow: `0 0 ${r * 4}px ${ORO}` }} />;
    })}
  </AbsoluteFill>
);

const Contenido: React.FC<{ t: number; p: Tramo }> = ({ t, p }) => {
  // Entrada con zoom + desenfoque (efecto "zoom blur") y salida empujando hacia la cámara
  const a = p.s <= 0.01 ? 1 : v(t, p.s, 0.35);
  const out = p.e >= datos.duracion - 0.01 ? 0 : lerp(t, p.e - 0.22, p.e, 0, 1, recogida);
  const blur = (1 - a) * 16 + out * 14;
  const destello = p.s > 0.01 ? Math.max(0, 1 - (t - p.s) / 0.14) : 0;
  // Barrido de luz diagonal al entrar
  const barrido = lerp(t, p.s + 0.05, p.s + 0.75, -900, 1500, (x) => x);
  const Pieza = { intro: Intro, reloj: Reloj, auto: Auto, noventa: Noventa, gestion: Gestion, prop: Prop, cta: Cta }[p.id]!;
  return (
    <AbsoluteFill style={{ opacity: a * (1 - out), transform: `scale(${1.18 - 0.18 * a + 0.2 * out})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
      <AbsoluteFill style={{ background: "#fff", opacity: 0.35 * destello }} />
      <div style={{ position: "absolute", top: 300, left: 0, width: ANCHO, height: 900, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
        <Pieza t={t} s={p.s} e={p.e} />
      </div>
      <div
        style={{
          position: "absolute",
          top: -400,
          left: barrido,
          width: 260,
          height: ALTO + 800,
          transform: "rotate(18deg)",
          background: "linear-gradient(90deg, transparent, rgba(255,236,190,0.13), transparent)",
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};

type P = { t: number; s: number; e: number };

// ------------------------------------------------------------------ utilidades de tipografía animada
// Título letra a letra: cada carácter sube, se enfoca y aparece con un pequeño retardo
const Letras: React.FC<{ t: number; t0: number; texto: string; estilo: React.CSSProperties; paso?: number }> = ({ t, t0, texto, estilo, paso = 0.028 }) => (
  <span style={{ display: "inline-flex", ...estilo, filter: SOMBRA, textShadow: "none" }}>
    {Array.from(texto).map((ch, i) => {
      const k = v(t, t0 + i * paso, 0.5);
      return (
        <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: k, transform: `translateY(${(1 - k) * 0.5}em) rotate(${(1 - k) * 8}deg)`, filter: k < 0.98 ? `blur(${(1 - k) * 8}px)` : undefined }}>
          {ch}
        </span>
      );
    })}
  </span>
);

// Serif dorada con un brillo que la recorre (gradiente recortado al texto)
const oroBrillo = (size: number, t: number, t0: number): React.CSSProperties => {
  const x = lerp(t, t0, t0 + 1.2, 130, -30, (q) => q);
  return {
    fontFamily: SERIF,
    fontStyle: "italic",
    fontWeight: 400,
    fontSize: size,
    lineHeight: 1,
    backgroundImage: `linear-gradient(105deg, ${ORO} 0%, ${ORO} 40%, ${ORO_CLARO} 50%, ${ORO} 60%, ${ORO} 100%)`,
    backgroundSize: "250% 100%",
    backgroundPosition: `${x}% 0`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    filter: SOMBRA,
  };
};

const Fila: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 16 }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap }}>{children}</div>
);

const Visto: React.FC<{ size?: number; k?: number }> = ({ size = 34, k = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={11} fill="rgba(242,201,107,0.14)" stroke={ORO} strokeWidth={1.2} opacity={k} />
    <path d="M6.5 12.5l3.6 3.6L17.5 8.5" fill="none" stroke={ORO} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
  </svg>
);

// Chispas que salen radialmente desde un punto
const Chispas: React.FC<{ t: number; t0: number; cx: number; cy: number; n?: number; radio?: number }> = ({ t, t0, cx, cy, n = 16, radio = 220 }) => {
  const d = t - t0;
  if (d < 0 || d > 0.9) return null;
  const k = suave(d / 0.9);
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const ang = (i / n) * Math.PI * 2 + ruido(i) * 0.4;
        const r = radio * (0.4 + 0.6 * ruido(i + 9)) * k;
        const largo = 18 * (1 - k) + 4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx + Math.cos(ang) * r - largo / 2,
              top: cy + Math.sin(ang) * r - 2,
              width: largo,
              height: 4,
              borderRadius: 2,
              background: ORO,
              opacity: 1 - k,
              transform: `rotate(${ang}rad)`,
              boxShadow: `0 0 10px ${ORO}`,
            }}
          />
        );
      })}
    </>
  );
};

// ------------------------------------------------------------------ 1. Intro: "3 ventajas"
const Intro: React.FC<P> = ({ t }) => {
  const anillo = v(t, 0.1, 1.1);
  const tres = v(t, 0.05, 0.7);
  const r = 200;
  const giro = t * 40;
  return (
    <>
      <Revela t={t} t0={0.1}>
        <div style={etiqueta}>Trading automático</div>
      </Revela>
      <div style={{ position: "relative", width: 520, height: 520 }}>
        <svg width={520} height={520} style={{ position: "absolute", inset: 0 }}>
          <g transform={`rotate(${giro} 260 260)`} opacity={anillo}>
            {Array.from({ length: 60 }).map((_, i) => {
              const a = rad(i * 6);
              const l = i % 5 === 0 ? 14 : 6;
              return <line key={i} x1={260 + 236 * Math.cos(a)} y1={260 + 236 * Math.sin(a)} x2={260 + (236 - l) * Math.cos(a)} y2={260 + (236 - l) * Math.sin(a)} stroke={i % 5 === 0 ? ORO : "rgba(255,255,255,0.35)"} strokeWidth={2} />;
            })}
          </g>
          <circle cx={260} cy={260} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
          <circle cx={260} cy={260} r={r} fill="none" stroke={ORO} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - anillo} transform="rotate(-90 260 260)" style={{ filter: `drop-shadow(0 0 8px ${ORO}88)` }} />
          {[0, 120, 240].map((d0, i) => {
            const a = rad(-90 + d0 + t * 70);
            return <circle key={i} cx={260 + r * Math.cos(a)} cy={260 + r * Math.sin(a)} r={8} fill={ORO} opacity={anillo} style={{ filter: `drop-shadow(0 0 10px ${ORO})` }} />;
          })}
        </svg>
        <Chispas t={t} t0={1.2} cx={260} cy={260} radio={260} n={20} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ ...oroBrillo(380, t, 0.5), transform: `translateY(${(1 - tres) * 40}px) scale(${0.7 + 0.3 * tres})`, opacity: tres }}>3</span>
        </div>
      </div>
      <Letras t={t} t0={0.35} texto="ventajas" estilo={{ ...sans(100) }} paso={0.04} />
      <Revela t={t} t0={0.9}>
        <div style={{ ...sans(44), fontWeight: 600 }}>de tener un bot de trading</div>
      </Revela>
    </>
  );
};

// ------------------------------------------------------------------ 2. Reloj: libertad de tiempo
const Reloj: React.FC<P> = ({ t, s, e }) => {
  const aro = v(t, s + 0.1, 0.9);
  const d = Math.max(t - s, 0);
  const minutos = (d / 1.4) * 360;
  const horas = minutos / 12 + 300;
  const mano = (ang: number, largo: number, grosor: number, color: string) => {
    const r = rad(ang - 90);
    return <line x1={230} y1={230} x2={230 + largo * Math.cos(r)} y2={230 + largo * Math.sin(r)} stroke={color} strokeWidth={grosor} strokeLinecap="round" />;
  };
  // Reloj digital que corre de 00:00 a 24:00 durante la pantalla
  const total = lerp(t, s + 0.2, e - 0.4, 0, 24 * 60, suave);
  const dos = (n: number) => (n < 10 ? "0" : "") + n;
  const hh = dos(Math.floor(total / 60));
  const mm = dos(Math.floor(total % 60));
  const filas: [string, number][] = [
    ["Sin mirar el gráfico", EV.grafico],
    ["Sin estar pendiente", EV.pendiente],
  ];
  return (
    <>
      <Fila>
        <Letras t={t} t0={s + 0.05} texto="Libertad de" estilo={sans(64)} />
        <span style={oroBrillo(116, t, s + 0.5)}>tiempo</span>
      </Fila>
      <div style={{ position: "relative", width: 460, height: 460 }}>
        <svg width={460} height={460} style={{ position: "absolute", inset: 0 }}>
          <g transform={`rotate(${-t * 25} 230 230)`} opacity={aro}>
            <circle cx={230} cy={230} r={222} fill="none" stroke="rgba(242,201,107,0.35)" strokeWidth={1.5} strokeDasharray="2 10" />
          </g>
          <circle cx={230} cy={230} r={190} fill="rgba(255,255,255,0.03)" stroke={ORO} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - aro} transform="rotate(-90 230 230)" style={{ filter: `drop-shadow(0 0 8px ${ORO}66)` }} />
          {/* Arco de "tiempo recuperado" que se llena */}
          <circle cx={230} cy={230} r={206} fill="none" stroke={ORO} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - total / 1440} transform="rotate(-90 230 230)" opacity={0.6} />
          {Array.from({ length: 12 }).map((_, i) => {
            const r = rad(i * 30 - 90);
            const o = v(t, s + 0.2 + i * 0.04, 0.3);
            const largo = i % 3 === 0 ? 26 : 14;
            return <line key={i} x1={230 + (170 - largo) * Math.cos(r)} y1={230 + (170 - largo) * Math.sin(r)} x2={230 + 170 * Math.cos(r)} y2={230 + 170 * Math.sin(r)} stroke={i % 3 === 0 ? ORO : "rgba(255,255,255,0.6)"} strokeWidth={i % 3 === 0 ? 5 : 3} strokeLinecap="round" opacity={o} />;
          })}
          <g opacity={aro}>
            {mano(horas, 90, 9, C.blanco)}
            {mano(minutos, 140, 5, ORO)}
            <circle cx={230} cy={230} r={11} fill={ORO} />
          </g>
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: "0.08em", color: C.blanco, opacity: aro, fontVariantNumeric: "tabular-nums" }}>
          {hh}:{mm}
        </div>
        <div style={{ position: "absolute", right: -40, top: 20, ...etiqueta, fontSize: 26, color: ORO, opacity: v(t, s + 0.6, 0.4), transform: `rotate(12deg) scale(${0.8 + 0.2 * pop(t, s + 0.6)})` }}>24/7</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
        {filas.map(([txt, t0]) => (
          <div key={txt} style={{ display: "flex", alignItems: "center", gap: 14, opacity: v(t, t0 - 0.1, 0.3), transform: `translateX(${(1 - v(t, t0 - 0.1, 0.5)) * -40}px)` }}>
            <Visto k={v(t, t0, 0.5)} size={40} />
            <span style={{ ...sans(44), fontWeight: 600 }}>{txt}</span>
          </div>
        ))}
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 3. Anillo 0 → 100 % con interruptor ON
const Auto: React.FC<P> = ({ t, s }) => {
  const tLleno = EV.auto1 + 0.55;
  const prog = lerp(t, s + 0.1, tLleno, 0, 1, suave);
  const lleno = v(t, tLleno, 0.5);
  const r = 230;
  const on = v(t, tLleno - 0.1, 0.35);
  return (
    <>
      <Letras t={t} t0={s + 0.05} texto="OPERA" estilo={{ ...etiqueta, fontSize: 34 }} paso={0.05} />
      <div style={{ position: "relative", width: 560, height: 560 }}>
        <svg width={560} height={560} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 50 }).map((_, i) => {
            const a = rad(i * 7.2 - 90);
            const activo = i / 50 <= prog;
            return <line key={i} x1={280 + 262 * Math.cos(a)} y1={280 + 262 * Math.sin(a)} x2={280 + 274 * Math.cos(a)} y2={280 + 274 * Math.sin(a)} stroke={activo ? ORO : "rgba(255,255,255,0.2)"} strokeWidth={3} strokeLinecap="round" />;
          })}
          <circle cx={280} cy={280} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={20} />
          <circle cx={280} cy={280} r={r} fill="none" stroke={ORO} strokeWidth={20} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} transform="rotate(-90 280 280)" style={{ filter: `drop-shadow(0 0 ${6 + 22 * lleno}px ${ORO}aa)` }} />
          <circle cx={280 + r * Math.cos(rad(prog * 360 - 90))} cy={280 + r * Math.sin(rad(prog * 360 - 90))} r={14} fill={ORO_CLARO} style={{ filter: `drop-shadow(0 0 12px ${ORO})` }} opacity={prog < 1 ? 1 : 1 - lleno} />
        </svg>
        <Chispas t={t} t0={tLleno} cx={280} cy={280} radio={300} n={22} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <span style={{ ...oroBrillo(200, t, tLleno), transform: `scale(${1 + 0.07 * lleno * (1 - lerp(t, tLleno + 0.35, tLleno + 0.8, 0, 1))})`, fontVariantNumeric: "tabular-nums" }}>{Math.round(prog * 100)}%</span>
          {/* Interruptor que pasa a ON al completarse */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 92, height: 50, borderRadius: 25, background: on > 0.5 ? ORO : "rgba(255,255,255,0.18)", position: "relative", boxShadow: on > 0.5 ? `0 0 20px ${ORO}88` : undefined }}>
              <div style={{ position: "absolute", top: 5, left: 5 + 42 * on, width: 40, height: 40, borderRadius: 20, background: C.blanco, boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }} />
            </div>
            <span style={{ ...etiqueta, fontSize: 28, color: on > 0.5 ? ORO : C.blanco }}>{on > 0.5 ? "Automático ON" : "Automático"}</span>
          </div>
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
  const tDorado = EV.n99 + 0.6;
  const destaca = v(t, tDorado + 0.5, 0.7);
  const cx = (ESPECIAL % 10) * (lado + hueco) + lado / 2;
  const cy = Math.floor(ESPECIAL / 10) * (lado + hueco) + lado / 2;
  return (
    <>
      <Fila>
        <span style={oroBrillo(150, t, s + 0.3)}>99 %</span>
        <Letras t={t} t0={s + 0.1} texto="de los traders" estilo={sans(58)} />
      </Fila>
      <div style={{ position: "relative", width: 10 * lado + 9 * hueco, height: 10 * lado + 9 * hueco, transform: `perspective(1400px) rotateX(${(1 - v(t, s, 1.2)) * 35}deg)` }}>
        {Array.from({ length: 100 }).map((_, i) => {
          const fila = Math.floor(i / 10);
          const col = i % 10;
          const aparece = v(t, s + 0.1 + (fila + col) * 0.025, 0.35);
          const especial = i === ESPECIAL;
          const apaga = especial ? 0 : v(t, EV.n99 + 0.3 + ((i * 37) % 100) * 0.009, 0.25);
          const brilla = especial ? v(t, tDorado, 0.5) : 0;
          const color = especial ? (brilla > 0 ? ORO : C.blanco) : apaga > 0.5 ? ROJO : C.blanco;
          const aleja = especial ? 0 : destaca;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: col * (lado + hueco),
                top: fila * (lado + hueco),
                width: lado,
                height: lado,
                borderRadius: lado / 2,
                background: color,
                opacity: aparece * (especial ? 1 : (0.85 - 0.35 * apaga) * (1 - 0.6 * aleja)),
                transform: `scale(${aparece * (1 + 0.5 * brilla + 0.6 * (especial ? destaca : 0)) * (1 - 0.25 * aleja)})`,
                boxShadow: brilla > 0 ? `0 0 ${24 * brilla + 20 * destaca}px ${ORO}` : undefined,
                zIndex: especial ? 2 : 1,
              }}
            />
          );
        })}
        {/* Pulsos que salen del punto dorado */}
        {[0, 0.35, 0.7].map((d0) => {
          const k = ((t - tDorado - d0) % 1.05) / 1.05;
          if (t < tDorado + d0) return null;
          return <div key={d0} style={{ position: "absolute", left: cx - 90 * k, top: cy - 90 * k, width: 180 * k, height: 180 * k, borderRadius: "50%", border: `2px solid ${ORO}`, opacity: 1 - k }} />;
        })}
      </div>
      <Revela t={t} t0={EV.psicologica - 0.2}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span style={{ ...etiqueta, fontSize: 30 }}>Solo 1 de cada 100 lo controla</span>
          <span style={oroBrillo(80, t, EV.psicologica + 0.1)}>la gestión psicológica</span>
        </div>
      </Revela>
    </>
  );
};

// ------------------------------------------------------------------ 5. El bot gestiona: velas, escaneo, stop a breakeven y TP
const VELAS = [0.64, 0.6, 0.62, 0.55, 0.58, 0.52, 0.49, 0.53, 0.46, 0.42, 0.45, 0.38, 0.34, 0.37, 0.3, 0.26, 0.28, 0.22, 0.2];
const Gestion: React.FC<P> = ({ t, s, e }) => {
  const W = 860;
  const H = 480;
  const n = VELAS.length;
  const visibles = lerp(t, s + 0.2, e - 0.7, 1, n, (x) => x);
  const paso = (W - 80) / n;
  const yDe = (p: number) => p * H;
  const yEntrada = yDe(VELAS[1]);
  const yTP = yDe(0.2);
  const stop = lerp(t, EV.mueves, EV.mueves + 0.6, yDe(0.8), yEntrada, salida);
  const tp = visibles >= n - 0.05;
  const tpK = v(t, e - 0.65, 0.4);
  const escaneo = ((t - s) * 420) % (W + 200) - 100;
  const pulso = 0.5 + 0.5 * Math.sin(t * 6);
  const ultima = Math.min(Math.floor(visibles), n - 1);
  const precio = yDe(VELAS[ultima]) + (VELAS[Math.min(ultima + 1, n - 1)] - VELAS[ultima]) * H * (visibles - Math.floor(visibles));
  const filas: [string, number][] = [
    ["Gestiona cada operación", EV.operacion],
    ["Cierra por ti", EV.cierras],
    ["Mueve los stops", EV.mueves],
  ];
  return (
    <>
      <Fila>
        <Letras t={t} t0={s + 0.05} texto="El bot" estilo={sans(60)} />
        <span style={oroBrillo(108, t, s + 0.4)}>gestiona</span>
        <Letras t={t} t0={s + 0.25} texto="por ti" estilo={sans(60)} />
      </Fila>
      <div style={{ position: "relative", width: W, height: H, borderRadius: 26, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.45)" }}>
        <div style={{ position: "absolute", left: 24, top: 20, display: "flex", alignItems: "center", gap: 10, fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.18em", color: C.blanco, zIndex: 2 }}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: ORO, boxShadow: `0 0 ${8 + 10 * pulso}px ${ORO}` }} />
          BOT ACTIVO
        </div>
        {/* Línea de escaneo del bot */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: escaneo, width: 120, background: `linear-gradient(90deg, transparent, rgba(242,201,107,0.12), transparent)` }} />
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <line x1={0} x2={W} y1={yTP} y2={yTP} stroke={ORO} strokeWidth={2} strokeDasharray="10 10" opacity={0.8} />
          <text x={W - 24} y={yTP - 12} textAnchor="end" fill={ORO} fontFamily={SANS} fontWeight={700} fontSize={22}>TAKE PROFIT</text>
          <line x1={0} x2={W} y1={stop} y2={stop} stroke={ROJO} strokeWidth={2} strokeDasharray="10 10" />
          <text x={W - 24} y={stop + 30} textAnchor="end" fill={t >= EV.mueves + 0.3 ? ORO : ROJO} fontFamily={SANS} fontWeight={700} fontSize={22}>
            {t >= EV.mueves + 0.3 ? "STOP → BREAKEVEN" : "STOP"}
          </text>
          {t >= EV.mueves && t < EV.mueves + 0.9 && (
            <path d={`M ${W - 120} ${stop + 70} l 0 -40 m -14 14 l 14 -14 l 14 14`} stroke={ORO} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={1 - v(t, EV.mueves + 0.5, 0.4)} />
          )}
          {VELAS.slice(0, Math.ceil(visibles)).map((c, i) => {
            const o = i === 0 ? c + 0.02 : VELAS[i - 1];
            const k = Math.min(visibles - i, 1);
            const cierre = o + (c - o) * k;
            const x = 40 + i * paso + paso / 2;
            const sube = cierre <= o;
            const col = sube ? ORO : ROJO;
            const top = yDe(Math.min(o, cierre));
            const alto = Math.max(Math.abs(yDe(cierre) - yDe(o)), 4);
            return (
              <g key={i}>
                <line x1={x} x2={x} y1={top - 12} y2={top + alto + 12} stroke={col} strokeWidth={3} />
                <rect x={x - paso * 0.3} y={top} width={paso * 0.6} height={alto} rx={3} fill={col} />
              </g>
            );
          })}
          <circle cx={40 + paso * 1.5} cy={yEntrada} r={10} fill={C.blanco} opacity={v(t, s + 0.4, 0.3)} />
          <text x={40 + paso * 1.5 + 18} y={yEntrada + 34} fill={C.blanco} fontFamily={SANS} fontWeight={600} fontSize={22} opacity={v(t, s + 0.4, 0.3)}>Entrada</text>
        </svg>
        {/* Etiqueta de precio que sigue a la última vela */}
        <div style={{ position: "absolute", right: 14, top: precio - 18, padding: "4px 10px", borderRadius: 8, background: C.blanco, color: "#111", fontFamily: SANS, fontWeight: 700, fontSize: 20 }}>{(2380 + (1 - precio / H) * 60).toFixed(1)}</div>
        {tp && (
          <div style={{ position: "absolute", left: "50%", top: yTP + 30, transform: `translateX(-50%) scale(${0.7 + 0.3 * pop(t, e - 0.65)})`, opacity: tpK, padding: "10px 22px", borderRadius: 999, background: ORO, color: "#1a1406", fontFamily: SANS, fontWeight: 800, fontSize: 26, boxShadow: `0 0 30px ${ORO}88` }}>
            ✓ TP alcanzado
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
        {filas.map(([txt, t0]) => (
          <div key={txt} style={{ display: "flex", alignItems: "center", gap: 14, opacity: v(t, t0 - 0.1, 0.3), transform: `translateX(${(1 - v(t, t0 - 0.1, 0.5)) * -40}px)` }}>
            <Visto size={36} k={v(t, t0, 0.5)} />
            <span style={{ ...sans(40), fontWeight: 600 }}>{txt}</span>
          </div>
        ))}
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 6. Proporcional: barras con brillo, flecha de crecimiento y ×10
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
  const flecha = v(t, s + 1.5, 0.8);
  const cima = (k: number) => ({ x: k * (ancho + hueco) + ancho / 2, y: base - cols[k][2] * v(t, s + 0.35 + k * 0.35, 0.8) - 90 });
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <Letras t={t} t0={s + 0.05} texto="DIRECTAMENTE" estilo={{ ...etiqueta, fontSize: 30 }} paso={0.03} />
        <span style={oroBrillo(124, t, s + 0.4)}>proporcional</span>
      </div>
      <div style={{ position: "relative", width: 3 * ancho + 2 * hueco, height: base + 60 }}>
        <svg width={3 * ancho + 2 * hueco} height={base + 60} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path d={`M ${cima(0).x} ${cima(0).y} Q ${cima(1).x} ${cima(1).y - 40} ${cima(2).x} ${cima(2).y}`} fill="none" stroke={ORO} strokeWidth={3} strokeDasharray="1" pathLength={1} strokeDashoffset={1 - flecha} opacity={0.9} />
        </svg>
        {cols.map(([inv, ben, h], k) => {
          const g = v(t, s + 0.35 + k * 0.35, 0.8);
          const brillo = lerp(t, s + 1.1 + k * 0.35, s + 1.8 + k * 0.35, -120, 220, (x) => x);
          return (
            <div key={inv} style={{ position: "absolute", left: k * (ancho + hueco), bottom: 60, width: ancho, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <span style={{ ...oroBrillo(54, t, s + 1 + k * 0.35), opacity: g, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>+{euros(ben * g)} €</span>
              <div style={{ position: "relative", width: ancho, height: h * g, borderRadius: "18px 18px 6px 6px", background: `linear-gradient(180deg, ${ORO}, #b8903f)`, boxShadow: `0 0 ${30 * g}px ${ORO}55`, overflow: "hidden" }}>
                <div style={{ position: "absolute", top: `${brillo}%`, left: -20, right: -20, height: 60, background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.45), transparent)", transform: "rotate(-12deg)" }} />
              </div>
            </div>
          );
        })}
        {cols.map(([inv], k) => (
          <span key={inv} style={{ position: "absolute", left: k * (ancho + hueco), width: ancho, bottom: 12, textAlign: "center", ...sans(32), fontWeight: 700, opacity: v(t, s + 0.25 + k * 0.35, 0.4) }}>{euros(inv)} €</span>
        ))}
        {[0, 1].map((k) => (
          <div key={k} style={{ position: "absolute", left: (k + 1) * (ancho + hueco) - hueco / 2 - 34, bottom: 80 + cols[k][2] * 0.5, width: 68, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 26, color: ORO, opacity: v(t, s + 0.7 + k * 0.35, 0.4), transform: `scale(${0.6 + 0.4 * pop(t, s + 0.7 + k * 0.35)})` }}>×10</div>
        ))}
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 7. CTA: avión con estela, chat escribiendo y notificación
const Cta: React.FC<P> = ({ t, s }) => {
  const vuelo = v(t, s + 0.05, 1.0);
  const x = lerp(vuelo, 0, 1, -420, 0, (q) => q);
  const y = lerp(vuelo, 0, 1, 280, 0, (q) => 1 - (1 - q) * (1 - q));
  const rot = lerp(vuelo, 0, 1, -35, 0, (q) => q);
  const pulso = ((t - s - 1.0) % 1.2) / 1.2;
  const burbuja = v(t, s + 0.9, 0.5);
  const notif = pop(t, s + 1.5, 260);
  return (
    <>
      <div style={{ position: "relative", width: 520, height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={520} height={320} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path d="M -160 300 Q 60 260 260 160" fill="none" stroke={ORO} strokeWidth={3} strokeDasharray="6 12" pathLength={1} opacity={0.7 * (1 - v(t, s + 1.4, 0.6))} style={{ strokeDashoffset: 0 }} />
        </svg>
        {t > s + 1.0 && <div style={{ position: "absolute", width: 300 * (0.5 + 0.5 * pulso), height: 300 * (0.5 + 0.5 * pulso), borderRadius: "50%", border: `2px solid ${ORO}`, opacity: 1 - pulso }} />}
        <svg width={200} height={200} viewBox="0 0 24 24" style={{ transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`, filter: `drop-shadow(0 8px 24px rgba(0,0,0,0.5)) drop-shadow(0 0 16px ${ORO}66)` }}>
          <path d="M22 2L11 13" fill="none" stroke={ORO} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" fill="rgba(242,201,107,0.15)" stroke={ORO} strokeWidth={1.6} strokeLinejoin="round" />
        </svg>
        {/* Burbuja de chat "escribiendo…" */}
        <div style={{ position: "absolute", right: 0, top: 10, opacity: burbuja, transform: `scale(${0.6 + 0.4 * burbuja})`, transformOrigin: "left bottom", padding: "16px 24px", borderRadius: "26px 26px 26px 6px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", gap: 10 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 14, height: 14, borderRadius: 7, background: C.blanco, opacity: 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 8 - i * 0.9)), transform: `translateY(${-5 * Math.max(0, Math.sin(t * 8 - i * 0.9))}px)` }} />
          ))}
          <div style={{ position: "absolute", right: -16, top: -16, width: 40, height: 40, borderRadius: 20, background: ROJO, color: C.blanco, fontFamily: SANS, fontWeight: 800, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${notif})`, boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>1</div>
        </div>
      </div>
      <Letras t={t} t0={s + 0.35} texto="Escríbeme" estilo={sans(96)} paso={0.035} />
      <span style={oroBrillo(144, t, s + 0.8)}>por privado</span>
      <Revela t={t} t0={EV.privado - 0.1}>
        <div style={{ ...etiqueta, fontSize: 28 }}>Más información por mensaje directo</div>
      </Revela>
    </>
  );
};
