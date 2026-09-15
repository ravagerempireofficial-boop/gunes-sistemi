/**
 * make-eba — EBA TEK DOSYA ÇIKTISI ÜRETİCİ
 *
 * public/eba-gunes-sistemi.html dosyasını üretir:
 * · TAMAMEN OFFLINE tek HTML (2 tıkla telefonda/EBA akıllı tahtada çalışır)
 * · 49 teori, derinlik bölümleri dahil, kategoriye uygun sahneler
 * · v3 aşırı yumuşak geçiş motoru (bw=%5,5, kuintik easing, 9 katman)
 * · Güneş Sistemi simülasyonu (gerçek yörünge verisi)
 * · 3D kesit iç yapılar (INTERIORS)
 * · WebAudio ses efektleri (25 sfx)
 * · Dış bağımlılık YOK: font, CDN, ağ isteği sıfır.
 *
 * Çalıştır: bun scripts/make-eba.ts
 */

import { THEORIES } from "../src/lib/theories";
import { BODIES } from "../src/lib/solar-data";
import { INTERIORS } from "../src/lib/interiors";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

/* --------------------------- veri sıkıştırma ------------------------------ */

const theoriesLite = THEORIES.map((t) => ({
  id: t.id,
  title: t.title,
  subtitle: t.subtitle,
  duration: t.duration,
  color: t.color,
  cat: t.cat,
  stages: t.stages.map((s) => [s.until, s.title, s.text, s.era]),
  notes: t.notes.map((n) => [n.t0, n.t1, n.text, n.x, n.y]),
  cues: t.cues.map((c) => [c.t, c.sfx, c.power ?? 1]),
  ticker: t.ticker,
}));

const bodiesLite = BODIES.filter((b) => !b.sim.parentId).map((b) => ({
  id: b.id,
  name: b.name,
  type: b.type,
  color: b.color,
  stats: b.stats,
  orbit: b.orbitInfo,
  desc: b.description,
  facts: b.facts,
  sim: { a: b.sim.a, e: b.sim.e, period: b.sim.periodDays, incl: b.sim.inclDeg },
}));

const interiorsLite = INTERIORS;

/* --------------------------- HTML gövde ----------------------------------- */

