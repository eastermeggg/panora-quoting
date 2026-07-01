"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  ChevronDown,
  Clock,
  Download,
  FileText,
  Forward,
  Inbox,
  MoreHorizontal,
  Paperclip,
  Reply,
  Search,
  Send,
  Star,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  dossierNeedsCollecte,
  dossierStatus,
  getAllDossiers,
  getDossier,
  produitsLabel,
  type DossierStatus,
} from "@/data/souscription-engine";
import type { Dossier } from "@/data/souscription-mock";
import { useSouscriptionFormsTick } from "@/data/souscription-store";

const AVATARS = [
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
];

// The email in the inbox mirrors where its subscription stands in the app.
const STATUS_CHIP: Record<DossierStatus, { label: string; className: string }> = {
  a_process: { label: "À traiter", className: "bg-amber-100 text-amber-700" },
  tarifiee: { label: "Tarifiée", className: "bg-emerald-100 text-emerald-700" },
  refusee: { label: "Refusée", className: "bg-red-100 text-red-700" },
  terminee: { label: "Terminée", className: "bg-gray-100 text-gray-500" },
};

const LEGAL_FORMS = new Set(["SAS", "SARL", "SA", "SASU", "EURL", "SCI", "SNC"]);

/** Company initials, ignoring the trailing legal form — mirrors the board logo. */
function initials(name: string): string {
  const words = name
    .split(/\s+/)
    .filter((w) => w && !LEGAL_FORMS.has(w.replace(/\./g, "").toUpperCase()));
  if (words.length === 0) return name.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function pieceSize(name: string): string {
  if (/bilan|liasse/i.test(name)) return "1,2 Mo";
  if (/kbis/i.test(name)) return "245 Ko";
  if (/questionnaire|pacte/i.test(name)) return "480 Ko";
  return "320 Ko";
}

interface ReceptionEmail {
  id: string;
  dossierId?: string;
  from: string;
  broker?: string;
  fromEmail: string;
  subject: string;
  preview: string;
  date: string;
  unread: boolean;
  starred: boolean;
  status?: DossierStatus;
  avatar: { bg: string; text: string; initials: string };
  body: string;
  attachments: { name: string; size: string }[];
}

function emailFromDossier(d: Dossier, i: number): ReceptionEmail {
  const produits = produitsLabel(d.produitsDemandes);
  const status = dossierStatus(d);
  const slug = d.courtier.toLowerCase().replace(/[^a-z]+/g, "");
  const body = `Bonjour,

Je vous transmets une demande de ${produits} pour notre client ${d.insured.raison} (${d.insured.activite}, NAF ${d.insured.naf}).

Chiffre d'affaires : ${d.insured.caHT.toLocaleString("fr-FR")} € HT. Effectif : ${d.insured.effectif} salariés.

Vous trouverez les pièces utiles en pièces jointes. Merci de votre retour.

Cordialement,
${d.courtier}`;
  return {
    id: d.id,
    dossierId: d.id,
    // Lead with the insured company so the inbox mirrors the Panora list (same
    // name, same identity); the broker is the actual sender, shown as "via".
    from: d.insured.raison,
    broker: d.courtier,
    fromEmail: `contact@${slug}.fr`,
    subject: `Demande ${produits} - ${d.insured.raison}`,
    preview: `${d.courtier} vous transmet une demande de ${produits}...`,
    date: shortDate(d.recuLe),
    // Only a subscription still to process reads as an unread, unhandled email.
    unread: status === "a_process",
    starred: false,
    status,
    avatar: {
      ...AVATARS[i % AVATARS.length],
      initials: initials(d.insured.raison),
    },
    body,
    attachments: d.pieces.map((p) => ({ name: p, size: pieceSize(p) })),
  };
}

const DECOYS: ReceptionEmail[] = [
  {
    id: "decoy-vault",
    from: "Panora",
    fromEmail: "support@panora.co",
    subject: "Votre vault de règles est à jour",
    preview: "La grille de tarification RC Pro 2026 a été ingérée et parsée...",
    date: "Hier",
    unread: false,
    starred: false,
    avatar: { bg: "bg-emerald-100", text: "text-emerald-700", initials: "PA" },
    body: "Bonjour,\n\nLa grille de tarification RC Pro 2026 a été ingérée et parsée. 12 règles restent à valider dans le vault.\n\nL'équipe Panora",
    attachments: [],
  },
  {
    id: "decoy-revue",
    from: "Hiscox France",
    fromEmail: "no-reply@hiscox.fr",
    subject: "Revue trimestrielle des autorités déléguées",
    preview: "La revue des seuils d'autorité aura lieu le 15 du mois prochain...",
    date: "07/03",
    unread: false,
    starred: false,
    avatar: { bg: "bg-amber-100", text: "text-amber-700", initials: "HF" },
    body: "Bonjour,\n\nLa revue des seuils d'autorité déléguée aura lieu le 15 du mois prochain. Merci de préparer vos dossiers en cours.\n\nDirection souscription",
    attachments: [],
  },
];

export default function SouscriptionReceptionPage() {
  const router = useRouter();
  // Re-read when the app-side subscriptions change (collecte completed, etc.),
  // so the inbox stays in sync with what's happening in Panora.
  useSouscriptionFormsTick();
  const emails: ReceptionEmail[] = [
    ...getAllDossiers()
      .slice()
      .sort((a, b) => b.recuLe.localeCompare(a.recuLe))
      .map(emailFromDossier),
    ...DECOYS,
  ];
  const [selectedId, setSelectedId] = useState<string>(emails[0]?.id ?? "");
  const [showForward, setShowForward] = useState(false);

  const selected = emails.find((e) => e.id === selectedId) ?? emails[0];
  const unreadCount = emails.filter((e) => e.unread).length;
  const starredCount = emails.filter((e) => e.starred).length;

  const handleSendForward = () => {
    setShowForward(false);
    if (!selected?.dossierId) return;
    const d = getDossier(selected.dossierId);
    const base = `/souscription/dossier/${selected.dossierId}`;
    // A still-incomplete demande lands on the collecte (préparation) screen.
    router.push(d && dossierNeedsCollecte(d) ? `${base}/collecte` : base);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Folders rail */}
      <div className="w-[220px] bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-semibold text-gray-800">Mail</span>
        </div>

        <div className="px-3 mb-3">
          <button className="btn-primary w-full py-2 px-4 text-sm font-medium flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" />
            Nouveau message
          </button>
        </div>

        <nav className="px-2 space-y-0.5 flex-1">
          {[
            { icon: Inbox, label: "Boîte de réception", count: unreadCount, active: true },
            { icon: Star, label: "Favoris", count: starredCount },
            { icon: Send, label: "Envoyés" },
            { icon: FileText, label: "Brouillons" },
            { icon: Archive, label: "Archives" },
            { icon: Trash2, label: "Corbeille" },
          ].map((folder) => (
            <button
              key={folder.label}
              className={cn(
                "flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm w-full text-left",
                folder.active
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <folder.icon className="w-4 h-4" />
              <span className="flex-1">{folder.label}</span>
              {folder.count ? (
                <span
                  className={cn(
                    "text-xs font-medium",
                    folder.active ? "text-blue-700" : "text-gray-400"
                  )}
                >
                  {folder.count}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <Link
            href="/souscription"
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à Panora
          </Link>
        </div>
      </div>

      {/* Email list */}
      <div className="w-[360px] border-r border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans les emails..."
              className="w-full bg-gray-100 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {emails.map((email) => (
            <button
              key={email.id}
              onClick={() => setSelectedId(email.id)}
              className={cn(
                "w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors flex gap-3",
                selectedId === email.id && "bg-blue-50 border-l-2 border-l-blue-600"
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  email.avatar.bg
                )}
              >
                <span className={cn("text-xs font-semibold", email.avatar.text)}>
                  {email.avatar.initials}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={cn(
                      "text-sm truncate flex-1",
                      email.unread
                        ? "font-semibold text-gray-900"
                        : "text-gray-600"
                    )}
                  >
                    {email.from}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {email.date}
                  </span>
                </div>
                <p
                  className={cn(
                    "text-sm truncate",
                    email.unread ? "font-medium text-gray-800" : "text-gray-500"
                  )}
                >
                  {email.subject}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-400 truncate flex-1">
                    {email.preview}
                  </p>
                  <div className="flex items-center gap-1 shrink-0">
                    {email.status && (
                      <span
                        className={cn(
                          "inline-flex items-center h-4 px-1.5 rounded text-[10px] font-medium",
                          STATUS_CHIP[email.status].className
                        )}
                      >
                        {STATUS_CHIP[email.status].label}
                      </span>
                    )}
                    {email.attachments.length > 0 && (
                      <Paperclip className="w-3 h-3 text-gray-400" />
                    )}
                    {email.starred && (
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Reading pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <ArrowLeft className="w-4 h-4 text-gray-500" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900 flex-1 truncate">
                  {selected.subject}
                </h2>
                {selected.status && (
                  <span
                    className={cn(
                      "inline-flex items-center h-5 px-2 rounded text-[11px] font-medium shrink-0",
                      STATUS_CHIP[selected.status].className
                    )}
                  >
                    {STATUS_CHIP[selected.status].label}
                  </span>
                )}
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Star className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    selected.avatar.bg
                  )}
                >
                  <span
                    className={cn("font-semibold text-sm", selected.avatar.text)}
                  >
                    {selected.avatar.initials}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">
                      {selected.from}
                    </span>
                    {selected.broker && (
                      <span className="text-sm text-gray-500">
                        via {selected.broker}
                      </span>
                    )}
                    <span className="text-sm text-gray-400">
                      &lt;{selected.fromEmail}&gt;
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-400 mt-0.5">
                    <span>à moi</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </div>
                <span className="text-sm text-gray-400 shrink-0">
                  {selected.date}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl whitespace-pre-line text-sm text-gray-700 leading-relaxed">
                {selected.body}
              </div>

              {selected.attachments.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-600 mb-3">
                    {selected.attachments.length} pièce
                    {selected.attachments.length > 1 ? "s" : ""} jointe
                    {selected.attachments.length > 1 ? "s" : ""}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selected.attachments.map((att) => (
                      <div
                        key={att.name}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {att.name}
                          </p>
                          <p className="text-xs text-gray-400">{att.size}</p>
                        </div>
                        <Download className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-colors">
                <Reply className="w-4 h-4" />
                Répondre
              </button>
              {selected.dossierId && (
                <button
                  onClick={() => setShowForward(true)}
                  className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-medium"
                >
                  <Forward className="w-4 h-4" />
                  Transférer à Panora
                </button>
              )}
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-colors">
                <Clock className="w-4 h-4" />
                Rappel
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Inbox className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Sélectionnez un email pour le lire</p>
            </div>
          </div>
        )}
      </div>

      {/* Forward modal */}
      {showForward && selected?.dossierId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-[520px] overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900">
                  {"Transférer à l'assistant souscription"}
                </h3>
                <button
                  onClick={() => setShowForward(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-500">
                {"L'email et ses pièces jointes seront envoyés à Panora pour structurer la demande et détecter les informations manquantes."}
              </p>
            </div>

            <div className="p-5 space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">De</div>
                <div className="text-sm text-gray-700">
                  {selected.from}
                  {selected.broker ? ` (via ${selected.broker})` : ""} &lt;
                  {selected.fromEmail}&gt;
                </div>
              </div>
              <div className="bg-panora-green-light rounded-lg p-3">
                <div className="text-xs text-panora-green/70 mb-1">À</div>
                <div className="text-sm text-panora-green font-medium">
                  souscription+hiscox@panora.co
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Objet</div>
                <div className="text-sm text-gray-700">
                  Fwd: {selected.subject}
                </div>
              </div>
              {selected.attachments.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Pièces jointes</div>
                  <div className="space-y-1">
                    {selected.attachments.map((att) => (
                      <div
                        key={att.name}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                        <span>{att.name}</span>
                        <span className="text-xs text-gray-400">{att.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowForward(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSendForward}
                className="btn-primary flex items-center gap-2 px-5 py-2 text-sm font-medium"
              >
                <Send className="w-4 h-4" />
                Envoyer à Panora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
