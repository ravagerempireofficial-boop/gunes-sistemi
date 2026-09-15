"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DeviceBoardIcon,
  DevicePhoneIcon,
  DevicePcIcon,
  SunOrbitIcon,
} from "@/components/solar-system/icons";

/**
 * DeviceGate — açılışta "Hangi cihazdasınız?" sorusu sorar.
 *
 * · Akıllı Tahta (EBA): büyük dokunma hedefleri, tahta modu (zoom 1.42),
 *   yüksek kontrast — sınıf projeksiyonu için.
 * · Telefon: dikey ekran, kompakt panel, dokunmatik öncelikli.
 * · Bilgisayar: fare + klavye, geniş görüş.
 *
 * GEÇİŞ KURALLARI (asla ihlal edilmez):
 * · Giriş: 4 katman kademeli yükselir (blur + translate + opacity, 1.5 sn)
 * · Çıkış: içerik önce kaynaşarak söner (0.75 sn), ardından arka plan
 *   katmanları yavaşça büyüyerek erir (1.05 sn) — ani kesme asla yok.
 */

export type DeviceChoice = "board" | "phone" | "pc";

interface DeviceOption {
  id: DeviceChoice;
  name: string;
  desc: string;
  Icon: (props: { className?: string }) => React.ReactNode;
}

const DEVICES: DeviceOption[] = [
  {
    id: "board",
    name: "Akıllı Tahta",
    desc: "EBA · Sınıf ekranı — büyük yazı, büyük dokunma hedefleri, yüksek kontrast",
    Icon: DeviceBoardIcon,
  },
  {
    id: "phone",
    name: "Telefon",
    desc: "Dikey ekran · Dokunmatik — kompakt paneller, mobil düzen",
    Icon: DevicePhoneIcon,
  },
  {
    id: "pc",
    name: "Bilgisayar",
    desc: "Fare + klavye — geniş görüş, tüm paneller açık",
    Icon: DevicePcIcon,
  },
];

/** Tercih kalıcı hatırlanır (localStorage). */
function readSaved(): DeviceChoice | null {
  try {
    const v = localStorage.getItem("deviceChoice");
    if (v === "board" || v === "phone" || v === "pc") return v;
  } catch {
    /* storage yok */
  }
  return null;
}

export function applyDeviceChoice(
  d: DeviceChoice,
  api: {
    setBoardMode: (v: boolean) => void;
    setPanelOpen: (v: boolean) => void;
    requestFullscreen?: () => void;
  }
) {
  try {
    localStorage.setItem("deviceChoice", d);
  } catch {
    /* storage yok */
  }
  if (d === "board") {
    api.setBoardMode(true);
    api.setPanelOpen(true);
    api.requestFullscreen?.();
  } else if (d === "phone") {
    api.setBoardMode(false);
    api.setPanelOpen(false);
  } else {
    api.setBoardMode(false);
    api.setPanelOpen(true);
  }
}

