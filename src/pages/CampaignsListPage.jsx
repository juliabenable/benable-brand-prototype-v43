import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { useNavigate } from 'react-router-dom';
import { campaignsList } from '../data/capturedHtml.js';
import BrandPulse from '../components/pulse/BrandPulse.jsx';

export default function CampaignsListPage() {
  const ref = useRef(null);
  const navigate = useNavigate();

  // Wire up campaign row clicks + Create Campaign button using event delegation.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const handler = (e) => {
      const row = e.target.closest('tr.campaign-row');
      if (row) {
        const label = row.getAttribute('aria-label') || '';
        // Map by the aria-label "Open <campaign name>"
        // For the prototype, route everyone to a representative campaign detail page.
        // The first active campaign in the data is /46 — we'll use that as the canonical detail.
        e.preventDefault();
        navigate('/brand/tonypikora/campaigns/46');
        return;
      }
      const launch = e.target.closest('.launch-button');
      if (launch) {
        e.preventDefault();
        navigate('/brand/tonypikora/campaigns/new');
      }
    };
    root.addEventListener('click', handler);
    return () => root.removeEventListener('click', handler);
  }, [navigate]);

  // BrandPulse host — lifetime brand tracking above the campaigns table.
  // Same own-root + MutationObserver pattern as the detail page's Pulse.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let pulseRoot = null;
    const ensure = () => {
      if (root.querySelector('.bp-host')) return;
      const anchor = root.querySelector('.campaigns-section');
      if (!anchor) return;
      const host = document.createElement('div');
      host.className = 'bp-host';
      anchor.parentNode.insertBefore(host, anchor);
      pulseRoot = createRoot(host);
      pulseRoot.render(<BrandPulse />);
    };
    ensure();
    const mo = new MutationObserver(ensure);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      const r = pulseRoot;
      pulseRoot = null;
      if (r) setTimeout(() => r.unmount(), 0);
      root.querySelector('.bp-host')?.remove();
    };
  }, []);

  return (
    <div ref={ref} dangerouslySetInnerHTML={{ __html: campaignsList }} />
  );
}
