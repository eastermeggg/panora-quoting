"use client";

import { useRef, useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import type { AnalysisData, InsurerData, ComparisonData } from "@/data/mock";
import { InsurerLogo } from "@/components/ui/InsurerLogo";

// ─── Types ──────────────────────────────────────────────────────────

type PromptId = "ecarts" | "recommandation" | "argumentaire";

const PROMPTS: { id: PromptId; label: string }[] = [
  { id: "ecarts", label: "Fais-moi une synthèse des écarts de garanties entre les offres." },
  { id: "recommandation", label: "Quels sont les points forts et les angles morts de l'offre recommandée ?" },
  { id: "argumentaire", label: "Quels arguments utiliser face au client pour justifier la meilleure offre ?" },
];

interface AnalysisTabProps {
  analysisData: AnalysisData | undefined;
  insurers: InsurerData[];
  offerCount: number;
  comparisonData?: ComparisonData;
  onSwitchToComparison: () => void;
  onOpenProfile: () => void;
  onUpdateAnalysis?: (updated: AnalysisData) => void;
  isStreaming?: boolean;
  onStreamingDone?: () => void;
  hasClientProfile?: boolean;
  isPanelOpen?: boolean;
}

// ─── Markdown generator from analysis data ──────────────────────────

function generateMarkdown(promptId: PromptId, data: AnalysisData, insurers: InsurerData[]): string {
  if (promptId === "ecarts") {
    let md = `## Synthèse des écarts de garanties\n\n`;
    md += `${data.resumeExecutif}\n\n`;
    md += `---\n\n`;
    md += `### Conditions financières\n\n`;
    md += `${data.conditionsFinancieres.analysisBefore}\n\n`;
    md += `${data.conditionsFinancieres.analysisAfter}\n\n`;
    md += `---\n\n`;
    md += `### Analyse par offre\n\n`;
    // Build a comparative table for points forts / points faibles
    const maxForts = Math.max(...data.analyseParOffre.map((o) => o.pointsForts.length));
    const maxFaibles = Math.max(...data.analyseParOffre.map((o) => o.pointsFaibles.length));
    md += `| | ${data.analyseParOffre.map((o) => o.insurerName).join(" | ")} |\n`;
    md += `| --- | ${data.analyseParOffre.map(() => "---").join(" | ")} |\n`;
    for (let r = 0; r < maxForts; r++) {
      const label = r === 0 ? "**Points forts**" : "";
      const cells = data.analyseParOffre.map((o) => o.pointsForts[r] ? `✓ ${o.pointsForts[r]}` : "");
      md += `| ${label} | ${cells.join(" | ")} |\n`;
    }
    for (let r = 0; r < maxFaibles; r++) {
      const label = r === 0 ? "**Points faibles**" : "";
      const cells = data.analyseParOffre.map((o) => o.pointsFaibles[r] ? `✗ ${o.pointsFaibles[r]}` : "");
      md += `| ${label} | ${cells.join(" | ")} |\n`;
    }
    md += `\n`;
    if (data.garantiesCles.length > 0) {
      md += `---\n\n`;
      md += `### Garanties clés\n\n`;
      const insIds = insurers.map((i) => i.id);
      md += `| Garantie | ${insurers.map((i) => i.name).join(" | ")} |\n`;
      md += `| --- | ${insurers.map(() => "---").join(" | ")} |\n`;
      for (const g of data.garantiesCles) {
        const cells = insIds.map((id) => {
          const v = g.values[id];
          if (!v) return "—";
          const icon = v.status === "covered" ? "✓" : "✗";
          return v.keyInfo ? `${icon} ${v.keyInfo}` : icon;
        });
        md += `| ${g.label} | ${cells.join(" | ")} |\n`;
      }
    }
    return md;
  }

  if (promptId === "recommandation") {
    // Find the "recommended" insurer (first one mentioned in resume or first in analyseParOffre)
    const recommended = data.analyseParOffre[0];
    const others = data.analyseParOffre.slice(1);
    let md = `## Points forts et angles morts de l'offre recommandée\n\n`;
    md += `### ${recommended.insurerName} — Offre recommandée\n\n`;
    md += `${data.resumeExecutif}\n\n`;
    md += `---\n\n`;
    md += `### Points forts\n\n`;
    for (const p of recommended.pointsForts) md += `- ${p}\n`;
    md += `\n### Angles morts et points de vigilance\n\n`;
    for (const p of recommended.pointsFaibles) md += `- ${p}\n`;
    if (others.length > 0) {
      md += `\n---\n\n`;
      md += `### Comparaison avec les alternatives\n\n`;
      md += `| Assureur | Atout principal | Limite principale |\n`;
      md += `| --- | --- | --- |\n`;
      for (const offre of others) {
        const mainStrength = offre.pointsForts[0] ?? "Aucun avantage notable";
        const mainWeakness = offre.pointsFaibles[0] ?? "Aucune faiblesse majeure";
        md += `| **${offre.insurerName}** | ${mainStrength} | ${mainWeakness} |\n`;
      }
      md += `\n`;
    }
    md += `---\n\n`;
    md += `### Conditions financières\n\n`;
    md += `${data.conditionsFinancieres.analysisBefore}\n\n`;
    md += `${data.conditionsFinancieres.analysisAfter}`;
    return md;
  }

  // argumentaire
  const best = data.analyseParOffre[0];
  let md = `## Argumentaire client — ${best.insurerName}\n\n`;
  md += `### Pourquoi cette offre ?\n\n`;
  md += `${data.resumeExecutif}\n\n`;
  md += `---\n\n`;
  md += `### Arguments clés à présenter\n\n`;
  for (let i = 0; i < best.pointsForts.length; i++) {
    md += `${i + 1}. **${best.pointsForts[i]}**\n`;
  }
  md += `\n### Points à anticiper en objection\n\n`;
  for (const p of best.pointsFaibles) {
    md += `- ${p}\n`;
  }
  md += `\n---\n\n`;
  md += `### Positionnement tarifaire\n\n`;
  md += `${data.conditionsFinancieres.analysisBefore}\n\n`;
  md += `${data.conditionsFinancieres.analysisAfter}\n\n`;
  if (data.analyseParOffre.length > 1) {
    md += `---\n\n`;
    md += `### Face à la concurrence\n\n`;
    for (const offre of data.analyseParOffre.slice(1)) {
      md += `**Si le client mentionne ${offre.insurerName} :**\n`;
      if (offre.pointsFaibles.length > 0) {
        md += `- Faiblesse à souligner : ${offre.pointsFaibles[0]}\n`;
      }
      if (best.pointsForts.length > 0) {
        md += `- Notre avantage : ${best.pointsForts[0]}\n`;
      }
      md += `\n`;
    }
  }
  return md;
}

// ─── Streaming text renderer ────────────────────────────────────────

function StreamingMarkdown({
  markdown,
  active,
  onComplete,
}: {
  markdown: string;
  active: boolean;
  onComplete?: () => void;
}) {
  const [charCount, setCharCount] = useState(markdown.length);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) {
      setCharCount(markdown.length);
      return;
    }
    setCharCount(0);
    let i = 0;
    const interval = setInterval(() => {
      i += 4;
      if (i >= markdown.length) {
        i = markdown.length;
        clearInterval(interval);
        onCompleteRef.current?.();
      }
      setCharCount(i);
    }, 6);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, markdown]);

  const displayed = active ? markdown.slice(0, charCount) : markdown;
  const showCursor = active && charCount < markdown.length;

  return (
    <div className="prose-panora">
      <MarkdownRenderer text={displayed} />
      {showCursor && <span className="inline-block w-[5px] h-[13px] bg-panora-green/50 ml-[1px] animate-pulse rounded-sm align-middle" />}
    </div>
  );
}

