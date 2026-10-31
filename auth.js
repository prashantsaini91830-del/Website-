// Gyaan Hub - Firebase Auth (browser ES modules via CDN, no bundler needed)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

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
let app, auth;
if (!DEMO) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
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

function friendly(err) {
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
    "auth/network-request-failed": "Network error. Please check your internet connection."
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
    await createUserWithEmailAndPassword(auth, email, password);
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
    if (!user) { location.href = "login.html"; return; }
    if (requireVerified && !isVerified(user)) { location.href = "verify.html"; return; }
    cb(user, false);
  });
}

export function onUser(cb) {
  if (DEMO) { cb(JSON.parse(localStorage.getItem(DEMO_KEY) || "null")); return; }
  onAuthStateChanged(auth, cb);
}

export async function logout() {
  if (DEMO) localStorage.removeItem(DEMO_KEY);
  else await signOut(auth);
  location.href = "login.html";
}
