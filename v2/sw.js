const CACHE_NAME = 'sohel-portfolio-v2-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './skills.html',
  './gallery.html',
  './blog.html',
  './post.html',
  './contact.html',
  './404.html',
  './assets/css/styles.css',
  './assets/js/main.js',
  './assets/js/blog-data.js',
  './images/logo.png',
  './images/profile-320.jpg',
  './images/profile.jpg',
  './site.webmanifest'
];

// Install Event - Pre-cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // Skip external analytics / cross-origin if any
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin && !url.hostname.includes('fonts.')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for HTML pages when offline
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./404.html');
        }
      });

      return cachedResponse || fetchPromise;
    })
  );
});
