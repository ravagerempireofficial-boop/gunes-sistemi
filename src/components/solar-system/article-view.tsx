"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { KnowledgeArticle } from "@/lib/knowledge";
import { ArrowLeft } from "lucide-react";

/**
 * ArticleView — bilgi havuzundaki uzun ansiklopedi makalelerini
 * panel içinde okunabilir biçimde sunar.
 */

const CATEGORY_COLORS: Record<string, string> = {
  Galaksi: "#ffd9a0",
  Güneş: "#fbbf24",
  Ay: "#cbd5e1",
  Gezegenler: "#34d399",
  Asteroitler: "#a8a29e",
  Kuyrukluyıldızlar: "#7dd3fc",
  Yaşam: "#86efac",
  Ölçek: "#e879f9",
};

export default function ArticleView({
  article,
  onBack,
}: {
  article: KnowledgeArticle;
  onBack: () => void;
}) {
  const catColor = CATEGORY_COLORS[article.category] ?? "#fbbf24";

  return (
    <div
      className="pointer-events-auto flex max-h-[62vh] flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950/85 shadow-2xl shadow-black/60 backdrop-blur-md sm:max-h-[min(78vh,660px)]"
      role="article"
      aria-label={`${article.title} makalesi`}
    >
      <div className="flex items-start gap-2.5 p-3.5 pb-2.5">
        <Button
          size="icon"
          variant="ghost"
          onClick={onBack}
          aria-label="Makale listesine dön"
          className="h-7 w-7 shrink-0 text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </Button>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold leading-snug text-white">
            {article.title}
          </h2>
          <p className="mt-0.5 text-[11px] leading-snug text-zinc-400">
            {article.subtitle}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ color: catColor, backgroundColor: `${catColor}1f` }}
        >
          {article.category}
        </span>
      </div>

      <Separator className="bg-white/10" />

      <div className="nice-scroll min-h-0 flex-1 overflow-y-auto p-3.5 pt-3">
        <div className="space-y-3">
          {article.paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-xs leading-relaxed text-zinc-300 first:font-medium first:text-zinc-100"
            >
              {p}
            </p>
          ))}
        </div>

        <Separator className="my-3.5 bg-white/5" />

        <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-amber-400/90">
          Unutulmaz Detaylar
        </h3>
        <ul className="space-y-2">
          {article.facts.map((fact, i) => (
            <li
              key={i}
              className="flex gap-2 text-xs leading-relaxed text-zinc-300"
            >
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
