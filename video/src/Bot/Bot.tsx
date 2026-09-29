import { AbsoluteFill, Audio, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import datos from "../gen/bot.json";
import { Arriba, etiqueta, Linea, Progreso, Revela, salida, sans, serif } from "../Premium/ui";
import { ORO, Subtitulos } from "../Viral/Subtitulos";
import { C, golpeZoom, lerp, SANS, suave } from "../Viral/util";

export const BOT_FPS = datos.fps;
export const BOT_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const esc = (id: string) => datos.escenas.find((e) => e.id === id)!;

// Palabras clave: serif cursiva dorada
const CLAVES: Record<string, string> = {};
for (const w of ["tres", "libertad", "tiempo", "100%", "99%", "psicológica", "automático", "rentabilidad", "proporcional", "tabla", "privado"]) {
  CLAVES[w] = ORO;
}

type Tipo = "medio" | "captura" | "tabla";
const planoEn = (t: number) => (datos.planos.find((p) => t >= p.s && t < p.e) ?? datos.planos[datos.planos.length - 1]) as { s: number; e: number; tipo: Tipo; pieza: number };
// Subtítulos bajo la cara; con la captura (que baja hasta el 69 %) van algo más abajo
const Y_SUB: Record<Tipo, number> = { medio: 0.66, captura: 0.76, tabla: 0.66 };
const ySubtitulo = (ini: number, fin: number) => {
  const solape = (p: { s: number; e: number }) => Math.min(fin, p.e) - Math.max(ini, p.s);
  const captura = datos.planos.find((p) => p.tipo === "captura" && solape(p) > 0.12);
  return Y_SUB[(captura ?? datos.planos.reduce((a, p) => (solape(p) > solape(a) ? p : a))).tipo as Tipo];
};
const CORTES = [...datos.escenas.map((e) => e.s), ...datos.planos.map((p) => p.s)];

// Reencuadre alterno en cada jump cut de la toma continua
const ENCUADRE = datos.piezas.map((_, k) => (k % 2 ? 1.08 : 1));
const GOLPES: [number, number][] = [
  [EV.tres, 0.05],
  [EV.libertad, 0.04],
  [EV.n99, 0.05],
  [EV.rentabilidad, 0.04],
  [EV.privado, 0.04],
];

export const Bot: React.FC = () => {
  const t = useCurrentFrame() / BOT_FPS;
  const plano = planoEn(t);
  let escala = ENCUADRE[plano.pieza] + GOLPES.reduce((a, [t0, amt]) => a + golpeZoom(t, t0, amt, 0.2, 0.3, 0.45), 0);
  let origen = "50% 40%";
  if (plano.tipo === "captura" || plano.tipo === "tabla") {
    escala = lerp(t, plano.s, plano.e, 1, 1.05, (x) => x);
    origen = plano.tipo === "tabla" ? "50% 30%" : "50% 50%";
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <Audio src={staticFile("gen/bot_mezcla.wav")} />
      <AbsoluteFill style={{ transform: `scale(${escala})`, transformOrigin: origen }}>
        <OffthreadVideo src={staticFile("gen/bot_base.mp4")} muted style={{ width: "100%", height: "100%" }} />
        {plano.tipo === "captura" && <NotasCaptura t={t} />}
        {plano.tipo === "tabla" && <NotasTabla t={t} />}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 65% at 50% 45%, transparent 55%, rgba(0,0,0,0.38) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.42) 16%, rgba(0,0,0,0.15) 28%, transparent 38%)" }} />

      <Intro t={t} />
      <Ventaja1 t={t} />
      <Ventaja2 t={t} />
      <Ventaja3 t={t} />
      <Cta t={t} />

      <Subtitulos t={t} palabras={datos.palabras} cortes={CORTES} claves={CLAVES} duracion={datos.duracion} y={ySubtitulo} estilo="premium" />
      <Progreso t={t} duracion={datos.duracion} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ piezas gráficas
const Fila: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>{children}</div>
);

