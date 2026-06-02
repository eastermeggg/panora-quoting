"use client";

/**
 * Présenter tab — replaces the old Finaliser dropdown.
 *
 * Two modes:
 *  - default       : 3 fixed exports + custom-doc CTA + list of generated docs
 *  - preview mode  : selectedDocId is set → full-width doc preview with
 *                    prev/next navigation between generated docs
 */

import { ArrowLeft, ArrowRight, ArrowDownToLine, Copy, Check, Eye, FileSignature, Link as LinkIcon, Sparkles, Mail, Presentation, FileText, MessageSquarePlus, AlertCircle, ChevronLeft, Trash2 } from "lucide-react";
import { useState } from "react";
import { marked } from "marked";
import {
  docTypeFileLabel,
  isPreviewable,
  suggestFileName,
  type GeneratedDoc,
  type GeneratedDocType,
} from "@/data/generatedDocsStore";

function PdfIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <rect x="0.5" y="0.5" width="15" height="15" rx="2.5" fill="#E11D2A" />
      <text x="8" y="11" textAnchor="middle" fill="#ffffff" fontFamily="Inter, system-ui, sans-serif" fontSize="5.5" fontWeight="700" letterSpacing="0.04em">PDF</text>
    </svg>
  );
}
function WordIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <rect x="0.5" y="0.5" width="15" height="15" rx="2.5" fill="#2B579A" />
      <text x="8" y="11.5" textAnchor="middle" fill="#ffffff" fontFamily="Inter, system-ui, sans-serif" fontSize="9" fontWeight="700">W</text>
    </svg>
  );
}
function ExcelIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <rect x="0.5" y="0.5" width="15" height="15" rx="2.5" fill="#217346" />
      <text x="8" y="11.5" textAnchor="middle" fill="#ffffff" fontFamily="Inter, system-ui, sans-serif" fontSize="9" fontWeight="700">X</text>
    </svg>
  );
}

interface PresentationTabProps {
  clientName?: string;
  productLabel: string;
  presentationUrl?: string;
  onPreviewSynthesePDF: () => void;
  onDownloadSynthesePDF: () => void;
  onDownloadSyntheseDocx: () => void;
  onDownloadTableauXLS: () => void;
  onGenerateDevoirConseil?: () => void;
  onGenerateCustomDoc: (intent?: string) => void;
  /** Live list of docs generated for this cotation, in created-desc order. */
  generatedDocs: GeneratedDoc[];
  /** When set, the tab switches to preview mode for this doc. */
  selectedDocId: string | null;
  onSelectDoc: (docId: string | null) => void;
  onDownloadGeneratedDoc: (docId: string, fileName: string, body: string) => void;
  onDeleteGeneratedDoc: (docId: string) => void;
}

export function PresentationTab(props: PresentationTabProps) {
  const { selectedDocId, generatedDocs } = props;
  const selected = selectedDocId ? generatedDocs.find((d) => d.id === selectedDocId) : undefined;

  if (selected) {
    return <DocPreviewMode {...props} doc={selected} />;
  }
  return <DocBrowseMode {...props} />;
}

// ─── Browse mode: 3 fixed exports + custom doc CTA + generated docs list ──

