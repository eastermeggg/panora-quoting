import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { C } from "./theme";
import {
  AgentsScreen,
  AuthScreen,
  HomeScreen,
  HubScreen,
  InviteScreen,
  JoinScreen,
  OtpScreen,
  Outro,
  TitleCard,
  VeosScreen,
  WorkspaceScreen,
} from "./screens";

const TRANS = 16;

type Scene = { dur: number; node: React.ReactNode; kind?: "title" };

const SCENES: Scene[] = [
  // ---- ACT 1 · ADMIN ----
  {
    dur: 66,
    kind: "title",
    node: (
      <TitleCard
        index="Acte 1"
        kicker="Parcours administrateur"
        title="Le dirigeant configure le cabinet"
        sub="De la création de compte à l'écran d'accueil"
      />
    ),
  },
  { dur: 100, node: <AuthScreen dur={100} /> },
  { dur: 84, node: <OtpScreen dur={84} /> },
  { dur: 96, node: <WorkspaceScreen dur={96} /> },
  { dur: 100, node: <VeosScreen dur={100} /> },
  { dur: 120, node: <AgentsScreen dur={120} /> },
  { dur: 84, node: <InviteScreen dur={84} /> },
  { dur: 130, node: <HubScreen dur={130} /> },
  { dur: 120, node: <HomeScreen dur={120} /> },

  // ---- ACT 2 · COLLABORATEUR ----
  {
    dur: 66,
    kind: "title",
    node: (
      <TitleCard
        index="Acte 2"
        kicker="Parcours collaborateur"
        title="L'invité rejoint l'organisation"
        sub="Cabinet déjà configuré — il valide et démarre"
        tone="collab"
      />
    ),
  },
  { dur: 100, node: <JoinScreen dur={100} /> },
  { dur: 76, node: <OtpScreen dur={76} join /> },
  { dur: 90, node: <WorkspaceScreen dur={90} collab /> },
  { dur: 100, node: <AgentsScreen dur={100} collab /> },
  { dur: 80, node: <InviteScreen dur={80} collab /> },
  { dur: 120, node: <HubScreen dur={120} collab /> },
  { dur: 100, node: <HomeScreen dur={100} prenom="Camille" /> },

  // ---- OUTRO ----
  { dur: 80, node: <Outro /> },
];

export const ONBOARDING_DURATION =
  SCENES.reduce((s, x) => s + x.dur, 0) - (SCENES.length - 1) * TRANS;

export const OnboardingFlow: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <TransitionSeries>
        {SCENES.flatMap((scene, i) => {
          const seq = (
            <TransitionSeries.Sequence key={`s-${i}`} durationInFrames={scene.dur}>
              {scene.node}
            </TransitionSeries.Sequence>
          );
          if (i === SCENES.length - 1) return [seq];
          const next = SCENES[i + 1];
          const useSlide = next?.kind === "title" || scene.kind === "title";
          const trans = (
            <TransitionSeries.Transition
              key={`t-${i}`}
              timing={linearTiming({ durationInFrames: TRANS })}
              presentation={useSlide ? slide({ direction: "from-right" }) : fade()}
            />
          );
          return [seq, trans];
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
