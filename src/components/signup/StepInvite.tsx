"use client";

import { TextInput } from "./ui";

/* Step "Invitez vos collègues" : list of e-mail inputs, extendable. */
export function StepInvite({
  invites,
  onChange,
}: {
  invites: string[];
  onChange: (invites: string[]) => void;
}) {
  const setAt = (index: number, value: string) => {
    const next = [...invites];
    next[index] = value;
    onChange(next);
  };

  return (
    <div className="flex w-full max-w-[512px] flex-col gap-7">
      <div>
        <h1 className="font-serif text-[30px] leading-9 tracking-[-0.3px] text-panora-text">
          Invitez vos <span className="text-[#173c2d]">collègues</span>
        </h1>
        <p className="mt-2 text-[13px] leading-5 text-panora-text-secondary">
          Votre espace est sur le point d&apos;être finalisé. N&apos;oubliez pas
          d&apos;inviter vos collègues qui pourraient être intéressés par
          Panora.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[13px] font-medium leading-5 text-panora-text">
          Adresse e-mail professionnelle
        </p>
        {invites.map((value, i) => (
          <TextInput
            key={i}
            type="email"
            value={value}
            onChange={(e) => setAt(i, e.target.value)}
            placeholder="nom@domaine.com"
            autoFocus={i === 0}
          />
        ))}
        <button
          type="button"
          onClick={() => onChange([...invites, ""])}
          className="mt-1 flex items-center gap-1.5 self-start text-[13px] font-medium text-panora-green hover:text-panora-green-dark transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
            <path
              d="M8 3.5v9M3.5 8h9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Ajouter une autre invitation
        </button>
      </div>
    </div>
  );
}
