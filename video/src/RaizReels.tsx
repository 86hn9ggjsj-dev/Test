// Raíz solo con los reels de alcance del día: se renderiza con `npx remotion render src/reels.ts <Id> …` y no necesita
// los tiempos (src/gen/*.json) de los videos anteriores, que dependen de sus locuciones originales.
import { Composition } from "remotion";
import { Nueve, NUEVE_FPS, NUEVE_FRAMES } from "./Nueve/Nueve";
import { Rachas, RACHAS_FPS, RACHAS_FRAMES } from "./Rachas/Rachas";
import { Regla72, REGLA72_FPS, REGLA72_FRAMES } from "./Regla72/Regla72";
import { ALTO, ANCHO } from "./Viral/util";

export const RaizReels: React.FC = () => (
  <>
    <Composition id="Nueve" component={Nueve} durationInFrames={NUEVE_FRAMES} fps={NUEVE_FPS} width={ANCHO} height={ALTO} />
    <Composition id="Regla72" component={Regla72} durationInFrames={REGLA72_FRAMES} fps={REGLA72_FPS} width={ANCHO} height={ALTO} />
    <Composition id="Rachas" component={Rachas} durationInFrames={RACHAS_FRAMES} fps={RACHAS_FPS} width={ANCHO} height={ALTO} />
  </>
);
