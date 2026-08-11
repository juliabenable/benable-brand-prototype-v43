import '../styles/content-study.css';
import '../styles/banner-study.css';

/**
 * Design study — the dashboard wrap-up ENTRY POINT.
 * New copy: "Your campaign has ended." Tony dislikes the current pink
 * color and isn't sold on the banner format, so this explores alternative
 * FORMATS (some not a banner) and non-pink COLOR options.
 */

const LEDE = 'Your campaign has ended';
const SUB = 'Your wrap-up is ready.';
const CTA = 'See your wrap-up';

function Cta({ ghost }) {
  return (
    <button type="button" className={`bst-cta${ghost ? ' bst-cta--ghost' : ''}`}>
      {CTA}<span className="bst-cta__arr" aria-hidden="true">→</span>
    </button>
  );
}

function GhostRows() {
  return (
    <div className="bst-rows" aria-hidden="true">
      {[0, 1].map((i) => (
        <div className="bst-row" key={i}>
          <span className="bst-av" />
          <span className="bst-line" style={{ width: 150 }} />
          <span className="bst-line" style={{ width: 70, marginLeft: 'auto' }} />
        </div>
      ))}
    </div>
  );
}

/* Dashboard context wrapper. Flags tweak the chrome per direction. */
function Ctx({ pal = 'pal-slate', slot, headerBtn, tabCta, subheadCta, hideSubheadActions }) {
  return (
    <div className={`bst-frame ${pal}`}>
      <div className="bst-titlerow">
        <span className="bst-title">Spring Glow Campaign</span>
        <span className="bst-status bst-status--ended">ENDED</span>
        <span className="bst-spacer" />
        {headerBtn
          ? <button type="button" className="bst-headerbtn">★ {CTA}</button>
          : <span className="bst-ghostbtn">Campaign Details</span>}
      </div>

      <div className="bst-tabs">
        <span className="bst-tab bst-tab--on">Dashboard</span>
        <span className="bst-tab">Content</span>
        <span className={`bst-tab ${tabCta ? 'bst-tab--cta' : ''}`}>★ Wrap-up{tabCta && <span className="bst-tabdot" />}</span>
      </div>

      <div className="bst-subhead">
        <div>
          <h4>Invited Creators</h4>
          <p>Track outreach and creator responses.</p>
        </div>
        {subheadCta && <span className="bst-spacer" />}
        {subheadCta && <Cta />}
        {!subheadCta && !hideSubheadActions && (
          <><span className="bst-spacer" /><span className="bst-ghostbtn">Add Creators</span><span className="bst-ghostbtn">Filter</span></>
        )}
      </div>

      {slot && <div className="bst-slot">{slot}</div>}
      <GhostRows />
    </div>
  );
}

/* ── entry-point treatments ── */
const BannerSoft = () => (
  <div className="bst-banner">
    <span className="bst-banner__ic" aria-hidden="true">✓</span>
    <div className="bst-banner__copy">
      <span className="bst-banner__lede">{LEDE}</span>
      <span className="bst-banner__sub">{SUB}</span>
    </div>
    <Cta />
  </div>
);

const BannerBar = () => (
  <div className="bst-banner bst-banner--bar">
    <div className="bst-banner__copy">
      <span className="bst-banner__lede">{LEDE}</span>
      <span className="bst-banner__sub">{SUB}</span>
    </div>
    <Cta ghost />
  </div>
);

const Card = () => (
  <div className="bst-card">
    <span className="bst-card__ic" aria-hidden="true">★</span>
    <div className="bst-card__body">
      <div className="bst-card__t">{LEDE}</div>
      <div className="bst-card__d">See the full wrap-up — reach, engagement, the wall of love, and a note from your team.</div>
      <div className="bst-card__actions"><Cta /><button type="button" className="bst-cta bst-cta--ghost">Maybe later</button></div>
    </div>
    <button type="button" className="bst-card__x" aria-label="Dismiss">✕</button>
  </div>
);

const Hero = () => (
  <div className="bst-hero">
    <div className="bst-hero__copy">
      <div className="bst-hero__t">{LEDE} 🎉</div>
      <div className="bst-hero__d">Your wrap-up is ready — see how it performed.</div>
    </div>
    <Cta />
  </div>
);

