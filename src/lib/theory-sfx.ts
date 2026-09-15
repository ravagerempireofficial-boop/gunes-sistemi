"use client";

import type { SfxName } from "./theories";

/**
 * TheorySfx v3 — teori animasyonları için SINEMATİK WebAudio ses motoru.
 *
 * · GERÇEK SAMPLE ÖNCELİĞİ: internetten indirilen gerçek patlama kayıtları
 *   (public/sfx/*.mp3) önce çalmaya çalışılır; sample yoksa / yüklenemezse
 *   otomatik olarak prosedürel sese düşer (fallback). Sample + prosedürel
 *   sub-boom katmanı birlikte çalarak gerçek "GÜM" hissini verir.
 * · Gerçekçi katmanlı patlama: ani çatlama (transient) + gövde gürültüsü
 *   (bandpass süpürme + soft clipping) + SUB-BASS düşüşü + enkaz çıtırtısı
 *   + uzun yankı (convolver reverb) → "GÜM / BOM" hissi
 * · Süpernova: mega katmanlı (şok düdüğü + dev sub + metalik harmonikler +
 *   6 sn enkaz yağmuru)
 * · ConvolverNode ile üretilmiş stereo yankı; her ses ıslak+kuru karışım
 * · Sesler stereo panner'lı — uzay derinliği
 * * Sample'lar fetch + decodeAudioData ile lazy yüklenir; her hata sessizce
 *   yutulur, hiçbir exception yukarı sızmaz.
 */

function noiseBuffer(ctx: AudioContext, seconds: number, brown = false) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  if (brown) {
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      d[i] = last * 3.2;
    }
  } else {
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  return buf;
}

/** Yankı için stereo impulse response (üstel sönümlü gürültü). */
function impulseResponse(ctx: AudioContext, seconds: number, decay = 2.6) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}

/** Soft-clipper: gürültüyü analog doygunluğa sokar (gerçek patlama hissi). */
function makeShaper(ctx: AudioContext, amount = 2.4) {
  const n = 256;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * amount);
  }
  const ws = ctx.createWaveShaper();
  ws.curve = curve;
  ws.oversample = "2x";
  return ws;
}

export class TheorySfx {
  /**
   * Gerçek sample dosyaları (public/sfx altında, internetten indirildi:
   * soundbible.com — Attribution 3.0). SfxName → dosya yolu; aynı ses birden
   * fazla ada eşlenebilir. Harici adlar için dosya yoksa prosedürel çalışır.
   */
  private static SAMPLE_MAP: Partial<Record<SfxName, string>> = {
    explosion: "/sfx/explosion-a.mp3",
    boom: "/sfx/boom-deep.mp3",
    supernova: "/sfx/supernova-rumble.mp3",
    crash: "/sfx/crash-impact.mp3",
    crack: "/sfx/thunder-crack.mp3",
    zap: "/sfx/energy-zap.mp3",
  };

  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private volume = 0.85;
  private buffers = new Map<string, AudioBuffer>();
  private sampleLoaders = new Map<string, Promise<AudioBuffer | null>>();
  private preloadStarted = false;

