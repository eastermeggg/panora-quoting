# Présenter et documents personnalisés

L'onglet **Présenter** est l'endroit où la courtière prépare ce qu'elle envoie au client : des formats préfaits (synthèse PDF, tableau Excel, lien dynamique, devoir de conseil) et des documents sur mesure générés par l'agent à partir d'une intention décrite en français.

Règle d'or : **toute génération de document personnalisé passe par l'agent dans une conversation multi-tours.** Que la courtière clique une suggestion dans le tab ou tape sa demande dans le chat, c'est le même flux qui se déclenche — l'agent comprend l'intention, demande la trame, génère, et range le document au bon endroit.

## L'onglet Présenter

Troisième onglet de la page comparaison, après **Synthèse** et **Comparatif**.

Deux blocs verticaux séparés par un divider **OU** :

1. **Quatre cartes d'exports préfaits** — le client part rapidement avec un format standard.
2. **L'Atelier** — la courtière décrit ce qu'elle veut, l'agent le rédige.

### Exports préfaits

| Carte | Ce que c'est | Actions |
|---|---|---|
| **Synthèse** | Présentation lisible et brandée du dossier | Aperçu PDF · Télécharger PDF · Télécharger Word |
| **Tableau comparatif** | Garanties et exclusions à plat | Télécharger XLS |
| **Lien dynamique** | URL partageable à envoyer au client | Aperçu · Copier le lien |
| **Devoir de conseil** | Document préparatoire à la signature | Générer le devoir (ouvre le wizard dédié) |

Ces formats existaient avant (l'ancien dropdown *Finaliser*). On les remonte au premier plan parce que **80 % des envois clients** se font dans un de ces quatre formats.

### Atelier — créer un document personnalisé

Quand les quatre formats ne suffisent pas, la courtière formule une demande sur mesure : un mail soigné pour un dirigeant, un PPT pour une réunion, une note interne pour son équipe.

Au-dessus du pli, dans l'Atelier :
- Un titre éditorial ("**Créez un document personnalisé avec notre agent**")
- Un CTA primaire **Nouveau document** — ouvre une conversation vierge dans le chat
- Quatre **suggestions** en chips : E-mail client · Présentation PPT · Synthèse interne · Exemple de document

Les chips ne sont pas des raccourcis silencieux : chaque chip ouvre la même conversation multi-tours qu'un message tapé dans le chat, juste avec une intention pré-renseignée. Donc la courtière n'apprend qu'un seul modèle mental.

## Deux entrées, un même flux

| Entrée | Geste | Effet |
|---|---|---|
| **Tab Présenter** | Clic sur un chip ou sur *Nouveau document* | L'agent ouvre une conversation dans le chat avec l'intention pré-remplie ; la suite est dans le chat |
| **Chat directement** | *"Génère un mail au client pour recommander Generali"* | L'agent reconnaît l'intention de génération et déclenche la même conversation |

**Le tab n'est pas un formulaire concurrent du chat** — c'est une **rampe d'accès** au chat. La conversation reste l'unique surface de génération.

## Le flux côté courtière

1. **Déclenchement** (chip, CTA ou phrase chat)
2. **L'agent identifie le type de document** — si l'intention est claire (chip ou prompt riche), il enchaîne ; sinon il demande *"Quel type de document ?"*
3. **L'agent demande la trame** — *"Avez-vous un modèle ou une trame existante ? Vous pouvez coller un exemple, décrire le ton, ou répondre 'non' pour partir d'un format standard."*
4. **L'agent génère le brouillon** — le document apparaît à deux endroits en même temps :
   - dans la liste **Documents générés** de l'onglet Présenter
   - sous forme de **carte artefact** dans le chat (clic = ouverture du document)
5. **La courtière ouvre l'aperçu** — vue plein-écran centrée 760 px, navigation `← →` entre documents, bouton Télécharger en haut à droite
6. **Itération** — la courtière peut répondre dans le chat ("plus court", "tutoie le client") ; l'agent re-génère et remplace le document en place

## User stories

- En tant que courtière, je clique sur "E-mail client" depuis l'onglet Présenter et je récupère un brouillon de mail prêt à envoyer en moins d'une minute.
- En tant que courtière, je tape *"prépare-moi un PPT pour ma réunion de demain"* dans le chat ; l'agent comprend que je veux un document sauvegardé (pas juste une réponse texte) et me demande la trame.
- En tant que courtière, je colle ma propre trame de mail dans la conversation ; l'agent l'utilise comme squelette pour générer ce client précis.
- En tant que courtière, quand je dis "non" à la trame, l'agent part d'un format standard maison et je peux ajuster ensuite.
- En tant que courtière, je vois tous mes documents générés pour cette cotation dans le tab Présenter — même ceux générés via le chat il y a deux jours.
- En tant que courtière, je supprime un document que je n'utiliserai pas ; il disparaît de la liste mais la trace dans le chat reste (l'historique de mes conversations est préservé).
- En tant que courtière, je relance la même cotation plus tard, mes documents générés sont toujours là.

