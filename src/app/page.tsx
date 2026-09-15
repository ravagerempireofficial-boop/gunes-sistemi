"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ArticleView from "@/components/solar-system/article-view";
import BodyList from "@/components/solar-system/body-list";
import ControlPanel from "@/components/solar-system/control-panel";
import DeviceGate, {
  applyDeviceChoice,
  type DeviceChoice,
} from "@/components/solar-system/device-gate";
import PlanetInfo, { RegionInfo } from "@/components/solar-system/planet-info";
import TheoriesList from "@/components/solar-system/theories-list";
import TheoryView from "@/components/solar-system/theory-view";
import {
  BoardIcon,
  MusicWaveIcon,
  PoolIcon,
  SunOrbitIcon,
  TheoryIcon,
} from "@/components/solar-system/icons";
import type { SceneToggles } from "@/components/solar-system/space-scene";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { ARTICLES } from "@/lib/knowledge";
import { REGIONS } from "@/lib/interiors";
import { BODIES, type BodyData } from "@/lib/solar-data";
import { MUSIC_TRACKS, spaceMusic } from "@/lib/space-music";
import { THEORIES, getTheory } from "@/lib/theories";
import {
  CalendarDays,
  Download,
  Loader2,
  RotateCcw,
  Timer,
} from "lucide-react";

/** WebGL sahnesi yalnızca istemcide yüklenir */
const SpaceScene = dynamic(
  () => import("@/components/solar-system/space-scene"),
  { ssr: false, loading: () => null }
);

/**
 * Slider (0-100) -> gün/saniye (üstel ölçek).
 * v=0 → GERÇEK ZAMAN (1 saniye/saniye = 1/86400 gün/sn)
 * v=100 → 365 gün/sn
 */
function sliderToSpeed(v: number) {
  return (1 / 86400) * Math.pow(365 * 86400, v / 100);
}

