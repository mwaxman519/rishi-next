// Service Worker for Rishi Platform PWA - DISABLED FOR DEVELOPMENT
const CACHE_NAME = 'rishi-platform-v1';

// Install service worker but don't cache anything in development
self.addEventListener('install', event => {
  console.log('Service Worker installed but caching disabled for development');
});

// Fetch event - bypass service worker in development
self.addEventListener('fetch', event => {
  // Always fetch from network in development to avoid caching issues
  event.respondWith(fetch(event.request));
});

// Activate service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});