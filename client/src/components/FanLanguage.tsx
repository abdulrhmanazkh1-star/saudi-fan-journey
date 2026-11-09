import {useEffect,useState}from'react';
const translated=new WeakMap<Text,{source:string;value:string}>();const cache=new Map<string,string>();
export const fanLanguages:Record<string,string>={ru:'Русский',tr:'Türkçe',bn:'বাংলা',ta:'தமிழ்',te:'తెలుగు',ur:'اردو',ms:'Bahasa Melayu',fil:'Filipino',nl:'Nederlands',pl:'Polski',uk:'Українська',el:'Ελληνικά',sv:'Svenska',da:'Dansk',no:'Norsk',fi:'Suomi',cs:'Čeština',ro:'Română',hu:'Magyar',sw:'Kiswahili',he:'עברית',ne:'नेपाली',si:'සිංහල',am:'አማርኛ',km:'ខ្មែរ',lo:'ລາວ',my:'မြန်မာ',ar:'العربية',en:'English',ja:'日本語',ko:'한국어',zh:'中文',hi:'हिन्दी',de:'Deutsch',fr:'Français',es:'Español',it:'Italiano',pt:'Português',th:'ไทย',vi:'Tiếng Việt',id:'Bahasa Indonesia',fa:'فارسی',uz:'Oʻzbekcha',tg:'Тоҷикӣ',ky:'Кыргызча'};
export const countryLanguage:Record<string,string>={JP:'ja',KR:'ko',KP:'ko',CN:'zh',IN:'hi',DE:'de',FR:'fr',ES:'es',IT:'it',BR:'pt',AR:'es',CO:'es',MX:'es',TH:'th',VN:'vi',ID:'id',IR:'fa',UZ:'uz',TJ:'tg',KG:'ky',SA:'ar',QA:'ar',AE:'ar',OM:'ar',BH:'ar',KW:'ar',JO:'ar',IQ:'ar',SY:'ar',YE:'ar',PS:'ar',LB:'ar',EG:'ar',MA:'ar'};

