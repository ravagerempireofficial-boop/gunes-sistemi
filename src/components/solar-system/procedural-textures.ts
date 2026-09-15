import * as THREE from "three";

/**
 * Prosedürel canvas dokuları — dosya tabanlı dokuları olmayan gökcisimleri,
 * halkalar, korona ve yıldız parçacıkları için üretilir.
 */

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

/** Yüklenmiş dokuyu sRGB renk uzayına çevirir (renk haritaları için). */
export function toSRGB(tex: THREE.Texture): THREE.Texture {
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Yumuşak radyal glow sprite (korona, yıldız, seçim parlaması). */
export function makeGlowTexture(
  inner = "rgba(255,240,200,1)",
  mid = "rgba(255,170,60,0.45)",
  edge = "rgba(255,140,30,0)"
): THREE.Texture {
  const c = makeCanvas(256, 256);
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, inner);
  g.addColorStop(0.28, mid);
  g.addColorStop(1, edge);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Yıldız noktaları için küçük yumuşak beyaz nokta. */
export function makeStarSprite(): THREE.Texture {
  const c = makeCanvas(64, 64);
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Satürn halka dokusu — gerçek halka yapılarına esinli radyal bantlar. */
export function makeSaturnRingTexture(): THREE.Texture {
  const w = 512;
  const c = makeCanvas(w, 8);
  const ctx = c.getContext("2d")!;
  // Halka bölgeleri: [başlangıç, bitiş, opaklık, renk]
  const zones: [number, number, number, string][] = [
    [0.0, 0.09, 0.25, "#8f7d5a"], // D halkası
    [0.09, 0.22, 0.55, "#b3a075"], // C halkası
    [0.22, 0.58, 0.95, "#e3d2a4"], // B halkası (parlak)
    [0.58, 0.635, 0.12, "#3a352c"], // Cassini boşluğu
    [0.635, 0.87, 0.78, "#d4c294"], // A halkası
    [0.87, 0.885, 0.2, "#3a352c"], // Encke boşluğu
    [0.885, 0.95, 0.6, "#c9b88c"], // A dış
    [0.95, 1.0, 0.15, "#9a8a68"], // F kenarı
  ];
  for (const [a, b, alpha, color] of zones) {
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(Math.floor(a * w), 0, Math.ceil((b - a) * w), 8);
  }
  // İnce yoğunluk çizgileri
  ctx.globalAlpha = 1;
  for (let i = 0; i < 220; i++) {
    const x = Math.floor(Math.random() * w);
    const alpha = Math.random() * 0.35;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,245,220,${alpha})` : `rgba(60,50,35,${alpha})`;
    ctx.fillRect(x, 0, 1, 8);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  return tex;
}

/** Uranüs ince halkaları — birkaç koyu dar şerit. */
export function makeUranusRingTexture(): THREE.Texture {
  const w = 512;
  const c = makeCanvas(w, 4);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "rgba(30,30,30,0)";
  ctx.fillRect(0, 0, w, 4);
  const bands: [number, number, number][] = [
    [0.18, 0.21, 0.35],
    [0.4, 0.42, 0.3],
    [0.62, 0.65, 0.4],
    [0.86, 0.9, 0.55],
  ];
  for (const [a, b, alpha] of bands) {
    ctx.fillStyle = `rgba(190,210,205,${alpha})`;
    ctx.fillRect(Math.floor(a * w), 0, Math.ceil((b - a) * w), 4);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  return tex;
}

/**
 * Dokusu olmayan gökcisimleri (küçük uydular, asteroitler, cüce gezegenler)
 * için taban renkli lekeli doku üretir.
 */
export function makeRockyTexture(
  base: string,
  variance = 0.22,
  craterish = false
): THREE.Texture {
  const w = 256;
  const h = 128;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  const r = parseInt(base.slice(1, 3), 16);
  const g = parseInt(base.slice(3, 5), 16);
  const b = parseInt(base.slice(5, 7), 16);
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const rad = 1 + Math.random() * (craterish ? 9 : 5);
    const dark = Math.random() > 0.5 ? -1 : 1;
    const v = variance * dark * Math.random();
    ctx.fillStyle = `rgba(${Math.max(0, Math.min(255, r + r * v))},${Math.max(
      0,
      Math.min(255, g + g * v)
    )},${Math.max(0, Math.min(255, b + b * v))},${0.25 + Math.random() * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
    if (craterish && rad > 5) {
      ctx.fillStyle = `rgba(${Math.max(0, r - 40)},${Math.max(0, g - 40)},${Math.max(
        0,
        b - 40
      )},0.35)`;
      ctx.beginPath();
      ctx.arc(x + rad * 0.2, y + rad * 0.25, rad * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** RingGeometry için UV'leri radyal olacak şekilde yeniden eşler. */
export function remapRingUVs(geo: THREE.RingGeometry, inner: number, outer: number) {
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const r = Math.sqrt(x * x + y * y);
    uv.setXY(i, (r - inner) / (outer - inner), 0.5);
  }
  uv.needsUpdate = true;
}

/**
 * Gerçekçi asteroit kayası dokusu: çatlaklı, kraterli, tozlu yüzey.
 * InstancedMesh haritası olarak kullanılır; instanceColor ile çarpılır,
 * bu yüzden açık gri tabanlı üretilir.
 */
export function makeRockTexture(): THREE.Texture {
  const S = 256;
  const c = makeCanvas(S, S);
  const ctx = c.getContext("2d")!;

  // Taban: gri-bej kaya
  ctx.fillStyle = "#b0a898";
  ctx.fillRect(0, 0, S, S);

  // Yamasal renk alanları (demir/karbon lekeleri)
  for (let i = 0; i < 46; i++) {
    const x = Math.random() * S;
    const y = Math.random() * S;
    const r = 10 + Math.random() * 46;
    const shade = Math.random();
    ctx.fillStyle =
      shade > 0.5
        ? `rgba(128,118,102,${0.1 + Math.random() * 0.16})`
        : `rgba(158,150,138,${0.08 + Math.random() * 0.14})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // İnce paralel mineral çizgileri
  ctx.globalAlpha = 0.12;
  for (let i = 0; i < 26; i++) {
    ctx.strokeStyle = Math.random() > 0.5 ? "#8a8072" : "#c8c0b0";
    ctx.lineWidth = 0.8 + Math.random() * 1.4;
    const y = Math.random() * S;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(S * 0.3, y + (Math.random() - 0.5) * 30, S * 0.7, y + (Math.random() - 0.5) * 30, S, y + (Math.random() - 0.5) * 18);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Çarpma kraterleri: koyu çukur + açık kenarlı TOP
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * S;
    const y = Math.random() * S;
    const r = 1.5 + Math.pow(Math.random(), 2.2) * 11;
    // koyu çukur
    ctx.fillStyle = "rgba(60,54,46,0.42)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    // güneşe bakan açık kenar
    ctx.strokeStyle = "rgba(232,226,212,0.5)";
    ctx.lineWidth = Math.max(0.7, r * 0.22);
    ctx.beginPath();
    ctx.arc(x, y, r * 0.92, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
  }

  // Mikro gren (tozlu regolit hissi)
  const img = ctx.getImageData(0, 0, S, S);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 26;
    d[i] = Math.min(255, Math.max(0, d[i] + n));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
