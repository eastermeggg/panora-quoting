# HITL — Full recommendation: in-app resolution **and** the email channel

> The complete picture of how the cotation agent gets unblocked when it needs the broker.
> It covers both what the prototype shows (the **in-app** surfaces) and what it can't render
> (the **email channel** — the agent pinging the broker by email, and the broker answering
> directly in the email). Synthesizes the PAN-69 spike reco with what's actually built here.
> Companion to `HITL_SPEC.md` (build status) — this is the why + the unseen part.

---

## 1. The principle (one sentence)

**The agent never interrupts by default. When it must, the block becomes a single *action* —
one object, opened on several doors at once (Panora, email, Teams); the first door that
resolves it closes the others. And every resolution teaches a default, so the system gets
quieter every week.**

Three commitments this must hold to:
1. An agentic cotation is **never longer** than a manual one.
2. Interruptions **decrease** over time (the memory ratchet), they don't scale with volume.
3. **No silent block** — a required action is always visible and always recoverable.

The broker works in **batch**: she forwards client emails, launches, and walks away. So the
system's real job is to **pull her back precisely** — and, where it safely can, to let her
resolve **without coming back at all** (the email channel).

---

## 2. When the agent needs the broker (catalogue)

Two questions route everything: **time-sensitive?** and **resolvable without a live screen?**

| Family | Situation | Stage | Time-sensitive | Live screen needed |
|---|---|---|---|---|
| Detection — entity | Client / insurer / product not identified or ambiguous (the doublon) | Pré-lancement | No | No |
| Detection — data | A field required by the *insurer's* form, absent from our brief | Pré-lancement | No | No (a value / a file) |
| Extranet — access | 2FA / session, captcha, unusual IP | En cours | **Yes** | **Yes** |
| Extranet — UI | Broker-account choice (PAN-60), unscripted screen | En cours | No (unless session) | Sometimes |
| Result | Refusal, exclusions, referral to underwriter | En cours | No | N/A — **info, not an action** (digest, never `action_required`) |
| Commitment | Subscription, RIB, validation | En cours | No | N/A — hard confirmation in-app |

---

## 3. The four modes

| Mode | Who acts | Where |
|---|---|---|
| **0 · Auto** | Agent alone | Nowhere (silence) — the goal state |
| **1 · Action in-app** | Broker, in Panora | Prep field flag, or the cotation card / action box |
| **2 · Takeover live** | Broker, hands on the extranet | Modal + live browser (high cost — context switch) |
| **3 · Async — email / Teams** | Broker, outside the app | A reply to a structured message |

Sense of travel: **everything migrates toward mode 0.** A block resolved once in mode 1/2/3
should leave a memory so the next run is mode 1 or 0.

---

## 4. In-app resolution — *what the prototype shows*

This is the visible half, built and clickable in the prototype:

