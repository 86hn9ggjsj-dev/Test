import { interpolate } from "remotion";
import { C, entra, escena, FUENTE, lerp, palabra, pop, ruido, sale, suave } from "./util";

// Momentos clave de la historia (segundos en el timeline de salida)
export const K = {
  t0: escena("calma").s,
  estrategia: palabra(10).s,
  entras: palabra(12).s,
  contraEsc: escena("contra").s,
  contra: palabra(19).s,
  dudas: palabra(22).s,
  stop: palabra(25).s,
  seguro: palabra(28).s,
  vuelveEsc: escena("vuelve").s,
  vuelve: palabra(30).s,
  beneficio: palabra(33).s,
  t1: escena("problema").s,
};

const CT = 0.2; // duración de cada vela
const PREVIAS = 22;
const ENTRADA = 102;
const STOP_INI = 97.8;
const STOP_FIN = 95.4;

const pts: [number, number][] = [
  [K.t0, 100],
  [palabra(4).s, 100.4],
  [K.estrategia, 101.2],
  [K.entras, 102],
  [K.contraEsc, 102.3],
  [K.contra, 99.6],
  [K.dudas, 98.5],
  [K.dudas + 0.6, 98.9],
  [K.stop, 98.1],
  [K.seguro, 97.2],
  [palabra(29).s, 96.3],
  [K.vuelveEsc + 0.05, 96.1],
  [K.vuelveEsc + 0.45, 99.8],
  [K.beneficio, 102.9],
  [K.t1, 103.6],
];

export const precio = (t: number) => {
  const base = t <= K.t0 ? 100 : interpolate(t, pts.map((p) => p[0]), pts.map((p) => p[1]), {
    extrapolateRight: "clamp",
    easing: suave,
  });
  return base + 0.22 * Math.sin(t * 9.3) + 0.13 * Math.sin(t * 23.7);
};

export const stopEn = (t: number) => lerp(t, K.stop, K.stop + 0.55, STOP_INI, STOP_FIN);
export const pnl = (t: number) => Math.round((precio(t) - ENTRADA) * 100);

const W = 900;
const H = 640;
const MIN = 94.8;
const MAX = 104.6;
const VISIBLES = 24;
const XACT = W * 0.74;
const y = (p: number) => H - ((p - MIN) / (MAX - MIN)) * H;

