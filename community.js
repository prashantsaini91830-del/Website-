// Gyaan Hub - Student Community (profiles, follow, rank, messages, block / report)
// Uses the SAME Firebase project and helpers as the rest of the site (auth.js). No new keys, no new services.
import * as A from "./auth.js?v=13";
import { squareAvatar } from "./media.js?v=13";
import * as F from "./files.js?v=13";

export { A, squareAvatar, F };
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// Vector avatars (id -> icon + gradient). Stored in the profile as "preset:<id>".
export const AVATARS = {
  rocket: ["rocket", "#6d7cff", "#a06bff"], star: ["star", "#f6b93b", "#e55039"], brain: ["brain", "#ff7eb3", "#a06bff"],
  atom: ["atom", "#17c3b2", "#227c9d"], flask: ["flask", "#38ef7d", "#11998e"], book: ["book", "#4facfe", "#00c6fb"],
  trophy: ["trophy", "#f6d365", "#fda085"], flame: ["flame", "#ff9966", "#ff5e62"], bolt: ["bolt", "#fbd72b", "#f9484a"],
  target: ["target", "#ee0979", "#ff6a00"], laptop: ["laptop", "#654ea3", "#eaafc8"], cap: ["cap", "#0f9b8e", "#6d7cff"]
};
export const PRESETS = Object.keys(AVATARS);
export const COURSES = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "NEET", "JEE", "UPSC", "Other"];
const SAFE_IMG = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

/* ---------- small UI helpers ---------- */
export function avatarHtml(p, cls = "") {
  const a = (p && p.avatar) || "";
  if (SAFE_IMG.test(a)) return `<img class="avatar ${cls}" src="${a}" alt="">`;
  if (a.startsWith("preset:")) {
    const v = AVATARS[a.slice(7)];
    if (v) return `<span class="avatar vec ${cls}" style="background:linear-gradient(135deg,${v[1]},${v[2]})">${window.ic ? window.ic(v[0]) : ""}</span>`;
    return `<span class="avatar emoji ${cls}">${esc(a.slice(7))}</span>`;
  }
  const n = ((p && p.name) || "?").trim();
  return `<span class="avatar ${cls}">${esc((n[0] || "?").toUpperCase())}</span>`;
}
export function toast(msg, ms = 5000) {
  const d = document.createElement("div");
  d.className = "cm-toast"; d.textContent = msg;
  document.body.appendChild(d);
  setTimeout(() => d.classList.add("show"), 20);
  setTimeout(() => { d.classList.remove("show"); setTimeout(() => d.remove(), 300); }, ms);
}
export const errText = e => (e && e.code === "permission-denied")
  ? "Not allowed. Make sure the latest Firestore rules from the README are published, or the other student's settings do not allow this."
  : A.friendly(e || {});

function shrink(dataUrl, size = 120) {
  return new Promise(res => {
    const i = new Image();
    i.onload = () => { const c = document.createElement("canvas"); c.width = c.height = size; c.getContext("2d").drawImage(i, 0, 0, size, size); res(c.toDataURL("image/jpeg", 0.8)); };
    i.onerror = () => res("");
    i.src = dataUrl;
  });
}
export async function photoFromFile(file) { return shrink(await squareAvatar(file, 256), 120); }


/* ---------- hash function: Username ----------
   SHA-256 of the account id -> first 40 bits -> 8 characters (Crockford base32), shown as a username: @k7f3m9q2.
   Nobody can guess another student's username from their name, and it cannot be faked: a profile found by username is
   accepted only if sha256(its owner id) gives the same code (checked in findByCode).
   The value is still stored in profiles/{uid}.code (upper case), so old profiles and old links keep working. */