const Inline = () => (
  <div className="bst-inline">
    <span className="bst-inline__dot" aria-hidden="true" />
    {LEDE}. <span className="bst-inline__link">See your wrap-up →</span>
  </div>
);

const Toast = () => (
  <div className="bst-toastwrap">
    <span className="bst-toasthint">appears bottom-right, dismissible</span>
    <div className="bst-toast">
      <span className="bst-toast__ic" aria-hidden="true">★</span>
      <span>{LEDE} — your wrap-up is ready.</span>
      <Cta />
    </div>
  </div>
);

function Study({ id, title, desc, children }) {
  return (
    <section className="cst-study">
      <div className="cst-study__label"><span className="cst-study__id">{id}</span><b>{title}</b><small>{desc}</small></div>
      {children}
    </section>
  );
}

const PALETTES = [
  ['pal-slate', 'Slate'],
  ['pal-indigo', 'Indigo (brand)'],
  ['pal-ink', 'Ink / navy'],
  ['pal-emerald', 'Emerald'],
  ['pal-amber', 'Amber'],
  ['pal-graphite', 'Graphite (mono)'],
];

export default function BannerStudy() {
  return (
    <div className="cst">
      <header className="cst-top">
        <span className="cst-top__kicker">Benable · Brand Dashboard</span>
        <h1>Wrap-up entry point — design study</h1>
        <p>New copy throughout: <b>“Your campaign has ended.”</b> Tony doesn’t like the current pink and isn’t sold on the banner format — so this explores alternative <b>formats</b> (some aren’t a banner at all) and non-pink <b>color</b> options. Each is shown in a realistic dashboard panel. Default palette here is a calm slate; the color row at the end shows the same treatment across six non-pink palettes.</p>
      </header>

      <header className="cst-top" style={{ marginTop: 4 }}>
        <h1 style={{ fontSize: 26 }}>Formats</h1>
      </header>

      <Study id="A" title="Soft banner (recolored)" desc="The current format, de-pinked — neutral wash, check icon, filled CTA. Lowest-effort change.">
        <Ctx slot={<BannerSoft />} />
      </Study>
      <Study id="B" title="Left-accent banner" desc="White surface, thin accent bar, quiet ghost CTA. Calmer than a full wash.">
        <Ctx slot={<BannerBar />} />
      </Study>
      <Study id="C" title="Card / panel" desc="More substantial: icon tile, title + supporting line, primary + secondary action, dismissible.">
        <Ctx slot={<Card />} />
      </Study>
      <Study id="D" title="Header button — no banner" desc="Entry point lives as a button in the page header; the Wrap-up tab gets a dot. Zero banner, zero added row.">
        <Ctx headerBtn tabCta pal="pal-indigo" />
      </Study>
      <Study id="E" title="Inline status line" desc="Minimal text row under the section header — a status, not a box. The quietest option.">
        <Ctx slot={<Inline />} hideSubheadActions />
      </Study>
      <Study id="F" title="Section-header CTA" desc="No banner: a button sits in the ‘Invited Creators’ header row, opposite the title.">
        <Ctx subheadCta />
      </Study>
      <Study id="G" title="Hero strip" desc="Full-width celebratory strip with a gradient (uses the accent, not pink). Most prominent.">
        <Ctx slot={<Hero />} pal="pal-indigo" hideSubheadActions />
      </Study>
      <Study id="H" title="Toast / floating pill" desc="A dismissible pill in the corner instead of occupying layout space. Good if it should feel transient.">
        <Ctx slot={<Toast />} />
      </Study>

      <header className="cst-top" style={{ marginTop: 28 }}>
        <h1 style={{ fontSize: 26 }}>Color options (no pink)</h1>
        <p>The soft-banner format across six palettes, so Tony can pick a direction. Same copy and layout — only the accent + wash change.</p>
      </header>

      {PALETTES.map(([cls, name]) => (
        <Study key={cls} id="◆" title={name} desc={`${cls.replace('pal-', '')} accent + wash.`}>
          <div className={`bst-frame ${cls}`} style={{ padding: '18px 24px' }}>
            <BannerSoft />
          </div>
        </Study>
      ))}

      <footer className="cst-foot">Wrap-up entry point study. Copy locked to “Your campaign has ended.” Tell me which format + palette to build into the dashboard.</footer>
    </div>
  );
}
