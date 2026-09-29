import { AbsoluteFill, Audio, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import datos from "../gen/bot.json";
import { Arriba, etiqueta, Linea, Progreso, Revela, salida, sans, serif } from "../Premium/ui";
import { ORO, Subtitulos } from "../Viral/Subtitulos";
import { fondoEn, Pantallas, PANTALLAS } from "./Pantallas";
import { golpeZoom, lerp, suave } from "../Viral/util";

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
  if (PANTALLAS.some((p) => solape(p) > 0.12)) return 0.76;
  const captura = datos.planos.find((p) => p.tipo === "captura" && solape(p) > 0.12);
  return Y_SUB[(captura ?? datos.planos.reduce((a, p) => (solape(p) > solape(a) ? p : a))).tipo as Tipo];
};
const CORTES = [...datos.escenas.map((e) => e.s), ...datos.planos.map((p) => p.s), ...PANTALLAS.map((p) => p.s), ...PANTALLAS.map((p) => p.e)];

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

      {/* Las tarjetas ceden el sitio a las pantallas de motion graphics */}
      <AbsoluteFill style={{ opacity: 1 - fondoEn(t) }}>
        <Ventaja1 t={t} />
        <Ventaja2 t={t} />
        <Ventaja3 t={t} />
      </AbsoluteFill>
      <Pantallas t={t} />

      <Subtitulos t={t} palabras={datos.palabras} cortes={CORTES} claves={CLAVES} duracion={datos.duracion} y={ySubtitulo} estilo="premium" />
      <Progreso t={t} duracion={datos.duracion} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ piezas gráficas
const Fila: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>{children}</div>
);

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

const Ventaja1: React.FC<{ t: number }> = ({ t }) => (
  <Ventaja t={t} t0={esc("v1").s} fin={EV.p_reloj_s} numero="01">
    <Fila>
      <span style={sans(58)}>Libertad de</span>
      <span style={serif(100)}>tiempo</span>
    </Fila>
  </Ventaja>
);

const Ventaja2: React.FC<{ t: number }> = ({ t }) => (
  <Ventaja t={t} t0={esc("v2").s} fin={EV.p_noventa_s} numero="02">
    <Fila>
      <span style={sans(54)}>Adiós a la</span>
      <span style={serif(96)}>psicología</span>
    </Fila>
  </Ventaja>
);

const Ventaja3: React.FC<{ t: number }> = ({ t }) => (
  <Ventaja t={t} t0={esc("v3").s} fin={EV.p_prop_s} numero="03" tPie={EV.capital} pie={<div style={{ ...sans(34), fontWeight: 600 }}>incluso con poco capital</div>}>
    <span style={serif(110)}>Rentabilidad</span>
  </Ventaja>
);

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

