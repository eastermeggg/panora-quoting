"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { IntegrationRow } from "@/components/settings/IntegrationRow";
import { ConfigureVeosModal } from "@/components/settings/ConfigureVeosModal";
import {
  type Integration,
  type IntegrationCategory,
  integrationsCatalog,
  integrationSectionCopy,
  currentConnections,
  setIntegrationConnection,
} from "@/data/integrations-mock";

type ModalState = { type: "configure"; integration: Integration } | null;

export default function IntegrationsPage() {
  const [, setTick] = useState(0);
  const [modal, setModal] = useState<ModalState>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function findConnection(id: string) {
    return currentConnections.find((c) => c.integrationId === id);
  }

  function handleConnected(integration: Integration) {
    setIntegrationConnection({
      integrationId: integration.id,
      status: "connected",
      accountLabel: "Token actif",
      lastSyncLabel: "Dernière sync · à l'instant",
      connectedAt: new Date().toISOString().slice(0, 10),
    });
    setTick((t) => t + 1);
    setModal(null);
    setToast(`${integration.name} connecté · synchronisation active`);
  }

  const sections: IntegrationCategory[] = ["erp_crm", "email"];

  return (
    <div className="flex-1 overflow-y-auto bg-white relative">
      <div className="max-w-[1280px] mx-auto px-10 py-8 flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-wider leading-4">
            Paramètres
          </span>
          <h1 className="text-[24px] font-serif leading-7 text-panora-text">
            Intégrations tierces
          </h1>
        </div>

        {sections.map((category, idx) => {
          const copy = integrationSectionCopy[category];
          const rows = integrationsCatalog.filter(
            (i) => i.category === category
          );
          return (
            <div key={category} className="flex flex-col gap-4">
              {idx > 0 && (
                <div className="h-px bg-panora-border -mt-2 mb-2" />
              )}
              <div className="flex flex-col gap-1">
                <h2 className="text-[15px] font-semibold text-panora-text leading-5 font-display">
                  {copy.title}
                </h2>
                <p className="text-[13px] text-panora-text-secondary leading-5 max-w-[820px]">
                  {copy.description}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {rows.map((integration) => (
                  <IntegrationRow
                    key={integration.id}
                    integration={integration}
                    connection={findConnection(integration.id)}
                    onConfigure={() =>
                      setModal({ type: "configure", integration })
                    }
                    onEdit={() =>
                      setModal({ type: "configure", integration })
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modal?.type === "configure" && modal.integration.id === "veos" && (
        <ConfigureVeosModal
          integration={modal.integration}
          onClose={() => setModal(null)}
          onConnected={() => handleConnected(modal.integration)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}

function Toast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-2.5 pl-3 pr-2 py-2 bg-white rounded-lg border border-panora-border shadow-[0px_8px_24px_0px_rgba(0,0,0,0.12)]">
        <CheckCircle2 className="w-4 h-4 text-panora-green shrink-0" />
        <span className="text-[13px] text-panora-text leading-5">
          {message}
        </span>
        <button
          onClick={onDismiss}
          className="flex items-center justify-center w-6 h-6 rounded-md text-panora-text-muted hover:bg-panora-secondary transition-colors"
          aria-label="Fermer la notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
