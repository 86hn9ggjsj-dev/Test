import { AbsoluteFill, Audio, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import datos from "../gen/reto.json";
import { Subtitulos } from "../Viral/Subtitulos";
import { ANCHO, C, entra, FUENTE, golpeZoom, lerp, pop, sale, temblor, texto } from "../Viral/util";

export const RETO_FPS = datos.fps;
export const RETO_FRAMES = Math.round(datos.duracion * datos.fps);

const EV = datos.eventos;
const esc = (id: string) => datos.escenas.find((e) => e.id === id)!;
const CLAVES: Record<string, string> = {
  "85%": C.verde,
  "1": C.verde,
  "4": C.verde,
  dos: C.verde,
  "31": C.verde,
  reto: C.azul,
  tabla: C.azul,
  comentarios: C.azul,
};

type Tipo = "primer" | "medio" | "captura" | "tabla";
const planoEn = (t: number) => (datos.planos.find((p) => t >= p.s && t < p.e) ?? datos.planos[datos.planos.length - 1]) as { s: number; e: number; tipo: Tipo; pieza: number };

// Subtítulos: nunca sobre la cara ni sobre las capturas
const Y_SUB: Record<Tipo, number> = { primer: 0.73, medio: 0.66, captura: 0.3, tabla: 0.17 };
function Y_SUB_DE(tipo: string) {
  return Y_SUB[tipo as Tipo];
}
// Si el bloque coincide con una captura o la tabla, va en la posición de esa imagen (arriba nunca tapa la cara);
// si no, en la del plano en el que pasa más tiempo
const ySubtitulo = (ini: number, fin: number) => {
  const solape = (p: { s: number; e: number }) => Math.min(fin, p.e) - Math.max(ini, p.s);
  const imagen = datos.planos.find((p) => (p.tipo === "captura" || p.tipo === "tabla") && solape(p) > 0.12);
  if (imagen) return Y_SUB_DE(imagen.tipo);
  const mejor = datos.planos.reduce((a, p) => (solape(p) > solape(a) ? p : a));
  return Y_SUB_DE(mejor.tipo);
};
// Además de las escenas, los bloques se parten donde cambia la altura de los subtítulos
const CORTES = [
  ...datos.escenas.map((e) => e.s),
  ...datos.planos.filter((p, k) => k > 0 && Y_SUB_DE(p.tipo) !== Y_SUB_DE(datos.planos[k - 1].tipo)).map((p) => p.s),
];

// Reencuadre en los jump cuts dentro del mismo plano (piezas 3 y 5)
const ENCUADRE = [1, 1, 1, 1.1, 1, 1.1];
const GOLPES: [number, number][] = [
  [EV.t85, 0.08],
  [EV.dos, 0.07],
  [EV.treintayuno, 0.1],
  [EV.comentarios, 0.06],
];

export const Reto: React.FC = () => {
  const t = useCurrentFrame() / RETO_FPS;
  const plano = planoEn(t);

  let escala = ENCUADRE[plano.pieza] + GOLPES.reduce((a, [t0, amt]) => a + golpeZoom(t, t0, amt, 0.2, 0.3, 0.45), 0);
  let origen = "50% 40%";
  if (plano.tipo === "captura" || plano.tipo === "tabla") {
    escala = lerp(t, plano.s, plano.e, 1, 1.06, (x) => x);
    origen = "50% 50%";
  }
  const sh = [EV.treintayuno].reduce(
    (a, t0) => {
      const s = temblor(t, t0, 14);
      return { x: a.x + s.x, y: a.y + s.y };
    },
    { x: 0, y: 0 },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <Audio src={staticFile("gen/reto_mezcla.wav")} />
      <AbsoluteFill
        style={{
          transform: `translate(${sh.x}px, ${sh.y}px) scale(${escala})`,
          transformOrigin: origen,
        }}
      >
        <OffthreadVideo src={staticFile("gen/reto_base.mp4")} muted style={{ width: "100%", height: "100%" }} />
        {plano.tipo === "captura" && <NotasCaptura t={t} />}
        {plano.tipo === "tabla" && <NotasTabla t={t} />}
      </AbsoluteFill>

      <Bienvenida t={t} />
      <Hoy t={t} />
      <Pasos t={t} />
      <Casilla t={t} />
      <Cta t={t} />

      <Subtitulos
        t={t}
        palabras={datos.palabras}
        cortes={CORTES}
        claves={CLAVES}
        duracion={datos.duracion}
        y={ySubtitulo}
      />
      <Progreso t={t} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ piezas gráficas
const chip = (color: string, bg = "rgba(8,12,20,0.82)"): React.CSSProperties => ({
  fontFamily: FUENTE,
  fontWeight: 900,
  fontSize: 46,
  color,
  background: bg,
  border: `4px solid ${color}`,
  borderRadius: 22,
  padding: "12px 28px",
  boxShadow: `0 0 36px ${color}66, 0 10px 30px rgba(0,0,0,0.5)`,
  whiteSpace: "nowrap",
  display: "inline-block",
});

const Arriba: React.FC<{ top?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ top = 250, children, style }) => (
  <div style={{ position: "absolute", top, width: ANCHO, display: "flex", justifyContent: "center", alignItems: "center", gap: 20, ...style }}>
    {children}
  </div>
);

const Progreso: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", top: 0, left: 0, height: 10, width: ANCHO, background: "rgba(255,255,255,0.15)" }}>
    <div style={{ height: "100%", width: `${(t / datos.duracion) * 100}%`, background: `linear-gradient(90deg, ${C.verde}, ${C.amarillo})`, boxShadow: `0 0 16px ${C.verde}` }} />
  </div>
);

const Bienvenida: React.FC<{ t: number }> = ({ t }) => {
  const fin = esc("hoy").s;
  if (t < EV.dia - 0.1 || t >= fin) return null;
  const s = sale(t, fin);
  return (
    <Arriba top={260}>
      <div style={{ ...chip(C.verde), transform: `scale(${Math.min(pop(t, EV.dia - 0.08), s)})` }}>📅 DÍA 1</div>
      <div style={{ ...chip(C.azul), transform: `scale(${Math.min(pop(t, EV.segundo), s)})` }}>🔁 INTENTO #2</div>
    </Arriba>
  );
};

const Hoy: React.FC<{ t: number }> = ({ t }) => {
  const fin = esc("eso").s;
  if (t < EV.t85 - 0.1 || t >= fin) return null;
  return (
    <Arriba top={250}>
      <div style={{ ...chip(C.verde), fontSize: 50, transform: `scale(${Math.min(pop(t, EV.t85 - 0.05), sale(t, fin))})` }}>+85% DE LA CUENTA 🚀</div>
    </Arriba>
  );
};

// Coordenadas medidas sobre el fotograma a 1080x1920
const FILAS = [757, 872, 990, 1107];
const GANA = [true, true, false, true];

const NotasCaptura: React.FC<{ t: number }> = ({ t }) => {
  const caja = lerp(t, EV.veis - 0.1, EV.veis + 0.2, 0, 1);
  return (
    <AbsoluteFill>
      {FILAS.map((y, k) => {
        const p = pop(t, EV.cuatro + 0.12 * k);
        const col = GANA[k] ? C.verde : C.rojo;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 108 - 38,
              top: y - 38,
              width: 76,
              height: 76,
              borderRadius: 38,
              background: col,
              color: "#061008",
              fontFamily: FUENTE,
              fontWeight: 900,
              fontSize: 42,
              lineHeight: "76px",
              textAlign: "center",
              transform: `scale(${p})`,
              boxShadow: `0 0 24px ${col}`,
              border: "4px solid #000",
            }}
          >
            {k + 1}
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 112,
          top: 1228,
          height: 56,
          width: 856 * caja,
          border: `5px solid ${C.verde}`,
          borderRadius: 14,
          boxShadow: `0 0 30px ${C.verde}, inset 0 0 20px ${C.verde}55`,
          opacity: caja > 0.01 ? 1 : 0,
        }}
      />
      <div style={{ position: "absolute", top: 1300, width: ANCHO, display: "flex", justifyContent: "center" }}>
        <div style={{ ...chip(C.verde, "#06140c"), fontSize: 44, transform: `scale(${pop(t, EV.veis + 0.15)})` }}>+80,44 $ 💰</div>
      </div>
    </AbsoluteFill>
  );
};

