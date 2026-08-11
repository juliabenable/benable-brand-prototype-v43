import { useState, useEffect, useCallback, useRef } from 'react';
import { SLIDES, FloatingEmojis } from './glowLoveSlides.jsx';
import { BRAND } from '../../data/glowCampaign.js';
import '../../styles/glow-love.css';

const SLIDE_KEY = 'gl-wrap-slide-idx';
const readStoredIndex = () => {
  try {
    const v = sessionStorage.getItem(SLIDE_KEY);
    if (v === null) return 0;
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n >= 0 && n < SLIDES.length ? n : 0;
  } catch { return 0; }
};

/* Live campaign wrap-up — "Glow Love" style story (gradient bg + emojis).
   `embedded` drops the full-viewport gray backdrop so the wrap sits inside
   the brand-portal content area. The slide index persists in sessionStorage
   so any browser back/forward (or re-mount of the wrap) returns the viewer
   to the slide they were on — not the cover. */
export default function GlowLoveWrap({ onBack, embedded = false }) {
  const [index, setIndex] = useState(readStoredIndex);
  const count = SLIDES.length;
  // Prev/next are debounced ~250ms so a single accidental double-click
  // (or a touch device's two-event quirk) can't step the index twice.
  const lastNavAt = useRef(0);
  const navOk = () => {
    const now = Date.now();
    if (now - lastNavAt.current < 250) return false;
    lastNavAt.current = now;
    return true;
  };
  const next = useCallback(() => { if (navOk()) setIndex((i) => Math.min(count - 1, i + 1)); }, [count]);
  const prev = useCallback(() => { if (navOk()) setIndex((i) => Math.max(0, i - 1)); }, []);
  const isLast = index === count - 1;
  const slide = SLIDES[index];
  const Body = slide.Body;

  // Persist current slide index so a remount lands the viewer where
  // they were (instead of resetting to the cover).
  useEffect(() => {
    try { sessionStorage.setItem(SLIDE_KEY, String(index)); } catch {}
  }, [index]);

  // Wrap onBack so an explicit close clears the stored index — the next
  // time a fresh wrap opens, it should start at the cover.
  const closeWrap = useCallback((target) => {
    try { sessionStorage.removeItem(SLIDE_KEY); } catch {}
    if (onBack) onBack(target);
  }, [onBack]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'Escape') closeWrap('Dashboard');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, closeWrap]);

  return (
    <div className={`gl${embedded ? ' gl--embedded' : ''}`}>
      <div className="gl-frame">
        <article
          className={`gl-stage gl-grad--${slide.grad} ${slide.dark ? 'gl-stage--dark' : ''}`}
        >
          {slide.emoji && <FloatingEmojis />}

          <div className="gl-chrome">
            <div className="gl-dots">{SLIDES.map((s, i) => <span key={s.key} className={i === index ? 'on' : i < index ? 'done' : ''} />)}</div>
            <span className="gl-brand">{BRAND} · Wrapped</span>
            {onBack && <button type="button" className="gl-close" onClick={() => closeWrap('Dashboard')} aria-label="Close">✕</button>}
          </div>

          <div className="gl-body" key={slide.key}><Body onCta={() => closeWrap('Dashboard')} /></div>

          {/* Prev tap zone stays available even on the last slide so the
              viewer can step back through the deck after reaching the end. */}
          <button type="button" className="gl-tap gl-tap--prev" onClick={prev} aria-label="Previous" tabIndex={-1} />
          {!isLast && (
            <button type="button" className="gl-tap gl-tap--next" onClick={next} aria-label="Next" tabIndex={-1} />
          )}
        </article>

        <button type="button" className="gl-arrow gl-arrow--prev" onClick={prev} disabled={index === 0} aria-label="Previous slide">
          <span className="gl-arrow__ic">
            <svg className="gl-arrow__svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="14.5 18 8.5 12 14.5 6" />
            </svg>
          </span>
          <span className="gl-arrow__lbl">Back</span>
        </button>
        {!isLast && (
          <button type="button" className="gl-arrow gl-arrow--next" onClick={next} aria-label="Next slide">
            <span className="gl-arrow__ic">
              <svg className="gl-arrow__svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9.5 18 15.5 12 9.5 6" />
              </svg>
            </span>
            <span className="gl-arrow__lbl">Next</span>
          </button>
        )}
      </div>
    </div>
  );
}
