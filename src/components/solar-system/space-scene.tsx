"use client";

import {
  Suspense,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Html, OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { BodyData } from "@/lib/solar-data";
import Env3D, { GalaxySpiral, NebulaSky } from "./env3d";
import Planet3D from "./planet3d";
import Sun3D from "./sun3d";

/**
 * SpaceScene — R3F (WebGL) güneş sistemi sahnesi.
 * Kepler yörüngeli dokulu gezegenler, shader Güneş, asteroit/Kuiper/Oort
 * kuşakları, heliopause sınırı, Voyager sondaları, Halley kuyruklusu ve
 * Samanyolu galaksisi (galaksi modu) + bloom postprocessing.
 */

export interface SceneToggles {
  orbits: boolean;
  labels: boolean;
  belt: boolean;
  trojans: boolean;
  kuiper: boolean;
  oort: boolean;
  comet: boolean;
  boundaries: boolean;
  galacticSpin: boolean;
  sunGlow: boolean;
  starfield: boolean;
}

export interface SpaceSceneProps {
  bodies: BodyData[];
  speed: number;
  paused: boolean;
  toggles: SceneToggles;
  selectedId: string | null;
  follow: boolean;
  galaxyMode: boolean;
  onSelect: (id: string | null) => void;
  onTick: (days: number) => void;
}

export interface SpaceSceneHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  setPreset: (p: "top" | "oblique") => void;
}

type Cmd =
  | { kind: "zoomIn" | "zoomOut" | "reset" | "top" | "oblique" }
  | null;

const DEFAULT_POS = new THREE.Vector3(0, 300, 620);
const TOP_POS = new THREE.Vector3(0, 780, 90);
const GALAXY_POS = new THREE.Vector3(1050, 2050, 1500);

/* ------------------------------ Sim saati ------------------------------- */

function SimClock({
  speed,
  paused,
  daysRef,
  onTick,
}: {
  speed: number;
  paused: boolean;
  daysRef: { current: number };
  onTick: (d: number) => void;
}) {
  const acc = useRef(0);
  useFrame((_, delta) => {
    if (!paused) daysRef.current += delta * speed;
    acc.current += delta;
    if (acc.current > 0.35) {
      acc.current = 0;
      onTick(daysRef.current);
    }
  });
  return null;
}

/* ------------------------------ Kamera rig ------------------------------ */

interface Fly {
  t0: number;
  dur: number;
  fromPos: THREE.Vector3;
  toPos: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
  /** Ayarlıyken uçuş bitene kadar bu gökcismi hareket ettikçe hedefi izler */
  trackId?: string;
  /** trackId için: kameranın hedefe göre yön/uzaklık ofseti */
  trackDir?: THREE.Vector3;
  trackDist?: number;
}

