import { useState, useEffect } from 'react';
import '../styles/content-study.css';
import '../styles/content-reveal-study.css';

/**
 * Design study — making the "your creators delivered content" moment
 * celebratory. The Content tab currently just shows posts in a grid; these
 * directions turn the arrival into a moment (gift, drop, confetti, spotlight).
 * Each demo replays via its Replay button.
 */

const I1 = 'https://benable-followers.s3.amazonaws.com/ig-siennapierre-reel-3176745985120116844-full.jpg';
const I2 = 'https://benable-followers.s3.amazonaws.com/ig-siennapierre-reel-3207770097225833451-full.jpg';
const CARDS = [
  { name: 'Samantha', handle: '@samanthaglow', img: I1, av: I2, plat: 'tt' },
  { name: 'Lulu Lavender', handle: '@lulu.lavender', img: I2, av: I1, plat: 'ig' },
  { name: 'Marina', handle: '@luckymia', img: I1, av: I2, plat: 'tt' },
];
// Mixed state: 2 new-to-review (first) + 3 already-seen.
const MIXED = [
  { name: 'Samantha', handle: '@samanthaglow', img: I1, av: I2, plat: 'tt', fresh: true },
  { name: 'Lulu Lavender', handle: '@lulu.lavender', img: I2, av: I1, plat: 'ig', fresh: true },
  { name: 'Marina', handle: '@luckymia', img: I1, av: I2, plat: 'tt', fresh: false },
  { name: 'Emma', handle: '@emmaboersma', img: I2, av: I1, plat: 'tt', fresh: false },
  { name: 'Bianca', handle: '@justtbiancaaa', img: I1, av: I2, plat: 'ig', fresh: false },
];
const PLAT = (p) => (p === 'tt' ? '♪' : '◎');
const CONFETTI_COLORS = ['#ff6fae', '#a06bff', '#ffd166', '#5ad1c4', '#ff8a8a', '#8ab6ff'];

function Card({ c, className = '', style, badge }) {
  return (
    <div className={`crl-card ${className}`} style={style}>
      {badge && <span className="crl-new">NEW</span>}
      <div className="crl-card__thumb" style={{ backgroundImage: `url(${c.img})` }}>
        <span className={`crl-card__plat ${c.plat}`}>{PLAT(c.plat)}</span>
      </div>
      <div className="crl-card__foot">
        <span className="crl-av" style={{ backgroundImage: `url(${c.av})` }} />
        <span className="crl-who"><b>{c.name}</b><small>{c.handle}</small></span>
      </div>
    </div>
  );
}

const Grid = ({ render }) => <div className="crl-grid">{CARDS.map((c, i) => render(c, i))}</div>;

function Tabs() {
  return (
    <div className="crl-tabs">
      <span className="crl-tab">Dashboard</span>
      <span className="crl-tab crl-tab--on">Content</span>
      <span className="crl-tab">★ Wrap-up</span>
    </div>
  );
}

/* replay wrapper: bumps a key so the child re-mounts and animations replay */
function Demo({ children, hint }) {
  const [k, setK] = useState(0);
  return (
    <div className="crl-frame">
      <Tabs />
      <div className="crl-canvas">
        <div className="crl-replbar">
          <button type="button" className="crl-replay" onClick={() => setK((n) => n + 1)}>↻ Replay</button>
          {hint && <span className="crl-cap">{hint}</span>}
        </div>
        <div key={k}>{children}</div>
      </div>
    </div>
  );
}

function Confetti({ n = 26 }) {
  return (
    <div className="crl-confetti" aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => (
        <i key={i} style={{
          left: `${(i * 37) % 100}%`,
          background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          '--cd': `${(i % 6) * 0.08}s`,
          transform: `rotate(${(i * 47) % 360}deg)`,
        }} />
      ))}
    </div>
  );
}

function CountUp({ to = 3, dur = 700 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf; const start = performance.now();
    const tick = (t) => { const p = Math.min(1, (t - start) / dur); setN(Math.round(p * to)); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, dur]);
  return <>{n}</>;
}

