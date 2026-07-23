import "./index.css";
import { Composition } from "remotion";
import { OnboardingFlow, ONBOARDING_DURATION } from "./onboarding/OnboardingFlow";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="OnboardingFlow"
        component={OnboardingFlow}
        durationInFrames={ONBOARDING_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
