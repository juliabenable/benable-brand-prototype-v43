import '../../styles/pulse.css';

/*
  BrandPulse — brand-level tracking OUTSIDE any single campaign, shown on the
  campaigns overview. Lifetime totals + Wrapped-flavored insight cards:
  what all the campaigns have added up to. Static demo data (Pikora-as-brand).
*/

const P = (f) => `${import.meta.env.BASE_URL}creators/${f}.jpg`;
const TOP5 = ['nia', 'jade', 'maya', 'sofia', 'priya'];

const TOTALS = [
  { emoji: '🧴', n: '142', label: 'BB Creams gifted' },
  { emoji: '📣', n: '23', label: 'pieces of content live' },
  { emoji: '👀', n: '87.4k', label: 'total views' },
  { emoji: '🚀', n: '3rd', label: 'campaign in flight' },
];

/* Katie's idea (Jul 23): not brand-side tiers — a milestone tracker.
   "You're about to hit…" anticipation as the retention hook. */
const MILESTONES = [
  { at: '10k', pos: 10, done: true },
  { at: '25k', pos: 25, done: true },
  { at: '50k', pos: 50, done: true },
  { at: '100k', pos: 100, done: false },
];

const INSIGHTS = [
  {
    tone: 'lavender',
    emoji: '📍',
    title: 'Creators in California love your product',
    sub: '9 of your 23 posts came from CA creators',
  },
  {
    tone: 'mint',
    emoji: '💬',
    title: 'Top comment on the BB Cream: “how smooth it is”',
    sub: 'smoothness came up in 41 comments',
  },
  {
    tone: 'peach',
    emoji: '🤝',
    title: 'You’ve worked with @lululavender twice!',
    sub: 'she’s in your current campaign too',
    photo: P('jade'),
  },
];

export default function BrandPulse() {
  return (
    <div className="bp-root">
      <div className="bp-head">
        <div>
          <h3 className="cp-section-title">Your brand at Benable</h3>
          <p className="cp-section-sub">Everything your campaigns have added up to — updated live</p>
        </div>
        <button type="button" className="bp-wrap-btn">🎁 See your Brand Wrap</button>
      </div>

      <div className="bp-totals">
        {TOTALS.map((t, i) => (
          <div className="bp-stat" key={t.label} style={{ animationDelay: `${0.06 * i}s` }}>
            <span className="bp-stat-emoji">{t.emoji}</span>
            <span className="bp-stat-n">{t.n}</span>
            <span className="bp-stat-label">{t.label}</span>
          </div>
        ))}
      </div>

      <div className="bp-milestone">
        <div className="bp-mile-head">
          <span className="bp-mile-title">🏁 Next milestone: 100k total views</span>
          <span className="bp-mile-meta">12.6k to go</span>
        </div>
        <div className="bp-mile-track">
          <div className="bp-mile-fill" style={{ width: '87.4%' }} />
          {MILESTONES.map((m) => (
            <span
              key={m.at}
              className={m.done ? 'bp-mile-dot bp-mile-dot--done' : 'bp-mile-dot'}
              style={{ left: `${m.pos}%` }}
            />
          ))}
        </div>
        <div className="bp-mile-labels">
          {MILESTONES.map((m) => (
            <span key={m.at} className={m.done ? 'done' : ''} style={{ left: `${m.pos}%` }}>{m.at}</span>
          ))}
        </div>
        <p className="bp-mile-cap">87.4k and climbing — at this pace you’ll cross 100k this week 🎉 &nbsp;(then 250k… and one day, 1M 🌙)</p>
      </div>

      <div className="bp-grid">
        {INSIGHTS.map((c, i) => (
          <div className={`bp-card bp-card--${c.tone}`} key={c.title} style={{ animationDelay: `${0.08 * (i + 1)}s` }}>
            <div className="bp-card-top">
              <span className="bp-card-emoji">{c.emoji}</span>
              {c.photo && <img className="bp-card-photo" src={c.photo} alt="" />}
            </div>
            <div className="bp-card-title">{c.title}</div>
            <div className="bp-card-sub">{c.sub}</div>
          </div>
        ))}
        <div className="bp-card bp-card--gold" style={{ animationDelay: '0.32s' }}>
          <div className="bp-card-top">
            <span className="bp-card-emoji">⭐</span>
            <div className="bp-faces">
              {TOP5.map((f, i) => (
                <img key={f} src={P(f)} alt="" style={{ zIndex: 5 - i }} />
              ))}
            </div>
          </div>
          <div className="bp-card-title">Your top 5 rated creators</div>
          <div className="bp-card-sub">4.9★ average across 11 collabs — all open to a rehire</div>
        </div>
      </div>
    </div>
  );
}
