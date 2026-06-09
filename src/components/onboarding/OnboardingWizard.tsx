"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WizardChrome, type WizardStepMeta } from "./WizardChrome";
import { StepWelcome } from "./steps/StepWelcome";
import { StepConnect } from "./steps/StepConnect";
import { StepForward } from "./steps/StepForward";
import { StepReady } from "./steps/StepReady";
import {
  useConfiguredExtranets,
  updateConfiguredExtranet,
} from "@/data/settings-mock";

type StepId = "welcome" | "connect" | "forward" | "ready";

const STEPS: (WizardStepMeta & { id: StepId })[] = [
  { id: "welcome", label: "Bienvenue" },
  { id: "connect", label: "Portails" },
  { id: "forward", label: "Gestion 2FA" },
  { id: "ready", label: "Prêt" },
];

export function OnboardingWizard() {
  const router = useRouter();
  const extranets = useConfiguredExtranets();
  const [stepIndex, setStepIndex] = useState(0);
  const [forwardMethod, setForwardMethod] = useState<"mailbox" | "forward">(
    "mailbox"
  );

  // On first mount, derive the resume step from the store. Credentials are
  // configured in Step 2 (no session activation there anymore), so the next
  // step is Gestion 2FA as soon as at least one extranet exists.
  useEffect(() => {
    if (extranets.length === 0) return;
    const hasAnyEmailExtranet = extranets.some(
      (c) => c.otpDelivery?.channel === "email"
    );
    const allForwardsConfigured =
      !hasAnyEmailExtranet ||
      extranets
        .filter((c) => c.otpDelivery?.channel === "email")
        .every((c) => c.emailForwardConfigured === true);

    if (allForwardsConfigured) {
      setStepIndex(3);
    } else {
      setStepIndex(2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentStep = STEPS[stepIndex];

  const hasConnectedExtranet = extranets.length > 0;
  const hasEmailPortal = extranets.some(
    (c) => c.otpDelivery?.channel === "email"
  );

  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function goNext() {
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  }

  function quit() {
    router.push("/quoting");
  }

  function finish() {
    router.push("/quoting/dashboard");
  }

  const stepConfig = (() => {
    switch (currentStep.id) {
      case "welcome":
        return { canContinue: true };
      case "connect":
        return {
          canContinue: hasConnectedExtranet,
        };
      case "forward":
        return {
          canContinue: true,
          continueLabel: "Étape suivante",
          // Mailbox completes via OAuth (auto-advance); forward completes via
          // footer Continuer. Step is mandatory — no skip. If no portal even
          // proposes email, fall through and show Continuer (nothing to set up).
          hideContinue: hasEmailPortal && forwardMethod === "mailbox",
        };
      case "ready":
        return { canContinue: true, continueLabel: "Voir mon tableau de bord" };
    }
  })();

  return (
    <WizardChrome
      steps={STEPS}
      currentStepIndex={stepIndex}
      canContinue={stepConfig.canContinue}
      hideContinue={
        "hideContinue" in stepConfig ? stepConfig.hideContinue : undefined
      }
      continueLabel={stepConfig.continueLabel}
      onBack={goBack}
      onContinue={() => {
        if (currentStep.id === "ready") finish();
        else goNext();
      }}
      onStepClick={(idx) => {
        // Only allow navigating to done/current steps; future steps stay gated.
        if (idx <= stepIndex) setStepIndex(idx);
      }}
      onQuit={quit}
    >
      {currentStep.id === "welcome" && <StepWelcome />}
      {currentStep.id === "connect" && (
        <StepConnect
          configuredExtranets={extranets}
          onConfigured={() => {
            /* card UI handles activation inline via ExtranetCard */
          }}
        />
      )}
      {currentStep.id === "forward" && (
        <StepForward
          configuredExtranets={extranets}
          method={forwardMethod}
          onMethodChange={setForwardMethod}
          onComplete={goNext}
          onToggleForward={(id, configured) =>
            updateConfiguredExtranet(id, {
              emailForwardConfigured: configured,
            })
          }
        />
      )}
      {currentStep.id === "ready" && (
        <StepReady configuredExtranets={extranets} />
      )}
    </WizardChrome>
  );
}
