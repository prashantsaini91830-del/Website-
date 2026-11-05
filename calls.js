// Gyaan Hub - voice & video calls (WebRTC). Signalling goes through Firestore (collection "calls"), media goes peer-to-peer.
//  - startCall(uid, "audio" | "video")  : call a student (used by the call buttons in Messages)
//  - initCalls(user)                    : listen for incoming calls on every page (called from layout.js)
// Needs: HTTPS (or localhost), the "calls" rules from firestore.rules, microphone / camera permission.
// Both students must have the website open to receive a call (there are no push notifications on a static site).
import * as A from "./auth.js?v=14";
import * as C from "./community.js?v=14";

const ICE = (window.SITE_CONFIG && window.SITE_CONFIG.iceServers) || [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] }
];
const RING_MS = 45000;          // caller gives up after 45 s
const STALE_MS = 70000;         // ignore "ringing" calls older than this
const ic = (n, c) => (window.ic ? window.ic(n, c) : "");
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
const dur = s => { s = Math.max(0, Math.round(s)); const m = Math.floor(s / 60), x = s % 60; return m + ":" + String(x).padStart(2, "0"); };

let me = null, myName = "Student", started = false;
let cur = null;                  // the call in progress: { cid, role, other, type, prof, startedAt, connectedAt, ... }
let ringing = null;              // incoming call that is shown on screen (not answered yet)
let ui = null, ringCtx = null, ringInt = null, tickInt = null, wake = null, oldTitle = "";
const seenCalls = new Set();

/* ------------------------------------------------------------------ UI */
function buildUi() {
  if (ui) return ui;
  ui = document.createElement("div");
  ui.className = "call-ui"; ui.hidden = true;
  ui.setAttribute("role", "dialog"); ui.setAttribute("aria-label", "Call");
  ui.innerHTML = `
    <video class="call-remote" id="call-rv" autoplay playsinline></video>
    <div class="call-shade"></div>
    <video class="call-local" id="call-lv" autoplay playsinline muted></video>
    <div class="call-center"><div class="call-ava" id="call-ava"></div>
      <div class="call-name" id="call-name"></div><div class="call-status" id="call-st"></div></div>
    <div class="call-bar" id="call-bar">
      <button type="button" data-c="mic" aria-label="Mute microphone"><span class="cb-i">${ic("mic")}</span><em>Mute</em></button>
      <button type="button" data-c="cam" aria-label="Camera on or off"><span class="cb-i">${ic("video")}</span><em>Camera</em></button>
      <button type="button" data-c="flip" aria-label="Switch camera"><span class="cb-i">${ic("flip")}</span><em>Flip</em></button>
      <button type="button" data-c="end" class="end" aria-label="End call"><span class="cb-i">${ic("call")}</span><em>End</em></button>
    </div>
    <div class="call-in" id="call-in">
      <button type="button" data-c="decline" class="end" aria-label="Decline"><span class="cb-i">${ic("call")}</span><em>Decline</em></button>
      <button type="button" data-c="accept" class="ok" aria-label="Accept"><span class="cb-i">${ic("call")}</span><em>Accept</em></button>
    </div>`;
  document.body.appendChild(ui);
  ui.addEventListener("click", e => {
    const b = e.target.closest("[data-c]"); if (!b) return;
    const k = b.dataset.c;
    if (k === "end") hangup();
    else if (k === "decline") decline();
    else if (k === "accept") accept();
    else if (k === "mic") toggleMic(b);
    else if (k === "cam") toggleCam(b);
    else if (k === "flip") flipCam();
  });
  return ui;
}
const $ = id => document.getElementById(id);
function show(mode, call, prof) {
  buildUi();
  ui.hidden = false;
  ui.className = "call-ui " + mode + (call.type === "video" ? " video" : " audio");
  $("call-name").textContent = (prof && prof.name) || call.name || "Student";
  $("call-ava").innerHTML = C.avatarHtml(prof || { name: call.name || "?" }, "xl");
  document.body.classList.add("noscroll");
  const mic = ui.querySelector('[data-c="mic"]'), cam = ui.querySelector('[data-c="cam"]');
  mic.classList.remove("off"); cam.classList.remove("off");
  mic.querySelector(".cb-i").innerHTML = ic("mic"); cam.querySelector(".cb-i").innerHTML = ic("video");
}
const setStatus = t => { const el = $("call-st"); if (el) el.textContent = t; };
function hideUi(delay = 0) {
  setTimeout(() => {
    if (cur || ringing) return;                       // a new call started meanwhile
    if (ui) { ui.hidden = true; const rv = $("call-rv"), lv = $("call-lv"); if (rv) rv.srcObject = null; if (lv) lv.srcObject = null; }
    document.body.classList.remove("noscroll");
  }, delay);
}

