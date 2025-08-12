// Rishi Platform Service Worker v2.1.0
const CACHE_VERSION = 'rishi-v2.1.1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/bookings',
  '/manifest.json',
  '/assets/logos/rishi-logo-actual.png',
  '/offline.html'
];

// Cache-first resources (JS/CSS/fonts/images)
const CACHE_FIRST_PATTERNS = [
  /\.js$/,
  /\.css$/,
  /\.woff2?$/,
  /\.ttf$/,
  /\.otf$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.svg$/,
  /\.ico$/,
  /_next\/static/,
  /fonts/
];

// Stale-while-revalidate resources (app shell, non-critical JSON)
const STALE_WHILE_REVALIDATE_PATTERNS = [
  /\.html$/,
  /\/$/,
  /manifest\.json$/,
  /\.json$/
];

// Network-first resources (authenticated/dynamic API calls)
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /auth/,
  /session/,
  /login/,
  /logout/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.warn('[SW] Failed to cache some static assets:', error);
        // Continue installation even if some assets fail
        return Promise.resolve();
      });
    }).then(() => {
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('rishi-') && 
                   cacheName !== STATIC_CACHE && 
                   cacheName !== DYNAMIC_CACHE &&
                   cacheName !== API_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Helper function to determine caching strategy
function getCachingStrategy(url) {
  const urlString = url.toString();
  
  // Check Network-first patterns
  for (const pattern of NETWORK_FIRST_PATTERNS) {
    if (pattern.test(urlString)) {
      return 'network-first';
    }
  }
  
  // Check Cache-first patterns
  for (const pattern of CACHE_FIRST_PATTERNS) {
    if (pattern.test(urlString)) {
      return 'cache-first';
    }
  }
  
  // Check Stale-while-revalidate patterns
  for (const pattern of STALE_WHILE_REVALIDATE_PATTERNS) {
    if (pattern.test(urlString)) {
      return 'stale-while-revalidate';
    }
  }
  
  // Default to stale-while-revalidate for unknown resources
  return 'stale-while-revalidate';
}

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first fetch failed:', error);
    // Return offline page if available
    const offlineResponse = await caches.match('/offline.html');
    return offlineResponse || new Response('Offline', { status: 503 });
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Network-first fetch failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return JSON error for API calls
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({ error: 'Offline', message: 'Network unavailable' }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    return new Response('Network unavailable', { status: 503 });
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    console.warn('[SW] Stale-while-revalidate fetch failed:', error);
    return null;
  });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    // Update cache in background
    fetchPromise.then(() => {
      console.log('[SW] Cache updated in background for:', request.url);
    });
    return cachedResponse;
  }
  
  // Wait for network if no cached response
  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }
  
  // Fallback to offline page
  const offlineResponse = await caches.match('/offline.html');
  return offlineResponse || new Response('Offline', { status: 503 });
}

// Fetch event - handle all requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP(S) requests and POST/PUT/DELETE requests
  if (!url.protocol.startsWith('http') || request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests except for allowed domains
  const allowedOrigins = [
    'https://rishi-next.vercel.app',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];
  
  if (url.origin !== self.location.origin && !allowedOrigins.includes(url.origin)) {
    return;
  }
  
  // Special handling for navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        // Try to return cached app shell for offline navigation
        const cachedPage = await caches.match(request);
        if (cachedPage) {
          return cachedPage;
        }
        
        // Try to return the cached homepage as app shell
        const cachedHome = await caches.match('/');
        if (cachedHome) {
          return cachedHome;
        }
        
        // Final fallback to offline page
        const offlinePage = await caches.match('/offline.html');
        return offlinePage || new Response('Offline - Please check your connection', { 
          status: 503,
          headers: { 'Content-Type': 'text/html' }
        });
      })
    );
    return;
  }
  
  const strategy = getCachingStrategy(url);
  
  switch (strategy) {
    case 'cache-first':
      event.respondWith(cacheFirst(request));
      break;
    case 'network-first':
      event.respondWith(networkFirst(request));
      break;
    case 'stale-while-revalidate':
    default:
      event.respondWith(staleWhileRevalidate(request));
      break;
  }
});

// Background sync for offline requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-requests') {
    console.log('[SW] Syncing offline requests...');
    event.waitUntil(syncOfflineRequests());
  }
});

// Function to sync offline requests (can be expanded)
async function syncOfflineRequests() {
  // This can be expanded to handle queued offline requests
  console.log('[SW] Offline sync completed');
}

// Message handling for cache control
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        event.ports[0].postMessage({ cleared: true });
      })
    );
  }
});