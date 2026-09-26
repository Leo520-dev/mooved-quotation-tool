/* MOOVED Quotation Tool - Service Worker
 * 与 MOOVED_Quotation_Template.html 同目录部署。
 * 策略：网络优先 + 缓存回退（保证更新及时，离线可用）。
 */
var CACHE_NAME = 'mooved-quote-v3';
var CORE = [
  './MOOVED_Quotation_Template.html',
  './'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(c) {
      return c.addAll(CORE);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(hit) {
      var fetchP = fetch(e.request).then(function(res) {
        if (res && res.ok && res.type === 'basic') {
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
        }
        return res;
      }).catch(function() {
        return hit;
      });
      return hit || fetchP;
    })
  );
});
