/**
 * Postcard renderers — two styles, both consume the same { message, signoff } pair.
 *
 * Polaroid: photo (from creator's post) + handwritten caption + signoff.
 * Vintage: GREETINGS FROM <brand> hero strip + handwritten body + signoff,
 *          stamp + postmark + sparkle accents auto-filled.
 */
import { useId } from 'react';

export function PolaroidPostcard({
  thumbnailUrl, photos, platform, brandName, message, signoff,
  signerAvatar, onSignerAvatarClick,
}) {
  // Normalize to a photo list. `photos` (array) wins; otherwise fall back to
  // the single `thumbnailUrl`. The photo window keeps its square shape: a
  // heavily blurred copy of the first photo fills the frame as a backdrop,
  // and the real photo(s) sit on top at their true aspect ratio (never
  // cropped). 1 photo → contained. 2 → offset peek. 3+ → tilted pile + count.
  const list = ((photos && photos.length ? photos : (thumbnailUrl ? [thumbnailUrl] : []))).filter(Boolean);
  const count = list.length;
  const backdrop = list[0];

  return (
    <div className="pc pc-polaroid">
      <div className="pc-polaroid__tape" />
      <div className="pc-polaroid__photo" data-count={count}>
        {backdrop && (
          <div
            className="pc-polaroid__photo-blur"
            style={{ backgroundImage: `url(${backdrop})` }}
          />
        )}
        <div className="pc-polaroid__photo-scrim" />
        <PhotoLayout list={list} />
        {platform && count <= 1 && (
          <span className="pc-polaroid__platform-tag">{platformIcon(platform)} {platform}</span>
        )}
      </div>
      <div className="pc-polaroid__caption">{message || 'we love what you made!'}</div>
      <div className="pc-polaroid__signoff">{signoff || `— ${brandName || ''}`}</div>
      {signerAvatar !== undefined && (
        onSignerAvatarClick ? (
          <button
            type="button"
            className="pc-polaroid__sticker pc-polaroid__sticker--editable"
            onClick={(e) => { e.stopPropagation(); onSignerAvatarClick(); }}
            aria-label="Change signer photo"
            title="Click to change photo"
          >
            <WavyPhotoSticker avatarUrl={signerAvatar} />
            <span className="pc-polaroid__sticker-edit" aria-hidden="true">✎</span>
          </button>
        ) : (
          <span className="pc-polaroid__sticker" aria-hidden="true">
            <WavyPhotoSticker avatarUrl={signerAvatar} />
          </span>
        )
      )}
    </div>
  );
}

/* Renders the post photo(s) on top of the blurred backdrop.
   1 photo  → single, contained (true ratio, no crop, no shadow).
   2 photos → "offset peek": back print on the left tilted left, front
              (top) print on the right tilted right.
   3+ photos → "pile": up to 4 tilted instant-prints tossed in a stack.  */
function PhotoLayout({ list }) {
  const count = list.length;
  if (count === 0) return null;
  if (count === 1) {
    return <img className="pc-polaroid__photo-fg" src={list[0]} alt="" />;
  }
  if (count === 2) {
    return (
      <>
        <span className="pc-polaroid__print pc-polaroid__print--peek-back">
          <img src={list[1]} alt="" />
        </span>
        <span className="pc-polaroid__print pc-polaroid__print--peek-front">
          <img src={list[0]} alt="" />
        </span>
      </>
    );
  }
  // 3+ → pile of up to four tilted prints.
  return list.slice(0, 4).map((url, i) => (
    <span key={i} className={`pc-polaroid__print pc-polaroid__print--pile pc-polaroid__print--pile-${i}`}>
      <img src={url} alt="" />
    </span>
  ));
}

/* Soft-wave photo sticker — die-cut look with a thin white ring.
   Two concentric 8-bump waves: the OUTER path (r = 45 + 3·cos8θ) is
   filled white as the sticker backing, and the photo is clipped to
   the INNER path (r = 41 + 3·cos8θ), so ~4u of white shows evenly
   all the way around the wavy edge. Generated from those formulas
   (see /tmp/.../founder-sticker.html study). */
