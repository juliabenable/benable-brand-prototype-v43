# Benable Brand Portal — Prototype v7

Iteration of [v6](https://github.com/juliabenable/benable-brand-prototype-v6). Forked from v6 as the new working baseline for the next round of changes.

## Run

```bash
npm install
npm run dev
```

Opens at http://localhost:5181.

## What's in here

- **Captured production HTML and CSS** for every brand-portal screen reachable from the Pikora account. The captured `<main>` HTML is rendered into each page via `dangerouslySetInnerHTML`, and the merged production CSS lives in `src/styles/production.css`. Svelte scoped suffixes were stripped from both so they match on base class names.
- **React shell** (`src/shell/Shell.jsx`) that owns the sidebar + mobile header. Sidebar links use react-router-dom; nav-item active state is patched per route.
- **Routed pages** in `src/pages/`:
  - `LoginPage.jsx` — minimal JSX rebuild (the live login page redirects when authenticated, so no clean capture)
  - `CampaignsListPage.jsx` — campaigns table, row click → detail
  - `CampaignDetailPage.jsx` — Dashboard / Content tabs, Campaign Details modal, Add Creators modal
  - `CreateCampaignPage.jsx` — 3-step Get Started → Setup → Gift Card flow
  - `SettingsPage.jsx`
  - `SoonPage.jsx` — used for /ugc, /alerts, /intelligence

## Captures

The raw evidence is in `captures/`:
- `desktop/` — 17 full-page screenshots at 1440×900
- `mobile/` — 5 screenshots at 390×844
- `sources/` — JSON dumps containing full rendered HTML and all stylesheets, per page

If you want to recapture a screen with fresher data, navigate there in production while logged in and run:

```js
JSON.stringify({
  url: location.href,
  html: document.documentElement.outerHTML,
  sheets: Array.from(document.styleSheets).map(s => {
    try { return { href: s.href || 'inline', rules: Array.from(s.cssRules).map(r => r.cssText).join('\n') }; }
    catch (e) { return { href: s.href, error: e.message }; }
  }),
})
```

## How to iterate

The captured HTML strings live in `src/data/capturedHtml.js`. As you iterate on a screen, replace its `dangerouslySetInnerHTML` block with proper JSX (or a fresh design) and drop in your own components. The production CSS in `src/styles/production.css` will keep styling consistent.

For new screens, follow the same pattern: capture, extract `<main>`, add a route in `App.jsx`.

## Known limitations

- **Images load via proxy** to `benable.com` (configured in `vite.config.js`). Avatars and other auth-gated assets may 404 if your session expires.
- **Real interactivity is stubbed**: clicking a campaign row routes to a canonical detail page (`/campaigns/46` or `/31`) rather than fetching that row's data; "Create My Campaign" routes back to the list rather than calling the API.
- The login page is JSX-only (not a 1:1 capture).
- Modal close buttons use Escape and the backdrop; the inline `×` may need a click handler attached as you iterate.

## Captured routes

| Path | Component | Capture |
|------|-----------|---------|
| `/brand/login` | LoginPage (JSX) | `captures/desktop/00-login.png` |
| `/brand/tonypikora/campaigns` | CampaignsListPage | `01-campaigns-list.png` |
| `/brand/tonypikora/campaigns/:id` | CampaignDetailPage | `06`, `16`, `17`, `14-campaign-detail-draft.png` |
| `/brand/tonypikora/campaigns/new` | CreateCampaignPage (3 steps) | `10`, `11`, `12`, `12b` |
| `/brand/tonypikora/settings` | SettingsPage | `02-settings.png` |
| `/brand/tonypikora/ugc` | SoonPage | `03-ugc-studio-soon.png` |
| `/brand/tonypikora/alerts` | SoonPage | `04-push-alerts-soon.png` |
| `/brand/tonypikora/intelligence` | SoonPage | `05-brand-intelligence-soon.png` |

Modal captures: `07-campaign-details-panel.png`, `09-add-creators-modal.png`, `13-account-menu-open.png`.
