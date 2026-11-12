const CACHE='sky-v1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','manifest.webmanifest','icon-192.png','icon-512.png'])));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  // снимки обзора неба не меняются: раз увиденный хранится навсегда и показывается без сети
  if(u.hostname=='skyview.gsfc.nasa.gov'||u.hostname=='raw.githubusercontent.com'){e.respondWith(caches.open('sky-ref').then(c=>c.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{c.put(e.request,r.clone());return r}))));return}
  if(e.request.method!='GET'||u.origin!=location.origin)return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>{
    const net=fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r});
    return hit?(net.catch(()=>{}),hit):net}));
});
