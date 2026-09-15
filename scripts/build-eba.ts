/**
 * build-eba.ts — Güneş Sistemi'nin TEK DOSYA offline sürümünü üretir:
 *   public/gunes-sistemi-eba.html
 *
 * Telefonda/EBA'da 2 tıkla açılır, internet gerektirmez, tüm veriler
 * (30 gökcismi + 29 iç yapı + 49 teori × 15+ bölüm) dosyanın içine gömülüdür.
 *
 * Kullanım: bun scripts/build-eba.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { BODIES } from "../src/lib/solar-data";
import { INTERIORS } from "../src/lib/interiors";
import { THEORIES } from "../src/lib/theories";

/* ------------------------------- veri hazırlığı --------------------------- */
const bodies = BODIES.map((b) => ({
  id: b.id,
  name: b.name,
  type: b.type,
  color: b.color,
  parent: b.sim.parentId ?? null,
  a: b.sim.a,
  e: b.sim.e,
  period: b.sim.periodDays,
  radius: b.sim.radius,
  ring: b.sim.ring
    ? { inner: b.sim.ring.inner, outer: b.sim.ring.outer, color: b.sim.ring.color }
    : null,
  stats: b.stats,
  orbit: {
    distance: b.orbitInfo.distance,
    period: b.orbitInfo.period,
    velocity: b.orbitInfo.velocity,
  },
  atmosphere: b.atmosphere,
  description: b.description,
  surface: b.surface ?? "",
  facts: b.facts.slice(0, 3),
}));

const theories = THEORIES.map((t) => ({
  id: t.id,
  title: t.title,
  subtitle: t.subtitle,
  cat: t.cat,
  color: t.color,
  duration: t.duration,
  stages: t.stages.map((s) => ({ until: s.until, title: s.title, text: s.text, era: s.era })),
  notes: t.notes,
}));

const data = { bodies, interiors: INTERIORS, theories };