export function sha256(msg) {
  const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  const bytes = Array.from(new TextEncoder().encode(msg)), len = bytes.length;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const bits = len * 8;
  for (let i = 7; i >= 0; i--) bytes.push(i > 3 ? 0 : (bits >>> (i * 8)) & 0xff);
  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const rr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let o = 0; o < bytes.length; o += 64) {
    const w = new Array(64);
    for (let i = 0; i < 16; i++) w[i] = (bytes[o + i * 4] << 24) | (bytes[o + i * 4 + 1] << 16) | (bytes[o + i * 4 + 2] << 8) | bytes[o + i * 4 + 3];
    for (let i = 16; i < 64; i++) {
      const s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25), ch = (e & f) ^ (~e & g), t1 = (h + S1 + ch + K[i] + w[i]) | 0;
      const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22), mj = (a & b) ^ (a & c) ^ (b & c), t2 = (S0 + mj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    [a, b, c, d, e, f, g, h].forEach((v, i) => { H[i] = (H[i] + v) | 0; });
  }
  return H.map(v => (v >>> 0).toString(16).padStart(8, "0")).join("");
}
const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export function studentCode(uid) {
  const hex = sha256("gyaan-hub:" + uid);
  let n = 0n;
  for (let i = 0; i < 10; i += 2) n = (n << 8n) | BigInt(parseInt(hex.slice(i, i + 2), 16));   // first 5 bytes = 40 bits
  let out = "";
  for (let i = 0; i < 8; i++) { out = B32[Number(n & 31n)] + out; n >>= 5n; }
  return out;
}
export const fmtCode = c => "@" + String(c || "").toLowerCase();      // 7K3M9Q2X -> @7k3m9q2x
export const userName = uid => fmtCode(studentCode(uid));
export function normCode(q) {
  let c = String(q || "").toUpperCase().replace(/[^0-9A-Z]/g, "").replace(/O/g, "0").replace(/[IL]/g, "1");
  if (c.length === 10 && c.startsWith("GH")) c = c.slice(2);
  return c;
}
export const looksLikeCode = q => /^[0-9A-Za-z]{4}[-\s]?[0-9A-Za-z]{4}$/.test(String(q).trim().replace(/^@/, "").replace(/^gh[-\s]?/i, ""));
export const profileLink = code => new URL("profile.html?c=" + code, location.href).href;
export async function findByCode(q) {
  const raw = String(q || "").trim().replace(/^@/, "").toLowerCase();
  const out = new Map();
  if (UNAME_RE.test(raw)) {                                  // custom username (exact match)
    try { (await A.fsWhere("profiles", [["username", "==", raw]])).forEach(r => out.set(r.id, r)); } catch (e) {}
  }
  const code = normCode(q);
  if (code.length === 8) {                                   // original hashed username (old links keep working)
    const rows = await A.fsWhere("profiles", [["code", "==", code]]);
    rows.filter(r => studentCode(r.id) === code).forEach(r => out.set(r.id, r));
  }
  return [...out.values()];
}

/* ---------- editable username: max 5 changes in any 14 days ---------- */
export const UNAME_RE = /^[a-z0-9_.]{3,20}$/;
export const UNAME_MAX = 5, UNAME_DAYS = 14;
const DAY_MS = 86400000;
export const handleOf = p => "@" + String((p && p.username) || (p && p.code) || "").toLowerCase();
export const unameLeft = p => {                              // { left, nextAt } from the change log in my profile
  const now = Date.now(), log = ((p && p.unameLog) || []).map(Number).filter(t => now - t < UNAME_DAYS * DAY_MS).sort((a, b) => a - b);
  return { left: Math.max(0, UNAME_MAX - log.length), log, nextAt: log.length >= UNAME_MAX ? log[0] + UNAME_DAYS * DAY_MS : 0 };
};
export async function changeUsername(user, wanted) {
  const name = String(wanted || "").trim().replace(/^@/, "").toLowerCase();
  if (!UNAME_RE.test(name)) throw new Error("Username must be 3-20 characters: letters, numbers, dot or underscore.");
  if (looksLikeCode(name) && name !== String((await getProfile(user.uid, true) || {}).username || "")) throw new Error("This username is reserved. Please choose another one.");
  const p = await getProfile(user.uid, true);
  if (!p) throw new Error("Profile not found.");
  if (p.username === name) throw new Error("This is already your username.");
  const { left, nextAt, log } = unameLeft(p);
  if (!left) throw new Error("You can change your username only " + UNAME_MAX + " times in " + UNAME_DAYS + " days. Try again on " + new Date(nextAt).toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) + ".");
  const taken = await A.fsGetPath(["usernames", name]).catch(() => null);
  if (taken && taken.uid !== user.uid) throw new Error("@" + name + " is already taken.");
  try { await A.fsSetPath(["usernames", name], { uid: user.uid }, false); }          // create-only: the rules reject it if someone claimed it first
  catch (e) { if (e && e.code === "permission-denied") throw new Error("@" + name + " is already taken."); throw e; }
  const unameLog = [...log, Date.now()].slice(-UNAME_MAX);
  try { await A.fsSetPath(["profiles", user.uid], { username: name, unameLog }); }
  catch (e) { try { await A.fsDeletePath(["usernames", name]); } catch (e2) {} throw e; }
  if (p.username) { try { await A.fsDeletePath(["usernames", p.username]); } catch (e) {} }   // free the old name
  PC[user.uid] = { ...p, username: name, unameLog };
  return PC[user.uid];
}

