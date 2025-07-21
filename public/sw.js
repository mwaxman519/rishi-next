// Service Worker for Rishi Platform - Offline Field Worker Support
const CACHE_NAME = 'rishi-platform-v1';
const OFFLINE_CACHE = 'rishi-offline-v1';
const DATA_CACHE = 'rishi-data-v1';

// Critical assets for offline functionality - ENTIRE APP
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/bookings',
  '/bookings/calendar',
  '/bookings/form',
  '/locations',
  '/locations/directory',
  '/staff',
  '/staff/schedule',
  '/staff/availability',
  '/inventory',
  '/inventory/kits',
  '/inventory/kit-instances',
  '/admin',
  '/analytics',
  '/reports',
  '/training',
  '/contacts',
  '/auth/login',
  '/manifest.json',
  '/favicon.ico',
  '/rishi-logo-new.svg'
];

// API endpoints that need offline caching - ENTIRE APP DATA
const API_ENDPOINTS = [
  '/api/auth-service/session',
  '/api/bookings',
  '/api/bookings/stats',
  '/api/bookings/calendar',
  '/api/locations',
  '/api/locations/cities',
  '/api/locations/states', 
  '/api/staff',
  '/api/staff/availability',
  '/api/staff/schedule',
  '/api/inventory/kits',
  '/api/inventory/kit-instances',
  '/api/inventory/kit-instances/stats',
  '/api/organizations',
  '/api/user-organization-preferences',
  '/api/contacts',
  '/api/analytics/dashboard',
  '/api/reports'
];

// Install service worker and cache critical assets
self.addEventListener('install', event => {
  console.log('Rishi Platform SW: Installing for offline field worker support');
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)),
      caches.open(OFFLINE_CACHE).then(cache => cache.addAll(API_ENDPOINTS.map(url => url + '?offline=true')))
    ])
  );
  self.skipWaiting();
});

// Activate service worker and clean old caches
self.addEventListener('activate', event => {
  console.log('Rishi Platform SW: Activated for field worker offline support');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE && cacheName !== DATA_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Handle fetch requests with offline-first strategy for field workers
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with cache-first for offline support - ALL API ROUTES
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
  }
  // Handle static assets with stale-while-revalidate
  else if (STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith('/_next/')) {
    event.respondWith(handleStaticAssets(request));
  }
  // Default network-first strategy
  else {
    event.respondWith(handleDefault(request));
  }
});

// API request handler with offline queue support
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  const cache = await caches.open(DATA_CACHE);

  try {
    // Try network first - preserve authentication headers
    const networkResponse = await fetch(request, {
      credentials: 'same-origin',
      headers: request.headers
    });
    
    if (networkResponse.ok) {
      // Cache successful GET responses for ALL API endpoints
      if (request.method === 'GET') {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Rishi Platform SW: Network failed, checking cache for', url.pathname);
    
    // For GET requests, return cached data
    if (request.method === 'GET') {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // For POST/PUT requests, queue for later sync - NO FALLBACK RESPONSES
    if (request.method === 'POST' || request.method === 'PUT') {
      await queueOfflineRequest(request);
      // Return error status - application must handle offline state explicitly
      throw new Error(`CRITICAL: Cannot process ${request.method} request offline - queued for sync`);
    }

    // FAIL FAST - No graceful degradation allowed per security requirements
    throw new Error(`CRITICAL: Required data not available offline for ${url.pathname}`);
  }
}

// Static assets handler
async function handleStaticAssets(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Return cached version immediately, update in background
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response);
      }
    }).catch(() => {});
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // FAIL FAST - No fallback pages allowed per security requirements
    if (request.mode === 'navigate') {
      const cachedPage = await caches.match('/');
      if (!cachedPage) {
        throw new Error('CRITICAL: Required page not cached for offline use');
      }
      return cachedPage;
    }
    throw error;
  }
}

// Default handler
async function handleDefault(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    if (!cachedResponse) {
      // FAIL FAST - No fallback responses per security requirements
      throw new Error(`CRITICAL: Required resource not cached for offline use: ${request.url}`);
    }
    return cachedResponse;
  }
}

// Queue offline requests for sync when online
async function queueOfflineRequest(request) {
  const requestData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.text(),
    timestamp: Date.now()
  };

  const cache = await caches.open(OFFLINE_CACHE);
  const queueKey = `offline-queue-${Date.now()}-${Math.random()}`;
  
  await cache.put(queueKey, new Response(JSON.stringify(requestData), {
    headers: { 'Content-Type': 'application/json' }
  }));

  console.log('Rishi Platform SW: Queued offline request:', request.url);
}

// Background sync for queued requests
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineRequests());
  }
});

// Sync queued requests when back online
async function syncOfflineRequests() {
  console.log('Rishi Platform SW: Syncing offline requests');
  const cache = await caches.open(OFFLINE_CACHE);
  const requests = await cache.keys();

  for (const request of requests) {
    if (request.url.includes('offline-queue-')) {
      try {
        const response = await cache.match(request);
        const requestData = await response.json();
        
        // Replay the original request
        const replayResponse = await fetch(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body
        });

        if (replayResponse.ok) {
          await cache.delete(request);
          console.log('Rishi Platform SW: Synced offline request:', requestData.url);
        }
      } catch (error) {
        console.log('Rishi Platform SW: Failed to sync request:', error);
      }
    }
  }
}

// Handle push notifications for field worker updates
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'rishi-notification',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Details' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Rishi Platform Update', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data.type === 'PRELOAD_COMPLETE') {
    console.log('Rishi Platform SW: Critical data preload completed');
  } else if (event.data.type === 'SYNC_WHEN_ONLINE') {
    syncOfflineRequests();
  }
});

console.log('Rishi Platform Service Worker: Loaded with FULL APP offline support');