"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Pencil, Eye } from "lucide-react";
import { marked, type Tokens } from "marked";
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
import { BrandingSettings, DEFAULT_BRANDING, loadBranding } from "@/data/branding";
import { CoverPagePreview } from "@/components/settings/presentation/CoverPagePreview";

interface ComparisonSynthesisProps {
  insurers: InsurerData[];
  recommendedInsurerId: string | null;
  productLabel: string;
  clientName: string;
  content: string;
  onContentChange: (next: string) => void;
  /** Triggers PDF preview in a new tab. */
  onPreviewPdf?: () => void;
}

// ── Markdown ⇄ HTML configuration ──────────────────────────────────

marked.setOptions({ gfm: true, breaks: false });

// Wrap tables in a styled container, render headings as plain markdown (no class
// injection — explicit override prevents stale extensions from a previous HMR
// pass from sneaking in a "synth-reco-banner" or similar class).
marked.use({
  renderer: {
    heading(this, token: Tokens.Heading) {
      const text = this.parser.parseInline(token.tokens);
      return `<h${token.depth}>${text}</h${token.depth}>\n`;
    },
    table(this, token: Tokens.Table) {
      const header = token.header
        .map((cell) => `<th>${this.parser.parseInline(cell.tokens)}</th>`)
        .join("");
      const body = token.rows
        .map(
          (row) =>
            `<tr>${row
              .map((cell) => `<td>${this.parser.parseInline(cell.tokens)}</td>`)
              .join("")}</tr>`
        )
        .join("");
      return `<div class="synth-table-wrap"><table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></div>\n`;
    },
  },
});

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

