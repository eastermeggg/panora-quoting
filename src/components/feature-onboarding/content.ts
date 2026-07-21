import type { FeatureIntroContent } from "./FeatureIntroModal";

/* Intro copy per feature. Kept light per the spec: short guidance + a link-out
 * feel, honest about what the agent can and can't do. */

export const ANALYSE_INTRO: FeatureIntroContent = {
  eyebrow: "Agent Analyse",
  title: "Votre première analyse de contrat",
  description:
    "L'Agent Analyse décortique un contrat et fait ressortir l'essentiel dans une vue structurée. Vous gardez la main sur chaque décision.",
  can: [
    "Décortique le contrat : garanties, exclusions, plafonds, franchises",
    "Met en avant les points de vigilance",
    "Prépare une lecture claire, prête à partager",
  ],
  cannot: [
    "Il ne décide pas à votre place — vous validez",
    "Il n'envoie rien au client sans votre accord",
  ],
  icon: "/onboarding/icons/loupe.png",
  ctaLabel: "Lancer l'analyse",
};

export const COMPARAISON_INTRO: FeatureIntroContent = {
  eyebrow: "Agent Analyse",
  title: "Votre première comparaison",
  description:
    "Panora met vos devis en vis-à-vis et fait ressortir les écarts, garantie par garantie. Vous gardez la main sur la recommandation.",
  can: [
    "Aligne les devis reçus dans une vue structurée",
    "Repère les écarts de garanties, plafonds et franchises",
    "Prépare une synthèse claire pour votre client",
  ],
  cannot: [
    "Il ne choisit pas l'offre à votre place — vous validez",
    "Rien n'est envoyé sans votre accord",
  ],
  icon: "/onboarding/icons/loupe.png",
  ctaLabel: "Lancer la comparaison",
};

/** Feature → intro content, for the shared first-use launch experience. */
export const FEATURE_INTRO = {
  analyse: ANALYSE_INTRO,
  comparaison: COMPARAISON_INTRO,
} as const;
