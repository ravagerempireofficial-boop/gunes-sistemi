"use client";

import { useMemo, useRef } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { BodyData } from "@/lib/solar-data";
import { orbitPosition } from "@/lib/kepler";
import { makeGlowTexture, makeRockTexture, makeStarSprite } from "./procedural-textures";
/**
 * Env3D — sahne çevresi: asteroit kuşağı (instanced kayalar), Jüpiter
 * Trojaları, Kuiper kuşağı, Oort bulutu, heliopause/sınırlar, Voyager
 * sondaları, Halley kuyruklu yıldızı, nebula gökyüzü ve Samanyolu
 * sarmal galaksisi.
 */

export interface EnvProps {
  days: { current: number };
  showBelt: boolean;
  showTrojans: boolean;
  showKuiper: boolean;
  showOort: boolean;
  showBoundaries: boolean;
  labelsEnabled: boolean;
  galacticSpin: boolean;
  jupiterPeriod: number;
  onSelect: (id: string) => void;
}

/* --------------------------- Asteroit kuşağı ---------------------------- */

interface RockParams {
  a: number;
  period: number;
  phase: number;
  incl: number;
  node: number;
  scale: number;
  tumble: THREE.Euler;
  spin: number;
}

function AsteroidBelt({ days }: { days: { current: number } }) {
  const COUNT = 3000;
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const rockTex = useMemo(() => makeRockTexture(), []);

  const rocks = useMemo<RockParams[]>(() => {
    const arr: RockParams[] = [];
    for (let i = 0; i < COUNT; i++) {
      const a = 172 + Math.random() * 58 + (Math.random() > 0.92 ? 14 : 0);
      const period = 365.25 * Math.pow(a / 126, 1.5);
      arr.push({
        a,
        period,
        phase: Math.random() * Math.PI * 2,
        incl: (Math.random() - 0.5) * 0.3,
        node: Math.random() * Math.PI * 2,
        scale: 0.14 + Math.pow(Math.random(), 2.4) * 0.55,
        tumble: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        spin: 0.2 + Math.random() * 0.9,
      });
    }
    return arr;
  }, []);

  const colorVariants = useMemo(() => {
    const colors = new Float32Array(COUNT * 3);
    // Doku haritasıyla çarpılacağı için açık tonlar (C/S/M sınıfı karışımı)
    const palette = ["#cfc5b4", "#d8cdbb", "#b8ada0", "#c8bfae", "#9a928a"];
    for (let i = 0; i < COUNT; i++) {
      const c = new THREE.Color(
        palette[Math.floor(Math.random() * palette.length)]
      );
      const j = 0.85 + Math.random() * 0.3;
      colors[i * 3] = c.r * j;
      colors[i * 3 + 1] = c.g * j;
      colors[i * 3 + 2] = c.b * j;
    }
    return colors;
  }, []);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const d = days.current;
    for (let i = 0; i < COUNT; i++) {
      const r = rocks[i];
      const ang = r.phase + (Math.PI * 2 * d) / r.period;
      const x = Math.cos(ang) * r.a;
      const z = Math.sin(ang) * r.a;
      const y = Math.sin(ang + r.node) * r.a * Math.tan(r.incl) * 0.12;
      dummy.position.set(x, y, z);
      dummy.rotation.set(
        r.tumble.x + r.spin * d * 0.02,
        r.tumble.y + r.spin * d * 0.03,
        r.tumble.z
      );
      dummy.scale.setScalar(r.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        map={rockTex}
        vertexColors
        roughness={0.96}
        metalness={0.04}
        flatShading
      />
      <instancedBufferAttribute attach="instanceColor" args={[colorVariants, 3]} />
    </instancedMesh>
  );
}

/* --------------------------- Jüpiter Trojaları -------------------------- */

function Trojans({
  days,
  jupiterPeriod,
}: {
  days: { current: number };
  jupiterPeriod: number;
}) {
  const COUNT = 1100;
  const l4Ref = useRef<THREE.Points>(null);
  const l5Ref = useRef<THREE.Points>(null);
  const sprite = useMemo(() => makeStarSprite(), []);

  const { l4Geo, l5Geo } = useMemo(() => {
    const mk = (n: number) => {
      const arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        // Jüpiter yörüngesi çevresinde bulut
        const r = 238 + (Math.random() - 0.5) * 26;
        const spread = (Math.random() - 0.5) * 0.5;
        const y = (Math.random() - 0.5) * 16;
        arr[i * 3] = Math.cos(spread) * r;
        arr[i * 3 + 1] = y;
        arr[i * 3 + 2] = Math.sin(spread) * r;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
      return geo;
    };
    return { l4Geo: mk(COUNT), l5Geo: mk(COUNT) };
  }, []);

  useFrame(() => {
    const ang = (Math.PI * 2 * days.current) / jupiterPeriod;
    if (l4Ref.current) {
      l4Ref.current.rotation.y = ang + Math.PI / 3;
    }
    if (l5Ref.current) {
      l5Ref.current.rotation.y = ang - Math.PI / 3;
    }
  });

  return (
    <>
      <points ref={l4Ref} geometry={l4Geo} frustumCulled={false}>
        <pointsMaterial
          map={sprite}
          color="#d8b47a"
          size={1.7}
          transparent
          opacity={0.5}
          depthWrite={false}
          sizeAttenuation={false}
        />
      </points>
      <points ref={l5Ref} geometry={l5Geo} frustumCulled={false}>
        <pointsMaterial
          map={sprite}
          color="#d8b47a"
          size={1.7}
          transparent
          opacity={0.5}
          depthWrite={false}
          sizeAttenuation={false}
        />
      </points>
    </>
  );
}

/* ---------------------------- Kuiper kuşağı ----------------------------- */

function KuiperBelt({ days }: { days: { current: number } }) {
  const COUNT = 6000;
  const ref = useRef<THREE.Points>(null);
  const sprite = useMemo(() => makeStarSprite(), []);

  const geo = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 448 + Math.random() * 100;
      const ang = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * (r * 0.22);
      arr[i * 3] = Math.cos(ang) * r;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = Math.sin(ang) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  useFrame(() => {
    if (ref.current) {
      // ~300 yıllık yörünge dönemine göre yavaş dönüş
      ref.current.rotation.y = (Math.PI * 2 * days.current) / (365.25 * 300);
    }
  });

  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <pointsMaterial
        map={sprite}
        color="#a8c0b0"
        size={1.9}
        transparent
        opacity={0.45}
        depthWrite={false}
        sizeAttenuation={false}
      />
    </points>
  );
}

