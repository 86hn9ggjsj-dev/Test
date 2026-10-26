// Cierre de promo del bot (desde la parte 4): ficha de perfil con la cuenta auditada en el link de la bio,
// botones de Seguir y Mensaje y un mensaje privado que se escribe solo.
import { ANCHO, SANS } from "../Viral/util";
import { L, mono, muelle } from "../Bot/piezas";

const Robot: React.FC = () => (
  <svg width={84} height={84} viewBox="0 0 80 80" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round">
    <line x1={40} y1={9} x2={40} y2={18} />
    <circle cx={40} cy={7} r={3} fill="#fff" stroke="none" />
    <rect x={14} y={18} width={52} height={40} rx={10} />
    <circle cx={30} cy={36} r={5} fill="#fff" stroke="none" />
    <circle cx={50} cy={36} r={5} fill="#fff" stroke="none" />
    <line x1={30} y1={48} x2={50} y2={48} />
    <line x1={8} y1={34} x2={14} y2={34} />
    <line x1={66} y1={34} x2={72} y2={34} />
  </svg>
);

const boton = (activo: boolean, ancho: number): React.CSSProperties => ({
  width: ancho,
  height: 78,
  borderRadius: 18,
  border: "2px solid #fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: activo ? "#fff" : "transparent",
  color: activo ? "#000" : "#fff",
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: 36,
});

export const Promo: React.FC<{ t: number; t0: number; tAuditada: number; tLink: number; tSigue: number; tEscribe: number; tInfo: number }> = ({
  t,
  t0,
  tAuditada,
  tLink,
  tSigue,
  tEscribe,
  tInfo,
}) => {
  const ficha = muelle(t, t0 + 0.05, 150, 17);
  const sello = muelle(t, tAuditada - 0.05, 220, 14);
  const link = muelle(t, tLink - 0.05, 220, 13);
  const pulso = t >= tLink ? 0.5 + 0.5 * Math.cos((t - tLink) * 7) : 0;
  const sigue = t >= tSigue;
  const pulsa = muelle(t, tEscribe - 0.05, 260, 15);
  const burbuja = muelle(t, tEscribe + 0.25, 200, 16);
  const texto = "Hola, quiero más info";
  const letras = Math.round(L(t, tEscribe + 0.35, tInfo + 0.2, 0, texto.length, (u) => u));
  const sube = t >= tLink ? -10 * Math.abs(Math.sin((t - tLink) * 5)) : 0;
  return (
    <>
      <div style={{ position: "absolute", top: 500, left: 0, width: ANCHO, display: "flex", justifyContent: "center", perspective: 1400 }}>
        <div
          style={{
            width: 860,
            padding: "40px 44px",
            borderRadius: 30,
            border: "1.5px solid rgba(255,255,255,0.45)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.015))",
            display: "flex",
            flexDirection: "column",
            gap: 30,
            opacity: Math.min(ficha * 1.6, 1),
            transform: `translateY(${(1 - Math.min(ficha, 1)) * 120}px) rotateX(${(1 - Math.min(ficha, 1)) * 25 + 6}deg)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            <div style={{ width: 132, height: 132, borderRadius: 999, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Robot />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 46, color: "#fff", letterSpacing: "-0.02em" }}>Bot de trading</span>
              <span style={mono(22, 0.6)}>TRADING ALGORÍTMICO</span>
              <span
                style={{
                  ...mono(22),
                  alignSelf: "flex-start",
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "1.5px solid #fff",
                  opacity: Math.min(sello * 1.5, 1),
                  transform: `scale(${0.7 + 0.3 * Math.min(sello, 1.1)})`,
                  transformOrigin: "left center",
                }}
              >
                CUENTA AUDITADA ✓
              </span>
            </div>
          </div>
          <div style={{ position: "relative", alignSelf: "flex-start", opacity: 0.35 + 0.65 * Math.min(link, 1) }}>
            <div
              style={{
                ...mono(28, 1),
                padding: "14px 26px",
                borderRadius: 999,
                border: "2px solid #fff",
                background: `rgba(255,255,255,${0.85 * pulso * Math.min(link, 1)})`,
                color: pulso > 0.5 ? "#000" : "#fff",
              }}
            >
              ↗ cuenta auditada del bot
            </div>
            <div style={{ position: "absolute", left: "100%", top: "50%", marginLeft: 22, transform: `translateY(calc(-50% + ${sube}px))`, opacity: Math.min(link, 1), whiteSpace: "nowrap" }}>
              <span style={mono(26)}>↑ LINK EN LA BIO</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={boton(sigue, 380)}>{sigue ? "Siguiendo ✓" : "Seguir"}</div>
            <div style={{ ...boton(pulsa > 0.5, 380), transform: `scale(${1 - 0.06 * Math.sin(Math.min(pulsa, 1) * Math.PI)})` }}>Mensaje</div>
          </div>
        </div>
      </div>
      {burbuja > 0.001 && (
        <div style={{ position: "absolute", top: 1150, right: 110, opacity: Math.min(burbuja * 1.5, 1), transform: `translateY(${(1 - Math.min(burbuja, 1)) * 40}px)` }}>
          <div style={{ padding: "22px 30px", borderRadius: "28px 28px 6px 28px", background: "#fff", color: "#000", fontFamily: SANS, fontWeight: 600, fontSize: 38, minWidth: 120 }}>
            {letras > 0 ? texto.slice(0, letras) : <span style={{ letterSpacing: 6 }}>{".".repeat(1 + (Math.floor(t * 4) % 3))}</span>}
          </div>
        </div>
      )}
    </>
  );
};
