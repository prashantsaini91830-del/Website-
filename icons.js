/* Gyaan Hub - vector icons (classic script, load in <head> after theme.js)
   - window.ic("name", "extra-class")  -> inline <svg> icon (uses currentColor, scales with font-size)
   - Every UI emoji on the site is swapped for its vector twin automatically (also for text added later by scripts).
   - User-written text (names, bios, chat messages) is never touched: put data-keep on an element to protect it. */
(function () {
  var P = {
    call: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/>',
    "mic-off": '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M3 3l18 18"/>',
    "video-off": '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10.5 22 7v10l-6-3.5zM3 3l18 18"/>',
    flip: '<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h4.5v-6h4v6h4.5V10"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    "user-plus": '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M19 8v6M16 11h6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.8"/><path d="M17 14a5.5 5.5 0 0 1 4.5 5.5"/>',
    book: '<path d="M4 19V5a2 2 0 0 1 2-2h14v14H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 0 2 2h14v-4"/><path d="M9 8h6"/>',
    library: '<rect x="3" y="4" width="4" height="16" rx="1"/><rect x="9" y="4" width="4" height="16" rx="1"/><path d="M15.4 5.6l3.8-1 3 14.6-3.8 1z"/>',
    notes: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>',
    video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10.5 22 7v10l-6-3.5z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    divide: '<circle cx="12" cy="6" r="1.4" fill="currentColor"/><path d="M5 12h14"/><circle cx="12" cy="18" r="1.4" fill="currentColor"/>',
    atom: '<circle cx="12" cy="12" r="1.5" fill="currentColor"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>',
    flask: '<path d="M9 3h6"/><path d="M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2.2h12.4a1.5 1.5 0 0 0 1.3-2.2L14 9V3"/><path d="M7.5 15h9"/>',
    laptop: '<rect x="4" y="5" width="16" height="11" rx="2"/><path d="M2 20h20"/>',
    chart: '<path d="M4 4v16h16"/><rect x="7.5" y="11" width="3" height="6" rx=".6"/><rect x="12.5" y="7" width="3" height="10" rx=".6"/><rect x="17.5" y="13" width="2.5" height="4" rx=".6"/>',
    gear: '<path d="M10.3 2.5 9.9 4.6a7.5 7.5 0 0 0-1.9 1.1l-2-.8-1.7 3 1.6 1.4a7.5 7.5 0 0 0 0 2.2l-1.6 1.4 1.7 3 2-.8a7.5 7.5 0 0 0 1.9 1.1l.4 2.1h3.4l.4-2.1a7.5 7.5 0 0 0 1.9-1.1l2 .8 1.7-3-1.6-1.4a7.5 7.5 0 0 0 0-2.2l1.6-1.4-1.7-3-2 .8a7.5 7.5 0 0 0-1.9-1.1l-.4-2.1z"/><circle cx="12" cy="12" r="3"/>',
    tools: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.1L3 17.7 6.3 21l6.3-6.3a4 4 0 0 0 5.1-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h7M8.5 14h4"/>',
    trophy: '<path d="M8 4h8v6a4 4 0 0 1-8 0z"/><path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4"/><path d="M12 14v4M8 21h8M9.5 18h5"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h13l-2.5 4 2.5 4H5"/>',
    check: '<path d="M4 12.5l5 5L20 6.5"/>',
    "check-circle": '<circle cx="12" cy="12" r="9"/><path d="M7.5 12.5l3 3 6-6.5"/>',
    x: '<path d="M5 5l14 14M19 5 5 19"/>',
    hand: '<path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M11 10V4.5a1.5 1.5 0 0 1 3 0V11"/><path d="M14 10V6.5a1.5 1.5 0 0 1 3 0V13"/><path d="M8 12.5l-1.6-1.8a1.5 1.5 0 0 0-2.3 1.9L7 18a6 6 0 0 0 5 3h1.5a5 5 0 0 0 5-5v-3"/>',
    flame: '<path d="M12 22c4 0 7-2.8 7-7 0-3-1.8-5-3.2-6.6-.6 1.2-1.4 2-2.3 2.4.3-3-.8-6-3.5-8.8C9.5 6.6 5 9.6 5 15c0 4.2 3 7 7 7z"/>',
    copyright: '<circle cx="12" cy="12" r="9"/><path d="M15 9.6a3.5 3.5 0 1 0 0 4.8"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    camera: '<path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>',
    cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/><path d="M22 9v6"/>',
    medal: '<circle cx="12" cy="15" r="5.5"/><path d="M8.5 10.7 6 3h4l2 4 2-4h4l-2.5 7.7"/>',
    warning: '<path d="M12 3 2 20h20z"/><path d="M12 10v5"/><circle cx="12" cy="17.6" r=".9" fill="currentColor"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-5-5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3.2 3 3.2 15 0 18M12 3c-3.2 3-3.2 15 0 18"/>',
    sparkles: '<path d="M11 3l1.8 5.2L18 10l-5.2 1.8L11 17l-1.8-5.2L4 10l5.2-1.8z"/><path d="M19 3v4M17 5h4M19 16v4M17 18h4"/>',
    sparkle: '<path d="M12 3l2 7 7 2-7 2-2 7-2-7-7-2 7-2z"/>',
    cookie: '<path d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-4-4 4 4 0 0 1-5-5z"/><circle cx="9" cy="11" r="1" fill="currentColor"/><circle cx="14" cy="15.5" r="1" fill="currentColor"/><circle cx="8.5" cy="15.5" r=".8" fill="currentColor"/>',
    download: '<path d="M12 3v13M6 11l6 6 6-6"/><path d="M4 21h16"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7"/><circle cx="12" cy="17" r=".9" fill="currentColor"/>',
    pencil: '<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    hourglass: '<path d="M6 3h12M6 21h12"/><path d="M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/>',
    "eye-off": '<path d="M3 3l18 18"/><path d="M10.6 6.1A9.6 9.6 0 0 1 12 6c5 0 8.5 4 9.5 6a14 14 0 0 1-3.2 4M6.5 7.5C4.4 9 3 11 2.5 12c1 2 4.5 6 9.5 6a9.5 9.5 0 0 0 3.5-.7"/><path d="M9.9 10a3 3 0 0 0 4.1 4.1"/>',
    plug: '<path d="M9 2v5M15 2v5"/><path d="M6 7h12v4a6 6 0 0 1-12 0z"/><path d="M12 17v5"/>',
    pin: '<path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M9 12h6M9 16h4"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    rocket: '<path d="M12 2c3.5 2 5.5 6 5.5 10v3h-11v-3C6.5 8 8.5 4 12 2z"/><circle cx="12" cy="9.5" r="1.8"/><path d="M6.5 13 3.5 16l3 .5M17.5 13l3 3-3 .5M10 18l2 4 2-4"/>',
    brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3.5 3.5 0 0 0 2.5 5.7A3 3 0 0 0 9 20a2 2 0 0 0 3-1.7V6a2 2 0 0 0-3-2z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3.5 3.5 0 0 1-2.5 5.7A3 3 0 0 1 15 20a2 2 0 0 1-3-1.7"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    send: '<path d="M21 3 3 10.5l7 3 3 7z"/><path d="M10 13.5 21 3"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    paperclip: '<path d="M21 11.5l-8.5 8.5a5 5 0 0 1-7-7l9-9a3.3 3.3 0 0 1 4.7 4.7l-9 9a1.7 1.7 0 0 1-2.4-2.4l8-8"/>',
    share: '<path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/>',
    repost: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    heart: '<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>',
    trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 9"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    film: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 3l3 6M15 3l3 6"/><path d="M10.5 13l4 2.5-4 2.5z"/>',
    more: '<circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/>',
    feed: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 8h10M7 12h10M7 16h6"/>'
  };
  /* emoji  ->  icon name (":cls" adds a colour class) */
  var A = {
    "🏠": "home", "📘": "book", "📚": "library", "📝": "notes", "🎥": "video", "🎯": "target", "⚡": "bolt", "🔒": "lock",
    "➗": "divide", "⚛": "atom", "🧪": "flask", "💻": "laptop", "📊": "chart", "⚙": "gear", "🛠": "tools", "👥": "users",
    "💬": "chat", "🏆": "trophy", "🚩": "flag", "✓": "check", "✅": "check-circle", "✕": "x", "👋": "hand", "🔥": "flame",
    "©": "copyright", "🚫": "ban", "📷": "camera", "📱": "phone", "🎓": "cap", "🙋": "user-plus", "🏅": "medal",
    "⚠": "warning", "🔗": "link", "🔎": "search", "🥇": "medal:gold", "🥈": "medal:silver", "🥉": "medal:bronze", "🌍": "globe",
    "🎉": "sparkles", "✦": "sparkle", "🍪": "cookie", "⬇": "download", "⛶": "expand", "🌙": "moon", "🤷": "help", "✏": "pencil",
    "➕": "plus", "⏳": "hourglass", "🙈": "eye-off", "🔌": "plug", "📍": "pin", "✉": "mail", "📋": "clipboard", "⭐": "star",
    "🚀": "rocket", "🧠": "brain"
  };
  var keys = Object.keys(A).sort(function (a, b) { return b.length - a.length; });
  var RE = new RegExp("(" + keys.join("|") + ")\\uFE0F?", "g");
  var TEST = new RegExp(keys.join("|"));

  function ic(name, cls) {
    var parts = String(name).split(":"), p = P[parts[0]];
    if (!p) return "";
    var c = [parts[1] ? "vi-" + parts[1] : "", cls || ""].join(" ").trim();
    return '<span class="vi' + (c ? " " + c : "") + '" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg></span>";
  }
  window.ic = ic;
  window.GH_ICON_NAMES = Object.keys(P);

  var SKIP = "script,style,textarea,input,option,select,title,noscript,[data-keep],.avatar,.cm-bubble,.cm-bio,.cm-row .grow b,.cm-conv-head b";
  function sweepText(node) {
    var txt = node.nodeValue;
    if (!txt || !TEST.test(txt)) return;
    var par = node.parentElement;
    if (!par || (par.closest && par.closest(SKIP))) return;
    var frag = document.createDocumentFragment(), last = 0, m;
    RE.lastIndex = 0;
    while ((m = RE.exec(txt))) {
      if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
      var t = document.createElement("template");
      t.innerHTML = ic(A[m[1]]);
      frag.appendChild(t.content.firstChild || document.createTextNode(m[0]));
      last = m.index + m[0].length;
    }
    if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }
  function sweep(root) {
    if (!root) return;
    if (root.nodeType === 3) return sweepText(root);
    if (root.nodeType !== 1 || /^(SCRIPT|STYLE|TEXTAREA|INPUT)$/.test(root.nodeName)) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), list = [], n;
    while ((n = w.nextNode())) list.push(n);
    list.forEach(sweepText);
  }
  window.vectorize = sweep;

  var queue = [], pending = false;
  function flush() { pending = false; var q = queue; queue = []; q.forEach(sweep); }
  function start() {
    sweep(document.body);
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        if (m.type === "characterData") queue.push(m.target);
        else m.addedNodes.forEach(function (n) { queue.push(n); });
      });
      if (!pending && queue.length) { pending = true; requestAnimationFrame(flush); }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
