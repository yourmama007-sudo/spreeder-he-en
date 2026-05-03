const CACHE='reader-v16-controls';
const ASSETS=['./index.html'];
const PATCH_CSS=`
<style id="control-layout-patch">
.controlStrip{display:grid!important;grid-template-columns:1fr 1fr 1fr!important;gap:8px!important;direction:ltr!important}
.controlStrip #play{grid-column:1!important;justify-self:start!important;width:min(160px,100%)!important}
.controlStrip #back{grid-column:2!important}
.controlStrip #next{grid-column:3!important}
.controlStrip #pause,.controlStrip #reset{display:none!important}
.edgeControlsPatch{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;margin-top:8px!important;direction:ltr!important}
.edgeControlsPatch #pause{display:flex!important;justify-self:start!important;width:min(160px,100%)!important}
.edgeControlsPatch #reset{display:flex!important;justify-self:end!important;width:min(160px,100%)!important}
@media(max-width:420px){.controlStrip{grid-template-columns:1.15fr 1fr 1fr!important}.edgeControlsPatch #pause,.edgeControlsPatch #reset{width:100%!important}}
</style>`;
const PATCH_JS=`
<script id="control-layout-patch-js">
(function(){
 function patch(){
  var strip=document.querySelector('.controlStrip');
  var pause=document.getElementById('pause');
  var reset=document.getElementById('reset');
  if(!strip||!pause||!reset||document.querySelector('.edgeControlsPatch')) return;
  var edge=document.createElement('div');
  edge.className='edgeControlsPatch';
  strip.insertAdjacentElement('afterend',edge);
  edge.appendChild(pause);
  edge.appendChild(reset);
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',patch); else patch();
})();
</script>`;
async function patchedIndex(req){
 const res=await fetch(req,{cache:'no-store'});
 let html=await res.text();
 if(!html.includes('control-layout-patch')){
  html=html.replace('</style>',PATCH_CSS+'</style>').replace('</body>',PATCH_JS+'</body>');
 }
 return new Response(html,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
}
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 if(e.request.mode==='navigate'||e.request.url.endsWith('/index.html')){e.respondWith(patchedIndex(e.request).catch(()=>caches.match('./index.html')));return}
 e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return r}).catch(()=>caches.match(e.request)))
});