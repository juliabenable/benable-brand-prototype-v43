import { useState, useEffect, useCallback } from 'react';
import { SLIDES } from './glowSlides.jsx';
import { BRAND } from '../../data/glowCampaign.js';
import '../../styles/wrap-review.css';

const SLIDE_MS = 7000;

/* Live campaign wrap-up — the Glow Report as a theatrical tap-through story. */
export default function GlowWrap({ onBack }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = SLIDES.length;
  const next = useCallback(() => setIndex((i) => Math.min(count - 1, i + 1)), [count]);
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const isLast = index === count - 1;
  const slide = SLIDES[index];
  const Body = slide.Body;

  useEffect(() => {
    if (paused || isLast) return undefined;
    const id = setTimeout(next, SLIDE_MS);
    return () => clearTimeout(id);
  }, [index, paused, isLast, next]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'Escape' && onBack) onBack('Dashboard');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, onBack]);

  return (
    <div className={`gw gw--${slide.theme}`}>
      <div className="gw-stage">
        <article
          className={`wr-card wr-card--${slide.theme} gw-card`}
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="wr-chrome">
            <div className="wr-bars">{SLIDES.map((s, i) => <span key={s.key} className={i <= index ? 'on' : ''} />)}</div>
            <div className="wr-headrow">
              <span className="wr-dot" />{BRAND} · WRAPPED
              {onBack && <button type="button" className="gw-close" onClick={() => onBack('Dashboard')} aria-label="Close">✕</button>}
            </div>
          </div>

          <div className="wr-body gw-body" key={slide.key}>
            <Body onCta={() => onBack && onBack('Dashboard')} />
          </div>

          {!isLast && (
            <>
              <button type="button" className="gw-tap gw-tap--prev" onClick={prev} aria-label="Previous" tabIndex={-1} />
              <button type="button" className="gw-tap gw-tap--next" onClick={next} aria-label="Next" tabIndex={-1} />
              <button type="button" className="gw-arrow gw-arrow--prev" onClick={prev} disabled={index === 0} aria-label="Previous slide">‹</button>
              <button type="button" className="gw-arrow gw-arrow--next" onClick={next} aria-label="Next slide">›</button>
              <span className="gw-hint">tap to continue →</span>
            </>
          )}
        </article>
      </div>
    </div>
  );
}