// ─── Simple markdown renderer ───────────────────────────────────────

function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let tableLines: string[] = [];
  let listItems: string[] = [];
  let numberedItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="space-y-1 mb-4">
          {listItems.map((item, i) => (
            <li key={i} className="text-[14px] leading-6 text-panora-text flex gap-2">
              <span className="text-panora-text-muted mt-0.5 shrink-0">•</span>
              <span><InlineMarkdown text={item} /></span>
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const flushNumbered = () => {
    if (numberedItems.length > 0) {
      elements.push(
        <ol key={`ol-${elements.length}`} className="space-y-2 mb-4">
          {numberedItems.map((item, i) => (
            <li key={i} className="text-[14px] leading-6 text-panora-text flex gap-2">
              <span className="text-panora-green font-semibold shrink-0">{i + 1}.</span>
              <span><InlineMarkdown text={item} /></span>
            </li>
          ))}
        </ol>
      );
      numberedItems = [];
    }
  };

  const flushTable = () => {
    if (tableLines.length < 2) { tableLines = []; return; }
    const headers = tableLines[0].split("|").filter(Boolean).map((s) => s.trim());
    const rows = tableLines.slice(2).map((l) => l.split("|").filter(Boolean).map((s) => s.trim()));
    elements.push(
      <div key={`table-${elements.length}`} className="overflow-x-auto mb-4 border border-panora-border rounded-[8px]">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#faf8f5] border-b border-panora-border">
              {headers.map((h, i) => (
                <th key={i} className={`px-3 py-2.5 text-left font-medium text-panora-text ${i > 0 ? "border-l border-panora-border" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={ri < rows.length - 1 ? "border-b border-panora-border" : ""}>
                {row.map((cell, ci) => {
                  const isCheck = cell === "✓";
                  const isCross = cell === "✗";
                  const hasCheck = cell.startsWith("✓");
                  const hasCross = cell.startsWith("✗");
                  return (
                    <td key={ci} className={`px-3 py-2.5 text-panora-text ${ci > 0 ? "border-l border-panora-border" : ""}`}>
                      {isCheck ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#dbeee5]"><span className="text-panora-green text-[11px] font-bold">✓</span></span>
                      ) : isCross ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#fde8e8]"><span className="text-[#952617] text-[11px] font-bold">✗</span></span>
                      ) : hasCheck ? (
                        <span className="flex items-center gap-1.5">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#dbeee5] shrink-0"><span className="text-panora-green text-[11px] font-bold">✓</span></span>
                          <span className="text-panora-text-muted text-[11px]">{cell.slice(2)}</span>
                        </span>
                      ) : hasCross ? (
                        <span className="flex items-center gap-1.5">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#fde8e8] shrink-0"><span className="text-[#952617] text-[11px] font-bold">✗</span></span>
                          <span className="text-panora-text-muted text-[11px]">{cell.slice(2)}</span>
                        </span>
                      ) : (
                        cell
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table line
    if (line.startsWith("|")) {
      flushList();
      flushNumbered();
      tableLines.push(line);
      continue;
    } else if (tableLines.length > 0) {
      flushTable();
    }

    // Heading
    if (line.startsWith("#### ")) {
      flushList(); flushNumbered();
      elements.push(<h4 key={`h4-${i}`} className="text-[14px] font-semibold text-panora-text mt-5 mb-2">{line.slice(5)}</h4>);
      continue;
    }
    if (line.startsWith("### ")) {
      flushList(); flushNumbered();
      const txt = line.slice(4);
      elements.push(<h3 key={`h3-${i}`} id={slugify(txt)} className="text-[15px] font-serif font-semibold text-panora-text mt-6 mb-3 scroll-mt-8">{txt}</h3>);
      continue;
    }
    if (line.startsWith("## ")) {
      flushList(); flushNumbered();
      const txt = line.slice(3);
      elements.push(<h2 key={`h2-${i}`} id={slugify(txt)} className="text-[18px] font-serif font-semibold text-panora-text mb-4 scroll-mt-8">{txt}</h2>);
      continue;
    }

    // HR
    if (line === "---") {
      flushList(); flushNumbered();
      elements.push(<hr key={`hr-${i}`} className="border-panora-border my-6" />);
      continue;
    }

    // Unordered list
    if (line.startsWith("- ")) {
      flushNumbered();
      listItems.push(line.slice(2));
      continue;
    } else if (listItems.length > 0) {
      flushList();
    }

    // Ordered list
    const olMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (olMatch) {
      flushList();
      numberedItems.push(olMatch[2]);
      continue;
    } else if (numberedItems.length > 0) {
      flushNumbered();
    }

    // Empty line
    if (!line.trim()) continue;

    // Paragraph
    elements.push(<p key={`p-${i}`} className="text-[14px] leading-6 text-panora-text mb-4"><InlineMarkdown text={line} /></p>);
  }

  flushList();
  flushNumbered();
  flushTable();

  return <>{elements}</>;
}

/** Renders **bold** inline */
function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ─── Table of contents extraction ──────────────────────────────────

function extractToc(markdown: string): { id: string; label: string; level: number }[] {
  const toc: { id: string; label: string; level: number }[] = [];
  for (const line of markdown.split("\n")) {
    if (line.startsWith("### ")) {
      const label = line.slice(4);
      toc.push({ id: slugify(label), label, level: 3 });
    } else if (line.startsWith("## ")) {
      const label = line.slice(3);
      toc.push({ id: slugify(label), label, level: 2 });
    }
  }
  return toc;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─── Empty state with prompts ───────────────────────────────────────

function EmptyState({ onSelectPrompt }: { onSelectPrompt: (id: PromptId) => void }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#f5f4f1]">
      <div className="max-w-[480px] w-full text-center">
        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-[#dbeee5] flex items-center justify-center mx-auto mb-5">
          <Sparkles className="w-5 h-5 text-panora-green" />
        </div>

        {/* Title */}
        <h2 className="text-[22px] font-serif font-semibold text-panora-text mb-2">
          Synthèse assistée
        </h2>
        <p className="text-[14px] text-panora-text-muted leading-6 mb-8">
          Demande à l&apos;IA une analyse croisée des offres, un résumé pour le client ou un argumentaire de vente basé sur cette comparaison.
        </p>

        {/* Prompt buttons */}
        <div className="space-y-3 text-left">
          {PROMPTS.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => onSelectPrompt(prompt.id)}
              className="w-full px-4 py-3.5 bg-white border border-panora-border rounded-[10px] text-[14px] text-panora-text leading-5 text-left hover:border-panora-green/40 hover:shadow-[0_2px_8px_rgba(0,162,114,0.06)] transition-all"
            >
              {prompt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Generation loading state ───────────────────────────────────────

function GeneratingState() {
  return (
    <div className="flex items-center gap-2 px-10 py-6">
      <Loader2 className="w-4 h-4 text-panora-green animate-spin" />
      <span className="text-[13px] text-panora-text-muted">Génération en cours...</span>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────

export function AnalysisTab({ analysisData, insurers, offerCount, onSwitchToComparison, onOpenProfile, isStreaming, onStreamingDone, hasClientProfile = true, isPanelOpen = false }: AnalysisTabProps) {
  const [state, setState] = useState<"idle" | "generating" | "done">("idle");
  const [selectedPrompt, setSelectedPrompt] = useState<PromptId | null>(null);
  const [generatedMarkdown, setGeneratedMarkdown] = useState("");
  const [isStreamingContent, setIsStreamingContent] = useState(false);
  const [cache, setCache] = useState<Partial<Record<PromptId, string>>>({});

  // If initial streaming from comparison agent, fire onStreamingDone immediately
  useEffect(() => {
    if (isStreaming) onStreamingDone?.();
  }, [isStreaming, onStreamingDone]);

  const handleSelectPrompt = (promptId: PromptId) => {
    if (!analysisData) return;
    setSelectedPrompt(promptId);

    // If already generated, show instantly without streaming
    const cached = cache[promptId];
    if (cached) {
      setGeneratedMarkdown(cached);
      setIsStreamingContent(false);
      setState("done");
      return;
    }

    setState("generating");
    setTimeout(() => {
      const md = generateMarkdown(promptId, analysisData, insurers);
      setGeneratedMarkdown(md);
      setCache((prev) => ({ ...prev, [promptId]: md }));
      setIsStreamingContent(true);
      setState("done");
    }, 800);
  };

  const handleStreamComplete = () => {
    setIsStreamingContent(false);
  };

  // Empty states
  if (offerCount === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f5f4f1]">
        <div className="bg-gradient-to-b from-[#f7f9ff] to-white rounded-[12px] px-7 py-6 max-w-md w-full">
          <div className="space-y-3">
            <p className="text-[13px] font-medium text-[#162416] leading-5">
              Ajoutez des offres au tableau comparatif pour générer l&apos;analyse.
            </p>
            <button onClick={onSwitchToComparison} className="bg-[#e4e2e4] border border-[rgba(34,32,26,0.1)] text-white rounded-[8px] px-3 py-1.5 text-[13px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              Aller au tableau comparatif
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (offerCount === 1) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f5f4f1]">
        <div className="bg-gradient-to-b from-[#f7f9ff] to-white rounded-[12px] px-7 py-6 max-w-md w-full">
          <p className="text-[13px] font-medium text-[#162416] leading-5">
            L&apos;analyse comparative nécessite au moins deux offres.
          </p>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-panora-bg">
        <p className="text-[14px] text-panora-text-muted">Analyse non disponible.</p>
      </div>
    );
  }

  // Idle — show empty state with prompts
  if (state === "idle") {
    return <EmptyState onSelectPrompt={handleSelectPrompt} />;
  }

  // Generating — brief loading then stream
  if (state === "generating") {
    return (
      <div className="flex-1 flex flex-col bg-[#f5f4f1]">
        <GeneratingState />
      </div>
    );
  }

  // Done — show generated document with TOC left and prompts right
  const promptLabel = PROMPTS.find((p) => p.id === selectedPrompt)?.label ?? "";
  const toc = extractToc(generatedMarkdown);
  const remainingPrompts = PROMPTS.filter((p) => p.id !== selectedPrompt);

  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f4f1]">
      <div className="flex justify-center gap-6 my-8 px-6">
        {/* Left — Table of contents */}
        <div className="w-[180px] shrink-0 hidden xl:block">
          <div className="sticky top-8">
            <p className="text-[11px] font-semibold text-panora-text-muted uppercase tracking-[0.5px] mb-3">Sommaire</p>
            <nav className="space-y-1">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`block text-[12px] leading-5 text-panora-text-muted hover:text-panora-text transition-colors ${item.level === 3 ? "pl-3" : ""}`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Center — Document */}
        <div className="max-w-[720px] w-full min-w-0">
          <div className="bg-white rounded-[12px] border border-panora-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="px-10 py-8">
              {/* Prompt badge */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-1.5 bg-[#dbeee5] text-panora-green text-[12px] font-medium px-2.5 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  Synthèse assistée
                </div>
              </div>

              {/* Original prompt */}
              <p className="text-[13px] text-panora-text-muted mb-6 italic">
                « {promptLabel} »
              </p>

              <hr className="border-panora-border mb-8" />

              {/* Generated content */}
              <StreamingMarkdown
                markdown={generatedMarkdown}
                active={isStreamingContent}
                onComplete={handleStreamComplete}
              />
            </div>
          </div>
        </div>

        {/* Right — Try another angle */}
        <div className="w-[200px] shrink-0 hidden xl:block">
          {!isStreamingContent && (
            <div className="sticky top-8">
              <p className="text-[11px] font-semibold text-panora-text-muted uppercase tracking-[0.5px] mb-3">Autre angle</p>
              <div className="space-y-2">
                {remainingPrompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => handleSelectPrompt(prompt.id)}
                    className="w-full px-3 py-2.5 bg-white border border-panora-border rounded-[8px] text-[12px] leading-[17px] text-panora-text text-left hover:border-panora-green/40 hover:shadow-[0_2px_8px_rgba(0,162,114,0.06)] transition-all"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
