const CACHE='reader-v19-polished-controls';
const ASSETS=['./index.html'];
const PATCH_CSS=`
<style id="control-layout-patch">
.controlStrip{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important;align-items:stretch!important}
.controlStrip button{width:100%!important;min-height:46px!important;border-radius:15px!important}
.controlStrip #play{grid-column:1/-1!important;order:1!important;width:100%!important;justify-self:stretch!important;font-size:17px!important}
.controlStrip #reset{grid-column:1/-1!important;order:2!important;width:100%!important;justify-self:stretch!important;display:flex!important;font-size:16px!important}
.controlStrip #pause{order:3!important;display:flex!important}
.controlStrip #back{order:4!important;display:flex!important}
.controlStrip #next{order:5!important;display:flex!important}
.controlStrip #fullBtn{order:6!important;display:flex!important}
.edgeControlsPatch{display:none!important}
@media(max-width:420px){
 .controlStrip{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
 .controlStrip #play,.controlStrip #reset{grid-column:1/-1!important}
 .controlStrip button{min-height:44px!important;font-size:14px!important}
 .controlStrip #play{font-size:16px!important}
}
@media(min-width:720px){
 .controlStrip{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:10px!important}
 .controlStrip #play,.controlStrip #reset{grid-column:1/-1!important}
 .controlStrip button{min-height:48px!important}
}
</style>`;
async function patchedIndex(req){
 const res=await fetch(req,{cache:'no-store'});
 let html=await res.text();
 html=html.replace(/<style id="control-layout-patch">[\s\S]*?<\/style>/,'');
 html=html.replace(/<script id="control-layout-patch-js">[\s\S]*?<\/script>/,'');
 if(!html.includes('control-layout-patch')) html=html.replace('</style>',PATCH_CSS+'</style>');
 return new Response(html,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
}
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 if(e.request.mode==='navigate'||e.request.url.endsWith('/index.html')){e.respondWith(patchedIndex(e.request).catch(()=>caches.match('./index.html')));return}
 e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return r}).catch(()=>caches.match(e.request)))
});