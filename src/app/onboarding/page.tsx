"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { useConfiguredExtranets } from "@/data/settings-mock";

export default function QuotingOnboardingPage() {
  const router = useRouter();
  const extranets = useConfiguredExtranets();

  // Already-configured brokers shouldn't see the wizard. Soft-redirect to dashboard
  // on mount only — once the broker is inside the wizard, activating a session must
  // NOT bounce them out; they finish the flow on their own and click "Voir mon
  // tableau de bord" at the last step.
  useEffect(() => {
    if (extranets.length === 0) return;
    const hasActiveSession = extranets.some(
      (c) => c.sessionState.status === "active"
    );
    if (hasActiveSession) {
      router.replace("/quoting/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <OnboardingWizard />;
}
