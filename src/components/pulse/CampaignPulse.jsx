import { useEffect, useReducer, useRef, useState } from 'react';
import '../../styles/pulse.css';
import { DAYS, LOCAL, crewFor } from './pulseData.js';
import { stageOf, AmineProgress2, AmineRail, StayTuned, CreatorsFound } from './amine.jsx';
import FixedTable from './tableFix.jsx';
import { reviewNeeds, getReviewMode, setReviewMode } from './review.jsx';

/*
  Campaign Pulse v34 — single experience (v33's C), kept lean for polishing:
  stat row + Amine stage rail + creators table + right rail, driven by the
  DAYS/CREW demo states. The A–D/W/Y/Z/0 exploration lives in v33 and git.
  v37: a COLLAB TYPE toggle (product | local) sits at the very top — local
  collabs swap the order stages for Confirmed/Visited and never mention
  shipping (Julia, Jul 27).
*/

// Survive captured-DOM remounts.
let persistedIdx = 3; // open on Day 9 — the dead middle is the thesis
let persistedMode = 'product';
/* v39 locks Julia's picks (Jul 28): table F only · rail A (split cards) ·
   stage = ramp dot + word (3A) · actions = calm (4C) · icons off.
   Undecided dims ship at their F defaults: edu footnote (B) · late quiet (7A) ·
   header grey #f8f9fa · ship band · amber buttons. Flip here if she re-opens one. */
const F_OPTS = { edu: 'b', stage: 'dots', act: 'calm', late: 'quiet', icons: 'off', btn: 'amber' };
/* v40 (Jul 29) — Julia's final picks, LOCKED: Grey header tint · ship flow in
   the card header · table K · solid wrap ring. The HEADER/SHIP/TABLE/RING
   switchers are gone from the pill (deep-links still accept overrides for the
   states gallery); the exploration lives in v39. */
let persistedToggles = { head: 'grey', ship: 'head', table: 'k', ring: 'solid' };
/* review direction (v43): 'modal' = Amine's review-content modal (default) ·
   'chat' = the conversation. The v42 sheet direction was removed (Julia,
   Aug 17) — it lives on in frozen v42. */
let persistedRui = 'modal';
/* Katie's per-brand admin switch: declined invites stay hidden by default */
let persistedDeclined = false;

/* Demo deep-links (states-review gallery): ?day=9&mode=local&table=k&head=white
   &ship=head&ring=badge seed the demo state; ?embed=1 hides the demo chrome.
   No params → behavior unchanged. */
const Q = new URLSearchParams(window.location.search);
const EMBED = Q.has('embed');
if (Q.get('mode') === 'local') persistedMode = 'local';
if (['modal', 'chat'].includes(Q.get('rui'))) persistedRui = Q.get('rui');
if (Q.has('declined')) persistedDeclined = Q.get('declined') !== '0';
for (const k of ['table', 'head', 'ship', 'ring']) if (Q.has(k)) persistedToggles = { ...persistedToggles, [k]: Q.get(k) };
if (Q.has('day')) {
  const qDays = persistedMode === 'local' ? DAYS.filter((d) => !d.productOnly) : DAYS;
  const qi = qDays.findIndex((d) => d.day === Number(Q.get('day')));
  if (qi >= 0) persistedIdx = qi;
}