const Visto: React.FC = () => (
  <svg width={30} height={30} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.6))" }}>
    <path d="M4 12.5l5 5L20 6.5" fill="none" stroke={ORO} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Intro: React.FC<{ t: number }> = ({ t }) => {
  const fin = esc("v1").s;
  if (t >= fin) return null;
  return (
    <Arriba t={t} t0={0.02} fin={fin}>
      <Revela t={t} t0={0.05} fin={fin}>
        <div style={etiqueta}>Trading automático</div>
      </Revela>
      <Revela t={t} t0={0.12} fin={fin}>
        <Fila>
          <span style={sans(60)}>Las</span>
          <span style={serif(120)}>3</span>
          <span style={sans(60)}>ventajas</span>
        </Fila>
      </Revela>
      <Linea t={t} t0={EV.tres} fin={fin} ancho={260} />
      <Revela t={t} t0={EV.tres + 0.3} fin={fin}>
        <div style={{ ...sans(34), fontWeight: 600 }}>de tener un bot de trading</div>
      </Revela>
    </Arriba>
  );
};

const Ventaja: React.FC<{ t: number; t0: number; fin: number; numero: string; children: React.ReactNode; pie?: React.ReactNode; tPie?: number }> = ({
  t,
  t0,
  fin,
  numero,
  children,
  pie,
  tPie,
}) => {
  if (t < t0 - 0.05 || t >= fin) return null;
  return (
    <Arriba t={t} t0={t0} fin={fin}>
      <Revela t={t} t0={t0 + 0.03} fin={fin}>
        <div style={etiqueta}>Ventaja {numero}</div>
      </Revela>
      <Revela t={t} t0={t0 + 0.1} fin={fin}>
        {children}
      </Revela>
      <Linea t={t} t0={t0 + 0.2} fin={fin} ancho={240} />
      {pie && (
        <Revela t={t} t0={tPie ?? t0 + 0.3} fin={fin}>
          {pie}
        </Revela>
      )}
    </Arriba>
  );
};

const Ventaja1: React.FC<{ t: number }> = ({ t }) => {
  const e = esc("v1");
  return (
    <Ventaja t={t} t0={e.s} fin={e.e} numero="01" tPie={EV.auto1} pie={<div style={{ ...sans(34), fontWeight: 600 }}>Opera 100 % en automático</div>}>
      <Fila>
        <span style={sans(58)}>Libertad de</span>
        <span style={serif(100)}>tiempo</span>
      </Fila>
    </Ventaja>
  );
};

const Ventaja2: React.FC<{ t: number }> = ({ t }) => {
  const e = esc("v2");
  if (t < e.s - 0.05 || t >= e.e) return null;
  if (t < EV.gestiona) {
    return (
      <Ventaja t={t} t0={e.s} fin={EV.gestiona} numero="02" tPie={EV.psicologica} pie={<div style={{ ...sans(34), fontWeight: 600 }}>La gestión psicológica</div>}>
        <Fila>
          <span style={sans(50)}>El error del</span>
          <span style={serif(100)}>99 %</span>
          <span style={sans(50)}>de traders</span>
        </Fila>
      </Ventaja>
    );
  }
  const items: [string, number][] = [
    ["Cada operación", EV.operacion],
    ["Cierres", EV.cierras],
    ["Stops", EV.stops],
  ];
  return (
    <Arriba t={t} t0={EV.gestiona} fin={e.e}>
      <Revela t={t} t0={EV.gestiona + 0.03} fin={e.e}>
        <div style={etiqueta}>El bot gestiona por ti</div>
      </Revela>
      <div style={{ display: "flex", gap: 30, marginTop: 6 }}>
        {items.map(([texto, t0]) => (
          <Revela key={texto} t={t} t0={t0} fin={e.e}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Visto />
              <span style={{ ...sans(36), fontWeight: 600 }}>{texto}</span>
            </div>
          </Revela>
        ))}
      </div>
    </Arriba>
  );
};