/* ------------------------------ Oort bulutu ----------------------------- */

function OortCloud({ days }: { days: { current: number } }) {
  const COUNT = 4500;
  const ref = useRef<THREE.Points>(null);
  const sprite = useMemo(() => makeStarSprite(), []);

  const geo = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      // Küresel kabuk: 1100-2600 birim (gerçekte 2.000-100.000 AU;
      // sahnede log-benzeri sıkıştırma uygulanır)
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = 1100 + Math.pow(Math.random(), 0.85) * 1500;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi);
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y = (Math.PI * 2 * days.current) / (365.25 * 9000);
    }
  });

  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <pointsMaterial
        map={sprite}
        color="#d8d2c4"
        size={2.2}
        transparent
        opacity={0.22}
        depthWrite={false}
        sizeAttenuation={false}
      />
    </points>
  );
}

/* ------------------------------- Sınırlar ------------------------------- */

function DashedRing({
  radius,
  color,
  opacity,
}: {
  radius: number;
  color: string;
  opacity: number;
}) {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 180; i++) {
      const a = (i / 180) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);
  return (
    <lineLoop
      geometry={geo}
      ref={(l) => {
        l?.computeLineDistances();
      }}
    >
      <lineDashedMaterial
        color={color}
        transparent
        opacity={opacity}
        dashSize={7}
        gapSize={5}
        depthWrite={false}
      />
    </lineLoop>
  );
}

function MarkerLabel({
  text,
  color,
  onClick,
  offset = [0, 3, 0],
}: {
  text: string;
  color: string;
  onClick: () => void;
  offset?: [number, number, number];
}) {
  return (
    <Html center position={offset} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="cursor-pointer whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm"
        style={{
          pointerEvents: "auto",
          borderColor: `${color}66`,
          color,
          background: "rgba(0,0,0,0.5)",
        }}
      >
        {text}
      </button>
    </Html>
  );
}

