# Pre-launch data verification

Picture a broker at her desk on a Tuesday afternoon, ten cotations on her plate. She opens Panora, the AI has pre-filled forty fields across six sections of an RC Pro file. Every section has a green check next to it. She clicks Lancer.

That's the moment we kept thinking about.

## What we noticed

The green check meant *"this passes format validation"* — i.e. the AI returned a string of the right shape. But brokers read it as *"this is correct."* And the AI's failure mode is the worst possible one: it returns confidently plausible-but-wrong values. We've seen it quote an individual when the client is a company, miscount vehicles in a flotte, or guess the wrong NAF code. Once that cotation is transmitted to insurer extranets, the broker is on the hook — both legally and reputationally — for whatever the AI typed.

So we had a label that lied: *ok* claimed two things (format-valid AND verified) but only delivered one (format-valid). And we had a product narrative — *l'IA s'en charge* — that subtly discouraged the broker from being skeptical of what was in front of her.

The challenge: reintroduce broker eye-contact and explicit responsibility without making it feel like the AI failed her or like we're forcing her to do the AI's job over again.

## The shape of the solution

We named the two things separately. The AI is the **author** of the pre-filled data; the broker is the **verifier**. They become distinct visual states. Verification is explicit, sectional, and required — but quiet enough that a senior broker doing her tenth cotation of the day doesn't feel patronized.

### User stories

- **AAU broker, I can see that data was pre-filled by the AI** — so I don't mistake "format-valid" for "verified."
- **AAU broker, I can attest to each section after reviewing it** — so I take explicit responsibility for what goes to insurers.
- **AAU broker, I can edit a section I've already verified** — so I can correct a mistake without losing track of what I'd attested.
- **AAU broker, I cannot launch until every section is attested** — so I can't accidentally ship un-reviewed AI data.
- **AAU broker, I can see at a glance how much is left to verify** — so I can pace my review.
- **AAU broker, I see exactly what's blocking launch in the footer** — so the urgent issues pop in priority order.

## Walking through it

### The banner

When the broker lands on the page, the first thing she sees in the right column is a soft plum banner: *"Pré-rempli par l'IA Panora — IA. À partir de l'e-mail et des documents joints. Vérifiez chaque section avant de lancer — vous restez responsable de l'exactitude auprès des assureurs."*

The plum took us a while to settle on. Pure purple felt too tech-y, too "AI chatbot" — wrong register for a tool that wants to feel like a leather portfolio. We landed on a muted burgundy plum (`#f5ebec` bg, `#75505d` accent) that sits next to the cream neutrals and the deep green like a third member of the palette, not a stranger crashing it. Plum became our reserved AI color; green stays reserved for "human verified." This way the broker can read the page at a glance: *plum means the AI authored this; green means I attested to this.*

Under the banner, a small strip shows `4/6 sections vérifiées · 67%` with one progress dot per section. It's the only place we let ourselves use a quantified progress indicator — not because we love progress bars, but because pacing a six-section review benefits from "how much further." When everything is verified, the banner swaps to a green-light variant with the heading *"Toutes les sections sont vérifiées,"* and the broker exhales.

### The sections

The right column is a vertical stack of sections — Client, Véhicules, Garanties, etc. Each one can be in one of four states, and the visual cue in the header reads them at a glance:

- A **red `!` badge** means *invalid* — the AI returned a string that doesn't parse (bad date, malformed email). The broker has to fix it.
- An **amber `!` badge** means *incomplete* — required fields are missing. We auto-expand these on page load because the broker has work to do inside them.
- An **empty plum-tinted circle** means *pending* — format-valid, AI-filled, awaiting attestation. This is the "todo" state.
- A **green check** means *verified* — the broker has explicitly attested.

We deliberately chose the empty circle for pending. An earlier draft used a sparkle inside a ring; it read as "magical AI moment," which is precisely the wrong tone. The empty circle reads as a checklist item waiting to be ticked — quieter, more humble, and it makes the green check feel earned when it lands.

Sections default to collapsed, except the incomplete ones. Why collapsed? Because if every section were open by default, we'd be presenting forty fields as if they all need attention right now — visually screaming *"the AI failed you, do everything."* Instead we let the broker pace it: she sees six section headers, picks one, opens it, looks, decides.

### Attestation

Inside an open pending section, at the bottom of the field list, there's a quiet strip: *"Vérifiez les valeurs ci-dessus puis confirmez."* with a small **"Marquer comme vérifié"** button.

