"use client";

/**
 * SpaceMusic v3 — Web Audio ile üretimsel, sinematik uzay ambiyansı
 * motoru. ARTIK 4 FARKLI PARÇA içerir; her parça kendi akor dizisi,
 * drone, çınlama ölçeği ve atmosfer parametrelerine sahiptir. Parçalar
 * yumuşak çapraz geçişle değiştirilir.
 *
 * Katmanlar: derin drone (LFO'lu lowpass), uzun akor pedleri (stereo pan),
 * kozmik rüzgâr (brown noise + bandpass LFO), pentatonik çınlamalar
 * (feedback delay), "kozmik balina" glissandoları ve 3,5 sn'lik üretilmiş
 * reverb. Tamamen prosedürel: ses dosyası yok, sonsuz döngü.
 *
 * start() yalnızca kullanıcı hareketiyle çağrılmalı (tarayıcı ses politikası).
 */

export interface MusicTrack {
  id: string;
  name: string;
  desc: string;
  /** Akor dizisi (MIDI nota numaraları) */
  chords: number[][];
  /** Drone osilatörleri: [frekans, tür, kazanç] */
  drone: Array<[number, OscillatorType, number]>;
  /** Drone kazancı */
  droneGain: number;
  /** Rüzgâr kazancı */
  windGain: number;
  /** Çınlama ölçeği (MIDI) */
  sparkleScale: number[];
  /** Çınlama aralığı: [min, max] ms */
  sparkleGap: [number, number];
  /** Balina glissandosu ortalama bekleme süresi (ms) */
  whaleGap: number;
  /** Akor ped kazancı çarpanı */
  padGain: number;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: "derin-uzay",
    name: "Derin Uzay",
    desc: "Klasik ambiyans — Am9 · F · C · G pedleri, sıcak drone",
    chords: [
      [45, 52, 57, 60, 64], // Am add9
      [41, 48, 53, 57, 60], // Fmaj7
      [48, 55, 59, 62, 67], // C add9
      [43, 50, 55, 59, 62], // G6
    ],
    drone: [
      [55.0, "sine", 1.0],
      [110.4, "sine", 0.55],
      [164.81, "triangle", 0.22],
    ],
    droneGain: 0.22,
    windGain: 0.05,
    sparkleScale: [69, 72, 74, 76, 79, 81, 84, 88],
    sparkleGap: [2200, 7400],
    whaleGap: 34000,
    padGain: 1,
  },
  {
    id: "yildiz-tozu",
    name: "Yıldız Tozu",
    desc: "Daha parlak ve narin — Dm9 · Bb · F · C, sık çınlamalar",
    chords: [
      [50, 57, 62, 65, 69], // Dm9
      [46, 53, 57, 60, 65], // Bbmaj7
      [41, 48, 53, 57, 60], // Fmaj7
      [48, 55, 59, 62, 67], // Cadd9
    ],
    drone: [
      [73.42, "sine", 1.0], // D2
      [146.83, "sine", 0.5],
      [220.0, "triangle", 0.18], // A3
    ],
    droneGain: 0.18,
    windGain: 0.035,
    sparkleScale: [74, 77, 79, 81, 84, 86, 89, 93],
    sparkleGap: [1400, 4600],
    whaleGap: 46000,
    padGain: 0.92,
  },
  {
    id: "kuiper-ruzgari",
    name: "Kuiper Rüzgârı",
    desc: "Soğuk ve boş — Em · C · G · D, güçlü buzul rüzgârı",
    chords: [
      [40, 47, 52, 55, 59], // Em9
      [48, 55, 60, 64, 67], // Cmaj9
      [43, 50, 55, 59, 62], // G6
      [50, 57, 62, 66, 69], // D add9
    ],
    drone: [
      [41.2, "sine", 1.0], // E1
      [82.41, "sine", 0.6],
      [123.47, "triangle", 0.2],
    ],
    droneGain: 0.24,
    windGain: 0.085,
    sparkleScale: [64, 67, 71, 74, 76, 79, 83, 86],
    sparkleGap: [3000, 9500],
    whaleGap: 52000,
    padGain: 0.95,
  },
  {
    id: "galaktik-okyanus",
    name: "Galaktik Okyanus",
    desc: "Derin ve gizemli — F#m · D · A · E, sık balina çağrıları",
    chords: [
      [42, 49, 54, 57, 61], // F#m9
      [38, 45, 50, 54, 57], // Dmaj9
      [45, 52, 57, 61, 64], // Amaj7
      [40, 47, 52, 56, 59], // E sus2
    ],
    drone: [
      [46.25, "sine", 1.0], // F#1
      [92.5, "sine", 0.55],
      [138.59, "triangle", 0.2],
    ],
    droneGain: 0.23,
    windGain: 0.045,
    sparkleScale: [66, 69, 71, 73, 78, 80, 83, 85],
    sparkleGap: [2400, 8000],
    whaleGap: 17000,
    padGain: 1.05,
  },
];