function Boundaries({
  onSelect,
  labelsEnabled,
}: {
  onSelect: (id: string) => void;
  labelsEnabled: boolean;
}) {
  const glow = useMemo(() => makeGlowTexture(), []);

  const voyager = (
    id: "voyager-1" | "voyager-2",
    dist: number,
    angleDeg: number,
    tiltY: number
  ) => {
    const a = (angleDeg * Math.PI) / 180;
    const x = Math.cos(a) * dist;
    const z = Math.sin(a) * dist;
    return (
      <group key={id} position={[x, tiltY, z]}>
        <mesh onClick={(e) => { e.stopPropagation(); onSelect(id); }}>
          <octahedronGeometry args={[2.4, 0]} />
          <meshBasicMaterial color="#f5f2ea" />
        </mesh>
        <sprite scale={[11, 11, 1]}>
          <spriteMaterial
            map={glow}
            color="#e8e4dc"
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            transparent
            opacity={0.5}
          />
        </sprite>
        {labelsEnabled && (
          <MarkerLabel
            text={id === "voyager-1" ? "Voyager 1 · 165 AU" : "Voyager 2 · 138 AU"}
            color="#e8e4dc"
            onClick={() => onSelect(id)}
            offset={[0, 7, 0]}
          />
        )}
      </group>
    );
  };

  return (
    <group>
      {labelsEnabled && (
        <>
          <group position={[0, 0, -529]}>
            <MarkerLabel
              text="Terminasyon Şoku · ~90 AU"
              color="#c9a227"
              onClick={() => onSelect("heliopause")}
            />
          </group>
          {/* Heliopause ~120 AU */}
          <DashedRing radius={706} color="#fbbf24" opacity={0.4} />
          <group position={[0, 0, 706]}>
            <MarkerLabel
              text="Heliopause · ~120 AU · Yıldızlararası Boşluk"
              color="#fbbf24"
              onClick={() => onSelect("heliopause")}
            />
          </group>
          {/* Oort iç sınır (Hills bulutu) */}
          <DashedRing radius={1180} color="#d8d2c8" opacity={0.16} />
          <group position={[0, 0, -1180]}>
            <MarkerLabel
              text="Oort Bulutu · İç Sınır ~2.000 AU"
              color="#d8d2c8"
              onClick={() => onSelect("oort-cloud")}
              offset={[0, -3, 0]}
            />
          </group>
          {/* Oort dış sınır — gerçekte 100.000 AU'ya (1,5 ış yılı) uzanır */}
          <DashedRing radius={2600} color="#c8c2b4" opacity={0.1} />
          <group position={[0, 0, 2600]}>
            <MarkerLabel
              text="Oort Dış Sınır · 100.000 AU · Güneş Sistemi'nin Gerçek Sonu"
              color="#c8c2b4"
              onClick={() => onSelect("oort-cloud")}
              offset={[0, -3, 0]}
            />
          </group>
        </>
      )}
      {!labelsEnabled && (
        <>
          <DashedRing radius={706} color="#fbbf24" opacity={0.4} />
          <DashedRing radius={1180} color="#d8d2c8" opacity={0.16} />
          <DashedRing radius={2600} color="#c8c2b4" opacity={0.1} />
        </>
      )}
      {voyager("voyager-1", 971, 208, 14)}
      {voyager("voyager-2", 812, 42, -20)}
    </group>
  );
}

/* --------------------------- Halley kuyruklusu -------------------------- */

/**
 * Halley v2 — canlı fizikli, gerçek anatomili kuyruklu yıldız:
 *  · Koyu, patates biçimli çekirdek (albedo ~0,04)
 *  · Süblimleşen koma (Güneş'e yakınlıkla parlar)
 *  · İYON kuyruğu: mavi, düz, radyal basınçla tam Güneş tersine
 *  · TOZ kuyruğu: sarımsı, yörünge hareketinin gerisinde kıvrılır
 *  · Uzaklık^2 ile zayıflayan kuyruk uzunluğu/parlaklığı
 */
