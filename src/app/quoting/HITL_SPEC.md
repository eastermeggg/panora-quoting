# HITL — "L'agent demande la main"

> Design + build spec. Shaped via `/shape`, re-scoped against the real product,
> then reconciled with the PAN-69 reco (the 4-mode model) on 2026-06-17 (branch
> `quote-hitl`). Reflects what's built; the as-built/proposed ledger is at the end.

Picture a broker on a Tuesday morning. She forwards three client emails into
Panora and leaves for a client call. The agent fans each cotation out to several
insurers and works the extranets. On one, Generali offers two broker accounts and
the agent can't tell which to use; on another, Allianz throws a captcha it can't
pass. Neither is a failure: the agent has done everything it can without her. HITL
is how it **sets that one branch on her desk with a tab on the exact thing it
needs, while the other insurers keep going.**

## Where HITL lives (the load-bearing decision)

Two stages, two kinds of HITL:

- **Preparation (`quoting/preparation`) — detection HITL on the left rail.** When the
  agent can't find, or isn't sure of, a left-rail entity (client, assureurs), it puts
  a **simple flag on the field label + a one-line warning** under it. No confirm step:
  the broker just selects/changes the value to clear it. Two levels: *doubt* (best
  guess pre-filled — advisory, doesn't block launch) and *missing* (empty — blocks
  launch on its own, since you can't quote without it). Missing required *fields*
  stay on the existing pre-launch form. Product has no picker yet, so it's deferred.

- **Quote in progress (`quoting/followup?id=cot-XX`) — extranet HITL.** Once the
  run starts, blocks come from the insurer extranets and surface **inside the
  per-insurer `InsurerCard`**, scoped to that one branch. The followup header already
  counts them ("2 actions requises"); the card shows the block when expanded.

## In-progress blocks

Two kinds surface **inside the followup card** (both reprise manuelle). **2FA / session
activation is not an in-card block** — it's handled once per portal at the kanban level
(`ActivateSessionModal`), so it never appears inline in a cotation card.

| Block | Origin | Surface |
|---|---|---|
| **Sélection de compte courtier** | Extranet | **Reprise manuelle** — broker picks the account on the extranet, with an option to remember it |
| **Écran non reconnu (captcha / étape non scriptée)** | Extranet | **Reprise manuelle** — broker does the one blocking gesture, then hands back |
| **Code de vérification (2FA) / session** | Extranet | **Kanban session modal** (`ActivateSessionModal`) — activated per portal, never inline in the card |

### Why account selection is a reprise manuelle, not an in-app list

We can't assume Panora can read the list of broker accounts behind a portal login.
So rather than a clean in-app picker that depends on values we may not have, the
broker **selects the account directly on the extranet** during a scoped takeover.
The takeover observes the choice, so we can still offer **"Utiliser par défaut pour
{assureur}"** to skip the block next time (the just-in-time memory). If the product
later confirms we can read the values, this upgrades to a one-click in-app choice
with no change to the surrounding flow.

## The micro-takeover model

The broker only touches the blocking step, never the whole quotation:

1. The agent pauses **one** insurer branch (the card enters `action_required`); the
   other insurers keep running.
2. The card shows a compact prompt (one line, no screen) with **"Reprendre la main."**
   Clicking it opens a **big centered modal** — the takeover workspace. No extranet
   screen is shown until then.
3. In the modal the broker does the one gesture — pick the account, or pass the
   captcha ("Vous avez la main") — and clicks **"Rendre la main à l'agent."**
4. A brief "Reprise de la cotation…" beat, then the modal closes, the card flips
   back to `in_progress`, and the agent resumes from the next step.

If the agent genuinely can't resume from an arbitrary page state, the same surface
degrades to a full manual takeover for that branch (the existing manual fallback).

## States

- **In progress** — agent working, card streaming its timeline. Default.
- **Action requise** — one branch paused; Cuivre status badge on the card header,
  counted in the followup header. The block names itself in one line.
- **Reprise (takeover)** — broker has the controls; "Vous" badge on the frame.
- **Reprise en cours** — Signal-Vert confirmation; the agent is picking back up.
- **Resumed** — card returns to `in_progress`; for account blocks, optionally
  "Compte mémorisé pour {assureur}."

## Design language

Cuivre is the "needs you" accent (reusing the established action-box treatment,
inset accent included). Signal Vert is reserved for the resume confirmation. Bordeaux
is for the expired session (existing `SessionExpiredModal`). One accent per surface.

## Where it's wired — preparation (detection)

- `src/components/quoting/DetectionNotice.tsx` — exports `FieldFlag` (the label marker)
  and `DetectionNotice` (the one-line warning under the field).
- `src/app/quoting/preparation/page.tsx` — `ClientSelector` and `InsurerSelector` carry a
  detection level (`ok` / `doubt` / `missing`); selecting/changing the value clears it.
  Launch is blocked only by a genuinely empty entity (no client / no insurers).
- `src/components/quoting/KanbanBoard.tsx` — `DetectionPreparationCard`: a board card (driven
  by `Cotation.prepDetection`, seeded as **cot-15**) that states the tasks ("Choisir le client ·
  Choisir l'assureur") and deep-links to the prep page with the matching `?hitl=` flags.
- **Testable via `?hitl=`** on the preparation URL, or the cot-15 card in **En préparation**.

## Where it's wired — followup (extranet)

- `src/data/mock.ts` — `TwoFaAction.type` gains `"reprise_manuelle"` (+ `repriseKind`
  `"compte" | "ecran"`, `screenLabel`, `gesture`). It's the existing `action_required`
  payload, generalized.
- `src/components/quoting/RepriseManuelleBox.tsx` — the inline card prompt (no screen) + "Reprendre la main".
- `src/components/quoting/RepriseManuelleModal.tsx` — the big centered takeover modal (both kinds).
- `src/components/quoting/InsurerCard.tsx` — routes `reprise_manuelle` → the takeover box,
  `manual` → the existing banner. **2FA is no longer routed here** — it's the kanban session
  modal (`TwoFaActionBox` is now unused).
- **Seeded for testing on `quoting/followup?id=cot-2`** (ACME flotte): Generali =
  account selection, Allianz = unknown screen, Axa = done. Expand those two cards.

## Use cases × modes

The blocks, and how a broker resolves each. "Mode" = the interaction surface.

The reco's four modes (silence by default; everything migrates toward mode 0):

| Reco mode | Our surface | Built |
|---|---|---|
| **0 · Auto** (silence) | none — agent completes, devis land | ✅ default |
| **1 · Action in-app** | prep **field flag** (detection) | ✅ |
| **2 · Takeover / modal** | **reprise manuelle** modal (account / captcha) · **kanban session modal** for 2FA (`ActivateSessionModal`) · `SessionExpiredModal` | ✅ |
| **3 · Async email** | launch thread — D1 notify + deep-link, D2 reply-to-resolve | ⏳ proposed |

| Use case | Stage | In-app mode | Email notify (D1) | Email reply (D2) |
|---|---|---|---|---|
| Client doubt / missing | prep | 1 · flag | ✓ | ⚠️ see client note |
| Assureurs doubt / missing | prep | 1 · flag | ✓ | ✅ short answer |
| Missing field | prep | form | ✓ | ✅ value |
| 2FA code / session | kanban | 2 · session modal | ✓ | ✗ time-sensitive (codes auto-forward from the mailbox instead) |
| Account selection | followup | 2 · takeover | ✓ | ➗ only if accounts are enumerable |
| Unknown screen / captcha | followup | 2 · takeover | ✓ | ✗ needs live interaction |
| Session expired | followup | 2 · takeover | ✓ | ✗ live reactivation |

## Levels of required action — the demo walkthrough

The dashboard sorts cotations by how much they need the broker; the followup pages let her
resolve inline. A curated spread (seeded in `mock.ts`) shows the gradient:

| Cotation | Dashboard column | Level | What it shows |
|---|---|---|---|
| **cot-7** Dupont SA | Terminé | 0 · Auto | No action ever; all devis in |
| **cot-13** S. Marchand | En cours | 0 · running | Axa devis in, MAIF still running — no broker action |
| **cot-1** Marble Tech | En cours | 1 · in-app (per-row flag) | One done, one running, Allianz needs the broker |
| **cot-2** ACME flotte | Action requise | 2 · takeover ×2 | Generali (compte) + Allianz (écran); Axa devis already in |
| **cot-4** GreenWay | Action requise | 2 · takeover + results | Generali takeover, with Axa & MAIF devis already received (results-first) |

Action-requise cards show a count line — e.g. cot-4 *"1 action requise · 2 devis reçus"* — so
the level reads at a glance while received devis stay visible (results-first). A cotation with an
insurer still running stays in **En cours** with a per-row flag on the blocked branch (the agent
is still producing quotes, so the broker isn't the sole blocker).

## Email channel (proposed)

The quote is launched by email (`cotation+xxx@panora.co`), so the launch thread is a
natural async channel — it fits the batch-and-walk-away reality. Two sub-modes:

- **D1 · Notify + deep-link** — applies to *every* in-progress block: the agent emails
  "X needs you" with a link back to the exact spot in Panora. Pull-back, not resolution.
- **D2 · Reply-to-resolve** — the broker answers in the thread and the agent applies it.
  Viable only when the block is **answerable in a short message, not time-critical, and
  doesn't need the live extranet**: assureurs, missing field, account-if-enumerable, and
  client *with the caveat below*.

Guardrails for D2:
- **Structured prompt, not open chat** — the email offers numbered / labelled options so the
  reply parses deterministically.
- **In-app stays the source of truth** — the reply is ingested, applied, and logged in the
  cotation's journal; the in-app flag clears. Email is an input, never a separate state.

**Client case — the catch.** Client doubt is mostly **near-identical doublons / triplons in
the base** (same name, one digit of SIREN or a city apart). A free-text reply ("la fiche de
Paris") often **won't carry enough detail to disambiguate**. So for the client case, D2 is
only safe if the email lists the candidates *with their differentiators* (SIREN, city, last
contract) as a numbered choice — otherwise it falls back to in-app (the field flag →
selector, where the broker sees the differentiating context). This is the strongest reason
to keep client resolution **in-app first**, email as a numbered choice at most.

## Test URLs

Dashboard (the levels, scannable) — `/quoting/dashboard`: cot-7 in Terminé; cot-13 & cot-1 in
En cours; cot-2 & cot-4 in Action requise with a "N actions requises · C devis reçu" line. 2FA /
session shows as a **"Réactiver la session"** card → `ActivateSessionModal` (the kanban 2FA modal).

Followup (extranet — InsurerCard) — click a card or hit the URL:
- `?id=cot-7` — mode 0: all devis in, no action
- `?id=cot-13` — Axa devis in, MAIF still running (en cours, no broker block)
- `?id=cot-2` — reprise manuelle: Generali (compte) + Allianz (écran); Axa done
- `?id=cot-4` — Generali takeover + Axa & MAIF devis received (results-first)
- `?id=cot-1` — in-flight: done + running + one block

Preparation (detection — left rail):
- `?scenario=rc-pro&hitl=client-doubt` · `…&hitl=client-missing`
- `?scenario=flotte-auto&hitl=assureurs-missing` · `…&hitl=assureurs-doubt`
- `?scenario=rc-pro&hitl=all`

## As-built vs proposed

**Built:** mode 0 (implicit); mode 1 — prep field flag; mode 2 — reprise manuelle (account /
captcha) + the kanban session modal for 2FA (`ActivateSessionModal`) + session-expired; dashboard
action-count + results-first line; the demo spread (cot-1/2/4/7/13) with corrected followup headers
(`byId` lookup). **2FA is no longer resolved inline in the followup card** (`TwoFaActionBox` retired).

**Proposed (deferred — this prototype has no backend):** mode 3 email (D1 notify + D2 reply);
the memory ratchet (the "Utiliser par défaut" option is UI-only — no persist / apply /
invalidate); instrumentation / interruption-budget; Teams; F1 insurer×produit prerequisites.
The reco's P0 backend (single action object + `open/resolved/expired` state, idempotence /
first-wins, takeover lock) is CTO infra, not modeled here.

## Out of scope (this iteration)

A cross-cotation notification center / digest, plus the proposed items above. The retired
`/quoting/hitl` showcase was a stepping stone and has been removed.
