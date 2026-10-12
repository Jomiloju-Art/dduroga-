/**
 * Local review tool: pick the hover photo for each product card.
 *
 *   node scripts/hover-picker.mjs      then open http://127.0.0.1:5199
 *
 * Shows every listed product that has more than one photo: its card photo and
 * all its other photos. Clicking a photo (or "No hover photo") saves the choice
 * straight into src/data/cardHoverImages.json, which ProductCard reads, so a
 * running dev server updates as you go. "Reset" removes a choice and the card
 * falls back to the default rule (second photo unless excluded).
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const choicesFile = path.join(root, 'src/data/cardHoverImages.json');
const PORT = 5199;

const { allProducts, rangeLabel, zoneOf } = await import(pathToFileURL(path.join(root, 'src/data/products.js')).href);
const { NO_HOVER_IMAGE } = await import(pathToFileURL(path.join(root, 'src/data/cardHoverExclusions.js')).href);

const readChoices = () => JSON.parse(fs.readFileSync(choicesFile, 'utf8'));
const writeChoices = (c) => fs.writeFileSync(choicesFile, JSON.stringify(Object.fromEntries(Object.entries(c).sort(([a], [b]) => a.localeCompare(b))), null, 2) + '\n');

const products = allProducts
  .filter((p) => (p.imgs || []).length > 1)
  .map((p) => ({
    key: p.key,
    title: p.title,
    zone: zoneOf(p)?.id || '',
    range: rangeLabel(p),
    main: p.img,
    imgs: p.imgs,
    fallback: !NO_HOVER_IMAGE.has(p.key) ? p.imgs[1] : null,
  }));

const TYPES = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml' };

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(PAGE);
  }
  if (req.method === 'GET' && url.pathname === '/api/products') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ products, choices: readChoices() }));
  }
  if (req.method === 'POST' && url.pathname === '/api/choice') {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      try {
        const { key, img, reset } = JSON.parse(body);
        const p = products.find((x) => x.key === key);
        if (!p || (img !== null && img !== undefined && !p.imgs.includes(img))) throw new Error('unknown product or photo');
        const choices = readChoices();
        if (reset) delete choices[key]; else choices[key] = img ?? null;
        writeChoices(choices);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return undefined;
  }
  // product photos straight from public/
  const file = path.join(root, 'public', decodeURIComponent(url.pathname));
  if (req.method === 'GET' && file.startsWith(path.join(root, 'public')) && fs.existsSync(file) && fs.statSync(file).isFile()) {
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'max-age=3600' });
    return fs.createReadStream(file).pipe(res);
  }
  res.writeHead(404); return res.end('not found');
});
server.listen(PORT, '127.0.0.1', () => console.log(`Hover picker: http://127.0.0.1:${PORT}  (${products.length} products with more than one photo)`));

const PAGE = /* html */ `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Hover photo picker</title>
<style>
:root{--ink:#0E1216;--muted:#767A7F;--line:#DEE0E3;--orange:#F28A1A;--blue:#2F3974;--soft:#F5F6F7}
*{box-sizing:border-box}body{margin:0;font:14px/1.45 'Segoe UI',system-ui,sans-serif;color:var(--ink);background:#fff}
header{position:sticky;top:0;z-index:5;background:#fff;border-bottom:1px solid var(--line);padding:12px 20px;display:flex;flex-wrap:wrap;gap:10px 20px;align-items:center}
header h1{font-size:16px;margin:0}.prog{color:var(--muted)}.bar{width:180px;height:6px;background:var(--soft);border-radius:3px;overflow:hidden}.bar i{display:block;height:100%;background:var(--orange)}
.filters{display:flex;gap:6px;flex-wrap:wrap}.filters button{border:1px solid var(--line);background:#fff;padding:5px 12px;cursor:pointer;font:inherit;font-size:13px}.filters button[aria-pressed=true]{background:var(--ink);color:#fff;border-color:var(--ink)}
.help{margin-left:auto;color:var(--muted);font-size:12px}
main{padding:12px 20px 60px;max-width:1500px}
.row{display:grid;grid-template-columns:200px 150px 1fr;gap:16px;padding:14px 0;border-bottom:1px solid var(--line);align-items:start}
.row:focus-within,.row.active{background:#FFFBF5}
.meta b{display:block;font-size:15px}.meta small{color:var(--muted);display:block}.status{display:inline-block;margin-top:6px;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;background:var(--soft);color:var(--muted)}.status.done{background:#E7F5EC;color:#1B7A3D}
.reset{margin-top:6px;display:block;background:none;border:0;padding:0;color:var(--blue);cursor:pointer;font:inherit;font-size:12px;text-decoration:underline}
.preview{position:relative;width:150px;aspect-ratio:4/5;background:var(--line);overflow:hidden}.preview img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity .25s}.preview .alt{opacity:0}.preview:hover .alt{opacity:1}.preview:hover .swap{opacity:0}
.preview figcaption{position:absolute;left:0;right:0;bottom:0;background:rgba(14,18,22,.7);color:#fff;font-size:11px;text-align:center;padding:2px}
.cands{display:flex;flex-wrap:wrap;gap:8px}
.cand{position:relative;width:112px;padding:0;border:2px solid var(--line);background:#fff;cursor:pointer;aspect-ratio:4/5;overflow:hidden}
.cand img{width:100%;height:100%;object-fit:cover;display:block}.cand .n{position:absolute;top:3px;left:3px;background:rgba(255,255,255,.9);font-size:11px;padding:0 5px;font-weight:700}
.cand.main-photo::after{content:'card photo';position:absolute;left:0;right:0;bottom:0;background:rgba(14,18,22,.6);color:#fff;font-size:10px;text-align:center}
.cand.sel{border-color:var(--orange);box-shadow:0 0 0 2px var(--orange)}.cand.sel .n{background:var(--orange);color:#fff}
.cand.def:not(.sel){border-style:dashed;border-color:var(--blue)}
.none{width:112px;aspect-ratio:4/5;border:2px dashed var(--line);background:var(--soft);cursor:pointer;font:inherit;font-size:12px;color:var(--muted)}.none.sel{border:2px solid var(--orange);box-shadow:0 0 0 2px var(--orange);color:var(--ink);background:#fff}
.legend{font-size:12px;color:var(--muted);margin:4px 0 10px}.legend span{display:inline-block;width:14px;height:10px;vertical-align:middle;margin:0 4px 0 10px}
.toast{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:var(--ink);color:#fff;padding:8px 14px;font-size:13px;opacity:0;transition:opacity .2s}.toast.show{opacity:1}
</style></head><body>
<header><h1>Hover photo picker</h1><span class="prog" id="prog"></span><span class="bar"><i id="bar"></i></span>
<div class="filters" id="filters"></div><span class="help">Click a photo to make it the hover photo · saved instantly · keys: 1–9 pick, 0 none, J/K next/prev</span></header>
<main><p class="legend">Orange = chosen hover photo<span style="border:2px dashed #2F3974"></span>= what the card shows now (default, not yet reviewed). Hover the left preview to see the card effect.</p><div id="list"></div></main>
<div class="toast" id="toast"></div>
<script>
let data, filter='todo', zone='', activeIdx=0;
const el=(h)=>{const t=document.createElement('template');t.innerHTML=h.trim();return t.content.firstChild};
const esc=(s)=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const chosen=(p)=>Object.prototype.hasOwnProperty.call(data.choices,p.key)?data.choices[p.key]:undefined;
const effective=(p)=>{const c=chosen(p);return c!==undefined?c:p.fallback};
function toast(t){const e=document.getElementById('toast');e.textContent=t;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),1300)}
async function save(p,img,reset){const r=await fetch('/api/choice',{method:'POST',body:JSON.stringify({key:p.key,img,reset})});const j=await r.json();if(!j.ok){toast('Not saved: '+j.error);return}
 if(reset)delete data.choices[p.key];else data.choices[p.key]=img;renderRow(p);progress();toast(reset?'Reset '+p.title:'Saved '+p.title)}
function progress(){const n=data.products.filter(p=>chosen(p)!==undefined).length,t=data.products.length;document.getElementById('prog').textContent='Reviewed '+n+' of '+t;document.getElementById('bar').style.width=(100*n/t)+'%'}
function rowHtml(p){const c=chosen(p),eff=effective(p);
 return '<div class="row" data-key="'+p.key+'" tabindex="-1"><div class="meta"><b>'+esc(p.title)+'</b><small>'+esc(p.range||p.zone)+'</small><span class="status'+(c!==undefined?' done':'')+'">'+(c===undefined?'not reviewed':c===null?'reviewed: no hover photo':'reviewed')+'</span>'+(c!==undefined?'<button class="reset">Reset to default</button>':'')+'</div>'
 +'<figure class="preview" style="margin:0"><img class="'+(eff?'swap':'')+'" src="'+p.main+'" alt="">'+(eff?'<img class="alt" src="'+eff+'" alt="">':'')+'<figcaption>card preview (hover me)</figcaption></figure>'
 +'<div class="cands">'+p.imgs.map((u,i)=>'<button class="cand'+(c!==undefined&&c===u?' sel':'')+(c===undefined&&p.fallback===u?' def':'')+(i===0?' main-photo':'')+'" data-img="'+u+'" title="Photo '+(i+1)+'"><span class="n">'+(i+1)+'</span><img loading="lazy" src="'+u+'" alt="Photo '+(i+1)+'"></button>').join('')
 +'<button class="none'+(c===null?' sel':'')+'">No hover photo</button></div></div>'}
function renderRow(p){const old=document.querySelector('.row[data-key="'+CSS.escape(p.key)+'"]');if(!old)return;const n=el(rowHtml(p));if(old.classList.contains('active'))n.classList.add('active');old.replaceWith(n);bindRow(n,p)}
function bindRow(n,p){n.querySelectorAll('.cand').forEach(b=>b.onclick=()=>save(p,b.dataset.img));n.querySelector('.none').onclick=()=>save(p,null);const r=n.querySelector('.reset');if(r)r.onclick=()=>save(p,null,true);n.onclick=()=>setActive([...document.querySelectorAll('.row')].indexOf(n),false)}
function visible(){return data.products.filter(p=>(!zone||p.zone===zone)&&(filter==='all'||(filter==='todo'?chosen(p)===undefined:chosen(p)!==undefined)))}
function render(){const list=document.getElementById('list');list.innerHTML='';for(const p of visible()){const n=el(rowHtml(p));list.appendChild(n);bindRow(n,p)}activeIdx=0;setActive(0,false);progress()}
function setActive(i,scroll=true){const rows=[...document.querySelectorAll('.row')];rows.forEach(r=>r.classList.remove('active'));if(!rows.length)return;activeIdx=Math.max(0,Math.min(rows.length-1,i));rows[activeIdx].classList.add('active');if(scroll)rows[activeIdx].scrollIntoView({block:'center',behavior:'smooth'})}
document.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;const rows=[...document.querySelectorAll('.row')];const row=rows[activeIdx];if(!row)return;const p=data.products.find(x=>x.key===row.dataset.key);
 if(e.key==='j'||e.key==='J'){setActive(activeIdx+1)}else if(e.key==='k'||e.key==='K'){setActive(activeIdx-1)}
 else if(e.key==='0'){save(p,null)}else if(/^[1-9]$/.test(e.key)){const u=p.imgs[+e.key-1];if(u)save(p,u)}});
function filters(){const f=document.getElementById('filters');const mk=(label,on,fn)=>{const b=el('<button aria-pressed="'+on+'">'+label+'</button>');b.onclick=fn;f.appendChild(b)};f.innerHTML='';
 [['todo','To review'],['done','Reviewed'],['all','All']].forEach(([v,l])=>mk(l,filter===v,()=>{filter=v;filters();render()}));
 [['','All zones'],['head','Head'],['hand','Hand'],['body','Body'],['feet','Feet']].forEach(([v,l])=>mk(l,zone===v,()=>{zone=v;filters();render()}))}
fetch('/api/products').then(r=>r.json()).then(d=>{data=d;filters();render()});
</script></body></html>`;
