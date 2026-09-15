"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  ChevronUp,
  CircleDashed,
  Maximize,
  Orbit,
  Pause,
  Play,
  Radar,
  RotateCcw,
  Sparkles,
  Stars,
  Tags,
  Telescope,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SceneToggles } from "./space-scene";
import { MUSIC_TRACKS } from "@/lib/space-music";
import { BoardIcon, ExpandIcon, MusicWaveIcon } from "./icons";

interface ControlPanelProps {
  paused: boolean;
  onTogglePause: () => void;
  speedValue: number;
  onSpeedChange: (v: number) => void;
  speedLabel: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onPresetTop: () => void;
  onPresetOblique: () => void;
  galaxyMode: boolean;
  onToggleGalaxyMode: () => void;
  toggles: SceneToggles;
  onToggle: (key: keyof SceneToggles, value: boolean) => void;
  musicOn: boolean;
  onToggleMusic: () => void;
  volume: number;
  onVolumeChange: (v: number) => void;
  trackId: string;
  onTrackChange: (id: string) => void;
  boardMode: boolean;
  onToggleBoardMode: () => void;
  onFullscreen: () => void;
  /** Mobil kompakt mod: tek satır + açılır tam kontroller */
  compact?: boolean;
}

function ToggleRow({
  icon: Icon,
  label,
  checked,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1">
      <span className="flex items-center gap-2 text-xs text-zinc-200">
        <Icon className="h-3.5 w-3.5 shrink-0 text-amber-400/80" aria-hidden />
        {label}
      </span>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        aria-label={label}
        className="data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-white/15 [&_[data-slot=switch-thumb]]:bg-zinc-100 data-[state=checked]:[&_[data-slot=switch-thumb]]:bg-zinc-950"
      />
    </label>
  );
}