export default function Home() {
  const [bodies, setBodies] = useState<BodyData[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">(
    "loading"
  );

  const [paused, setPaused] = useState(false);
  const [speedValue, setSpeedValue] = useState(70);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [follow, setFollow] = useState(false);
  const [simDays, setSimDays] = useState(0);
  const [musicOn, setMusicOn] = useState(false);
  const [volume, setVolume] = useState(60);
  const [trackId, setTrackId] = useState(MUSIC_TRACKS[0].id);
  const [galaxyMode, setGalaxyMode] = useState(false);
  const [boardMode, setBoardMode] = useState(false);
  const [toggles, setToggles] = useState<SceneToggles>({
    orbits: true,
    labels: true,
    belt: true,
    trojans: true,
    kuiper: true,
    oort: true,
    comet: true,
    boundaries: true,
    galacticSpin: true,
    sunGlow: true,
    starfield: true,
  });

  // Panel: liste ↔ bilgi ↔ makale ↔ teori ↔ teori kitaplığı
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelView, setPanelView] = useState<
    "list" | "info" | "article" | "theory" | "theories"
  >("list");
  const [articleId, setArticleId] = useState<string | null>(null);
  const [theoryId, setTheoryId] = useState<string | null>(null);
  const [gateOpen, setGateOpen] = useState(true);
  const isMobile = useIsMobile();

  const canvasRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
    setPreset: (p: "top" | "oblique") => void;
  }>(null);
  const baseTimeRef = useRef<number>(Date.now());

  /* ------------------------- veri yükleme (API) ------------------------- */
  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/planets");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error("API hatası");
      setBodies(data.bodies as BodyData[]);
      setStatus("ready");
    } catch {
      // Statik sitede / API erişilemezse: veriler zaten paketin içinde
      setBodies(BODIES as BodyData[]);
      setStatus("ready");
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  // Mobilde panel kapalı başlasın + akıllı tahta tercihini hatırla
  useEffect(() => {
    if (window.innerWidth < 640) setPanelOpen(false);
    try {
      if (localStorage.getItem("boardMode") === "1") setBoardMode(true);
      sessionStorage.removeItem("ctxLostReloaded");
    } catch {
      /* storage yok */
    }
  }, []);

  /* --------------------------- klavye kısayolu --------------------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      // ESC her koşulda çalışmalı (odak nerede olursa olsun)
      if (e.code === "Escape") {
        setGalaxyMode(false);
        setArticleId(null);
        setTheoryId(null);
        setPanelView("list");
        return;
      }
      // Space: yazı alanlarında ve butonlarda (native davranış) müdahale etme
      if (tag === "INPUT" || tag === "BUTTON" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ------------------------------ türetilmiş ----------------------------- */
  const speed = useMemo(() => sliderToSpeed(speedValue), [speedValue]);
  const speedLabel = useMemo(() => {
    const s = speed; // gün/sn
    if (s < 1 / 1440) {
      // Gerçek zaman yakını: saniye ölçeğinde göster
      return `1 sn = ${Math.max(1, Math.round(s * 86400))} sn`;
    }
    if (s < 1 / 24) {
      return `1 sn = ${(s * 1440).toLocaleString("tr-TR", {
        maximumFractionDigits: 1,
      })} dk`;
    }
    if (s < 2) {
      return `1 sn = ${(s * 24).toLocaleString("tr-TR", {
        maximumFractionDigits: 1,
      })} saat`;
    }
    return `${s.toLocaleString("tr-TR", {
      maximumFractionDigits: s < 10 ? 1 : 0,
    })} gün/sn`;
  }, [speed]);

  // Tarih yalnızca istemci tarafında hesaplanır (hydration uyumsuzluğu olmaz —
  // SSR sırasında canlı new Date() sunucu/istemci saat farkı üretiyordu).
  const [dateLabel, setDateLabel] = useState("");
  useEffect(() => {
    const d = new Date(baseTimeRef.current + simDays * 86_400_000);
    const dateStr = d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    // Yavaş hızlarda saat de gösterilir (gerçek zaman hissi)
    if (speed < 1) {
      setDateLabel(
        `${dateStr} · ${d.toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      );
    } else {
      setDateLabel(dateStr);
    }
  }, [simDays, speed]);

  const elapsedLabel = useMemo(
    () => `+${Math.floor(simDays).toLocaleString("tr-TR")} gün`,
    [simDays]
  );

  const selectedBody = bodies.find((b) => b.id === selectedId) ?? null;
  const selectedRegion =
    REGIONS.find((r) => r.id === selectedId) ?? null;
  const selectedArticle =
    ARTICLES.find((a) => a.id === articleId) ?? null;
  const selectedTheory = theoryId ? getTheory(theoryId) : undefined;

  /* ------------------------------- geri çağırmalar ---------------------- */
  const handleToggle = useCallback(
    (key: keyof SceneToggles, value: boolean) =>
      setToggles((t) => ({ ...t, [key]: value })),
    []
  );

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
    setFollow(false);
    setArticleId(null);
    setTheoryId(null);
    if (id) {
      setPanelView("info");
      setPanelOpen(true);
    }
  }, []);

  const handleListSelect = useCallback((id: string) => {
    setSelectedId(id);
    setArticleId(null);
    setTheoryId(null);
    const isBody = id !== "asteroid-belt" && !REGIONS.some((r) => r.id === id);
    setFollow(isBody && id !== "sun");
    setPanelView("info");
  }, []);

  const handleArticleOpen = useCallback((id: string) => {
    setArticleId(id);
    setTheoryId(null);
    setPanelView("article");
    setPanelOpen(true);
  }, []);

  const handleTheoryOpen = useCallback((id: string) => {
    setTheoryId(id);
    setArticleId(null);
    setPanelView("theory");
    setPanelOpen(true);
  }, []);

  const handleTheoriesOpen = useCallback(() => {
    setTheoryId(null);
    setArticleId(null);
    setPanelView("theories");
    setPanelOpen(true);
  }, []);

  const handleTick = useCallback((days: number) => setSimDays(days), []);

  const toggleMusic = useCallback(async () => {
    if (musicOn) {
      spaceMusic.stop();
      setMusicOn(false);
    } else {
      spaceMusic.setTrack(trackId);
      await spaceMusic.start();
      spaceMusic.setVolume(volume / 100);
      setMusicOn(true);
    }
  }, [musicOn, volume, trackId]);

  const handleTrackChange = useCallback(
    (id: string) => {
      setTrackId(id);
      spaceMusic.setTrack(id);
    },
    []
  );

  const toggleBoardMode = useCallback(() => {
    setBoardMode((b) => {
      const next = !b;
      try {
        localStorage.setItem("boardMode", next ? "1" : "0");
      } catch {
        /* localStorage yok */
      }
      return next;
    });
  }, []);

  const handleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen?.();
    }
  }, []);

  const handleVolumeChange = useCallback((v: number) => {
    setVolume(v);
    spaceMusic.setVolume(v / 100);
  }, []);

  const togglePanel = useCallback(() => {
    setPanelOpen((open) => {
      if (!open) {
        setArticleId(null);
        setTheoryId(null);
        setPanelView(selectedId ? "info" : "list");
      }
      return !open;
    });
  }, [selectedId]);

  /** Cihaz kapısı tamamlandı: seçime göre arayüzü uyarla. */
  const handleDeviceDone = useCallback((d: DeviceChoice) => {
    applyDeviceChoice(d, {
      setBoardMode: (v) =>
        setBoardMode((prev) => {
          if (prev !== v) {
            try {
              localStorage.setItem("boardMode", v ? "1" : "0");
            } catch {
              /* storage yok */
            }
          }
          return v;
        }),
      setPanelOpen: (v) => setPanelOpen(v),
      requestFullscreen: () => {
        void document.documentElement.requestFullscreen?.().catch(() => {});
      },
    });
    setGateOpen(false);
  }, []);

  return (
    <div
      className={`flex min-h-screen flex-col bg-[#050507] text-zinc-100 ${
        boardMode ? "board-mode" : ""
      }`}
    >
      <main className="relative min-h-0 flex-1 overflow-hidden">
        {/* 3D WebGL simülasyonu — R3F % yükseklik çözümü için mutlak sarmalayıcı */}
        {status === "ready" && bodies.length > 0 && (
          <div className="absolute inset-0">
            <SpaceScene
              ref={canvasRef}
              bodies={bodies}
              speed={speed}
              paused={paused}
              toggles={toggles}
              selectedId={selectedId}
              follow={follow}
              galaxyMode={galaxyMode}
              onSelect={handleSelect}
              onTick={handleTick}
            />
          </div>
        )}

        {/* Başlık + tarih */}
        <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3 sm:p-4">
          <div className="pointer-events-auto relative overflow-hidden rounded-xl border border-amber-400/15 bg-gradient-to-b from-zinc-950/85 to-zinc-950/60 px-3.5 py-2.5 shadow-[0_0_24px_-8px_rgba(251,191,36,0.25)] backdrop-blur-md">
            {/* dekoratif mini yörünge halkası */}
            <svg
              className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 opacity-40"
              viewBox="0 0 80 80"
              aria-hidden
            >
              <ellipse cx="40" cy="40" rx="34" ry="14" fill="none" stroke="rgba(251,191,36,0.35)" strokeWidth="1" transform="rotate(-18 40 40)" />
              <ellipse cx="40" cy="40" rx="24" ry="9" fill="none" stroke="rgba(251,191,36,0.2)" strokeWidth="1" transform="rotate(-18 40 40)" />
              <circle cx="40" cy="40" r="5" fill="rgba(251,191,36,0.7)" />
            </svg>
            <h1 className="flex items-center gap-2 bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-base font-bold tracking-tight text-transparent sm:text-lg">
              <SunOrbitIcon className="h-5 w-5 text-amber-400" aria-hidden />
              Güneş Sistemi
              <span className="hidden rounded-md border border-amber-400/25 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 sm:inline">
                3D · Teoriler · Bilgi Havuzu
              </span>
            </h1>
            <p className="mt-0.5 text-[11px] tracking-wide text-zinc-400">
              Gerçek dokular · 3D iç yapılar · 90.000 yıldızlı Samanyolu · 49 sinematik teori
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              yapımcı: <span className="font-semibold text-amber-300/80">Samir Arabzadeh</span>
            </p>
          </div>
          <div className="pointer-events-auto flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  void toggleMusic();
                }}
                aria-label={musicOn ? "Müziği kapat" : "Uzay müziğini aç"}
                title={`Uzay ambiyansı — ${MUSIC_TRACKS.find((t) => t.id === trackId)?.name}`}
                className={`h-8 gap-1.5 border-white/15 px-2.5 text-xs backdrop-blur-md ${
                  musicOn
                    ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                    : "bg-zinc-950/70 text-zinc-100 hover:bg-white/15"
                }`}
              >
                <MusicWaveIcon className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden sm:inline">Uzay Müziği</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleTheoriesOpen}
                aria-label="Teori kitaplığını aç"
                title="Teori Kitaplığı — 49 animasyonlu teori, 15+ bölüm"
                className="h-8 gap-1.5 border-white/15 bg-zinc-950/70 px-2.5 text-xs text-zinc-100 backdrop-blur-md hover:bg-white/15 hover:text-white"
              >
                <TheoryIcon className="h-3.5 w-3.5 text-amber-400" aria-hidden />
                <span className="hidden sm:inline">Teoriler</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                asChild
                aria-label="EBA tek dosya sürümünü indir"
                title="Tek dosya HTML — telefonda/EBA'da 2 tıkla, internetsiz çalışır"
                className="h-8 gap-1.5 border-amber-400/30 bg-amber-500/15 px-2.5 text-xs text-amber-300 backdrop-blur-md hover:bg-amber-500/25 hover:text-amber-200"
              >
                <a href="/eba-gunes-sistemi.html" download="eba-gunes-sistemi.html">
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  <span className="hidden sm:inline">EBA İndir</span>
                </a>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={togglePanel}
                aria-label="Bilgi havuzunu aç/kapat"
                className="h-8 gap-1.5 border-white/15 bg-zinc-950/70 px-2.5 text-xs text-zinc-100 backdrop-blur-md hover:bg-white/15 hover:text-white"
              >
                <PoolIcon className="h-3.5 w-3.5 text-amber-400" aria-hidden />
                <span className="hidden sm:inline">Bilgi Havuzu</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={toggleBoardMode}
                aria-pressed={boardMode}
                aria-label="Akıllı tahta modu"
                title="Akıllı tahta modu — okul ekranları için büyüt"
                className={`h-8 gap-1.5 border-white/15 px-2.5 text-xs backdrop-blur-md ${
                  boardMode
                    ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                    : "bg-zinc-950/70 text-zinc-100 hover:bg-white/15 hover:text-white"
                }`}
              >
                <BoardIcon className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden lg:inline">Tahta</span>
              </Button>
              <Badge
                variant="outline"
                suppressHydrationWarning
                className="gap-1.5 border-white/15 bg-zinc-950/70 px-2.5 py-1 text-xs text-zinc-100 backdrop-blur-md"
              >
                <CalendarDays className="h-3.5 w-3.5 text-amber-400" aria-hidden />
                {dateLabel}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className="hidden gap-1.5 border-amber-400/25 bg-zinc-950/70 px-2.5 py-1 text-xs text-amber-300 backdrop-blur-md sm:inline-flex"
              >
                <Timer className="h-3.5 w-3.5" aria-hidden />
                {elapsedLabel}
              </Badge>
              {galaxyMode && (
                <Badge
                  variant="outline"
                  className="border-amber-400/40 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300 backdrop-blur-md"
                >
                  Samanyolu Görünümü · ESC ile çık
                </Badge>
              )}
            </div>
          </div>
        </header>

        {/* Kontrol paneli — mobilde kompakt bar, masaüstünde tam panel */}
        {status === "ready" && (
          <div className="nice-scroll absolute bottom-3 left-3 right-3 z-20 max-h-[58vh] overflow-y-auto sm:bottom-4 sm:left-4 sm:right-auto sm:max-h-[calc(100%-7rem)] sm:w-[268px] lg:w-[280px]">
            <ControlPanel
              compact={isMobile}
              paused={paused}
              onTogglePause={() => setPaused((p) => !p)}
              speedValue={speedValue}
              onSpeedChange={setSpeedValue}
              speedLabel={speedLabel}
              onZoomIn={() => canvasRef.current?.zoomIn()}
              onZoomOut={() => canvasRef.current?.zoomOut()}
              onReset={() => canvasRef.current?.resetView()}
              onPresetTop={() => canvasRef.current?.setPreset("top")}
              onPresetOblique={() => canvasRef.current?.setPreset("oblique")}
              galaxyMode={galaxyMode}
              onToggleGalaxyMode={() => {
                setGalaxyMode((g) => {
                  const next = !g;
                  if (next) {
                    // Galaksi modunda Samanyolu bilgi kartını aç
                    setFollow(false);
                    setSelectedId("galaxy");
                    setPanelView("info");
                    setPanelOpen(true);
                  } else {
                    setSelectedId(null);
                    setPanelView("list");
                  }
                  return next;
                });
              }}
              toggles={toggles}
              onToggle={handleToggle}
              musicOn={musicOn}
              onToggleMusic={() => {
                void toggleMusic();
              }}
              volume={volume}
              onVolumeChange={handleVolumeChange}
              trackId={trackId}
              onTrackChange={handleTrackChange}
              boardMode={boardMode}
              onToggleBoardMode={toggleBoardMode}
              onFullscreen={handleFullscreen}
            />
          </div>
        )}

        {/* Sağ panel: liste, bilgi veya makale */}
        {status === "ready" && panelOpen && (
          <div className="absolute inset-x-3 top-16 z-20 sm:inset-x-auto sm:right-4 sm:top-20 sm:w-[318px] lg:w-[340px] xl:w-[364px]">
            {panelView === "article" && selectedArticle ? (
              <ArticleView
                article={selectedArticle}
                onBack={() => {
                  setArticleId(null);
                  setPanelView("list");
                }}
              />
            ) : panelView === "theory" && selectedTheory ? (
              <TheoryView
                theory={selectedTheory}
                onBack={() => {
                  setTheoryId(null);
                  setPanelView("theories");
                }}
              />
            ) : panelView === "theories" ? (
              <TheoriesList
                onOpen={handleTheoryOpen}
                onClose={() => setPanelOpen(false)}
              />
            ) : panelView === "list" || (!selectedBody && !selectedRegion) ? (
              <BodyList
                bodies={bodies}
                selectedId={selectedId}
                onSelect={handleListSelect}
                onArticle={handleArticleOpen}
                onTheory={handleTheoryOpen}
                onClose={() => setPanelOpen(false)}
              />
            ) : selectedBody ? (
              <PlanetInfo
                body={selectedBody}
                follow={follow}
                onToggleFollow={() => setFollow((f) => !f)}
                onClose={() => {
                  setSelectedId(null);
                  setFollow(false);
                  setPanelView("list");
                }}
              />
            ) : selectedRegion ? (
              <RegionInfo
                region={selectedRegion}
                onClose={() => {
                  setSelectedId(null);
                  setPanelView("list");
                }}
              />
            ) : null}
          </div>
        )}

        {/* Yükleme / hata durumu */}
        {status === "loading" && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-[#050507]/90">
            <Loader2
              className="h-8 w-8 animate-spin text-amber-400"
              aria-hidden
            />
            <p className="text-sm text-zinc-400">Güneş sistemi yükleniyor…</p>
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[#050507]/90 px-4 text-center">
            <p className="text-sm text-zinc-300">
              Simülasyon verileri yüklenemedi. Bağlantınızı kontrol edip tekrar
              deneyin.
            </p>
            <Button
              onClick={load}
              className="bg-amber-500 text-zinc-950 hover:bg-amber-400"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Tekrar Dene
            </Button>
          </div>
        )}
      </main>

      {/* Açılış cihaz seçimi — aşırı yumuşak çok katmanlı geçişle kapanır */}
      {gateOpen && <DeviceGate onDone={handleDeviceDone} />}

      {/* Alt bilgi — her zaman en altta */}
      <footer className="mt-auto flex items-center justify-between gap-2 border-t border-white/10 bg-black/50 px-3 py-2 text-[11px] text-zinc-500 backdrop-blur-sm sm:px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <span className="truncate">
          Güneş Sistemi 3D · {bodies.length} gökcismi · {ARTICLES.length} makale ·{" "}
          {THEORIES.length} animasyonlu teori (441 yeni bölüm) ·{" "}
          <a
            href="/eba-gunes-sistemi.html"
            download="eba-gunes-sistemi.html"
            className="text-amber-300/70 underline decoration-amber-400/30 underline-offset-2 hover:text-amber-300"
          >
            EBA tek dosya sürümü
          </a>{" "}
          · <span className="text-amber-300/70">yapımcı: Samir Arabzadeh</span>
        </span>
        <span className="hidden shrink-0 sm:inline">
          Yörünge verileri gerçeğe göredir · Boyutlar ölçekli değildir
        </span>
      </footer>
    </div>
  );
}