const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
<meta name="description" content="Güneş Sistemi ve Bilimsel Teoriler — EBA sürümü. Yapımcı: Samir Arabzadeh">
<title>Güneş Sistemi &amp; Bilimsel Teoriler — EBA Sürümü</title>
<style>
:root{
  --bg:#05060f; --bg2:#0a0d1f; --panel:rgba(14,18,38,.86); --line:rgba(130,150,255,.16);
  --txt:#e8ecff; --dim:#9aa3c7; --gold:#f5c96b; --acc:#f5a623; --acc2:#7ee0c3; --danger:#ff7a6b;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{height:100%}
body{
  background:radial-gradient(120% 90% at 50% -10%, #101736 0%, #070a18 46%, #030409 100%);
  color:var(--txt); font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  overflow:hidden; user-select:none;
}
#bgstars{position:fixed;inset:0;z-index:0;pointer-events:none}
#app{position:fixed;inset:0;z-index:1;display:flex;flex-direction:column}
header{
  display:flex;align-items:center;gap:10px;padding:8px 14px;
  background:linear-gradient(180deg, rgba(16,20,44,.92), rgba(10,13,28,.78));
  border-bottom:1px solid var(--line); backdrop-filter:blur(8px); flex-wrap:wrap;
}
.logo{width:30px;height:30px;border-radius:50%;
  background:radial-gradient(circle at 35% 35%, #fff2c8, #ffb347 46%, #b3541e 78%, #6e2a10);
  box-shadow:0 0 14px rgba(255,180,80,.55); flex:none}
h1{font-size:14.5px;font-weight:800;letter-spacing:.3px;white-space:nowrap;
  background:linear-gradient(90deg,#ffe6b0,#f5c96b 40%,#8ad7ff);-webkit-background-clip:text;background-clip:text;color:transparent}
.sub{font-size:10px;color:var(--dim);margin-top:1px}
.hgrow{flex:1;min-width:8px}
nav{display:flex;gap:6px;flex-wrap:wrap}
.navbtn{
  border:1px solid var(--line);background:rgba(22,28,58,.6);color:var(--dim);
  padding:7px 12px;border-radius:999px;font-size:11.5px;font-weight:700;cursor:pointer;
  transition:all .35s cubic-bezier(.22,1,.36,1); min-height:32px;
}
.navbtn:hover{color:var(--txt);border-color:rgba(245,201,107,.45);transform:translateY(-1px)}
.navbtn.on{color:#10131f;background:linear-gradient(135deg,#ffd98a,#f5a623);border-color:transparent;box-shadow:0 4px 18px rgba(245,166,35,.35)}
main{flex:1;position:relative;overflow:hidden}
.view{position:absolute;inset:0;opacity:0;pointer-events:none;transition:opacity .8s cubic-bezier(.22,1,.36,1);display:flex;flex-direction:column}
.view.on{opacity:1;pointer-events:auto}
.viewpad{flex:1;overflow-y:auto;padding:14px;scrollbar-width:thin;scrollbar-color:rgba(140,160,255,.25) transparent}
.viewpad::-webkit-scrollbar{width:8px}
.viewpad::-webkit-scrollbar-thumb{background:rgba(140,160,255,.22);border-radius:99px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:14px;
  transition:transform .4s cubic-bezier(.22,1,.36,1), box-shadow .4s, border-color .4s}
.card:hover{transform:translateY(-2px);border-color:rgba(245,201,107,.35);box-shadow:0 10px 34px rgba(0,0,0,.5)}
.chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.chip{border:1px solid var(--line);background:rgba(22,28,58,.55);color:var(--dim);padding:6px 11px;border-radius:999px;font-size:11px;font-weight:700;cursor:pointer;transition:all .35s}
.chip.on{color:#0d1020;background:linear-gradient(135deg,#9be8d0,#7ee0c3);border-color:transparent}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}
.tcard{cursor:pointer;position:relative;overflow:hidden}
.tcard .dot{position:absolute;top:12px;right:12px;width:10px;height:10px;border-radius:50%;box-shadow:0 0 10px currentColor}
.tcard h3{font-size:13.5px;font-weight:800;margin-bottom:4px}
.tcard p{font-size:11px;color:var(--dim);line-height:1.5;max-height:48px;overflow:hidden}
.tcard .meta{display:flex;gap:8px;margin-top:8px;font-size:10px;color:var(--dim)}
.badge{padding:2px 8px;border-radius:99px;background:rgba(126,224,195,.12);color:var(--acc2);font-weight:700;border:1px solid rgba(126,224,195,.25)}
.sect{font-size:12px;font-weight:800;letter-spacing:1.6px;color:var(--gold);margin:16px 2px 8px;text-transform:uppercase}
.simwrap{flex:1;display:flex;position:relative;min-height:0}
#simcv{position:absolute;inset:0;width:100%;height:100%;cursor:pointer}
.simhud{position:absolute;top:10px;left:10px;display:flex;gap:6px;z-index:5;flex-wrap:wrap}
.hudbtn{border:1px solid var(--line);background:rgba(12,16,34,.8);color:var(--dim);padding:6px 10px;border-radius:10px;font-size:11px;font-weight:700;cursor:pointer;transition:all .3s;min-height:32px}
.hudbtn:hover{color:var(--txt);border-color:rgba(245,201,107,.4)}
.infopanel{
  position:absolute;top:52px;right:10px;width:288px;max-height:calc(100% - 64px);overflow-y:auto;z-index:6;
  background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:14px;
  backdrop-filter:blur(10px);transform:translateX(16px);opacity:0;pointer-events:none;
  transition:all .55s cubic-bezier(.22,1,.36,1);scrollbar-width:thin;
}
.infopanel.on{transform:none;opacity:1;pointer-events:auto}
.infopanel h2{font-size:17px;font-weight:800;margin-bottom:2px}
.infopanel .type{font-size:10px;color:var(--acc2);font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px}
.infopanel p{font-size:11.5px;color:var(--dim);line-height:1.6;margin-bottom:10px}
.stats{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px}
.stat{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:6px 8px}
.stat b{display:block;font-size:9px;color:var(--gold);text-transform:uppercase;letter-spacing:.6px;margin-bottom:2px}
.stat span{font-size:10.5px;line-height:1.35;display:block}
.facts li{font-size:11px;color:var(--dim);line-height:1.55;margin:5px 0 5px 14px}
.interior-block{margin-top:6px}
.interior-block h4{font-size:11px;color:var(--gold);margin-bottom:6px;letter-spacing:.8px}
#intcv{width:100%;border-radius:12px;background:rgba(0,0,0,.35);border:1px solid var(--line)}
.intlayer{display:flex;gap:8px;align-items:flex-start;padding:5px 0;border-bottom:1px dashed rgba(255,255,255,.07)}
.intlayer .sw{width:11px;height:11px;border-radius:3px;flex:none;margin-top:2px;box-shadow:0 0 8px currentColor}
.intlayer b{font-size:10.5px;display:block}
.intlayer small{font-size:9.5px;color:var(--dim);line-height:1.4;display:block}
/* teori oynatıcı */
#player{position:fixed;inset:0;z-index:40;background:rgba(3,4,10,.92);backdrop-filter:blur(14px);
  opacity:0;pointer-events:none;transition:opacity .7s cubic-bezier(.22,1,.36,1);display:flex;flex-direction:column}
#player.on{opacity:1;pointer-events:auto}
.phead{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--line);flex-wrap:wrap}
.phead h2{font-size:14.5px;font-weight:800}
.phead .psub{font-size:10.5px;color:var(--dim);width:100%;order:9}
.pbtn{border:1px solid var(--line);background:rgba(20,26,54,.7);color:var(--txt);width:36px;height:36px;border-radius:50%;
  font-size:14px;cursor:pointer;transition:all .3s;flex:none;display:flex;align-items:center;justify-content:center;min-width:36px;min-height:36px}
.pbtn:hover{border-color:rgba(245,201,107,.5);box-shadow:0 0 14px rgba(245,201,107,.25)}
.pbtn.big{width:44px;height:44px;background:linear-gradient(135deg,#ffd98a,#f5a623);color:#141414;border:none;font-size:16px}
#pcvwrap{flex:1;position:relative;min-height:0}
#pcv{position:absolute;inset:0;width:100%;height:100%}
.stagetitle{
  position:absolute;left:50%;bottom:76px;transform:translateX(-50%);text-align:center;pointer-events:none;
  max-width:min(92%,640px);
}
.stagetitle b{display:block;font-size:15px;font-weight:800;text-shadow:0 2px 18px rgba(0,0,0,.9)}
.stagetitle span{font-size:10.5px;color:var(--gold);letter-spacing:1.2px;text-transform:uppercase}
.stagetitle p{font-size:11.5px;color:rgba(232,236,255,.82);line-height:1.5;margin-top:4px;text-shadow:0 1px 10px rgba(0,0,0,.95);
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.pctrl{display:flex;align-items:center;gap:10px;padding:9px 14px;border-top:1px solid var(--line);flex-wrap:wrap}
#pbar{flex:1;height:26px;display:flex;align-items:center;cursor:pointer;min-width:120px}
#pbar .track{width:100%;height:6px;border-radius:99px;background:rgba(255,255,255,.1);overflow:hidden}
#pbar .fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#7ee0c3,#f5c96b);transition:width .18s linear}
#pbar .knob{position:relative;top:-16px;height:16px;width:16px;border-radius:50%;background:#fff;box-shadow:0 0 10px rgba(255,255,255,.6);margin-left:-8px}
.ptime{font-size:10.5px;color:var(--dim);font-variant-numeric:tabular-nums;flex:none}
.stagelist{display:flex;gap:4px;overflow-x:auto;padding:6px 14px 10px;scrollbar-width:thin}
.sgpill{flex:none;border:1px solid var(--line);background:rgba(18,23,48,.6);color:var(--dim);
  padding:4px 10px;border-radius:99px;font-size:10px;font-weight:700;cursor:pointer;transition:all .35s;white-space:nowrap}
.sgpill.on{color:#10131f;background:linear-gradient(135deg,#cfe0ff,#9db8ff);border-color:transparent}
.sgpill.done{color:var(--acc2);border-color:rgba(126,224,195,.4)}
footer{
  padding:7px 14px;border-top:1px solid var(--line);display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  background:rgba(8,10,24,.85);font-size:10px;color:var(--dim);
}
.sig{font-weight:800;color:var(--gold);letter-spacing:.4px}
footer .hgrow{flex:1}
.dl{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(245,201,107,.45);color:var(--gold);
  padding:4px 10px;border-radius:99px;font-size:10px;font-weight:700;text-decoration:none;transition:all .3s;min-height:28px}
.dl:hover{background:rgba(245,201,107,.12)}
.hint{font-size:10px;color:var(--dim);text-align:center;padding:4px 10px 10px}
@media (max-width:640px){
  h1{font-size:12.5px}
  .infopanel{left:10px;width:auto;top:52px}
  .stagetitle b{font-size:13px}
}
</style>
</head>
<body>
<canvas id="bgstars"></canvas>
<div id="app">
<header>
  <div class="logo" aria-hidden="true"></div>
  <div>
    <h1>Güneş Sistemi &amp; Bilimsel Teoriler</h1>
    <div class="sub">EBA Sürümü · Çevrimdışı çalışır · 49 teori</div>
  </div>
  <div class="hgrow"></div>
  <nav>
    <button class="navbtn on" data-view="sim">☀️ Güneş Sistemi</button>
    <button class="navbtn" data-view="theories">🌌 Teoriler</button>
    <button class="navbtn" data-view="interiors">🪐 İç Yapılar</button>
    <button class="navbtn" data-view="about">ℹ️ Hakkında</button>
  </nav>
</header>
<main>
  <!-- SİMÜLASYON -->
  <section class="view on" id="view-sim">
    <div class="simwrap">
      <canvas id="simcv"></canvas>
      <div class="simhud">
        <button class="hudbtn" id="spdBtn">Hız: 1×</button>
        <button class="hudbtn" id="orbitBtn">Yörüngeler: açık</button>
        <button class="hudbtn" id="labelsBtn">Etiketler: açık</button>
      </div>
      <aside class="infopanel" id="infoPanel">
        <h2 id="infoName">—</h2>
        <div class="type" id="infoType">—</div>
        <p id="infoDesc"></p>
        <div class="stats" id="infoStats"></div>
        <div class="stats" id="infoOrbit"></div>
        <ul class="facts" id="infoFacts"></ul>
        <div class="interior-block" id="infoInterior"></div>
      </aside>
      <div class="hint">Cisimlere dokun → bilgi kartı · sürükle → incele · tekerlek/kıstır → yakınlaş</div>
    </div>
  </section>
  <!-- TEORİLER -->
  <section class="view" id="view-theories">
    <div class="viewpad">
      <div class="chips" id="catChips"></div>
      <div class="grid" id="theoryGrid"></div>
    </div>
  </section>
  <!-- İÇ YAPILAR -->
  <section class="view" id="view-interiors">
    <div class="viewpad">
      <div class="sect">Gezegen &amp; Uydu İç Yapıları — 3D Kesit</div>
      <div class="chips" id="intChips"></div>
      <div class="card" style="max-width:760px;margin:0 auto">
        <canvas id="intcv" width="700" height="430" style="width:100%;height:auto"></canvas>
        <div id="intLayers" style="margin-top:10px"></div>
      </div>
    </div>
  </section>
  <!-- HAKKINDA -->
  <section class="view" id="view-about">
    <div class="viewpad">
      <div class="card" style="max-width:640px;margin:0 auto">
        <h2 style="font-size:16px;margin-bottom:8px">Bu dosya hakkında</h2>
        <p style="font-size:12px;color:var(--dim);line-height:1.7">
          Bu <b>tek dosyalık HTML</b>, internet olmadan; telefonda, tablette, akıllı tahtada ve
          EBA ortamında <b>çift tıkla</b> açılıp çalışır. İçinde 49 bilimsel teorinin
          aşamalı animasyonları (aşırı yumuşak v3 geçişleriyle), Güneş Sistemi simülasyonu,
          gezegen iç yapılarının 3D kesitleri ve WebAudio ses efektleri bulunur.
          Dosyayı paylaşmak için cihazınıza indirip gönderebilirsiniz — başka hiçbir şey gerekmez.
        </p>
        <p style="font-size:12px;color:var(--dim);line-height:1.7;margin-top:10px">
          <b style="color:var(--gold)">yapımcı: Samir Arabzadeh</b>
        </p>
      </div>
    </div>
  </section>
</main>
<footer>
  <span>yapımcı: <span class="sig">Samir Arabzadeh</span></span>
  <div class="hgrow"></div>
  <span>çevrimdışı · tek dosya</span>
</footer>
</div>

<!-- TEORİ OYNATICI -->
<div id="player" role="dialog" aria-modal="true">
  <div class="phead">
    <button class="pbtn" id="pClose" aria-label="Kapat">✕</button>
    <h2 id="pTitle">—</h2>
    <div class="hgrow"></div>
    <button class="pbtn big" id="pPlay" aria-label="Oynat/Duraklat">❚❚</button>
    <button class="pbtn" id="pMute" aria-label="Ses">🔊</button>
    <div class="psub" id="pSub">—</div>
  </div>
  <div id="pcvwrap"><canvas id="pcv"></canvas>
    <div class="stagetitle" id="pStage"><b></b><span></span><p></p></div>
  </div>
  <div class="stagelist" id="pPills"></div>
  <div class="pctrl">
    <span class="ptime" id="pTime">00:00</span>
    <div id="pbar"><div class="track"><div class="fill" id="pFill"></div></div><div class="knob" id="pKnob"></div></div>
    <span class="ptime" id="pDur">00:00</span>
  </div>
</div>

<script>
"use strict";
/* ============================ VERİ ====================================== */
const THEORIES = ${JSON.stringify(theoriesLite)};
const BODIES = ${JSON.stringify(bodiesLite)};
const INTERIORS = ${JSON.stringify(interiorsLite)};
const SIG = "yapımcı: Samir Arabzadeh";

/* ============================ YARDIMCILAR =============================== */
const clamp01 = (x) => x < 0 ? 0 : x > 1 ? 1 : x;
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (a, b, x) => { const t = clamp01((x - a) / (b - a || 1e-9)); return t * t * (3 - 2 * t); };
const smootherstep = (a, b, x) => { const t = clamp01((x - a) / (b - a || 1e-9)); return t * t * t * (t * (t * 6 - 15) + 10); };
function mulberry(seed) { let s = seed >>> 0; return () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rnd = mulberry(20240914);
const CATS = { kosmoloji: "Kozmoloji", fizik: "Fizik", gokyuzu: "Gök Cismi", jeoloji: "Jeoloji", yasam: "Yaşam", gelecek: "Gelecek" };
function hexRgb(h) { const c = h.replace("#", ""); return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]; }
function rgba(h, a) { const [r, g, b] = hexRgb(h); return \`rgba(\${r},\${g},\${b},\${a})\`; }
function fitCanvas(cv) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const r = cv.getBoundingClientRect();
  const w = Math.max(2, Math.floor(r.width * dpr)), h = Math.max(2, Math.floor(r.height * dpr));
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  return { w: r.width, h: r.height, dpr };
}

/* ======================= ARKA PLAN YILDIZLARI =========================== */
const bgcv = document.getElementById("bgstars"), bgx = bgcv.getContext("2d");
const BGSTARS = Array.from({ length: 170 }, () => ({ x: rnd(), y: rnd(), r: .4 + rnd() * 1.4, tw: rnd() * 6.28, sp: .3 + rnd() * .9 }));
let bgT = 0;
function drawBgStars(dt) {
  const { w, h, dpr } = fitCanvas(bgcv); bgT += dt;
  bgx.setTransform(dpr, 0, 0, dpr, 0, 0);
  bgx.clearRect(0, 0, w, h);
  for (const s of BGSTARS) {
    const a = .35 + .55 * Math.abs(Math.sin(bgT * s.sp + s.tw));
    bgx.globalAlpha = a; bgx.fillStyle = "#cdd7ff";
    bgx.beginPath(); bgx.arc(s.x * w, (s.y + bgT * .004 * s.sp) % 1 * h, s.r, 0, 6.283); bgx.fill();
  }
  bgx.globalAlpha = 1;
}

/* ============================ SES MOTORU ================================ */
const Sfx = (() => {
  let ac = null, master = null, muted = false;
  function ensure() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      ac = new AC(); master = ac.createGain(); master.gain.value = .8; master.connect(ac.destination);
    }
    if (ac.state === "suspended") ac.resume();
    return true;
  }
  function noiseBuf(dur) {
    const n = Math.floor(ac.sampleRate * dur), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return b;
  }
  function noise(dur, type, f0, f1, vol, q) {
    const src = ac.createBufferSource(); src.buffer = noiseBuf(dur);
    const flt = ac.createBiquadFilter(); flt.type = type; flt.Q.value = q || 1;
    flt.frequency.setValueAtTime(f0, ac.currentTime);
    flt.frequency.exponentialRampToValueAtTime(Math.max(30, f1), ac.currentTime + dur);
    const g = ac.createGain(); g.gain.setValueAtTime(vol, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + dur);
    src.connect(flt); flt.connect(g); g.connect(master); src.start(); src.stop(ac.currentTime + dur);
  }
  function tone(type, f0, f1, dur, vol, delay) {
    const t0 = ac.currentTime + (delay || 0);
    const o = ac.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
    const g = ac.createGain(); g.gain.setValueAtTime(.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(.05, dur * .2));
    g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + .05);
  }
  function play(name, power) {
    if (muted || !ensure()) return; const p = clamp01(power || 1);
    switch (name) {
      case "boom": noise(1.6, "lowpass", 400, 40, .9 * p, .7); tone("sine", 90, 26, 1.5, .7 * p); break;
      case "explosion": noise(1.1, "lowpass", 2600, 120, .8 * p, .5); tone("triangle", 220, 40, .9, .4 * p); break;
      case "supernova": noise(2.8, "lowpass", 900, 30, .85 * p, .6); tone("sine", 60, 18, 2.6, .6 * p); tone("sawtooth", 130, 24, 2.2, .12 * p); break;
      case "crash": noise(.7, "bandpass", 1800, 240, .8 * p, 1.4); tone("square", 160, 34, .5, .3 * p); break;
      case "crack": noise(.28, "highpass", 2400, 900, .6 * p, 2); tone("square", 900, 130, .16, .2 * p); break;
      case "rumble": noise(2.2, "lowpass", 160, 42, .55 * p, .9); break;
      case "lava": noise(2.0, "lowpass", 320, 60, .5 * p, 1); tone("sawtooth", 55, 30, 1.8, .2 * p); break;
      case "starform": [523, 659, 784, 1046].forEach((f, i) => tone("sine", f * .94, f, 1.1, .16 * p, i * .16)); noise(1.8, "bandpass", 600, 2400, .08 * p, 2); break;
      case "shimmer": [1318, 1568, 2093, 2637].forEach((f, i) => tone("sine", f, f * 1.02, .8, .09 * p, i * .07)); break;
      case "chime": [880, 1108, 1318].forEach((f, i) => tone("sine", f, f, 1.4, .13 * p, i * .12)); break;
      case "bell": tone("sine", 660, 655, 2.0, .18 * p); tone("sine", 1320, 1310, 1.4, .07 * p); break;
      case "whoosh": noise(1.0, "bandpass", 220, 3200, .5 * p, 1.8); break;
      case "wind": noise(2.6, "bandpass", 380, 700, .3 * p, .6); break;
      case "rain": noise(2.0, "highpass", 3200, 2200, .3 * p, .4); break;
      case "hiss": noise(1.4, "highpass", 5200, 3800, .22 * p, .3); break;
      case "splash": noise(.9, "lowpass", 1800, 260, .6 * p, .8); noise(.4, "highpass", 3600, 2400, .2 * p, .6); break;
      case "merge": tone("sine", 300, 300, 1.2, .2 * p); tone("sine", 452, 302, 1.2, .2 * p); tone("sine", 604, 300, 1.2, .12 * p); break;
      case "warp": tone("sawtooth", 900, 55, 1.3, .22 * p); noise(1.1, "bandpass", 3000, 200, .25 * p, 3); break;
      case "zap": tone("square", 1600, 180, .18, .3 * p); tone("square", 2200, 300, .1, .2 * p, .05); break;
      case "glitch": for (let i = 0; i < 6; i++) tone("square", 400 + Math.random() * 2400, 300, .05, .14 * p, i * .045); break;
      case "cell": tone("sine", 740, 980, .22, .2 * p); tone("sine", 1108, 1400, .18, .12 * p, .06); break;
      case "pop": tone("sine", 520, 900, .09, .3 * p); noise(.05, "highpass", 3000, 2500, .15 * p, 1); break;
      case "freeze": tone("sine", 2400, 3200, .9, .1 * p); noise(1.0, "highpass", 6000, 4600, .12 * p, .4); break;
      case "grow": tone("sawtooth", 120, 480, 1.1, .16 * p); tone("sine", 240, 960, 1.1, .1 * p); break;
      case "engine": tone("sawtooth", 70, 92, 1.6, .2 * p); noise(1.6, "lowpass", 260, 160, .2 * p, .8); break;
      default: tone("sine", 440, 660, .3, .2 * p);
    }
  }
  return { play, ensure, get muted() { return muted; }, set muted(v) { muted = v; } };
})();

/* ==================== SAHNE ARKETİPLERİ (kategoriye uygun) ============== */
function bgSpace(ctx, w, h, t, col) {
  const g = ctx.createRadialGradient(w * .5, h * .42, 0, w * .5, h * .45, Math.max(w, h) * .75);
  g.addColorStop(0, "#0b1030"); g.addColorStop(.55, "#060819"); g.addColorStop(1, "#02030a");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  if (col) { const v = ctx.createRadialGradient(w * .5, h * .5, 0, w * .5, h * .5, Math.max(w, h) * .6); v.addColorStop(0, rgba(col, .10)); v.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = v; ctx.fillRect(0, 0, w, h); }
  const r = mulberry(77);
  for (let i = 0; i < 90; i++) {
    const x = r() * w, y = r() * h, tw = .4 + .6 * Math.abs(Math.sin(t * (.4 + r()) + i));
    ctx.globalAlpha = tw * .8; ctx.fillStyle = "#dfe6ff";
    ctx.beginPath(); ctx.arc(x, y, .5 + r() * 1.2, 0, 6.283); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function star(x, y, r, col, a, ctx) { ctx.globalAlpha = a; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1; }
function blob(ctx, x, y, r, col, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
}
function drawPlanetBall(ctx, x, y, r, col, t, bandCol) {
  const g = ctx.createRadialGradient(x - r * .35, y - r * .35, r * .1, x, y, r);
  g.addColorStop(0, "#ffffff"); g.addColorStop(.25, col); g.addColorStop(1, "#0c0a08");
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.clip();
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  if (bandCol) { for (let i = -3; i <= 3; i++) { ctx.globalAlpha = .16; ctx.fillStyle = bandCol; ctx.fillRect(x - r, y + i * r * .3 + Math.sin(t + i) * r * .04, r * 2, r * .12); ctx.globalAlpha = 1; } }
  ctx.restore();
  const at = ctx.createRadialGradient(x + r * .55, y + r * .4, r * .2, x, y, r * 1.05);
  at.addColorStop(0, "rgba(0,0,0,0)"); at.addColorStop(1, "rgba(0,0,10,.55)");
  ctx.fillStyle = at; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
}
/* — kozmoloji — */
const SC = {
  bigbang(c) { const { ctx, w, h, t, local } = c; const e = smootherstep(0, 1, local);
    bgSpace(ctx, w, h, t); const R = lerp(6, Math.max(w, h) * .75, e);
    blob(ctx, w / 2, h / 2, R, "#fff3c0", .9 - e * .5); blob(ctx, w / 2, h / 2, R * .55, "#ffb347", .8);
    blob(ctx, w / 2, h / 2, R * .2, "#ffffff", .95); ctx.strokeStyle = rgba("#f5c96b", .5 - e * .35); ctx.lineWidth = 2;
    for (let i = 1; i <= 3; i++) { const rr = R * (1 + i * .16) % Math.max(w, h); ctx.globalAlpha = Math.max(0, .6 - i * .18 - e * .3); ctx.beginPath(); ctx.arc(w / 2, h / 2, rr, 0, 6.283); ctx.stroke(); }
    ctx.globalAlpha = 1;
    const rr = mulberry(5); for (let i = 0; i < 70; i++) { const an = rr() * 6.283, sp = .2 + rr() * .9, d = R * sp * e; star(w / 2 + Math.cos(an) * d, h / 2 + Math.sin(an) * d, .6 + rr() * 1.6, rr() > .8 ? "#ffd27a" : "#cdd7ff", .8 - e * .3, ctx); } },
  nebula(c) { const { ctx, w, h, t } = c; bgSpace(ctx, w, h, t);
    const rr = mulberry(11); for (let i = 0; i < 9; i++) { const x = w * (.15 + rr() * .7), y = h * (.15 + rr() * .7), r = w * (.08 + rr() * .18); blob(ctx, x, y, r + Math.sin(t * .5 + i) * 8, i % 3 ? "#8a5cff" : "#ff8a5c", .16); }
    for (let i = 0; i < 26; i++) { const x = w * rr(), y = h * rr(); star(x, y, .8 + rr() * 1.6, "#ffe9c0", .5 + .5 * Math.sin(t * 2 + i), ctx); } },
  inflation(c) { const { ctx, w, h, t, local } = c; const e = smootherstep(0, 1, local); bgSpace(ctx, w, h, t);
    const cx = w / 2, cy = h / 2; for (let i = 0; i < 7; i++) { const ph = ((t * .25 + i / 7) % 1); const rr = ph * Math.max(w, h) * .55 * (0.4 + e); ctx.globalAlpha = (1 - ph) * .5; ctx.strokeStyle = "#7ee0c3"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 6.283); ctx.stroke(); }
    ctx.globalAlpha = 1; blob(ctx, cx, cy, 26 + e * 60, "#ffd98a", .8); },
  cmb(c) { const { ctx, w, h, t, local } = c; bgSpace(ctx, w, h, t);
    const rr = mulberry(21); const ox = w * .12, oy = h * .1, ow = w * .76, oh = h * .8;
    for (let i = 0; i < 260; i++) { const x = ox + rr() * ow, y = oy + rr() * oh, rr2 = 6 + rr() * 26; const hot = rr();
      blob(ctx, x, y, rr2 + Math.sin(t + i) * 2, hot > .5 ? "#ff9a3c" : "#4a7cff", .1 + hot * .12); }
    ctx.strokeStyle = rgba("#f5c96b", .5); ctx.lineWidth = 1.5; ctx.strokeRect(ox, oy, ow, oh);
    ctx.fillStyle = "rgba(232,236,255,.85)"; ctx.font = "600 11px system-ui"; ctx.textAlign = "center";
    ctx.fillText("CMB — İlk ışığın haritası (2,725 K)", w / 2, oy - 8); },
  galaxy(c) { const { ctx, w, h, t, local } = c; bgSpace(ctx, w, h, t); const cx = w / 2, cy = h / 2, rot = t * .12 + local * 2;
    for (let arm = 0; arm < 2; arm++) for (let i = 0; i < 90; i++) { const f = i / 90, an = rot + arm * Math.PI + f * 4.2, rr = f * Math.min(w, h) * .44;
      const x = cx + Math.cos(an) * rr, y = cy + Math.sin(an) * rr * .62; star(x, y, 1 + (1 - f) * 2.2, f < .3 ? "#ffe9c0" : "#9fc4ff", .5 + .5 * Math.sin(i + t), ctx); }
    blob(ctx, cx, cy, Math.min(w, h) * .12, "#fff3c0", .8); blob(ctx, cx, cy, Math.min(w, h) * .05, "#ffffff", .95); },
  darkweb(c) { const { ctx, w, h, t } = c; bgSpace(ctx, w, h, t); const rr = mulberry(33);
    const nodes = Array.from({ length: 16 }, (_, i) => ({ x: w * (.1 + rr() * .8), y: h * (.12 + rr() * .76), ph: rr() * 6.28 }));
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) { const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < w * .34) { ctx.globalAlpha = .16 * (1 - d / (w * .34)); ctx.strokeStyle = "#8a9cff"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }
    ctx.globalAlpha = 1; nodes.forEach((n, i) => { const p = 1 + Math.sin(t * 1.4 + n.ph) * .3; blob(ctx, n.x, n.y, 10 * p + (i % 3) * 6, "#ffd98a", .5); star(n.x, n.y, 2, "#fff", .9, ctx); }); },
  spacetime(c) { const { ctx, w, h, t, local } = c; bgSpace(ctx, w, h, t); const cx = w / 2, cy = h * .42, mass = 30 + smootherstep(0, 1, local) * 26;
    ctx.strokeStyle = "rgba(140,160,255,.3)"; ctx.lineWidth = 1;
    for (let gy = -5; gy <= 5; gy++) { ctx.beginPath(); for (let gx = -9; gx <= 9; gx++) { const x = cx + gx * (w / 11), y = cy + gy * (h / 8); const d = Math.hypot(gx, gy); const sag = Math.exp(-d * d / 7) * mass; ctx.lineTo(x, y + sag + Math.sin(t + gx * gy) * 1.2); } ctx.stroke(); }
    drawPlanetBall(ctx, cx, cy, mass * .55, "#f5a623", t);
    ctx.fillStyle = "rgba(232,236,255,.8)"; ctx.font = "600 10.5px system-ui"; ctx.textAlign = "center"; ctx.fillText("Kütle, uzay-zamanı büker", cx, h * .88); },
  particles(c) { const { ctx, w, h, t } = c; bgSpace(ctx, w, h, t); const rr = mulberry(44);
    for (let i = 0; i < 60; i++) { const sp = .3 + rr() * 1.2, ph = rr() * 100; const x = (rr() * w + Math.sin(t * sp + ph) * 30 + w) % w, y = (rr() * h + Math.cos(t * sp * .8 + ph) * 22 + h) % h;
      const col = i % 5 === 0 ? "#7ee0c3" : i % 3 === 0 ? "#ffd98a" : "#cdd7ff"; star(x, y, 1.2 + rr() * 2, col, .8, ctx); if (rr() > .7) { ctx.strokeStyle = rgba(col, .25); ctx.beginPath(); ctx.arc(x, y, 8 + Math.sin(t * 2 + i) * 3, 0, 6.283); ctx.stroke(); } } },
  lightcones(c) { const { ctx, w, h, t } = c; bgSpace(ctx, w, h, t); const cx = w / 2, cy = h / 2;
    const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, "rgba(126,224,195,.13)"); g.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(0, 0); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
    const g2 = ctx.createLinearGradient(w, 0, 0, h); g2.addColorStop(0, "rgba(245,166,35,.13)"); g2.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = g2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(w, 0); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
    ctx.font = "600 10.5px system-ui"; ctx.fillStyle = "rgba(232,236,255,.8)"; ctx.textAlign = "left"; ctx.fillText("geçmiş ışık konisi", 12, h - 14); ctx.textAlign = "right"; ctx.fillText("etki alanı", w - 12, h - 14);
    blob(ctx, cx, cy, 20, "#ffffff", .95); },
  horizon(c) { const { ctx, w, h, t } = c; bgSpace(ctx, w, h, t); const cx = w / 2, cy = h / 2, R = Math.min(w, h) * .18;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * .3);
    for (let i = 0; i < 3; i++) { ctx.strokeStyle = rgba("#f5a623", .55 - i * .15); ctx.lineWidth = 2 - i * .5; ctx.beginPath(); ctx.ellipse(0, 0, R * (1.5 + i * .35), R * (.5 + i * .1), 0, 0, 6.283); ctx.stroke(); }
    ctx.restore();
    const g = ctx.createRadialGradient(cx + R * .35, cy + R * .3, R * .1, cx, cy, R * 1.7);
    g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(.55, "rgba(255,170,60,.5)"); g.addColorStop(.75, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.8, 0, 6.283); ctx.fill();
    ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.fill();
    ctx.strokeStyle = "rgba(255,220,150,.8)"; ctx.lineWidth = 2; ctx.stroke(); },
  system(c) { const { ctx, w, h, t } = c; bgSpace(ctx, w, h, t); const cx = w / 2, cy = h / 2;
    const rr = mulberry(55); for (let i = 0; i < 5; i++) { const R = Math.min(w, h) * (.14 + i * .09); ctx.strokeStyle = "rgba(160,175,255,.22)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(cx, cy, R, R * .42, 0, 0, 6.283); ctx.stroke();
      const an = t * (.5 + i * .3) + rr() * 6.28; drawPlanetBall(ctx, cx + Math.cos(an) * R, cy + Math.sin(an) * R * .42, 4 + i * 2.2, ["#b8aca0", "#e3c48f", "#7da86a", "#d8824a", "#e8d0a8"][i], t); }
    blob(ctx, cx, cy, Math.min(w, h) * .1, "#ffd27a", .95); blob(ctx, cx, cy, Math.min(w, h) * .05, "#fff8e0", 1); },
  comet(c) { const { ctx, w, h, t } = c; bgSpace(ctx, w, h, t); const p = (t * .12) % 1.6 - .3;
    const x = lerp(-40, w + 40, p), y = h * .3 + Math.sin(p * 6.283) * h * .25;
    ctx.strokeStyle = "rgba(180,220,255,.5)"; ctx.lineWidth = 3; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 90, y + 26); ctx.stroke(); ctx.lineWidth = 1.4; ctx.globalAlpha = .5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 170, y + 48); ctx.stroke(); ctx.globalAlpha = 1;
    blob(ctx, x, y, 16, "#bfe0ff", .9); star(x, y, 4, "#ffffff", 1, ctx); },
  /* — gök cismi özel sahneleri (Dünya yüzeyi dahil) — */
  sunbirth(c) { const { ctx, w, h, t, local } = c; const e = smootherstep(0, 1, local); bgSpace(ctx, w, h, t);
    const rr = mulberry(9); for (let i = 0; i < 8; i++) blob(ctx, w * (.2 + rr() * .6), h * (.2 + rr() * .6), w * (.1 + rr() * .16), i % 2 ? "#8a5cff" : "#5c9cff", .14 * (1 - e));
    const R = Math.min(w, h) * (.07 + e * .12); blob(ctx, w / 2, h / 2, R * 2.4, "#ffb347", .5); blob(ctx, w / 2, h / 2, R * 1.5, "#ffd27a", .8);
    drawPlanetBall(ctx, w / 2, h / 2, R, "#ffdd88", t); ctx.globalAlpha = .5; ctx.strokeStyle = "#fff2c8"; ctx.lineWidth = 1.6;
    for (let i = 0; i < 8; i++) { const a = t * .4 + i / 8 * 6.283; ctx.beginPath(); ctx.moveTo(w / 2 + Math.cos(a) * R * 1.2, h / 2 + Math.sin(a) * R * 1.2); ctx.lineTo(w / 2 + Math.cos(a) * R * (1.7 + Math.sin(t * 2 + i) * .15), h / 2 + Math.sin(a) * R * (1.7 + Math.cos(t * 2 + i) * .15)); ctx.stroke(); }
    ctx.globalAlpha = 1; },
  earthform(c) { const { ctx, w, h, t, local } = c; const e = smootherstep(0, 1, local);
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#1a0703"); g.addColorStop(1, "#380d05"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    bgSpace(ctx, w, h, t); drawPlanetBall(ctx, w / 2, h / 2, Math.min(w, h) * .3, lerp2col("#ff6a2a", "#5c7d9c", e), t);
    ctx.globalAlpha = (1 - e) * .9; for (let i = 0; i < 10; i++) { const a = t + i / 10 * 6.283, x = w / 2 + Math.cos(a) * Math.min(w, h) * .34, y = h / 2 + Math.sin(a) * Math.min(w, h) * .34; blob(ctx, x, y, 12, "#ff8a3c", .8); }
    ctx.globalAlpha = e * .8; for (let i = 0; i < 14; i++) { const x = w * (.3 + mulberry(i)() * .4), y = h * (.32 + mulberry(i + 3)() * .36); blob(ctx, x, y, 9, "#dff0ff", .9); } ctx.globalAlpha = 1; },
  impact(c) { const { ctx, w, h, t, local } = c; const e = smoothstep(.15, .55, local); bgSpace(ctx, w, h, t);
    const x1 = lerp(w * .12, w * .48, smootherstep(0, .5, local)), y1 = h * .38, x2 = w * .62, y2 = h * .6;
    drawPlanetBall(ctx, x2, y2, Math.min(w, h) * .2, "#7da86a", t);
    drawPlanetBall(ctx, x1, y1, Math.min(w, h) * .09, "#b8603a", t);
    if (e > 0) { blob(ctx, (x1 + x2) / 2, (y1 + y2) / 2, Math.min(w, h) * .5 * e, "#fff3c0", (1 - e) * .9); ctx.strokeStyle = rgba("#ffb347", Math.max(0, .8 - e)); ctx.lineWidth = 3; for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc((x1 + x2) / 2, (y1 + y2) / 2, Math.min(w, h) * .22 * e * i, 0, 6.283); ctx.stroke(); }
      const rr = mulberry(66); for (let i = 0; i < 40; i++) { const a = rr() * 6.283, d = e * Math.min(w, h) * .6 * rr(); star((x1 + x2) / 2 + Math.cos(a) * d, (y1 + y2) / 2 + Math.sin(a) * d, 1 + rr() * 2, "#ffd27a", (1 - e) * .9, ctx); } } },
  ocean(c) { const { ctx, w, h, t, local } = c; const e = smootherstep(0, 1, local);
    bgSpace(ctx, w, h, t); drawPlanetBall(ctx, w / 2, h / 2, Math.min(w, h) * .3, lerp2col("#b8603a", "#2b6ea8", e), t);
    ctx.save(); ctx.beginPath(); ctx.arc(w / 2, h / 2, Math.min(w, h) * .3, 0, 6.283); ctx.clip();
    ctx.globalAlpha = e * .85; for (let i = 0; i < 9; i++) { const x = w * (.28 + mulberry(i)() * .44), y = h * (.3 + mulberry(i + 9)() * .4); blob(ctx, x, y, 16 + Math.sin(t + i) * 3, "#bfe4ff", .8); } ctx.globalAlpha = 1; ctx.restore(); },
  soup(c) { const { ctx, w, h, t, local } = c;
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#123a2c"); g.addColorStop(.5, "#0d2f3f"); g.addColorStop(1, "#07202c"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const rr = mulberry(3); for (let i = 0; i < 40; i++) { const x = (rr() * w + Math.sin(t * .5 + i) * 14 + w) % w, y = (rr() * h + Math.cos(t * .4 + i * 2) * 10 + h) % h;
      blob(ctx, x, y, 5 + rr() * 9, i % 3 === 0 ? "#7ee0c3" : "#ffd98a", .35); star(x, y, 1.4, "#eafff5", .8, ctx); }
    for (let i = 0; i < 12; i++) { const x = (rr() * w + t * 8 * (0.5 + rr())) % w, y = h * (.25 + rr() * .5); ctx.globalAlpha = .5; ctx.strokeStyle = "#9be8d0"; ctx.beginPath(); ctx.arc(x, y, 7 + (t * 6 + i * 4) % 10, 0, 6.283); ctx.stroke(); }
    ctx.globalAlpha = 1; blob(ctx, w * .5, h * .55, 30 + Math.sin(t) * 4, "#7ee0c3", .25); },
  cells(c) { const { ctx, w, h, t, local } = c; const e = smootherstep(0, 1, local);
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * .7); g.addColorStop(0, "#16233f"); g.addColorStop(1, "#080d1c"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const n = 1 + Math.floor(e * 7); const cell = (x, y, r, i) => { blob(ctx, x, y, r * 1.25, "#7ee0c3", .12); ctx.strokeStyle = rgba("#7ee0c3", .8); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.stroke();
      blob(ctx, x + Math.sin(t + i) * 2, y + Math.cos(t + i) * 2, r * .38, "#9be8d0", .85); };
    const rr = mulberry(12); for (let i = 0; i < n; i++) cell(w * (.15 + rr() * .7), h * (.18 + rr() * .64), Math.min(w, h) * (.09 - e * .01), i); },
  dna(c) { const { ctx, w, h, t } = c; bgSpace(ctx, w, h, t); const cx = w / 2;
    for (let i = 0; i < 34; i++) { const y = (i / 33) * h, ph = t * 1.6 - i * .38; const x1 = cx + Math.sin(ph) * w * .17, x2 = cx + Math.sin(ph + Math.PI) * w * .17;
      ctx.strokeStyle = i % 4 === 0 ? "rgba(245,201,107,.9)" : "rgba(155,232,208,.85)"; ctx.lineWidth = 3; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke(); star(x1, y, 4, "#ffe9c0", .95, ctx); star(x2, y, 4, "#9be8d0", .95, ctx); } },
  rings(c) { const { ctx, w, h, t } = c; bgSpace(ctx, w, h, t); const cx = w / 2, cy = h / 2, R = Math.min(w, h) * .2;
    drawPlanetBall(ctx, cx, cy, R, "#e8d0a8", t, "#c8a86a");
    for (let i = 0; i < 26; i++) { const rr = R * (1.35 + i / 26 * .9), a = .28 + .4 * Math.sin(i * 2.4 + t * .5);
      ctx.strokeStyle = rgba("#d8c8a0", Math.max(.05, a * .5)); ctx.lineWidth = 2.4; ctx.beginPath(); ctx.ellipse(cx, cy, rr, rr * .3, 0, 0, 6.283); ctx.stroke(); }
    ctx.save(); ctx.globalAlpha = .9; drawPlanetBall(ctx, cx - R * 2.4, cy - R * 1.1, R * .16, "#c8c4bc", t); ctx.restore(); },
  mars(c) { const { ctx, w, h, t, local } = c; const e = smootherstep(0, 1, local);
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#2a1208"); g.addColorStop(.6, "#57220e"); g.addColorStop(1, "#2e1006"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const rr = mulberry(88); for (let i = 0; i < 46; i++) { const x = rr() * w, y = h * .55 + rr() * h * .45; ctx.fillStyle = rgba(rr() > .5 ? "#8a4a26" : "#a06038", .5); ctx.beginPath(); ctx.ellipse(x, y, 8 + rr() * 26, 3 + rr() * 8, rr() * 3, 0, 6.283); ctx.fill(); }
    drawPlanetBall(ctx, w * .5, h * .34, Math.min(w, h) * (.16 + e * .04), "#d8824a", t);
    ctx.fillStyle = "rgba(255,220,180,.75)"; ctx.font = "600 10.5px system-ui"; ctx.textAlign = "center"; ctx.fillText(e > .6 ? "Su geri çekildi · toz fırtınaları kalıcı" : "Nehirler ve krater gölleri", w / 2, h * .12); },
  jupiter(c) { const { ctx, w, h, t } = c; bgSpace(ctx, w, h, t); const cx = w / 2, cy = h / 2, R = Math.min(w, h) * .32;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.clip();
    const bands = ["#e8d0a8", "#c8a06a", "#e0b88a", "#b8805a", "#e8d0a8", "#c89868", "#d8b080"];
    bands.forEach((col, i) => { ctx.fillStyle = col; const by = cy - R + (i / bands.length) * R * 2; ctx.fillRect(cx - R, by + Math.sin(t * .8 + i) * 3, R * 2, R * 2 / bands.length + 2); });
    blob(ctx, cx + R * .35, cy + R * .25, R * .22, "#c8503a", .95); blob(ctx, cx + R * .35, cy + R * .25, R * .1, "#ff8a5c", .9); ctx.restore();
    drawPlanetBall(ctx, cx, cy, R, "rgba(0,0,0,0)", t); },
  sundeath(c) { const { ctx, w, h, t, local } = c; const e = smootherstep(0, 1, local); bgSpace(ctx, w, h, t);
    const cx = w / 2, cy = h / 2; const R = Math.min(w, h) * (.2 + e * .14);
    if (e < .55) { blob(ctx, cx, cy, R * 2, "#ff5a3c", .8); drawPlanetBall(ctx, cx, cy, R, "#ff7a4a", t); }
    else { const n = smootherstep(.55, 1, e); blob(ctx, cx, cy, Math.min(w, h) * .5, "#7ee0c3", .3); blob(ctx, cx, cy, Math.min(w, h) * .3, "#8a5cff", .3 * n);
      const rr = mulberry(99); for (let i = 0; i < 60; i++) { const a = rr() * 6.283, d = (rr() * .5 + n * .3) * Math.min(w, h) * .55; blob(ctx, cx + Math.cos(a) * d, cy + Math.sin(a) * d * .8, 14 + rr() * 20, i % 2 ? "#9be8d0" : "#8a9cff", .2 * n); } }
    star(cx, cy, 5, "#ffffff", .9, ctx); },
  pangea(c) { const { ctx, w, h, t, local } = c; /* DÜNYA YÜZEYİ — uzay DEĞİL */
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#7db4e0"); g.addColorStop(.55, "#a8cfe8"); g.addColorStop(1, "#e8d8b0"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const cl = .12 + .1 * Math.sin(t * .3); ctx.globalAlpha = .5; for (let i = 0; i < 6; i++) { const x = (w * i / 6 + t * 12) % (w + 120) - 60; ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.ellipse(x, h * (.1 + (i % 3) * .06), 44, 12, 0, 0, 6.283); ctx.fill(); }
    ctx.globalAlpha = 1;
    const og = ctx.createLinearGradient(0, h * .35, 0, h); og.addColorStop(0, "#3f86b8"); og.addColorStop(1, "#2a5f8a"); ctx.fillStyle = og; ctx.fillRect(0, h * .42, w, h * .58);
    for (let i = 0; i < 5; i++) { ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 1.6; ctx.beginPath(); const yy = h * (.55 + i * .08); for (let x = 0; x <= w; x += 24) ctx.lineTo(x, yy + Math.sin(x * .05 + t * 1.2 + i * 2) * 4); ctx.stroke(); }
    const cont = (x, y, r, col, seed) => { ctx.fillStyle = col; ctx.beginPath(); const rr = mulberry(seed);
      for (let i = 0; i <= 12; i++) { const a = i / 12 * 6.283, rad = r * (.75 + rr() * .5); ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad * .72); } ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(120,160,80,.5)"; ctx.beginPath(); ctx.ellipse(x, y - r * .15, r * .5, r * .22, 0, 0, 6.283); ctx.fill(); };
    const e = smootherstep(0, 1, clamp01(local));
    if (e < .5) { cont(w * .5, h * .58, w * .17, "#9aa050", 4); ctx.fillStyle = "rgba(60,40,20,.75)"; ctx.font = "700 11px system-ui"; ctx.textAlign = "center"; ctx.fillText("PANGEA", w * .5, h * .58); }
    else { const s = (e - .5) * 2; cont(w * .5 - s * w * .16, h * .56, w * .13, "#9aa050", 4); cont(w * .5 + s * w * .16, h * .62, w * .12, "#8a9a4a", 7);
      ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.font = "600 10px system-ui"; ctx.textAlign = "center"; ctx.fillText("Atlantik açılıyor →", w * .5, h * .5); } },
  surface(c) { /* genel DÜNYA YÜZEYİ sahnesi (jeoloji) */
    const { ctx, w, h, t, local } = c;
    const g = ctx.createLinearGradient(0, 0, 0, h * .55); g.addColorStop(0, "#7db4e0"); g.addColorStop(1, "#c8e2f2"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h * .55);
    ctx.fillStyle = "#6faa58"; ctx.beginPath(); ctx.moveTo(0, h * .55); for (let x = 0; x <= w; x += 30) ctx.lineTo(x, h * .55 - Math.abs(Math.sin(x * .01 + 2)) * h * .18); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#5a8a48"; ctx.beginPath(); ctx.moveTo(0, h * .72); for (let x = 0; x <= w; x += 40) ctx.lineTo(x, h * .72 - Math.abs(Math.sin(x * .008 + 5)) * h * .1); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = .5; for (let i = 0; i < 5; i++) { const x = (w * i / 5 + t * 14) % (w + 100) - 50; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(x, h * .12 + (i % 2) * 18, 36, 10, 0, 0, 6.283); ctx.fill(); }
    ctx.globalAlpha = 1; blob(ctx, w * .82, h * .16, 22, "#fff3c0", .9);
    const rr = mulberry(31); for (let i = 0; i < 26; i++) { ctx.strokeStyle = "rgba(90,130,70,.6)"; ctx.lineWidth = 2; ctx.beginPath(); const x = rr() * w, y = h * (.78 + rr() * .2); ctx.lineTo(x, y); ctx.lineTo(x + (rr() - .5) * 16, y - 6 - rr() * 8); ctx.stroke(); } },
  mantle(c) { const { ctx, w, h, t, local } = c; const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#1a0e08"); g.addColorStop(1, "#0c0604"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const cx = w * .38, cy = h / 2, R = Math.min(w, h) * .36;
    const layers = [["#5a8a48", 1], ["#8f7a6a", .95], ["#c1663a", .8], ["#f2b544", .5], ["#fff1b8", .18]];
    layers.forEach(([col, p], i) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, R * p, -Math.PI / 2, Math.PI / 2, true); ctx.arc(cx, cy, i === layers.length - 1 ? 0 : R * layers[i + 1][1], Math.PI / 2, -Math.PI / 2, false); ctx.closePath(); ctx.fill(); });
    for (let i = 0; i < 5; i++) { const ph = (t * .5 + i / 5) % 1; const x = cx - R * .2 + Math.sin(i * 2.7) * R * .3, y = cy + R * .4 - ph * R * .8; blob(ctx, x, y, 8, "#ffb347", (1 - ph) * .7); }
    ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy - R * 1.05); ctx.lineTo(cx, cy + R * 1.05); ctx.stroke();
    ctx.fillStyle = "rgba(232,236,255,.85)"; ctx.font = "600 10.5px system-ui"; ctx.textAlign = "left"; ctx.fillText("kesit", cx + 12, cy - R - 6); },
  strata(c) { const { ctx, w, h, t } = c;
    const cols = ["#8a6a4a", "#a08a5a", "#6a5a48", "#b8a070", "#7a6a5a", "#98876a", "#5f5245", "#aa9878"];
    cols.forEach((col, i) => { const y0 = h * (i / cols.length), y1 = h * ((i + 1) / cols.length);
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, y0); for (let x = 0; x <= w; x += 40) ctx.lineTo(x, y0 + Math.sin(x * .02 + i * 2) * 5); ctx.lineTo(w, y1); for (let x = w; x >= 0; x -= 40) ctx.lineTo(x, y1 + Math.sin(x * .02 + i * 2) * 5); ctx.closePath(); ctx.fill(); });
    ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(0, 0, w, h * .12);
    ctx.fillStyle = "rgba(255,240,220,.9)"; ctx.font = "600 10.5px system-ui"; ctx.textAlign = "left"; ctx.fillText("tabaka kayıtları — en eski en altta", 12, h * .08); },
  signal(c) { const { ctx, w, h, t } = c; bgSpace(ctx, w, h, t); const cx = w * .32, cy = h * .62;
    drawPlanetBall(ctx, cx, cy, Math.min(w, h) * .16, "#5c8ac8", t);
    for (let i = 0; i < 4; i++) { const ph = (t * .6 + i / 4) % 1; ctx.globalAlpha = (1 - ph) * .7; ctx.strokeStyle = "#7ee0c3"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, Math.min(w, h) * (.2 + ph * .6), -Math.PI / 3, Math.PI / 5); ctx.stroke(); }
    ctx.globalAlpha = 1; const rr = mulberry(7); for (let i = 0; i < 12; i++) { star(w * (.55 + rr() * .4), h * (.2 + rr() * .6), 2 + rr() * 2, rr() > .6 ? "#ffd98a" : "#9be8d0", .6 + .4 * Math.sin(t * 2 + i), ctx); } },
  forest(c) { const { ctx, w, h, t } = c;
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#a8d8e8"); g.addColorStop(.5, "#cfe8d8"); g.addColorStop(1, "#3a6a3a"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#2a5230"; ctx.beginPath(); ctx.moveTo(0, h * .68); for (let x = 0; x <= w; x += 50) ctx.lineTo(x, h * .68 - Math.abs(Math.sin(x * .012)) * h * .12); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
    const rr = mulberry(19); for (let i = 0; i < 22; i++) { const x = rr() * w, base = h * (.72 + rr() * .24), hh = h * (.08 + rr() * .12);
      ctx.fillStyle = "#1f4227"; ctx.beginPath(); ctx.moveTo(x, base - hh); ctx.lineTo(x - hh * .3, base); ctx.lineTo(x + hh * .3, base); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#5a4028"; ctx.fillRect(x - 1.5, base, 3, 5); }
    for (let i = 0; i < 6; i++) { const x = (w * i / 6 + t * 10) % (w + 80) - 40; ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.beginPath(); ctx.ellipse(x, h * .1 + (i % 2) * 14, 30, 9, 0, 0, 6.283); ctx.fill(); } },
  dyson(c) { const { ctx, w, h, t } = c; bgSpace(ctx, w, h, t); const cx = w / 2, cy = h / 2;
    blob(ctx, cx, cy, Math.min(w, h) * .12, "#ffd27a", 1);
    for (let i = 0; i < 14; i++) { const a = t * .3 + i / 14 * 6.283, d = Math.min(w, h) * (.2 + (i % 3) * .07);
      const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .55; ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = "#9aa8c8"; ctx.fillRect(-7, -7, 14, 14); ctx.strokeStyle = "#cdd7ff"; ctx.strokeRect(-7, -7, 14, 14); ctx.restore(); } },
  voiddark(c) { const { ctx, w, h, t } = c; ctx.fillStyle = "#020308"; ctx.fillRect(0, 0, w, h);
    const rr = mulberry(41); for (let i = 0; i < 40; i++) star(rr() * w, rr() * h, .5 + rr(), "#4a5580", .25 + .3 * Math.sin(t + i), ctx);
    blob(ctx, w / 2, h / 2, Math.min(w, h) * .3, "#101828", .5); },
  orbit(c) { const { ctx, w, h, t, local } = c; bgSpace(ctx, w, h, t); const cx = w / 2, cy = h / 2;
    for (let i = 0; i < 4; i++) { const R = Math.min(w, h) * (.14 + i * .1); const e0 = smootherstep(i / 4, 1, local);
      ctx.strokeStyle = rgba("#8a9cff", .18 + e0 * .3); ctx.beginPath(); ctx.ellipse(cx, cy, R, R * .5, 0, 0, 6.283); ctx.stroke();
      const a = t * (.7 - i * .12); drawPlanetBall(ctx, cx + Math.cos(a) * R, cy + Math.sin(a) * R * .5, 5 + i, ["#b8aca0", "#e3c48f", "#7da86a", "#d8824a"][i], t); }
    blob(ctx, cx, cy, 24, "#ffd27a", .95); },
  wave(c) { const { ctx, w, h, t } = c; bgSpace(ctx, w, h, t); const cy = h / 2;
    for (let k = 0; k < 3; k++) { ctx.strokeStyle = rgba(["#7ee0c3", "#ffd98a", "#8a9cff"][k], .75); ctx.lineWidth = 2.4; ctx.beginPath();
      for (let x = 0; x <= w; x += 8) { const y = cy + Math.sin(x * .03 - t * (2 + k * .7)) * h * (.12 + k * .05) * Math.sin(x / w * Math.PI); ctx.lineTo(x, y); } ctx.stroke(); }
    ctx.fillStyle = "rgba(232,236,255,.8)"; ctx.font = "600 10.5px system-ui"; ctx.textAlign = "center"; ctx.fillText("dalga − parçacık ikiliği", w / 2, h * .88); },
  field(c) { const { ctx, w, h, t } = c; bgSpace(ctx, w, h, t);
    for (let gy = 0; gy < 9; gy++) for (let gx = 0; gx < 13; gx++) { const x = w * (gx + .5) / 13, y = h * (gy + .5) / 9;
      const an = Math.sin(t + gx * .7 + gy * .9) * .8; const dx = Math.cos(an) * 7, dy = Math.sin(an) * 7;
      ctx.strokeStyle = "rgba(155,232,208,.5)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x - dx, y - dy); ctx.lineTo(x + dx, y + dy); ctx.stroke(); } },
};
function lerp2col(a, b, t) { const A = hexRgb(a), B = hexRgb(b); const c = A.map((v, i) => Math.round(lerp(v, B[i], t))); return \`rgb(\${c[0]},\${c[1]},\${c[2]})\`; }

/* teori kimliğine göre özel arketip; yoksa kategori arketipi */
const ID_SCENE = {
  "gunesin-dogusu": "sunbirth", "dunyanin-olusumu": "earthform", "buyuk-carpma": "impact",
  "okyanuslarin-dogusu": "ocean", "yasin-dogusu": "soup", "saturnun-halkalari": "rings",
  "marsin-kaderi": "mars", "jupiterin-dogusu": "jupiter", "gunesin-olumu": "sundeath",
  "pangea-tektonik": "pangea", "diferansiyasyon": "mantle", "agir-bombardiman": "impact",
  "hidrotermal-damar": "strata", "magmatik-ayrisma": "surface", "sedimantasyon": "strata",
  "biyojenik-cevherlesme": "surface", "r-sureci": "nebula", "yildiz-nukleosentezi": "sunbirth",
};
const CAT_SCENE = {
  kosmoloji: ["bigbang", "inflation", "cmb", "nebula", "galaxy", "darkweb", "particles", "lightcones", "horizon", "system"],
  fizik: ["spacetime", "particles", "lightcones", "wave", "field", "orbit", "horizon", "system"],
  gokyuzu: ["system", "orbit", "comet", "sunbirth", "nebula"],
  jeoloji: ["surface", "mantle", "strata", "pangea", "surface"],
  yasam: ["soup", "cells", "dna", "ocean"],
  gelecek: ["signal", "forest", "dyson", "darkweb", "voiddark", "system"],
};
function sceneForTheory(theory, i) {
  if (ID_SCENE[theory.id]) return SC[ID_SCENE[theory.id]];
  const list = CAT_SCENE[theory.cat] || CAT_SCENE.kosmoloji;
  return SC[list[i % list.length]] || SC.nebula;
}

/* ================== v3 YUMUŞAK GEÇİŞ MOTORU ============================= */
/* DEMİR KURAL: harman penceresi ±%2,75 (toplam ~%5,5), kuintik easing.
   9 katman: bulanıklık, ölçek, alfa, ışık perdesi, yıldız tozu, ışık süpürmesi,
   vinyet nefesi, yumuşak silme, yankı halkası. Ani kesme YOK. */
const BW = 0.0275;
let pStardust = null;
function renderStaged(ctx, w, h, t, p, theory) {
  const stages = theory.stages;
  let idx = stages.findIndex((s) => p <= s[0] - 1e-9); if (idx === -1) idx = stages.length - 1;
  const start = idx === 0 ? 0 : stages[idx - 1][0], end = stages[idx][0];
  const local = clamp01((p - start) / (end - start || 1e-9));
  const scene = sceneForTheory(theory, idx);
  const canBlur = typeof ctx.filter === "string";
  const drawLayer = (i, alpha, lc, mode) => {
    if (alpha <= 0.004) return;
    const sc2 = sceneForTheory(theory, i);
    ctx.save();
    if (canBlur) { const blur = mode === "out" ? (1 - alpha) * 4.2 : (1 - alpha) * 3.1; if (blur > 0.25) ctx.filter = \`blur(\${blur.toFixed(2)}px)\`; }
    const sc = mode === "out" ? 1 + (1 - alpha) * 0.065 : 1.052 - 0.052 * alpha;
    if (Math.abs(sc - 1) > 0.0008) { ctx.translate(w / 2, h / 2); ctx.scale(sc, sc); ctx.translate(-w / 2, -h / 2); }
    ctx.globalAlpha = alpha;
    sc2({ ctx, w, h, t, local: lc });
    ctx.restore();
  };
  let blending = false, k = 1;
  if (idx > 0 && p < start + BW) { blending = true; k = smootherstep(start - BW * .62, start + BW * .62, p); drawLayer(idx - 1, 1 - k, 1, "out"); drawLayer(idx, k, local, "in"); }
  else if (idx < stages.length - 1 && p > end - BW) { blending = true; k = smootherstep(end - BW * .62, end + BW * .62, p); drawLayer(idx, 1 - k, local, "out"); drawLayer(idx + 1, k, 0, "in"); }
  else drawLayer(idx, 1, local, "in");
  if (blending) {
    const col = theory.color;
    /* 4: ışık perdesi */ const veil = Math.sin(clamp01(k) * Math.PI);
    if (veil > .02) { ctx.save(); ctx.globalCompositeOperation = "screen"; blob(ctx, w / 2, h / 2, Math.max(w, h) * .72, col, veil * .13); ctx.restore(); }
    /* 5: yıldız tozu */ if (!pStardust) pStardust = Array.from({ length: 26 }, () => ({ x: Math.random(), y: Math.random(), sp: .4 + Math.random() * 1.2, ph: Math.random() * 6.28 }));
    for (const sd of pStardust) { const y = (sd.y + t * .03 * sd.sp) % 1; star(sd.x * w, y * h, 1 + Math.sin(t * 2 + sd.ph) * .6, "#ffffff", Math.sin(k * Math.PI) * .5, ctx); }
    /* 6: ışık süpürmesi */ ctx.save(); const sx = lerp(-w * .2, w * 1.2, k); const g = ctx.createLinearGradient(sx - w * .18, 0, sx + w * .18, h);
    g.addColorStop(0, rgba(col, 0)); g.addColorStop(.5, rgba(col, Math.sin(k * Math.PI) * .12)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.restore();
    /* 7: vinyet nefesi */ ctx.save(); const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .3, w / 2, h / 2, Math.max(w, h) * .72);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, \`rgba(2,3,10,\${Math.sin(k * Math.PI) * .38})\`); ctx.fillStyle = v; ctx.fillRect(0, 0, w, h); ctx.restore();
    /* 9: yankı halkası */ const er = lerp(Math.min(w, h) * .1, Math.max(w, h) * .75, k);
    ctx.save(); ctx.globalAlpha = Math.sin(k * Math.PI) * .4; ctx.strokeStyle = rgba(col, .8); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(w / 2, h / 2, er, 0, 6.283); ctx.stroke(); ctx.restore();
  }
  /* bilgi balonları */
  ctx.font = "600 10px system-ui, sans-serif"; ctx.textBaseline = "middle";
  for (const nt of theory.notes) {
    if (p < nt[0] || p > nt[1]) continue;
    const a = Math.min(smoothstep(nt[0], nt[0] + .014, p), 1 - smoothstep(nt[1] - .014, nt[1], p));
    if (a <= .02) continue;
    const tw2 = ctx.measureText(nt[2]).width, px = clamp01(nt[3]) * w, py = clamp01(nt[4]) * h;
    const padX = 7, bw2 = tw2 + padX * 2, bh = 18, bx = Math.min(Math.max(4, px - bw2 / 2), w - bw2 - 4), by = Math.min(Math.max(4, py - bh / 2), h - bh - 4);
    ctx.save(); ctx.globalAlpha = a;
    const bg3 = ctx.createLinearGradient(0, by, 0, by + bh); bg3.addColorStop(0, "rgba(18,24,50,.92)"); bg3.addColorStop(1, "rgba(10,14,32,.92)");
    ctx.fillStyle = bg3; ctx.strokeStyle = rgba(theory.color, .55); ctx.lineWidth = 1;
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(bx, by, bw2, bh, 9); ctx.fill(); ctx.stroke(); } else ctx.fillRect(bx, by, bw2, bh);
    ctx.fillStyle = "#e8ecff"; ctx.textAlign = "left"; ctx.fillText(nt[2], bx + padX, by + bh / 2 + .5); ctx.restore();
  }
  return idx;
}

/* ============================ SİMÜLASYON ================================ */
const simcv = document.getElementById("simcv"), sx = simcv.getContext("2d");
let simT = 0, speed = 1, showOrbits = true, showLabels = true, simSel = null, simDrag = null, simPos = null, zoom = 1, hover = null;
const PLANET_TYPES = ["Yıldız", "Karasal Gezegen", "Gaz Devi", "Buz Devi", "Cüce Gezegen"];
const PLANETS = BODIES.filter((b) => PLANET_TYPES.includes(b.type));
let AUSCALE = 1;
function computeScale() { AUSCALE = Math.min(window.innerWidth, window.innerHeight) / 2 / 520; }
computeScale(); window.addEventListener("resize", computeScale);
function planetXY(b, tt) {
  const per = Math.max(6, (b.sim.period || 365) * 0.08);
  const an = tt * (6.283 / per) + (b.sim.a * 7.3);
  const e = b.sim.e || 0; const r = b.sim.a * AUSCALE * (1 - e * Math.cos(an));
  return { x: Math.cos(an) * r, y: Math.sin(an) * r, r };
}
simcv.addEventListener("pointerdown", (ev) => { simDrag = { x: ev.clientX, y: ev.clientY }; });
simcv.addEventListener("pointermove", (ev) => {
  if (simDrag && (ev.buttons & 1)) { simPos = { x: (simPos?.x || 0) + (ev.clientX - simDrag.x), y: (simPos?.y || 0) + (ev.clientY - simDrag.y) }; simDrag = { x: ev.clientX, y: ev.clientY }; }
  const rect = simcv.getBoundingClientRect(); const mx = ev.clientX - rect.left, my = ev.clientY - rect.top;
  hover = pickPlanet(mx, my);
  simcv.style.cursor = hover ? "pointer" : "grab";
});
simcv.addEventListener("pointerup", (ev) => { simDrag = null; });
simcv.addEventListener("click", (ev) => {
  const rect = simcv.getBoundingClientRect(); const p = pickPlanet(ev.clientX - rect.left, ev.clientY - rect.top);
  if (p) { simSel = p; showInfo(p); } else { document.getElementById("infoPanel").classList.remove("on"); simSel = null; }
});
simcv.addEventListener("wheel", (ev) => { ev.preventDefault(); zoom = Math.min(4.5, Math.max(.4, zoom * (ev.deltaY < 0 ? 1.12 : .89))); }, { passive: false });
let lastTouchDist = 0;
simcv.addEventListener("touchmove", (ev) => { if (ev.touches.length === 2) { const d = Math.hypot(ev.touches[0].clientX - ev.touches[1].clientX, ev.touches[0].clientY - ev.touches[1].clientY);
  if (lastTouchDist) zoom = Math.min(4.5, Math.max(.4, zoom * d / lastTouchDist)); lastTouchDist = d; } }, { passive: true });
simcv.addEventListener("touchend", () => { lastTouchDist = 0; });
function pickPlanet(mx, my) {
  const { w, h } = { w: simcv.clientWidth, h: simcv.clientHeight };
  const cx = w / 2 + (simPos?.x || 0), cy = h / 2 + (simPos?.y || 0);
  let best = null, bd = 26;
  for (const b of PLANETS) { if (!b.sim.a) continue; const p = planetXY(b, simT); const px = cx + p.x * zoom, py = cy + p.y * zoom; const d = Math.hypot(mx - px, my - py); if (d < bd) { bd = d; best = b; } }
  return best;
}
function drawSim(dt) {
  const { w, h, dpr } = fitCanvas(simcv); simT += dt * speed * .5;
  sx.setTransform(dpr, 0, 0, dpr, 0, 0); sx.clearRect(0, 0, w, h);
  const g = sx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * .8);
  g.addColorStop(0, "#0c1230"); g.addColorStop(.6, "#060919"); g.addColorStop(1, "#020309"); sx.fillStyle = g; sx.fillRect(0, 0, w, h);
  const rr = mulberry(5); sx.globalAlpha = .7;
  for (let i = 0; i < 110; i++) { star(rr() * w, rr() * h, .4 + rr() * 1.1, "#c8d2ff", .25 + .5 * Math.abs(Math.sin(simT + i)), sx); }
  sx.globalAlpha = 1;
  const cx = w / 2 + (simPos?.x || 0) * zoom * 0, cy = h / 2 + (simPos?.y || 0) * zoom * 0;
  const ox = (simPos?.x || 0), oy = (simPos?.y || 0);
  /* Güneş */
  const sunR = Math.max(14, Math.min(w, h) * .035) * Math.min(1.4, zoom * .8 + .5);
  blob(sx, cx + ox, cy + oy, sunR * 3.2, "#ffb347", .28); blob(sx, cx + ox, cy + oy, sunR * 1.7, "#ffd27a", .5);
  const sg = sx.createRadialGradient(cx + ox - sunR * .3, cy + oy - sunR * .3, sunR * .1, cx + ox, cy + oy, sunR);
  sg.addColorStop(0, "#fff8e0"); sg.addColorStop(.5, "#ffd27a"); sg.addColorStop(1, "#ff9a2a");
  sx.fillStyle = sg; sx.beginPath(); sx.arc(cx + ox, cy + oy, sunR, 0, 6.283); sx.fill();
  /* yörüngeler + gezegenler */
  for (const b of PLANETS) {
    if (!b.sim.a) continue;
    const pr = b.sim.a * AUSCALE * zoom;
    if (showOrbits) { sx.strokeStyle = "rgba(150,168,255,.16)"; sx.lineWidth = 1; sx.beginPath(); sx.ellipse(cx + ox, cy + oy, pr, pr, 0, 0, 6.283); sx.stroke(); }
    const p = planetXY(b, simT); const px = cx + ox + p.x * zoom, py = cy + oy + p.y * zoom;
    const R = Math.max(3.2, Math.min(w, h) * .016 * Math.pow(b.sim.a / 98, -.32));
    const sel = simSel === b || hover === b;
    if (sel) { sx.strokeStyle = rgba(b.color, .8); sx.lineWidth = 2; sx.beginPath(); sx.arc(px, py, R + 6 + Math.sin(simT * 3) * 1.6, 0, 6.283); sx.stroke(); blob(sx, px, py, R * 2.6, b.color, .25); }
    if (b.id === "saturn") { sx.strokeStyle = "rgba(216,200,160,.7)"; sx.lineWidth = 1.6; sx.beginPath(); sx.ellipse(px, py, R * 1.9, R * .6, -.4, 0, 6.283); sx.stroke(); }
    drawPlanetBall(sx, px, py, R, b.color, simT, b.id === "jupiter" ? "#c8a06a" : null);
    if (showLabels) { sx.font = "600 10px system-ui"; sx.textAlign = "center"; sx.fillStyle = sel ? "#ffe9c0" : "rgba(210,218,255,.75)"; sx.fillText(b.name, px, py - R - 8); }
  }
}

/* ============================ BİLGİ KARTI =============================== */
function showInfo(b) {
  const el = document.getElementById("infoPanel");
  document.getElementById("infoName").textContent = b.name;
  const TYPE = { "yildiz": "Yıldız", "gezegen": "Gezegen", "cuce-gezegen": "Cüce Gezegen" };
  document.getElementById("infoType").textContent = TYPE[b.type] || b.type;
  document.getElementById("infoDesc").textContent = b.desc;
  const st = [["Çap", b.stats.diameter], ["Kütle", b.stats.mass], ["Yerçekimi", b.stats.gravity], ["Gün uzunluğu", b.stats.dayLength], ["Eksen eğikliği", b.stats.axialTilt], ["Sıcaklık", b.stats.temp]];
  document.getElementById("infoStats").innerHTML = st.map(([k, v]) => \`<div class="stat"><b>\${k}</b><span>\${v}</span></div>\`).join("");
  const or = [["Uzaklık", b.orbit.distance], ["Dönem", b.orbit.period], ["Hız", b.orbit.velocity], ["Uydular", b.orbit.moons]];
  document.getElementById("infoOrbit").innerHTML = or.map(([k, v]) => \`<div class="stat"><b>\${k}</b><span>\${v}</span></div>\`).join("");
  document.getElementById("infoFacts").innerHTML = b.facts.slice(0, 5).map((f) => \`<li>\${f}</li>\`).join("");
  const ib = document.getElementById("infoInterior");
  const ip = INTERIORS[b.id];
  if (ip) {
    ib.innerHTML = \`<h4>İÇ YAPI (kesit)</h4><canvas id="miniInt" width="260" height="190" style="width:100%;border-radius:10px;background:rgba(0,0,0,.3)"></canvas>\`
      + ip.layers.map((l) => \`<div class="intlayer"><span class="sw" style="background:\${l.color};color:\${l.color}"></span><span><b>\${l.name} · \${l.temp}</b><small>\${l.detail}</small></span></div>\`).join("");
    drawMiniInt(document.getElementById("miniInt"), ip);
  } else ib.innerHTML = "";
  el.classList.add("on");
}
function drawMiniInt(cv, ip) {
  const ctx = cv.getContext("2d"); const w = cv.width, h = cv.height, cx = w * .32, cy = h / 2, R = Math.min(w * .27, h * .44);
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#0a0e22"); g.addColorStop(1, "#05060f"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const layers = ip.layers.map((l) => ({ ...l, r: (l.pct / 100) * R })).sort((a, b2) => b2.r - a.r);
  layers.forEach((l, i) => { ctx.beginPath(); ctx.arc(cx, cy, l.r, 0, 6.283); ctx.fillStyle = l.color; ctx.globalAlpha = i === 0 ? .97 : 1; ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.lineWidth = 1; ctx.stroke(); });
  ctx.globalAlpha = 1;
  const lg = ctx.createRadialGradient(cx - R * .3, cy - R * .3, R * .2, cx, cy, R); lg.addColorStop(0, "rgba(255,255,255,.16)"); lg.addColorStop(1, "rgba(0,0,0,.25)");
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.fillStyle = lg; ctx.fill();
}

/* ============================ TEORİLER ================================== */
let curCat = "hepsi";
function theoryCard(t) {
  const d = document.createElement("div"); d.className = "card tcard"; d.style.borderColor = rgba(t.color, .3);
  d.innerHTML = \`<span class="dot" style="color:\${t.color};background:\${t.color}"></span>
    <h3>\${t.title}</h3><p>\${t.subtitle}</p>
    <div class="meta"><span class="badge">\${CATS[t.cat]}</span><span>\${t.stages.length} bölüm · \${Math.round(t.duration / 60)}:\${String(t.duration % 60).padStart(2, "0")}</span></div>\`;
  d.addEventListener("click", () => openPlayer(t));
  return d;
}
function renderTheories() {
  const grid = document.getElementById("theoryGrid"); grid.innerHTML = "";
  const list = THEORIES.filter((t) => curCat === "hepsi" || t.cat === curCat);
  list.forEach((t) => grid.appendChild(theoryCard(t)));
}
(function buildChips() {
  const wrap = document.getElementById("catChips");
  const mk = (id, label) => { const c = document.createElement("button"); c.className = "chip" + (id === "hepsi" ? " on" : ""); c.textContent = label;
    c.addEventListener("click", () => { curCat = id; wrap.querySelectorAll(".chip").forEach((x) => x.classList.remove("on")); c.classList.add("on"); renderTheories(); }); wrap.appendChild(c); };
  mk("hepsi", "✦ Tümü"); Object.entries(CATS).forEach(([k, v]) => mk(k, v));
})();

/* oynatıcı */
const player = document.getElementById("player"), pcv = document.getElementById("pcv"), px2 = pcv.getContext("2d");
let PT = null, pPlaying = true, pProg = 0, pPrev = 0, pT = 0, lastStage = -1;
function fmt(s) { const m = Math.floor(s / 60); return \`\${String(m).padStart(2, "0")}:\${String(Math.floor(s % 60)).padStart(2, "0")}\`; }
function openPlayer(t) {
  PT = t; pProg = 0; pPrev = 0; pPlaying = true; lastStage = -1;
  document.getElementById("pTitle").textContent = t.title;
  document.getElementById("pSub").textContent = t.subtitle + "  ·  " + (SIG);
  document.getElementById("pDur").textContent = fmt(t.duration);
  const pills = document.getElementById("pPills"); pills.innerHTML = "";
  t.stages.forEach((s, i) => { const p = document.createElement("button"); p.className = "sgpill"; p.textContent = (i + 1) + ". " + s[1];
    p.addEventListener("click", () => { pProg = i === 0 ? 0 : t.stages[i - 1][0] + .0005; pPrev = pProg; }); pills.appendChild(p); });
  player.classList.add("on"); Sfx.ensure();
  document.getElementById("pPlay").textContent = "❚❚";
  if (!Sfx.muted) Sfx.play("shimmer", .5);
}
function closePlayer() { player.classList.remove("on"); PT = null; }
document.getElementById("pClose").addEventListener("click", closePlayer);
document.getElementById("pPlay").addEventListener("click", () => { pPlaying = !pPlaying; document.getElementById("pPlay").textContent = pPlaying ? "❚❚" : "▶"; if (pPlaying) Sfx.ensure(); });
document.getElementById("pMute").addEventListener("click", (e) => { Sfx.muted = !Sfx.muted; e.currentTarget.textContent = Sfx.muted ? "🔇" : "🔊"; });
const pbar = document.getElementById("pbar");
function scrub(ev) { const r = pbar.getBoundingClientRect(); const f = clamp01((ev.clientX - r.left) / r.width); pProg = f; pPrev = f; }
pbar.addEventListener("pointerdown", (ev) => { scrub(ev); const mv = (e2) => scrub(e2); const up = () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); }; window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up); });
function fireCues(from, to) {
  if (!PT || Sfx.muted) return;
  for (const q of PT.cues) { if (from < to) { if (q[0] > from && q[0] <= to) Sfx.play(q[1], q[2]); } else if (q[0] > from || q[0] <= to) Sfx.play(q[1], q[2]); }
}
function drawPlayer(dt) {
  if (!PT || !player.classList.contains("on")) return;
  const { w, h, dpr } = fitCanvas(pcv); pT += dt;
  if (pPlaying) { pPrev = pProg; pProg += dt / PT.duration; if (pProg >= 1) { pProg = 0; pPrev = 0; } fireCues(pPrev, pProg); }
  px2.setTransform(dpr, 0, 0, dpr, 0, 0); px2.clearRect(0, 0, w, h);
  const idx = renderStaged(px2, w, h, pT, pProg, PT);
  /* aşama yazısı */
  if (idx !== lastStage) { lastStage = idx; const s = PT.stages[idx];
    const st = document.getElementById("pStage"); st.querySelector("b").textContent = s[1]; st.querySelector("span").textContent = s[3];
    st.querySelector("p").textContent = s[2];
    document.querySelectorAll(".sgpill").forEach((p2, i) => { p2.classList.toggle("on", i === idx); p2.classList.toggle("done", i < idx); if (i === idx) p2.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); });
  }
  document.getElementById("pFill").style.width = (pProg * 100).toFixed(2) + "%";
  document.getElementById("pKnob").style.left = (pProg * 100).toFixed(2) + "%";
  document.getElementById("pTime").textContent = fmt(pProg * PT.duration);
}

/* ============================ İÇ YAPILAR ================================ */
const intcv = document.getElementById("intcv"), icx = intcv.getContext("2d");
let intSel = null, intT = 0;
function buildIntChips() {
  const wrap = document.getElementById("intChips"); wrap.innerHTML = "";
  Object.keys(INTERIORS).forEach((id) => { const b = BODIES.find((x) => x.id === id); if (!b) return;
    const c = document.createElement("button"); c.className = "chip" + (id === intSel ? " on" : ""); c.textContent = b.name;
    c.addEventListener("click", () => { intSel = id; buildIntChips(); drawInterior(); }); wrap.appendChild(c); });
  if (!intSel) { const first = Object.keys(INTERIORS)[0]; intSel = first; const c = wrap.firstChild; if (c) c.classList.add("on"); }
}
function drawInterior() {
  const ip = INTERIORS[intSel]; if (!ip) return;
  const b = BODIES.find((x) => x.id === intSel);
  const w = intcv.width, h = intcv.height; intT += .016;
  icx.clearRect(0, 0, w, h);
  const g = icx.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#0a0e22"); g.addColorStop(1, "#04050d"); icx.fillStyle = g; icx.fillRect(0, 0, w, h);
  const rr = mulberry(2); icx.globalAlpha = .5; for (let i = 0; i < 60; i++) star(rr() * w, rr() * h, .4 + rr(), "#aab4e0", .3 + .4 * Math.sin(intT + i), icx); icx.globalAlpha = 1;
  const cx = w * .3, cy = h / 2, R = Math.min(w * .24, h * .42);
  const PHI0 = Math.PI * .5, PHI1 = Math.PI * 1.5; /* sağ yarım kesit penceresi */
  const layers = ip.layers.map((l) => ({ ...l, r: (l.pct / 100) * R })).sort((a, b2) => b2.r - a.r);
  layers.forEach((l, i) => {
    icx.save(); icx.beginPath();
    icx.arc(cx, cy, l.r, PHI0, PHI1); /* kesit pencereli küre */
    icx.fillStyle = l.color; icx.globalAlpha = i === 0 ? .96 : 1; icx.fill();
    icx.strokeStyle = "rgba(0,0,0,.4)"; icx.lineWidth = 1; icx.stroke(); icx.restore();
  });
  /* dış yüzey dokusu */
  const sg = icx.createRadialGradient(cx - R * .35, cy - R * .35, R * .1, cx, cy, R);
  sg.addColorStop(0, "rgba(255,255,255,.22)"); sg.addColorStop(.75, "rgba(255,255,255,0)"); sg.addColorStop(1, "rgba(0,0,10,.5)");
  icx.save(); icx.beginPath(); icx.arc(cx, cy, R, 0, 6.283); icx.fillStyle = sg; icx.fill(); icx.restore();
  icx.save(); icx.strokeStyle = "rgba(255,255,255,.3)"; icx.lineWidth = 1.4; icx.beginPath(); icx.moveTo(cx, cy - R * 1.06); icx.lineTo(cx, cy + R * 1.06); icx.stroke(); icx.restore();
  icx.fillStyle = "rgba(232,236,255,.9)"; icx.font = "700 13px system-ui"; icx.textAlign = "center"; icx.fillText(b ? b.name : intSel, cx, 24);
  /* katman açıklamaları */
  const lw = document.getElementById("intLayers");
  lw.innerHTML = ip.layers.map((l) => \`<div class="intlayer"><span class="sw" style="background:\${l.color};color:\${l.color}"></span><span><b>\${l.name} · \${l.pct}% · \${l.temp}</b><small>\${l.detail}</small></span></div>\`).join("");
}

/* ============================ GEZİNME =================================== */
document.querySelectorAll(".navbtn").forEach((btn) => btn.addEventListener("click", () => {
  document.querySelectorAll(".navbtn").forEach((x) => x.classList.remove("on")); btn.classList.add("on");
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("on"));
  document.getElementById("view-" + btn.dataset.view).classList.add("on");
}));
document.getElementById("spdBtn").addEventListener("click", (e) => { speed = speed === 1 ? 3 : speed === 3 ? 10 : speed === 10 ? 30 : 1; e.currentTarget.textContent = "Hız: " + speed + "×"; });
document.getElementById("orbitBtn").addEventListener("click", (e) => { showOrbits = !showOrbits; e.currentTarget.textContent = "Yörüngeler: " + (showOrbits ? "açık" : "kapalı"); });
document.getElementById("labelsBtn").addEventListener("click", (e) => { showLabels = !showLabels; e.currentTarget.textContent = "Etiketler: " + (showLabels ? "açık" : "kapalı"); });
window.addEventListener("keydown", (ev) => { if (ev.key === "Escape") closePlayer(); if (ev.key === " " && player.classList.contains("on")) { ev.preventDefault(); document.getElementById("pPlay").click(); } });

/* ============================ ANA DÖNGÜ ================================ */
renderTheories(); buildIntChips(); drawInterior();
let lastT = performance.now();
function loop(now) {
  const dt = Math.min(.1, (now - lastT) / 1000); lastT = now;
  drawBgStars(dt); drawSim(dt); drawPlayer(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
document.addEventListener("pointerdown", () => Sfx.ensure(), { once: true });
</script>
</body>
</html>`;

/* --------------------------- yaz ------------------------------------------ */

const outDir = join(process.cwd(), "public");
mkdirSync(outDir, { recursive: true });
const out = join(outDir, "eba-gunes-sistemi.html");
writeFileSync(out, html, "utf8");
const kb = (Buffer.byteLength(html, "utf8") / 1024).toFixed(1);
console.log(`✓ EBA dosyası üretildi: public/eba-gunes-sistemi.html (${kb} KB, ${THEORIES.length} teori, ${BODIES.filter(b=>!b.sim.parentId).length} cisim, ${Object.keys(INTERIORS).length} iç yapı)`);