/* ---------- profiles ---------- */
// profiles/{uid}      : PUBLIC card (name, avatar, isPrivate, hideRank, dm)
// profileStats/{uid}  : bio, course, tests, points, streak ... (hidden from strangers when the profile is private)
const PC = {};
export async function getProfile(uid, fresh = false) {
  if (!fresh && PC[uid]) return PC[uid];
  const p = await A.fsGetPath(["profiles", uid]);
  if (p) PC[uid] = p;
  return p;
}
export async function getStats(uid) { try { return await A.fsGetPath(["profileStats", uid]); } catch (e) { return null; } }

export async function ensureMyProfile(user) {
  let p = null;
  try { p = await getProfile(user.uid, true); } catch (e) { throw e; }
  if (p) {
    if (p.code !== studentCode(user.uid)) { p.code = studentCode(user.uid); try { await A.fsSetPath(["profiles", user.uid], { code: p.code }); } catch (e) {} }   // older profiles get a username
    return { profile: p, created: false };
  }
  const ud = (await A.getUserDoc(user.uid)) || {};
  const name = String(user.displayName || ud.name || (user.email || "student").split("@")[0]).trim().slice(0, 40) || "Student";
  let avatar = "";
  if (ud.avatar && SAFE_IMG.test(ud.avatar)) avatar = await shrink(ud.avatar, 120);   // reuse the photo from Settings
  const prof = { name, nameLc: name.toLowerCase(), avatar, isPrivate: false, hideRank: false, dm: "followers", code: studentCode(user.uid) };
  await A.fsSetPath(["profiles", user.uid], prof, false);
  PC[user.uid] = { id: user.uid, ...prof };
  await syncMyStats(user, PC[user.uid], { bio: "", course: "" });
  return { profile: PC[user.uid], created: true };
}

const dayKey = d => d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
// Recomputes my numbers from my own test results and publishes them (called on community pages and after each test)
export async function syncMyStats(user, prof, extra = {}) {
  if (A.isDemo()) return null;
  const p = prof || await getProfile(user.uid, true);
  if (!p) return null;
  const [scores, results] = await Promise.all([A.fsQuery("scores", "uid", user.uid).catch(() => []), A.fsQuery("results", "uid", user.uid).catch(() => [])]);
  const tests = scores.length;
  const points = Math.round(scores.reduce((s, x) => s + (+x.percent || 0), 0));
  const avgPercent = tests ? Math.round(points / tests) : 0;
  const bestPercent = Math.round(scores.reduce((m, x) => Math.max(m, +x.percent || 0), 0));
  const days = new Set(results.map(r => A.toMs(r.createdAt)).filter(Boolean).map(ms => dayKey(new Date(ms))));
  let streak = 0; const d = new Date(); d.setHours(0, 0, 0, 0);
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while (days.has(dayKey(d))) { streak++; d.setDate(d.getDate() - 1); }
  const stats = {
    uid: user.uid, name: p.name, avatar: p.avatar || "", tests, points, avgPercent, bestPercent, streak,
    shown: !p.isPrivate,                       // profile details visible to everyone
    visible: !p.isPrivate && !p.hideRank,      // appears on the public leaderboard
    ...extra
  };
  if (extra.bio !== undefined) stats.bio = String(extra.bio).slice(0, 160);
  await A.fsSetPath(["profileStats", user.uid], stats);
  return { ...stats };
}

