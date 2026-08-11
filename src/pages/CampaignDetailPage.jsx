import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useNavigate, useParams } from 'react-router-dom';
import CampaignPulse from '../components/pulse/CampaignPulse.jsx';
import {
  campaignDetailActive,
  campaignContentTab,
  campaignDetailsModalModal,
  addCreatorsModalModal,
} from '../data/capturedHtml.js';
import SayThanksPopup from '../components/SayThanksPopup.jsx';
import GlowLoveWrap from '../components/glowlove/GlowLoveWrap.jsx';
import {
  getCreatorState,
  getActionedCount,
  clearAllActions,
  getRelationshipSummary,
  isWrapUpVisible,
  getCampaignState,
  setCampaignClosed,
  getPostcard,
} from '../utils/postcardStorage.js';

const BRAND_NAME = 'Pikora';

export default function CampaignDetailPage() {
  const [tab, setTab] = useState('Dashboard'); // 'Dashboard' | 'Content' | 'Wrapup'
  const [modal, setModal] = useState(null); // null | 'details' | 'addCreators'
  const [popupTarget, setPopupTarget] = useState(null); // { creator, posts } or null
  const [decorTick, setDecorTick] = useState(0);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { id: campaignId = '0' } = useParams();

  // ----- Pre-parse the Content tab HTML once to get creators + their posts.
  // Used by both the dashboard row "Say thanks" entry and the wrap-up tab.
  const creatorsWithPosts = useMemo(() => parseContentCreators(campaignContentTab), []);
  const allCreatorHandles = useMemo(() => creatorsWithPosts.map((c) => c.creator.handle), [creatorsWithPosts]);

  const wrapVisible = isWrapUpVisible(campaignId, allCreatorHandles);
  const campaignClosed = getCampaignState(campaignId).closed;

  // Determine which captured-HTML block we render (or `null` for the Wrap-up tab).
  const html = tab === 'Content' ? campaignContentTab
             : tab === 'Dashboard' ? campaignDetailActive
             : null;

  // ----- Active-tab class patch for the Dashboard/Content tabs.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll('.workflow-dashboard-tab').forEach((b) => {
      const lbl = b.textContent.trim();
      const active = (tab === 'Wrapup' && lbl === 'Wrap-up')
        || lbl === tab
        || (tab === 'Wrapup' && false); // explicit
      b.classList.toggle('active', active);
    });
  }, [tab, html]);

  // ----- Campaign Pulse host — a div between the workflow header and the tab
  // bar on the Dashboard tab; the <CampaignPulse /> portal renders into it.
  useEffect(() => {
    const root = ref.current;
    if (!root || tab !== 'Dashboard') return;
    // The captured-HTML subtree can be replaced under us when the page
    // re-renders, so the Pulse block runs in its own React root and a
    // MutationObserver re-mounts it whenever the host gets wiped.
    let pulseRoot = null;
    const ensure = () => {
      if (root.querySelector('.cp-host')) return;
      // Mount inside the dashboard content, above the Invited Creators panel.
      const anchor = root.querySelector('.stage-top-card');
      if (!anchor) return;
      const host = document.createElement('div');
      host.className = 'cp-host';
      anchor.parentNode.insertBefore(host, anchor);
      pulseRoot = createRoot(host);
      pulseRoot.render(<CampaignPulse />);
    };
    ensure();
    const mo = new MutationObserver(ensure);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      const r = pulseRoot;
      pulseRoot = null;
      // Unmount async — React forbids sync unmount during a render pass.
      if (r) setTimeout(() => r.unmount(), 0);
      root.querySelector('.cp-host')?.remove();
    };
  }, [tab, html]);

  // ----- Inject the Wrap-up tab button into the captured tab bar (and decorate cards/rows).
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Inject "Wrap-up" tab into the captured tab bar.
    const bar = root.querySelector('.workflow-dashboard-tabs');
    if (bar && wrapVisible && !bar.querySelector('[data-tab="Wrapup"]')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'workflow-dashboard-tab wu-tab';
      btn.dataset.tab = 'Wrapup';
      btn.innerHTML = '★ Wrap-up';
      bar.appendChild(btn);
    }
    // Remove the Wrap-up tab if it's no longer visible (e.g., reset).
    if (bar && !wrapVisible) {
      bar.querySelector('[data-tab="Wrapup"]')?.remove();
    }

    // Inject the Wrap-up banner just below the tab bar on Dashboard/Content
    // tabs (it's the primary entry point — replaces the old coral pill).
    root.querySelector('.wu-banner')?.remove();
    if (wrapVisible && (tab === 'Dashboard' || tab === 'Content') && bar) {
      const unthankedCount = creatorsWithPosts.filter(
        (c) => !getPostcard(campaignId, c.creator.handle)
      ).length;
      const thankLink = unthankedCount > 0
        ? `<span class="wu-banner__dot" aria-hidden="true"></span>
           <button type="button" class="wu-banner__link" data-banner-action="thank">${unthankedCount} creator${unthankedCount === 1 ? '' : 's'} to thank</button>`
        : '';
      const banner = document.createElement('div');
      banner.className = 'wu-banner';
      banner.innerHTML = `
        <span class="wu-banner__icon" aria-hidden="true">♥</span>
        <span class="wu-banner__copy">
          <span class="wu-banner__lede">Your campaign is wrapped</span>
          ${thankLink}
        </span>
        <button type="button" class="wu-banner__cta" data-banner-action="recap">
          See your campaign wrap up
          <span class="wu-banner__cta-arrow" aria-hidden="true">→</span>
        </button>
      `;
      // Place the banner INSIDE the .stage-top-card white panel, in the
      // gap between the section header (Dashboard) or filter pills
      // (Content) and the actual table/grid below.
      //
      // Dashboard: between .panel-header-row and .creator-management-table-card
      // Content:   between .content-platform-filters and .content-post-grid
      //
      // Falls back to inserting before .stage-top-card (old placement)
      // if the inner anchors aren't found.
      const innerAnchor = tab === 'Dashboard'
        ? root.querySelector('.creator-management-table-card')
        : root.querySelector('.content-post-grid');
      if (innerAnchor && innerAnchor.parentNode) {
        innerAnchor.parentNode.insertBefore(banner, innerAnchor);
      } else {
        const card = root.querySelector('.stage-top-card');
        if (card && card.parentNode) {
          card.parentNode.insertBefore(banner, card);
        } else {
          bar.parentNode.insertBefore(banner, bar.nextSibling);
        }
      }
    }

    if (tab === 'Content') {
      root.querySelectorAll('.content-post-card').forEach((card) => decorateCard(card, campaignId));
    } else if (tab === 'Dashboard') {
      root.querySelectorAll('.creator-management-table tbody tr').forEach((tr) => decorateDashboardRow(tr, campaignId));
    }
  }, [tab, html, campaignId, decorTick, popupTarget, wrapVisible, creatorsWithPosts]);

  // ----- Click delegation -----
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const onClick = (e) => {
      // "Say thanks" CTA on a content card (new in v6).
      const sayBtn = e.target.closest('.tile-say-thanks');
      if (sayBtn) {
        e.preventDefault(); e.stopPropagation();
        const card = sayBtn.closest('.content-post-card');
        if (card) openThanksFromCard(card);
        return;
      }
      // Click on a content tile body (View) → also opens the popup at step 1.
      const card = e.target.closest('.content-post-card');
      if (card) {
        e.preventDefault(); e.stopPropagation();
        openThanksFromCard(card);
        return;
      }
      // Wrap-up banner — the CTA button OR the inline link both jump to Wrap-up.
      const bannerHit = e.target.closest('.wu-banner__cta, .wu-banner__link');
      if (bannerHit) {
        e.preventDefault(); e.stopPropagation();
        setTab('Wrapup');
        return;
      }
      // Captured "View" button (renamed from "Preview") on a Dashboard row.
      const viewLink = e.target.closest('.preview-action-btn');
      if (viewLink) {
        e.preventDefault(); e.stopPropagation();
        const tr = viewLink.closest('tr');
        const handle = tr?.querySelector('.creator-table-person-copy small')?.textContent.trim();
        if (handle) openThanksForHandle(handle);
        return;
      }
      // Tab clicks (includes the injected Wrap-up tab).
      const tabBtn = e.target.closest('.workflow-dashboard-tab');
      if (tabBtn) {
        e.preventDefault();
        const fromData = tabBtn.dataset.tab;
        const label = tabBtn.textContent.trim();
        if (fromData === 'Wrapup' || label === 'Wrap-up') setTab('Wrapup');
        else if (label === 'Dashboard' || label === 'Content') setTab(label);
        return;
      }
      const headerEdit = e.target.closest('.workflow-header-edit-btn');
      if (headerEdit) { e.preventDefault(); setModal('details'); return; }
      const button = e.target.closest('button');
      if (button && button.textContent.trim() === 'Add Creators') {
        e.preventDefault(); setModal('addCreators'); return;
      }
      const back = e.target.closest('.flow-backlink, .workflow-back-link');
      if (back) { e.preventDefault(); navigate('/brand/tonypikora/campaigns'); }
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [navigate, html, tab, creatorsWithPosts]);

  function openThanksFromCard(card) {
    const clicked = extractCard(card);
    if (!clicked) return;
    openThanksForHandle(clicked.creator.handle);
  }
  function openThanksForHandle(handle) {
    const found = creatorsWithPosts.find((c) => c.creator.handle === handle);
    if (!found) return;
    setPopupTarget({ creator: found.creator, posts: found.posts });
  }

  function onChanged() { setDecorTick((t) => t + 1); }

  function resetAll() {
    clearAllActions();
    setDecorTick((t) => t + 1);
    setTab('Dashboard');
  }

  function closeCampaignForDemo() {
    setCampaignClosed(campaignId, true);
    setDecorTick((t) => t + 1);
    // Stay on the current tab — the banner appears below the tab bar so
    // the user can see the wrap-up CTA without being yanked away. They
    // click the banner button (or the injected Wrap-up tab) to navigate.
  }
  function reopenCampaignForDemo() {
    setCampaignClosed(campaignId, false);
    setDecorTick((t) => t + 1);
    if (tab === 'Wrapup') setTab('Content');
  }

  const actionedCount = getActionedCount();

  return (
    <>
      {/* Demo affordance — flip the wrap-up tab on without thanking 50% */}
      {!campaignClosed && !wrapVisible && (
        <button type="button" className="demo-close-btn" onClick={closeCampaignForDemo}>
          ★ Close campaign <span className="demo-close-btn__hint">demo</span>
        </button>
      )}
      {campaignClosed && (
        <button type="button" className="demo-close-btn demo-close-btn--reopen" onClick={reopenCampaignForDemo}>
          ↺ Re-open campaign <span className="demo-close-btn__hint">demo</span>
        </button>
      )}

      {tab === 'Wrapup' ? (
        <GlowLoveWrap onBack={(t) => setTab(t === 'Content' ? 'Content' : 'Dashboard')} />
      ) : (
        <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
      )}

      {/* Need a ref for tab injection even when Wrap-up is the active panel —
          render an invisible host to keep injection logic working on tab switch. */}
      {tab === 'Wrapup' && <div ref={ref} style={{ display: 'none' }} />}

      {modal === 'details' && (
        <ModalLayer html={campaignDetailsModalModal} onClose={() => setModal(null)} />
      )}
      {modal === 'addCreators' && (
        <ModalLayer html={addCreatorsModalModal} onClose={() => setModal(null)} />
      )}
      {popupTarget && (
        <SayThanksPopup
          campaignId={campaignId}
          brandName={BRAND_NAME}
          creator={popupTarget.creator}
          posts={popupTarget.posts}
          onClose={() => setPopupTarget(null)}
          onChanged={onChanged}
        />
      )}
      {actionedCount > 0 && !popupTarget && (
        <button
          type="button"
          className="reset-thanks-fab"
          onClick={resetAll}
          aria-label="Reset all creator actions (demo only)"
          title="Reset all creator actions — demo only"
        >
          <span aria-hidden="true" className="reset-thanks-fab__icon">↺</span>
          Reset {actionedCount} creator{actionedCount === 1 ? '' : 's'}
          <span className="reset-thanks-fab__hint">demo</span>
        </button>
      )}
    </>
  );
}

