import { useEffect, useRef, useState, useCallback } from 'react';
import {
  getCreatorMeta,
  getPostcard,
  getReCollab,
} from '../utils/postcardStorage.js';

/**
 * Campaign Wrapped — a Spotify-Wrapped-style story player for the brand's
 * end-of-campaign recap. The old 9-section scroll is reworked into a sequence
 * of full-screen, tappable story cards with progress bars, auto-advance,
 * count-up number reveals, and a final shareable recap card.
 *
 * Slide order: cover → reach → content → engagement → MVP → top post →
 * top comment → thank-yous → dream team → recap.
 */

const SLIDE_MS = 6500;

// Product-relevance-filtered comments — read as buying signals, not just praise.
const DEMO_COMMENTS = [
  { handle: 'elsa.k',       text: 'omggg i need this — what brand is it?? 😩', likes: 142 },
  { handle: 'junjun.style', text: 'wait this looks SO clean, where do i get it?', likes: 89 },
  { handle: 'laraf.',       text: 'just bought it from her link, ty for the code 🙏', likes: 67 },
];

// A wall of "screenshotted" comments — a mix of IG + TikTok, all buying signals.
const WALL_COMMENTS = [
  { app: 'ig',     user: 'elsa.k',       verified: false, text: 'omggg i NEED this — what brand is it?? 😩', likes: '142', time: '2d', c: '#ff7eb3' },
  { app: 'tiktok', user: 'junjun.style', text: 'wait this looks SO clean, where do i get it?', likes: '1.2k', c: '#5ad1c4' },
  { app: 'ig',     user: 'maya.wears',   verified: true,  text: 'just ordered with her code 🙌', likes: '89', time: '4d', c: '#9b8cff' },
  { app: 'tiktok', user: 'thatgirldee',  text: 'the way i added this to cart immediately 🛒', likes: '843', c: '#ffb454' },
  { app: 'ig',     user: 'laraf.',       verified: false, text: 'link?? 🥹', likes: '67', time: '5d', c: '#7ec8ff' },
  { app: 'tiktok', user: 'kostas.k',     text: 'ok i’m sold, brb buying', likes: '512', c: '#ff8a8a' },
  { app: 'ig',     user: 'nightcalls',   verified: false, text: 'been looking for something exactly like this!!', likes: '54', time: '6d', c: '#c4a3ff' },
  { app: 'tiktok', user: 'sofiii',       text: 'need the discount code pls 🙏', likes: '430', c: '#6fe0a8' },
  { app: 'ig',     user: 'jordan.b',     verified: true,  text: 'adding to my wishlist rn', likes: '38', time: '1w', c: '#ffd166' },
  { app: 'tiktok', user: 'marco.v',      text: 'this is actually genius, where to buy??', likes: '221', c: '#8ab6ff' },
];

const IgGlyph = () => (
  <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1.3" fill="currentColor" />
  </svg>
);
const TtGlyph = () => (
  <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden="true">
    <path d="M14 3c.3 2.1 1.7 3.7 3.9 4v2.3c-1.4 0-2.7-.4-3.9-1.1v5.6a4.9 4.9 0 1 1-4.9-4.9c.3 0 .5 0 .8.1v2.4a2.5 2.5 0 1 0 1.7 2.4V3H14z" />
  </svg>
);

function CommentCard({ c }) {
  if (c.app === 'tiktok') {
    return (
      <div className="cw-cc cw-cc--tt">
        <span className="cw-cc__av" style={{ background: c.c }}>{c.user[0].toUpperCase()}</span>
        <div className="cw-cc__main">
          <span className="cw-cc__user">{c.user}</span>
          <span className="cw-cc__text">{c.text}</span>
        </div>
        <div className="cw-cc__tt-like">
          <span className="cw-cc__heart">♥</span>
          <span className="cw-cc__likes">{c.likes}</span>
        </div>
        <span className="cw-cc__app cw-cc__app--tt"><TtGlyph /></span>
      </div>
    );
  }
  return (
    <div className="cw-cc cw-cc--ig">
      <span className="cw-cc__av" style={{ background: c.c }}>{c.user[0].toUpperCase()}</span>
      <div className="cw-cc__main">
        <p className="cw-cc__line">
          <b>{c.user}</b>
          {c.verified && <span className="cw-cc__verified" aria-hidden="true">✓</span>}
          {' '}{c.text}
        </p>
        <div className="cw-cc__meta"><span>{c.time}</span><span>{c.likes} likes</span><span>Reply</span></div>
      </div>
      <span className="cw-cc__heart cw-cc__heart--ig">♡</span>
      <span className="cw-cc__app cw-cc__app--ig"><IgGlyph /></span>
    </div>
  );
}

