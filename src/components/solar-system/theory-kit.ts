/**
 * theory-kit — teori animasyonları için paylaşılan çizim kiti.
 *
 * · AŞIRI YUMUŞAK ÇOK KATMANLI GEÇİŞ: renderStaged v2 — aşama sınırlarında
 *   iki sahne uzun bir pencere içinde kuintik easing ile kaynaşır; çıkan
 *   sahne büyüyerek bulanıklaşır ve kararır, gelen sahne hafif bulanıktan
 *   netleşerek yerine oturur, ortada renk imzalı bir ışık perdesi süzülür.
 * · Ani kesme YOKTUR: her şey alfa + blur + ölçek + ışık dört katmanda.
 * · Gerçekçi patlama: flaş + ateş bulutu + 3 şok halkası + kıvılcım +
 *   kaya/buz/metal parçaları + kor/ismi tutan duman.
 * · Tüm çizimler deterministiktir (rand(seed)) — her karede aynı sonuç.
 */

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/** Kuintik (5. derece) yumuşatma — en pürüzsüz geçiş eğrisi. */
export function smootherstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** Deterministik pseudo-random (seed sabit → her karede aynı sonuç). */
export function rand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** İki rengi karıştır (#rrggbb). */
export function mixRgb(c1: string, c2: string, t: number) {
  const p = (c: string) => [
    parseInt(c.slice(1, 3), 16),
    parseInt(c.slice(3, 5), 16),
    parseInt(c.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = p(c1);
  const [r2, g2, b2] = p(c2);
  return `rgb(${Math.round(lerp(r1, r2, t))},${Math.round(
    lerp(g1, g2, t)
  )},${Math.round(lerp(b1, b2, t))})`;
}

/* --------------------------------- Yıldızlar ------------------------------ */

export interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  layer: number;
}

export function makeStars(n: number): Star[] {
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

export function drawSpaceBg(
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

/** Saf yıldız alanı (uzay degrade'siz — sahne kendi arka planını boyayacaksa). */
export function drawStarsOnly(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  stars: Star[],
  t: number,
  p: number
) {
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

/* ------------------------------ Küre ve ışık ------------------------------ */

/**
 * GÖLGELİ küre — ışık kaynağı ışıktan (lx, ly) yönünden gelir, kenar
 * yumuşatmalı atmosfer parlaklığı (rim) ve isteğe bağlı dış parıltı.
 * light: 0-1 arası ışık şiddeti (0 = tam siluet).
 */
export function drawSphere(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  base: string,
  hi: string,
  lo: string,
  glow?: string,
  lightDir = { x: -0.35, y: -0.38 },
  rim?: string
) {
  if (glow) {
    const g = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 1.7);
    g.addColorStop(0, glow);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.7, 0, Math.PI * 2);
    ctx.fill();
  }
  const g = ctx.createRadialGradient(
    x + r * lightDir.x,
    y + r * lightDir.y,
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
  if (rim) {
    // Kenar yumuşatmalı atmosfer parıltısı
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const rg = ctx.createRadialGradient(x, y, r * 0.92, x, y, r * 1.12);
    rg.addColorStop(0, "rgba(0,0,0,0)");
    rg.addColorStop(0.55, rim);
    rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/** Yumuşak radyal parıltı (additive). */
export function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha = 1
) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* ------------------------------ Güneş (2D) -------------------------------- */

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
 * Gerçekçi 2D Güneş: kaynayan granülasyon, kenar kararması (limb
 * darkening), nabızlı çift korona ve rastgele protuberanslar (kabarcık
 * döngüleri disk kenarında belirip söner).
 */
export function drawSun2D(
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
  for (const [mult, color] of [
    [13.5, "rgba(201,122,42,0.16)"],
    [7.4, "rgba(255,154,46,0.3)"],
    [4.6, "rgba(255,184,77,0.55)"],
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

  // Protuberanslar: kenarda yay atan 6 kavisli sis
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 6; i++) {
    const ph = (t * 0.25 + i * 0.61) % 2; // 0→2 döngü
    const life = Math.sin(Math.min(1, ph) * Math.PI);
    if (life <= 0.02) continue;
    const ang = i * 1.047 + Math.sin(t * 0.4 + i) * 0.08;
    const px = x + Math.cos(ang) * r;
    const py = y + Math.sin(ang) * r;
    const len = r * (0.22 + 0.2 * life);
    ctx.strokeStyle = `rgba(255,150,60,${0.35 * life})`;
    ctx.lineWidth = r * 0.08 * life + 1;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(
      px + Math.cos(ang) * len * 0.5 + Math.cos(ang + 1.57) * len * 0.35,
      py + Math.sin(ang) * len * 0.5 + Math.sin(ang + 1.57) * len * 0.35,
      px + Math.cos(ang) * len * 0.9,
      py + Math.sin(ang) * len * 0.9
    );
    ctx.stroke();
  }
  ctx.restore();

  // Disk
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
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

/* ---------------------------- GERÇEKÇİ PATLAMA ----------------------------- */

export type ShardKind = "rock" | "ice" | "metal" | "ember";

/**
 * Tam teçhizatlı gerçekçi patlama (çok katmanlı):
 *  1) Anlık beyaz flaş ve çekirdek ateş topu
 *  2) Kaynayan ateş bulutu (fBm benzeri benekler)
 *  3) Üç şok halkası (farklı hız/alfa)
 *  4) 30+ kıvılcım (yerçekimiyle düşen eğri)
 *  5) Kaya/buz/metal çokgen parçaları (döner)
 *  6) Kor ve is dumanı (geç sönen)
 * t01: patlamanın kendi süresi (0-1).
 */
export function drawBurst(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t01: number,
  seed: number,
  kind: ShardKind = "rock",
  scale = 1,
  palette: "fire" | "cosmic" | "blue" | "green" = "fire"
) {
  const fade = 1 - smoothstep(0.72, 1, t01);
  const pal: Record<string, [string, string, string]> = {
    fire: ["255,244,220", "255,190,90", "255,120,40"],
    cosmic: ["240,230,255", "200,150,255", "120,80,220"],
    blue: ["220,240,255", "150,200,255", "60,120,230"],
    green: ["230,255,240", "150,255,180", "40,180,120"],
  };
  const [c0, c1, c2] = pal[palette];

  // 1) Flaş + ateş topu
  const flash = (1 - smoothstep(0, 0.16, t01)) * fade;
  if (flash > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(x, y, 0, x, y, 300 * scale);
    g.addColorStop(0, `rgba(${c0},${flash})`);
    g.addColorStop(0.35, `rgba(${c1},${flash * 0.7})`);
    g.addColorStop(1, `rgba(${c2},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 300 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 2) Kaynayan ateş bulutu
  const cloud = smoothstep(0, 0.12, t01) * fade;
  if (cloud > 0.02) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const cr = 90 * scale * (0.6 + t01 * 0.9);
    for (let i = 0; i < 14; i++) {
      const a = rand(seed + i * 9.1) * Math.PI * 2;
      const d = rand(seed + i * 3.7) * cr * 0.7;
      const rr = cr * (0.25 + rand(seed + i * 5.3) * 0.5);
      const px = x + Math.cos(a) * d;
      const py = y + Math.sin(a) * d * 0.85;
      const ca = cloud * (0.5 - t01 * 0.35);
      if (ca <= 0.02) continue;
      const g = ctx.createRadialGradient(px, py, 0, px, py, rr);
      g.addColorStop(0, `rgba(${i % 3 === 0 ? c0 : c1},${ca})`);
      g.addColorStop(1, `rgba(${c2},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, rr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 3) Şok halkaları (3 katman)
  for (const [k, spd] of [[0, 240], [0.3, 190], [0.55, 130]] as const) {
    const tt = clamp01((t01 - k) / 0.6);
    if (tt <= 0 || tt >= 1) continue;
    const rr = tt * tt * spd * scale;
    ctx.strokeStyle = `rgba(${c1},${(1 - tt) * 0.75 * fade})`;
    ctx.lineWidth = Math.max(1, 5.5 * (1 - tt));
    ctx.beginPath();
    ctx.arc(x, y, rr, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 4) Kıvılcımlar (yerçekimi eğrili)
  const N = 30;
  for (let i = 0; i < N; i++) {
    const a = rand(seed + i) * Math.PI * 2;
    const sp = (0.5 + rand(seed + i * 3.3)) * 170 * scale;
    const dist = sp * (t01 * (2 - t01));
    const grav = 46 * t01 * t01 * scale;
    const px = x + Math.cos(a) * dist;
    const py = y + Math.sin(a) * dist * 0.8 + grav;
    const sz = (1 + rand(seed + i * 7.7) * 2.2) * (1 - t01 * 0.85);
    if (sz <= 0.2) continue;
    ctx.fillStyle =
      kind === "ice"
        ? `rgba(190,235,255,${fade})`
        : `rgba(255,${170 + Math.floor(rand(seed + i) * 60)},80,${fade})`;
    ctx.beginPath();
    ctx.arc(px, py, sz, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5) Parçalar
  const SH = 9;
  for (let i = 0; i < SH; i++) {
    const a = rand(seed * 2 + i * 13.7) * Math.PI * 2;
    const sp = (0.7 + rand(seed * 2 + i * 5.1)) * 105 * scale;
    const dist = sp * t01;
    const px = x + Math.cos(a) * dist;
    const py = y + Math.sin(a) * dist * 0.85 + 18 * t01 * t01 * scale;
    const rot = rand(seed + i * 31) * Math.PI * 2 + t01 * 4;
    const sz = (4 + rand(seed + i * 17) * 7) * scale * (1 - t01 * 0.4);
    drawShard(ctx, px, py, sz, rot, kind, fade);
  }

  // 6) Kor + is dumanı (geç söner)
  const smoke = smoothstep(0.25, 0.6, t01) * (1 - smoothstep(0.8, 1, t01));
  if (smoke > 0.02) {
    for (let i = 0; i < 8; i++) {
      const a = rand(seed * 3 + i * 7.9) * Math.PI * 2;
      const d = (30 + rand(seed * 3 + i * 2.3) * 90) * scale * (0.5 + t01);
      const px = x + Math.cos(a) * d;
      const py = y + Math.sin(a) * d * 0.8 - 20 * t01 * scale;
      const rr = (18 + rand(seed + i) * 26) * scale * (0.6 + t01);
      ctx.globalAlpha = smoke * 0.16;
      ctx.fillStyle = "#1c1a18";
      ctx.beginPath();
      ctx.arc(px, py, rr, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}

/** Kaya / buz / metal kırığı (gerçekçi çokgen + gölge). */
export function drawShard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rot: number,
  kind: ShardKind,
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
  let fill: string | CanvasGradient;
  let stroke: string | null = null;
  if (kind === "ice") {
    const g = ctx.createLinearGradient(-r, -r, r, r);
    g.addColorStop(0, "#eaf8ff");
    g.addColorStop(0.5, "#bfe4f8");
    g.addColorStop(1, "#7fb8d8");
    fill = g;
    stroke = "rgba(255,255,255,0.85)";
  } else if (kind === "metal") {
    const g = ctx.createLinearGradient(-r, -r, r, r);
    g.addColorStop(0, "#e8e4dc");
    g.addColorStop(0.45, "#9a948a");
    g.addColorStop(1, "#4c463e");
    fill = g;
    stroke = "rgba(255,255,255,0.4)";
  } else if (kind === "ember") {
    const g = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r);
    g.addColorStop(0, "#ffe9a8");
    g.addColorStop(0.5, "#ff8a3a");
    g.addColorStop(1, "#5a1c08");
    fill = g;
  } else {
    const g = ctx.createLinearGradient(-r, -r, r, r);
    g.addColorStop(0, "#c8a078");
    g.addColorStop(0.6, "#8a6248");
    g.addColorStop(1, "#4a3020");
    fill = g;
  }
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  // Gölgeli yarı (alt kısım koyu)
  ctx.globalAlpha = alpha * 0.35;
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.beginPath();
  ctx.ellipse(0, r * 0.25, r * 0.85, r * 0.5, 0, 0, Math.PI);
  ctx.fill();
  ctx.restore();
}

/* ------------------------------ Yörünge yardımcıları ---------------------- */

/** Elips yörünge yolu çizer (rx: yarı genişlik, squash: dikey ezme). */
export function orbitEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  squash = 0.38,
  alpha = 0.35,
  dash: number[] = []
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#8d93a8";
  ctx.lineWidth = 1;
  if (dash.length) ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.ellipse(x, y, rx, rx * squash, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/** Yörünge üzerindeki konum (a: açı). */
export function orbitPos(
  x: number,
  y: number,
  rx: number,
  a: number,
  squash = 0.38
) {
  return { x: x + Math.cos(a) * rx, y: y + Math.sin(a) * rx * squash };
}

/* ------------------------------ Gezegen çizimleri -------------------------- */

/**
 * Kayaç gezegen: dönen yüzey lekeleri (kıtalar/krater), gündüz-gece
 * terminatörü, isteğe bağlı atmosfer rim'i.
 */
export function drawRockyPlanet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number,
  base: string,
  dark: string,
  spot: string,
  seed: number,
  crater = 0,
  rim?: string
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  // Taban
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, base);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  // Dönen lekeler
  const rot = t * 0.22;
  for (let i = 0; i < 7; i++) {
    const sx = rand(seed + i * 11) * 2 - 1;
    const sy = rand(seed + i * 7.3) * 2 - 1;
    const a = rot + sx * 2.2;
    const px = x + Math.cos(a) * r * 0.62;
    const py = y + sy * r * 0.55;
    const sr = r * (0.16 + rand(seed + i * 3.1) * 0.28);
    if (px < x - r || px > x + r) continue;
    ctx.globalAlpha = 0.5 + rand(seed + i) * 0.3;
    ctx.fillStyle = spot;
    ctx.beginPath();
    ctx.ellipse(px, py, sr, sr * 0.7, sy, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Kraterler
  if (crater > 0) {
    const n = Math.round(crater * 14);
    for (let i = 0; i < n; i++) {
      const sx = rand(seed + i * 17.7) * 2 - 1;
      const sy = rand(seed + i * 5.9) * 2 - 1;
      const a = rot * 0.6 + sx * 2.2;
      const px = x + Math.cos(a) * r * 0.6;
      const py = y + sy * r * 0.6;
      const cr = r * (0.04 + rand(seed + i * 9.7) * 0.07); // küçük kraterler
      if (cr < 0.8) continue;
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.beginPath();
      ctx.arc(px, py, cr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.beginPath();
      ctx.arc(px - cr * 0.25, py - cr * 0.25, cr * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  // Terminatör (gece yarısı gölgesi)
  const sh = ctx.createRadialGradient(
    x + r * 0.55,
    y + r * 0.35,
    r * 0.1,
    x,
    y,
    r * 1.25
  );
  sh.addColorStop(0, "rgba(0,0,10,0.5)");
  sh.addColorStop(0.55, "rgba(0,0,10,0.15)");
  sh.addColorStop(1, "rgba(0,0,10,0)");
  ctx.fillStyle = sh;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
  if (rim) drawSphere(ctx, x, y, r, "rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)", undefined, { x: 0, y: 0 }, rim);
}

/**
 * Dev gaz gezegeni: yatay bulut bantları + fırtına lekesi, yumuşak
 * terminatör. bands: renk dizisi (2-6 renk).
 */
export function drawGasGiant(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number,
  bands: string[],
  spotColor?: string,
  seed = 3,
  rim?: string
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  const g = ctx.createLinearGradient(x, y - r, x, y + r);
  g.addColorStop(0, bands[0]);
  g.addColorStop(1, bands[bands.length - 1]);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  // Bantlar
  const n = bands.length * 3;
  for (let i = 0; i < n; i++) {
    const yy = y - r + ((i + 0.5) / n) * r * 2;
    const h = (r * 2) / n * (0.8 + rand(seed + i * 3.1) * 0.6);
    const wob = Math.sin(t * 0.3 + i * 1.7) * r * 0.03;
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = bands[(i + (seed % bands.length)) % bands.length];
    ctx.beginPath();
    ctx.ellipse(x + wob, yy, r * 1.05, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Fırtına lekesi (Büyük Kırmızı Leke tarzı)
  if (spotColor) {
    const sx = x + Math.cos(t * 0.15) * r * 0.45;
    const sy = y + r * 0.32;
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = spotColor;
    ctx.beginPath();
    ctx.ellipse(sx, sy, r * 0.2, r * 0.12, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(sx, sy, r * 0.24, r * 0.15, 0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // Terminatör
  const sh = ctx.createRadialGradient(
    x + r * 0.55,
    y + r * 0.3,
    r * 0.1,
    x,
    y,
    r * 1.25
  );
  sh.addColorStop(0, "rgba(0,0,12,0.55)");
  sh.addColorStop(0.6, "rgba(0,0,12,0.12)");
  sh.addColorStop(1, "rgba(0,0,12,0)");
  ctx.fillStyle = sh;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
  if (rim) drawSphere(ctx, x, y, r, "rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)", undefined, { x: 0, y: 0 }, rim);
}

/** Halkalı dev gezegen (Satürn benzeri) — halka ön/arka yarı ayrımı. */
export function drawRingedPlanet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number,
  bodyBands: string[],
  ringInner: number,
  ringOuter: number,
  ringColors: string[],
  squash = 0.32,
  seed = 5
) {
  const drawRingHalf = (front: boolean) => {
    for (let i = 0; i < 4; i++) {
      const rr = ringInner + ((ringOuter - ringInner) / 4) * (i + 0.5);
      ctx.globalAlpha = 0.4 + (i % 2) * 0.35;
      ctx.strokeStyle = ringColors[i % ringColors.length];
      ctx.lineWidth = (ringOuter - ringInner) / 5;
      ctx.beginPath();
      ctx.ellipse(x, y, rr, rr * squash, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };
  drawRingHalf(false); // arka
  drawGasGiant(ctx, x, y, r, t, bodyBands, undefined, seed);
  drawRingHalf(true); // ön
}

/** Buzlu küçük gövde (uydu/kuyruklu çekirdek): kırık buz dokusu. */
export function drawIcyBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number,
  seed: number,
  tint = "#cfe8f4"
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = tint;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  for (let i = 0; i < 8; i++) {
    const px = x + (rand(seed + i * 3.3) * 2 - 1) * r * 0.7;
    const py = y + (rand(seed + i * 7.1) * 2 - 1) * r * 0.7;
    const rr = r * (0.12 + rand(seed + i * 2.7) * 0.22);
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = i % 2 ? "#a8ccd8" : "#f4fbff";
    ctx.beginPath();
    ctx.ellipse(px, py, rr, rr * 0.72, rand(seed + i), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const sh = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  sh.addColorStop(0, "rgba(255,255,255,0.25)");
  sh.addColorStop(1, "rgba(20,40,60,0.45)");
  ctx.fillStyle = sh;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

/** Kuyruklu yıldız: çekirdek + toz kuyruğu (yön verilen). */
export function drawComet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  tailAngle: number,
  tailLen: number,
  t: number,
  seed = 8
) {
  // Toz kuyruğu
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const tx = x + Math.cos(tailAngle) * tailLen;
  const ty = y + Math.sin(tailAngle) * tailLen;
  const g = ctx.createLinearGradient(x, y, tx, ty);
  g.addColorStop(0, "rgba(190,225,255,0.5)");
  g.addColorStop(1, "rgba(190,225,255,0)");
  ctx.strokeStyle = g;
  ctx.lineWidth = r * 1.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(
    x + Math.cos(tailAngle + 0.25) * tailLen * 0.6,
    y + Math.sin(tailAngle + 0.25) * tailLen * 0.6,
    tx,
    ty
  );
  ctx.stroke();
  // Parlayan koma
  drawGlow(ctx, x, y, r * 4, "rgba(200,235,255,0.55)");
  ctx.restore();
  drawIcyBody(ctx, x, y, r, t, seed);
}

/** Spiral galaksi (üstten): çekirdek + kollar + HII lekeleri. */
export function drawGalaxy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  R: number,
  t: number,
  armCount = 4,
  seed = 11,
  hue = "170,140,255"
) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const rot = t * 0.05;
  // Disk parıltısı
  const dg = ctx.createRadialGradient(x, y, 0, x, y, R);
  dg.addColorStop(0, `rgba(255,240,220,0.5)`);
  dg.addColorStop(0.2, `rgba(${hue},0.22)`);
  dg.addColorStop(1, `rgba(${hue},0)`);
  ctx.fillStyle = dg;
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fill();
  // Kollar
  for (let a = 0; a < armCount; a++) {
    const base = (a / armCount) * Math.PI * 2;
    ctx.beginPath();
    for (let s = 0; s <= 60; s++) {
      const f = s / 60;
      const ang = base + f * 3.4 + rot;
      const rr = f * R;
      const px = x + Math.cos(ang) * rr;
      const py = y + Math.sin(ang) * rr * 0.94;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = `rgba(${hue},0.28)`;
    ctx.lineWidth = R * 0.1;
    ctx.lineCap = "round";
    ctx.stroke();
  }
  // Yıldız benekleri
  for (let i = 0; i < 90; i++) {
    const arm = Math.floor(rand(seed + i) * armCount);
    const f = Math.pow(rand(seed + i * 3.7), 0.7);
    const ang =
      (arm / armCount) * Math.PI * 2 + f * 3.4 + rot + (rand(seed + i * 7.7) - 0.5) * 0.5;
    const rr = f * R * 0.96;
    const px = x + Math.cos(ang) * rr;
    const py = y + Math.sin(ang) * rr * 0.94;
    ctx.fillStyle = `rgba(255,255,255,${0.25 + rand(seed + i * 5.1) * 0.5})`;
    ctx.beginPath();
    ctx.arc(px, py, 0.6 + rand(seed + i * 9.3) * 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
  // Çekirdek
  const cg = ctx.createRadialGradient(x, y, 0, x, y, R * 0.22);
  cg.addColorStop(0, "rgba(255,246,225,0.95)");
  cg.addColorStop(1, "rgba(255,220,160,0)");
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.arc(x, y, R * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Karadelik: olay ufku + yutulmakta olan ışıklı yutuk diski. */
export function drawBlackhole(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number
) {
  // Yutuk diski
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 3; i++) {
    const rr = r * (1.6 + i * 0.5);
    const a = 0.5 - i * 0.14;
    ctx.strokeStyle = `rgba(255,${170 - i * 30},${90 - i * 20},${a})`;
    ctx.lineWidth = r * (0.28 - i * 0.06);
    ctx.beginPath();
    ctx.ellipse(x, y, rr, rr * 0.26, Math.sin(t * 0.1) * 0.1, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Diske düşen madde parıltısı
  drawGlow(ctx, x, y, r * 2.6, "rgba(255,190,110,0.35)");
  ctx.restore();
  // Olay ufku
  const g = ctx.createRadialGradient(x, y, r * 0.4, x, y, r);
  g.addColorStop(0, "#000");
  g.addColorStop(0.85, "#000");
  g.addColorStop(1, "rgba(255,180,90,0.6)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** Uzay-zaman dokusu eğrisi (görelilik): kafes + kütle çukuru. */
export function drawSpacetimeGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cx: number,
  cy: number,
  depth: number,
  lines = 11,
  color = "134,144,168"
) {
  ctx.save();
  ctx.strokeStyle = `rgba(${color},0.4)`;
  ctx.lineWidth = 1;
  const warp = (px: number, py: number) => {
    const dx = px - cx;
    const dy = py - cy;
    const d = Math.hypot(dx, dy) || 1;
    const pull = (depth * 46) / (1 + Math.pow(d / (h * 0.28), 2));
    return { x: px - (dx / d) * pull, y: py - (dy / d) * pull };
  };
  for (let i = 0; i <= lines; i++) {
    const f = i / lines;
    // Yatay çizgiler
    ctx.beginPath();
    for (let s = 0; s <= 40; s++) {
      const px = (s / 40) * w;
      const py = f * h;
      const q = warp(px, py);
      if (s === 0) ctx.moveTo(q.x, q.y);
      else ctx.lineTo(q.x, q.y);
    }
    ctx.stroke();
    // Dikey çizgiler
    ctx.beginPath();
    for (let s = 0; s <= 40; s++) {
      const px = f * w;
      const py = (s / 40) * h;
      const q = warp(px, py);
      if (s === 0) ctx.moveTo(q.x, q.y);
      else ctx.lineTo(q.x, q.y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/* ------------------------------- Biyoloji --------------------------------- */

/** Hücre: zar + çekirdek + organeller, yumuşak nefes alan baloncuk. */
export function drawCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number,
  seed = 4,
  membrane = "rgba(120,220,180,0.75)",
  inner = "rgba(40,80,70,0.5)"
) {
  const br = r * (1 + Math.sin(t * 1.4 + seed) * 0.03);
  // Zar
  const g = ctx.createRadialGradient(x - br * 0.3, y - br * 0.3, br * 0.2, x, y, br);
  g.addColorStop(0, "rgba(200,255,235,0.85)");
  g.addColorStop(0.7, membrane);
  g.addColorStop(1, "rgba(20,60,50,0.8)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, br, br * 0.92, Math.sin(t * 0.3) * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Stoplazm içi
  const ig = ctx.createRadialGradient(x, y, br * 0.1, x, y, br * 0.85);
  ig.addColorStop(0, "rgba(150,240,210,0.35)");
  ig.addColorStop(1, inner);
  ctx.fillStyle = ig;
  ctx.beginPath();
  ctx.ellipse(x, y, br * 0.88, br * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Çekirdek
  const nx = x + Math.cos(t * 0.4 + seed) * br * 0.12;
  const ny = y + Math.sin(t * 0.33 + seed) * br * 0.1;
  ctx.fillStyle = "rgba(90,140,220,0.8)";
  ctx.beginPath();
  ctx.arc(nx, ny, br * 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(220,240,255,0.5)";
  ctx.beginPath();
  ctx.arc(nx - br * 0.06, ny - br * 0.06, br * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Organeller
  for (let i = 0; i < 5; i++) {
    const a = rand(seed + i * 7.7) * Math.PI * 2 + t * 0.2;
    const d = br * (0.35 + rand(seed + i * 3.3) * 0.4);
    const ox = x + Math.cos(a) * d;
    const oy = y + Math.sin(a) * d * 0.9;
    ctx.fillStyle = i % 2 ? "rgba(255,200,120,0.6)" : "rgba(160,255,190,0.5)";
    ctx.beginPath();
    ctx.ellipse(ox, oy, br * 0.09, br * 0.055, a, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Bakteri (çubuk/kamçılı). */
export function drawBacterium(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  L: number,
  ang: number,
  t: number,
  color = "rgba(140,200,255,0.8)"
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const wig = Math.sin(t * 6) * 0.25;
  // Kamçı
  ctx.strokeStyle = "rgba(180,220,255,0.5)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-L / 2, 0);
  ctx.quadraticCurveTo(-L * 0.75, Math.sin(t * 8) * L * 0.2, -L, wig * L);
  ctx.stroke();
  // Gövde
  const g = ctx.createLinearGradient(0, -L * 0.25, 0, L * 0.25);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(30,60,110,0.8)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, L / 2, L * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** DNA çift sarmalı. */
export function drawDNA(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number,
  width: number,
  t: number,
  color1 = "rgba(120,220,255,0.85)",
  color2 = "rgba(255,190,120,0.85)"
) {
  const turns = 3;
  const step = len / (turns * 12);
  for (let i = 0; i <= turns * 12; i++) {
    const f = i / (turns * 12);
    const ph = f * turns * Math.PI * 2 + t * 1.2;
    const y1 = y + f * len;
    const x1 = x + Math.sin(ph) * width;
    const x2 = x + Math.sin(ph + Math.PI) * width;
    // Basamaklar
    ctx.strokeStyle = `rgba(200,210,230,${0.25 + 0.3 * (0.5 + 0.5 * Math.cos(ph))})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y1);
    ctx.stroke();
    // İki iplik
    ctx.fillStyle = color1;
    ctx.beginPath();
    ctx.arc(x1, y1, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color2;
    ctx.beginPath();
    ctx.arc(x2, y1, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* -------------------------------- Dünya ----------------------------------- */

interface Cont {
  x: number;
  y: number;
  r: number;
}
export function makeContinents(seed: number, n = 6): Cont[] {
  const arr: Cont[] = [];
  for (let i = 0; i < n; i++) {
    arr.push({
      x: rand(seed + i * 13.3) * 1.6 - 0.8,
      y: rand(seed + i * 7.9) * 1.4 - 0.7,
      r: 0.16 + rand(seed + i * 3.7) * 0.3,
    });
  }
  return arr;
}

export const CONT_COLORS = ["#7a9a4a", "#8aa050", "#6a8a42", "#90a858", "#7a9048", "#889848"];

export function drawContinent(
  ctx: CanvasRenderingContext2D,
  ct: Cont,
  seed: number,
  t: number
) {
  ctx.beginPath();
  const pts = 9;
  for (let i = 0; i < pts; i++) {
    const a = (i / pts) * Math.PI * 2;
    const rr = ct.r * (0.7 + rand(i * 3.3 + seed) * 0.55 + Math.sin(t * 0.1 + i) * 0.04);
    const px = Math.cos(a) * rr;
    const py = Math.sin(a) * rr * 0.8;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = CONT_COLORS[Math.floor(seed) % CONT_COLORS.length];
  ctx.fill();
}

/** Mavi Dünya: okyanus + dönen kıtalar + bulutlar + atmosfer rim. */
export function drawEarth(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number,
  continents: Cont[],
  seed = 2,
  cloudAlpha = 0.5
) {
  // Okyanus
  drawSphere(ctx, x, y, r, "#1d5a8a", "#3e8fc4", "#0b2b4a", undefined, { x: -0.3, y: -0.3 });
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  const rot = t * 0.14;
  for (let i = 0; i < continents.length; i++) {
    const c = continents[i];
    const a = rot + c.x * 2.4;
    const px = x + Math.cos(a) * r * 0.62;
    const py = y + c.y * r * 0.62;
    if (px < x - r * 1.1 || px > x + r * 1.1) continue;
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(r * 0.62, r * 0.62);
    drawContinent(ctx, c, seed + i * 3.1, t);
    ctx.restore();
  }
  // Bulutlar
  if (cloudAlpha > 0.02) {
    for (let i = 0; i < 9; i++) {
      const a = rot * 1.3 + i * 0.9;
      const px = x + Math.cos(a) * r * (0.2 + rand(seed + i * 5.7) * 0.7);
      const py = y + (rand(seed + i * 9.1) * 2 - 1) * r * 0.8;
      ctx.globalAlpha = cloudAlpha * (0.5 + rand(seed + i) * 0.4);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(px, py, r * 0.16, r * 0.06, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  // Gece tarafı
  const sh = ctx.createRadialGradient(x + r * 0.55, y + r * 0.3, r * 0.1, x, y, r * 1.25);
  sh.addColorStop(0, "rgba(0,0,15,0.55)");
  sh.addColorStop(0.6, "rgba(0,0,15,0.12)");
  sh.addColorStop(1, "rgba(0,0,15,0)");
  ctx.fillStyle = sh;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
  // Atmosfer
  drawSphere(
    ctx,
    x,
    y,
    r,
    "rgba(0,0,0,0)",
    "rgba(0,0,0,0)",
    "rgba(0,0,0,0)",
    undefined,
    { x: 0, y: 0 },
    "rgba(120,190,255,0.5)"
  );
}

/* --------------------------- ÇOK KATMANLI GEÇİŞ --------------------------- */

export interface StageCtx {
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

export type StageDrawer = (c: StageCtx) => void;

/**
 * renderStaged v2 — AŞIRI YUMUŞAK ÇOK KATMANLI AŞAMA GEÇİŞİ.
 *
 * · Uzun harman penceresi (toplam sürenin %7'si; 100 sn'de ~7 sn kaynaşma)
 * · Kuintik easing: hızlanma/yavaşlama tamamen hissedilmez
 * · 4 katman: alfa + bulanıklık + ölçek + renk imzalı ışık perdesi
 * · Çıkan sahne: büyür, bulanıklaşır, kararır (hafif)
 * · Gelen sahne: hafif büyükten küçülerek yerine oturur, netleşir
 * · Işık perdesi: teori renginde yumuşak bir ışık ortadan süzülür
 */
export function renderStaged(
  c: Omit<StageCtx, "local" | "alpha">,
  theory: { stages: { until: number }[]; color: string },
  drawers: StageDrawer[]
) {
  const stages = theory.stages;
  let idx = stages.findIndex((s) => c.p <= s.until - 1e-9);
  if (idx === -1) idx = stages.length - 1;
  const start = idx === 0 ? 0 : stages[idx - 1].until;
  const end = stages[idx].until;
  const local = clamp01((c.p - start) / (end - start));

  // Harman penceresi — uzun ve yumuşak
  const bw = 0.035;
  const supportFilter = typeof c.ctx.filter === "string";

  const drawLayer = (
    i: number,
    alpha: number,
    localOverride: number,
    mode: "out" | "in"
  ) => {
    if (alpha <= 0.005 || !drawers[i]) return;
    const st0 = i === 0 ? 0 : stages[i - 1].until;
    const st1 = stages[i].until;
    const lc = localOverride ?? clamp01((c.p - st0) / (st1 - st0));
    const ctx = c.ctx;
    ctx.save();
    // Katman 1: bulanıklık (çıkan daha çok bulanıklaşır)
    if (supportFilter) {
      const blur = mode === "out" ? (1 - alpha) * 3.4 : (1 - alpha) * 2.6;
      if (blur > 0.25) ctx.filter = `blur(${blur.toFixed(2)}px)`;
    }
    // Katman 2: ölçek (çıkan büyür, gelen küçülerek oturur)
    const sc =
      mode === "out"
        ? 1 + (1 - alpha) * 0.055
        : 1.045 - 0.045 * alpha;
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

  const bnd = start; // bu aşamaya giriş sınırı
  let blending = false;
  let k = 1;
  if (idx > 0 && c.p < bnd + bw) {
    blending = true;
    k = smootherstep(bnd - bw * 0.55, bnd + bw * 0.55, c.p);
    // ÇIKAN (önceki aşama) — alt katman
    drawLayer(idx - 1, 1 - k, 1, "out");
    // GELEN (bu aşama) — üst katman
    drawLayer(idx, k, local, "in");
  } else if (idx < stages.length - 1 && c.p > end - bw) {
    // Sonraki aşamadan GİRİŞ var: bu sahne ÇIKIYOR
    blending = true;
    k = smootherstep(end - bw * 0.55, end + bw * 0.55, c.p);
    drawLayer(idx, 1 - k, local, "out");
    drawLayer(idx + 1, k, 0, "in");
  } else {
    drawLayer(idx, 1, local, "in");
  }

  // Katman 4: renk imzalı ışık perdesi (sadece harman sırasında)
  if (blending) {
    const veil = Math.sin(clamp01(k) * Math.PI); // 0→1→0
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
}

/** Aşama sınırı mı (cues sesleri için) — [from,to] aralığında sınır var mı? */
export function crossedBoundary(
  from: number,
  to: number,
  stages: { until: number }[]
): number[] {
  const hits: number[] = [];
  for (let i = 0; i < stages.length - 1; i++) {
    const b = stages[i].until;
    if (from < to ? from < b && b <= to : from < b || b <= to) hits.push(b);
  }
  return hits;
}
