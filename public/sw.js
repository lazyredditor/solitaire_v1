// Bump this on every meaningful SW change so old caches are evicted.
const CACHE_VERSION = 'v2';
const STATIC_CACHE = `solitaire-static-${CACHE_VERSION}`;

const PRECACHE_URLS = [
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
    '/favicon.ico',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
    );
    // Activate the new SW immediately on next load instead of waiting for all
    // tabs to close — prevents stale-HTML / missing-chunk lockouts after a deploy.
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames
                    .filter((name) => name !== STATIC_CACHE)
                    .map((name) => caches.delete(name))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;

    // Only handle GETs from our own origin. Let everything else (analytics,
    // ads, POSTs, cross-origin) pass through untouched.
    if (request.method !== 'GET') return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // Navigation requests (the HTML document): network-first. If we serve a
    // stale HTML, it will reference chunk hashes that no longer exist after a
    // deploy and the app gets stuck on "Loading...".
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
                    return response;
                })
                .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
        );
        return;
    }

    // Hashed Next.js build assets are immutable — cache-first is safe and fast.
    if (url.pathname.startsWith('/_next/static/')) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
                    }
                    return response;
                });
            })
        );
        return;
    }

    // Everything else: stale-while-revalidate against the precache, falling
    // back to network.
    event.respondWith(
        caches.match(request).then((cached) => cached || fetch(request))
    );
});

// Allow the page to trigger an immediate update.
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
