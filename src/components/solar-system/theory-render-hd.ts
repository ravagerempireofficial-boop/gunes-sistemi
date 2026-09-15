import type { StageCtx, StageDrawer } from "./theory-kit";
import { clamp01, lerp, rand, smoothstep } from "./theory-kit";
import type { TheoryDef } from "@/lib/theories";

/**
 * theory-render-hd — TEORİ ANİMASYONLARI İÇİN HD GRAFİK MOTORU (v4).
 *
 * · Prosedürel fBm doku fabrikası (gezegen yüzeyi, kraterler, okyanus,
 *   bulutlar) — bir kez üretilir, önbelleğe alınır (FPS dostu).
 * · drawPlanetHD: dokulu gezegen — dönme, gündüz/gece terminatörü, su
 *   parıltısı, bulut gölgeleri, limb kararması, atmosfer halkası.
 * · MARS_FATE_HD: "Mars'ın kaderi" sinematik yeniden yazım — genç Mars'ın
 *   okyanusları ve bulutları → manyetosfer sönümü → güneş rüzgârı süpürmesi
 *   → soğuk çöl → Dünya-Mars karşılaştırma dersi.
 * · hdCategoryScene: kategoriye UYGUN evrensel sahneler (mantık hatası fix'i:
 *   jeoloji sahnesi uzayda değil Dünya yüzeyinde/mantoda, yaşam sahnesi ilkin
 *   çorba/hücrelerde, fizik uzay-zaman dokusunda...).
 */

/* ============================== DOKU ÖNBELLEĞİ ============================ */

const texCache = new Map<string, HTMLCanvasElement>();

function getTex(
  key: string,
  w: number,
  h: number,
  paint: (c: CanvasRenderingContext2D) => void
): HTMLCanvasElement {
  const hit = texCache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c = cv.getContext("2d");
  if (!c) throw new Error("2d yok");
  paint(c);
  if (texCache.size > 48) {
    const oldest = texCache.keys().next().value;
    if (oldest) texCache.delete(oldest);
  }
  texCache.set(key, cv);
  return cv;
}

/* ============================ fBm DEĞER GÜRÜLTÜSÜ ========================= */

function h2(x: number, y: number, s: number) {
  const n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return n - Math.floor(n);
}
function vnoise(x: number, y: number, s: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  return lerp(
    lerp(h2(xi, yi, s), h2(xi + 1, yi, s), u),
    lerp(h2(xi, yi + 1, s), h2(xi + 1, yi + 1, s), u),
    v
  );
}
function fbm(x: number, y: number, s: number, oct = 4) {
  let a = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    a += amp * vnoise(x * f, y * f, s + i * 13.7);
    amp *= 0.5;
    f *= 2;
  }
  return a;
}

/* =========================== GEZEGEN DOKULARI ============================= */

type RGB = [number, number, number];
const mix3 = (a: RGB, b: RGB, t: number): RGB => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];
const css = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

export interface PlanetTexOpts {
  key: string;
  seed: number;
  size?: number;
  /** arazi paleti (koyu→açık) */
  low: RGB;
  mid: RGB;
  high: RGB;
  peak?: RGB;
  /** okyanus: n < level alanlar su olur (yüzey dokusuna gömülür) */
  water?: { level: number; deep: RGB; shallow: RGB };
  craters?: number;
  caps?: { from: number; color: RGB };
  /** Marineris benzeri kanyon */
  canyon?: boolean;
  /** lav çatlakları (magma gezegen) */
  lava?: boolean;
}

