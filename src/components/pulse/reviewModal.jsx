import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { PHOTOS } from './pulseData.js';
import { assetsOf } from './review.jsx';
import '../../styles/reviewModal.css';

/* REVIEW UI · Modal (v43 default) — Amine's pixel-perfect Figma build
   (repo AmineBenjil/brand-portal-review-content, "Review content" v6.1),
   ported onto v43's data + decision model: the queue is the table's
   draftIn rows, decisions land on the REVIEW asset objects (asset.state,
   module-persisted) so the tracker, chips and row faces derive exactly as
   they do for the Chat/Sheet directions. Change-request notes stack on
   asset.notes. All decided rules hold: no reject · issue notes go to the
   Benable team · can't send empty.

   Layout: left stage (gradient + 9:16 player + draft arrows) · right panel
   (creator pager ‹ n/N ›, drafts carousel with type labels + lavender
   selection ring + decision stamps, caption, Katie's-team pre-check card,
   feedback) · footer CTAs that become a status rail once a draft is
   decided · slide-up request-changes sheet · animated check overlay ·
   end-of-queue confetti celebration. */

const B = import.meta.env.BASE_URL;
const A = (p) => `${B}review/${p}`;

/* Drafts carousel geometry: 85px thumbs, 10px gap, viewport to the panel edge. */
const THUMB_STEP = 95;
const CAROUSEL_VIEWPORT = 390;
const CAROUSEL_END_PAD = 20;

/* ---- caption tones: @mentions blue, #hashtags purple (from capLines) ---- */
const capSegs = (line) =>
  line.split(/([@#][\w.]+)/g).filter(Boolean).map((text) => ({
    text,
    tone: text[0] === '@' ? 'mention' : text[0] === '#' ? 'hashtag' : undefined,
  }));

/* ---- tiny pub/sub video clock (videoTime.ts port) ----------------------- */
class VideoTimeStore {
  snapshot = { time: 0, duration: 0, playing: false };
  listeners = new Set();
  subscribe = (l) => { this.listeners.add(l); return () => this.listeners.delete(l); };
  getSnapshot = () => this.snapshot;
  publish(next) {
    const m = { ...this.snapshot, ...next };
    if (m.time === this.snapshot.time && m.duration === this.snapshot.duration && m.playing === this.snapshot.playing) return;
    this.snapshot = m;
    this.listeners.forEach((l) => l());
  }
}
const useVideoTime = (store) => useSyncExternalStore(store.subscribe, store.getSnapshot);
const formatTime = (seconds) => {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/* ---- video player: badge, sound, play overlay, scrubbable control bar --- */
function VideoPane({ clip, store }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    let raf = 0;
    const publish = () => store.publish({
      time: video.currentTime,
      duration: video.duration || 8,
      playing: !video.paused && !video.ended,
    });
    const loop = () => { publish(); raf = requestAnimationFrame(loop); };
    const onPlay = () => { setPlaying(true); cancelAnimationFrame(raf); loop(); };
    const onStop = () => { setPlaying(false); cancelAnimationFrame(raf); publish(); };
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onStop);
    video.addEventListener('ended', onStop);
    video.addEventListener('loadedmetadata', publish);
    video.addEventListener('seeked', publish);
    store.publish({ time: 0, duration: 8, playing: false });
    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onStop);
      video.removeEventListener('ended', onStop);
      video.removeEventListener('loadedmetadata', publish);
      video.removeEventListener('seeked', publish);
    };
  }, [clip.id, store]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) void video.play();
    else video.pause();
  };

  return (
    <div className="rvm-video-frame">
      <video
        ref={videoRef}
        className="rvm-video-el"
        src={clip.src}
        poster={clip.poster}
        preload="metadata"
        playsInline
        muted={muted}
        onClick={togglePlay}
      />
      <div className="rvm-video-badge">
        {/* per-type icons from Figma "Content video tags" (12328:2118) */}
        {clip.kind === 'TikTok' ? (
          <span className="rvm-ig-icon">
            <img src={A('assets/icons/tiktok-inner.svg')} alt="" className="rvm-ig-icon-inner" />
            <img src={A('assets/icons/tiktok-outer.svg')} alt="" className="rvm-tiktok-icon-outer" />
          </span>
        ) : clip.kind === 'IG Story' ? (
          <span className="rvm-ig-icon">
            <img src={A('assets/icons/instagram-story.svg')} alt="" className="rvm-ig-icon-outer" />
          </span>
        ) : (
          <span className="rvm-ig-icon">
            <img src={A('assets/icons/instagram-outer.svg')} alt="" className="rvm-ig-icon-outer" />
            <img src={A('assets/icons/instagram-inner.svg')} alt="" className="rvm-ig-icon-inner" />
          </span>
        )}
        {clip.kind}
      </div>
      <button
        type="button"
        className={`rvm-video-sound${muted ? ' is-muted' : ''}`}
        title={muted ? 'Unmute' : 'Mute'}
        onClick={() => setMuted((m) => !m)}
      >
        <img src={A('assets/video/sound-btn.svg')} alt="" />
      </button>
      {!playing && (
        <button type="button" className="rvm-video-play-overlay" title="Play" onClick={togglePlay}>
          <img src={A('assets/video/play-btn.svg')} alt="" />
        </button>
      )}
      <ControlBar store={store} playing={playing} onToggle={togglePlay} videoRef={videoRef} />
    </div>
  );
}