const SOFT_WAVE_PATH =
  'M98.00,50.00L97.77,52.09L97.12,54.12L96.10,56.07L94.83,57.90L93.42,59.63L92.02,61.26L90.73,62.84L89.64,64.43L88.80,66.07L88.23,67.83L87.88,69.72L87.67,71.75L87.51,73.90L87.29,76.11L86.89,78.31L86.23,80.40L85.26,82.31L83.94,83.94L82.31,85.26L80.40,86.23L78.31,86.89L76.11,87.29L73.90,87.51L71.75,87.67L69.72,87.88L67.83,88.23L66.07,88.80L64.43,89.64L62.84,90.73L61.26,92.02L59.63,93.42L57.90,94.83L56.07,96.10L54.12,97.12L52.09,97.77L50.00,98.00L47.91,97.77L45.88,97.12L43.93,96.10L42.10,94.83L40.37,93.42L38.74,92.02L37.16,90.73L35.57,89.64L33.93,88.80L32.17,88.23L30.28,87.88L28.25,87.67L26.10,87.51L23.89,87.29L21.69,86.89L19.60,86.23L17.69,85.26L16.06,83.94L14.74,82.31L13.77,80.40L13.11,78.31L12.71,76.11L12.49,73.90L12.33,71.75L12.12,69.72L11.77,67.83L11.20,66.07L10.36,64.43L9.27,62.84L7.98,61.26L6.58,59.63L5.17,57.90L3.90,56.07L2.88,54.12L2.23,52.09L2.00,50.00L2.23,47.91L2.88,45.88L3.90,43.93L5.17,42.10L6.58,40.37L7.98,38.74L9.27,37.16L10.36,35.57L11.20,33.93L11.77,32.17L12.12,30.28L12.33,28.25L12.49,26.10L12.71,23.89L13.11,21.69L13.77,19.60L14.74,17.69L16.06,16.06L17.69,14.74L19.60,13.77L21.69,13.11L23.89,12.71L26.10,12.49L28.25,12.33L30.28,12.12L32.17,11.77L33.93,11.20L35.57,10.36L37.16,9.27L38.74,7.98L40.37,6.58L42.10,5.17L43.93,3.90L45.88,2.88L47.91,2.23L50.00,2.00L52.09,2.23L54.12,2.88L56.07,3.90L57.90,5.17L59.63,6.58L61.26,7.98L62.84,9.27L64.43,10.36L66.07,11.20L67.83,11.77L69.72,12.12L71.75,12.33L73.90,12.49L76.11,12.71L78.31,13.11L80.40,13.77L82.31,14.74L83.94,16.06L85.26,17.69L86.23,19.60L86.89,21.69L87.29,23.89L87.51,26.10L87.67,28.25L87.88,30.28L88.23,32.17L88.80,33.93L89.64,35.57L90.73,37.16L92.02,38.74L93.42,40.37L94.83,42.10L96.10,43.93L97.12,45.88L97.77,47.91L98.00,50.00Z';