export default function DeviceGate({
  onDone,
}: {
  onDone: (choice: DeviceChoice) => void;
}) {
  const [leaving, setLeaving] = useState<DeviceChoice | null>(null);
  const [saved, setSaved] = useState<DeviceChoice | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    // Bir kare sonra oku: hidrasyon uyuşmazlığı ve lint uyarısı olmasın
    const id = requestAnimationFrame(() => setSaved(readSaved()));
    return () => cancelAnimationFrame(id);
  }, []);

  const pick = useCallback(
    (d: DeviceChoice) => {
      if (doneRef.current) return; // çift tıklama koruması
      doneRef.current = true;
      setLeaving(d);
      // Katman 1 (içerik) 0.75 sn + katman 2 (arka plan) 1.05+0.18 sn →
      // toplam yumuşak el sıkışma ~1.35 sn; simülasyon altta zaten hazır.
      window.setTimeout(() => onDone(d), 1250);
    },
    [onDone]
  );

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-[#040406] ${
        leaving ? "gate-layer-out" : ""
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Cihaz seçimi"
    >
      {/* KATMAN 1 — nebula bulutları (ekstrem yumuşak, blur 80px) */}
      <div
        className="gate-blob gate-blob-a"
        style={{
          left: "-12%",
          top: "-18%",
          width: "58vw",
          height: "58vw",
          background:
            "radial-gradient(circle, rgba(251,191,36,0.16), transparent 65%)",
        }}
      />
      <div
        className="gate-blob gate-blob-b"
        style={{
          right: "-16%",
          bottom: "-22%",
          width: "64vw",
          height: "64vw",
          background:
            "radial-gradient(circle, rgba(168,85,247,0.09), transparent 62%)",
        }}
      />
      <div
        className="gate-blob gate-blob-c"
        style={{
          left: "30%",
          bottom: "-30%",
          width: "52vw",
          height: "52vw",
          background:
            "radial-gradient(circle, rgba(244,114,182,0.07), transparent 60%)",
        }}
      />
      {/* KATMAN 2 — sürüklenen yıldız dokusu */}
      <div className="gate-stars" />
      {/* KATMAN 3 — vinyet + tarama ışığı */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <div className="gate-sheen" />

      {/* KATMAN 4 — içerik (kademeli yükseliş) */}
      <div
        className={`relative z-10 flex min-h-full flex-col items-center justify-center px-4 py-10 ${
          leaving ? "gate-content-out" : ""
        }`}
      >
        {/* Logo + başlık */}
        <div
          className="gate-rise flex flex-col items-center text-center"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="relative mb-5">
            <div
              className="absolute inset-0 -z-10 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(251,191,36,0.28), transparent 70%)",
                filter: "blur(24px)",
              }}
            />
            <SunOrbitIcon className="h-14 w-14 text-amber-400 sm:h-16 sm:w-16" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_18px_rgba(251,191,36,0.25)] sm:text-4xl lg:text-5xl">
            Güneş Sistemi{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              3D
            </span>
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
            Etkileşimli uzay simülasyonu · 49 animasyonlu teori · 90.000
            yıldızlı Samanyolu
          </p>
        </div>

        {/* Soru */}
        <div
          className="gate-rise mt-10 text-center"
          style={{ animationDelay: "0.32s" }}
        >
          <h2 className="text-xl font-bold text-zinc-100 sm:text-2xl">
            Hangi cihazdasınız?
          </h2>
          <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
            Seçiminize göre ekran, dokunma ve yazı boyutları kendini uyarlar.
          </p>
        </div>

        {/* 3 cihaz kartı */}
        <div className="mt-7 grid w-full max-w-3xl gap-3.5 sm:grid-cols-3 sm:gap-4">
          {DEVICES.map((d, i) => {
            const isSaved = saved === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => pick(d.id)}
                aria-label={`${d.name} olarak devam et`}
                className={`gate-card gate-rise group relative flex min-h-[104px] flex-col items-center gap-2.5 rounded-2xl border p-5 text-center outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 sm:min-h-[150px] sm:p-6 ${
                  isSaved
                    ? "border-amber-400/40 bg-amber-500/10 shadow-[0_0_42px_-10px_rgba(251,191,36,0.4)]"
                    : "border-white/10 bg-white/[0.045] shadow-[0_10px_40px_-18px_rgba(0,0,0,0.9)]"
                } hover:border-amber-400/45 hover:bg-amber-500/[0.09] hover:shadow-[0_14px_52px_-14px_rgba(251,191,36,0.35)]`}
                style={{ animationDelay: `${0.5 + i * 0.16}s` }}
              >
                <span
                  className={`rounded-2xl border p-3 transition-colors duration-700 ${
                    isSaved
                      ? "border-amber-400/40 bg-amber-500/15 text-amber-300"
                      : "border-white/10 bg-white/5 text-zinc-300 group-hover:border-amber-400/40 group-hover:text-amber-300"
                  }`}
                >
                  <d.Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                </span>
                <span className="text-base font-bold text-zinc-100 sm:text-lg">
                  {d.name}
                </span>
                <span className="hidden text-xs leading-relaxed text-zinc-500 sm:block">
                  {d.desc}
                </span>
                {isSaved && (
                  <span className="absolute right-2.5 top-2.5 rounded-full border border-amber-400/35 bg-amber-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                    tercihiniz
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* İmza — yapımcı */}
        <div
          className="gate-rise mt-10 flex flex-col items-center gap-1"
          style={{ animationDelay: "1.1s" }}
        >
          <div
            className="h-px w-24"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(251,191,36,0.5), transparent)",
            }}
          />
          <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            yapımcı
          </p>
          <p className="text-sm font-semibold tracking-wide text-amber-300/90">
            Samir Arabzadeh
          </p>
        </div>
      </div>
    </div>
  );
}
