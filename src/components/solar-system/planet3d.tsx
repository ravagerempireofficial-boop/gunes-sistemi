"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Html, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { BodyData } from "@/lib/solar-data";
import { orbitPoints, orbitPosition } from "@/lib/kepler";
import {
  makeGlowTexture,
  makeRockyTexture,
  makeSaturnRingTexture,
  makeUranusRingTexture,
  remapRingUVs,
  toSRGB,
} from "./procedural-textures";

/**
 * Planet3D — dokulu gezegen/uydu/cüce gezegen bileşenleri:
 * Kepler yörüngesi, eksen eğikliği, gün uzunluğuna göre dönüş,
 * Fresnel atmosfer, halka sistemleri, gelgit kilidi, etiketler,
 * seçim parlaması ve kamera takibi için konum haritası.
 */

/** Dosya dokusu olan gökcisimleri (AI ile üretilen haritalar). */
const TEXTURE_PATHS: Record<string, string> = {
  mercury: "/textures/mercury.jpg",
  venus: "/textures/venus.jpg",
  earth: "/textures/earth.jpg",
  mars: "/textures/mars.jpg",
  jupiter: "/textures/jupiter.jpg",
  saturn: "/textures/saturn.jpg",
  uranus: "/textures/uranus.jpg",
  neptune: "/textures/neptune.jpg",
  moon: "/textures/moon.jpg",
  pluto: "/textures/pluto.jpg",
};

const AXIAL_TILT: Record<string, number> = {
  mercury: 0.03,
  venus: 177.4,
  earth: 23.44,
  mars: 25.2,
  jupiter: 3.1,
  saturn: 26.7,
  uranus: 97.8,
  neptune: 28.3,
  pluto: 122.5,
  moon: 6.7,
  ceres: 4,
  vesta: 29,
  haumea: 126,
  makemake: 29,
  eris: 78,
};

const DAY_HOURS: Record<string, number> = {
  mercury: 1407.6,
  venus: 5832.5,
  earth: 23.93,
  mars: 24.62,
  jupiter: 9.93,
  saturn: 10.66,
  uranus: 17.24,
  neptune: 16.11,
  pluto: 153.3,
  moon: 655.7,
  io: 42.5,
  europa: 85.2,
  ganymede: 171.7,
  callisto: 400.5,
  enceladus: 32.9,
  titan: 382.7,
  triton: 141.0,
  ceres: 9.07,
  vesta: 5.34,
  haumea: 3.92,
  makemake: 22.83,
  eris: 379.1,
};

/** Atmosfer ayarları: renk + yoğunluk + kabuk kalınlığı (gerçekçi oranlar). */
const ATMO_COLORS: Record<string, { color: string; opacity: number; scale: number }> = {
  earth: { color: "#7cc2ff", opacity: 1.0, scale: 1.05 },
  venus: { color: "#ffe9b8", opacity: 1.05, scale: 1.07 },
  mars: { color: "#ffb28a", opacity: 0.42, scale: 1.035 },
  jupiter: { color: "#ffd9a8", opacity: 0.6, scale: 1.045 },
  saturn: { color: "#ffe6b3", opacity: 0.55, scale: 1.04 },
  uranus: { color: "#b8f0ea", opacity: 0.7, scale: 1.045 },
  neptune: { color: "#7fd4e8", opacity: 0.75, scale: 1.05 },
  pluto: { color: "#cfd8e6", opacity: 0.22, scale: 1.03 },
  titan: { color: "#ffc873", opacity: 0.9, scale: 1.06 },
};

export interface Planet3DProps {
  body: BodyData;
  /** Simülasyon gün sayacı (ref) */
  days: { current: number };
  /** Kamera takibi için canlı konum haritası */
  posMap: Map<string, THREE.Vector3>;
  selected: boolean;
  showOrbit: boolean;
  showLabel: boolean;
  /** Uydu etiketleri için anahtar (galaksi modunda kapanır) */
  labelsEnabled?: boolean;
  onSelect: (id: string) => void;
  moons?: BodyData[];
}

/* ---------------------------- Atmosfer shader --------------------------- */