- **Preparation (detection).** When the agent can't identify the **client** or **assureurs**, the
  field is flagged (`FieldFlag` + a one-line warning); the broker selects the value to clear it.
  Missing entities block launch; a "doubt" is advisory. It also surfaces on the **board** as a
  *"Nouvelle demande"* card stating the tasks (*Choisir le client · Choisir l'assureur*) that
  deep-links to the prep page with the right flags.
- **Quote in progress (extranet).** Inside the cotation card, **reprise manuelle** (a centered
  takeover modal) handles **account selection** and the **unscripted screen / captcha**: the
  broker takes the controls for one gesture, then hands back and the agent resumes.
- **2FA / session is handled at the board level**, not inline — the kanban session modal
  (`ActivateSessionModal`), activated once per portal, releases every cotation waiting on it.
- **Results-first.** Action cards state the concrete action (*Choisir un compte · Generali*),
  and never hide received devis (*"2 devis reçus"* stays visible while one branch is blocked).

The board reads as a gradient of how much each cotation needs the broker: *Terminé →
En cours (a branch flagged) → Action requise (broker is the blocker)*.

---

## 5. The email channel — *what we can't see in the prototype*

The prototype has no mail backend, so this half is invisible in the mock — but it's central to
the recommendation, because the cotation is **launched by email** (`cotation+xxx@panora.co`),
so the thread already exists and reaches the broker wherever she is.

Email plays **two distinct roles**, and they must not be confused:

### 5.1 D1 · Door — *notify + deep-link* (available for every action)
The agent emails *"X needs you on cotation Y"* with a link straight to the exact spot in Panora.
This is **pull-back, not resolution** — the broker clicks through and resolves in the app. It
applies to **all** blocks, including the ones that can only be resolved live (2FA, captcha,
takeover): for those, the email is purely the doorbell.

### 5.2 D2 · Reply-to-resolve — *the broker answers in the email* (only when safe)
The agent asks a **closed question** in the email and the broker **answers in the thread**; the
agent parses the reply, applies it, and the action closes — she never opens the app. This is the
"can't see" capability the prototype can't demonstrate.

A block qualifies for D2 **only if it passes all five tests:**
1. **Bounded answer** — a number, a yes/no, a short value, or an attachment. No free judgement.
2. **Decidable from the message alone** — no need to see Panora or the extranet to answer.
3. **Latency-tolerant** — minutes/hours are fine; no expiring session, no captcha clock.
4. **Parsable, idempotent, low-risk** — a misread reply is recoverable; applied exactly once; logged.
5. **No commitment** — not a legal/financial act that demands an in-app ceremony.

Fail #1 or #2 → **Panora** (in-app). Fail #3 → **takeover**. Fail #5 → **Panora + hard confirmation.**

### 5.3 Which blocks can be resolved by email reply

| Block | D1 notify | D2 reply | How D2 works |
|---|---|---|---|
| Assureurs not detected | ✓ | ✅ | "Répondez 1=Axa+Generali, 2=…" |
| Missing field / document | ✓ | ✅ | a short value, or a file attached |
| Product / formula ambiguous | ✓ | ✅ | numbered choice |
| Account selection (enumerable) | ✓ | ✅ | numbered choice of accounts |
| **Client doublon** | ✓ | ⚠️ | only as a **numbered list with differentiators** — see 5.4 |
| Account selection (not readable) | ✓ | ✗ | takeover |
| 2FA / captcha / session | ✓ (doorbell) | ✗ | time-sensitive + live → in-app |
| Subscription / RIB | ✓ | ✗ | hard confirmation in-app |
| Refusal / exclusions | — | — | a **digest**, not an action |

### 5.4 The client-doublon catch (the load-bearing nuance)

Client ambiguity is mostly **near-identical doublons/triplons in the base** — same name, one
digit of SIREN or a city apart. A free-text reply (*"la fiche de Paris"*) usually **doesn't
carry enough to disambiguate**. So for the client case, D2 is safe **only** if the email lists
the candidates **with their differentiators** (SIREN, ville, dernier contrat) as a numbered
choice. If it can't, fall back to in-app, where the broker sees the differentiating context.
This is why client resolution stays **in-app first**, email as a numbered choice at most.

### 5.5 Two rules that make remote resolution actually work
- **The agent always pre-frames a closed choice** — never an open question. Disambiguation
  (e.g. the doublon list) is done *before* sending, not left to free text.
- **Always a deep-link of last resort** — a reply that doesn't parse falls back to a link that
  lands on the right spot in Panora. Email is the fast path; Panora is the net.

### 5.6 Notification rhythm (for D1)
- **Silence by default.** Interrupt in real time **only** when time-sensitive **and**
  non-recoverable (captcha / 2FA push). Everything else accumulates without urgency.
- **Digest, not drip.** Rate-limit; one grouped email per cotation; escalate, don't spam.
- **Notify immediately at the block** (the agent can't know how long it will wait), relance after
  a delay, and **timeout → clean abandon** past a threshold (never wait indefinitely).

### 5.7 Teams = email's twin
Same underlying action, better UX where the cabinet lives in Teams: **Adaptive Cards with
buttons remove the parsing risk** (she clicks "Cabinet A", no free text). Email first (universal),
Teams an activable option for Microsoft cabinets — reusing the exact same action.

---

## 6. Multi-channel mechanics — one action, several doors

This is the backbone the email channel needs, and it's entirely backend — the prototype mocks
only the in-app door, so none of this is visible in the mock:

- **Single source of truth = the action's state** (`open / resolved / expired`). Every door —
  Panora, email, Teams — reads and writes the **same** object.
- **First-wins + idempotence.** The agent applies a resolution **exactly once**. An email reply
  arriving after an in-app resolution is a no-op ("déjà réglé"); a deep-link to a resolved action
  shows "c'est fait".
- **Cross-channel closure.** Resolve anywhere → the in-app box collapses **and** the email/Teams
  thread closes.
- **Security of the remote channels.** Anti-spoofing, reply validation/parsing (Teams buttons
  reduce risk), idempotent application, PII discipline in the content, and a who/what/when audit.

---

## 7. The memory ratchet — what reduces HITL over time

The central asset. Never configure everything cold at onboarding (config in a vacuum, soon stale,
abandoned). Prefer **configuration by demonstration**:

```
takeover / choice (mode 1–2)  →  agent observes the gesture  →  offers "se souvenir pour {assureur}"
                              →  writes a preference  →  next run: mode 1 (choice) or mode 0 (auto)
```

Two decisions to get right or it backfires:
- **The memory key (granularity).** Broker account ≈ per insurer (or insurer × cabinet); a
  field/doc/formula ≈ per insurer × product (or × client). Too broad → a wrong default applied
  silently (worse than asking). Too fine → re-asking every time.
- **Invalidation / fallback.** When the memory no longer holds (Generali adds a 3rd account), it
  must be **detectable as stale** (remembered value no longer in the list → drop back to takeover
  and re-learn) and **overridable** without friction.

Learnable for the extranet-UI choices (stable, observable). **Not** learnable for captcha/2FA
(each is unique → pure takeover). Detection inputs are **pulled** from VEOS / attached docs, not
learned from a takeover.

> In the prototype, the takeover modal already *offers* "Utiliser par défaut pour {assureur}" —
> but it's UI-only; the persist / apply / invalidate layer is the proposed backend work.

---

## 8. Technical constraints to validate with engineering

- Reliable **run resume** after the human acts (don't "lose the page"); one **takeover lock** at a
  time; minimal serialized state for takeover (URL, step, screenshots, DOM anchors, session).
- **Idempotent resolution API** + the action-state model in §6.
- **Email/Teams**: inbound parsing + anti-spoofing + idempotent reply + audit.
- **Timeouts** and the **manual-degradation** path (uncovered/broken extranet → switch to manual
  quotation, an internal alert, not a broker task — cf. PAN-114).
- **Instrumentation** (the cheapest, most structuring P0): time vs manual, % "0 interruption",
  cumulative takeover time — without it, "silence by default" can't be steered.

---

## 9. Sequencing (openable as tickets)

| Priority | Deliverable | Why |
|---|---|---|
| **P0** | Single action object + state, first-wins, idempotence, cross-channel closure | The socle of multi-channel; without it the doors collide |
| **P0** | Instrumentation (PostHog events + dashboard) | Steer "silence by default"; cheapest, most structuring |
| **P0** | Interruption policy: urgent/non-urgent + silence-by-default + count/digest | Anti-spam frame, immediate effect |
| **P0** | Memory ratchet: observe → "se souvenir" → apply (key + invalidation) | Turns recurring blocks into silence; resolves PAN-60 durably |
| **P1** | Robust takeover (captcha / 2FA push) + lock + timeouts | Real blocking, non-learnable cases |
| **P1** | In-app resolution: prep detection + reprise manuelle (built in prototype) | The everyday surface |
| **P1** | **Email**: D1 door (notify + deep-link, rate-limited, grouped) + D2 reply (enumerable choices, attachments) + parser + deep-link fallback + security review | The universal remote channel |
| **P2** | **Teams** (Adaptive Cards, buttons) reusing the same action | UX upgrade for Microsoft cabinets, zero parsing |

---

## 10. As-built (prototype) vs proposed

**Built & visible in the prototype** (the in-app half):
- Prep detection field flags + board "Nouvelle demande" detection card → prep deep-link.
- Reprise manuelle takeover (account selection + captcha/unscripted screen).
- Kanban session modal for 2FA; dashboard action-count, concrete action labels, results-first.

**Proposed & not visible** (the "can't see" half — the focus of this doc):
- **Email channel** — D1 notify + deep-link, **D2 reply-to-resolve** (the agent pings, the broker
  answers in the email), with structured closed prompts and the doublon caveat.
- **Teams** twin (Adaptive Card buttons).
- **The action object + state + first-wins/idempotence** backbone that makes multi-channel safe.
- **Memory ratchet** persistence (apply + invalidate), instrumentation, manual-degradation flag.

These are deliberately backend/infra and live outside the prototype; this document is their spec.
