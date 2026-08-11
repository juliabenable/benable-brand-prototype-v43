import { useState } from 'react';
import { createPortal } from 'react-dom';
import { crewFor, PCT, PHOTOS, TIMELINES, CASTING_TIMELINE, STAGE_LABELS, SPOTS } from './pulseData.js';
import { isReviewRow, rowReviewState, reviewNeeds, getReviewMode } from './review.jsx';
import LiveStatus from './LiveStatus.jsx';

/* crew stage 0–5 maps straight onto the 7-stage funnel; wrap day = Thanked.
   When the BRAND reviews (demo toggle), a fully-approved submission derives
   stage 4 — the data row itself never moves. */
export const stageOf = (c, day, mode = 'product') =>
  day === 30 ? 6
  : isReviewRow(c) && rowReviewState(c, mode) === 'approved' ? 4
  : c.stage;

/* A · Amine — the designer's cohort-funnel page (benable-cohort-funnel repo,
   Figma 11603:48887) rebuilt on v32's states: DAYS scrubber, CREW rows,
   LiveStatus registers, banners and stage filtering all stay; every visual
   value below is lifted from Amine's build (see its NOTES.md).
   Casting has no place in his 7-stage funnel, so it renders as a leading
   hatched block — his "Exited" treatment, mirrored to the start. */

const B = import.meta.env.BASE_URL;
const AIC = {
  group: `${B}labs/group.svg`,
  invites: `${B}labs/invites.svg`,
  chevron: `${B}labs/chevron.svg`,
  check: `${B}labs/check-circle.svg`,
  stayTuned: `${B}labs/stay-tuned.png`,
};

/* Amine's 7-stage ramp — stages 1-4 Figma-exact, 5-7 his extrapolation;
   ink clears 4.5:1 on every fill (his contrast fix). */
export const AM_STAGES = [
  { label: 'Invited', fill: '#d8efe2', ink: '#06301f', off: 'invites go out on approval' },
  { label: 'Accepted', fill: '#b2e0c7', ink: '#06301f', off: 'as invites are accepted' },
  { label: 'Order shipped', fill: '#7ac299', ink: '#06301f', off: 'as orders ship' },
  { label: 'Order delivered', fill: '#4da673', ink: '#06301f', off: 'once packages land' },
  /* creators reach Draft approved only once Katie's team approves the draft */
  { label: 'Draft approved', fill: '#1f7a50', ink: '#ffffff', off: 'once Katie’s team approves' },
  { label: 'Content published', fill: '#14603d', ink: '#ffffff', off: 'after our checks' },
  { label: 'Thanked', fill: '#0d4830', ink: '#ffffff', off: 'after posts go live' },
];

/* local collabs swap the two order stages for Confirmed / Visited */
export const stagesFor = (mode) =>
  mode === 'local'
    ? AM_STAGES.map((s, i) =>
        i === 2 ? { ...s, label: 'Confirmed', off: 'as visits are booked' }
        : i === 3 ? { ...s, label: 'Visited', off: 'after each visit' }
        : s)
    : AM_STAGES;

/* One derivation for the whole page, from CREW — bar, chips and table agree. */
export function amFunnel(scene) {
  const rows = crewFor(scene.day, scene.mode);
  const named = rows.filter((c) => !c.mystery);
  const casting = rows.length - named.length;
  const found = rows.filter((c) => c.mystery && c.found).length;

  const counts = AM_STAGES.map(() => 0);
  const needs = AM_STAGES.map(() => 0);
  const who = AM_STAGES.map(() => []);
  named.forEach((c) => {
    const s = stageOf(c, scene.day, scene.mode);
    counts[s] += 1;
    who[s].push(c.name);
    if (c.action || reviewNeeds(c, scene.mode)) needs[s] += 1;
  });

  const reached = (i) => named.filter((c) => stageOf(c, scene.day, scene.mode) >= i).length;
  return { rows, named, casting, found, counts, needs, who, reached, flagged: needs.reduce((a, b) => a + b, 0) + found };
}