function ControlsBody({
  paused,
  onTogglePause,
  speedValue,
  onSpeedChange,
  speedLabel,
  onZoomIn,
  onZoomOut,
  onReset,
  onPresetTop,
  onPresetOblique,
  galaxyMode,
  onToggleGalaxyMode,
  toggles,
  onToggle,
  musicOn,
  onToggleMusic,
  volume,
  onVolumeChange,
  trackId,
  onTrackChange,
  boardMode,
  onToggleBoardMode,
  onFullscreen,
}: Omit<ControlPanelProps, "compact">) {
  return (
    <>
      {/* Oynat + müzik + hız */}
      <div className="flex items-center gap-2.5">
        <Button
          size="icon"
          onClick={onTogglePause}
          aria-label={paused ? "Simülasyonu başlat" : "Simülasyonu duraklat"}
          className="h-10 w-10 shrink-0 rounded-full bg-amber-500 text-zinc-950 hover:bg-amber-400"
        >
          {paused ? (
            <Play className="h-4.5 w-4.5 translate-x-[1px]" aria-hidden />
          ) : (
            <Pause className="h-4.5 w-4.5" aria-hidden />
          )}
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={onToggleMusic}
          aria-label={musicOn ? "Uzay müziğini kapat" : "Uzay müziğini aç"}
          title={musicOn ? "Müziği kapat" : "Uzay ambiyansı müziği"}
          className={`h-10 w-10 shrink-0 rounded-full border-white/15 ${
            musicOn
              ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
              : "animate-pulse bg-white/5 text-zinc-300 hover:bg-white/15 hover:text-white"
          }`}
        >
          {musicOn ? (
            <Volume2 className="h-4.5 w-4.5" aria-hidden />
          ) : (
            <VolumeX className="h-4.5 w-4.5" aria-hidden />
          )}
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[11px] font-medium text-zinc-400">
              Zaman Hızı
            </span>
            <span className="text-xs font-semibold tabular-nums text-amber-300">
              {speedLabel}
            </span>
          </div>
          <Slider
            value={[speedValue]}
            min={0}
            max={100}
            step={1}
            onValueChange={([v]) => onSpeedChange(v)}
            aria-label="Zaman hızı"
            className="mt-1.5 [&_[data-slot=slider-range]]:bg-amber-400"
          />
        </div>
      </div>

      {musicOn && (
        <div className="mt-2.5">
          {/* Parça seçici: 4 ambiyans parçası */}
          <div className="flex items-center gap-2">
            <MusicWaveIcon className="h-3.5 w-3.5 shrink-0 text-amber-400/80" aria-hidden />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                const idx = MUSIC_TRACKS.findIndex((t) => t.id === trackId);
                onTrackChange(
                  MUSIC_TRACKS[(idx - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length].id
                );
              }}
              aria-label="Önceki parça"
              className="h-6 w-6 shrink-0 text-zinc-400 hover:bg-white/10 hover:text-amber-300"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden>
                <path d="M6 5h2v14H6zM20 5v14L9 12z" />
              </svg>
            </Button>
            <div className="min-w-0 flex-1 text-center">
              <div className="truncate text-[11px] font-semibold text-amber-300">
                {MUSIC_TRACKS.find((t) => t.id === trackId)?.name}
              </div>
              <div className="truncate text-[9px] text-zinc-500">
                {MUSIC_TRACKS.findIndex((t) => t.id === trackId) + 1} / {MUSIC_TRACKS.length} · parça
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                const idx = MUSIC_TRACKS.findIndex((t) => t.id === trackId);
                onTrackChange(MUSIC_TRACKS[(idx + 1) % MUSIC_TRACKS.length].id);
              }}
              aria-label="Sonraki parça"
              className="h-6 w-6 shrink-0 text-zinc-400 hover:bg-white/10 hover:text-amber-300"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden>
                <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
              </svg>
            </Button>
          </div>
          <div className="mt-1.5 flex items-center gap-2.5">
            <span className="shrink-0 text-[11px] text-zinc-400">Ses</span>
            <Slider
              value={[volume]}
              min={0}
              max={100}
              step={1}
              onValueChange={([v]) => onVolumeChange(v)}
              aria-label="Müzik ses seviyesi"
              className="[&_[data-slot=slider-range]]:bg-amber-400"
            />
          </div>
        </div>
      )}

      <Separator className="my-3 bg-white/10" />

      {/* Kamera */}
      <div className="grid grid-cols-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPresetTop}
          aria-label="Yukarıdan bak"
          title="Yukarıdan bakış"
          className="h-9 border-white/15 bg-white/5 text-zinc-100 hover:bg-white/15 hover:text-white"
        >
          <Orbit className="h-4 w-4" aria-hidden />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onPresetOblique}
          aria-label="Eğik bakış"
          title="Eğik bakış"
          className="h-9 border-white/15 bg-white/5 text-zinc-100 hover:bg-white/15 hover:text-white"
        >
          <Telescope className="h-4 w-4" aria-hidden />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomIn}
          aria-label="Yakınlaştır"
          title="Yakınlaştır"
          className="h-9 border-white/15 bg-white/5 text-zinc-100 hover:bg-white/15 hover:text-white"
        >
          <ZoomIn className="h-4 w-4" aria-hidden />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomOut}
          aria-label="Uzaklaştır"
          title="Uzaklaştır"
          className="h-9 border-white/15 bg-white/5 text-zinc-100 hover:bg-white/15 hover:text-white"
        >
          <ZoomOut className="h-4 w-4" aria-hidden />
        </Button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="h-9 border-white/15 bg-white/5 text-zinc-100 hover:bg-white/15 hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Görünümü Sıfırla
        </Button>
        <Button
          size="sm"
          onClick={onToggleGalaxyMode}
          aria-pressed={galaxyMode}
          className={
            galaxyMode
              ? "h-9 bg-amber-500 text-zinc-950 hover:bg-amber-400"
              : "h-9 border border-amber-400/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/25 hover:text-amber-200"
          }
        >
          <Radar className="h-4 w-4" aria-hidden />
          Samanyolu
        </Button>
      </div>

      <Separator className="my-3 bg-white/10" />

      {/* Görünüm: akıllı tahta + tam ekran */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          onClick={onToggleBoardMode}
          aria-pressed={boardMode}
          className={
            boardMode
              ? "h-9 bg-amber-500 text-zinc-950 hover:bg-amber-400"
              : "h-9 border border-white/15 bg-white/5 text-zinc-100 hover:bg-white/15 hover:text-white"
          }
        >
          <BoardIcon className="h-4 w-4" aria-hidden />
          Akıllı Tahta
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onFullscreen}
          aria-label="Tam ekran"
          className="h-9 border-white/15 bg-white/5 text-zinc-100 hover:bg-white/15 hover:text-white"
        >
          <ExpandIcon className="h-4 w-4" aria-hidden />
          Tam Ekran
        </Button>
      </div>

      <Separator className="my-3 bg-white/10" />

      {/* Katmanlar */}
      <ToggleRow
        icon={Orbit}
        label="Orbit Çizgileri"
        checked={toggles.orbits}
        onChange={(v) => onToggle("orbits", v)}
      />
      <ToggleRow
        icon={Tags}
        label="Etiketler"
        checked={toggles.labels}
        onChange={(v) => onToggle("labels", v)}
      />
      <ToggleRow
        icon={Sparkles}
        label="Güneş Işıması (Korona)"
        checked={toggles.sunGlow}
        onChange={(v) => onToggle("sunGlow", v)}
      />
      <ToggleRow
        icon={CircleDashed}
        label="Asteroit Kuşağı"
        checked={toggles.belt}
        onChange={(v) => onToggle("belt", v)}
      />
      <ToggleRow
        icon={CircleDashed}
        label="Jüpiter Trojaları"
        checked={toggles.trojans}
        onChange={(v) => onToggle("trojans", v)}
      />
      <ToggleRow
        icon={CircleDashed}
        label="Kuiper Kuşağı"
        checked={toggles.kuiper}
        onChange={(v) => onToggle("kuiper", v)}
      />
      <ToggleRow
        icon={Sparkles}
        label="Oort Bulutu"
        checked={toggles.oort}
        onChange={(v) => onToggle("oort", v)}
      />
      <ToggleRow
        icon={Sparkles}
        label="Halley Kuyruklusu"
        checked={toggles.comet}
        onChange={(v) => onToggle("comet", v)}
      />
      <ToggleRow
        icon={Maximize}
        label="Sınırlar + Voyager'lar"
        checked={toggles.boundaries}
        onChange={(v) => onToggle("boundaries", v)}
      />
      <ToggleRow
        icon={Stars}
        label="Yıldız Alanı"
        checked={toggles.starfield}
        onChange={(v) => onToggle("starfield", v)}
      />
      <ToggleRow
        icon={Stars}
        label="Galaktik Dönüş"
        checked={toggles.galacticSpin}
        onChange={(v) => onToggle("galacticSpin", v)}
      />

      <p className="mt-2.5 text-[10px] leading-relaxed text-zinc-500">
        Sürükle: kamerayı döndür · Tekerlek: yakınlaştır · Tıkla: bilgi havuzunu
        aç
      </p>
    </>
  );
}