export default function CampaignPulse() {
  const [idx, setIdx] = useState(persistedIdx);
  const [mode, setMode] = useState(persistedMode);
  const [tg, setTg] = useState(persistedToggles);
  const setToggle = (k, v) => setTg((o) => ({ ...o, [k]: v }));
  const [openCrew, setOpenCrew] = useState(() => new Set());
  const [stageFilter, setStageFilter] = useState(null);
  /* review decisions land on asset objects (review.jsx) — pulse the whole
     page so the rail, chips and table re-derive together */
  const [, pulse] = useReducer((n) => n + 1, 0);
  /* WHO REVIEWS — per-brand config (Aug 10 study @4218): 'benable' default,
     'brand' = the Trilogy model. Module getter feeds every derivation, so
     set it synchronously before re-rendering. */
  const [review, setReview] = useState(getReviewMode());
  const switchReview = (r) => { setReviewMode(r); setReview(r); };
  /* v43 explores review direction B: the conversation (reviewChat.jsx).
     Chat opens by default; the v42 sheet stays one click away. */
  const [rui, setRui] = useState(persistedRui);
  useEffect(() => { persistedRui = rui; }, [rui]);
  /* declined-invites visibility — Katie's admin switch, off by default */
  const [showDeclined, setShowDeclined] = useState(persistedDeclined);
  useEffect(() => { persistedDeclined = showDeclined; }, [showDeclined]);
  const rootRef = useRef(null);
  // some days only exist for one collab type (day 10 = CSV shipping)
  const days = mode === 'local' ? DAYS.filter((d) => !d.productOnly) : DAYS;
  const base = days[Math.min(idx, days.length - 1)];
  /* day-16 recap/upNext copy differs by reviewer — resolve the variant */
  const pickR = (v) => (v && v.byReview ? (v[review] ?? v.benable) : v);
  const scene = mode === 'local'
    ? { ...base, mode, review, rui, showDeclined, upNext: pickR(LOCAL.upNext[base.day] ?? base.upNext), recap: pickR(LOCAL.recap[base.day] ?? base.recap) }
    : { ...base, mode, review, rui, showDeclined, upNext: pickR(base.upNext), recap: pickR(base.recap) };
  const phase = scene.phase; // 'sourcing' | 'review' | undefined (live dashboard)

  const switchMode = (m) => {
    if (m === mode) return;
    const day = days[Math.min(idx, days.length - 1)].day;
    const nextDays = m === 'local' ? DAYS.filter((d) => !d.productOnly) : DAYS;
    const at = nextDays.findIndex((d) => d.day === day);
    setIdx(at >= 0 ? at : Math.min(idx, nextDays.length - 1));
    setMode(m);
  };

  useEffect(() => { persistedIdx = idx; }, [idx]);
  useEffect(() => { persistedToggles = tg; }, [tg]);
  useEffect(() => { persistedMode = mode; }, [mode]);
  useEffect(() => { setStageFilter(null); }, [idx, mode, review]);

  const toggleCrew = (k) =>
    setOpenCrew((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });

  // The pulse view replaces the Dashboard tab's own content; the grey
  // #f9fafb pane fills everything below the tabs (tabs strip stays white).
  useEffect(() => {
    const wrap = rootRef.current?.parentElement;
    const column = wrap?.classList.contains('cp-host') ? wrap.parentElement : wrap;
    if (!column) return undefined;
    const pane = column.parentElement;
    column.classList.add('cp-crew-mode');
    if (!phase) {
      column.classList.add('cp-crew-mode--labs');
      pane?.classList.add('cp-labs-pane');
    }
    return () => {
      column.classList.remove('cp-crew-mode', 'cp-crew-mode--labs');
      pane?.classList.remove('cp-labs-pane');
    };
  }, [phase]);

  // Recruiting pill (Figma #fff0ce/#a85321) while sourcing/reviewing; Active after.
  useEffect(() => {
    const pill = document.querySelector('.workflow-header-main .phase-pill');
    const label = pill?.querySelector('span:last-child');
    const dot = pill?.querySelector('.phase-pill-dot');
    if (!pill || !label) return undefined;
    if (!phase) return undefined;
    label.textContent = 'Recruiting';
    pill.style.background = '#fff0ce';
    pill.style.color = '#a85321';
    if (dot) dot.style.background = '#a85321';
    return () => {
      label.textContent = 'Active';
      pill.style.background = '';
      pill.style.color = '';
      if (dot) dot.style.background = '';
    };
  }, [phase]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return;
      /* the review modal owns the arrow keys while open (draft flipping) */
      if (document.querySelector('.rvm')) return;
      if (e.key === 'ArrowRight') setIdx((i) => Math.min(i + 1, days.length - 1));
      if (e.key === 'ArrowLeft') setIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [days.length]);

  const needsAction = (c) => (c.mystery && c.found) || (!c.mystery && !!c.action) || reviewNeeds(c, mode);
  const crewRows = crewFor(scene.day, mode)
    .filter((c) => {
      if (stageFilter == null) return true;
      if (stageFilter === 'casting') return !!c.mystery;
      if (stageFilter === 'needs') return needsAction(c);
      return !c.mystery && stageOf(c, scene.day, mode) === stageFilter;
    })
    // action items float to the top of the list
    .sort((a, b) => Number(needsAction(b)) - Number(needsAction(a)));

  return (
    <div className="cp-root cp-root--c" ref={rootRef}>
      {/* demo control — collab type, at the very top (Julia, Jul 27) */}
      {!EMBED && <div className="cp-mode" role="group" aria-label="Demo config">
        <span className="cp-scrub-tag">COLLAB TYPE</span>
        <button type="button" className={mode === 'product' ? 'cp-scrub-day cp-scrub-day--active' : 'cp-scrub-day'} onClick={() => switchMode('product')}>
          Product
        </button>
        <button type="button" className={mode === 'local' ? 'cp-scrub-day cp-scrub-day--active' : 'cp-scrub-day'} onClick={() => switchMode('local')}>
          Local
        </button>
        <span className="cp-mode-sep" aria-hidden />
        <span className="cp-scrub-tag">WHO REVIEWS</span>
        <button type="button" className={review === 'benable' ? 'cp-scrub-day cp-scrub-day--active' : 'cp-scrub-day'} onClick={() => switchReview('benable')}>
          Benable
        </button>
        <button type="button" className={review === 'brand' ? 'cp-scrub-day cp-scrub-day--active' : 'cp-scrub-day'} onClick={() => switchReview('brand')}>
          Brand
        </button>
        <span className="cp-mode-sep" aria-hidden />
        <span className="cp-scrub-tag">DECLINED</span>
        <button type="button" className={!showDeclined ? 'cp-scrub-day cp-scrub-day--active' : 'cp-scrub-day'} onClick={() => setShowDeclined(false)}>
          Hidden
        </button>
        <button type="button" className={showDeclined ? 'cp-scrub-day cp-scrub-day--active' : 'cp-scrub-day'} onClick={() => setShowDeclined(true)}>
          Shown
        </button>
        <span className="cp-mode-sep" aria-hidden />
        <span className="cp-scrub-tag">REVIEW UI</span>
        <button type="button" className={rui === 'modal' ? 'cp-scrub-day cp-scrub-day--active' : 'cp-scrub-day'} onClick={() => setRui('modal')}>
          Modal
        </button>
        <button type="button" className={rui === 'chat' ? 'cp-scrub-day cp-scrub-day--active' : 'cp-scrub-day'} onClick={() => setRui('chat')}>
          Chat
        </button>
      </div>}

      {phase === 'sourcing' ? (
        <StayTuned />
      ) : phase === 'review' ? (
        <CreatorsFound count={crewFor(scene.day, mode).length} />
      ) : (
        <>
          <AmineProgress2 scene={scene} filter={stageFilter} onFilter={setStageFilter} />
          <div className={`cp-crew2 tf-noicons${tg.head === 'grey' ? ' tf-heads-grey' : ''}`} key={`b-${scene.day}`}>
            <div className="cp-crew-cols cp-crew-cols--left">
              <div className="cp-crew-left">
                <FixedTable
                  scene={scene}
                  rows={crewRows}
                  filter={stageFilter}
                  onFilter={setStageFilter}
                  openCrew={openCrew}
                  toggleCrew={toggleCrew}
                  opts={{ ...F_OPTS, ...tg, layout: tg.table }}
                  onReviewChange={pulse}
                />
              </div>

              <aside className="cp-tile-stack">
                <AmineRail scene={scene} railVar="a" />
              </aside>
            </div>
          </div>
        </>
      )}

      {/* demo scrubber — presenter control, not product UI */}
      {!EMBED && <nav className="cp-scrubber" aria-label="Demo controls">
        <span className="cp-scrub-tag">PULSE DEMO</span>
        <button type="button" className="cp-scrub-arrow" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>←</button>
        {days.map((d, i) => (
          <button type="button" key={d.day} className={i === idx ? 'cp-scrub-day cp-scrub-day--active' : 'cp-scrub-day'} onClick={() => setIdx(i)}>
            {i === idx ? d.scrubLabel : `D${d.day}`}
          </button>
        ))}
        <button type="button" className="cp-scrub-arrow" disabled={idx === days.length - 1} onClick={() => setIdx(idx + 1)}>→</button>
      </nav>}
    </div>
  );
}