/* ---- stat row: "Your campaign progress N%" + schedule note (Tony) ------ */
export function AmineStat({ scene }) {
  const wrapped = scene.day === 30;
  return (
    <div className="am-stat">
      <div className="am-stat-left">
        {/* wrap day: plain 100% (effect removed, Julia) — the 🎉 does the celebrating */}
        <span className="am-stat-big">{PCT[scene.day]}</span>
        <span className="am-stat-cap">{wrapped ? <>campaign complete! <i className="tf-wrapemoji" aria-hidden>🎉</i></> : 'through your campaign'}</span>
      </div>
      <div className="am-stat-note">
        <span aria-hidden>{wrapped ? '🎉' : '🚀'}</span>
        <span>
          {wrapped
            ? 'Wrapped 37 days ahead of average'
            : 'Campaign on schedule, up to 4 weeks faster than industry average'}
        </span>
      </div>
    </div>
  );
}

/* ---- V2 · the stage rail (Figma 11638:139353) --------------------------
   Equal-width columns carry the reading in the label + hint underneath, so
   there is no chip row; the amber badge is a button and does what V1's
   "Needs you" chip does. Fills are his V2 ramp (two moved for contrast,
   see his NOTES §7); hints are the frame's copy verbatim. The frame's
   leading "Casting…" column (#dbeee3) — which he dropped for lack of a
   casting state — comes back here, since v32 has one. */
/* Hint = what's happening NOW in that stage (Julia, Jul 27); the stage label
   above it is what has already happened. Empty stages keep a forward-looking
   line (no-zeros rule). Voice: "Katie's team", never "Benable Team". */
const AM2_RAIL = [
  { fill: '#b9dfcb', ink: '#06301f', hint: (n) => (n ? 'Creators are reviewing your invites' : 'Once you approve') },
  { fill: '#8fceae', ink: '#06301f', hint: (n) => (n ? (n === 1 ? '1 placing an order' : `${n} placing orders`) : 'Waiting on replies') },
  { fill: '#5fb98c', ink: '#06301f', hint: (n) => (n ? `${n} ${n === 1 ? 'package' : 'packages'} in transit` : 'As creators pick their products') },
  { fill: '#30aa70', ink: '#06301f', hint: (n) => (n ? `${n} creating content` : 'As packages arrive') },
  { fill: '#17864f', ink: '#ffffff', hint: (n) => (n ? (n === 1 ? 'Creator will post soon' : `${n} will post soon`) : 'Once Katie’s team approves drafts') },
  { fill: '#1a6f4c', ink: '#ffffff', hint: (n) => (n ? `${n} ${n === 1 ? 'post' : 'posts'} now live!` : 'Once quality checks pass') },
  { fill: '#124a33', ink: '#ffffff', hint: (n) => (n ? 'Campaign complete!' : 'After posts go live') },
];

/* local-collab hint swaps for Accepted / Confirmed / Visited */
const AM2_RAIL_LOCAL = {
  1: (n) => (n ? (n === 1 ? '1 booking a visit' : `${n} booking visits`) : 'Waiting on replies'),
  2: (n) => (n ? `${n} ${n === 1 ? 'visit' : 'visits'} booked` : 'As visits are booked'),
  3: (n) => (n ? `${n} creating content` : 'After each visit'),
};

function RailColumn({ label, hint, count, fill, hatchClass, ink, radius, disabled, selected, dimmed, badge, onActivate, onBadge }) {
  return (
    <div className={`am2-col${dimmed ? ' am-dim' : ''}`}>
      <button
        type="button"
        disabled={disabled}
        aria-pressed={disabled ? undefined : selected}
        className={`am2-bar${hatchClass ? ` ${hatchClass}` : ''}${selected ? ' am-seg--active' : ''}`}
        style={{ background: fill, borderRadius: `${radius.left}px ${radius.right}px ${radius.right}px ${radius.left}px` }}
        onClick={disabled ? undefined : onActivate}
      >
        <span className="am2-count" style={{ color: ink }}>{count}</span>
      </button>
      {badge > 0 && (
        <button
          type="button"
          className="am-badge am2-badge"
          aria-label={`${badge} ${badge === 1 ? 'creator needs' : 'creators need'} you in ${label}`}
          onClick={onBadge}
        >
          {badge}
        </button>
      )}
      <div className="am2-leg">
        <p className="am2-label">{label}</p>
        <p className="am2-hint">{hint}</p>
      </div>
    </div>
  );
}

