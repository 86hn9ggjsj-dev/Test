import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Grafico, K } from "./Grafico";
import { Subtitulos } from "./Subtitulos";
import {
  ALTO,
  ANCHO,
  C,
  entra,
  escena,
  FPS,
  FUENTE,
  golpeZoom,
  lerp,
  palabra,
  pop,
  SAFE,
  sale,
  suave,
  temblor,
  texto,
  TL,
} from "./util";

type Transicion = "whip" | "zoom" | "flash" | "corte";
const ENTRADA_DE: Record<string, Transicion> = {
  hook: "flash",
  calma: "whip",
  problema: "flash",
  estrategia: "zoom",
  emociones: "whip",
  manana: "zoom",
};
const TINTE: Record<string, string> = {
  hook: "#ff2d4a",
  calma: "#2f7bff",
  entrada: "#2f7bff",
  contra: "#ff2d4a",
  stop: "#ff2d4a",
  vuelve: "#1fd67a",
  beneficio: "#1fd67a",
  problema: "#ff2d4a",
  estrategia: "#2f7bff",
  emociones: "#b23cff",
  manana: "#2f7bff",
};
const GRAFICO = ["calma", "entrada", "contra", "stop", "vuelve", "beneficio"];
const T_PROBLEMA_HOOK = palabra(38, true).s;
const T_PROBLEMA = palabra(38).s;

const GOLPES: [number, number][] = [
  [T_PROBLEMA_HOOK, 0.1],
  [palabra(19).s, 0.06],
  [K.vuelve, 0.12],
  [K.beneficio, 0.07],
  [T_PROBLEMA, 0.12],
  [palabra(48).s, 0.08],
  [palabra(50).s, 0.06],
];
const TEMBLORES = [0, T_PROBLEMA_HOOK, K.vuelveEsc, escena("problema").s, T_PROBLEMA, palabra(48).s];

const planoDe = (t: number) => {
  if (t < K.t0 || t >= K.t1) return TL.escenas.find((e) => t >= e.s && t < e.e) ?? TL.escenas[TL.escenas.length - 1];
  return { id: "grafico", s: K.t0, e: K.t1 };
};

