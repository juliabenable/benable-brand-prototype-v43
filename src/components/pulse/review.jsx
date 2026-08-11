import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PHOTOS, reviewFor } from './pulseData.js';

/* Brand content review (Aug 10 call + study @4218).
   WHO REVIEWS is a per-brand config — the demo pill toggles it:
   'benable' (default — Katie's team approves, the Statusphere-shaped default)
   or 'brand' (the Trilogy model). Decided config for brand mode (Julia):
   nudges only — silence never approves · feedback goes STRAIGHT to the
   creator, and it can't be sent empty (the coached composer is the guardrail)
   · no reject button (Katie's team is the escape hatch) · one included change
   round · the composer steers to EDITS — re-filming is a big ask (local:
   another visit; product: a full re-shoot), routed to Katie's team personally.

   Mechanics: rows with `draftIn` have posts in REVIEW[mode]; each ASSET is
   decided on its own (a creator can send reel + story + TikTok). Decisions
   land on the asset objects (module-persisted, like every demo toggle);
   rows/rail/chips DERIVE their presentation — flip the toggle back to
   Benable-reviews and the Katie-checks world returns untouched.

   The sheet keeps ONE constant frame: the post stays pinned on the left
   through every step; only the right column switches (verbs → composer →
   celebration/sent) — no modal size-jumping between posts (Julia, Aug 10). */

