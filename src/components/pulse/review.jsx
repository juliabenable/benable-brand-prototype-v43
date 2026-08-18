import { reviewFor } from './pulseData.js';

/* Brand content review (Aug 10 call + study @4218) — the shared MODEL layer.
   WHO REVIEWS is a per-brand config — the demo pill toggles it:
   'benable' (default — Katie's team approves, the Statusphere-shaped default)
   or 'brand' (the Trilogy model). Decided config for brand mode (Julia):
   nudges only — silence never approves · feedback goes STRAIGHT to the
   creator, and it can't be sent empty · no reject button (Katie's team is
   the escape hatch) · one included change round · the composer steers to
   EDITS — re-filming is a big ask.

   Mechanics: rows with `draftIn` have posts in REVIEW[mode]; each ASSET is
   decided on its own (a creator can send reel + story + TikTok). Decisions
   land on the asset objects (module-persisted, like every demo toggle);
   rows/rail/chips DERIVE their presentation — flip the toggle back to
   Benable-reviews and the Katie-checks world returns untouched.

   The REVIEW UIs live elsewhere: reviewModal.jsx (Amine's modal, default)
   and reviewChat.jsx (direction B). The v42 sheet direction + the login
   ReviewPopup were removed (Julia, Aug 17) — both live on in frozen v42. */

/* craft pass (Interface Craft, Aug 11): chips are words — the icons-off rule */
export const QUICK_FIXES = [
  { label: 'Caption tweak', fill: 'Could the caption also mention …' },
  { label: 'Different cover frame', fill: 'Could the cover be a different frame — maybe …' },
  { label: 'Trim or reorder clips', fill: 'Could the clips be reordered so … opens?' },
  { label: 'Text on screen', fill: 'Could the on-screen text say … instead?' },
];

/* ---- who reviews (module-persisted demo config) ------------------------ */
let reviewMode = new URLSearchParams(window.location.search).get('review') === 'brand' ? 'brand' : 'benable';
export const getReviewMode = () => reviewMode;
export const setReviewMode = (m) => { reviewMode = m; };

/* ---- per-row derivations (all presentation flows from these) ----------- */
export const assetsOf = (c, mode) => reviewFor(mode)[c.name]?.assets ?? [];
export const isReviewRow = (c) => reviewMode === 'brand' && !!c.draftIn;
/* 'pending' | 'partial' | 'approved' | 'changes' */
export const rowReviewState = (c, mode) => {
  const assets = assetsOf(c, mode);
  const undecided = assets.filter((a) => !a.state).length;
  if (undecided === assets.length) return 'pending';
  if (undecided > 0) return 'partial';
  return assets.some((a) => a.state === 'changes') ? 'changes' : 'approved';
};
export const reviewNeeds = (c, mode) =>
  isReviewRow(c) && ['pending', 'partial'].includes(rowReviewState(c, mode));

/* the derived row face for brand-review mode: status line + action label */
export const reviewRowFace = (c, mode) => {
  const assets = assetsOf(c, mode);
  const n = assets.length;
  const state = rowReviewState(c, mode);
  const kinds = n === 1 ? assets[0].kind : `${n} posts`;
  if (state === 'pending')
    return { status: `✨ Her ${n === 1 ? assets[0].kind : `${n} posts`} ${n === 1 ? 'is' : 'are'} in — waiting on your review`, cta: n === 1 ? 'Review her post' : `Review her ${n} posts`, amber: true };
  if (state === 'partial') {
    const done = assets.filter((a) => a.state).length;
    return { status: `👀 ${done} of ${n} posts reviewed — ${n - done} to go`, cta: 'Finish review', amber: true };
  }
  if (state === 'changes') {
    const chg = assets.filter((a) => a.state === 'changes').length;
    return { status: `✏️ ${chg === 1 ? 'One tweak' : `${chg} tweaks`} sent — she’s re-editing`, cta: null, amber: false };
  }
  return { status: `🎉 ${n === 1 ? `Her ${kinds} is approved` : `All ${n} posts approved`} — going live soon`, cta: null, amber: false, approved: true };
};
