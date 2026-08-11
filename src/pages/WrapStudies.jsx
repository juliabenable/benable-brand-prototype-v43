import { useParams, Link } from 'react-router-dom';
import '../styles/wrap-studies.css';
import { WRAPPED_COMMENTS, avColor, likeCount, timeAgo } from '../data/wrappedComments.js';

/**
 * Design Studies — one route per Campaign-Wrapped screen so each can be
 * iterated independently. /wrap-studies = index; /wrap-studies/:screen = a
 * screen's options. Standalone; not wired into the live wrap-up.
 */

const BRAND = 'Pikora';
const IMG1 = 'https://benable-followers.s3.amazonaws.com/ig-siennapierre-reel-3176745985120116844-full.jpg';
const IMG2 = 'https://benable-followers.s3.amazonaws.com/ig-siennapierre-reel-3207770097225833451-full.jpg';
const bg1 = { backgroundImage: `url(${IMG1})` };
const bg2 = { backgroundImage: `url(${IMG2})` };

const renderText = (t) =>
  t.split(/(@[\w.]+)/g).map((p, i) => (p.startsWith('@') ? <span key={i} className="mention">{p}</span> : p));

/* authentic IG / TT comment rows (real data) */
function IGRow({ c }) {
  return (
    <div className="ig-row">
      <span className="ig-row__av" style={{ background: avColor(c.u) }}>{c.u[0].toUpperCase()}</span>
      <div className="ig-row__b">
        <p><b>{c.u}</b> {renderText(c.t)}</p>
        <div className="ig-row__meta"><span>{timeAgo(c.u)}</span><span>{likeCount(c.u)} likes</span><span>Reply</span></div>
      </div>
      <span className="ig-row__h">♡</span>
    </div>
  );
}
function TTRow({ c }) {
  return (
    <div className="tt-row">
      <span className="tt-row__av" style={{ background: avColor(c.u) }}>{c.u[0].toUpperCase()}</span>
      <div className="tt-row__b">
        <span className="tt-row__u">{c.u}</span>
        <p className="tt-row__t">{renderText(c.t)}</p>
        <div className="tt-row__meta"><span>{timeAgo(c.u)}</span><span>Reply</span></div>
      </div>
      <div className="tt-row__like"><span>♡</span><small>{likeCount(c.u)}</small></div>
    </div>
  );
}

const CREATORS = ['Samantha', 'Lulu Lavender', 'Marina/Luckymia', 'Emma Boersma'];

function Opt({ id, name, theme, tall, wide, children }) {
  return (
    <figure className={`o-study ${wide ? 'o-study--wide' : ''}`}>
      <div className={`o-card o-card--${theme} ${tall ? 'o-card--tall' : ''} ${wide ? 'o-card--wide' : ''}`}>{children}</div>
      <figcaption className="o-cap"><span className="o-cap__id">{id}</span>{name}</figcaption>
    </figure>
  );
}