/** Equirectangular (2:1) kaynaksız gezegen dokusu — fBm arazi + su + krater. */
export function planetTexture(o: PlanetTexOpts): HTMLCanvasElement {
  const W = o.size ?? 512;
  const H = W / 2;
  return getTex(`pt:${o.key}:${W}`, W, H, (c) => {
    const img = c.createImageData(W, H);
    const d = img.data;
    for (let y = 0; y < H; y++) {
      const v = y / H;
      const lat = Math.abs(v - 0.5) * 2; // 0 ekvator → 1 kutup
      for (let x = 0; x < W; x++) {
        const u = x / W;
        // kaynaksız döşeme: son %12'de iki kenarı harmanla
        const blend = u > 0.88 ? (u - 0.88) / 0.12 : 0;
        const nA = fbm(u * 6, v * 3, o.seed, 5);
        const nB = fbm((u - 1) * 6, v * 3, o.seed, 5);
        let n = lerp(nA, nB, blend);
        n = clamp01(n * 1.18 - lat * 0.06); // kutuplarda hafif sadeleşme

        let col: RGB;
        if (n < 0.42) col = mix3(o.low, o.mid, n / 0.42);
        else if (n < 0.72) col = mix3(o.mid, o.high, (n - 0.42) / 0.3);
        else col = mix3(o.high, o.peak ?? o.high, (n - 0.72) / 0.28);

        if (o.water) {
          const wN = fbm(u * 7 + 40, v * 3.5 + 9, o.seed + 31, 4);
          const lvl = o.water.level;
          if (wN < lvl - 0.02) {
            const depth = clamp01((lvl - wN) / 0.22);
            col = mix3(o.water.shallow, o.water.deep, Math.min(1, depth * 1.15));
          } else if (wN < lvl) {
            col = mix3(col, o.water.shallow, 0.35); // sahil sığlığı
          }
        }
        const i = (y * W + x) * 4;
        d[i] = col[0];
        d[i + 1] = col[1];
        d[i + 2] = col[2];
        d[i + 3] = 255;
      }
    }
    c.putImageData(img, 0, 0);

    // lav çatlakları: parlak damar ağı
    if (o.lava) {
      c.globalCompositeOperation = "lighter";
      for (let i = 0; i < 26; i++) {
        const y0 = h2(i, 3, o.seed) * H;
        c.strokeStyle = `rgba(255,${120 + h2(i, 7, o.seed) * 90 | 0},40,${0.5 + h2(i, 11, o.seed) * 0.4})`;
        c.lineWidth = 1 + h2(i, 13, o.seed) * 2.2;
        c.beginPath();
        c.moveTo(0, y0);
        for (let x = 0; x <= W; x += 16) {
          c.lineTo(x, y0 + Math.sin(x * 0.05 + i) * 9 + (fbm(x * 0.02, y0 * 0.02, o.seed) - 0.5) * 22);
        }
        c.stroke();
      }
      c.globalCompositeOperation = "source-over";
    }

    // kraterler
    if (o.craters) {
      for (let i = 0; i < o.craters; i++) {
        const cx = h2(i, 1, o.seed + 5) * W;
        const cy = (0.12 + h2(i, 2, o.seed + 5) * 0.76) * H;
        const r = 3 + h2(i, 4, o.seed + 5) * (W * 0.035);
        const g = c.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
        g.addColorStop(0, "rgba(255,240,220,0.28)");
        g.addColorStop(0.55, "rgba(0,0,0,0.06)");
        g.addColorStop(1, "rgba(20,10,5,0.4)");
        c.fillStyle = g;
        c.beginPath();
        c.arc(cx, cy, r, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "rgba(255,235,210,0.22)";
        c.lineWidth = 1;
        c.beginPath();
        c.arc(cx, cy, r, -2.6, 0.4);
        c.stroke();
      }
    }

    // kutup buzulları (gürültülü kenar)
    if (o.caps) {
      c.fillStyle = css(o.caps.color, 0.92);
      for (const top of [true, false]) {
        c.beginPath();
        for (let x = 0; x <= W; x += 8) {
          const edge =
            o.caps!.from * H +
            fbm(x * 0.02, top ? 1 : 9, o.seed + 77, 3) * H * 0.09;
          if (top) c.lineTo(x, edge);
          else c.lineTo(W - x, H - edge);
        }
        c.lineTo(W, top ? 0 : H);
        c.lineTo(0, top ? 0 : H);
        c.closePath();
        c.fill();
      }
    }

    // kanyon
    if (o.canyon) {
      c.strokeStyle = "rgba(40,16,8,0.55)";
      c.lineWidth = H * 0.035;
      c.beginPath();
      c.moveTo(W * 0.12, H * 0.52);
      c.quadraticCurveTo(W * 0.4, H * 0.46, W * 0.86, H * 0.55);
      c.stroke();
      c.strokeStyle = "rgba(255,140,60,0.2)";
      c.lineWidth = H * 0.012;
      c.stroke();
    }
  });
}

/** Bulut dokusu (şeffaf zemin + fBm kümeler). */
export function cloudTexture(key: string, seed: number, cover = 0.52, size = 512): HTMLCanvasElement {
  const W = size;
  const H = size / 2;
  return getTex(`cl:${key}:${W}:${cover.toFixed(2)}`, W, H, (c) => {
    const img = c.createImageData(W, H);
    const d = img.data;
    for (let y = 0; y < H; y++) {
      const v = y / H;
      for (let x = 0; x < W; x++) {
        const u = x / W;
        const blend = u > 0.88 ? (u - 0.88) / 0.12 : 0;
        const nA = fbm(u * 5, v * 4, seed, 5);
        const nB = fbm((u - 1) * 5, v * 4, seed, 5);
        const n = lerp(nA, nB, blend);
        const a = smoothstep(cover, cover + 0.22, n);
        const i = (y * W + x) * 4;
        d[i] = 255;
        d[i + 1] = 253;
        d[i + 2] = 248;
        d[i + 3] = (a * 235) | 0;
      }
    }
    c.putImageData(img, 0, 0);
  });
}

/* ============================ drawPlanetHD ================================ */

export interface PlanetHDOpts {
  cx: number;
  cy: number;
  r: number;
  tex: HTMLCanvasElement;
  /** 0-1 dönme fazı */
  rot?: number;
  /** ışık yönü (birim vektör; 1,0 = sağdan) */
  sun?: { x: number; y: number };
  /** su dokusu + seviye (0-1) */
  water?: { tex: HTMLCanvasElement; level: number };
  clouds?: { tex: HTMLCanvasElement; alpha: number; rot?: number; stretch?: number };
  atmo?: { color: string; alpha: number };
  /** karanlık taraf koyuluğu (0-1) */
  night?: number;
  /** yüzeye çekilecek ekstra (kliplenmiş): halka gölgesi, fırtına... */
  overlay?: (ctx: CanvasRenderingContext2D, r: number) => void;
}

function drawTexWrapped(
  ctx: CanvasRenderingContext2D,
  tex: HTMLCanvasElement,
  cx: number,
  cy: number,
  r: number,
  rot: number,
  alpha: number,
  stretch = 1,
  dy = 0
) {
  const S = tex.width;
  const H = tex.height;
  const destW = 2 * r * stretch;
  const destH = 2 * r;
  const sx = ((rot % 1) + 1) % 1 * S;
  const w1 = S - sx;
  ctx.globalAlpha = alpha;
  ctx.drawImage(tex, sx, 0, w1, H, cx - destW / 2, cy - destH / 2 + dy, destW * (w1 / S), destH);
  if (sx > 0)
    ctx.drawImage(
      tex,
      0,
      0,
      sx,
      H,
      cx - destW / 2 + destW * (w1 / S),
      cy - destH / 2 + dy,
      destW * (sx / S),
      destH
    );
  ctx.globalAlpha = 1;
}

/** Dokulu, dönen, ışıklandırmalı HD gezegen. */
export function drawPlanetHD(ctx: CanvasRenderingContext2D, o: PlanetHDOpts) {
  const { cx, cy, r } = o;
  const rot = ((o.rot ?? 0) % 1 + 1) % 1;
  const sun = o.sun ?? { x: 1, y: -0.25 };
  const night = o.night ?? 0.62;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  drawTexWrapped(ctx, o.tex, cx, cy, r, rot, 1);

  if (o.water && o.water.level > 0.01) {
    drawTexWrapped(ctx, o.water.tex, cx, cy, r, rot * 0.72, clamp01(o.water.level), 1.003);
    // su parıltısı: güneş tarafında kayan parlak bantlar
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 3; i++) {
      const yy = cy - r * 0.4 + i * r * 0.38 + Math.sin(Date.now() * 0.0012 + i * 2.1) * r * 0.05;
      const g = ctx.createLinearGradient(cx - r, yy, cx + r, yy);
      const a = 0.1 * o.water.level;
      g.addColorStop(0, "rgba(180,230,255,0)");
      g.addColorStop(0.5, `rgba(200,240,255,${a})`);
      g.addColorStop(1, "rgba(180,230,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(cx - r, yy - r * 0.035, r * 2, r * 0.07);
    }
    ctx.globalCompositeOperation = "source-over";
  }

  if (o.overlay) o.overlay(ctx, r);

  if (o.clouds && o.clouds.alpha > 0.01) {
    const cl = o.clouds;
    // bulut gölgeleri (yüzeyin üstünde, hafif kaydırılmış)
    ctx.globalCompositeOperation = "source-atop";
    ctx.filter = "brightness(0.25)";
    drawTexWrapped(ctx, cl.tex, cx - r * 0.045, cy + r * 0.035, r, (cl.rot ?? rot) + 0.012, cl.alpha * 0.5, cl.stretch ?? 1);
    ctx.filter = "none";
    ctx.globalCompositeOperation = "source-over";
    drawTexWrapped(ctx, cl.tex, cx, cy, r, cl.rot ?? rot, cl.alpha, cl.stretch ?? 1);
  }

  // limb kararması
  const limb = ctx.createRadialGradient(cx, cy, r * 0.52, cx, cy, r);
  limb.addColorStop(0, "rgba(0,0,0,0)");
  limb.addColorStop(0.82, "rgba(2,3,8,0.18)");
  limb.addColorStop(1, "rgba(2,3,8,0.6)");
  ctx.fillStyle = limb;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  // gündüz/gece terminatörü
  const mag = Math.hypot(sun.x, sun.y) || 1;
  const dx = sun.x / mag;
  const dy = sun.y / mag;
  const term = ctx.createLinearGradient(cx + dx * r, cy + dy * r, cx - dx * r, cy - dy * r);
  term.addColorStop(0, "rgba(255,250,235,0.12)");
  term.addColorStop(0.48, "rgba(0,0,0,0)");
  term.addColorStop(0.78, `rgba(0,0,6,${night * 0.55})`);
  term.addColorStop(1, `rgba(0,0,6,${night})`);
  ctx.fillStyle = term;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();

  // güneş tarafı kenar ışığı
  ctx.save();
  ctx.strokeStyle = "rgba(255,235,200,0.4)";
  ctx.lineWidth = Math.max(1, r * 0.02);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.995, Math.atan2(dy, dx) - 1.35, Math.atan2(dy, dx) + 1.35);
  ctx.stroke();
  ctx.restore();

  // atmosfer
  if (o.atmo && o.atmo.alpha > 0.02) {
    const a = o.atmo;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const glow = ctx.createRadialGradient(cx, cy, r * 0.96, cx, cy, r * 1.16);
    glow.addColorStop(0, a.color.replace("ALPHA", (a.alpha * 0.85).toFixed(3)));
    glow.addColorStop(1, a.color.replace("ALPHA", "0"));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/* ============================== KÜÇÜK EFEKTLER ============================ */

/** Güneş rüzgârı çizgileri + kaçan atmosfer parçacıkları. */
function solarWind(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cx: number,
  cy: number,
  R: number,
  t: number,
  strength: number
) {
  for (let i = 0; i < 18; i++) {
    const ph = (t * 0.75 + rand(i)) % 1;
    const px = -30 + ph * (cx + R + 30);
    const py = rand(i * 3) * h;
    const bend = Math.abs(py - cy) < R ? (py < cy ? -1 : 1) * Math.min(40, R * 0.4) : 0;
    ctx.strokeStyle = `rgba(255,226,150,${0.55 * strength * Math.sin(ph * Math.PI)})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + 34, py + bend * 0.4 + Math.sin(t * 3 + i) * 7, px + 70, py + bend + Math.sin(t * 2 + i) * 12);
    ctx.stroke();
  }
  for (let i = 0; i < 22; i++) {
    const ph = (rand(i * 7) + t * 0.35) % 1;
    const a = rand(i * 5) * Math.PI * 2;
    const px = cx + Math.cos(a) * (R + ph * R * 0.9);
    const py = cy + Math.sin(a) * (R + ph * R * 0.9);
    ctx.fillStyle = `rgba(255,185,120,${(1 - ph) * 0.75 * strength})`;
    ctx.beginPath();
    ctx.arc(px, py, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Manyetosfer kalkan halkaları. */
function magnetosphere(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  R: number,
  alpha: number,
  color = "150,215,255"
) {
  if (alpha <= 0.02) return;
  ctx.save();
  ctx.strokeStyle = `rgba(${color},${alpha * 0.55})`;
  for (const [s, lw] of [[1.45, 1.6], [1.9, 1.2], [2.45, 0.9]] as const) {
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.ellipse(cx, cy, R * s, R * s * 0.72, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // kuyruk: güneş tersi yönde açılan koni
  ctx.fillStyle = `rgba(${color},${alpha * 0.1})`;
  ctx.beginPath();
  ctx.moveTo(cx - R * 1.4, cy - R * 0.5);
  ctx.lineTo(cx - R * 5.2, cy - R * 1.7);
  ctx.lineTo(cx - R * 5.2, cy + R * 1.7);
  ctx.lineTo(cx - R * 1.4, cy + R * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Opayak uzay fonu (opak): kategorik sahneler için. */
function opaqueSpace(ctx: CanvasRenderingContext2D, w: number, h: number, c0: string, c1: string) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, c0);
  g.addColorStop(1, c1);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = `rgba(255,244,220,${0.05 + rand(i * 3) * 0.4})`;
    ctx.fillRect(rand(i) * w, rand(i * 7) * h, 1, 1);
  }
}

/** Yüzey ufkuna bakan sahne fonu (Dünya/Mars yüzeyi — "uzay değil" fix'i). */
function horizonBg(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  sky: [string, string, string],
  groundTex: HTMLCanvasElement,
  sunX = 0.72,
  sunA = 0.9
) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, sky[0]);
  g.addColorStop(0.55, sky[1]);
  g.addColorStop(1, sky[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // güneş
  const sx = w * sunX;
  const sy = h * 0.3;
  const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, h * 0.5);
  sg.addColorStop(0, `rgba(255,244,214,${sunA})`);
  sg.addColorStop(0.12, `rgba(255,214,140,${sunA * 0.75})`);
  sg.addColorStop(1, "rgba(255,190,110,0)");
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, w, h);
  // uzak tepeler
  ctx.fillStyle = "rgba(30,22,18,0.55)";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.62);
  for (let x = 0; x <= w; x += 24)
    ctx.lineTo(x, h * 0.62 - fbm(x * 0.004, 3.7, 7.1, 3) * h * 0.16);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  // zemin dokusu (kayan)
  const GH = h * 0.4;
  const off = (t * 6) % groundTex.width;
  ctx.drawImage(groundTex, off, 0, groundTex.width - off, groundTex.height, 0, h - GH, w * ((groundTex.width - off) / groundTex.width), GH);
  ctx.drawImage(groundTex, 0, 0, off, groundTex.height, w * ((groundTex.width - off) / groundTex.width), h - GH, w * (off / groundTex.width), GH);
  // ufuk pusu
  const hz = ctx.createLinearGradient(0, h - GH - h * 0.06, 0, h - GH + h * 0.05);
  hz.addColorStop(0, "rgba(255,214,160,0)");
  hz.addColorStop(0.5, "rgba(255,214,160,0.3)");
  hz.addColorStop(1, "rgba(255,214,160,0)");
  ctx.fillStyle = hz;
  ctx.fillRect(0, h - GH - h * 0.06, w, h * 0.11);
  ctx.fillStyle = "rgba(20,12,8,0.22)";
  ctx.fillRect(0, h - GH, w, GH);
}

/* ========================= MARS'IN KADERİ — HD ============================ */

const MARS_TEX = () =>
  planetTexture({
    key: "mars",
    seed: 4.2,
    size: 512,
    low: [96, 48, 28],
    mid: [166, 88, 50],
    high: [206, 122, 72],
    peak: [228, 158, 106],
    craters: 46,
    caps: { from: 0.075, color: [238, 244, 250] },
    canyon: true,
  });
const MARS_WATER = () =>
  cloudTexture("mars-water", 12.7, 0.5); // fBm alanı su maskesi olarak
const CLOUDS_A = () => cloudTexture("mars-clouds", 3.3, 0.55);
const EARTH_TEX = () =>
  planetTexture({
    key: "earth",
    seed: 9.1,
    size: 512,
    low: [52, 84, 44],
    mid: [88, 118, 52],
    high: [150, 138, 84],
    peak: [188, 176, 128],
    craters: 0,
    caps: { from: 0.06, color: [240, 248, 252] },
  });

export const MARS_FATE_HD: StageDrawer[] = [
  // s0: Genç Mars — okyanuslar, nehirler, yoğun bulutlar
  (c) => {
    const { ctx, w, h, t, alpha: A } = c;
    if (A <= 0.005) return;
    const cx = w / 2;
    const cy = h * 0.47;
    const R = Math.min(w, h) * 0.29;
    // genç Güneş solda parlar
    const sg = ctx.createRadialGradient(w * 0.08, h * 0.2, 0, w * 0.08, h * 0.2, w * 0.3);
    sg.addColorStop(0, "rgba(255,240,200,0.5)");
    sg.addColorStop(1, "rgba(255,200,120,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, w, h);
    drawPlanetHD(ctx, {
      cx,
      cy,
      r: R,
      tex: MARS_TEX(),
      rot: t * 0.012,
      sun: { x: -0.85, y: -0.3 },
      water: { tex: MARS_WATER(), level: 0.56 },
      clouds: { tex: CLOUDS_A(), alpha: 0.62, rot: t * 0.02 },
      atmo: { color: "rgba(255,178,132,ALPHA)", alpha: 0.5 },
      night: 0.55,
    });
    // iki minik uydu
    for (const [ph, rr] of [[t * 0.4, R * 1.5], [t * 0.27 + 2.4, R * 1.85]] as const) {
      const mx = cx + Math.cos(ph) * rr;
      const my = cy + Math.sin(ph) * rr * 0.3;
      ctx.fillStyle = "rgba(200,190,180,0.9)";
      ctx.beginPath();
      ctx.arc(mx, my, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  // s1: Jeodinamo sönüyor — kalkan zayıflar, çekirdek soğur
  (c) => {
    const { ctx, w, h, t, local, alpha: A } = c;
    if (A <= 0.005) return;
    const cx = w / 2;
    const cy = h * 0.47;
    const R = Math.min(w, h) * 0.26;
    const fade = 1 - smoothstep(0.05, 0.92, local);
    magnetosphere(ctx, cx, cy, R, 0.2 + fade * 0.8);
    drawPlanetHD(ctx, {
      cx,
      cy,
      r: R,
      tex: MARS_TEX(),
      rot: t * 0.011,
      sun: { x: -0.85, y: -0.3 },
      water: { tex: MARS_WATER(), level: 0.5 - local * 0.05 },
      clouds: { tex: CLOUDS_A(), alpha: 0.5, rot: t * 0.019 },
      atmo: { color: "rgba(255,178,132,ALPHA)", alpha: 0.44 },
      night: 0.58,
      overlay: (c2, r) => {
        // sönen çekirdek parıltısı
        const g = c2.createRadialGradient(0, 0, 0, 0, 0, r * 0.5);
        g.addColorStop(0, `rgba(255,200,90,${0.15 + fade * 0.5})`);
        g.addColorStop(1, "rgba(255,150,40,0)");
        c2.fillStyle = g;
        c2.fillRect(-r, -r, r * 2, r * 2);
        // kutup auroraları zayıflarken
        c2.strokeStyle = `rgba(160,230,200,${fade * 0.5})`;
        c2.lineWidth = 2;
        c2.beginPath();
        c2.ellipse(0, -r * 0.86, r * 0.4, r * 0.14, 0, 0, Math.PI * 2);
        c2.stroke();
        c2.beginPath();
        c2.ellipse(0, r * 0.86, r * 0.4, r * 0.14, 0, 0, Math.PI * 2);
        c2.stroke();
      },
    });
  },
  // s2: Rüzgâr süpürüyor — atmosfer ve bulutlar uzaya savrulur
  (c) => {
    const { ctx, w, h, t, local, alpha: A } = c;
    if (A <= 0.005) return;
    const cx = w / 2;
    const cy = h * 0.47;
    const R = Math.min(w, h) * 0.24;
    const strip = 1 - smoothstep(0, 0.9, local);
    solarWind(ctx, w, h, cx, cy, R, t, 0.35 + local * 0.65);
    drawPlanetHD(ctx, {
      cx,
      cy,
      r: R,
      tex: MARS_TEX(),
      rot: t * 0.011,
      sun: { x: -0.85, y: -0.3 },
      water: { tex: MARS_WATER(), level: 0.32 - local * 0.1 },
      clouds: {
        tex: CLOUDS_A(),
        alpha: strip * 0.4,
        rot: t * 0.026,
        stretch: 1 + (1 - strip) * 0.9,
      },
      atmo: { color: "rgba(255,170,120,ALPHA)", alpha: strip * 0.4 },
      night: 0.62,
      overlay: (c2, r) => {
        // açığa çıkan koyu deniz tabanı
        c2.fillStyle = `rgba(38,30,26,${local * 0.3})`;
        c2.fillRect(-r, -r, r * 2, r * 2);
      },
    });
    // kopan bulut şeritleri gezegenden uzaklaşıyor
    for (let i = 0; i < 9; i++) {
      const ph = (rand(i * 11) + t * 0.16) % 1;
      const yy = cy - R + rand(i * 3) * R * 2;
      ctx.strokeStyle = `rgba(250,246,240,${(1 - ph) * 0.5 * (1 - strip * 0.4)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx + R + ph * R * 0.2, yy);
      ctx.lineTo(cx + R + ph * R * 1.8, yy + (rand(i) - 0.5) * 12);
      ctx.stroke();
    }
  },
  // s3: Soğuk çöl — toz fırtınaları, buzul kutuplar
  (c) => {
    const { ctx, w, h, t, local, alpha: A } = c;
    if (A <= 0.005) return;
    const cx = w / 2;
    const cy = h * 0.47;
    const R = Math.min(w, h) * 0.27;
    const storm = 0.35 + Math.sin(t * 0.4) * 0.25 + local * 0.25;
    drawPlanetHD(ctx, {
      cx,
      cy,
      r: R,
      tex: MARS_TEX(),
      rot: t * 0.009,
      sun: { x: -0.85, y: -0.3 },
      water: { tex: MARS_WATER(), level: 0.06 },
      clouds: { tex: cloudTexture("mars-dust", 8.8, 0.62), alpha: storm * 0.5, rot: t * 0.03, stretch: 1.35 },
      atmo: { color: "rgba(255,150,100,ALPHA)", alpha: 0.14 },
      night: 0.68,
    });
    // gezegen üstü toz fırtınası sarmalı
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.strokeStyle = `rgba(230,160,100,${storm * 0.4})`;
    ctx.lineWidth = R * 0.09;
    ctx.beginPath();
    ctx.ellipse(cx, cy, R * 1.06, R * (0.3 + Math.sin(t * 0.5) * 0.1), Math.sin(t * 0.2) * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    // buzul katkıları
    ctx.fillStyle = "rgba(238,246,252,0.9)";
    ctx.beginPath();
    ctx.ellipse(cx, cy - R * 0.94, R * 0.42, R * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
  },
  // s4: Ders — kalkanlı Dünya vs çıplak Mars
  (c) => {
    const { ctx, w, h, t, alpha: A } = c;
    if (A <= 0.005) return;
    const R = Math.min(w, h) * 0.19;
    // Mars (sol, ölü)
    const mx = w * 0.3;
    const my = h * 0.52;
    solarWind(ctx, w, h, mx, my, R, t, 0.8);
    drawPlanetHD(ctx, {
      cx: mx,
      cy: my,
      r: R * 0.92,
      tex: MARS_TEX(),
      rot: t * 0.008,
      sun: { x: -0.8, y: -0.35 },
      water: { tex: MARS_WATER(), level: 0.04 },
      clouds: { tex: CLOUDS_A(), alpha: 0.06, rot: t * 0.02 },
      atmo: { color: "rgba(255,160,110,ALPHA)", alpha: 0.12 },
      night: 0.7,
    });
    // Dünya (sağ, korunuyor)
    const ex = w * 0.7;
    const ey = h * 0.48;
    magnetosphere(ctx, ex, ey, R, 0.95);
    drawPlanetHD(ctx, {
      cx: ex,
      cy: ey,
      r: R,
      tex: EARTH_TEX(),
      rot: t * 0.016,
      sun: { x: -0.8, y: -0.35 },
      water: { tex: MARS_WATER(), level: 0.6 },
      clouds: { tex: CLOUDS_A(), alpha: 0.58, rot: t * 0.024 },
      atmo: { color: "rgba(170,225,255,ALPHA)", alpha: 0.5 },
      night: 0.6,
    });
  },
];

/* ==================== PARAMETRİK GEZEGEN HİKÂYELERİ ======================= */

/** Magma→okyanus Dünya'sı (okyanusların doğusu / dünyanın oluşumu için). */
export function planetWaterStory(water: number, clouds: number, lavaCracks: boolean): StageDrawer {
  const tex = lavaCracks
    ? planetTexture({
        key: "magma",
        seed: 6.6,
        size: 384,
        low: [30, 16, 12],
        mid: [70, 34, 22],
        high: [110, 55, 30],
        lava: true,
      })
    : EARTH_TEX();
  const waterTex = cloudTexture("story-water", 12.7, 0.5);
  const cl = cloudTexture("story-clouds", 5.1, 0.55);
  return (c) => {
    const { ctx, w, h, t, alpha: A } = c;
    if (A <= 0.005) return;
    const cx = w / 2;
    const cy = h * 0.5;
    const R = Math.min(w, h) * 0.27;
    drawPlanetHD(ctx, {
      cx,
      cy,
      r: R,
      tex,
      rot: t * 0.013,
      sun: { x: -0.8, y: -0.35 },
      water: water > 0.01 ? { tex: waterTex, level: water } : undefined,
      clouds: clouds > 0.01 ? { tex: cl, alpha: clouds, rot: t * 0.021 } : undefined,
      atmo: { color: "rgba(180,215,255,ALPHA)", alpha: 0.42 },
      night: 0.6,
    });
  };
}

/** Kırmızı dev → gezegenimsi bulutsu → beyaz cüce (Güneş'in ölümü). */
export function sunDeathScene(phase: "stable" | "giant" | "flash" | "nebula" | "dwarf"): StageDrawer {
  return (c) => {
    const { ctx, w, h, t, local, alpha: A } = c;
    if (A <= 0.005) return;
    const cx = w / 2;
    const cy = h * 0.48;
    if (phase === "nebula" || phase === "dwarf") {
      // genişleyen kabuklar
      const shells = phase === "nebula" ? 4 : 2;
      for (let i = 0; i < shells; i++) {
        const rr = ((t * 0.06 + i * 0.24) % 1) * Math.max(w, h) * 0.55 + 30;
        const a = (1 - rr / (Math.max(w, h) * 0.58)) * (phase === "nebula" ? 0.4 : 0.22);
        const g = ctx.createRadialGradient(cx, cy, rr * 0.72, cx, cy, rr);
        g.addColorStop(0, "rgba(120,255,190,0)");
        g.addColorStop(0.82, `rgba(140,255,200,${a})`);
        g.addColorStop(1, `rgba(255,140,170,${a * 0.7})`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.fill();
      }
      if (phase === "dwarf") {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26);
        g.addColorStop(0, "rgba(255,255,255,0.95)");
        g.addColorStop(0.4, "rgba(200,225,255,0.55)");
        g.addColorStop(1, "rgba(160,200,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, 26, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }
    const baseR = phase === "stable" ? Math.min(w, h) * 0.16 : Math.min(w, h) * (phase === "giant" ? 0.4 : 0.34);
    const pulse = 1 + Math.sin(t * (phase === "flash" ? 4.5 : 1.1)) * (phase === "flash" ? 0.09 : 0.03);
    const R = baseR * pulse;
    const gran = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    gran.addColorStop(0, phase === "stable" ? "rgba(255,250,220,0.95)" : "rgba(255,180,90,0.9)");
    gran.addColorStop(0.55, phase === "stable" ? "rgba(255,190,80,0.75)" : "rgba(230,90,40,0.7)");
    gran.addColorStop(1, phase === "stable" ? "rgba(255,120,30,0.15)" : "rgba(160,40,20,0.1)");
    ctx.fillStyle = gran;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    // granülasyon dokunuşları
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    for (let i = 0; i < 40; i++) {
      const a = rand(i) * Math.PI * 2 + t * 0.05;
      const rr = Math.sqrt(rand(i * 3)) * R * 0.92;
      ctx.fillStyle = `rgba(255,${phase === "stable" ? 235 : 160},${phase === "stable" ? 190 : 70},${0.1 + rand(i * 7) * 0.14})`;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, R * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // dış korona
    const cor = ctx.createRadialGradient(cx, cy, R, cx, cy, R * 1.9);
    cor.addColorStop(0, phase === "stable" ? "rgba(255,200,90,0.4)" : "rgba(255,120,50,0.45)");
    cor.addColorStop(1, "rgba(255,100,30,0)");
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.9, 0, Math.PI * 2);
    ctx.fill();
    if (phase === "giant") {
      // yutulan iç gezegen yörüngeleri
      ctx.strokeStyle = `rgba(255,210,160,${0.25 * (1 - local * 0.4)})`;
      for (const k of [1.35, 1.7]) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * k, R * k * 0.32, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };
}

/* ================= KATEGORİ-DUYARLI EVRENSEL SAHNE (v4) =================== */

/**
 * Mantık hatası fix'i: sahne arketipi teorinin KATEGORİSİNE göre seçilir.
 * Jeoloji → Dünya yüzeyi/manto/katmanlar; Yasam → ilkin çorba/hücre/DNA;
 * Fizik → uzay-zaman/parçacık; Kosmoloji → bulutsa/galaksi/CMB;
 * Gök cismi → yörünge sistemi/kuyruklu/yıldız kalbi; Gelecek → sinyal.
 */
export function hdCategoryScene(theory: TheoryDef, i: number): StageDrawer {
  const pools: Record<string, string[]> = {
    kosmoloji: ["nebula", "cmb", "galaxy", "bigbang", "darkweb"],
    fizik: ["spacetime", "particles", "lightcones"],
    gokyuzu: ["system", "comet", "sunheart"],
    jeoloji: ["horizon", "mantle", "strata"],
    yasam: ["pool", "cells", "dna"],
    gelecek: ["signal", "forest"],
  };
  const pool = pools[toCat(theory.cat)] ?? pools.kosmoloji;
  const arch = pool[(i + theory.id.length) % pool.length];
  const accent = theory.color;
  const seed = i * 7.7 + theory.id.charCodeAt(0);

  return (c: StageCtx) => {
    const { ctx, w, h, t, local, alpha: A } = c;
    if (A <= 0.005) return;
    const cx = w / 2;
    const cy = h / 2;
    const acc = `${parseInt(accent.slice(1, 3), 16)},${parseInt(accent.slice(3, 5), 16)},${parseInt(accent.slice(5, 7), 16)}`;
    const breathe = 0.65 + smoothstep(0, 0.16, local) * (1 - smoothstep(0.84, 1, local)) * 0.35;

    switch (arch) {
      case "nebula": {
        opaqueSpace(ctx, w, h, "#0a0714", "#040407");
        for (let j = 0; j < 6; j++) {
          const x = rand(seed + j) * w + Math.sin(t * 0.2 + j) * 10;
          const y = rand(seed + j + 9) * h + Math.cos(t * 0.17 + j) * 8;
          const r = (0.1 + rand(seed + j + 5) * 0.22) * Math.min(w, h);
          const g = ctx.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, `rgba(${acc},${0.2 * A * breathe})`);
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
        }
        break;
      }
      case "cmb": {
        opaqueSpace(ctx, w, h, "#120a06", "#050405");
        // sıcaklık lekeleri (CMB haritası hissi)
        for (let j = 0; j < 60; j++) {
          const x = rand(seed + j * 2) * w;
          const y = rand(seed + j * 2 + 1) * h;
          const r = 8 + rand(seed + j) * 34;
          const hot = rand(seed + j * 3) > 0.5;
          ctx.fillStyle = hot
            ? `rgba(255,170,80,${0.05 + rand(j) * 0.09})`
            : `rgba(120,190,230,${0.05 + rand(j) * 0.09})`;
          ctx.beginPath();
          ctx.ellipse(x, y, r, r * 0.7, rand(j) * 3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case "galaxy": {
        opaqueSpace(ctx, w, h, "#08060f", "#040406");
        const R = Math.min(w, h) * 0.42;
        // sarmal kollar
        for (let arm = 0; arm < 3; arm++) {
          for (let k = 0; k < 130; k++) {
            const f = k / 130;
            const ang = arm * 2.09 + f * 4.4 + t * 0.03;
            const rr = f * R;
            const x = cx + Math.cos(ang) * rr;
            const y = cy + Math.sin(ang) * rr * 0.42;
            const s = 1.6 - f * 1.1;
            ctx.fillStyle = `rgba(${acc},${(0.5 - f * 0.35) * A})`;
            ctx.beginPath();
            ctx.arc(x, y, s + rand(k) * 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.28);
        core.addColorStop(0, `rgba(255,240,200,${0.85 * A})`);
        core.addColorStop(1, "rgba(255,200,120,0)");
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "bigbang": {
        // merkezden patlayan parçacık rüzgârı
        opaqueSpace(ctx, w, h, "#150805", "#040405");
        const burst = smoothstep(0, 0.4, local);
        for (let j = 0; j < 170; j++) {
          const a = rand(seed + j) * Math.PI * 2;
          const sp = (0.2 + rand(seed + j * 3) * 0.8) * burst;
          const rr = sp * Math.min(w, h) * 0.55;
          const x = cx + Math.cos(a) * rr;
          const y = cy + Math.sin(a) * rr * 0.8;
          ctx.fillStyle = `rgba(255,${180 + rand(j) * 70 | 0},110,${(1 - sp) * 0.85 * A})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.2 + rand(j * 5) * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case "darkweb": {
        opaqueSpace(ctx, w, h, "#060710", "#040406");
        // kozmik ağ: düğümler + filamentler
        const nodes: Array<[number, number]> = [];
        for (let j = 0; j < 22; j++)
          nodes.push([rand(seed + j * 3) * w, rand(seed + j * 3 + 1) * h]);
        ctx.strokeStyle = `rgba(${acc},${0.2 * A * breathe})`;
        ctx.lineWidth = 1;
        for (let a = 0; a < nodes.length; a++)
          for (let b = a + 1; b < nodes.length; b++) {
            const d = Math.hypot(nodes[a][0] - nodes[b][0], nodes[a][1] - nodes[b][1]);
            if (d < w * 0.24) {
              ctx.beginPath();
              ctx.moveTo(nodes[a][0], nodes[a][1]);
              ctx.lineTo(nodes[b][0], nodes[b][1]);
              ctx.stroke();
            }
          }
        nodes.forEach(([x, y], j) => {
          ctx.fillStyle = `rgba(255,235,190,${0.8 * A})`;
          ctx.beginPath();
          ctx.arc(x, y, 2 + rand(j) * 2, 0, Math.PI * 2);
          ctx.fill();
        });
        break;
      }
      case "spacetime": {
        opaqueSpace(ctx, w, h, "#07080d", "#030304");
        // bükülmüş ızgara
        const cells = 11;
        ctx.strokeStyle = `rgba(${acc},${0.3 * A * breathe})`;
        ctx.lineWidth = 1;
        for (let gx = 0; gx <= cells; gx++) {
          ctx.beginPath();
          for (let gy = 0; gy <= cells * 1.4; gy++) {
            const x = (gx / cells) * w;
            const y = (gy / (cells * 1.4)) * h;
            const d = Math.hypot(x - cx, y - cy * 1.1);
            const pull = Math.exp(-d / (w * 0.16)) * w * 0.05;
            const nx = x + ((x - cx) / (d || 1)) * pull;
            const ny = y + ((y - cy) / (d || 1)) * pull;
            if (gy === 0) ctx.moveTo(nx, ny);

            else ctx.lineTo(nx, ny);
          }
          ctx.stroke();
        }
        // merkez kütle
        const g = ctx.createRadialGradient(cx, cy * 1.1, 0, cx, cy * 1.1, w * 0.09);
        g.addColorStop(0, `rgba(255,220,150,${0.8 * A})`);
        g.addColorStop(1, "rgba(255,180,90,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy * 1.1, w * 0.09, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "particles": {
        opaqueSpace(ctx, w, h, "#060809", "#030404");
        // dalga fonksiyonu çiftleri
        for (let j = 0; j < 5; j++) {
          ctx.strokeStyle = `rgba(${acc},${(0.35 - j * 0.05) * A})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 8) {
            const y =
              cy +
              Math.sin(x * 0.02 + t * (1.1 + j * 0.3) + j * 2) *
                h * 0.16 * (0.5 + 0.5 * Math.sin(t * 0.4 + j));
            if (x === 0) ctx.moveTo(x, y);

            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        break;
      }
      case "lightcones": {
        opaqueSpace(ctx, w, h, "#070608", "#030304");
        // ışık konileri
        for (const dir of [1, -1]) {
          ctx.fillStyle = `rgba(${acc},${0.12 * A})`;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          for (let k = 0; k <= 30; k++) {
            const f = k / 30;
            ctx.lineTo(cx + dir * f * w * 0.55, cy - f * h * 0.5 * (0.4 + f * 0.6));
          }
          for (let k = 30; k >= 0; k--) {
            const f = k / 30;
            ctx.lineTo(cx + dir * f * w * 0.55, cy + f * h * 0.5 * (0.4 + f * 0.6));
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillStyle = `rgba(255,240,200,${0.9 * A})`;
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "system": {
        opaqueSpace(ctx, w, h, "#090810", "#040405");
        // yıldız + yörüngeler
        const sunR = Math.min(w, h) * 0.07;
        const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunR * 2.6);
        sg.addColorStop(0, `rgba(255,244,214,${0.95 * A})`);
        sg.addColorStop(0.3, `rgba(251,191,36,${0.6 * A})`);
        sg.addColorStop(1, "rgba(251,146,60,0)");
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(cx, cy, sunR * 2.6, 0, Math.PI * 2);
        ctx.fill();
        for (let k = 1; k <= 4; k++) {
          const rr = Math.min(w, h) * 0.11 * k;
          ctx.strokeStyle = `rgba(255,255,255,${0.14 * A})`;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rr, rr * 0.38, 0, 0, Math.PI * 2);
          ctx.stroke();
          const a = t * (0.5 - k * 0.07) + k * 2;
          const px = cx + Math.cos(a) * rr;
          const py = cy + Math.sin(a) * rr * 0.38;
          ctx.fillStyle = ["#d8d4cf", "#e8b25a", "#4d9fd6", "#c96a3b"][k - 1];
          ctx.globalAlpha = A;
          ctx.beginPath();
          ctx.arc(px, py, 3 + k * 0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        break;
      }
      case "comet": {
        opaqueSpace(ctx, w, h, "#05070c", "#030304");
        // kuyruklu yıldız: parlak çekirdek + iyon/toz kuyruğu
        const px = cx - w * 0.18;
        const py = cy + h * 0.08;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(-0.5);
        const tail = ctx.createLinearGradient(0, 0, w * 0.7, 0);
        tail.addColorStop(0, `rgba(190,235,255,${0.5 * A})`);
        tail.addColorStop(1, "rgba(140,200,255,0)");
        ctx.fillStyle = tail;
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(w * 0.72, -h * 0.12);
        ctx.lineTo(w * 0.72, h * 0.12);
        ctx.lineTo(0, 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        const cg = ctx.createRadialGradient(px, py, 0, px, py, 22);
        cg.addColorStop(0, `rgba(255,255,250,${0.95 * A})`);
        cg.addColorStop(1, "rgba(180,220,255,0)");
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(px, py, 22, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "sunheart": {
        opaqueSpace(ctx, w, h, "#100805", "#040304");
        const R = Math.min(w, h) * 0.24;
        const pulse = 1 + Math.sin(t * 1.4) * 0.04;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.8 * pulse);
        g.addColorStop(0, `rgba(255,252,230,${0.95 * A})`);
        g.addColorStop(0.35, `rgba(255,180,70,${0.6 * A})`);
        g.addColorStop(1, "rgba(255,110,30,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.8 * pulse, 0, Math.PI * 2);
        ctx.fill();
        // manyetik döngüler
        ctx.strokeStyle = `rgba(255,200,120,${0.3 * A})`;
        for (let k = 0; k < 4; k++) {
          ctx.beginPath();
          ctx.ellipse(cx, cy, R * (1.1 + k * 0.22), R * (0.35 + k * 0.16), t * 0.05 + k, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }
      case "horizon": {
        // MANTIK FIX'İ: jeoloji sahnesi uzayda değil — gezegen yüzeyinde
        const gTex = planetTexture({
          key: "ground",
          seed: 3.1,
          size: 384,
          low: [64, 46, 34],
          mid: [110, 84, 58],
          high: [150, 124, 88],
          craters: 14,
        });
        horizonBg(ctx, w, h, t, ["#2a1712", "#57301f", "#8a4d28"], gTex, 0.7, 0.85);
        break;
      }
      case "mantle": {
        opaqueSpace(ctx, w, h, "#180b07", "#070304");
        // manto kesiti: konveksiyon hücreleri
        const R = Math.min(w, h) * 0.36;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.clip();
        const mg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
        mg.addColorStop(0, `rgba(255,220,120,${0.9 * A})`);
        mg.addColorStop(0.4, `rgba(230,110,40,${0.75 * A})`);
        mg.addColorStop(1, `rgba(120,45,20,${0.85 * A})`);
        ctx.fillStyle = mg;
        ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
        // dönen konveksiyon okları
        ctx.strokeStyle = `rgba(255,240,190,${0.5 * A * breathe})`;
        ctx.lineWidth = 2.4;
        for (let k = 0; k < 6; k++) {
          const a0 = (k / 6) * Math.PI * 2 + t * 0.25;
          ctx.beginPath();
          ctx.arc(cx, cy, R * (0.35 + (k % 2) * 0.3), a0, a0 + 1.1);
          ctx.stroke();
        }
        ctx.restore();
        break;
      }
      case "strata": {
        // katmanlı kaya kesiti
        const n = 7;
        for (let k = 0; k < n; k++) {
          const y0 = (k / n) * h;
          const wob = fbm(k * 3.3, t * 0.1, seed, 2) * 14;
          const shade = 0.5 + fbm(k * 7.7, 1, seed, 2) * 0.5;
          ctx.fillStyle = `rgba(${140 * shade | 0},${100 * shade | 0},${64 * shade | 0},${A})`;
          ctx.beginPath();
          ctx.moveTo(0, y0 + wob);
          for (let x = 0; x <= w; x += 30)
            ctx.lineTo(x, y0 + wob + Math.sin(x * 0.01 + k) * 6);
          ctx.lineTo(w, h);
          ctx.lineTo(0, h);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = `rgba(255,230,180,${0.1 * A})`;
          ctx.beginPath();
          ctx.moveTo(0, y0 + wob);
          for (let x = 0; x <= w; x += 30)
            ctx.lineTo(x, y0 + wob + Math.sin(x * 0.01 + k) * 6);
          ctx.stroke();
        }
        break;
      }
      case "pool": {
        // ilkin çorba: sıcak su yüzeyi + buhar + moleküller
        opaqueSpace(ctx, w, h, "#1a120a", "#0a0705");
        const pg = ctx.createLinearGradient(0, h * 0.25, 0, h);
        pg.addColorStop(0, "rgba(120,60,20,0)");
        pg.addColorStop(0.5, `rgba(190,90,30,${0.5 * A})`);
        pg.addColorStop(1, `rgba(230,140,50,${0.8 * A})`);
        ctx.fillStyle = pg;
        ctx.fillRect(0, h * 0.25, w, h * 0.75);
        // dalga yüzeyi
        for (let k = 0; k < 4; k++) {
          ctx.strokeStyle = `rgba(255,200,120,${0.25 * A})`;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 10) {
            const y = h * (0.4 + k * 0.14) + Math.sin(x * 0.02 + t * 1.4 + k * 2) * 5;
            if (x === 0) ctx.moveTo(x, y);

            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        // yükselen buhar + molekül balonları
        for (let j = 0; j < 26; j++) {
          const ph = (rand(seed + j) + t * 0.07) % 1;
          const x = rand(seed + j * 3) * w + Math.sin(t + j) * 8;
          const y = h * 0.75 - ph * h * 0.55;
          ctx.fillStyle = `rgba(255,235,200,${(1 - ph) * 0.3 * A})`;
          ctx.beginPath();
          ctx.arc(x, y, 2 + rand(j) * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case "cells": {
        opaqueSpace(ctx, w, h, "#0a0d08", "#040503");
        for (let j = 0; j < 9; j++) {
          const x = rand(seed + j * 2) * w + Math.sin(t * 0.3 + j * 2) * 14;
          const y = rand(seed + j * 2 + 5) * h + Math.cos(t * 0.24 + j) * 10;
          const r = 16 + rand(seed + j) * 30;
          const cg = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, 0, x, y, r);
          cg.addColorStop(0, `rgba(180,255,160,${0.5 * A})`);
          cg.addColorStop(0.6, `rgba(90,190,110,${0.3 * A})`);
          cg.addColorStop(1, "rgba(40,110,60,0.05)");
          ctx.fillStyle = cg;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(220,255,200,${0.75 * A})`;
          ctx.beginPath();
          ctx.arc(x + r * 0.12, y - r * 0.08, r * 0.26, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case "dna": {
        opaqueSpace(ctx, w, h, "#080a10", "#030405");
        const turns = 3.2;
        ctx.lineWidth = 2.6;
        for (const off of [0, Math.PI]) {
          ctx.strokeStyle = off === 0 ? `rgba(${acc},${0.85 * A})` : `rgba(255,235,190,${0.7 * A})`;
          ctx.beginPath();
          for (let y = 0; y <= h; y += 6) {
            const f = y / h;
            const x = cx + Math.cos(f * turns * Math.PI * 2 + t * 0.7 + off) * w * 0.16;
            if (y === 0) ctx.moveTo(x, y);

            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        // basamaklar
        for (let y = 10; y < h; y += 26) {
          const f = y / h;
          const x1 = cx + Math.cos(f * turns * Math.PI * 2 + t * 0.7) * w * 0.16;
          const x2 = cx + Math.cos(f * turns * Math.PI * 2 + t * 0.7 + Math.PI) * w * 0.16;
          ctx.strokeStyle = `rgba(255,255,255,${0.25 * A})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.stroke();
        }
        break;
      }
      case "signal": {
        opaqueSpace(ctx, w, h, "#05070a", "#030304");
        // anten + genişleyen sinyal halkaları
        ctx.strokeStyle = `rgba(200,225,235,${0.7 * A})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 26);
        ctx.lineTo(cx, cy - 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy - 20, 13, Math.PI * 0.15, Math.PI * 0.85, true);
        ctx.stroke();
        for (let k = 0; k < 4; k++) {
          const rr = ((t * 0.35 + k * 0.25) % 1) * w * 0.5;
          ctx.strokeStyle = `rgba(${acc},${(1 - rr / (w * 0.5)) * 0.5 * A})`;
          ctx.beginPath();
          ctx.arc(cx, cy - 8, rr, Math.PI * 1.2, Math.PI * 1.8);
          ctx.stroke();
        }
        break;
      }
      case "forest": {
        opaqueSpace(ctx, w, h, "#0a1008", "#040603");
        // gezegen yüzeyi + yeşeren fidan siluetleri
        const gg = ctx.createLinearGradient(0, h * 0.6, 0, h);
        gg.addColorStop(0, `rgba(40,80,40,${0.9 * A})`);
        gg.addColorStop(1, `rgba(16,34,18,${0.95 * A})`);
        ctx.fillStyle = gg;
        ctx.fillRect(0, h * 0.62, w, h * 0.38);
        for (let k = 0; k < 9; k++) {
          const x = (k / 9) * w + 20;
          const hh = (20 + rand(seed + k) * 60) * (0.4 + smoothstep(0.1, 0.7, local) * 0.6);
          ctx.strokeStyle = `rgba(90,150,80,${0.85 * A})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, h * 0.85);
          ctx.lineTo(x, h * 0.85 - hh);
          ctx.stroke();
        }
        break;
      }
      default:
        opaqueSpace(ctx, w, h, "#090909", "#040404");
    }
  };
}

function toCat(cat: TheoryDef["cat"]): string {
  return cat;
}

/* ==================== OKYANUSLARIN DOĞUŞU — HD (5 bölüm) ================== */

export const OCEAN_BIRTH_HD: StageDrawer[] = [
  (c) => {
    // s0: kızgın volkanik dünya — lav çatlaklı gezegen
    planetWaterStory(0, 0, true)(c);
    const { ctx, w, h, t, alpha: A } = c;
    if (A <= 0.005) return;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 14; i++) {
      const a = rand(i) * Math.PI * 2;
      const rr = Math.min(w, h) * 0.27;
      const x = w / 2 + Math.cos(a) * rr * rand(i * 3);
      const y = h / 2 + Math.sin(a) * rr * rand(i * 5);
      const flick = 0.5 + Math.sin(t * 3 + i * 2.4) * 0.5;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 12 + rand(i) * 10);
      g.addColorStop(0, `rgba(255,170,60,${0.5 * flick * A})`);
      g.addColorStop(1, "rgba(255,80,20,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 12 + rand(i) * 10, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },
  (c) => {
    // s1: buhar tavanı — su buharı atmosferi birikir
    planetWaterStory(0.1, 0.38, true)(c);
  },
  (c) => {
    // s2: milyon yıllık sağanak — şiddetli yağmur + yükselen sular
    const { ctx, w, h, t, alpha: A } = c;
    planetWaterStory(0.34, 0.5, true)(c);
    if (A <= 0.005) return;
    for (let i = 0; i < 60; i++) {
      const ph = (rand(i * 7) + t * 0.9) % 1;
      const x = rand(i) * w;
      const y = ph * h;
      ctx.strokeStyle = `rgba(180,215,240,${0.4 * A * Math.sin(ph * Math.PI)})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 3, y + 16);
      ctx.stroke();
    }
  },
  (c) => {
    // s3: buzlu gövdeler geliyor — buzlu asteroit/kuyluklu yağmuru
    planetWaterStory(0.5, 0.42, false)(c);
    const { ctx, w, h, t, alpha: A } = c;
    if (A <= 0.005) return;
    for (let i = 0; i < 7; i++) {
      const ph = (rand(i * 11) + t * 0.13) % 1;
      const x = ph * w * 1.2 - w * 0.1;
      const y = h * (0.12 + rand(i * 3) * 0.5) + ph * h * 0.22;
      ctx.strokeStyle = `rgba(210,235,255,${0.5 * A * Math.sin(ph * Math.PI)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 26, y - 7);
      ctx.lineTo(x + 10, y + 3);
      ctx.stroke();
      ctx.fillStyle = `rgba(240,250,255,${0.9 * A})`;
      ctx.beginPath();
      ctx.arc(x + 10, y + 3, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  (c) => {
    // s4: mavi gezegen — dolu okyanuslar + gürül bulutlar
    planetWaterStory(0.62, 0.58, false)(c);
  },
];

/* ====================== GÜNEŞ'İN ÖLÜMÜ — HD (6 bölüm) ===================== */

export const SUN_DEATH_HD: StageDrawer[] = [
  sunDeathScene("stable"),
  sunDeathScene("stable"),
  sunDeathScene("giant"),
  sunDeathScene("flash"),
  sunDeathScene("nebula"),
  sunDeathScene("dwarf"),
];
