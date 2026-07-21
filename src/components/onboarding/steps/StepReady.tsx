"use client";

import type { ExtranetConfig } from "@/data/settings-mock";
import { OnboardingHero } from "@/components/onboarding/OnboardingHero";
import { QuotingReadyContent } from "@/components/quoting/QuotingReadyContent";

interface StepReadyProps {
  configuredExtranets: ExtranetConfig[];
}

export function StepReady({ configuredExtranets }: StepReadyProps) {
  return (
    <div className="mx-auto w-full max-w-[1040px] flex flex-col gap-10 py-6 lg:py-10">
      <OnboardingHero
        eyebrow="Étape 4"
        title={<>Votre assistant cotation est prêt à coter.</>}
      />
      <QuotingReadyContent configuredExtranets={configuredExtranets} />
    </div>
  );
}