/* ============================ screens ============================ */
const SCREENS = [
  {
    key: 'cover', label: 'Cover', note: 'The opening moment.',
    options: [
      { id: 'A', name: 'Scrapbook', theme: 'paper', node: (
        <div className="o-cover-scrap"><span className="o-washi a" /><span className="o-washi b" /><span className="o-sticker">{BRAND}<br />WRAPPED</span><span className="o-pola" style={{ '--t': '-7deg' }}><i style={bg1} /></span><span className="o-hand o-cover-scrap__s">your year ↓</span></div>
      ) },
      { id: 'B', name: 'Mixtape', theme: 'ink', node: (
        <div className="o-mix"><div className="o-cass"><span className="o-cass__lbl o-hand">{BRAND} ’25</span><span className="o-cass__reels"><i /><i /></span></div><span className="o-mix__c">a campaign, wrapped</span></div>
      ) },
      { id: 'C', name: 'Wax envelope', theme: 'plum', node: (
        <div className="o-env-wrap"><div className="o-env"><span className="o-env__flap" /><span className="o-env__seal">♥</span></div><span className="o-env__cta">Open your Wrapped</span></div>
      ) },
      { id: 'D', name: 'Bold type', theme: 'grad-v', node: (
        <div className="o-bold"><span className="o-kick">2025</span><h3>YOUR<br />CAMPAIGN<br /><em>WRAPPED</em></h3><span className="o-bold__sub">{BRAND} · tap to begin</span></div>
      ) },
      { id: 'E', name: 'Magazine', theme: 'mag', node: (
        <div className="o-mag" style={bg1}><span className="o-mag__scrim" /><span className="o-mag__mast">{BRAND}</span><span className="o-mag__iss">THE 2025 WRAPPED ISSUE</span></div>
      ) },
      { id: 'F', name: 'Ticket', theme: 'cream', node: (
        <div className="o-ticket"><span className="o-ticket__t">ADMIT ONE</span><b>{BRAND} WRAPPED</b><span className="o-ticket__d">2025 · campaign recap</span><span className="o-ticket__perf" /></div>
      ) },
    ],
  },
  {
    key: 'reach', label: 'Reach', note: 'TikTok + IG views + ~10% stories.',
    options: [
      { id: 'A', name: 'Airmail stamps', theme: 'airmail', node: (
        <div className="o-air"><span className="o-air__t">✈ PAR AVION</span><div className="o-postmark"><b>778K</b><span>REACH</span></div><div className="o-stamprow"><span className="o-stamp">📸<i>707K</i></span><span className="o-stamp a">⚡<i>71K</i></span></div></div>
      ) },
      { id: 'B', name: 'Split-flap', theme: 'ink', node: (
        <div className="o-flap"><span className="o-kick">reach estimate</span><div className="o-flap__row">{['7','7','8','K'].map((d,i)=><span key={i}>{d}</span>)}</div><span className="o-flap__s">feeds &amp; stories</span></div>
      ) },
      { id: 'C', name: 'Billboard', theme: 'night', node: (
        <div className="o-bb"><div className="o-bb__screen"><span>{BRAND} REACHED</span><b>778,300</b><span>THIS CAMPAIGN</span></div></div>
      ) },
      { id: 'D', name: 'Big type + chips', theme: 'grad-b', node: (
        <div className="o-bignum"><span className="o-kick">reached</span><b>778.3K</b><div className="o-chips"><span>🎵 0</span><span>📸 707K</span><span>⚡ 71K</span></div></div>
      ) },
      { id: 'E', name: 'Passport', theme: 'paper', node: (
        <div className="o-passport"><span className="o-kick">REACH · ENTRIES</span><div className="o-passport__stamps"><span style={{'--t':'-8deg'}}>IG<i>707K</i></span><span style={{'--t':'6deg'}}>ST<i>71K</i></span><span style={{'--t':'-3deg'}}>★</span></div><b className="o-hand">778.3K total</b></div>
      ) },
      { id: 'F', name: 'Receipt', theme: 'cream', node: (
        <div className="o-receipt"><div className="o-receipt__hd">REACH RECEIPT</div><div className="o-receipt__ln"><span>Instagram</span><span>707K</span></div><div className="o-receipt__ln"><span>Stories est.</span><span>71K</span></div><div className="o-receipt__tot"><span>TOTAL</span><span>778.3K</span></div><span className="o-receipt__zig" /></div>
      ) },
    ],
  },
  {
    key: 'engagement', label: 'Engagement', note: 'Framed vs the 4% benchmark.',
    options: [
      { id: 'A', name: 'Analog gauge ✓', theme: 'instrument', node: (
        <div className="o-eng"><span className="o-kick light">engagement</span><div className="o-gauge"><span className="o-gauge__arc" /><span className="o-gauge__face" /><span className="o-gauge__needle" /><span className="o-gauge__hub" /></div><b className="o-eng__n">5.8%</b><span className="o-ok">✓ above 4%</span></div>
      ) },
      { id: 'B', name: 'Thermometer ✓', theme: 'warm', node: (
        <div className="o-eng"><span className="o-kick light">engagement</span><div className="o-therm"><span className="o-therm__fill" /><span className="o-therm__bulb" /><span className="o-therm__bench"><i />4%</span></div><b className="o-eng__n light">5.8%</b><span className="light">ran hot 🔥</span></div>
      ) },
      { id: 'C', name: 'Award medal', theme: 'plum', node: (
        <div className="o-eng"><div className="o-medal">★<span className="o-medal__r" /><span className="o-medal__r alt" /></div><b className="o-eng__n light">5.8%</b><span className="light">top of class · &gt; 4% avg</span></div>
      ) },
      { id: 'D', name: 'Progress ring', theme: 'ink', node: (
        <div className="o-eng"><div className="o-ring"><span className="o-ring__num">5.8%</span></div><span className="o-kick light">beat the 4% benchmark</span></div>
      ) },
      { id: 'E', name: 'Bar vs benchmark', theme: 'cream', node: (
        <div className="o-eng"><span className="o-kick">engagement vs avg</span><div className="o-bars"><span className="o-bars__b1"><i>you</i>5.8%</span><span className="o-bars__b2"><i>avg</i>4%</span></div></div>
      ) },
      { id: 'F', name: 'Speedometer', theme: 'instrument', node: (
        <div className="o-eng"><div className="o-speedo"><span className="o-speedo__n">5.8</span><span className="o-speedo__u">% eng</span><span className="o-speedo__needle" /></div><span className="o-ok">✓ above benchmark</span></div>
      ) },
    ],
  },
  {
    key: 'comments', label: 'Comments', note: `${WRAPPED_COMMENTS.length} real comments from the 28 Litsea launch.`,
    options: [
      { id: 'A', name: 'Screenshot wall ✓', theme: 'cream', node: (
        <div className="cwall-th">
          <span className="o-kick cwall-th__hd">worth flagging · {WRAPPED_COMMENTS.length} product-relevant comments</span>
          <div className="cwall-th__masonry">
            {WRAPPED_COMMENTS.map((c, i) => (
              <div key={i} className={`cwall-th__i ${i % 4 === 1 ? 'tape' : ''}`} style={{ '--r': `${((i % 5) - 2) * 1.2}deg` }}>
                {c.p === 'tt' ? <TTRow c={c} /> : <IGRow c={c} />}
              </div>
            ))}
          </div>
        </div>
      ) },
      { id: 'B', name: 'Grouped by creator', theme: 'paper', node: (
        <div className="cgroup">
          {CREATORS.map((cr) => {
            const list = WRAPPED_COMMENTS.filter((c) => c.cr === cr);
            if (!list.length) return null;
            return (
              <div key={cr} className="cgroup__sec">
                <div className="cgroup__hd"><b>{cr}</b><span>{list.length}</span></div>
                {list.slice(0, 3).map((c, i) => <div key={i} className="cgroup__c"><span className="cgroup__av" style={{ background: avColor(c.u) }}>{c.u[0].toUpperCase()}</span><p><b>{c.u}</b> {renderText(c.t)}</p></div>)}
                {list.length > 3 && <span className="cgroup__more">+ {list.length - 3} more</span>}
              </div>
            );
          })}
        </div>
      ) },
      { id: 'C', name: 'Notification stack', theme: 'night', node: (
        <div className="cnotif">
          <span className="o-kick light">they’re talking</span>
          {WRAPPED_COMMENTS.slice(0, 8).map((c, i) => (
            <span key={i} className="cnotif__i"><b>{c.p === 'tt' ? 'TT' : 'IG'}</b><i>{c.u}</i>{c.t.length > 34 ? c.t.slice(0, 34) + '…' : c.t}</span>
          ))}
          <span className="cnotif__more">+ {WRAPPED_COMMENTS.length - 8} more comments</span>
        </div>
      ) },
      { id: 'D', name: 'Marquee ticker', theme: 'grad-v', node: (
        <div className="cticker">
          <span className="o-kick light">the internet had thoughts</span>
          <div className="cticker__rows">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="cticker__row">
                {WRAPPED_COMMENTS.slice(row * 4, row * 4 + 4).map((c, i) => <span key={i}>“{c.t.replace(/@[\w.]+/g, '').trim()}” <em>@{c.u}</em></span>)}
              </div>
            ))}
          </div>
        </div>
      ) },
    ],
  },
  {
    key: 'content', label: 'Content', note: 'All posts, broken out per creator.',
    options: [
      { id: 'A', name: 'Polaroid pinboard ✓', theme: 'wall', node: (
        <div className="o-pin"><span className="o-pin__p" style={{'--t':'-5deg'}}><b className="o-pinpin" /><i style={bg1} /><u className="o-hand">1 of 2</u></span><span className="o-pin__p" style={{'--t':'4deg'}}><b className="o-pinpin" /><i style={bg2} /><u className="o-hand">2 of 2</u></span><span className="o-pin__cr o-hand">Samantha · @rmtfka</span></div>
      ) },
      { id: 'B', name: 'Film strip', theme: 'ink', node: (
        <div className="o-film"><span className="o-film__h" /><span className="o-film__f" style={bg1} /><span className="o-film__f" style={bg2} /><span className="o-film__h" /></div>
      ) },
      { id: 'C', name: 'Profile grid', theme: 'light', node: (
        <div className="o-grid"><span style={bg1}><i>1 of 2</i></span><span style={bg2}><i>2 of 2</i></span><span className="o-grid__more">+ soon</span><span style={bg2} /><span style={bg1} /><span className="o-grid__more" /></div>
      ) },
      { id: 'D', name: 'Magazine spread', theme: 'paper', node: (
        <div className="o-spread"><span className="o-spread__big" style={bg1} /><div className="o-spread__side"><span style={bg2} /><b className="o-hand">2 posts</b></div></div>
      ) },
      { id: 'E', name: 'Carousel stack', theme: 'plum', node: (
        <div className="o-stack"><span style={{...bg2,'--t':'8deg','--x':'18px'}} /><span style={{...bg1,'--t':'-4deg','--x':'0'}} /><span className="o-stack__c">2 pieces · swipe</span></div>
      ) },
    ],
  },
  {
    key: 'creator', label: 'Creator', note: 'Satisfaction + who to rebook.',
    options: [
      { id: 'A', name: 'Trading cards ✓', theme: 'plum', node: (
        <div className="o-tcards"><div className="o-tcard" style={{'--t':'-6deg'}}><span className="o-tcard__foil">★ FAV</span><span className="o-tcard__ph" style={bg1} /><b>Samantha</b><span className="o-stars">★★★★★</span></div><div className="o-tcard alt" style={{'--t':'5deg'}}><span className="o-tcard__foil alt">↻</span><span className="o-tcard__ph" style={bg2} /><b>Lulu Lavender</b><span className="o-stars">★★★★☆</span></div></div>
      ) },
      { id: 'B', name: 'Yearbook', theme: 'cream', node: (
        <div className="o-year"><div className="o-year__r"><span style={bg1} /><i className="o-hand">“most likely to go viral”</i></div><div className="o-year__r"><span style={bg2} /><i className="o-hand">“best in show”</i></div><span className="o-stamp-appr">APPROVED</span></div>
      ) },
      { id: 'C', name: 'Lineup card', theme: 'ink', node: (
        <div className="o-lineup"><span className="o-kick light">starting lineup</span><span className="o-lineup__l"><b>1</b> Samantha <em>★ fav</em></span><span className="o-lineup__l"><b>2</b> Lulu Lavender <em>rebook</em></span><span className="o-lineup__l"><b>3</b> Marina <em>standby</em></span></div>
      ) },
      { id: 'D', name: 'ID badges', theme: 'instrument', node: (
        <div className="o-badges"><div className="o-badge"><span className="o-badge__clip" /><span className="o-badge__ph" style={bg1} /><b>Samantha</b><small>CREATOR · FAV</small></div></div>
      ) },
      { id: 'E', name: 'Leaderboard', theme: 'grad-v', node: (
        <div className="o-board"><span className="o-board__r"><b>1</b><i style={bg1} />Samantha<u>707K</u></span><span className="o-board__r"><b>2</b><i style={bg2} />Lulu L.<u>340K</u></span></div>
      ) },
    ],
  },
  {
    key: 'note', label: 'Note', note: 'The human touch — your Benable lead.',
    options: [
      { id: 'A', name: 'Postcard ✓', theme: 'paper', node: (
        <div className="o-pc"><div className="o-pc__l"><p className="o-hand">Hey {BRAND}! What a launch 💜</p><span className="o-hand">— Katie</span></div><div className="o-pc__r"><span className="o-pc__stamp">♥</span><span className="o-pc__lines" /></div></div>
      ) },
      { id: 'B', name: 'Handwritten note', theme: 'cream', node: (
        <div className="o-hnote"><span className="o-washi a" /><span className="o-hnote__ph">K</span><p className="o-hand">So proud of this one — more soon!</p><span className="o-hand o-hnote__s">— Katie 💜</span></div>
      ) },
      { id: 'C', name: 'Chat bubble', theme: 'night', node: (
        <div className="o-chatpane"><span className="o-chatpane__av">K</span><span className="o-bub l">Hey {BRAND} team — what a launch 🎉</span><span className="o-bub l">Lining up round two now.</span><span className="o-kick light">Katie · now</span></div>
      ) },
      { id: 'D', name: 'Sticky note', theme: 'ink', node: (
        <div className="o-stickynote"><span className="o-stickynote__n o-hand">P.S. amazing work this round — K 💜</span></div>
      ) },
      { id: 'E', name: 'Letterhead', theme: 'paper', node: (
        <div className="o-letter"><span className="o-letter__hd">BENABLE</span><span className="o-letter__rule" /><p className="o-hand">Dear {BRAND}, what a launch…</p><span className="o-hand">— Katie</span></div>
      ) },
    ],
  },
  {
    key: 'recap', label: 'Recap', note: 'The shareable finale.',
    options: [
      { id: 'A', name: 'Magazine cover', theme: 'mag', node: (
        <div className="o-mag" style={bg1}><span className="o-mag__scrim" /><span className="o-mag__mast">{BRAND}</span><span className="o-mag__iss">2025 WRAPPED ISSUE</span><span className="o-mag__line"><b>778K</b> reached · <b>5.8%</b> eng</span></div>
      ) },
      { id: 'B', name: 'Instant photo', theme: 'cream', node: (
        <div className="o-share"><div className="o-share__ph"><span style={bg1} /><span style={bg2} /><span className="o-share__b">2025<br />WRAP</span></div><b className="o-hand">what a year!</b><span className="o-share__s">778K · 5.8% · 2</span></div>
      ) },
      { id: 'C', name: 'Vinyl sleeve', theme: 'ink', node: (
        <div className="o-vinyl"><span className="o-vinyl__disc" /><div className="o-vinyl__sl"><b>{BRAND} ’25</b><span>1. 778K reach</span><span>2. 5.8% eng</span><span>3. 2 posts</span></div></div>
      ) },
      { id: 'D', name: 'Certificate', theme: 'cream', node: (
        <div className="o-cert"><span className="o-cert__hd">CAMPAIGN OF THE YEAR</span><b className="o-hand">{BRAND}</b><span className="o-cert__row">778K · 5.8% · 2 posts</span><span className="o-cert__seal">★</span></div>
      ) },
      { id: 'E', name: 'Boarding pass', theme: 'plum', node: (
        <div className="o-pass"><div className="o-pass__m"><b>PIK → ROUND 2</b><small>{BRAND} · 2025 wrapped</small></div><div className="o-pass__s"><b>778K</b><small>reach</small></div></div>
      ) },
      { id: 'F', name: 'Big-type summary', theme: 'grad-v', node: (
        <div className="o-bignum"><span className="o-kick">that’s a wrap</span><b>778.3K</b><div className="o-chips"><span>5.8% eng</span><span>2 posts</span></div><span className="o-bold__sub">round two? →</span></div>
      ) },
    ],
  },
];

