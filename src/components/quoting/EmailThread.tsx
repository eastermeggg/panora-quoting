"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Mail,
  Paperclip,
  User,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmailMessage } from "@/data/scenarios";

interface EmailThreadProps {
  emails: EmailMessage[];
}

export function EmailThread({ emails }: EmailThreadProps) {
  return (
    <div className="space-y-2">
      {emails.map((email, idx) => (
        <EmailCard
          key={email.id}
          email={email}
          defaultExpanded={idx === 0}
          isLatest={idx === emails.length - 1}
        />
      ))}
    </div>
  );
}

function EmailCard({
  email,
  defaultExpanded,
  isLatest,
}: {
  email: EmailMessage;
  defaultExpanded: boolean;
  isLatest: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden bg-white",
        isLatest ? "border-panora-green/30" : "border-panora-border"
      )}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-panora-drop/30 transition-colors"
      >
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold",
            isLatest
              ? "bg-panora-green-light text-panora-green"
              : "bg-panora-drop text-panora-text-muted"
          )}
        >
          <User className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-panora-text">
              {email.fromName}
            </span>
            <span className="text-xs text-panora-text-muted truncate">
              &lt;{email.fromEmail}&gt;
            </span>
          </div>
          {!expanded && (
            <p className="text-xs text-panora-text-muted truncate mt-0.5">
              {email.body.split("\n")[0].slice(0, 80)}…
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {email.attachments.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-panora-text-muted">
              <Paperclip className="w-3 h-3" />
              {email.attachments.length}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-panora-text-muted">
            <Clock className="w-3 h-3" />
            {email.date}
          </span>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-panora-text-muted" />
          ) : (
            <ChevronRight className="w-4 h-4 text-panora-text-muted" />
          )}
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-panora-border">
          {/* Email metadata */}
          <div className="px-4 py-2 bg-panora-drop/30 text-xs text-panora-text-muted space-y-0.5">
            <div>
              <span className="font-medium">De :</span> {email.fromName} &lt;
              {email.fromEmail}&gt;
            </div>
            <div>
              <span className="font-medium">À :</span> {email.to}
            </div>
            <div>
              <span className="font-medium">Objet :</span> {email.subject}
            </div>
          </div>

          {/* Body */}
          <div className="px-4 py-3">
            <pre className="text-sm text-panora-text whitespace-pre-wrap font-sans leading-relaxed">
              {email.body}
            </pre>
          </div>

          {/* Attachments */}
          {email.attachments.length > 0 && (
            <div className="px-4 pb-3">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-panora-text-muted">
                <Paperclip className="w-3 h-3" />
                {email.attachments.length} pièce
                {email.attachments.length > 1 ? "s" : ""} jointe
                {email.attachments.length > 1 ? "s" : ""}
              </div>
              <div className="space-y-1">
                {email.attachments.map((att) => (
                  <div
                    key={att.name}
                    className="flex items-center gap-2 px-3 py-2 bg-panora-drop rounded-lg"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-panora-text-muted shrink-0" />
                    <span className="text-xs text-panora-text truncate flex-1">
                      {att.name}
                    </span>
                    <span className="text-[11px] text-panora-text-muted shrink-0">
                      {att.size}
                    </span>
                    <span className="text-[11px] text-panora-green font-medium shrink-0">
                      {att.fieldsExtracted} champs extraits
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
