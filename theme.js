/* Gyaan Hub - tiny classic script (runs in <head>) : theme before paint + site name/logo */
(function () {
  var C = window.SITE_CONFIG || {};
  var DEF = C.defaultName || "Gyaan Hub", DEF_LOGO = C.defaultLogo || "G", PH = C.contactPlaceholder || "your-email@example.com";
  var de = document.documentElement;
  function read(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }
  var prefs = read("gyaan_prefs") || {};

  function paint() {
    var th = prefs.theme || "dark";
    var light = th === "light" || (th === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches);
    de.classList.toggle("light", !!light);
    de.setAttribute("data-theme", light ? "light" : "dark");
    if (prefs.lang) de.lang = prefs.lang;
  }
  paint();
  try { window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", function () { if (prefs.theme === "system") paint(); }); } catch (e) {}
  window.__applyPrefs = function (p) { prefs = p || read("gyaan_prefs") || {}; paint(); };

  /* ---- site name / logo / contact e-mail (replaces the default text everywhere on the page) ---- */
  var state = { name: DEF, logo: DEF_LOGO, contact: "" };
  window.__site = state;
  var replaced = false, origTitle = null;
  function walk() {
    if (!document.body) return;
    var custom = state.name !== DEF || !!state.contact;
    if (custom || replaced) {
      if (origTitle === null) origTitle = document.title;
      if (origTitle.indexOf(DEF) > -1) document.title = origTitle.split(DEF).join(state.name);
      var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: function (n) {
          var p = n.parentNode && n.parentNode.nodeName;
          if (p === "SCRIPT" || p === "STYLE" || p === "TEXTAREA") return NodeFilter.FILTER_REJECT;
          if (n._gOrig !== undefined) return NodeFilter.FILTER_ACCEPT;
          var v = n.nodeValue;
          return v.indexOf(DEF) > -1 || v.indexOf(PH) > -1 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      });
      var list = [];
      while (w.nextNode()) list.push(w.currentNode);
      list.forEach(function (n) {
        var base = n._gOrig !== undefined ? n._gOrig : n.nodeValue, v = base;
        if (state.name !== DEF) v = v.split(DEF).join(state.name);
        if (state.contact) v = v.split(PH).join(state.contact);
        if (v !== base) { n._gOrig = base; replaced = true; }
        if (n.nodeValue !== v) n.nodeValue = v;
      });
    }
    var ls = document.querySelectorAll(".logo i");
    for (var i = 0; i < ls.length; i++) if (ls[i].textContent !== state.logo) ls[i].textContent = state.logo;
  }
  window.__siteApply = function (s) {
    s = s || read("gyaan_site") || {};
    state.name = ((s.name || "") + "").trim() || DEF;
    state.logo = ((s.logo || "") + "").trim() || DEF_LOGO;
    state.contact = ((s.contact || "") + "").trim();
    walk();
  };
  var raf = 0;
  function boot() {
    window.__siteApply();
    try {
      new MutationObserver(function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; walk(); }); })
        .observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
