// ====== القرآن الكريم - Service Worker ======
const CACHE_NAME = ‘quran-v1’;


const PRECACHE = [
‘/’,
‘/index.html’,
‘https://cdn.jsdelivr.net/gh/thetruetruth/quran-data-kfgqpc@main/hafs/font/hafs.18.woff2’,
];


self.addEventListener(‘install’, event => {
self.skipWaiting();
event.waitUntil(
caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
);
});


self.addEventListener(‘activate’, event => {
event.waitUntil(
caches.keys().then(keys =>
Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
).then(() => self.clients.claim())
);
});


self.addEventListener(‘fetch’, event => {
const url = new URL(event.request.url);


if (url.pathname.startsWith(’/surah/’) && url.pathname.endsWith(’.json’)) {
event.respondWith(
caches.open(CACHE_NAME).then(async cache => {
const cached = await cache.match(event.request);
if (cached) return cached;
try {
const res = await fetch(event.request);
if (res.ok) cache.put(event.request, res.clone());
return res;
} catch {
return new Response(JSON.stringify({ error: ‘offline’ }), {
headers: { ‘Content-Type’: ‘application/json’ }
});
}
})
);
return;
}


if (url.hostname.includes(‘jsdelivr’) || url.hostname.includes(‘cdn’)) {
event.respondWith(
caches.open(CACHE_NAME).then(async cache => {
const cached = await cache.match(event.request);
if (cached) return cached;
const res = await fetch(event.request);
if (res.ok) cache.put(event.request, res.clone());
return res;
})
);
return;
}


event.respondWith(
fetch(event.request)
.then(res => {
if (res.ok) {
const clone = res.clone();
caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
}
return res;
})
.catch(() => caches.match(event.request))
);
});