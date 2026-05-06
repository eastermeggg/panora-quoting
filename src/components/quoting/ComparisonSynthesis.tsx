"use client";

import { useEffect, useRef } from "react";
import { marked } from "marked";
import TurndownService from "turndown";
// @ts-expect-error - no types ship with the GFM plugin
import { gfm } from "@joplin/turndown-plugin-gfm";
import type {
  AnalysisData,
  BesoinItem,
  CellValue,
  ComparisonData,
  ExclusionCellValue,
  ExclusionRow,
  GuaranteeRow,
  InsurerData,
} from "@/data/mock";

interface ComparisonSynthesisProps {
  insurers: InsurerData[];
  recommendedInsurerId: string | null;
  productLabel: string;
  clientName: string;
  content: string;
  onContentChange: (next: string) => void;
}

// ── Markdown ⇄ HTML configuration ──────────────────────────────────

marked.setOptions({ gfm: true, breaks: false });

const turndown = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
});
turndown.use(gfm);

function mdToHtml(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

function htmlToMd(html: string): string {
  return turndown.turndown(html).trim();
}

// ── WYSIWYG editor ────────────────────────────────────────────────

export function ComparisonSynthesis({ content, onContentChange }: ComparisonSynthesisProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastMarkdownRef = useRef<string>(content);

  // Set initial HTML on mount and whenever the content prop changes from outside
  // (e.g. chat accepted an edit). We avoid re-rendering during user edits.
  useEffect(() => {
    if (!editorRef.current) return;
    if (content === lastMarkdownRef.current) return; // change came from us
    editorRef.current.innerHTML = mdToHtml(content);
    lastMarkdownRef.current = content;
  }, [content]);

  // Initial mount only
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML === "") {
      editorRef.current.innerHTML = mdToHtml(content);
      lastMarkdownRef.current = content;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function commit() {
    if (!editorRef.current) return;
    const md = htmlToMd(editorRef.current.innerHTML);
    if (md !== lastMarkdownRef.current) {
      lastMarkdownRef.current = md;
      onContentChange(md);
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-white">
      <div className="max-w-[760px] mx-auto px-10 py-10">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          spellCheck
          onBlur={commit}
          className="synthese-doc outline-none focus:outline-none"
        />
      </div>
    </div>
  );
}
// ─── Default markdown content built from real data ────────────────

interface BuildDefaultSyntheseArgs {
  clientName: string;
  productLabel: string;
  insurers: InsurerData[];
  recommendedInsurerId: string | null;
  besoinsClient?: BesoinItem[];
  comparisonData?: ComparisonData;
  analysisData?: AnalysisData;
}

export function buildDefaultSynthese(args: BuildDefaultSyntheseArgs): string {
  const completed = args.insurers.filter((i) => i.status === "completed");
  const recommended =
    args.insurers.find((i) => i.id === args.recommendedInsurerId) ??
    completed[0] ??
    args.insurers[0];

  if (!recommended || completed.length === 0) {
    return `# Synthèse — ${args.clientName}\n\nNous étudions les offres reçues pour ${args.productLabel}. La synthèse sera générée dès que les premiers devis seront disponibles.`;
  }

  const insurersForTables = completed;

  const sections: string[] = [];

  sections.push(`# Synthèse — ${args.clientName}`);
  sections.push(
    `*Étude personnalisée pour la couverture **${args.productLabel}**, basée sur les devis reçus de ${completed.length} assureur${completed.length > 1 ? "s" : ""}.*`
  );

  // ── Vos besoins ──
  const besoins = (args.besoinsClient ?? []).filter((b) => b.value.trim().length > 0);
  if (besoins.length > 0) {
    sections.push(`## Vos besoins`);
    sections.push(besoins.map((b) => `- ${b.value}`).join("\n"));
  }

  // ── Assureurs consultés ──
  sections.push(`## Assureurs consultés`);
  sections.push(
    `Nous avons interrogé **${completed.length} assureur${completed.length > 1 ? "s" : ""}** sur ce périmètre. ${completed.length > 1 ? "Tous ont remis " : "L'assureur a remis "}un devis détaillé.`
  );
  sections.push(buildInsurersTable(insurersForTables, recommended.id));

  // ── Garanties clés ──
  const keyGuarantees = pickKeyGuarantees(args.comparisonData, insurersForTables, 6);
  if (keyGuarantees.length > 0) {
    sections.push(`## Garanties clés`);
    sections.push(
      `Comparaison sur les ${keyGuarantees.length} garanties les plus discriminantes pour votre profil.`
    );
    sections.push(buildGuaranteesTable(keyGuarantees, insurersForTables));
  }

  // ── Exclusions clés ──
  const keyExclusions = pickKeyExclusions(args.comparisonData, insurersForTables, 5);
  if (keyExclusions.length > 0) {
    sections.push(`## Exclusions clés à noter`);
    sections.push(
      `Points d'attention identifiés sur les conditions générales et particulières.`
    );
    sections.push(buildExclusionsTable(keyExclusions, insurersForTables));
  }

  // ── Points forts par offre ──
  const synthese = args.analysisData?.synthese ?? [];
  const fortsParOffre = insurersForTables
    .map((ins) => ({ ins, item: synthese.find((s) => s.insurerId === ins.id) }))
    .filter((x) => x.item && x.item.pointsForts.length > 0);
  if (fortsParOffre.length > 0) {
    sections.push(`## Points forts par offre`);
    sections.push(
      fortsParOffre
        .map(({ ins, item }) =>
          `**${ins.name}**\n${item!.pointsForts.map((p) => `- ${p}`).join("\n")}`
        )
        .join("\n\n")
    );
  }

  // ── Points faibles ──
  const faiblesParOffre = insurersForTables
    .map((ins) => ({ ins, item: synthese.find((s) => s.insurerId === ins.id) }))
    .filter((x) => x.item && x.item.pointsFaibles.length > 0);
  if (faiblesParOffre.length > 0) {
    sections.push(`## Points de vigilance`);
    sections.push(
      faiblesParOffre
        .map(({ ins, item }) =>
          `**${ins.name}**\n${item!.pointsFaibles.map((p) => `- ${p}`).join("\n")}`
        )
        .join("\n\n")
    );
  }

  // ── Recommandation ──
  sections.push(`## Notre recommandation`);
  sections.push(
    `**${recommended.name}** — l'offre la mieux adaptée à votre profil sur ce périmètre de couverture.`
  );

  // ── Pourquoi ──
  const reasons = buildPourquoi(
    recommended,
    insurersForTables,
    args.comparisonData,
    args.analysisData
  );
  if (reasons.length > 0) {
    sections.push(`### Pourquoi ${recommended.name} ?`);
    sections.push(reasons.map((r, i) => `${i + 1}. ${r}`).join("\n"));
  }

  return sections.join("\n\n") + "\n";
}

// ── Helpers ───────────────────────────────────────────────────────

function buildInsurersTable(insurers: InsurerData[], recommendedId: string): string {
  const header = `| Assureur | Prime annuelle | Référence |\n| --- | --- | --- |`;
  const rows = insurers
    .map((ins) => {
      const prime =
        ins.pricing?.[0]?.details?.find((d) => /annuel|prime|total|ttc/i.test(d.label))
          ?.value ?? "—";
      const reco = ins.id === recommendedId ? " ✓" : "";
      const ref = ins.reference || "—";
      return `| ${ins.name}${reco} | ${prime} | ${ref} |`;
    })
    .join("\n");
  return `${header}\n${rows}`;
}

interface KeyGuarantee {
  label: string;
  rows: GuaranteeRow;
}

function pickKeyGuarantees(
  comparisonData: ComparisonData | undefined,
  insurers: InsurerData[],
  limit: number
): KeyGuarantee[] {
  if (!comparisonData) return [];
  const flatSections =
    comparisonData.products?.flatMap((p) => p.subGroups) ?? comparisonData.sections ?? [];
  const allRows: GuaranteeRow[] = flatSections.flatMap((s) => s.rows);

  const scored = allRows.map((row) => {
    const types = new Set<string>();
    insurers.forEach((ins) => {
      const cell = row.values?.[ins.id];
      types.add(cell?.type ?? "empty");
    });
    return { row, score: types.size };
  });

  const discriminating = scored.filter((s) => s.score > 1).slice(0, limit);
  if (discriminating.length >= 3) {
    return discriminating.map((s) => ({ label: s.row.label, rows: s.row }));
  }
  return allRows
    .filter((r) =>
      insurers.some((ins) => r.values?.[ins.id]?.type && r.values[ins.id].type !== "empty")
    )
    .slice(0, limit)
    .map((r) => ({ label: r.label, rows: r }));
}

function buildGuaranteesTable(items: KeyGuarantee[], insurers: InsurerData[]): string {
  const header = `| Garantie | ${insurers.map((i) => i.name).join(" | ")} |`;
  const sep = `| --- | ${insurers.map(() => "---").join(" | ")} |`;
  const rows = items
    .map((item) => {
      const cells = insurers.map((ins) => {
        const cell = item.rows.values?.[ins.id];
        const detail = item.rows.details?.[ins.id];
        return formatGuaranteeCell(cell, detail?.mainLimit);
      });
      return `| ${item.label} | ${cells.join(" | ")} |`;
    })
    .join("\n");
  return `${header}\n${sep}\n${rows}`;
}

function formatGuaranteeCell(cell: CellValue | undefined, mainLimit?: string): string {
  if (!cell) return "—";
  if (cell.type === "text" && cell.value) return cell.value.replace(/\|/g, "\\|");
  if (cell.type === "check") return mainLimit ? `✓ ${mainLimit.replace(/\|/g, "\\|")}` : "✓";
  if (cell.type === "cross") return "✕";
  return "—";
}

function pickKeyExclusions(
  comparisonData: ComparisonData | undefined,
  insurers: InsurerData[],
  limit: number
): ExclusionRow[] {
  if (!comparisonData?.exclusions) return [];
  const scored = comparisonData.exclusions.map((row) => {
    const types = new Set<string>();
    insurers.forEach((ins) => {
      const cell = row.values?.[ins.id];
      types.add(cell?.type ?? "empty");
    });
    return { row, score: types.size };
  });
  const diverging = scored.filter((s) => s.score > 1).slice(0, limit);
  if (diverging.length >= 2) return diverging.map((s) => s.row);
  return comparisonData.exclusions.slice(0, limit);
}

function buildExclusionsTable(items: ExclusionRow[], insurers: InsurerData[]): string {
  const header = `| Exclusion | ${insurers.map((i) => i.name).join(" | ")} |`;
  const sep = `| --- | ${insurers.map(() => "---").join(" | ")} |`;
  const rows = items
    .map((item) => {
      const cells = insurers.map((ins) => formatExclusionCell(item.values?.[ins.id]));
      return `| ${item.label} | ${cells.join(" | ")} |`;
    })
    .join("\n");
  return `${header}\n${sep}\n${rows}`;
}

function formatExclusionCell(cell: ExclusionCellValue | undefined): string {
  if (!cell) return "—";
  if (cell.type === "exclu") return "Exclu";
  if (cell.type === "inclus") return "Inclus";
  if (cell.type === "exclu-text" && cell.value) return cell.value.replace(/\|/g, "\\|");
  return "—";
}

function buildPourquoi(
  recommended: InsurerData,
  others: InsurerData[],
  comparisonData: ComparisonData | undefined,
  analysisData: AnalysisData | undefined
): string[] {
  const reasons: string[] = [];

  const recoSynthese = analysisData?.synthese.find((s) => s.insurerId === recommended.id);
  if (recoSynthese?.pointsForts && recoSynthese.pointsForts.length > 0) {
    reasons.push(`**Couverture** — ${recoSynthese.pointsForts[0]}`);
  }

  if (comparisonData) {
    const flatSections =
      comparisonData.products?.flatMap((p) => p.subGroups) ?? comparisonData.sections ?? [];
    const allRows = flatSections.flatMap((s) => s.rows);
    const uniqueWin = allRows.find((row) => {
      const recoCell = row.values?.[recommended.id];
      if (!recoCell || recoCell.type === "cross" || recoCell.type === "empty") return false;
      const othersExcluded = others
        .filter((o) => o.id !== recommended.id)
        .every((o) => {
          const c = row.values?.[o.id];
          return !c || c.type === "cross" || c.type === "empty";
        });
      return othersExcluded;
    });
    if (uniqueWin) {
      reasons.push(
        `**${uniqueWin.label}** — seul **${recommended.name}** propose cette garantie sur les devis reçus.`
      );
    }
  }

  const recoPrime = parsePrice(recommended);
  const othersPrimes = others
    .filter((o) => o.id !== recommended.id)
    .map((o) => parsePrice(o))
    .filter((n): n is number => n !== null);
  if (recoPrime !== null && othersPrimes.length > 0) {
    const max = Math.max(...othersPrimes);
    if (recoPrime < max) {
      const pct = Math.round(((max - recoPrime) / max) * 100);
      reasons.push(
        `**Tarif maîtrisé** — prime annuelle ${pct}% sous l'offre la plus chère du panel.`
      );
    } else if (recoPrime > Math.min(...othersPrimes)) {
      reasons.push(
        `**Justification du surcoût** — prime supérieure à la moins-disante mais compensée par la couverture et la qualité de gestion.`
      );
    }
  }

  if (comparisonData?.exclusions && comparisonData.exclusions.length > 0) {
    const exclusionCountByInsurer = new Map<string, number>();
    [recommended, ...others].forEach((ins) => {
      let n = 0;
      comparisonData.exclusions!.forEach((ex) => {
        const cell = ex.values?.[ins.id];
        if (cell && (cell.type === "exclu" || cell.type === "exclu-text")) n++;
      });
      exclusionCountByInsurer.set(ins.id, n);
    });
    const recoCount = exclusionCountByInsurer.get(recommended.id) ?? 0;
    const others2 = others.filter((o) => o.id !== recommended.id);
    const othersMaxCount = Math.max(
      0,
      ...others2.map((o) => exclusionCountByInsurer.get(o.id) ?? 0)
    );
    if (recoCount < othersMaxCount) {
      reasons.push(
        `**Moins d'exclusions** — ${recoCount} exclusion${recoCount > 1 ? "s" : ""} appliquée${recoCount > 1 ? "s" : ""} contre ${othersMaxCount} pour le concurrent le plus restrictif.`
      );
    }
  }

  reasons.push(
    `**Adéquation au profil** — combinaison la plus équilibrée entre étendue de couverture, tarif et conditions, au regard des besoins exprimés.`
  );

  return reasons.slice(0, 4);
}

function parsePrice(ins: InsurerData): number | null {
  const detail =
    ins.pricing?.[0]?.details?.find((d) => /annuel|prime|total|ttc/i.test(d.label)) ??
    ins.pricing?.[0]?.details?.[0];
  if (!detail?.value) return null;
  const cleaned = detail.value.replace(/[^\d,.-]/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}