/* ------------------------------------------------------------------ ringtone */
function startRing() {
  stopRing();
  try {
    ringCtx = new (window.AudioContext || window.webkitAudioContext)();
    const beep = (f, at, len) => {
      const o = ringCtx.createOscillator(), g = ringCtx.createGain();
      o.type = "sine"; o.frequency.value = f; g.gain.value = 0.0001;
      o.connect(g); g.connect(ringCtx.destination);
      const t = ringCtx.currentTime + at;
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      o.start(t); o.stop(t + len + 0.05);
    };
    const pattern = () => { beep(523, 0, 0.35); beep(659, 0.4, 0.35); beep(523, 1.0, 0.35); beep(659, 1.4, 0.35); };
    pattern(); ringInt = setInterval(pattern, 3200);
  } catch (e) {}
  try { if (navigator.vibrate) navigator.vibrate([500, 250, 500, 1500, 500, 250, 500]); } catch (e) {}
  oldTitle = document.title; document.title = "Incoming call...";
}
function stopRing() {
  clearInterval(ringInt); ringInt = null;
  try { if (ringCtx) ringCtx.close(); } catch (e) {} ringCtx = null;
  try { if (navigator.vibrate) navigator.vibrate(0); } catch (e) {}
  if (oldTitle) { document.title = oldTitle; oldTitle = ""; }
}

/* ------------------------------------------------------------------ media + peer connection */
async function getMedia(type) {
  if (!window.isSecureContext) throw new Error("Calls need a secure (https) connection.");
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.RTCPeerConnection) throw new Error("This browser does not support calls. Please use the latest Chrome, Edge, Firefox or Safari.");
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      video: type === "video" ? { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } : false
    });
  } catch (e) {
    if (e && (e.name === "NotAllowedError" || e.name === "SecurityError")) throw new Error("Please allow microphone" + (type === "video" ? " and camera" : "") + " access in your browser, then try again.");
    if (e && e.name === "NotFoundError") throw new Error("No microphone" + (type === "video" ? " or camera" : "") + " found on this device.");
    throw new Error("Could not start the microphone" + (type === "video" ? " / camera" : "") + ".");
  }
}
function makePc(c) {
  const pc = new RTCPeerConnection({ iceServers: ICE });
  c.pc = pc; c.remote = new MediaStream(); c.pending = []; c.seen = new Set(); c.unsubs = [];
  pc.ontrack = e => {
    (e.streams[0] ? e.streams[0].getTracks() : [e.track]).forEach(t => { if (!c.remote.getTracks().includes(t)) c.remote.addTrack(t); });
    const rv = $("call-rv"); rv.srcObject = c.remote; rv.play().catch(() => {});
    if (e.track.kind === "video") ui.classList.add("has-remote-video");
  };
  pc.onicecandidate = e => {
    if (e.candidate) A.fsSetPath(["calls", c.cid, c.role + "Candidates", rid()], e.candidate.toJSON(), false).catch(() => {});
  };
  pc.onconnectionstatechange = () => {
    if (cur !== c) return;
    const s = pc.connectionState;
    if (s === "connected") onConnected(c);
    else if (s === "disconnected") setStatus("Reconnecting...");
    else if (s === "failed") finish(c, "Connection failed. The network may be blocking calls.", "failed");
  };
  c.local.getTracks().forEach(t => pc.addTrack(t, c.local));
  const lv = $("call-lv"); lv.srcObject = c.local;
  // candidates from the other side
  const otherRole = c.role === "caller" ? "callee" : "caller";
  c.unsubs.push(A.fsWatchCol(["calls", c.cid, otherRole + "Candidates"], rows => {
    rows.forEach(r => {
      if (c.seen.has(r.id)) return; c.seen.add(r.id);
      const cand = { candidate: r.candidate, sdpMid: r.sdpMid, sdpMLineIndex: r.sdpMLineIndex, usernameFragment: r.usernameFragment };
      if (pc.remoteDescription) pc.addIceCandidate(cand).catch(() => {}); else c.pending.push(cand);
    });
  }, () => {}));
  return pc;
}
async function flushPending(c) { const l = c.pending; c.pending = []; for (const x of l) { try { await c.pc.addIceCandidate(x); } catch (e) {} } }
function onConnected(c) {
  if (c.connectedAt) { setStatus(dur((Date.now() - c.connectedAt) / 1000)); return; }
  c.connectedAt = Date.now(); clearTimeout(c.ringTimer);
  ui.classList.remove("outgoing", "incoming"); ui.classList.add("live");
  setStatus("0:00");
  clearInterval(tickInt); tickInt = setInterval(() => { if (cur === c && c.connectedAt) setStatus(dur((Date.now() - c.connectedAt) / 1000)); }, 1000);
  try { if (navigator.wakeLock) navigator.wakeLock.request("screen").then(w => { wake = w; }).catch(() => {}); } catch (e) {}
}