function ControlBar({ store, playing, onToggle, videoRef }) {
  const { time, duration } = useVideoTime(store);
  const trackRef = useRef(null);
  const dragging = useRef(false);
  const pct = duration > 0 ? Math.min(1, time / duration) : 0;

  const scrubTo = (clientX) => {
    const track = trackRef.current;
    const video = videoRef.current;
    if (!track || !video) return;
    const rect = track.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    video.currentTime = p * (video.duration || 8);
  };

  return (
    <div className="rvm-video-controls">
      <button type="button" className="rvm-video-controls-toggle" onClick={onToggle} title={playing ? 'Pause' : 'Play'}>
        {playing ? (
          <span className="rvm-pause-glyph"><span /><span /></span>
        ) : (
          <img src={A('assets/video/play-triangle.svg')} alt="" className="rvm-play-triangle" />
        )}
      </button>
      <div
        ref={trackRef}
        className="rvm-video-track"
        onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); scrubTo(e.clientX); }}
        onPointerMove={(e) => { if (dragging.current) scrubTo(e.clientX); }}
        onPointerUp={(e) => { dragging.current = false; e.currentTarget.releasePointerCapture(e.pointerId); }}
      >
        <div className="rvm-video-track-bg">
          <div className="rvm-video-track-fill" style={{ width: `${Math.max(4, pct * 171)}px` }} />
        </div>
        <img src={A('assets/video/scrub-dot.svg')} alt="" className="rvm-video-track-dot" style={{ left: `${pct * (171 - 6)}px` }} />
      </div>
      <span className="rvm-video-time">{formatTime(time)} / {formatTime(duration || 8)}</span>
    </div>
  );
}

/* ---- end-of-queue celebration (confetti + counts) ----------------------- */
const CONFETTI_COLORS = ['#7a5cfa', '#3caa70', '#f5a623', '#ef5da8', '#4aa3ff'];
/* deterministic pseudo-random so pieces don't reshuffle on re-render */
const rand = (i, salt) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const CONFETTI = Array.from({ length: 56 }, (_, i) => ({
  left: rand(i, 1) * 100,
  delay: rand(i, 2) * 1.6,
  duration: 2.4 + rand(i, 3) * 1.8,
  drift: (rand(i, 4) - 0.5) * 120,
  spin: 360 + rand(i, 5) * 540,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  width: 6 + rand(i, 6) * 4,
  height: 10 + rand(i, 7) * 6,
}));

