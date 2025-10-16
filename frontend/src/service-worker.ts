/// <reference lib="webworker" />

// Create a new service worker file
const CACHE_NAME = 'nexa-security-cache-v1';

// Add API routes that should be cached
const urlsToCache = [
  '/api/network/map',
  '/api/scans'
];

// Cast the global self to a ServiceWorkerGlobalScope for correct typings
const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch(() => void 0)
  );
});

sw.addEventListener('fetch', (event: FetchEvent) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin http(s) GET requests
  if (req.method !== 'GET') return;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (url.origin !== sw.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Try cache first
    const cached = await cache.match(req);
    if (cached) {
      // Update cache in the background (stale-while-revalidate)
      fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
          cache.put(req, networkResponse.clone()).catch(() => void 0);
        }
      }).catch(() => void 0);
      return cached;
    }

    // Fallback to network
    try {
      const networkResponse = await fetch(req);
      if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
        try { await cache.put(req, networkResponse.clone()); } catch { /* ignore quota or invalid scheme */ }
      }
      return networkResponse;
    } catch {
      return new Response('Network request failed and no cache available', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    }
  })());
});