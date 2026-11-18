import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const escala = spring({ frame, fps, config: { damping: 200 } });
  const opacidad = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0b1220",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          color: "#4fd1ff",
          fontFamily: "sans-serif",
          fontSize: 160,
          letterSpacing: 20,
          opacity: opacidad,
          transform: `scale(${escala})`,
        }}
      >
        J.A.R.V.I.S.
      </h1>
    </AbsoluteFill>
  );
};