export function AmineRailBar({ scene, filter, onFilter }) {
  const f = amFunnel(scene);
  const total = f.rows.length || 1;
  const filtering = filter != null;
  const last = AM_STAGES.length - 1;
  /* done = the campaign is underway and no slot is being sourced right now;
     the permanent slot shows a lone green ✓ (Julia, Jul 27) */
  const srcDone = f.casting === 0 && f.found === 0 && f.named.length > 0;

  return (
    <div className="am2-rail" role="group" aria-label={`Creator funnel: ${PCT[scene.day]} through`}>
      <RailColumn
        label={f.found ? 'Matches found' : f.casting > 0 ? 'Sourcing…' : 'Sourcing'}
        hint={f.found
          ? 'New profiles to review'
          : f.casting > 0
            ? (f.named.length ? 'Rematching you' : 'Matching you with creators')
            : srcDone ? 'All done for now' : 'If a spot opens up'}
        count={srcDone ? <span className="am2-check" role="img" aria-label="Sourcing done">✓</span> : f.casting}
        fill={f.casting > 0 ? '#dbeee3' : srcDone ? '#eff5f1' : undefined}
        hatchClass={f.casting > 0 || srcDone ? '' : 'am-seg--sliver'}
        ink={f.casting > 0 ? '#06301f' : '#a3a8a3'}
        radius={{ left: 74, right: 4 }}
        disabled={f.casting === 0}
        selected={filter === 'casting'}
        dimmed={filtering && filter !== 'casting' && !(filter === 'needs' && f.found > 0)}
        badge={f.found}
        onActivate={() => onFilter(filter === 'casting' ? null : 'casting')}
        onBadge={() => onFilter(filter === 'needs' ? null : 'needs')}
      />
      {stagesFor(scene.mode).map((s, i) => {
        const n = f.counts[i];
        const empty = n === 0;
        /* past = everyone has moved beyond this stage → pale-green slab with a
           green ✓ N/N (Julia, Jul 28: simplified — no stripes anywhere; future
           stages are plain quiet grey). */
        const past = empty && f.named.length > 0 && f.reached(i + 1) === f.named.length;
        const active = filter === i;
        const rail = AM2_RAIL[i];
        const baseHint = (scene.mode === 'local' && AM2_RAIL_LOCAL[i]) || rail.hint;
        /* who approves drafts is a config — the empty Draft-approved hint
           hands the ball to whoever holds it (study @4218) */
        const hint = i === 4 && getReviewMode() === 'brand'
          ? (n) => (n ? baseHint(n) : 'Once you approve each draft')
          : baseHint;
        return (
          <RailColumn
            key={s.label}
            label={s.label}
            /* "All" only when the named creators ARE the whole cohort — while a
               slot is still sourcing, it's just "5 moved ahead" (Julia, Jul 28) */
            hint={past ? `${f.named.length === f.rows.length ? 'All ' : ''}${f.named.length} moved ahead` : hint(n, f.named.length)}
            count={past
              /* a lone muted tick — the count lives in the hint below (Julia, Jul 28) */
              ? <span className="am2-check" role="img" aria-label={`${f.named.length === f.rows.length ? 'All ' : ''}${f.named.length} moved ahead`}>✓</span>
              /* everyone thanked → the wrap gets its sparkle (Julia, Jul 27) */
              : i === last && n > 0 && n === f.named.length ? `${n} ✨` : n}
            fill={past ? '#eff5f1' : empty ? undefined : rail.fill}
            hatchClass={empty && !past ? 'am-seg--sliver' : ''}
            ink={empty && !past ? '#a3a8a3' : past ? '#17864f' : rail.ink}
            radius={{ left: 4, right: i === last ? 100 : 4 }}
            disabled={empty}
            selected={active}
            dimmed={filtering && !active && !(filter === 'needs' && f.needs[i] > 0)}
            badge={f.needs[i]}
            onActivate={() => onFilter(active ? null : i)}
            onBadge={() => onFilter(filter === 'needs' ? null : 'needs')}
          />
        );
      })}
    </div>
  );
}

export function AmineProgress2({ scene, filter, onFilter }) {
  return (
    <div className="am-progress">
      <AmineStat scene={scene} />
      <AmineRailBar scene={scene} filter={filter} onFilter={onFilter} />
    </div>
  );
}