/* -------------------------------- HTML iskelet ---------------------------- */
const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#050507">
<title>Güneş Sistemi · EBA Tek Dosya</title>
<style>
:root{
  --bg:#050507; --panel:rgba(10,10,14,.82); --line:rgba(255,255,255,.09);
  --amber:#fbbf24; --amber2:#f59e0b; --txt:#f4f4f5; --mut:#a1a1aa; --dim:#71717a;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{height:100%}
body{background:var(--bg);color:var(--txt);font-family:-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;overflow:hidden}
button{font:inherit;color:inherit;background:none;border:none;cursor:pointer}
input{font:inherit}
.view{position:fixed;inset:0;display:none;flex-direction:column}
.view.on{display:flex}
.cv{position:absolute;inset:0;width:100%;height:100%}
/* ---------- genel parçalar ---------- */
.topbar{position:relative;z-index:5;display:flex;align-items:center;gap:10px;padding:calc(10px + env(safe-area-inset-top)) 14px 10px}
.topbar h2{font-size:16px;letter-spacing:.3px}
.chip{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line);background:rgba(0,0,0,.45);backdrop-filter:blur(8px);border-radius:999px;padding:4px 11px;font-size:11px;color:var(--mut)}
.btn{border:1px solid var(--line);background:rgba(0,0,0,.5);backdrop-filter:blur(8px);border-radius:10px;padding:9px 14px;font-size:13px;display:inline-flex;align-items:center;gap:7px;transition:.25s}
.btn:active{transform:scale(.96)}
.btn.gold{border-color:rgba(251,191,36,.35);background:rgba(251,191,36,.14);color:#fde68a}
.btn.gold:active{background:rgba(251,191,36,.24)}
.sig{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--dim)}
.sig b{color:rgba(253,230,138,.85);font-weight:600;letter-spacing:.18em}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
/* ---------- giriş ---------- */
#view-intro{align-items:center;justify-content:center;text-align:center;padding:24px}
#view-intro .inner{position:relative;z-index:3;max-width:520px}
#view-intro h1{font-size:clamp(30px,8vw,46px);font-weight:800;letter-spacing:.5px;background:linear-gradient(100deg,#fef3c7,#fbbf24 45%,#b45309);-webkit-background-clip:text;background-clip:text;color:transparent}
#view-intro .sub{margin:10px 0 4px;color:var(--mut);font-size:14px;line-height:1.55}
#view-intro .badge{display:inline-block;margin:14px 0 22px;border:1px solid rgba(251,191,36,.3);background:rgba(251,191,36,.08);color:#fde68a;border-radius:999px;padding:6px 14px;font-size:11px;letter-spacing:.12em;text-transform:uppercase}
#view-intro .actions{display:flex;flex-direction:column;gap:10px}
#view-intro .actions .btn{justify-content:center;padding:13px 18px;font-size:15px;border-radius:14px}
.orbiter{position:absolute;border:1px solid rgba(251,191,36,.14);border-radius:50%}
/* ---------- simülasyon ---------- */
#view-sim .hud{position:relative;z-index:5;display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:calc(8px + env(safe-area-inset-top)) 12px 8px}
#speed{-webkit-appearance:none;appearance:none;width:110px;height:4px;border-radius:4px;background:rgba(255,255,255,.18);outline:none}
#speed::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:var(--amber);border:2px solid #78350f}
#simWrap{position:relative;flex:1;min-height:0}
#selCard{position:absolute;left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom));z-index:6;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:14px 16px;backdrop-filter:blur(14px);box-shadow:0 18px 50px rgba(0,0,0,.55);transform:translateY(130%);transition:transform .45s cubic-bezier(.22,1,.3,1);max-height:46%;overflow:auto}
#selCard.on{transform:none}
#selCard h3{display:flex;align-items:center;gap:9px;font-size:17px}
#selCard .dot{width:11px;height:11px;border-radius:50%;box-shadow:0 0 10px 2px currentColor}
#selCard .ty{font-size:11px;color:var(--amber);letter-spacing:.08em;text-transform:uppercase}
#selCard p{margin-top:8px;font-size:12.5px;line-height:1.6;color:#d4d4d8}
#selCard .st{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
#selCard .st span{font-size:10.5px;color:var(--mut);border:1px solid var(--line);border-radius:8px;padding:4px 8px;background:rgba(255,255,255,.03)}
#selCard .row{display:flex;gap:8px;margin-top:12px}
#selCard .row .btn{flex:1;justify-content:center}
/* ---------- iç yapı ---------- */
#view-int .body{flex:1;display:flex;flex-direction:column;align-items:center;padding:6px 14px 16px;overflow:auto}
#intSvg{width:min(92vw,420px);flex:0 0 auto}
#intLegend{width:100%;max-width:460px;margin-top:8px}
.lay{display:flex;align-items:flex-start;gap:10px;border:1px solid var(--line);background:rgba(255,255,255,.03);border-radius:12px;padding:9px 12px;margin-bottom:8px}
.lay .d{width:12px;height:12px;border-radius:4px;flex:0 0 auto;margin-top:2px}
.lay b{font-size:13px}
.lay .t{font-size:10.5px;color:var(--amber2);margin-left:6px}
.lay p{font-size:11.5px;color:var(--mut);line-height:1.5;margin-top:2px}
/* ---------- teori listesi ---------- */
#view-list .list{flex:1;overflow-y:auto;padding:0 12px calc(18px + env(safe-area-inset-bottom));-webkit-overflow-scrolling:touch}
.grp{margin:14px 2px 8px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--dim);display:flex;align-items:center;gap:8px}
.grp::after{content:"";flex:1;height:1px;background:var(--line)}
.trow{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:1px solid var(--line);background:rgba(255,255,255,.03);border-radius:14px;padding:12px 14px;margin-bottom:9px;transition:.2s}
.trow:active{background:rgba(251,191,36,.09)}
.trow .n{font-size:17px;font-weight:700;width:26px;color:rgba(255,255,255,.22)}
.trow b{font-size:14px;display:block}
.trow small{color:var(--mut);font-size:11.5px;display:block;margin-top:3px;line-height:1.45}
.trow .g{margin-left:auto;font-size:10px;color:var(--dim);white-space:nowrap}
#search{width:100%;border:1px solid var(--line);background:rgba(255,255,255,.04);border-radius:12px;padding:11px 14px;color:var(--txt);font-size:14px;outline:none}
#search:focus{border-color:rgba(251,191,36,.4)}
/* ---------- oynatıcı ---------- */
#view-player{background:#040406}
#pcv{position:absolute;inset:0;width:100%;height:100%}
#pstage{position:relative;z-index:3;flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:20px 22px calc(14px + env(safe-area-inset-bottom));text-align:center}
#pnotes{position:absolute;inset:0;z-index:2;pointer-events:none}
.note{position:absolute;max-width:200px;font-size:10.5px;line-height:1.4;color:#fde68a;background:rgba(20,16,8,.72);border:1px solid rgba(251,191,36,.3);border-radius:10px;padding:6px 9px;backdrop-filter:blur(6px);opacity:0;transform:translateY(8px);transition:opacity .9s ease,transform .9s ease}
.note.on{opacity:1;transform:none}
#sera{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--amber);opacity:.9}
#stitle{margin:14px 0 12px;font-size:clamp(20px,5.6vw,30px);font-weight:800;letter-spacing:.3px;transition:opacity .85s ease,filter .85s ease,transform .85s ease}
#stext{max-width:560px;font-size:clamp(13.5px,3.6vw,16.5px);line-height:1.75;color:#e4e4e7;transition:opacity .85s ease,filter .85s ease,transform .85s ease}
#stitle.out,#stext.out{opacity:0;filter:blur(14px);transform:scale(1.045)}
#stitle.in2{opacity:0;filter:blur(14px);transform:scale(.97)}
#sprog{position:relative;z-index:3;display:flex;gap:3px;padding:0 14px 8px;width:100%;max-width:640px;margin:0 auto}
#sprog i{flex:1;height:3.5px;border-radius:3px;background:rgba(255,255,255,.14);overflow:hidden;position:relative;cursor:pointer}
#sprog i b{position:absolute;inset:0;width:0;background:linear-gradient(90deg,var(--amber2),var(--amber));border-radius:3px}
#pctl{position:relative;z-index:3;display:flex;align-items:center;justify-content:center;gap:12px;padding:6px 14px calc(14px + env(safe-area-inset-bottom))}
#pctl .btn{width:46px;height:46px;border-radius:50%;justify-content:center;padding:0;font-size:16px}
#pctl .btn.big{width:58px;height:58px;background:rgba(251,191,36,.16);border-color:rgba(251,191,36,.4);color:#fde68a}
/* süpürme ışığı — geçiş katmanı */
#sweep{position:absolute;inset:0;z-index:4;pointer-events:none;opacity:0;background:linear-gradient(105deg,transparent 30%,rgba(254,243,199,.14) 48%,rgba(251,191,36,.22) 50%,rgba(254,243,199,.14) 52%,transparent 70%)}
#sweep.go{animation:sweep 1.8s ease forwards}
@keyframes sweep{0%{opacity:0;transform:translateX(-40%)}18%{opacity:1}100%{opacity:0;transform:translateX(40%)}}
/* kaydırma çubuğu */
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-thumb{background:rgba(251,191,36,.25);border-radius:4px}
</style>
</head>
<body>

<!-- ============================ GİRİŞ ============================ -->
<section id="view-intro" class="view on">
  <canvas class="cv" id="starsIntro"></canvas>
  <div class="orbiter" style="width:min(88vmin,560px);height:min(88vmin,560px);animation:spin 70s linear infinite"></div>
  <div class="orbiter" style="width:min(64vmin,400px);height:min(64vmin,400px);animation:spin 46s linear infinite reverse"></div>
  <div class="inner">
    <div class="badge">Tek dosya · internetsiz çalışır · EBA uyumlu</div>
    <h1>GÜNEŞ SİSTEMİ</h1>
    <p class="sub">30 gökcismi · gerçek yörünge fiziği · katman katman iç yapılar<br>
    49 sinematik teori · 441 yeni bölüm · yavaş ve yumuşak geçişler</p>
    <div class="actions">
      <button class="btn gold" onclick="show('sim')">☀ Simülasyonu Başlat</button>
      <button class="btn" onclick="openTheories()">✦ Animasyonlu Teoriler (49)</button>
    </div>
    <p class="sig" style="margin-top:26px">yapımcı: <b>Samir Arabzadeh</b></p>
  </div>
</section>

<!-- ============================ SİMÜLASYON ============================ -->
<section id="view-sim" class="view">
  <div class="hud">
    <button class="btn" onclick="show('intro')">←</button>
    <h2 style="flex:1">Güneş Sistemi</h2>
    <button class="btn" id="pauseBtn" onclick="togglePause()">⏸</button>
    <input id="speed" type="range" min="1" max="80" value="18" aria-label="hız">
    <span class="chip" id="speedLbl">×1</span>
  </div>
  <div id="simWrap">
    <canvas class="cv" id="simCv"></canvas>
    <div id="selCard"></div>
  </div>
</section>

<!-- ============================ İÇ YAPI ============================ -->
<section id="view-int" class="view">
  <div class="topbar">
    <button class="btn" onclick="show('sim')">←</button>
    <h2 id="intTitle">İç Yapı</h2>
  </div>
  <div class="body">
    <svg id="intSvg" viewBox="0 0 400 400" aria-label="iç yapı kesiti"></svg>
    <div id="intLegend"></div>
    <p class="sig" style="margin-top:14px">yapımcı: <b>Samir Arabzadeh</b></p>
  </div>
</section>

<!-- ============================ TEORİ LİSTESİ ============================ -->
<section id="view-list" class="view">
  <div class="topbar">
    <button class="btn" onclick="show('intro')">←</button>
    <h2 style="flex:1">Teori Kitaplığı · 49</h2>
  </div>
  <div style="padding:0 12px 10px;z-index:5"><input id="search" placeholder="Teori ara…" oninput="renderList(this.value)"></div>
  <div class="list" id="theoryList"></div>
</section>

<!-- ============================ OYNATICI ============================ -->
<section id="view-player" class="view">
  <canvas id="pcv"></canvas>
  <div id="pnotes"></div>
  <div id="sweep"></div>
  <div class="topbar" style="z-index:5">
    <button class="btn" onclick="closePlayer()">✕</button>
    <h2 id="pTitle" style="flex:1;font-size:13.5px;font-weight:600;opacity:.85"></h2>
    <span class="chip" id="pIdx">1/16</span>
  </div>
  <div id="pstage">
    <div id="sera"></div>
    <h3 id="stitle"></h3>
    <p id="stext"></p>
  </div>
  <div id="sprog"></div>
  <div id="pctl">
    <button class="btn" onclick="prevStage()">⏮</button>
    <button class="btn big" id="playBtn" onclick="togglePlay()">⏸</button>
    <button class="btn" onclick="nextStage()">⏭</button>
    <button class="btn" id="sndBtn" onclick="toggleSnd()" title="Geçiş ses efektleri">🔇</button>
  </div>
</section>

<script>
var DATA = __DATA__;

/* =========================== yardımcılar =========================== */
function $(s){return document.querySelector(s)}
function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
var CATS={kosmoloji:'Kozmoloji',fizik:'Fizik',gokyuzu:'Gök Cismi',jeoloji:'Jeoloji',yasam:'Yaşam',gelecek:'Gelecek'};
var CATCOL={kosmoloji:'#a78bfa',fizik:'#2dd4bf',gokyuzu:'#fbbf24',jeoloji:'#fb923c',yasam:'#4ade80',gelecek:'#22d3ee'};
function show(name){['intro','sim','list','int','player'].forEach(function(v){$('#view-'+v).classList.toggle('on',v===name)});if(name==='sim')resizeSim();if(name==='intro')resizeStars();}
function hexToRgb(h){h=h.replace('#','');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
function rgba(h,a){var c=hexToRgb(h);return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'}

/* =========================== yıldız arka planı =========================== */
var starCv=$('#starsIntro'),starCtx=starCv.getContext('2d');
function resizeStars(){var d=window.devicePixelRatio||1;starCv.width=innerWidth*d;starCv.height=innerHeight*d;starCtx.setTransform(d,0,0,d,0,0);drawStars()}
function drawStars(){var w=innerWidth,h=innerHeight;starCtx.clearRect(0,0,w,h);var g=starCtx.createRadialGradient(w*.5,h*.42,0,w*.5,h*.42,Math.max(w,h)*.75);g.addColorStop(0,'#141018');g.addColorStop(.55,'#0a0910');g.addColorStop(1,'#040406');starCtx.fillStyle=g;starCtx.fillRect(0,0,w,h);
for(var i=0;i<260;i++){var x=Math.random()*w,y=Math.random()*h,r=Math.random()*1.3+.2,a=Math.random()*.7+.15;starCtx.fillStyle='rgba(255,244,220,'+a+')';starCtx.beginPath();starCtx.arc(x,y,r,0,6.283);starCtx.fill();}}
window.addEventListener('resize',resizeStars);resizeStars();

/* =========================== SİMÜLASYON =========================== */
var planets=DATA.bodies.filter(function(b){return !b.parent&&b.a>0});
var AU=118;
var view={x:0,y:0,s:1},paused=false,speedVal=1,simT=0,last=0,selected=null;
var simCv=$('#simCv'),sctx=simCv.getContext('2d');
function resizeSim(){var d=window.devicePixelRatio||1,w=$('#simWrap').clientWidth,h=$('#simWrap').clientHeight;simCv.width=w*d;simCv.height=h*d;sctx.setTransform(d,0,0,d,0,0);}
function planetPos(b,t){
  var M=6.283*(t/b.period); var E=M+b.e*Math.sin(M);
  var x=b.a*AU*(Math.cos(E)-b.e), y=b.a*AU*Math.sqrt(1-b.e*b.e)*Math.sin(E);
  return [x,-y];
}
function drawSim(dt){
  if(!paused)simT+=dt*speedVal;
  var w=simCv.clientWidth,h=simCv.clientHeight,cx=w/2+view.x,cy=h/2+view.y;
  sctx.clearRect(0,0,w,h);
  for(var i=0;i<130;i++){var sx=(i*2654435761)%w,sy=(i*97)%h;sctx.fillStyle='rgba(255,240,210,'+(0.05+(i%9)/60)+')';sctx.fillRect(sx,sy,1,1);}
  planets.forEach(function(b){var A=b.a*AU*view.s,B=A*Math.sqrt(1-b.e*b.e);
    sctx.strokeStyle=rgba(b.color,.16);sctx.lineWidth=1;
    sctx.beginPath();sctx.ellipse(cx-b.e*A,cy,A,B,0,0,6.283);sctx.stroke();});
  var R=20*view.s+6;var pulse=1+0.05*Math.sin(Date.now()/700);
  var g=sctx.createRadialGradient(cx,cy,0,cx,cy,R*3.2*pulse);
  g.addColorStop(0,'rgba(255,244,214,.95)');g.addColorStop(.18,'rgba(251,191,36,.85)');g.addColorStop(.42,'rgba(245,158,11,.32)');g.addColorStop(1,'rgba(245,158,11,0)');
  sctx.fillStyle=g;sctx.beginPath();sctx.arc(cx,cy,R*3.2*pulse,0,6.283);sctx.fill();
  sctx.fillStyle='#fff7e0';sctx.beginPath();sctx.arc(cx,cy,R*.72,0,6.283);sctx.fill();
  planets.forEach(function(b){
    var p=planetPos(b,simT*30);var px=cx+p[0]*view.s,py=cy+p[1]*view.s;
    var r=Math.max(2.6,Math.min(22,b.radius*7*Math.pow(view.s,.35)));
    if(b.ring){sctx.strokeStyle=rgba(b.ring.color,.75);sctx.lineWidth=1.4;
      sctx.beginPath();sctx.ellipse(px,py,r*1.9,r*.62,-0.35,0,6.283);sctx.stroke();}
    var gg=sctx.createRadialGradient(px-r*.3,py-r*.3,0,px,py,r*1.5);
    gg.addColorStop(0,b.color);gg.addColorStop(1,rgba(b.color,.12));
    sctx.fillStyle=gg;sctx.beginPath();sctx.arc(px,py,r,0,6.283);sctx.fill();
    if(selected&&selected.id===b.id){sctx.strokeStyle='rgba(253,230,138,.9)';sctx.lineWidth=1.5;sctx.beginPath();sctx.arc(px,py,r+6,0,6.283);sctx.stroke();}
    if(view.s>0.75){sctx.fillStyle='rgba(228,228,231,.85)';sctx.font='10.5px -apple-system,sans-serif';sctx.textAlign='center';sctx.fillText(b.name,px,py+r+13);}
  });
  requestAnimationFrame(function(ts){drawSim(Math.min(.05,(ts-(last||ts))/1000));last=ts;});
}
requestAnimationFrame(function(ts){drawSim(Math.min(.05,(ts-(last||ts))/1000));last=ts;});
function togglePause(){paused=!paused;$('#pauseBtn').textContent=paused?'▶':'⏸'}
$('#speed').addEventListener('input',function(){speedVal=this.value/18;$('#speedLbl').textContent='×'+(speedVal<10?speedVal.toFixed(1):Math.round(speedVal))});
var touch={mode:null,sx:0,sy:0,vx:0,vy:0,d0:0,s0:0,moved:false};
simCv.addEventListener('touchstart',function(e){if(e.touches.length===1){touch.mode='pan';touch.sx=e.touches[0].clientX;touch.sy=e.touches[0].clientY;touch.vx=view.x;touch.vy=view.y;touch.moved=false}else if(e.touches.length===2){touch.mode='pinch';touch.d0=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);touch.s0=view.s}},{passive:true});
simCv.addEventListener('touchmove',function(e){if(touch.mode==='pan'&&e.touches.length===1){var dx=e.touches[0].clientX-touch.sx,dy=e.touches[0].clientY-touch.sy;if(Math.abs(dx)+Math.abs(dy)>6)touch.moved=true;view.x=touch.vx+dx;view.y=touch.vy+dy}else if(touch.mode==='pinch'&&e.touches.length===2){var d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);view.s=Math.max(.28,Math.min(6,touch.s0*d/touch.d0))}},{passive:true});
simCv.addEventListener('touchend',function(e){if(touch.mode==='pan'&&!touch.moved){var t=e.changedTouches[0];pickBody(t.clientX,t.clientY)}touch.mode=null});
simCv.addEventListener('mousedown',function(e){touch.mode='pan';touch.sx=e.clientX;touch.sy=e.clientY;touch.vx=view.x;touch.vy=view.y;touch.moved=false});
simCv.addEventListener('mousemove',function(e){if(touch.mode==='pan'){var dx=e.clientX-touch.sx,dy=e.clientY-touch.sy;if(Math.abs(dx)+Math.abs(dy)>6)touch.moved=true;view.x=touch.vx+dx;view.y=touch.vy+dy}});
simCv.addEventListener('mouseup',function(e){if(touch.mode==='pan'&&!touch.moved)pickBody(e.clientX,e.clientY);touch.mode=null});
simCv.addEventListener('wheel',function(e){e.preventDefault();view.s=Math.max(.28,Math.min(6,view.s*(e.deltaY<0?1.12:0.89)))},{passive:false});
function pickBody(cx,cy){var rect=simCv.getBoundingClientRect();var mx=cx-rect.left,my=cy-rect.top;var w=simCv.clientWidth,h=simCv.clientHeight;var best=null,bd=26;
  planets.forEach(function(b){var p=planetPos(b,simT*30);var px=w/2+view.x+p[0]*view.s,py=h/2+view.y+p[1]*view.s;var d=Math.hypot(mx-px,my-py);if(d<bd){bd=d;best=b}});
  if(best){selected=best;renderSel()}else{selected=null;$('#selCard').classList.remove('on')}}
function renderSel(){var b=selected;if(!b)return;
  var html='<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="ty">'+esc(b.type)+'</div><h3><span class="dot" style="background:'+b.color+';color:'+b.color+'"></span>'+esc(b.name)+'</h3></div><button class="btn" style="padding:6px 10px" onclick="closeSel()">✕</button></div>';
  html+='<p>'+esc(b.description)+'</p><div class="st"><span>Çap: '+esc(b.stats.diameter)+'</span><span>Kütle: '+esc(b.stats.mass)+'</span><span>Yerçekimi: '+esc(b.stats.gravity)+'</span><span>Sıcaklık: '+esc(b.stats.temp)+'</span><span>Yörünge: '+esc(b.orbit.distance)+'</span><span>Dönem: '+esc(b.orbit.period)+'</span></div>';
  html+='<div class="row"><button class="btn gold" onclick="openInterior(\\''+b.id+'\\')">İç Yapıyı Gör</button><button class="btn" onclick="showTheoryFor(\\''+b.id+'\\')">İlgili Teori</button></div>';
  var c=$('#selCard');c.innerHTML=html;c.classList.add('on');}
function closeSel(){$('#selCard').classList.remove('on')}
window.addEventListener('resize',resizeSim);

/* =========================== İÇ YAPI =========================== */
function openInterior(id){var b=DATA.bodies.find(function(x){return x.id===id});var prof=DATA.interiors[id];if(!b||!prof){alert('Bu cismin iç yapı verisi yok.');return}
  $('#intTitle').textContent=b.name+' · İç Yapı';
  var svg='',n=prof.layers.length;
  for(var i=n-1;i>=0;i--){var L=prof.layers[i];var r=10+(L.pct/100)*170;
    svg+='<circle cx="185" cy="200" r="'+r.toFixed(1)+'" fill="'+L.color+'" fill-opacity="0.96" stroke="rgba(0,0,0,.35)" stroke-width="0.8"/>';}
  var WEDGE=-0.35;
  svg+='<path d="M185 200 L'+(185+210*Math.cos(WEDGE)).toFixed(1)+' '+(200+210*Math.sin(WEDGE)).toFixed(1)+' A210 210 0 0 1 '+(185+210*Math.cos(WEDGE+1.15)).toFixed(1)+' '+(200+210*Math.sin(WEDGE+1.15)).toFixed(1)+' Z" fill="#050507" opacity="0.97"/>';
  for(var j=0;j<n;j++){var r2=10+(prof.layers[j].pct/100)*170;
    svg+='<line x1="185" y1="200" x2="'+(185+r2*Math.cos(WEDGE+1.15)).toFixed(1)+'" y2="'+(200+r2*Math.sin(WEDGE+1.15)).toFixed(1)+'" stroke="rgba(255,255,255,.25)" stroke-width="0.7"/>';}
  svg+='<text x="185" y="392" text-anchor="middle" fill="#71717a" font-size="10">'+esc(b.name)+' · katmanlar gerçek oranlarda</text>';
  $('#intSvg').innerHTML=svg;
  var leg='<p style="font-size:12px;color:#d4d4d8;line-height:1.6;margin-bottom:10px">'+esc(prof.intro)+'</p>';
  prof.layers.forEach(function(L){leg+='<div class="lay"><span class="d" style="background:'+L.color+'"></span><div><b>'+esc(L.name)+'</b><span class="t">'+esc(L.temp)+'</span><p>'+esc(L.detail)+'</p></div></div>'});
  $('#intLegend').innerHTML=leg;
  show('int');}

/* =========================== TEORİ LİSTESİ =========================== */
var listByCat={};
DATA.theories.forEach(function(t,i){(listByCat[t.cat]=listByCat[t.cat]||[]).push({t:t,n:i+1})});
function renderList(q){q=(q||'').toLowerCase();var html='';
  Object.keys(CATS).forEach(function(cat){var items=(listByCat[cat]||[]).filter(function(x){return !q||(x.t.title+' '+x.t.subtitle).toLowerCase().indexOf(q)>=0});if(!items.length)return;
    html+='<div class="grp">'+CATS[cat]+' · '+items.length+'</div>';
    items.forEach(function(x){html+='<button class="trow" onclick="openPlayer(\\''+x.t.id+'\\')"><span class="n">'+String(x.n).padStart(2,'0')+'</span><div style="flex:1;min-width:0"><b>'+esc(x.t.title)+'</b><small>'+esc(x.t.subtitle)+'</small></div><span class="g">'+x.t.stages.length+' bölüm</span></button>'});});
  $('#theoryList').innerHTML=html||'<p style="padding:30px;text-align:center;color:#71717a">Sonuç yok</p>';}
renderList('');
function openTheories(){show('list')}
function showTheoryFor(id){var map={sun:'gunesin-dogusu',earth:'dunyanin-olusumu',mars:'marsin-kaderi',jupiter:'jupiterin-dogusu',saturn:'saturnun-halkalari',moon:'buyuk-carpma'};var t=map[id];if(t)openPlayer(t);else openTheories()}

/* =========================== OYNATICI =========================== */
var cur=null,idx=0,playing=false,segTimer=null,segStart=0,segDur=9,sndOn=false;
var pctx=$('#pcv').getContext('2d');
function openPlayer(id){cur=DATA.theories.find(function(t){return t.id===id});idx=0;playing=true;
  $('#pTitle').textContent=cur.title;$('#pIdx').textContent='1/'+cur.stages.length;
  var segs='';cur.stages.forEach(function(s,i){segs+='<i onclick="jump('+i+')"><b id="seg'+i+'"></b></i>'});
  $('#sprog').innerHTML=segs;
  applyCat(cur.cat);show('player');renderStage(true);loopPlayer();
  if(sndOn)blip(true);}
function closePlayer(){playing=false;clearTimeout(segTimer);$('#view-player').classList.remove('on')}
function applyCat(cat){var c=CATCOL[cat]||'#fbbf24';var rgb=hexToRgb(c);
  document.getElementById('view-player').style.background='radial-gradient(120% 90% at 50% 8%, rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',0.13), transparent 60%), radial-gradient(100% 80% at 80% 100%, rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',0.07), transparent 55%), #040406';
  pcvDust.color=c;}
