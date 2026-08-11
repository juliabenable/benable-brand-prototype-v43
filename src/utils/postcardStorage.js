// Prototype-only persistence for v6.
// Two namespaces in localStorage:
//   STORAGE_KEY  — per-creator actions, keyed by `${campaignId}::${creatorHandle}`
//   CAMPAIGN_KEY — per-campaign state (wrap-up closed flag), keyed by campaignId
//
// Per-creator state:
//   postcard:   { style, publicMessage, privateMessage, sentAt } | null
//   reCollab:   null | 'decline' | 'later' | 'favorite'
//   rating:     0..5 (private)
//   rebooked:   bool
//   paidRights: { [postKey]: { status, mode, tier, price, acquiredAt, expiresAt, bundle? } }
//   organicExt: { [postKey]: { tier, price, extendedUntil, acquiredAt, bundle? } }

const STORAGE_KEY = 'benable.creatorActions.v4';
const CAMPAIGN_KEY = 'benable.campaignState.v1';

function readAll() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function writeAll(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function readCampaigns() {
  try { return JSON.parse(localStorage.getItem(CAMPAIGN_KEY) || '{}'); } catch { return {}; }
}
function writeCampaigns(state) {
  localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(state));
}
function makeKey(campaignId, creatorHandle) {
  return `${campaignId}::${creatorHandle}`;
}

const EMPTY = {
  postcard: null,
  reCollab: null,      // 'decline' | 'later' | 'favorite'
  reCollabNote: '',    // private note shown to the Benable team only —
                       // typically the "what didn't work" reason on a
                       // 'decline'.
  rating: 0,
  rebooked: false,
  paidRights: {},
  organicExt: {},
};

export function getCreatorState(campaignId, creatorHandle) {
  return { ...EMPTY, ...(readAll()[makeKey(campaignId, creatorHandle)] || {}) };
}

function patchCreatorState(campaignId, creatorHandle, patch) {
  const all = readAll();
  const key = makeKey(campaignId, creatorHandle);
  all[key] = { ...EMPTY, ...(all[key] || {}), ...patch };
  writeAll(all);
}

// --- Postcard (per creator) ---
export function getPostcard(campaignId, creatorHandle) {
  return getCreatorState(campaignId, creatorHandle).postcard;
}
export function savePostcard(campaignId, creatorHandle, postcard) {
  patchCreatorState(campaignId, creatorHandle, { postcard });
}

// --- Re-collab (per creator, enum) ---
export function getReCollab(campaignId, creatorHandle) {
  return getCreatorState(campaignId, creatorHandle).reCollab;
}
export function setReCollab(campaignId, creatorHandle, value /* 'decline'|'later'|'favorite'|null */) {
  patchCreatorState(campaignId, creatorHandle, { reCollab: value });
}
export function getReCollabNote(campaignId, creatorHandle) {
  return getCreatorState(campaignId, creatorHandle).reCollabNote || '';
}
export function setReCollabNote(campaignId, creatorHandle, note) {
  patchCreatorState(campaignId, creatorHandle, { reCollabNote: note });
}
export function isPositiveReCollab(value) {
  return value === 'later' || value === 'favorite';
}

// --- Other per-creator state ---
export function setRebooked(campaignId, creatorHandle, value) {
  patchCreatorState(campaignId, creatorHandle, { rebooked: value });
}
export function setRating(campaignId, creatorHandle, value) {
  patchCreatorState(campaignId, creatorHandle, { rating: value });
}

// --- Paid rights (per post) ---
export function getPaidRights(campaignId, creatorHandle, postKey) {
  return getCreatorState(campaignId, creatorHandle).paidRights[postKey] || null;
}
export function setPaidRights(campaignId, creatorHandle, postKey, rights) {
  const cur = getCreatorState(campaignId, creatorHandle).paidRights || {};
  const next = { ...cur };
  if (rights) next[postKey] = rights; else delete next[postKey];
  patchCreatorState(campaignId, creatorHandle, { paidRights: next });
}
export function paidRightsCount(campaignId, creatorHandle) {
  return Object.keys(getCreatorState(campaignId, creatorHandle).paidRights || {}).length;
}

// --- Organic extension (per post) ---
export function getOrganicExt(campaignId, creatorHandle, postKey) {
  return getCreatorState(campaignId, creatorHandle).organicExt[postKey] || null;
}
export function setOrganicExt(campaignId, creatorHandle, postKey, ext) {
  const cur = getCreatorState(campaignId, creatorHandle).organicExt || {};
  const next = { ...cur };
  if (ext) next[postKey] = ext; else delete next[postKey];
  patchCreatorState(campaignId, creatorHandle, { organicExt: next });
}

// --- Per-campaign state (wrap-up close flag) ---
export function getCampaignState(campaignId) {
  return readCampaigns()[campaignId] || { closed: false, closedAt: null };
}
export function setCampaignClosed(campaignId, closed) {
  const all = readCampaigns();
  all[campaignId] = closed
    ? { closed: true, closedAt: new Date().toISOString() }
    : { closed: false, closedAt: null };
  writeCampaigns(all);
}

