# v17 wrap-up audit + design studies

A pass-through-everything review of the campaign wrap deck as it stands in v17, with an independent design study for each issue I'd want to take another swing at. Each study is self-contained: current state → what's wrong → proposed change → code shape.

---

## Cross-cutting observations

Before going slide-by-slide, four things show up everywhere:

1. **The deck reads as design-system samples rather than a story.** Slides are crisp individually but the connective tissue between them is thin. A through-line (e.g. one product, one creator's arc, one emotional beat) would tie them.
2. **There's no per-brand theming yet.** Tony specifically asked for this: Dibs Kitchen should look nothing like 28 Litsea. Right now everything uses the same pink/lavender gradient family.
3. **No product surfaces anywhere.** Katie's call called this out — products from the campaign (and ideally the creator's chosen products if multi-product) should be visible. They're currently absent.
4. **The deck has zero "moment" beats** — places where the user pauses, feels something, then moves on. Everything is paced at the same speed and density.

Eight slide-level studies follow.

---

## Study 1 — Cover (visual interest)

### Current
Eyebrow → big serif title "Your campaign report / is ready." → "Check out your results and highlights." → italic campaign label. Dark gradient backdrop.

### Problem
Reads as "text on background." Nothing visual is happening. The dark gradient is moody but uneventful, and there's no hint of *which* campaign this is. A brand viewing this for the first time has no anchor.

### Proposed change
Add **3–5 floating product stickers** to the dark gradient — die-cut PNGs of the actual products this campaign featured (28 Litsea body oil bottle, in this case). Stickers float lazily (3–4s loops, low amplitude), scattered in negative space around the title. Tilted at gentle angles.

Effect: as soon as you open the wrap, you *see* what campaign this is about. Carries directly into Tony's idea of products-as-backbone.

### Code shape
- New `CoverStickers` component, fed `BRAND.products: [{img, tilt, x, y, drift}]`
- CSS: `.gl-cover__stick { position: absolute; animation: gl-drift 4.4s ease-in-out infinite; filter: drop-shadow(0 14px 30px rgba(0,0,0,0.3)); }`
- Reuses the floating-emoji animation pattern; swap emojis for product PNGs.

---

## Study 2 — Content carousel (true rotating ring)

### Current
Cards on a flat arc with `rotateY` (the coverflow attempt). Active card center, neighbors angle inward via Y-rotation, neighbors translateZ back. Reads as a strip moving, not a ring.

### Problem
What Julia described — *"as if the cards are on a sphere/circle that has a foreground and the others move alongside that circle in the background"* — is **not** an arc. It's a full ring viewed from a tilted angle, where cards literally travel around the back. Coverflow only ever shows the front half.

### Proposed change
True **horizontal turntable ring**:
- 8–12 cards arranged at equal angles around a vertical axis (`rotateY(i * 360/N) translateZ(R)`).
- The whole ring continuously rotates around the Y-axis (~12s per full revolution, or stepped every 1.8s to land a new card at "front").
- Camera tilted 15–20° from horizontal (perspective-origin shifted) so you see the ring's top — back cards visible behind the active one.
- Active card = whichever card is closest to the viewer at any moment, identified by minimum |sin(currentAngle)|.
- Active card is scaled 1.04 and given the deep purple shadow.
- Back cards (behind the ring center) are dimmer / smaller via depth math.

### Why this matches the intent
Cards don't slide — they **orbit**. There's a real "behind the active card" position. Cards pass continuously through the foreground and back through the background. Truly infinite.

### Code shape
```jsx
const RING_RADIUS = 280;
<div className="gl-ring" style={{ transform: `rotateY(${spin}deg)` }}>
  {posts.map((p, i) => (
    <div className="gl-ring__card"
         style={{ transform: `rotateY(${i * 360/N}deg) translateZ(${RING_RADIUS}px)` }}>
      ...
    </div>
  ))}
</div>
```
With perspective on the parent (~1600px), perspective-origin shifted slightly up (`50% 35%`), and a CSS keyframe spinning `spin` from 0→-360deg over 12s. Active-card detection in JS for the scale/shadow boost.

### Tradeoff
You see cards from the side as they pass — their face turns away. We can mitigate by limiting the visible arc (mask the back half) or by giving cards `backface-visibility: visible` and accepting that you see the back of cards on the far side. Or: counter-rotate each card by the ring's current angle so they always face camera (billboard) — loses some of the "real ring" feel but stays readable.