function HalleyComet({
  body,
  days,
  onSelect,
}: {
  body: BodyData;
  days: { current: number };
  onSelect: (id: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const ionRef = useRef<THREE.Points>(null);
  const dustRef = useRef<THREE.Points>(null);
  const nucleusRef = useRef<THREE.Mesh>(null);
  const comaRef = useRef<THREE.Sprite>(null);
  const glow = useMemo(() => makeGlowTexture(), []);
  const sprite = useMemo(() => makeStarSprite(), []);
  const TAIL = 120;
  const ionGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(TAIL * 3), 3)
    );
    return g;
  }, []);
  const dustGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(TAIL * 3), 3)
    );
    return g;
  }, []);
  // Toz kuyruğu kıvrımı için önceki konum geçmişi (yörünge izi)
  const prevPos = useMemo(() => new THREE.Vector3(), []);
  const orbitVel = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const p = orbitPosition(body.sim, days.current);
    groupRef.current?.position.set(p.x, p.y, p.z);
    const dist = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);

    // Yörünge hızı (pozisyon farkından) — toz kuyruğu bunun tersine kıvrılır
    orbitVel.set(p.x - prevPos.x, p.y - prevPos.y, p.z - prevPos.z);
    prevPos.set(p.x, p.y, p.z);
    if (orbitVel.lengthSq() > 1e-10) orbitVel.normalize();

    const nx = p.x / dist;
    const ny = p.y / dist;
    const nz = p.z / dist;

    // Fizik: kuyruk uzunluğu ~ 1/dist (basitleştirilmiş 1/r² basıncı)
    const activity = Math.max(0, Math.min(1, 900 / (dist * dist)));
    const len = Math.min(95, 26000 / Math.max(70, dist));
    const t = state.clock.elapsedTime;

    // İYON kuyruğu — düz, radyal, hafif titreşimli
    const ionPts = ionRef.current;
    if (ionPts) {
      const attr = ionPts.geometry.attributes.position as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      for (let i = 0; i < TAIL; i++) {
        const s = i / TAIL;
        const jitter = Math.sin(t * 3.1 + s * 26) * s * 1.6;
        arr[i * 3] = p.x + nx * len * s + (ny - nz) * jitter;
        arr[i * 3 + 1] = p.y + ny * len * s + (nz - nx) * jitter;
        arr[i * 3 + 2] = p.z + nz * len * s + (nx - ny) * jitter;
      }
      attr.needsUpdate = true;
      const mat = ionPts.material as THREE.PointsMaterial;
      mat.opacity = Math.min(0.75, 0.75 * activity * 4 + 0.04);
    }

    // TOZ kuyruğu — yörünge hareketinin tersine kıvrılan geniş koni
    const dustPts = dustRef.current;
    if (dustPts) {
      const attr = dustPts.geometry.attributes.position as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      const dustLen = len * 0.72;
      for (let i = 0; i < TAIL; i++) {
        const s = i / TAIL;
        // Eğri: radyal + geriye eğilme karışımı (toz geride kalır)
        const back = s * s * 0.85;
        const spread = s * s * 6.5;
        const bx = -orbitVel.x * back * dustLen;
        const by = -orbitVel.y * back * dustLen;
        const bz = -orbitVel.z * back * dustLen;
        arr[i * 3] =
          p.x + nx * dustLen * s * 0.55 + bx + (Math.random() - 0.5) * spread;
        arr[i * 3 + 1] =
          p.y + ny * dustLen * s * 0.55 + by + (Math.random() - 0.5) * spread;
        arr[i * 3 + 2] =
          p.z + nz * dustLen * s * 0.55 + bz + (Math.random() - 0.5) * spread;
      }
      attr.needsUpdate = true;
      const mat = dustPts.material as THREE.PointsMaterial;
      mat.opacity = Math.min(0.6, 0.6 * activity * 4 + 0.03);
    }

    // Koma parlaklığı + çekirdek dönmesi
    if (comaRef.current) {
      const s = 9 + activity * 22 + Math.sin(t * 2.2) * (0.6 + activity);
      comaRef.current.scale.set(s, s, 1);
      const m = comaRef.current.material as THREE.SpriteMaterial;
      m.opacity = 0.28 + Math.min(0.6, activity * 3);
    }
    if (nucleusRef.current) {
      nucleusRef.current.rotation.y = t * 0.4;
      nucleusRef.current.rotation.x = t * 0.23;
    }
  });

  return (
    <>
      {/* İyon kuyruğu — mavi plazma */}
      <points ref={ionRef} geometry={ionGeo} frustumCulled={false}>
        <pointsMaterial
          map={sprite}
          color="#8fc8ff"
          size={1.6}
          transparent
          opacity={0.6}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* Toz kuyruğu — sarımsı, kıvrımlı */}
      <points ref={dustRef} geometry={dustGeo} frustumCulled={false}>
        <pointsMaterial
          map={sprite}
          color="#f2e4bc"
          size={1.9}
          transparent
          opacity={0.5}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      <group ref={groupRef}>
        <mesh
          ref={nucleusRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(body.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        >
          {/* Patates biçimli koyu çekirdek */}
          <dodecahedronGeometry args={[1.15, 0]} />
          <meshStandardMaterial color="#4a443e" roughness={0.98} flatShading />
        </mesh>
        <sprite ref={comaRef} scale={[12, 12, 1]}>
          <spriteMaterial
            map={glow}
            color="#cfeee0"
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            transparent
            opacity={0.5}
          />
        </sprite>
      </group>
    </>
  );
}

/* --------------------------- Nebula gökyüzü ----------------------------- */

