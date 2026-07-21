const CACHE_NAME = 'animoa-v2.8.2-calendar-final';

const CORE = [
  '/',
  '/index.html',
  '/styles.css',
  '/supabase-config.js',
  '/i18n.js',
  '/auth.js',
  '/questionnaire.js',
  '/cloud.js',
  '/app.js',
  '/site.webmanifest',
  '/assets/animoa-logo-official.png',
  '/assets/animoa-wordmark-official.png',
  '/assets/animoa-icon-official.png',
  '/assets/animoa-icon-64.png',
  '/assets/apple-touch-icon.png',
  '/assets/animoa-icon-192.png',
  '/assets/animoa-icon-512.png',
  '/assets/animoa-background-light.webp',
  '/assets/animoa-background-dark.webp',
  '/assets/pet-placeholder.svg'
];

const ALWAYS_REFRESH = new Set([
  '/index.html',
  '/styles.css',
  '/supabase-config.js',
  '/i18n.js',
  '/auth.js',
  '/questionnaire.js',
  '/cloud.js',
  '/app.js',
  '/site.webmanifest'
]);

async function storeResponse(request, response) {
  if (!response?.ok || response.status === 206) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

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
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || request.headers.has('range')) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = request.mode === 'navigate';
  const mustRefresh = isNavigation || ALWAYS_REFRESH.has(url.pathname);

  if (mustRefresh) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(async (response) => {
          await storeResponse(request, response);
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          if (isNavigation) return caches.match('/index.html');
          return Response.error();
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(async (cached) => {
      if (cached) return cached;

      const response = await fetch(request);
      await storeResponse(request, response);
      return response;
    })
  );
});
