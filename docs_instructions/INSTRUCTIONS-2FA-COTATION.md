# Instructions — Itération 2FA sur la page Cotation

## Contexte

Sur la page de détail d'une cotation, chaque assureur sollicité a une **insurer card** avec un statut : `running`, `action_needed`, `done`, `error`.

Le statut `action_needed` affiche déjà une **action box** (fond ambre, icône warning, titre, description, bouton CTA). Aujourd'hui il n'existe qu'un seul cas : "action manuelle sur l'extranet" (ex : sélection de franchise).

L'itération 2FA ajoute **trois nouvelles variantes** de cette action box, pour le cas où l'agent de cotation est interrompu par un écran de double authentification sur le portail assureur.

---

## Principe général

On ne crée pas un nouveau système. On étend le mécanisme `action_needed` existant en ajoutant un champ `type` sur l'objet `action` de chaque assureur. Le rendu dans l'insurer card switch sur ce type pour afficher la bonne variante.

Types possibles :
- `manual` → cas existant, aucun changement (défaut si type absent)
- `2fa_otp` → l'extranet demande un code (SMS, email, TOTP)
- `2fa_push` → l'extranet demande une validation push sur mobile
- `2fa_expired` → la session a expiré, il faut relancer

---

## Flow d'états

```
Agent démarre → [running]
    │
    ▼ détecte écran 2FA
    │
    ├─ OTP requis ──────► [action_needed / 2fa_otp]
    │                          │
    │              ┌───────────┼───────────┐
    │              │           │           │
    │         Code saisi    Timer = 0    Relancer
    │              │           │           │
    │              ▼           ▼           ▼
    │         [running]   [2fa_expired]  [running]
    │                          │         (relogin)
    │                     Relancer
    │                          │
    │                          ▼
    │                     [running] (relogin)
    │
    ├─ Push requis ─────► [action_needed / 2fa_push]
    │                          │
    │              ┌───────────┼───────────┐
    │              │           │           │
    │         "J'ai validé"  Timer = 0   Relancer
    │              │           │           │
    │              ▼           ▼           ▼
    │         [running]   [2fa_expired]  [running]
    │
    ├─ Captcha/Passkey ──► [action_needed / manual]
    │                      (fallback Live View, hors scope)
    │
    ▼
[done] ou [error]
```

---

## Variante 1 — `2fa_otp` (saisie de code)

**Quand** : l'extranet demande un code à N chiffres (SMS, email, authenticator).

**Ce qu'on affiche** dans l'action box :
- Icône verrou (pas warning) — ajouter une icône `lock` au icon set existant.
- Titre : ex "Code de vérification requis".
- Description : ex "Generali demande un code à 6 chiffres envoyé par SMS au 06 •• •• 42."
- **Champ OTP** : N inputs individuels (N = nombre de chiffres attendu, fourni dans les données). Chaque input prend un seul chiffre. Comportements attendus : auto-focus sur le premier, auto-advance au suivant après saisie, retour au précédent sur Backspace vide, distribution automatique si l'utilisateur colle un code complet.
- **Bouton "Continuer"** : style bouton primaire (fond brand, texte blanc). Désactivé tant que les inputs ne sont pas tous remplis. Affiche un spinner pendant la soumission.
- **Timer dégressif** : calculé à partir d'un timestamp d'expiration fourni dans les données. Format "Expire dans X:XX". Change de couleur quand il reste peu de temps (< 2min → ambre, < 30s → rouge). Quand il atteint zéro, l'action box bascule automatiquement vers la variante `2fa_expired`.
- **Lien discret en bas** : si l'extranet supporte le renvoi de code (indiqué par un flag dans les données) → "Renvoyer un code". Sinon → "Relancer la demande 2FA" (relance la connexion complète).
- **État erreur** : si le code est rejeté, afficher un message d'erreur sous les inputs ("Code incorrect, veuillez réessayer"), vider les inputs, re-focus le premier.

**Données attendues dans `action`** : title, desc, portalName, channel (sms/email/totp), codeLength, canResend (boolean), expiresAt (ISO timestamp), interruptId.

---

## Variante 2 — `2fa_push` (validation push)

**Quand** : l'extranet envoie une notification push sur le téléphone du courtier ("Approuvez la connexion").