// Transformación de entrada/salida del plano según el tipo de transición
const transicion = (t: number, s: number, e: number, entrada: Transicion, salida: Transicion) => {
  let x = 0;
  let escala = 1;
  let blur = 0;
  const d = 0.2;
  if (entrada === "whip" && t < s + d) {
    const k = 1 - suave((t - s) / d);
    x += 760 * k;
    blur += 36 * k;
  }
  if (entrada === "zoom" && t < s + d) {
    const k = 1 - suave((t - s) / d);
    escala *= 1 + 0.45 * k;
    blur += 24 * k;
  }
  if (salida === "whip" && t > e - d) {
    const k = suave((t - (e - d)) / d);
    x -= 760 * k;
    blur += 36 * k;
  }
  if (salida === "zoom" && t > e - 0.15) {
    const k = suave((t - (e - 0.15)) / 0.15);
    escala *= 1 + 0.3 * k;
    blur += 18 * k;
  }
  return { transform: `translateX(${x}px) scale(${escala})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined };
};

export const Viral: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const plano = planoDe(t);
  const esc = TL.escenas.find((e) => t >= e.s && t < e.e) ?? TL.escenas[TL.escenas.length - 1];
  const sigId = plano.id === "grafico" ? "problema" : TL.escenas[TL.escenas.findIndex((e) => e.id === plano.id) + 1]?.id;
  const entradaT = ENTRADA_DE[plano.id === "grafico" ? "calma" : plano.id] ?? "corte";
  const salidaT = sigId ? ENTRADA_DE[sigId] ?? "corte" : "whip";
  const tr = transicion(t, plano.s, plano.e, entradaT, salidaT);

  const empuje = lerp(t, plano.s, plano.e, 1, 1.04, (x) => x);
  const zoom = empuje + GOLPES.reduce((a, [t0, amt]) => a + golpeZoom(t, t0, amt), 0);
  const sh = TEMBLORES.reduce(
    (a, t0) => {
      const s = temblor(t, t0);
      return { x: a.x + s.x, y: a.y + s.y };
    },
    { x: 0, y: 0 },
  );

  const destello = Math.max(
    ...TL.escenas
      .filter((e) => ENTRADA_DE[e.id] === "flash")
      .map((e) => (t >= e.s && t < e.s + 0.22 ? 1 - (t - e.s) / 0.22 : 0)),
    t >= K.vuelveEsc && t < K.vuelveEsc + 0.25 ? 0.6 * (1 - (t - K.vuelveEsc) / 0.25) : 0,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: C.fondo, overflow: "hidden" }}>
      <Audio src={staticFile("gen/mezcla.wav")} />
      <Fondo t={t} tinte={TINTE[esc.id]} />

      {/* Capa visual: cámara (zoom + temblor) y grading */}
      <AbsoluteFill
        style={{
          transform: `translate(${sh.x}px, ${sh.y}px) scale(${zoom})`,
          transformOrigin: "50% 35%",
          filter: "contrast(1.08) saturate(1.12)",
        }}
      >
        <AbsoluteFill style={tr}>
          {plano.id === "hook" && <Hook t={t} />}
          {plano.id === "grafico" && <Historia t={t} />}
          {plano.id === "problema" && <Problema t={t} />}
          {plano.id === "estrategia" && <Estrategia t={t} />}
          {plano.id === "emociones" && <Emociones t={t} />}
          {plano.id === "manana" && <Manana t={t} />}
        </AbsoluteFill>
      </AbsoluteFill>

      <AbsoluteFill style={{ backgroundColor: esc.id === "vuelve" ? C.verde : "#fff", opacity: destello * 0.7 }} />
      <Subtitulos t={t} />
      <Progreso t={t} />
    </AbsoluteFill>
  );
};

const Fondo: React.FC<{ t: number; tinte: string }> = ({ t, tinte }) => (
  <AbsoluteFill>
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 90% 55% at 50% 35%, ${tinte}40 0%, transparent 70%), linear-gradient(180deg, #0a1122 0%, ${C.fondo} 100%)`,
        transition: "none",
      }}
    />
    <AbsoluteFill
      style={{
        backgroundImage:
          "linear-gradient(rgba(120,160,255,0.06) 2px, transparent 2px), linear-gradient(90deg, rgba(120,160,255,0.06) 2px, transparent 2px)",
        backgroundSize: "90px 90px",
        backgroundPosition: `0 ${(t * 45) % 90}px`,
      }}
    />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%)" }} />
  </AbsoluteFill>
);

const Progreso: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", top: 0, left: 0, height: 10, width: ANCHO, background: "rgba(255,255,255,0.12)" }}>
    <div
      style={{
        height: "100%",
        width: `${(t / TL.duracion) * 100}%`,
        background: `linear-gradient(90deg, ${C.amarillo}, #ff9d2e)`,
        boxShadow: `0 0 16px ${C.amarillo}`,
      }}
    />
  </div>
);

// Texto con glitch RGB durante [t0, t0+d]
const Glitch: React.FC<{ t: number; t0: number; d?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  t,
  t0,
  d = 0.3,
  children,
  style,
}) => {
  const activo = t >= t0 && t < t0 + d;
  const k = activo ? Math.sin(t * 90) * 14 : 0;
  const corte = activo ? Math.round(Math.sin(t * 37) * 20) : 0;
  return (
    <div style={{ position: "relative", ...style }}>
      {activo && (
        <>
          <div style={{ position: "absolute", inset: 0, transform: `translate(${k}px, ${corte / 3}px)`, color: "#00e5ff", opacity: 0.8, mixBlendMode: "screen" }}>
            {children}
          </div>
          <div style={{ position: "absolute", inset: 0, transform: `translate(${-k}px, ${-corte / 3}px)`, color: "#ff0040", opacity: 0.8, mixBlendMode: "screen" }}>
            {children}
          </div>
        </>
      )}
      <div style={{ position: "relative", transform: `translateX(${corte}px)` }}>{children}</div>
    </div>
  );
};