function NebulaSky({ spin }: { spin: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => {
    const tex = new THREE.TextureLoader().load("/textures/nebula.jpg");
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useFrame((_, delta) => {
    if (spin && ref.current) ref.current.rotation.y += delta * 0.0035;
  });

  return (
    <mesh ref={ref} scale={3600}>
      <sphereGeometry args={[1, 48, 48]} />
      <meshBasicMaterial
        map={texture}
        color="#8f8a84"
        side={THREE.BackSide}
        depthWrite={false}
        transparent
        opacity={0.72}
      />
    </mesh>
  );
}

/* ------------------------ Samanyolu sarmalı ----------------------------- */

/**
 * GalaxySpiral v3 — 90.000 yıldızlı çubuklu sarmal (SBbc) modeli.
 * Samanyolu gerçekliğinde 100-400 milyar yıldız vardır; GPU bütçesi
 * nedeniyle 90.000 nokta + kol boyunca parlayan bulut katmanlarıyla
 * "milyarlarca yıldız" yoğunluk hissi verilir. FPS düşerse nokta sayısı
 * otomatik azaltılır (adaptif drawRange), boşta kalırsa geri yüklenir.
 *
 * Gerçek kol adları kullanılır: Kalkan–Centaurus ve Persey (büyük kollar),
 * Yay ve Norma (zayıf kollar), Güneş'in oturduğu Orion Spuru.
 */
const GALAXY_R = 2600;
const SUN_ORBIT_R = 1270;
const GALAXY_STAR_COUNT = 90000;

/** Sarmal kolların adları + açısal konumları (arm 0-3) */
const ARM_NAMES: Record<number, string> = {
  0: "Kalkan–Centaurus Kolu",
  1: "Yay Kolu",
  2: "Persey Kolu",
  3: "Norma Kolu",
};

/* ----------------- Kol bulutları ve kol adları -------------------------- */

/**
 * Kollar boyunca mavimsi-mor geniş bulut sprite'ları — "100 milyar yıldız"
 * yoğunluk hissini veren görsel doku katmanı. Genç mavi yıldız kümeleri
 * ve toz bulutları gerçek galaksilerde kolları bu şekilde aydınlatır.
 */
function ArmNebulae({ sprite }: { sprite: THREE.Texture }) {
  const blobs = useMemo(() => {
    const arr: { pos: [number, number, number]; scale: number; color: string; opacity: number }[] = [];
    const colors = ["#7f9fd8", "#8fa8e0", "#6f8fc8", "#a8b4e8", "#c88aa8", "#7fa8d0"];
    for (let arm = 0; arm < 4; arm++) {
      for (let k = 0; k < 5; k++) {
        const t = 0.22 + k * 0.17 + (Math.random() - 0.5) * 0.05;
        const r = 270 + t * (GALAXY_R - 270);
        const ang = Math.log(r / 170) * 2.42 + (arm * Math.PI) / 2 + (Math.random() - 0.5) * 0.06;
        arr.push({
          pos: [
            Math.cos(ang) * r + (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 14,
            Math.sin(ang) * r + (Math.random() - 0.5) * 40,
          ],
          scale: 300 + Math.random() * 260,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: 0.07 + Math.random() * 0.07,
        });
      }
    }
    return arr;
  }, []);
  return (
    <group>
      {blobs.map((b, i) => (
        <sprite key={i} position={b.pos} scale={[b.scale, b.scale, 1]}>
          <spriteMaterial
            map={sprite}
            color={b.color}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            transparent
            opacity={b.opacity}
          />
        </sprite>
      ))}
    </group>
  );
}

/**
 * Sarmal kolların gerçek adları — Persey, Yay, Kalkan–Centaurus, Norma
 * ve Güneş'in içinde bulunduğu Orion Spuru. Bilgi amaçlıdır (tıklanmaz).
 */
function ArmLabels({ active }: { active: boolean }) {
  const labels = useMemo(() => {
    const arr: { pos: [number, number, number]; name: string; latin: string }[] = [];
    const r = 1560;
    for (let arm = 0; arm < 4; arm++) {
      const ang = Math.log(r / 170) * 2.42 + (arm * Math.PI) / 2;
      arr.push({
        pos: [Math.cos(ang) * r, 26, Math.sin(ang) * r],
        name: ARM_NAMES[arm],
        latin: ["Scutum–Centaurus", "Sagittarius", "Perseus", "Norma"][arm],
      });
    }
    return arr;
  }, []);
  const sunAngle2 = Math.log(SUN_ORBIT_R / 170) * 2.42 + 0.4;
  return (
    <>
      {labels.map((l) =>
        active ? (
          <Html key={l.name} center position={l.pos} zIndexRange={[14, 0]} style={{ pointerEvents: "none" }}>
            <div className="whitespace-nowrap rounded-md border border-indigo-300/25 bg-black/55 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-indigo-100/90 backdrop-blur-sm">
              {l.name}
              <span className="ml-1 text-[8px] font-medium text-indigo-200/60">
                {l.latin}
              </span>
            </div>
          </Html>
        ) : null
      )}
      {/* Orion Spuru — Güneş'in oturduğu küçük ara kol */}
      {active && (
        <Html
          center
          position={[
            Math.cos(sunAngle2) * SUN_ORBIT_R - 150,
            40,
            Math.sin(sunAngle2) * SUN_ORBIT_R - 150,
          ]}
          zIndexRange={[14, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="whitespace-nowrap rounded-md border border-amber-300/35 bg-black/60 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-amber-100/95 backdrop-blur-sm">
            Orion Spuru (Orion Spur)
            <span className="ml-1 text-[8px] font-medium text-amber-200/60">
              Güneş bu kolda
            </span>
          </div>
        </Html>
      )}
    </>
  );
}

function GalaxySpiral({
  active,
  onSelect,
}: {
  active: boolean;
  onSelect?: (id: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const sprite = useMemo(() => makeStarSprite(), []);
  const opacity = useRef(0);

  const geo = useMemo(() => {
    const COUNT = GALAXY_STAR_COUNT;
    const arr = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const c = new THREE.Color();

    // Gauss yaklaşımı: 3 rastgele sayının ortalaması [-1, 1]
    const gauss = () =>
      (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

    const put = (i: number, x: number, y: number, z: number) => {
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    };

    let i = 0;
    // 1) Merkezi ÇUBUK (SBbc imzası): X ekseni boyunca uzanmış çubuk — 11.000
    for (; i < 11000; i++) {
      const x = gauss() * 380;
      const z = gauss() * 95;
      const y = gauss() * 30;
      put(i, x, y, z);
      c.set("#ffd9a0").lerp(new THREE.Color("#ffefc8"), Math.random());
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    // 2) Merkez şişkinliği (bulge) — 13.000
    for (; i < 24000; i++) {
      const r = Math.pow(Math.random(), 1.7) * 420;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      put(
        i,
        r * Math.sin(ph) * Math.cos(th),
        r * Math.cos(ph) * 0.62,
        r * Math.sin(ph) * Math.sin(th)
      );
      c.set("#ffe8c0").lerp(new THREE.Color("#fff6e0"), Math.random() * 0.8);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    // 3) Sarmal kollar — çubuktan doğan 4 kol (2 güçlü + 2 zayıf) — 38.600
    for (; i < 62600; i++) {
      const arm = Math.floor(Math.random() * 4);
      const strength = arm % 2 === 0 ? 1 : 0.62;
      const t = Math.pow(Math.random(), 0.78);
      const r = 270 + t * (GALAXY_R - 270);
      // Pitch açısı ~13°: log-sarmal kıvrımı
      const spiral = Math.log(r / 170) * 2.42;
      const scatter = gauss() * (26 + t * 88) * (1 / strength);
      const ang = spiral + (arm * Math.PI) / 2 + scatter / r;
      put(i, Math.cos(ang) * r, gauss() * (12 + t * 30), Math.sin(ang) * r);
      const roll = Math.random();
      if (roll > 0.78) {
        // Genç mavi kümeler kolları takip eder
        c.set("#bcd0ff").lerp(new THREE.Color("#e8f0ff"), Math.random() * 0.5);
      } else if (roll > 0.7) {
        // Kırmızı devler
        c.set("#ff9f7a").lerp(new THREE.Color("#ffc09a"), Math.random());
      } else {
        c.set("#f2e8dc").lerp(new THREE.Color("#ffffff"), Math.random() * 0.6);
      }
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    // 4) HII bölgeleri: kollar boyunca pembe yıldız doğum bulutları — 2.000
    for (; i < 64600; i++) {
      const arm = Math.floor(Math.random() * 4);
      const t = 0.15 + Math.random() * 0.8;
      const r = 270 + t * (GALAXY_R - 270);
      const spiral = Math.log(r / 170) * 2.42;
      const ang =
        spiral + (arm * Math.PI) / 2 + gauss() * 0.05;
      put(
        i,
        Math.cos(ang) * r + gauss() * 22,
        gauss() * 8,
        Math.sin(ang) * r + gauss() * 22
      );
      c.set("#ff9fb3").lerp(new THREE.Color("#ffc4d0"), Math.random() * 0.6);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    // 5) İnce disk arka planı (kol dışı popülasyon) — 10.400
    for (; i < 75000; i++) {
      const r = 300 + Math.pow(Math.random(), 0.6) * (GALAXY_R - 300);
      const ang = Math.random() * Math.PI * 2;
      put(i, Math.cos(ang) * r, gauss() * 16, Math.sin(ang) * r);
      c.set("#e8e0d4").lerp(new THREE.Color("#d4ccc0"), Math.random() * 0.7);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    // 6) Küresel hale + küresel kümeler — 15.000
    for (; i < COUNT; i++) {
      const isCluster = Math.random() > 0.78;
      if (isCluster) {
        // Rastgele bir küresel kümenin etrafında sık küme
        const cx = gauss() * 1500;
        const cy = gauss() * 800;
        const cz = gauss() * 1500;
        const cr = Math.pow(Math.random(), 1.4) * 34 + 6;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        put(
          i,
          cx + cr * Math.sin(ph) * Math.cos(th),
          cy + cr * Math.cos(ph),
          cz + cr * Math.sin(ph) * Math.sin(th)
        );
      } else {
        const r = 260 + Math.pow(Math.random(), 2.1) * 2300;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        put(
          i,
          r * Math.sin(ph) * Math.cos(th),
          r * Math.cos(ph) * 0.9,
          r * Math.sin(ph) * Math.sin(th)
        );
      }
      c.set("#d8d2c4").lerp(new THREE.Color("#f0e8d8"), Math.random() * 0.5);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, []);

  // Güneş Sistemi'nin galaktik konumu: Orion Spuru, merkezden 26.660 ış yılı
  const sunAngle = Math.log(SUN_ORBIT_R / 170) * 2.42 + 0.4;
  const sunPos: [number, number, number] = [
    Math.cos(sunAngle) * SUN_ORBIT_R,
    4,
    Math.sin(sunAngle) * SUN_ORBIT_R,
  ];

  // Adaptif yoğunluk: kare süresi EMA'sı. FPS düşerse çizilen yıldız
  // sayısı azaltılır ("sarmal çok ağır geliyorsa küçült"), rahatlayınca
  // kademeli geri yüklenir.
  const drawCount = useRef(GALAXY_STAR_COUNT);
  const emaMs = useRef(16.7);
  const lastAdapt = useRef(0);

  useFrame((state, delta) => {
    // Opaklık geçişi
    const target = active ? 1 : 0;
    opacity.current += (target - opacity.current) * Math.min(1, delta * 2.2);
    if (matRef.current) {
      matRef.current.opacity = opacity.current * 0.95;
      matRef.current.size = 7.2;
    }
    if (groupRef.current) {
      groupRef.current.visible = opacity.current > 0.015;
      // Galaktik dönüş — Güneş Sistemi de bu dönüşle birlikte taşınır
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.0075;
    }
    // FPS ölçümü ve adaptasyon (yalnızca galaksi görünürken)
    emaMs.current = emaMs.current * 0.93 + Math.min(delta, 0.25) * 1000 * 0.07;
    const now = state.clock.elapsedTime;
    if (active && now - lastAdapt.current > 0.9) {
      lastAdapt.current = now;
      if (emaMs.current > 30 && drawCount.current > 32000) {
        // Ağır: %18 azalt
        drawCount.current = Math.max(32000, Math.floor(drawCount.current * 0.82));
        geo.setDrawRange(0, drawCount.current);
      } else if (emaMs.current < 19 && drawCount.current < GALAXY_STAR_COUNT) {
        // Rahat: %10 geri yükle
        drawCount.current = Math.min(
          GALAXY_STAR_COUNT,
          Math.floor(drawCount.current * 1.1) + 500
        );
        geo.setDrawRange(0, drawCount.current);
      }
    }
  });

  return (
    <group ref={groupRef} visible={false} rotation={[0, 0, 0]}>
      <points geometry={geo} frustumCulled={false}>
        <pointsMaterial
          ref={matRef}
          map={sprite}
          vertexColors
          transparent
          opacity={0}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* Galaktik merkez parlaması — çubuk yönünde hafif oval */}
      <sprite scale={[880, 620, 1]} position={[0, 0, 0]}>
        <spriteMaterial
          map={sprite}
          color="#ffe0a8"
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
          opacity={0.3}
        />
      </sprite>
      <sprite scale={[320, 320, 1]} position={[0, 0, 0]}>
        <spriteMaterial
          map={sprite}
          color="#fff2d0"
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
          opacity={0.5}
        />
      </sprite>

      {/* Kol dokuları: kollar boyunca mavimsi-mor yıldız doğum bulutları */}
      <ArmNebulae sprite={sprite} />

      {/* Sarmal kol adları — gerçek haritalama */}
      <ArmLabels active={active} />

      {/* Sagittarius A* — merkezdeki süperdev karadelik */}
      <group>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.("sagittarius-a");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        >
          <sphereGeometry args={[26, 20, 20]} />
          <meshBasicMaterial color="#0a0806" />
        </mesh>
        <sprite scale={[150, 150, 1]}>
          <spriteMaterial
            map={sprite}
            color="#ffb85e"
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            transparent
            opacity={0.55}
          />
        </sprite>
        {active && (
          <Html center position={[0, 60, 0]} zIndexRange={[15, 0]}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.("sagittarius-a");
              }}
              className="cursor-pointer whitespace-nowrap rounded-full border border-white/25 bg-black/65 px-2.5 py-1 text-[10px] font-bold text-zinc-100 backdrop-blur-sm hover:border-amber-400/60 hover:text-amber-300"
            >
              Sagittarius A* · 4,15 mn güneş kütlesi
            </button>
          </Html>
        )}
      </group>

      {/* Güneş'in galaktik yörüngesi — 230 milyon yıllık tur */}
      <lineLoop
        ref={(l) => {
          l?.computeLineDistances();
        }}
      >
        <lineDashedMaterial
          color="#ffd27a"
          transparent
          opacity={0.2}
          dashSize={22}
          gapSize={16}
          depthWrite={false}
        />
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 181 }, (_, k) => {
                  const a = (k / 180) * Math.PI * 2;
                  return [
                    Math.cos(a) * SUN_ORBIT_R,
                    4,
                    Math.sin(a) * SUN_ORBIT_R,
                  ];
                }).flat()
              ),
              3,
            ]}
          />
        </bufferGeometry>
      </lineLoop>

      {/* Güneş Sistemi — biz buradasınız (gerçekte bu ölçekte nokta kadar
          bile görünmez; işaret feneri olarak küçük tutulur) */}
      <group position={sunPos}>
        <sprite scale={[13, 13, 1]}>
          <spriteMaterial
            map={sprite}
            color="#ffd27a"
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            transparent
            opacity={0.95}
          />
        </sprite>
        <sprite scale={[34, 34, 1]}>
          <spriteMaterial
            map={sprite}
            color="#ffb84d"
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            transparent
            opacity={0.28}
          />
        </sprite>
        {active && (
          <Html center position={[0, 26, 0]} zIndexRange={[15, 0]}>
            <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-400/50 bg-black/60 px-2.5 py-1 text-[10px] font-bold text-amber-300 backdrop-blur-sm">
              <span
                className="inline-block h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_2px_rgba(251,191,36,0.7)]"
                aria-hidden
              />
              Güneş Sistemi — Sen buradasın
            </div>
          </Html>
        )}
      </group>

      {/* Andromeda — 2,5 milyon ış yılı ötede yaklaşan komşu */}
      <sprite position={[6400, -900, -9800]} scale={[1500, 1500, 1]}>
        <spriteMaterial
          map={sprite}
          color="#e8dcf0"
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
          opacity={0.4}
        />
      </sprite>
    </group>
  );
}

/* ------------------------------ Dış bileşen ----------------------------- */

export default function Env3D({
  days,
  showBelt,
  showTrojans,
  showKuiper,
  showOort,
  showBoundaries,
  labelsEnabled,
  galacticSpin,
  jupiterPeriod,
  onSelect,
  halleyBody,
}: EnvProps & { halleyBody: BodyData | undefined }) {
  return (
    <group>
      <NebulaSky spin={galacticSpin} />
      {showBelt && <AsteroidBelt days={days} />}
      {showBelt && showTrojans && (
        <Trojans days={days} jupiterPeriod={jupiterPeriod} />
      )}
      {showKuiper && <KuiperBelt days={days} />}
      {showOort && <OortCloud days={days} />}
      {showBoundaries && (
        <Boundaries onSelect={onSelect} labelsEnabled={labelsEnabled} />
      )}
      {halleyBody && (
        <HalleyComet body={halleyBody} days={days} onSelect={onSelect} />
      )}
    </group>
  );
}

export { GalaxySpiral, NebulaSky };
