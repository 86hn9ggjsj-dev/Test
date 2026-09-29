import { Composition } from "remotion";
import { Bot, BOT_FPS, BOT_FRAMES } from "./Bot/Bot";
import { Intro } from "./Intro";
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
