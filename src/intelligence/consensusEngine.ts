import type { SensorNode, ConfidenceLevel } from '../types';
import type { SpatialAnalysisResult } from './spatialCorrelation';

export interface ConsensusEvidenceBreakdown {
  component: string;
  weight: number;
  maxWeight: number;
  description: string;
  verified: boolean;
}

export interface ConsensusResult {
  score: number; // 0 - 100
  normalizedScore: number; // 0.0 - 1.0
  confidence: ConfidenceLevel;
  evidence: ConsensusEvidenceBreakdown[];
  summary: string;
}

/**
 * Multi-evidence fusion consensus engine.
 * Computes deformation consensus from spatial, temporal, multi-sensor, and health inputs.
 */
export function evaluateDeformationConsensus(
  nodes: Record<string, SensorNode>,
  spatialResult: SpatialAnalysisResult,
  networkHealth: number
): ConsensusResult {
  // If suspected sensor fault, cap consensus at low level
  if (spatialResult.isSuspectedSensorFault) {
    return {
      score: 18,
      normalizedScore: 0.18,
      confidence: 'LOW',
      evidence: [
        { component: 'Individual anomaly', weight: 14, maxWeight: 20, description: 'Single sensor triggered anomaly threshold', verified: true },
        { component: 'Temporal persistence', weight: 4, maxWeight: 20, description: 'Early signal observed', verified: false },
        { component: 'Spatial correlation', weight: 0, maxWeight: 20, description: 'No neighbor agreement (isolated node)', verified: false },
        { component: 'Multi-sensor agreement', weight: 0, maxWeight: 20, description: 'Single measurement type only', verified: false },
        { component: 'Sensor health validity', weight: 0, maxWeight: 12, description: 'Probable drift or calibration fault', verified: false },
        { component: 'Network telemetry health', weight: 0, maxWeight: 8, description: 'Marginal routing confidence', verified: false },
      ],
      summary: 'LOW CONSENSUS: Isolated single-sensor variance detected without spatial or multi-sensor corroboration. Possible hardware fault.'
    };
  }

  const allMonitored = Object.values(nodes).filter(n => !n.isReference && n.status !== 'OFFLINE');
  const maxNodeAnomaly = Math.max(...allMonitored.map(n => n.anomalyScore), 0);
  const maxPersistence = Math.max(...allMonitored.map(n => n.persistenceTicks), 0);
  
  // 1. Individual Anomaly Contribution (Max 20)
  const individualAnomalyWeight = Math.round(maxNodeAnomaly * 20);

  // 2. Temporal Persistence Contribution (Max 20)
  // >= 8 ticks confirms true continuous strata deformation rather than micro-burst
  const persistenceFactor = Math.min(1.0, maxPersistence / 8);
  const temporalWeight = Math.round(persistenceFactor * 20);

  // 3. Spatial Correlation Contribution (Max 20)
  let spatialWeight = 0;
  if (spatialResult.spatialCorrelationLevel === 'HIGH') spatialWeight = 20;
  else if (spatialResult.spatialCorrelationLevel === 'MODERATE') spatialWeight = 12;
  else spatialWeight = Math.round(spatialResult.clusterStrength * 10);

  // 4. Multi-Sensor Agreement Contribution (Max 20)
  let multiSensorWeight = 0;
  if (spatialResult.multiSensorAgreementLevel === 'HIGH') multiSensorWeight = 20;
  else if (spatialResult.multiSensorAgreementLevel === 'MODERATE') multiSensorWeight = 12;
  else multiSensorWeight = 4;

  // 5. Sensor Health Integrity (Max 12)
  // Only high-health sensors contribute valid structural evidence
  const avgHealth = allMonitored.reduce((acc, n) => acc + n.health, 0) / Math.max(1, allMonitored.length);
  const sensorHealthWeight = Math.round((avgHealth / 100) * 12);

  // 6. Network Telemetry Health (Max 8)
  const networkWeight = Math.round((networkHealth / 100) * 8);

  const totalRaw = individualAnomalyWeight + temporalWeight + spatialWeight + multiSensorWeight + sensorHealthWeight + networkWeight;
  const score = Math.min(100, Math.max(0, totalRaw));

  let confidence: ConfidenceLevel = 'LOW';
  if (score >= 65 && spatialResult.spatialCorrelationLevel === 'HIGH') {
    confidence = 'HIGH';
  } else if (score >= 38) {
    confidence = 'MODERATE';
  }

  const evidence: ConsensusEvidenceBreakdown[] = [
    {
      component: 'Individual Anomaly Score',
      weight: individualAnomalyWeight,
      maxWeight: 20,
      description: `Peak node anomaly index: ${(maxNodeAnomaly * 100).toFixed(0)}%`,
      verified: maxNodeAnomaly > 0.25
    },
    {
      component: 'Temporal Persistence',
      weight: temporalWeight,
      maxWeight: 20,
      description: `${maxPersistence} consecutive observation intervals of continuous drift`,
      verified: maxPersistence >= 3
    },
    {
      component: 'Spatial Correlation',
      weight: spatialWeight,
      maxWeight: 20,
      description: `${spatialResult.neighborAgreementRatio} agreement across monitored sector`,
      verified: spatialResult.spatialCorrelationLevel !== 'LOW'
    },
    {
      component: 'Multi-Sensor Agreement',
      weight: multiSensorWeight,
      maxWeight: 20,
      description: 'Concurrence between tilt, displacement, vibration, and crack signals',
      verified: spatialResult.multiSensorAgreementLevel !== 'LOW'
    },
    {
      component: 'Sensor Health Weighting',
      weight: sensorHealthWeight,
      maxWeight: 12,
      description: `Active fleet operational health: ${avgHealth.toFixed(0)}%`,
      verified: avgHealth > 80
    },
    {
      component: 'Network Packet Reliability',
      weight: networkWeight,
      maxWeight: 8,
      description: `Mesh packet delivery rate: ${networkHealth}%`,
      verified: networkHealth > 85
    }
  ];

  return {
    score,
    normalizedScore: Number((score / 100).toFixed(2)),
    confidence,
    evidence,
    summary: confidence === 'HIGH'
      ? 'HIGH DEFORMATION CONSENSUS: Spatially clustered, multi-parameter strata movement confirmed with temporal persistence.'
      : confidence === 'MODERATE'
      ? 'MODERATE CONSENSUS: Developing multi-sensor trend detected. Corroborating additional interval data.'
      : 'BASELINE CONDITIONS: All sensor nodes operating within normal statistical equilibrium.'
  };
}
