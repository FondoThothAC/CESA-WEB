/**
 * CESA PWA - Industrial Service Worker v4.1
 * v4.1: Stale-While-Revalidate para el shell y screens (app rápida SIEMPRE actualizada),
 *       precache conservador, runtime cache de assets y screens visitadas.
 */
const CACHE_NAME = 'cesa-industrial-v4.1';
const PREFIX = '/pwa';
const CORE_ASSETS = [
  PREFIX + '/index.php',
  PREFIX + '/assets/js/pwa-router.js',
  PREFIX + '/assets/js/chatbot-global.js',
  PREFIX + '/manifest.json'
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
    caches.open(CACHE_NAME).then(cache => cache.addAll([...CORE_ASSETS, ...SCREENS]))
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

/**
 * Stale-While-Revalidate: responde al instante desde caché (si existe)
 * y refresca la copia en segundo plano para la próxima visita.
 */
function staleWhileRevalidate(request, cacheName = CACHE_NAME) {
  return caches.open(cacheName).then(async cache => {
    const cached = await cache.match(request);
    const networkFetch = fetch(request).then(networkResponse => {
      if (networkResponse && networkResponse.status === 200 && request.method === 'GET') {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }).catch(() => cached);
    return cached || networkFetch;
  });
}

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: Network First con fallback a caché (offline)
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Navegaciones (shell y screens .php): SWR — instantáneo desde caché + refresco en segundo plano
  if (request.mode === 'navigate' || url.pathname.includes('/pwa/screens/')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Externos (Tailwind CDN, Font Awesome): SWR con límite razonable
  if (url.origin !== location.origin) {
    if (request.method === 'GET') {
      event.respondWith(staleWhileRevalidate(request));
    }
    return;
  }

  // Resto (assets propios): Cache First con llenado en runtime
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
