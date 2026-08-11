import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Shell from './shell/Shell.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CampaignsListPage from './pages/CampaignsListPage.jsx';
import CampaignDetailPage from './pages/CampaignDetailPage.jsx';
import CreateCampaignPage from './pages/CreateCampaignPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import SoonPage from './pages/SoonPage.jsx';
import WrapStudies from './pages/WrapStudies.jsx';
import ContentStudy from './pages/ContentStudy.jsx';
import WallStudy from './pages/WallStudy.jsx';
import BannerStudy from './pages/BannerStudy.jsx';
import ContentRevealStudy from './pages/ContentRevealStudy.jsx';
import ContentCountStudy from './pages/ContentCountStudy.jsx';
import SecondCampaignStudy from './pages/SecondCampaignStudy.jsx';
import WrapReview from './pages/WrapReview.jsx';
import GlowLoveWrap from './components/glowlove/GlowLoveWrap.jsx';
import WrapPage from './pages/WrapPage.jsx';

export default function App() {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const withShell = (el) => (
    <Shell
      accountMenuOpen={accountMenuOpen}
      onToggleAccountMenu={() => setAccountMenuOpen((v) => !v)}
    >
      {el}
    </Shell>
  );

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/brand/tonypikora/campaigns" replace />} />
      <Route path="/brand/login" element={<LoginPage />} />
      <Route path="/brand/tonypikora" element={withShell(<CampaignsListPage />)} />
      <Route path="/brand/tonypikora/campaigns" element={withShell(<CampaignsListPage />)} />
      <Route path="/brand/tonypikora/campaigns/new" element={withShell(<CreateCampaignPage />)} />
      <Route path="/brand/tonypikora/campaigns/:id" element={withShell(<CampaignDetailPage />)} />
      <Route path="/brand/tonypikora/settings" element={withShell(<SettingsPage />)} />
      <Route path="/brand/tonypikora/ugc" element={withShell(<SoonPage />)} />
      <Route path="/brand/tonypikora/alerts" element={withShell(<SoonPage />)} />
      <Route path="/brand/tonypikora/intelligence" element={withShell(<SoonPage />)} />
      <Route path="/wrap-studies" element={<WrapStudies />} />
      <Route path="/wrap-studies/:screen" element={<WrapStudies />} />
      <Route path="/content-study" element={<ContentStudy />} />
      <Route path="/wall-study" element={<WallStudy />} />
      <Route path="/banner-study" element={<BannerStudy />} />
      <Route path="/content-reveal-study" element={<ContentRevealStudy />} />
      <Route path="/content-count-study" element={<ContentCountStudy />} />
      <Route path="/second-campaign-study" element={<SecondCampaignStudy />} />
      <Route path="/wrap-review" element={<WrapReview />} />
      <Route path="/wrap-review/:topic" element={<WrapReview />} />
      {/* Wrap embedded in the brand-portal shell (sidebar + header). */}
      <Route path="/__wraplive" element={withShell(<WrapPage />)} />
      {/* Standalone wrap (no shell) kept for quick previews. */}
      <Route path="/__wrapsolo" element={<GlowLoveWrap />} />
      <Route path="*" element={<Navigate to="/brand/tonypikora/campaigns" replace />} />
    </Routes>
  );
}
