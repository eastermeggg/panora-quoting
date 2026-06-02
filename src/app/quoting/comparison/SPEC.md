# La synthèse et le co-pilote

Deux surfaces dans la page comparaison :
- **Synthèse** (gauche, principale) — document client, WYSIWYG, exportable PDF/DOCX
- **Co-pilote** (droite, drawer 380px) — espace privé de la courtière

Règle d'or : **l'agent modifie directement la synthèse / le tableau et explique ce qu'il a fait dans le chat avec son raisonnement.** Pas de carte diff à accepter — la confiance vient de la trace visible (explication + reasoning) et de la possibilité d'annuler depuis le message.

## Architecture en deux niveaux

| Niveau | Rôle du chat | Effet sur l'app |
|---|---|---|
| **L1 — Chat contextuel** | Lecture du contexte, recherche dans les documents, génération de texte dans le chat | Aucun — sortie chat uniquement |
| **L2 — Chat barre de contrôle** | Le chat agit sur la synthèse directement, puis explique l'action dans le chat | Modification directe de la synthèse + message d'explication avec reasoning + bouton "Annuler la modification" |

L2 est construit par-dessus L1 — même backend, mêmes context, mais avec un outil additionnel qui modifie la synthèse.

## User stories

**L1 — questions et génération**
- En tant que courtière, je pose des questions sur les offres pour vérifier sans relire les PDF.
- En tant que courtière, je demande au chat de chercher une clause précise dans les conditions générales.
- En tant que courtière, je demande au chat de générer un e-mail / un SMS / une note interne — il apparaît dans le chat.
- En tant que courtière, je demande de l'aide pour l'argumentaire ("quels arguments mettre en avant ?").
- En tant que courtière, j'explore des scénarios de couverture ("si on prend AXA, qu'est-ce qui n'est pas couvert ?").
- En tant que courtière, quand l'agent n'a pas la donnée, il me le dit et propose de relancer — pas de fabrication.

**L2 — actions sur la synthèse**
- En tant que courtière, je demande au chat de réécrire une section de la synthèse — il la modifie directement et m'explique ce qu'il a fait dans le chat. Si je n'aime pas, j'annule depuis le message ou je réédite inline.
- En tant que courtière, j'édite la synthèse inline quand je veux (sans passer par le chat).
- En tant que courtière, je vois le raisonnement de l'agent (repliable) sur chaque modification — pour comprendre *pourquoi* il a choisi ce changement.

## Ce que la courtière peut faire dans le chat

| Niveau | Action | Exemple de prompt | Sortie |
|---|---|---|---|
| L1 | Poser une question | *"Quelles sont les exclusions de Generali ?"* | Texte + pills assureurs |
| L1 | Comparer en prose | *"Compare les franchises AXA vs Generali"* | Texte + pills (**ne touche pas le tableau**) |
| L1 | Chercher une clause précise | *"Trouve la clause sous-traitance dans les CG d'AXA"* | Extrait + référence (page, section) |
| L1 | Aider à l'argumentaire | *"Quels arguments pour vendre Generali à mon client ?"* | Texte structuré |
| L1 | Préparer une réponse client | *"Mon client demande pourquoi cette franchise. Comment je réponds ?"* | Texte chat |
| L1 | Explorer un scénario | *"Si on prend AXA, qu'est-ce qui n'est pas couvert sur le risque cyber ?"* | Texte + pills |
| L1 | Rédiger un e-mail | *"Génère un email au client pour recommander Generali"* | Texte chat (formaté en e-mail) |
| L1 | Rédiger autre chose | *"Écris-moi un SMS de relance"* / *"Note interne pour mon collègue"* | Texte chat |
| L1 | What-if non-couvert | *"Si je baisse la franchise à 500€, quelle prime ?"* | Refus + CTA "Relancer la cotation" |
| L2 | Réécrire la synthèse | *"Reformule l'argumentaire pour un dirigeant"* | Modif appliquée + message "J'ai reformulé X parce que Y" + reasoning + bouton Annuler |

Plus : copier une réponse, pouce haut / pouce bas, voir le raisonnement de l'agent (repliable).

## Relation chat ↔ synthèse

**Le chat lit la synthèse.** Markdown complet auto-injecté à chaque prompt — toujours la dernière version, y compris les éditions inline faites une seconde avant.

**Le chat modifie directement, puis explique.** Une réécriture (L2.A) modifie la synthèse en place. L'agent poste un message dans le chat qui :
1. Annonce ce qu'il a fait ("J'ai reformulé l'argumentaire pour un ton plus court")
2. Expose son raisonnement (repliable) — quelles sources lues, quelles décisions prises
3. Propose un bouton **"Annuler la modification"** qui restaure l'état précédent

**Granularité section.** L'agent identifie la section cible (`## Argumentaire`, `## Notre recommandation`, etc.) à partir du prompt + des ancres markdown.

**Trace dans le chat.** Chaque modification reste dans le journal — la courtière peut remonter les messages pour comprendre l'historique des changements.