function CameraRig({
  follow,
  selectedId,
  posMap,
  radiusMap,
  cmdRef,
  galaxyMode,
  controlsRef,
}: {
  follow: boolean;
  selectedId: string | null;
  posMap: Map<string, THREE.Vector3>;
  radiusMap: Map<string, number>;
  cmdRef: { current: Cmd };
  galaxyMode: boolean;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const camera = useThree((s) => s.camera);
  const fly = useRef<Fly | null>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const lastGalaxy = useRef(galaxyMode);
  const lastFollowKey = useRef<string | null>(null);
  /** Yakın plana kilitlenme: takip kapalıyken bile seçili cisme çok
   * yaklaşılırsa kamera otomatik olarak onunla birlikte taşınır (kasılma
   * hissinin kökten çözümü). Hysteresis ile titremez. */
  const softLock = useRef<string | null>(null);

  // Galaksi modu geçişi
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (lastGalaxy.current === galaxyMode) return;
    lastGalaxy.current = galaxyMode;
    fly.current = {
      t0: performance.now(),
      dur: 2600,
      fromPos: camera.position.clone(),
      toPos: galaxyMode ? GALAXY_POS.clone() : DEFAULT_POS.clone(),
      fromTarget: controls.target.clone(),
      toTarget: new THREE.Vector3(0, 0, 0),
    };
    controlsRef.current!.enabled = false;
  }, [galaxyMode, camera, controlsRef]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Komut kuyruğu
    const cmd = cmdRef.current;
    if (cmd) {
      cmdRef.current = null;
      if (cmd.kind === "zoomIn" || cmd.kind === "zoomOut") {
        // Yakınlaştırırken hedefi SEÇİLİ cisme doğru yakınsat: kullanıcı bir
        // gezegen seçip zoom'a bastığında kamera o gezegene yaklaşır ve
        // yeterince yakınlaşınca yumuşak kilit otomatik devreye girer.
        const bp = cmd.kind === "zoomIn" && selectedId
          ? posMap.get(selectedId)
          : undefined;
        if (bp) controls.target.lerp(bp, 0.45);
        const dir = camera.position.clone().sub(controls.target);
        const len = dir.length();
        // Yakınlaştırırken gökcisminin içine girmeyi engelle:
        // güvenli minimum = cisim yarıçapının 2,6 katı (seçili/takip edilen)
        const targetR = selectedId
          ? (radiusMap.get(selectedId) ?? 0)
          : 0;
        const minLen = Math.max(3.2, targetR * 2.6, cmd.kind === "zoomIn" ? 3.2 : 9);
        const nextLen =
          cmd.kind === "zoomIn"
            ? Math.max(minLen, len * 0.74)
            : Math.min(4200, len * 1.35);
        camera.position.copy(controls.target).add(dir.setLength(nextLen));
      } else if (cmd.kind === "reset" || cmd.kind === "oblique") {
        fly.current = {
          t0: performance.now(),
          dur: 1000,
          fromPos: camera.position.clone(),
          toPos: DEFAULT_POS.clone(),
          fromTarget: controls.target.clone(),
          toTarget: new THREE.Vector3(0, 0, 0),
        };
        controlsRef.current!.enabled = false;
      } else if (cmd.kind === "top") {
        fly.current = {
          t0: performance.now(),
          dur: 1000,
          fromPos: camera.position.clone(),
          toPos: TOP_POS.clone(),
          fromTarget: controls.target.clone(),
          toTarget: new THREE.Vector3(0, 0, 0),
        };
        controlsRef.current!.enabled = false;
      }
    }

    // Uçuş animasyonu
    if (fly.current) {
      const f = fly.current;
      // Hareketli gökcismini izleyen uçuş: hedef her karede güncellenir
      if (f.trackId && f.trackDir) {
        const tp = posMap.get(f.trackId);
        if (tp) {
          f.toTarget.copy(tp);
          f.toPos.copy(tp).add(
            f.trackDir.clone().multiplyScalar(f.trackDist ?? 17)
          );
        }
      }
      const t = Math.min(1, (performance.now() - f.t0) / f.dur);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      camera.position.lerpVectors(f.fromPos, f.toPos, e);
      controls.target.lerpVectors(f.fromTarget, f.toTarget, e);
      if (t >= 1) {
        fly.current = null;
        controls.enabled = true;
      }
      controls.update();
      return;
    }

    // Takip başlangıcı: gezegene yumuşak yaklaşma uçuşu
    const followKey = follow && selectedId ? selectedId : null;
    if (!follow) lastFollowKey.current = null;
    if (followKey && followKey !== lastFollowKey.current && !fly.current) {
      const tp = posMap.get(followKey);
      if (tp) {
        lastFollowKey.current = followKey;
        const r = radiusMap.get(followKey) ?? 3;
        const dir = camera.position.clone().sub(tp);
        if (dir.lengthSq() < 1e-6) dir.set(0.3, 0.45, 1);
        dir.normalize();
        dir.y = Math.max(dir.y, 0.25);
        dir.normalize();
        const dist = Math.max(6, r * 7);
        fly.current = {
          t0: performance.now(),
          dur: 1700,
          fromPos: camera.position.clone(),
          toPos: tp.clone().add(dir.clone().multiplyScalar(dist)),
          fromTarget: controls.target.clone(),
          toTarget: tp.clone(),
          // Cisim uçarken hedefi kaçırmasın: uçuş boyunca izle
          trackId: followKey,
          trackDir: dir,
          trackDist: dist,
        };
        controlsRef.current!.enabled = false;
      }
    }

    // Takip / yumuşak kilit — TAM DELTA İZLEME
    // · follow modu: hedef her karede cismin üzerine kilitlenir, kamera aynı
    //   deltayla taşınır; kullanıcının OrbitControls ofseti korunur.
    // · Yumuşak kilit: follow kapalıyken bile seçili cisme çok yaklaşılırsa
    //   (mesafe < r×9) kamera otomatik kilitlenir — yaklaşan gezegen asla
    //   kaçıp "kasılmaz". Uzaklaşınca (r×13) kilit kendiliğinden bırakılır.
    if (selectedId && !fly.current) {
      const target = posMap.get(selectedId);
      const r = radiusMap.get(selectedId) ?? 3;
      if (target) {
        const dist = camera.position.distanceTo(target);
        if (!follow) {
          if (softLock.current === selectedId) {
            if (dist > r * 13 || galaxyMode) softLock.current = null;
          } else if (!galaxyMode && dist < r * 9) {
            softLock.current = selectedId;
          }
        } else {
          softLock.current = null;
        }
        if ((follow || softLock.current === selectedId) && !galaxyMode) {
          tmp.copy(target).sub(controls.target);
          if (tmp.lengthSq() > 0) {
            controls.target.copy(target);
            camera.position.add(tmp);
          }
        }
      }
    }
    controls.update();
  });

  return null;
}

