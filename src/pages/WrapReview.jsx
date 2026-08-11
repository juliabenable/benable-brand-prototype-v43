import { useParams, Link } from 'react-router-dom';
import '../styles/wrap-review.css';
import { BRAND, TOTALS, PLATFORM, CREATORS, ALL_POSTS } from '../data/glowCampaign.js';
import { WRAPPED_COMMENTS, avColor, likeCount, timeAgo } from '../data/wrappedComments.js';

/**
 * 28 Litsea — Campaign Wrapped. A cohesive "Glow Report": one distinct,
 * polished design per topic, real reconciled stats, theatrical wrap framing.
 * /wrap-review = recap table + every slide. /wrap-review/:topic = one slide.
 */

const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`);
const mention = (t) => t.split(/(@[\w.]+)/g).map((p, i) => (p.startsWith('@') ? <span key={i} className="wr-men">{p}</span> : p));

function Slide({ n, theme, children }) {
  return (
    <div className={`wr-card wr-card--${theme}`}>
      <div className="wr-chrome">
        <div className="wr-bars">{[...Array(8)].map((_, i) => <span key={i} className={i < n ? 'on' : ''} />)}</div>
        <div className="wr-headrow"><span className="wr-dot" />{BRAND} · WRAPPED</div>
      </div>
      <div className="wr-body">{children}</div>
    </div>
  );
}

/* 1 — Cover */
function Cover() {
  return (
    <div className="wr-cover">
      <span className="wr-eyebrow wr-eyebrow--glow">2025 Campaign · Wrapped</span>
      <h1 className="wr-cover__title">The Glow<br /><em>Report</em></h1>
      <p className="wr-cover__sub">{BRAND} × {TOTALS.creators} creators · {TOTALS.pieces} pieces · one big glow</p>
      <div className="wr-cover__faces">
        {CREATORS.map((c) => <span key={c.handle} style={{ backgroundImage: `url(${c.pic})` }} />)}
      </div>
    </div>
  );
}

/* 2 — Reach */
function Reach() {
  const r = TOTALS.reach;
  const pct = (v) => `${((v - r.floor) / (r.high - r.floor)) * 100}%`;
  return (
    <div className="wr-reach">
      <span className="wr-eyebrow wr-eyebrow--glow">Reach estimate</span>
      <p className="wr-lede">Your glow showed up an estimated</p>
      <div className="wr-bignum wr-bignum--glow">{fmt(r.base)}<span>times</span></div>
      <div className="wr-rangebar">
        <span className="wr-rangebar__fill" style={{ left: 0, width: pct(r.base) }} />
        <span className="wr-rangebar__node" style={{ left: 0 }}><b>2,970</b><small>observed</small></span>
        <span className="wr-rangebar__node wr-rangebar__node--mid" style={{ left: pct(r.base) }}><b>~4.7K</b><small>base est.</small></span>
        <span className="wr-rangebar__node wr-rangebar__node--end" style={{ left: '100%' }}><b>5.5K</b><small>high</small></span>
      </div>
      <div className="wr-platrow">
        <span className="wr-chip"><b>{fmt(PLATFORM.tiktok)}</b> TikTok views</span>
        <span className="wr-chip"><b>{fmt(PLATFORM.reels)}</b> IG Reel views</span>
        <span className="wr-chip"><b>~{fmt(PLATFORM.storyEst)}</b> IG Stories <i>(est.)</i></span>
      </div>
      <small className="wr-caveat">Estimated views/impressions, not deduped unique reach. Story reach modeled at 5–15% of followers (not public).</small>
    </div>
  );
}

/* 3 — Engagement */
function Engagement() {
  return (
    <div className="wr-eng">
      <span className="wr-eyebrow">Engagement rate</span>
      <div className="wr-bignum">{TOTALS.viewER}%</div>
      <p className="wr-lede wr-lede--big">That's <em>5×</em> the {TOTALS.benchmark}% industry benchmark.</p>
      <div className="wr-bench">
        <div className="wr-bench__row"><span className="wr-bench__label">You</span><span className="wr-bench__bar wr-bench__bar--you" style={{ width: '100%' }}>{TOTALS.viewER}%</span></div>
        <div className="wr-bench__row"><span className="wr-bench__label">Avg</span><span className="wr-bench__bar wr-bench__bar--avg" style={{ width: `${(TOTALS.benchmark / TOTALS.viewER) * 100}%` }}>{TOTALS.benchmark}%</span></div>
      </div>
      <p className="wr-eng__foot"><b>{TOTALS.engagements}</b> engagements — likes, comments &amp; shares on {fmt(TOTALS.observedViews)} views</p>
    </div>
  );
}

/* 4 — Comments */
function Comments() {
  return (
    <div className="wr-cmt">
      <div className="wr-cnt-head"><span className="wr-eyebrow">What people said</span><h3>The comments are <em>in</em></h3></div>
      <div className="wr-cmt__wall">
        {WRAPPED_COMMENTS.map((c, i) => (
          <div key={i} className={`wr-ccard ${i % 4 === 1 ? 'tape' : ''}`} style={{ '--r': `${((i % 5) - 2) * 1.1}deg` }}>
            <span className="wr-cc__av" style={{ background: avColor(c.u) }}>{c.u[0].toUpperCase()}</span>
            <div className="wr-cc__b">
              <p><b>{c.u}</b> {mention(c.t)}</p>
              <div className="wr-cc__meta">{c.p === 'tt' ? 'TikTok' : 'Instagram'} · {likeCount(c.u)} likes · {timeAgo(c.u)}</div>
            </div>
            <span className="wr-cc__h">{c.p === 'tt' ? '♥' : '♡'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 5 — Content */
const TILT = ['-5deg', '4deg', '-3deg', '5deg', '-4deg', '3deg', '-2deg'];
const TAPE = ['#ffd2e0', '#cfe0ff', '#fff0c2', '#d9f2e0', '#e7dcff'];
function Content() {
  const posts = ALL_POSTS.filter((p) => !p.story);
  return (
    <div className="wr-content">
      <div className="wr-cnt-head"><span className="wr-eyebrow">The content they made</span><h3>{TOTALS.pieces} pieces · {TOTALS.creators} creators</h3></div>
      <div className="wr-photowall">
        {posts.map((p, i) => (
          <div key={i} className="wr-photo" style={{ '--t': TILT[i % TILT.length], marginTop: i % 2 ? '34px' : '0', marginLeft: i ? '-12px' : 0, zIndex: i + 1 }}>
            <span className="wr-photo__tape" style={{ background: TAPE[i % TAPE.length] }} />
            <span className="wr-photo__img" style={{ backgroundImage: `url(${p.img})` }} />
            <span className="wr-photo__tag"><span className="wr-photo__av" style={{ backgroundImage: `url(${p.creator.pic})` }} /><span><b>{p.creator.name}</b><small>{p.creator.handle}</small></span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 6 — Creators */
function Creators() {
  const ranked = [...CREATORS].sort((a, b) => b.er - a.er);
  const maxEr = Math.max(...ranked.map((c) => c.er));
  return (
    <div className="wr-creators">
      <div className="wr-cnt-head"><span className="wr-eyebrow">Your dream team</span><h3>{TOTALS.creators} creators delivered</h3></div>
      <div className="wr-team">
        {ranked.map((c, i) => (
          <div key={c.handle} className={`wr-tcard ${c.top ? 'is-top' : ''}`}>
            {c.top && <span className="wr-tcard__crown">★ Top performer</span>}
            <span className="wr-tcard__pic" style={{ backgroundImage: `url(${c.pic})` }} />
            <div className="wr-tcard__id"><b>{c.name}</b><small>{c.handle}</small></div>
            <div className="wr-tcard__stats">
              <span><b>{fmt(c.views)}</b><small>views</small></span>
              <span><b>{c.eng}</b><small>engagements</small></span>
              <span><b>{c.er}%</b><small>ER</small></span>
            </div>
            <div className="wr-tcard__erbar"><span style={{ width: `${(c.er / maxEr) * 100}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 7 — Note from Katie */
