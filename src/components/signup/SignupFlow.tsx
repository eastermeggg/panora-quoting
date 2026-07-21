"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { RightPanel, type RightPanelVariant } from "./RightPanel";
import {
  FlowerMark,
  GhostButton,
  SecondaryButton,
  PrimaryButton,
} from "./ui";
import { StepAuth, StepOtp, type AuthMode } from "./StepAuth";
import { StepWorkspace, type WorkspaceData } from "./StepWorkspace";
import { StepJoinWelcome, type OrgInvite } from "./StepJoinWelcome";
import { StepVeos, type VeosCredentials } from "./StepVeos";
import { StepAgents } from "./StepAgents";
import { StepInvite } from "./StepInvite";

type Step = "auth" | "otp" | "join" | "workspace" | "veos" | "agents" | "invite";

/* Global onboarding. Two entry paths:
 * - Owner (default): sign-up → OTP → workspace setup → VEOS (skippable) →
 *   agents → invite → /bienvenue.
 * - Collaborator (?invite=1, reached from an invitation e-mail): join org →
 *   validate profile → agents → invite → /bienvenue. No account creation /
 *   OTP (identity comes from the invite) and no cabinet/VEOS setup (the org is
 *   already configured). All state lives in memory. */
export function SignupFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Which flow to run. Two canonical entry points:
  //   /signup?step=admin  → admin flow (auth → otp → workspace → veos → agents → invite)
  //   /signup?step=join   → collaborator flow (join → otp → profile → agents → invite)
  // ?invite=1 is also honored as a collaborator entry. Default is the admin flow.
  const stepParam = searchParams.get("step");
  const isInvited =
    stepParam === "join" || searchParams.get("invite") !== null;

  // Org context for the collaborator flow (overridable via query params).
  const orgName = searchParams.get("org") ?? "CEGEAS";
  const invite: OrgInvite = {
    org: orgName,
    orgInitial: orgName.charAt(0).toUpperCase(),
    inviter: searchParams.get("inviter") ?? "Benjamin Perrier",
    email:
      searchParams.get("email") ??
      `camille.rousseau@${orgName.toLowerCase().replace(/[^a-z0-9]/g, "")}.fr`,
    memberCount: 8,
  };

  // Deep-link to a specific step for review (state-forcing pattern, same as
  // the veos-figma-capture harness). The flow-selector values "join"/"admin"
  // are not literal steps — they fall back to each flow's first screen.
  const collabSteps: Step[] = ["join", "otp", "workspace", "agents", "invite"];
  const adminSteps: Step[] = ["auth", "otp", "workspace", "veos", "agents", "invite"];
  const initialStep: Step = isInvited
    ? collabSteps.includes(stepParam as Step)
      ? (stepParam as Step)
      : "join"
    : adminSteps.includes(stepParam as Step)
      ? (stepParam as Step)
      : "auth";

  const [step, setStep] = useState<Step>(initialStep);
  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [workspace, setWorkspace] = useState<WorkspaceData>(
    // Collaborators arrive with their invite details pre-filled — they only
    // validate. Owners start from a blank profile.
    isInvited
      ? {
          cabinet: invite.org,
          firstName: "Camille",
          lastName: "Rousseau",
          structure: "",
          role: "Chargé de clientèle",
        }
      : {
          cabinet: "",
          firstName: "",
          lastName: "",
          structure: "",
          role: "",
        }
  );
  const [veos, setVeos] = useState<VeosCredentials>({
    url: "",
    login: "",
    password: "",
  });
  const [veosConnected, setVeosConnected] = useState(
    searchParams.get("veos") === "1"
  );
  const [invites, setInvites] = useState<string[]>(["", "", ""]);

  const sequence: Step[] = isInvited ? collabSteps : adminSteps;

  const goNext = () => {
    const i = sequence.indexOf(step);
    if (i < sequence.length - 1) setStep(sequence[i + 1]);
    else finish();
  };
  const goBack = () => {
    const i = sequence.indexOf(step);
    if (i > 0) setStep(sequence[i - 1]);
  };

  const finish = () => {
    const params = new URLSearchParams();
    const prenom = workspace.firstName.trim();
    if (prenom) params.set("prenom", prenom);
    // Collaborators get a role-scoped hub (no ERP task).
    if (isInvited) params.set("collab", "1");
    const qs = params.toString();
    router.push(qs ? `/bienvenue?${qs}` : "/bienvenue");
  };

  const handleOtpSubmit = () => {
    if (mode === "login") {
      // Existing account: straight into the app
      router.push("/quoting");
    } else {
      setStep("workspace");
    }
  };

  // Centered, footer-less screens with their own CTA (auth, otp, join welcome).
  const isCenteredStep = step === "auth" || step === "otp" || step === "join";
  const isLastStep = sequence.indexOf(step) === sequence.length - 1;

  const rightVariant: RightPanelVariant =
    step === "join" || step === "workspace"
      ? "workspace"
      : step === "veos"
        ? "veos"
        : step === "agents" || step === "invite"
          ? "agents"
          : "flower";

  const showSyncPill =
    veosConnected && (step === "agents" || step === "invite");

  return (
    <div
      className={cn(
        "relative flex h-screen w-full gap-2.5 overflow-hidden p-3",
        isCenteredStep ? "bg-panora-bg" : "bg-white"
      )}
    >
      {/* Wordmark, floating top-left like the Figma screens */}
      <div className="pointer-events-none absolute left-9 top-8 z-10">
        <img src="/logos/panora-wordmark.svg" alt="Panora" className="h-5" />
      </div>

      {/* VEOS sync pill, top center on the later steps */}
      {showSyncPill && (
        <div className="absolute left-1/2 top-7 z-10 -translate-x-1/2 overflow-hidden rounded-lg border border-panora-border bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 px-3.5 py-2">
            <FlowerMark className="h-4 w-4 animate-spin [animation-duration:3s]" color="#5c5953" />
            <span className="text-[13px] font-medium text-panora-text">
              Sync. VEOS en cours
            </span>
          </div>
          <div className="h-[3px] w-full bg-panora-border">
            <div className="h-full w-2/3 rounded-r-full bg-[#953ea3]" />
          </div>
        </div>
      )}

      {/* Left column: step content (+ wizard footer after auth) */}
      <div className="flex h-full min-w-0 flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center overflow-y-auto px-10 py-16">
          {step === "auth" && (
            <StepAuth
              mode={mode}
              email={email}
              onEmailChange={setEmail}
              onSubmit={() => setStep("otp")}
            />
          )}
          {step === "otp" && (
            <StepOtp
              context={isInvited ? "join" : mode}
              email={
                isInvited
                  ? invite.email
                  : email.trim() || "vous@moncabinet.fr"
              }
              orgName={invite.org}
              onBack={() => setStep(isInvited ? "join" : "auth")}
              onSubmit={isInvited ? goNext : handleOtpSubmit}
            />
          )}
          {step === "join" && (
            <StepJoinWelcome invite={invite} onJoin={goNext} />
          )}
          {step === "workspace" && (
            <StepWorkspace
              isInvited={isInvited}
              orgName={invite.org}
              data={workspace}
              onChange={(patch) => setWorkspace((w) => ({ ...w, ...patch }))}
            />
          )}
          {step === "veos" && (
            <StepVeos
              credentials={veos}
              onChange={(patch) => setVeos((v) => ({ ...v, ...patch }))}
              connected={veosConnected}
              onConnect={() => setVeosConnected(true)}
            />
          )}
          {step === "agents" && <StepAgents />}
          {step === "invite" && <StepInvite invites={invites} onChange={setInvites} />}
        </div>

        {!isCenteredStep && (
          <div className="flex items-center justify-between border-t border-panora-border p-5">
            <SecondaryButton onClick={goBack}>Précédent</SecondaryButton>
            <div className="flex items-center gap-2.5">
              {step === "veos" && !veosConnected && (
                <GhostButton onClick={goNext}>Passer pour l&apos;instant</GhostButton>
              )}
              {(step !== "veos" || veosConnected) && (
                <PrimaryButton onClick={goNext}>
                  {isLastStep ? "Accéder à mon espace" : "Étape suivante"}
                </PrimaryButton>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right column: visual panel */}
      <div className="hidden h-full w-[38%] shrink-0 lg:block">
        <RightPanel
          variant={rightVariant}
          org={
            isInvited ? { name: invite.org, initial: invite.orgInitial } : undefined
          }
          topRight={
            step === "auth" ? (
              <GhostButton
                onClick={() =>
                  setMode((m) => (m === "signup" ? "login" : "signup"))
                }
              >
                {mode === "signup" ? "Se connecter" : "Créer un compte"}
              </GhostButton>
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
