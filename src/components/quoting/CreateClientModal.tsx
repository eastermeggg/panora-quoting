"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  Check,
  ExternalLink,
  HelpCircle,
  Loader2,
  Search,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  APE_CODES,
  COUNTRIES,
  LEGAL_FORMS,
  createClient,
  lookupInsee,
  type ClientAddress,
  type ClientPrimaryContact,
  type VeosClient,
  type VeosClientType,
} from "@/data/clients-mock";

interface CreateClientModalProps {
  /** Whether the broker's ERP (VEOS) is connected — drives destination labels. */
  veosConnected: boolean;
  /** Initial value for the name field — usually the search query that yielded no results. */
  initialName?: string;
  /** Demo/capture affordance — open on PM or PP instead of the PM default. */
  initialType?: VeosClientType;
  onCancel: () => void;
  onCreated: (client: VeosClient) => void;
}

type InseeUiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "found" }
  | { status: "notfound" }
  | { status: "duplicate"; client: VeosClient }
  | { status: "error" };

type SubmitError = { kind: "erp"; message: string } | null;

export function CreateClientModal({
  veosConnected,
  initialName = "",
  initialType,
  onCancel,
  onCreated,
}: CreateClientModalProps) {
  const destination = veosConnected ? "VEOS" : "Panora";

  // ── Type ──
  const [type, setType] = useState<VeosClientType>(initialType ?? "PM");

  // ── PM identification ──
  const [sirenInput, setSirenInput] = useState("");
  const [insee, setInsee] = useState<InseeUiState>({ status: "idle" });
  const [companyName, setCompanyName] = useState(initialName);
  const [legalForm, setLegalForm] = useState("");
  const [ape, setApe] = useState("");

  // ── PP identification ──
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");

  // ── PM contact principal — PP uses email/phone inline ──
  const [contactFirstName, setContactFirstName] = useState("");
  const [contactLastName, setContactLastName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // ── Address ──
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState<string>("France");

  // ── Submit state ──
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<SubmitError>(null);

  // Focus the first field whenever the type changes.
  const firstInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    firstInputRef.current?.focus();
  }, [type]);

  // ── Validation ──
  const isPM = type === "PM";
  const identityValid = isPM
    ? companyName.trim().length > 0
    : firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      dob.length > 0;
  const contactValid = isPM
    ? contactFirstName.trim().length > 0 &&
      contactLastName.trim().length > 0 &&
      contactEmail.trim().length > 0
    : contactEmail.trim().length > 0;
  const addressValid =
    street.trim().length > 0 &&
    postalCode.trim().length > 0 &&
    city.trim().length > 0 &&
    country.trim().length > 0;

  const canSubmit =
    identityValid && contactValid && addressValid && !submitting;

  // ── Handlers ──

  async function handleInseeLookup() {
    const raw = sirenInput.trim();
    if (!raw) return;
    setInsee({ status: "loading" });
    try {
      const res = await lookupInsee(raw);
      if (res.status === "duplicate") {
        setInsee({ status: "duplicate", client: res.client });
        return;
      }
      if (res.status === "notfound") {
        setInsee({ status: "notfound" });
        return;
      }
      // status === "found"
      const { data } = res;
      setCompanyName(data.name);
      if (data.legalForm) setLegalForm(data.legalForm);
      if (data.ape) setApe(data.ape);
      if (data.address) {
        if (!street.trim()) setStreet(data.address.street);
        if (!postalCode.trim()) setPostalCode(data.address.postalCode);
        if (!city.trim()) setCity(data.address.city);
        if (!country.trim()) setCountry(data.address.country);
      }
      setInsee({ status: "found" });
    } catch {
      setInsee({ status: "error" });
    }
  }

  function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    // Simulate ERP round-trip.
    window.setTimeout(() => {
      try {
        const finalName = isPM
          ? companyName.trim()
          : `${firstName.trim()} ${lastName.trim()}`.trim();
        const contact: ClientPrimaryContact | undefined = isPM
          ? {
              firstName: contactFirstName.trim(),
              lastName: contactLastName.trim(),
              role: contactRole.trim() || undefined,
              email: contactEmail.trim(),
              phone: contactPhone.trim() || undefined,
            }
          : contactEmail.trim()
          ? {
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              email: contactEmail.trim(),
              phone: contactPhone.trim() || undefined,
            }
          : undefined;
        const address: ClientAddress = {
          street: street.trim(),
          postalCode: postalCode.trim(),
          city: city.trim(),
          country: country.trim(),
        };
        const created = createClient({
          type,
          identity: {
            name: finalName,
            firstName: isPM ? undefined : firstName.trim(),
            lastName: isPM ? undefined : lastName.trim(),
            dateOfBirth: isPM ? undefined : dob,
            siren: isPM ? sirenInput.trim() || undefined : undefined,
            legalForm: isPM ? legalForm || undefined : undefined,
            ape: isPM ? ape || undefined : undefined,
          },
          primaryContact: contact,
          address,
        });
        setSubmitting(false);
        onCreated(created);
      } catch {
        setSubmitting(false);
        setSubmitError({
          kind: "erp",
          message:
            "La création n'a pas pu aboutir. Réessayez ou contactez votre administrateur ERP.",
        });
      }
    }, 700);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
      onMouseDown={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12)] w-full max-w-[600px] mx-4 flex flex-col max-h-[92vh] overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Créer un client dans ${destination}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-[44px] px-4 bg-panora-secondary/40 border-b border-panora-border">
          <span className="text-[13px] font-medium text-panora-text leading-5 truncate">
            Créer un client dans {destination}
          </span>
          <button
            onClick={onCancel}
            className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-panora-border/50 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-panora-text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 pt-5 pb-3 flex flex-col gap-5">
          <TypeToggle value={type} onChange={setType} />

          {isPM ? (
            <>
              <Section title="Identification">
                <SirenLookupRow
                  value={sirenInput}
                  onChange={setSirenInput}
                  state={insee}
                  onLookup={handleInseeLookup}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nom de l'entreprise" required className="col-span-2">
                    <input
                      ref={firstInputRef}
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Marble Tech SAS"
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Forme juridique" hint="Autofill INSEE — modifiable.">
                    <select
                      value={legalForm}
                      onChange={(e) => setLegalForm(e.target.value)}
                      className={cn(fieldClass, "appearance-none pr-8 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%235c5953\" stroke-width=\"2\"><polyline points=\"6 9 12 15 18 9\"/></svg>')] bg-no-repeat bg-[right_12px_center]")}
                    >
                      <option value="">—</option>
                      {LEGAL_FORMS.map((form) => (
                        <option key={form} value={form}>
                          {form}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Code APE / Activité" hint="Autofill INSEE — modifiable.">
                    <select
                      value={ape}
                      onChange={(e) => setApe(e.target.value)}
                      className={cn(fieldClass, "appearance-none pr-8 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%235c5953\" stroke-width=\"2\"><polyline points=\"6 9 12 15 18 9\"/></svg>')] bg-no-repeat bg-[right_12px_center]")}
                    >
                      <option value="">—</option>
                      {APE_CODES.map(({ code, label }) => {
                        const display = `${code} — ${label}`;
                        return (
                          <option key={code} value={display}>
                            {display}
                          </option>
                        );
                      })}
                    </select>
                  </Field>
                </div>
              </Section>

              <Section
                title="Contact principal"
                description="Personne destinataire du devis (CFO, dirigeant, responsable assurances…)."
              >
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Prénom" required>
                    <input
                      type="text"
                      value={contactFirstName}
                      onChange={(e) => setContactFirstName(e.target.value)}
                      placeholder="Sophie"
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Nom" required>
                    <input
                      type="text"
                      value={contactLastName}
                      onChange={(e) => setContactLastName(e.target.value)}
                      placeholder="Marchand"
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Fonction" className="col-span-2">
                    <input
                      type="text"
                      value={contactRole}
                      onChange={(e) => setContactRole(e.target.value)}
                      placeholder="Directrice financière"
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Email" required>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="sophie.marchand@entreprise.fr"
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Téléphone">
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="06 12 34 56 78"
                      className={fieldClass}
                    />
                  </Field>
                </div>
              </Section>
            </>
          ) : (
            <Section title="Identification">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Prénom" required>
                  <input
                    ref={firstInputRef}
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Sophie"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Nom" required>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Marchand"
                    className={fieldClass}
                  />
                </Field>
                <Field
                  label="Date de naissance"
                  required
                  hint="Clé de rapprochement utilisée par VEOS."
                  className="col-span-2"
                >
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className={fieldClass}
                  />
                </Field>
                <Field label="Email" required>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="sophie.marchand@gmail.com"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Téléphone">
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="06 12 34 56 78"
                    className={fieldClass}
                  />
                </Field>
              </div>
            </Section>
          )}

          <Section title="Adresse">
            <Field label="Rue" required>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="12 rue de la République"
                className={fieldClass}
              />
            </Field>
            <div className="grid grid-cols-[140px_1fr] gap-3">
              <Field label="Code postal" required>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="75011"
                  inputMode="numeric"
                  className={fieldClass}
                />
              </Field>
              <Field label="Ville" required>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Paris"
                  className={fieldClass}
                />
              </Field>
            </div>
            <Field label="Pays" required>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={cn(fieldClass, "appearance-none pr-8 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%235c5953\" stroke-width=\"2\"><polyline points=\"6 9 12 15 18 9\"/></svg>')] bg-no-repeat bg-[right_12px_center]")}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </Section>

          {submitError && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-panora-error-bg border border-panora-error/20">
              <AlertCircle className="w-3.5 h-3.5 text-panora-error shrink-0 mt-0.5" />
              <p className="text-[12px] text-panora-error leading-[18px]">
                {submitError.message}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-panora-border px-6 py-3.5 flex items-center justify-between gap-3 bg-panora-secondary/30">
          <DestinationNote destination={destination} veosConnected={veosConnected} />
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onCancel}
              type="button"
              className="px-4 h-9 text-[13px] font-medium text-panora-text-secondary rounded-lg border border-panora-border hover:bg-white transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              type="button"
              className={cn(
                "btn-primary px-4 h-9 text-[13px] font-semibold leading-5 inline-flex items-center gap-1.5",
                !canSubmit && "opacity-50 cursor-not-allowed"
              )}
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Créer dans {destination}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────

function TypeToggle({
  value,
  onChange,
}: {
  value: VeosClientType;
  onChange: (v: VeosClientType) => void;
}) {
  const options: { id: VeosClientType; label: string; Icon: typeof Building2 }[] = [
    { id: "PM", label: "Personne morale", Icon: Building2 },
    { id: "PP", label: "Personne physique", Icon: User },
  ];
  return (
    <div
      role="radiogroup"
      className="inline-flex p-0.5 rounded-lg bg-panora-secondary/60 border border-panora-border self-start"
    >
      {options.map(({ id, label, Icon }) => {
        const active = id === value;
        return (
          <button
            key={id}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 h-8 text-[12.5px] font-medium rounded-md transition-colors",
              active
                ? "bg-white text-panora-text shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
                : "text-panora-text-muted hover:text-panora-text-secondary"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-[13px] font-medium text-panora-text leading-5">
          {title}
        </h3>
        {description && (
          <p className="text-[12px] text-panora-text-muted leading-[18px]">
            {description}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-[13px] font-medium text-panora-text leading-5">
        {label}
        {required && <span className="text-panora-error ml-1">*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-[12px] text-panora-text-muted leading-4">{hint}</p>
      )}
    </div>
  );
}

function SirenLookupRow({
  value,
  onChange,
  state,
  onLookup,
}: {
  value: string;
  onChange: (v: string) => void;
  state: InseeUiState;
  onLookup: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium text-panora-text leading-5">
          SIREN
          <span className="text-panora-text-muted font-normal ml-1.5">
            — recherche INSEE
          </span>
        </label>
        {state.status === "found" && (
          <span className="inline-flex items-center gap-1 px-2 h-[18px] rounded-full text-[10.5px] font-medium leading-4 bg-panora-green-light text-panora-green-dark whitespace-nowrap">
            <Check className="w-3 h-3" />
            Trouvé via INSEE
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="000 000 000"
          inputMode="numeric"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onLookup();
            }
          }}
          className={cn(fieldClass, "flex-1")}
        />
        <button
          type="button"
          onClick={onLookup}
          disabled={!value.trim() || state.status === "loading"}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 h-10 rounded-lg border border-panora-border text-[12.5px] font-medium text-panora-text hover:bg-panora-secondary/40 transition-colors whitespace-nowrap",
            (!value.trim() || state.status === "loading") &&
              "opacity-50 cursor-not-allowed"
          )}
        >
          {state.status === "loading" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5 text-panora-text-secondary" />
          )}
          Rechercher
        </button>
      </div>
      {state.status === "notfound" && (
        <p className="text-[11px] text-panora-text-muted leading-4">
          Pas trouvé — remplissez manuellement les champs ci-dessous.
        </p>
      )}
      {state.status === "duplicate" && (
        <p className="text-[11px] text-panora-error leading-4 inline-flex items-center gap-1">
          Client déjà existant dans VEOS —
          <span className="font-medium">{state.client.name}</span>
          <button
            type="button"
            className="font-medium underline underline-offset-2 hover:opacity-80 inline-flex items-center gap-0.5"
            onClick={() => {
              // For the demo we just log — wiring "open in VEOS" is out of scope.
              console.log("Open in VEOS:", state.client.id);
            }}
          >
            l&apos;ouvrir ?
            <ExternalLink className="w-3 h-3" />
          </button>
        </p>
      )}
      {state.status === "error" && (
        <p className="text-[11px] text-panora-error leading-4">
          Service INSEE indisponible. Saisie manuelle possible.
        </p>
      )}
    </div>
  );
}

function DestinationNote({
  destination,
  veosConnected,
}: {
  destination: string;
  veosConnected: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative flex items-center gap-1.5 min-w-0">
      <span className="text-[11.5px] text-panora-text-muted leading-4 truncate">
        Sera créé dans {destination}
      </span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-4 h-4 rounded-full text-panora-text-muted hover:text-panora-text-secondary transition-colors"
        aria-label="En savoir plus"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-[320px] bg-white border border-panora-border rounded-lg shadow-[0px_8px_24px_rgba(0,0,0,0.10)] p-3 z-10">
          <p className="text-[12px] text-panora-text leading-[18px]">
            Panora capture le strict nécessaire pour démarrer une cotation.
            L&apos;enrichissement complet — KYC, KBIS, RIB, dirigeants,
            contacts liés — se fait dans {destination} après création.
          </p>
          {!veosConnected && (
            <p className="text-[11px] text-panora-text-muted leading-4 mt-2">
              VEOS n&apos;est pas connecté ; la fiche pourra être synchronisée
              depuis{" "}
              <Link
                href="/settings/integrations"
                className="font-medium text-panora-green hover:underline"
              >
                Paramètres · Intégrations
              </Link>
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Shared classes ─────────────────────────────────────────────────────

const fieldClass =
  "w-full h-10 px-3 text-[13px] leading-5 text-panora-text placeholder:text-panora-text-muted bg-white border border-panora-border rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none focus:border-panora-green/40 transition-colors";
