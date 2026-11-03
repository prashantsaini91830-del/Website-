// Gyaan Hub - Firebase Auth (browser ES modules via CDN, no bundler needed)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, updateProfile,
  EmailAuthProvider, reauthenticateWithCredential, reauthenticateWithPopup,
  updatePassword, verifyBeforeUpdateEmail, deleteUser
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, collection, collectionGroup, doc, getDoc, getDocs, setDoc, addDoc, deleteDoc, updateDoc, onSnapshot,
  query, where, orderBy, limit, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyABw8eTGABOvIyBZ8O0-Onz9VwVUGU8JLw",
  authDomain: "prashant-saini-b7ff4.firebaseapp.com",
  projectId: "prashant-saini-b7ff4",
  storageBucket: "prashant-saini-b7ff4.firebasestorage.app",
  messagingSenderId: "810292668776",
  appId: "1:810292668776:web:447a0998183b669bdacedd",
  measurementId: "G-7TRVX3DTV7"
};

const DEMO = firebaseConfig.apiKey.startsWith("YOUR_");
let app, auth, dbMain, dbAlt;
if (!DEMO) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  dbMain = getFirestore(app);
  dbAlt = getFirestore(app, "default");   // fallback if the database was created with the ID "default"
  // Analytics only works over http(s), not file://
  // Analytics starts only after the visitor has given consent
  let analyticsStarted = false;
  const startAnalytics = () => {
    let c = null;
    try { c = JSON.parse(localStorage.getItem("gyaan_consent") || "null"); } catch (e) {}
    if (analyticsStarted || !c || !c.analytics) return;
    analyticsStarted = true;
    import("https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js")
      .then(m => m.isSupported().then(ok => { if (ok) m.getAnalytics(app); }))
      .catch(() => {});
  };
  startAnalytics();
  window.addEventListener("consent-changed", startAnalytics);
}

window.__authReady = true;
const DEMO_KEY = "gyaan_demo_user";

function showMsg(text, type = "err") {
  const el = document.getElementById("msg");
  if (!el) return;
  el.className = "msg " + type;
  el.textContent = text;
}

export function friendly(err) {
  const map = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/missing-password": "Please enter your password.",
    "auth/weak-password": "Your password must be at least 6 characters long.",
    "auth/email-already-in-use": "This email is already registered. Please sign in instead.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/user-not-found": "No account was found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/too-many-requests": "Too many attempts. Please try again in a few minutes.",
    "auth/popup-closed-by-user": "The Google sign-in popup was closed before finishing.",
    "auth/operation-not-allowed": "This sign-in method is not enabled. Enable it in Firebase Console > Authentication > Sign-in method.",
    "auth/unauthorized-domain": "This domain is not authorized. Add it in Firebase Console > Authentication > Settings > Authorized domains.",
    "auth/network-request-failed": "Network error. Please check your internet connection.",
    "auth/requires-recent-login": "For security, please sign in again and retry.",
    "auth/popup-blocked": "Your browser blocked the Google popup. Allow popups for this site and try again.",
    "auth/cancelled-popup-request": "The Google sign-in popup was cancelled.",
    "auth/email-change-needs-verification": "Please verify the new email address first.",
    "auth/invalid-new-email": "Please enter a valid new email address.",
    "auth/user-mismatch": "That Google account does not match the account you are signed in with.",
    "permission-denied": "Permission denied. Publish the updated Firestore rules from the README, then try again."
  };
  return map[err.code] || err.message || "Something went wrong. Please try again.";
}

function demoLogin(email) {
  localStorage.setItem(DEMO_KEY, JSON.stringify({ email, displayName: email.split("@")[0] }));
  location.href = "dashboard.html";
}

function wireForm(handler) {
  const form = document.getElementById("form");
  const btn = form.querySelector("button[type=submit]");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const email = form.email.value.trim(), password = form.password.value;
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = "Please wait...";
    try { await handler(email, password); }
    catch (err) { showMsg(friendly(err)); btn.disabled = false; btn.textContent = label; }
  });
  document.getElementById("google").addEventListener("click", async () => {
    try {
      if (DEMO) return demoLogin("demo.google@example.com");
      await signInWithPopup(auth, new GoogleAuthProvider());
      location.href = "dashboard.html";
    } catch (err) { showMsg(friendly(err)); }
  });
}

