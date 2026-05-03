const CACHE='reader-v22-nikud-speech';
const ASSETS=['./index.html'];
const PATCH_CSS=`
<style id="control-layout-patch">
.controlStrip{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;align-items:stretch!important;width:100%!important;margin-top:10px!important;direction:rtl!important}
.controlStrip button{width:100%!important;min-width:0!important;min-height:48px!important;border-radius:16px!important;padding:12px 10px!important;font-size:15px!important;line-height:1.15!important;justify-content:center!important;text-align:center!important;box-shadow:0 8px 18px rgba(0,0,0,.18)!important}
.controlStrip #play{grid-column:1/-1!important;order:1!important;min-height:54px!important;font-size:18px!important;font-weight:950!important}
.controlStrip #reset{grid-column:1/-1!important;order:2!important;min-height:52px!important;font-size:17px!important;font-weight:950!important;display:flex!important}
.controlStrip #pause{order:3!important;display:flex!important}.controlStrip #back{order:4!important;display:flex!important}.controlStrip #next{order:5!important;display:flex!important}.controlStrip #fullBtn{display:none!important}.edgeControlsPatch{display:none!important}
.reader{position:relative!important}.readerFullBtn{position:absolute!important;top:10px!important;left:10px!important;z-index:8!important;width:42px!important;height:42px!important;min-height:42px!important;border-radius:14px!important;border:1px solid rgba(248,250,252,.32)!important;background:rgba(2,6,23,.18)!important;color:rgba(248,250,252,.92)!important;backdrop-filter:blur(8px)!important;box-shadow:none!important;padding:0!important;font-size:22px!important;display:flex!important;align-items:center!important;justify-content:center!important}
.readerFullBtn:active{transform:scale(.96)!important;background:rgba(56,189,248,.22)!important}
.miniStrip{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important;width:100%!important;margin:10px 0!important;align-items:stretch!important}.miniStrip>*{width:100%!important;min-width:0!important;min-height:42px!important;border-radius:14px!important}
.speedSelectLabel{--speedPct:20%;grid-column:1/-1!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;padding:10px 12px!important;position:relative!important;overflow:hidden!important;background:linear-gradient(90deg,rgba(56,189,248,.35) 0 var(--speedPct),#020617 var(--speedPct) 100%)!important;border:1px solid rgba(56,189,248,.38)!important}.speedSelectLabel::after{content:'מהירות';position:absolute;top:2px;right:12px;font-size:10px;color:rgba(248,250,252,.55);font-weight:700!important;pointer-events:none!important}.speedSelectLabel select{width:auto!important;min-width:100px!important;position:relative!important;z-index:2!important;background:rgba(2,6,23,.74)!important}.speedSelectLabel span{position:relative!important;z-index:2!important}.miniStrip b{display:flex!important;align-items:center!important;justify-content:center!important;background:#020617!important;border:1px solid var(--border)!important;color:var(--text)!important;border-radius:14px!important;padding:10px!important}
#speakBtn.speaking{background:#34d399!important;color:#052e1e!important;box-shadow:0 0 0 3px rgba(52,211,153,.22)!important}
.nikudHint{font-size:12px!important;color:var(--muted)!important;margin-top:6px!important;line-height:1.35!important}
@media(min-width:720px){.controlStrip{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:10px!important}.controlStrip #play,.controlStrip #reset{grid-column:1/-1!important}.controlStrip button{min-height:50px!important}.miniStrip{grid-template-columns:1.3fr repeat(5,minmax(0,1fr))!important}.speedSelectLabel{grid-column:auto!important}.readerFullBtn{width:46px!important;height:46px!important}}
</style>`;
const PATCH_JS=`
<script id="control-layout-patch-js">
(function(){
 var speechOn=false,lastSpoken='';
 function pct(v){v=Number(v||300);return Math.max(0,Math.min(100,((v-100)/(1200-100))*100));}
 function syncSpeed(){var sel=document.getElementById('wpmSelect');var box=document.querySelector('.speedSelectLabel');var lbl=document.getElementById('wpmLbl');if(!sel||!box)return;box.style.setProperty('--speedPct',pct(sel.value)+'%');if(lbl)lbl.textContent=sel.value;}
 function textOnScreen(){var w=document.getElementById('word');return w?(w.textContent||'').trim():'';}
 function hasHeb(s){return /[\u0590-\u05FF]/.test(s)}
 function speakNow(force){
  if(!speechOn&&!force)return;
  var t=textOnScreen();
  if(!t||t==='מוכן?'||t==='הדבק טקסט וטען')return;
  if(!force&&t===lastSpoken)return;
  lastSpoken=t;
  if(!('speechSynthesis' in window))return;
  try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t);u.lang=hasHeb(t)?'he-IL':'en-US';u.rate=.95;u.pitch=1;speechSynthesis.speak(u);}catch(e){}
 }
 function patchNikud(){
  var cb=document.getElementById('stripNikud'); if(!cb)return;
  var label=cb.closest('label'); if(label){label.childNodes.forEach(function(n){if(n.nodeType===3)n.textContent=' הצג/שמור ניקוד בעברית';});}
  if(label&&!document.querySelector('.nikudHint')){var p=document.createElement('div');p.className='nikudHint';p.textContent='מסומן: מציג/שומר ניקוד שקיים בטקסט. לא מסומן: מסיר ניקוד. ניקוד אוטומטי מלא דורש מנקד חכם חיצוני.';label.insertAdjacentElement('afterend',p);}
  try{
   window.cleanText=function(s){s=String(s||''); if(!cb.checked)s=s.replace(/[\u0591-\u05C7]/g,''); var letters=document.getElementById('lettersOnly'); if(letters&&letters.checked)s=s.replace(/[^\p{L}\p{N}\s\n\u0591-\u05C7]/gu,' '); return s.replace(/[ \t]+/g,' ').replace(/\n\s+/g,'\n').trim();};
  }catch(e){}
 }
 function patchSpeech(){
  var mini=document.querySelector('.miniStrip'); if(!mini||document.getElementById('speakBtn'))return;
  var b=document.createElement('button'); b.id='speakBtn'; b.className='secondary'; b.type='button'; b.textContent='🔊 הקראה';
  b.onclick=function(){speechOn=!speechOn;b.classList.toggle('speaking',speechOn);b.textContent=speechOn?'🔊 פעיל':'🔊 הקראה';if(speechOn)speakNow(true);else if('speechSynthesis' in window)speechSynthesis.cancel();};
  mini.appendChild(b);
 }
 function patchFull(){var reader=document.getElementById('reader');var old=document.getElementById('fullBtn');if(reader&&old&&!document.getElementById('readerFullBtn')){var b=old.cloneNode(true);b.id='readerFullBtn';b.className='readerFullBtn';b.innerHTML='⛶';b.title='מסך מלא';b.onclick=function(){old.click()};reader.appendChild(b);} if(old)old.style.display='none';}
 function patch(){patchFull();patchSpeech();patchNikud();var sel=document.getElementById('wpmSelect');if(sel){sel.addEventListener('change',syncSpeed);syncSpeed();} var w=document.getElementById('word'); if(w&&window.MutationObserver){new MutationObserver(function(){speakNow(false)}).observe(w,{childList:true,subtree:true,characterData:true});}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch);else patch();
})();
</script>`;
async function patchedIndex(req){
 const res=await fetch(req,{cache:'no-store'});
 let html=await res.text();
 html=html.replace(/<style id="control-layout-patch">[\s\S]*?<\/style>/,'');
 html=html.replace(/<script id="control-layout-patch-js">[\s\S]*?<\/script>/,'');
 if(!html.includes('control-layout-patch')) html=html.replace('</style>',PATCH_CSS+'</style>').replace('</body>',PATCH_JS+'</body>');
 return new Response(html,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
}
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 if(e.request.mode==='navigate'||e.request.url.endsWith('/index.html')){e.respondWith(patchedIndex(e.request).catch(()=>caches.match('./index.html')));return}
 e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return r}).catch(()=>caches.match(e.request)))
});