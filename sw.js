const CACHE_NAME = 'animoa-v2-20260719-clean-currencies-224';

const CORE = [
  '/',
  '/index.html',
  '/styles.css',
  '/i18n.js',
  '/auth.js',
  '/cloud.js',
  '/app.js',
  '/site.webmanifest',
  '/assets/animoa-logo-official.png',
  '/assets/animoa-wordmark-official.png',
  '/assets/animoa-icon-official.png',
  '/assets/animoa-icon-192.png',
  '/assets/animoa-icon-512.png',
  '/assets/animoa-background-light.webp',
  '/assets/animoa-background-dark.webp',
  '/assets/pet-placeholder.svg'
];

const ALWAYS_REFRESH = new Set([
  '/index.html',
  '/styles.css',
  '/i18n.js',
  '/auth.js',
  '/cloud.js',
  '/app.js',
  '/supabase-config.js',
  '/site.webmanifest'
]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = event.request.mode === 'navigate';
  const mustRefresh = isNavigation || ALWAYS_REFRESH.has(url.pathname);

  if (mustRefresh) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          if (isNavigation) return caches.match('/index.html');
          return Response.error();
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cached) => {
        if (cached) return cached;

        return fetch(event.request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        });
      })
  );
});
