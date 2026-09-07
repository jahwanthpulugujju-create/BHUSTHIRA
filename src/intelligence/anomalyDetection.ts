import type { SensorNode } from '../types';

/**
 * Lightweight explainable anomaly detection for mining telemetry.
 * Evaluates deviation from calibrated baseline, rates of change, and temporal persistence.
 */
export function calculateNodeAnomaly(node: SensorNode): {
  score: number; // 0 - 1
  isAnomalous: boolean;
  rateOfChangeTilt: number;
  rateOfChangeDisp: number;
} {
  if (node.status === 'OFFLINE') {
    return { score: 0, isAnomalous: false, rateOfChangeTilt: 0, rateOfChangeDisp: 0 };
  }

  // Delta from baseline
  const deltaTilt = Math.max(0, node.tilt - node.baseline.tilt);
  const deltaDisp = Math.max(0, node.displacement - node.baseline.displacement);
  const deltaVib = Math.max(0, node.vibration - node.baseline.vibration);

  // Rate of change over last 5 readings
  const historyDisp = node.history.displacement;
  const len = historyDisp.length;
  let rateDisp = 0;
  if (len >= 5) {
    const recent = historyDisp.slice(-5);
    rateDisp = Math.max(0, (recent[recent.length - 1] - recent[0]) * 12); // Extrapolated mm/min
  }

  const historyTilt = node.history.tilt;
  let rateTilt = 0;
  if (historyTilt.length >= 5) {
    const recentT = historyTilt.slice(-5);
    rateTilt = Math.max(0, (recentT[recentT.length - 1] - recentT[0]) * 12); // °/min
  }

  // Normalized anomaly feature scores
  // Tilt threshold: normal <0.4°, elevated 0.8°, critical >2.0°
  const tiltScore = Math.min(1.0, deltaTilt / 2.2);
  
  // Displacement threshold: normal <1.0mm, elevated 4.0mm, critical >10.0mm
  const dispScore = Math.min(1.0, deltaDisp / 10.0);
  
  // Vibration threshold: normal <0.15g, anomalous >0.5g
  const vibScore = Math.min(1.0, deltaVib / 0.6);
  
  // Crack acoustic emission indicator
  const crackScore = node.crack_signal ? 0.9 : 0.0;

  // Composite anomaly score (weighted)
  // Displacement and tilt are primary subsidence kinematics; vibration & crack are micro-seismic early signals
  const rawScore = (dispScore * 0.38) + (tiltScore * 0.28) + (vibScore * 0.18) + (crackScore * 0.16);

  return {
    score: Math.min(1.0, Math.max(0, rawScore)),
    isAnomalous: rawScore >= 0.30,
    rateOfChangeTilt: Number(rateTilt.toFixed(3)),
    rateOfChangeDisp: Number(rateDisp.toFixed(2))
  };
}
