
// Basic service worker to prevent 404 errors
// This is a minimal service worker for the Rishi platform

self.addEventListener('install', (event) => {
  console.log('Rishi SW: Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Rishi SW: Service Worker activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let all requests pass through normally
  return;
});