const NotasTabla: React.FC<{ t: number }> = ({ t }) => {
  const caja = lerp(t, EV.tabla - 0.1, EV.tabla + 0.2, 0, 1);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 170,
          top: 1442,
          height: 42,
          width: 748 * caja,
          border: `5px solid ${C.amarillo}`,
          borderRadius: 10,
          boxShadow: `0 0 30px ${C.amarillo}`,
          opacity: caja > 0.01 ? 1 : 0,
        }}
      />
      <div style={{ position: "absolute", top: 1345, width: ANCHO, display: "flex", justifyContent: "center" }}>
        <div style={{ ...chip(C.amarillo), fontSize: 36, padding: "8px 22px", transform: `scale(${pop(t, EV.tabla + 0.1)})` }}>🎯 OBJETIVO: NIVEL 31 → 102.170 €</div>
      </div>
    </AbsoluteFill>
  );
};

const Pasos: React.FC<{ t: number }> = ({ t }) => {
  const e = esc("eso");
  if (t < e.s || t >= e.e) return null;
  const a = Math.min(entra(t, e.s + 0.05), sale(t, e.e));
  const paso = lerp(t, EV.dos, EV.dos + 0.2, 0, 1) + lerp(t, EV.dos + 0.25, EV.dos + 0.45, 0, 1);
  const x0 = 150;
  const dx = 780 / 30;
  return (
    <div style={{ position: "absolute", top: 250, left: 0, width: ANCHO, height: 190, opacity: a, transform: `translateY(${(1 - a) * -30}px)` }}>
      <div style={{ position: "absolute", left: x0 - 30, top: 0, right: x0 - 30, display: "flex", justifyContent: "space-between", fontFamily: FUENTE, fontWeight: 900, fontSize: 40, color: "#fff", WebkitTextStroke: "8px #000", paintOrder: "stroke fill" }}>
        <span>EL RETO</span>
        <span style={{ color: C.verde, display: "inline-block", transform: `scale(${1 + golpeZoom(t, EV.dos, 0.25, 0.1, 0.35, 0.3)})` }}>
          PASO {Math.round(paso)}/31
        </span>
      </div>
      <div style={{ position: "absolute", left: x0 - 30, right: x0 - 30, top: 90, height: 56, borderRadius: 28, background: "rgba(8,12,20,0.8)", border: "3px solid rgba(255,255,255,0.25)" }} />
      {Array.from({ length: 31 }).map((_, i) => {
        const hecho = i <= paso;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x0 + i * dx - 8,
              top: 110,
              width: 16,
              height: 16,
              borderRadius: 8,
              background: i === 30 ? C.amarillo : hecho ? C.verde : "rgba(255,255,255,0.3)",
              boxShadow: hecho ? `0 0 12px ${C.verde}` : undefined,
            }}
          />
        );
      })}
      <div style={{ position: "absolute", left: x0 + paso * dx - 32, top: 70, fontSize: 64, transform: `translateY(${-10 * Math.abs(Math.sin(paso * Math.PI))}px)` }}>👣</div>
    </div>
  );
};

