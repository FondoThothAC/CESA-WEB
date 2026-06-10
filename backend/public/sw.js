/**
 * CESA PWA - Industrial Service Worker v4.0
 */
const CACHE_NAME = 'cesa-industrial-v4.0';
const PREFIX = '/pwa';
const ASSETS = [
  PREFIX + '/',
  PREFIX + '/index.php',
  PREFIX + '/assets/js/pwa-router.js',
  PREFIX + '/assets/js/chatbot-global.js',
  PREFIX + '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Pre-cache individual screens
const SCREENS = [
  PREFIX + '/screens/home.php',
  PREFIX + '/screens/muro.php',
  PREFIX + '/screens/bazar.php',
  PREFIX + '/screens/tutoriales.php',
  PREFIX + '/screens/perfil.php',
  PREFIX + '/screens/admin.php'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll([...ASSETS, ...SCREENS]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls are Network First (Both root /api and local /pwa/api)
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Navigation requests: Serve the Master Shell (index.php)
  if (request.mode === 'navigate') {
    event.respondWith(caches.match(PREFIX + '/index.php') || fetch(request));
    return;
  }

  // Cache First for Everything Else
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || request.method !== 'GET') {
          return networkResponse;
        }
        const cacheCopy = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, cacheCopy));
        return networkResponse;
      });
    })
  );
});