const SOFT_WAVE_INNER_PATH =
  'M94.00,50.00L93.78,51.91L93.13,53.77L92.14,55.55L90.89,57.21L89.52,58.76L88.15,60.22L86.91,61.64L85.88,63.06L85.11,64.54L84.60,66.14L84.33,67.87L84.21,69.75L84.14,71.75L84.01,73.82L83.72,75.87L83.17,77.83L82.31,79.60L81.11,81.11L79.60,82.31L77.83,83.17L75.87,83.72L73.82,84.01L71.75,84.14L69.75,84.21L67.87,84.33L66.14,84.60L64.54,85.11L63.06,85.88L61.64,86.91L60.22,88.15L58.76,89.52L57.21,90.89L55.55,92.14L53.77,93.13L51.91,93.78L50.00,94.00L48.09,93.78L46.23,93.13L44.45,92.14L42.79,90.89L41.24,89.52L39.78,88.15L38.36,86.91L36.94,85.88L35.46,85.11L33.86,84.60L32.13,84.33L30.25,84.21L28.25,84.14L26.18,84.01L24.13,83.72L22.17,83.17L20.40,82.31L18.89,81.11L17.69,79.60L16.83,77.83L16.28,75.87L15.99,73.82L15.86,71.75L15.79,69.75L15.67,67.87L15.40,66.14L14.89,64.54L14.12,63.06L13.09,61.64L11.85,60.22L10.48,58.76L9.11,57.21L7.86,55.55L6.87,53.77L6.22,51.91L6.00,50.00L6.22,48.09L6.87,46.23L7.86,44.45L9.11,42.79L10.48,41.24L11.85,39.78L13.09,38.36L14.12,36.94L14.89,35.46L15.40,33.86L15.67,32.13L15.79,30.25L15.86,28.25L15.99,26.18L16.28,24.13L16.83,22.17L17.69,20.40L18.89,18.89L20.40,17.69L22.17,16.83L24.13,16.28L26.18,15.99L28.25,15.86L30.25,15.79L32.13,15.67L33.86,15.40L35.46,14.89L36.94,14.12L38.36,13.09L39.78,11.85L41.24,10.48L42.79,9.11L44.45,7.86L46.23,6.87L48.09,6.22L50.00,6.00L51.91,6.22L53.77,6.87L55.55,7.86L57.21,9.11L58.76,10.48L60.22,11.85L61.64,13.09L63.06,14.12L64.54,14.89L66.14,15.40L67.87,15.67L69.75,15.79L71.75,15.86L73.82,15.99L75.87,16.28L77.83,16.83L79.60,17.69L81.11,18.89L82.31,20.40L83.17,22.17L83.72,24.13L84.01,26.18L84.14,28.25L84.21,30.25L84.33,32.13L84.60,33.86L85.11,35.46L85.88,36.94L86.91,38.36L88.15,39.78L89.52,41.24L90.89,42.79L92.14,44.45L93.13,46.23L93.78,48.09L94.00,50.00Z';

function WavyPhotoSticker({ avatarUrl }) {
  const uid = useId().replace(/:/g, '');
  const clipId = `wave-clip-${uid}`;
  return (
    <svg
      className="pc-polaroid__sticker-svg"
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={SOFT_WAVE_INNER_PATH} />
        </clipPath>
      </defs>
      {/* White backing — the full outer wave. The drop-shadow filter
          (in CSS) hugs this edge, so the sticker reads as a die-cut. */}
      <path d={SOFT_WAVE_PATH} fill="#ffffff" />
      {/* Subtle pastel placeholder if no avatar yet. */}
      <rect
        x="0" y="0" width="100" height="100"
        fill="#fff5ef"
        clipPath={`url(#${clipId})`}
      />
      {avatarUrl && (
        <image
          href={avatarUrl}
          x="0" y="0" width="100" height="100"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      )}
    </svg>
  );
}

export function VintagePostcard({ brandName, message, signoff, date }) {
  const dateLabel = (date || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  return (
    <div className="pc pc-vintage">
      <div className="pc-vintage__hero">
        <div className="pc-vintage__hero-sub">GREETINGS FROM</div>
        <div className="pc-vintage__hero-stars">✦ ✦ ✦</div>
        <div className="pc-vintage__hero-text">{brandName}</div>
      </div>
      <div className="pc-vintage__stamp" aria-hidden="true">♥</div>
      <div className="pc-vintage__postmark" aria-hidden="true">{dateLabel.split(' ')[0]}<br />{dateLabel.split(' ')[1]}</div>
      <div className="pc-vintage__body">
        <div className="pc-vintage__body-msg">{message || 'we love what you made!'}</div>
        <div className="pc-vintage__body-sig">{signoff || `— ${brandName}`}</div>
      </div>
      <div className="pc-vintage__confetti-1" aria-hidden="true">✦</div>
      <div className="pc-vintage__confetti-2" aria-hidden="true">·*✧</div>
    </div>
  );
}

function platformIcon(platform) {
  const p = platform.toLowerCase();
  if (p.includes('reel') || p.includes('instagram')) return '▶';
  if (p.includes('tiktok')) return '♪';
  if (p.includes('stor')) return '○';
  return '▶';
}
