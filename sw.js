const CACHE='reader-v20-stable-button-grid';
const ASSETS=['./index.html'];
const PATCH_CSS=`
<style id="control-layout-patch">
/* Primary reading controls */
.controlStrip{
 display:grid!important;
 grid-template-columns:repeat(2,minmax(0,1fr))!important;
 gap:10px!important;
 align-items:stretch!important;
 width:100%!important;
 margin-top:10px!important;
 direction:rtl!important;
}
.controlStrip button{
 width:100%!important;
 min-width:0!important;
 min-height:48px!important;
 border-radius:16px!important;
 padding:12px 10px!important;
 font-size:15px!important;
 line-height:1.15!important;
 justify-content:center!important;
 text-align:center!important;
 box-shadow:0 8px 18px rgba(0,0,0,.18)!important;
}
.controlStrip #play{
 grid-column:1/-1!important;
 order:1!important;
 min-height:54px!important;
 font-size:18px!important;
 font-weight:950!important;
}
.controlStrip #reset{
 grid-column:1/-1!important;
 order:2!important;
 min-height:52px!important;
 font-size:17px!important;
 font-weight:950!important;
 display:flex!important;
}
.controlStrip #pause{order:3!important;display:flex!important}
.controlStrip #back{order:4!important;display:flex!important}
.controlStrip #next{order:5!important;display:flex!important}
.controlStrip #fullBtn{order:6!important;display:flex!important}
.edgeControlsPatch{display:none!important}
/* Secondary toolbar */
.miniStrip{
 display:grid!important;
 grid-template-columns:repeat(2,minmax(0,1fr))!important;
 gap:9px!important;
 width:100%!important;
 margin:10px 0!important;
 align-items:stretch!important;
}
.miniStrip > *{
 width:100%!important;
 min-width:0!important;
 min-height:42px!important;
 border-radius:14px!important;
}
.speedSelectLabel{
 grid-column:1/-1!important;
 display:flex!important;
 align-items:center!important;
 justify-content:space-between!important;
 gap:8px!important;
 padding:10px 12px!important;
}
.speedSelectLabel select{width:auto!important;min-width:100px!important}
.miniStrip b{
 display:flex!important;
 align-items:center!important;
 justify-content:center!important;
 background:#020617!important;
 border:1px solid var(--border)!important;
 color:var(--text)!important;
 border-radius:14px!important;
 padding:10px!important;
}
@media(min-width:720px){
 .controlStrip{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:10px!important}
 .controlStrip #play,.controlStrip #reset{grid-column:1/-1!important}
 .controlStrip button{min-height:50px!important}
 .miniStrip{grid-template-columns:1.3fr repeat(5,minmax(0,1fr))!important}
 .speedSelectLabel{grid-column:auto!important}
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