export function setupLogin() {
  if (!DEMO) onAuthStateChanged(auth, u => { if (u) location.href = "dashboard.html"; });
  const reset = document.getElementById("reset");
  if (reset) reset.addEventListener("click", async e => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    if (!email) return showMsg("Enter your email address above, then click \"Forgot password?\".");
    if (DEMO) return showMsg("Password reset is unavailable in demo mode.", "ok");
    try {
      await sendPasswordResetEmail(auth, email);
      showMsg("Password reset link sent. Check your inbox (and spam folder).", "ok");
    } catch (err) { showMsg(friendly(err)); }
  });
  wireForm(async (email, password) => {
    if (DEMO) return demoLogin(email);
    await signInWithEmailAndPassword(auth, email, password);
    location.href = "dashboard.html";
  });
}

export function setupSignup() {
  if (!DEMO) onAuthStateChanged(auth, u => { if (u) location.href = "dashboard.html"; });
  wireForm(async (email, password) => {
    if (DEMO) return demoLogin(email);
    const name = (document.getElementById("name")?.value || "").trim();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) { try { await updateProfile(cred.user, { displayName: name }); } catch (e) {} }
    location.href = "verify.html";
  });
}

// An account counts as verified if it signed in with Google, has a verified
// Firebase email, or finished the OTP check on this device (see verify.html).
export function isVerified(user) {
  if (DEMO) return true;
  if (!user) return false;
  if (user.emailVerified) return true;
  if ((user.providerData || []).some(p => p.providerId === "google.com")) return true;
  try { return localStorage.getItem("gyaan_verified_" + user.uid) === "1"; } catch (e) { return false; }
}

export function markVerified(user) {
  try { localStorage.setItem("gyaan_verified_" + user.uid, "1"); } catch (e) {}
}

export function protectPage(cb, opts = {}) {
  const requireVerified = opts.requireVerified !== false;
  if (DEMO) {
    const u = JSON.parse(localStorage.getItem(DEMO_KEY) || "null");
    if (!u) { location.href = "login.html"; return; }
    cb(u, true);
    return;
  }
  onAuthStateChanged(auth, user => {
    if (!user) { location.href = "login.html" + (signOutReason ? "?reason=" + signOutReason : ""); return; }
    if (requireVerified && !isVerified(user)) { location.href = "verify.html"; return; }
    bootPromise = bootSession(user);
    cb(user, false);
  });
}

export async function setDisplayName(name) {
  if (DEMO || !auth.currentUser) return;
  await updateProfile(auth.currentUser, { displayName: name });
}

export function onUser(cb) {
  if (DEMO) { cb(JSON.parse(localStorage.getItem(DEMO_KEY) || "null")); return; }
  onAuthStateChanged(auth, cb);
}

export async function logout() {
  try {
    const u = !DEMO && auth && auth.currentUser;
    if (u) {
      stopWatching();
      try { localStorage.removeItem(REG_KEY(u.uid)); } catch (e) {}
      await withTimeout(fsDeletePath(["users", u.uid, "devices", deviceId()]), 3000).catch(() => {});
    }
  } catch (e) {}
  try { Object.keys(localStorage).filter(k => k.startsWith("gyaan_cache_")).forEach(k => localStorage.removeItem(k)); } catch (e) {}
  if (DEMO) localStorage.removeItem(DEMO_KEY);
  else await signOut(auth);
  location.href = "login.html";
}

// ---------- Firestore helpers (admin panel, tests, materials) ----------
// Every call has an 8 second limit so a page never stays blank. If the "(default)"
// database cannot be reached, the same call is retried on a database named "default".
const PREF_KEY = "gyaan_db";
let pref = null;
try { pref = localStorage.getItem(PREF_KEY); } catch (e) {}
const setPref = p => { pref = p; try { localStorage.setItem(PREF_KEY, p); } catch (e) {} };
const withTimeout = (p, ms = 8000) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej({ code: "timeout" }), ms))]);
const RETRY = ["not-found", "unavailable", "timeout", "failed-precondition"];

