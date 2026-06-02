"use client";

/**
 * Shared selection types + suggestion sets for the chat context pill.
 *
 * The floating action bar was removed: clicking any cell type (value /
 * column header / row header) now directly scopes the chat with a context
 * pill + suggestion chips. This file is the home of the SelectedObject
 * type and the per-kind suggestion list, both consumed by the chat.
 */

export type SelectedObject =
  | { kind: "value"; sectionIndex: number; rowIndex: number; insurerId: string; rowLabel: string; insurerName: string }
  | { kind: "offer"; insurerId: string; insurerName: string }
  | { kind: "guarantee"; sectionIndex: number; rowIndex: number; rowLabel: string };

/** Type-aware suggestion list, rendered above the chat composer when scoped. */
export function suggestionsForScope(scope: SelectedObject): string[] {
  // Cellule de valeur — intersection assureur × garantie
  if (scope.kind === "value") {
    return [
      "Pourquoi cette valeur ?",
      "Quelle est la source de cette information ?",
      "Compare avec les autres assureurs sur cette ligne",
      "Y a-t-il une condition ou exception particulière ?",
    ];
  }
  // En-tête colonne — offre complète d'un assureur
  if (scope.kind === "offer") {
    return [
      "Quels sont les points forts de cette offre ?",
      "Quelles sont les exclusions majeures ?",
      "Compare avec les autres offres reçues",
      "Recommanderais-tu cet assureur pour ce dossier ?",
    ];
  }
  // En-tête ligne — garantie / exclusion à travers tous les assureurs
  return [
    "Explique-moi cette garantie",
    "Quel assureur la couvre le mieux ?",
    "Compare la couverture entre les assureurs",
    "Y a-t-il des variantes ou des sous-limites ?",
  ];
}