// --- Wrap-up trigger: visible if a) ≥50% creators thanked OR b) manually closed ---
const WRAPUP_THRESHOLD = 0.5;
export function isWrapUpVisible(campaignId, creatorHandles) {
  if (getCampaignState(campaignId).closed) return true;
  if (!creatorHandles || creatorHandles.length === 0) return false;
  const thanked = creatorHandles.filter((h) => !!getPostcard(campaignId, h)).length;
  return thanked / creatorHandles.length >= WRAPUP_THRESHOLD;
}
export function getCreatorsByReCollab(campaignId, creatorHandles) {
  const buckets = { favorite: [], later: [], decline: [], undecided: [] };
  (creatorHandles || []).forEach((h) => {
    const v = getReCollab(campaignId, h);
    if (v === 'favorite') buckets.favorite.push(h);
    else if (v === 'later') buckets.later.push(h);
    else if (v === 'decline') buckets.decline.push(h);
    else buckets.undecided.push(h);
  });
  return buckets;
}

// --- Cross-creator surface ---
export function getRelationshipSummary(campaignId, creatorHandle) {
  const s = getCreatorState(campaignId, creatorHandle);
  const rights = Object.keys(s.paidRights || {}).length;
  const organic = Object.keys(s.organicExt || {}).length;
  return {
    thanked: !!s.postcard,
    paidRights: rights,
    organicExt: organic,
    reCollab: s.reCollab,
    rebooked: !!s.rebooked,
    rating: s.rating || 0,
    any: !!(s.postcard || rights || organic || s.reCollab || s.rebooked || s.rating),
  };
}

// --- Demo helpers ---
export function getActionedCount() {
  return Object.values(readAll()).filter((s) => {
    if (!s) return false;
    const rights = s.paidRights && Object.keys(s.paidRights).length;
    const organic = s.organicExt && Object.keys(s.organicExt).length;
    return s.postcard || rights || organic || s.reCollab || s.rebooked || s.rating;
  }).length;
}
export function clearAllActions() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CAMPAIGN_KEY);
}

// Back-compat aliases (used by CampaignDetailPage / reset FAB)
export const getPostcardCount = getActionedCount;
export const clearAllPostcards = clearAllActions;

const STYLE_PREF_KEY = 'benable.postcards.preferredStyle';
export function getPreferredStyle() { return localStorage.getItem(STYLE_PREF_KEY) || 'polaroid'; }
export function setPreferredStyle(style) { localStorage.setItem(STYLE_PREF_KEY, style); }

// ---------------------------------------------------------------------------
// Deterministic demo creator metadata (NOT an "action" — survives the reset).
// ---------------------------------------------------------------------------
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function getCreatorMeta(handle) {
  const h = hashString(handle || 'anon');
  const followers = 8000 + (h % 412) * 1000;
  let tier = 'Nano';
  if (followers >= 500000) tier = 'Macro';
  else if (followers >= 100000) tier = 'Mid';
  else if (followers >= 10000) tier = 'Micro';
  const engagement = Number((2 + ((h >> 3) % 60) / 10).toFixed(1));
  const instantLicensing = handle === '@rmtfka' ? false : (h % 2 === 0);
  const followersLabel =
    followers >= 1000000 ? `${(followers / 1e6).toFixed(1)}M` : `${Math.round(followers / 1000)}K`;
  const avgViews = Math.round(followers * (0.9 + (h % 50) / 100));
  const campaignsTogether = 1 + (h % 4);
  const totalInvested = 180 + (h % 14) * 90;
  const deliveredOnTime = (h >> 5) % 5 !== 0;
  return {
    followers, followersLabel, tier, engagement, instantLicensing,
    avgViews,
    avgViewsLabel: avgViews >= 1000000 ? `${(avgViews / 1e6).toFixed(1)}M` : `${Math.round(avgViews / 1000)}K`,
    campaignsTogether, totalInvested, deliveredOnTime,
  };
}

// --- Tiers + helpers (kept from v5 for the wrap-up rights select-list) ---
export const PAID_TIERS = [
  { id: '1mo', label: '1 month', months: 1, price: 50 },
  { id: '3mo', label: '3 months', months: 3, price: 100 },
  { id: '6mo', label: '6 months', months: 6, price: 200, best: true },
];
export const ORGANIC_TIERS = [
  { id: 'o3mo', label: '3 months', months: 3, price: 15 },
  { id: 'o6mo', label: '6 months', months: 6, price: 25, best: true },
  { id: 'o12mo', label: '12 months', months: 12, price: 40 },
];
export const ORGANIC_FREE_DAYS = 30;
export function tierById(id) {
  return PAID_TIERS.find((t) => t.id === id) || ORGANIC_TIERS.find((t) => t.id === id) || PAID_TIERS[1];
}
export function bundlePrice(perPostPrice, postCount) {
  return Math.round((perPostPrice * postCount * 0.7) / 5) * 5;
}
export function expiryFromDays(days) { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString(); }
export function expiryFromNow(months) { const d = new Date(); d.setMonth(d.getMonth() + months); return d.toISOString(); }
export function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
