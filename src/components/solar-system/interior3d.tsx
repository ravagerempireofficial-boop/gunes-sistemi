"use client";

import { useMemo } from "react";
import { Html, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import * as THREE from "three";
import type { InteriorProfile } from "@/lib/interiors";
import { Layers3DIcon } from "./icons";

/**
 * Interior3D — gezegen iç yapısının 3D kesit görünümü (v2).
 *
 * Kesit yöntemi: küreye GEOMETRİK PENCERE açılır (sphereGeometry'nin
 * phiStart/phiLength parametreleriyle). Kamera (+x,+z) yönünden bakar;
 * pencere tam kameraya bakacak şekilde hesaplandı (φ=3π/4 → (0.71,0,0.71)).
 * Kesit düzlemi yerine geometri kesiti kullanıldığı için shader/bağlam
 * uyumsluklarında bile her ortamda çalışır.
 */

const PHI_START = Math.PI; // pencere kameraya bakar: merkez φ=0.75π → (0.71, 0, 0.71)
const PHI_LEN = Math.PI * 1.5;

function LayerShell({
  radius,
  color,
  opacity,
  label,
  showLabel,
}: {
  radius: number;
  color: string;
  opacity: number;
  label: string;
  showLabel: boolean;
}) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 72, 44, PHI_START, PHI_LEN]} />
      <meshStandardMaterial
        color={color}
        roughness={0.6}
        metalness={0.08}
        emissive={color}
        emissiveIntensity={0.08}
        transparent={opacity < 1}
        opacity={opacity}
        side={THREE.DoubleSide}
      />
      {showLabel && (
        <Html
          center
          position={[radius * 0.4, radius * 0.62, radius * 0.4]}
          zIndexRange={[12, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="whitespace-nowrap rounded-full border border-white/15 bg-black/70 px-2 py-0.5 text-[9px] font-semibold text-zinc-100 backdrop-blur-sm">
            {label}
          </div>
        </Html>
      )}
    </mesh>
  );
}

function LayerStack({ profile, radius }: { profile: InteriorProfile; radius: number }) {
  const shells = useMemo(() => {
    // Dıştan içe: en büyük yarıçap ilk (kabuk), en küçük son (çekirdek)
    return profile.layers
      .map((l) => ({ ...l, r: (l.pct / 100) * radius }))
      .sort((a, b) => b.r - a.r);
  }, [profile, radius]);

  return (
    <group>
      {shells.map((s, i) => (
        <LayerShell
          key={i}
          radius={s.r}
          color={s.color}
          opacity={i === 0 ? 0.97 : 1}
          label={s.name}
          showLabel={i === 0 || i === shells.length - 1 || i === Math.floor(shells.length / 2)}
        />
      ))}
    </group>
  );
}

export default function Interior3D({
  bodyName,
  profile,
  open,
  onOpenChange,
}: {
  bodyName: string;
  profile: InteriorProfile;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const outer = profile.layers[profile.layers.length - 1]?.pct ?? 100;
  const sceneRadius = 2.3 * (outer / 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-[94vw] rounded-xl border-white/10 bg-zinc-950/95 p-0 text-zinc-100 sm:max-w-[560px]"
      >
        <DialogTitle className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-sm font-bold">
          <Layers3DIcon className="h-4 w-4 text-amber-400" aria-hidden />
          {bodyName} · 3D İç Yapı Kesiti
        </DialogTitle>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-b-xl bg-[#050508]">
          {open && (
            <Canvas
              camera={{ position: [3.4, 2.1, 3.4], fov: 42 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, powerPreference: "low-power" }}
            >
              <ambientLight intensity={0.6} />
              <directionalLight position={[4, 5, 3]} intensity={1.7} />
              <directionalLight position={[-3, -1.5, -4]} intensity={0.5} color="#ffd9a0" />
              <pointLight position={[0, 0, 0]} intensity={0.5} color="#fff3c4" distance={sceneRadius * 1.4} />
              <LayerStack profile={profile} radius={sceneRadius} />
              <OrbitControls
                enablePan={false}
                minDistance={3.2}
                maxDistance={9}
                autoRotate
                autoRotateSpeed={0.55}
              />
            </Canvas>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-2">
            <span className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] text-zinc-400">
              Kesit penceresi kameraya bakar · Sürükleyerek incele
            </span>
          </div>
        </div>
        {/* Lejant */}
        <div className="nice-scroll max-h-[26vh] overflow-y-auto border-t border-white/10 px-4 py-2.5">
          <ul className="space-y-1.5">
            {[...profile.layers].reverse().map((l, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] leading-relaxed">
                <span
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/20"
                  style={{ background: l.color }}
                  aria-hidden
                />
                <span>
                  <span className="font-semibold text-zinc-100">{l.name}</span>
                  <span className="ml-1.5 text-zinc-500">{l.temp}</span>
                  <span className="block text-zinc-400">{l.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
