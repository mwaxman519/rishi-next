// Service Worker for Rishi Platform PWA
const CACHE_NAME = 'rishi-platform-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/favicon.ico',
  '/auth/login',
  '/dashboard',
  '/locations',
  '/bookings',
  '/kits'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
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