**Ce qu'on affiche** dans l'action box :
- Même container que 2fa_otp (icône verrou, titre, description).
- **Pas de champ de saisie**. À la place, une zone d'instruction visuelle avec une icône téléphone : "Approuvez la notification sur votre téléphone puis cliquez ci-dessous."
- **Bouton "J'ai validé, continuer"** : même style que le CTA de la variante OTP. Même loading state.
- **Timer dégressif** : identique à la variante OTP.
- **Lien "Relancer la demande 2FA"** en bas : toujours présent (pas de notion de "renvoyer un code" ici).
- **État erreur** : si le backend indique que le push n'a pas été approuvé → message "Validation non reçue. Vérifiez votre téléphone et réessayez." en ambre.

**Données attendues dans `action`** : title, desc, portalName, expiresAt, interruptId.

---

## Variante 3 — `2fa_expired` (session expirée)

**Quand** : le timer a atteint zéro, ou le courtier revient longtemps après et la session n'est plus valide.

**Ce qu'on affiche** dans l'action box :
- Icône horloge (ajouter au icon set) au lieu du verrou.
- Bordure gauche **grise** (pas ambre) → visuellement inactif/terminé.
- Titre : "Session expirée".
- Description : ex "La session de vérification Generali a expiré. Relancez la connexion pour obtenir un nouveau code."
- **Un seul CTA** : "Relancer la connexion" → style bouton outline existant (`btn-w`). Relance le login complet côté agent.
- Pas de timer, pas de champ de saisie, pas de lien secondaire.

**Données attendues dans `action`** : title, desc, portalName.

---

## Modifications du icon set

Ajouter trois icônes SVG au set `I` existant :
- `lock` — cadenas fermé (pour les variantes 2fa_otp et 2fa_push)
- `clock` — horloge (pour la variante 2fa_expired)
- `phone` — téléphone mobile (pour l'instruction de la variante push)

Style : même trait que les icônes existantes (stroke 1.2–1.5, 14×14 ou 16×16, currentColor).

---

## Styles à ajouter

- Classe modificatrice sur l'action box pour le 2FA (bordure gauche ambre, comme l'existant).
- Classe modificatrice pour l'état expiré (bordure gauche grise).
- Styles pour la rangée d'inputs OTP : inputs monospace, centrés, taille confortable (≈40×44px), radius 8px, focus avec ring brand.
- Style d'état erreur sur les inputs OTP (bordure rouge, ring rouge léger).
- Style du timer : taille discrète (12px), tabular-nums, avec classes de couleur pour les seuils (normal → ambre → rouge).
- Style du lien de relance : discret (12px, gris, underline au hover), positionné sous le CTA.
- Style de la zone d'instruction push : fond muted, border-radius 8px, padding, icône + texte.

---

## Interactions et handlers

Trois actions possibles côté front, à câbler en callbacks :

1. **Soumettre un code OTP** : envoie le code + l'interruptId au backend. Si succès → le statut de l'assureur repasse à `running`. Si échec → l'action box affiche l'erreur et reset les inputs.

2. **Confirmer un push** : envoie l'interruptId au backend. Si succès → statut `running`. Si échec → message "Validation non reçue".

3. **Relancer la connexion** : demande au backend de relancer le login complet pour cet assureur. Statut passe à `running` (l'agent recommence, et un nouveau challenge 2FA peut arriver).

---

## Données d'exemple pour le prototype

Ajouter deux cas dans les mock data :

**Generali — OTP SMS** : statut `action_needed`, type `2fa_otp`, code à 6 chiffres, canal SMS, canResend false, expiration dans 5 minutes. Logs : "Connexion extranet Generali" → "Identifiants acceptés" → "Double authentification requise — code SMS envoyé".

**AXA — Push notification** : statut `action_needed`, type `2fa_push`, expiration dans 3 minutes. Logs : "Connexion extranet AXA" → "Identifiants acceptés" → "Notification push envoyée — en attente de validation".

---

## Transition automatique vers `2fa_expired`

Quand le timer atteint zéro dans les variantes `2fa_otp` ou `2fa_push`, la transition vers l'état expiré doit se faire **côté front** sans appel backend : l'action box remplace son contenu par la variante `2fa_expired`. C'est un changement d'état local. Le backend confirmera l'expiration au prochain polling, mais l'UI ne doit pas attendre.

---

## Hors scope

- Notification email au courtier (backend, pas front)
- État de connexion par assureur dans Settings
- Pré-authentification avant lancement de devis
- Intégration mailbox pour captation automatique des OTP
- Live View (fallback supervision)

Ces éléments sont dans la roadmap moyen terme.
