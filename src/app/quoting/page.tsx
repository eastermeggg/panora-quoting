"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Send,
  Mail,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
export default function QuotingEmptyState() {
  const [extranetsConfigured, setExtranetsConfigured] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopy = () => {
    navigator.clipboard.writeText("cotation+a7f3b2@panora.co");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white">
        {/* Header */}
        <div className="shrink-0 border-b border-panora-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-[17px] h-5 rounded-sm bg-panora-green-light" />
            <span className="text-[15px] font-medium text-panora-text font-serif">
              Assistant cotation
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-5 overflow-y-auto">
          <div className="bg-panora-bg rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center px-3.5 py-14 h-full min-h-[500px]">
            <div className="w-full max-w-[660px]">
              {/* Title */}
              <div className="px-1 mb-6">
                <h1 className="text-2xl text-panora-text font-serif leading-7 mb-2.5">
                  Bienvenue sur l&apos;assistant cotation
                </h1>
                <p className="text-[13px] text-panora-text-secondary leading-5">
                  Lancez des cotations automatiques sur les extranets assureurs.
                  <br />
                  L&apos;agent remplit les formulaires, récupère les tarifs et les documents.
                </p>
              </div>

              {/* Quick link to dashboard */}
              {extranetsConfigured && (
                <div className="px-1 mb-4">
                  <Link
                    href="/quoting/dashboard"
                    className="inline-flex items-center gap-2 text-[13px] text-panora-green hover:underline font-medium"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Voir mes cotations
                  </Link>
                </div>
              )}

              {/* Step cards */}
              <div className="space-y-5">
                {/* Step 1 — Connectez vos extranets */}
                <div className="bg-white border border-panora-border rounded-xl p-5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                  <div className="flex gap-4 items-start">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[12px] font-medium",
                        extranetsConfigured
                          ? "bg-panora-green text-white"
                          : "bg-panora-green text-white"
                      )}
                    >
                      {extranetsConfigured ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        "1"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-medium text-panora-text font-serif leading-5 mb-1">
                        {extranetsConfigured
                          ? "Codes extranets configurés"
                          : "Connectez vos extranets"}
                      </h3>
                      {!extranetsConfigured ? (
                        <>
                          <p className="text-[13px] text-panora-text-secondary leading-5 mb-4">
                            Renseignez vos codes d&apos;accès aux portails assureurs.
                            L&apos;agent les utilisera pour saisir les devis à votre place.
                            Vos identifiants sont chiffrés et jamais partagés.
                          </p>
                          <button
                            onClick={() => setExtranetsConfigured(true)}
                            className="btn-primary px-3 py-2 text-[13px] font-medium transition-colors"
                          >
                            Configurer mes accès
                          </button>
                        </>
                      ) : (
                        <p className="text-[13px] text-panora-text-secondary leading-5">
                          5 assureurs connectés. Vous pouvez en ajouter d&apos;autres à tout moment.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 2 — Email cotation */}
                <div className="bg-white border border-panora-border rounded-xl p-5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                  <div className="flex gap-4 items-start">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[12px] font-medium",
                        extranetsConfigured
                          ? "bg-panora-green text-white"
                          : "bg-panora-secondary text-panora-text-secondary"
                      )}
                    >
                      2
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-medium text-panora-text font-serif leading-5 mb-1">
                        Lancez votre première cotation par e-mail
                      </h3>
                      <p className="text-[13px] text-panora-text-secondary leading-5 mb-4">
                        Transférez un email client avec les documents. L&apos;agent crée la cotation et vous notifie quand c&apos;est prêt
                      </p>

                      {/* Email address bar */}
                      <div className="flex items-center gap-2.5 bg-panora-green-light border border-panora-green-border rounded-[7px] px-2.5 h-[37px]">
                        <Send className="w-4 h-4 text-panora-green-dark shrink-0" />
                        <span className="text-[13px] text-panora-green-dark font-medium flex-1 truncate">
                          cotation+a7f3b2@panora.co
                        </span>
                        <button
                          onClick={handleCopy}
                          className="shrink-0 text-panora-green-dark hover:text-panora-green transition-colors"
                        >
                          {copied ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Simulate button — shown after step 1 done */}
                      {extranetsConfigured && (
                        <div className="mt-4 pt-4 border-t border-panora-border">
                          <p className="text-[13px] text-panora-text-secondary mb-3">
                            Pas encore d&apos;email client ? Simulez l&apos;envoi pour découvrir le processus complet.
                          </p>
                          <button
                            onClick={() => router.push("/email")}
                            className="btn-primary flex items-center gap-2 px-3 py-2 text-[13px] font-medium transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                            Simuler envoi via boîte mail
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
