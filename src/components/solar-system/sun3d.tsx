"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { BodyData } from "@/lib/solar-data";
import { makeGlowTexture } from "./procedural-textures";

/**
 * Sun3D — özel shader'lı gerçekçi Güneş: kaynayan granülasyon (simplex fBm),
 * kenar kararması, nabız atan çift korona katmanı ve ana ışık kaynağı.
 */

const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const SUN_VERT = /* glsl */ `
varying vec3 vPos;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vPos = position;
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

const SUN_FRAG = /* glsl */ `
uniform float uTime;
varying vec3 vPos;
varying vec3 vNormal;
varying vec3 vView;
${NOISE_GLSL}
float fbm(vec3 p) {
  float f = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    f += a * snoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return f;
}
void main() {
  vec3 p = normalize(vPos);
  // Yavaş kaynayan büyük hücreler + hızlı ince granüller
  float n1 = fbm(p * 2.6 + vec3(uTime * 0.045, uTime * 0.03, -uTime * 0.035));
  float n2 = fbm(p * 8.5 - vec3(0.0, uTime * 0.07, uTime * 0.05));
  float t = clamp(n1 * 0.6 + n2 * 0.4 + 0.5, 0.0, 1.0);
  vec3 cSpot = vec3(0.42, 0.10, 0.01);
  vec3 cLow  = vec3(0.98, 0.42, 0.03);
  vec3 cMid  = vec3(1.00, 0.76, 0.24);
  vec3 cHot  = vec3(1.00, 0.95, 0.80);
  vec3 col = mix(cSpot, cLow, smoothstep(0.08, 0.42, t));
  col = mix(col, cMid, smoothstep(0.42, 0.72, t));
  col = mix(col, cHot, smoothstep(0.72, 0.98, t));
  // Kenar kararması (limb darkening)
  float lim = clamp(dot(normalize(vNormal), normalize(vView)), 0.0, 1.0);
  col *= mix(0.52, 1.22, pow(lim, 0.6));
  col *= 1.85; // Bloom yakalasın
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function Sun3D({
  body,
  glow = true,
}: {
  body: BodyData;
  /** Korona/ışıma katmanları — kontrol panelinden kapatılabilir */
  glow?: boolean;
}) {
  const radius = body.sim.radius;
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const corona1Ref = useRef<THREE.Sprite>(null);
  const corona2Ref = useRef<THREE.Sprite>(null);
  const corona3Ref = useRef<THREE.Sprite>(null);
  const groupRef = useRef<THREE.Group>(null);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const glowTex = useMemo(() => makeGlowTexture(), []);

  useFrame((state, delta) => {
    if (matRef.current) matRef.current.uniforms.uTime.value += delta;
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.008;
    const t = state.clock.elapsedTime;
    if (corona1Ref.current) {
      const s = radius * (7.4 + Math.sin(t * 0.7) * 0.35);
      corona1Ref.current.scale.set(s, s, 1);
    }
    if (corona2Ref.current) {
      const s = radius * (4.6 + Math.sin(t * 1.1 + 2) * 0.3);
      corona2Ref.current.scale.set(s, s, 1);
    }
    if (corona3Ref.current) {
      // En dış: geniş, çok soluk halogen — korona yıldızlararası boşluğa geçiş
      const s = radius * (13.5 + Math.sin(t * 0.35 + 1) * 0.55);
      corona3Ref.current.scale.set(s, s, 1);
    }
  });

  return (
    <group>
      <pointLight intensity={3.4} distance={0} decay={0} color="#fff2dd" />
      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[radius, 96, 96]} />
          <shaderMaterial
            ref={matRef}
            vertexShader={SUN_VERT}
            fragmentShader={SUN_FRAG}
            uniforms={uniforms}
          />
        </mesh>
      </group>
      {glow && (
        <>
          <sprite ref={corona3Ref} scale={[radius * 13.5, radius * 13.5, 1]}>
            <spriteMaterial
              map={glowTex}
              color="#c97a2a"
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              transparent
              opacity={0.16}
            />
          </sprite>
          <sprite ref={corona2Ref} scale={[radius * 4.6, radius * 4.6, 1]}>
            <spriteMaterial
              map={glowTex}
              color="#ffb84d"
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              transparent
              opacity={0.55}
            />
          </sprite>
          <sprite ref={corona1Ref} scale={[radius * 7.4, radius * 7.4, 1]}>
            <spriteMaterial
              map={glowTex}
              color="#ff9a2e"
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              transparent
              opacity={0.3}
            />
          </sprite>
        </>
      )}
    </group>
  );
}