/* ---- pre-campaign states (Figma 7199:20453 / 7199:21448) ---------------- */
export function StayTuned() {
  return (
    <div className="am-state">
      <img className="am-state-img" src={AIC.stayTuned} alt="" />
      <div className="am-state-copy">
        <p className="am-state-title">Stay Tuned!</p>
        <p className="am-state-sub">We're hand-picking creators who are the perfect fit for your campaign. We'll alert you via email and in-app notification.</p>
      </div>
    </div>
  );
}

export function CreatorsFound({ count }) {
  return (
    <div className="am-state am-state--found">
      <span className="am-state-avatar"><img src={PHOTOS.Maya} alt="" /></span>
      <div className="am-state-copy am-state-copy--found">
        <p className="am-found-title">
          We Found <b>{count} {count === 1 ? 'creator' : 'creators'}</b> who are a great fit
        </p>
        <p className="am-found-sub">Review each profile and add the ones you'd like to invite to your campaign.</p>
      </div>
      <button type="button" className="am-found-btn">Review Creators</button>
    </div>
  );
}

/* ---- creators table ---------------------------------------------------- */
export const AM_FILTER_LABEL = (filter, mode) =>
  filter === 'needs' ? 'Needs you' : filter === 'casting' ? 'Sourcing…' : stagesFor(mode)[filter]?.label;

