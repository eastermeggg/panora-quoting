"use client";

import { useRef, useState, type DragEvent } from "react";
import { CloudUpload } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FileFormat } from "@/data/templates-mock";

const FORMAT_BY_EXT: Record<string, FileFormat> = {
  pdf: "pdf",
  docx: "docx",
  pptx: "pptx",
};

const ACCEPT_ATTR = ".pdf,.docx,.pptx";

export type UploadedFile = { name: string; format: FileFormat; size: number };

interface TemplateUploadZoneProps {
  /** Single-file callback (legacy — still works) */
  onFile?: (file: UploadedFile) => void;
  /** Multi-file callback. If provided, the input accepts multiple files and the dropped files are batched. */
  onFiles?: (files: UploadedFile[]) => void;
  compact?: boolean;
}

export function TemplateUploadZone({ onFile, onFiles, compact = false }: TemplateUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const multiple = !!onFiles;

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
    if (files.length === 0) return;
    if (onFiles) {
      onFiles(files);
    } else if (onFile) {
      // Fall back to single-file mode
      files.forEach((f) => onFile(f));
    }
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(true);
  }

  function onDragLeave() {
    setDragOver(false);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "rounded-[12px] border-2 border-dashed bg-gradient-to-b from-[rgba(34,32,26,0.05)] to-transparent flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors",
        dragOver ? "border-panora-green bg-panora-green/5" : "border-panora-border hover:border-panora-text-muted",
        compact ? "px-4 py-5" : "px-6 py-8"
      )}
    >
      <CloudUpload className={cn(compact ? "w-6 h-6" : "w-7 h-7", "text-panora-text-muted")} />
      <span className="text-[13px] text-panora-text-muted text-center">
        Glissez {multiple ? "vos fichiers" : "un fichier"} ici ou
      </span>
      <span className="text-[13px] font-medium text-panora-green">
        {multiple ? "+ Choisir des fichiers" : "+ Choisir un fichier"}
      </span>
      <span className="text-[11px] text-panora-text-muted">
        PDF, DOCX, PPTX
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