/* --------------------------- Sahne içeriği ------------------------------ */

function SceneContent({
  bodies,
  speed,
  paused,
  toggles,
  selectedId,
  follow,
  galaxyMode,
  onSelect,
  onTick,
  daysRef,
  cmdRef,
  posMap,
  controlsRef,
}: SpaceSceneProps & {
  daysRef: { current: number };
  cmdRef: { current: Cmd };
  posMap: Map<string, THREE.Vector3>;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const sun = bodies.find((b) => b.sim.isSun);
  const halley = bodies.find((b) => b.id === "halley");
  const jupiter = bodies.find((b) => b.id === "jupiter");

  const radiusMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of bodies) m.set(b.id, b.sim.radius);
    return m;
  }, [bodies]);

  const planets = useMemo(
    () => bodies.filter((b) => !b.sim.parentId && !b.sim.isSun),
    [bodies]
  );
  const moonsOf = useMemo(() => {
    const map = new Map<string, BodyData[]>();
    for (const b of bodies) {
      if (b.sim.parentId) {
        const arr = map.get(b.sim.parentId) ?? [];
        arr.push(b);
        map.set(b.sim.parentId, arr);
      }
    }
    return (id: string) => map.get(id) ?? [];
  }, [bodies]);

  return (
    <>
      <SimClock
        speed={speed}
        paused={paused}
        daysRef={daysRef}
        onTick={onTick}
      />
      <CameraRig
        follow={follow}
        selectedId={selectedId}
        posMap={posMap}
        radiusMap={radiusMap}
        cmdRef={cmdRef}
        galaxyMode={galaxyMode}
        controlsRef={controlsRef}
      />
      <ambientLight intensity={0.16} />

      <Suspense
        fallback={
          <Html center>
            <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs text-amber-300">
              <span className="h-3 w-3 animate-ping rounded-full bg-amber-400" />
              Dokular yükleniyor…
            </div>
          </Html>
        }
      >
        {/* Nebula gökyüzü + Samanyolu sarmalı — her modda arka plan */}
        <NebulaSky spin={toggles.galacticSpin} />
        {toggles.starfield && (
          <Stars
            radius={3600}
            depth={300}
            count={5500}
            factor={6.5}
            saturation={0.1}
            fade
            speed={0.55}
          />
        )}
        <GalaxySpiral active={galaxyMode} onSelect={onSelect} />

        {/* Güneş sistemi grubu — galaksi modunda gizlenir */}
        <group visible={!galaxyMode}>
          {sun && <Sun3D body={sun} glow={toggles.sunGlow} />}
          {planets.map((b) => (
            <Planet3D
              key={b.id}
              body={b}
              days={daysRef}
              posMap={posMap}
              selected={selectedId === b.id}
              showOrbit={toggles.orbits && !galaxyMode}
              showLabel={toggles.labels && !galaxyMode}
              labelsEnabled={toggles.labels && !galaxyMode}
              onSelect={onSelect}
              moons={moonsOf(b.id)}
            />
          ))}
          <Env3D
            days={daysRef}
            showBelt={toggles.belt}
            showTrojans={toggles.trojans}
            showKuiper={toggles.kuiper}
            showOort={toggles.oort}
            showBoundaries={toggles.boundaries && !galaxyMode}
            labelsEnabled={!galaxyMode}
            galacticSpin={toggles.galacticSpin}
            jupiterPeriod={Math.abs(jupiter?.sim.periodDays ?? 4333)}
            onSelect={onSelect}
            halleyBody={toggles.comet && !galaxyMode ? halley : undefined}
          />
        </group>

        <EffectComposer multisampling={0}>
          <Bloom
            mipmapBlur
            intensity={1.25}
            luminanceThreshold={0.55}
            luminanceSmoothing={0.3}
            radius={0.72}
          />
          <Vignette offset={0.24} darkness={0.62} />
        </EffectComposer>
      </Suspense>
    </>
  );
}

