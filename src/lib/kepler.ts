import type { BodySim } from "./solar-data";

/**
 * Kepler yörünge matematiği — tüm 3D bileşenler tarafından paylaşılır.
 * Konum üç boyutlu: eliptik yörünge, periapsis dönüşü ve eğim dahil.
 */

const TWO_PI = Math.PI * 2;

/** Newton-Raphson ile Kepler denklemini (M = E - e·sinE) çözer. */
export function solveKeplerE(meanAnomaly: number, e: number): number {
  let E = meanAnomaly;
  for (let i = 0; i < 6; i++) {
    const dE = (E - e * Math.sin(E) - meanAnomaly) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-8) break;
  }
  return E;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Simülasyon gününe göre yörünge üzerindeki konumu hesaplar.
 * Retrograd hareket için negatif periodDays kullanılır.
 */
export function orbitPosition(
  sim: BodySim,
  days: number,
  out: Vec3 = { x: 0, y: 0, z: 0 }
): Vec3 {
  const period = sim.periodDays || 1;
  const M = sim.meanAnomaly0 + TWO_PI * (days / period);
  const E = solveKeplerE(((M % TWO_PI) + TWO_PI) % TWO_PI, sim.e);
  const a = sim.a;
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  // Yörünge düzlemi koordinatları (periapsis +X yönünde)
  const px = a * (cosE - sim.e);
  const py = a * Math.sqrt(Math.max(0, 1 - sim.e * sim.e)) * sinE;
  // Periapsis açısıyla döndür
  const w = (sim.periDeg * Math.PI) / 180;
  const cosW = Math.cos(w);
  const sinW = Math.sin(w);
  const ox = px * cosW - py * sinW;
  const oy = px * sinW + py * cosW;
  // Eğim: X ekseni (düğüm çizgisi) çevresinde döndür → Y = dikey
  const inc = (sim.inclDeg * Math.PI) / 180;
  const cosI = Math.cos(inc);
  const sinI = Math.sin(inc);
  out.x = ox;
  out.y = oy * sinI;
  out.z = oy * cosI;
  return out;
}

/** Orbit çizgisi için tam bir yörünge turunun noktalarını üretir. */
export function orbitPoints(sim: BodySim, segments = 256): Float32Array {
  const arr = new Float32Array((segments + 1) * 3);
  const v: Vec3 = { x: 0, y: 0, z: 0 };
  for (let i = 0; i <= segments; i++) {
    const M = (i / segments) * TWO_PI;
    const E = solveKeplerE(M, sim.e);
    const cosE = Math.cos(E);
    const sinE = Math.sin(E);
    const px = sim.a * (cosE - sim.e);
    const py = sim.a * Math.sqrt(Math.max(0, 1 - sim.e * sim.e)) * sinE;
    const w = (sim.periDeg * Math.PI) / 180;
    const ox = px * Math.cos(w) - py * Math.sin(w);
    const oy = px * Math.sin(w) + py * Math.cos(w);
    const inc = (sim.inclDeg * Math.PI) / 180;
    arr[i * 3] = ox;
    arr[i * 3 + 1] = oy * Math.sin(inc);
    arr[i * 3 + 2] = oy * Math.cos(inc);
  }
  return arr;
}
