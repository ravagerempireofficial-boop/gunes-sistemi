"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INTERIORS } from "@/lib/interiors";
import type { BodyData } from "@/lib/solar-data";
import type { RegionData } from "@/lib/interiors";
import { Navigation, NavigationOff, X } from "lucide-react";
import InteriorView from "./interior-view";
import Interior3D from "./interior3d";
import { Layers3DIcon } from "./icons";

interface PlanetInfoProps {
  body: BodyData;
  follow: boolean;
  onToggleFollow: () => void;
  onClose: () => void;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="text-xs font-semibold leading-snug text-zinc-100">
        {value}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-400/90">
      {children}
    </h3>
  );
}

export default function PlanetInfo({
  body,
  follow,
  onToggleFollow,
  onClose,
}: PlanetInfoProps) {
  const isSun = body.type === "Yıldız";
  const isMoon = body.type === "Uydu";
  const interior = INTERIORS[body.id];
  const [interior3dOpen, setInterior3dOpen] = useState(false);

  return (
    <div
      className="pointer-events-auto flex max-h-[56vh] flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950/85 shadow-2xl shadow-black/60 backdrop-blur-md sm:max-h-[min(74vh,600px)]"
      role="dialog"
      aria-label={`${body.name} bilgi paneli`}
    >
      {/* Başlık */}
      <div className="flex items-center gap-2.5 p-3.5 pb-2.5">
        <span
          className="h-4 w-4 shrink-0 rounded-full ring-2 ring-white/15"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${body.color}, ${body.color} 55%, rgba(0,0,0,0.55))`,
          }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold text-white">{body.name}</h2>
          {body.parentName && (
            <p className="truncate text-[10px] text-zinc-500">
              {body.parentName}&apos;in uydusu
            </p>
          )}
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{
            color: TYPE_COLORS_SAFE[body.type] ?? "#fbbf24",
            backgroundColor: `${TYPE_COLORS_SAFE[body.type] ?? "#fbbf24"}1f`,
          }}
        >
          {body.type}
        </span>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          aria-label="Bilgi panelini kapat"
          className="h-7 w-7 shrink-0 text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <Separator className="bg-white/10" />

      {/* Sekmeler */}
      <Tabs
        defaultValue="genel"
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <TabsList className="mx-3.5 mt-2.5 grid h-8 w-auto shrink-0 grid-cols-5 gap-1 rounded-lg border border-white/5 bg-white/5 p-0.5">
          <TabsTrigger
            value="genel"
            className="h-7 rounded-md text-[10px] data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300"
          >
            Genel
          </TabsTrigger>
          <TabsTrigger
            value="yapi"
            className="h-7 rounded-md text-[10px] data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300"
          >
            Yapı
          </TabsTrigger>
          <TabsTrigger
            value="yuzey"
            className="h-7 rounded-md text-[10px] data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300"
          >
            Yüzey
          </TabsTrigger>
          <TabsTrigger
            value="kesif"
            className="h-7 rounded-md text-[10px] data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300"
          >
            Keşif
          </TabsTrigger>
          <TabsTrigger
            value="bilgiler"
            className="h-7 rounded-md text-[10px] data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300"
          >
            Gerçekler
          </TabsTrigger>
        </TabsList>

        <div className="nice-scroll min-h-0 flex-1 overflow-y-auto">
          <TabsContent value="genel" className="m-0 p-3.5 pt-3">
            <p className="text-xs leading-relaxed text-zinc-300">
              {body.description}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Stat label="Çap" value={body.stats.diameter} />
              <Stat label="Kütle" value={body.stats.mass} />
              <Stat label="Yerçekimi" value={body.stats.gravity} />
              <Stat label="Gün Uzunluğu" value={body.stats.dayLength} />
              <Stat label="Eksen Eğikliği" value={body.stats.axialTilt} />
              <Stat label="Sıcaklık" value={body.stats.temp} />
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2">
              <Stat
                label={isSun ? "Galaktik Yörünge" : "Güneş'e Uzaklık"}
                value={body.orbitInfo.distance}
              />
              <Stat label="Yörünge Dönemi" value={body.orbitInfo.period} />
              <div className="grid grid-cols-2 gap-2">
                <Stat label="Yörünge Hızı" value={body.orbitInfo.velocity} />
                <Stat
                  label={isMoon ? "Ebeveyn Çevresinde" : "Uydu Sayısı"}
                  value={isMoon ? body.orbitInfo.period : body.orbitInfo.moons}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="yapi" className="m-0 p-3.5 pt-3">
            {interior && (
              <>
                <SectionTitle>İç Yapı Kesiti — Katman Katman</SectionTitle>
                <InteriorView profile={interior} />
                <Button
                  size="sm"
                  onClick={() => setInterior3dOpen(true)}
                  className="mt-2.5 h-8 w-full border border-amber-400/30 bg-amber-500/10 text-xs text-amber-300 hover:bg-amber-500/25 hover:text-amber-200"
                >
                  <Layers3DIcon className="h-4 w-4" aria-hidden />
                  3D Kesiti Aç — Katmanları Döndürerek İncele
                </Button>
                <Separator className="my-3 bg-white/5" />
              </>
            )}
            {body.surface && (
              <>
                <SectionTitle>Yüzey</SectionTitle>
                <p className="text-xs leading-relaxed text-zinc-300">
                  {body.surface}
                </p>
                <Separator className="my-3 bg-white/5" />
              </>
            )}
            {body.asteroidType && (
              <>
                <div className="rounded-lg border border-amber-400/20 bg-amber-500/5 p-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400/90">
                    Asteroit Sınıfı
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-amber-200">
                    {body.asteroidType}
                  </div>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-zinc-400">
                    Spektroskopi sınıfları yüzeyin yansıttığı ışığa göre belirlenir:
                    C karbonlu ve koyu (%75), S silisli ve parlak (%17), M metalik
                    demir-nikel (%8) — sınıf, gövdenin doğum hikayesini anlatır.
                  </p>
                </div>
                <Separator className="my-3 bg-white/5" />
              </>
            )}
            <SectionTitle>Atmosfer</SectionTitle>
            <p className="text-xs leading-relaxed text-zinc-300">
              {body.atmosphere}
            </p>
            <Separator className="my-3 bg-white/5" />
            <SectionTitle>Bileşim</SectionTitle>
            <p className="text-xs leading-relaxed text-zinc-300">
              {body.composition}
            </p>
            {!isSun && !isMoon && (
              <>
                <Separator className="my-3 bg-white/5" />
                <SectionTitle>Yörünge Karakteristikleri</SectionTitle>
                <div className="grid grid-cols-2 gap-2">
                  <Stat label="Dış Merkezlik" value={body.orbitInfo.eccentricity} />
                  <Stat label="Yörünge Eğimi" value={body.orbitInfo.inclination} />
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="yuzey" className="m-0 p-3.5 pt-3">
            {body.surface ? (
              <>
                <SectionTitle>Yüzey Görünümü</SectionTitle>
                <p className="text-xs leading-relaxed text-zinc-300">
                  {body.surface}
                </p>
              </>
            ) : (
              <p className="text-xs leading-relaxed text-zinc-500">
                Bu gökcisminin yüzeyi henüz yakından görüntülenmedi — üzerinde
                en çok çalışılan yönü bileşim ve yörünge verileridir.
              </p>
            )}
            <Separator className="my-3 bg-white/5" />
            <SectionTitle>Bileşim</SectionTitle>
            <p className="text-xs leading-relaxed text-zinc-300">
              {body.composition}
            </p>
          </TabsContent>

          <TabsContent value="kesif" className="m-0 p-3.5 pt-3">
            <SectionTitle>Keşif ve Görev Tarihi</SectionTitle>
            <p className="text-xs leading-relaxed text-zinc-300">
              {body.discovery}
            </p>
          </TabsContent>

          <TabsContent value="bilgiler" className="m-0 p-3.5 pt-3">
            <SectionTitle>Şaşırtıcı Gerçekler</SectionTitle>
            <ul className="space-y-2">
              {body.facts.map((fact, i) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed text-zinc-300">
                  <span className="mt-0.5 shrink-0 text-amber-400" aria-hidden>
                    ✦
                  </span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
            {!isSun && (
              <p className="mt-3 rounded-lg border border-white/5 bg-white/5 p-2 text-[10px] leading-relaxed text-zinc-500">
                Not: Görsel boyutlar ve mesafeler izleme konforu için
                ölçeklendirilmiştir; yörünge dönemleri, eğimleri ve dış
                merkezlikleri gerçek değerlerdir.
              </p>
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* Takip butonu */}
      {!isSun && (
        <div className="border-t border-white/10 p-3">
          <Button
            variant={follow ? "default" : "outline"}
            size="sm"
            onClick={onToggleFollow}
            className={
              follow
                ? "h-9 w-full bg-amber-500 text-zinc-950 hover:bg-amber-400"
                : "h-9 w-full border-white/15 bg-white/5 text-zinc-100 hover:bg-white/15 hover:text-white"
            }
          >
            {follow ? (
              <NavigationOff className="h-4 w-4" aria-hidden />
            ) : (
              <Navigation className="h-4 w-4" aria-hidden />
            )}
            {follow ? "Takibi Bırak" : "Bu Gökcismini Takip Et"}
          </Button>
        </div>
      )}

      {/* 3D iç yapı diyaloğu */}
      {interior && (
        <Interior3D
          bodyName={body.name}
          profile={interior}
          open={interior3dOpen}
          onOpenChange={setInterior3dOpen}
        />
      )}
    </div>
  );
}

const TYPE_COLORS_SAFE: Record<string, string> = {
  Yıldız: "#fbbf24",
  "Karasal Gezegen": "#a3e635",
  "Gaz Devi": "#fb923c",
  "Buz Devi": "#5eead4",
  "Cüce Gezegen": "#e879f9",
  Uydu: "#94a3b8",
  Asteroit: "#c9a227",
  "Kuyruklu Yıldız": "#67e8f9",
};

/* ------------------------------ Bölge kartı ----------------------------- */

export function RegionInfo({
  region,
  onClose,
}: {
  region: RegionData;
  onClose: () => void;
}) {
  return (
    <div
      className="pointer-events-auto flex max-h-[56vh] flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950/85 shadow-2xl shadow-black/60 backdrop-blur-md sm:max-h-[min(74vh,600px)]"
      role="dialog"
      aria-label={`${region.name} bilgi paneli`}
    >
      <div className="flex items-center gap-2.5 p-3.5 pb-2.5">
        <span
          className="h-4 w-4 shrink-0 rounded-full ring-2 ring-white/15"
          style={{ background: region.color }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold text-white">{region.name}</h2>
          <p className="truncate text-[10px] text-zinc-500">{region.subtitle}</p>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ color: region.color, backgroundColor: `${region.color}1f` }}
        >
          {region.type}
        </span>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          aria-label="Bilgi panelini kapat"
          className="h-7 w-7 shrink-0 text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <Separator className="bg-white/10" />

      <div className="nice-scroll min-h-0 flex-1 overflow-y-auto p-3.5 pt-3">
        <div className="grid grid-cols-2 gap-2">
          {region.stats.map((s) => (
            <Stat key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
        <Separator className="my-3 bg-white/5" />
        <SectionTitle>Genel Bakış</SectionTitle>
        <p className="text-xs leading-relaxed text-zinc-300">
          {region.description}
        </p>
        <Separator className="my-3 bg-white/5" />
        <SectionTitle>Bilgi Havuzu</SectionTitle>
        <ul className="space-y-2">
          {region.facts.map((fact, i) => (
            <li key={i} className="flex gap-2 text-xs leading-relaxed text-zinc-300">
              <span className="mt-0.5 shrink-0 text-amber-400" aria-hidden>
                ✦
              </span>
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
