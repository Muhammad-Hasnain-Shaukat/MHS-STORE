// MHS STORE - High-Speed Service Worker for Instant Edge Video Stream & Asset Caching
const CACHE_NAME = 'mhs-store-edge-v5';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/men.html',
  '/women.html',
  '/kids.html',
  '/css/main.css',
  '/css/video-scrub.css',
  '/css/ecom.css',
  '/css/product-detail.css',
  '/css/responsive.css',
  '/js/app.js',
  '/js/video-engine.js',
  '/js/products.js',
  '/js/cart.js',
  '/js/ui.js',
  '/js/product-detail.js',
  '/js/rose-petals.js',
  '/js/kuchu-audio.js',
  '/js/auth.js',
  '/js/admin.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('SW: Non-critical asset cache skip', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Video Streaming & Audio (Bypass ServiceWorker completely so native browser HTTP 206 Partial Content Range streaming works flawlessly on Vercel)
  if (
    request.headers.has('range') ||
    url.pathname.endsWith('.mp4') ||
    url.pathname.endsWith('.webm') ||
    url.pathname.endsWith('.mp3') ||
    url.pathname.endsWith('.wav') ||
    url.pathname.endsWith('.ogg')
  ) {
    return; // Pass through to browser native network stack
  }

  // Network-First for JS, HTML & JSON to guarantee instant code and catalog updates
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.html') || url.pathname.endsWith('.json') || url.pathname === '/') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Stale-While-Revalidate for Images & Static Assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
