const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [];
let collection = [];

self.addEventListener('install', function (event) {
    console.error('service worker shared worker')
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                console.error('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function (event) {
    console.error('fetch data');
});

self.addEventListener('message', async function (event) {
    if (event.data === 'getData') {
        event.source.postMessage({ success: true, data: collection });
    } else {
        try {
            const response = await fetch(event.data);
            const data = await response.json();
            collection = data;
            console.error('service worker', data.length)
            // event.source.postMessage.postMessage({ success: true, data });
        } catch (error) {
            event.source.postMessage({ success: false, error: error.message });
        }
    }
});