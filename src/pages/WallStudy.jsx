import '../styles/content-study.css';
import '../styles/wall-study.css';
import { avColor, WRAPPED_COMMENTS } from '../data/wrappedComments.js';

/**
 * Design study — Campaign Wrapped, "Wall of Love" when a campaign has
 * FEWER THAN 8 comments. The production wall is a 4-col grid + overflow
 * fade tuned for ~40+ comments; with a handful it looks sparse and the
 * fade covers nothing. These directions celebrate a small set instead.
 */

// A representative set of real first-campaign comments (up to 10).
const PICKS = [
  { t: 'Your skin looks so smooth and glowy!!✨😍 I need to try @28litsea 😍😍', u: 'alondraambrizm', p: 'tt' },
  { t: 'that glow from the body oil is insane', u: 'mollymmcqueen', p: 'tt' },
  { t: 'Almond scent??? Omg yes pls!!', u: 'brittnirosalie', p: 'tt' },
  { t: 'The body oil is giving glow show!', u: '11lisamariet', p: 'tt' },
  { t: 'Omgsh you are glowing! Need this!', u: 'lyindalynn', p: 'tt' },
  { t: 'Cute packaging and that glow 🤌', u: 'thattwinmomrn', p: 'tt' },
  { t: '✨I wish I could smell it!! It looks amazing!', u: 'clairethebear11', p: 'ig' },
  { t: 'Loving that glow ✨💕', u: 'kayfordayss', p: 'tt' },
  { t: 'Oh wow! I need to try this', u: 'stephriveraxo', p: 'tt' },
  { t: 'Gosh the instant glow 🤩🤩🤩', u: 'linnyboo88', p: 'tt' },
];

const TILT = ['-1.4deg', '1.2deg', '-1deg', '1.6deg', '-1.6deg', '1deg', '-0.8deg', '1.3deg', '-1.2deg', '0.9deg'];
const PLAT = (p) => (p === 'tt' ? '♪' : '◎');

function mention(t) {
  return t.split(/(@[\w.]+)/g).map((part, i) =>
    part.startsWith('@') ? <span key={i} className="m">{part}</span> : part);
}

function Card({ c, t }) {
  return (
    <div className="wsl-card" style={{ '--t': t }}>
      <span className={`wsl-card__plat ${c.p === 'tt' ? 'tt' : 'ig'}`}>{PLAT(c.p)}</span>
      <div className="wsl-card__row">
        <span className="wsl-card__av" style={{ background: avColor(c.u) }}>{c.u[0].toUpperCase()}</span>
        <div className="wsl-card__b">
          <div className="wsl-card__u">@{c.u}</div>
          <div className="wsl-card__t">{mention(c.t)}</div>
        </div>
      </div>
    </div>
  );
}

function Head({ count }) {
  return (
    <div className="wsl-head">
      <span className="wsl-eyebrow">Real excitement, great engagement</span>
      <h3>{count} comment{count === 1 ? '' : 's'}. <em>All love.</em></h3>
    </div>
  );
}

/* B — centered 2-col cluster. A lone comment shows as one wide card;
   everything else is 2-col with the odd card centering on its last row. */
function DirCluster({ items }) {
  const tight = items.length === 1;
  return (
    <div className="wsl-stage">
      <Head count={items.length} />
      <div className={`wsl-cluster${tight ? ' wsl-cluster--tight' : ''}`}>
        {items.map((c, i) => <Card key={i} c={c} t={TILT[i % TILT.length]} />)}
      </div>
    </div>
  );
}

/* The "other design" — the original production wall: a 4-col grid with a
   bottom-fade mask. Used once the count is high enough (>10) that the
   overflow read ("so much love") is earned. */
function DirGrid({ items }) {
  return (
    <div className="wsl-stage">
      <Head count={items.length} />
      <div className="wsl-grid">
        {items.map((c, i) => (
          <div key={i} className="wsl-card" style={{ '--t': TILT[i % TILT.length] }}>
            <span className={`wsl-card__plat ${c.p === 'tt' ? 'tt' : 'ig'}`}>{PLAT(c.p)}</span>
            <div className="wsl-card__row">
              <span className="wsl-card__av" style={{ background: avColor(c.u) }}>{c.u[0].toUpperCase()}</span>
              <div className="wsl-card__b">
                <div className="wsl-card__u">@{c.u}</div>
                <div className="wsl-card__t">{mention(c.t)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Study({ id, title, desc, theme = 'love', children }) {
  return (
    <section className="cst-study">
      <div className="cst-study__label"><span className="cst-study__id">{id}</span><b>{title}</b><small>{desc}</small></div>
      <div className={`cst-card cst-card--${theme}`}>
        <div className="cst-chrome">
          <div className="cst-chrome__bars">{[...Array(8)].map((_, i) => <span key={i} className={i === 4 ? 'on' : ''} />)}</div>
          <div className="cst-chrome__head"><span className="cst-chrome__dot" />28 LITSEA · WRAPPED</div>
        </div>
        <div className="cst-card__body">{children}</div>
      </div>
    </section>
  );
}

export default function WallStudy() {
  const clusterCounts = [3, 4, 5, 6, 7, 8, 9, 10];
  const gridCounts = [11, 12, 13, 14, 15, 16, 17, 18, 19];
  return (
    <div className="cst">
      <header className="cst-top">
        <span className="cst-top__kicker">Benable · Campaign Wrapped</span>
        <h1>Wall of Love — adaptive by comment count</h1>
        <p>Two layouts, switched on the comment count. <b>3–10</b> uses Direction B (centered 2-col cluster) so a small set always looks full and intentional. <b>Over 10</b> hands off to the original wall — a 4-col grid with a bottom-fade — which earns its &ldquo;so much love it overflows&rdquo; read once there are enough comments. Grid cases shown up to 19.</p>
      </header>

      <div className="cst-rec">
        <b>The rule:</b>
        <ul>
          <li><code>3–10</code> → <b>Direction B</b> — centered 2-col cluster; an odd final card centers on its own row</li>
          <li><code>&gt; 10</code> → <b>original grid</b> — 4-col wall with bottom-fade overflow</li>
        </ul>
      </div>

      <header className="cst-top" style={{ marginTop: 8 }}>
        <h1 style={{ fontSize: 26 }}>3–10 · Direction B (cluster)</h1>
      </header>
      {clusterCounts.map((n) => (
        <Study key={n} id={`B·${n}`} title={`${n} comments`} desc={`Centered 2-col cluster${n % 2 ? ' — odd card centers on the last row' : ''}.`}>
          <DirCluster items={PICKS.slice(0, n)} />
        </Study>
      ))}

      <header className="cst-top" style={{ marginTop: 28 }}>
        <h1 style={{ fontSize: 26 }}>Over 10 · original grid</h1>
        <p>The 4-col wall with a bottom-fade. As the count climbs it fills more rows and the fade does its job; cases shown 11 → 19.</p>
      </header>
      {gridCounts.map((n) => (
        <Study key={n} id={`G·${n}`} title={`${n} comments`} desc="Original 4-col wall + bottom-fade overflow.">
          <DirGrid items={WRAPPED_COMMENTS.slice(0, n)} />
        </Study>
      ))}

      <footer className="cst-foot">Wall of Love · adaptive — Direction B for 3–10, original grid over 10. Tell me if the 10/11 handoff is the right threshold and whether to wire it into the deck.</footer>
    </div>
  );
}
