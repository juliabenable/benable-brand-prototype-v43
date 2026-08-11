import { BRAND, TOTALS, PLATFORM, CREATORS, ALL_POSTS } from '../../data/glowCampaign.js';
import { WRAPPED_COMMENTS, avColor, likeCount, timeAgo } from '../../data/wrappedComments.js';

/* Shared Glow-Report slide bodies — used by the studies deck and the live player. */

export const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`);
const mention = (t) => t.split(/(@[\w.]+)/g).map((p, i) => (p.startsWith('@') ? <span key={i} className="wr-men">{p}</span> : p));

export function Cover() {
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

export function Reach() {
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

export function Engagement() {
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

export function Comments() {
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

const TILT = ['-5deg', '4deg', '-3deg', '5deg', '-4deg', '3deg', '-2deg'];
const TAPE = ['#ffd2e0', '#cfe0ff', '#fff0c2', '#d9f2e0', '#e7dcff'];
export function Content() {
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

export function Creators() {
  const ranked = [...CREATORS].sort((a, b) => b.er - a.er);
  const maxEr = Math.max(...ranked.map((c) => c.er));
  return (
    <div className="wr-creators">
      <div className="wr-cnt-head"><span className="wr-eyebrow">Your dream team</span><h3>{TOTALS.creators} creators delivered</h3></div>
      <div className="wr-team">
        {ranked.map((c) => (
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

export function Katie() {
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

export function Recap({ onCta }) {
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
      <button className="wr-recap__cta" onClick={onCta}>Launch round two →</button>
    </div>
  );
}

export const SLIDES = [
  { key: 'cover', theme: 'glow', title: 'Cover', Body: Cover },
  { key: 'reach', theme: 'glow', title: 'Reach', Body: Reach },
  { key: 'engagement', theme: 'cream', title: 'Engagement', Body: Engagement },
  { key: 'comments', theme: 'cream', title: 'Comments', Body: Comments },
  { key: 'content', theme: 'wall', title: 'Content', Body: Content },
  { key: 'creators', theme: 'light', title: 'Creators', Body: Creators },
  { key: 'note', theme: 'cream', title: 'Note from Katie', Body: Katie },
  { key: 'recap', theme: 'glow', title: 'Recap', Body: Recap },
];