function Katie() {
  return (
    <div className="wr-katie">
      <div className="wr-postcard">
        <div className="wr-postcard__l">
          <p className="wr-hand">Hi {BRAND} team — what a glow-up! 🌿 Your creators pulled a <b>20.5%</b> engagement rate — five times the benchmark. The comments are pure buying intent. I'm already lining up round two.</p>
          <span className="wr-hand wr-postcard__sign">— Katie, your Benable lead 💜</span>
        </div>
        <div className="wr-postcard__r">
          <span className="wr-postcard__stamp">🌿<em>28 LITSEA</em></span>
          <span className="wr-postcard__mark" />
          <span className="wr-postcard__lines" />
        </div>
      </div>
    </div>
  );
}

/* 8 — Recap */
function Recap() {
  const top = [...CREATORS].sort((a, b) => b.er - a.er)[0];
  return (
    <div className="wr-recap">
      <span className="wr-eyebrow wr-eyebrow--glow">That's a wrap</span>
      <h2 className="wr-recap__title">{BRAND} × 2025</h2>
      <div className="wr-recap__grid">
        <div><b>~{fmt(TOTALS.reach.base)}</b><small>reach (est.)</small></div>
        <div className="hl"><b>{TOTALS.viewER}%</b><small>engagement · 5× avg</small></div>
        <div><b>{TOTALS.engagements}</b><small>engagements</small></div>
        <div><b>{TOTALS.pieces}</b><small>pieces</small></div>
        <div><b>{TOTALS.creators}</b><small>creators</small></div>
        <div><b>{top.name}</b><small>top performer · {top.er}%</small></div>
      </div>
      <button className="wr-recap__cta">Launch round two →</button>
    </div>
  );
}

