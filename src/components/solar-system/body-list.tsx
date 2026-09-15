"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ARTICLES } from "@/lib/knowledge";
import { REGIONS } from "@/lib/interiors";
import { THEORIES } from "@/lib/theories";
import { TYPE_COLORS, type BodyData, type BodyType } from "@/lib/solar-data";
import { BookOpen, Play, Search, X } from "lucide-react";

interface BodyListProps {
  bodies: BodyData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onArticle: (id: string) => void;
  onTheory: (id: string) => void;
  onClose: () => void;
}

const GROUP_ORDER: { label: string; types: BodyType[] }[] = [
  { label: "Yıldız", types: ["Yıldız"] },
  { label: "Gezegenler", types: ["Karasal Gezegen", "Gaz Devi", "Buz Devi"] },
  { label: "Cüce Gezegenler", types: ["Cüce Gezegen"] },
  { label: "Büyük Uydular", types: ["Uydu"] },
  { label: "Küçük Cisimler", types: ["Asteroit", "Kuyruklu Yıldız"] },
];

export default function BodyList({
  bodies,
  selectedId,
  onSelect,
  onArticle,
  onTheory,
  onClose,
}: BodyListProps) {
  const [query, setQuery] = useState("");

  const theoryMatches = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (q === "") return THEORIES;
    return THEORIES.filter(
      (t) =>
        t.title.toLocaleLowerCase("tr-TR").includes(q) ||
        t.subtitle.toLocaleLowerCase("tr-TR").includes(q)
    );
  }, [query]);

  const groups = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    return GROUP_ORDER.map((g) => ({
      label: g.label,
      items: bodies.filter(
        (b) =>
          g.types.includes(b.type) &&
          (q === "" ||
            b.name.toLocaleLowerCase("tr-TR").includes(q) ||
            (b.parentName ?? "").toLocaleLowerCase("tr-TR").includes(q))
      ),
    })).filter((g) => g.items.length > 0);
  }, [bodies, query]);

  const regionMatches = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (q === "") return REGIONS;
    return REGIONS.filter(
      (r) =>
        r.name.toLocaleLowerCase("tr-TR").includes(q) ||
        r.subtitle.toLocaleLowerCase("tr-TR").includes(q)
    );
  }, [query]);

  const articleMatches = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (q === "") return ARTICLES;
    return ARTICLES.filter(
      (a) =>
        a.title.toLocaleLowerCase("tr-TR").includes(q) ||
        a.subtitle.toLocaleLowerCase("tr-TR").includes(q) ||
        a.category.toLocaleLowerCase("tr-TR").includes(q)
    );
  }, [query]);

  return (
    <div
      className="pointer-events-auto flex max-h-[56vh] flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950/85 shadow-2xl shadow-black/60 backdrop-blur-md sm:max-h-[min(74vh,600px)]"
      role="dialog"
      aria-label="Gökcisimleri listesi"
    >
      <div className="flex items-center gap-2 p-3 pb-2.5">
        <h2 className="flex-1 text-sm font-bold text-white">
          Bilgi Havuzu
          <span className="ml-1.5 text-[10px] font-medium text-zinc-500">
            {bodies.length + REGIONS.length + ARTICLES.length + THEORIES.length} kayıt
          </span>
        </h2>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          aria-label="Listeyi kapat"
          className="h-7 w-7 text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <div className="relative px-3 pb-2.5">
        <Search
          className="pointer-events-none absolute left-5.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Gökcismi veya bölge ara…"
          aria-label="Gökcismi ara"
          className="h-8 border-white/10 bg-white/5 pl-7 text-xs text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-amber-500/40"
        />
      </div>

      <div className="nice-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        {groups.length === 0 &&
          regionMatches.length === 0 &&
          articleMatches.length === 0 &&
          theoryMatches.length === 0 && (
            <p className="py-6 text-center text-xs text-zinc-500">
              Sonuç bulunamadı.
            </p>
          )}

        {theoryMatches.length > 0 && (
          <div className="mb-2.5">
            <h3 className="mb-1 px-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Bilimsel Teoriler · Animasyonlu
            </h3>
            <div className="space-y-1">
              {theoryMatches.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onTheory(t.id)}
                  aria-label={`${t.title} animasyonunu oynat`}
                  className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-white/5"
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5"
                    aria-hidden
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: t.color, boxShadow: `0 0 6px ${t.color}` }}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-zinc-200 group-hover:text-amber-300">
                      {t.title}
                    </span>
                    <span className="block truncate text-[10px] text-zinc-500">
                      {t.subtitle}
                    </span>
                  </span>
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-300 transition-colors group-hover:bg-amber-500/30"
                    aria-hidden
                  >
                    <Play className="h-2.5 w-2.5 translate-x-[1px]" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        {groups.map((group) => (
          <div key={group.label} className="mb-2.5">
            <h3 className="mb-1 px-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              {group.label}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((b) => {
                const isSel = b.id === selectedId;
                return (
                  <button
                    key={b.id}
                    onClick={() => onSelect(b.id)}
                    aria-label={`${b.name} seç ve takip et`}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors ${
                      isSel
                        ? "bg-amber-500/15 ring-1 ring-amber-500/40"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full ring-1 ring-white/20"
                      style={{ background: b.color }}
                      aria-hidden
                    />
                    <span
                      className={`flex-1 truncate text-xs font-medium ${
                        isSel ? "text-amber-300" : "text-zinc-200"
                      }`}
                    >
                      {b.name}
                    </span>
                    {b.parentName && (
                      <span className="shrink-0 text-[10px] text-zinc-500">
                        {b.parentName}
                      </span>
                    )}
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: TYPE_COLORS[b.type] }}
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {articleMatches.length > 0 && (
          <div className="mb-2.5">
            <h3 className="mb-1 px-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Ansiklopedi · Uzun Okumalar
            </h3>
            <div className="space-y-1">
              {articleMatches.map((a) => (
                <button
                  key={a.id}
                  onClick={() => onArticle(a.id)}
                  aria-label={`${a.title} makalesini aç`}
                  className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-white/5"
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5"
                    aria-hidden
                  >
                    <BookOpen className="h-3 w-3 text-amber-400/90" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-zinc-200 group-hover:text-amber-300">
                      {a.title}
                    </span>
                    <span className="block truncate text-[10px] text-zinc-500">
                      {a.subtitle}
                    </span>
                  </span>
                  <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-zinc-600">
                    {a.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {regionMatches.length > 0 && (
          <div className="mb-2.5">
            <h3 className="mb-1 px-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Bölgeler · Sınırlar · Galaksi
            </h3>
            <div className="space-y-0.5">
              {regionMatches.map((r) => {
                const isSel = r.id === selectedId;
                return (
                  <button
                    key={r.id}
                    onClick={() => onSelect(r.id)}
                    aria-label={`${r.name} bilgi kartını aç`}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors ${
                      isSel
                        ? "bg-amber-500/15 ring-1 ring-amber-500/40"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-sm ring-1 ring-white/20"
                      style={{ background: r.color }}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-xs font-medium ${
                          isSel ? "text-amber-300" : "text-zinc-200"
                        }`}
                      >
                        {r.name}
                      </span>
                      <span className="block truncate text-[10px] text-zinc-500">
                        {r.subtitle}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <p className="border-t border-white/10 px-3 py-2 text-[10px] leading-relaxed text-zinc-500">
        Gökcismine tıkla: seçilir ve takip edilir. Bölgeler bilgi kartı açar.
      </p>
    </div>
  );
}
