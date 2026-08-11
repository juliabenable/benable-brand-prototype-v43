# What changed since the v37 spec — migration notes for Nisarg

If you started from the Jul 27 (v37) spec, this is everything that changed through **v41** (Jul 28–29 design rounds). The full current spec is **`Brand Dashboard 2.0 states-and-logic.md`** (v2) — this doc is just the delta, so you can diff your mental model quickly. Every state is browsable at https://juliabenable.github.io/benable-brand-prototype-v41/states.html.

## 1. The creators table was redesigned (biggest change)

| v37 | Now (locked) |
|---|---|
| Column header strip `CREATOR / LATEST UPDATE / STAGE` | **Removed** — the card header's subtitle does the work (status light, §2) |
| 7 purple stage dashes per row | **Ramp dot + stage word** (dot = the tracker stage's exact fill; sentence-case label; **click-to-filter**) |
| ⚑ orange flag + amber text + button inside the update cell | **Calm rows** — no flags, no washes; ONE white **ghost button** in the right slot with a small **amber dot inside** (`Ship and add tracking`, `Confirm visit`, `Review matches`) |
| Solid purple "Review matches" pill on rematch rows | Same ghost-button grammar as everything else (amber dot inside); status reads grey-dot "Match found" |
| "Say thanks" styled like the other action buttons | Ghost button with a **pink pulsing ♥** (`#e25c74`) — joy, not work. No purple, no red anywhere |
| Icon tiles next to card titles (Creators / While you were away / Up next) | **Removed** — titles only |
| Stage dashes replaced by CTA on action rows | The single right slot swaps content by priority: action button → ♥ Say thanks → stage dot+word → wrap state |

Row anatomy now: `avatar 36px · name + verified + handle · latest update · single right slot · chevron`. Action rows still sort to top. Modals still overlay the whole screen.

## 2. Table header = a status light (new)

One-line subtitle under "Creators", priority order:
1. Filtered → `{shown} of {cohort} · {filter}` + "Show all ✕".
2. Real actions waiting → amber dot + **"N waiting on you"** (Say-thanks NEVER counts here).
3. Invites pending → green dot + **"{invited} invited · {accepted} of {spots} spots filled"** + ⓘ **light tooltip** with the spots rule (the v37 header paragraph is gone — the tooltip is the rule's only home).
4. Live-unthanked creators → **amber dot** + **"Nia, Sofia and Jade went live 🎉 — send your thank-yous now"** (>3 names → "Nia, Sofia and 3 more"). No face stack.
5. Wrapped → green "Nothing left to do — campaign wrapped".
6. Default → green "Nothing needs you — everyone's moving".

The static "6 on this campaign" subtitle is retired — counts only live inside sentences.

## 3. Thanks & attention signals (decision changed)

- "Say thanks" never enters the **"N waiting on you" count**, but pending thank-yous DO light the ambers: the header dot (with the went-live message) **and the tracker badge**. So the v37 "thank-you nudge header note" is gone; the amber system carries it.
- The header note "Deepen the relationship and brand love…" is retired.
- On wrap, every row shows a "💌 Sent" stamp and statuses drop their "· thank-you sent 💌" suffix (the stamp carries it).
- **One amber everywhere: `#f0a32e`** (v37's `#e0900f` badge/flag orange is retired).

## 4. Tracker bar tweaks

- Empty future stages: **plain light grey `#eef0f1`** — the v37 hatch/stripes are gone for good.
- Past stages: **lone muted ✓** `#7fa892` + hint **"All N moved ahead"** (was `✓ N/N` + "All N passed this stage").
- All-thanked: count **`6 ✨`**, hint **"Campaign complete!"** (distinct from the Sourcing slot's "All done for now").
- Rematch trigger, sourcing slot states, click-to-filter, no-tooltips: **unchanged**.

## 5. CSV shipping flow (reworked)

- The flow lives **in the card header**: two steps **① Download the order sheet → ② Ship, then add tracking below** + a **white** "Download orders" button. (Two steps, not three — three wrapped on smaller screens.)
- The steps **never change shape**: downloading ticks ① (pale-green ✓ chip, black text) and weights ②. The button never swaps labels.
- Row CTA renamed **"Ship and add tracking"** (was "Mark shipped"); modal asks *"Have you shipped {name}'s order?"* + tracking number. Row buttons sit at ~55% opacity until the sheet is downloaded.
- **Visibility rule (new):** the flow only renders when the visible rows contain the waiting orders (See-all / needs filter / Accepted focus) — hidden when the table is focused on Sourcing etc.

## 6. Stage-history drawer (expanded row — heavily reworked)

- Now shows **all 7 stages** including **Thanked**; labels use the tracker's names, with **"Live!"** for stage 6. On wrap day everything reads done.
- Now-step: solid green `#2e9e6b` dot, subtle halo, **no ping/pulse ring**, green label + "right now" + live status.
- **Tense honesty rules (new, hard):**
  - done detail = a fact that stays true forever ("Delivered Jul 24") — no forward clauses;
  - the current step may carry the forward flavor ("Delivered Jul 24 — shoot confirmed for Saturday");
  - future steps show only plans (per-stage `NEXT_HINTS` or a specific known plan like "Scheduled for delivery Thursday") — never past-tense facts;
  - only knowable facts anywhere (tracking, creator confirmations, public posts, deadlines we set) — no creator quotes/feelings, no invented scenes, no carrier trivia ("cleared the Memphis hub" is banned).
- Order shipped steps show the **arrival ETA**; Order delivered shows delivery date (or scheduled date when future).
- Reached Live → underlined link **"See the live post(s) ↗"** — plural when the creator has several posts (one link, landing on all).
- Drawer opens/closes with a smooth height animation; closed drawers pause all inner animations.

## 7. Local collabs (enriched)

Transitions unchanged from v37 (email → Confirm visit + date → auto-Visited when the date passes). New: local stage histories speak the real visit flow (grounded in the Trilogy spas onboarding call): weekday visits, service picked at booking, practitioner-consent filming, draft ~7–10 days after the visit. Zero product/shipping vocabulary anywhere in local mode.

## 8. Copy & status changes

- Vetting language = **quality checks only** (drop "brand-safety"/"disclosure" from brand-facing copy).
- Shipping statuses merge shipped + ETA on one line: "Shipped Tuesday — arriving Thursday".
- Wrap stat: plain green **100%** + "campaign complete!" with a 🎉 that bounces once (no gradient, nothing loops).
- Wrap band: "All 6 live — every thank-you sent" + green **"🎁 See your wrap-up"** CTA; rows get solid-green avatar rings and "See her post(s) ↗".
- Day-16-style statuses rewritten knowable-only.
- Rail cards (While you were away / Up next) trimmed to the table's type scale (13px notes).

## 9. Data-model implications (what the backend needs to expose)

- Per creator: current stage · latest status event · **action flag** (ship / confirm-visit / review-matches) · **published-unthanked flag** (lights ambers but excluded from the "waiting on you" count) · **posts[]** (for the plural link) · timeline events with dates · arrival ETA / delivery date from tracking · visit date (local).
- Spots: `invited count` + `accepted count` (= spots filled) + the rematch formula inputs (creator_declines, admin_declines).
- CSV: all orders + live `needs shipping / shipped` status column.
- Every dated promise shown ("arriving Thursday", "Draft due Sunday") needs a refresh/expiry mechanism — see OPEN items in the main spec (§11).

## Unchanged from v37 (still authoritative)

Rematch trigger formula & privacy rules · stage-transition table (§5 of v37 ≈ §§3/6-7 of v2) · While-you-were-away / Up next content rules (verifiable claims, nudges surfaced, views >1k, quotes >50 likes, top post = likes+comments, no link metrics) · pre-campaign phases (Stay Tuned / We Found N) · "Katie's team" voice rules · deliberately-out-of-v1 list.
