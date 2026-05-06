"use client";

import { useRef, useState, type DragEvent } from "react";
import { CloudUpload, FileSearch, LayoutGrid, Palette, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FileFormat } from "@/data/templates-mock";
import type { UploadedFile } from "./TemplateUploadZone";

const FORMAT_BY_EXT: Record<string, FileFormat> = {
  pdf: "pdf",
  docx: "docx",
  pptx: "pptx",
};

interface TemplatesOnboardingProps {
  onFiles: (files: UploadedFile[]) => void;
}

export function TemplatesOnboarding({ onFiles }: TemplatesOnboardingProps) {
  return (
    <div className="flex flex-col gap-10">
      <BigDropZone onFiles={onFiles} />
      <HowItWorks />
    </div>
  );
}

// ── Hero drop zone ────────────────────────────────────────────────

function BigDropZone({ onFiles }: { onFiles: (files: UploadedFile[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files: UploadedFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const format = FORMAT_BY_EXT[ext];
      if (!format) continue;
      files.push({ name: file.name, format, size: file.size });
    }
    if (files.length > 0) onFiles(files);
  }

  return (
    <div
      onDragOver={(e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "rounded-[20px] border-2 border-dashed cursor-pointer transition-all duration-200 px-12 py-20",
        "bg-gradient-to-b from-[rgba(34,32,26,0.04)] via-[rgba(0,162,114,0.025)] to-transparent",
        dragOver
          ? "border-panora-green bg-panora-green/[0.07] scale-[1.005]"
          : "border-panora-border hover:border-panora-text-muted"
      )}
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <div
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-colors shadow-[0px_2px_4px_rgba(0,0,0,0.06)]",
            dragOver
              ? "bg-panora-green text-white"
              : "bg-white border border-panora-border text-panora-green"
          )}
        >
          <CloudUpload className="w-7 h-7" />
        </div>
        <div className="flex flex-col gap-1.5 max-w-[420px]">
          <p className="text-[20px] font-serif text-panora-text leading-[26px]">
            Glissez vos modèles
          </p>
          <p className="text-[12px] text-panora-text-muted leading-[18px]">
            PDF, DOCX, PPTX · plusieurs fichiers à la fois.
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          className="btn-primary inline-flex items-center gap-2 px-5 h-[40px] text-[13px] font-semibold"
        >
          <CloudUpload className="w-4 h-4" />
          Choisir des fichiers
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.pptx"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ── How it works — video + 3-step explainer ───────────────────────

function HowItWorks() {
  return (
    <section className="flex flex-col gap-5">
      <h3 className="text-[16px] font-serif text-panora-text leading-6">
        Comment ça marche
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-6 items-start">
        <VideoCard />

        <ol className="flex flex-col gap-3">
          <Step
            n={1}
            icon={<Palette className="w-4 h-4" />}
            title="Branding"
            body="Logo, palette, typographies."
          />
          <Step
            n={2}
            icon={<LayoutGrid className="w-4 h-4" />}
            title="Structure"
            body="Sections, ordre, ton du modèle."
          />
          <Step
            n={3}
            icon={<FileSearch className="w-4 h-4" />}
            title="Contenu"
            body="Synthèse, tableau, données extraites des devis."
          />
        </ol>
      </div>
    </section>
  );
}

function Step({
  n,
  icon,
  title,
  body,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-4">
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-lg bg-panora-green/10 text-panora-green flex items-center justify-center">
          {icon}
        </div>
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-panora-border text-[10px] font-semibold text-panora-text-secondary flex items-center justify-center tabular-nums">
          {n}
        </span>
      </div>
      <div className="flex flex-col gap-0.5 min-w-0 pt-1.5">
        <p className="text-[14px] font-semibold text-panora-text leading-5">{title}</p>
        <p className="text-[13px] text-panora-text-secondary leading-[20px]">{body}</p>
      </div>
    </li>
  );
}

function VideoCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-[#0e2a3f] via-[#1a3a52] to-[#0e2a3f] shadow-[0px_8px_24px_rgba(14,42,63,0.18),0px_2px_4px_rgba(0,0,0,0.06)] cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
      >
        {/* Decorative ambient blobs */}
        <span className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-panora-green/15 blur-3xl pointer-events-none" />
        <span className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[#c9a86a]/10 blur-2xl pointer-events-none" />

        {/* Faux UI screenshot — abstract chrome to suggest a Panora demo */}
        <div className="absolute inset-6 rounded-lg bg-white/[0.04] border border-white/10 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-6 bg-white/[0.06] border-b border-white/10 flex items-center px-2 gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
          </div>
          <div className="absolute inset-0 mt-7 px-3 py-2 flex flex-col gap-1.5">
            <span className="h-2 w-2/5 rounded bg-white/30" />
            <span className="h-1.5 w-3/5 rounded bg-white/15" />
            <span className="h-1.5 w-2/5 rounded bg-white/15" />
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              <span className="h-8 rounded bg-white/[0.08]" />
              <span className="h-8 rounded bg-white/[0.08]" />
              <span className="h-8 rounded bg-white/[0.12] ring-1 ring-panora-green/40" />
            </div>
          </div>
        </div>

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="relative w-16 h-16 rounded-full bg-white shadow-[0px_8px_24px_rgba(0,0,0,0.3)] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <span className="absolute inset-0 rounded-full bg-white/30 animate-ping pointer-events-none" />
            <Play className="w-6 h-6 text-panora-text translate-x-0.5" fill="currentColor" strokeWidth={0} />
          </span>
        </div>

        {/* Caption */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent flex items-baseline gap-2">
          <span className="text-[10px] uppercase tracking-[0.1em] font-semibold text-white/60">
            Démo · 60 s
          </span>
          <span className="text-[13px] font-serif text-white">
            Du modèle au document client
          </span>
        </div>
      </button>

      {open && <VideoModal onClose={() => setOpen(false)} />}
    </>
  );
}

function VideoModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-[920px] mx-6 bg-[#0e2a3f] rounded-2xl shadow-[0px_24px_60px_rgba(0,0,0,0.4)] overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <span className="text-[13px] font-medium text-white/80">
            Démo · Panora — du modèle au document client
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 inline-flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="aspect-video flex items-center justify-center text-white/70 text-[14px] bg-gradient-to-br from-[#0e2a3f] via-[#1a3a52] to-[#0e2a3f] relative">
          <span className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-panora-green/20 blur-3xl" />
          <span className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-[#c9a86a]/15 blur-3xl" />
          <div className="relative flex flex-col items-center gap-3">
            <Play className="w-12 h-12 text-white/60" fill="currentColor" strokeWidth={0} />
            <p className="text-[14px] font-serif">Démo prochainement</p>
            <p className="text-[12px] text-white/50 max-w-[360px] text-center">
              Cette vidéo sera disponible une fois Panora connecté à votre cabinet.
              En attendant, déposez un modèle pour voir le résultat sur un cas réel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
