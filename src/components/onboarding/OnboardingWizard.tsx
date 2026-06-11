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

const FORWARD_SUB_TOTAL = 3;

export function OnboardingWizard() {
  const router = useRouter();
  const extranets = useConfiguredExtranets();
  const [stepIndex, setStepIndex] = useState(0);
  const [forwardSubStep, setForwardSubStep] = useState<0 | 1 | 2>(0);
  const [forwardMethod, setForwardMethod] = useState<"mailbox" | "forward">(
    "mailbox"
  );
  // Soft acknowledgements that gate the wizard footer Continue on the
  // PortalList sub-step (1) and the forward-rule sub-step (2 with forward method).
  const [portalListAcknowledged, setPortalListAcknowledged] = useState(false);
  const [forwardRuleAcknowledged, setForwardRuleAcknowledged] = useState(false);

  // On first mount, derive the resume step from the store. No extranets → start
  // on Portails; otherwise jump to Gestion 2FA (or Prêt if 2FA is already set up).
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
    // Inside Gestion 2FA, walk through sub-steps before crossing back into Portails.
    if (currentStep.id === "forward" && forwardSubStep > 0) {
      setForwardSubStep((s) => (s - 1) as 0 | 1 | 2);
      return;
    }
    if (stepIndex > 0) {
      const target = stepIndex - 1;
      // Returning to Gestion 2FA from Ready should land on its last sub-step.
      if (STEPS[target].id === "forward") setForwardSubStep(2);
      setStepIndex(target);
    }
  }

  function goNext() {
    // Inside Gestion 2FA, walk through sub-steps before crossing into Ready.
    if (currentStep.id === "forward" && forwardSubStep < 2) {
      setForwardSubStep((s) => (s + 1) as 0 | 1 | 2);
      return;
    }
    // Leaving Gestion 2FA with the manual-forward method auto-marks email
    // portals as configured — there's no explicit "I did it" button anymore.
    if (
      currentStep.id === "forward" &&
      forwardSubStep === 2 &&
      forwardMethod === "forward"
    ) {
      extranets
        .filter((c) => c.otpDelivery?.channel === "email")
        .forEach((c) =>
          updateConfiguredExtranet(c.id, { emailForwardConfigured: true })
        );
    }
    if (stepIndex < STEPS.length - 1) {
      const target = stepIndex + 1;
      // Entering Gestion 2FA from Portails should start on its first sub-step.
      if (STEPS[target].id === "forward") setForwardSubStep(0);
      setStepIndex(target);
    }
  }

  function quit() {
    router.push("/quoting");
  }

  function finish() {
    router.push("/quoting/dashboard");
  }

  type Acknowledgement = {
    checked: boolean;
    onChange: (next: boolean) => void;
    label: React.ReactNode;
  };

  const stepConfig = (() => {
    switch (currentStep.id) {
      case "welcome":
        return { canContinue: true };
      case "connect":
        return {
          canContinue: hasConnectedExtranet,
        };
      case "forward": {
        // Sub 0 (Comprendre): always continuable.
        // Sub 1 (Vos compagnies + PortalList): require the "I activated email
        //   2FA where possible" acknowledgement (in the footer).
        // Sub 2 (Set up automation):
        //   – mailbox: hideContinue (OAuth auto-advances)
        //   – forward: require the "I set up the forward rule" acknowledgement
        let canContinue = true;
        let acknowledgement: Acknowledgement | undefined;
        if (forwardSubStep === 1) {
          canContinue = portalListAcknowledged;
          acknowledgement = {
            checked: portalListAcknowledged,
            onChange: setPortalListAcknowledged,
            label: "J'ai activé l'e-mail 2FA là où c'était possible",
          };
        } else if (forwardSubStep === 2 && forwardMethod === "forward") {
          canContinue = forwardRuleAcknowledged;
          acknowledgement = {
            checked: forwardRuleAcknowledged,
            onChange: setForwardRuleAcknowledged,
            label: "J'ai mis en place la règle de transfert",
          };
        }
        return {
          canContinue,
          continueLabel:
            forwardSubStep < 2 ? "Continuer" : "Étape suivante",
          hideContinue:
            forwardSubStep === 2 &&
            hasEmailPortal &&
            forwardMethod === "mailbox",
          acknowledgement,
        };
      }
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
        if (idx <= stepIndex) {
          // Re-entering Gestion 2FA from the stepper resets to its first sub-step.
          if (STEPS[idx].id === "forward") setForwardSubStep(0);
          setStepIndex(idx);
        }
      }}
      onQuit={quit}
      subProgress={
        currentStep.id === "forward"
          ? { current: forwardSubStep + 1, total: FORWARD_SUB_TOTAL }
          : undefined
      }
      acknowledgement={
        "acknowledgement" in stepConfig
          ? stepConfig.acknowledgement
          : undefined
      }
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
          subStep={forwardSubStep}
        />
      )}
      {currentStep.id === "ready" && (
        <StepReady configuredExtranets={extranets} />
      )}
    </WizardChrome>
  );
}
