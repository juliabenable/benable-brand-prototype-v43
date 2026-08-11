import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mobileHeaderHtml, sidebarHtml } from '../data/shellHtml.js';

/**
 * The brand-portal shell: mobile header + sidebar + main slot.
 * Uses the captured production HTML for the chrome so styling is 1:1.
 * Intercepts link clicks to navigate via react-router, and patches the
 * "active" nav-item state based on the current pathname.
 */
export default function Shell({ children, accountMenuOpen, onToggleAccountMenu }) {
  const sidebarRef = useRef(null);
  const mobileHeaderRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Patch the "active" class on sidebar nav items based on current route.
  useEffect(() => {
    const wrap = sidebarRef.current;
    if (!wrap) return;
    const items = wrap.querySelectorAll('.nav-item');
    items.forEach((a) => {
      const href = a.getAttribute('href');
      const isActive = href && (location.pathname === href || location.pathname.startsWith(href + '/'));
      a.classList.toggle('active', !!isActive);
    });
  }, [location.pathname]);

  // Toggle sidebar--open class on the actual <aside> + body class for backdrop.
  useEffect(() => {
    const wrap = sidebarRef.current;
    if (!wrap) return;
    const aside = wrap.querySelector('aside.sidebar');
    if (aside) aside.classList.toggle('sidebar--open', sidebarOpen);
    document.body.classList.toggle('sidebar-open', sidebarOpen);
    // Mobile header toggle's aria-expanded
    const hdr = mobileHeaderRef.current;
    const toggleBtn = hdr?.querySelector('.mobile-header-toggle');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', sidebarOpen ? 'true' : 'false');
  }, [sidebarOpen]);

  // Close mobile sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Intercept clicks: links inside sidebar/mobile-header navigate client-side;
  // hamburger toggles sidebar.
  const handleShellClick = (e) => {
    const anchor = e.target.closest('a[href^="/"]');
    if (anchor) {
      e.preventDefault();
      navigate(anchor.getAttribute('href'));
      return;
    }
    const toggle = e.target.closest('.mobile-header-toggle');
    if (toggle) {
      e.preventDefault();
      setSidebarOpen((v) => !v);
      return;
    }
    const acct = e.target.closest('.sidebar-brand-card');
    if (acct) {
      e.preventDefault();
      onToggleAccountMenu && onToggleAccountMenu();
      return;
    }
  };

  return (
    <div className="brand-dashboard">
      <div
        ref={mobileHeaderRef}
        onClick={handleShellClick}
        dangerouslySetInnerHTML={{ __html: mobileHeaderHtml }}
      />
      <div className="dashboard-body">
        <div
          data-shell-slot="sidebar"
          ref={sidebarRef}
          onClick={handleShellClick}
          dangerouslySetInnerHTML={{ __html: sidebarHtml }}
        />
        {accountMenuOpen && <AccountMenuPopover />}
        {/* Each page renders its own <main> (preserved from captured HTML). */}
        {children}
      </div>
    </div>
  );
}

function AccountMenuPopover() {
  // Mirrors production: a small dropdown anchored near the brand card.
  return (
    <div
      className="account-menu"
      style={{ position: 'fixed', bottom: 64, left: 16, zIndex: 50 }}
    >
      <button className="account-menu-item" type="button">
        <span className="account-menu-icon" />
        Log out
      </button>
    </div>
  );
}