export const QUICK_FIXES = [
  { label: '✏️ Caption tweak', fill: 'Could the caption also mention …' },
  { label: '🖼 Different cover frame', fill: 'Could the cover be a different frame — maybe …' },
  { label: '✂️ Trim or reorder clips', fill: 'Could the clips be reordered so … opens?' },
  { label: '🔤 Text on screen', fill: 'Could the on-screen text say … instead?' },
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

/* ---- the review sheet -------------------------------------------------- */
export function ReviewSheet({ scene, rows, initial, onClose, onDecide }) {
  const [name, setName] = useState(initial);
  const [assetIdx, setAssetIdx] = useState(0);
  const [step, setStep] = useState('view'); // view | compose | approved | sent
  const [text, setText] = useState('');
  const [noteSent, setNoteSent] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const mode = scene.mode;
  const row = rows.find((c) => c.name === name);
  const assets = row ? assetsOf(row, mode) : [];
  const asset = assets[Math.min(assetIdx, assets.length - 1)];
  if (!row || !asset) return null;

  /* queue math: posts across creators, in table order */
  const reviewRows = rows.filter((c) => c.draftIn && assetsOf(c, mode).length);
  const allAssets = reviewRows.flatMap((c) => assetsOf(c, mode).map((a) => ({ c, a })));
  const flatIdx = allAssets.findIndex((x) => x.a === asset);
  const nextPending = allAssets.find((x) => !x.a.state && x.a !== asset);

  const short = (k) => k.replace(/^IG /, '').toLowerCase(); // "Approve this reel"
  const reshootAsk = mode === 'local'
    ? `${name} would need another visit`
    : 'she’d have to re-film from scratch';

  const openAsset = (c, a) => {
    setName(c.name);
    setAssetIdx(assetsOf(c, mode).indexOf(a));
    setStep(a.state === 'approved' ? 'approved' : a.state === 'changes' ? 'sent' : 'view');
    setText('');
    setNoteSent(false);
  };

  const decide = (kind) => {
    asset.state = kind; // module-persisted, derived everywhere
    onDecide();
    setStep(kind === 'approved' ? 'approved' : 'sent');
  };

  /* suggestion chips pre-fill the note; unpicking removes their line */
  const chipsFor = [...(asset.suggestions ?? []), ...QUICK_FIXES];
  const chipOn = (fill) => text.split('\n').includes(fill);
  const toggleChip = (fill) => {
    if (chipOn(fill)) setText(text.split('\n').filter((l) => l !== fill).join('\n'));
    else setText(text.trim() ? `${text}\n${fill}` : fill);
  };

  const nextBtn = nextPending
    ? <button type="button" className="rv-next" onClick={() => openAsset(nextPending.c, nextPending.a)}>
        {nextPending.c.name === name ? `Next: her ${short(nextPending.a.kind)} →` : `Next: ${nextPending.c.name}’s ${short(nextPending.a.kind)} →`}
      </button>
    : <button type="button" className="rv-next" onClick={onClose}>Done</button>;

  return createPortal(
    <div className="am-veil" onClick={onClose}>
      <div className="am-modal rv-sheet" role="dialog" aria-modal="true" aria-label={`Review ${name}’s ${asset.kind}`} onClick={(e) => e.stopPropagation()}>

        <div className="rv-head">
          <span className="am-avatar rv-ava"><img src={PHOTOS[name]} alt="" /></span>
          <div className="rv-head-names">
            <p className="rv-title">{name}’s {asset.kind}</p>
            <p className="rv-meta">{asset.len} · uploaded {asset.uploaded}</p>
          </div>
          <span className="rv-queue">Post {flatIdx + 1} of {allAssets.length}</span>
          <button type="button" className="rv-x" aria-label="Close" onClick={onClose}>✕</button>
        </div>

        {/* her posts, when she sent several — chip switcher with state dots */}
        {assets.length > 1 && (
          <div className="rv-strip">
            {assets.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`rv-strip-chip${a === asset ? ' rv-strip-chip--on' : ''}`}
                onClick={() => openAsset(row, a)}
              >
                <i className={`rv-strip-dot${a.state === 'approved' ? ' rv-strip-dot--ok' : a.state === 'changes' ? ' rv-strip-dot--chg' : ''}`} aria-hidden />
                {a.kind}
              </button>
            ))}
          </div>
        )}

        {/* ONE constant frame: the post stays pinned left through every step;
            only this right column switches. */}
        <div className="rv-body">
          <div className="rv-media">
            <div className="rv-player">
              <img src={PHOTOS[name]} alt="" />
              <span className="rv-play" aria-hidden>▶</span>
              <span className="rv-len">{asset.len}</span>
            </div>
            <div className="rv-capbox">
              <p className="rv-side-label">Caption</p>
              <p className="rv-caption">{asset.caption}</p>
            </div>
          </div>

          <div className="rv-side">
            {step === 'view' ? (
              <>
                {/* the receipts live on a quiet grey surface that owns the
                    column — not floating text (Julia, Aug 10) */}
                <div className="rv-checkpanel">
                  <p className="rv-side-label">Katie’s team pre-checked</p>
                  <ul className="rv-checks">
                    {asset.checks.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                  <p className="rv-checkfoot">Checked against your brief before it reached you</p>
                </div>
                {/* decisions live bottom-right, dialog-style (Julia, Aug 10) */}
                <div className="rv-verbfoot">
                  <p className="rv-foot">{name}’s excited to post — most brands review within a day or two 💛</p>
                  <div className="rv-verbs">
                    <button type="button" className="rv-change" onClick={() => { setStep('compose'); setText(''); }}>Ask for a change</button>
                    <button type="button" className="rv-approve" onClick={() => decide('approved')}>Approve this {short(asset.kind)}</button>
                  </div>
                </div>
              </>
            ) : step === 'compose' ? (
              <>
                <div className="rv-ask-head">
                  <p className="rv-ask">What should change?</p>
                  <button type="button" className="rv-back" onClick={() => setStep('view')}>← Back</button>
                </div>
                {asset.suggestions?.length > 0 && (
                  <>
                    <p className="rv-side-label">Suggested · from her caption</p>
                    <div className="rv-chips">
                      {asset.suggestions.map((s) => (
                        <button key={s.fill} type="button" className={`rv-chip${chipOn(s.fill) ? ' rv-chip--on' : ''}`} aria-pressed={chipOn(s.fill)} onClick={() => toggleChip(s.fill)}>{s.label}</button>
                      ))}
                    </div>
                  </>
                )}
                <p className="rv-side-label">Quick fixes · no re-filming</p>
                <div className="rv-chips">
                  {QUICK_FIXES.map((f) => (
                    <button key={f.fill} type="button" className={`rv-chip${chipOn(f.fill) ? ' rv-chip--on' : ''}`} aria-pressed={chipOn(f.fill)} onClick={() => toggleChip(f.fill)}>{f.label}</button>
                  ))}
                </div>
                <textarea
                  className="rv-text"
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={mode === 'local' ? 'e.g. “Could the caption mention the hot-stone add-on?”' : 'e.g. “Could the caption mention it’s reef-safe?”'}
                />
                {/* specific feedback is the price of a change request — never sendable empty */}
                <button type="button" className="rv-send rv-send--full" disabled={!text.trim()} onClick={() => decide('changes')}>Send to {name}</button>
                <p className="rv-sendmeta">Goes straight to her · one change round included</p>
                <div className="rv-edu">
                  <span>Need something <b>re-filmed</b>? That’s a bigger ask — {reshootAsk} — so Katie’s team handles those personally.</span>
                  <button type="button" className="rv-katie" onClick={(e) => e.preventDefault()}>Talk to Katie’s team →</button>
                </div>
              </>
            ) : step === 'approved' ? (
              <div className="rv-done">
                <div className="rv-band rv-band--green">
                  <span aria-hidden>🎉</span>
                  <div>
                    <b>Approved — {name} will post it within days.</b>
                    <p>We’ll tell her the good news and track the post for you.</p>
                  </div>
                </div>
                {noteSent ? (
                  <p className="rv-notesent">💌 Sent with the good news — it’ll make her day.</p>
                ) : (
                  <div className="rv-noterow">
                    <input className="rv-note" placeholder="Add a note with the good news? “This made me smile —”" />
                    <button type="button" className="rv-notesend" onClick={() => setNoteSent(true)}>Send</button>
                  </div>
                )}
                <div className="rv-donefoot">{nextBtn}</div>
              </div>
            ) : (
              <div className="rv-done">
                <div className="rv-band rv-band--quiet">
                  <span aria-hidden>💌</span>
                  <div>
                    <b>Sent to {name}.</b>
                    <p>She’ll rework this one once and it’ll pop back here — we’ll keep you posted.</p>
                  </div>
                </div>
                <div className="rv-donefoot">{nextBtn}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
