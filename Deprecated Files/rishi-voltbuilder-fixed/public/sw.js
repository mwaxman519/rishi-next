// Minimal Service Worker for Rishi Platform
const CACHE_NAME = 'rishi-platform-v2';
const STATIC_CACHE = 'rishi-static-v1';

// Only cache essential, existing static assets
const ESSENTIAL_ASSETS = [
  '/manifest.json',
  '/favicon.ico',
  '/rishi-logo-new.svg'
];

// Install service worker with minimal caching
self.addEventListener('install', event => {
  console.log('Rishi SW: Installing minimal service worker');
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      // Only cache essential assets that definitely exist
      return cache.addAll(ESSENTIAL_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate and clean old caches
self.addEventListener('activate', event => {
  console.log('Rishi SW: Activating minimal service worker');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            console.log('Rishi SW: Cleaning old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Minimal fetch handler - only intercept essential static assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle essential static assets, let everything else pass through
  if (ESSENTIAL_ASSETS.includes(url.pathname)) {
    event.respondWith(handleStaticAsset(request));
  }
  // Let all other requests pass through normally (no interception)
});

// Simple static asset handler
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  try {
    // Network first for fresh content
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Fallback to cache only for essential assets
    console.log('Rishi SW: Network failed, trying cache for:', request.url);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Rishi Platform Service Worker: Loaded with minimal caching');