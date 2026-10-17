// Versión 100 % motion graphics del video "bot": solo el audio (voz, música y SFX) y pantallas encadenadas
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import datos from "../gen/bot.json";
import { Progreso } from "../Premium/ui";
import { Subtitulos } from "../Viral/Subtitulos";
import { PANTALLAS_MG, PantallasMG } from "./Pantallas";

const CLAVES: Record<string, string> = {};
for (const w of ["tres", "libertad", "tiempo", "100%", "99%", "psicológica", "automático", "rentabilidad", "proporcional", "tabla", "privado"]) {
  CLAVES[w] = "#ffffff";
}
const CORTES = PANTALLAS_MG.map((p) => p.s);

export const BotMG: React.FC = () => {
  const t = useCurrentFrame() / datos.fps;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Audio src={staticFile("gen/bot_mezcla.wav")} />
      <PantallasMG t={t} />
      <Subtitulos t={t} palabras={datos.palabras} cortes={CORTES} claves={CLAVES} duracion={datos.duracion} y={() => 0.765} estilo="premium" dinamico />
      <Progreso t={t} duracion={datos.duracion} />
    </AbsoluteFill>
  );
};
