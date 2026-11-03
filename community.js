// Gyaan Hub - Student Community (profiles, follow, rank, messages, block / report)
// Uses the SAME Firebase project and helpers as the rest of the site (auth.js). No new keys, no new services.
import * as A from "./auth.js?v=9";
import { squareAvatar } from "./media.js?v=9";

export { A, squareAvatar };
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const PRESETS = ["🦊", "🐼", "🦁", "🐯", "🐨", "🐸", "🦉", "🐧", "🚀", "⭐", "🎯", "🧠"];
export const COURSES = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "NEET", "JEE", "UPSC", "Other"];
const SAFE_IMG = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

/* ---------- small UI helpers ---------- */
export function avatarHtml(p, cls = "") {
  const a = (p && p.avatar) || "";
  if (SAFE_IMG.test(a)) return `<img class="avatar ${cls}" src="${a}" alt="">`;
  if (a.startsWith("preset:")) return `<span class="avatar emoji ${cls}">${esc(a.slice(7))}</span>`;
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
  if (p) return { profile: p, created: false };
  const ud = (await A.getUserDoc(user.uid)) || {};
  const name = String(user.displayName || ud.name || (user.email || "student").split("@")[0]).trim().slice(0, 40) || "Student";
  let avatar = "";
  if (ud.avatar && SAFE_IMG.test(ud.avatar)) avatar = await shrink(ud.avatar, 120);   // reuse the photo from Settings
  const prof = { name, nameLc: name.toLowerCase(), avatar, isPrivate: false, hideRank: false, dm: "followers" };
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
  const prof = { name: d.name, nameLc: d.name.toLowerCase(), avatar: d.avatar || "", isPrivate: !!d.isPrivate, hideRank: !!d.hideRank, dm: d.dm || "followers" };
  await A.fsSetPath(["profiles", user.uid], prof);
  PC[user.uid] = { id: user.uid, ...prof };
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
export async function searchStudents(q) {
  q = q.trim().toLowerCase();
  if (q.length < 2) return [];
  return A.fsWhere("profiles", [["nameLc", ">=", q], ["nameLc", "<=", q + "\uf8ff"]]);
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
export async function canMessage(me, them, theirProf) {
  const dm = (theirProf && theirProf.dm) || "followers";
  if (dm === "all") return { ok: true };
  if (dm === "none") return { ok: false, why: "This student does not accept messages." };
  const f = await getRelation(them, me);   // does THEY follow ME?
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
export async function sendMessage(me, other, text) {
  const cid = chatId(me, other), parts = [me, other].sort();
  text = String(text).trim().slice(0, 1000);
  if (!text) return cid;
  if (!(await chatExists(cid))) await A.fsSetPath(["chats", cid], { participants: parts, lastTs: 0 }, false);
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8), now = Date.now();
  await A.fsSetPath(["chats", cid, "messages", id], { from: me, to: other, text, ts: now }, false);
  await A.fsSetPath(["chats", cid], { lastText: text.slice(0, 80), lastFrom: me, lastTs: now, ["seen_" + me]: now });
  return cid;
}