/* ------- Decorations ------- */

function decorateCard(card, campaignId) {
  if (getComputedStyle(card).position === 'static') {
    card.style.position = 'relative';
  }
  card.querySelector('.thanked-badge')?.remove();
  card.querySelector('.tile-say-thanks')?.remove();

  const info = extractCard(card);
  if (!info) return;
  const st = getCreatorState(campaignId, info.creator.handle);

  // Always add a prominent "Say thanks" CTA under the card (full-width primary).
  const cta = document.createElement('button');
  cta.type = 'button';
  cta.className = 'tile-say-thanks' + (st.postcard ? ' tile-say-thanks--thanked' : '');
  if (st.postcard) {
    const date = new Date(st.postcard.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    cta.innerHTML = `<span class="tile-say-thanks__check">✓</span> Thanked · ${date}`;
  } else {
    cta.innerHTML = `<span aria-hidden="true">♥</span> Say thanks`;
  }
  card.appendChild(cta);
}

function decorateDashboardRow(tr, campaignId) {
  tr.querySelector('.relationship-strip')?.remove();
  // Clean up the duplicate injected button from earlier v6 iterations.
  tr.querySelector('.dash-say-thanks')?.remove();

  const handle = tr.querySelector('.creator-table-person-copy small')?.textContent.trim();
  if (!handle) return;
  const summary = getRelationshipSummary(campaignId, handle);

  // Rename the captured "Preview" link → "View", and (when relevant) prepend
  // the "Say thanks" hint so the brand sees the next action right on the row.
  const viewLink = tr.querySelector('.preview-action-btn');
  if (viewLink) {
    if (summary.thanked) {
      viewLink.innerHTML = '<span aria-hidden="true" class="dash-thanked-dot">✓</span> View · thanked';
      viewLink.classList.add('preview-action-btn--thanked');
    } else {
      viewLink.innerHTML = '<span aria-hidden="true">♥</span> View · say thanks';
      viewLink.classList.remove('preview-action-btn--thanked');
    }
  }

  // Chip strip in the note column.
  const chips = [];
  if (summary.thanked) chips.push('<span class="rel-chip rel-chip--thanked">♥ Thanked</span>');
  if (summary.paidRights > 0) chips.push(`<span class="rel-chip rel-chip--rights">⊛ Paid rights · ${summary.paidRights}</span>`);
  if (summary.reCollab === 'favorite') chips.push('<span class="rel-chip rel-chip--save">★ Favorite</span>');
  else if (summary.reCollab === 'later') chips.push('<span class="rel-chip rel-chip--invite">↻ Future pick</span>');
  // No chip when the brand chose "Nah, one and done" — the dashboard
  // stays clean for creators that aren't being kept in rotation.
  if (chips.length) {
    const noteCell = tr.querySelector('.creator-management-note-col');
    const host = noteCell || tr.querySelector('td:nth-child(3)') || tr.lastElementChild;
    if (host) {
      // Hide any placeholder note text ("Benable team coordinating…") on rows
      // where we have real relationship chips to show — it makes the chips
      // sit at the row's vertical center instead of pushed below the italic
      // placeholder.
      host.querySelectorAll(':scope > *:not(.relationship-strip)').forEach((el) => {
        el.style.display = 'none';
      });
      const strip = document.createElement('div');
      strip.className = 'relationship-strip';
      strip.innerHTML = chips.join('');
      host.insertBefore(strip, host.firstChild);
    }
  }
}

function extractCard(card) {
  const nameEl = card.querySelector('.content-post-card__name');
  const handleEl = card.querySelector('.content-post-card__handle');
  if (!nameEl || !handleEl) return null;
  const avatarText = card.querySelector('.content-post-card__avatar')?.textContent.trim() || nameEl.textContent.trim().charAt(0);
  const thumb = card.querySelector('.content-post-card__thumb-image')?.getAttribute('src') || '';
  const badge = card.querySelector('.content-post-card__badge')?.textContent.trim() || '';
  const caption = card.querySelector('.content-post-card__caption')?.textContent.trim() || '';
  const timeAgo = card.querySelector('.content-post-card__time')?.textContent.trim() || '';
  const postUrl = card.getAttribute('href') || '';
  return {
    creator: {
      name: nameEl.textContent.trim(),
      handle: handleEl.textContent.trim(),
      avatarInitial: avatarText.charAt(0).toUpperCase(),
    },
    post: { thumbnailUrl: thumb, platform: badge, caption, timeAgo, postUrl },
  };
}

/* Parse the Content tab HTML once → group posts by creator handle. */
function parseContentCreators(htmlString) {
  if (typeof document === 'undefined') return [];
  const doc = new DOMParser().parseFromString(htmlString, 'text/html');
  const cards = Array.from(doc.querySelectorAll('.content-post-card'));
  const byHandle = new Map();
  cards.forEach((card) => {
    const info = extractCard(card);
    if (!info) return;
    const h = info.creator.handle;
    if (!byHandle.has(h)) byHandle.set(h, { creator: info.creator, posts: [], allPostKeys: [] });
    const bucket = byHandle.get(h);
    bucket.posts.push(info.post);
    bucket.allPostKeys.push(info.post.postUrl || `${info.post.platform || 'post'}#${bucket.posts.length - 1}`);
  });
  return Array.from(byHandle.values());
}

function ModalLayer({ html, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const onClick = (e) => {
      if (e.target.closest('.brand-portal-modal__backdrop, .brand-portal-modal__close')) {
        e.preventDefault();
        onClose();
      }
    };
    root.addEventListener('click', onClick);
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { root.removeEventListener('click', onClick); window.removeEventListener('keydown', onKey); };
  }, [onClose]);
  return <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
}
