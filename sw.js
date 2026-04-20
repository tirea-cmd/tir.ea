const CACHE='tirea-launcher-v4';
const ASSETS=[
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon.png',
  './app-calculator.png',
  './app-tireanode.png',
  './app-platforma.png',
  './app-decorh.png',
  './app-tireapark.png',
  './app-scantir.png',
  './app-apptopo.png',
  './app-holograme.png',
  './app-pastoral.png',
  './app-tireaparkadmin.png'
];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>
      Promise.all(ASSETS.map(a=>c.add(a).catch(err=>console.warn('skip:',a))))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
     .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==self.location.origin)return;

  // Network-first pentru HTML — mereu primești versiunea nouă când ești online
  if(e.request.mode==='navigate' || e.request.destination==='document'){
    e.respondWith(
      fetch(e.request).then(res=>{
        const cp=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,cp));
        return res;
      }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))
    );
    return;
  }

  // Cache-first pentru restul
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
      if(res && res.status===200){
        const cp=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,cp));
      }
      return res;
    }).catch(()=>{}))
  );
});