let serverDown=false;
async function viaServer(language:string,batch:string[],cancelled:()=>boolean):Promise<string[]|null>{
  if(serverDown)return null;
  for(let attempt=0;attempt<3;attempt++){
    let response:Response;
    try{response=await fetch('/api/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({language,texts:batch})});}
    catch{serverDown=true;return null;}
    if(response.ok){const p=await response.json();if(Array.isArray(p.translations)&&p.translations.length===batch.length)return p.translations;throw Error('translation');}
    if(response.status===404||response.status===405||response.status===501||response.status===403){serverDown=true;return null;}
    if(attempt===2)throw Error('translation');
    await new Promise(r=>setTimeout(r,response.status===429?10000:900));
    if(cancelled())return null;
  }
  return null;
}
async function viaClaude(language:string,batch:string[]):Promise<string[]>{
  const c=(window as any).claude;
  const sample=c&&typeof c.use==='function'?await c.use('sample'):null;
  if(!sample)throw Error('translation');
  const name=fanLanguages[language]||language;
  const out=await sample.json('Translate each UI string below into '+name+' ('+language+'). The source is English or Arabic football-tourism text about Saudi Arabia. Keep stadium, club and place names in their usual form in the target language, keep numbers and punctuation, and do not add notes. Reply with ONLY a JSON array of exactly '+batch.length+' strings in the same order.\n'+JSON.stringify(batch));
  if(!Array.isArray(out)||out.length!==batch.length||out.some((x:unknown)=>typeof x!=='string'))throw Error('translation');
  return out as string[];
}
async function translateBatch(language:string,batch:string[],cancelled:()=>boolean):Promise<string[]>{
  const fromServer=await viaServer(language,batch,cancelled);
  if(fromServer)return fromServer;
  if(cancelled())throw Error('cancelled');
  return viaClaude(language,batch);
}
const attrOriginal=new WeakMap<Element,Record<string,{source:string;value:string}>>();
const ATTRS=['placeholder','title','aria-label'];
function attrTargets():{el:Element;attr:string}[]{const out:{el:Element;attr:string}[]=[];document.body.querySelectorAll('[placeholder],[title],[aria-label]').forEach(el=>{if(el.closest('[data-no-translate],script,style'))return;for(const attr of ATTRS){const v=el.getAttribute(attr);if(v&&/[\p{L}]/u.test(v)&&v.trim().length>=2&&v.length<=300)out.push({el,attr});}});return out;}
function attrSource(el:Element,attr:string){const rec=attrOriginal.get(el)?.[attr];const cur=el.getAttribute(attr)||'';return rec&&rec.value===cur?rec.source:cur;}
function applyAttrs(language:string){for(const {el,attr} of attrTargets()){const source=attrSource(el,attr),value=cache.get(language+'|'+source);if(value){const rec=attrOriginal.get(el)||{};rec[attr]={source,value};attrOriginal.set(el,rec);if(el.getAttribute(attr)!==value)el.setAttribute(attr,value);}}}
function restoreAttrs(){for(const {el,attr} of attrTargets()){const rec=attrOriginal.get(el)?.[attr];if(rec&&el.getAttribute(attr)===rec.value)el.setAttribute(attr,rec.source);}}
const STORE='sfj-translation-cache-v1';
try{const saved=JSON.parse(localStorage.getItem(STORE)||'[]');for(const [k,v] of saved)if(typeof k==='string'&&typeof v==='string')cache.set(k,v);}catch{}
let saveTimer:ReturnType<typeof setTimeout>|undefined;
function persistCache(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{const entries=[...cache].slice(-6000);localStorage.setItem(STORE,JSON.stringify(entries));}catch{}},600);}
export function LanguagePicker({value,onChange}:{value:string;onChange:(l:string)=>void}){return <label className="fan-language-picker" data-no-translate><span aria-hidden="true">◎</span><select aria-label="Language / اللغة / 言語 / Lingua" value={value} onChange={e=>onChange(e.target.value)}>{Object.entries(fanLanguages).map(([code,name])=><option value={code} key={code}>{name}</option>)}</select></label>;}
export function FanLanguageLayer({language,revision}:{language:string;revision:string}){const [retry,setRetry]=useState(0);const [status,setStatus]=useState<'idle'|'loading'|'error'>('idle');useEffect(()=>{let cancelled=false,working=false,timer:ReturnType<typeof setTimeout>|undefined;const nodes=()=>{const root=document.body;if(!root)return[];const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const list:Text[]=[];let n:Node|null;while(n=w.nextNode()){const text=n as Text,p=text.parentElement;if(!p||p.closest('[data-no-translate],script,style,textarea,input,select,pre,code,.chat-message,.passport-story,blockquote,.arabic-under,small[lang="ar"]')||p.closest('[lang="ja"]:not(html)')&&language==='ja'&&/[\u3040-\u30ff\u4e00-\u9fff]/.test(text.data)||!/[\p{L}]/u.test(text.data)||text.data.trim().length<2||text.data.length>2200)continue;list.push(text);}return list;};
for(const n of nodes()){const old=translated.get(n);if(old&&n.data===old.value)n.data=old.source;translated.delete(n);}
restoreAttrs();if(language==='ar'||language==='en'){setStatus('idle');return;}
const source=(n:Text)=>{const old=translated.get(n);return old&&old.value===n.data?old.source:n.data;};
(()=>{for(const n of nodes()){const o=source(n),v=cache.get(language+'|'+o);if(v){translated.set(n,{source:o,value:v});n.data=v;}}applyAttrs(language);})();
const observer=new MutationObserver(()=>{if(!working){clearTimeout(timer);timer=setTimeout(()=>void run(),180);}});
async function run(){if(cancelled||working)return;working=true;observer.disconnect();try{const list=nodes();const missing=[...new Set([...list.map(source),...attrTargets().map(t=>attrSource(t.el,t.attr))].filter(s=>!cache.has(language+'|'+s)))];if(missing.length)setStatus('loading');while(missing.length&&!cancelled){const batch:string[]=[];let length=0;while(missing.length&&batch.length<30&&length+missing[0].length<5000){const s=missing.shift()!;batch.push(s);length+=s.length;}if(!batch.length)break;const out=await translateBatch(language,batch,()=>cancelled);if(cancelled)return;batch.forEach((s,i)=>cache.set(language+'|'+s,out[i]));persistCache();applyAttrs(language);if(cancelled)return;for(const n of nodes()){const original=source(n),value=cache.get(language+'|'+original);if(value){translated.set(n,{source:original,value});if(n.data!==value)n.data=value;}}}if(!cancelled){applyAttrs(language);for(const n of nodes()){const original=source(n),value=cache.get(language+'|'+original);if(value){translated.set(n,{source:original,value});if(n.data!==value)n.data=value;}}setStatus('idle');}}catch{if(!cancelled)setStatus('error');}finally{working=false;if(!cancelled){const root=document.body;if(root)observer.observe(root,{subtree:true,childList:true,characterData:true});}}}
void run();return()=>{cancelled=true;observer.disconnect();clearTimeout(timer);};},[language,revision,retry]);
const labels:Record<string,string>={ja:'日本語に翻訳しています…',it:'Traduzione in italiano…',fr:'Traduction en cours…',de:'Übersetzung läuft…',es:'Traduciendo…',ko:'번역 중…',zh:'正在翻译…'};useEffect(()=>{const on=status==='loading';if(on)document.documentElement.setAttribute('data-translating','1');else document.documentElement.removeAttribute('data-translating');return()=>document.documentElement.removeAttribute('data-translating');},[status]);
return status==='idle'?null:<div className="fan-translation-status" data-no-translate role="status">{status==='loading'?(labels[language]||'Translating…'):'Translation paused · أعد المحاولة'}{status==='error'&&<button onClick={()=>setRetry(n=>n+1)}>↻</button>}</div>;}