const Casilla: React.FC<{ t: number }> = ({ t }) => {
  const e = esc("casilla");
  if (t < EV.casilla - 0.15 || t >= e.e) return null;
  const n = Math.round(lerp(t, EV.casilla - 0.1, EV.treintayuno, 2, 31));
  const golpe = pop(t, EV.treintayuno, 260);
  const s = sale(t, e.e);
  return (
    <Arriba top={220} style={{ opacity: s }}>
      <div style={{ fontSize: 150, transform: `scale(${pop(t, EV.casilla - 0.12)}) rotate(${-8 + 8 * golpe}deg)` }}>🎯</div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${pop(t, EV.casilla - 0.1)})` }}>
        <div style={{ ...texto, fontSize: 44, color: C.amarillo }}>Casilla</div>
        <div style={{ ...texto, fontSize: 170, lineHeight: 1, color: t >= EV.treintayuno ? C.verde : "#fff", transform: `scale(${1 + golpeZoom(t, EV.treintayuno, 0.25, 0.1, 0.3, 0.35)})`, textShadow: t >= EV.treintayuno ? `0 0 40px ${C.verde}` : undefined }}>
          {n}
        </div>
      </div>
    </Arriba>
  );
};

const Cta: React.FC<{ t: number }> = ({ t }) => {
  const e = esc("cta");
  if (t < e.s) return null;
  return (
    <>
      <Arriba top={240}>
        <div style={{ ...chip(C.amarillo), fontSize: 48, transform: `scale(${pop(t, e.s + 0.03)})` }}>💬 ¿LLEGAREMOS A LA 31?</div>
      </Arriba>
      <Arriba top={365}>
        <div style={{ ...chip(C.verde), fontSize: 44, transform: `scale(${pop(t, EV.comentarios - 0.1)})` }}>SÍ 👍</div>
        <div style={{ ...chip(C.rojo), fontSize: 44, transform: `scale(${pop(t, EV.comentarios)})` }}>NO 👎</div>
        <div style={{ fontSize: 70, transform: `translateY(${12 * Math.sin(t * 12)}px) scale(${pop(t, EV.comentarios + 0.1)})` }}>👇</div>
      </Arriba>
    </>
  );
};
