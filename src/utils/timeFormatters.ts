/**
 * Format elapsed simulation seconds into standard engineering timestamp T+mm:ss.
 * Example: 42 -> "T+00:42", 125 -> "T+02:05"
 */
export function formatSimulationTime(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safeSec / 60);
  const s = safeSec % 60;
  return `T+${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Format simulation seconds for clean incident replay scrubbing.
 * Example: 42 -> "00:42", 125 -> "02:05"
 */
export function formatReplayTime(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safeSec / 60);
  const s = safeSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
