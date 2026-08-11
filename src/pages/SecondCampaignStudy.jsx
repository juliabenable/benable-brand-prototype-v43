import '../styles/content-study.css';
import '../styles/second-campaign-study.css';

/**
 * Design study — the SECOND-CAMPAIGN MOMENT.
 * How do we tell a brand "it's time to launch again" and make it feel
 * exciting, not salesy? Explores WHY-NOW framings (creators want you back,
 * momentum, a ready-made draft, seasonal windows, cadence, unlocked perks)
 * and WHERE it lives (wrap finale, dashboard, takeover moment, note from
 * Katie, quiet nudge).
 *
 * Copy guardrail (Tony/Julia): the offer is "keep running campaigns" —
 * an ongoing rhythm — NOT a one-off bigger "round two". Celebratory,
 * honest numbers, never clinical.
 */

const CREATORS = [
  ['M', '#7a5cfa'],
  ['S', '#e0619b'],
  ['A', '#3aa47e'],
  ['J', '#e08b3c'],
];

function Stack({ more }) {
  return (
    <div className="scs-stack">
      {CREATORS.map(([ini, bg]) => (
        <span key={ini} className="scs-stack__av" style={{ background: bg }}>{ini}</span>
      ))}
      {more && <span className="scs-stack__av scs-stack__av--more">+{more}</span>}
    </div>
  );
}

function Cta({ children, ghost, onDark }) {
  const cls = `scs-cta${ghost ? ' scs-cta--ghost' : ''}${onDark ? ' scs-cta--ondark' : ''}`;
  return (
    <button type="button" className={cls}>
      {children}<span className="scs-cta__arr" aria-hidden="true">→</span>
    </button>
  );
}