**Édition manuelle libre.** À tout moment la courtière peut éditer la synthèse inline ; l'agent verra l'état post-édition au prochain prompt.

**Ce qu'on ne fait pas :** suggestions IA inline dans la synthèse, parsing AST, carte diff Garder/Annuler. L'IA vit dans le chat.

## Relation chat ↔ documents de la comparaison

### Context auto-injecté (toujours dans le prompt, pas de tool-call)

- **Profil client** (besoins, secteur, taille)
- **Liste des offres** (assureurs + pricing + options)
- **Synthèse actuelle** (markdown complet)
- **Tableau comparatif** (critères × assureurs)

> **À trancher** : les **garanties** et **exclusions** structurées — context auto ou tool-call ? Si volumineux (10 assureurs × 50 clauses), tool-call. Sinon auto.

### Tools exposés (L1)

- **`search_documents(query)`** — recherche dans les conditions générales PDF et autres documents de la cotation. Retourne extraits + références (assureur, page, section). Utilisé pour : retrouver une clause précise, lever une ambiguïté, citer un passage textuel.

L'agent **cite ses sources** : chaque réponse qui s'appuie sur une offre affiche une pill avec le nom de l'assureur ; chaque extrait de doc renvoie sa référence.

## Outils — proposition pour le CTO

### Niveau 1 (MVP)

| Outil | Entrée | Sortie | Effet de bord |
|---|---|---|---|
| `search_documents` | `query`, `scope?` (assureur, type de doc) | Extraits + références | Aucun |

Tout le reste — questions, comparaisons, e-mails, notes, scénarios — est de la **génération de texte dans le chat** à partir du context auto-injecté + (optionnellement) des résultats de `search_documents`. Pas besoin d'un outil par type de sortie.

### Niveau 2 (next)

| Outil | Entrée | Sortie | Effet de bord |
|---|---|---|---|
| `update_synthese` | `sectionAnchor?`, `intent` | Message chat avec explication + reasoning + bouton Annuler | **Mute la synthèse directement.** Snapshot du `before` conservé pour permettre l'annulation. |

### Garde-fou anti-fabrication (comportement, pas outil)

Quand un prompt réclame une donnée absente des documents (typiquement un what-if : *"si je baisse la franchise à 500€, quelle prime ?"*), l'agent **refuse le chiffre** et répond avec un message + CTA *"Relancer la cotation avec ce paramètre"* qui ouvre la préparation pré-remplie.

### Routing — comment l'agent décide

- **Aujourd'hui** : pattern matching mots-clés (fragile : casse sur typos, accents, formulations).
- **Cible** : LLM avec tool calling structuré. Le system prompt liste les outils du niveau actif ; le modèle décide quand appeler `search_documents` ou `update_synthese`.
- **Désambiguïsation obligatoire** : si confiance faible entre plusieurs cibles (ex. "rédige un e-mail" → texte chat vs "réécris l'argumentaire" → modif synthèse), l'agent **demande** au lieu de deviner *avant de modifier*. *"Tu veux un e-mail à part dans le chat, ou je modifie la section argumentaire de la synthèse ?"* — la désambiguïsation devient critique puisqu'il n'y a plus de "Garder/Annuler" pour rattraper une mauvaise interprétation.

## Bug actuel à corriger

Le router actuel traite `rédige` comme un trigger de réécriture-synthèse. Donc *"Rédige un email pour le client"* écrase silencieusement `## Argumentaire`. L'architecture L1/L2 le corrige : par défaut on est en L1 (texte chat), et seul un prompt explicite de modification de synthèse appelle `update_synthese`.

## Hors périmètre MVP

- **Modification du tableau comparatif depuis le chat** (réordonner, filtrer, ajouter/retirer colonnes, mettre en évidence) — passe par l'onglet dédié. Envisageable en v2 mais demande de définir le pattern d'undo sur une structure non-textuelle.
- Raffinement multi-tours après une modification (la courtière ré-émet un prompt)
- Versioning de la synthèse au-delà du journal de chat
- Envoi d'e-mail (juste copier-coller, pas de SMTP / OAuth)
- Portée par sélection de texte ("réécris ce paragraphe surligné")
- Pièces jointes / upload PDF dans le chat
- Mémoire entre cotations
- Persistance backend de la synthèse (aujourd'hui : in-memory)

## Fichiers

- `src/app/quoting/comparison/page.tsx` — page, état synthèse, layout 2 colonnes
- `src/components/quoting/ComparisonSynthesis.tsx` — WYSIWYG + `buildDefaultSynthese()`
- `src/components/quoting/ComparisonChat.tsx` — drawer, messages, composer
- `src/components/quoting/SyntheseEditDiff.tsx` — *(à déprécier)* carte diff Garder / Annuler — remplacée par message d'action + bouton Annuler
- `src/data/chatMock.ts` — backend mock : sessions, override, routing, garde-fou
