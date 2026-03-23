const CACHE_NAME = 'tdog-v1'

self.addEventListener('install', () => {
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
            .then(() => self.clients.claim()),
    )
})

self.addEventListener('fetch', (event) => {
    const { request } = event
    const url = new URL(request.url)

    // Skip non-GET, cross-origin, and API/SSE requests
    if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
        return
    }

    if (request.destination === 'document') {
        // Network-first for HTML pages
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone()
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
                    return response
                })
                .catch(() => caches.match(request)),
        )
    } else {
        // Cache-first for static assets (JS, CSS, images, fonts)
        event.respondWith(
            caches.match(request).then(
                (cached) =>
                    cached ||
                    fetch(request).then((response) => {
                        if (response.ok) {
                            const clone = response.clone()
                            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
                        }
                        return response
                    }),
            ),
        )
    }
})