// Remembers which database answers (the "(default)" one or one named "default"),
// so a page refresh does not wait for the wrong one again.
async function run(fn, isWrite = false) {
  if (DEMO) throw { code: "demo" };
  const dbs = { main: dbMain, alt: dbAlt };
  if (!pref && !isWrite) {
    // first visit on this device: ask both at once, the first real answer wins
    const attempts = ["main", "alt"].map(k => withTimeout(fn(dbs[k])).then(r => { setPref(k); return r; }));
    try { return await Promise.any(attempts); }
    catch (agg) { const errs = agg.errors || []; throw errs.find(e => e.code === "permission-denied") || errs[0] || agg; }
  }
  const first = pref || "main", second = first === "main" ? "alt" : "main";
  try { const r = await withTimeout(fn(dbs[first])); setPref(first); return r; }
  catch (e) {
    if (!RETRY.includes(e.code)) throw e;
    try { const r = await withTimeout(fn(dbs[second])); setPref(second); return r; }
    catch (e2) { if (e2.code === "permission-denied") { setPref(second); throw e2; } throw e; }
  }
}

// Instant page loads: the last list is kept on this device and shown at once,
// then replaced by fresh data from Firestore.
export function cacheGet(name) {
  try { return JSON.parse(localStorage.getItem("gyaan_cache_" + name) || "null"); } catch (e) { return null; }
}
export async function fsListFresh(name) {
  const rows = await fsList(name);
  try { localStorage.setItem("gyaan_cache_" + name, JSON.stringify(rows)); } catch (e) {}
  return rows;
}

export async function checkAdmin(user) {
  if (DEMO || !user) return false;
  try { return (await run(d => getDoc(doc(d, "admins", user.uid)))).exists(); } catch (e) { return false; }
}

// Explains why admin access failed: "ok", "missing" or an error code
export async function adminDiag(user) {
  if (DEMO) return "demo";
  try { return (await run(d => getDoc(doc(d, "admins", user.uid)))).exists() ? "ok" : "missing"; }
  catch (e) { return e.code || e.message || "error"; }
}

export async function fsList(name) {
  if (DEMO) return [];
  const snap = await run(d => getDocs(collection(d, name)));
  return snap.docs.map(x => ({ id: x.id, ...x.data() }));
}

export async function fsRecent(name, n = 200) {
  if (DEMO) return [];
  const snap = await run(d => getDocs(query(collection(d, name), orderBy("createdAt", "desc"), limit(n))));
  return snap.docs.map(x => ({ id: x.id, ...x.data() }));
}

export async function fsSave(name, id, data) {
  if (DEMO) throw new Error("Not available in demo mode.");
  if (id) { await run(d => setDoc(doc(d, name, id), { ...data, updatedAt: serverTimestamp() }, { merge: true }), true); return id; }
  const ref = await run(d => addDoc(collection(d, name), { ...data, createdAt: serverTimestamp() }), true);
  return ref.id;
}

export async function fsDelete(name, id) {
  if (DEMO) throw new Error("Not available in demo mode.");
  await run(d => deleteDoc(doc(d, name, id)), true);
}

export async function fsGet(name, id) {
  if (DEMO) return null;
  const snap = await run(d => getDoc(doc(d, name, id)));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function fsSet(name, id, data) {
  if (DEMO) throw new Error("Not available in demo mode.");
  await run(d => setDoc(doc(d, name, id), { ...data, updatedAt: serverTimestamp() }), true);
}

export async function fsQuery(name, field, value) {
  if (DEMO) return [];
  const snap = await run(d => getDocs(query(collection(d, name), where(field, "==", value))));
  return snap.docs.map(x => ({ id: x.id, ...x.data() }));
}

// =====================================================================================
// Extra features: generic helpers, devices / remote logout, account tools, images, progress
// =====================================================================================
const getDb = () => (pref === "alt" ? dbAlt : dbMain);
export const currentUser = () => (DEMO || !auth ? null : auth.currentUser);
export const isDemo = () => DEMO;
export const toMs = v => !v ? 0 : v.toMillis ? v.toMillis() : (v.seconds !== undefined ? v.seconds * 1000 : (typeof v === "number" ? v : (Date.parse(v) || 0)));
const rid = () => (crypto.randomUUID ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, "0")).join(""));

