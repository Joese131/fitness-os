const V = 'fos-v2';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png', './zxing.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))); self.clients.claim(); });
// Cache d'abord (démarrage instantané, hors connexion), mise à jour en arrière-plan pour le prochain lancement
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin && !u.host.includes('fonts.g')) return;
  e.respondWith(caches.open(V).then(async c => {
    const hit = await c.match(r, { ignoreSearch: true }) || (r.mode === 'navigate' ? await c.match('./index.html') : null);
    const net = fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
