// Product changelog / "Quoi de neuf" — shown on the home screen and the sidebar.

export type ChangelogTag = "Nouveau" | "Amélioration" | "Correctif";

export type ChangelogEntry = {
  id: string;
  date: string; // "18 juil."
  tag: ChangelogTag;
  title: string;
  description: string;
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    id: "cl-1",
    date: "18 juil.",
    tag: "Nouveau",
    title: "Comparaison multi-entités",
    description:
      "Comparez plusieurs sociétés d'un même groupe dans une seule vue consolidée.",
  },
  {
    id: "cl-2",
    date: "12 juil.",
    tag: "Amélioration",
    title: "Devoir de conseil au format du cabinet",
    description:
      "Vos documents générés suivent désormais le modèle de votre cabinet.",
  },
  {
    id: "cl-3",
    date: "5 juil.",
    tag: "Nouveau",
    title: "Enregistreur de cotation",
    description:
      "Ajoutez un extranet non encore supporté en enregistrant votre session.",
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
