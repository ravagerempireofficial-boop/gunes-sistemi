"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { TheoryDef, TheoryStage } from "@/lib/theories";
import { TheorySfx } from "@/lib/theory-sfx";
import { ChevronLeft, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import {
  MARS_FATE_HD,
  OCEAN_BIRTH_HD,
  SUN_DEATH_HD,
  hdCategoryScene,
} from "./theory-render-hd";

/**
 * TheoryView v2 — MEGA detaylı teori animasyon oynatıcısı.
 *
 * · Yumuşak geçiş: aşama sınırlarında iki sahne alfa ile kaynaşır (ani kesme yok)
 * · 2.8D: parallax yıldız alanı, elips perspektif, gölgeli küreler
 * · Sahne güneşiyle uyumlu 2D Güneş: granülasyon + kenar kararması + korona
 * · Patlama/patlama-öncesi efektleri: flaş, şok halkaları, kıvılcım, kaya/buz parçaları
 * · Küçük bilgi balonları (notes) belirip kaybolur
 * · WebAudio ses efektleri (cues) animasyonla senkron tetiklenir
 */

/* ------------------------------- yardımcılar ----------------------------- */

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/** Deterministik pseudo-random (seed sabit → her karede aynı sonuç). */
function rand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  layer: number;
}

function makeStars(n: number): Star[] {
  const arr: Star[] = [];
  for (let i = 0; i < n; i++) {
    arr.push({
      x: Math.random(),
      y: Math.random(),
      r: 0.3 + Math.pow(Math.random(), 2) * 1.4,
      a: 0.2 + Math.random() * 0.8,
      layer: Math.random() > 0.5 ? 1 : 2,
    });
  }
  return arr;
}