---

## Study 3 — Reach (number prominence + heart proportion)

### Current
Eyebrow → big two-line headline ("Over X people / noticed your brand.") → dense dot heart (~4700 dots) → "each dot is one person" → editorial italic quote with attribution. Five elements stacked.

### Problem
The number is *inside* the headline rather than being the hero. The heart and the quote both want attention. With the locked 720px stage, it gets tight vertically and the quote often crowds the heart's bottom.

### Proposed change
Two-column **editorial-stack split** (like the recap reference):
- **Left column** (~45%): editorial eyebrow → enormous `~5,500` in Fraunces 700 with the pink→purple gradient → "people noticed your brand" in clean sans below → small italic quote underneath.
- **Right column** (~55%): the dot heart, centered, taking the full right column height.

The number gets to be huge (`clamp(80px, 12vw, 140px)`). The heart gets to breathe. The quote sits supportingly under the number, never crowding the heart. Reads as one elegant editorial page.

### Code shape
```jsx
<div className="gl-slide gl-reach3">
  <div className="gl-reach3__left">
    <span className="gl-eyebrow">Brand awareness</span>
    <div className="gl-reach3__num">~{fmt(TOTALS.reach.high)}</div>
    <div className="gl-reach3__lbl">people noticed your brand</div>
    <blockquote className="gl-quote">…Byron Sharp…</blockquote>
  </div>
  <div className="gl-reach3__right">
    <HeartDots />
  </div>
</div>
```
CSS: `.gl-reach3 { display: grid; grid-template-columns: 0.85fr 1.15fr; align-items: center; gap: 30px; }`

---

## Study 4 — Engagement (declutter)

### Current
Eyebrow → enormous `5×` → "the industry benchmark" → You/Avg bar → 4 creator avatars row → 3 comment chip-quotes → footer message about Benable sourcing. That's **7** stacked elements competing.

### Problem
Each element is good individually but together they fight for the eye. The viewer doesn't know where to land. The comment chips feel disconnected from the bar; the footer message wants to be the takeaway but reads as a caption.

### Proposed change
**Collapse to 4 elements** with a clear hierarchy:
1. Eyebrow + 5× hero + "the industry benchmark" (current — keep)
2. The You/Avg bar (keep)
3. **One** quote chip — the punchiest single comment (e.g. "Gosh the instant glow 🤩"), bigger and centered, attributed with the avatar + handle. *One* comment > three.
4. Footer takeaway, slightly bigger and bolder: "Because of Benable's sourcing and vetting, 4 handpicked creators drove over 600 people to like, comment, share, or bookmark."

