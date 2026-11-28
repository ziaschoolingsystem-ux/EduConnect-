// EduConnect: آف لائن کھلنے اور تیز لوڈ کے لیے (نیٹ سست ہو تو 3 سیکنڈ بعد محفوظ کاپی دکھاتا ہے)
const C = "educonnect-v2";
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(["./", "index.html", "manifest.json"])).catch(() => {})); self.skipWaiting(); });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));
const save = (r, x) => { if (x && (x.status === 200 || x.type === "opaque")) { const c = x.clone(); caches.open(C).then(k => k.put(r, c)); } return x; };
const timed = (r, ms) => new Promise((ok, no) => { const t = setTimeout(() => no(new Error("slow")), ms); fetch(r).then(x => { clearTimeout(t); ok(x); }, e => { clearTimeout(t); no(e); }); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url), same = u.origin === location.origin, lib = /(^|\.)gstatic\.com$|^fonts\.googleapis\.com$/.test(u.hostname);
  if (!same && !lib) return; // Firestore اور لاگ اِن کی کالیں سیدھی نیٹ پر جاتی ہیں
  e.respondWith(lib
    ? caches.match(r).then(c => c || fetch(r).then(x => save(r, x)))
    : timed(r, 3000).then(x => save(r, x)).catch(() => caches.match(r, { ignoreSearch: true }).then(c => c || caches.match("index.html"))));
});
