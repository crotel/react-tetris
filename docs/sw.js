// [Working example](/serviceworker-cookbook/offline-status/).

var CACHE_NAME = "dependencies-cache";

// Files required to make this app work offline
var REQUIRED_FILES = [
    "app-1.0.1.js",
    "bg.png",
    "css-1.0.1.css",
    "index.html",
    "loader.css",
    "music.mp3",
    "tetris.mp3",
    "tetris.png",
    "favicon.ico",
    "sw.js",
];

// self.addEventListener("install", function (event) {
//     // Perform install step:  loading each required file into cache
//     event.waitUntil(
//         caches
//             .open(CACHE_NAME)
//             .then(function (cache) {
//                 // Add all offline dependencies to the cache
//                 console.log(
//                     "[install] Caches opened, adding all core components" +
//                         "to cache",
//                 );
//                 return cache.addAll(REQUIRED_FILES);
//             })
//             .then(function () {
//                 console.log(
//                     "[install] All required resources have been cached, " +
//                         "we're good!",
//                 );
//                 return self.skipWaiting();
//             }),
//     );
// });
self.addEventListener("install", function (event) {
    // Put `offline.html` page into cache
    // var offlineRequest = new Request('index.html');
    event.waitUntil(
        fetch(event.request)
            .then(function (response) {
                return caches.open(CACHE_NAME).then(function (cache) {
                    console.log(
                        "[oninstall] Cached offline page",
                        response.url,
                    );
                    // return cache.put(CACHE_NAME, response);
                    return cache.addAll(REQUIRED_FILES);
                });
            })
            .then(function () {
                console.log(
                    "[install] All required resources have been cached, " +
                        "we're good!",
                );
                return self.skipWaiting();
            }),
    );
});
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         // Cache hit - return the response from the cached version
//         if (response) {
//           console.log(
//             '[fetch] Returning from ServiceWorker cache: ',
//             event.request.url
//           );
//           return response;
//         }

//         // Not in cache - return the result from the live server
//         // `fetch` is essentially a "fallback"
//         console.log('[fetch] Returning from server: ', event.request.url);
//         return fetch(event.request);
//       }
//     )
//   );
// });
self.addEventListener("fetch", function (event) {
    // Only fall back for HTML documents.
    var request = event.request;
    // && request.headers.get('accept').includes('text/html')
    if (request.method === "GET") {
        // `fetch()` will use the cache when possible, to this examples
        // depends on cache-busting URL parameter to avoid the cache.
        event.respondWith(
            fetch(request).catch(function (error) {
                // `fetch()` throws an exception when the server is unreachable but not
                // for valid HTTP responses, even `4xx` or `5xx` range.
                console.error(
                    "[onfetch] Failed. Serving cached offline fallback " +
                        error,
                );
                return caches.open(CACHE_NAME).then(function (cache) {
                    return cache.match(event.request);
                });
            }),
        );
    }
    // Any other handlers come here. Without calls to `event.respondWith()` the
    // request will be handled without the ServiceWorker.
});

self.addEventListener("activate", function (event) {
    console.log("[activate] Activating ServiceWorker!");

    // Calling claim() to force a "controllerchange" event on navigator.serviceWorker
    console.log("[activate] Claiming this ServiceWorker!");
    event.waitUntil(self.clients.claim());
});