export async function saveMyProfile(user, d) {
  const prev = await getProfile(user.uid, true);
  const prof = { name: d.name, nameLc: d.name.toLowerCase(), avatar: d.avatar || "", isPrivate: !!d.isPrivate, hideRank: !!d.hideRank, dm: d.dm || "followers", code: studentCode(user.uid) };
  await A.fsSetPath(["profiles", user.uid], prof);
  PC[user.uid] = { id: user.uid, ...prev, ...prof };
  try { await A.setDisplayName(d.name); await A.saveUserDoc({ name: d.name }); localStorage.setItem("gyaan_name_" + user.uid, d.name); } catch (e) {}
  const stats = await syncMyStats(user, PC[user.uid], { bio: d.bio || "", course: d.course || "" });
  if (!prev || !!prev.isPrivate !== prof.isPrivate) await syncFollowPrivacy(user.uid, prof.isPrivate);
  return stats;
}
async function syncFollowPrivacy(uid, priv) {
  try {
    for (const f of await A.fsQuery("follows", "follower", uid)) if (f.followerPrivate !== priv) await A.fsSetPath(["follows", f.id], { followerPrivate: priv });
    for (const f of await A.fsQuery("follows", "target", uid)) if (f.targetPrivate !== priv) await A.fsSetPath(["follows", f.id], { targetPrivate: priv });
  } catch (e) {}
}
// Search by name (public profiles only) or by exact username (finds private profiles too, so a request can be sent).
export async function searchStudents(q) {
  q = String(q || "").trim();
  if (q.length < 2) return [];
  const out = new Map();
  const tasks = [];
  if (looksLikeCode(q) || UNAME_RE.test(q.replace(/^@/, "").toLowerCase())) tasks.push(findByCode(q).then(r => r.forEach(p => out.set(p.id, { ...p, byId: true }))).catch(() => {}));
  const lc = q.toLowerCase();
  const ulc = lc.replace(/^@/, "");
  if (UNAME_RE.test(ulc)) tasks.push(A.fsWhere("profiles", [["username", ">=", ulc], ["username", "<=", ulc + "\uf8ff"]]).then(r => r.filter(p => !p.isPrivate).forEach(p => { out.set(p.id, { ...p, byId: true }); })).catch(() => {}));
  tasks.push(A.fsWhere("profiles", [["nameLc", ">=", lc], ["nameLc", "<=", lc + "\uf8ff"]]).then(r => r.filter(p => !p.isPrivate).forEach(p => { if (!out.has(p.id)) out.set(p.id, p); })));
  await Promise.all(tasks);
  return [...out.values()];
}
export async function recentTests(uid, n = 12) {
  const rows = await A.fsQuery("results", "uid", uid);
  return rows.sort((a, b) => A.toMs(b.createdAt) - A.toMs(a.createdAt)).slice(0, n);
}