export default function ControlPanel(props: ControlPanelProps) {
  const { compact = false } = props;
  const [expanded, setExpanded] = useState(!compact);

  // Masaüstü ve mobil aynı kalıp: açılır-kapanır tam kontroller + ince bar
  return (
    <div
      className="pointer-events-auto w-full rounded-xl border border-white/10 bg-zinc-950/85 shadow-2xl shadow-black/50 backdrop-blur-md"
      role="group"
      aria-label="Simülasyon kontrolleri"
    >
      {expanded && (
        <div className="nice-scroll max-h-[46vh] overflow-y-auto p-3 pb-1 sm:max-h-[calc(100vh-11rem)]">
          <ControlsBody {...props} />
        </div>
      )}
      <div className="flex items-center gap-2 p-2.5">
        <Button
          size="icon"
          onClick={props.onTogglePause}
          aria-label={props.paused ? "Simülasyonu başlat" : "Simülasyonu duraklat"}
          className="h-9 w-9 shrink-0 rounded-full bg-amber-500 text-zinc-950 hover:bg-amber-400"
        >
          {props.paused ? (
            <Play className="h-4 w-4 translate-x-[1px]" aria-hidden />
          ) : (
            <Pause className="h-4 w-4" aria-hidden />
          )}
        </Button>
        <div className="min-w-0 flex-1">
          <Slider
            value={[props.speedValue]}
            min={0}
            max={100}
            step={1}
            onValueChange={([v]) => props.onSpeedChange(v)}
            aria-label="Zaman hızı"
            className="[&_[data-slot=slider-range]]:bg-amber-400"
          />
        </div>
        <span className="shrink-0 text-[10px] font-semibold tabular-nums text-amber-300">
          {props.speedLabel}
        </span>
        <Button
          size="icon"
          variant="outline"
          onClick={props.onToggleMusic}
          aria-label={props.musicOn ? "Müziği kapat" : "Uzay müziğini aç"}
          className={`h-9 w-9 shrink-0 rounded-full border-white/15 ${
            props.musicOn
              ? "bg-amber-500/20 text-amber-300"
              : "bg-white/5 text-zinc-300"
          }`}
        >
          {props.musicOn ? (
            <Volume2 className="h-4 w-4" aria-hidden />
          ) : (
            <VolumeX className="h-4 w-4" aria-hidden />
          )}
        </Button>
        <Button
          size="sm"
          onClick={props.onToggleGalaxyMode}
          aria-pressed={props.galaxyMode}
          className={`h-9 shrink-0 px-2.5 ${
            props.galaxyMode
              ? "bg-amber-500 text-zinc-950 hover:bg-amber-400"
              : "border border-amber-400/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/25"
          }`}
        >
          <Radar className="h-4 w-4" aria-hidden />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-label={expanded ? "Kontrolleri kapat" : "Tüm kontrolleri aç"}
          className="h-9 w-9 shrink-0 border-white/15 bg-white/5 text-zinc-200 hover:bg-white/15 hover:text-white"
        >
          <ChevronUp
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden
          />
        </Button>
      </div>
    </div>
  );
}
