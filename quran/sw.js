// ====== القرآن الكريم - Service Worker ======
// ملاحظة: كل مرة تسوي تعديل على index.html أو أي ملف مهم، لازم تغيّر رقم النسخة هنا
// (مثلاً من quran-v1 إلى quran-v2) عشان يجبر المتصفح يمسح الكاش القديم ويحمّل النسخة الجديدة.
const CACHE_NAME = ‘quran-v2’;

const PRECACHE = [
‘/quran/’,
‘/quran/index.html’,
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

// ملفات آيات السور: كاش مع أولوية للكاش (offline-first)
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

// خطوط وملفات CDN: كاش مع أولوية للكاش
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

// باقي الملفات (خصوصًا index.html): أولوية للشبكة أولاً حتى تصل التحديثات فورًا،
// مع رجوع للكاش فقط إذا ما فيه إنترنت.
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
