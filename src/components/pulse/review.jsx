import { createPortal } from 'react-dom';
import { PHOTOS, reviewFor } from './pulseData.js';

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
   and reviewChat.jsx (direction B). The v42 sheet direction was removed
   (Julia, Aug 17) — it lives on in frozen v42. The login ReviewPopup below
   was removed with it, then brought back the same day (Julia). */

/* craft pass (Interface Craft, Aug 11): chips are words — the icons-off rule */
export const QUICK_FIXES = [
  { label: 'Caption tweak', fill: 'Could the caption also mention …' },
  { label: 'Different cover frame', fill: 'Could the cover be a different frame — maybe …' },
  { label: 'Trim or reorder clips', fill: 'Could the clips be reordered so … opens?' },
  { label: 'Text on screen', fill: 'Could the on-screen text say … instead?' },
];

const EMBED = new URLSearchParams(window.location.search).has('embed');

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

/* ---- login-moment pop-up (rematch twin), once per session -------------- */
let popupSeen = false;
export const reviewPopupDue = (scene, rows) =>
  !EMBED && !popupSeen && reviewMode === 'brand' &&
  rows.some((c) => c.draftIn && reviewNeeds(c, scene.mode) && assetsOf(c, scene.mode).length > 0);
export const dismissReviewPopup = () => { popupSeen = true; };

const pendingRows = (rows, mode) => rows.filter((c) => c.draftIn && reviewNeeds(c, mode));

export function ReviewPopup({ scene, rows, onReview, onLater }) {
  const pending = pendingRows(rows, scene.mode);
  const first = pending[0];
  if (!first) return null;
  const totalPosts = pending.reduce((a, c) => a + assetsOf(c, scene.mode).filter((x) => !x.state).length, 0);
  return createPortal(
    <div className="am-veil" onClick={onLater}>
      <div className="am-modal rv-pop" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {/* the waiting posts as a fanned pile — the tease IS the pitch; the
            front card wears the chip, the rest peek out behind */}
        <div className="rv-pop-pile">
          {pending.slice(0, 3).map((c) => {
            const assets = assetsOf(c, scene.mode);
            return (
              <span key={c.name} className="rv-pop-still">
                <img src={PHOTOS[c.name]} alt="" />
                <span className="rv-pop-kind">{assets.length > 1 ? `${c.name} · ${assets.length} posts` : `${c.name} · ${assets[0].kind}`}</span>
              </span>
            );
          })}
        </div>
        <p className="am-modal-title rv-pop-title">
          {totalPosts === 1
            ? `${first.name}’s ${assetsOf(first, scene.mode)[0].kind} is ready for you`
            : `${totalPosts} new posts are ready for you`}
        </p>
        <p className="am-modal-sub rv-pop-sub">
          Katie’s team already checked {totalPosts === 1 ? 'it' : 'them'} against your brief — one quick look and {totalPosts === 1 ? 'it’s' : 'they’re'} on the way to being posted.
        </p>
        {/* actions live at the bottom of the card, never mid-float */}
        <div className="rv-pop-foot">
          <button type="button" className="am-modal-go rv-go rv-pop-go" onClick={() => onReview(first.name)}>
            Review {totalPosts === 1 ? 'the post' : `the ${totalPosts} posts`}
          </button>
          <button type="button" className="rv-pop-later" onClick={onLater}>Later — they’ll wait in your tracker</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
