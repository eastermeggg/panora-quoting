"use client";

import { useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Mail,
  Shield,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type AvailableExtranet,
  type ExtranetConfig,
  type InsuranceProduct,
  type OtpDelivery,
} from "@/data/settings-mock";

// ── OTP delivery hint ──

function OtpDeliveryHint({ delivery }: { delivery: OtpDelivery }) {
  const icon =
    delivery.channel === "email" ? (
      <Mail className="w-3.5 h-3.5 text-panora-text-secondary" />
    ) : delivery.channel === "sms" ? (
      <Smartphone className="w-3.5 h-3.5 text-panora-text-secondary" />
    ) : (
      <KeyRound className="w-3.5 h-3.5 text-panora-text-secondary" />
    );
  const label =
    delivery.channel === "email"
      ? `Code 2FA envoyé par email à ${delivery.hint}`
      : delivery.channel === "sms"
        ? `Code 2FA envoyé par SMS au ${delivery.hint}`
        : `Code 2FA généré dans ${delivery.hint}`;

  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-panora-secondary/30 border border-panora-border">
      <div className="shrink-0 mt-px">{icon}</div>
      <p className="text-[12px] leading-[18px] text-panora-text-secondary">
        {label}.{" "}
        <span className="text-panora-text-muted">
          Vous saisirez ce code à chaque activation de session.
        </span>
      </p>
    </div>
  );
}

// ── Panel ──

function isExtranetConfig(
  e: AvailableExtranet | ExtranetConfig
): e is ExtranetConfig {
  return "username" in e;
}

export interface ExtranetCredentialsPanelProps {
  extranet: AvailableExtranet | ExtranetConfig;
  variant: "configure" | "edit";
  onSave: (data: {
    username: string;
    password: string;
    selectedProducts: InsuranceProduct[];
  }) => void;
  onCancel?: () => void;
  /** Label on the primary save button. Defaults to "Enregistrer". */
  submitLabel?: string;
  /** Optional delete handler (edit variant only). */
  onDelete?: () => void;
}

/**
 * Renders the credentials form for one insurer extranet (username + password +
 * products). Credentials are stored as-is; the live connection (and its 2FA)
 * happens at first session activation, not here.
 */
export function ExtranetCredentialsPanel({
  extranet,
  variant,
  onSave,
  onCancel,
  submitLabel,
  onDelete,
}: ExtranetCredentialsPanelProps) {
  const isEdit = variant === "edit";
  const hasNoModelized = extranet.modelizedProducts.length === 0;
  const existing = isEdit && isExtranetConfig(extranet) ? extranet : null;
  const otpDelivery: OtpDelivery | undefined =
    (extranet as AvailableExtranet).otpDelivery ??
    (existing as ExtranetConfig | null)?.otpDelivery;
  const requires2FA =
    (extranet as AvailableExtranet).requires2FA === true ||
    otpDelivery !== undefined;

  const [username, setUsername] = useState(existing?.username ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSave() {
    // Products are declared globally in the Produits block, not per insurer.
    // On edit we keep whatever was already stored; on configure we default to
    // everything this insurer can model.
    const selectedProducts: InsuranceProduct[] =
      existing?.selectedProducts ??
      extranet.modelizedProducts.map((p) => p.product);
    onSave({ username, password, selectedProducts });
  }

  const canSave =
    username.trim().length > 0 && password.trim().length > 0;

  return (
    <div className="flex flex-col gap-5">
      {hasNoModelized && (
        <div className="flex gap-3 p-3.5 rounded-lg bg-panora-warning-bg border border-panora-warning/20">
          <Info className="w-4 h-4 text-panora-warning-text shrink-0 mt-0.5" />
          <p className="text-[12px] leading-[18px] text-panora-warning-text">
            Aucun produit n&apos;est encore modélisé pour cet assureur. Vous
            pouvez enregistrer vos identifiants — on vous notifie dès que des
            produits sont disponibles.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-medium text-panora-text leading-5">
          Identifiant
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="votre.identifiant@courtier.fr"
          className="w-full h-[38px] px-3 text-[13px] leading-5 text-panora-text placeholder:text-panora-text-muted bg-white border border-panora-border rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none focus:border-panora-green/40 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-medium text-panora-text leading-5">
          Mot de passe
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEdit ? "••••••••" : "Votre mot de passe"}
            className="w-full h-[38px] px-3 pr-10 text-[13px] leading-5 text-panora-text placeholder:text-panora-text-muted bg-white border border-panora-border rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none focus:border-panora-green/40 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-panora-text-muted hover:text-panora-text-secondary transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-panora-green" />
          <span className="text-[11px] text-panora-text-muted leading-4">
            Chiffrement AES-256 de bout en bout
          </span>
        </div>
      </div>

      {requires2FA && otpDelivery && <OtpDeliveryHint delivery={otpDelivery} />}

      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          {isEdit && onDelete && (
            <button
              onClick={onDelete}
              className="text-[13px] font-medium text-panora-error hover:underline transition-colors"
            >
              Supprimer l&apos;accès
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 h-[36px] text-[13px] font-medium text-panora-text-secondary rounded-lg border border-panora-border hover:bg-panora-drop transition-colors"
            >
              Annuler
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={cn(
              "btn-primary inline-flex items-center gap-2 px-4 h-[36px] text-[13px] font-semibold leading-5",
              !canSave && "opacity-50 cursor-not-allowed"
            )}
          >
            <Check className="w-3.5 h-3.5" />
            {submitLabel ?? "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
