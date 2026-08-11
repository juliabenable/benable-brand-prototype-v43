import '../styles/content-study.css';
import '../styles/content-count-study.css';
import { ContentSpotlight } from '../components/glowlove/glowLoveSlides.jsx';

/**
 * Final design — the wrap's CONTENT slide uses a centered "gallery" (a
 * static, balanced row) when a campaign has 1–4 pieces, instead of the 3D
 * coverflow (which goes lopsided below ~5 cards). Shown at real deck size.
 */

function Study({ id, title, desc, children }) {
  return (
    <section className="cst-study">
      <div className="cst-study__label"><span className="cst-study__id">{id}</span><b>{title}</b><small>{desc}</small></div>
      <div className="ccs-stagewrap">
        <div className="gl-stage gl-grad--f">
          <div className="gl-body">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function ContentCountStudy() {
  const counts = [1, 2, 3, 4];
  return (
    <div className="cst">
      <header className="cst-top">
        <span className="cst-top__kicker">Benable · Campaign Wrapped</span>
        <h1>Content slide — centered gallery (1–4 pieces)</h1>
        <p>Final design at real deck size. When a campaign has <b>4 or fewer</b> pieces, the content slide shows a centered, balanced gallery instead of the 3D coverflow (which looks lopsided with only a few cards). 1 piece is a single hero card; 2–4 are an even centered row. At <b>5+</b> pieces it keeps the coverflow. The headline count adapts (“1 new piece”, “2 new pieces”…).</p>
      </header>

      {counts.map((n) => (
        <Study key={n} id={`${n}`} title={`${n} content piece${n === 1 ? '' : 's'}`} desc={n === 1 ? 'Single hero card, centered.' : `Centered row of ${n}, every card full-size.`}>
          <ContentSpotlight maxItems={n} layout="gallery" staticIdx={0} />
        </Study>
      ))}

      <footer className="cst-foot">Live behavior: ContentSpotlight auto-selects this gallery at ≤4 pieces (GALLERY_MAX = 4), coverflow at 5+. No props needed in production.</footer>
    </div>
  );
}
