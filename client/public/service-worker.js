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
"use client"

import { useEffect } from "react"

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope)
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error)
        })
    }
  }, []) // Empty dependency array means this effect runs once on mount

  return null // This component doesn't render anything visible
}
