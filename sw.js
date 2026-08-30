// MHS STORE - High-Speed Service Worker for Instant Edge Video Stream & Asset Caching
const CACHE_NAME = 'mhs-store-edge-v2';

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
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('SW: Non-critical asset cache skip', err);
      });
    }).then(() => self.skipWaiting())
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

  // Video Streaming / Partial Content (Range Requests)
  if (request.headers.has('range') || url.pathname.endsWith('.mp4')) {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request);
      })
    );
    return;
  }

  // Stale-While-Revalidate for Static Assets & Images
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