function Nav({ active }) {
  return (
    <nav className="ws-tabs">
      <Link to="/wrap-studies" className={!active ? 'on' : ''}>All</Link>
      {SCREENS.map((s) => (
        <Link key={s.key} to={`/wrap-studies/${s.key}`} className={s.key === active ? 'on' : ''}>
          {s.label}<small>{s.options.length}</small>
        </Link>
      ))}
    </nav>
  );
}

export default function WrapStudies() {
  const { screen } = useParams();
  const current = SCREENS.find((s) => s.key === screen);

  if (!current) {
    return (
      <div className="ws">
        <header className="ws-top">
          <span className="ws-top__kicker">Benable · Campaign Wrapped</span>
          <h1>Design Studies</h1>
          <p>Each screen has its own page so you can iterate on them in parallel. Open any link below in its own chat.</p>
        </header>
        <Nav active={null} />
        <div className="ws-index">
          {SCREENS.map((s) => (
            <Link key={s.key} to={`/wrap-studies/${s.key}`} className="ws-index__card">
              <b>{s.label}</b>
              <small>{s.options.length} options · {s.note}</small>
              <code>/wrap-studies/{s.key}</code>
            </Link>
          ))}
        </div>
        <footer className="ws-foot">Pick a screen → open it in its own chat → iterate. Tell me the winners as “screen + letter”.</footer>
      </div>
    );
  }

  return (
    <div className="ws">
      <header className="ws-top">
        <span className="ws-top__kicker">Benable · Campaign Wrapped · Studies</span>
        <h1>{current.label}</h1>
        <p>{current.note}</p>
      </header>
      <Nav active={current.key} />
      <div className="o-grid-wrap">
        {current.options.map((o) => (
          <Opt key={o.id} id={o.id} name={o.name} theme={o.theme} wide>{o.node}</Opt>
        ))}
      </div>
      <footer className="ws-foot">This is the <b>{current.label}</b> study · <code>/wrap-studies/{current.key}</code> — tell me which letter to build at full fidelity.</footer>
    </div>
  );
}
