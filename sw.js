// kleshart offline cache: the app shell up front, everything else (model, runtime, fonts) on first use
const V = 'kleshart-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './three.module.js', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const keep = (req, res) => { if (res && res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put(req, copy)); } return res; };
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin === location.origin) {
    if (req.mode === 'navigate') { e.respondWith(fetch(req).then(r => keep('./index.html', r)).catch(() => caches.match('./index.html'))); return; }
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => keep(req, r))));
  } else if (/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => keep(req, r))));
  }
});
