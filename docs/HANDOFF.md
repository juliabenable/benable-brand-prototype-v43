# Handoff — Campaign dashboard (Brand Portal 2.0) → Nisarg

Everything you need to build the campaign-detail Dashboard, in reading order:

1. **See it live** — https://juliabenable.github.io/benable-brand-prototype-v41/brand/tonypikora/campaigns/46 — use the day scrubber (D1→D30) and the COLLAB TYPE toggle (product | local).
2. **Every state, one page** — https://juliabenable.github.io/benable-brand-prototype-v41/states.html — 12 live frames (each is the real app deep-linked to one state: phases, invites, ship day, rematch, live day, wrap, local).
3. **The spec** — [`Brand Dashboard 2.0 states-and-logic.md`](./Brand%20Dashboard%202.0%20states-and-logic.md) — v2, complete: concepts, tracker states, rematch logic, header status light, table rows, CSV flow, local collabs, stage-history drawer, copy rules, wrap, OPEN items.
4. **Coming from the v37 spec?** — [`Changes since v37 — migration notes.md`](./Changes%20since%20v37%20—%20migration%20notes.md) — the full delta (table redesign, status light, thanks/amber decision, drawer honesty rules, CSV rework, data-model implications).

## Deep-links (handy while implementing)

`?day=1|3|4|9|10|11|16|22|30` · `&mode=local` · `&embed=1` (hides the demo chrome). Example: `/brand/tonypikora/campaigns/46?day=10&embed=1`.

## Where the truths live in this repo

- `src/components/pulse/tableFix.jsx` — the creators table (header light, single-slot rows, ship flow, drawer).
- `src/components/pulse/amine.jsx` — stat row + tracker rail (stages, fills, hints, badges, filters).
- `src/components/pulse/pulseData.js` — every demo state (DAYS/CREW/TIMELINES/LOCAL/NEXT_HINTS) — the per-day fixtures behind the scrubber.
- `src/components/pulse/LiveStatus.jsx` — status motion registers (shimmer/katie/heartbeat/celebrate/facts) — every animation is a claim.

## The five design laws (if a detail is ambiguous, these decide)

1. The tracker's green ramp is the page's **one progress language** (no second meter, no purple/red on progress).
2. **Amber `#f0a32e` = the ball is in the brand's court** — one amber everywhere (dots, badges, header light).
3. **"Say thanks" is a gift, not a chore** — lights the ambers, never enters the "N waiting on you" count, wears the ♥.
4. **Every animation is a claim** — only real work moves; nothing loops decoratively.
5. **Honesty** — the UI only asserts what the system can know (tracking events, creator confirmations, public posts, deadlines we set); future steps only show plans.

Questions → Julia. OPEN items are listed in the spec §11 (promise-sweeper, tooltip on touch, rollout scope…).