function Celebration({ queue, onClose }) {
  const all = queue.flatMap((c) => c.assets);
  const approved = all.filter((a) => a.state === 'approved').length;
  const changes = all.length - approved;
  const sub = changes === 0
    ? `All ${all.length} approved — we’ll get them scheduled and send you the live links.`
    : approved === 0
      ? 'Your notes are with the creators — we’ll email you as the new drafts land.'
      : `${approved} approved and headed for scheduling, ${changes} back with creators for tweaks — we’ll email you when new drafts land.`;

  return (
    <div className="rvm-celebrate-scrim" onClick={onClose}>
      <div className="rvm-celebrate-card" onClick={(e) => e.stopPropagation()}>
        <div className="rvm-celebrate-confetti" aria-hidden>
          {CONFETTI.map((p, i) => (
            <span
              key={i}
              className="rvm-confetti-piece"
              style={{
                left: `${p.left}%`, width: p.width, height: p.height, background: p.color,
                animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`,
                '--drift': `${p.drift}px`, '--spin': `${p.spin}deg`,
              }}
            />
          ))}
        </div>
        <svg className="rvm-celebrate-check" viewBox="0 0 64 64" fill="none">
          <circle className="rvm-approve-check-circle" cx="32" cy="32" r="29" stroke="#3caa70" strokeWidth="4" />
          <path className="rvm-approve-check-mark" d="M20 33.5 28.5 42 44 24.5" stroke="#3caa70" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1 className="rvm-celebrate-title">Every draft reviewed!</h1>
        <p className="rvm-celebrate-sub">{sub}</p>
        <button type="button" className="rvm-celebrate-cta" onClick={onClose}>Got it!</button>
      </div>
    </div>
  );
}

/* ---- the review modal --------------------------------------------------- */
export function ReviewModal({ scene, rows, initial, onClose, onDecide }) {
  const mode = scene.mode;
  /* the queue = the table's review rows, in table order */
  const queue = useMemo(
    () => rows
      .filter((c) => !c.mystery && c.draftIn && assetsOf(c, mode).length)
      .map((c) => ({ name: c.name, handle: c.handle, avatar: PHOTOS[c.name], assets: assetsOf(c, mode) })),
    [rows, mode],
  );

  const initIdx = Math.max(0, queue.findIndex((c) => c.name === initial));
  const [creatorIdx, setCreatorIdx] = useState(initIdx);
  /* "Finish review" re-entry lands on the first UNDECIDED draft, not draft 1 */
  const [clipIdx, setClipIdx] = useState(() => {
    const j = queue[initIdx]?.assets.findIndex((a) => !a.state) ?? -1;
    return j >= 0 ? j : 0;
  });
  const [celebrating, setCelebrating] = useState(false);
  const [confirming, setConfirming] = useState(null); // 'approved' | 'changes' | null
  const [draftScroll, setDraftScroll] = useState(0);
  const [changesOpen, setChangesOpen] = useState(false);
  const [changesText, setChangesText] = useState('');
  const [skeleton, setSkeleton] = useState('none'); // none | video | full
  const changesRef = useRef(null);
  const listRef = useRef(null);
  const approveTimer = useRef(0);
  /* the change note lands with the decision at commit time — never before,
     so an aborted confirm can't leave an orphan note on the asset */
  const pendingNote = useRef(null);
  const store = useMemo(() => new VideoTimeStore(), []);

  const creator = queue[Math.min(creatorIdx, queue.length - 1)];
  const clip = creator?.assets[Math.min(clipIdx, (creator?.assets.length ?? 1) - 1)];
  const prevCreator = useRef(creatorIdx);
  const prevClip = useRef(clip?.id);

  /* 1s skeleton: full (details + video) on creator flips, video-only on clip flips */
  useEffect(() => {
    if (!clip || prevClip.current === clip.id) return undefined;
    const full = prevCreator.current !== creatorIdx;
    prevCreator.current = creatorIdx;
    prevClip.current = clip.id;
    setSkeleton(full ? 'full' : 'video');
    const t = setTimeout(() => setSkeleton('none'), 1000);
    return () => clearTimeout(t);
  }, [clip?.id, creatorIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimeout(approveTimer.current), []);

  /* with more than four drafts the row overflows the panel; arrows page it */
  const maxDraftScroll = Math.max(0, (creator?.assets.length ?? 0) * THUMB_STEP - 10 - (CAROUSEL_VIEWPORT - CAROUSEL_END_PAD));
  const scrollDrafts = (dir) => setDraftScroll((s) => Math.min(maxDraftScroll, Math.max(0, s + dir * THUMB_STEP)));
  useEffect(() => { setDraftScroll(0); }, [creatorIdx]);
  useEffect(() => {
    const left = clipIdx * THUMB_STEP;
    const right = left + THUMB_STEP - 10;
    setDraftScroll((s) => {
      const visible = CAROUSEL_VIEWPORT - CAROUSEL_END_PAD;
      if (left < s) return left;
      if (right > s + visible) return Math.min(maxDraftScroll, right - visible);
      return s;
    });
  }, [clipIdx, maxDraftScroll]);

  /* fresh clip → fresh composer */
  useEffect(() => { setChangesOpen(false); setChangesText(''); }, [clip?.id]);

  const notes = clip?.notes ?? [];
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [notes.length]);

  /* keyboard: Esc closes sheet → modal; arrows flip drafts when not typing */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        /* the 2.5s check overlay owns the moment — closing would cancel the
           deferred commit and silently discard the decision */
        if (confirming) return;
        if (changesOpen) { setChangesOpen(false); return; }
        onClose();
        return;
      }
      /* the day scrubber can pull the queue out from under an open modal */
      if (celebrating || confirming || !creator) return;
      const typing = document.activeElement?.tagName === 'TEXTAREA';
      if (typing) return;
      if (e.key === 'ArrowRight' && clipIdx < creator.assets.length - 1) setClipIdx(clipIdx + 1);
      if (e.key === 'ArrowLeft' && clipIdx > 0) setClipIdx(clipIdx - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, clipIdx, creator?.assets.length, changesOpen, celebrating, confirming]);

  /* if the queue changes under the open modal (demo toggles), re-seat indices */
  useEffect(() => {
    if (creator && clipIdx >= creator.assets.length) setClipIdx(0);
  }, [creator, clipIdx]);

  if (!creator || !clip) return null;

  const decided = clip.state; // 'approved' | 'changes' | undefined — locked once set
  const name = creator.name;
  const goToCreator = (idx) => { setCreatorIdx(idx); setClipIdx(0); };

  /* decisions land on the asset (module-persisted) and the whole page
     re-derives; then advance to the next undecided draft — this creator
     first, then the next creator with drafts waiting (wrapping), else the
     queue is done and the celebration takes over. */
  const commit = (decision) => {
    if (decision === 'changes' && pendingNote.current) {
      clip.notes = [...(clip.notes ?? []), pendingNote.current];
      pendingNote.current = null;
    }
    clip.state = decision;
    onDecide();
    for (let off = 1; off < creator.assets.length; off++) {
      const i = (clipIdx + off) % creator.assets.length;
      if (!creator.assets[i].state) { setClipIdx(i); return; }
    }
    for (let off = 1; off <= queue.length; off++) {
      const i = (creatorIdx + off) % queue.length;
      const j = queue[i].assets.findIndex((a) => !a.state);
      if (j >= 0) { setCreatorIdx(i); setClipIdx(j); return; }
    }
    setCelebrating(true);
  };

  /* animated check overlay — long enough to read, then the decision lands */
  const confirmDecision = (decision) => {
    setConfirming(decision);
    approveTimer.current = window.setTimeout(() => {
      setConfirming(null);
      commit(decision);
    }, 2500);
  };

  const submitChanges = () => {
    const text = changesText.trim();
    if (!text) return;
    pendingNote.current = text;
    setChangesOpen(false);
    setChangesText('');
    confirmDecision('changes');
  };

  return createPortal(
    <div className="rvm">
      {celebrating ? (
        <Celebration queue={queue} onClose={onClose} />
      ) : (
      <div className="rvm-review-overlay" onClick={() => { if (!confirming) onClose(); }}>
        <div className="rvm-review-modal" onClick={(e) => e.stopPropagation()}>
          {/* left stage: gradient + video + draft navigation */}
          <div className="rvm-review-stage">
            <div className="rvm-stage-gradient-clip" aria-hidden>
              <img src={A('assets/modal/gradient-bg.png')} alt="" className="rvm-stage-gradient" />
            </div>
            {skeleton === 'none' ? (
              <VideoPane key={clip.id} clip={clip} store={store} />
            ) : (
              <div className="rvm-video-frame rvm-video-skeleton"><div className="rvm-skeleton-shimmer" /></div>
            )}
            <button
              type="button"
              className={`rvm-stage-nav rvm-stage-nav-prev${clipIdx > 0 ? '' : ' is-disabled'}`}
              disabled={clipIdx <= 0}
              onClick={() => setClipIdx(clipIdx - 1)}
              title="Previous draft"
            >
              <span className="rvm-chev rvm-chev-left"><img src={A('assets/icons/chevron-shape.svg')} alt="" /></span>
            </button>
            <button
              type="button"
              className={`rvm-stage-nav rvm-stage-nav-next${clipIdx < creator.assets.length - 1 ? '' : ' is-disabled'}`}
              disabled={clipIdx >= creator.assets.length - 1}
              onClick={() => setClipIdx(clipIdx + 1)}
              title="Next draft"
            >
              <span className="rvm-chev"><img src={A('assets/icons/chevron-shape.svg')} alt="" /></span>
            </button>
          </div>

          {/* right panel */}
          <div className="rvm-review-panel">
            <div className="rvm-panel-topbar">
              <p className="rvm-topbar-title">Review</p>
              <div className="rvm-topbar-nav">
                <button type="button" className="rvm-topbar-arrow" disabled={creatorIdx === 0} onClick={() => goToCreator(creatorIdx - 1)} title="Previous creator">
                  <img src={A('assets/icons/chevron-12.svg')} alt="" className="rvm-chev12-left" />
                </button>
                <button type="button" className="rvm-topbar-arrow" disabled={creatorIdx === queue.length - 1} onClick={() => goToCreator(creatorIdx + 1)} title="Next creator">
                  <img src={A('assets/icons/chevron-12.svg')} alt="" />
                </button>
              </div>
              <p className="rvm-topbar-count">{creatorIdx + 1}/{queue.length}</p>
              <button type="button" className="rvm-topbar-close" onClick={onClose} title="Close">
                <img src={A('assets/icons/close-16.svg')} alt="" />
              </button>
            </div>

            <div className="rvm-panel-scroll" ref={listRef}>
              {skeleton === 'full' ? (
                <div aria-hidden>
                  <div className="rvm-panel-creator">
                    <span className="rvm-skeleton-block rvm-skeleton-avatar" />
                    <span className="rvm-panel-creator-names">
                      <span className="rvm-skeleton-block rvm-skeleton-line" style={{ width: 120 }} />
                      <span className="rvm-skeleton-block rvm-skeleton-line rvm-skeleton-line-thin" style={{ width: 72, marginTop: 5 }} />
                    </span>
                  </div>
                  <div className="rvm-drafts-header">
                    <span className="rvm-skeleton-block rvm-skeleton-line rvm-skeleton-line-thin" style={{ width: 52 }} />
                  </div>
                  <div className="rvm-drafts-carousel">
                    <div className="rvm-drafts-track">
                      {creator.assets.map((a) => <span key={a.id} className="rvm-skeleton-block rvm-draft-thumb-skeleton" />)}
                    </div>
                  </div>
                  <div className="rvm-panel-caption">
                    <span className="rvm-skeleton-block rvm-skeleton-line rvm-skeleton-line-thin" style={{ width: 48 }} />
                    <span className="rvm-skeleton-block rvm-skeleton-line" style={{ width: '100%', marginTop: 8 }} />
                    <span className="rvm-skeleton-block rvm-skeleton-line" style={{ width: '92%', marginTop: 6 }} />
                    <span className="rvm-skeleton-block rvm-skeleton-line" style={{ width: '65%', marginTop: 6 }} />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="rvm-panel-creator">
                    <span className="rvm-panel-creator-avatar"><img src={creator.avatar} alt="" /></span>
                    <span className="rvm-panel-creator-names">
                      <span className="rvm-panel-creator-name-line">
                        <span className="rvm-panel-creator-name">{name}</span>
                        <img src={A('assets/icons/verified.svg')} alt="" className="rvm-panel-creator-verified" />
                      </span>
                      <span className="rvm-panel-creator-handle">{creator.handle}</span>
                    </span>
                  </div>
                  <div className="rvm-drafts-header">
                    <p className="rvm-panel-drafts-title">
                      Drafts <span className="rvm-drafts-count">({creator.assets.length})</span>
                    </p>
                    {creator.assets.length > 4 && (
                      <div className="rvm-drafts-nav">
                        <button type="button" className="rvm-drafts-arrow" disabled={draftScroll <= 0} onClick={() => scrollDrafts(-1)} title="Previous drafts">
                          <img src={A('assets/icons/chevron-12.svg')} alt="" className="rvm-chev12-left" />
                        </button>
                        <button type="button" className="rvm-drafts-arrow" disabled={draftScroll >= maxDraftScroll} onClick={() => scrollDrafts(1)} title="More drafts">
                          <img src={A('assets/icons/chevron-12.svg')} alt="" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="rvm-drafts-carousel">
                    <div className="rvm-drafts-track" style={{ transform: `translateX(${-draftScroll}px)` }}>
                      {creator.assets.map((a, i) => (
                        <button
                          key={a.id}
                          type="button"
                          className={`rvm-draft-thumb${i === clipIdx ? ' is-selected' : ''}${a.state ? ' is-decided' : ''}`}
                          title={`Draft ${i + 1}`}
                          onClick={() => setClipIdx(i)}
                        >
                          <img src={a.poster} alt="" className="rvm-draft-thumb-img" />
                          <span className="rvm-draft-thumb-dim" />
                          <img src={A('assets/icons/thumb-play.svg')} alt="" className="rvm-draft-thumb-play" />
                          {a.state && (
                            <img
                              src={A(`assets/icons/${a.state === 'approved' ? 'draft-approved' : 'draft-changes'}.svg`)}
                              alt={a.state === 'approved' ? 'Approved' : 'Changes requested'}
                              className="rvm-draft-thumb-icon"
                            />
                          )}
                          <span className="rvm-draft-thumb-label">{a.kind}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rvm-panel-caption">
                    <p className="rvm-panel-caption-label">Caption</p>
                    <div className="rvm-panel-caption-body">
                      {(clip.capLines ?? [clip.caption]).map((line, i) => (
                        <p key={i}>
                          {capSegs(line).map((seg, j) => (
                            <span key={j} className={seg.tone ? `rvm-caption-${seg.tone}` : undefined}>{seg.text}</span>
                          ))}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* pre-checks + feedback share the flow area under the caption */}
              {skeleton !== 'full' && (
                <div className="rvm-panel-below">
                  <div className="rvm-precheck">
                    <p className="rvm-precheck-title">Katie’s team pre-checked</p>
                    <ul className="rvm-precheck-list">
                      {clip.checks.map((check) => (
                        <li key={check} className="rvm-precheck-item">
                          <img src={A('assets/icons/precheck-tick.svg')} alt="" className="rvm-precheck-tick" />
                          {check}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {notes.length > 0 && (
                    <>
                      <div className="rvm-panel-feedback-head">
                        <p className="rvm-panel-feedback-title">Your feedback</p>
                      </div>
                      <div className="rvm-feedback-list">
                        {notes.map((text, i) => (
                          <div key={i} className="rvm-feedback-message">
                            <span className="rvm-feedback-message-text">{text}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* footer: CTAs while undecided; a status rail once decided (v6) */}
            <div className={`rvm-panel-footer${decided ? ' is-decided' : ''}`}>
              {decided === 'approved' ? (
                <p className="rvm-footer-status rvm-footer-status-approved"><strong>🎉 </strong>Approved</p>
              ) : decided === 'changes' ? (
                <p className="rvm-footer-status rvm-footer-status-sent">
                  <strong>Issue flagged </strong>for our team — we’ll review and keep you posted.
                </p>
              ) : (
                <div className="rvm-panel-footer-cta">
                  <button type="button" className="rvm-footer-changes" disabled={!!confirming} onClick={() => setChangesOpen(true)}>
                    Flag an issue
                  </button>
                  <button type="button" className="rvm-footer-approve" disabled={!!confirming} onClick={() => confirmDecision('approved')}>
                    Approve
                  </button>
                </div>
              )}
            </div>

            {confirming && (
              <div className="rvm-approve-overlay">
                <svg className="rvm-approve-check" viewBox="0 0 64 64" fill="none">
                  <circle className="rvm-approve-check-circle" cx="32" cy="32" r="29" stroke="#3caa70" strokeWidth="4" />
                  <path className="rvm-approve-check-mark" d="M20 33.5 28.5 42 44 24.5" stroke="#3caa70" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="rvm-approve-overlay-title">
                  {confirming === 'approved' ? `Approved — ${name} will post it within days.` : 'Sent to our team.'}
                </p>
                <p className="rvm-approve-overlay-sub">
                  {confirming === 'approved'
                    ? 'We’ll tell her the good news and track the post for you.'
                    : 'We’ll review it and work out the best solution with the creator directly.'}
                </p>
              </div>
            )}
          </div>

          {/* request-changes sheet (Figma 12324:2042, v6) */}
          {changesOpen && (
            <div className="rvm-changes-scrim" onClick={() => setChangesOpen(false)}>
              <div className="rvm-changes-card" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="rvm-changes-close" onClick={() => setChangesOpen(false)} title="Close">
                  <img src={A('assets/icons/close-16.svg')} alt="" />
                </button>
                <div className="rvm-changes-body">
                  <span className="rvm-changes-icon">🖊️</span>
                  <p className="rvm-changes-title">Sorry about that, let's make it right</p>
                  <p className="rvm-changes-sub">
                    Tell us what didn't match your brief or instructions, with as much detail as you can. Your note goes to the Benable team, not to the creator. We'll review and work out the best solution with the creator directly.
                  </p>
                  <textarea
                    ref={changesRef}
                    className="rvm-changes-textarea"
                    placeholder="Describe the issue, the more detail the better"
                    value={changesText}
                    autoFocus
                    onChange={(e) => setChangesText(e.target.value)}
                    onKeyDown={(e) => {
                      const isEnter = e.key === 'Enter' || e.key === 'Return' || e.keyCode === 13;
                      if (isEnter && !e.shiftKey) { e.preventDefault(); submitChanges(); }
                    }}
                  />
                </div>
                <div className="rvm-changes-footer">
                  <button type="button" className="rvm-changes-send" disabled={!changesText.trim()} onClick={submitChanges}>
                    Send to our team
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>,
    document.body
  );
}
