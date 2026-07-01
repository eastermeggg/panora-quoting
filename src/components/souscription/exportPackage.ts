import type { Dossier, Draft } from "@/data/souscription-mock";

export const PACKAGE_ITEMS = [
  "Devis",
  "Conditions générales",
  "Conditions particulières",
  "Mail au courtier",
];

function formatEuros(n: number): string {
  return n.toLocaleString("fr-FR") + " €";
}

function downloadMockFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildExportDoc(
  item: string,
  dossier: Dossier,
  draft: Draft,
  principalLabel: string
): { filename: string; content: string } {
  const head = `HISCOX - Souscription\n${dossier.id} · ${dossier.insured.raison} · ${principalLabel}\nCourtier : ${dossier.courtier}\n\n`;
  if (item === "Devis") {
    return {
      filename: `devis_${dossier.id}.txt`,
      content:
        head +
        `DEVIS\nPrime annuelle : ${formatEuros(draft.primeFinale)} HT\n\n` +
        draft.lignes.map((l) => `- ${l.label} : ${l.valeur}`).join("\n") +
        "\n",
    };
  }
  if (item === "Conditions générales") {
    return {
      filename: `CG_${dossier.id}.txt`,
      content:
        head +
        "CONDITIONS GENERALES\nReferencees depuis le referentiel produit.\n",
    };
  }
  if (item === "Conditions particulières") {
    const couv = draft.lignes.filter((l) => l.effectKind === "couverture");
    return {
      filename: `CP_${dossier.id}.txt`,
      content:
        head +
        "CONDITIONS PARTICULIERES\n\nGaranties et limites :\n" +
        couv.map((l) => `- ${l.label} : ${l.valeur}`).join("\n") +
        "\n",
    };
  }
  return {
    filename: `mail_${dossier.id}.txt`,
    content:
      `A : ${dossier.courtier}\nObjet : Proposition ${principalLabel} - ${dossier.insured.raison}\n\n` +
      `Bonjour,\n\nVeuillez trouver notre proposition pour ${dossier.insured.raison} : prime annuelle ${formatEuros(draft.primeFinale)} HT.\n\nCordialement,\nHiscox\n`,
  };
}

/** Generate and download one package document for a priced draft. */
export function exportPackageItem(
  item: string,
  dossier: Dossier,
  draft: Draft,
  principalLabel: string
) {
  const { filename, content } = buildExportDoc(item, dossier, draft, principalLabel);
  downloadMockFile(filename, content);
}
