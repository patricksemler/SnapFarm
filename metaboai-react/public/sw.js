// SnapFarm Service Worker for Offline Functionality
const CACHE_NAME = 'snapfarm-v1';
const STATIC_CACHE = 'snapfarm-static-v1';
const DYNAMIC_CACHE = 'snapfarm-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  // Add your built assets here after build
];

// TensorFlow.js and model files to cache
const MODEL_FILES = [
  '/models/mobilenetv3/model.json',
  '/models/mobilenetv3/weights.bin',
  // Add your actual model file paths here
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      }),
      // Cache model files
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching model files');
        return cache.addAll(MODEL_FILES).catch((error) => {
          console.warn('Service Worker: Some model files failed to cache:', error);
          // Don't fail installation if model files aren't available yet
        });
      })
    ])
  );
  
  // Force activation
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all pages
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (url.pathname.startsWith('/models/')) {
    // Model files - cache first strategy
    event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
  } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/)) {
    // Static assets - cache first strategy
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else if (url.pathname === '/' || url.pathname.startsWith('/src/')) {
    // App files - network first, fallback to cache
    event.respondWith(networkFirstStrategy(request, STATIC_CACHE));
  } else {
    // Other requests - network first with dynamic caching
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
  }
});

// Cache-first strategy (for static assets and models)
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Serving from cache:', request.url);
      return cachedResponse;
    }
    
    console.log('Service Worker: Fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Cache-first strategy failed:', error);
    
    // Return offline fallback for critical files
    if (request.url.includes('model.json')) {
      return new Response(
        JSON.stringify({ error: 'Model not available offline' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    throw error;
  }
}

// Network-first strategy (for app files and dynamic content)
async function networkFirstStrategy(request, cacheName) {
  try {
    console.log('Service Worker: Fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache:', request.url);
    
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await cache.match('/');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    throw error;
  }
}

// Handle background sync for saving diagnoses when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-diagnoses') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(syncDiagnoses());
  }
});

// Sync diagnoses with server when online (placeholder for future implementation)
async function syncDiagnoses() {
  try {
    // This would sync local storage data with a backend when implemented
    console.log('Service Worker: Syncing diagnoses...');
    
    // For now, just log that sync would happen
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: 'Diagnoses synced successfully'
      });
    });
  } catch (error) {
    console.error('Service Worker: Sync failed:', error);
  }
}

// Handle push notifications (for future implementation)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New update available',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      data: data.data || {},
      actions: [
        {
          action: 'open',
          title: 'Open App'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'SnapFarm', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Log service worker status
console.log('SnapFarm Service Worker loaded successfully');