// Gyaan Hub - helpers for the built-in player (pure functions, no DOM)
const BASE = typeof location !== "undefined" ? location.href : "https://example.com/";

export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// http(s) links and same-site relative paths (e.g. files/notes.pdf) are allowed. javascript:, data: etc. are not.
export function isSafeUrl(u) {
  u = String(u || "").trim();
  if (!u || u === "#") return false;
  if (/^https?:\/\//i.test(u)) return true;
  return !/^([a-z][a-z0-9+.\-]*:|\/\/)/i.test(u);
}

export function keyOf(s) {            // short stable id for a link (used for resume positions)
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return "p" + h.toString(16);
}

export function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec || 0));
  const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
  return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s).padStart(2, "0");
}

function startSeconds(u) {
  const v = u.searchParams.get("t") || u.searchParams.get("start") || "";
  if (/^\d+$/.test(v)) return +v;
  const m = v.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  return m && v ? (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0) : 0;
}

export function driveId(s) {
  const m = String(s).match(/\/(?:file|document|presentation|spreadsheets)\/d\/([\w-]{10,})/) || String(s).match(/[?&]id=([\w-]{10,})/) || String(s).match(/\/folders\/([\w-]{10,})/);
  return m ? m[1] : "";
}

// GitHub "blob" page links and Dropbox share links -> direct file links
function direct(u) {
  if (u.hostname === "github.com") {
    const m = u.pathname.match(/^\/([^/]+)\/([^/]+)\/blob\/(.+)$/);
    if (m) return "https://raw.githubusercontent.com/" + m[1] + "/" + m[2] + "/" + m[3];
  }
  if (/(^|\.)dropbox\.com$/.test(u.hostname)) { const c = new URL(u.href); c.searchParams.delete("dl"); c.searchParams.set("raw", "1"); return c.href; }
  return u.href;
}

/* returns { kind, ... }  kind = youtube | vimeo | drive | drive-folder | pdf | video | hls | audio | image | iframe */
export function detect(raw) {
  const original = String(raw || "").trim();
  let u;
  try { u = new URL(original, BASE); } catch (e) { return { kind: "iframe", url: original, original }; }
  const host = u.hostname.replace(/^www\./, ""), path = u.pathname, low = path.toLowerCase();

  // YouTube
  let yt = "", list = u.searchParams.get("list") || "";
  if (host === "youtu.be") yt = path.slice(1).split("/")[0];
  else if (/(^|\.)youtube(-nocookie)?\.com$/.test(host)) {
    yt = u.searchParams.get("v") || "";
    const m = path.match(/^\/(?:embed|shorts|live|v)\/([\w-]{6,})/);
    if (!yt && m) yt = m[1];
    if (path === "/playlist" || (!yt && list)) yt = "";
  }
  if (yt || list) return { kind: "youtube", id: yt, list, start: startSeconds(u), original, url: original };

  // Vimeo
  const vm = host.endsWith("vimeo.com") && path.match(/\/(\d{6,})/);
  if (vm) return { kind: "vimeo", id: vm[1], embed: "https://player.vimeo.com/video/" + vm[1], original, url: original };

  // Google Drive / Docs
  if (host === "drive.google.com") {
    const id = driveId(original);
    if (/\/folders\//.test(path) && id) return { kind: "drive-folder", id, embed: "https://drive.google.com/embeddedfolderview?id=" + id + "#list", original, url: original };
    if (id) return { kind: "drive", id, embed: "https://drive.google.com/file/d/" + id + "/preview", download: "https://drive.google.com/uc?export=download&id=" + id, original, url: original };
  }
  if (host === "docs.google.com") {
    const id = driveId(original);
    if (id && /\/document\//.test(path)) return { kind: "iframe", embed: "https://docs.google.com/document/d/" + id + "/preview", original, url: original };
    if (id && /\/presentation\//.test(path)) return { kind: "iframe", embed: "https://docs.google.com/presentation/d/" + id + "/embed?start=false&loop=false", original, url: original };
    if (id && /\/spreadsheets\//.test(path)) return { kind: "iframe", embed: "https://docs.google.com/spreadsheets/d/" + id + "/preview", original, url: original };
    if (/\/forms\//.test(path)) return { kind: "iframe", embed: original.includes("embedded=true") ? original : original + (original.includes("?") ? "&" : "?") + "embedded=true", original, url: original };
  }

  // direct files (by extension)
  const file = direct(u), fl = new URL(file, BASE).pathname.toLowerCase();
  if (/\.pdf$/.test(fl)) return { kind: "pdf", url: file, original };
  if (/\.m3u8$/.test(fl)) return { kind: "hls", url: file, original };
  if (/\.(mp4|webm|ogv|mov|m4v)$/.test(fl)) return { kind: "video", url: file, original };
  if (/\.(mp3|wav|m4a|aac|ogg|oga)$/.test(fl)) return { kind: "audio", url: file, original };
  if (/\.(png|jpe?g|gif|webp|avif|svg)$/.test(fl)) return { kind: "image", url: file, original };
  return { kind: "iframe", embed: original, original, url: original };
}

// Image links: Drive share links -> direct thumbnail link, GitHub blob / Dropbox -> raw
export function normalizeImgUrl(raw) {
  const s = String(raw || "").trim();
  if (!isSafeUrl(s)) return "";
  try {
    const u = new URL(s, BASE);
    if (u.hostname === "drive.google.com") { const id = driveId(s); if (id) return "https://drive.google.com/thumbnail?id=" + id + "&sz=w1400"; }
    return direct(u) === u.href ? s : direct(u);
  } catch (e) { return s; }
}

export const QUALITY_MAP = { auto: "default", "1080p": "hd1080", "720p": "hd720", "480p": "large", "360p": "medium", "240p": "small", "144p": "tiny" };
export const QUALITY_LABEL = { default: "Auto", highres: "4K+", hd2880: "2880p", hd2160: "2160p", hd1440: "1440p", hd1080: "1080p", hd720: "720p", large: "480p", medium: "360p", small: "240p", tiny: "144p", auto: "Auto" };
