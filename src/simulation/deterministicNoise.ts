/**
 * Deterministic, Seeded Pseudo-Noise Engine for BHUSTHIRA Synthetic Telemetry.
 * Ensures that for any given (seed, tick, nodeId), the generated measurement
 * is 100% deterministic and reproducible across live runs, guided demos, and replays.
 */

// Simple string hash function for deterministic integer seed derivation
function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Deterministic pseudo-noise for a specific node at a specific simulation second.
 * Returns a value in [-scale, +scale] with smooth Brownian-like harmonic transitions.
 */
export function deterministicNoise(
  seed: string,
  tick: number,
  nodeId: string,
  scale: number = 0.02
): number {
  const nodeOffset = hashString(`${seed}:${nodeId}`) % 1000;
  const t = tick + (nodeOffset / 100.0);

  // Multi-frequency harmonic combination to simulate real geotechnical transducer micro-fluctuations
  const harmonic1 = Math.sin(t * 1.37);
  const harmonic2 = Math.cos(t * 2.81);
  const harmonic3 = Math.sin(t * 5.19 + 0.5);

  const raw = (harmonic1 * 0.55 + harmonic2 * 0.3 + harmonic3 * 0.15);
  return Number((raw * scale).toFixed(3));
}

/**
 * Deterministic pseudo-random number in range [0, 1) based on a tick and key.
 */
export function deterministicRandom(seed: string, tick: number, key: string): number {
  const h = hashString(`${seed}:${tick}:${key}`);
  // Mulberry32 step
  let t = (h + 0x6D2B79F5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
