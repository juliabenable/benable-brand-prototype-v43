import { useNavigate } from 'react-router-dom';
import GlowLoveWrap from '../components/glowlove/GlowLoveWrap.jsx';

const CAMPAIGN = "Experience 28 Litsea's Award Winning Body Oil";

/**
 * The live campaign wrap-up, embedded inside the brand-portal shell
 * (sidebar + page header) rather than floating standalone.
 */
export default function WrapPage() {
  const navigate = useNavigate();
  return (
    <main className="workspace-content">
      <div className="workspace-content-shell">
        <div className="main-area">
          <header className="page-header">
            <h1>Campaign wrap-up</h1>
            <p>{CAMPAIGN} · Campaign complete</p>
          </header>
          <GlowLoveWrap embedded onBack={() => navigate('/brand/tonypikora/campaigns')} />
        </div>
      </div>
    </main>
  );
}
