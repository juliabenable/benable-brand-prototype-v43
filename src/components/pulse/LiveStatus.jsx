import { useEffect, useState } from 'react';

/* One renderer per honesty pattern:
   shimmer — machine work running now (rotating verbs, gradient sweep)
   katie   — human presence (avatar, online dot, typing) — never a spinner
   heartbeat — monitoring: one still sentence, gentle breathe
   celebrate — go-live: emoji bounces, words hold still (emoji survives noEmoji)
   facts/static — quiet truths, no motion */
const strip = (s) => s.replace(/[\p{Extended_Pictographic}️‍]/gu, '').replace(/\s{2,}/g, ' ').trim();

export default function LiveStatus({ status, noEmoji = true }) {
  const [pi, setPi] = useState(0);
  const clean = (s) => (noEmoji ? strip(s) : s);

  useEffect(() => {
    setPi(0);
    if (!status.phrases || status.phrases.length < 2) return undefined;
    if (status.type !== 'shimmer' && status.type !== 'katie') return undefined;
    const t = setInterval(() => setPi((p) => (p + 1) % status.phrases.length), status.type === 'shimmer' ? 2600 : 4200);
    return () => clearInterval(t);
  }, [status]);

  const phrase = clean(status.phrases?.[pi] ?? '');

  if (status.type === 'shimmer') {
    return <span className="cp-live"><span className="cp-live-shimmer" key={phrase}>{phrase}</span></span>;
  }
  if (status.type === 'katie') {
    return (
      <span className="cp-live cp-live--katie">
        <span className="cp-mini-katie">K<i className="cp-online" /></span>
        <span className="cp-live-fact" key={phrase}>{phrase}</span>
        <span className="cp-typing"><i /><i /><i /></span>
      </span>
    );
  }
  if (status.type === 'heartbeat') {
    return <span className="cp-live"><span className="cp-live-fact cp-live-breathe">{clean(status.phrases?.[0] ?? '')}</span></span>;
  }
  if (status.type === 'celebrate') {
    return (
      <span className="cp-live">
        <span className="cp-celebrate-emoji">{status.emoji || '🎉'}</span>
        <span className="cp-live-fact">{status.phrases?.[0] ?? ''}</span>
      </span>
    );
  }
  if (status.type === 'facts') {
    return <span className="cp-live"><span className="cp-live-fact cp-live-fact--gray" key={phrase}>{phrase}</span></span>;
  }
  return <span className="cp-live"><span className="cp-live-fact">{phrase}</span></span>;
}