  /** Kullanıcı hareketinden sonra çağrılmalı. */
  async ensure() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") {
        await Promise.race([
          this.ctx.resume().catch(() => undefined),
          new Promise((r) => setTimeout(r, 500)),
        ]);
      }
      return;
    }
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new Ctor();
      this.ctx = ctx;

      const master = ctx.createGain();
      master.gain.value = this.volume;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      comp.attack.value = 0.004;
      comp.release.value = 0.24;
      master.connect(comp);

      // Yankı gönderimi (ıslak yol)
      const reverb = ctx.createConvolver();
      reverb.buffer = impulseResponse(ctx, 3.2, 2.4);
      const rg = ctx.createGain();
      rg.gain.value = 0.3;
      reverb.connect(rg);
      rg.connect(comp);
      this.reverb = reverb;
      this.reverbGain = rg;

      comp.connect(ctx.destination);
      this.master = master;
      await Promise.race([
        ctx.resume().catch(() => undefined),
        new Promise((r) => setTimeout(r, 500)),
      ]);
      // Gerçek sample'ları arka planda indir/decode et (engellemesiz).
      this.preloadSamples();
    } catch {
      /* ses yok — sessiz devam */
    }
  }

  /** Sample dosyasını indir + decode et; buffers map'ine koy. Hata → null. */
  private loadSample(url: string): Promise<AudioBuffer | null> {
    const job = this.sampleLoaders.get(url);
    if (job) return job;
    const fresh = (async () => {
      try {
        const ctx = this.ctx;
        if (!ctx || !url) return null;
        const res = await fetch(url);
        if (!res.ok) return null;
        const raw = await res.arrayBuffer();
        const buf = await ctx.decodeAudioData(raw);
        this.buffers.set(url, buf);
        return buf;
      } catch {
        return null;
      } finally {
        this.sampleLoaders.delete(url);
      }
    })();
    this.sampleLoaders.set(url, fresh);
    return fresh;
  }

  /** Tüm sample dosyalarını arka planda önden yükle (ensure sonrası). */
  private preloadSamples() {
    if (this.preloadStarted || !this.ctx) return;
    this.preloadStarted = true;
    for (const url of Object.values(TheorySfx.SAMPLE_MAP)) {
      if (url) void this.loadSample(url);
    }
  }

  /**
   * Gerçek sample'ı çal (rastgele pitch + power + pan + reverb send).
   * Dönüş: sample gerçekten çalındıysa true; buffer henüz hazır değilse veya
   * yoksa false → çağıran taraf prosedürel yola düşer.
   */
  private tryPlaySample(name: SfxName, p: number): boolean {
    const ctx = this.ctx;
    const master = this.master;
    const url = TheorySfx.SAMPLE_MAP[name];
    if (!ctx || !master || !url) return false;
    const buf = this.buffers.get(url);
    if (!buf) {
      // Henüz yüklü değil — yüklemeyi tetikle, bu tetikleme prosedürel kalsın.
      void this.loadSample(url);
      return false;
    }
    const t0 = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = 0.85 + Math.random() * 0.3; // doğal varyasyon
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(Math.min(1.1, 0.9 * p), t0 + 0.012);
    const panner = ctx.createStereoPanner();
    panner.pan.value = (Math.random() * 2 - 1) * 0.3;
    src.connect(env);
    env.connect(panner);
    panner.connect(master);
    if (this.reverb) {
      const send = ctx.createGain();
      send.gain.value = 0.32;
      panner.connect(send);
      send.connect(this.reverb);
    }
    src.start(t0);
    return true;
  }

  setVolume(v: number) {
    this.volume = Math.min(1, Math.max(0, v));
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(
        Math.max(0.0001, this.volume),
        this.ctx.currentTime,
        0.1
      );
    }
  }

  private noise(key: string, seconds: number, brown = false) {
    if (!this.ctx) return null;
    let buf = this.buffers.get(key);
    if (!buf) {
      buf = noiseBuffer(this.ctx, seconds, brown);
      this.buffers.set(key, buf);
    }
    return buf;
  }

  /**
   * Gürültü katmanı: bandpass/lowpass süpürmeli, doygunluklu, paneleme.
   * when: saniye gecikme.
   */
  private noiseLayer(opts: {
    peak: number;
    f0: number;
    f1: number;
    dur: number;
    type?: BiquadFilterType;
    delay?: number;
    pan?: number;
    drive?: number;
    brown?: boolean;
    attack?: number;
    reverb?: number;
  }) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const t0 = ctx.currentTime + (opts.delay ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = this.noise(
      `n${opts.f0}${opts.brown ? "b" : ""}`,
      Math.max(3.5, opts.dur + 0.5),
      opts.brown
    );
    src.loop = true;
    const flt = ctx.createBiquadFilter();
    flt.type = opts.type ?? "bandpass";
    flt.frequency.setValueAtTime(opts.f0, t0);
    flt.frequency.exponentialRampToValueAtTime(Math.max(25, opts.f1), t0 + opts.dur);
    flt.Q.value = 0.8;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(opts.peak, t0 + (opts.attack ?? 0.015));
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
    const panner = ctx.createStereoPanner();
    panner.pan.value = opts.pan ?? 0;
    src.connect(flt);
    if (opts.drive) {
      const ws = makeShaper(ctx, opts.drive);
      flt.connect(ws);
      ws.connect(env);
    } else {
      flt.connect(env);
    }
    env.connect(panner);
    panner.connect(master);
    if (this.reverb && (opts.reverb ?? 0.25) > 0) {
      const send = ctx.createGain();
      send.gain.value = opts.reverb ?? 0.25;
      panner.connect(send);
      send.connect(this.reverb);
    }
    src.start(t0);
    src.stop(t0 + opts.dur + 0.15);
  }

  /** Derin gümbürtü: düşen sine + harmonik 2. katman. */
  private boomLayer(opts: {
    freq: number;
    freqEnd?: number;
    peak: number;
    dur: number;
    delay?: number;
    pan?: number;
  }) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const t0 = ctx.currentTime + (opts.delay ?? 0);
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(opts.freq, t0);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(16, opts.freqEnd ?? opts.freq * 0.24),
      t0 + opts.dur
    );
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(opts.peak, t0 + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
    // Hafif overdrive ile dolgun sub
    const ws = makeShaper(ctx, 1.6);
    osc.connect(ws);
    ws.connect(env);
    const panner = ctx.createStereoPanner();
    panner.pan.value = opts.pan ?? 0;
    env.connect(panner);
    panner.connect(master);
    if (this.reverb) {
      const send = ctx.createGain();
      send.gain.value = 0.18;
      panner.connect(send);
      send.connect(this.reverb);
    }
    osc.start(t0);
    osc.stop(t0 + opts.dur + 0.1);
  }

  private tone(
    freq: number,
    freq2: number,
    peak: number,
    dur: number,
    type: OscillatorType = "sine",
    delay = 0,
    pan = 0
  ) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (freq2 !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq2), t0 + dur);
    }
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(peak, t0 + Math.min(0.4, dur * 0.2));
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    osc.connect(env);
    env.connect(panner);
    panner.connect(master);
    if (this.reverb) {
      const send = ctx.createGain();
      send.gain.value = 0.3;
      panner.connect(send);
      send.connect(this.reverb);
    }
    osc.start(t0);
    osc.stop(t0 + dur + 0.1);
  }

  /** Enkaz çıtırtısı: dağılan rastgele kısa pop'lar (patlama kuyruğu). */
  private debris(count = 7, dur = 2.2, peak = 0.1) {
    const ctx = this.ctx;
    if (!ctx) return;
    for (let i = 0; i < count; i++) {
      const d = 0.15 + Math.random() * dur;
      this.tone(
        180 + Math.random() * 900,
        60,
        peak * (1 - d / (dur + 0.5)),
        0.07,
        "triangle",
        d,
        (Math.random() * 2 - 1) * 0.8
      );
    }
  }

  /** Ana giriş — ses adına göre katmanlı dağıtım. */
  play(name: SfxName, power = 1) {
    if (!this.ctx || !this.master) return;
    const p = Math.max(0.2, Math.min(1.2, power));
    switch (name) {
      /* ---- GERÇEKÇİ PATLAMALAR (çok katmanlı GÜM/BOM) ---- */
      case "explosion":
        if (this.tryPlaySample(name, p)) {
          // Gerçek kayıt + prosedürel SUB-boom karışımı (gerçekçi GÜM)
          this.boomLayer({ freq: 80, peak: 0.42 * p, dur: 1.8 });
          this.noiseLayer({ peak: 0.12 * p, f0: 240, f1: 60, dur: 2.6, type: "lowpass", delay: 0.35, brown: true, attack: 0.35, reverb: 0.2 });
          this.debris(6, 1.8, 0.07 * p);
        } else {
          // 1) Anlık çatlama
          this.noiseLayer({ peak: 0.4 * p, f0: 5200, f1: 900, dur: 0.22, type: "highpass", drive: 2.6, reverb: 0.2 });
          // 2) Gövde: bant süpürmeli doygun gürültü
          this.noiseLayer({ peak: 0.5 * p, f0: 1900, f1: 110, dur: 1.5, drive: 2.8, pan: -0.15 });
          // 3) SUB-BASS düşüşü (GÜM)
          this.boomLayer({ freq: 82, peak: 0.6 * p, dur: 1.9 });
          this.boomLayer({ freq: 150, peak: 0.24 * p, dur: 0.9, delay: 0.02 });
          // 4) Enkaz uğultusu + çıtırtı
          this.noiseLayer({ peak: 0.16 * p, f0: 240, f1: 60, dur: 3.2, type: "lowpass", delay: 0.5, brown: true, attack: 0.4 });
          this.debris(8, 2.4, 0.09 * p);
        }
        break;
      case "supernova":
        if (this.tryPlaySample(name, p)) {
          // 15 sn gerçek mega-rumble + dev prosedürel sub + şok ıslığı
          this.boomLayer({ freq: 58, peak: 0.6 * p, dur: 4.2 });
          this.boomLayer({ freq: 40, peak: 0.4 * p, dur: 5.4, delay: 0.15 });
          this.noiseLayer({ peak: 0.18 * p, f0: 3400, f1: 240, dur: 2.4, attack: 0.45, reverb: 0.5 });
          this.noiseLayer({ peak: 0.14 * p, f0: 300, f1: 55, dur: 6, type: "lowpass", delay: 1.2, brown: true, attack: 0.8, reverb: 0.4 });
          this.debris(10, 4.2, 0.09 * p);
        } else {
          // Şok düdüğü (inip sönen ıslık)
          this.noiseLayer({ peak: 0.3 * p, f0: 3400, f1: 240, dur: 2.6, attack: 0.5, reverb: 0.5 });
          // Mega gövde
          this.noiseLayer({ peak: 0.55 * p, f0: 1400, f1: 70, dur: 3.6, drive: 3 });
          // Dev SUB (BOM)
          this.boomLayer({ freq: 62, peak: 0.75 * p, dur: 4.2 });
          this.boomLayer({ freq: 42, peak: 0.5 * p, dur: 5.5, delay: 0.12 });
          // Metalik harmonik çanlar
          this.tone(220, 190, 0.14 * p, 2.8, "sawtooth", 0.1, -0.4);
          this.tone(330, 280, 0.1 * p, 2.4, "sawtooth", 0.22, 0.4);
          // Enkaz yağmuru (6 sn)
          this.noiseLayer({ peak: 0.2 * p, f0: 300, f1: 55, dur: 6, type: "lowpass", delay: 1.2, brown: true, attack: 0.8, reverb: 0.4 });
          this.debris(12, 4.6, 0.11 * p);
        }
        break;
      case "crash":
        if (this.tryPlaySample(name, p)) {
          // Gerçek kaya/heyelan darbesi + çift prosedürel sub + moloz
          this.boomLayer({ freq: 92, peak: 0.45 * p, dur: 2.1 });
          this.boomLayer({ freq: 54, peak: 0.32 * p, dur: 3.0, delay: 0.15 });
          this.noiseLayer({ peak: 0.12 * p, f0: 200, f1: 50, dur: 3.2, type: "lowpass", delay: 0.7, brown: true, attack: 0.45 });
          this.debris(8, 2.4, 0.08 * p);
        } else {
          // Gezegen çarpışması: metalik çatlak + çift sub + moloz
          this.noiseLayer({ peak: 0.45 * p, f0: 3600, f1: 500, dur: 0.3, type: "highpass", drive: 3 });
          this.tone(320, 70, 0.3 * p, 0.5, "square", 0, 0.2);
          this.noiseLayer({ peak: 0.4 * p, f0: 1200, f1: 100, dur: 1.8, drive: 2.6, pan: 0.2 });
          this.boomLayer({ freq: 95, peak: 0.55 * p, dur: 2.2 });
          this.boomLayer({ freq: 55, peak: 0.4 * p, dur: 3.2, delay: 0.18 });
          this.noiseLayer({ peak: 0.14 * p, f0: 200, f1: 50, dur: 3.6, type: "lowpass", delay: 0.8, brown: true, attack: 0.5 });
          this.debris(9, 2.8, 0.1 * p);
        }
        break;
      case "boom":
        if (this.tryPlaySample(name, p)) {
          // Gerçek derin gümbürtü + yumuşak prosedürel sub desteği
          this.boomLayer({ freq: 88, peak: 0.28 * p, dur: 1.3 });
        } else {
          this.boomLayer({ freq: 110, peak: 0.5 * p, dur: 1.5 });
          this.noiseLayer({ peak: 0.22 * p, f0: 500, f1: 60, dur: 1.2, type: "lowpass" });
        }
        break;
      /* ---- YILDIZ / KOZMİK ---- */
      case "starform":
        // Yükselen parıltı + ateşleme patlaması
        this.tone(90, 620, 0.2 * p, 2.8, "sine", 0, -0.3);
        this.tone(140, 940, 0.14 * p, 2.8, "triangle", 0.3, 0.3);
        this.noiseLayer({ peak: 0.22 * p, f0: 300, f1: 2600, dur: 2.4, delay: 0.4, attack: 0.8 });
        this.boomLayer({ freq: 140, freqEnd: 40, peak: 0.4 * p, dur: 1.6, delay: 2.1 });
        this.noiseLayer({ peak: 0.3 * p, f0: 2200, f1: 150, dur: 1.4, drive: 2.2, delay: 2.15 });
        break;
      case "shimmer": {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
          this.tone(f, f, 0.09 * p, 2.4, "sine", i * 0.16, i % 2 ? 0.4 : -0.4)
        );
        break;
      }
      case "chime": {
        [392, 523.25, 784].forEach((f, i) =>
          this.tone(f, f, 0.12 * p, 2.2, "triangle", i * 0.12, i % 2 ? 0.35 : -0.35)
        );
        break;
      }
      case "bell":
        this.tone(660, 655, 0.16 * p, 3.2, "sine", 0, -0.25);
        this.tone(990, 985, 0.1 * p, 2.6, "sine", 0.01, 0.25);
        this.tone(1320, 1310, 0.05 * p, 2.2, "sine", 0.02, 0);
        break;
      case "warp":
        // Uzay bükülmesi: inen süpürme + titreşim
        this.tone(1200, 55, 0.24 * p, 2.2, "sawtooth", 0, -0.2);
        this.noiseLayer({ peak: 0.26 * p, f0: 400, f1: 3000, dur: 1.8, delay: 0.2, reverb: 0.45 });
        this.boomLayer({ freq: 70, freqEnd: 30, peak: 0.34 * p, dur: 2.4, delay: 0.5 });
        break;
      case "zap":
        if (this.tryPlaySample(name, p)) {
          // Gerçek elektrik kaydı + ince prosedürel square vurgusu
          this.tone(1600, 260, 0.12 * p, 0.3, "square", 0, -0.25);
        } else {
          this.noiseLayer({ peak: 0.34 * p, f0: 4200, f1: 700, dur: 0.32, type: "bandpass", drive: 3, pan: 0.3 });
          this.tone(1600, 120, 0.2 * p, 0.28, "square", 0, -0.3);
        }
        break;
      case "glitch":
        for (let i = 0; i < 6; i++) {
          this.tone(
            300 + Math.random() * 1800,
            200 + Math.random() * 900,
            0.1 * p,
            0.05 + Math.random() * 0.09,
            "square",
            i * 0.07,
            (Math.random() * 2 - 1) * 0.7
          );
        }
        this.noiseLayer({ peak: 0.12 * p, f0: 2000, f1: 400, dur: 0.7, type: "highpass" });
        break;
      /* ---- GEÇİŞ / ATMOSFER ---- */
      case "whoosh":
        this.noiseLayer({ peak: 0.3 * p, f0: 220, f1: 2600, dur: 2.2, attack: 0.6, reverb: 0.35 });
        break;
      case "wind":
        this.noiseLayer({ peak: 0.2 * p, f0: 400, f1: 900, dur: 3.5, attack: 0.7, reverb: 0.3 });
        break;
      case "rumble":
        this.boomLayer({ freq: 52, peak: 0.32 * p, dur: 2.8 });
        this.noiseLayer({ peak: 0.14 * p, f0: 160, f1: 55, dur: 2.6, type: "lowpass", brown: true, attack: 0.4 });
        break;
      case "lava":
        this.noiseLayer({ peak: 0.3 * p, f0: 160, f1: 70, dur: 3.4, type: "lowpass", drive: 2, brown: true, attack: 0.5, reverb: 0.3 });
        for (let i = 0; i < 4; i++) {
          this.tone(90 + Math.random() * 60, 40, 0.2 * p, 0.4, "sine", 0.3 + i * 0.7);
        }
        break;
      case "crack":
        if (this.tryPlaySample(name, p)) {
          // Gerçek gök gürültüsü çatlaması + hafif sub gövdesi
          this.tone(230, 60, 0.16 * p, 0.55, "square");
          this.noiseLayer({ peak: 0.14 * p, f0: 900, f1: 120, dur: 1.8, type: "lowpass", brown: true, attack: 0.18, reverb: 0.35 });
        } else {
          this.noiseLayer({ peak: 0.5 * p, f0: 5200, f1: 700, dur: 0.42, type: "highpass", drive: 2.4 });
          this.tone(240, 60, 0.2 * p, 0.5, "square");
        }
        break;
      case "freeze":
        this.noiseLayer({ peak: 0.26 * p, f0: 3800, f1: 6800, dur: 2.8, type: "highpass", attack: 0.6, reverb: 0.4 });
        this.tone(1400, 2600, 0.08 * p, 2.2, "sine", 0.2, 0.2);
        break;
      case "merge":
        this.tone(70, 130, 0.3 * p, 1.6, "sine");
        this.noiseLayer({ peak: 0.2 * p, f0: 300, f1: 90, dur: 1.8, type: "lowpass" });
        this.boomLayer({ freq: 120, freqEnd: 45, peak: 0.3 * p, dur: 1.2, delay: 0.9 });
        break;
      case "engine":
        this.noiseLayer({ peak: 0.2 * p, f0: 90, f1: 130, dur: 4, type: "lowpass", brown: true, attack: 0.8, pan: -0.25, reverb: 0.15 });
        this.tone(55, 62, 0.16 * p, 4, "sawtooth", 0, 0.25);
        break;
      case "grow":
        this.tone(220, 440, 0.12 * p, 2.6, "triangle", 0, -0.2);
        this.tone(330, 660, 0.09 * p, 2.6, "sine", 0.4, 0.2);
        this.noiseLayer({ peak: 0.12 * p, f0: 600, f1: 1800, dur: 2.6, attack: 0.9, reverb: 0.35 });
        break;
      /* ---- SU / YAŞAM ---- */
      case "rain":
        this.noiseLayer({ peak: 0.16 * p, f0: 1800, f1: 2600, dur: 7.5, type: "highpass", attack: 1.5, reverb: 0.15 });
        break;
      case "hiss":
        this.noiseLayer({ peak: 0.24 * p, f0: 3400, f1: 5200, dur: 2.6, type: "highpass", attack: 0.5 });
        break;
      case "splash":
        this.noiseLayer({ peak: 0.4 * p, f0: 900, f1: 2600, dur: 0.9, reverb: 0.3 });
        this.tone(220, 90, 0.14 * p, 0.5, "sine");
        break;
      case "cell": {
        // Ilık biyolojik ortam: yumuşak baloncuklar
        const n = 6 + Math.floor(Math.random() * 4);
        for (let i = 0; i < n; i++) {
          this.tone(
            260 + Math.random() * 420,
            120 + Math.random() * 80,
            0.1 * p,
            0.18,
            "sine",
            i * 0.16 + Math.random() * 0.1,
            (Math.random() * 2 - 1) * 0.6
          );
        }
        break;
      }
      case "pop": {
        const n = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) {
          this.tone(
            300 + Math.random() * 500,
            180,
            0.16 * p,
            0.14,
            "sine",
            i * 0.12
          );
        }
        break;
      }
    }
  }

  dispose() {
    try {
      void this.ctx?.close();
    } catch {
      /* zaten kapalı */
    }
    this.ctx = null;
    this.master = null;
    this.reverb = null;
    this.reverbGain = null;
    this.buffers.clear();
    this.sampleLoaders.clear();
    this.preloadStarted = false;
  }
}