const PAID_CAPS = [
  { id: 'rights',    title: 'Paid usage rights' },
  { id: 'whitelist', title: 'Whitelisting' },
  { id: 'boost',     title: 'Boost the original' },
  { id: 'repurpose', title: 'Long-term repurpose' },
  { id: 'rebook',    title: 'Brief them again' },
];

const formatN = (n) =>
  n >= 1000000 ? `${(n / 1e6).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${Math.round(n)}`;

const CONFETTI_COLORS = ['#7a5cfa', '#ff5fb0', '#ffd23d', '#4f8bff', '#2fd6a6', '#ff8a3d'];

/* A short, soft synth note — the optional "music" element. No audio assets;
   built on the WebAudio API so it's a single ascending chime per slide. */
function playNote(ctx, freq) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const t = ctx.currentTime;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.16, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
  osc.start(t);
  osc.stop(t + 0.58);
}

/* Lightweight CSS confetti burst — mounts once with its slide. */
function Confetti({ count = 40 }) {
  const pieces = useRef(
    [...Array(count)].map((_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      dur: 1.8 + Math.random() * 1.6,
      rot: Math.random() * 360,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      w: 6 + Math.random() * 7,
    }))
  );
  return (
    <div className="cw-confetti" aria-hidden="true">
      {pieces.current.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.left}%`,
            width: `${p.w}px`,
            height: `${p.w * 0.45}px`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            '--rot': `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  );
}

/* Count from 0 → target with an ease-out cubic. Restarts whenever `runKey`
   changes, so each slide re-triggers its reveal on entry. */
function useCountUp(target, runKey, duration = 1300) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setVal(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, runKey, duration]);
  return val;
}

