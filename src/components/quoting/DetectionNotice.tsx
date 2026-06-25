"use client";

/**
 * Preparation-stage detection HITL for the left-rail entities (client, assureurs).
 * Kept deliberately light: a small flag on the field label + a one-line warning
 * underneath. There's no confirm step — the broker just selects/changes the value
 * to clear it, and an empty field blocks launch on its own.
 *
 *  - FieldFlag       → the small marker next to the field label.
 *  - DetectionNotice → the one-line warning under the field.
 */

import { AlertTriangle } from "lucide-react";

export function FieldFlag({ level }: { level: "doubt" | "missing" }) {
  return (
    <span className="inline-flex items-center gap-1 h-[18px] px-1.5 rounded-full bg-panora-warning-bg text-panora-warning-text text-[11px] font-medium">
      <AlertTriangle className="w-3 h-3" />
      {level === "missing" ? "Non détecté" : "À vérifier"}
    </span>
  );
}

export function DetectionNotice({ message }: { message: string }) {
  return (
    <div className="mt-1.5 flex items-start gap-1.5 text-panora-warning-text">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-[1px]" />
      <p className="text-[12px] leading-[18px]">{message}</p>
    </div>
  );
}
