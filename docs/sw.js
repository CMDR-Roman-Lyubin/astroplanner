const CACHE='sky-13-mwdfqi7e';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(["./","catalog-extra.js","manifest.webmanifest","icon-192.png","icon-512.png"].map(f=>new Request(f,{cache:'reload'})))));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('sky-')&&k!=CACHE&&k!='sky-ref').map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  // снимки обзора неба и версии библиотек не меняются: раз скачанное хранится навсегда и работает без сети. Кэш модели распознавания («transformers-cache») не трогаем
  if(u.hostname=='skyview.gsfc.nasa.gov'||u.hostname=='raw.githubusercontent.com'||u.hostname.endsWith('.wikimedia.org')||u.hostname=='cdn.jsdelivr.net'){e.respondWith(caches.open('sky-ref').then(c=>c.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{c.put(e.request,r.clone());return r}))));return}
  if(e.request.method!='GET'||u.origin!=location.origin)return;
  e.respondWith(caches.open(CACHE).then(c=>c.match(e.request,{ignoreSearch:true})).then(hit=>hit||fetch(e.request)));
});