/* ── A · Spotlight takeover ── */
function Spotlight() {
  const [gone, setGone] = useState(false);
  return (
    <div style={{ position: 'relative', minHeight: 300 }}>
      <Grid render={(c, i) => <Card key={i} c={c} className="crl-card--cascade" style={{ '--d': `${0.1 + i * 0.09}s` }} />} />
      {!gone && (
        <div className={`crl-spotlight ${gone ? 'crl-spotlight--gone' : ''}`}>
          <span className="crl-spot__kicker">Your creators delivered</span>
          <span className="crl-spot__title">3 new pieces just landed ✨</span>
          <span className="crl-spot__sub">Samantha, Lulu &amp; Marina made content for you.</span>
          <button type="button" className="crl-spot__cta" onClick={() => setGone(true)}>See the content →</button>
        </div>
      )}
    </div>
  );
}

/* ── B · Confetti drop + count-up ── */
function ConfettiDrop() {
  return (
    <div style={{ position: 'relative' }}>
      <Confetti />
      <div className="crl-headline"><em><CountUp to={3} /> new pieces</em> just dropped 🎉</div>
      <Grid render={(c, i) => <Card key={i} c={c} className="crl-card--cascade" style={{ '--d': `${0.15 + i * 0.1}s` }} />} />
    </div>
  );
}

/* ── C · Staggered cascade (no confetti) ── */
function Cascade() {
  return <Grid render={(c, i) => <Card key={i} c={c} className="crl-card--cascade" style={{ '--d': `${i * 0.12}s` }} />} />;
}

/* ── D · Gift unwrap (interactive) ── */
function Gift() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative', minHeight: 300 }}>
      <Grid render={(c, i) => <Card key={i} c={c} className={open ? 'crl-card--cascade' : ''} style={open ? { '--d': `${i * 0.1}s` } : { opacity: 0 }} />} />
      <div className={`crl-gift ${open ? 'crl-gift--open' : ''}`} onClick={() => setOpen(true)}>
        <span className="crl-gift__box">🎁</span>
        <span className="crl-gift__t">3 new pieces from your creators</span>
        <span className="crl-gift__d">A fresh drop of content is ready.</span>
        <span className="crl-gift__hint">Tap to unwrap</span>
      </div>
    </div>
  );
}

/* ── E · Toast + NEW shimmer badges ── */
function ToastNew() {
  return (
    <div style={{ position: 'relative' }}>
      <div className="crl-toast">✨ Fresh content just landed — 3 new pieces</div>
      <Grid render={(c, i) => <Card key={i} c={c} badge />} />
    </div>
  );
}

/* ── F · Shine sweep + float (ambient) ── */
function Shine() {
  return <Grid render={(c, i) => <Card key={i} c={c} className="crl-card--shine crl-card--float" style={{ '--d': `${i * 0.5}s` }} />} />;
}

/* ── G · New / Reviewed split ── */
function Split() {
  const fresh = MIXED.filter((c) => c.fresh);
  const seen = MIXED.filter((c) => !c.fresh);
  return (
    <div>
      <div className="crl-group">
        <Confetti n={14} />
        <div className="crl-group__label">✨ 2 new — ready to review</div>
        <div className="crl-grid" style={{ justifyContent: 'flex-start' }}>
          {fresh.map((c, i) => <Card key={i} c={c} badge className="crl-card--ring crl-card--cascade" style={{ '--d': `${0.1 + i * 0.1}s` }} />)}
        </div>
      </div>
      <div className="crl-divider" style={{ margin: '20px 0 16px' }} />
      <div className="crl-group">
        <div className="crl-group__label crl-group__label--muted">Reviewed earlier</div>
        <div className="crl-grid" style={{ justifyContent: 'flex-start' }}>
          {seen.map((c, i) => <Card key={i} c={c} className="crl-card--seen" />)}
        </div>
      </div>
    </div>
  );
}

