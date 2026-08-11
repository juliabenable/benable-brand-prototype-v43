import { useEffect, useState } from 'react';
import { PolaroidPostcard } from './Postcards.jsx';
import {
  getCreatorState,
  savePostcard,
  setReCollab,
  setReCollabNote,
  getReCollabNote,
} from '../utils/postcardStorage.js';

const ANIM_DURATION_MS = 4600;
const PUBLIC_MAX = 80;
const PRIVATE_MAX = 180;

/**
 * v6 Say-thanks popup — three steps in one modal:
 *   1. View the creator's content (Instagram-style card)
 *   2. Say thanks (public testimonial + private note, both pre-drafted)
 *   3. Re-collab question (decline / later / favorite)
 *
 * Triggered from the content tile *or* the dashboard row.
 */
export default function SayThanksPopup({
  campaignId,
  creator,
  posts,
  brandName,
  onClose,
  onChanged,
}) {
  const existing = getCreatorState(campaignId, creator.handle);
  const firstName = creator.name.split(' ')[0];

  const [step, setStep] = useState(1);              // 1 | 2 | 3
  const [idx, setIdx] = useState(0);                 // carousel index for step 1
  const [sending, setSending] = useState(false);     // overlay-on-modal animation
  const [postcard, setPostcard] = useState(existing.postcard);
  const [reCollab, setReCollabLocal] = useState(existing.reCollab);
  const [declineNote, setDeclineNote] = useState(() => getReCollabNote(campaignId, creator.handle));
  const post = posts[idx] || posts[0] || {};

  // pre-drafted messages + editable signature. Defaults come from the
  // campaign brief — Ana (founder of Pikora) and her photo from the
  // brief's "Note from the Brand" card. Both editable in step 2.
  const draftPublic = `${firstName} was a dream to work with — top-level content.`;
  const draftPrivate = `OMG ${firstName} you killed it — your captions had me laughing out loud. Thank you 🤍`;
  const defaultSignature = `Ana, ${brandName}`;
  const defaultAvatar = 'https://cdn.voyagela.com/wp-content/uploads/2025/06/c-1749328220467-1749328220095_ana_lander_ana_byemferreti1.jpg';
  const [publicMessage, setPublicMessage] = useState(existing.postcard?.publicMessage ?? draftPublic);
  const [privateMessage, setPrivateMessage] = useState(existing.postcard?.privateMessage ?? draftPrivate);
  const [signature, setSignature] = useState(existing.postcard?.signature ?? defaultSignature);
  const [signerAvatar, setSignerAvatar] = useState(existing.postcard?.signerAvatar ?? defaultAvatar);

  // Escape + body lock
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape' && !sending) onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [sending, onClose]);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  const onBackdrop = (e) => { if (e.target === e.currentTarget && !sending) onClose(); };

  // File picker for swapping the signer's photo on the postcard.
  // Mirrors the Edit pencil pattern used in the brief — click the avatar,
  // pick an image, it shows up immediately on the polaroid + gets saved
  // with the postcard record.
  const pickSignerPhoto = () => {
    if (sending) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setSignerAvatar(reader.result);
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const send = () => {
    setSending(true);
    setTimeout(() => {
      const record = {
        style: 'polaroid',
        publicMessage,
        privateMessage,
        signature,
        signerAvatar,
        sentAt: new Date().toISOString(),
      };
      savePostcard(campaignId, creator.handle, record);
      setPostcard(record);
      setSending(false);
      onChanged && onChanged();
      setStep(3); // auto-advance to re-collab
    }, ANIM_DURATION_MS);
  };

  const pickReCollab = (value) => {
    setReCollabLocal(value);
    setReCollab(campaignId, creator.handle, value);
    onChanged && onChanged();
  };
  const updateDeclineNote = (note) => {
    setDeclineNote(note);
    setReCollabNote(campaignId, creator.handle, note);
  };

  const done = () => onClose();

  return (
    <div className="stp-overlay" role="dialog" aria-label={`Say thanks to ${creator.name}`} onClick={onBackdrop}>
      <div className="stp-modal">
        <header className="stp-top">
          <div className="stp-id">
            <span className="stp-av">{creator.avatarInitial}</span>
            <div>
              <div className="stp-name">{creator.name}</div>
              <div className="stp-handle">{creator.handle} · {posts.length} post{posts.length === 1 ? '' : 's'}</div>
            </div>
          </div>
          <Stepper step={step} setStep={(n) => !sending && setStep(n)} />
          <button className="stp-close" onClick={() => !sending && onClose()} aria-label="Close" disabled={sending}>×</button>
        </header>

        <div className="stp-body">
          {step === 1 && (
            <StepView
              posts={posts} idx={idx} setIdx={setIdx} post={post} creator={creator}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <StepThank
              firstName={firstName}
              brandName={brandName}
              post={post}
              posts={posts}
              postcardSent={postcard}
              publicMessage={publicMessage}
              setPublicMessage={setPublicMessage}
              privateMessage={privateMessage}
              setPrivateMessage={setPrivateMessage}
              signature={signature}
              setSignature={setSignature}
              signerAvatar={signerAvatar}
              onPickSignerAvatar={pickSignerPhoto}
              onBack={() => setStep(1)}
              onSkip={() => setStep(3)}
              onSend={send}
              sending={sending}
            />
          )}

          {step === 3 && (
            <StepReCollab
              firstName={firstName}
              value={reCollab}
              onPick={pickReCollab}
              declineNote={declineNote}
              onDeclineNoteChange={updateDeclineNote}
              onBack={() => setStep(2)}
              onDone={done}
            />
          )}

          {/* Send animation overlays the modal body — modal stays visible */}
          {sending && (
            <div className="stp-send-layer" aria-label="Sending thank you">
              <div className="send-anim-stage">
                <div className="send-anim__envelope">
                  <div className="send-anim__envelope-back" />
                  <div className="send-anim__card-clip">
                    <div className="send-anim__card">
                      <PolaroidPostcard
                        thumbnailUrl={post.thumbnailUrl}
                        platform={post.platform}
                        brandName={brandName}
                        message={publicMessage}
                        signoff={`— ${signature}`}
                        signerAvatar={signerAvatar}
                      />
                    </div>
                  </div>
                  <div className="send-anim__envelope-front" />
                  <div className="send-anim__envelope-flap" />
                  <div className="send-anim__envelope-seal" />
                </div>
                {Array.from({ length: 10 }).map((_, i) => (
                  <span key={i} className={`send-anim__cp ${i % 2 ? 'send-anim__cp--square' : 'send-anim__cp--round'}`} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- stepper ---------- */
function Stepper({ step, setStep }) {
  const labels = ['View', 'Say thanks', 'Re-collab'];
  return (
    <div className="stp-stepper" role="tablist" aria-label="Steps">
      {labels.map((lbl, i) => {
        const n = i + 1;
        return (
          <button
            key={lbl}
            type="button"
            className={`stp-stepper__btn ${step === n ? 'on' : ''} ${step > n ? 'done' : ''}`}
            onClick={() => setStep(n)}
            aria-selected={step === n}
            role="tab"
          >
            <span className="stp-stepper__n">{step > n ? '✓' : n}</span>
            <span className="stp-stepper__lbl">{lbl}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Step 1: View — single Instagram-desktop card (image flush to caption) ---------- */
function postRatio(platform) {
  const p = (platform || '').toLowerCase();
  if (p.includes('reel') || p.includes('stor') || p.includes('tiktok')) return '9 / 16';
  return '4 / 5';
}
function StepView({ posts, idx, setIdx, post, creator, onNext }) {
  const single = posts.length === 1;
  const ratio = postRatio(post.platform);
  // Image arrows are reserved for *within-post* navigation (a single IG
  // post can be a multi-image carousel). For the demo, our posts are
  // single-image, so the on-image arrows stay hidden — post-list
  // navigation lives in side arrows flanking the card.
  const postImages = post.images && post.images.length > 1 ? post.images : [];
  const hasImageCarousel = postImages.length > 1;
  const prevIdx = (idx - 1 + posts.length) % posts.length;
  const nextIdx = (idx + 1) % posts.length;
  return (
    <div className="stp-step stp-step--view">
      <div className="stp-step__hd">
        <h3>Take a look at what {creator.name.split(' ')[0]} made</h3>
        <p>Browse {posts.length === 1 ? 'the post' : `all ${posts.length} posts`} before you send a thank-you.</p>
      </div>

      <div className={`stp-view-stage ${single ? 'stp-view-stage--single' : ''}`}>
        {!single && (
          <button
            type="button"
            className="stp-view-nav stp-view-nav--prev"
            onClick={() => setIdx(prevIdx)}
            aria-label={`Previous post (${prevIdx + 1} of ${posts.length})`}
          >
            <span aria-hidden="true">‹</span>
          </button>
        )}

        <article className="stp-view-card">
          <div className="stp-view-card__media" style={{ aspectRatio: ratio }}>
            {post.thumbnailUrl ? (
              <img src={post.thumbnailUrl} alt="" className="stp-view-card__img" />
            ) : (
              <div className="stp-view-card__img stp-view-card__img--placeholder" />
            )}
            {/* Only render image arrows when this post is a multi-image
                carousel — otherwise users would have two competing nav
                models on the same view. */}
            {hasImageCarousel && (
              <>
                <div className="stp-view-arrows">
                  <button aria-label="Previous image">‹</button>
                  <button aria-label="Next image">›</button>
                </div>
                <div className="stp-view-dots">
                  {postImages.map((_, i) => <span key={i} className={i === 0 ? 'on' : ''} />)}
                </div>
              </>
            )}
          </div>

          <aside className="stp-view-card__side">
            <header className="stp-view-card__side-head">
              <span className="stp-view-card__av">{creator.avatarInitial}</span>
              <div className="stp-view-card__who">
                <b>{creator.name}</b>
                <small>{post.platform || 'Post'}{post.timeAgo ? ` · ${post.timeAgo}` : ''}</small>
              </div>
              <span className="stp-view-card__more" aria-hidden="true">···</span>
            </header>
            <div className="stp-view-card__side-body">
              <p className="stp-view-card__caption">
                <b>{creator.handle.replace(/^@/, '')}</b> {post.caption || ''}
              </p>
            </div>
            {post.postUrl && (
              <footer className="stp-view-card__side-foot">
                <a className="stp-view-card__link" href={post.postUrl} target="_blank" rel="noopener noreferrer">
                  View original post ↗
                </a>
              </footer>
            )}
          </aside>
        </article>

        {!single && (
          <button
            type="button"
            className="stp-view-nav stp-view-nav--next"
            onClick={() => setIdx(nextIdx)}
            aria-label={`Next post (${nextIdx + 1} of ${posts.length})`}
          >
            <span aria-hidden="true">›</span>
          </button>
        )}
      </div>

      <footer className="stp-foot">
        <span className="stp-foot-spacer" />
        <button className="stp-primary" onClick={onNext}>♥ Say thanks →</button>
      </footer>
    </div>
  );
}

/* ---------- Step 2: Thank (postcard + public + private + signature) ---------- */
function StepThank({
  firstName, brandName, post, posts,
  postcardSent, publicMessage, setPublicMessage, privateMessage, setPrivateMessage,
  signature, setSignature,
  signerAvatar, onPickSignerAvatar,
  onBack, onSkip, onSend, sending,
}) {
  const viewOnly = !!postcardSent;
  const sigUsed = postcardSent?.signature || signature;
  const avatarUsed = postcardSent?.signerAvatar ?? signerAvatar;
  // All of this creator's post thumbnails → drives the polaroid's
  // single / offset-peek / pile photo layout.
  const photoList = (posts || [post]).map((p) => p?.thumbnailUrl).filter(Boolean);
  return (
    <div className="stp-step stp-step--thank">
      <div className="stp-step__hd">
        <h3>Send a thank you to {firstName}</h3>
        <p>Two notes in one — a public thank-you that lands on {firstName}'s testimonials, and a private message just for them.</p>
      </div>
      <div className="stp-thank-row">
        <div className="stp-thank-card">
          <PolaroidPostcard
            photos={photoList}
            platform={post.platform}
            brandName={brandName}
            message={publicMessage}
            signoff={sigUsed ? `— ${sigUsed}` : undefined}
            signerAvatar={avatarUsed}
            onSignerAvatarClick={viewOnly ? undefined : onPickSignerAvatar}
          />
        </div>
        <div className="stp-thank-fields">
          {viewOnly ? (
            <div className="stp-sent">
              <div className="stp-sent-badge">✓ Sent</div>
              <p>You sent {firstName} a thank you on{' '}
                {new Date(postcardSent.sentAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.</p>
              {postcardSent.privateMessage && (
                <div className="stp-private-recap">
                  <span className="stp-field-label">Private note</span>
                  <p className="stp-private-recap__msg">{postcardSent.privateMessage}</p>
                </div>
              )}
            </div>
          ) : (
            <>
              <label className="stp-field">
                <span className="stp-field-label">Public message <em>· shows on the thank-you &amp; on {firstName}'s testimonials</em></span>
                <textarea
                  rows={2}
                  maxLength={PUBLIC_MAX}
                  value={publicMessage}
                  onChange={(e) => setPublicMessage(e.target.value)}
                  placeholder={`e.g. ${firstName} was a dream to work with — top-level content.`}
                  disabled={sending}
                />
                <small>{publicMessage.length} / {PUBLIC_MAX}</small>
              </label>
              <label className="stp-field stp-field--plain">
                <span className="stp-field-label">Private note <em>· just for {firstName}, won't appear publicly</em></span>
                <textarea
                  rows={3}
                  maxLength={PRIVATE_MAX}
                  value={privateMessage}
                  onChange={(e) => setPrivateMessage(e.target.value)}
                  placeholder="The personal thing only she'll see."
                  disabled={sending}
                />
                <small>{privateMessage.length} / {PRIVATE_MAX}</small>
              </label>
              <label className="stp-field stp-field--plain stp-field--sig">
                <span className="stp-field-label">Sign as <em>· shows under the thank-you as your signature</em></span>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="e.g. Christine, Pikora"
                  disabled={sending}
                  maxLength={48}
                />
              </label>
            </>
          )}
        </div>
      </div>
      <footer className="stp-foot">
        <button className="stp-ghost" onClick={onBack} disabled={sending}>← Back</button>
        <span className="stp-foot-spacer" />
        {viewOnly ? (
          <button className="stp-primary" onClick={onSkip}>Next →</button>
        ) : (
          <>
            <button className="stp-link" onClick={onSkip} disabled={sending}>Skip</button>
            <button className="stp-primary" onClick={onSend} disabled={!publicMessage.trim() || sending}>
              {sending ? 'Sending…' : '♥ Send thank you'}
            </button>
          </>
        )}
      </footer>
    </div>
  );
}

/* ---------- Step 3: Re-collab — friendlier copy + emoji.
   Order is favorite → later → decline (most enthusiastic to least). */
const RECOLLAB_OPTIONS = [
  { id: 'favorite', emoji: '⭐',
    label: 'Add to my favorites',
    desc: 'Absolutely amazing — please auto-invite {first} to every campaign.' },
  { id: 'later',    emoji: '🤝',
    label: 'Yes, periodically',
    desc: "Loved {first}'s content — I'd like to be able to pick her for future campaigns." },
  { id: 'decline',  emoji: '🙅',
    label: 'Nah, one and done',
    desc: "I'd rather not work with {first} again." },
];
function StepReCollab({ firstName, value, onPick, declineNote, onDeclineNoteChange, onBack, onDone }) {
  return (
    <div className="stp-step stp-step--recollab">
      <div className="stp-step__hd">
        <h3>Would you work with {firstName} again?</h3>
        <p>Pick the one that feels right — we'll use this to plan your next round.</p>
      </div>
      <div className="stp-rc-options" role="radiogroup">
        {RECOLLAB_OPTIONS.map((opt) => {
          const on = value === opt.id;
          const showDeclineNote = on && opt.id === 'decline';
          return (
            <div key={opt.id} className={`stp-rc-opt-wrap ${on ? 'on' : ''}`}>
              <button
                type="button"
                className={`stp-rc-opt stp-rc-opt--${opt.id} ${on ? 'on' : ''}`}
                aria-pressed={on}
                role="radio"
                aria-checked={on}
                onClick={() => onPick(opt.id)}
              >
                <span className="stp-rc-emoji" aria-hidden="true">{opt.emoji}</span>
                <span className="stp-rc-copy">
                  <b>{opt.label}</b>
                  <em>{opt.desc.replace('{first}', firstName)}</em>
                </span>
                <span className="stp-rc-mark" aria-hidden="true">{on ? '✓' : ''}</span>
              </button>
              {showDeclineNote && (
                <div className="stp-rc-note" onClick={(e) => e.stopPropagation()}>
                  <label className="stp-rc-note__label">
                    <span className="stp-rc-note__label-text">Help us match better next time</span>
                    <em>Private — only the Benable team sees this.</em>
                  </label>
                  <textarea
                    className="stp-rc-note__field"
                    rows={2}
                    placeholder="Tone, timing, vibe — anything we should know for next time."
                    value={declineNote || ''}
                    onChange={(e) => onDeclineNoteChange(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <footer className="stp-foot">
        <button className="stp-ghost" onClick={onBack}>← Back</button>
        <span className="stp-foot-spacer" />
        <button className="stp-primary" onClick={onDone}>Done</button>
      </footer>
    </div>
  );
}
