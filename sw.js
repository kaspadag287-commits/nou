'use strict';

const CACHE     = 'radio-hub-v1';
const SHELL     = [
  './radio_hub_pwa.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
];

/* Install: cache app shell */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

/* Activate: remove old caches */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Fetch: cache-first for shell, network-only for radio streams */
self.addEventListener('fetch', e => {
  const url = e.request.url;

  /* Always fetch radio streams live — never cache */
  if (
    url.includes('.mp3') || url.includes('.aac') ||
    url.includes('.m3u8') || url.includes('/stream') ||
    url.includes('/live') || url.includes('icecast') ||
    url.includes('rtbf.be/') || url.includes('radiofrance') ||
    url.includes('grtvstream') || url.includes('ortas.live') ||
    url.includes('kwikmotion') || url.includes('itworkscdn')
  ) {
    e.respondWith(fetch(e.request));
    return;
  }

  /* Cache-first for app shell */
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