export default function WrapUpPanel({
  campaignId,
  brandName,
  creatorsWithPosts,
  onOpenThanks,
  onChanged: _onChanged, // eslint-disable-line no-unused-vars
  onBack,
}) {
  const allMeta = creatorsWithPosts.map((c) => ({
    ...c,
    meta: getCreatorMeta(c.creator.handle),
    state: {
      postcard: getPostcard(campaignId, c.creator.handle),
      reCollab: getReCollab(campaignId, c.creator.handle),
    },
  }));

  const creatorCount = allMeta.length;
  const postCount = allMeta.reduce((s, c) => s + c.posts.length, 0);

  const allPosts = allMeta.flatMap((c) =>
    c.posts.map((p) => ({ ...p, _creator: c.creator, _meta: c.meta }))
  );

  // Reach estimate (Tony): TikTok views + Instagram views + ~10% story estimate.
  const platformKey = (p = '') =>
    /tiktok/i.test(p) ? 'tiktok' : /stor/i.test(p) ? 'story' : 'instagram';
  const tiktokViews = allPosts
    .filter((p) => platformKey(p.platform) === 'tiktok')
    .reduce((s, p) => s + (p._meta?.avgViews || 0), 0);
  const igViews = allPosts
    .filter((p) => platformKey(p.platform) !== 'tiktok')
    .reduce((s, p) => s + (p._meta?.avgViews || 0), 0);
  const storyEst = Math.round((tiktokViews + igViews) * 0.1);
  const reachTotal = tiktokViews + igViews + storyEst;

  // Engagement rate vs the 4% benchmark.
  const benchmark = 4;
  const avgEng = allMeta.length
    ? Number((allMeta.reduce((s, c) => s + c.meta.engagement, 0) / allMeta.length).toFixed(1))
    : 0;
  const beatsBenchmark = avgEng >= benchmark;

  const totalLikes = Math.round(reachTotal * (avgEng / 100) * 0.78);
  const totalComments = Math.round(reachTotal * (avgEng / 100) * 0.14);
  const totalSaves = Math.round(reachTotal * (avgEng / 100) * 0.08);

  const thanked = allMeta.filter((c) => !!c.state.postcard);
  const unthanked = allMeta.filter((c) => !c.state.postcard);
  const favorites = allMeta.filter((c) => c.state.reCollab === 'favorite');
  const laters = allMeta.filter((c) => c.state.reCollab === 'later');
  const dreamTeam = favorites.length ? favorites : laters;

  const stats = {
    brandName, creatorCount, postCount,
    tiktokViews, igViews, storyEst, reachTotal,
    avgEng, benchmark, beatsBenchmark,
    totalLikes, totalComments, totalSaves,
    thanked, unthanked, favorites, laters, dreamTeam,
    allMeta, allPosts,
  };

  // -------- slide registry: hero trio → content showcase → creator summary --------
  const slides = [
    { key: 'cover',    theme: 'cover',   render: (p) => <CoverSlide {...p} /> },
    { key: 'reach',    theme: 'blue',    render: (p) => <ReachSlide {...p} /> },
    { key: 'eng',      theme: 'warm',    render: (p) => <EngagementSlide {...p} /> },
    { key: 'comment',  theme: 'cream',   render: (p) => <CommentSlide {...p} /> },
    { key: 'collage',  theme: 'violet',  render: (p) => <ContentCollageSlide {...p} /> },
    { key: 'summary',  theme: 'green',   render: (p) => <CreatorSummarySlide {...p} /> },
    { key: 'katie',    theme: 'katie',   render: (p) => <KatieNoteSlide {...p} /> },
    { key: 'recap',    theme: 'recap',   render: (p) => <RecapSlide {...p} /> },
  ].filter(Boolean);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [layout, setLayout] = useState('immersive'); // 'classic' | 'immersive' | 'theater'
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef(null);
  const soundOnRef = useRef(false);
  const count = slides.length;

  const toggleSound = () => {
    setSoundOn((s) => {
      const ns = !s;
      soundOnRef.current = ns;
      if (ns) {
        if (!audioRef.current) {
          const Ctx = window.AudioContext || window.webkitAudioContext;
          if (Ctx) audioRef.current = new Ctx();
        }
        audioRef.current?.resume?.();
        playNote(audioRef.current, 659.25);
      }
      return ns;
    });
  };

  // Soft ascending chime as you move through the story (only when sound is on).
  const SCALE = [392, 440, 494, 523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
  useEffect(() => {
    if (soundOnRef.current && audioRef.current) playNote(audioRef.current, SCALE[index % SCALE.length]);
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps
  const clamp = (i) => Math.max(0, Math.min(count - 1, i));
  const next = useCallback(() => setIndex((i) => clamp(i + 1)), [count]); // eslint-disable-line react-hooks/exhaustive-deps
  const prev = useCallback(() => setIndex((i) => clamp(i - 1)), [count]); // eslint-disable-line react-hooks/exhaustive-deps
  const isLast = index === count - 1;

  // Auto-advance (stops on the recap slide and while pressed/paused).
  useEffect(() => {
    if (paused || isLast) return undefined;
    const id = setTimeout(next, SLIDE_MS);
    return () => clearTimeout(id);
  }, [index, paused, isLast, next]);

  // Keyboard nav.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'Escape' && onBack) onBack('Dashboard');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, onBack]);

  const slide = slides[index];

  const handleSayThanks = () => {
    if (unthanked[0]) onOpenThanks(unthanked[0].creator, unthanked[0].posts);
  };

  const LAYOUTS = [
    ['classic', 'Classic'],
    ['immersive', 'Immersive'],
    ['theater', 'Theater'],
  ];

  return (
    <div className={`cw cw--${layout}`}>
      <div className="cw-layout-switch" role="group" aria-label="Desktop layout">
        <span className="cw-layout-switch__label">Layout</span>
        {LAYOUTS.map(([id, lbl]) => (
          <button
            key={id}
            type="button"
            className={layout === id ? 'on' : ''}
            onClick={() => setLayout(id)}
          >
            {lbl}
          </button>
        ))}
      </div>

      <div className={`cw-stage cw-stage--${slide.theme}`}>
        {layout !== 'classic' && (
          <>
            <button type="button" className="cw-arrow cw-arrow--prev" onClick={prev} disabled={index === 0} aria-label="Previous slide">‹</button>
            <button type="button" className="cw-arrow cw-arrow--next" onClick={next} disabled={isLast} aria-label="Next slide">›</button>
          </>
        )}
        <article
          className="cw-card"
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          {/* progress bars */}
          <div className="cw-progress">
            {slides.map((s, i) => (
              <span key={s.key} className="cw-progress__track">
                <span
                  className={`cw-progress__fill ${i < index ? 'is-done' : ''} ${i === index ? 'is-live' : ''}`}
                  style={i === index && !paused && !isLast ? { animationDuration: `${SLIDE_MS}ms` } : undefined}
                />
              </span>
            ))}
          </div>

          {/* header */}
          <header className="cw-head">
            <span className="cw-head__brand">
              <span className="cw-head__dot" aria-hidden="true" />
              {brandName} · Wrapped
            </span>
            <div className="cw-head__actions">
              <button
                type="button"
                className={`cw-head__sound ${soundOn ? 'on' : ''}`}
                onClick={toggleSound}
                aria-pressed={soundOn}
                aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
                title={soundOn ? 'Sound on' : 'Sound on'}
              >
                {soundOn ? '♪' : '♪'}
                <span className="cw-head__sound-x" data-on={soundOn} aria-hidden="true" />
              </button>
              {onBack && (
                <button type="button" className="cw-head__close" onClick={() => onBack('Dashboard')} aria-label="Close wrapped">
                  ✕
                </button>
              )}
            </div>
          </header>

          {/* slide body — remounts per index to retrigger reveals */}
          <div className="cw-slide" key={slide.key}>
            {slide.render({ ...stats, runKey: slide.key, onSayThanks: handleSayThanks, onBack, goNext: next })}
          </div>

          {/* tap zones (skip on the recap so its buttons stay clickable) */}
          {!isLast && (
            <>
              <button type="button" className="cw-tap cw-tap--prev" onClick={prev} aria-label="Previous" tabIndex={-1} />
              <button type="button" className="cw-tap cw-tap--next" onClick={next} aria-label="Next" tabIndex={-1} />
            </>
          )}

          {!isLast && <span className="cw-hint">tap to continue →</span>}
        </article>
      </div>
    </div>
  );
}

/* ============================ slides ============================ */

function Eyebrow({ children }) {
  return <span className="cw-eyebrow">{children}</span>;
}

function CoverSlide({ brandName, creatorCount, postCount, goNext }) {
  return (
    <div className="cw-body cw-body--center">
      <div className="cw-cover">
        <Eyebrow>2025 Campaign</Eyebrow>
        <h1 className="cw-cover__title">
          {brandName},<br />your campaign,<br /><em>wrapped.</em>
        </h1>
        <p className="cw-cover__sub">
          {creatorCount} creator{creatorCount === 1 ? '' : 's'} · {postCount} piece{postCount === 1 ? '' : 's'} of content · one big year.
        </p>
        <button type="button" className="cw-cover__cta" onClick={goNext}>
          Let’s relive it →
        </button>
      </div>
      <div className="cw-cover__blob cw-cover__blob--1" aria-hidden="true" />
      <div className="cw-cover__blob cw-cover__blob--2" aria-hidden="true" />
      <span className="cw-sticker cw-sticker--a" aria-hidden="true">🎉</span>
      <span className="cw-sticker cw-sticker--b" aria-hidden="true">✨</span>
      <Confetti />
    </div>
  );
}

/* Hero #1 — Reach estimate: TikTok views + Instagram views + ~10% story estimate. */
function ReachSlide({ reachTotal, tiktokViews, igViews, storyEst, runKey }) {
  const v = useCountUp(reachTotal, runKey);
  return (
    <div className="cw-body">
      <Eyebrow>Reach estimate</Eyebrow>
      <p className="cw-lede">Your brand showed up an estimated</p>
      <div className="cw-bignum">{formatN(v)}</div>
      <p className="cw-lede">times across feeds &amp; stories.</p>
      <div className="cw-pills cw-pills--stack">
        {tiktokViews > 0 && (
          <span className="cw-pill"><span className="cw-pill__emoji">🎵</span><b>{formatN(tiktokViews)}</b> TikTok views</span>
        )}
        {igViews > 0 && (
          <span className="cw-pill"><span className="cw-pill__emoji">📸</span><b>{formatN(igViews)}</b> Instagram views</span>
        )}
        <span className="cw-pill"><span className="cw-pill__emoji">⚡</span><b>{formatN(storyEst)}</b> Stories <small>(est. ~10%)</small></span>
      </div>
    </div>
  );
}

/* Hero #2 — Engagement rate vs the 4% benchmark. */
function EngagementSlide({ avgEng, benchmark, beatsBenchmark, totalLikes, totalComments, totalSaves, runKey }) {
  const e = useCountUp(avgEng, runKey, 1100);
  const scaleMax = Math.max(avgEng, benchmark) * 1.4 || 1;
  const fillPct = Math.min(100, (avgEng / scaleMax) * 100);
  const markPct = Math.min(100, (benchmark / scaleMax) * 100);
  return (
    <div className="cw-body">
      <Eyebrow>Engagement rate</Eyebrow>
      <div className="cw-bignum">{e.toFixed(1)}%</div>
      <p className="cw-lede cw-lede--big">
        {beatsBenchmark ? <>Above the <em>{benchmark}% average</em>.</> : <>Right around the {benchmark}% average.</>}
      </p>
      <div className="cw-bench">
        <div className="cw-bench__track">
          <span className="cw-bench__fill" style={{ width: `${fillPct}%` }} />
          <span className="cw-bench__mark" style={{ left: `${markPct}%` }} />
        </div>
        <div className="cw-bench__labels">
          <span>{benchmark}% benchmark</span>
          <span className="cw-bench__you">you: {avgEng}%</span>
        </div>
      </div>
      <div className="cw-pills">
        <span className="cw-pill"><b>{formatN(totalLikes)}</b> likes</span>
        <span className="cw-pill"><b>{formatN(totalComments)}</b> comments</span>
        <span className="cw-pill"><b>{formatN(totalSaves)}</b> saves</span>
      </div>
    </div>
  );
}

/* Hero #3 — Positive comment highlights as a wall of IG/TikTok screenshots. */
const WALL_ROT = ['-2.4deg', '1.8deg', '-1.5deg', '2.4deg', '-2.2deg', '1.4deg', '-2.6deg', '2deg', '-1.7deg', '2.3deg'];
function CommentSlide() {
  return (
    <div className="cw-body cw-body--wall">
      <div className="cw-wall__head">
        <Eyebrow>Comments worth flagging</Eyebrow>
        <p className="cw-wall__sub">Real comments — filtered for product relevance.</p>
      </div>
      <div className="cw-wall">
        {WALL_COMMENTS.map((c, i) => (
          <div key={i} className={`cw-wall__item ${i % 2 ? 'r' : 'l'}`} style={{ '--r': WALL_ROT[i % WALL_ROT.length] }}>
            <CommentCard c={c} />
          </div>
        ))}
      </div>
      <div className="cw-wall__fade" aria-hidden="true" />
    </div>
  );
}

/* Content showcase — collage of all creator content, broken out per creator. */
function ContentCollageSlide({ allMeta, postCount, creatorCount }) {
  return (
    <div className="cw-body cw-body--collage">
      <Eyebrow>The content they made</Eyebrow>
      <p className="cw-lede cw-collage__lede">
        {postCount} piece{postCount === 1 ? '' : 's'} from {creatorCount} creator{creatorCount === 1 ? '' : 's'}.
      </p>
      <div className="cw-collage">
        {allMeta.map((c) => (
          <div key={c.creator.handle} className="cw-collage__creator">
            <div className="cw-collage__chead">
              <span className="cw-avatar cw-avatar--sm">{c.creator.avatarInitial}</span>
              <div className="cw-collage__who">
                <b>{c.creator.name}</b>
                <small>{c.creator.handle} · {c.posts.length} post{c.posts.length === 1 ? '' : 's'}</small>
              </div>
            </div>
            <div className="cw-collage__grid">
              {c.posts.map((p, i) => (
                <a
                  key={i}
                  className="cw-collage__cell"
                  href={p.postUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={p.thumbnailUrl ? { backgroundImage: `url(${p.thumbnailUrl})` } : undefined}
                >
                  <span className="cw-collage__plat">{p.platform || 'Post'}</span>
                  <span className="cw-collage__count">{i + 1} of {c.posts.length}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Creator summary — overall campaign satisfaction + who you'd rebook. */
function CreatorSummarySlide({ creatorCount, thanked, unthanked, favorites, dreamTeam, onSayThanks }) {
  const rebook = favorites.length ? favorites : dreamTeam;
  return (
    <div className="cw-body cw-body--center">
      <Eyebrow>Creator summary</Eyebrow>
      <h2 className="cw-name cw-name--sm">A happy campaign all round.</h2>
      <div className="cw-sum">
        <div className="cw-sum__row"><span className="cw-sum__n">{creatorCount}</span><span className="cw-sum__l">creator{creatorCount === 1 ? '' : 's'} delivered</span></div>
        <div className="cw-sum__row"><span className="cw-sum__n">{thanked.length}</span><span className="cw-sum__l">thanked so far</span></div>
        <div className="cw-sum__row"><span className="cw-sum__n">{rebook.length}</span><span className="cw-sum__l">you’d work with again</span></div>
      </div>
      {rebook.length > 0 && (
        <div className="cw-team">
          {rebook.slice(0, 6).map((c) => (
            <span key={c.creator.handle} className="cw-team__pin">
              <span className="cw-avatar">{c.creator.avatarInitial}</span>
              <b>{c.creator.name}</b>
              <small>{c.creator.handle}</small>
            </span>
          ))}
        </div>
      )}
      {unthanked[0] && (
        <button type="button" className="cw-btn cw-btn--light" onClick={onSayThanks}>
          ♥ {thanked.length ? `Thank ${unthanked.length} more` : 'Send a thank-you'}
        </button>
      )}
    </div>
  );
}

function KatieNoteSlide({ brandName, creatorCount, favorites, dreamTeam }) {
  const watching = favorites.length ? favorites : dreamTeam;
  return (
    <div className="cw-body cw-body--center">
      <Eyebrow>A note from your Benable lead</Eyebrow>
      <div className="cw-katie">
        <div className="cw-katie__av">K</div>
        <div className="cw-katie__bubble">
          <p>
            Hey {brandName} team — what a launch. 🎉 {creatorCount} creator{creatorCount === 1 ? '' : 's'} showed
            up for you and the comments are honestly <em>so</em> good.
          </p>
          <p>
            {watching.length
              ? `I've got my eye on ${watching.length === 1 ? 'one' : 'a few'} I think we should lock in for next month — I'll be in touch.`
              : `I’m already lining up creators I think you’ll love for round two — more soon.`}
          </p>
          <p className="cw-katie__sign">— Katie, your Benable lead 💜</p>
        </div>
      </div>
    </div>
  );
}

function RecapSlide({ brandName, reachTotal, avgEng, benchmark, postCount, onBack }) {
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const selectedIds = Object.keys(selected).filter((id) => selected[id]);
  const toggle = (id) => { if (!submitted) setSelected((s) => ({ ...s, [id]: !s[id] })); };
  const submit = () => {
    if (!selectedIds.length) return;
    setSubmitted(true);
    setTimeout(() => {
      alert(`Got it — Katie will email you about ${selectedIds.length} option${selectedIds.length === 1 ? '' : 's'} within 1 business day.`);
    }, 100);
  };

  const topComment = DEMO_COMMENTS[0];
  return (
    <div className="cw-body cw-body--recap">
      <Confetti count={28} />
      <h2 className="cw-recap__title">That’s a wrap 🎉</h2>
      <p className="cw-recap__lede">Here’s what {brandName} got up to.</p>

      <div className="cw-recap__hero">
        <div className="cw-recap__stat"><div className="n">{formatN(reachTotal)}</div><div className="l">reach estimate</div></div>
        <div className="cw-recap__stat"><div className="n">{avgEng}%</div><div className="l">{avgEng >= benchmark ? `eng. (above ${benchmark}%)` : 'engagement'}</div></div>
        <div className="cw-recap__stat"><div className="n">{postCount}</div><div className="l">piece{postCount === 1 ? '' : 's'} made</div></div>
      </div>

      <div className="cw-recap__quote">
        <span className="cw-recap__quote-mark" aria-hidden="true">“</span>
        {topComment.text}
        <span className="cw-recap__quote-by">— {topComment.handle}, and {topComment.likes}+ others felt it too</span>
      </div>

      <div className="cw-recap__further">
        <span className="cw-recap__further-label">Curious about more? Tap anything and Katie will reach out — no commitment.</span>
        <div className="cw-recap__chips">
          {PAID_CAPS.map((cap) => (
            <button
              key={cap.id}
              type="button"
              className={`cw-chip ${selected[cap.id] ? 'on' : ''}`}
              onClick={() => toggle(cap.id)}
              disabled={submitted}
              aria-pressed={!!selected[cap.id]}
            >
              {selected[cap.id] ? '✓ ' : '+ '}{cap.title}
            </button>
          ))}
        </div>
        {submitted ? (
          <span className="cw-recap__sent">✓ Sent · Katie will be in touch within 1 business day 💜</span>
        ) : (
          selectedIds.length > 0 && (
            <button type="button" className="cw-btn cw-btn--ghost" onClick={submit}>
              Ask Katie about {selectedIds.length} →
            </button>
          )
        )}
      </div>

      <div className="cw-recap__actions">
        <button type="button" className="cw-btn cw-btn--primary" onClick={() => onBack && onBack('Dashboard')}>
          Let’s do it again → Launch round two
        </button>
        <span className="cw-recap__fine">
          Everything’s yours to use organically for 30 days · need rights help? <a href="mailto:katie@benable.com">Email Katie</a>
        </span>
      </div>
    </div>
  );
}
