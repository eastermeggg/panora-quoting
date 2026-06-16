"use client";

import { ExternalLink, X } from "lucide-react";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import {
  ExtranetCredentialsPanel,
  type ExtranetCredentialsPanelProps,
} from "./ExtranetCredentialsPanel";
import type {
  AvailableExtranet,
  ExtranetConfig,
} from "@/data/settings-mock";

interface ConfigureExtranetModalProps {
  extranet: AvailableExtranet | ExtranetConfig;
  variant: ExtranetCredentialsPanelProps["variant"];
  onClose: () => void;
  onSave: ExtranetCredentialsPanelProps["onSave"];
  onDelete?: () => void;
}

export function ConfigureExtranetModal({
  extranet,
  variant,
  onClose,
  onSave,
  onDelete,
}: ConfigureExtranetModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[1px]"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12)] w-full max-w-[480px] mx-4 flex flex-col max-h-[90vh] overflow-visible"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <InsurerLogo
              insurerId={extranet.insurerId}
              name={extranet.insurerName}
              size="lg"
            />
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold text-panora-text leading-5 font-display">
                  {extranet.insurerName}
                  {extranet.portalLabel && (
                    <span className="text-[13px] font-normal text-panora-text-muted ml-1.5">
                      · {extranet.portalLabel}
                    </span>
                  )}
                </span>
              </div>
              <a
                href={`https://${extranet.portalUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[12px] text-panora-text-muted hover:text-panora-green transition-colors group"
              >
                {extranet.portalUrl}
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-panora-border/40 transition-colors"
          >
            <X className="w-4 h-4 text-panora-text-muted" />
          </button>
        </div>

        <div className="h-px bg-panora-border" />

        <div className="flex-1 overflow-visible px-6 py-5">
          <ExtranetCredentialsPanel
            extranet={extranet}
            variant={variant}
            onSave={(data) => {
              onSave(data);
            }}
            onCancel={onClose}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}