/* ---------- rank / leaderboard ---------- */
const better = (a, b) => a.points !== b.points ? a.points > b.points : (a.avgPercent || 0) > (b.avgPercent || 0);
export async function getLeaderboard() {
  const rows = await A.fsWhere("profileStats", [["visible", "==", true], ["shown", "==", true]]);
  return rows.filter(r => r.tests > 0).sort((a, b) => b.points - a.points || (b.avgPercent || 0) - (a.avgPercent || 0) || String(a.name).localeCompare(String(b.name)));
}
export const sameCourse = (a, b) => !!a && !!b && String(a).toLowerCase() === String(b).toLowerCase();
export function rankFor(rows, stats, course) {
  if (!stats || !stats.tests) return null;
  const list = course ? rows.filter(r => sameCourse(r.course, course)) : rows;
  return 1 + list.filter(r => r.uid !== stats.uid && better(r, stats)).length;
}
export function celebrateRank(uid, rank) {
  if (!rank) return;
  const k = "gyaan_lastrank_" + uid;
  let prev = null; try { prev = +localStorage.getItem(k) || null; localStorage.setItem(k, String(rank)); } catch (e) {}
  if (prev && rank < prev) toast("🎉 Congratulations! Your rank improved from #" + prev + " to #" + rank + ".");
}
export function badgesFor(s, rank) {
  const b = [];
  if (!s) return b;
  if (s.tests >= 1) b.push("🧪 First test done");
  if (s.tests >= 5) b.push("📚 5+ tests");
  if (s.bestPercent >= 90) b.push("🎯 90%+ score");
  if (s.streak >= 3) b.push("🔥 " + s.streak + "-day streak");
  if (rank && rank <= 10) b.push("🏅 Top 10");
  return b;
}

/* ---------- follow ---------- */
export const followId = (a, b) => a + "_" + b;
export async function getRelation(me, other) { try { return await A.fsGetPath(["follows", followId(me, other)]); } catch (e) { return null; } }
export async function follow(me, myProf, other, otherProf) {
  const priv = !!otherProf.isPrivate;
  await A.fsSetPath(["follows", followId(me, other)], { follower: me, target: other, status: priv ? "pending" : "accepted", targetPrivate: priv, followerPrivate: !!myProf.isPrivate }, false);
  return priv ? "pending" : "accepted";
}
export const unfollow = (me, other) => A.fsDeletePath(["follows", followId(me, other)]);
export const acceptRequest = (me, follower) => A.fsSetPath(["follows", followId(follower, me)], { status: "accepted" });
export const declineRequest = (me, follower) => A.fsDeletePath(["follows", followId(follower, me)]);

// Lists. Public lists show only people whose profiles are public; private profiles are visible to the owner and accepted followers.
export async function listFollowers(uid, isMe, prof, viewerAccepted) {
  if (isMe) return A.fsWhere("follows", [["target", "==", uid]]);
  if (prof.isPrivate) return viewerAccepted ? A.fsWhere("follows", [["target", "==", uid], ["status", "==", "accepted"]]) : null;
  return A.fsWhere("follows", [["target", "==", uid], ["status", "==", "accepted"], ["targetPrivate", "==", false], ["followerPrivate", "==", false]]);
}
export async function listFollowing(uid, isMe, prof, viewerAccepted) {
  if (isMe) return A.fsWhere("follows", [["follower", "==", uid]]);
  if (prof.isPrivate && !viewerAccepted) return null;
  const c = [["follower", "==", uid], ["status", "==", "accepted"], ["targetPrivate", "==", false]];
  if (!prof.isPrivate) c.push(["followerPrivate", "==", false]);
  return A.fsWhere("follows", c);
}
export async function profilesOf(uids, max = 100) {
  const out = await Promise.all(uids.slice(0, max).map(u => getProfile(u).catch(() => null)));
  return out.map((p, i) => p || { id: uids[i], name: "Student" });
}

/* ---------- block / report ---------- */
export async function isBlocked(me, other) { try { return !!(await A.fsGetPath(["blocks", followId(me, other)])); } catch (e) { return false; } }
export async function blockUser(me, other) {
  await A.fsSetPath(["blocks", followId(me, other)], { blocker: me, blocked: other }, false);
  try { await A.fsDeletePath(["follows", followId(other, me)]); } catch (e) {}   // they stop following me
}
export const unblockUser = (me, other) => A.fsDeletePath(["blocks", followId(me, other)]);
export async function reportUser(me, myName, other, otherName, reason, details, evidence) {
  await A.fsSave("communityReports", null, { reporter: me, reporterName: myName || "", reported: other, reportedName: otherName || "", reason, details: String(details || "").slice(0, 500), evidence: evidence || [], status: "open" });
}

