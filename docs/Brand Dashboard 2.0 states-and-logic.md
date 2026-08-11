# Campaign dashboard — states & logic (v2 spec for Nisarg)

Source of truth: the **v40 prototype** (https://juliabenable.github.io/benable-brand-prototype-v41/brand/tonypikora/campaigns/46) + Julia's Jul 27–29 working sessions. Every state is browsable live in the **states gallery**: https://juliabenable.github.io/benable-brand-prototype-v41/states.html (each frame is the real app deep-linked to one state).

v2 supersedes the Jul 27 (v37) spec — the creators table was redesigned (design study + review rounds, Jul 28) and locked in v40. Where logic is still open it's marked **OPEN**.

---

## 1. Concepts

- **Campaign types.** Every campaign is either a **product collab** (creator receives a product — fulfilled via Shopify *or* manually via CSV) or a **local collab** (creator visits the business — spa, salon, restaurant…). The type changes the middle stages and all copy (see §7). In the prototype this is the COLLAB TYPE toggle; in production it's a campaign attribute.
- **Spots (deliverable).** The contracted number of creators for the campaign. Invites sent may exceed spots. Rule shown to the brand: *the first `spots` creators who reply are matched; extras are **held for the next campaign*** — never auto-invited (the next brief may not fit them).
- **Stages.** One creator is in exactly one stage. Product: `Invited → Accepted → Order shipped → Order delivered → Draft approved → Content published → Thanked`. Local: same with `Confirmed → Visited` replacing the two order stages. The tracker bar also draws a permanent leading **Sourcing** slot (not a creator stage — a system state).
- **Design laws** (hold everywhere): the tracker's green ramp is the page's **one progress language** · **amber = the ball is in the brand's court** — and only that · **"Say thanks" is a gift, not a chore** — it never enters the "N waiting on you" count, but pending thank-yous do light the amber signals (header dot + tracker badge; decided Jul 29) · no red, no purple on progress · every animation is a claim — only real work moves · **honesty**: the UI only asserts what the system can actually know (tracking events, creator confirmations, public posts, deadlines we set).

## 2. Tracker bar — column states

Every column = count slab + stage label + hint (hint = *what's happening now*; label = what has already happened). Columns are click-to-filter for the creators table; amber badges are click-to-filter for "needs you". No hover tooltips.

| State | When | Slab | Count | Hint |
|---|---|---|---|---|
| **Past** | every active creator is *beyond* this stage | pale green `#eff5f1` | a **lone muted ✓** `#7fa892` (no numbers) | **"All N moved ahead"** |
| **Occupied** | ≥1 creator currently here | green ramp fill | count of creators here | stage-specific, e.g. "3 packages in transit", "2 visits booked", "Creator will post soon" |
| **Future (empty)** | stage not reached yet | plain light grey `#eef0f1` — one shade below the `#f9fafb` pane, **no stripes, no outline** | muted grey `0` | forward-looking, e.g. "Once Katie's team approves drafts" |
| **Needs you** | ≥1 creator here needs brand action | as occupied | as occupied | + **amber badge** with the count (centered, 20px); click filters to those creators |

When **every** creator reaches Thanked, the Thanked count reads **`6 ✨`** with hint "Campaign complete!" (distinct from the Sourcing slot's "All done for now"). One amber everywhere: `#f0a32e` (badges, dots, header light).

**Sourcing slot** (always drawn, always leftmost, never more than one — even if several spots are being sourced):

| State | When | Rendering |
|---|---|---|
| **Done / idle** | campaign underway, nothing being sourced | pale-green slab, lone **green ✓**, hint **"All done for now"** |
| **Sourcing…** | rematch in progress | pale green `#dbeee3`, hint "(Re)matching you with creators" — no promises, no names |
| **Matches found** | rematch candidates ready | label "Matches found", hint "New profiles to review", **amber badge** → needs-you filter |

**Badge vs header light (resolved Jul 29):** both agree — published-unthanked creators light the tracker badge AND the header's amber dot (with the went-live message), while the "N waiting on you" count remains reserved for real work actions.

## 3. Sourcing / rematch

Rematch (sourcing) starts **only** when the campaign can no longer be filled from the invites already out:

```
max_possible_fills = invites_sent − creator_declines − admin_declines
start sourcing  ⇔  max_possible_fills < spots
```

- `creator_declines` = creators who declined the invite; `admin_declines` = creators we declined in admin (e.g. ghosted).
- **Slow replies never trigger sourcing** — we nudge instead. There is **no "Request more" button**; we detect the shortfall and source ourselves.

**Rematch found = a brand to-do:**
- Table row (**sorted to the top**): blurred teaser avatar · title **"New match found"** · subtitle **"To fill your campaign"** · amber status "Match found" · ghost **"Review matches"** button (amber dot inside). **Never a creator name** (invites may exceed spots; decline privacy). Row does not expand.
- Bar: "Matches found" + amber badge. While-you-were-away: "Replacement matches found — profiles ready for your review"; Up next: "Pick who you want to add to this campaign — waiting on you"; recap closer CTA "Review matches".
- Clicking review opens the match-review flow (same as initial creator review).

## 4. Creators-table header — the status light

There is **no column header strip** (CREATOR/UPDATE/STAGE removed) and no icon tiles. The card header = title "Creators" + a one-line subtitle that works as a **status light**, priority order:

1. **Filtered** → `{shown} of {cohort} · {filter label}` + a "Show all ✕" button on the right.
2. **N actions waiting** (excluding Say-thanks) → amber dot + amber **"N waiting on you"**.
3. **Invites pending** → green dot + `"{invited} invited · {accepted} of {spots} spots filled"` (bold segment) + an **ⓘ** with a **light tooltip** (white card, border `#e3e3e3`, soft shadow, small arrow): *"First {spots} to reply take the spots — extras are saved for your next campaign."* This tooltip is the spots rule's only home — never a paragraph or footnote in the chrome. **OPEN:** tooltip needs a tap/click affordance for touch devices.
4. **Creators live this week (unthanked)** → **amber dot** + **"Nia, Sofia and Jade went live 🎉 — send your thank-yous now"** (no face stack). Cap the name list: at >3, "Nia, Sofia and 3 more went live 🎉".
5. **Wrapped** → green dot + "Nothing left to do — campaign wrapped".
6. **Default** → green dot + "Nothing needs you — everyone's moving".

The cohort count ("6 on this campaign") never appears as a static subtitle — counts only live inside sentences that use them.

## 5. Creators-table rows (locked layout "K")

Columns: `avatar (36px) · name + verified + handle · latest update (live status) · single right slot · chevron`. Rows are calm — **no washes, no left accents, no flag glyphs** — and click-expand into the stage-history drawer (§8). Action rows sort to the top.

The **single right slot** renders, by priority:
1. **Brand action pending** → white **ghost button** (border `#e3e3e3`, radius 999) with a small **amber dot inside** + label: `Ship and add tracking` (CSV) / `Confirm visit` (local) / `Review matches` (rematch). Ship buttons sit at ~55% opacity until the order sheet is downloaded (§6).
2. **Published, unthanked** → ghost button with a **pink pulsing ♥** (`#e25c74`, gentle 2.2s scale pulse) + "Say thanks". Same ghost anatomy — the heart is the only signal this is joy, not work.
3. **Otherwise** → **ramp dot + stage word** (dot = the stage's exact tracker fill; sentence-case label; click filters the table to that stage). Sourcing rows: grey dot + "Sourcing…".
4. **Wrap day** → green dot + "Thanked" + a small "💌 Sent" stamp; "See her post ↗" rides at the end of the update text. Avatars wear a **solid green ring**.

Button/dot and label sit on the same x-axes as the status dots/words of neighbouring rows (everything aligns vertically).

Status copy on action rows stays short (~25 chars) — it shares the row with the button. Pop-ups overlay the whole screen, never just the card.

## 6. Non-Shopify (CSV) fulfillment — the brand ships

Shopify campaigns skip all of this (shipping is observed automatically). For CSV campaigns, when ≥1 creator has an order waiting:

- The **card header** grows the flow (header placement is the locked pick — no separate band): the two steps **① Download the order sheet → ② Ship, then add tracking below** (two, not three — three wrapped on smaller screens), plus a **white "Download orders" button** (down-arrow icon).
- The steps **never change shape**. Downloading ticks step ① (✓ in a pale green chip, text black) and hands the "now" weight to step ②. The download button stays the **same button** before and after (no "get the sheet again" swap).
- **Visibility rule:** the flow (steps + button) only renders when the **visible rows** contain the waiting orders — i.e. on "See all", the needs-you filter, or the Accepted stage focus. Focused on Sourcing or any other stage: hidden.
- CSV columns: `Creator, Handle, Product, Shipping status` (`needs shipping` / `shipped`), reflecting marks in real time.
- Each waiting row's ghost button **"Ship and add tracking"** → modal *"Have you shipped {name}'s order?"* with a **tracking number** field. With the tracking number, **we** track the delivery and flip Order shipped → Order delivered automatically.
- When a creator reaches Accepted, the brand gets a notification that this creator's product needs to be sent.

## 7. Local collabs

Stages `Order shipped / Order delivered` become **`Confirmed / Visited`**. Nothing anywhere may mention product picks, packages, or shipping.

| Transition | Trigger |
|---|---|
| Accepted → Confirmed | the creator **emails the brand** to arrange the visit. The brand clicks the row's "Confirm visit" ghost button → pop-up prompts for the **visit date** → confirmed. The date is stored for follow-ups |
| Confirmed → Visited | **automatic once the visit date passes** (kicks off follow-up texts + the content countdown) |

Grounding (Trilogy/TSH spas call, Jul 28): creators pick their service (e.g. massage vs facial) when booking; brands prefer **weekday visits** (quiet spa, no guests in frame); practitioners must consent to filming; draft content typically lands **7–10 days after the visit** — often faster. Local stage histories speak this flow ("Emailed you — visit set for Tuesday 2pm", "Visited Tuesday 2pm — deep-tissue massage"), never products.

Copy swaps: bar hints Accepted "N booking visits" · Confirmed "N visits booked" · Visited "N creating content". Up next: "You have 3 creators visiting next week", "First creator to visit — tomorrow". While you were away: "3 creators visited this week", "Sofia emailed you — set her visit date" (closer CTA "Confirm visit").

## 8. Stage-history drawer (expanded row)

Opens/closes with a smooth height animation (no snap). Contents = **all 7 stages**, mirroring the tracker:

- **Labels** = the tracker's stage names for the campaign type — with two renames in the drawer only: stage 6 is **"Live!"**, stage 7 is **"Thanked"**.
- **Step states** derive from the creator's current stage: before = green ✓ chip + date; current = solid green dot (`#2e9e6b`, subtle halo, **no ping/glow animation**) + green label + "right now" + the row's live status underneath; after = dashed circle + "up next". On wrap day, **everything is done** (nothing is "right now").
- **Tense honesty (hard rules):**
  - A **done** step's detail is a fact that stays true forever: "Delivered Jul 24", "Picked SPF 50 Tinted", "Accepted in under 5 hours". Never a forward-looking clause ("shoot confirmed for Saturday" must NOT survive on a passed step).
  - A **current** step may add the forward flavor (a `now` variant): "Delivered Jul 24 — shoot confirmed for Saturday", "Picked SPF 50 Tinted · arriving Thursday".
  - A **future** step only says what's *planned*, from a per-stage default set (`NEXT_HINTS`, per campaign type) or a specific known plan ("Scheduled for delivery Thursday", "Draft due Sunday"). Never a past-tense fact.
  - Only **knowable** facts anywhere: tracking events, creator confirmations relayed by Katie's team, public posts (an unboxing story, a BTS teaser), deadlines we set. No creator feelings/quotes, no off-platform scenes ("filmed at the beach"), no logistics trivia ("cleared the Memphis hub").
- **Order shipped** steps carry the **arrival ETA** when tracking provides one; **Order delivered** carries the delivery date (done) or scheduled delivery (future).
- Once **Live!** is reached (current or done), the step shows a subtle underlined link **"See the live post ↗"** → the creator's post. **OPEN:** creators with multiple posts need a plural treatment (link list or "See her posts").
- Default future hints (product): invite on approval → waiting on reply → product pick + shipping label → delivery (we watch the tracking) → draft + quality pre-checks → **"Post goes live — we track how it's doing for you!"** → "Your thank-you — right after she posts". Local swaps the middle for booking/visit lines.

## 9. Row statuses (latest update) & copy registry

- Motion registers: `shimmer` = machine working now · `katie` = human present · `celebrate` = live 🎉 (emoji bounces, words still) · `facts/static` = quiet truths. Only real work moves; `facts` never rotate.
- Shipping statuses merge shipped + ETA on one line: **"Shipped Tuesday — arriving Thursday"**.
- Vetting language = **quality checks only** ("Reel submitted — checking quality…") — no "brand-safety", no "disclosure" wording in brand-facing copy.
- Draft submission is never a stage move — vetting appears as status; **Draft approved** happens only when Katie's team approves; its subtitle is "Creator will post soon" (no dates — creator delays can't be promised away).
- Nudges we send are always surfaced in While-you-were-away ("4 filming nudges sent — everyone knows their deadline").
- **While you were away / Up next rules** (unchanged from v1): verifiable claims only; count stages, never say "all/last X" unless literally true; declines are reassurance ("we're already sourcing replacements"); views only >1,000 total; comment quotes only when the post has >50 likes (**OPEN:** AI positive-comment classification); top post = **likes + comments**, never views; **no link metrics, ever**; the closer is one CTA when the brand owes an action, otherwise a green all-clear with an honest horizon.
- Voice: operational claims say **"Katie's team"** (never solo Katie); Katie's first person only in her signed cursive notes. Vague-but-honest timing for creator-controlled steps ("usually within 48h", "this weekend"); real dates only for what we control or observe.

## 10. Phases & wrap

- **Day ~1 (sourcing phase):** no dashboard — "Stay Tuned!" empty state; the portal header pill flips to amber **"Recruiting"**.
- **Shortlist ready (review phase):** "We Found N creators who are a great fit" + Review Creators CTA. Cohort review **never** renders inside the creators table.
- **Wrap (campaign complete):**
  - Stat: plain green **100%** + caption "campaign complete!" with a 🎉 that bounces **once** on arrival (no gradient, nothing loops).
  - Green band on the table: "All 6 live — every thank-you sent" + subtitle + a green **"🎁 See your wrap-up"** button → the wrap-up experience.
  - Rows: solid-green avatar rings, "Thanked" status dot (same column as every other day), "💌 Sent" stamp, "See her post ↗", statuses become results ("Top post — 63 likes & comments") with any "thank-you sent" suffix stripped (the stamp carries it).

## 11. Deliberately out of v1 / OPEN

- **Brand content-approval step** — design exists, deferred (per-brand flag incoming for clients like Trilogy who want day-of approval); v1 drafts are approved by Katie's team only.
- Delay explanations; draft-submitted as a visible stage; per-creator "Request more"; link/affiliate metrics; sub-1k views; sub-50-like quotes.
- **OPEN:** tracker amber badge must exclude Say-thanks (align with the header light, §2) · **promise-sweeper** — every dated promise on the page ("arriving Thursday", "Draft due Sunday") needs a background job that updates/expires it before it can go stale; prerequisite for real data · multi-post "See her post" plural (§8) · ⓘ tooltip on touch (§4) · header live-list truncation at >3 names (§4) · rollout scope (all campaigns vs new only) · CSV shipped-marking events feeding creator notifications · local visit-date edge cases (creator reschedules).
