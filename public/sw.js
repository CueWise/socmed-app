const CACHE_NAME = 'socialflow-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/calendar',
  '/drafts', 
  '/analytics',
  '/manifest.json',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap'
];

const API_CACHE_URLS = [
  '/api/posts',
  '/api/brands',
  '/api/analytics',
  '/api/approvals'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => {
        // Take control of all pages
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              // Cache successful navigation responses
              if (response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(request, responseToCache));
              }
              return response;
            })
            .catch(() => {
              // Return cached index.html for offline navigation
              return caches.match('/');
            });
        })
    );
    return;
  }

  // Handle API requests with cache-first strategy for some endpoints
  if (url.pathname.startsWith('/api/')) {
    // For read-only API endpoints, use cache-first strategy
    if (request.method === 'GET' && API_CACHE_URLS.some(endpoint => url.pathname.startsWith(endpoint))) {
      event.respondWith(
        caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              // Return cached response and update cache in background
              fetch(request)
                .then((response) => {
                  if (response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                      .then((cache) => cache.put(request, responseToCache));
                  }
                })
                .catch(() => {
                  // Ignore network errors when updating cache
                });
              
              return cachedResponse;
            }
            
            // No cache, try network
            return fetch(request)
              .then((response) => {
                if (response.status === 200) {
                  const responseToCache = response.clone();
                  caches.open(CACHE_NAME)
                    .then((cache) => cache.put(request, responseToCache));
                }
                return response;
              })
              .catch(() => {
                // Return error response for offline API calls
                return new Response(
                  JSON.stringify({ error: 'Offline - cached data not available' }),
                  {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: { 'Content-Type': 'application/json' }
                  }
                );
              });
          })
      );
      return;
    }
    
    // For write operations, always try network first
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Store write operations for when online
          if (request.method !== 'GET') {
            return storeOfflineRequest(request);
          }
          
          return new Response(
            JSON.stringify({ error: 'Offline - operation will be retried when online' }),
            {
              status: 503,
              statusText: 'Service Unavailable', 
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request)
          .then((response) => {
            // Cache successful responses for static assets
            if (response.status === 200 && 
                (request.destination === 'style' || 
                 request.destination === 'script' ||
                 request.destination === 'font' ||
                 request.destination === 'image')) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(request, responseToCache));
            }
            return response;
          });
      })
  );
});

// Background sync for offline operations
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'offline-posts') {
    event.waitUntil(retryOfflineRequests());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: 'You have new notifications in SocialFlow',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-72x72.png'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = data;
  }

  event.waitUntil(
    self.registration.showNotification('SocialFlow', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Helper function to store offline requests
async function storeOfflineRequest(request) {
  const requestData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.text(),
    timestamp: Date.now()
  };
  
  // Store in IndexedDB for retry when online
  const dbRequest = indexedDB.open('SocialFlowOffline', 1);
  
  dbRequest.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('requests')) {
      db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
    }
  };
  
  dbRequest.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(['requests'], 'readwrite');
    const store = transaction.objectStore('requests');
    store.add(requestData);
  };
  
  // Register for background sync
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    self.registration.sync.register('offline-posts');
  }
  
  return new Response(
    JSON.stringify({ 
      message: 'Request stored for retry when online',
      stored: true 
    }),
    {
      status: 202,
      statusText: 'Accepted',
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Helper function to retry offline requests
async function retryOfflineRequests() {
  const dbRequest = indexedDB.open('SocialFlowOffline', 1);
  
  return new Promise((resolve, reject) => {
    dbRequest.onsuccess = async (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['requests'], 'readwrite');
      const store = transaction.objectStore('requests');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = async () => {
        const requests = getAllRequest.result;
        
        for (const requestData of requests) {
          try {
            const response = await fetch(requestData.url, {
              method: requestData.method,
              headers: requestData.headers,
              body: requestData.body
            });
            
            if (response.ok) {
              // Successfully retried, remove from storage
              store.delete(requestData.id);
              console.log('Successfully retried offline request:', requestData.url);
            }
          } catch (error) {
            console.log('Failed to retry request:', requestData.url, error);
          }
        }
        
        resolve();
      };
      
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    dbRequest.onerror = () => reject(dbRequest.error);
  });
}

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

async function syncContent() {
  try {
    // Sync latest content when app is in background
    const response = await fetch('/api/posts?status=scheduled');
    if (response.ok) {
      const posts = await response.json();
      
      // Cache updated content
      const cache = await caches.open(CACHE_NAME);
      await cache.put('/api/posts?status=scheduled', response);
      
      console.log('Content synced in background');
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}