function drawSpaceBg(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  stars: Star[],
  t: number,
  p: number
) {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#080810");
  bg.addColorStop(1, "#020207");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  // Süt benzeri samanyolu bandı (yavaş parallax)
  const off = (p * 40) % w;
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.translate(-off, 0);
  ctx.fillStyle = "#8a86b8";
  ctx.beginPath();
  ctx.ellipse(w * 0.7, h * 0.35, w * 0.8, h * 0.28, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Parallax yıldızlar
  for (const s of stars) {
    const px = ((s.x - p * 0.03 * s.layer) % 1 + 1) % 1;
    ctx.globalAlpha = s.a * (0.75 + 0.25 * Math.sin(t * 2 + s.x * 40));
    ctx.fillStyle = s.layer === 2 ? "#f4f6fa" : "#c8ccdc";
    ctx.beginPath();
    ctx.arc(px * w, s.y * h, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Gölgeli küre — 2.8D hissi (ışık sol üstten). */
function drawSphere(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  base: string,
  hi: string,
  lo: string,
  glow?: string
) {
  if (glow) {
    const g = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 1.6);
    g.addColorStop(0, glow);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  const g = ctx.createRadialGradient(
    x - r * 0.35,
    y - r * 0.38,
    r * 0.08,
    x,
    y,
    r * 1.05
  );
  g.addColorStop(0, hi);
  g.addColorStop(0.55, base);
  g.addColorStop(1, lo);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/* --------------------- Sahne güneşiyle uyumlu 2D Güneş -------------------- */

let sunNoiseTile: HTMLCanvasElement | null = null;
function getSunNoise(): HTMLCanvasElement {
  if (sunNoiseTile) return sunNoiseTile;
  const S = 256;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const x = c.getContext("2d")!;
  x.fillStyle = "#ff9a2e";
  x.fillRect(0, 0, S, S);
  // Granülasyon benzeri leke katmanları (fBm taklidi)
  for (let i = 0; i < 900; i++) {
    const px = Math.random() * S;
    const py = Math.random() * S;
    const r = 2 + Math.random() * 9;
    const hot = Math.random() > 0.55;
    x.fillStyle = hot
      ? `rgba(255,236,170,${0.05 + Math.random() * 0.12})`
      : `rgba(150,40,4,${0.05 + Math.random() * 0.12})`;
    x.beginPath();
    x.arc(px, py, r, 0, Math.PI * 2);
    x.fill();
  }
  sunNoiseTile = c;
  return c;
}

/**
 * Ana sahnedeki shader Güneş'in 2D karşılığı: kaynayan granülasyon,
 * kenar kararması (limb darkening) ve nabızlı çift korona.
 */
function drawSun2D(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number,
  scale = 1
) {
  // Korona katmanları (additive)
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const pulse = 1 + Math.sin(t * 1.1) * 0.04;
  for (const [mult, color, op] of [
    [13.5, "rgba(201,122,42,0.16)", 1],
    [7.4, "rgba(255,154,46,0.3)", 1],
    [4.6, "rgba(255,184,77,0.55)", 1],
  ] as const) {
    const rr = r * mult * scale * pulse;
    const g = ctx.createRadialGradient(x, y, r * 0.6, x, y, rr);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(255,140,30,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Disk
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  // Taban gradyan
  const base = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.1, x, y, r);
  base.addColorStop(0, "#fff3c8");
  base.addColorStop(0.5, "#ffc84d");
  base.addColorStop(1, "#ff8a1e");
  ctx.fillStyle = base;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  // Granülasyon: kayan gürültü karosu
  const tile = getSunNoise();
  const drift = (t * 6) % 256;
  ctx.globalAlpha = 0.5;
  for (const [dx, dy, sc] of [
    [drift, drift * 0.6, 1.6],
    [-drift * 0.8, drift, 2.6],
  ] as const) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    ctx.rotate(t * 0.01 * sc);
    ctx.drawImage(tile, -128 - (dx % 256) / sc, -128 - (dy % 256) / sc);
    ctx.drawImage(tile, -128 - (dx % 256) / sc + 256, -128 - (dy % 256) / sc);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  // Kenar kararması
  const limb = ctx.createRadialGradient(x, y, r * 0.55, x, y, r);
  limb.addColorStop(0, "rgba(255,190,80,0)");
  limb.addColorStop(1, "rgba(140,40,0,0.55)");
  ctx.fillStyle = limb;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

/* ------------------------------ Patlama efekti --------------------------- */

/**
 * Tam teçhizatlı patlama: flaş + 2 şok halkası + kıvılcımlar + kaya/buz
 * parçaları. t01: patlamanın kendi süresi (0-1). ice=true → buz kırıkları.
 */
function drawBurst(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t01: number,
  seed: number,
  ice = false,
  scale = 1
) {
  const fade = 1 - smoothstep(0.75, 1, t01);
  // Flaş
  const flash = (1 - smoothstep(0, 0.18, t01)) * fade;
  if (flash > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(x, y, 0, x, y, 260 * scale);
    g.addColorStop(0, `rgba(255,244,220,${flash})`);
    g.addColorStop(0.35, `rgba(255,190,90,${flash * 0.7})`);
    g.addColorStop(1, "rgba(255,120,40,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 260 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Şok halkaları
  for (const k of [0, 0.35]) {
    const tt = clamp01((t01 - k) / 0.65);
    if (tt <= 0 || tt >= 1) continue;
    const rr = tt * tt * 210 * scale;
    ctx.strokeStyle = `rgba(255,205,130,${(1 - tt) * 0.8 * fade})`;
    ctx.lineWidth = Math.max(1.2, 5 * (1 - tt));
    ctx.beginPath();
    ctx.arc(x, y, rr, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Kıvılcımlar
  const N = 26;
  for (let i = 0; i < N; i++) {
    const a = rand(seed + i) * Math.PI * 2;
    const sp = (0.5 + rand(seed + i * 3.3) * 1) * 150 * scale;
    const dist = sp * (t01 * (2 - t01));
    const px = x + Math.cos(a) * dist;
    const py = y + Math.sin(a) * dist * 0.8;
    const sz = (1 + rand(seed + i * 7.7) * 2) * (1 - t01 * 0.8);
    if (sz <= 0.2) continue;
    ctx.fillStyle = ice
      ? `rgba(190,235,255,${fade})`
      : `rgba(255,${170 + Math.floor(rand(seed + i) * 60)},80,${fade})`;
    ctx.beginPath();
    ctx.arc(px, py, sz, 0, Math.PI * 2);
    ctx.fill();
  }
  // Parça fırlatma (kaya veya buz kırıkları)
  const SH = 8;
  for (let i = 0; i < SH; i++) {
    const a = rand(seed * 2 + i * 13.7) * Math.PI * 2;
    const sp = (0.7 + rand(seed * 2 + i * 5.1)) * 95 * scale;
    const dist = sp * t01;
    const px = x + Math.cos(a) * dist;
    const py = y + Math.sin(a) * dist * 0.85;
    const rot = rand(seed + i * 31) * Math.PI * 2 + t01 * 4;
    const sz = (4 + rand(seed + i * 17) * 7) * scale * (1 - t01 * 0.4);
    drawShard(ctx, px, py, sz, rot, ice, fade);
  }
}

/** Kaya veya buz kırığı (gerçekçi çokgen). */
function drawShard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rot: number,
  ice: boolean,
  alpha: number
) {
  if (r < 0.6 || alpha <= 0.02) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  const pts = 6;
  for (let i = 0; i < pts; i++) {
    const a = (i / pts) * Math.PI * 2;
    const rr = r * (0.62 + rand(i * 3.3 + r) * 0.5);
    const px = Math.cos(a) * rr;
    const py = Math.sin(a) * rr * 0.82;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  if (ice) {
    const g = ctx.createLinearGradient(-r, -r, r, r);
    g.addColorStop(0, "#eaf8ff");
    g.addColorStop(0.5, "#bfe4f8");
    g.addColorStop(1, "#7fb8d8");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 1;
    ctx.stroke();
  } else {
    const g = ctx.createLinearGradient(-r, -r, r, r);
    g.addColorStop(0, "#c8a078");
    g.addColorStop(0.6, "#8a6248");
    g.addColorStop(1, "#4a3020");
    ctx.fillStyle = g;
    ctx.fill();
  }
  ctx.restore();
}

/* ------------------------------ Sahne imzası ----------------------------- */

interface StageCtx {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  t: number;
  /** Aşama içindeki yerel ilerleme (0-1) */
  local: number;
  /** Toplam ilerleme (0-1) */
  p: number;
  /** Aşamalar arası harmanlanma katsayısı (0-1) */
  alpha: number;
}

type StageDrawer = (c: StageCtx) => void;

/** Kuintik (5. derece) yumuşatma — en pürüzsüz geçiş eğrisi. */
function smootherstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/* ----------------------- Geçiş süsleme katmanları ------------------------ */
/* Her geçiş 9 katmandan oluşur — ASLA ani kesme yok. */

/** Katman 5: yıldız tozları geçiş sırasında sahneyi çaprazlar. */
function drawStardustDrift(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  k: number,
  color: string
) {
  const veil = Math.sin(clamp01(k) * Math.PI);
  if (veil <= 0.02) return;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const col = color.replace("#", "");
  const r = parseInt(col.slice(0, 2), 16);
  const g = parseInt(col.slice(2, 4), 16);
  const b = parseInt(col.slice(4, 6), 16);
  for (let i = 0; i < 34; i++) {
    const seed = i * 3.77;
    const px = ((rand(seed) * 1.3 - (t * 0.018 + i * 0.013)) % 1.3 + 1.3) % 1.3 - 0.15;
    const py = rand(seed + 1) + Math.sin(t * 0.4 + i) * 0.02;
    const rr = 0.8 + rand(seed + 2) * 1.8;
    ctx.globalAlpha = veil * 0.5 * (0.35 + 0.65 * rand(seed + 3));
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.beginPath();
    ctx.arc(px * w, py * h, rr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Katman 6: köşegen ışık süpürmesi (yumuşak kenarlı perde). */
function drawLightSweep(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  k: number,
  color: string
) {
  const p = clamp01(k);
  const veil = Math.sin(p * Math.PI);
  if (veil <= 0.02) return;
  const cx = lerp(-0.35, 1.35, p) * w;
  const col = color.replace("#", "");
  const r = parseInt(col.slice(0, 2), 16);
  const g = parseInt(col.slice(2, 4), 16);
  const b = parseInt(col.slice(4, 6), 16);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const grad = ctx.createLinearGradient(cx - w * 0.32, 0, cx + w * 0.32, h);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.5, `rgba(${r},${g},${b},${veil * 0.1})`);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** Katman 7: vinyet nefesi — kenarlar yumuşakça kararır (kenar yumuşatma). */
function drawVignetteBreath(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  k: number
) {
  const veil = Math.sin(clamp01(k) * Math.PI);
  if (veil <= 0.02) return;
  const g = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.32,
    w / 2,
    h / 2,
    Math.max(w, h) * 0.78
  );
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(2,2,5,${veil * 0.5})`);
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** Katman 8: yatay yumuşak silme — sahneler birbirinin içinden süzülür. */
function drawSoftWipe(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  k: number
) {
  const p = clamp01(k);
  if (p <= 0.02 || p >= 0.98) return;
  const edge = h * 0.42;
  const y = p * (h + edge * 2) - edge;
  const g = ctx.createLinearGradient(0, y - edge, 0, y + edge);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.5, `rgba(0,0,0,${0.16 * Math.sin(p * Math.PI)})`);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** Katman 9: renk imzalı yankı halkası — geçişin nabzı. */
function drawEchoRing(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  k: number,
  color: string
) {
  const p = clamp01(k);
  const veil = Math.sin(p * Math.PI);
  if (veil <= 0.03) return;
  const col = color.replace("#", "");
  const r = parseInt(col.slice(0, 2), 16);
  const g = parseInt(col.slice(2, 4), 16);
  const b = parseInt(col.slice(4, 6), 16);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = `rgba(${r},${g},${b},${veil * 0.14})`;
  ctx.lineWidth = Math.max(1.2, h * 0.004);
  const R = Math.max(w, h) * (0.12 + p * 0.55);
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Aşama sınırlarında iki sahneyi kaynaştıran yardımcı akış — v3.
 *
 * GEÇİŞ DEMİR KURALI: pencere ±%2,75 (toplam ~%5,5) ve kuintik easing;
 * 9 katman: 1) bulanıklık 2) ölçek 3) alfa 4) ışık perdesi 5) yıldız tozları
 * 6) ışık süpürmesi 7) vinyet nefesi 8) yumuşak silme 9) yankı halkası.
 * Ani kesme ASLA yoktur — her şey kaynaşarak geçer.
 */
function renderStaged(
  c: Omit<StageCtx, "local" | "alpha">,
  theory: TheoryDef,
  drawers: StageDrawer[]
) {
  const stages = theory.stages;
  let idx = stages.findIndex((s) => c.p <= s.until - 1e-9);
  if (idx === -1) idx = stages.length - 1;
  const start = idx === 0 ? 0 : stages[idx - 1].until;
  const end = stages[idx].until;
  const local = clamp01((c.p - start) / (end - start));

  // Harman penceresi — uzun ve fazlasıyla yumuşak (v3: %5,5)
  const bw = 0.0275;
  const supportFilter = typeof c.ctx.filter === "string";

  const drawLayer = (
    i: number,
    alpha: number,
    localOverride: number,
    mode: "out" | "in"
  ) => {
    if (alpha <= 0.004 || !drawers[i]) return;
    const st0 = i === 0 ? 0 : stages[i - 1].until;
    const st1 = stages[i].until;
    const lc = localOverride ?? clamp01((c.p - st0) / (st1 - st0));
    const ctx = c.ctx;
    ctx.save();
    // Katman 1: bulanıklık (çıkan sahne daha çok bulanıklaşır)
    if (supportFilter) {
      const blur = mode === "out" ? (1 - alpha) * 4.2 : (1 - alpha) * 3.1;
      if (blur > 0.25) ctx.filter = `blur(${blur.toFixed(2)}px)`;
    }
    // Katman 2: ölçek (çıkan büyüyerek uzaklaşır, gelen küçülerek oturur)
    const sc =
      mode === "out"
        ? 1 + (1 - alpha) * 0.065
        : 1.052 - 0.052 * alpha;
    if (Math.abs(sc - 1) > 0.0008) {
      ctx.translate(c.w / 2, c.h / 2);
      ctx.scale(sc, sc);
      ctx.translate(-c.w / 2, -c.h / 2);
    }
    // Katman 3: alfa
    ctx.globalAlpha = alpha;
    drawers[i]({ ...c, local: lc, alpha });
    ctx.restore();
  };

  const bnd = start;
  let blending = false;
  let k = 1;
  if (idx > 0 && c.p < bnd + bw) {
    blending = true;
    k = smootherstep(bnd - bw * 0.62, bnd + bw * 0.62, c.p);
    drawLayer(idx - 1, 1 - k, 1, "out");
    drawLayer(idx, k, local, "in");
  } else if (idx < stages.length - 1 && c.p > end - bw) {
    blending = true;
    k = smootherstep(end - bw * 0.62, end + bw * 0.62, c.p);
    drawLayer(idx, 1 - k, local, "out");
    drawLayer(idx + 1, k, 0, "in");
  } else {
    drawLayer(idx, 1, local, "in");
  }

  // Katman 4-9: süs katmanları (sadece harman sırasında)
  if (blending) {
    drawStardustDrift(c.ctx, c.w, c.h, c.t, k, theory.color);
    drawLightSweep(c.ctx, c.w, c.h, k, theory.color);
    drawSoftWipe(c.ctx, c.w, c.h, k);
    drawEchoRing(c.ctx, c.w, c.h, k, theory.color);
    drawVignetteBreath(c.ctx, c.w, c.h, k);
    // Katman 4: renk imzalı ışık perdesi
    const veil = Math.sin(clamp01(k) * Math.PI);
    if (veil > 0.02) {
      const ctx = c.ctx;
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const g = ctx.createRadialGradient(
        c.w / 2,
        c.h / 2,
        0,
        c.w / 2,
        c.h / 2,
        Math.max(c.w, c.h) * 0.72
      );
      const col = theory.color.replace("#", "");
      const r = parseInt(col.slice(0, 2), 16);
      const gg = parseInt(col.slice(2, 4), 16);
      const b = parseInt(col.slice(4, 6), 16);
      g.addColorStop(0, `rgba(${r},${gg},${b},${veil * 0.13})`);
      g.addColorStop(0.6, `rgba(${r},${gg},${b},${veil * 0.05})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, c.w, c.h);
      ctx.restore();
    }
  }
  return idx;
}

/* --------------------------- Küçük yardım sahneler ----------------------- */

/** Yörünge elipsi (2.8D perspektif). */
function orbitEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  squash: number,
  color: string,
  alpha = 0.25
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 6]);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, rx * squash, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** Yörünge üzerindeki nokta konumu. */
function orbitPos(
  cx: number,
  cy: number,
  rx: number,
  squash: number,
  ang: number
): [number, number] {
  return [cx + Math.cos(ang) * rx, cy + Math.sin(ang) * rx * squash];
}

/* ---------------------- 10 TEORİNİN SAHNE ÇİZİMLERİ ---------------------- */

/* 1) Güneş'in doğuşu ------------------------------------------------------- */
const sunBirth: StageDrawer[] = [
  // s0: dev moleküler bulut + şok dalgası
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    const press = smoothstep(0.1, 0.9, local);
    for (let i = 0; i < 90; i++) {
      const a = rand(i) * Math.PI * 2;
      const baseR = (0.12 + rand(i * 3) * 0.34) * (1 - press * 0.22);
      const drift = Math.sin(t * 0.3 + i) * 8;
      const px = cx + Math.cos(a) * baseR * w + drift;
      const py = cy + Math.sin(a) * baseR * w * 0.72 + Math.cos(t * 0.2 + i) * 6;
      ctx.fillStyle = rand(i * 7) > 0.5 ? "rgba(140,158,190,0.6)" : "rgba(105,120,150,0.6)";
      ctx.beginPath();
      ctx.arc(px, py, 1 + rand(i * 5) * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    // Süpernova şok dalgası köşeden gelir
    const wt = clamp01((local - 0.35) / 0.6);
    if (wt > 0) {
      const r = wt * w * 0.9;
      ctx.strokeStyle = `rgba(150,210,255,${0.7 * (1 - wt)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(w * 1.05, -h * 0.05, r, Math.PI * 0.55, Math.PI * 1.05);
      ctx.stroke();
    }
    drawSphere(ctx, cx, cy, 60 * (1 - press * 0.3), "rgba(60,75,110,0.4)", "rgba(90,110,150,0.25)", "rgba(20,30,60,0.3)");
  },
  // s1: spiral çöküş
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    const shrink = 1 - smoothstep(0, 1, local) * 0.7;
    const squash = 0.75 - smoothstep(0, 1, local) * 0.35;
    for (let i = 0; i < 110; i++) {
      const a0 = rand(i) * Math.PI * 2;
      const spin = t * (0.5 + rand(i * 3) * 0.7);
      const rr = (0.1 + rand(i * 7) * 0.34) * shrink;
      const px = cx + Math.cos(a0 + spin) * rr * w;
      const py = cy + Math.sin(a0 + spin) * rr * w * squash;
      ctx.fillStyle = rand(i * 5) > 0.4 ? "rgba(220,200,170,0.8)" : "rgba(150,135,115,0.7)";
      ctx.beginPath();
      ctx.arc(px, py, 1.1 + rand(i * 11) * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    // Büyüyen çekirdek parıltısı
    const gr = 14 + smoothstep(0, 1, local) * 46;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr * 2.4);
    g.addColorStop(0, "rgba(255,190,90,0.75)");
    g.addColorStop(1, "rgba(255,120,40,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, gr * 2.4, 0, Math.PI * 2);
    ctx.fill();
  },
  // s2: proto-Güneş + birikim diski + planetesimaller
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    drawSun2D(ctx, cx, cy, 16 + local * 8, t, 0.5);
    orbitEllipse(ctx, cx, cy, w * 0.36, 0.24, "#d8c8a8", 0.2);
    for (let i = 0; i < 120; i++) {
      const ring = 0.14 + rand(i * 2) * 0.24;
      const ang = rand(i * 9) * Math.PI * 2 + t * (1.6 - ring * 3);
      const px = cx + Math.cos(ang) * ring * w;
      const py = cy + Math.sin(ang) * ring * w * 0.24;
      ctx.fillStyle = rand(i) > 0.5 ? "rgba(215,198,168,0.85)" : "rgba(160,145,125,0.7)";
      ctx.beginPath();
      ctx.arc(px, py, 0.9 + rand(i * 3) * 1.6, 0, Math.PI * 2);
      ctx.fill();
      // Ara sıra planetesimal çarpışması
      if (rand(Math.floor(t * 2) + i) > 0.995) {
        drawBurst(ctx, px, py, 0.5, i, false, 0.35);
      }
    }
  },
  // s3: kutup jetleri (T Tauri)
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    drawSun2D(ctx, cx, cy, 22, t, 0.6);
    // Disk
    for (let i = 0; i < 80; i++) {
      const ring = 0.12 + rand(i) * 0.26;
      const ang = rand(i * 5) * Math.PI * 2 + t * (1.4 - ring * 3);
      const px = cx + Math.cos(ang) * ring * w;
      const py = cy + Math.sin(ang) * ring * w * 0.22;
      ctx.fillStyle = "rgba(200,185,160,0.7)";
      ctx.beginPath();
      ctx.arc(px, py, 1 + rand(i * 3) * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    // Manyetik kutup jetleri + akan parçacıklar
    const jl = h * (0.3 + Math.sin(t * 1.3) * 0.02);
    for (const dir of [-1, 1]) {
      const g = ctx.createLinearGradient(cx, cy, cx, cy + dir * jl);
      g.addColorStop(0, "rgba(150,215,255,0.55)");
      g.addColorStop(1, "rgba(150,215,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy);
      ctx.lineTo(cx + 7, cy);
      ctx.lineTo(cx + 22, cy + dir * jl);
      ctx.lineTo(cx - 22, cy + dir * jl);
      ctx.closePath();
      ctx.fill();
      for (let i = 0; i < 16; i++) {
        const ph = (t * 0.7 + i / 16) % 1;
        const px = cx + Math.sin(t * 5 + i * 2.4) * 8 * ph;
        ctx.fillStyle = `rgba(190,235,255,${(1 - ph) * 0.9})`;
        ctx.beginPath();
        ctx.arc(px, cy + dir * ph * jl, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },
  // s4: FÜZYON ateşleniyor
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    // Ateşlenme flaşı
    const flash = (1 - smoothstep(0, 0.22, local)) * (local < 0.22 ? 1 : 0);
    drawSun2D(ctx, cx, cy, 30, t, 0.75 + smoothstep(0, 0.4, local) * 0.2);
    if (flash > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.6);
      g.addColorStop(0, `rgba(255,248,226,${flash * 0.95})`);
      g.addColorStop(0.4, `rgba(255,200,110,${flash * 0.6})`);
      g.addColorStop(1, "rgba(255,150,50,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
    // Uzak disk halkaları (gezegen tohumları)
    orbitEllipse(ctx, cx, cy, w * 0.34, 0.28, "#c8b8a0", 0.14);
    orbitEllipse(ctx, cx, cy, w * 0.44, 0.3, "#c8b8a0", 0.1);
  },
  // s5: rüzgâr süpürüyor + gezegen tohumları
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    drawSun2D(ctx, cx, cy, 30, t, 0.8);
    const sweep = smoothstep(0, 0.7, local);
    // Savrulan gaz
    for (let i = 0; i < 90; i++) {
      const a = rand(i) * Math.PI * 2;
      const rr = (0.1 + rand(i * 3) * 0.3) * (1 + sweep * 2.6);
      const px = cx + Math.cos(a) * rr * w;
      const py = cy + Math.sin(a) * rr * w * 0.42;
      ctx.globalAlpha = Math.max(0, 0.6 * (1 - sweep));
      ctx.fillStyle = "rgba(190,175,150,0.8)";
      ctx.beginPath();
      ctx.arc(px, py, 1 + rand(i * 7) * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Rüzgâr çizgileri
    for (let i = 0; i < 14; i++) {
      const a = rand(i * 13) * Math.PI * 2;
      const ph = (t * 0.5 + rand(i)) % 1;
      const r0 = (0.1 + ph * 0.5) * w * 0.5;
      ctx.strokeStyle = `rgba(255,210,140,${0.35 * (1 - ph)})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * 0.45);
      ctx.lineTo(cx + Math.cos(a) * (r0 + 26), cy + Math.sin(a) * (r0 + 26) * 0.45);
      ctx.stroke();
    }
    // Gezegen tohumları
    const seeds: Array<[number, number, number, string]> = [
      [0.3, 3, 0.5, "#c8b0a0"],
      [0.42, 4.2, 0.9, "#8fd0ff"],
      [0.54, 3.2, 1.4, "#d0a880"],
    ];
    for (const [rr, sz, sp, col] of seeds) {
      const ang = t * sp * 0.6 + rr * 9;
      const px = cx + Math.cos(ang) * rr * w;
      const py = cy + Math.sin(ang) * rr * w * 0.4;
      drawSphere(ctx, px, py, sz, col, "#fff", "#222", col + "44");
    }
  },
];

/* 2) Dünya'nın oluşumu ------------------------------------------------------ */
const earthForm: StageDrawer[] = [
  (c) => {
    const { ctx, w, h, t } = c;
    const cx = w / 2;
    const cy = h / 2;
    orbitEllipse(ctx, cx, cy, w * 0.3, 0.26, "#a89a8a", 0.16);
    for (let i = 0; i < 110; i++) {
      const rr = 0.12 + rand(i * 2) * 0.2;
      const ang = rand(i * 7) * Math.PI * 2 + t * (1.8 - rr * 4);
      const px = cx + Math.cos(ang) * rr * w;
      const py = cy + Math.sin(ang) * rr * w * 0.26;
      ctx.fillStyle = rand(i) > 0.55 ? "rgba(220,212,196,0.8)" : "rgba(165,150,135,0.7)";
      ctx.beginPath();
      ctx.arc(px, py, 0.8 + rand(i * 3) * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    orbitEllipse(ctx, cx, cy, w * 0.28, 0.26, "#a89a8a", 0.16);
    // Büyüyen kümeler + çarpışmalar
    for (let i = 0; i < 34; i++) {
      const clump = smoothstep(0, 0.8, local + rand(i * 3) * 0.2);
      const rr = lerp(0.22 + rand(i) * 0.14, 0.3, clump);
      const ang = rand(i * 9) * Math.PI * 2 + t * (1.1 - clump * 0.6) * (i % 2 ? 1 : -1);
      const px = cx + Math.cos(ang) * rr * w;
      const py = cy + Math.sin(ang) * rr * w * 0.26;
      drawShard(ctx, px, py, 2.5 + clump * 7 + rand(i) * 2, t * (0.3 + rand(i)), false, 0.95);
      if (rand(Math.floor(t * 1.5) + i * 7) > 0.985 && local > 0.1) {
        drawBurst(ctx, px, py, clamp01(((t * 1.5) % 1) * 2), i, false, 0.5);
      }
    }
    // Merkezde büyüyen embriyo
    drawSphere(ctx, cx, cy, 10 + local * 22, "#8a6248", "#c8a078", "#2a1a10");
  },
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    const R = w * 0.15;
    drawSphere(ctx, cx, cy, R, "#d85a20", "#ffb060", "#5a1608", "rgba(255,120,40,0.35)");
    // Magma çatlakları
    ctx.strokeStyle = "rgba(255,190,90,0.8)";
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 8; i++) {
      const a0 = (i / 8) * Math.PI * 2 + t * 0.15;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a0) * R * 0.15, cy + Math.sin(a0) * R * 0.15);
      ctx.quadraticCurveTo(
        cx + Math.cos(a0 + 0.5) * R * 0.62,
        cy + Math.sin(a0 + 0.5) * R * 0.62,
        cx + Math.cos(a0 + 0.12) * R * 0.97,
        cy + Math.sin(a0 + 0.12) * R * 0.97
      );
      ctx.stroke();
    }
    // Gelen gövdeler + çarpma efektleri
    for (let i = 0; i < 6; i++) {
      const ph = (t * 0.35 + i / 6) % 1;
      const a = rand(i * 17) * Math.PI * 2;
      const rr = lerp(0.42, 0.16, ph);
      const px = cx + Math.cos(a) * rr * w;
      const py = cy + Math.sin(a) * rr * w * 0.3;
      drawShard(ctx, px, py, 3 + rand(i) * 3, t * 2 + i, false, 0.95);
      ctx.strokeStyle = `rgba(255,200,120,${0.4 * (1 - ph)})`;
      ctx.beginPath();
      ctx.moveTo(px - Math.cos(a) * 12, py - Math.sin(a) * 8);
      ctx.lineTo(px, py);
      ctx.stroke();
      if (ph > 0.94) {
        drawBurst(ctx, px, py, (ph - 0.94) / 0.06 * 0.4, i + 40, false, 0.8);
      }
    }
  },
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    const R = w * 0.16;
    const reveal = smoothstep(0, 0.7, local);
    // Kesit: manto + batan demir damlaları + toplanan çekirdek
    drawSphere(ctx, cx, cy, R, "#c1663a", "#e08a50", "#6a2a14", "rgba(255,120,50,0.25)");
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();
    // Batan damlalar
    for (let i = 0; i < 12; i++) {
      const ph = ((t * 0.5 + rand(i)) % 1) * reveal;
      const a = rand(i * 9) * Math.PI * 2;
      const rr = (1 - ph) * R * 0.9;
      const px = cx + Math.cos(a) * rr;
      const py = cy + Math.sin(a) * rr;
      ctx.fillStyle = "rgba(255,216,120,0.9)";
      ctx.beginPath();
      ctx.ellipse(px, py, 2.4, 3.6, a, 0, Math.PI * 2);
      ctx.fill();
    }
    // Toplanan çekirdek
    const coreR = R * 0.55 * reveal * (0.9 + Math.sin(t * 2) * 0.03);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
    g.addColorStop(0, "#fff3b8");
    g.addColorStop(0.7, "#f2b544");
    g.addColorStop(1, "#c87a10");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
  (c) => {
    const { ctx, w, h, t } = c;
    const cx = w / 2;
    const cy = h / 2;
    const R = w * 0.14;
    drawSphere(ctx, cx, cy, R, "#2a4a7a", "#6a9ac8", "#0a1428", "rgba(120,180,255,0.2)");
    // Manyetik alan çizgileri (dipol) — canlı nabız
    const pulse = 0.9 + Math.sin(t * 2.2) * 0.08;
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = "#8fd0ff";
    ctx.lineWidth = 1.3;
    for (const s of [1.25, 1.6, 2.0]) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * s * pulse, R * s * 0.62 * pulse, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * 0.62 * pulse, R * s * 0.9 * pulse, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    // Kutup aurorası
    ctx.fillStyle = `rgba(140,230,180,${0.3 + Math.sin(t * 3) * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy - R * 0.95, R * 0.5, R * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
  },
  (c) => {
    const { ctx, w, h, t } = c;
    const cx = w / 2;
    const cy = h / 2;
    const R = w * 0.14;
    drawSphere(ctx, cx, cy, R, "#5a7ab8", "#9ac0e8", "#1a2a4a", "rgba(120,180,255,0.16)");
    // Kabuk plakaları
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "rgba(90,150,90,0.75)";
    for (let i = 0; i < 5; i++) {
      const px = cx + Math.cos(i * 2.2 + t * 0.05) * R * 0.5;
      const py = cy + Math.sin(i * 1.7 + t * 0.04) * R * 0.5;
      ctx.beginPath();
      ctx.ellipse(px, py, R * 0.4, R * 0.24, i * 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
    // Volkan noktaları
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.4 + i / 3) % 1;
      const px = cx + Math.cos(i * 2.7) * R * 0.55;
      const py = cy + Math.sin(i * 2.7) * R * 0.55;
      ctx.fillStyle = `rgba(255,140,50,${(1 - ph) * 0.7})`;
      ctx.beginPath();
      ctx.arc(px, py - ph * 10, 1.5 + ph * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },
];

/* 3) Büyük çarpma ----------------------------------------------------------- */
const giantImpact: StageDrawer[] = [
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    const R = w * 0.1;
    const tx = lerp(w * 0.88, w * 0.68, smoothstep(0, 1, local));
    const ty = cy - smoothstep(0, 1, local) * h * 0.08;
    drawSphere(ctx, cx - w * 0.16, cy, R, "#c86a3a", "#e8a060", "#5a1a08", "rgba(255,120,60,0.15)");
    // Gelgit deformasyonu: Theia, Dünya'ya bakan taraftan uzar (ölçekli elipsoit)
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(Math.atan2(cy - ty, cx - w * 0.16 - tx));
    ctx.scale(1.22, 0.82);
    drawSphere(ctx, 0, 0, R * 0.68, "#b05a3a", "#e09070", "#4a1206", "rgba(255,150,80,0.2)");
    ctx.restore();
    // Kuyruk izi
    ctx.strokeStyle = "rgba(200,140,90,0.4)";
    ctx.setLineDash([4, 8]);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(w * 0.94, cy - h * 0.12);
    ctx.quadraticCurveTo(w * 0.82, cy - h * 0.14, tx, ty);
    ctx.stroke();
    ctx.setLineDash([]);
  },
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    const R = w * 0.1;
    const ix = w * 0.63;
    const iy = cy - h * 0.06;
    drawSphere(ctx, cx - w * 0.14, cy, R, "#d85a28", "#ffb070", "#5a1a08", "rgba(255,120,50,0.4)");
    drawSphere(ctx, ix, iy, R * 0.6, "#b05a3a", "#e09070", "#4a1206", "rgba(255,150,80,0.35)");
    // Yaklaşma titremesi
    const sh = Math.sin(t * 40) * 1.6 * local;
    ctx.save();
    ctx.translate(sh, Math.cos(t * 37) * 1.2 * local);
    ctx.restore();
    // Isı artışı
    ctx.globalAlpha = local * 0.4;
    const g = ctx.createRadialGradient(ix, iy, 0, ix, iy, R * 2.4);
    g.addColorStop(0, "rgba(255,180,90,0.8)");
    g.addColorStop(1, "rgba(255,120,40,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(ix, iy, R * 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  },
  // s2: ÇARPIŞMA — tam efekt
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    const ix = w * 0.52;
    const iy = cy;
    drawSphere(ctx, cx - w * 0.12, cy, w * 0.1, "#d85a28", "#ffb070", "#5a1a08", "rgba(255,120,50,0.5)");
    drawBurst(ctx, ix, iy, clamp01(local * 1.25), 777, false, 1.6);
    // Deforme birleşen gövde
    const wob = Math.sin(t * 9) * (1 - clamp01(local * 1.4)) * 6;
    drawSphere(ctx, cx - w * 0.04, cy + wob * 0.5, w * 0.105, "#e06030", "#ffb070", "#4a1206");
  },
  // s3: iç içe geçiş (kesit)
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    const R = w * 0.15;
    // Kesitli eriyik Dünya
    drawSphere(ctx, cx, cy, R, "#c84a20", "#ff9048", "#3a0e04", "rgba(255,110,40,0.4)");
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();
    // Dünya çekirdeği (solda) ve Theia çekirdeği (sağdan içeri)
    const merge = smoothstep(0, 0.85, local);
    const c1x = cx - R * 0.42 * (1 - merge * 0.9);
    const c2x = lerp(cx + R * 0.9, cx + R * 0.2, merge);
    ctx.fillStyle = "#f2b544";
    ctx.beginPath();
    ctx.arc(c1x, cy, R * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e8a030";
    ctx.beginPath();
    ctx.arc(c2x, cy - R * 0.08 * (1 - merge), R * 0.24, 0, Math.PI * 2);
    ctx.fill();
    // Kaynaşma parıltısı
    if (merge > 0.3 && merge < 0.95) {
      ctx.fillStyle = `rgba(255,240,180,${0.5 * (1 - Math.abs(merge - 0.62) * 2)})`;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },
  // s4: moloz halkası
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    drawSphere(ctx, cx, cy, w * 0.12, "#d85a28", "#ffa050", "#4a1206", "rgba(255,120,50,0.3)");
    const spread = smoothstep(0, 1, local);
    orbitEllipse(ctx, cx, cy, w * (0.2 + spread * 0.12), 0.2, "#ffb060", 0.25);
    for (let i = 0; i < 90; i++) {
      const rr = (0.2 + rand(i) * 0.12) * (1 + spread * 0.4);
      const ang = rand(i * 5) * Math.PI * 2 + t * (1.2 - rr);
      const px = cx + Math.cos(ang) * rr * w;
      const py = cy + Math.sin(ang) * rr * w * 0.2;
      ctx.fillStyle = rand(i * 3) > 0.4 ? "rgba(255,176,96,0.9)" : "rgba(200,80,40,0.8)";
      ctx.beginPath();
      ctx.arc(px, py, 0.9 + rand(i * 7) * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  // s5: hızlanma — Ay toplanıyor
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    const cool = smoothstep(0, 1, local);
    const eCol = ["#d85a28", "#8a4a30", "#3a4a6a", "#2a3a5a"][Math.min(3, Math.floor(cool * 3.4))];
    const hiCol = ["#ffa050", "#c08050", "#7a9ac8", "#6a8ab8"][Math.min(3, Math.floor(cool * 3.4))];
    drawSphere(ctx, cx, cy, w * 0.11, eCol, hiCol, "#1a0a08", "rgba(120,160,220,0.2)");
    // Halkadan Ay'a
    const moonAng = t * 1.1 - Math.PI * 0.7;
    const moonR = w * 0.3;
    const mx = cx + Math.cos(moonAng) * moonR;
    const my = cy + Math.sin(moonAng) * moonR * 0.24;
    orbitEllipse(ctx, cx, cy, moonR, 0.24, "#c8c0b0", 0.2);
    for (let i = 0; i < 50; i++) {
      const gather = smoothstep(0, 1, clamp01((local - rand(i) * 0.5) / 0.45));
      const ang = rand(i * 9) * Math.PI * 2 + t * 1.1;
      const rr = lerp(moonR * (0.75 + rand(i * 3) * 0.4), moonR, gather);
      const px = cx + Math.cos(ang) * rr;
      const py = cy + Math.sin(ang) * rr * 0.24;
      ctx.globalAlpha = 0.9 * (1 - gather * 0.92);
      ctx.fillStyle = "#c8b8a0";
      ctx.beginPath();
      ctx.arc(px, py, 1 + rand(i) * 2 * (1 - gather * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    drawSphere(ctx, mx, my, w * 0.035 * cool, "#b8b0a4", "#e8e0d4", "#5a5248");
  },
  // s6: bugün
  (c) => {
    const { ctx, w, h, t } = c;
    const cx = w / 2;
    const cy = h / 2;
    const R = w * 0.11;
    drawSphere(ctx, cx, cy, R, "#2a4a7a", "#5a8ac8", "#0a1428", "rgba(100,160,230,0.25)");
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "rgba(90,150,90,0.8)";
    ctx.beginPath();
    ctx.ellipse(cx - R * 0.3, cy - R * 0.2, R * 0.42, R * 0.26, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + R * 0.35, cy + R * 0.3, R * 0.3, R * 0.18, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    const orbitR = w * 0.4;
    const mang = t * 0.5 - Math.PI * 0.7;
    const mx = cx + Math.cos(mang) * orbitR;
    const my = cy + Math.sin(mang) * orbitR * 0.26;
    orbitEllipse(ctx, cx, cy, orbitR, 0.26, "#c8c4bc", 0.22);
    drawSphere(ctx, mx, my, R * 0.27, "#b8b0a4", "#e8e0d4", "#5a5248");
  },
];

/* 4) Okyanusların doğusu ----------------------------------------------------- */


/* 5) Yaşamın doğuşu ----------------------------------------------------------- */
function lifeBase(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, skyBlue: number) {
  const horizon = h * 0.4;
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  const r = lerp(70, 100, skyBlue);
  const g = lerp(70, 150, skyBlue);
  const b = lerp(120, 200, skyBlue);
  sky.addColorStop(0, `rgb(${r},${g},${b})`);
  sky.addColorStop(1, `rgb(${r + 40},${g + 30},${b + 20})`);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizon);
  const sea = ctx.createLinearGradient(0, horizon, 0, h);
  sea.addColorStop(0, "#155a70");
  sea.addColorStop(1, "#04202e");
  ctx.fillStyle = sea;
  ctx.fillRect(0, horizon, w, h - horizon);
  ctx.strokeStyle = "rgba(180,220,240,0.45)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  for (let x = 0; x <= w; x += 10) {
    ctx.lineTo(x, horizon + Math.sin(x * 0.05 + t * 2) * 2.4);
  }
  ctx.stroke();
  return horizon;
}

const lifeBirth: StageDrawer[] = [
  (c) => {
    const { ctx, w, h, t, local } = c;
    const horizon = lifeBase(ctx, w, h, t, 0);
    // Şimşek
    if (Math.sin(t * 2.3) > 0.9 || (local < 0.05 && rand(Math.floor(t * 30)) > 0.5)) {
      let lx = w * (0.15 + rand(Math.floor(t * 7)) * 0.7);
      let ly = 0;
      ctx.strokeStyle = "rgba(255,255,225,0.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      for (let i = 0; i < 5; i++) {
        lx += (rand(i + Math.floor(t * 20)) - 0.5) * 26;
        ly += horizon / 5;
        ctx.lineTo(lx, ly);
      }
      ctx.stroke();
      const g = ctx.createRadialGradient(lx, horizon, 0, lx, horizon, 50);
      g.addColorStop(0, "rgba(255,255,220,0.8)");
      g.addColorStop(1, "rgba(255,220,120,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(lx, horizon, 50, 0, Math.PI * 2);
      ctx.fill();
    }
    // Organik benekler
    for (let i = 0; i < 40; i++) {
      const px = (rand(i) + Math.sin(t * 0.2 + i) * 0.02) * w;
      const py = horizon + rand(i * 3) * (h - horizon);
      ctx.fillStyle = rand(i * 7) > 0.5 ? "rgba(150,205,160,0.7)" : "rgba(205,190,140,0.7)";
      ctx.beginPath();
      ctx.arc(px, py, 1 + rand(i) * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  (c) => {
    const { ctx, w, h, t } = c;
    const horizon = lifeBase(ctx, w, h, t, 0);
    const vx = w * 0.68;
    const vy = h - 12;
    ctx.fillStyle = "#3a3028";
    ctx.beginPath();
    ctx.moveTo(vx - 28, vy);
    ctx.lineTo(vx - 9, vy - 70);
    ctx.lineTo(vx + 9, vy - 70);
    ctx.lineTo(vx + 28, vy);
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i < 8; i++) {
      const ph = (t * 0.4 + i / 8) % 1;
      ctx.fillStyle = `rgba(150,150,160,${(1 - ph) * 0.55})`;
      ctx.beginPath();
      ctx.arc(vx + Math.sin(ph * 8 + i) * 11, vy - 70 - ph * 64, 3 + ph * 8, 0, Math.PI * 2);
      ctx.fill();
    }
    // Mineral gözenekli hücre baloncukları
    for (let i = 0; i < 26; i++) {
      const ph = (rand(i) + t * (0.05 + rand(i * 3) * 0.06)) % 1;
      const px = vx - 70 + rand(i * 7) * 130 + Math.sin(t + i) * 8;
      const py = h - ph * (h - horizon - 8);
      ctx.strokeStyle = "rgba(180,240,200,0.85)";
      ctx.fillStyle = "rgba(120,220,150,0.28)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(px, py, 2.2 + rand(i) * 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  },
  (c) => {
    const { ctx, w, h, t } = c;
    const horizon = lifeBase(ctx, w, h, t, 0.15);
    for (let i = 0; i < 16; i++) {
      const px = (rand(i) + Math.sin(t * 0.3 + i * 2) * 0.04) * w;
      const py = horizon + 20 + rand(i * 3) * (h - horizon - 40) + Math.sin(t * 0.8 + i) * 6;
      const r = 4 + rand(i) * 7;
      ctx.strokeStyle = "rgba(190,245,210,0.9)";
      ctx.fillStyle = "rgba(110,215,150,0.3)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // İç yaprak (kalıtım)
      ctx.fillStyle = "rgba(230,255,240,0.7)";
      ctx.beginPath();
      ctx.ellipse(px + Math.sin(t + i) * 2, py, r * 0.32, r * 0.55, t * 0.4 + i, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  (c) => {
    const { ctx, w, h, t, local } = c;
    const horizon = lifeBase(ctx, w, h, t, smoothstep(0, 1, local));
    // Siyanobakteri yastıkları
    for (let i = 0; i < 6; i++) {
      const bx = w * (0.1 + i * 0.15);
      const by = h - 12;
      ctx.fillStyle = "rgba(35,135,75,0.85)";
      ctx.beginPath();
      ctx.ellipse(bx, by, 24 + (i % 2) * 9, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(90,200,120,0.6)";
      ctx.beginPath();
      ctx.ellipse(bx - 7, by - 6, 11, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Yükselen O₂
    for (let i = 0; i < 34; i++) {
      const ph = (rand(i) + t * (0.07 + rand(i * 3) * 0.07)) % 1;
      const px = rand(i * 7) * w;
      const py = h - ph * (h - horizon);
      ctx.fillStyle = `rgba(205,242,255,${0.75 * (1 - ph * 0.4)})`;
      ctx.beginPath();
      ctx.arc(px, py, 1.4 + rand(i) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  (c) => {
    const { ctx, w, h, t } = c;
    const horizon = lifeBase(ctx, w, h, t, 1);
    for (let i = 0; i < 8; i++) {
      const px = (rand(i) + Math.sin(t * 0.25 + i * 1.7) * 0.05) * w;
      const py = horizon + (0.25 + rand(i * 3) * 0.55) * (h - horizon) + Math.sin(t * 0.7 + i) * 8;
      const jr = 9 + rand(i) * 9;
      const glow = 0.65 + Math.sin(t * 2 + i) * 0.2;
      ctx.fillStyle = `rgba(${rand(i * 5) > 0.5 ? "225,160,220" : "150,200,245"},${glow})`;
      ctx.beginPath();
      ctx.arc(px, py, jr, Math.PI, 0);
      ctx.quadraticCurveTo(px + jr, py + jr * 0.5, px, py + jr * 0.9);
      ctx.quadraticCurveTo(px - jr, py + jr * 0.5, px - jr, py);
      ctx.fill();
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 1.2;
      for (let k = -2; k <= 2; k++) {
        ctx.beginPath();
        ctx.moveTo(px + k * jr * 0.34, py + jr * 0.8);
        ctx.quadraticCurveTo(px + k * jr * 0.4 + Math.sin(t * 2 + k + i) * 4, py + jr * 1.4, px + k * jr * 0.45, py + jr * 2);
        ctx.stroke();
      }
    }
  },
  (c) => {
    const { ctx, w, h, t } = c;
    const horizon = lifeBase(ctx, w, h, t, 1);
    for (let i = 0; i < 9; i++) {
      const px = (rand(i) + Math.sin(t * (0.18 + rand(i) * 0.2) + i) * 0.05) * w;
      const py = horizon + (0.2 + (i / 9) * 0.6) * (h - horizon) + Math.sin(t * 0.7 + i * 2) * 6;
      const s = 6 + rand(i) * 8;
      const cols = ["#e0a060", "#8fd0a0", "#d08fd0", "#8fb8e0", "#e0d080"];
      ctx.fillStyle = cols[i % cols.length];
      if (i % 3 === 0) {
        ctx.beginPath();
        ctx.ellipse(px, py, s, s * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1a2028";
        ctx.beginPath();
        ctx.ellipse(px - s * 0.55, py, s * 0.24, s * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (i % 3 === 1) {
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.quadraticCurveTo(px + s, py - s, px + s * 2, py);
        ctx.quadraticCurveTo(px + s, py + s * 0.4, px, py);
        ctx.fill();
      } else {
        ctx.strokeStyle = ctx.fillStyle as string;
        ctx.lineWidth = 2;
        for (let k = -1; k <= 1; k++) {
          ctx.beginPath();
          ctx.moveTo(px, py + s);
          ctx.quadraticCurveTo(px + k * s * 0.5 + Math.sin(t * 1.5 + k + i) * 5, py, px + k * s * 0.3, py - s);
          ctx.stroke();
        }
      }
    }
  },
];

/* 6) Satürn'ün halkaları ------------------------------------------------------- */
function drawRingBand(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rIn: number,
  rOut: number,
  squash: number,
  t: number,
  density: number,
  seed: number,
  alpha: number
) {
  for (let i = 0; i < density; i++) {
    const f = rand(seed + i);
    const rr = lerp(rIn, rOut, f);
    const ang = rand(seed + i * 3) * Math.PI * 2 + t * (0.9 / Math.sqrt(rr / (rOut * 0.55)));
    const px = cx + Math.cos(ang) * rr;
    const py = cy + Math.sin(ang) * rr * squash;
    const sz = 0.7 + rand(seed + i * 7) * 1.7;
    ctx.fillStyle = rand(seed + i * 11) > 0.3
      ? `rgba(235,226,205,${alpha * (0.4 + f * 0.5)})`
      : `rgba(190,180,160,${alpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(px, py, sz, 0, Math.PI * 2);
    ctx.fill();
  }
}

const saturnRings: StageDrawer[] = [
  (c) => {
    const { ctx, w, h, t } = c;
    const cx = w / 2;
    const cy = h / 2;
    drawSphere(ctx, cx, cy, w * 0.16, "#d8b878", "#f0dca8", "#6a4a20");
    orbitEllipse(ctx, cx, cy, w * 0.34, 0.28, "#c8c0a8", 0.18);
    const ang = t * 0.5;
    drawShard(ctx, cx + Math.cos(ang) * w * 0.34, cy + Math.sin(ang) * w * 0.34 * 0.28, 7, t, true, 1);
  },
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    drawSphere(ctx, cx, cy, w * 0.16, "#d8b878", "#f0dca8", "#6a4a20");
    // İçeri spiral çakan buz uydu: Roche'a yaklaşırken uzar
    const rr = lerp(0.4, 0.24, smoothstep(0, 1, local)) * w;
    const ang = t * 0.8;
    const px = cx + Math.cos(ang) * rr;
    const py = cy + Math.sin(ang) * rr * 0.26;
    orbitEllipse(ctx, cx, cy, rr, 0.26, "#bfe4f8", 0.25);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.atan2(cy - py, cx - px));
    ctx.scale(1.35, 0.78);
    drawShard(ctx, 0, 0, 9, t * 0.6, true, 1);
    ctx.restore();
    // Gelgit ısısı parıltısı
    ctx.globalAlpha = local * 0.5;
    const g = ctx.createRadialGradient(px, py, 0, px, py, 26);
    g.addColorStop(0, "rgba(255,220,160,0.8)");
    g.addColorStop(1, "rgba(255,160,60,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px, py, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  },
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    drawSphere(ctx, cx, cy, w * 0.16, "#d8b878", "#f0dca8", "#6a4a20");
    drawBurst(ctx, cx + w * 0.23, cy - 4, clamp01(local * 1.1), 555, true, 1.5);
    // İlk enkaz yayı
    for (let i = 0; i < 40; i++) {
      const a = rand(i) * Math.PI * 2;
      const sp = rand(i * 3) * 0.1 + 0.16;
      const dist = w * sp * clamp01(local * 1.3);
      ctx.fillStyle = `rgba(230,240,250,${1 - clamp01(local * 1.2)})`;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * dist * 1.2, cy + Math.sin(a) * dist * 0.3, 1 + rand(i) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    drawSphere(ctx, cx, cy, w * 0.15, "#d8b878", "#f0dca8", "#6a4a20");
    const rIn = w * 0.2;
    const rOut = w * (0.24 + smoothstep(0, 1, local) * 0.14);
    drawRingBand(ctx, cx, cy, rIn, rOut, 0.26, t, Math.floor(200 + local * 300), 31, 0.9);
  },
  (c) => {
    const { ctx, w, h, t } = c;
    const cx = w / 2;
    const cy = h / 2;
    drawSphere(ctx, cx, cy, w * 0.15, "#d8b878", "#f0dca8", "#6a4a20");
    drawRingBand(ctx, cx, cy, w * 0.2, w * 0.36, 0.26, t, 430, 31, 0.9);
    // Cassini boşluğu: iki çoban uydu arası temiz bölge
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.285, w * 0.285 * 0.26, 0, 0, Math.PI * 2);
    ctx.lineWidth = 7;
    ctx.strokeStyle = "rgba(0,0,0,0.9)";
    ctx.stroke();
    ctx.restore();
    // Çobanlar
    for (const [rr, sp] of [
      [w * 0.26, 0.6],
      [w * 0.31, 0.48],
    ] as const) {
      const ang = t * sp;
      const px = cx + Math.cos(ang) * rr;
      const py = cy + Math.sin(ang) * rr * 0.26;
      drawShard(ctx, px, py, 4.4, t * 0.5, false, 1);
    }
  },
  (c) => {
    const { ctx, w, h, t } = c;
    const cx = w / 2;
    const cy = h / 2;
    const tilt = -0.32;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);
    // Halka arka yarısı
    drawRingBand(ctx, 0, 0, w * 0.2, w * 0.38, 0.24, t, 460, 31, 0.85);
    ctx.restore();
    drawSphere(ctx, cx, cy, w * 0.15, "#d8b878", "#f0dca8", "#6a4a20");
    // Gezegen gölgesi halka üstünde
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);
    ctx.fillStyle = "rgba(0,0,0,0.42)";
    ctx.beginPath();
    ctx.ellipse(-w * 0.24, 0, w * 0.075, w * 0.38 * 0.24 * 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);
    drawRingBand(ctx, 0, 0, w * 0.2, w * 0.38, 0.24, t, 240, 77, 0.85);
    ctx.restore();
  },
];

/* 7) Mars'ın kaderi ------------------------------------------------------------- */


/* 8) Jüpiter'in doğuşu ------------------------------------------------------------ */
const jupiterBirth: StageDrawer[] = [
  (c) => {
    const { ctx, w, h, t } = c;
    const cx = w / 2;
    const cy = h / 2;
    // Kaya-buz çekirdeği + yağan pebbles
    drawSphere(ctx, cx, cy, 14 + Math.sin(t * 2) * 1, "#8a7868", "#c8b8a0", "#3a3028");
    for (let i = 0; i < 30; i++) {
      const ph = (rand(i) + t * 0.25) % 1;
      const a = rand(i * 3) * Math.PI * 2;
      const rr = (0.3 - ph * 0.24) * w;
      drawShard(ctx, cx + Math.cos(a + t * 0.3) * rr, cy + Math.sin(a + t * 0.3) * rr * 0.4, 2 + rand(i) * 2.4, t + i, true, 0.95);
    }
  },
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    const grow = smoothstep(0, 1, local);
    // Swirling gaz zarfı
    for (let i = 0; i < 60; i++) {
      const rr = (0.06 + rand(i) * 0.2) * (1 - grow * 0.35);
      const ang = rand(i * 5) * Math.PI * 2 + t * (2 - rand(i * 3));
      const px = cx + Math.cos(ang) * rr * w;
      const py = cy + Math.sin(ang) * rr * w * 0.4;
      ctx.fillStyle = `rgba(215,190,150,${0.4 + rand(i) * 0.3})`;
      ctx.beginPath();
      ctx.arc(px, py, 1 + rand(i * 7) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    drawSphere(ctx, cx, cy, w * (0.06 + grow * 0.12), "#c89868", "#f0d8a8", "#5a3a18", "rgba(255,210,140,0.25)");
    // Disk boşluğu (yıldız dışı)
    orbitEllipse(ctx, cx, cy, w * 0.4, 0.3, "#d8c8a8", 0.14);
  },
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    // İçeri göç: gezegen yaya boyunca merkeze yaklaşır
    const prog = smoothstep(0, 1, local);
    const px = lerp(w * 0.78, w * 0.3, prog);
    // Disk + gezegenin açtığı boşluk
    for (let i = 0; i < 130; i++) {
      const rr = 0.08 + rand(i) * 0.4;
      if (Math.abs(rr - 0.34) < 0.035 * (0.4 + prog)) continue; // boşluk
      const ang = rand(i * 7) * Math.PI * 2 + t * (1.6 - rr * 2.4);
      ctx.fillStyle = "rgba(205,190,160,0.75)";
      ctx.beginPath();
      ctx.arc(cx + Math.cos(ang) * rr * w, cy + Math.sin(ang) * rr * w * 0.28, 0.9 + rand(i) * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    drawSphere(ctx, px, cy, w * (0.05 + prog * 0.04), "#c89868", "#f0d8a8", "#5a3a18", "rgba(255,210,140,0.3)");
    // Gidiş izi
    ctx.strokeStyle = "rgba(255,210,150,0.35)";
    ctx.setLineDash([5, 7]);
    ctx.beginPath();
    ctx.moveTo(w * 0.88, cy);
    ctx.quadraticCurveTo(w * 0.8, cy + 14, px + 22, cy);
    ctx.stroke();
    ctx.setLineDash([]);
  },
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    // Jüpiter + Satürn dışarı birlikte kayar (2:1 rezonans)
    const back = smoothstep(0, 1, local);
    const jr = lerp(0.16, 0.3, back) * w;
    const sr = jr * 2;
    orbitEllipse(ctx, cx, cy, jr, 0.28, "#d8b878", 0.2);
    orbitEllipse(ctx, cx, cy, sr, 0.28, "#e0d0a0", 0.16);
    const ja = t * 0.9;
    const sa = ja / 2 + Math.PI; // 2:1 rezonans
    drawSphere(ctx, cx + Math.cos(ja) * jr, cy + Math.sin(ja) * jr * 0.28, w * 0.055, "#c89868", "#f0d8a8", "#5a3a18");
    drawSphere(ctx, cx + Math.cos(sa) * sr, cy + Math.sin(sa) * sr * 0.28, w * 0.048, "#d8c088", "#f4e4b8", "#6a5228");
    // Rezonans bağı
    ctx.strokeStyle = `rgba(255,220,160,${0.25 + Math.sin(t * 3) * 0.1})`;
    ctx.setLineDash([2, 5]);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ja) * jr, cy + Math.sin(ja) * jr * 0.28);
    ctx.lineTo(cx + Math.cos(sa) * sr, cy + Math.sin(sa) * sr * 0.28);
    ctx.stroke();
    ctx.setLineDash([]);
  },
  (c) => {
    const { ctx, w, h, t } = c;
    const cx = w / 2;
    const cy = h / 2;
    const R = w * 0.16;
    drawSphere(ctx, cx, cy, R, "#c89868", "#f0d8a8", "#5a3a18", "rgba(255,210,140,0.2)");
    // Bantlar
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = i % 2 ? "rgba(140,90,50,0.42)" : "rgba(240,220,180,0.3)";
      const yy = cy - R + (i / 6) * R * 2 + Math.sin(t * 0.5 + i) * 2;
      ctx.fillRect(cx - R, yy, R * 2, R * 0.22);
    }
    // Büyük Kırmızı Leke
    ctx.fillStyle = "rgba(200,80,40,0.9)";
    ctx.beginPath();
    ctx.ellipse(cx + R * 0.3, cy + R * 0.28 + Math.sin(t * 0.8) * 2, R * 0.2, R * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Galilei uyduları
    const moons: Array<[number, number, string]> = [
      [0.26, 2.4, "#e8d070"],
      [0.32, 1.9, "#e8f0f4"],
      [0.4, 1.4, "#b8a890"],
      [0.48, 1.0, "#989090"],
    ];
    for (const [rr, sp, col] of moons) {
      const a = t * sp * 0.6 + rr * 12;
      const px = cx + Math.cos(a) * rr * w;
      const py = cy + Math.sin(a) * rr * w * 0.3;
      orbitEllipse(ctx, cx, cy, rr * w, 0.3, col, 0.1);
      drawSphere(ctx, px, py, 2.6, col, "#fff", "#333");
    }
  },
];

/* 9) Güneş'in ölümü ------------------------------------------------------------------ */


/* 10) Pangea ve tektonik -------------------------------------------------------------- */
type Cont = { x: number; y: number; r: number; c: string };

function drawContinent(ctx: CanvasRenderingContext2D, ct: Cont, seed: number, t: number) {
  ctx.save();
  ctx.translate(ct.x, ct.y);
  ctx.beginPath();
  const pts = 9;
  for (let i = 0; i < pts; i++) {
    const a = (i / pts) * Math.PI * 2 + Math.sin(t * 0.1 + seed) * 0.05;
    const rr = ct.r * (0.72 + rand(seed + i * 3.3) * 0.5);
    const px = Math.cos(a) * rr;
    const py = Math.sin(a) * rr * 0.72;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  const g = ctx.createLinearGradient(-ct.r, -ct.r, ct.r, ct.r);
  g.addColorStop(0, ct.c);
  g.addColorStop(1, "#5a7a3a");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "rgba(60,80,40,0.6)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
}

const CONT_COLORS = ["#7a9a4a", "#8aa050", "#6a8a42", "#90a858", "#7a9048", "#889848"];

const pangea: StageDrawer[] = [
  (c) => {
    const { ctx, w, h, t, local } = c;
    // Magma okyanusu + toplanan ilk kabuk plakaları
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#3a1408");
    bg.addColorStop(0.5, "#682208");
    bg.addColorStop(1, "#2a0c04");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(255,170,70,0.5)";
    for (let i = 0; i < 7; i++) {
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      const yy = (i / 7) * h + Math.sin(t * 0.4 + i) * 6;
      ctx.moveTo(0, yy);
      for (let x = 0; x <= w; x += 26) {
        ctx.lineTo(x, yy + Math.sin(x * 0.03 + t + i * 2) * 8);
      }
      ctx.stroke();
    }
    // Katılaşan plakalar
    const settle = smoothstep(0.15, 0.9, local);
    for (let i = 0; i < 8; i++) {
      const px = w * (0.12 + rand(i) * 0.76);
      const py = h * (0.15 + rand(i * 3) * 0.7);
      drawShard(ctx, px, py, 16 + rand(i * 7) * 22, rand(i * 9) * 3 + t * 0.02, false, settle);
      ctx.globalAlpha = settle * 0.5;
      drawContinent(ctx, { x: px, y: py, r: 14 + rand(i) * 10, c: CONT_COLORS[i % 6] }, i, t);
      ctx.globalAlpha = 1;
    }
  },
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    const gather = smoothstep(0, 0.8, local);
    const conts: Cont[] = [
      { x: cx - 90, y: cy - 40, r: 46, c: CONT_COLORS[0] },
      { x: cx + 80, y: cy - 60, r: 40, c: CONT_COLORS[1] },
      { x: cx + 60, y: cy + 60, r: 44, c: CONT_COLORS[2] },
      { x: cx - 70, y: cy + 70, r: 38, c: CONT_COLORS[3] },
    ].map((ct) => ({
      ...ct,
      x: lerp((ct.x / cx) * (cx + 120), ct.x, gather),
      y: lerp((ct.y / cy) * (cy + 80), ct.y, gather),
    }));
    ctx.strokeStyle = "rgba(80,140,180,0.4)";
    ctx.strokeRect(0, 0, w, h);
    conts.forEach((ct, i) => drawContinent(ctx, ct, i, t));
  },
  (c) => {
    const { ctx, w, h, t } = c;
    const cx = w / 2;
    const cy = h / 2;
    // Tek dev Pangea + Panthalassa
    ctx.fillStyle = "rgba(30,80,120,0.5)";
    ctx.fillRect(0, 0, w, h);
    const pangea: Cont = { x: cx, y: cy, r: w * 0.21, c: "#8aa050" };
    drawContinent(ctx, pangea, 5, t);
    // İç çöl vurgusu
    ctx.fillStyle = "rgba(200,170,90,0.5)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 6, w * 0.08, w * 0.05, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(210,225,240,0.7)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Panthalassa", w * 0.16, h * 0.2);
  },
  (c) => {
    const { ctx, w, h, t, local } = c;
    const cx = w / 2;
    const cy = h / 2;
    const split = smoothstep(0, 0.9, local);
    // Yarılan Pangea + açılan okyanus
    const oceanW = w * 0.34 * split;
    const og = ctx.createLinearGradient(cx - oceanW, 0, cx + oceanW, 0);
    og.addColorStop(0, "rgba(30,90,140,0)");
    og.addColorStop(0.5, "rgba(40,120,180,0.75)");
    og.addColorStop(1, "rgba(30,90,140,0)");
    ctx.fillStyle = og;
    ctx.fillRect(cx - oceanW, 0, oceanW * 2, h);
    const left: Cont = { x: cx - 90 * split - 20, y: cy - 10, r: w * 0.15, c: "#8aa050" };
    const right: Cont = { x: cx + 90 * split + 20, y: cy + 10, r: w * 0.14, c: "#7a9a4a" };
    drawContinent(ctx, left, 2, t);
    drawContinent(ctx, right, 7, t);
    // Rift volkanizması
    if (split > 0.1 && split < 0.95) {
      for (let i = 0; i < 5; i++) {
        const ph = (t * 0.5 + i / 5) % 1;
        ctx.fillStyle = `rgba(255,140,50,${(1 - ph) * 0.8})`;
        ctx.beginPath();
        ctx.arc(cx + Math.sin(i * 2.7) * 8, cy - 20 + i * 22 - ph * 14, 1.6 + ph * 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },
  (c) => {
    const { ctx, w, h, t, local } = c;
    // Hindistan Asya'ya çarpar: Himalaya yükselir
    const crash = smoothstep(0, 0.75, local);
    const inX = lerp(w * 0.22, w * 0.56, crash);
    drawContinent(ctx, { x: w * 0.68, y: h * 0.42, r: w * 0.17, c: "#8aa050" }, 4, t);
    drawContinent(ctx, { x: inX, y: h * 0.66, r: w * 0.09, c: "#a08a48" }, 8, t);
    // Yükselen sıradağlar
    if (crash > 0.55) {
      const mh = smoothstep(0.55, 1, crash);
      ctx.strokeStyle = `rgba(120,110,90,${0.9})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      const bx = w * 0.6;
      const by = h * 0.54;
      ctx.moveTo(bx - 40, by);
      ctx.lineTo(bx - 18, by - 26 * mh);
      ctx.lineTo(bx, by - 38 * mh);
      ctx.lineTo(bx + 16, by - 24 * mh);
      ctx.lineTo(bx + 38, by);
      ctx.stroke();
      // Çarpışma parıltısı
      ctx.fillStyle = `rgba(255,230,180,${(1 - mh) * 0.5})`;
      ctx.beginPath();
      ctx.arc(bx, by - 12, 18 * (1 - mh * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
  },
  (c) => {
    const { ctx, w, h, t } = c;
    const cx = w / 2;
    const cy = h / 2;
    // Bugünkü düzensiz dünya + hareket okları
    const now: Cont[] = [
      { x: cx - w * 0.22, y: cy - h * 0.14, r: w * 0.1, c: "#7a9a4a" },
      { x: cx + w * 0.1, y: cy - h * 0.2, r: w * 0.08, c: "#889848" },
      { x: cx + w * 0.26, y: cy + h * 0.06, r: w * 0.07, c: "#90a858" },
      { x: cx - w * 0.05, y: cy + h * 0.18, r: w * 0.09, c: "#6a8a42" },
      { x: cx - w * 0.3, y: cy + h * 0.1, r: w * 0.06, c: "#7a9048" },
    ];
    now.forEach((ct, i) => drawContinent(ctx, { ...ct, x: ct.x + Math.sin(t * 0.3 + i) * 3 }, i, t));
    // Oklar: sürüklenme yönleri
    ctx.strokeStyle = "rgba(255,200,90,0.75)";
    ctx.fillStyle = "rgba(255,200,90,0.75)";
    ctx.lineWidth = 1.6;
    const arrows: Array<[number, number, number, number]> = [
      [cx - w * 0.4, cy - h * 0.28, 12, -4],
      [cx + w * 0.38, cy - h * 0.3, -10, -6],
      [cx - w * 0.42, cy + h * 0.2, 10, 6],
    ];
    for (const [ax, ay, dx, dy] of arrows) {
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + dx, ay + dy);
      ctx.stroke();
      const ang = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.moveTo(ax + dx, ay + dy);
      ctx.lineTo(ax + dx - Math.cos(ang - 0.5) * 6, ay + dy - Math.sin(ang - 0.5) * 6);
      ctx.lineTo(ax + dx - Math.cos(ang + 0.5) * 6, ay + dy - Math.sin(ang + 0.5) * 6);
      ctx.closePath();
      ctx.fill();
    }
  },
];

/* ------------------------------- Sahne kaydı ------------------------------ */

const STAGE_DRAWERS: Record<string, StageDrawer[]> = {
  "gunesin-dogusu": sunBirth,
  "dunyanin-olusumu": earthForm,
  "buyuk-carpma": giantImpact,
  "okyanuslarin-dogusu": OCEAN_BIRTH_HD,
  "yasin-dogusu": lifeBirth,
  "saturnun-halkalari": saturnRings,
  "marsin-kaderi": MARS_FATE_HD,
  "jupiterin-dogusu": jupiterBirth,
  "gunesin-olumu": SUN_DEATH_HD,
  "pangea-tektonik": pangea,
};

/* ----------------------- Evrensel bölüm sahnesi --------------------------- */

/**
 * universalStageScene — özel sahne çizicisi olmayan bölümler için zengin,
 * deterministik, teori rengine boyanmış prosedürel sahne üretir.
 * 10 görsel arketip (nebula, çekirdek, yörünge sistemi, gezegen, dalgalar,
 * ağ, şok halkaları, katmanlar, sarmal, kozmik ağ) teori kimliğine ve bölüm
 * sırasına göre seçilir → her teori kendi görünüm dünyasına sahip olur.
 * KULLANIM AMACI: boş sahne / uyuşmayan sahne hatasını kökünden bitirmek.
 */
function universalStageScene(theory: TheoryDef, i: number): StageDrawer {
  // v4: sahne arketipi artık teorinin KATEGORİSİNDEN seçilir (mantık fix'i):
  // jeoloji → Dünya yüzeyi/manto, yasam → çorba/hücre/DNA, fizik → uzay-zaman...
  // Boş sahne / uyuşmayan uzay fonu hatası kökünden bitti.
  return hdCategoryScene(theory, i);
}

/* --------------------------------- Oynatıcı ------------------------------- */

export default function TheoryView({
  theory,
  onBack,
}: {
  theory: TheoryDef;
  onBack: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const prevPRef = useRef(0);
  const playingRef = useRef(true);
  const sfxRef = useRef<TheorySfx | null>(null);
  const [playing, setPlaying] = useState(true);
  const [sfxOn, setSfxOn] = useState(true);
  const [uiProgress, setUiProgress] = useState(0);

  const stars = useMemo(() => makeStars(120), []);
  const drawers = useMemo(() => {
    const custom = STAGE_DRAWERS[theory.id];
    // Her bölüm için: özel sahne varsa onu kullan (originMap ile orijinal
    // sıra korunur), yoksa evrensel prosedürel sahne çiz — BOŞ SAHNE ASLA.
    return theory.stages.map((_, i) => {
      const origin = theory.originMap ? theory.originMap[i] : i;
      return custom?.[origin] ?? universalStageScene(theory, i);
    });
  }, [theory]);

  const stageIdx = useMemo(() => {
    const s = theory.stages.findIndex((st) => uiProgress <= st.until - 1e-6);
    return s === -1 ? theory.stages.length - 1 : s;
  }, [theory, uiProgress]);

  // Animasyon döngüsü
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ses motorunu hazırla (kullanıcı oynat'a bastı)
    const sfx = new TheorySfx();
    void sfx.ensure();
    sfx.setVolume(sfxOn ? 0.85 : 0);
    sfxRef.current = sfx;

    let raf = 0;
    let last = performance.now();
    let uiAcc = 0;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(2, Math.floor(rect.width * dpr));
      canvas.height = Math.max(2, Math.floor(rect.height * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Aşama sınırı geçişinde tanım sesi (çarpışma vb. cue'lar zaten var)
    const fireCues = (from: number, to: number) => {
      if (!sfxOn) return;
      for (const cue of theory.cues) {
        if (from < to) {
          if (cue.t > from && cue.t <= to) sfx.play(cue.sfx, cue.power);
        } else {
          // döngü sarması
          if (cue.t > from || cue.t <= to) sfx.play(cue.sfx, cue.power);
        }
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (playingRef.current) {
        prevPRef.current = progressRef.current;
        progressRef.current += dt / theory.duration;
        if (progressRef.current >= 1) progressRef.current = 0;
        fireCues(prevPRef.current, progressRef.current);
      }
      const p = progressRef.current;
      const t = now / 1000;

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      drawSpaceBg(ctx, w, h, stars, t, p);

      renderStaged({ ctx, w, h, t, p }, theory, drawers);

      // Bilgi balonları (notes)
      ctx.font = "600 10px ui-sans-serif, system-ui, sans-serif";
      ctx.textBaseline = "middle";
      for (const note of theory.notes) {
        if (p < note.t0 || p > note.t1) continue;
        const fadeIn = smoothstep(note.t0, note.t0 + 0.014, p);
        const fadeOut = 1 - smoothstep(note.t1 - 0.014, note.t1, p);
        const a = Math.min(fadeIn, fadeOut);
        if (a <= 0.02) continue;
        const tw = ctx.measureText(note.text).width;
        const px = clamp01(note.x) * w;
        const py = clamp01(note.y) * h;
        const padX = 7;
        const boxW = tw + padX * 2;
        const boxH = 18;
        // Ekran dışına taşmasın
        const bx = Math.min(Math.max(4, px - boxW / 2), w - boxW - 4);
        ctx.globalAlpha = a * 0.85;
        ctx.fillStyle = "rgba(10,10,14,0.78)";
        ctx.strokeStyle = "rgba(251,191,36,0.5)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(bx, py - boxH / 2, boxW, boxH, 9);
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = a;
        ctx.fillStyle = "#fde68a";
        ctx.fillText(note.text, bx + padX, py);
        ctx.globalAlpha = 1;
      }

      uiAcc += dt;
      if (uiAcc > 0.16) {
        uiAcc = 0;
        setUiProgress(p);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      sfxRef.current?.dispose();
      sfxRef.current = null;
    };
  }, [theory, drawers, stars]);

  const toggle = useCallback(() => {
    if (!playingRef.current) void sfxRef.current?.ensure();
    playingRef.current = !playingRef.current;
    setPlaying(playingRef.current);
  }, []);

  const restart = useCallback(() => {
    progressRef.current = 0;
    prevPRef.current = 0;
    setUiProgress(0);
  }, []);

  const seek = useCallback((v: number) => {
    progressRef.current = v;
    prevPRef.current = v;
    setUiProgress(v);
  }, []);

  const toggleSfx = useCallback(() => {
    setSfxOn((s) => {
      sfxRef.current?.setVolume(s ? 0 : 0.85);
      return !s;
    });
  }, []);

  const stageStart = useCallback(
    (idx: number) => (idx === 0 ? 0 : theory.stages[idx - 1].until),
    [theory]
  );

  const fillPct = `${(uiProgress * 100).toFixed(1)}%`;
  const tickerText = useMemo(
    () => theory.ticker.join("   ·   ") + "   ·   ",
    [theory]
  );
  const activeStage: TheoryStage | undefined = theory.stages[stageIdx];

  return (
    <div
      className="pointer-events-auto flex max-h-[min(84vh,700px)] flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950/90 shadow-2xl shadow-black/60 backdrop-blur-md"
      role="dialog"
      aria-label={`${theory.title} animasyonu`}
    >
      {/* Üst bar */}
      <div className="flex items-center gap-2 p-3 pb-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={onBack}
          aria-label="Teori kitaplığına dön"
          className="h-7 w-7 shrink-0 text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Button>
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: theory.color, boxShadow: `0 0 8px ${theory.color}` }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold text-white">{theory.title}</h2>
          <p className="truncate text-[10px] text-zinc-500">{theory.subtitle}</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleSfx}
          aria-label={sfxOn ? "Ses efektlerini kapat" : "Ses efektlerini aç"}
          className="h-7 w-7 shrink-0 text-zinc-400 hover:bg-white/10 hover:text-amber-300"
        >
          {sfxOn ? (
            <Volume2 className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <VolumeX className="h-3.5 w-3.5" aria-hidden />
          )}
        </Button>
      </div>

      {/* Animasyon sahnesi */}
      <div
        ref={wrapRef}
        className="relative mx-3 aspect-[16/10] overflow-hidden rounded-lg border border-white/10"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-label={theory.title}
        />
        <div className="pointer-events-none absolute left-2 top-2 rounded-full border border-white/10 bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-amber-300 backdrop-blur-sm">
          {activeStage?.era}
        </div>
        <div className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 backdrop-blur-sm">
          {stageIdx + 1} / {theory.stages.length}
        </div>
      </div>

      {/* Kontroller */}
      <div className="px-3 pt-2">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            onClick={toggle}
            aria-label={playing ? "Animasyonu duraklat" : "Animasyonu oynat"}
            className="h-8 w-8 shrink-0 rounded-full bg-amber-500 text-zinc-950 hover:bg-amber-400"
          >
            {playing ? (
              <Pause className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Play className="h-3.5 w-3.5 translate-x-[1px]" aria-hidden />
            )}
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={restart}
            aria-label="Baştan oynat"
            className="h-8 w-8 shrink-0 border-white/15 bg-white/5 text-zinc-200 hover:bg-white/15 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          </Button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={uiProgress}
            onChange={(e) => seek(parseFloat(e.target.value))}
            aria-label="Zaman çizelgesi"
            className="theory-range h-1.5 flex-1"
            style={{ ["--fill" as string]: fillPct }}
          />
        </div>
      </div>

      {/* Aşama çipleri */}
      <div className="nice-scroll flex gap-1.5 overflow-x-auto px-3 pt-2">
        {theory.stages.map((st, i) => (
          <button
            key={i}
            onClick={() => seek(stageStart(i) + 0.001)}
            aria-label={`${st.title} aşamasına git`}
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[9.5px] font-semibold transition-colors ${
              i === stageIdx
                ? "border-amber-400/60 bg-amber-500/20 text-amber-300"
                : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
            }`}
          >
            {i + 1}. {st.title}
          </button>
        ))}
      </div>

      {/* Aşama açıklaması */}
      <div className="min-h-[64px] px-3 pt-2">
        <h3 className="text-xs font-bold text-amber-300">{activeStage?.title}</h3>
        <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-300">
          {activeStage?.text}
        </p>
      </div>

      {/* Akan bilgi şeridi */}
      <div className="mt-auto border-t border-white/10 bg-black/40 py-1.5">
        <div className="relative overflow-hidden">
          <div className="ticker-track px-0 text-[10px] text-zinc-400">
            <span className="pe-8">{tickerText}</span>
            <span className="pe-8" aria-hidden>
              {tickerText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