const Ventaja3: React.FC<{ t: number }> = ({ t }) => {
  const e = esc("v3");
  if (t < e.s - 0.05 || t >= EV.tablaPlano) return null;
  if (t < EV.proporcional) {
    return (
      <Ventaja t={t} t0={e.s} fin={EV.proporcional} numero="03" tPie={EV.capital} pie={<div style={{ ...sans(34), fontWeight: 600 }}>incluso con poco capital</div>}>
        <span style={serif(110)}>Rentabilidad</span>
      </Ventaja>
    );
  }
  // Barras 1K / 10K / 100K: el beneficio crece con lo invertido
  const barras: [string, number][] = [
    ["1K", 40],
    ["10K", 70],
    ["100K", 100],
  ];
  return (
    <Arriba t={t} t0={EV.proporcional} fin={EV.tablaPlano}>
      <Revela t={t} t0={EV.proporcional + 0.03} fin={EV.tablaPlano}>
        <div style={etiqueta}>Directamente</div>
      </Revela>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 34 }}>
        <Revela t={t} t0={EV.proporcional + 0.1} fin={EV.tablaPlano}>
          <span style={serif(96)}>proporcional</span>
        </Revela>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 100, paddingBottom: 10 }}>
          {barras.map(([txt, h], k) => {
            const v = lerp(t, EV.proporcional + 0.25 + 0.15 * k, EV.proporcional + 0.75 + 0.15 * k, 0, 1, salida) *
              (1 - lerp(t, EV.tablaPlano - 0.3, EV.tablaPlano, 0, 1));
            return (
              <div key={txt} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: 26, height: h * v, borderRadius: 4, background: ORO, boxShadow: "0 2px 10px rgba(0,0,0,0.5)" }} />
                <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 18, color: C.blanco, opacity: v }}>{txt}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Arriba>
  );
};

// Coordenadas medidas sobre el fotograma a 1080x1920
const NotasCaptura: React.FC<{ t: number }> = ({ t }) => {
  const caja = lerp(t, EV.captura + 0.1, EV.captura + 0.5, 0, 1, salida);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 1012,
          width: 858,
          height: 60,
          border: `2px solid ${ORO}`,
          borderRadius: 10,
          background: "rgba(242,201,107,0.14)",
          boxShadow: `0 0 24px ${ORO}66`,
          clipPath: `inset(0 ${(1 - caja) * 100}% 0 0)`,
        }}
      />
    </AbsoluteFill>
  );
};

const FILAS_TABLA = [558, 632, 708];
const NotasTabla: React.FC<{ t: number }> = ({ t }) => {
  // La tabla sale antes de "generado": el beneficio se resalta justo después de marcar las tres filas
  const tBeneficio = EV.cantidades + 0.9;
  const beneficio = lerp(t, tBeneficio, tBeneficio + 0.5, 0, 1, salida);
  return (
    <AbsoluteFill>
      {FILAS_TABLA.map((y, k) => {
        const v = lerp(t, EV.cantidades + 0.15 * k, EV.cantidades + 0.15 * k + 0.45, 0, 1, salida);
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 112,
              top: y - 33,
              width: 854,
              height: 66,
              border: `1.5px solid ${ORO}`,
              borderRadius: 8,
              clipPath: `inset(0 ${(1 - v) * 100}% 0 0)`,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 520,
          top: FILAS_TABLA[0] - 33,
          width: 446,
          height: FILAS_TABLA[2] - FILAS_TABLA[0] + 66,
          borderRadius: 8,
          background: "rgba(242,201,107,0.16)",
          boxShadow: `inset 0 0 0 2px ${ORO}`,
          opacity: suave(beneficio),
        }}
      />
    </AbsoluteFill>
  );
};

const Cta: React.FC<{ t: number }> = ({ t }) => {
  const e = esc("cta");
  if (t < e.s - 0.05) return null;
  return (
    <Arriba t={t} t0={e.s}>
      <Revela t={t} t0={e.s + 0.03}>
        <div style={etiqueta}>¿Quieres más información?</div>
      </Revela>
      <Revela t={t} t0={e.s + 0.1}>
        <Fila>
          <span style={sans(58)}>Escríbeme por</span>
          <span style={serif(100)}>privado</span>
        </Fila>
      </Revela>
      <Linea t={t} t0={EV.privado} ancho={240} />
    </Arriba>
  );
};

