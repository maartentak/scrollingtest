// App-shell cache so Steady opens instantly and works offline.
// Strategy: network-first for navigations (fresh HTML when online),
// stale-while-revalidate for assets (instant load, self-updating).
// Bump CACHE on changes that must invalidate old precached files.

const CACHE = "steady-v3";
const SHELL = [
  ".",
  "index.html",
  "manifest.webmanifest",
  "icon.svg",
  "css/app.css",
  "fonts/space-grotesk-var.woff2",
  "js/app.js",
  "js/ui.js",
  "js/store.js",
  "js/content.js",
  "js/notify.js",
  "js/flow-state-check.js",
  "js/flow-unstick.js",
  "js/flow-plan.js",
  "js/flow-sabotage.js",
  "js/flow-checkin.js",
  "js/history.js",
  "js/settings.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request).then(hit => hit || caches.match("index.html")))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(hit => {
      const refresh = fetch(e.request).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || refresh;
    })
  );
});