/* ------------------------------------------------------------------ starting a call */
export async function startCall(other, type, prof) {
  if (!me) return C.toast("Please sign in again.", 3000);
  if (cur || ringing) return C.toast("You are already in a call.", 3000);
  if (A.isDemo()) return C.toast("Calls need a real account (not demo mode).", 3500);
  if (!other || other === me.uid) return;
  let local;
  try {
    if (await C.isBlocked(me.uid, other)) return C.toast("You blocked this student.", 3000);
    prof = prof || await C.getProfile(other).catch(() => null) || { name: "Student" };
    const c = cur = { cid: rid(), role: "caller", other, type, prof, startedAt: Date.now() };
    show("outgoing", { type, name: prof.name }, prof);
    setStatus("Starting...");
    local = c.local = await getMedia(type);
    if (cur !== c) { local.getTracks().forEach(t => t.stop()); return; }
    const pc = makePc(c);
    const offer = await pc.createOffer();
    // the call document must exist before ICE candidates are saved, so it is written before setLocalDescription
    await A.fsSetPath(["calls", c.cid], {
      caller: me.uid, callee: other, participants: [me.uid, other], type, status: "ringing",
      callerName: myName, offer: { type: offer.type, sdp: offer.sdp }, ts: Date.now()
    }, false);
    await pc.setLocalDescription(offer);
    setStatus("Calling...");
    c.unsubs.push(A.fsWatchDoc(["calls", c.cid], async d => {
      if (cur !== c) return;
      if (!d) return finish(c, "Call ended", "ended");
      if (d.status === "accepted" && d.answer && !pc.currentRemoteDescription && !c.answering) {
        c.answering = true; setStatus("Connecting...");
        try { await pc.setRemoteDescription(d.answer); await flushPending(c); } catch (e) { finish(c, "Could not connect.", "failed"); }
      }
      if (d.status === "declined") finish(c, "Call declined", "declined");
      else if (d.status === "busy") finish(c, "Student is on another call", "missed");
      else if (d.status === "ended" || d.status === "missed") finish(c, "Call ended", c.connectedAt ? "completed" : "missed");
    }, () => finish(c, "Could not place the call. Make sure the latest Firestore rules are published.", "failed")));
    c.ringTimer = setTimeout(() => { if (cur === c && !c.connectedAt) { A.fsSetPath(["calls", c.cid], { status: "missed" }).catch(() => {}); finish(c, "No answer", "missed"); } }, RING_MS);
  } catch (e) {
    const c = cur;
    if (c) { setStatus((e && e.code === "permission-denied") ? "This student does not accept calls from you." : (e.message || "Could not start the call.")); cleanup(c, true); cur = null; hideUi(2200); }
    else C.toast(e.message || "Could not start the call.", 4000);
  }
}

