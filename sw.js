const staticCacheName = 'static-site-v2';
const dynamicCacheName = 'dynamic-site-v2';

const ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/css/materialize.min.css',
    '/js/app.js',
    '/js/ui.js',
    '/js/materialize.min.js',
    '/offline.html',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2'
]

self.addEventListener('install', async (event) => {
    const cache = await caches.open(staticCacheName);
    await cache.addAll(ASSETS);
    // // ждем пока выполнится все внутри waitUntil( здесь )
    // event.waitUntil(
    //     // кешируем данные
    //     caches.open(staticCacheName).then(cache => {
    //         console.log('caches add ASSETS');
    //         cache.addAll(ASSETS);
    //     })
    // )


});

self.addEventListener('activate', async (event) => {
    // очистка старых ключей кеша
    const cachesKeysArr = await caches.keys();
    await Promise.all(cachesKeysArr.filter(key => key !== staticCacheName && key !== dynamicCacheName).map(key => caches.delete(key)));
});

self.addEventListener('fetch', (event) => {
    event.respondWith(cacheFirst(event.request));
    // event.respondWith(
    //     caches.match(event.request).then( cachesRes => {
    //         return cachesRes || fetch(event.request).then(response => {
    //             return caches.open(dynamicCacheName).then( caches => {
    //                 caches.put(event.request.url, response.clone());
    //                 return response;
    //             })
    //         })
    //     })
    // );
});

async function cacheFirst(request) {
    const cached = await caches.match(request);
    try {
        return cached ?? await fetch(request).then(response => {
            console.log('###: response', response);
            return networkFirst(request);
        });
    } catch (e) {
        return networkFirst(request);
    }
}

async function networkFirst(request) {
    console.log('networkFirst');
    const cache = await caches.open(dynamicCacheName);
    try {
        const response = await fetch(request);
        await cache.put(request, response.clone());
        return response;
    } catch (e) {
        const cached = await cache.match(request);
        return cached ?? await caches.match('/offline.html');
    }
}