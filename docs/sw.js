const CACHE_VERSION = "bGR1MjJncDE";
const addResourcesToCache = async (resources) => {
    const cache = await caches.open(CACHE_VERSION);
    await cache.addAll(resources);
};

const putInCache = async (request, response) => {
    const cache = await caches.open(CACHE_VERSION);
    await cache.put(request, response);
};

const cacheFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
    // First try to get the resource from the cache
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }

    // Next try to use the preloaded response, if it's there
    const preloadResponse = await preloadResponsePromise;
    if (preloadResponse) {
        console.info("using preload response", preloadResponse);
        putInCache(request, preloadResponse.clone());
        return preloadResponse;
    }

    // Next try to get the resource from the network
    try {
        const responseFromNetwork = await fetch(request);
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one
        putInCache(request, responseFromNetwork.clone());
        return responseFromNetwork;
    } catch (error) {
        console.log(
            "Fetch failed; returning offline page instead.",
            error.message,
        );
        console.log(new URL(request).pathname);
        const cache = await caches.open(CACHE_VERSION);
        const cachedResponse = await cache.match(new URL(request.url).pathname);
        return cachedResponse;

    }
};

const enableNavigationPreload = async () => {
    if (self.registration.navigationPreload) {
        // Enable navigation preloads!
        await self.registration.navigationPreload.enable();
    }
};

self.addEventListener("activate", (event) => {
    event.waitUntil(enableNavigationPreload());
    self.clients.claim();
});

self.addEventListener("install", (event) => {
    event.waitUntil(
        addResourcesToCache([
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
        ]),
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        cacheFirst({
            request: event.request,
            preloadResponsePromise: event.preloadResponse,
            fallbackUrl: "index.html",
        }),
    );
});