const titular = (size: number, color: string = C.blanco): React.CSSProperties => ({
  ...texto,
  fontSize: size,
  color,
  textAlign: "center",
  lineHeight: 1.05,
});

const Emoji: React.FC<{ e: string; size: number; style?: React.CSSProperties }> = ({ e, size, style }) => (
  <div style={{ position: "absolute", fontSize: size, lineHeight: 1, ...style }}>{e}</div>
);

// ------------------------------------------------------------------ Hook
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const fin = escena("hook").e;
  const l1 = pop(t, 0.0);
  const l2 = pop(t, 0.16);
  const dibujo = lerp(t, 0.05, 1.0, 0, 1);
  const crash = "M 0 120 L 90 90 L 160 150 L 230 110 L 300 200 L 360 170 L 440 300 L 500 270 L 580 430 L 640 400 L 760 560";
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: SAFE.arriba + 40, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Glitch t={t} t0={T_PROBLEMA_HOOK - 0.02} d={0.32}>
          <div style={{ ...titular(100), transform: `scale(${l1})` }}>El error</div>
          <div style={{ ...titular(100, C.amarillo), transform: `scale(${l2})` }}>que repites</div>
          <div style={{ ...titular(100, C.amarillo), transform: `scale(${pop(t, 0.3)})` }}>cada día</div>
        </Glitch>
      </div>
      <svg width={760} height={560} style={{ position: "absolute", left: 160, top: 640, overflow: "visible", opacity: sale(t, fin) }}>
        <path d={crash} fill="none" stroke={C.rojo} strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dibujo} style={{ filter: `drop-shadow(0 0 18px ${C.rojo})` }} />
      </svg>
      <Emoji e="⚠️" size={170} style={{ left: 110, top: 700, transform: `scale(${pop(t, 0.46)}) rotate(${-10 + 6 * Math.sin(t * 8)}deg)` }} />
      <Emoji e="📉" size={150} style={{ left: 760, top: 900, transform: `scale(${pop(t, palabra(36, true).s)})` }} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ Historia (gráfico continuo)