export function AmineTable({ scene, rows, filter, onFilter, openCrew, toggleCrew }) {
  const crewAll = crewFor(scene.day, scene.mode);
  const cohort = crewAll.length;
  const filtered = filter != null;
  const stages = stagesFor(scene.mode);
  const [modal, setModal] = useState(null);
  /* invites are still awaiting replies → explain the spots rule (Julia, Jul 27):
     first SPOTS creators to reply are matched, extras held for the next campaign */
  const inviting = crewAll.some((c) => !c.mystery && c.stage === 0 && !c.found);
  /* non-Shopify fulfillment: orders wait on the brand → CSV button in the header */
  const shipDay = crewAll.some((c) => c.ship);
  /* content published but not yet thanked → nudge the thank-you */
  const thanking = crewAll.some((c) => !c.mystery && stageOf(c, scene.day, scene.mode) === 5);

  /* CSV mirrors the real one: every order + a shipping-status column that
     flips to "shipped" as the brand marks creators shipped */
  const downloadOrders = () => {
    const named = crewAll.filter((c) => !c.mystery);
    const csv = [
      'Creator,Handle,Product,Shipping status',
      ...named.map((c) => [c.name, c.handle, c.product || '—', c.ship ? 'needs shipping' : 'shipped'].join(',')),
    ].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'benable-orders.csv' });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="am-card am-table" aria-label="Creators">
      <div className="am-card-head">
        <div className="am-head-l">
          <span className="am-symtile"><img src={AIC.group} alt="" /></span>
          <div>
            <p className="am-card-title">Creators</p>
            <p className="am-card-sub">
              {filtered ? `${rows.length} of ${cohort} on this campaign` : `${cohort} on this campaign`}
            </p>
          </div>
        </div>
        <div className="am-head-r">
          {inviting && (
            <p className="am-spots-note">
              You have {SPOTS} spots for this campaign. We will match the first {SPOTS} creators who reply and save any extra for the next campaign!
            </p>
          )}
          {thanking && (
            <p className="am-spots-note">Deepen the relationship and brand love. Send thank yous!</p>
          )}
          {shipDay && (
            <button type="button" className="am-showall" onClick={downloadOrders}>
              <svg aria-hidden width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M8 2.5v7m0 0 3-3m-3 3-3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 13.5h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              Download orders
            </button>
          )}
          {filtered && (
            <button type="button" className="am-showall" onClick={() => onFilter(null)}>
              Show all <span aria-hidden>✕</span>
            </button>
          )}
        </div>
      </div>

      <div className="am-cols" aria-hidden>
        <span>CREATOR</span><span>LATEST UPDATE</span><span>STAGE</span><span />
      </div>

      {rows.length === 0 ? (
        <div className="am-empty">
          <p className="am-empty-title">Nobody is in {AM_FILTER_LABEL(filter, scene.mode) ?? 'this filter'} right now</p>
          <p className="am-empty-sub">The stage is empty at the moment. Clear the filter to see the rest of the cohort.</p>
          <button type="button" className="am-showall am-empty-btn" onClick={() => onFilter(null)}>
            Show all creators
          </button>
        </div>
      ) : (
        rows.map((c, i) => {
          const rowKey = `${scene.day}-${c.name}-${i}`;
          const open = openCrew.has(rowKey);
          const timeline = c.mystery ? CASTING_TIMELINE : TIMELINES[c.name] || [];
          const reached = c.mystery ? -1 : stageOf(c, scene.day, scene.mode);
          const foundRow = c.mystery && c.found;
          const flaggedRow = (!c.mystery && !!c.action) || foundRow;
          /* row actions (Julia, Jul 27): non-Shopify shipping, local-collab
             visit confirmation, and the thank-you nudge on published rows */
          const actModal = c.ship
            ? { kind: 'ship', name: c.name }
            : c.confirmEmail
              ? { kind: 'visit', name: c.name }
              : null;
          return (
            <div key={rowKey} className="am-item">
              <div
                role="button"
                tabIndex={foundRow ? undefined : 0}
                className="am-row"
                onClick={foundRow ? undefined : () => toggleCrew(rowKey)}
                onKeyDown={foundRow ? undefined : (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCrew(rowKey); } }}
                aria-expanded={foundRow ? undefined : open}
              >
                <span className="am-who">
                  {foundRow ? (
                    <span className="am-avatar am-avatar--blur"><img src={PHOTOS.Amara} alt="" /></span>
                  ) : !c.mystery && PHOTOS[c.name] ? (
                    <span className="am-avatar"><img src={PHOTOS[c.name]} alt="" /></span>
                  ) : (
                    <span className="am-avatar am-avatar--mystery">?</span>
                  )}
                  <span className="am-names">
                    <span className="am-name">
                      {foundRow ? c.name : c.mystery ? 'Sourcing' : c.name}
                      {!c.mystery && <img src={AIC.check} alt="Verified" className="am-verified" />}
                    </span>
                    <span className="am-handle">{foundRow ? 'To fill your campaign' : c.mystery ? 'New creators for your campaign' : c.handle}</span>
                  </span>
                </span>
                <span className={`am-update${flaggedRow ? ' am-update--flag' : ''}`}>
                  {flaggedRow && <span aria-hidden>⚑ </span>}
                  <LiveStatus status={c.status} />
                  {!c.mystery && c.action?.cta && (
                    <button
                      type="button"
                      className="am-act-btn"
                      onClick={(e) => { e.stopPropagation(); if (actModal) setModal(actModal); }}
                    >
                      {c.action.cta}
                    </button>
                  )}
                </span>
                {foundRow ? (
                  /* action rows trade the empty stage dashes for the CTA (Julia, Jul 27) */
                  <span className="am-row-cta">Review matches</span>
                ) : (
                  <span className="am-dashes" role="img" aria-label={c.mystery ? 'Sourcing' : `Stage ${reached + 1} of ${stages.length}: ${stages[reached].label}`}>
                    {stages.map((s, si) => (
                      <i key={s.label} style={{ background: si <= reached ? '#7a5cfa' : '#e3e3e3' }} />
                    ))}
                  </span>
                )}
                <span className="am-chev">
                  {!foundRow && <img src={AIC.chevron} alt="" style={{ rotate: open ? '270deg' : '90deg' }} />}
                </span>
              </div>
              {open && (
                <div className="am-hist">
                  <p className="am-hist-title">Stage history</p>
                  <div className="cp-crew-history am-hist-body">
                    {timeline.map((st, si) => {
                      const state = c.mystery
                        ? (st.live ? 'now' : st.when ? 'done' : 'next')
                        : si < c.stage ? 'done' : si === c.stage ? 'now' : 'next';
                      return (
                        <div key={si} className={`cp-hist-step cp-hist-step--${state}`} style={{ animationDelay: `${0.05 * si}s` }}>
                          <span className="cp-hist-dot">{state === 'done' ? '✓' : ''}</span>
                          <div className="cp-hist-body">
                            <div className="cp-hist-top">
                              <span className="cp-hist-label">{c.mystery ? st.label : STAGE_LABELS[si]}</span>
                              <span className="cp-hist-when">{state === 'done' ? (st.when || 'done') : state === 'now' ? 'right now' : 'up next'}</span>
                            </div>
                            <div className="cp-hist-detail">{st.detail}</div>
                            {state === 'now' && <div className="cp-hist-live"><LiveStatus status={c.status} /></div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {modal && <ActionModal act={modal} onClose={() => setModal(null)} />}
    </section>
  );
}

/* shared confirm pop-up: 'ship' asks for a tracking number (we track the
   delivery from it); 'visit' asks for the visit date (sets confirmed, and the
   date passing sets visited). Demo only — confirm just closes. */
export function ActionModal({ act, onClose }) {
  const ship = act.kind === 'ship';
  /* portal to <body>: the captured page's stacking contexts would otherwise
     trap the fixed veil inside the card — it must cover the whole screen */
  return createPortal(
    <div className="am-veil" onClick={onClose}>
      <div className="am-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <p className="am-modal-title">{ship ? `Have you shipped ${act.name}’s order?` : `${act.name} emailed you?`}</p>
        <p className="am-modal-sub">
          {ship
            ? 'If it’s on its way, add the tracking number — we’ll watch the delivery and keep everyone posted for you.'
            : 'Confirm and set her visit date — we’ll take it from there and check in after the visit.'}
        </p>
        {ship ? (
          <input className="am-modal-field" placeholder="Tracking number" />
        ) : (
          <input className="am-modal-field" type="date" aria-label="Visit date" />
        )}
        <div className="am-modal-row">
          <button type="button" className="am-modal-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="am-modal-go" onClick={onClose}>{ship ? 'Confirm shipment' : 'Confirm visit'}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ---- right rail -------------------------------------------------------- */
function RailCard({ icon, title, subtitle, children, pad }) {
  return (
    <section className="am-card">
      <div className="am-card-head">
        <div className="am-head-l">
          <span className="am-symtile"><img src={icon} alt="" /></span>
          <div>
            <p className="am-card-title">{title}</p>
            {subtitle && <p className="am-card-sub">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className={pad || 'am-card-body'}>{children}</div>
    </section>
  );
}

function NoteRow({ emoji, strong, rest, last }) {
  return (
    <div className={`am-note${last ? ' am-note--last' : ''}`}>
      <span className="am-note-emoji" aria-hidden>{emoji}</span>
      <p className="am-note-text">
        <strong>{strong}</strong>
        {rest && <span>{rest}</span>}
      </p>
    </div>
  );
}

export function AmineRail({ scene, railVar = 'a' }) {
  const { recap } = scene;
  /* B · One box (Julia, Jul 28): While-you-were-away and Up-next share a
     single card — recap items first, then an UP NEXT section head. */
  const merged = railVar === 'b';
  return (
    <aside className="am-rail">
      <RailCard
        icon={AIC.invites}
        title="While you were away"
        subtitle={<>Since, <b className="am-sub-b">{recap.since.replace(/^since /, '')}</b></>}
      >
        {recap.items.map((it, i) => (
          <NoteRow key={it.bold} emoji={it.emoji} strong={it.bold} rest={it.rest} last={i === recap.items.length - 1} />
        ))}
        {merged && (
          <>
            {/* native section head — same anatomy as a card header (Julia, Jul 28) */}
            <div className="am-merge-sect">
              <span className="am-symtile"><img src={AIC.invites} alt="" /></span>
              <p className="am-card-title">Up next</p>
            </div>
            {scene.upNext.map((u, i) => (
              <NoteRow key={u.text} emoji={u.emoji} strong={u.text} rest={` — ${u.eta}`} last={i === scene.upNext.length - 1} />
            ))}
          </>
        )}
      </RailCard>

      {/* The pace card removed everywhere (Julia, Jul 28) */}
      {!merged && (
        <RailCard icon={AIC.invites} title="Up next">
          {scene.upNext.map((u, i) => (
            <NoteRow key={u.text} emoji={u.emoji} strong={u.text} rest={` — ${u.eta}`} last={i === scene.upNext.length - 1} />
          ))}
        </RailCard>
      )}
    </aside>
  );
}
