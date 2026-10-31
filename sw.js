/* Holy Bible — offline support.
   App shell: network-first (fresh builds win when online), cache
   fallback so the app opens with no network after the first load.
   Bible API calls: cache-first — scripture text does not change, so
   every chapter or book list fetched once stays readable offline. */
var CACHE = 'holy-bible-v1';
var ASSETS = [
  './',
  './index.html',
  './favicon-32.png',
  './favicon-180.png',
  './icon-mono.png'
];
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); })
  );
});
self.addEventListener('activate', function(e){
  e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin === self.location.origin){
    e.respondWith(
      fetch(e.request).then(function(res){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        return res;
      }).catch(function(){
        return caches.match(e.request, { ignoreSearch: true });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function(hit){
        if (hit) return hit;
        return fetch(e.request).then(function(res){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
          return res;
        });
      })
    );
  }
});
