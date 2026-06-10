"use client";

import { useState } from "react";
import { X, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WizardStepMeta {
  id: string;
  label: string;
}

interface WizardChromeProps {
  steps: WizardStepMeta[];
  currentStepIndex: number;
  /** Hide footer entirely (e.g. step renders its own primary action). */
  hideFooter?: boolean;
  /** Disable Continuer (e.g. step requirements unmet). */
  canContinue?: boolean;
  /** Hide the Continuer button entirely (e.g. step completes via an in-panel action). */
  hideContinue?: boolean;
  /** Label on the forward button. Defaults to "Continuer" / "Terminer" on last step. */
  continueLabel?: string;
  /** When provided, replaces "Continuer" with a "Passer cette étape" ghost. */
  onSkip?: () => void;
  skipLabel?: string;
  onBack?: () => void;
  onContinue?: () => void;
  onQuit?: () => void;
  /** Navigate directly to a step from the progress bar. Only completed / current steps are clickable. */
  onStepClick?: (index: number) => void;
  children: React.ReactNode;
}

export function WizardChrome({
  steps,
  currentStepIndex,
  hideFooter,
  canContinue = true,
  hideContinue,
  continueLabel,
  onSkip,
  skipLabel,
  onBack,
  onContinue,
  onQuit,
  onStepClick,
  children,
}: WizardChromeProps) {
  const [quitOpen, setQuitOpen] = useState(false);
  const isLast = currentStepIndex === steps.length - 1;
  const isFirst = currentStepIndex === 0;
  const resolvedContinueLabel =
    continueLabel ?? (isLast ? "Terminer" : "Continuer");

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Top bar: quit on the left, centered stepper, balancing slot on the right */}
      <header className="shrink-0 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 lg:px-10 pt-6 pb-4 border-b border-panora-border bg-white">
        <button
          onClick={() => (onQuit ? setQuitOpen(true) : null)}
          aria-label="Quitter la configuration"
          className="justify-self-start inline-flex items-center justify-center w-8 h-8 rounded-md text-panora-text-muted hover:text-panora-text hover:bg-panora-drop transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="justify-self-center w-full max-w-[600px]">
          <ProgressBar
            steps={steps}
            currentIndex={currentStepIndex}
            onStepClick={onStepClick}
          />
        </div>
        <div aria-hidden />
      </header>

      {/* Step content. Width is controlled per-step; chrome only provides horizontal padding. */}
      <main className="flex-1 min-h-0 overflow-y-auto px-6 lg:px-10 pb-6">
        {children}
      </main>

      {/* Footer */}
      {!hideFooter && (
        <footer className="shrink-0 border-t border-panora-border bg-white">
          <div className="w-full px-6 lg:px-10 py-4 flex items-center justify-between gap-4">
            <button
              onClick={onBack}
              disabled={isFirst}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 h-9 text-[13px] font-medium text-panora-text-secondary rounded-lg hover:bg-panora-drop transition-colors",
                isFirst && "opacity-40 cursor-not-allowed"
              )}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Précédent
            </button>

            <div className="flex items-center gap-3">
              {onSkip && (
                <button
                  onClick={onSkip}
                  className="px-3 h-9 text-[13px] font-medium text-panora-text-secondary rounded-lg hover:bg-panora-drop transition-colors"
                >
                  {skipLabel ?? "Passer cette étape"}
                </button>
              )}
              {!hideContinue && (
                <button
                  onClick={onContinue}
                  disabled={!canContinue}
                  className={cn(
                    "btn-primary inline-flex items-center gap-2 px-4 h-9 text-[13px] font-semibold leading-5",
                    !canContinue && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {resolvedContinueLabel}
                  {isLast ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </footer>
      )}

      {quitOpen && onQuit && (
        <QuitConfirmModal
          onCancel={() => setQuitOpen(false)}
          onConfirm={() => {
            setQuitOpen(false);
            onQuit();
          }}
        />
      )}
    </div>
  );
}

function ProgressBar({
  steps,
  currentIndex,
  onStepClick,
}: {
  steps: WizardStepMeta[];
  currentIndex: number;
  onStepClick?: (index: number) => void;
}) {
  return (
    <ol className="flex-1 flex items-center gap-2 min-w-0" aria-label="Étapes">
      {steps.map((step, idx) => {
        const state =
          idx < currentIndex
            ? "done"
            : idx === currentIndex
              ? "current"
              : "todo";
        // Done and current steps are navigable; future steps stay locked until
        // the user clears the gate on the current step.
        const navigable = state !== "todo" && !!onStepClick;
        return (
          <li
            key={step.id}
            className="flex items-center gap-2 flex-1 min-w-0"
            aria-current={state === "current" ? "step" : undefined}
          >
            <button
              type="button"
              onClick={navigable ? () => onStepClick?.(idx) : undefined}
              disabled={!navigable}
              aria-label={`Étape ${idx + 1} : ${step.label}`}
              className={cn(
                "group inline-flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-panora-green focus-visible:outline-offset-2 transition-opacity",
                !navigable && "cursor-default",
                navigable && "hover:opacity-80"
              )}
            >
              <span
                className={cn(
                  "shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold transition-colors",
                  state === "done" && "bg-panora-green text-white",
                  state === "current" && "bg-panora-text text-white",
                  state === "todo" &&
                    "bg-panora-secondary text-panora-text-muted"
                )}
              >
                {state === "done" ? (
                  <Check className="w-3 h-3" strokeWidth={3} />
                ) : (
                  idx + 1
                )}
              </span>
              <span
                className={cn(
                  "text-[13px] font-medium leading-5 whitespace-nowrap hidden md:inline",
                  state === "current"
                    ? "text-panora-text"
                    : state === "done"
                      ? "text-panora-text-secondary group-hover:text-panora-text"
                      : "text-panora-text-muted"
                )}
              >
                {step.label}
              </span>
            </button>
            {idx < steps.length - 1 && (
              <span className="h-px flex-1 min-w-[24px] bg-panora-text-muted/30" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function QuitConfirmModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[1px]"
      onMouseDown={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12)] w-full max-w-[420px] mx-4 p-6 flex flex-col gap-4"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[18px] font-serif text-panora-text leading-6">
            Quitter la configuration ?
          </h2>
          <p className="text-[13px] text-panora-text-secondary leading-5">
            Les assureurs déjà connectés restent enregistrés. Vous pourrez
            reprendre la configuration depuis l&apos;assistant cotation.
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 h-9 text-[13px] font-medium text-panora-text-secondary rounded-lg border border-panora-border hover:bg-panora-drop transition-colors"
          >
            Continuer la configuration
          </button>
          <button
            onClick={onConfirm}
            className="px-4 h-9 text-[13px] font-semibold text-white bg-panora-error rounded-lg hover:opacity-90 transition-opacity"
          >
            Quitter
          </button>
        </div>
      </div>
    </div>
  );
}
