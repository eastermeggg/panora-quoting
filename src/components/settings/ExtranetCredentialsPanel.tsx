"use client";

import {
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import {
  Check,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Mail,
  Search,
  Shield,
  Smartphone,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  masterProducts,
  type AvailableExtranet,
  type ExtranetConfig,
  type InsuranceProduct,
  type InsurerProduct,
  type OtpDelivery,
} from "@/data/settings-mock";

// ── Two-zone product selector ──

function ProductSearchSelect({
  modelizedProducts,
  selected,
  onToggle,
}: {
  modelizedProducts: InsurerProduct[];
  selected: Set<InsuranceProduct>;
  onToggle: (product: InsuranceProduct) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const modelizedSet = useMemo(
    () => new Set(modelizedProducts.map((p) => p.product)),
    [modelizedProducts]
  );
  const modelizedNewSet = useMemo(
    () =>
      new Set(modelizedProducts.filter((p) => p.isNew).map((p) => p.product)),
    [modelizedProducts]
  );

  const selectedList = Array.from(selected).map((product) => ({
    product,
    isModelized: modelizedSet.has(product),
    isNew: modelizedNewSet.has(product),
  }));

  const lowerQuery = query.toLowerCase();

  const disponibleItems = modelizedProducts.filter(
    (p) =>
      !selected.has(p.product) && p.product.toLowerCase().includes(lowerQuery)
  );

  const surDemandeItems = masterProducts.filter(
    (p) =>
      !selected.has(p.id) &&
      !modelizedSet.has(p.id) &&
      p.id.toLowerCase().includes(lowerQuery)
  );

  const hasResults = disponibleItems.length > 0 || surDemandeItems.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-panora-text leading-5">
        Produits que vous souhaitez côter
      </label>

      <div className="relative" ref={ref}>
        <div
          className={cn(
            "flex flex-wrap items-center gap-1.5 min-h-[38px] px-2.5 py-1.5 bg-white border rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors cursor-text",
            open ? "border-panora-green/40" : "border-panora-border"
          )}
          onClick={() => {
            setOpen(true);
            inputRef.current?.focus();
          }}
        >
          {selectedList.map(({ product, isModelized }) => (
            <span
              key={product}
              className={cn(
                "inline-flex items-center gap-1 pl-2 pr-1 h-6 rounded-md text-[12px] font-medium leading-4",
                isModelized
                  ? "bg-panora-green-light text-panora-green-dark"
                  : "border border-dashed border-panora-text-muted/40 text-panora-text-muted"
              )}
            >
              {product}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(product);
                }}
                className="flex items-center justify-center w-4 h-4 rounded hover:bg-black/5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <div className="flex items-center gap-1.5 flex-1 min-w-[80px]">
            {selectedList.length === 0 && (
              <Search className="w-3.5 h-3.5 text-panora-text-muted shrink-0" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder={
                selectedList.length === 0 ? "Rechercher un produit..." : ""
              }
              className="flex-1 text-[13px] leading-5 text-panora-text placeholder:text-panora-text-muted bg-transparent outline-none min-w-0"
            />
          </div>
        </div>

        {open && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-panora-border rounded-lg shadow-[0px_8px_24px_0px_rgba(0,0,0,0.12)] z-[60] py-1 max-h-[280px] overflow-y-auto">
            {!hasResults ? (
              <div className="px-3 py-2 text-[13px] text-panora-text-muted">
                Aucun produit trouvé
              </div>
            ) : (
              <>
                {disponibleItems.length > 0 && (
                  <>
                    <div className="px-3 pt-2 pb-1">
                      <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-wide">
                        Disponible ({disponibleItems.length})
                      </span>
                    </div>
                    {disponibleItems.map((p) => (
                      <button
                        key={p.product}
                        onClick={() => {
                          onToggle(p.product);
                          setQuery("");
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 text-[13px] w-full text-left text-panora-text hover:bg-panora-drop transition-colors"
                      >
                        <span className="font-medium flex-1">{p.product}</span>
                        {p.isNew ? (
                          <span className="px-1.5 py-px rounded-full text-[10px] font-medium bg-purple-100 text-purple-700">
                            Nouveau
                          </span>
                        ) : (
                          <span className="px-1.5 py-px rounded-full text-[10px] font-medium bg-panora-green-light text-panora-green-dark">
                            Disponible
                          </span>
                        )}
                      </button>
                    ))}
                  </>
                )}

                {disponibleItems.length > 0 && surDemandeItems.length > 0 && (
                  <div className="h-px bg-panora-border mx-2 my-1" />
                )}

                {surDemandeItems.length > 0 && (
                  <>
                    <div className="px-3 pt-2 pb-1">
                      <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-wide">
                        Sur demande ({surDemandeItems.length})
                      </span>
                    </div>
                    {surDemandeItems.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onToggle(p.id);
                          setQuery("");
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 text-[13px] w-full text-left text-panora-text-muted hover:bg-panora-drop transition-colors"
                      >
                        <span className="font-medium flex-1">{p.id}</span>
                        <span className="px-1.5 py-px rounded-full text-[10px] font-medium bg-panora-secondary text-panora-text-secondary">
                          Sur demande
                        </span>
                      </button>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {selected.size === 0 && (
        <p className="text-[11px] text-panora-text-muted leading-4">
          Sélectionnez au moins un produit
        </p>
      )}
    </div>
  );
}

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
  const [selectedProducts, setSelectedProducts] = useState<
    Set<InsuranceProduct>
  >(new Set(existing?.selectedProducts ?? []));

  function toggleProduct(product: InsuranceProduct) {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(product)) next.delete(product);
      else next.add(product);
      return next;
    });
  }

  function handleSave() {
    onSave({
      username,
      password,
      selectedProducts: Array.from(selectedProducts),
    });
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
            pouvez enregistrer vos identifiants et indiquer les produits
            souhaités — on vous notifie dès qu&apos;ils sont disponibles.
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

      <ProductSearchSelect
        modelizedProducts={extranet.modelizedProducts}
        selected={selectedProducts}
        onToggle={toggleProduct}
      />

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
