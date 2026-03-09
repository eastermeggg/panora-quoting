"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Check, Copy, Play, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function QuotingEmptyState() {
  const [extranetsConfigured, setExtranetsConfigured] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("cotation+a7f3b2@panora.co");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar variant="empty" />

      <div className="flex-1 flex items-start justify-center pt-16 px-8">
        <div className="max-w-xl w-full">
          {/* Title */}
          <h1 className="text-2xl font-semibold text-panora-text mb-2">
            Bienvenue sur l&apos;assistant cotation
          </h1>
          <p className="text-sm text-panora-text-secondary mb-10 leading-relaxed">
            Lancez des cotations automatiques sur les extranets assureurs.
            L&apos;agent remplit les formulaires, récupère les tarifs et les
            documents.
          </p>

          {/* Step 1 */}
          <div className="mb-8">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-sm font-semibold",
                  extranetsConfigured
                    ? "bg-panora-green text-white"
                    : "bg-panora-green text-white"
                )}
              >
                {extranetsConfigured ? (
                  <Check className="w-4 h-4" />
                ) : (
                  "1"
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-panora-text mb-1">
                  {extranetsConfigured
                    ? "Premiers codes extranets renseignés !"
                    : "Connectez vos extranets"}
                </h3>
                {!extranetsConfigured && (
                  <>
                    <p className="text-sm text-panora-text-secondary leading-relaxed mb-4">
                      Renseignez vos codes d&apos;accès aux portails assureurs.
                      L&apos;agent les utilisera pour saisir les devis à votre
                      place. Vos identifiants sont chiffrés et jamais partagés.
                    </p>
                    <button
                      onClick={() => setExtranetsConfigured(true)}
                      className="px-4 py-2 bg-panora-green text-white text-sm font-medium rounded-lg hover:bg-panora-green-dark transition-colors"
                    >
                      Configurer mes accès
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-panora-border mb-8" />

          {/* Step 2 */}
          <div>
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-sm font-semibold",
                  extranetsConfigured
                    ? "bg-panora-green text-white"
                    : "bg-gray-300 text-gray-500"
                )}
              >
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3
                    className={cn(
                      "font-semibold",
                      extranetsConfigured
                        ? "text-panora-text"
                        : "text-panora-text-muted"
                    )}
                  >
                    Lancez votre première cotation par e-mail
                  </h3>
                  {extranetsConfigured && (
                    <Link
                      href="#"
                      className="text-xs text-panora-green hover:underline font-medium"
                    >
                      En savoir plus
                    </Link>
                  )}
                </div>
                <p
                  className={cn(
                    "text-sm leading-relaxed mb-4",
                    extranetsConfigured
                      ? "text-panora-text-secondary"
                      : "text-panora-text-muted"
                  )}
                >
                  Transférez un email client avec les documents. L&apos;agent
                  crée la cotation et vous notifie quand c&apos;est prêt.
                </p>

                {/* Email address copy field */}
                <div className="flex items-center gap-2 bg-panora-green-light rounded-lg px-3 py-2.5 mb-4">
                  <Play className="w-4 h-4 text-panora-green fill-panora-green shrink-0" />
                  <span className="text-sm text-panora-green font-medium font-mono flex-1">
                    cotation+a7f3b2@panora.co
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-panora-green hover:underline font-medium shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copié
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copier
                      </>
                    )}
                  </button>
                </div>

                {extranetsConfigured && (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/email"
                      className="flex items-center gap-2 px-4 py-2 bg-panora-green text-white text-sm font-medium rounded-lg hover:bg-panora-green-dark transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      Simuler un transfert d&apos;email
                    </Link>
                    <Link
                      href="#"
                      className="flex items-center gap-2 text-sm text-panora-green hover:underline font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Voir notre tutoriel
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
