"use client";

import { PrimaryButton } from "./ui";

export type OrgInvite = {
  org: string;
  /** Letter shown in the org logo tile. */
  orgInitial: string;
  inviter: string;
  /** The address the invitation was sent to — the collaborator joins with it. */
  email: string;
  memberCount: number;
};

/* Collaborator join flow, screen 1: welcome to the org they were invited to.
 * Reached from an invitation e-mail link — identity comes from the invite, so
 * there is no account-creation / OTP step here. Their own CTA ("Rejoindre"),
 * no wizard footer, centered like the auth screens. */
export function StepJoinWelcome({
  invite,
  onJoin,
}: {
  invite: OrgInvite;
  onJoin: () => void;
}) {
  return (
    <div className="flex w-full max-w-[400px] flex-col items-center text-center">
      <span
        className="flex h-[72px] w-[72px] items-center justify-center rounded-[18px] text-[30px] font-semibold text-white shadow-[0px_8px_20px_0px_rgba(109,94,240,0.25)]"
        style={{
          background: "linear-gradient(140deg, #7b68ee 0%, #6d5ef0 100%)",
        }}
      >
        {invite.orgInitial}
      </span>

      <p className="mt-6 text-[13px] font-medium text-panora-text-secondary">
        {invite.inviter} vous a invité·e à rejoindre
      </p>
      <h1 className="mt-1 font-serif text-[32px] leading-10 tracking-[-0.3px] text-panora-text">
        {invite.org} <span className="text-panora-green-dark">sur Panora</span>
      </h1>
      <p className="mt-3 max-w-[340px] text-[13px] leading-5 text-panora-text-secondary">
        Vos collègues ont déjà configuré l&apos;espace — aucun compte à créer,
        rejoignez-les et commencez à coter.
      </p>

      {/* Identity: the address the invite was sent to. No account creation. */}
      <div className="mt-7 w-full text-left">
        <p className="mb-1.5 text-[12px] font-medium text-panora-text-secondary">
          Vous rejoindrez avec cette adresse
        </p>
        <div className="flex items-center gap-2.5 rounded-lg border border-panora-border bg-white px-3 py-2.5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 shrink-0 text-panora-text-secondary">
            <rect x="2" y="3.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M2.5 4.5l5.5 4 5.5-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span className="flex-1 truncate text-[13px] font-medium text-panora-text">
            {invite.email}
          </span>
          <span className="rounded-full bg-panora-green-light px-2 py-0.5 text-[11px] font-medium text-panora-green-dark">
            Invité·e
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="flex -space-x-2">
          {["#7b68ee", "#00a272", "#cb8052"].map((c, i) => (
            <span
              key={i}
              className="h-5 w-5 rounded-full border-2 border-panora-bg"
              style={{ background: c }}
            />
          ))}
        </span>
        <span className="text-[12px] text-panora-text-secondary">
          {invite.memberCount} membres dans cet espace
        </span>
      </div>

      <PrimaryButton onClick={onJoin} className="mt-7 w-full py-2.5">
        Rejoindre l&apos;espace
      </PrimaryButton>
      <p className="mt-3 text-[12px] leading-4 text-panora-text-muted">
        Ce n&apos;est pas vous ?{" "}
        <a href="#" className="font-medium text-panora-text-secondary underline-offset-2 hover:underline">
          Utiliser une autre adresse
        </a>
      </p>
    </div>
  );
}