function midiToFreq(m: number) {
  return 440 * Math.pow(2, (m - 69) / 12);
}

export class SpaceMusic {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private reverbIn: GainNode | null = null;
  private delayIn: GainNode | null = null;
  private nodes: AudioNode[] = [];
  private timers: ReturnType<typeof setTimeout>[] = [];
  private chordIndex = 0;
  private running = false;
  private volume = 0.55;
  private pendingVolume: number | null = null;
  private trackId: string = MUSIC_TRACKS[0].id;

  get isRunning() {
    return this.running;
  }

  get currentTrackId() {
    return this.trackId;
  }

  static get tracks() {
    return MUSIC_TRACKS;
  }

  private get track(): MusicTrack {
    return (
      MUSIC_TRACKS.find((t) => t.id === this.trackId) ?? MUSIC_TRACKS[0]
    );
  }

  /** Üretilen 3.5 sn'lik stereo impulse response ile reverb odası kurar. */
  private buildReverb(ctx: AudioContext) {
    const len = Math.floor(ctx.sampleRate * 3.5);
    const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.6) * (1 - t * 0.2);
      }
    }
    const conv = ctx.createConvolver();
    conv.buffer = impulse;
    const inGain = ctx.createGain();
    inGain.gain.value = 1;
    const wet = ctx.createGain();
    wet.gain.value = 0.9;
    inGain.connect(conv);
    conv.connect(wet);
    wet.connect(this.master!);
    this.reverbIn = inGain;
    this.nodes.push(conv, inGain, wet);
  }

  private buildDelay(ctx: AudioContext) {
    const delay = ctx.createDelay(2.5);
    delay.delayTime.value = 0.46;
    const fb = ctx.createGain();
    fb.gain.value = 0.46;
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    const inGain = ctx.createGain();
    inGain.gain.value = 1;
    inGain.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(wet);
    wet.connect(this.master!);
    if (this.reverbIn) wet.connect(this.reverbIn);
    this.delayIn = inGain;
    this.nodes.push(delay, fb, wet, inGain);
  }

  private startDrone(ctx: AudioContext) {
    const t = this.track;
    const bus = ctx.createGain();
    bus.gain.value = t.droneGain;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 300;
    filter.Q.value = 0.8;

    // Filtre yavaşça nefes alır
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 120;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    this.nodes.push(lfo, lfoGain);

    for (const [freq, type, g] of t.drone) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.value = g;
      osc.connect(gain);
      gain.connect(filter);
      osc.start();
      this.nodes.push(osc, gain);
    }
    filter.connect(bus);
    bus.connect(this.master!);
    if (this.reverbIn) bus.connect(this.reverbIn);
    this.nodes.push(bus, filter);
  }

  private startWind(ctx: AudioContext) {
    const t = this.track;
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 380;
    band.Q.value = 1.1;

    const flfo = ctx.createOscillator();
    flfo.frequency.value = 0.03;
    const flfoG = ctx.createGain();
    flfoG.gain.value = 260;
    flfo.connect(flfoG);
    flfoG.connect(band.frequency);
    flfo.start();

    const gain = ctx.createGain();
    gain.gain.value = t.windGain;
    src.connect(band);
    band.connect(gain);
    gain.connect(this.master!);
    if (this.reverbIn) gain.connect(this.reverbIn);
    src.start();
    this.nodes.push(src, band, flfo, flfoG, gain);
  }

  private playPad(
    ctx: AudioContext,
    chord: number[],
    when: number,
    dur: number
  ) {
    const t = this.track;
    chord.forEach((midi, idx) => {
      const pan = ((idx / (chord.length - 1)) * 2 - 1) * 0.65 + (Math.random() * 0.2 - 0.1);
      const panner = ctx.createStereoPanner();
      panner.pan.value = pan;
      panner.connect(this.master!);
      if (this.reverbIn) panner.connect(this.reverbIn);
      this.nodes.push(panner);

      // Her nota: 2 detune sine + 1 oktav altı triangle
      const voices: Array<[number, OscillatorType, number]> = [
        [midiToFreq(midi), "sine", 1],
        [midiToFreq(midi) * 1.0023, "sine", 0.8],
        [midiToFreq(midi - 12), "triangle", 0.3],
      ];
      for (const [freq, type, g] of voices) {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;
        const env = ctx.createGain();
        const peak = 0.095 * g * t.padGain;
        env.gain.setValueAtTime(0.0001, when);
        env.gain.linearRampToValueAtTime(peak, when + 5);
        env.gain.setValueAtTime(peak, when + dur - 6);
        env.gain.linearRampToValueAtTime(0.0001, when + dur);
        osc.connect(env);
        env.connect(panner);
        osc.start(when);
        osc.stop(when + dur + 0.1);
      }
    });
  }

  private scheduleChord(ctx: AudioContext) {
    const step = () => {
      if (!this.running || !this.ctx) return;
      const dur = 16;
      this.playPad(
        ctx,
        this.track.chords[this.chordIndex % this.track.chords.length],
        ctx.currentTime + 0.05,
        dur
      );
      this.chordIndex++;
      this.timers.push(setTimeout(step, (dur - 7) * 1000));
    };
    step();
  }

  private scheduleSparkle(ctx: AudioContext) {
    const t = this.track;
    const step = () => {
      if (!this.running || !this.ctx) return;
      const scale = this.track.sparkleScale;
      const midi = scale[Math.floor(Math.random() * scale.length)];
      const at = ctx.currentTime + 0.02;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = midiToFreq(midi);
      const panner = ctx.createStereoPanner();
      panner.pan.value = Math.random() * 1.6 - 0.8;
      const env = ctx.createGain();
      const peak = 0.06 + Math.random() * 0.05;
      env.gain.setValueAtTime(0.0001, at);
      env.gain.linearRampToValueAtTime(peak, at + 0.04);
      env.gain.exponentialRampToValueAtTime(0.0001, at + 3.2 + Math.random() * 2.5);
      osc.connect(env);
      env.connect(panner);
      panner.connect(this.master!);
      if (this.delayIn) env.connect(this.delayIn);
      if (this.reverbIn) env.connect(this.reverbIn);
      osc.start(at);
      osc.stop(at + 6.5);
      this.nodes.push(osc, env, panner);
      const gap = this.track.sparkleGap;
      this.timers.push(
        setTimeout(step, gap[0] + Math.random() * (gap[1] - gap[0]))
      );
    };
    this.timers.push(setTimeout(step, 1500));
  }

  private scheduleWhale(ctx: AudioContext) {
    const step = () => {
      if (!this.running || !this.ctx) return;
      const at = ctx.currentTime + 0.05;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, at);
      osc.frequency.exponentialRampToValueAtTime(110, at + 7);
      // Hafif vibrato
      const vib = ctx.createOscillator();
      vib.frequency.value = 5;
      const vibG = ctx.createGain();
      vibG.gain.value = 3;
      vib.connect(vibG);
      vibG.connect(osc.frequency);
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, at);
      env.gain.linearRampToValueAtTime(0.055, at + 2.5);
      env.gain.linearRampToValueAtTime(0.0001, at + 8.5);
      osc.connect(env);
      env.connect(this.master!);
      if (this.reverbIn) env.connect(this.reverbIn);
      osc.start(at);
      vib.start(at);
      osc.stop(at + 9);
      vib.stop(at + 9);
      this.nodes.push(osc, vib, vibG, env);
      this.timers.push(
        setTimeout(step, this.track.whaleGap * (0.6 + Math.random() * 0.8))
      );
    };
    this.timers.push(setTimeout(step, 8000));
  }

  /** Tüm ses üreten katmanları durdurur (core: master/reverb/delay korunur). */
  private stopLayers() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    for (const n of this.nodes) {
      try {
        (n as OscillatorNode).stop?.();
      } catch {
        /* zaten durdurulmuş olabilir */
      }
      try {
        n.disconnect();
      } catch {
        /* bağlantı yok */
      }
    }
    this.nodes = [];
    this.reverbIn = null;
    this.delayIn = null;
  }

  /**
   * Parça değiştirir: çalışırken yumuşak geçiş yapar (fade-out → yeni
   * katmanlar → fade-in), çalışmıyorken yalnızca seçimi güncelleyip
   * ilerideki start()'a hazırlar.
   */
  setTrack(id: string) {
    if (id === this.trackId) return;
    const prev = MUSIC_TRACKS.find((t) => t.id === id);
    if (!prev) return;
    this.trackId = id;
    this.chordIndex = 0;
    if (this.running && this.ctx && this.master) {
      const ctx = this.ctx;
      const master = this.master;
      // Fade-out, katmanları yenile, fade-in
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.1);
      this.timers.push(
        setTimeout(() => {
          this.stopLayers();
          if (!this.ctx || !this.master) return;
          this.running = false; // yeniden başlatılabilir olsun
          this.buildReverb(this.ctx);
          this.buildDelay(this.ctx);
          this.startDrone(this.ctx);
          this.startWind(this.ctx);
          this.scheduleChord(this.ctx);
          this.scheduleSparkle(this.ctx);
          this.scheduleWhale(this.ctx);
          this.running = true;
          const vol = this.pendingVolume ?? this.volume;
          this.pendingVolume = null;
          this.master.gain.cancelScheduledValues(this.ctx.currentTime);
          this.master.gain.setTargetAtTime(
            Math.max(0.0001, vol),
            this.ctx.currentTime,
            0.8
          );
        }, 1200)
      );
    }
  }

  nextTrack() {
    const idx = MUSIC_TRACKS.findIndex((t) => t.id === this.trackId);
    this.setTrack(MUSIC_TRACKS[(idx + 1) % MUSIC_TRACKS.length].id);
    return this.trackId;
  }

  prevTrack() {
    const idx = MUSIC_TRACKS.findIndex((t) => t.id === this.trackId);
    this.setTrack(
      MUSIC_TRACKS[(idx - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length].id
    );
    return this.trackId;
  }

  async start() {
    if (this.running) return;
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new Ctor();
      this.ctx = ctx;
      // Bazı ortamlar (ses aygıtı olmayan başsız tarayıcılar) resume()'u
      // asıda bırakabilir; arayüzün kilitlenmemesi için zaman aşımıyla yarıştır
      await Promise.race([
        ctx.resume().catch(() => undefined),
        new Promise((r) => setTimeout(r, 800)),
      ]);
      if (ctx.state === "suspended") {
        await Promise.race([
          new Promise((r) => setTimeout(r, 300)).then(() =>
            ctx.resume().catch(() => undefined)
          ),
          new Promise((r) => setTimeout(r, 700)),
        ]);
      }

      const master = ctx.createGain();
      master.gain.value = 0.0001;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -20;
      comp.ratio.value = 3;
      master.connect(comp);
      comp.connect(ctx.destination);
      this.master = master;
      this.nodes.push(comp);

      this.buildReverb(ctx);
      this.buildDelay(ctx);

      const vol = this.pendingVolume ?? this.volume;
      this.pendingVolume = null;
      master.gain.linearRampToValueAtTime(Math.max(0.0001, vol), ctx.currentTime + 4);

      this.startDrone(ctx);
      this.startWind(ctx);
      this.scheduleChord(ctx);
      this.scheduleSparkle(ctx);
      this.scheduleWhale(ctx);
      this.running = true;
    } catch (e) {
      console.warn("[SpaceMusic] start hatası:", e);
      this.cleanup();
    }
  }

  stop() {
    if (!this.running || !this.ctx || !this.master) {
      this.cleanup();
      return;
    }
    const ctx = this.ctx;
    const master = this.master;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
    this.running = false;
    const ctxRef = ctx;
    this.timers.push(
      setTimeout(() => {
        this.cleanup();
        void ctxRef.close().catch(() => undefined);
      }, 1500)
    );
  }

  setVolume(v: number) {
    const clamped = Math.min(1, Math.max(0, v));
    if (this.running && this.ctx && this.master) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.setTargetAtTime(
        Math.max(0.0001, clamped),
        this.ctx.currentTime,
        0.15
      );
    } else {
      this.pendingVolume = clamped;
    }
  }

  private cleanup() {
    this.stopLayers();
    this.ctx = null;
    this.master = null;
    this.running = false;
  }
}

/** Uygulama geneli tek müzik motoru. */
export const spaceMusic = new SpaceMusic();
