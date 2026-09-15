"use client";

import { Button } from "@/components/ui/button";
import { THEORIES } from "@/lib/theories";
import { Play, X } from "lucide-react";
import { TheoryIcon } from "./icons";

/**
 * TheoriesList — Teori Kitaplığı: tüm animasyonlu teorilerin ayrılmış
 * kitaplık görünümü. Her kart; renk imzası, başlık, alt başlık, süre ve
 * aşama sayısını gösterir.
 */

export default function TheoriesList({
  onOpen,
  onClose,
}: {
  onOpen: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="pointer-events-auto flex max-h-[min(78vh,640px)] flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950/90 shadow-2xl shadow-black/60 backdrop-blur-md"
      role="dialog"
      aria-label="Teori Kitaplığı"
    >
      <div className="flex items-center gap-2 p-3 pb-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15">
          <TheoryIcon className="h-4 w-4 text-amber-400" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-white">Teori Kitaplığı</h2>
          <p className="text-[10px] text-zinc-500">
            {THEORIES.length} animasyonlu bilimsel teori · ses efektli · uzun anlatım
          </p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          aria-label="Kitaplığı kapat"
          className="h-7 w-7 text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <div className="nice-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        <div className="space-y-1.5">
          {THEORIES.map((t, i) => (
            <button
              key={t.id}
              onClick={() => onOpen(t.id)}
              aria-label={`${t.title} animasyonunu oynat`}
              className="group flex w-full items-start gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] p-2.5 text-left transition-colors hover:border-amber-400/30 hover:bg-amber-500/5"
            >
              <span
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${t.color}1f`, boxShadow: `inset 0 0 0 1px ${t.color}55` }}
                aria-hidden
              >
                <span className="text-[11px] font-black" style={{ color: t.color }}>
                  {i + 1}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-zinc-100 group-hover:text-amber-300">
                  {t.title}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-[10.5px] leading-relaxed text-zinc-400">
                  {t.subtitle}
                </span>
                <span className="mt-1 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-wide text-zinc-600">
                  <span>{t.stages.length} aşama</span>
                  <span aria-hidden>·</span>
                  <span>{t.duration} sn</span>
                  <span aria-hidden>·</span>
                  <span>ses efektli</span>
                </span>
              </span>
              <span
                className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-300 transition-colors group-hover:bg-amber-500/30"
                aria-hidden
              >
                <Play className="h-2.5 w-2.5 translate-x-[1px]" />
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="border-t border-white/10 px-3 py-2 text-[10px] leading-relaxed text-zinc-500">
        Animasyonlar aşamalar arasında yumuşak geçiş yapar; sağ üstteki düğmeyle
        ses efektlerini açıp kapatabilirsin.
      </p>
    </div>
  );
}
