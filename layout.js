// Gyaan Hub - shared layout: left slide-out menu + privacy/cookie consent popup + site name + preference sync
import { getPrefs, savePrefs, mergeRemote } from "./prefs.js?v=14";
import { t, applyI18n } from "./i18n.js?v=14";
const KEY = "gyaan_consent";
const page = location.pathname.split("/").pop() || "index.html";
const onLegalPage = ["privacy.html", "terms.html"].includes(page);

const getConsent = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } };
function saveConsent(analytics) {
  try { localStorage.setItem(KEY, JSON.stringify({ v: 1, policies: true, analytics: !!analytics, ts: new Date().toISOString() })); } catch (e) {}
  window.dispatchEvent(new Event("consent-changed"));
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- Left menu (hamburger) ---------- */
const items = [
  ["index.html", "home", "nav.home"],
  ["dashboard.html", "library", "nav.dashboard"],
  ["tests.html", "notes", "nav.tests"],
  ["reels.html", "film", "nav.reels"],
  ["community.html", "users", "nav.community"],
  ["messages.html", "chat", "nav.messages"],
  ["reports.html", "chart", "nav.reports"],
  ["settings.html", "gear", "nav.settings"],
  ["profile.html", "user", "nav.profile"]      // Profile is the last item of the menu
];
const legal = [["privacy.html", "nav.privacy"], ["terms.html", "nav.terms"]];
const avatarKey = uid => "gyaan_avatar_" + uid;
const initials = u => ((u.displayName || u.email || "?").trim()[0] || "?").toUpperCase();
function avatarHtml(u, cls = "") {
  let a = ""; try { a = localStorage.getItem(avatarKey(u.uid)) || ""; } catch (e) {}
  return a ? `<img class="avatar ${cls}" src="${a}" alt="">` : `<span class="avatar ${cls}">${esc(initials(u))}</span>`;
}

function buildMenu() {
  const btn = document.createElement("button");
  btn.className = "menu-btn";
  btn.setAttribute("aria-label", "Open menu");
  btn.setAttribute("aria-expanded", "false");
  btn.innerHTML = "<span></span><span></span><span></span>";

  const logo = document.querySelector(".nav .logo");
  if (logo) {
    const left = document.createElement("div");
    left.className = "nav-left";
    logo.parentNode.insertBefore(left, logo);
    left.append(btn, logo);
  } else {
    btn.classList.add("menu-fab");
    document.body.appendChild(btn);
  }

  const overlay = document.createElement("div");
  overlay.className = "drawer-overlay";
  const drawer = document.createElement("aside");
  drawer.className = "drawer";
  drawer.setAttribute("aria-label", "Main menu");
  drawer.innerHTML = `
    <div class="drawer-head">
      <a href="index.html" class="logo"><i>G</i> Gyaan Hub</a>
      <button class="drawer-close" aria-label="Close menu">✕</button>
    </div>
    <nav class="drawer-nav">
      ${items.map(([h, i, k]) => `<a href="${h}" class="${h === page ? "active" : ""}"><span>${window.ic ? window.ic(i) : ""}</span><em data-i18n="${k}">${t(k)}</em></a>`).join("")}
      <div class="drawer-sep"></div>
      ${legal.map(([h, k]) => `<a href="${h}" class="small ${h === page ? "active" : ""}" data-i18n="${k}">${t(k)}</a>`).join("")}
      <a href="#" class="small" id="drawer-cookies" data-i18n="nav.cookies">${t("nav.cookies")}</a>
    </nav>
    <div class="drawer-auth" id="drawer-auth"></div>`;
  document.body.append(overlay, drawer);

  const open = () => { drawer.classList.add("open"); overlay.classList.add("open"); btn.setAttribute("aria-expanded", "true"); document.body.classList.add("noscroll"); };
  const close = () => { drawer.classList.remove("open"); overlay.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); document.body.classList.remove("noscroll"); };
  btn.addEventListener("click", open);
  overlay.addEventListener("click", close);
  drawer.querySelector(".drawer-close").addEventListener("click", close);
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  drawer.querySelector("#drawer-cookies").addEventListener("click", e => { e.preventDefault(); close(); showConsent(true); });

  const box = drawer.querySelector("#drawer-auth");
  const signedOut = () => { box.innerHTML = `<a href="login.html" class="btn btn-ghost btn-block">${t("nav.signin")}</a><a href="signup.html" class="btn btn-gold btn-block">${t("nav.signup")}</a>`; };
  const paintUser = (u, a) => {
    box.innerHTML = `<div class="who-row">${avatarHtml(u)}<div class="who">${t("nav.signedAs")}<br><b>${esc(u.displayName || u.email || "")}</b><small>${esc(u.displayName ? (u.email || "") : "")}</small></div></div><button class="btn btn-ghost btn-block" id="drawer-logout">${t("nav.logout")}</button>`;
    box.querySelector("#drawer-logout").addEventListener("click", a.logout);
  };
  import("./auth.js?v=14").then(a => a.onUser(u => {
    if (!u) return signedOut();
    paintUser(u, a);
    window.addEventListener("avatar-changed", () => paintUser(u, a));
    // sync preferences + profile photo with the account (so every device looks the same)
    if (!a.isDemo()) {
      a.getUserDoc(u.uid).then(d => {
        if (!d) return;
        if (d.prefs) mergeRemote(d.prefs);
        try { if (d.avatar) localStorage.setItem(avatarKey(u.uid), d.avatar); else localStorage.removeItem(avatarKey(u.uid)); } catch (e) {}
        paintUser(u, a);
      });
      let tm; window.addEventListener("prefs-saved", e => { clearTimeout(tm); tm = setTimeout(() => a.savePrefsUp(e.detail).catch(() => {}), 800); });
    }
    if (!a.isDemo()) import("./community.js?v=14").then(async c => {
      const [unread, reqs] = await Promise.all([c.unreadCount(u.uid), a.fsWhere("follows", [["target", "==", u.uid], ["status", "==", "pending"]]).then(r => r.length).catch(() => 0)]);
      const badge = (href, n) => { const el = n && drawer.querySelector(`.drawer-nav a[href="${href}"]`); if (el && !el.querySelector(".nav-badge")) el.insertAdjacentHTML("beforeend", `<i class="nav-badge">${n > 9 ? "9+" : n}</i>`); };
      badge("messages.html", unread); badge("profile.html", reqs);
      const tb = (href, n) => { const el = n && document.querySelector(`.tabbar a[href="${href}"]`); if (el && !el.querySelector(".nav-badge")) el.insertAdjacentHTML("beforeend", `<i class="nav-badge">${n > 9 ? "9+" : n}</i>`); };
      tb("messages.html", unread);
    }).catch(() => {});
    // incoming voice / video calls ring on every page
    if (!a.isDemo()) import("./calls.js?v=14").then(m => m.initCalls(u)).catch(() => {});
    a.checkAdmin(u).then(ok => {
      const s = drawer.querySelector('a[href="settings.html"]');
      if (ok && s && !drawer.querySelector('a[href="admin.html"]')) s.insertAdjacentHTML("afterend", `<a href="admin.html" class="${page === "admin.html" ? "active" : ""}"><span>${window.ic("tools")}</span><em data-i18n="nav.admin">${t("nav.admin")}</em></a><a href="moderation.html" class="${page === "moderation.html" ? "active" : ""}"><span>${window.ic("flag")}</span><em>Community reports</em></a>`);
    });
  })).catch(signedOut);
}