/* ---------- messages ---------- */
export const chatId = (a, b) => (a < b ? a + "_" + b : b + "_" + a);
export async function canMessage(me, them, theirProf, theirFollowRow) {
  const dm = (theirProf && theirProf.dm) || "followers";
  if (dm === "all") return { ok: true };
  if (dm === "none") return { ok: false, why: "This student does not accept messages." };
  const f = theirFollowRow !== undefined ? theirFollowRow : await getRelation(them, me);   // does THEY follow ME? (row can be passed in when already loaded)
  return f && f.status === "accepted" ? { ok: true } : { ok: false, why: "This student only accepts messages from people they follow." };
}
export async function listChats(me) {
  const rows = await A.fsWhere("chats", [["participants", "array-contains", me]]);
  return rows.filter(c => c.lastTs > 0).sort((a, b) => b.lastTs - a.lastTs);
}
export const otherOf = (chat, me) => chat.participants.find(u => u !== me);
export const isUnread = (chat, me) => chat.lastFrom && chat.lastFrom !== me && chat.lastTs > (chat["seen_" + me] || 0);
export async function unreadCount(me) { try { return (await listChats(me)).filter(c => isUnread(c, me)).length; } catch (e) { return 0; } }
export async function chatExists(cid) { try { return !!(await A.fsGetPath(["chats", cid])); } catch (e) { return false; } }
export const markSeen = (cid, me) => A.fsSetPath(["chats", cid], { ["seen_" + me]: Date.now() }).catch(() => {});
export async function ensureChat(me, other) {
  const cid = chatId(me, other), parts = [me, other].sort();
  if (!(await chatExists(cid))) await A.fsSetPath(["chats", cid], { participants: parts, lastTs: 0 }, false);
  return cid;
}
// text and/or one attachment (att comes from F.uploadFile)
export async function sendMessage(me, other, text, att) {
  const cid = chatId(me, other);
  text = String(text || "").trim().slice(0, 1000);
  if (!text && !att) return cid;
  await ensureChat(me, other);
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8), now = Date.now();
  const msg = { from: me, to: other, text, ts: now };
  if (att) msg.att = att;
  await A.fsSetPath(["chats", cid, "messages", id], msg, false);
  await A.fsSetPath(["chats", cid], { lastText: (text || F.attLabel(att)).slice(0, 80), lastFrom: me, lastTs: now, ["seen_" + me]: now });
  return cid;
}
// Edit my own message (text / caption only)
export async function editMessage(cid, m, newText, isLast) {
  newText = String(newText || "").trim().slice(0, 1000);
  if (!newText && !m.att) throw new Error("A message cannot be empty.");
  await A.fsSetPath(["chats", cid, "messages", m.id], { text: newText, edited: true, editedAt: Date.now() });
  if (isLast) await A.fsSetPath(["chats", cid], { lastText: (newText || F.attLabel(m.att)).slice(0, 80) }).catch(() => {});
  return newText;
}
// Unsend my own message: the text and the attached file are removed for both people
export async function unsendMessage(cid, m, isLast) {
  await A.fsSetPath(["chats", cid, "messages", m.id], { deleted: true, text: "", att: null, edited: false });
  if (m.att) F.deleteFile(m.att, { type: "chat", cid });
  if (isLast) await A.fsSetPath(["chats", cid], { lastText: "Message unsent" }).catch(() => {});
}