// ---- generic Firestore path helpers (users/{uid}/devices/{id} etc.) ----
export async function fsGetPath(path) {
  if (DEMO) return null;
  const snap = await run(d => getDoc(doc(d, ...path)));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
export async function fsSetPath(path, data, merge = true) {
  if (DEMO) return;
  const payload = { ...data, updatedAt: serverTimestamp() };
  await run(d => merge ? setDoc(doc(d, ...path), payload, { merge: true }) : setDoc(doc(d, ...path), payload), true);
}
export async function fsUpdatePath(path, data) {     // fails if the document does not exist (used for heartbeats)
  if (DEMO) return;
  await run(d => updateDoc(doc(d, ...path), data), true);
}
export async function fsListPath(path) {
  if (DEMO) return [];
  const snap = await run(d => getDocs(collection(d, ...path)));
  return snap.docs.map(x => ({ id: x.id, ...x.data() }));
}
export async function fsDeletePath(path) {
  if (DEMO) return;
  await run(d => deleteDoc(doc(d, ...path)), true);
}
export async function fsGroup(name, n = 300) {       // collection-group query (admin: all devices)
  if (DEMO) return [];
  const snap = await run(d => getDocs(query(collectionGroup(d, name), limit(n))));
  return snap.docs.map(x => ({ id: x.id, path: x.ref.path, ...x.data() }));
}

// ---- device information ----
const DEV_KEY = "gyaan_device_id";
const REG_KEY = uid => "gyaan_devreg_" + uid;
export function deviceId() {
  let id = null;
  try { id = localStorage.getItem(DEV_KEY); } catch (e) {}
  if (!id) { id = rid(); try { localStorage.setItem(DEV_KEY, id); } catch (e) {} }
  return id;
}
export function deviceInfo() {
  const ua = navigator.userAgent || "";
  let os = "Unknown OS", m;
  if ((m = ua.match(/Windows NT ([\d.]+)/))) os = "Windows" + ({ "10.0": " 10/11", "6.3": " 8.1", "6.1": " 7" }[m[1]] || "");
  else if ((m = ua.match(/Android ([\d.]+)/))) os = "Android " + m[1].split(".")[0];
  else if (/iPhone|iPod/.test(ua)) os = "iOS";
  else if (/iPad/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) os = "iPadOS";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/CrOS/.test(ua)) os = "ChromeOS";
  else if (/Linux/.test(ua)) os = "Linux";
  let browser = "Browser";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
  else if (/SamsungBrowser/.test(ua)) browser = "Samsung Internet";
  else if (/Firefox\/|FxiOS/.test(ua)) browser = "Firefox";
  else if (/Chrome\/|CriOS/.test(ua)) browser = "Chrome";
  else if (/Safari\//.test(ua)) browser = "Safari";
  const tablet = /iPad|Tablet/.test(ua) || os === "iPadOS" || (/Android/.test(ua) && !/Mobi/.test(ua));
  const phone = !tablet && /Mobi|iPhone|iPod|Android/.test(ua);
  return { browser, os, type: tablet ? "Tablet" : phone ? "Phone" : "Computer" };
}
function maskIp(ip) {
  ip = String(ip || "");
  if (ip.includes(":")) return ip.split(":").slice(0, 2).join(":") + ":••••";
  const p = ip.split(".");
  return p.length === 4 ? p[0] + "." + p[1] + ".•.•" : "";
}
async function lookupLocation() {
  const C = window.SITE_CONFIG || {};
  if (C.locationLookup === false) return {};
  try { const c = JSON.parse(sessionStorage.getItem("gyaan_loc") || "null"); if (c) return c; } catch (e) {}
  try {
    const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 4000);
    const r = await fetch("https://ipapi.co/json/", { signal: ctl.signal });
    clearTimeout(tm);
    const j = await r.json();
    if (!r.ok || j.error) throw new Error("lookup failed");
    const loc = { city: j.city || "", region: j.region || "", country: j.country_name || "", ipMasked: maskIp(j.ip) };
    try { sessionStorage.setItem("gyaan_loc", JSON.stringify(loc)); } catch (e) {}
    return loc;
  } catch (e) { return {}; }
}