export function ComparisonSynthesis({
  content,
  onContentChange,
  clientName,
  productLabel,
  onPreviewPdf,
}: ComparisonSynthesisProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastMarkdownRef = useRef<string>(content);
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING);

  useEffect(() => {
    setBranding(loadBranding());
    const onStorage = (e: StorageEvent) => {
      if (e.key === "panora.branding.v1") setBranding(loadBranding());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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
      <div className="max-w-[760px] mx-auto px-10 pt-6 pb-10">
        {/* De-emphasized cover preview — represents the export's first page. */}
        <div className="flex items-start gap-4 pb-5 mb-6 border-b border-panora-border">
          <div className="shrink-0">
            <CoverPagePreview
              branding={branding}
              clientName={clientName}
              productLabel={productLabel}
              scale={0.09}
            />
          </div>
          <div className="flex flex-col gap-1.5 min-w-0 flex-1 pt-0.5">
            <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-panora-text-secondary">
              Page de couverture
            </span>
            <p className="text-[13px] text-panora-text-secondary leading-[18px]">
              Générée à l&apos;export à partir de votre charte.
            </p>
            <div className="flex items-center gap-4 mt-1">
              {onPreviewPdf && (
                <button
                  onClick={onPreviewPdf}
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-panora-green hover:underline w-fit"
                  title="Aperçu PDF (nouvel onglet)"
                >
                  <Eye className="w-3 h-3" />
                  Aperçu
                </button>
              )}
              <Link
                href="/settings/presentation"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-panora-green hover:underline w-fit"
              >
                <Pencil className="w-3 h-3" />
                Personnaliser
              </Link>
            </div>
          </div>
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          spellCheck
          onBlur={commit}
          className="synthese-doc outline-none focus:outline-none"
          style={{ ["--brand-primary" as string]: branding.primaryColor }}
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
    return `# Synthèse · ${args.clientName}\n\nNous étudions les offres reçues pour ${args.productLabel}. La synthèse sera générée dès que les premiers devis seront disponibles.`;
  }

  const synthese = args.analysisData?.synthese ?? [];
  const sections: string[] = [];
  const nbInsurers = completed.length;
  const isOnly = nbInsurers === 1;

  // ── Title & intro ──
  sections.push(`# Synthèse · ${args.clientName}`);
  sections.push(
    `*Cette étude réunit les retours marché obtenus pour votre couverture **${args.productLabel}** auprès de ${isOnly ? `**${recommended.name}**` : `**${nbInsurers} assureurs**`}. Elle vous permet de comparer les offres en toute transparence et de retenir celle qui correspond le mieux à votre situation.*`
  );

  // ── 1. Récapitulatif de vos besoins ──
  sections.push(`## Récapitulatif de vos besoins`);
  const besoins = (args.besoinsClient ?? []).filter((b) => b.value.trim().length > 0);
  if (besoins.length > 0) {
    sections.push(
      `Pour rappel, voici les enjeux que nous avons identifiés ensemble et qui ont guidé la sélection des offres :`
    );
    sections.push(besoins.map((b) => `- ${b.value}`).join("\n"));
  } else {
    sections.push(
      `*Aucun besoin spécifique n'a été consigné. La synthèse s'appuie sur le profil ${args.productLabel} standard. N'hésitez pas à nous remonter toute particularité à affiner.*`
    );
  }

  // ── 2. Assureurs consultés ──
  sections.push(`## Assureurs consultés`);
  sections.push(
    isOnly
      ? `Nous avons sollicité **${recommended.name}**, qui a remis un devis détaillé. Compte tenu du périmètre, cette offre constitue la base de notre recommandation.`
      : `Nous avons sollicité **${nbInsurers} assureurs** que nous jugeons les mieux positionnés sur ce risque. Tous ont remis un devis complet, ce qui nous permet une analyse comparée précise.`
  );
  sections.push(buildInsurersTable(completed, recommended.id));

  // ── 3. Les offres reçues — comparison TABLE ──
  sections.push(`## Les offres reçues`);
  sections.push(
    isOnly
      ? `Voici les points distinctifs de l'offre, analysés au regard de votre profil.`
      : `Chaque assureur a structuré sa proposition différemment. Le tableau ci-dessous met en évidence les éléments distinctifs identifiés à l'analyse : bénéfices à valoriser et points à garder en tête.`
  );
  sections.push(buildOffersTable(completed, synthese, recommended.id));
  if (!isOnly) {
    sections.push(
      `> ★ **${recommended.name}** se détache comme l'offre la mieux équilibrée pour votre profil. Le détail des garanties et exclusions de cette offre est présenté ci-dessous.`
    );
  }

  // ── 4. Détail des garanties clés — offre recommandée ──
  const keyGuaranteesReco = pickReccoKeyGuarantees(
    args.comparisonData,
    completed,
    recommended,
    6
  );
  if (keyGuaranteesReco.length > 0) {
    sections.push(`## Détail des garanties clés · ${recommended.name}`);
    sections.push(
      `Voici les niveaux retenus par ${recommended.name} sur les garanties que nous avons identifiées comme les plus structurantes${besoins.length > 0 ? " pour votre activité" : ""}. Chaque ligne correspond à un point sur lequel la couverture peut faire la différence en cas de sinistre.`
    );
    sections.push(buildRecoGuaranteesTable(keyGuaranteesReco, recommended));
  }

  // ── 5. Détail des exclusions clés — offre recommandée ──
  const keyExclusionsReco = pickReccoKeyExclusions(
    args.comparisonData,
    completed,
    recommended,
    5
  );
  if (keyExclusionsReco.length > 0) {
    sections.push(`## Détail des exclusions clés · ${recommended.name}`);
    sections.push(
      `Toute police comporte des exclusions. Voici celles que nous avons relevées sur l'offre recommandée et qui méritent votre attention avant signature. Nous restons à votre disposition pour les revoir une à une.`
    );
    sections.push(buildRecoExclusionsTable(keyExclusionsReco, recommended));
  }

  // ── 6. Notre recommandation + Pourquoi ──
  sections.push(`## Notre recommandation : ${recommended.name}`);
  sections.push(
    isOnly
      ? `Au vu du périmètre et de l'analyse menée, nous vous recommandons de retenir l'offre **${recommended.name}**, dont les principaux atouts sont détaillés ci-dessous.`
      : `À l'issue de cette analyse, **${recommended.name}** se détache comme l'offre la mieux équilibrée entre étendue de couverture, conditions et tarif, au regard de vos besoins.`
  );
  const reasons = buildPourquoi(
    recommended,
    completed,
    args.comparisonData,
    args.analysisData
  );
  if (reasons.length > 0) {
    sections.push(`### Pourquoi ${recommended.name} ?`);
    sections.push(reasons.map((r, i) => `${i + 1}. ${r}`).join("\n"));
  }
  sections.push(
    `*Nous restons disponibles pour échanger sur cette recommandation, ajuster un niveau de garantie ou demander un avenant si nécessaire.*`
  );

  return sections.join("\n\n") + "\n";
}

function buildOffersTable(
  insurers: InsurerData[],
  synthese: AnalysisData["synthese"],
  recommendedId: string
): string {
  const header = `| Assureur | Prime annuelle | Bénéfices clés | Points de vigilance |`;
  const sep = `| --- | --- | --- | --- |`;
  const rows = insurers
    .map((ins) => {
      const item = synthese.find((s) => s.insurerId === ins.id);
      const isReco = ins.id === recommendedId;
      const namePrefix = isReco ? `★ **${ins.name}** ` : `**${ins.name}**`;
      const recoTag = isReco ? `<br>*Recommandée*` : "";
      const prime =
        ins.pricing?.[0]?.details?.find((d) => /annuel|prime|total|ttc/i.test(d.label))
          ?.value ?? "n/c";
      const forts =
        item?.pointsForts && item.pointsForts.length > 0
          ? joinForCell(item.pointsForts, 2)
          : "n/c";
      const faibles =
        item?.pointsFaibles && item.pointsFaibles.length > 0
          ? joinForCell(item.pointsFaibles, 2)
          : "n/c";
      return `| ${namePrefix}${recoTag} | ${prime} | ${forts} | ${faibles} |`;
    })
    .join("\n");
  return `${header}\n${sep}\n${rows}`;
}

function joinForCell(items: string[], limit: number): string {
  const trimmed = items
    .slice(0, limit)
    .map((s) => s.replace(/\|/g, "\\|").replace(/\n+/g, " "));
  return trimmed.join(" · ");
}

function pickReccoKeyGuarantees(
  comparisonData: ComparisonData | undefined,
  insurers: InsurerData[],
  recommended: InsurerData,
  limit: number
): KeyGuarantee[] {
  if (!comparisonData) return [];
  const flatSections =
    comparisonData.products?.flatMap((p) => p.subGroups) ?? comparisonData.sections ?? [];
  const allRows: GuaranteeRow[] = flatSections.flatMap((s) => s.rows);

  // Score: discriminating between insurers + the reco has a meaningful value
  const scored = allRows.map((row) => {
    const types = new Set<string>();
    insurers.forEach((ins) => {
      const cell = row.values?.[ins.id];
      types.add(cell?.type ?? "empty");
    });
    const recoCell = row.values?.[recommended.id];
    const recoHasValue = recoCell && recoCell.type !== "empty" && recoCell.type !== "cross";
    return { row, score: types.size, recoHasValue };
  });

  const discriminating = scored
    .filter((s) => s.score > 1 && s.recoHasValue)
    .slice(0, limit);
  if (discriminating.length >= 3) {
    return discriminating.map((s) => ({ label: s.row.label, rows: s.row }));
  }
  return allRows
    .filter((r) => {
      const c = r.values?.[recommended.id];
      return c && c.type !== "empty";
    })
    .slice(0, limit)
    .map((r) => ({ label: r.label, rows: r }));
}

function buildRecoGuaranteesTable(
  items: KeyGuarantee[],
  recommended: InsurerData
): string {
  const header = `| Garantie | ${recommended.name} |`;
  const sep = `| --- | --- |`;
  const rows = items
    .map((item) => {
      const cell = item.rows.values?.[recommended.id];
      const detail = item.rows.details?.[recommended.id];
      return `| ${item.label} | ${formatGuaranteeCell(cell, detail?.mainLimit)} |`;
    })
    .join("\n");
  return `${header}\n${sep}\n${rows}`;
}

function pickReccoKeyExclusions(
  comparisonData: ComparisonData | undefined,
  insurers: InsurerData[],
  recommended: InsurerData,
  limit: number
): ExclusionRow[] {
  if (!comparisonData?.exclusions) return [];

  // Prefer exclusions where the reco has an actual stance (exclu / inclus / exclu-text)
  const recoActive = comparisonData.exclusions.filter((row) => {
    const c = row.values?.[recommended.id];
    return c && c.type !== "empty";
  });

  // Within those, prioritize ones that diverge across insurers
  const scored = recoActive.map((row) => {
    const types = new Set<string>();
    insurers.forEach((ins) => {
      const cell = row.values?.[ins.id];
      types.add(cell?.type ?? "empty");
    });
    return { row, score: types.size };
  });

  const diverging = scored.filter((s) => s.score > 1).slice(0, limit);
  if (diverging.length >= 2) return diverging.map((s) => s.row);
  return recoActive.slice(0, limit);
}

function buildRecoExclusionsTable(
  items: ExclusionRow[],
  recommended: InsurerData
): string {
  const header = `| Exclusion | ${recommended.name} |`;
  const sep = `| --- | --- |`;
  const rows = items
    .map((item) => {
      return `| ${item.label} | ${formatExclusionCell(item.values?.[recommended.id])} |`;
    })
    .join("\n");
  return `${header}\n${sep}\n${rows}`;
}

// ── Helpers ───────────────────────────────────────────────────────

function buildInsurersTable(insurers: InsurerData[], recommendedId: string): string {
  const header = `| Assureur | Prime annuelle | Référence |\n| --- | --- | --- |`;
  const rows = insurers
    .map((ins) => {
      const prime =
        ins.pricing?.[0]?.details?.find((d) => /annuel|prime|total|ttc/i.test(d.label))
          ?.value ?? "n/c";
      const reco = ins.id === recommendedId ? " ✓" : "";
      const ref = ins.reference || "n/c";
      return `| ${ins.name}${reco} | ${prime} | ${ref} |`;
    })
    .join("\n");
  return `${header}\n${rows}`;
}

interface KeyGuarantee {
  label: string;
  rows: GuaranteeRow;
}

function formatGuaranteeCell(cell: CellValue | undefined, mainLimit?: string): string {
  if (!cell) return "n/c";
  if (cell.type === "text" && cell.value) return cell.value.replace(/\|/g, "\\|");
  if (cell.type === "check") return mainLimit ? `✓ ${mainLimit.replace(/\|/g, "\\|")}` : "✓";
  if (cell.type === "cross") return "✕";
  return "n/c";
}

function formatExclusionCell(cell: ExclusionCellValue | undefined): string {
  if (!cell) return "n/c";
  if (cell.type === "exclu") return "Exclu";
  if (cell.type === "inclus") return "Inclus";
  if (cell.type === "exclu-text" && cell.value) return cell.value.replace(/\|/g, "\\|");
  return "n/c";
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
    reasons.push(`**Couverture** : ${recoSynthese.pointsForts[0]}`);
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
        `**${uniqueWin.label}** : seul **${recommended.name}** propose cette garantie sur les devis reçus.`
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
        `**Tarif maîtrisé** : prime annuelle ${pct}% sous l'offre la plus chère du panel.`
      );
    } else if (recoPrime > Math.min(...othersPrimes)) {
      reasons.push(
        `**Justification du surcoût** : prime supérieure à la moins-disante mais compensée par la couverture et la qualité de gestion.`
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
        `**Moins d'exclusions** : ${recoCount} exclusion${recoCount > 1 ? "s" : ""} appliquée${recoCount > 1 ? "s" : ""} contre ${othersMaxCount} pour le concurrent le plus restrictif.`
      );
    }
  }

  reasons.push(
    `**Adéquation au profil** : combinaison la plus équilibrée entre étendue de couverture, tarif et conditions, au regard des besoins exprimés.`
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