export const Grafico: React.FC<{ t: number; mini?: boolean }> = ({ t, mini }) => {
  const inicio = K.t0 - PREVIAS * CT;
  const pos = (t - inicio) / CT;
  const actual = Math.floor(pos);
  const ancho = W * 0.74 / VISIBLES;
  const xDe = (k: number) => XACT - (pos - k) * ancho;

  const velas = [];
  for (let k = Math.max(0, actual - VISIBLES - 2); k <= actual; k++) {
    const tk = inicio + k * CT;
    const o = precio(tk);
    const c = k === actual ? precio(t) : precio(tk + CT);
    const h = Math.max(o, c) + 0.1 + ruido(k) * 0.35;
    const l = Math.min(o, c) - 0.1 - ruido(k + 99) * 0.35;
    const x = xDe(k);
    const col = c >= o ? C.verde : C.rojo;
    velas.push(
      <g key={k}>
        <line x1={x} x2={x} y1={y(h)} y2={y(l)} stroke={col} strokeWidth={4} />
        <rect
          x={x - ancho * 0.36}
          width={ancho * 0.72}
          y={y(Math.max(o, c))}
          height={Math.max(Math.abs(y(o) - y(c)), 3)}
          fill={col}
          rx={3}
        />
      </g>,
    );
  }

  const pAct = precio(t);
  const conPos = t >= K.entras;
  const aEntrada = entra(t, K.entras);
  const pBuy = pop(t, K.entras);
  const xBuy = xDe((K.entras - inicio) / CT);
  const stop = stopEn(t);
  const arrastrando = t >= K.stop - 0.1 && t < K.stop + 0.9;
  const valor = pnl(t);

  return (
    <div style={{ position: "relative", width: W, height: H }}>
      <svg width={W} height={H} style={{ overflow: "hidden" }}>
        {[96, 98, 100, 102, 104].map((p) => (
          <line key={p} x1={0} x2={W} y1={y(p)} y2={y(p)} stroke="rgba(120,160,255,0.10)" strokeWidth={2} />
        ))}
        {velas}
        {conPos && (
          <g opacity={aEntrada}>
            <line x1={0} x2={W} y1={y(ENTRADA)} y2={y(ENTRADA)} stroke={C.verde} strokeWidth={4} strokeDasharray="18 12" />
            {t >= K.stop && (
              <line
                x1={0}
                x2={W}
                y1={y(STOP_INI)}
                y2={y(STOP_INI)}
                stroke={C.rojo}
                strokeWidth={3}
                strokeDasharray="6 10"
                opacity={0.45 * lerp(t, K.stop, K.stop + 0.3, 0, 1)}
              />
            )}
            <line x1={0} x2={W} y1={y(stop)} y2={y(stop)} stroke={C.rojo} strokeWidth={5} strokeDasharray="18 12" />
          </g>
        )}
        <line x1={0} x2={W} y1={y(pAct)} y2={y(pAct)} stroke={C.azul} strokeWidth={2} opacity={0.5} />
      </svg>

      {/* Etiqueta de precio */}
      <Chip x={W - 150} y={y(pAct)} color={C.azul} texto={pAct.toFixed(2)} />
      {conPos && (
        <>
          <Chip x={W - 150} y={y(ENTRADA)} color={C.verde} texto="ENTRADA" opacidad={aEntrada} />
          <Chip x={W - 150} y={y(stop)} color={C.rojo} texto="STOP" opacidad={aEntrada} escala={arrastrando ? 1.15 : 1} />
          {!mini && arrastrando && (
            <div
              style={{
                position: "absolute",
                left: W - 190,
                top: y(stop) - 10,
                fontSize: 90,
                transform: `scale(${pop(t, K.stop - 0.1)}) rotate(-15deg)`,
                opacity: lerp(t, K.stop + 0.7, K.stop + 0.9, 1, 0),
              }}
            >
              👆
            </div>
          )}
          {!mini && t >= K.stop + 0.3 && t < K.vuelveEsc && (
            <div
              style={{
                position: "absolute",
                left: 20,
                top: y(STOP_INI) + 16,
                background: "rgba(6,10,20,0.8)",
                borderRadius: 10,
                padding: "4px 12px",
                fontFamily: FUENTE,
                fontWeight: 800,
                fontSize: 30,
                color: C.rojo,
                opacity: 0.9 * Math.min(entra(t, K.stop + 0.3), sale(t, K.vuelveEsc)),
              }}
            >
              ❌ TU STOP ORIGINAL
            </div>
          )}
          {/* BUY anclado a la vela de entrada */}
          <div
            style={{
              position: "absolute",
              left: xBuy - 70,
              top: y(ENTRADA) + 26,
              width: 140,
              textAlign: "center",
              fontFamily: FUENTE,
              fontWeight: 900,
              fontSize: 40,
              color: "#04120a",
              background: C.verde,
              borderRadius: 14,
              padding: "6px 0",
              transform: `scale(${pBuy})`,
              boxShadow: `0 0 40px ${C.verde}88`,
            }}
          >
            BUY ▲
          </div>
          {/* P&L */}
          {!mini && (
            <div
              style={{
                position: "absolute",
                left: 20,
                top: -110,
                fontFamily: FUENTE,
                fontWeight: 900,
                fontSize: t >= K.beneficio ? 64 + 26 * pop(t, K.beneficio) : 56,
                color: valor >= 0 ? C.verde : C.rojo,
                textShadow: `0 0 30px ${valor >= 0 ? C.verde : C.rojo}66`,
                opacity: aEntrada,
                transform: `translateY(${(1 - aEntrada) * 20}px)`,
              }}
            >
              P&L {valor >= 0 ? "+" : "−"}${Math.abs(valor)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Chip: React.FC<{ x: number; y: number; color: string; texto: string; opacidad?: number; escala?: number }> = ({
  x,
  y: yy,
  color,
  texto,
  opacidad = 1,
  escala = 1,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: yy - 24,
      width: 150,
      height: 48,
      lineHeight: "48px",
      textAlign: "center",
      background: color,
      color: "#060a14",
      fontFamily: FUENTE,
      fontWeight: 800,
      fontSize: 28,
      borderRadius: 10,
      opacity: opacidad,
      transform: `scale(${escala})`,
    }}
  >
    {texto}
  </div>
);