// ---- session watcher: registers this device, listens for "log out" from another device ----
let signOutReason = "";
let sessionBooted = false, unsubs = [], beat = null, bootPromise = null;
export const sessionReady = () => bootPromise || Promise.resolve();   // resolves once this device is registered
function stopWatching() {
  unsubs.forEach(u => { try { u(); } catch (e) {} });
  unsubs = [];
  clearInterval(beat);
}
function forceSignOut(reason) {
  if (!signOutReason) signOutReason = reason;
  const uid = auth.currentUser && auth.currentUser.uid;
  stopWatching();
  try { if (uid) localStorage.removeItem(REG_KEY(uid)); } catch (e) {}
  signOut(auth).catch(() => {}).finally(() => {
    try { Object.keys(localStorage).filter(k => k.startsWith("gyaan_cache_")).forEach(k => localStorage.removeItem(k)); } catch (e) {}
    location.href = "login.html?reason=" + reason;
  });
}
async function bootSession(user) {
  if (DEMO || sessionBooted) return;
  sessionBooted = true;
  const uid = user.uid, id = deviceId(), path = ["users", uid, "devices", id];
  const lastSign = Date.parse(user.metadata && user.metadata.lastSignInTime) || Date.now();
  let flagged = false;
  try { flagged = localStorage.getItem(REG_KEY(uid)) === "1"; } catch (e) {}
  try {
    // 1) "Log out from all devices" marker written from Settings
    const u = await fsGetPath(["users", uid]);
    if (u && toMs(u.sessionsValidFrom) > lastSign) return forceSignOut("revoked");
    // 2) this device's record
    const cur = await fsGetPath(path);
    if (!cur) {
      if (flagged) return forceSignOut("removed");           // it was removed from the device list on another device
      const loc = await lookupLocation();
      await fsSetPath(path, { ...deviceInfo(), ...loc, uid, email: user.email || "", name: user.displayName || "", loginAt: serverTimestamp(), lastActive: serverTimestamp() }, false);
      try { localStorage.setItem(REG_KEY(uid), "1"); } catch (e) {}
    } else {
      try { localStorage.setItem(REG_KEY(uid), "1"); } catch (e) {}
      if (Date.now() - toMs(cur.lastActive) > 5 * 60000) fsUpdatePath(path, { lastActive: serverTimestamp() }).catch(() => {});
    }
    fsSetPath(["users", uid], { email: user.email || "", name: user.displayName || "" }).catch(() => {});
    // 3) live watch (instant sign-out when you remove this device from another one)
    const db = getDb();
    unsubs.push(onSnapshot(doc(db, ...path), s => {
      if (s.metadata.fromCache) return;
      let reg = false; try { reg = localStorage.getItem(REG_KEY(uid)) === "1"; } catch (e) {}
      if (!s.exists() && reg) forceSignOut("removed");
    }, () => {}));
    unsubs.push(onSnapshot(doc(db, "users", uid), s => {
      if (s.metadata.fromCache || !s.exists()) return;
      if (toMs(s.data().sessionsValidFrom) > lastSign) forceSignOut("revoked");
    }, () => {}));
    beat = setInterval(() => { if (!document.hidden) fsUpdatePath(path, { lastActive: serverTimestamp() }).catch(() => {}); }, 5 * 60000);
  } catch (e) { /* offline, or the new Firestore rules are not published yet: the site keeps working */ }
}

export async function listDevices(uid) { return (await fsListPath(["users", uid, "devices"])).sort((a, b) => toMs(b.lastActive) - toMs(a.lastActive)); }
export async function removeDevice(uid, id) { await fsDeletePath(["users", uid, "devices", id]); }
export async function logoutOthers(uid) {
  const me = deviceId();
  for (const d of await fsListPath(["users", uid, "devices"])) if (d.id !== me) await fsDeletePath(["users", uid, "devices", d.id]);
}
export async function logoutEverywhere(uid) {
  signOutReason = "all";
  try {
    await fsSetPath(["users", uid], { sessionsValidFrom: serverTimestamp() });   // every session that signed in before this moment is signed out
  } catch (e) { signOutReason = ""; throw e; }
  stopWatching();
  for (const d of await fsListPath(["users", uid, "devices"])) { try { await fsDeletePath(["users", uid, "devices", d.id]); } catch (e) {} }
  try { localStorage.removeItem(REG_KEY(uid)); } catch (e) {}
  await signOut(auth);
  try { Object.keys(localStorage).filter(k => k.startsWith("gyaan_cache_")).forEach(k => localStorage.removeItem(k)); } catch (e) {}
  location.href = "login.html?reason=all";
}