/* ------------------------------------------------------------------ incoming calls */
export function initCalls(user) {
  if (started || !user || A.isDemo()) return;
  started = true; me = user;
  C.getProfile(user.uid).then(p => { if (p && p.name) myName = p.name; }).catch(() => {});
  buildUi();
  A.fsWatchWhere("calls", [["callee", "==", user.uid]], rows => {
    const now = Date.now();
    const live = rows.filter(r => r.status === "ringing" && now - (A.toMs(r.updatedAt) || r.ts || 0) < STALE_MS);
    live.forEach(r => {
      if (seenCalls.has(r.id)) return; seenCalls.add(r.id);
      if (cur || ringing) { A.fsSetPath(["calls", r.id], { status: "busy" }).catch(() => {}); return; }
      showIncoming(r);
    });
    if (ringing && !live.find(r => r.id === ringing.id)) {                 // caller hung up before we answered
      const r = ringing; ringing = null; stopRing(); setStatus("Missed call"); setTimeout(() => hideUi(), 1500);
      ui.classList.remove("incoming");
    }
  }, () => {});
}
async function showIncoming(call) {
  ringing = call;
  const prof = await C.getProfile(call.caller).catch(() => null) || { name: call.callerName || "Student" };
  if (ringing !== call) return;
  call.prof = prof;
  show("incoming", { type: call.type, name: prof.name }, prof);
  setStatus(call.type === "video" ? "Incoming video call" : "Incoming voice call");
  startRing();
}
async function accept() {
  const call = ringing; if (!call) return;
  stopRing(); ringing = null;
  const c = cur = { cid: call.id, role: "callee", other: call.caller, type: call.type, prof: call.prof, startedAt: Date.now() };
  show("outgoing", { type: call.type, name: call.prof.name }, call.prof);
  setStatus("Connecting...");
  try {
    c.local = await getMedia(call.type);
    const pc = makePc(c);
    await pc.setRemoteDescription(call.offer);
    await flushPending(c);
    const ans = await pc.createAnswer();
    await pc.setLocalDescription(ans);
    await A.fsSetPath(["calls", c.cid], { status: "accepted", answer: { type: ans.type, sdp: ans.sdp } });
    c.unsubs.push(A.fsWatchDoc(["calls", c.cid], d => {
      if (cur !== c) return;
      if (!d || d.status === "ended" || d.status === "missed") finish(c, "Call ended", "ended");
    }, () => {}));
    c.ringTimer = setTimeout(() => { if (cur === c && !c.connectedAt) finish(c, "Could not connect.", "failed"); }, 25000);
  } catch (e) {
    A.fsSetPath(["calls", call.id], { status: "declined" }).catch(() => {});
    setStatus(e.message || "Could not answer the call."); cleanup(c, true); cur = null; hideUi(2200);
  }
}
function decline() {
  const call = ringing; if (!call) return;
  stopRing(); ringing = null;
  A.fsSetPath(["calls", call.id], { status: "declined" }).catch(() => {});
  hideUi();
}

