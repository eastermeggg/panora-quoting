"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, User, MoreVertical, Pencil, Trash2, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/CardGrid";
import { ProductBadge } from "./ProductBadge";
import {
  getActiveProducts,
  getRequestedProducts,
  type ExtranetConfig,
} from "@/data/settings-mock";

interface ExtranetCardProps {
  config: ExtranetConfig;
  onEdit?: () => void;
  onDelete?: () => void;
}

function formatVerifiedDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function ExtranetCard({ config, onEdit, onDelete }: ExtranetCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const activeProducts = getActiveProducts(config);
  const requestedProducts = getRequestedProducts(config);
  const selectedSet = new Set(config.selectedProducts);
  const modelizedNewSet = new Set(
    config.modelizedProducts.filter((p) => p.isNew).map((p) => p.product)
  );
  const inactiveProducts = config.modelizedProducts
    .filter((p) => !selectedSet.has(p.product))
    .map((p) => p.product);

  const isWarning = config.connectionStatus !== "connected";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <InsurerLogo
              insurerId={config.insurerId}
              name={config.insurerName}
              size="md"
            />
            <span className="text-[15px] font-semibold text-panora-text leading-5 font-display truncate">
              {config.insurerName}
            </span>
          </div>
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-panora-drop transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-panora-green focus-visible:outline-offset-1"
              aria-label="Actions"
            >
              <MoreVertical className="w-4 h-4 text-panora-text-muted" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-panora-border rounded-lg shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)] z-10 py-1 w-[160px]">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit?.();
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-[13px] text-panora-text-secondary hover:bg-panora-drop transition-colors duration-150 w-full text-left"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Modifier
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete?.();
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-[13px] text-panora-error hover:bg-panora-error-bg transition-colors duration-150 w-full text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardBody>
        <div className="flex flex-col gap-1.5">
          <a
            href={`https://${config.portalUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[12px] leading-4 text-panora-text-muted hover:text-panora-green transition-colors duration-150 group/link min-w-0"
          >
            <Globe className="w-3.5 h-3.5 shrink-0 text-panora-text-muted group-hover/link:text-panora-green transition-colors duration-150" />
            <span className="truncate">{config.portalUrl}</span>
            <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity duration-150" />
          </a>
          <div className="flex items-center gap-1.5 text-[12px] leading-4 text-panora-text-muted min-w-0">
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{config.username}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {isWarning ? (
              <AlertCircle className="w-3 h-3 text-panora-warning shrink-0" />
            ) : (
              <CheckCircle2 className="w-3 h-3 text-panora-green shrink-0" />
            )}
            <span
              className={cn(
                "text-[11px] leading-3",
                isWarning ? "text-panora-warning-text" : "text-panora-green-dark"
              )}
            >
              {isWarning
                ? "Ré-authentification requise"
                : `Vérifié le ${formatVerifiedDate(config.lastVerified)}`}
            </span>
          </div>
        </div>
      </CardBody>

      <CardFooter>
        <div className="flex flex-wrap gap-1.5 content-start">
          {activeProducts.map((p) => (
            <ProductBadge
              key={p}
              product={p}
              variant={modelizedNewSet.has(p) ? "new" : "modelized"}
            />
          ))}
          {requestedProducts.map((p) => (
            <ProductBadge key={p} product={p} variant="requested" />
          ))}
          {inactiveProducts.map((p) => (
            <ProductBadge key={p} product={p} variant="inactive" />
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