// ---- profile / preferences stored in users/{uid} ----
export async function getUserDoc(uid) { try { return await fsGetPath(["users", uid]); } catch (e) { return null; } }
export async function saveUserDoc(data) { const u = currentUser(); if (!u) return; await fsSetPath(["users", u.uid], data); }
export const savePrefsUp = prefs => saveUserDoc({ prefs });

// ---- password / email / delete ----
export const hasPassword = u => !!u && (u.providerData || []).some(p => p.providerId === "password");
export const isGoogleUser = u => !!u && (u.providerData || []).some(p => p.providerId === "google.com");
async function reauth(password) {
  const u = auth.currentUser;
  if (hasPassword(u)) {
    if (!password) throw { code: "auth/missing-password" };
    await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, password));
  } else {
    await reauthenticateWithPopup(u, new GoogleAuthProvider());
  }
}
export async function changePassword(current, next) { await reauth(current); await updatePassword(auth.currentUser, next); }
export async function changeEmail(current, newEmail) { await reauth(current); await verifyBeforeUpdateEmail(auth.currentUser, newEmail); }
export async function sendReset(email) { await sendPasswordResetEmail(auth, email); }

export async function deleteAccount(password) {
  const u = auth.currentUser, uid = u.uid;
  await reauth(password);
  stopWatching();                                         // so removing our own device record does not trigger a sign-out
  signOutReason = "deleted";
  const wipe = async name => { try { for (const r of await fsQuery(name, "uid", uid)) await fsDelete(name, r.id); } catch (e) {} };
  await wipe("results"); await wipe("scores");
  for (const sub of ["devices", "progress"]) { try { for (const d of await fsListPath(["users", uid, sub])) await fsDeletePath(["users", uid, sub, d.id]); } catch (e) {} }
  try { await fsDeletePath(["users", uid]); } catch (e) {}
  await deleteUser(u);
  try { Object.keys(localStorage).filter(k => k.includes(uid) || k.startsWith("gyaan_cache_") || k === "gyaan_prefs").forEach(k => localStorage.removeItem(k)); } catch (e) {}
}

export async function exportData(user) {
  const safe = async f => { try { return await f(); } catch (e) { return null; } };
  const uid = user.uid;
  const [profile, devices, progress, results, scores] = await Promise.all([
    safe(() => fsGetPath(["users", uid])), safe(() => fsListPath(["users", uid, "devices"])), safe(() => fsListPath(["users", uid, "progress"])),
    safe(() => fsQuery("results", "uid", uid)), safe(() => fsQuery("scores", "uid", uid))
  ]);
  if (profile && profile.avatar) profile.avatar = "(profile photo omitted from export)";
  return {
    exportedAt: new Date().toISOString(),
    account: { uid, email: user.email, displayName: user.displayName || "", providers: (user.providerData || []).map(p => p.providerId), created: user.metadata && user.metadata.creationTime, lastSignIn: user.metadata && user.metadata.lastSignInTime },
    profile, devices, learningProgress: progress, testResults: results, bestScores: scores
  };
}

// ---- images for test questions (stored compressed in Firestore collection "images") ----
const imgMem = {};
export async function saveImage(dataUrl) {
  const id = rid().replace(/-/g, "").slice(0, 20);
  await fsSetPath(["images", id], { data: dataUrl, by: (currentUser() || {}).uid || "" }, false);
  imgMem[id] = dataUrl;
  return id;
}
export async function getImage(id) {
  if (imgMem[id]) return imgMem[id];
  const d = await fsGetPath(["images", id]);
  imgMem[id] = d ? d.data : "";
  return imgMem[id];
}

// ---- learning progress (videos / PDFs): users/{uid}/progress/{key} ----
export async function saveProgress(key, data) { const u = currentUser(); if (u) await fsSetPath(["users", u.uid, "progress", key], data); }
export async function getProgress(key) { const u = currentUser(); return u ? fsGetPath(["users", u.uid, "progress", key]) : null; }
export async function listProgress() { const u = currentUser(); return u ? fsListPath(["users", u.uid, "progress"]) : []; }

// ---- site settings (name / logo / contact e-mail), readable by everyone, written by admins ----
export async function loadSite() {
  try { const d = await fsGetPath(["settings", "site"]); return d || null; } catch (e) { return null; }
}
export async function saveSite(data) { await fsSetPath(["settings", "site"], data); }
