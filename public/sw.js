// TwoLyp Service Worker — offline-first PWA
const CACHE = 'twolyp-v3';
const SHELL = [
  './',
  './index.html',
  './favicon.svg',
  './apple-touch-icon.png',
  './pwa-192x192.png',
  './pwa-512x512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;

  e.respondWith(
    (async () => {
      // Network-first for navigation (always get fresh HTML)
      if (request.mode === 'navigate') {
        try {
          const res = await fetch(request);
          const cache = await caches.open(CACHE);
          cache.put('./index.html', res.clone());
          return res;
        } catch {
          return (await caches.match('./index.html')) || (await caches.match(request));
        }
      }

      // Stale-while-revalidate for assets (fast + background update)
      const cached = await caches.match(request);
      const fetchPromise = fetch(request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
        }
        return res;
      }).catch(() => null);

      return cached || (await fetchPromise) || cached;
    })()
  );
});