/* ------------------------------------------------------------------ in-call controls */
function toggleMic(b) {
  if (!cur || !cur.local) return;
  const t = cur.local.getAudioTracks()[0]; if (!t) return;
  t.enabled = !t.enabled; b.classList.toggle("off", !t.enabled);
  b.querySelector(".cb-i").innerHTML = ic(t.enabled ? "mic" : "mic-off");
}
function toggleCam(b) {
  if (!cur || !cur.local) return;
  const t = cur.local.getVideoTracks()[0]; if (!t) return C.toast("This is a voice call.", 2000);
  t.enabled = !t.enabled; b.classList.toggle("off", !t.enabled);
  b.querySelector(".cb-i").innerHTML = ic(t.enabled ? "video" : "video-off");
}
async function flipCam() {
  if (!cur || !cur.local || !cur.local.getVideoTracks()[0]) return;
  const c = cur, old = c.local.getVideoTracks()[0], prevFacing = c.facing || "user";
  c.facing = prevFacing === "environment" ? "user" : "environment";
  const grab = f => navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: f } } }).then(st => st.getVideoTracks()[0]);
  old.stop();                                   // many phones cannot open two cameras at once
  let nt;
  try { nt = await grab(c.facing); }
  catch (e) { try { nt = await grab(prevFacing); c.facing = prevFacing; } catch (e2) { return C.toast("Could not switch the camera.", 2500); } }
  try {
    const sender = c.pc.getSenders().find(x => x.track && x.track.kind === "video");
    if (sender) await sender.replaceTrack(nt);
    c.local.removeTrack(old); c.local.addTrack(nt);
    $("call-lv").srcObject = c.local;
    const front = c.facing === "user"; $("call-lv").style.transform = front ? "scaleX(-1)" : "none";
  } catch (e) { C.toast("Could not switch the camera.", 2500); }
}

/* ------------------------------------------------------------------ ending */
function hangup() {
  const c = cur; if (!c) return;
  A.fsSetPath(["calls", c.cid], { status: c.connectedAt || c.role === "callee" ? "ended" : "missed" }).catch(() => {});
  finish(c, "Call ended", c.connectedAt ? "completed" : (c.role === "caller" ? "missed" : "ended"));
}
function cleanup(c, quick) {
  clearTimeout(c.ringTimer); clearInterval(tickInt); tickInt = null;
  (c.unsubs || []).forEach(u => { try { u(); } catch (e) {} });
  try { if (c.pc) { c.pc.ontrack = c.pc.onicecandidate = c.pc.onconnectionstatechange = null; c.pc.close(); } } catch (e) {}
  try { if (c.local) c.local.getTracks().forEach(t => t.stop()); } catch (e) {}
  try { if (wake) wake.release(); } catch (e) {} wake = null;
  stopRing();
}
async function logCall(c, status) {
  const kind = c.type === "video" ? "Video" : "Voice";
  const secs = c.connectedAt ? (Date.now() - c.connectedAt) / 1000 : 0;
  const text = status === "completed" ? `${kind} call · ${dur(secs)}` : status === "declined" ? `${kind} call declined` : `Missed ${kind.toLowerCase()} call`;
  const cid = C.chatId(me.uid, c.other), id = rid(), now = Date.now();
  await C.ensureChat(me.uid, c.other);
  await A.fsSetPath(["chats", cid, "messages", id], { from: me.uid, to: c.other, text, ts: now, call: { type: c.type, status, secs: Math.round(secs) } }, false);
  await A.fsSetPath(["chats", cid], { lastText: text, lastFrom: me.uid, lastTs: now, ["seen_" + me.uid]: now });
}
function finish(c, msg, status) {
  if (cur !== c) return;
  cur = null;
  const wasLive = !!c.connectedAt;
  cleanup(c);
  setStatus(msg); ui.classList.remove("live", "outgoing", "incoming"); ui.classList.add("ended");
  hideUi(1600);
  if (c.role === "caller") {
    if (status !== "failed") logCall(c, status === "ended" && wasLive ? "completed" : status).catch(() => {});
    // remove the signalling documents a few seconds later (the other side needs to see "ended" first)
    setTimeout(async () => {
      try {
        for (const r of ["callerCandidates", "calleeCandidates"]) { const l = await A.fsListPath(["calls", c.cid, r]); await Promise.all(l.map(x => A.fsDeletePath(["calls", c.cid, r, x.id]).catch(() => {}))); }
        await A.fsDeletePath(["calls", c.cid]);
      } catch (e) {}
    }, 6000);
  }
}
window.addEventListener("beforeunload", () => { if (cur) { try { A.fsSetPath(["calls", cur.cid], { status: "ended" }); } catch (e) {} } });
