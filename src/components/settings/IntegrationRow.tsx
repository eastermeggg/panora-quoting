"use client";

import Image from "next/image";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Integration,
  IntegrationConnection,
} from "@/data/integrations-mock";

interface IntegrationRowProps {
  integration: Integration;
  connection?: IntegrationConnection;
  onConfigure?: () => void;
  onEdit?: () => void;
}

export function IntegrationRow({
  integration,
  connection,
  onConfigure,
  onEdit,
}: IntegrationRowProps) {
  const isConnected = connection?.status === "connected";
  const isComingSoon = integration.availability === "coming_soon";

  return (
    <div
      className={cn(
        "flex items-center justify-between h-14 px-3.5 rounded-lg border transition-colors",
        isComingSoon
          ? "bg-panora-secondary/40 border-panora-border"
          : "bg-white border-panora-border"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Image
          src={integration.logoSrc}
          alt={integration.name}
          width={24}
          height={24}
          className="rounded-md shrink-0"
        />
        <span className="text-[13px] font-semibold text-panora-text leading-5 truncate">
          {integration.name}
        </span>
        {isConnected ? (
          <span className="inline-flex items-center px-2 h-5 rounded-full text-[11px] font-medium leading-4 bg-panora-green-light text-panora-green-dark whitespace-nowrap">
            Connecté
          </span>
        ) : isComingSoon ? (
          <span className="inline-flex items-center px-2 h-5 rounded-full text-[11px] font-medium leading-4 bg-[#f4e9dd] text-[#8a5a2b] whitespace-nowrap">
            Bientôt
          </span>
        ) : (
          <span className="inline-flex items-center px-2 h-5 rounded-full text-[11px] font-medium leading-4 bg-panora-secondary text-panora-text-secondary whitespace-nowrap">
            Non configuré
          </span>
        )}
      </div>

      {/* Right side */}
      {isConnected ? (
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[12px] text-panora-text-muted leading-5 truncate">
            {[connection?.accountLabel, connection?.lastSyncLabel]
              .filter(Boolean)
              .join(" · ")}
          </span>
          <button
            onClick={onEdit}
            className="text-[13px] font-medium text-panora-green hover:underline"
          >
            Modifier
          </button>
          <button
            type="button"
            className="flex items-center justify-center w-6 h-6 rounded-md text-panora-text-muted hover:bg-panora-secondary transition-colors"
            aria-label="Plus d'options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      ) : isComingSoon ? null : (
        <button
          onClick={onConfigure}
          className="btn-primary px-3.5 h-8 text-[12.5px] font-semibold leading-5"
        >
          Configurer
        </button>
      )}
    </div>
  );
}
