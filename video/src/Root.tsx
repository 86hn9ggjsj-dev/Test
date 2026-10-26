import { Composition } from "remotion";
import { Bot, BOT_FPS, BOT_FRAMES } from "./Bot/Bot";
import { Cifras, CIFRAS_FPS, CIFRAS_FRAMES } from "./Cifras/Cifras";
import { Errores, ERRORES_FPS, ERRORES_FRAMES } from "./Errores/Errores";
import { Estafa, ESTAFA_FPS, ESTAFA_FRAMES } from "./Estafa/Estafa";
import { BotMG } from "./Bot/BotMG";
import { Explica, EXPLICA_FPS, EXPLICA_FRAMES } from "./Explica/Explica";
import { Intro } from "./Intro";
import { Prueba, PRUEBA_FPS, PRUEBA_FRAMES } from "./Prueba/Prueba";
import { Reto, RETO_FPS, RETO_FRAMES } from "./Reto/Reto";
import { DURACION_FRAMES, Viral } from "./Viral/Viral";
import { ALTO, ANCHO, FPS } from "./Viral/util";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Intro"
        component={Intro}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Viral"
        component={Viral}
        durationInFrames={DURACION_FRAMES}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Bot"
        component={Bot}
        durationInFrames={BOT_FRAMES}
        fps={BOT_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="BotMG"
        component={BotMG}
        durationInFrames={BOT_FRAMES}
        fps={BOT_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Explica"
        component={Explica}
        durationInFrames={EXPLICA_FRAMES}
        fps={EXPLICA_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Prueba"
        component={Prueba}
        durationInFrames={PRUEBA_FRAMES}
        fps={PRUEBA_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Errores"
        component={Errores}
        durationInFrames={ERRORES_FRAMES}
        fps={ERRORES_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Cifras"
        component={Cifras}
        durationInFrames={CIFRAS_FRAMES}
        fps={CIFRAS_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Estafa"
        component={Estafa}
        durationInFrames={ESTAFA_FRAMES}
        fps={ESTAFA_FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="Reto"
        component={Reto}
        durationInFrames={RETO_FRAMES}
        fps={RETO_FPS}
        width={ANCHO}
        height={ALTO}
      />
    </>
  );
};