/* ---------- posts & reels ---------- */
// posts/{id}: { uid, kind: "post" | "reel", caption, media: attachment | null, ts, edited? }   likes: posts/{id}/likes/{uid}
export async function createPost(me, { kind, caption, file }, onProgress) {
  caption = String(caption || "").trim().slice(0, 500);
  if (!file && !caption) throw new Error("Add a photo, a video or some text.");
  const media = file ? await F.uploadFile(file, { type: "post", uid: me.uid }, onProgress) : null;
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  await A.fsSetPath(["posts", id], { uid: me.uid, kind, caption, media, ts: Date.now() }, false);
  return id;
}
export async function listPosts(uid, kind) {
  const rows = await A.fsWhere("posts", [["uid", "==", uid]]);
  return rows.filter(p => !kind || p.kind === kind).sort((a, b) => (b.ts || 0) - (a.ts || 0));
}
export async function feedPosts(uids, perUser = 6, max = 30) {
  const lists = await Promise.all(uids.slice(0, 15).map(u => listPosts(u).then(r => r.slice(0, perUser)).catch(() => [])));
  return lists.flat().sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, max);
}
export const editPost = (id, caption) => A.fsSetPath(["posts", id], { caption: String(caption || "").trim().slice(0, 500), edited: true, editedAt: Date.now() });
export async function deletePost(p) {
  await A.fsDeletePath(["posts", p.id]);
  if (p.repostOf) { try { await A.fsDeletePath(["posts", p.repostOf, "reposts", p.uid]); } catch (e) {} return; }   // a repost shares the original file: never delete it
  if (p.media) F.deleteFile(p.media, { type: "post" });
}
export async function likesOf(id) { try { return (await A.fsListPath(["posts", id, "likes"])).map(x => x.id); } catch (e) { return []; } }
export const likePost = (id, me) => A.fsSetPath(["posts", id, "likes", me], { uid: me });
export const unlikePost = (id, me) => A.fsDeletePath(["posts", id, "likes", me]);


/* ---------- comments, reposts, saved (reel viewer) ---------- */
// posts/{id}/comments/{cid}: { uid, text, ts }    posts/{id}/reposts/{uid}    users/{me}/saved/{postId}
// A repost is a copy of the post document under my account (id rp_<originalId>_<myUid>) with repostOf set; it shares the original media.
export async function commentsOf(id) { try { return (await A.fsListPath(["posts", id, "comments"])).sort((a, b) => (a.ts || 0) - (b.ts || 0)); } catch (e) { return []; } }
export async function addComment(id, me, text) {
  text = String(text || "").trim().slice(0, 300);
  if (!text) throw new Error("Write a comment first.");
  const cid = Date.now().toString(36) + Math.random().toString(36).slice(2, 6), c = { uid: me, text, ts: Date.now() };
  await A.fsSetPath(["posts", id, "comments", cid], c, false);
  return { id: cid, ...c };
}
export const deleteComment = (id, cid) => A.fsDeletePath(["posts", id, "comments", cid]);
export async function repostsOf(id) { try { return (await A.fsListPath(["posts", id, "reposts"])).map(x => x.id); } catch (e) { return []; } }
export const repostId = (p, me) => "rp_" + (p.repostOf || p.id) + "_" + me;
export async function repost(me, p) {
  const oid = p.repostOf || p.id;
  await A.fsSetPath(["posts", oid, "reposts", me], { uid: me });
  try { await A.fsSetPath(["posts", repostId(p, me)], { uid: me, kind: p.kind, caption: p.caption || "", media: p.media || null, repostOf: oid, ts: Date.now() }, false); }
  catch (e) { if (!(e && e.code === "permission-denied")) throw e; }      // already reposted
}
export async function unrepost(me, p) {
  const oid = p.repostOf || p.id;
  await A.fsDeletePath(["posts", repostId(p, me)]).catch(() => {});
  await A.fsDeletePath(["posts", oid, "reposts", me]);
}
export async function savedIds(me) { try { return new Set((await A.fsListPath(["users", me, "saved"])).map(x => x.id)); } catch (e) { return new Set(); } }
export const savePost = (me, id) => A.fsSetPath(["users", me, "saved", id], { ts: Date.now() });
export const unsavePost = (me, id) => A.fsDeletePath(["users", me, "saved", id]);