const ATMO_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vWorldPos;
void main() {
  vNormal = normalize(mat3(modelMatrix) * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = -mv.xyz;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

const ATMO_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vWorldPos;
void main() {
  // Fresnel: kenara bakış açısında artan saçılma
  float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.8);
  // Güneş (origin) yönü: gündüz tarafında atmosfer parlar, gece tarafı söner
  vec3 sunDir = normalize(-vWorldPos);
  float daySide = clamp(dot(normalize(vNormal), sunDir), 0.0, 1.0);
  float light = 0.06 + 0.94 * smoothstep(-0.25, 0.45, daySide);
  // Gündüz kenarında hafif mavi-beyaz saçılma tonu
  vec3 col = mix(uColor, uColor * 1.35 + vec3(0.10), fres * 0.55);
  gl_FragColor = vec4(col, fres * uOpacity * light);
}
`;

function Atmosphere({
  radius,
  color,
  opacity = 0.9,
  scale = 1.05,
}: {
  radius: number;
  color: string;
  opacity?: number;
  scale?: number;
}) {
  return (
    <mesh scale={scale}>
      <sphereGeometry args={[radius, 48, 48]} />
      <shaderMaterial
        vertexShader={ATMO_VERT}
        fragmentShader={ATMO_FRAG}
        uniforms={{
          uColor: { value: new THREE.Color(color) },
          uOpacity: { value: opacity },
        }}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ------------------------------ Etiket ---------------------------------- */

function Label({
  name,
  color,
  onSelect,
  small,
}: {
  name: string;
  color: string;
  onSelect: () => void;
  small?: boolean;
}) {
  return (
    <Html
      center
      zIndexRange={[15, 0]}
      style={{ pointerEvents: "none" }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={`-translate-y-[150%] cursor-pointer whitespace-nowrap rounded-full border px-2 py-0.5 font-medium backdrop-blur-sm transition-colors ${
          small ? "text-[9px]" : "text-[11px]"
        } border-white/15 bg-black/45 text-zinc-100 hover:border-amber-400/60 hover:text-amber-300`}
        style={{ pointerEvents: "auto" }}
      >
        <span
          className="mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle"
          style={{ background: color }}
          aria-hidden
        />
        {name}
      </button>
    </Html>
  );
}

/* --------------------------- Seçim parlaması ---------------------------- */

/** Modül düzeyinde geçici vektör (her karede yeniden tahsis etmemek için). */
const tmpVec = new THREE.Vector3();

function SelectionGlow({
  radius,
  opacity = 0.85,
}: {
  radius: number;
  opacity?: number;
}) {
  const tex = useMemo(
    () =>
      makeGlowTexture(
        "rgba(255,215,130,0.9)",
        "rgba(255,180,70,0.4)",
        "rgba(255,160,40,0)"
      ),
    []
  );
  const ref = useRef<THREE.Sprite>(null);
  useFrame(({ camera, clock }) => {
    if (!ref.current) return;
    const wp = ref.current.parent?.getWorldPosition(tmpVec);
    const dist = wp ? camera.position.distanceTo(wp) : 999;
    // Yakın planda ekranı beyaza gömmesin: parlama mesafeyle sınırlanır
    const base = radius * (3.3 + Math.sin(clock.elapsedTime * 2.4) * 0.35);
    const s = Math.min(base, Math.max(radius * 1.6, dist * 0.5));
    ref.current.scale.set(s, s, 1);
  });
  return (
    <sprite position={[0, 0, 0]}>
      <spriteMaterial
        map={tex}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent
        opacity={opacity}
      />
    </sprite>
  );
}

/* ------------------------------- Uydular -------------------------------- */

function MoonMeshBase({
  body,
  meshRef,
  selected,
  onSelect,
  map,
}: {
  body: BodyData;
  meshRef: React.RefObject<THREE.Mesh | null>;
  selected: boolean;
  onSelect: (id: string) => void;
  map: THREE.Texture | null;
}) {
  return (
    <>
      <mesh
        ref={meshRef}
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
        <sphereGeometry args={[body.sim.radius, 48, 48]} />
        {map ? (
          <meshStandardMaterial map={map} roughness={0.95} metalness={0} />
        ) : (
          <meshStandardMaterial color={body.color} roughness={0.95} metalness={0} />
        )}
      </mesh>
      {selected && <SelectionGlow radius={body.sim.radius} />}
    </>
  );
}

function MoonTextured({
  body,
  meshRef,
  selected,
  onSelect,
}: {
  body: BodyData;
  meshRef: React.RefObject<THREE.Mesh | null>;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const map = toSRGB(useTexture(TEXTURE_PATHS[body.id]));
  return (
    <MoonMeshBase
      body={body}
      meshRef={meshRef}
      selected={selected}
      onSelect={onSelect}
      map={map}
    />
  );
}

function MoonPlain({
  body,
  meshRef,
  selected,
  onSelect,
}: {
  body: BodyData;
  meshRef: React.RefObject<THREE.Mesh | null>;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const map = useMemo(
    () => makeRockyTexture(body.color, 0.25, true),
    [body.color]
  );
  return (
    <MoonMeshBase
      body={body}
      meshRef={meshRef}
      selected={selected}
      onSelect={onSelect}
      map={map}
    />
  );
}

function Moon3D({
  body,
  days,
  posMap,
  selected,
  onSelect,
  labelsEnabled = true,
}: {
  body: BodyData;
  days: { current: number };
  posMap: Map<string, THREE.Vector3>;
  selected: boolean;
  onSelect: (id: string) => void;
  labelsEnabled?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [near, setNear] = useState(false);
  const frame = useRef(0);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const sim = useMemo(
    () => ({ ...body.sim, a: body.sim.moonOrbit ?? 10 }),
    [body.sim]
  );
  const orbitGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(orbitPoints(sim, 96), 3));
    return geo;
  }, [sim]);

  // priority -10: uydu konumları da kare başında güncellenir (kamera takibi
  // ve etiketler aynı kareyi görsün)
  useFrame(
    ({ camera }) => {
    const local = orbitPosition(sim, days.current);
    groupRef.current?.position.set(local.x, local.y, local.z);
    // Gelgit kilidi: hep aynı yüzü ebeveyne çevir
    if (meshRef.current) {
      meshRef.current.rotation.y = -Math.atan2(local.z, local.x);
    }
    posMap.set(
      body.id,
      groupRef.current!.getWorldPosition(tmp).clone()
    );
    // Etiket yalnızca kamera yakındayken
    frame.current++;
    if (frame.current % 14 === 0) {
      const dist = camera.position.distanceTo(groupRef.current!.position);
      setNear(dist < 130);
    }
    },
    -10
  );

  return (
    <group ref={groupRef}>
      {TEXTURE_PATHS[body.id] ? (
        <MoonTextured
          body={body}
          meshRef={meshRef}
          selected={selected}
          onSelect={onSelect}
        />
      ) : (
        <MoonPlain
          body={body}
          meshRef={meshRef}
          selected={selected}
          onSelect={onSelect}
        />
      )}
      {near && labelsEnabled && (
        <Label
          name={body.name}
          color={body.color}
          onSelect={() => onSelect(body.id)}
          small
        />
      )}
    </group>
  );
}

/* ---------------------------- Dünya bulutları --------------------------- */

function EarthClouds({ radius }: { radius: number }) {
  const cloudsMap = toSRGB(useTexture("/textures/earth_clouds.jpg"));
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.006;
  });
  return (
    <mesh ref={ref} scale={1.02}>
      <sphereGeometry args={[radius, 48, 48]} />
      <meshStandardMaterial
        map={cloudsMap}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ------------------------------ Ana gezegen ----------------------------- */

function Planet3DInner({
  body,
  map,
  days,
  posMap,
  selected,
  showOrbit,
  showLabel,
  labelsEnabled = true,
  onSelect,
  moons,
}: Planet3DProps & { map: THREE.Texture | null; moons: BodyData[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [tierVisible, setTierVisible] = useState(body.sim.labelTier === 0);
  const frame = useRef(0);
  const lastDays = useRef(days.current);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const isSun = !!body.sim.isSun;

  const orbitGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(orbitPoints(body.sim, 256), 3)
    );
    return geo;
  }, [body.sim]);

  const tilt = (AXIAL_TILT[body.id] ?? 0) * (Math.PI / 180);
  const dayHours = DAY_HOURS[body.id] ?? 24;
  const ring = body.sim.ring;
  const atmo = ATMO_COLORS[body.id];

  const ringTex = useMemo(() => {
    if (!ring) return null;
    if (body.id === "uranus") return makeUranusRingTexture();
    return makeSaturnRingTexture();
  }, [ring, body.id]);

  const ringGeo = useMemo(() => {
    if (!ring) return null;
    const inner = body.sim.radius * ring.inner;
    const outer = body.sim.radius * ring.outer;
    const geo = new THREE.RingGeometry(inner, outer, 160, 1);
    remapRingUVs(geo, inner, outer);
    return geo;
  }, [ring, body.sim.radius]);

  // ÖNEMLİ: priority -10 — gezegen konumları karenin EN BAŞINDA güncellenir.
  // Böylece kamera rig'i (priority 0) ve Html etiketleri aynı karenin
  // konumunu okur; mesh/etiket/kamera uyumsuzluğu (yakın planda gezegenin
  // kayıp/kasılma görünmesi) tamamen ortadan kalkar.
  useFrame(
    ({ camera }, delta) => {
    if (!isSun) {
      const p = orbitPosition(body.sim, days.current);
      groupRef.current?.position.set(p.x, p.y, p.z);
      posMap.set(body.id, groupRef.current!.position);
    }
    // Dönüş — yüksek zaman hızlarında devrilmesin diye sınırlandı
    const dDays = days.current - lastDays.current;
    lastDays.current = days.current;
    if (meshRef.current && dDays > 0) {
      const dRot = (dDays * 24 * Math.PI * 2) / dayHours;
      meshRef.current.rotation.y += Math.min(dRot, delta * 2.2);
    }
    // Etiket görünürlüğü
    frame.current++;
    if (frame.current % 14 === 0 && body.sim.labelTier !== 0) {
      const wp = groupRef.current!.getWorldPosition(tmp);
      const dist = camera.position.distanceTo(wp);
      const threshold = body.sim.labelTier === 1 ? 950 : 99999;
      setTierVisible(dist < threshold);
    }
    },
    -10
  );

  return (
    <>
      {/* Yörünge çizgisi */}
      {showOrbit && !isSun && (
        <lineLoop geometry={orbitGeo}>
          <lineBasicMaterial
            color={selected ? "#fbbf24" : "#e8e4dc"}
            transparent
            opacity={selected ? 0.5 : 0.14}
            depthWrite={false}
          />
        </lineLoop>
      )}

      <group ref={groupRef}>
        <group rotation={[0, 0, tilt]}>
          <mesh
            ref={meshRef}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(body.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(true);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              setHovered(false);
              document.body.style.cursor = "auto";
            }}
          >
            <sphereGeometry args={[body.sim.radius, 72, 72]} />
            {map ? (
              <meshStandardMaterial
                map={map}
                roughness={0.88}
                metalness={0.02}
              />
            ) : (
              <meshStandardMaterial
                color={body.color}
                roughness={0.9}
                metalness={0.02}
              />
            )}
          </mesh>

          {body.id === "earth" && <EarthClouds radius={body.sim.radius} />}

          {atmo && (
            <Atmosphere
              radius={body.sim.radius}
              color={atmo.color}
              opacity={atmo.opacity}
              scale={atmo.scale}
            />
          )}

          {ring && ringGeo && ringTex && (
            <group rotation={[0, (ring.nodeDeg * Math.PI) / 180, 0]}>
              <mesh
                geometry={ringGeo}
                rotation={[
                  -Math.PI / 2 + (ring.tiltDeg * Math.PI) / 180,
                  0,
                  0,
                ]}
              >
                <meshBasicMaterial
                  map={ringTex}
                  transparent
                  side={THREE.DoubleSide}
                  depthWrite={false}
                  opacity={0.96}
                />
              </mesh>
            </group>
          )}
        </group>

        {/* Seçim / hover parlaması */}
        {selected && <SelectionGlow radius={body.sim.radius} />}
        {hovered && !selected && (
          <SelectionGlow radius={body.sim.radius} opacity={0.35} />
        )}

        {/* Uydular */}
        {moons?.map((m) => (
          <Moon3D
            key={m.id}
            body={m}
            days={days}
            posMap={posMap}
            selected={false}
            onSelect={onSelect}
            labelsEnabled={labelsEnabled}
          />
        ))}

        {/* Etiket */}
        {showLabel && (
          <Label
            name={body.name}
            color={body.color}
            onSelect={() => onSelect(body.id)}
            small={body.sim.labelTier !== 0}
          />
        )}
      </group>
    </>
  );
}

/** useTexture'ı koşulsuz çağırmak için sarmalayıcı (dosya dokusu olanlar). */
function Planet3DTextured(props: Planet3DProps & { moons: BodyData[] }) {
  const map = toSRGB(useTexture(TEXTURE_PATHS[props.body.id]));
  return <Planet3DInner {...props} map={map} />;
}

function Planet3DPlain(props: Planet3DProps & { moons: BodyData[] }) {
  const map = useMemo(
    () => makeRockyTexture(props.body.color, 0.28, true),
    [props.body.color]
  );
  return <Planet3DInner {...props} map={map} />;
}

function Planet3D(props: Planet3DProps & { moons: BodyData[] }) {
  return TEXTURE_PATHS[props.body.id] ? (
    <Planet3DTextured {...props} />
  ) : (
    <Planet3DPlain {...props} />
  );
}

export default memo(Planet3D);