/* ------------------------------ Kök bileşen ----------------------------- */

const SpaceScene = forwardRef<SpaceSceneHandle, SpaceSceneProps>(
  function SpaceScene(props, ref) {
    const daysRef = useRef(0);
    const cmdRef = useRef<Cmd>(null);
    const posMap = useMemo(() => new Map<string, THREE.Vector3>(), []);
    const controlsRef = useRef<OrbitControlsImpl | null>(null);
    const downPos = useRef<[number, number] | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        zoomIn: () => {
          cmdRef.current = { kind: "zoomIn" };
        },
        zoomOut: () => {
          cmdRef.current = { kind: "zoomOut" };
        },
        resetView: () => {
          cmdRef.current = { kind: "reset" };
        },
        setPreset: (p) => {
          cmdRef.current = { kind: p };
        },
      }),
      []
    );

    return (
      <Canvas
        className="absolute inset-0"
        camera={{ position: [0, 300, 620], fov: 48, near: 0.5, far: 20000 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={(state) => {
          // Yazılım render'ı / bellek baskısı sonrası WebGL bağlamı kaybolabilir.
          // preventDefault, tarayıcıya bağlamı geri getirebileceğimizi söyler;
          // güvenli toparlama için sayfayı bir kez yeniden yükleriz.
          state.gl.domElement.addEventListener(
            "webglcontextlost",
            (e) => {
              e.preventDefault();
              try {
                if (!sessionStorage.getItem("ctxLostReloaded")) {
                  sessionStorage.setItem("ctxLostReloaded", "1");
                  window.location.reload();
                }
              } catch {
                /* sessionStorage yok */
              }
            }
          );
        }}
        onPointerDown={(e) => {
          downPos.current = [e.clientX, e.clientY];
        }}
        onPointerMissed={(e) => {
          const d = downPos.current;
          if (
            d &&
            Math.hypot(e.clientX - d[0], e.clientY - d[1]) < 6
          ) {
            props.onSelect(null);
          }
        }}
      >
        <color attach="background" args={["#020209"]} />
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.07}
          minDistance={3.2}
          maxDistance={4400}
          zoomSpeed={0.85}
        />
        <SceneContent
          {...props}
          daysRef={daysRef}
          cmdRef={cmdRef}
          posMap={posMap}
          controlsRef={controlsRef}
        />
      </Canvas>
    );
  }
);

export default SpaceScene;