function stageDurCalc(){var s=cur.stages[idx];return Math.max(8,Math.min(15,7+(s.text.length/26)))}
function renderStage(first){var s=cur.stages[idx];
  $('#sera').textContent=s.era;
  var ti=$('#stitle'),te=$('#stext');
  if(!first){ti.classList.add('out');te.classList.add('out');
    setTimeout(function(){ti.classList.remove('out');ti.classList.add('in2');te.classList.remove('out');te.classList.add('in2');
      setTimeout(function(){ti.textContent=s.title;te.textContent=s.text;ti.classList.remove('in2');te.classList.remove('in2')},60);},860);
    var sw=$('#sweep');sw.classList.remove('go');void sw.offsetWidth;sw.classList.add('go');
    if(sndOn)blip(false);
  }else{ti.textContent=s.title;te.textContent=s.text;}
  $('#pIdx').textContent=(idx+1)+'/'+cur.stages.length;
  renderNotes(s);
  segDur=stageDurCalc();segStart=Date.now();
  clearTimeout(segTimer);segTimer=setTimeout(nextStage,segDur*1000);}
function renderNotes(s){var box=$('#pnotes');box.innerHTML='';
  var t0=idx?cur.stages[idx-1].until:0,t1=s.until;
  cur.notes.forEach(function(n){
    if(n.t0>=t0-0.02&&n.t0<t1-0.02){
      var e=document.createElement('div');e.className='note';e.textContent=n.text;
      e.style.left=(n.x*82+4)+'%';e.style.top=(n.y*74+8)+'%';
      box.appendChild(e);
      var local=(n.t0-t0)/(t1-t0);var delay=Math.max(0,local*segDur*1000);
      setTimeout(function(){e.classList.add('on')},Math.min(delay,segDur*1000-400));
      var hideAt=(n.t1>=t1?1:(n.t1-t0)/(t1-t0))*segDur*1000;
      setTimeout(function(){e.classList.remove('on')},hideAt);}});}
