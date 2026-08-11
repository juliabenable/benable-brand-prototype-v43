# v4 — Education-first Rights flow

Status: drafted autonomously while the user was offline. **Open questions
at the bottom — confirm before treating as final.**

## Goal

The current Rights tab (inherited from v3) is an oversimplification: "Organic
✓ included" + a one-click "$200 paid" toggle. v4 reworks it around one core
job: **brand education**. Most brands don't know what they can already do with
creator content, or where/how they're allowed to use it. The Rights tab should
*teach* first and *transact* second.

Scope is deliberately small (the full UGC-rights marketplace guide is far too
big). v4 ships: organic explainer, simple paid tiers, instant-buy vs.
make-an-offer.

## Where this lives

Inside the existing Creator Hub modal → **Rights tab** (`RightsPanel` in
`src/components/CreatorHubModal.jsx`). Rights remain **per-post** (carry the
v3 model); the carousel selects the post.

## Structure (top → bottom)

### 0. Scope line (kept from v3)
"Rights apply to **this post** — Reel · 1 of 2. Flip the carousel to license a
different one."

### 1. Organic — "Good news, you can already use this"
Reframe as an unlock, not a restriction (the key insight: brands don't realise
they already have these rights).

- Headline, celebratory, green check.
- **Where you can use it** — concrete examples, not jargon:
  - ✓ Your website — *embed the Reel on your homepage or a landing page*
  - ✓ Email — *drop it in a newsletter*
  - ✓ Organic social — *repost to your own feed or stories*
  - ✓ Product pages — *show it on the product detail page*
- **Not included** (the upsell hook), plainly stated:
  - ✗ Paid ads (boosting / running it as an ad) → see Paid below
  - ✗ Posting from the creator's own handle (whitelisting) → "more options
    coming"
- One-line educational caveat: *"Heads up: trending audio in Reels may not be
  cleared for paid ads — organic reposts are fine."*

### 2. Paid — "Want to run it as an ad?"
Education first: plain-language explanation + platform context ("Run this Reel
as an ad on Instagram, TikTok & Facebook — feed, Stories, and Reels
placements").

Three duration tiers (selectable cards):

| Tier | Price | Sets expiry |
|------|-------|-------------|
| 1 month | $50 | Active until <today+1mo> |
| 3 months | $100 | Active until <today+3mo> |
| 6 months | $200 (Best value) | Active until <today+6mo> |

Buy mechanism depends on the creator's `instantLicensing` flag:

- **Instant creator (⚡):** "Accepts instant licensing" → **Buy now — $X** →
  immediately `active` (receipt). Airbnb Instant-Book analogy.
- **Offer creator (✋):** "Reviews each request" → **Make an offer**. We
  pre-fill the suggested price (= the tier price) and show *why* we know it's
  the going rate:
  - inputs: follower tier, engagement rate, usage type (paid), duration
  - a comparable range ("Similar Benable deals: $75–$110")
  - editable amount; lowball nudge ("Below typical range — may be declined")
  - **Send offer — $X** → `pending` → simulated creator accept after ~3s →
    `active`.

### 3. States (per post, per `postKey`)
- `none` → education + buy/offer UI
- `pending` → "Offer sent · $X · awaiting <creator>" + the suggestion recap;
  auto-resolves to `active` after ~3s (sim)
- `active` → receipt: post, channels, window, **expiry date**, price, and how
  acquired (instant / accepted offer). "Turn off" for demo reset.

## Data model

`paidRights[postKey]` evolves from `boolean` to:

```
{
  status: 'pending' | 'active',
  mode: 'instant' | 'offer',
  tier: '1mo' | '3mo' | '6mo',
  price: 50 | 100 | 200,
  acquiredAt: ISO,
  expiresAt: ISO
}
```

Per-creator demo metadata (not an "action", not cleared by the reset FAB):
`instantLicensing` derived deterministically from the handle so it's stable.
For the main demo creator (@rmtfka / Julia Brandy8) → **offer** mode, so the
suggested-price reasoning (the "we know our shit" moment) is what shows by
default. A hash bucket assigns instant vs. offer for other handles.

Suggested-price/creator-stats helper synthesises stable demo numbers from the
handle (followers → tier, engagement %). Transparent formula:
`base(tier) adjusted by duration` → equals the published tier price; the
panel shows the inputs + a ± range so it reads as informed, not arbitrary.

`getRelationshipSummary` / Dashboard strip + reset FAB updated to treat the
richer paid-rights object (status active vs pending) correctly.

## Out of scope (explicitly)
Whitelisting, exclusivity, perpetual buyouts, the rights ledger/asset library,
real creator counter-offers, FTC/claims compliance system. Whitelisting shown
only as a "coming" teaser to keep the model extensible.

## Confirmed decisions (user answered 2026-05-15)
1. **Organic = free 30 days, extendable.** Brands can buy longer organic
   usage (tiers: 3mo $15 / 6mo $25 / 12mo $40). Progressive disclosure —
   "Keep it longer →" reveals the duration picker.
2. **Paid platforms = Meta + TikTok** (shown as "Instagram, TikTok &
   Facebook ads").
3. **Offer response = simulated** — auto-accepts ~3s after sending.
4. **Bundle added.** Scope toggle at the top of the Rights tab: "This post"
   vs "All N posts". Bundle = same action applied to every post from that
   creator at a **30% discount** (savings shown on each tier).
5. Instant vs. offer = fixed per creator, deterministic from handle.

## Design pass (user: "think Airbnb, very simple explanations")
Rewrote the Rights tab styling + copy: two calm white sections ("Where you
can use this" / "Run it as an ad"), generous whitespace, hairline dividers,
segmented scope control, clean selectable tier chips (dark selection
border), one solid full-width primary button, plain one-line microcopy,
progressive disclosure for organic extend. New `.rt-*` CSS namespace; old
`.hub-rights*` styles removed.