/* ── H · One grid, new spotlighted (seen dimmed) ── */
function Spotlit() {
  return (
    <div>
      <div className="crl-seenhead"><em>2 new to review</em> · 3 already seen</div>
      <div className="crl-grid" style={{ justifyContent: 'flex-start', position: 'relative' }}>
        <span className="crl-spk2" style={{ left: 64, top: -6, fontSize: 16 }}>✦</span>
        <span className="crl-spk2" style={{ left: 150, top: 150, fontSize: 12 }}>✦</span>
        <span className="crl-spk2" style={{ left: 300, top: -10, fontSize: 13 }}>✦</span>
        {MIXED.map((c, i) => (
          <Card key={i} c={c} badge={c.fresh}
            className={c.fresh ? 'crl-card--ring crl-card--cascade' : 'crl-card--seen'}
            style={c.fresh ? { '--d': `${0.1 + i * 0.1}s` } : undefined} />
        ))}
      </div>
    </div>
  );
}

/* ── I · Subtle badges (repeat visit) ── */
function Subtle() {
  return (
    <div style={{ position: 'relative' }}>
      <div className="crl-toast">2 new pieces to review</div>
      <div className="crl-grid" style={{ justifyContent: 'flex-start' }}>
        {MIXED.map((c, i) => (
          <Card key={i} c={c} badge={c.fresh} className={c.fresh ? 'crl-card--ring' : ''} />
        ))}
      </div>
    </div>
  );
}

/* ── J · each new piece individually gift-wrapped (tap to unwrap) ── */
function WrappedCard({ c }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="crl-wrapbox">
      <Card c={c} className={open ? 'crl-card--ring crl-card--cascade' : ''} style={open ? { '--d': '0s' } : undefined} />
      <button type="button" className={`crl-wrap ${open ? 'crl-wrap--open' : ''}`} onClick={() => setOpen(true)} aria-label={`Unwrap ${c.name}'s content`}>
        <span className="crl-wrap__half crl-wrap__half--l" />
        <span className="crl-wrap__half crl-wrap__half--r" />
        <span className="crl-wrap__ribbonh" />
        <span className="crl-wrap__ribbon" />
        <span className="crl-wrap__bow" aria-hidden="true">🎀</span>
        {!open && <span className="crl-wrap__hint">tap to unwrap</span>}
      </button>
    </div>
  );
}
function Wrapped() {
  return (
    <div>
      <div className="crl-seenhead"><em>2 new</em>, wrapped — tap to unwrap · 3 already seen</div>
      <div className="crl-grid" style={{ justifyContent: 'flex-start' }}>
        {MIXED.map((c, i) => (c.fresh
          ? <WrappedCard key={i} c={c} />
          : <Card key={i} c={c} className="crl-card--seen" />))}
      </div>
    </div>
  );
}

function Study({ id, title, desc, children, hint }) {
  return (
    <section className="cst-study">
      <div className="cst-study__label"><span className="cst-study__id">{id}</span><b>{title}</b><small>{desc}</small></div>
      <Demo hint={hint}>{children}</Demo>
    </section>
  );
}