The button is **only** there inside the expanded section. There is no shortcut button in the header. This was load-bearing: we tried a header affordance during prototyping and watched it become checkbox theater — brokers ticked verify chips from the collapsed view without ever opening the section. Forcing the button to live inside the open section means the broker has to actually navigate to the fields to get to it. Not "looking" in the cognitive sense — we can't enforce that — but at least her eyes pass over the values before she ticks.

We also took out auto-verify. An earlier iteration auto-marked a section as verified when the broker fixed a missing field. The pushback was clean: filling a missing field doesn't mean she reviewed the *other* AI-pre-filled values around it. Fair. So verification stays a separate, deliberate gesture — even if the broker just typed the last value into the section.

Once verified, the section visually settles: green-bordered card, green check in the header, *"Vérifié"* meta, fields rendered as plain text (no pencil icon, no hover affordance, click does nothing). To get back to editing, the broker clicks **"Modifier"** in the verified bottom strip; the section un-verifies, fields unlock, and the bottom strip reverts to the *"Marquer comme vérifié"* prompt. Take-backs are explicit — no accidental drift away from an attested state.

### The launch gate

The footer beneath both columns shows the status line + the launch button. When something's blocking, the status line reads like a punch list with colored marks:

> *Avant lancement — 🔴 1 champ invalide · 🟠 4 champs à compléter · ○ 2 sections à vérifier*

Three colors, three different urgencies:

- **Red filled `!`** for data that's wrong or hard-missing (invalid format, no insurers selected) — the broker can't submit if this isn't fixed
- **Amber filled `!`** for missing fields — the same color the section headers use for incomplete, so the broker's eye can hop between footer and section
- **Plum empty circle** for unverified sections — the same plum as the AI banner, completing the color story

The Launch button stays disabled (40% opacity) until all three counts are zero AND at least one insurer is selected. We considered letting brokers blow through the gate with a *"launch anyway"* confirmation; the call was no, hard gate. We agreed: if the gate is real, it actually changes behavior. If it's a soft warning, brokers learn to dismiss it.

When everything clears, the footer flips green: *"Toutes les sections sont vérifiées."* The button lights up.

### The launch modal

Clicking Launch opens a deliberately lightweight modal: title *"Lancer la cotation ?"* and two buttons (*"Revoir"* and *"Lancer la cotation"*). No checkbox, no summary card, no responsibility paragraph — the broker has already attested per-section, so making her do it again would be patronizing. The modal exists for one reason: a final *"are you sure?"* gate against double-clicks and oh-shit moments.

(There's a heavier variant of this modal at `/quoting/preparation-modal-only`, which we built as a comparison prototype — single modal-level checkbox, no per-section attestation. The team chose the section-by-section approach because it forces real eye-contact, whereas a single checkbox can be ticked without reading. The modal-only page stays around as reference, not as a shipped surface.)

## Design decisions in one place

A few choices that shaped everything:

1. **Verification is explicit, never auto.** No flavor of *"we noticed you touched a field, so we'll assume you verified the section."* That's the AI-doing-the-broker's-job-for-her trap.
2. **Plum for AI, green for verified.** Two reserved colors, each meaning one thing. The page becomes legible without a key.
3. **Collapsed by default.** Lets the broker pace the work and prevents the page from screaming.
4. **Verify lives inside the expanded section, not the header.** Eye-contact gate enforced by structure.
5. **Fields lock once verified.** Take-backs are deliberate (Modifier), not accidental.
6. **Hard launch gate.** Real friction or it's not friction.
7. **Light final modal.** The broker has already attested; the modal is just a commit gate.

## Out of scope (for now)

- **Audit trail.** Verifications live in component state only, not in a backend. If/when compliance wants the attestation log, that's a separate piece of work.
- **AI confidence signals.** Right now every AI-filled field looks equally certain. If the AI starts exposing per-field confidence, low-confidence fields could get a subtle warning inside their unverified section.
- **Critical-field flagging.** Some mismatches — individual-vs-company, vehicle count off by ten — change the entire shape of the quote, not just one field. A future heuristic or AI self-check could surface a dedicated warning before the broker even looks.
- **Copy review.** The French banner copy is a designer-broker first draft. Worth a pass from someone who reads insurance UX daily.

## Where things live

- `src/app/quoting/preparation/page.tsx` — page composition, footer status line, launch gate wiring
- `src/components/quoting/AiVerificationBanner.tsx` — sticky banner + progress strip
- `src/components/quoting/ExtractedDataPanel.tsx` — section states, attestation, field locking
- `src/components/quoting/LaunchConfirmModal.tsx` — confirmation modal (light by default; `requireAcknowledgment` mode for the modal-only variant)
- `src/data/scenarios.ts` — `ExtractedSection.verified` field, `getValidationStats` helper