/* light dashboard wrapper for realism */
function Frame({ slot, children }) {
  return (
    <div className="scs-frame">
      <div className="scs-titlerow">
        <span className="scs-title">Spring Glow Campaign</span>
        <span className="scs-status">WRAPPED</span>
        <span className="scs-spacer" />
        <span className="scs-ghostbtn">See wrap-up</span>
      </div>
      {slot || children}
      <div className="scs-rows" aria-hidden="true">
        {[0, 1].map((i) => (
          <div className="scs-row" key={i}>
            <span className="scs-av" />
            <span className="scs-line" style={{ width: 150 }} />
            <span className="scs-line" style={{ width: 70, marginLeft: 'auto' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── A. wrap-up finale slide ── */
const SPARKS = [
  ['6%', '12%', '✦'], ['14%', '86%', '✧'], ['78%', '8%', '✧'],
  ['84%', '90%', '✦'], ['30%', '94%', '·'], ['64%', '4%', '·'],
];
function FinaleSlide() {
  return (
    <div className="cst-card cst-card--ink">
      <div className="cst-chrome">
        <div className="cst-chrome__bars">
          {[...Array(7)].map((_, i) => <span key={i} className={i < 7 ? 'on' : ''} />)}
        </div>
        <div className="cst-chrome__head"><span className="cst-chrome__dot" />SPRING GLOW · WRAP-UP</div>
      </div>
      <div className="cst-card__body">
        <div className="scs-finale">
          {SPARKS.map(([top, left, ch], i) => (
            <span key={i} className="scs-finale__spark" style={{ top, left }} aria-hidden="true">{ch}</span>
          ))}
          <span className="scs-finale__eyebrow">One last thing</span>
          <h3>This doesn’t have to be a one-time thing.</h3>
          <Stack more={2} />
          <p>
            Four of your creators said they’d love to work with you again.
            Brands that keep a rhythm going get fresh content every month —
            and creators who already know the product.
          </p>
          <Cta onDark>Plan the next one</Cta>
        </div>
      </div>
    </div>
  );
}

/* ── B. creators want you back ── */
const WantBack = () => (
  <div className="scs-wantback">
    <Stack more={2} />
    <div className="scs-wantback__copy">
      <div className="scs-wantback__lede">Your creators want to go again 💜</div>
      <div className="scs-wantback__sub">
        Mia, Sofia and 4 others said yes to another collab when you thanked them.
        They already know the product — a second brief goes out in minutes.
      </div>
    </div>
    <Cta>Start with them</Cta>
  </div>
);

/* ── C. momentum meter ── */
const Momentum = () => (
  <div className="scs-momentum">
    <div className="scs-momentum__top">
      <span className="scs-momentum__lede">Your audience is still warm</span>
      <span className="scs-momentum__pill">MOMENTUM WINDOW</span>
    </div>
    <div className="scs-momentum__sub">
      Spring Glow posts are still being seen and saved this week. Launching your next
      campaign while the feed is warm compounds that reach instead of restarting it.
    </div>
    <div className="scs-meter">
      <span className="scs-meter__dot" style={{ left: '26%' }} />
    </div>
    <div className="scs-meter__labels"><span>Wrapped</span><span>Warm — you are here</span><span>Cooling</span><span>Cold start</span></div>
    <div className="scs-momentum__foot">
      <span className="scs-spacer" />
      <Cta ghost>Not yet</Cta>
      <Cta>Keep the momentum</Cta>
    </div>
  </div>
);

/* ── D. drafted-for-you ── */
const Draft = () => (
  <div className="scs-draft">
    <div className="scs-draft__preview">
      <div className="scs-draft__tag">Draft · Ready to review</div>
      <div className="scs-draft__name">Summer Glow Campaign</div>
      <div className="scs-draft__meta">
        6 creators — incl. 4 returning<br />
        Same brief, refreshed angles<br />
        Suggested launch: Aug 4
      </div>
    </div>
    <div className="scs-draft__body">
      <div className="scs-draft__lede">We already drafted your next campaign ✨</div>
      <div className="scs-draft__sub">
        Built from what worked in Spring Glow — the creators who delivered, the products
        people commented on. Review it, tweak anything, launch when you’re ready.
      </div>
      <div className="scs-draft__actions">
        <Cta>Review the draft</Cta>
        <Cta ghost>Start from scratch</Cta>
      </div>
    </div>
  </div>
);

/* ── E. seasonal window ── */
const Season = () => (
  <div className="scs-season">
    <div className="scs-season__lede">Holiday content gets made in the fall 🍂</div>
    <div className="scs-season__sub">
      Creators book out weeks ahead of the big seasonal moments. Starting your next campaign
      now means your content lands right when shoppers are looking.
    </div>
    <div className="scs-season__rail">
      <div className="scs-season__chip scs-season__chip--hot"><b>Now → Aug</b>brief + match creators</div>
      <div className="scs-season__chip"><b>September</b>content created</div>
      <div className="scs-season__chip"><b>October</b>posts go live</div>
      <div className="scs-season__chip"><b>Nov–Dec</b>shoppers find you</div>
    </div>
    <div className="scs-season__foot">
      <span className="scs-spacer" />
      <Cta>Plan my fall campaign</Cta>
    </div>
  </div>
);

/* ── F. journey / cadence path ── */
const Journey = () => (
  <div className="scs-journey">
    <div className="scs-journey__lede">You’re one campaign in. Here’s what a rhythm looks like.</div>
    <div className="scs-path">
      <div className="scs-path__node">
        <div className="scs-path__dot scs-path__dot--done">✓</div>
        <div className="scs-path__t">Spring Glow</div>
        <div className="scs-path__d">Wrapped · 12 posts</div>
      </div>
      <div className="scs-path__link scs-path__link--done" />
      <div className="scs-path__node">
        <div className="scs-path__dot scs-path__dot--here">2</div>
        <div className="scs-path__t">Campaign 2</div>
        <div className="scs-path__d">you are here</div>
      </div>
      <div className="scs-path__link" />
      <div className="scs-path__node">
        <div className="scs-path__dot">♥</div>
        <div className="scs-path__t">Regulars</div>
        <div className="scs-path__d">creators who know you</div>
      </div>
      <div className="scs-path__link" />
      <div className="scs-path__node">
        <div className="scs-path__dot">∞</div>
        <div className="scs-path__t">Always-on</div>
        <div className="scs-path__d">fresh content monthly</div>
      </div>
    </div>
    <div className="scs-journey__foot">
      <span className="scs-journey__hint">Most brands start campaign 2 within three weeks of wrapping.</span>
      <span className="scs-spacer" />
      <Cta>Start campaign 2</Cta>
    </div>
  </div>
);

/* ── G. full-screen takeover moment ── */
const BURSTS = [
  ['8%', '10%', '🎉'], ['12%', '84%', '✨'], ['80%', '14%', '✨'],
  ['74%', '88%', '🎊'], ['4%', '48%', '·'],
];
const Takeover = () => (
  <div className="scs-takeover">
    <div className="scs-takeover__ghost" aria-hidden="true" />
    <div className="scs-takeover__card">
      {BURSTS.map(([top, left, ch], i) => (
        <span key={i} className="scs-takeover__burst" style={{ top, left }} aria-hidden="true">{ch}</span>
      ))}
      <div className="scs-takeover__kicker">It’s time</div>
      <h3>Ready to do it again?</h3>
      <p>
        Spring Glow wrapped beautifully — and your creators are asking what’s next.
        The brands that win on Benable make it a rhythm, not a one-off.
      </p>
      <Cta onDark>Launch my next campaign</Cta>
      <button type="button" className="scs-takeover__later">Give me a couple weeks</button>
    </div>
  </div>
);

/* ── H. note from Katie ── */
const Katie = () => (
  <div className="scs-katie">
    <div className="scs-katie__av">K</div>
    <div>
      <div className="scs-katie__who"><b>Katie</b> · your Benable team · just now</div>
      <div className="scs-katie__note">
        “Spring Glow was such a good first one — Mia’s reel is still getting comments!
        I’ve got a shortlist of creators (four of yours want back in) whenever you want
        to line up the next campaign. Want me to set it up?”
      </div>
      <div className="scs-katie__actions">
        <Cta>Yes — set it up</Cta>
        <span className="scs-katie__reply">or just reply to Katie’s email</span>
      </div>
    </div>
  </div>
);

/* ── I. quiet inline nudge ── */
const Inline = () => (
  <div className="scs-inline">
    <span className="scs-inline__dot" aria-hidden="true" />
    Your wrap-up looked great — most brands launch their next campaign within three weeks.
    <span className="scs-inline__link">Start yours →</span>
  </div>
);

/* ── J. unlocked perks ── */
const Unlock = () => (
  <div className="scs-unlock">
    <div className="scs-unlock__badge">🏆</div>
    <div>
      <div className="scs-unlock__lede">First campaign complete — you’ve unlocked returning-brand perks</div>
      <div className="scs-unlock__sub">These kick in the moment you launch campaign 2.</div>
      <div className="scs-unlock__perks">
        <span className="scs-unlock__perk">⚡ Priority creator matching</span>
        <span className="scs-unlock__perk">💜 Your favorited creators, first</span>
        <span className="scs-unlock__perk">📈 Cross-campaign trends</span>
      </div>
    </div>
    <span className="scs-spacer" />
    <Cta onDark>Claim &amp; launch</Cta>
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

export default function SecondCampaignStudy() {
  return (
    <div className="cst">
      <header className="cst-top">
        <span className="cst-top__kicker">Benable · Brand Portal</span>
        <h1>The second-campaign moment — design study</h1>
        <p>
          How do we tell a brand <b>it’s time to launch again</b> — and make that feel like an
          exciting moment, not an upsell? Directions A–J mix <b>why-now framings</b> (creators
          want you back, momentum, a ready-made draft, seasonal windows, cadence, unlocked perks)
          with <b>surfaces</b> (wrap finale, dashboard, takeover, a note from Katie, a quiet line).
          Guardrail: the ask is “keep running campaigns” — an ongoing rhythm — never a one-off
          bigger “round two.” These stack: e.g. A at the wrap, then D on the dashboard a week later.
        </p>
      </header>

      <Study id="A" title="Wrap-up finale slide" desc="The last slide of the wrap becomes the invitation — ride the celebration high. Trigger: end of wrap flow.">
        <FinaleSlide />
      </Study>

      <Study id="B" title="Creators want you back" desc="Lead with the re-collab yeses from the say-thanks flow. The warmest, most human why-now we have. Trigger: ≥2 re-collab yeses.">
        <Frame slot={<WantBack />} />
      </Study>

      <Study id="C" title="Momentum window" desc="A warm→cold meter makes 'launch while the feed is warm' visceral without fake stats. Gentle urgency. Trigger: 1–3 weeks post-wrap.">
        <Frame slot={<Momentum />} />
      </Study>

      <Study id="D" title="We drafted it for you" desc="Zero-effort excitement: a ready-made next campaign built from what worked. Review, tweak, launch. Trigger: ~1 week post-wrap.">
        <Frame slot={<Draft />} />
      </Study>

      <Study id="E" title="Seasonal window" desc="Anchor the timing to a real calendar moment — holiday content gets made in the fall. Trigger: seasonal lead-time calendar.">
        <Frame slot={<Season />} />
      </Study>

      <Study id="F" title="The rhythm path" desc="Zoom out: campaign 1 was step one of a journey. Duolingo-style path sells cadence, not a transaction. Trigger: dashboard, persistent.">
        <Frame slot={<Journey />} />
      </Study>

      <Study id="G" title="'It's time' takeover" desc="A full-screen celebratory moment — the boldest option. Best used once, at a genuinely earned trigger. Trigger: first dashboard visit after wrap.">
        <Takeover />
      </Study>

      <Study id="H" title="A note from Katie" desc="No UI machinery — a human who watched the campaign says 'want me to set up the next one?'. Trigger: Katie, ~1 week post-wrap.">
        <Frame slot={<Katie />} />
      </Study>

      <Study id="I" title="The quiet line" desc="A one-line social-proof nudge. Zero pressure — the control condition the louder options get measured against.">
        <Frame slot={<Inline />} />
      </Study>

      <Study id="J" title="Unlocked perks" desc="Completing campaign 1 unlocked returning-brand perks that activate on launch 2. Reframes 'buy again' as 'claim what you earned.'">
        <Frame slot={<Unlock />} />
      </Study>

      <footer className="cst-foot">
        Second-campaign moment study. These aren’t mutually exclusive — pick a hero moment (A/G/H),
        a dashboard follow-up (B/C/D), and a persistent frame (F/J). Tell me which to build into the flow.
      </footer>
    </div>
  );
}
