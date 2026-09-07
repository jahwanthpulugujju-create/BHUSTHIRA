import type { SensorNode } from '../types';

export interface SpatialAnalysisResult {
  clusterStrength: number; // 0 - 1
  neighborAgreementRatio: string; // e.g. "3 / 4"
  agreementPercent: number; // 0 - 100%
  spatialCorrelationLevel: 'LOW' | 'MODERATE' | 'HIGH';
  multiSensorAgreementLevel: 'LOW' | 'MODERATE' | 'HIGH';
  isSuspectedSensorFault: boolean;
  affectedPanel: 'Panel A' | 'Panel B' | 'Panel C' | 'Panel D' | 'None';
  explanation: string;
}

/**
 * Calculates spatial clustering of deformation across the sensor network.
 * Disqualifies single-node spikes as suspected sensor faults.
 */
export function analyzeSpatialCorrelation(
  nodes: Record<string, SensorNode>,
  activePanel: 'Panel B'
): SpatialAnalysisResult {
  const allNodes = Object.values(nodes).filter(n => n.status !== 'OFFLINE' && !n.isReference);
  const anomalousNodes = allNodes.filter(n => n.anomalyScore >= 0.28 || n.status === 'ANOMALOUS' || n.status === 'CRITICAL');
  
  // Specifically examine the active longwall mining zone (Panel B: N02, N03, N04)
  const panelBNodes = [nodes['N02'], nodes['N03'], nodes['N04']].filter(Boolean);
  const panelBAnomalous = panelBNodes.filter(n => n && (n.anomalyScore >= 0.28 || n.status === 'ANOMALOUS' || n.status === 'CRITICAL'));

  // Sensor Fault Check:
  // If exactly 1 sensor has high anomaly (>0.6) but its neighboring nodes in the same panel have baseline readings (<0.2)
  if (anomalousNodes.length === 1 && panelBNodes.length >= 2) {
    const singleNode = anomalousNodes[0];
    const neighbors = panelBNodes.filter(n => n.node_id !== singleNode.node_id);
    const neighborsAllNormal = neighbors.every(n => n.anomalyScore < 0.22 && n.health > 80);
    
    if (neighborsAllNormal && singleNode.anomalyScore > 0.45) {
      return {
        clusterStrength: 0.12,
        neighborAgreementRatio: '0 / 2 neighboring nodes',
        agreementPercent: 0,
        spatialCorrelationLevel: 'LOW',
        multiSensorAgreementLevel: 'LOW',
        isSuspectedSensorFault: true,
        affectedPanel: singleNode.panel,
        explanation: `Isolated spike on ${singleNode.node_id}. Adjacent nodes (${neighbors.map(n=>n.node_id).join(', ')}) in ${singleNode.panel} remain within baseline. Evaluated as probable hardware drift or local mechanical disturbance rather than strata subsidence.`
      };
    }
  }

  const totalMonitored = allNodes.length;
  const agreementCount = anomalousNodes.length;
  const agreementRatio = `${agreementCount} / ${totalMonitored} nodes`;
  const agreementPct = Math.round((agreementCount / Math.max(1, totalMonitored)) * 100);

  // Multi-sensor concurrence check:
  // Do tilt, displacement, and micro-vibration/crack simultaneously agree?
  let multiSensorConcurrence = 0;
  if (panelBAnomalous.length > 0) {
    const hasTilt = panelBAnomalous.some(n => (n.tilt - n.baseline.tilt) > 0.4);
    const hasDisp = panelBAnomalous.some(n => (n.displacement - n.baseline.displacement) > 1.8);
    const hasVib = panelBAnomalous.some(n => (n.vibration - n.baseline.vibration) > 0.15 || n.crack_signal);
    
    let count = 0;
    if (hasTilt) count++;
    if (hasDisp) count++;
    if (hasVib) count++;
    multiSensorConcurrence = count / 3;
  }

  let spatialLevel: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
  if (panelBAnomalous.length >= 2 || agreementCount >= 3) {
    spatialLevel = agreementCount >= 4 ? 'HIGH' : 'MODERATE';
    if (panelBAnomalous.length === 3) spatialLevel = 'HIGH';
  }

  let multiLevel: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
  if (multiSensorConcurrence >= 0.67) multiLevel = 'HIGH';
  else if (multiSensorConcurrence >= 0.33) multiLevel = 'MODERATE';

  const clusterStrength = Math.min(1.0, (panelBAnomalous.length / 3) * 0.7 + (agreementCount / totalMonitored) * 0.3);

  let explanation = 'All monitored zones display baseline equilibrium across spatial neighbors.';
  if (spatialLevel === 'HIGH') {
    explanation = `High spatial correlation detected: ${agreementCount} active nodes in ${activePanel} demonstrate consistent deformation vectors, confirming geological strata movement.`;
  } else if (spatialLevel === 'MODERATE') {
    explanation = `Emerging spatial cluster observed: Neighboring nodes in ${activePanel} show concurrent deformation onset.`;
  }

  return {
    clusterStrength: Number(clusterStrength.toFixed(2)),
    neighborAgreementRatio: agreementRatio,
    agreementPercent: agreementPct,
    spatialCorrelationLevel: spatialLevel,
    multiSensorAgreementLevel: multiLevel,
    isSuspectedSensorFault: false,
    affectedPanel: panelBAnomalous.length > 0 ? 'Panel B' : 'None',
    explanation
  };
}
