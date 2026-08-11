import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PHOTOS } from './pulseData.js';
import { assetsOf, QUICK_FIXES } from './review.jsx';

/* Review direction B · the conversation (v43 — Julia, Aug 10, "a little bit
   Insense-style"): the review IS a chat with the creator. Her post arrives as
   a message (9:16 card + caption), Katie's team's brief check reads as a
   system line, and the composer opens PRE-WRITTEN with a warm acceptance —
   sending it as-is approves. Picking a suggestion chip (or "ask for a change
   instead") flips the same message into her one change round. All decided
   rules hold: no reject, one round, nothing sends empty, straight to her.
   Insense precedent (study @4218): content as a chat message type; our twist
   is that the reply is the decision. */

export function ChatReview({ scene, rows, initial, onClose, onDecide }) {
  const [name, setName] = useState(initial);
  const [mode, setMode] = useState('accept'); // accept | change
  const [text, setText] = useState('');
  const threadRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const cmode = scene.mode;
  const row = rows.find((c) => c.name === name);
  const assets = row ? assetsOf(row, cmode) : [];
  const target = assets.find((a) => !a.state) ?? null;

  /* fresh target → fresh acceptance prefill */
  useEffect(() => {
    setMode('accept');
    setText(target?.accept ?? '');
  }, [name, target?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* the thread grows downward — keep the newest in view */
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  if (!row || assets.length === 0) return null;

  /* queue math across creators, table order */
  const reviewRows = rows.filter((c) => c.draftIn && assetsOf(c, cmode).length);
  const allAssets = reviewRows.flatMap((c) => assetsOf(c, cmode).map((a) => ({ c, a })));
  const total = allAssets.length;
  const flatIdx = target ? allAssets.findIndex((x) => x.a === target) : allAssets.findIndex((x) => x.c === row);
  const nextPending = allAssets.find((x) => !x.a.state && x.c.name !== name) ?? allAssets.find((x) => !x.a.state);

  const short = (k) => k.replace(/^IG /, '').toLowerCase();
  const reshootAsk = cmode === 'local' ? `${name} would need another visit` : 'she’d have to re-film from scratch';
  const kindsLine = assets.map((a) => a.kind).join(' + ');

  const chipOn = (fill) => mode === 'change' && text.split('\n').includes(fill);
  const toggleChip = (fill) => {
    if (mode === 'accept') { setMode('change'); setText(fill); return; }
    if (chipOn(fill)) {
      const left = text.split('\n').filter((l) => l !== fill).join('\n');
      if (!left.trim()) { setMode('accept'); setText(target?.accept ?? ''); } else setText(left);
    } else {
      setText(text.trim() ? `${text}\n${fill}` : fill);
    }
  };
  const switchMode = () => {
    if (mode === 'accept') { setMode('change'); setText(''); }
    else { setMode('accept'); setText(target?.accept ?? ''); }
  };

  const send = () => {
    if (!target || !text.trim()) return;
    target.state = mode === 'accept' ? 'approved' : 'changes';
    target.sentMsg = text; // module-persisted, like every decision
    onDecide();
  };

  const openCreator = (c) => { setName(c.name); };

  return createPortal(
    <div className="am-veil" onClick={onClose}>
      <div className="am-modal rvc-sheet" role="dialog" aria-modal="true" aria-label={`Review chat with ${name}`} onClick={(e) => e.stopPropagation()}>

        <div className="rv-head">
          <span className="am-avatar rv-ava"><img src={PHOTOS[name]} alt="" /></span>
          <div className="rv-head-names">
            <p className="rv-title">{name}</p>
            <p className="rv-meta">{kindsLine} · in for your review</p>
          </div>
          <span className="rv-queue">Post {Math.max(flatIdx, 0) + 1} of {total}</span>
          <button type="button" className="rv-x" aria-label="Close" onClick={onClose}>✕</button>
        </div>

        <div className="rvc-thread" ref={threadRef}>
          {assets.map((a) => (
            <div key={a.id} className="rvc-group">
              <p className="rvc-meta">{name} · {a.uploaded}</p>
              <div className="rvc-row">
                <span className="rvc-ava"><img src={PHOTOS[name]} alt="" /></span>
                <div className="rvc-bubble">
                  <div className="rvc-card">
                    <span className="rvc-thumb">
                      <img src={PHOTOS[name]} alt="" />
                      <span className="rvc-play" aria-hidden>▶</span>
                      <span className="rvc-len">{a.len}</span>
                    </span>
                    <div>
                      <p className="rvc-kind">{a.kind}</p>
                      <p className="rvc-cap">{a.caption}</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="rvc-sys">🛡️ Katie’s team checked it against your brief — <b>{a.checks.length} of {a.checks.length} points ✓</b></p>

              {a.state && a.sentMsg && (
                <>
                  <div className="rvc-row rvc-row--brand">
                    <div className="rvc-bubble rvc-bubble--brand">{a.sentMsg}</div>
                  </div>
                  <p className="rvc-sys">
                    {a.state === 'approved'
                      ? <>🎉 <b>{a.kind} approved</b> — she’ll post it within days</>
                      : <>✏️ <b>Change requested</b> — her one round; it’ll pop back here</>}
                  </p>
                </>
              )}
            </div>
          ))}

          {!target && (
            <p className="rvc-sys rvc-sys--close">
              {assets.every((a) => a.state === 'approved')
                ? <>All set — <b>{name} will post within days 🎉</b></>
                : <>All replied — <b>we’ll keep you posted as she reworks it</b></>}
            </p>
          )}
        </div>

        {target ? (
          <div className="rvc-composer">
            {assets.length > 1 && <p className="rvc-target">Replying about · <b>{target.kind}</b></p>}
            <div className="rv-chips rvc-chips">
              {(target?.suggestions ?? []).map((f) => (
                <button key={f.fill} type="button" className={`rv-chip${chipOn(f.fill) ? ' rv-chip--on' : ''}`} aria-pressed={chipOn(f.fill)} onClick={() => toggleChip(f.fill)}>{f.label}</button>
              ))}
              {(target?.suggestions ?? []).length > 0 && <span className="rvc-chipsep" aria-hidden />}
              {QUICK_FIXES.map((f) => (
                <button key={f.fill} type="button" className={`rv-chip${chipOn(f.fill) ? ' rv-chip--on' : ''}`} aria-pressed={chipOn(f.fill)} onClick={() => toggleChip(f.fill)}>{f.label}</button>
              ))}
            </div>
            <textarea
              className="rv-text rvc-text"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={mode === 'change' ? 'Tell her what to change — be specific' : ''}
            />
            <div className="rvc-foot">
              <div className="rvc-foot-l">
                <button type="button" className="rvc-modeswitch" onClick={switchMode}>
                  {mode === 'accept' ? 'Ask for a change instead' : '← Back to approving'}
                </button>
                {mode === 'accept' ? (
                  <p className="rvc-modenote">Sending this approves the post — edit it to make it yours 💛</p>
                ) : (
                  <p className="rvc-modenote">
                    Her one change round · goes straight to her
                    <span className="rvc-modenote-b">Need re-filming? {reshootAsk} — <button type="button" className="rv-katie" onClick={(e) => e.preventDefault()}>talk to Katie’s team →</button></span>
                  </p>
                )}
              </div>
              <button type="button" className="rv-send rvc-send" disabled={!text.trim()} onClick={send}>
                {mode === 'accept' ? `Approve & send` : `Send to ${name}`}
              </button>
            </div>
          </div>
        ) : (
          <div className="rvc-composer rvc-donebar">
            <p className="rvc-modenote">{assets.length > 1 ? 'Both posts' : 'Her post'} reviewed — nothing else needs you here.</p>
            {nextPending
              ? <button type="button" className="rv-next" onClick={() => openCreator(nextPending.c)}>Next: {nextPending.c.name}’s {short(nextPending.a.kind)} →</button>
              : <button type="button" className="rv-next" onClick={onClose}>Done</button>}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