function nextStage(){if(!cur)return;if(idx<cur.stages.length-1){idx++;renderStage(false)}else{playing=false;$('#playBtn').textContent='▶'}}
function prevStage(){if(!cur)return;if(idx>0){idx--;renderStage(false)}}
function jump(i){if(!cur||i===idx)return;idx=i;renderStage(false)}
function togglePlay(){playing=!playing;
  $('#playBtn').textContent=playing?'⏸':'▶';
  clearTimeout(segTimer);
  if(playing){var rem=(segDur*1000)-(Date.now()-segStart);if(rem<400)rem=400;segStart=Date.now()-(segDur*1000-rem);segTimer=setTimeout(nextStage,rem);}
}
/* parçacık tozları */
var pcvDust={color:'#fbbf24',pts:[]};
(function(){for(var i=0;i<90;i++)pcvDust.pts.push({x:Math.random(),y:Math.random(),s:Math.random()*1.6+.3,v:Math.random()*.014+.004})})();
function loopPlayer(){if(!$('#view-player').classList.contains('on'))return;
  var cv=$('#pcv'),w=cv.clientWidth,h=cv.clientHeight,d=window.devicePixelRatio||1;
  if(cv.width!==Math.round(w*d)||cv.height!==Math.round(h*d)){cv.width=w*d;cv.height=h*d;pctx.setTransform(d,0,0,d,0,0)}
  pctx.clearRect(0,0,w,h);
  var c=hexToRgb(pcvDust.color);
  pcvDust.pts.forEach(function(p){p.y-=p.v/60;if(p.y<0)p.y=1;
    pctx.fillStyle='rgba('+c[0]+','+c[1]+','+c[2]+','+(.08+p.s*.1)+')';
    pctx.beginPath();pctx.arc(p.x*w,p.y*h,p.s,0,6.283);pctx.fill();});
  var pr=playing?Math.min(1,(Date.now()-segStart)/(segDur*1000)):(document.getElementById('seg'+idx)?Math.min(1,(Date.now()-segStart)/(segDur*1000)):0);
  for(var i=0;i<cur.stages.length;i++){var b=document.getElementById('seg'+i);if(!b)continue;
    b.style.width=(i<idx?100:(i===idx?pr*100:0))+'%';}
  requestAnimationFrame(loopPlayer);}
