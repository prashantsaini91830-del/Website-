// Gyaan Hub - user preferences (kept on this device instantly, synced to the account by layout.js)
const KEY = "gyaan_prefs";
export const DEFAULTS = {
  theme: "dark",          // dark | light | system
  lang: "en",             // en | hi
  emailResults: true,     // e-mail me my test result
  newAlerts: true,        // show "NEW" badges + banner for new study material
  speed: 1,               // default playback speed
  quality: "auto",        // auto | 1080p | 720p | 480p | 360p | 240p | 144p
  autoplay: false,
  resume: true,           // resume videos / PDFs from last position
  showDownload: true,     // show the Download button in the viewer
  dataSaver: false,
  _ts: 0
};

export function getPrefs() {
  let p = {};
  try { p = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
  return { ...DEFAULTS, ...p };
}

export function savePrefs(patch) {
  const p = { ...getPrefs(), ...patch, _ts: Date.now() };
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {}
  if (window.__applyPrefs) window.__applyPrefs(p);
  window.dispatchEvent(new CustomEvent("prefs-changed", { detail: p }));
  window.dispatchEvent(new CustomEvent("prefs-saved", { detail: p }));   // layout.js uploads this to the account
  return p;
}

// remote copy wins only if it is newer than the copy on this device
export function mergeRemote(remote) {
  if (!remote || typeof remote !== "object") return false;
  const local = getPrefs();
  if ((remote._ts || 0) <= (local._ts || 0)) return false;
  const p = { ...DEFAULTS, ...remote };
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {}
  if (window.__applyPrefs) window.__applyPrefs(p);
  window.dispatchEvent(new CustomEvent("prefs-changed", { detail: p }));
  return true;
}

export const saverOn = () => { const p = getPrefs(); return !!(p.dataSaver || (navigator.connection && navigator.connection.saveData)); };