The creator faces row goes away (the footer's "4 handpicked creators" carries the message). Comments collapse from 3 → 1 hero comment.

### Why
The 5× is the headline. Everything else should *support* it, not compete with it. One great comment with avatar reads more honestly than three small ones.

---

## Study 5 — Wall of love (highlight the standout moment)

### Current
4-column grid of 46 cards, all visually identical. Eyebrow "Real excitement, great engagement" → "The wall of love." → grid with bottom mask fade.

### Problem
Every card is treated equally → none stand out. With 46 cards your eye has nowhere to land first. The eyebrow copy is also fairly generic.

### Proposed change
**One hero comment + the wall.**
- Top of the slide: a single highlighted "comment of the campaign" in a bigger card — maybe a 2×2-grid-cell card — with the post photo as a small thumbnail next to it.
- Below: the rest of the wall in 4 columns, same grid as today, with the bottom fade.
- Eyebrow change: from "Real excitement, great engagement" to **"The moment of the campaign"** (or "Top quote from your wall of love"). More specific and earned.

The hero highlights what's MOST loved without losing the abundance feeling of the rest of the wall.

### Code shape
```jsx
<div className="gl-wall__hero">
  <span className="gl-wall__hero-photo" style={{...}}/>
  <blockquote>"Gosh the instant glow 🤩🤩🤩" <cite>@linnyboo88 · TikTok · 14 likes</cite></blockquote>
</div>
<div className="gl-wall">{cards}</div>
```

---

## Study 6 — Katie note (paper feel + tilt)

### Current
Cream postcard, upright, drop shadow, tape on top. Postcard text in Kalam. Avatar + name + role.

### Problem
The postcard reads as a *card on a screen*, not as a *piece of paper*. We lost the -1° tilt that the live version had (the Figma export was upright too, but the live deck had tilt). The tape feels stuck on rather than torn/textured.

### Proposed change
1. **Restore the rotation** — `-1deg` for the postcard, `-2deg` for the tape (already in CSS for the live version; just confirm it's there).
2. **Add a postmark stamp** in the top-right corner — small soft-edged circle stamp with a date and a wavy "BENABLE" mark. Looks like a real postcard.
3. **Subtle paper grain** — a `background-image` with a low-opacity noise texture on top of the cream fill. Makes the paper read as paper, not as flat color.
4. **Soft wrinkle** — a thin `box-shadow: inset 0 0 40px 5px rgba(0,0,0,0.04)` at the edges gives a slight aged-paper depth.

### Code shape
```css
.gl-postcard {
  background:
    radial-gradient(at 0% 100%, rgba(0,0,0,0.03), transparent 40%),
    url("/paper-grain.png") repeat,
    #fffdf7;
  background-blend-mode: multiply;
}
.gl-postcard__stamp { position: absolute; top: 18px; right: 16px; … }
```

---

## Study 7 — Still-growing (a small visual companion to the message)

### Current
Eyebrow → "Your content is still growing." → "All of this content is less than two weeks old…" → bold pull-quote (now from Joe Pulizzi).

### Problem
The slide is all-words. The message *is* about a trend over time, but there's no visual of a trend. The viewer has to imagine the curve.

### Proposed change
Add a **tiny sparkline** between the subtitle and the quote, showing views growing over time:
- A simple SVG line from bottom-left curving up to the upper-right, with a soft fill underneath
- Labels at the start ("today") and the end ("3 months")
- A dotted vertical line halfway showing "now"
- Pink → purple gradient stroke matching the slide

Visual proof of the claim. Doesn't compete with the quote.

### Code shape
```jsx
<svg viewBox="0 0 600 160" className="gl-grow__chart">
  <defs>...gradient...</defs>
  <path d="M0,140 Q150,120 300,80 T600,20" stroke="url(#g)" strokeWidth="3" fill="none"/>
  <path d="M0,140 Q150,120 300,80 T600,20 L600,160 L0,160 Z" fill="url(#fade)"/>
  <line x1="300" y1="0" x2="300" y2="160" stroke="rgba(0,0,0,0.15)" strokeDasharray="4 4"/>
  <text x="6" y="155" font-size="10">today</text>
  <text x="290" y="155" font-size="10">now</text>
  <text x="540" y="155" font-size="10">3 months</text>
</svg>
```

---

## Study 8 — Wrap close (one feel-good beat)

### Current
"That's a wrap" italic serif → "Thank you for trusting us with your first campaign." → "Send a note to Katie" CTA. Dark gradient backdrop.

### Problem
Functional but quiet. After 7 slides of celebration, the very last beat is almost businesslike. There's no payoff moment.

### Proposed change
1. **A small confetti/sparkle burst** on slide enter — 8–12 die-cut shapes (hearts, stars, the brand's product silhouette) sprinkled across the upper half, animating in from the title at the moment of mount, then settling.
2. **Tiny brand-color signature** in a corner — "Made with ♥ by Benable" or just the Benable logo in a soft footer. Closes the loop.
3. Keep the Send-Katie-a-note CTA — that's the right call.

### Code shape
- `Sparkle` component: 12 random absolutely-positioned span elements with `animation: gl-sparkle-in 0.9s cubic-bezier(.2,.85,.3,1.2) forwards; animation-delay: 0.1 + i*0.05s;`. Each fades + scales + tilts in.

---

## Priority for next sprint

If you can only address three things, I'd pick:

1. **Study 2 — true rotating ring carousel** (highest mismatch between intent and current build)
2. **Study 4 — engagement slide declutter** (highest signal-per-pixel improvement)
3. **Study 1 — product stickers on cover** (most directly delivers Katie's request for per-brand differentiation via products)

The rest are quality nudges that compound over many viewings.

---

## What I'm *not* recommending changing

A few things look right and don't need attention:
- The wall-of-love bottom fade — just fixed, working.
- The Instrument Serif quote font — landed well, gives editorial weight.
- The Kalam handwriting on Katie + thank-yous (if you're keeping thank-yous in v2).
- The 4:3 stage and embedded brand-portal layout — Tony confirmed.
- The real platform logos (TikTok / Instagram glyphs) replacing the text characters.
