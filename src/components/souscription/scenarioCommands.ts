/** Demo scenario commands played from the co-pilote. The point of a scenario is
 *  the visible effect on the project, not the message. Replayable via /reset. */
export interface ScenarioMeta {
  cmd: string;
  label: string;
  shows: string;
}

export const SCENARIOS: ScenarioMeta[] = [
  {
    cmd: "/scenario-confirm",
    label: "Confirmer une hypothèse",
    shows: "[agent] devient [confirmé], points ouverts 2 → 1",
  },
  {
    cmd: "/scenario-override",
    label: "Modifier via le chat",
    shows: "carte MODIFIER, la valeur change",
  },
  {
    cmd: "/scenario-rule",
    label: "Créer une règle depuis un override",
    shows: "toast « règle ajoutée au vault, à valider »",
  },
  {
    cmd: "/scenario-escalade",
    label: "Dépassement de mandat",
    shows: "l'action passe en Escalader, export gelé",
  },
  {
    cmd: "/scenario-hors-appetit",
    label: "Refus sourcé",
    shows: "le corps montre le pourquoi, pas de chiffrage",
  },
  {
    cmd: "/scenario-gap",
    label: "Relance courtier",
    shows: "carte RELANCE, pièces manquantes listées",
  },
];
