import '../styles/content-study.css';

/**
 * Design study — Campaign Wrapped, CONTENT section.
 * Direction D (chosen): Scattered photo wall — refined.
 * Clean rounded photos (no polaroid frame), tilted & overlapping like a wall,
 * washi-tape accents, and a clean creator tag pill on each. Framed inside a
 * theatrical Wrapped card.
 */

const IMG1 = 'https://benable-followers.s3.amazonaws.com/ig-siennapierre-reel-3176745985120116844-full.jpg';
const IMG2 = 'https://benable-followers.s3.amazonaws.com/ig-siennapierre-reel-3207770097225833451-full.jpg';

const CONTENT = [
  { name: 'Samantha Reyes', handle: '@samanthaglow', pic: IMG2, posts: [{ img: IMG1, p: 'TikTok' }, { img: IMG2, p: 'TikTok' }] },
  { name: 'Lulu Lavender', handle: '@lulu.lavender', pic: IMG1, posts: [{ img: IMG2, p: 'TikTok' }] },
  { name: 'Marina Petrova', handle: '@luckymia', pic: IMG2, posts: [{ img: IMG1, p: 'Instagram' }] },
  { name: 'Emma Boersma', handle: '@emmaboersma', pic: IMG1, posts: [{ img: IMG2, p: 'TikTok' }] },
];
const POST_COUNT = CONTENT.reduce((n, c) => n + c.posts.length, 0);
const CREATOR_COUNT = CONTENT.length;
const ALL = CONTENT.flatMap((c) => c.posts.map((post) => ({ ...post, creator: c })));

// per-photo layout: tilt, vertical offset, width, tape tint
const LAY = [
  { t: '-5deg', mt: '14px', w: 188, tape: '#ffd2e0' },
  { t: '3deg', mt: '52px', w: 174, tape: '#cfe0ff' },
  { t: '-2deg', mt: '0px', w: 200, tape: '#fff0c2' },
  { t: '4deg', mt: '46px', w: 178, tape: '#d9f2e0' },
  { t: '-4deg', mt: '20px', w: 190, tape: '#e7dcff' },
];

function Study({ id, title, desc, theme, children }) {
  return (
    <section className="cst-study">
      <div className="cst-study__label"><span className="cst-study__id">{id}</span><b>{title}</b><small>{desc}</small></div>
      <div className={`cst-card cst-card--${theme}`}>
        <div className="cst-chrome">
          <div className="cst-chrome__bars">{[...Array(8)].map((_, i) => <span key={i} className={i < 4 ? 'on' : ''} />)}</div>
          <div className="cst-chrome__head"><span className="cst-chrome__dot" />PIKORA · WRAPPED</div>
        </div>
        <div className="cst-card__body">{children}</div>
      </div>
    </section>
  );
}

function ScatterWall() {
  return (
    <div className="sw">
      <div className="cnt-head">
        <span className="cnt-eyebrow">The content they made</span>
        <h3>{POST_COUNT} pieces · {CREATOR_COUNT} creators</h3>
      </div>
      <div className="sw__board">
        {ALL.map((post, i) => {
          const l = LAY[i % LAY.length];
          return (
            <div key={i} className="sw__photo" style={{ '--t': l.t, marginTop: l.mt, width: `${l.w}px`, marginLeft: i ? '-12px' : 0, marginRight: '8px', zIndex: i + 1 }}>
              <span className="sw__tape" style={{ background: l.tape }} />
              <a className="sw__img" href="#" onClick={(e) => e.preventDefault()} style={{ backgroundImage: `url(${post.img})` }} />
              <span className="sw__tag">
                <span className="sw__tag-av" style={{ backgroundImage: `url(${post.creator.pic})` }} />
                <span className="sw__tag-who"><b>{post.creator.name}</b><small>{post.creator.handle}</small></span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ContentStudy() {
  return (
    <div className="cst">
      <header className="cst-top">
        <span className="cst-top__kicker">Benable · Campaign Wrapped</span>
        <h1>Content section — scattered photo wall</h1>
        <p>Direction D, refined. Tell me what else to tweak — photo size, overlap, tape, tag style.</p>
      </header>

      <Study id="D" title="Scattered photo wall" desc="Clean rounded photos, tilted & overlapping, washi tape + creator tag." theme="wall">
        <ScatterWall />
      </Study>

      <footer className="cst-foot">Content section — refining direction D.</footer>
    </div>
  );
}