const Historia: React.FC<{ t: number }> = ({ t }) => {
  const entrada = escena("entrada");
  const contra = escena("contra");
  const vuelve = escena("vuelve");
  const aCalma = Math.min(pop(t, palabra(0).s), sale(t, entrada.s + 0.1));
  const aCheck = Math.min(pop(t, K.estrategia), sale(t, contra.s));
  const rojo = lerp(t, K.contra, K.contra + 0.5, 0, 1) * lerp(t, vuelve.s, vuelve.s + 0.3, 1, 0);
  const tPensar = K.dudas;
  const burbuja = t >= K.beneficio && t < K.beneficio + 1.2;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, transparent 40%, ${C.rojo}55 100%)`, opacity: rojo * 0.9 }} />
      <div style={{ position: "absolute", left: 90, top: 400 }}>
        <Grafico t={t} />
      </div>

      {/* calma */}
      <div style={{ position: "absolute", top: SAFE.arriba + 30, width: ANCHO, display: "flex", justifyContent: "center" }}>
        <div style={{ ...chip("#10213f", C.azul), transform: `scale(${aCalma})`, opacity: aCalma > 0 ? 1 : 0 }}>☕ 09:30 · MERCADO ABIERTO</div>
      </div>
      <Emoji e="😌" size={120} style={{ left: 820, top: 440, transform: `scale(${Math.min(pop(t, palabra(3).s), sale(t, entrada.s + 0.1))})` }} />

      {/* entrada */}
      <div style={{ position: "absolute", left: 130, top: 480, transform: `translateX(${(1 - aCheck) * -60}px) scale(${aCheck})`, transformOrigin: "left center", opacity: aCheck > 0.01 ? 1 : 0 }}>
        <div style={{ ...chip("#0c2a1a", C.verde) }}>✅ CUMPLE TU ESTRATEGIA</div>
      </div>

      {/* contra */}
      <Emoji e="📉" size={110} style={{ left: 820, top: 300, transform: `scale(${Math.min(pop(t, K.contra), sale(t, escena("stop").s + 0.6))})` }} />
      <Emoji
        e="🤔"
        size={150}
        style={{ left: 560, top: 820, transform: `scale(${Math.min(pop(t, tPensar), sale(t, K.stop))}) rotate(${12 * Math.sin((t - tPensar) * 14)}deg)` }}
      />
      <Emoji e="🙏" size={120} style={{ left: 820, top: 300, transform: `scale(${Math.min(pop(t, K.seguro), sale(t, vuelve.s))})` }} />

      {/* vuelve */}
      <Emoji e="🚀" size={150} style={{ left: 800, top: 320 + (1 - entra(t, K.vuelve, 0.5)) * 120, transform: `scale(${Math.min(pop(t, K.vuelve), sale(t, escena("beneficio").s + 0.4))})` }} />

      {/* beneficio: ráfaga de 💰 */}
      {burbuja &&
        Array.from({ length: 10 }).map((_, i) => {
          const d = t - K.beneficio;
          const ang = (i / 10) * Math.PI * 2 + 0.3;
          const r = 60 + 420 * suave(Math.min(d / 0.8, 1));
          return (
            <Emoji
              key={i}
              e={i % 3 === 0 ? "💵" : "💰"}
              size={90}
              style={{ left: 495 + Math.cos(ang) * r, top: 700 + Math.sin(ang) * r * 0.7, opacity: lerp(t, K.beneficio + 0.7, K.beneficio + 1.2, 1, 0), transform: `scale(${pop(t, K.beneficio + i * 0.02)}) rotate(${i * 30}deg)` }}
            />
          );
        })}
    </AbsoluteFill>
  );
};

const chip = (bg: string, color: string): React.CSSProperties => ({
  fontFamily: FUENTE,
  fontWeight: 900,
  fontSize: 44,
  color,
  background: bg,
  border: `4px solid ${color}`,
  borderRadius: 22,
  padding: "16px 30px",
  boxShadow: `0 0 40px ${color}55`,
  whiteSpace: "nowrap",
});

// ------------------------------------------------------------------ Problema
const Problema: React.FC<{ t: number }> = ({ t }) => {
  const e = escena("problema");
  const slam = pop(t, palabra(34).s, 240);
  const titulo = pop(t, T_PROBLEMA, 260);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 90, top: 400, filter: "grayscale(1) brightness(0.45) blur(3px)", opacity: sale(t, e.e) }}>
        <Grafico t={K.t1} mini />
      </div>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, ${C.rojo}30 0%, ${C.rojo}70 100%)`, mixBlendMode: "multiply" }} />
      <Emoji e="⚠️" size={260} style={{ left: 410, top: 420, transform: `scale(${(2.2 - 1.2 * slam) * (slam > 0 ? 1 : 0)})`, opacity: sale(t, e.e) }} />
      <div style={{ position: "absolute", top: 780, width: ANCHO, display: "flex", justifyContent: "center", opacity: sale(t, e.e) }}>
        <Glitch t={t} t0={T_PROBLEMA - 0.02} d={0.35}>
          <div style={{ ...titular(100, C.rojo), transform: `scale(${titulo * (1.6 - 0.6 * titulo)})`, opacity: titulo > 0 ? 1 : 0 }}>El problema</div>
        </Glitch>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ Estrategia