/* WebAudio geçiş efektleri */
var AC=null;
function toggleSnd(){sndOn=!sndOn;$('#sndBtn').textContent=sndOn?'🔊':'🔇';
  if(sndOn){AC=AC||new (window.AudioContext||window.webkitAudioContext)();AC.resume();blip(false)}}
function blip(open){if(!AC||!sndOn)return;var t=AC.currentTime;
  var o=AC.createOscillator(),g=AC.createGain();o.type='sine';
  o.frequency.setValueAtTime(open?120:220,t);o.frequency.exponentialRampToValueAtTime(open?330:55,t+1.5);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(open?0.07:0.05,t+.25);g.gain.exponentialRampToValueAtTime(0.0001,t+1.7);
  o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+1.8);
  var o2=AC.createOscillator(),g2=AC.createGain();o2.type='triangle';
  o2.frequency.setValueAtTime(open?60:440,t);o2.frequency.exponentialRampToValueAtTime(open?90:180,t+1.2);
  g2.gain.setValueAtTime(0.0001,t);g2.gain.exponentialRampToValueAtTime(0.03,t+.3);g2.gain.exponentialRampToValueAtTime(0.0001,t+1.4);
  o2.connect(g2);g2.connect(AC.destination);o2.start(t);o2.stop(t+1.5);}
/* klavye */
document.addEventListener('keydown',function(e){
  if(!$('#view-player').classList.contains('on'))return;
  if(e.key==='ArrowRight')nextStage();else if(e.key==='ArrowLeft')prevStage();
  else if(e.key===' '){e.preventDefault();togglePlay()}else if(e.key==='Escape')closePlayer();});
</script>
</body>
</html>`;

/* -------------------------------- yazma ---------------------------------- */
mkdirSync(new URL("../public", import.meta.url), { recursive: true });
const out = new URL("../public/gunes-sistemi-eba.html", import.meta.url);
writeFileSync(out, html.replace("__DATA__", JSON.stringify(data)));
console.log(
  "✔ üretildi:",
  out.pathname,
  "→",
  (JSON.stringify(data).length / 1024).toFixed(0) + " KB veri gömülü"
);
