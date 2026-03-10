"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import {
  Check,
  Copy,
  Play,
  Car,
  Shield,
  Mail,
  ArrowRight,
  Paperclip,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getAllScenarios } from "@/data/scenarios";
import { InsurerLogo } from "@/components/ui/InsurerLogo";

export default function QuotingEmptyState() {
  const [extranetsConfigured, setExtranetsConfigured] = useState(false);
  const [copied, setCopied] = useState(false);

  const scenarioList = getAllScenarios();

  const handleCopy = () => {
    navigator.clipboard.writeText("cotation+a7f3b2@panora.co");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const productIcons = {
    car: Car,
    shield: Shield,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar variant="empty" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 pt-12 pb-16">
          {/* Title */}
          <h1 className="text-2xl font-semibold text-panora-text mb-2">
            Bienvenue sur l&apos;assistant cotation
          </h1>
          <p className="text-sm text-panora-text-secondary mb-10 leading-relaxed max-w-lg">
            Lancez des cotations automatiques sur les extranets assureurs.
            L&apos;agent remplit les formulaires, récupère les tarifs et les
            documents.
          </p>

          {/* Step 1 — Extranet codes */}
          <div className="mb-8">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-sm font-semibold",
                  "bg-panora-green text-white"
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
                    ? "Codes extranets configurés"
                    : "Connectez vos extranets"}
                </h3>
                {!extranetsConfigured ? (
                  <>
                    <p className="text-sm text-panora-text-secondary leading-relaxed mb-3">
                      Chaque assureur vous fournit un accès à son extranet (portail en ligne).
                      Renseignez vos codes d&apos;accès ici : l&apos;agent les utilisera pour saisir
                      les devis à votre place. Vos identifiants sont chiffrés et jamais partagés.
                    </p>
                    <div className="bg-panora-drop border border-panora-border rounded-lg p-4 mb-4">
                      <p className="text-xs text-panora-text-muted leading-relaxed mb-3">
                        <strong className="text-panora-text">Comment ça marche ?</strong>{" "}
                        Chaque assureur (Axa, Allianz, Generali…) a son propre portail web.
                        Quand vous nous donnez vos codes, notre agent se connecte, remplit les
                        formulaires et récupère les devis — comme si vous le faisiez vous-même.
                      </p>
                      <div className="flex items-center gap-3 text-xs text-panora-text-muted">
                        <span className="inline-flex items-center gap-1"><InsurerLogo insurerId="axa" name="Axa" size="sm" /> Axa</span>
                        <span className="text-panora-border">·</span>
                        <span className="inline-flex items-center gap-1"><InsurerLogo insurerId="allianz" name="Allianz" size="sm" /> Allianz</span>
                        <span className="text-panora-border">·</span>
                        <span className="inline-flex items-center gap-1"><InsurerLogo insurerId="generali" name="Generali" size="sm" /> Generali</span>
                        <span className="text-panora-border">·</span>
                        <span className="inline-flex items-center gap-1"><InsurerLogo insurerId="chubb" name="Chubb" size="sm" /> Chubb</span>
                        <span className="text-panora-border">·</span>
                        <span>+12 assureurs</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setExtranetsConfigured(true)}
                      className="btn-primary px-4 py-2 text-sm font-medium rounded-full transition-colors"
                    >
                      Configurer mes accès
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-panora-text-secondary">
                    5 assureurs connectés. Vous pouvez en ajouter d&apos;autres à tout moment.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-panora-border mb-8" />

          {/* Step 2 — Email mechanism */}
          <div className="mb-10">
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
                <h3
                  className={cn(
                    "font-semibold mb-1",
                    extranetsConfigured
                      ? "text-panora-text"
                      : "text-panora-text-muted"
                  )}
                >
                  Lancez une cotation par transfert d&apos;e-mail
                </h3>
                <p
                  className={cn(
                    "text-sm leading-relaxed mb-4",
                    extranetsConfigured
                      ? "text-panora-text-secondary"
                      : "text-panora-text-muted"
                  )}
                >
                  Transférez un email client (avec documents en pièces jointes) vers
                  votre adresse dédiée. L&apos;agent extrait automatiquement les données
                  du corps de l&apos;email et des fichiers joints, puis crée la cotation.
                </p>

                {/* Email address copy field */}
                <div className="flex items-center gap-2 bg-panora-green-light rounded-lg px-3 py-2.5 mb-4">
                  <Mail className="w-4 h-4 text-panora-green shrink-0" />
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

                {/* How the mechanism works */}
                {extranetsConfigured && (
                  <div className="bg-panora-drop border border-panora-border rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-6 text-xs text-panora-text-secondary">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-panora-card border border-panora-border flex items-center justify-center">
                          <Mail className="w-4 h-4 text-panora-text-muted" />
                        </div>
                        <span>Email client<br />+ pièces jointes</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-panora-text-muted shrink-0" />
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-panora-green-light flex items-center justify-center">
                          <Paperclip className="w-4 h-4 text-panora-green" />
                        </div>
                        <span>Extraction<br />automatique</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-panora-text-muted shrink-0" />
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-panora-green-light flex items-center justify-center">
                          <Play className="w-4 h-4 text-panora-green fill-panora-green" />
                        </div>
                        <span>Cotation<br />lancée</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          {extranetsConfigured && (
            <>
              <div className="border-t border-panora-border mb-8" />

              {/* Step 3 — Demo scenarios */}
              <div>
                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-panora-green text-white flex items-center justify-center shrink-0 mt-0.5 text-sm font-semibold">
                    <Play className="w-3.5 h-3.5 fill-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-panora-text mb-1">
                      Essayer avec un scénario de démonstration
                    </h3>
                    <p className="text-sm text-panora-text-secondary leading-relaxed mb-5">
                      Choisissez un scénario pour simuler un email entrant et voir le
                      processus de cotation de bout en bout. Chaque produit a ses propres
                      champs et documents requis.
                    </p>

                    {/* Scenario cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {scenarioList.map((scenario) => {
                        const Icon = productIcons[scenario.productIcon];
                        const emailCount = scenario.emailThread.length;
                        const attachmentCount = scenario.emailThread.reduce(
                          (sum, e) => sum + e.attachments.length,
                          0
                        );
                        const fieldCount = scenario.extractedSections.reduce(
                          (sum, s) => sum + s.fields.length,
                          0
                        );

                        return (
                          <Link
                            key={scenario.id}
                            href={`/quoting/preparation?scenario=${scenario.id}`}
                            className="group border border-panora-border rounded-xl p-4 bg-panora-card hover:border-panora-green/40 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-lg bg-panora-green-light flex items-center justify-center">
                                <Icon className="w-5 h-5 text-panora-green" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-panora-text">
                                  {scenario.label}
                                </h4>
                                <p className="text-xs text-panora-text-muted truncate">
                                  {scenario.client}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-panora-text-muted group-hover:text-panora-green transition-colors" />
                            </div>

                            <p className="text-xs text-panora-text-secondary leading-relaxed mb-3">
                              {scenario.description}
                            </p>

                            <div className="flex items-center gap-3 text-[11px] text-panora-text-muted">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {emailCount} email{emailCount > 1 ? "s" : ""}
                              </span>
                              <span className="flex items-center gap-1">
                                <Paperclip className="w-3 h-3" />
                                {attachmentCount} pièces jointes
                              </span>
                              <span>{fieldCount} champs</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