const Estrategia: React.FC<{ t: number }> = ({ t }) => {
  const e = escena("estrategia");
  const tachon = palabra(44).s;
  const raya = lerp(t, tachon, tachon + 0.25, 0, 1);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 360, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", opacity: sale(t, e.e) }}>
        <div style={{ fontSize: 240, transform: `scale(${pop(t, e.s + 0.05)}) rotate(${-6 + 4 * Math.sin(t * 3)}deg)` }}>📘</div>
        <div style={{ position: "relative", marginTop: 20 }}>
          <div style={{ ...titular(88), opacity: 1 - 0.45 * raya }}>Tu estrategia</div>
          <div style={{ position: "absolute", left: -20, top: "52%", height: 16, width: `calc(${raya * 100}% + 40px)`, background: C.rojo, borderRadius: 8, boxShadow: `0 0 20px ${C.rojo}`, transform: "rotate(-4deg)" }} />
        </div>
      </div>
      <Emoji e="❌" size={170} style={{ left: 780, top: 360, transform: `scale(${pop(t, tachon + 0.15)})`, opacity: sale(t, e.e) }} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ Emociones
const Emociones: React.FC<{ t: number }> = ({ t }) => {
  const e = escena("emociones");
  const caras = ["😰", "🤑", "😤", "😱", "🥵"];
  const tEmo = palabra(48).s;
  return (
    <AbsoluteFill style={{ opacity: sale(t, e.e) }}>
      <Emoji e="🧠" size={230} style={{ left: 425, top: 380, transform: `scale(${pop(t, e.s + 0.03)})` }} />
      {caras.map((c, i) => {
        const ang = (i / caras.length) * Math.PI * 2 + (t - e.s) * 2.2;
        return (
          <Emoji key={c} e={c} size={110} style={{ left: 485 + Math.cos(ang) * 300, top: 450 + Math.sin(ang) * 190, transform: `scale(${pop(t, e.s + 0.08 + i * 0.06)})` }} />
        );
      })}
      <div style={{ position: "absolute", top: 820, width: ANCHO, display: "flex", justifyContent: "center" }}>
        <Glitch t={t} t0={tEmo - 0.05} d={0.35}>
          <div style={{ ...titular(88, C.rojo), transform: `scale(${pop(t, tEmo - 0.05)})` }}>Tus emociones</div>
        </Glitch>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ Mañana + loop + CTA
const Manana: React.FC<{ t: number }> = ({ t }) => {
  const e = escena("manana");
  const tMan = palabra(50).s;
  const tVol = palabra(52).s;
  const tMis = palabra(56).s;
  const cal = Math.min(pop(t, e.s + 0.03), sale(t, tVol));
  const rep = pop(t, tVol);
  // Repetición acelerada de la historia en bucle
  const ciclo = 1.6;
  const tRep = K.t0 + (((t - tVol) % ciclo) / ciclo) * (K.t1 - K.t0);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 380, width: ANCHO, display: "flex", justifyContent: "center", perspective: 1200 }}>
        <div style={{ width: 440, borderRadius: 34, overflow: "hidden", background: "#fff", transform: `rotateX(${(1 - cal) * 90}deg) scale(${0.6 + 0.4 * cal})`, opacity: cal > 0.01 ? 1 : 0, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
          <div style={{ background: C.rojo, padding: "18px 0", textAlign: "center", fontFamily: FUENTE, fontWeight: 900, fontSize: 54, color: "#fff" }}>MAÑANA</div>
          <div style={{ padding: "24px 0 34px", textAlign: "center", fontFamily: FUENTE, fontWeight: 900, fontSize: 200, color: "#111", lineHeight: 1 }}>
            30
          </div>
        </div>
      </div>
      {t >= tVol && (
        <div style={{ position: "absolute", left: 90, top: 420, transform: `scale(${0.82 * rep})`, transformOrigin: "50% 40%", opacity: sale(t, TL.duracion, 0.25) }}>
          <Grafico t={tRep} mini />
          <Emoji e="🔁" size={170} style={{ left: 365, top: 230, transform: `rotate(${(t - tVol) * 360}deg) scale(${rep})` }} />
        </div>
      )}
      <div style={{ position: "absolute", top: ALTO * 0.75, width: ANCHO, display: "flex", justifyContent: "center" }}>
        <div style={{ ...chip("#1d1604", C.amarillo), fontSize: 46, transform: `scale(${pop(t, tMis)})` }}>¿TE HA PASADO? COMENTA 👇</div>
      </div>
    </AbsoluteFill>
  );
};

export const DURACION_FRAMES = Math.round(TL.duracion * FPS);
