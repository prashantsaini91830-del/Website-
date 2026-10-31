// Gyaan Hub - shared layout: left slide-out menu + privacy/cookie consent popup
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
  ["index.html", "🏠", "Home"],
  ["dashboard.html", "📚", "Dashboard"],
  ["reports.html", "📊", "Reports"],
  ["settings.html", "⚙️", "Settings"]
];
const legal = [["privacy.html", "Privacy Policy"], ["terms.html", "Terms of Use"]];

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
      ${items.map(([h, i, t]) => `<a href="${h}" class="${h === page ? "active" : ""}"><span>${i}</span>${t}</a>`).join("")}
      <div class="drawer-sep"></div>
      ${legal.map(([h, t]) => `<a href="${h}" class="small ${h === page ? "active" : ""}">${t}</a>`).join("")}
      <a href="#" class="small" id="drawer-cookies">Cookie preferences</a>
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
  const signedOut = () => { box.innerHTML = `<a href="login.html" class="btn btn-ghost btn-block">Sign In</a><a href="signup.html" class="btn btn-gold btn-block">Sign Up</a>`; };
  import("./auth.js?v=3").then(a => a.onUser(u => {
    if (!u) return signedOut();
    box.innerHTML = `<div class="who">Signed in as<br><b>${esc(u.email || "")}</b></div><button class="btn btn-ghost btn-block" id="drawer-logout">Logout</button>`;
    box.querySelector("#drawer-logout").addEventListener("click", a.logout);
  })).catch(signedOut);
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
const toc = document.getElementById("toc");
if (toc) document.querySelectorAll(".doc-body h2").forEach((h, i) => {
  h.id = "s" + (i + 1);
  const a = document.createElement("a");
  a.href = "#s" + (i + 1); a.textContent = h.textContent.replace(/^\d+\.\s*/, "");
  toc.appendChild(a);
});
if (!getConsent() && !onLegalPage) showConsent(false);