export default function ContentRevealStudy() {
  return (
    <div className="cst">
      <header className="cst-top">
        <span className="cst-top__kicker">Benable · Brand Dashboard</span>
        <h1>Content arrival — a celebratory moment</h1>
        <p>Today new content just appears in the Content tab. These directions make the arrival feel like a gift — a moment worth showing up for. Each demo has a <b>↻ Replay</b> button (and a couple are interactive). Most are layered: a one-time <i>moment</i> on first open + a lighter ongoing treatment for new vs. seen content.</p>
      </header>

      <header className="cst-top" style={{ marginTop: 4 }}><h1 style={{ fontSize: 26 }}>The moment (first open)</h1></header>

      <Study id="A" title="Spotlight takeover" desc="A celebratory full-tab welcome — ‘Your creators delivered’ — then it lifts to reveal the grid. The most ‘event’ of the options." hint="Click ‘See the content →’">
        <Spotlight />
      </Study>
      <Study id="B" title="Confetti drop + count-up" desc="Confetti bursts, the count tallies up, and cards cascade in. Joyful and quick — no extra click.">
        <ConfettiDrop />
      </Study>
      <Study id="C" title="Staggered cascade" desc="The quietest ‘moment’: cards spring in one-by-one instead of snapping in. Subtle delight, zero friction.">
        <Cascade />
      </Study>
      <Study id="D" title="Gift unwrap" desc="Content arrives wrapped — a little gift box you tap to reveal. Playful and tactile; makes the brand the recipient of a present." hint="Tap the gift">
        <Gift />
      </Study>

      <header className="cst-top" style={{ marginTop: 28 }}><h1 style={{ fontSize: 26 }}>Ongoing / lighter touch</h1></header>

      <Study id="E" title="Toast + ‘NEW’ shimmer badges" desc="A celebratory toast on arrival + shimmering NEW badges on fresh cards. Good for repeat visits where a full takeover would tire.">
        <ToastNew />
      </Study>
      <Study id="F" title="Shine sweep + float" desc="Ambient delight: a light sweeps across fresh thumbnails and cards gently float. No interruption, just life.">
        <Shine />
      </Study>

      <header className="cst-top" style={{ marginTop: 28 }}>
        <h1 style={{ fontSize: 26 }}>When the grid isn’t empty — 3 seen + 2 new</h1>
        <p>The real case: a brand’s already viewed some content, and a couple of fresh pieces land. The celebration should spotlight <b>only the 2 new</b> and never re-party over what they’ve seen. The principle: <b>celebrate the delta, not the total.</b></p>
      </header>

      <Study id="G" title="New / Reviewed split" desc="New pieces lift into their own celebrated group up top (badge, ring, confetti, cascade); seen content sits quietly below under ‘Reviewed earlier’. Clearest separation.">
        <Split />
      </Study>
      <Study id="H" title="One grid — new spotlighted" desc="Keeps a single grid but dims the seen cards and pops the 2 new ones (ring, badge, sparkles, cascade). Good if you want order preserved.">
        <Spotlit />
      </Study>
      <Study id="I" title="Subtle (repeat visit)" desc="Lightest touch: a small toast + NEW badge & soft ring on just the 2 new; seen cards fully normal. No dimming, no confetti.">
        <Subtle />
      </Study>
      <Study id="J" title="Gift-wrapped — unwrap each ★" desc="Each new piece arrives wrapped in paper with a ribbon & bow; tap one and it tears open to reveal the content. Most delightful — the brand literally unwraps a gift from each creator." hint="Tap a wrapped card to unwrap">
        <Wrapped />
      </Study>

      <header className="cst-top" style={{ marginTop: 28 }}><h1 style={{ fontSize: 26 }}>Micro-delights (mix &amp; match)</h1></header>
      <section className="cst-study">
        <div className="crl-micros">
          <div className="crl-micro"><h5>🎉 Creator-attributed</h5><p>“Samantha just delivered” — name the creator so the moment feels personal, not just a number.</p></div>
          <div className="crl-micro"><h5>✨ Glow ring on fresh</h5><p>A soft purple ring around unseen cards that fades once viewed.</p></div>
          <div className="crl-micro"><h5>🔢 Tab badge count</h5><p>A “3” badge on the Content tab so the moment is discoverable from anywhere.</p></div>
          <div className="crl-micro"><h5>🔊 Optional sound/haptic</h5><p>A tiny chime / haptic tick on first reveal (respect reduced-motion &amp; mute).</p></div>
        </div>
      </section>

      <footer className="cst-foot">Content-arrival celebration study. My lean: <b>A or B</b> as the first-open moment, with <b>E</b> (toast + NEW badges) for repeat visits. Tell me which to build into the Content tab.</footer>
    </div>
  );
}
