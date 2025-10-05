const CACHE_NAME = "bingo-audio-cache-v1"

// List all audio files to cache during installation
const urlsToCache = [
  // Control audios
  "/images/Audio/bingo/p.mp3",
  "/images/Audio/bingo/c.mp3",
  "/images/Audio/bingo/s.mp3",
  "/images/Audio/bingo/sh.mp3",
  "/images/Audio/bingo/w.mp3",
  "/images/Audio/bingo/t.mp3",
  "/images/Audio/bingo/n.mp3",
   "/images/Audio/bingo/clap.mp3",
   "/images/Audio/bingo/pass.mp3",


]

// Dynamically add number audios (b1-b75)
for (let i = 1; i <= 75; i++) {
  let prefix = ""
  if (i >= 1 && i <= 15) prefix = "b"
  else if (i >= 16 && i <= 30) prefix = "i"
  else if (i >= 31 && i <= 45) prefix = "n"
  else if (i >= 46 && i <= 60) prefix = "g"
  else if (i >= 61 && i <= 75) prefix = "o"
  if (prefix) {
    urlsToCache.push(`/images/Audio/bingo/${prefix}${i}.mp3`)
  }
}

// Install event: caches all specified audio assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Caching specified audio content...")
        const cachePromises = urlsToCache.map((url) => {
          return cache
            .add(url)
            .then(() => {
              console.log(`✅ Cached: ${url}`)
            })
            .catch((error) => {
              console.warn(`❌ Failed to cache: ${url}`, error)
              return Promise.reject(new Error(`Failed to cache ${url}: ${error.message}`))
            })
        })
        return Promise.allSettled(cachePromises).then((results) => {
          const failed = results.filter((result) => result.status === "rejected")
          if (failed.length > 0) {
            console.warn(`[Service Worker] Some audio files failed to cache:`, failed)
          } else {
            console.log("[Service Worker] All specified audio caching attempts completed.")
          }
        })
      })
      .catch((error) => {
        console.error("[Service Worker] Cache open failed during install:", error)
      }),
    self.skipWaiting(), // Force activation immediately
  )
})

// Fetch event: handles requests based on URL type
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url)

  // 1. Bypass cache for API requests
  if (requestUrl.pathname.startsWith("/api/")) {
    console.log("[Service Worker] Bypassing cache for API request:", event.request.url)
    event.respondWith(fetch(event.request))
    return // Stop processing this fetch event
  }

  // 2. Cache-first strategy for audio files (.mp3)
  if (requestUrl.pathname.endsWith(".mp3")) {
    console.log("[Service Worker] Handling audio request (cache-first):", event.request.url)
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => {
          if (response) {
            console.log("[Service Worker] Serving audio from cache:", event.request.url)
            return response
          }
          console.log("[Service Worker] Fetching audio from network and caching:", event.request.url)
          return fetch(event.request).then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
              return networkResponse
            }
            const responseToCache = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })
            return networkResponse
          })
        })
        .catch((error) => {
          console.error("[Service Worker] Audio fetch failed:", error)
          // Fallback for audio if network fails and not in cache
          return new Response(null, { status: 503, statusText: "Service Unavailable" })
        }),
    )
    return // Stop processing this fetch event
  }

  // 3. For all other requests (non-API, non-audio), just fetch from network, do NOT cache
  console.log("[Service Worker] Fetching from network (not caching):", event.request.url)
  event.respondWith(fetch(event.request))
})

// Activate event: cleans up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
    self.clients.claim(), // Take control of existing clients
  )
})

// const CACHE_NAME = "bingo-audio-cache-v1"

// // List all audio files to cache
// const urlsToCache = [
//   // Control audios
//   "/images/Audio/bingo/p.mp3",
//   "/images/Audio/bingo/c.mp3",
//   "/images/Audio/bingo/s.mp3",
//   "/images/Audio/bingo/sh.mp3",
//   "/images/Audio/bingo/w.mp3",
//   "/images/Audio/bingo/t.mp3",
//   "/images/Audio/bingo/n.mp3",
// ]

// // Dynamically add number audios (b1-b75)
// for (let i = 1; i <= 75; i++) {
//   let prefix = ""
//   if (i >= 1 && i <= 15) prefix = "b"
//   else if (i >= 16 && i <= 30) prefix = "i"
//   else if (i >= 31 && i <= 45) prefix = "n"
//   else if (i >= 46 && i <= 60) prefix = "g"
//   else if (i >= 61 && i <= 75) prefix = "o"
//   if (prefix) {
//     urlsToCache.push(`/images/Audio/bingo/${prefix}${i}.mp3`)
//   }
// }

// // Install event: caches all specified assets
// self.addEventListener("install", (event) => {
//   console.log("[Service Worker] Installing...")
//   event.waitUntil(
//     caches
//       .open(CACHE_NAME)
//       .then((cache) => {
//         console.log("[Service Worker] Caching content...")
//         // Use Promise.allSettled to ensure all promises resolve/reject,
//         // allowing successful caches to proceed even if some fail.
//         const cachePromises = urlsToCache.map((url) => {
//           return cache
//             .add(url)
//             .then(() => {
//               console.log(`✅ Cached: ${url}`)
//             })
//             .catch((error) => {
//               console.warn(`❌ Failed to cache: ${url}`, error)
//               // Return a rejected promise to indicate failure for this specific URL
//               return Promise.reject(new Error(`Failed to cache ${url}: ${error.message}`))
//             })
//         })
//         // Wait for all caching attempts to settle (either fulfilled or rejected)
//         return Promise.allSettled(cachePromises).then((results) => {
//           const failed = results.filter((result) => result.status === "rejected")
//           if (failed.length > 0) {
//             console.warn(`[Service Worker] Some files failed to cache:`, failed)
//           } else {
//             console.log("[Service Worker] All content caching attempts completed.")
//           }
//         })
//       })
//       .catch((error) => {
//         console.error("[Service Worker] Cache open failed:", error)
//       }),
//   )
// })

// // Fetch event: serves cached content first, then falls back to network
// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches
//       .match(event.request)
//       .then((response) => {
//         // Cache hit - return response
//         if (response) {
//           return response
//         }
//         // No cache hit - fetch from network
//         return fetch(event.request).then((networkResponse) => {
//           // Check if we received a valid response
//           if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
//             return networkResponse
//           }
//           // IMPORTANT: Clone the response. A response is a stream
//           // and can only be consumed once. We must clone it so that
//           // we can consume one in the cache and one in the browser.
//           const responseToCache = networkResponse.clone()
//           caches.open(CACHE_NAME).then((cache) => {
//             cache.put(event.request, responseToCache)
//           })
//           return networkResponse
//         })
//       })
//       .catch((error) => {
//         console.error("[Service Worker] Fetch failed:", error)
//         // You could return a fallback response here for offline pages/assets
//         // For audio, it might just fail silently if not in cache and offline
//       }),
//   )
// })

// // Activate event: cleans up old caches
// self.addEventListener("activate", (event) => {
//   console.log("[Service Worker] Activating...")
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames.map((cacheName) => {
//           if (cacheName !== CACHE_NAME) {
//             console.log("[Service Worker] Deleting old cache:", cacheName)
//             return caches.delete(cacheName)
//           }
//         }),
//       )
//     }),
//   )
// })