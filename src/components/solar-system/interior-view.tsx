"use client";

import type { InteriorProfile } from "@/lib/interiors";

/**
 * InteriorView — gökcisminin iç yapısını katman katman gösteren
 * SVG kesit şeması + katman bilgileri (kalınlık, sıcaklık, bileşim).
 */

export default function InteriorView({ profile }: { profile: InteriorProfile }) {
  const layers = [...profile.layers].sort((a, b) => b.pct - a.pct);
  const R = 96;

  return (
    <div>
      <div className="flex items-start gap-3">
        <svg
          viewBox="0 0 200 200"
          className="h-36 w-36 shrink-0 drop-shadow-[0_0_18px_rgba(251,191,36,0.15)]"
          role="img"
          aria-label="İç yapı kesit şeması"
        >
          <defs>
            <radialGradient id="coreShine" cx="42%" cy="38%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
            </radialGradient>
          </defs>
          {/* Dış atmosfer/uzay halkası */}
          <circle cx="100" cy="100" r="99" fill="none" stroke="#ffffff14" strokeDasharray="3 4" />
          {layers.map((l) => (
            <circle
              key={l.name}
              cx="100"
              cy="100"
              r={(l.pct / 100) * R}
              fill={l.color}
              stroke="rgba(0,0,0,0.28)"
              strokeWidth="0.6"
            />
          ))}
          {/* Işık ve derinlik hissi */}
          <circle cx="100" cy="100" r={R} fill="url(#coreShine)" />
          {/* Kesit çizgisi */}
          <line x1="4" y1="100" x2="196" y2="100" stroke="#00000055" strokeWidth="0.8" />
          <circle cx="100" cy="100" r={R} fill="none" stroke="#ffffff2e" strokeWidth="1" />
        </svg>
        <p className="text-[11px] leading-relaxed text-zinc-400">{profile.intro}</p>
      </div>

      <ul className="mt-3 space-y-1.5">
        {profile.layers.map((l) => (
          <li
            key={l.name}
            className="rounded-lg border border-white/5 bg-white/[0.04] px-2.5 py-1.5"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/25"
                style={{ background: l.color }}
                aria-hidden
              />
              <span className="text-xs font-semibold text-zinc-100">{l.name}</span>
              <span className="ml-auto shrink-0 text-[10px] font-medium text-amber-300/90">
                {l.temp}
              </span>
            </div>
            <p className="mt-0.5 pl-[18px] text-[10.5px] leading-relaxed text-zinc-400">
              {l.detail}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] leading-relaxed text-zinc-600">
        Kesit şeması: yarıçap oranları gerçeğe yakındır, renkler semboliktir.
      </p>
    </div>
  );
}
