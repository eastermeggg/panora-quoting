"use client";

import Link from "next/link";
import { Database, Mail } from "lucide-react";
import { DossierBoard } from "@/components/souscription/DossierBoard";

export default function SouscriptionHome() {
  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white">
      {/* Header */}
      <div className="shrink-0 border-b border-panora-border px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-[20px] font-serif text-panora-text leading-7">
            Assistant souscription
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/souscription/reception"
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-panora-border text-[13px] font-medium text-panora-text hover:bg-panora-drop transition-colors"
          >
            <Mail className="w-4 h-4 text-panora-text-secondary" />
            Réception
          </Link>
          <Link
            href="/settings/vault"
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-panora-border text-[13px] font-medium text-panora-text hover:bg-panora-drop transition-colors"
          >
            <Database className="w-4 h-4 text-panora-text-secondary" />
            Vault
          </Link>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 min-h-0 flex flex-col">
        <DossierBoard />
      </div>
    </div>
  );
}
