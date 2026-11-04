// Gyaan Hub - images for tests / avatar: compress on device, resolve "fsimg:" references, click-to-zoom
import { getImage, saveImage } from "./auth.js?v=10";
import { esc, normalizeImgUrl } from "./player-utils.js?v=10";

export const isRef = s => typeof s === "string" && s.startsWith("fsimg:");
export { normalizeImgUrl };

const mem = {};
export async function resolveRef(ref) {
  if (!ref) return "";
  if (!isRef(ref)) return normalizeImgUrl(ref);
  const id = ref.slice(6);
  if (!mem[id]) mem[id] = getImage(id);
  return mem[id];
}
export const imgHtml = (ref, cls = "zoomable", alt = "") =>
  ref ? `<img class="${cls} qimg loading" data-ref="${esc(ref)}" alt="${esc(alt)}" referrerpolicy="no-referrer" decoding="async">` : "";

// fills every <img data-ref="..."> inside root (call after inserting HTML)
export function hydrate(root = document) {
  root.querySelectorAll("img[data-ref]:not([data-done])").forEach(img => {
    img.dataset.done = "1";
    resolveRef(img.dataset.ref).then(u => {
      if (!u) throw new Error("empty");
      img.onload = () => img.classList.remove("loading");
      img.onerror = () => { img.classList.remove("loading"); img.classList.add("broken"); img.alt = "Image could not be loaded"; };
      img.src = u;
    }).catch(() => { img.classList.remove("loading"); img.classList.add("broken"); img.alt = "Image could not be loaded"; });
  });
}
export function prefetch(refs) { (refs || []).filter(Boolean).forEach(r => { resolveRef(r).then(u => { if (u && !isRef(r)) { const i = new Image(); i.referrerPolicy = "no-referrer"; i.src = u; } }).catch(() => {}); }); }

function loadImage(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("This file is not a readable image.")); };
    img.src = url;
  });
}
const bytesOf = dataUrl => Math.round((dataUrl.length - dataUrl.indexOf(",") - 1) * 0.75);

// Resizes and re-encodes as JPEG until it is small enough to store in the database
export async function compressImage(file, { max = 1100, quality = 0.84, maxBytes = 380000 } = {}) {
  if (!/^image\//.test(file.type)) throw new Error("Please choose an image file (JPG, PNG, WEBP).");
  const img = await loadImage(file);
  let scale = Math.min(1, max / Math.max(img.width, img.height)), q = quality, out = "";
  for (let i = 0; i < 8; i++) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.width * scale)); c.height = Math.max(1, Math.round(img.height * scale));
    const x = c.getContext("2d");
    x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height);          // transparent PNGs get a white background
    x.drawImage(img, 0, 0, c.width, c.height);
    out = c.toDataURL("image/jpeg", q);
    if (bytesOf(out) <= maxBytes) return out;
    if (q > 0.62) q -= 0.1; else scale *= 0.82;
  }
  throw new Error("The image is too large even after compressing. Please use a smaller picture.");
}

// Square crop for profile photos
export async function squareAvatar(file, size = 256) {
  if (!/^image\//.test(file.type)) throw new Error("Please choose an image file (JPG, PNG, WEBP).");
  const img = await loadImage(file);
  const s = Math.min(img.width, img.height), c = document.createElement("canvas");
  c.width = c.height = size;
  c.getContext("2d").drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
  return c.toDataURL("image/jpeg", 0.86);
}

export async function uploadQuestionImage(file) {
  const data = await compressImage(file);
  const id = await saveImage(data);
  return "fsimg:" + id;
}

// click an <img class="zoomable"> to see it large
let lb;
export function initLightbox() {
  if (initLightbox.done) return; initLightbox.done = true;
  document.addEventListener("click", e => {
    const img = e.target.closest("img.zoomable");
    if (!img || !img.src || img.classList.contains("broken")) return;
    e.preventDefault(); e.stopPropagation();
    lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = `<button class="drawer-close" aria-label="Close">✕</button><img alt="">`;
    lb.querySelector("img").src = img.src;
    const close = () => { lb.remove(); document.removeEventListener("keydown", esc2); };
    const esc2 = ev => { if (ev.key === "Escape") close(); };
    lb.addEventListener("click", close);
    document.addEventListener("keydown", esc2);
    document.body.appendChild(lb);
  }, true);
}
