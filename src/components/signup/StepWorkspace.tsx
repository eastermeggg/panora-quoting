"use client";

import { Field, TextInput, SelectInput, GhostButton } from "./ui";

export type WorkspaceData = {
  cabinet: string;
  firstName: string;
  lastName: string;
  structure: string;
  role: string;
};

/* Profile step. Two variants:
 * - admin (workspace creator): company logo + cabinet name + profile fields
 * - collaborateur (invited): validate their identity (avatar, prénom, nom,
 *   rôle) before joining an existing org. */
export function StepWorkspace({
  isInvited,
  orgName,
  data,
  onChange,
}: {
  isInvited: boolean;
  orgName?: string;
  data: WorkspaceData;
  onChange: (patch: Partial<WorkspaceData>) => void;
}) {
  const personInitials =
    `${data.firstName.trim().charAt(0)}${data.lastName.trim().charAt(0)}`
      .toUpperCase() || "?";
  const companyInitial = data.cabinet.trim().charAt(0).toUpperCase() || "P";

  return (
    <div className="flex w-full max-w-[512px] flex-col gap-8">
      <div>
        <h1 className="font-serif text-[30px] leading-9 tracking-[-0.3px] text-panora-text">
          {isInvited ? (
            <>
              <span className="text-[#173c2d]">Parlez-nous</span> de vous
            </>
          ) : (
            <>
              <span className="text-[#173c2d]">Personnalisez</span> votre
              workspace
            </>
          )}
        </h1>
        <p className="mt-1 text-[13px] leading-5 text-panora-text-secondary">
          {isInvited
            ? `Votre profil au sein de ${orgName ?? "votre équipe"}, visible par vos collègues`
            : "Dites-nous en plus sur qui vous êtes et votre cabinet"}
        </p>
      </div>

      {/* Media block: personal avatar (invited) or company logo (admin) */}
      <div className="flex items-start gap-8">
        <span
          className={
            isInvited
              ? "flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-full bg-panora-green text-[24px] font-semibold text-white"
              : "flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-[14px] bg-[#173c2d] text-[26px] font-semibold text-white"
          }
        >
          {isInvited ? personInitials : companyInitial}
        </span>
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-medium leading-5 text-panora-text">
            {isInvited ? "Votre photo de profil" : "Logo de votre entreprise"}
          </p>
          <div className="flex gap-2.5">
            <GhostButton>
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                <path
                  d="M8 3.5v9M3.5 8h9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              {isInvited ? "Importer une photo" : "Importer une image"}
            </GhostButton>
            <GhostButton>Retirer</GhostButton>
          </div>
          <p className="text-[13px] leading-5 text-panora-text-secondary">
            Fichiers .png ou .jpeg jusqu&apos;à 10 Mo
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {!isInvited && (
          <Field label="Nom du cabinet">
            <TextInput
              value={data.cabinet}
              onChange={(e) => onChange({ cabinet: e.target.value })}
              placeholder="CEGEAS"
              autoFocus
            />
          </Field>
        )}
        <div className="flex gap-4">
          <Field label="Prénom" className="flex-1">
            <TextInput
              value={data.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              placeholder="Benjamin"
              autoFocus={isInvited}
            />
          </Field>
          <Field label="Nom" className="flex-1">
            <TextInput
              value={data.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              placeholder="Perrier"
            />
          </Field>
        </div>
        <div className="flex gap-4">
          {!isInvited && (
            <Field label="Structure" className="flex-1">
              <SelectInput
                value={data.structure}
                onChange={(e) => onChange({ structure: e.target.value })}
              >
                <option value="">Sélectionner...</option>
                <option>Cabinet de courtage</option>
                <option>Courtier indépendant</option>
                <option>Grossiste</option>
                <option>Autre</option>
              </SelectInput>
            </Field>
          )}
          <Field label="Rôle" className="flex-1">
            <SelectInput
              value={data.role}
              onChange={(e) => onChange({ role: e.target.value })}
            >
              <option value="">Sélectionner...</option>
              <option>Fondateur / Dirigeant</option>
              <option>Courtier</option>
              <option>Chargé de clientèle</option>
              <option>Responsable production</option>
              <option>Autre</option>
            </SelectInput>
          </Field>
        </div>
      </div>
    </div>
  );
}
