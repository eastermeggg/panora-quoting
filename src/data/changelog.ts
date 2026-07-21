// Product changelog / "Quoi de neuf" — shown on the home screen and the sidebar.
//
// Each entry can carry a rich body authored as Markdown (exported from Notion):
// a title, a TL;DR + a Remotion explainer video, then free-form text/images.
// The compact cards use `title`/`description`; clicking one opens the LATEST
// entry's detail in a modal. The full history lives on an external Notion page
// (CHANGELOG_NOTION_URL) reached via "Voir toutes les nouveautés".

export type ChangelogTag = "Nouveau" | "Amélioration" | "Correctif";

export type ChangelogVideo = {
  /** Rendered Remotion output (mp4/webm). When absent, a poster + play slot. */
  src?: string;
  poster?: string;
};

export type ChangelogEntry = {
  id: string;
  date: string; // "18 juil."
  tag: ChangelogTag;
  title: string;
  description: string; // one-liner for the compact cards
  tldr?: string; // shown at the top of the detail modal
  video?: ChangelogVideo; // Remotion explainer, under the TL;DR
  body?: string; // Markdown from Notion — headings, paragraphs, images
};

/** External Notion page holding the full changelog ("Voir toutes les nouveautés"). */
export const CHANGELOG_NOTION_URL = "https://panora.notion.site/Nouveautes-Panora";

export const CHANGELOG: ChangelogEntry[] = [
  {
    id: "cl-1",
    date: "18 juil.",
    tag: "Nouveau",
    title: "Comparaison multi-entités",
    description:
      "Comparez plusieurs sociétés d'un même groupe dans une seule vue consolidée.",
    tldr: "La comparaison gère maintenant plusieurs entités d'un même groupe dans une seule vue consolidée — garanties, plafonds et franchises alignés, écarts visibles d'un coup d'œil.",
    video: { poster: "/onboarding/empty-state-gradient.jpg" },
    body: `## Ce qui change

La comparaison de devis accepte désormais **plusieurs entités d'un même groupe** dans une seule vue. Les garanties, plafonds et franchises se lisent côte à côte, entité par entité, sans quitter le dossier.

## Pourquoi c'est utile

- Une seule analyse pour un groupe multi-sociétés, au lieu d'un dossier par entité.
- Les écarts entre entités ressortent immédiatement.
- Le devoir de conseil consolidé reprend l'ensemble dans un document unique.

## Comment l'utiliser

Depuis l'**assistant analyse**, lancez une comparaison puis ajoutez les entités concernées. Panora consolide automatiquement les résultats et met en avant les points de vigilance.`,
  },
  {
    id: "cl-2",
    date: "12 juil.",
    tag: "Amélioration",
    title: "Devoir de conseil au format du cabinet",
    description:
      "Vos documents générés suivent désormais le modèle de votre cabinet.",
    tldr: "Les devoirs de conseil générés reprennent automatiquement la trame et la charte de votre cabinet.",
    body: `## Ce qui change

Les documents générés suivent désormais **le modèle de votre cabinet** : en-tête, structure et mentions. Vous n'avez plus à reformater après coup.`,
  },
  {
    id: "cl-3",
    date: "5 juil.",
    tag: "Nouveau",
    title: "Enregistreur de cotation",
    description:
      "Ajoutez un extranet non encore supporté en enregistrant votre session.",
    tldr: "Enregistrez votre session sur un extranet non encore automatisé : notre équipe l'encode pour vous et tout votre cabinet.",
    body: `## Ce qui change

Un assureur ou un extranet pas encore automatisé ? **Enregistrez votre session** de cotation à l'écran. Notre équipe s'en sert pour l'encoder et le rendre automatique.`,
  },
  {
    id: "cl-4",
    date: "28 juin",
    tag: "Amélioration",
    title: "Reconnexion de session en un clic",
    description:
      "Rouvrez la session 2FA d'un assureur et les cotations en attente partent aussitôt.",
  },
];

/** Latest N entries, for compact surfaces. */
export function latestChangelog(n = 3): ChangelogEntry[] {
  return CHANGELOG.slice(0, n);
}

/** The most recent entry — the one the card click opens in the modal. */
export function latestEntry(): ChangelogEntry {
  return CHANGELOG[0];
}