## Routage — comment l'agent décide

C'est ici que les deux entrées convergent. Le tab fait passer une **intention pré-renseignée** ; le chat doit deviner l'intention à partir d'un prompt libre.

- **Aujourd'hui** : pattern matching mots-clés (`génère`, `prépare`, `rédige` + `email`/`ppt`/`synthèse`…). Fragile sur les formulations indirectes (*"j'aurais besoin d'un truc à montrer en réunion"*).
- **Cible** : LLM avec tool calling. Le system prompt expose un outil `generate_custom_doc` ; le modèle décide quand l'appeler.
- **Désambiguïsation obligatoire** : le verbe *rédige* est ambigu — il peut vouloir dire "réponse texte dans le chat" (L1) ou "document sauvegardé" (Présenter). L'agent demande avant de déclencher : *"Tu veux que je rédige la réponse ici dans le chat, ou que je prépare un document que tu retrouveras dans Présenter ?"*. La règle : **on ne crée un document persistant qu'avec une intention explicite.**

> Note CTO : cette désambiguïsation est le même chantier que le routing chat ↔ synthèse décrit dans `SPEC.md`. Une fois l'architecture tool-calling en place, les trois cibles (réponse chat, modification synthèse, génération document) se distinguent toutes via la même mécanique.

## Outils — proposition pour le CTO

À adapter — c'est une suggestion de point de départ.

| Outil | Entrée | Sortie | Effet de bord |
|---|---|---|---|
| `generate_custom_doc` | `docType` (email · ppt · synthese_interne · lettre · sms · autre), `intent` (texte libre), `template?` (trame collée par la courtière), `cotParamId` | Document markdown + métadonnées (titre, type, date) | Persiste dans le store de documents générés de la cotation, surfacé dans Présenter ET dans le chat (carte artefact) |
| `regenerate_custom_doc` | `docId`, `instruction` (ex. *"plus court"*, *"tutoie"*) | Nouveau corps de document | Remplace le précédent en place, garde le `docId` (pour ne pas casser la trace chat) |

Pas besoin d'un outil par type — l'agent passe `docType` en argument. Le system prompt liste les types valides et leurs conventions.

## Où atterrissent les documents

Un document généré est identifié par `(cotParamId, docId)`. Il est visible :
- Dans l'onglet **Présenter** → liste **Documents générés**, ordre anti-chronologique
- Dans le **chat** → carte artefact dans le message où l'agent l'a livré (clic → ouvre l'aperçu)
- Persisté dans `sessionStorage` côté front (MVP) ; à migrer vers une persistance serveur quand le multi-device et la collaboration arrivent

Suppression : la carte disparaît des deux surfaces (Présenter + chat), mais le **message d'explication de l'agent reste** dans le chat — la courtière comprend ce qui a été supprimé.

## Aperçu plein-écran

Quand la courtière ouvre un document depuis l'une des deux surfaces, le tab Présenter bascule en **mode preview** : header (Retour · nom du fichier · type · navigation prev/next · Télécharger) + rendu markdown centré 760 px.

Les PowerPoint ne sont pas visualisables en ligne pour l'instant — la vue propose un téléchargement direct.

## Hors périmètre

- **Édition inline dans l'aperçu** — toute modification passe par un nouveau tour de chat avec l'agent (cohérent avec la règle d'or "l'IA vit dans le chat").
- **Partage direct par e-mail / WhatsApp / SMS** depuis le tab — la courtière copie / télécharge, l'envoi se fait dans son outil habituel. À reconsidérer quand l'intégration de messagerie sera prête.
- **Versioning** au-delà du remplacement en place — pas d'historique des brouillons précédents d'un même document.
- **Templates partagés au niveau du cabinet** — chaque trame est passée à la main pour l'instant ; la bibliothèque cabinet est une suite logique mais non incluse ici.
- **Préfiltre par type sur la liste Documents générés** — utile au-delà de ~10 documents par cotation ; pas observé pour l'instant.

## Bug actuel à corriger

Comme dans le routing synthèse (voir `SPEC.md`), `rédige un email pour le client` peut aujourd'hui être happé par le router de réécriture-synthèse. Le passage en tool-calling LLM résout les deux en même temps : `update_synthese` et `generate_custom_doc` sont deux outils distincts, et la désambiguïsation se joue au niveau du tool router, pas du keyword router.