/* ---------- Bottom tab bar (phones): quick access to the main pages ---------- */
function buildTabBar() {
  const skip = ["reels.html", "login.html", "signup.html", "verify.html", "player.html", "privacy.html", "terms.html"];
  if (skip.includes(page) || !document.querySelector(".nav")) return;
  const tabs = [["index.html", "home", "nav.home"], ["dashboard.html", "library", "nav.dashboard"], ["reels.html", "film", "nav.reels"], ["messages.html", "chat", "nav.messages"], ["profile.html", "user", "nav.profile"]];
  const bar = document.createElement("nav");
  bar.className = "tabbar";
  bar.setAttribute("aria-label", "Quick navigation");
  bar.innerHTML = tabs.map(([h, i, k]) => `<a href="${h}" class="${h === page ? "active" : ""}"><span>${window.ic ? window.ic(i) : ""}</span><em data-i18n="${k}">${t(k)}</em></a>`).join("");
  document.body.appendChild(bar);
  document.body.classList.add("has-tabbar");
}

/* ---------- Consent popup ---------- */
let consentEl;
function showConsent(reopen = false) {
  const saved = getConsent();
  if (consentEl) consentEl.remove();
  consentEl = document.createElement("div");
  consentEl.className = "consent-overlay";
  consentEl.setAttribute("role", "dialog");
  consentEl.setAttribute("aria-modal", "true");
  consentEl.setAttribute("aria-labelledby", "c-title");
  consentEl.innerHTML = `
    <div class="consent-card">
      ${saved ? '<button class="drawer-close c-x" aria-label="Close">✕</button>' : ""}
      <div class="c-badge">🍪 Privacy &amp; Cookies</div>
      <h2 id="c-title">Your data, your choice</h2>
      <p class="c-lead">Gyaan Hub collects a small amount of personal data to run your account and improve the service. Please review and choose how we may use it.</p>
      <ul class="c-list">
        <li><b>Account data</b><span>Your email address, display name (if you use Google) and sign-in details, processed by Firebase Authentication.</span></li>
        <li><b>Essential storage</b><span>Cookies and local storage that keep you signed in and remember this choice. Always on.</span></li>
      </ul>
      <label class="toggle">
        <span><b>Analytics cookies</b><small>Help us understand which pages are used, via Google Analytics. Optional.</small></span>
        <input type="checkbox" id="c-an" ${saved && saved.analytics ? "checked" : ""}><i></i>
      </label>
      <label class="check">
        <input type="checkbox" id="c-ok" ${saved ? "checked" : ""}>
        <span>I have read and accept the <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a> and <a href="terms.html" target="_blank" rel="noopener">Terms of Use</a>.</span>
      </label>
      <div class="c-actions">
        <button class="btn btn-ghost" id="c-necessary" disabled>Necessary only</button>
        <button class="btn btn-ghost" id="c-save" disabled>Save my choices</button>
        <button class="btn btn-gold" id="c-all" disabled>Accept all</button>
      </div>
      <p class="c-note">You can change this anytime from the menu → Cookie preferences, or from Settings.</p>
    </div>`;
  document.body.appendChild(consentEl);
  document.body.classList.add("noscroll");

  const ok = consentEl.querySelector("#c-ok"), an = consentEl.querySelector("#c-an");
  const buttons = consentEl.querySelectorAll(".c-actions .btn");
  const sync = () => buttons.forEach(b => b.disabled = !ok.checked);
  ok.addEventListener("change", sync); sync();
  const done = analytics => { saveConsent(analytics); consentEl.remove(); document.body.classList.remove("noscroll"); };
  consentEl.querySelector("#c-necessary").addEventListener("click", () => done(false));
  consentEl.querySelector("#c-save").addEventListener("click", () => done(an.checked));
  consentEl.querySelector("#c-all").addEventListener("click", () => done(true));
  const x = consentEl.querySelector(".c-x");
  if (x) x.addEventListener("click", () => { consentEl.remove(); document.body.classList.remove("noscroll"); });
  consentEl.querySelector(reopen ? "#c-ok" : "#c-ok").focus();
}
window.openConsent = () => showConsent(true);
window.resetConsent = () => { try { localStorage.removeItem(KEY); } catch (e) {} showConsent(false); };

buildMenu();
buildTabBar();
applyI18n();
window.addEventListener("prefs-changed", () => {
  const d = document.querySelector(".drawer");
  if (d) d.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
});
// site name / logo / contact: cached copy is applied by theme.js at once, the fresh copy is fetched here
import("./auth.js?v=14").then(async a => {
  const site = await a.loadSite();
  if (!site) return;
  const fresh = { name: site.name || "", logo: site.logo || "", contact: site.contact || "" };
  let old = null; try { old = localStorage.getItem("gyaan_site"); } catch (e) {}
  try { localStorage.setItem("gyaan_site", JSON.stringify(fresh)); } catch (e) {}
  if (JSON.stringify(fresh) !== old && window.__siteApply) window.__siteApply(fresh);
}).catch(() => {});
const toc = document.getElementById("toc");
if (toc) document.querySelectorAll(".doc-body h2").forEach((h, i) => {
  h.id = "s" + (i + 1);
  const a = document.createElement("a");
  a.href = "#s" + (i + 1); a.textContent = h.textContent.replace(/^\d+\.\s*/, "");
  toc.appendChild(a);
});
if (!getConsent() && !onLegalPage) showConsent(false);