const TOPICS = [
  { key: 'cover', n: 1, title: 'Cover', direction: 'Glow-report title card', stat: '—', theme: 'glow', C: Cover },
  { key: 'reach', n: 2, title: 'Reach', direction: 'Big number + range + platform split', stat: '~4.7K est (2,970 observed)', theme: 'glow', C: Reach },
  { key: 'engagement', n: 3, title: 'Engagement', direction: '5× benchmark bars', stat: '20.5% ER', theme: 'cream', C: Engagement },
  { key: 'comments', n: 4, title: 'Comments', direction: 'IG/TikTok screenshot wall', stat: `${WRAPPED_COMMENTS.length} comments`, theme: 'cream', C: Comments },
  { key: 'content', n: 5, title: 'Content', direction: 'Scattered photo wall', stat: '13 pieces', theme: 'wall', C: Content },
  { key: 'creators', n: 6, title: 'Creators', direction: 'Leaderboard cards', stat: '4 creators · Samantha top', theme: 'light', C: Creators },
  { key: 'note', n: 7, title: 'Note from Katie', direction: 'Handwritten postcard', stat: 'human touch', theme: 'cream', C: Katie },
  { key: 'recap', n: 8, title: 'Recap', direction: 'Shareable keepsake', stat: 'all headline stats', theme: 'glow', C: Recap },
];

function Nav({ active }) {
  return (
    <nav className="wr-tabs">
      <Link to="/wrap-review" className={!active ? 'on' : ''}>All</Link>
      {TOPICS.map((t) => <Link key={t.key} to={`/wrap-review/${t.key}`} className={t.key === active ? 'on' : ''}>{t.title}</Link>)}
    </nav>
  );
}

export default function WrapReview() {
  const { topic } = useParams();
  const one = TOPICS.find((t) => t.key === topic);

  if (one) {
    const C = one.C;
    return (
      <div className="wr">
        <header className="wr-top"><span className="wr-kicker">{BRAND} · Campaign Wrapped</span><h1>{one.title}</h1><p>{one.direction}</p></header>
        <Nav active={one.key} />
        <Slide n={one.n} theme={one.theme}><C /></Slide>
        <footer className="wr-foot">Slide {one.n} of {TOPICS.length} · <code>/wrap-review/{one.key}</code></footer>
      </div>
    );
  }

  return (
    <div className="wr">
      <header className="wr-top">
        <span className="wr-kicker">{BRAND} · Campaign Wrapped</span>
        <h1>The Glow Report — design studies</h1>
        <p>One distinct design per topic, real reconciled stats (Amber excluded). Scroll to review, or open any topic on its own.</p>
      </header>
      <Nav active={null} />

      <table className="wr-table">
        <thead><tr><th>#</th><th>Topic</th><th>Design direction</th><th>Featured stat</th><th></th></tr></thead>
        <tbody>
          {TOPICS.map((t) => (
            <tr key={t.key}>
              <td className="wr-table__n">{t.n}</td>
              <td><b>{t.title}</b></td>
              <td className="wr-table__dir">{t.direction}</td>
              <td className="wr-table__stat">{t.stat}</td>
              <td><Link to={`/wrap-review/${t.key}`} className="wr-table__link">Open →</Link></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="wr-deck">
        {TOPICS.map((t) => {
          const C = t.C;
          return (
            <div key={t.key} className="wr-deck__item" id={t.key}>
              <div className="wr-deck__label"><span>{t.n}</span><b>{t.title}</b><small>{t.direction}</small></div>
              <Slide n={t.n} theme={t.theme}><C /></Slide>
            </div>
          );
        })}
      </div>

      <footer className="wr-foot">Real stats: ~4.7K est. reach · 2,970 observed views · 20.5% ER · 609 engagements · 4 creators · 13 pieces. Estimates noted on the Reach slide.</footer>
    </div>
  );
}