function DocBrowseMode({
  clientName,
  presentationUrl = "#",
  onPreviewSynthesePDF,
  onDownloadSynthesePDF,
  onDownloadSyntheseDocx,
  onDownloadTableauXLS,
  onGenerateDevoirConseil,
  onGenerateCustomDoc,
  generatedDocs,
  onSelectDoc,
  onDownloadGeneratedDoc,
  onDeleteGeneratedDoc,
}: PresentationTabProps) {
  const [linkCopied, setLinkCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(presentationUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  return (
    <div className="flex-1 overflow-y-auto bg-panora-bg">
      <div className="max-w-[1040px] mx-auto px-10 pt-10 pb-12 flex flex-col gap-10">
        {/* Header */}
        <header className="flex flex-col gap-1.5">
          <h1 className="text-[24px] font-serif text-panora-text leading-[1.1] tracking-[-0.015em] max-w-[680px]">
            Présenter votre étude au client
          </h1>
          <p className="text-[13px] text-panora-text-secondary leading-[20px] max-w-[560px]">
            Choisissez parmi nos formats préfaits ou générez vos propres documents.
          </p>
        </header>

        {/* Pre-made exports — compact 4-card row */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Synthèse — slightly emphasized with green accent */}
          <article className="relative rounded-xl bg-white p-3.5 flex flex-col gap-2.5 border border-panora-border shadow-xs overflow-hidden">
            <div className="absolute left-0 top-3.5 bottom-3.5 w-[2px] rounded-r-full bg-panora-green/70" aria-hidden />
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-9 h-9 rounded-[8px] border border-panora-border bg-panora-bg/60 flex items-center justify-center shrink-0">
                <PdfIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <p className="text-[13px] font-semibold text-panora-text leading-[18px] truncate">Synthèse client</p>
              </div>
            </div>
            <p className="text-[12px] text-panora-text-muted leading-[16px] line-clamp-2 pl-1">
              Dossier signable et brandé.
            </p>
            <div className="mt-auto flex items-center gap-1">
              <button onClick={onPreviewSynthesePDF} className="inline-flex items-center justify-center w-7 h-7 rounded-[6px] border border-panora-border bg-white text-panora-text-muted hover:bg-panora-bg hover:text-panora-text transition-colors shrink-0" aria-label="Aperçu" title="Aperçu PDF">
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button onClick={onDownloadSynthesePDF} className="flex-1 inline-flex items-center justify-center gap-1 h-7 px-2 rounded-[6px] text-[11px] font-semibold border border-panora-border bg-white text-panora-text hover:bg-panora-error-bg hover:border-panora-error-bg hover:text-panora-error transition-colors">
                <PdfIcon className="w-3 h-3" />
                PDF
              </button>
              <button onClick={onDownloadSyntheseDocx} className="inline-flex items-center justify-center w-7 h-7 rounded-[6px] border border-panora-border bg-white text-panora-text hover:bg-[#e9f0f9] hover:border-[#e9f0f9] hover:text-[#1a3a52] transition-colors shrink-0" aria-label="DOCX" title="Télécharger DOCX">
                <WordIcon className="w-3 h-3" />
              </button>
            </div>
          </article>

          {/* Tableau */}
          <article className="rounded-xl bg-white p-3.5 flex flex-col gap-2.5 border border-panora-border shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[8px] border border-panora-border bg-panora-bg/60 flex items-center justify-center shrink-0">
                <ExcelIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <p className="text-[13px] font-semibold text-panora-text leading-[18px] truncate">Tableau comparatif</p>
              </div>
            </div>
            <p className="text-[12px] text-panora-text-muted leading-[16px] line-clamp-2">
              Garanties et exclusions, à plat.
            </p>
            <button onClick={onDownloadTableauXLS} className="mt-auto w-full inline-flex items-center justify-center gap-1 h-7 px-2 rounded-[6px] text-[11px] font-medium border border-panora-border bg-white text-panora-text hover:bg-[#dff0e3] hover:border-[#dff0e3] hover:text-[#1a5236] transition-colors">
              <ExcelIcon className="w-3 h-3" />
              Télécharger
            </button>
          </article>

          {/* Lien partage */}
          <article className="rounded-xl bg-white p-3.5 flex flex-col gap-2.5 border border-panora-border shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[8px] border border-panora-border bg-panora-bg/60 flex items-center justify-center shrink-0">
                <LinkIcon className="w-4 h-4 text-panora-text-secondary" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <p className="text-[13px] font-semibold text-panora-text leading-[18px] truncate">Lien partage</p>
              </div>
            </div>
            <p className="text-[12px] text-panora-text-muted leading-[16px] line-clamp-2">
              URL à envoyer au client.
            </p>
            <div className="mt-auto flex items-center gap-1">
              <a
                href={presentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-7 h-7 rounded-[6px] border border-panora-border bg-white text-panora-text-muted hover:bg-panora-bg hover:text-panora-text transition-colors shrink-0"
                aria-label="Aperçu"
                title="Voir l'aperçu"
              >
                <Eye className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={copyLink}
                className={`flex-1 inline-flex items-center justify-center gap-1 h-7 px-2 rounded-[6px] text-[11px] font-medium border transition-colors ${linkCopied ? "bg-panora-green border-panora-green text-white" : "border-panora-border bg-white text-panora-text hover:bg-panora-bg"}`}
                aria-label="Copier le lien"
              >
                {linkCopied ? <><Check className="w-3 h-3" />Copié</> : <><Copy className="w-3 h-3" />Copier</>}
              </button>
            </div>
          </article>

          {/* Devoir de conseil */}
          {onGenerateDevoirConseil && (
            <article className="rounded-xl bg-white p-3.5 flex flex-col gap-2.5 border border-panora-border shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[8px] border border-panora-border bg-panora-bg/60 flex items-center justify-center shrink-0">
                  <FileSignature className="w-4 h-4 text-panora-text-secondary" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <p className="text-[13px] font-semibold text-panora-text leading-[18px] truncate">Devoir de conseil</p>
                </div>
              </div>
              <p className="text-[12px] text-panora-text-muted leading-[16px] line-clamp-2">
                Document réglementaire signable.
              </p>
              <button
                onClick={onGenerateDevoirConseil}
                className="mt-auto w-full inline-flex items-center justify-center gap-1 h-7 px-2 rounded-[6px] text-[11px] font-medium border border-panora-border bg-white text-panora-text hover:bg-panora-bg transition-colors"
              >
                <FileSignature className="w-3 h-3" />
                Générer
              </button>
            </article>
          )}
        </section>

        {/* Custom doc — empty state only (no generated docs yet) */}
        {generatedDocs.length === 0 ? (
          <section
            className="relative overflow-hidden rounded-2xl p-7 flex flex-col gap-5 border border-panora-border shadow-xs"
            style={{
              background: `
                radial-gradient(120% 100% at 100% 0%, rgba(0, 162, 114, 0.10), transparent 55%),
                radial-gradient(100% 90% at 0% 100%, rgba(203, 128, 82, 0.07), transparent 60%),
                linear-gradient(180deg, #ffffff 0%, #fbfaf6 100%)
              `,
            }}
          >
            <div className="relative flex flex-col gap-3 max-w-[620px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-panora-green/80">
                Atelier
              </p>
              <h2 className="text-[22px] font-serif text-panora-text leading-tight tracking-[-0.01em]">
                Créer un document personnalisé
              </h2>
              <p className="text-[13px] text-panora-text-secondary leading-[20px]">
                E-mail, présentation, synthèse interne, support de réunion — Panora vous pose les bonnes questions et génère un brouillon à partir de votre modèle.
              </p>
            </div>

            <div className="relative flex flex-col gap-3">
              <button onClick={() => onGenerateCustomDoc()} className="btn-primary self-start inline-flex items-center gap-2 px-5 h-10 text-[13px] font-semibold">
                <MessageSquarePlus className="w-4 h-4" />
                Générer un document avec l&apos;agent
              </button>
              <div className="flex flex-wrap gap-2 pt-1">
                <Suggestion icon={Mail} label="E-mail au client" onClick={() => onGenerateCustomDoc("Rédige un e-mail au client présentant la cotation")} />
                <Suggestion icon={Presentation} label="Présentation PowerPoint" onClick={() => onGenerateCustomDoc("Génère une présentation PowerPoint pour le client")} />
                <Suggestion icon={FileText} label="Synthèse interne" onClick={() => onGenerateCustomDoc("Synthèse interne courte pour mon équipe")} />
                <Suggestion icon={Sparkles} label="Autre document" onClick={() => onGenerateCustomDoc()} />
              </div>
            </div>
          </section>
        ) : (
          /* Generated docs list — collapses Atelier to a header row with "Nouveau document" CTA */
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[22px] font-serif text-panora-text leading-tight tracking-[-0.01em]">
                Documents générés
              </h2>
              <button
                onClick={() => onGenerateCustomDoc()}
                className="btn-primary inline-flex items-center gap-1.5 h-9 px-3.5 text-[12.5px] font-semibold"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                Nouveau document
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {generatedDocs.map((doc) => (
                <GeneratedDocRow
                  key={doc.id}
                  doc={doc}
                  clientName={clientName ?? "Client"}
                  onOpen={() => onSelectDoc(doc.id)}
                  onDownload={() => onDownloadGeneratedDoc(doc.id, suggestFileName(doc.docType, clientName ?? "Client"), doc.body)}
                  onDelete={() => onDeleteGeneratedDoc(doc.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ─── Preview mode ─────────────────────────────────────────────────────

function DocPreviewMode({
  doc,
  generatedDocs,
  clientName,
  onSelectDoc,
  onDownloadGeneratedDoc,
}: PresentationTabProps & { doc: GeneratedDoc }) {
  const idx = generatedDocs.findIndex((d) => d.id === doc.id);
  const prev = idx > 0 ? generatedDocs[idx - 1] : null;
  const next = idx >= 0 && idx < generatedDocs.length - 1 ? generatedDocs[idx + 1] : null;
  const fileName = suggestFileName(doc.docType, clientName ?? "Client");
  const previewable = isPreviewable(doc.docType);
  const hasSiblings = generatedDocs.length > 1;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      {/* Preview area — full width, no sidebar */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header bar */}
        <header className="h-[52px] shrink-0 border-b border-panora-border bg-white px-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => onSelectDoc(null)}
              className="inline-flex items-center gap-1 text-[12px] text-panora-text-muted hover:text-panora-text transition-colors shrink-0"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Retour
            </button>
            <span className="w-px h-4 bg-panora-border shrink-0" />
            <h2 className="text-[13px] font-semibold text-panora-text truncate">
              {fileName}
            </h2>
            <span className="text-[11px] text-panora-text-muted shrink-0">
              {docTypeFileLabel(doc.docType)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {hasSiblings && (
              <>
                <button
                  onClick={() => prev && onSelectDoc(prev.id)}
                  disabled={!prev}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-panora-border bg-white text-panora-text-muted hover:text-panora-text hover:bg-panora-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Document précédent"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => next && onSelectDoc(next.id)}
                  disabled={!next}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-panora-border bg-white text-panora-text-muted hover:text-panora-text hover:bg-panora-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Document suivant"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="w-px h-4 bg-panora-border mx-1" />
              </>
            )}
            <button
              onClick={() => onDownloadGeneratedDoc(doc.id, fileName, doc.body)}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-panora-text text-white text-[12px] font-medium hover:opacity-90 transition-opacity"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              Télécharger
            </button>
          </div>
        </header>

        {/* Body — same layout as synthèse: white root, centered 760px column, .synthese-doc typography */}
        <div className="flex-1 overflow-y-auto bg-white">
          {previewable ? (
            <div className="max-w-[760px] mx-auto px-10 pt-8 pb-12">
              <div className="flex flex-col gap-1.5 pb-5 mb-6 border-b border-panora-border">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-panora-text-secondary">
                  {docTypeFileLabel(doc.docType)}
                </span>
                <h2 className="text-[20px] font-serif text-panora-text leading-tight tracking-[-0.01em]">
                  {fileName}
                </h2>
              </div>
              <div
                className="synthese-doc"
                dangerouslySetInnerHTML={{ __html: marked.parse(doc.body, { async: false }) as string }}
              />
            </div>
          ) : (
            <div className="max-w-[760px] mx-auto px-10 pt-12 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-panora-bg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-panora-text-muted" />
              </div>
              <p className="text-[14px] font-medium text-panora-text">
                Aperçu non disponible pour ce type
              </p>
              <p className="text-[12.5px] text-panora-text-muted text-center max-w-[360px]">
                Les présentations PowerPoint se téléchargent directement — l&apos;aperçu en ligne arrive plus tard.
              </p>
              <button
                onClick={() => onDownloadGeneratedDoc(doc.id, fileName, doc.body)}
                className="btn-primary mt-2 inline-flex items-center gap-1.5 h-9 px-4 text-[13px] font-semibold"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                Télécharger {fileName}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────

function Suggestion({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Mail;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 h-8 px-3 rounded-full border border-panora-border bg-white text-[13px] text-panora-text hover:bg-panora-bg/40 hover:border-panora-text-secondary/30 transition-colors"
    >
      <Icon className="w-3.5 h-3.5 text-panora-text-secondary" />
      {label}
    </button>
  );
}

function GeneratedDocRow({
  doc,
  clientName,
  onOpen,
  onDownload,
  onDelete,
}: {
  doc: GeneratedDoc;
  clientName: string;
  onOpen: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  const fileName = suggestFileName(doc.docType, clientName);
  const typeLabel = docTypeFileLabel(doc.docType);
  const date = new Date(doc.createdAt).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (window.confirm(`Supprimer « ${fileName} » ?`)) onDelete();
  }
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      className="group/doc flex items-stretch w-full bg-white rounded-lg border border-panora-border shadow-xs overflow-hidden hover:border-panora-text-secondary/40 transition-colors text-left cursor-pointer"
    >
      <div className="flex flex-col items-stretch justify-end shrink-0 pb-px pt-2.5 px-3.5">
        <div className="flex items-center justify-center p-3 rounded-tl-[6px] rounded-tr-[8px] border-l border-r border-t border-panora-border bg-gradient-to-b from-transparent to-panora-bg shadow-xs w-[36px]">
          <RowGlyph docType={doc.docType} />
        </div>
      </div>
      <div className="flex-1 min-w-0 flex items-center gap-1.5 pl-2.5 pr-3 py-2.5">
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <p className="text-[13px] font-medium leading-5 text-panora-text truncate">{fileName}</p>
          <p className="text-[12px] leading-4 text-panora-text-muted truncate">
            {typeLabel} · {date}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/doc:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center justify-center w-6 h-6 rounded-[6px] border border-panora-border bg-white text-panora-text-muted hover:bg-panora-error-bg hover:border-panora-error/20 hover:text-panora-error transition-colors"
            aria-label={`Supprimer ${fileName}`}
            title="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDownload(); }}
            className="flex items-center justify-center w-6 h-6 rounded-[6px] bg-panora-text text-white hover:opacity-90 transition-opacity"
            aria-label={`Télécharger ${fileName}`}
            title="Télécharger"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function RowGlyph({ docType }: { docType: GeneratedDocType }) {
  if (docType === "ppt") return <PptGlyph />;
  if (docType === "lettre" || docType === "synthese_interne") return <WordIcon className="w-3.5 h-3.5" />;
  if (docType === "sms") return <SmsGlyph />;
  return <EmailGlyph />;
}

function PptGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" aria-hidden>
      <rect x="0.5" y="0.5" width="15" height="15" rx="2.5" fill="#D24726" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontFamily="Inter, system-ui, sans-serif" fontSize="9" fontWeight="700">P</text>
    </svg>
  );
}
function SmsGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" aria-hidden>
      <rect x="0.5" y="0.5" width="15" height="15" rx="2.5" fill="#00a272" />
      <text x="8" y="11" textAnchor="middle" fill="#fff" fontFamily="Inter, system-ui, sans-serif" fontSize="5.5" fontWeight="700">SMS</text>
    </svg>
  );
}
function EmailGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" aria-hidden>
      <rect x="0.5" y="0.5" width="15" height="15" rx="2.5" fill="#0078D4" />
      <path d="M3 5h10v6H3z" fill="#fff" />
      <path d="M3 5l5 3.5L13 5" stroke="#0078D4" strokeWidth="1" fill="none" />
    </svg>
  );
}
