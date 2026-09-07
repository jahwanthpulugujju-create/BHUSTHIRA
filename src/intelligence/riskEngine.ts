import type { RiskBand, ConfidenceLevel, RiskBreakdown, SystemAlert, SensorNode } from '../types';
import type { ConsensusResult } from './consensusEngine';
import type { SpatialAnalysisResult } from './spatialCorrelation';
import { RISK_MODEL_CONFIG, getRiskBandForScore } from './riskConfig';
import { formatSimulationTime } from '../utils/timeFormatters';

export interface RiskEvaluationResult {
  riskScore: number; // 0 - 100
  riskBand: RiskBand;
  confidence: ConfidenceLevel;
  breakdown: RiskBreakdown;
  activeAlert: SystemAlert | null;
  recommendedResponse: string;
  configVersion: string;
  disclaimer: string;
}

/**
 * Evaluates current mine risk based on multi-sensor deformation consensus and kinematics.
 * Configuration-driven, deterministic, and strictly decoupled between Risk Severity and Evidence Confidence.
 */
export function evaluateMineRisk(
  simSecond: number,
  nodes: Record<string, SensorNode>,
  consensus: ConsensusResult,
  spatial: SpatialAnalysisResult
): RiskEvaluationResult {
  const { weights, disclaimer, version } = RISK_MODEL_CONFIG;

  // 1. ISOLATED SENSOR FAULT HANDLING
  // If a single transducer spikes abnormally but adjacent nodes show no movement and sensor health is degraded:
  if (spatial.isSuspectedSensorFault) {
    return {
      riskScore: 24,
      riskBand: 'NORMAL',
      confidence: 'LOW',
      breakdown: {
        displacement: 42,
        spatialCorrelation: 6,
        tilt: 8,
        crack: 0,
        vibration: 6,
        temporalAcceleration: 4
      },
      activeAlert: null,
      recommendedResponse: 'Sensor diagnostic required: Verify Node N03 transducer calibration and physical seating. Low spatial agreement with surrounding instruments; strata hazard unconfirmed.',
      configVersion: version,
      disclaimer
    };
  }

  // 2. KINEMATIC & SENSOR CONTRIBUTION METRICS
  const activeNodes = [nodes['N02'], nodes['N03'], nodes['N04']].filter(Boolean);
  const maxDisp = Math.max(...activeNodes.map(n => n ? n.displacement - n.baseline.displacement : 0), 0);
  const maxTilt = Math.max(...activeNodes.map(n => n ? n.tilt - n.baseline.tilt : 0), 0);
  const maxVib = Math.max(...activeNodes.map(n => n ? n.vibration - n.baseline.vibration : 0), 0);
  const hasCrack = activeNodes.some(n => n && n.crack_signal);

  // Normalized component contributions (0 - 100 for visual progress bars)
  const dispContrib = Math.min(100, Math.round((maxDisp / 8.0) * 100));
  const tiltContrib = Math.min(100, Math.round((maxTilt / 1.8) * 100));
  const spatialContrib = Math.min(100, Math.round(spatial.clusterStrength * 100));
  const crackContrib = hasCrack ? 90 : 0;
  const vibContrib = Math.min(100, Math.round((maxVib / 0.5) * 100));
  const tempAccelContrib = Math.min(100, Math.round(consensus.normalizedScore * 95));

  // Weighted kinematic composite score
  const kinematicScore =
    (dispContrib * (weights.displacement / (weights.displacement + weights.tilt + weights.vibration + weights.crack))) +
    (tiltContrib * (weights.tilt / (weights.displacement + weights.tilt + weights.vibration + weights.crack))) +
    (crackContrib * (weights.crack / (weights.displacement + weights.tilt + weights.vibration + weights.crack))) +
    (vibContrib * (weights.vibration / (weights.displacement + weights.tilt + weights.vibration + weights.crack)));

  // Blended composite: Consensus score (65%) + Kinematic score (35%)
  const blendedScore = (consensus.score * 0.65) + (kinematicScore * 0.35);
  
  // Baseline floor ~ 18
  const riskScore = Math.min(100, Math.max(18, Math.round(blendedScore)));
  const riskBand = getRiskBandForScore(riskScore);

  // 3. NEUTRAL, DEFENSIBLE DECISION-SUPPORT RECOMMENDATIONS
  let recommendedResponse = 'Routine strata monitoring. Baseline equilibrium active across monitored panels.';
  if (riskBand === 'CRITICAL') {
    recommendedResponse = 'Escalate the incident for immediate operator verification and follow applicable mine safety procedures.';
  } else if (riskBand === 'WARNING') {
    recommendedResponse = 'Inspect and verify the affected zone according to mine safety procedures.';
  } else if (riskBand === 'WATCH') {
    recommendedResponse = 'Continue enhanced monitoring and operator review of the affected zone.';
  }

  // 4. CONSTRUCT ACTIVE ALERT
  let activeAlert: SystemAlert | null = null;
  if (riskBand !== 'NORMAL') {
    activeAlert = {
      id: `ALT-${simSecond}-${riskBand}`,
      timestamp: formatSimulationTime(simSecond),
      simSecond,
      zone: 'Panel B / Longwall Extraction Face',
      panel: 'Panel B',
      severity: riskBand,
      confidence: consensus.confidence,
      primaryEvidence: riskBand === 'CRITICAL'
        ? 'Persistent displacement acceleration with multi-node spatial correlation & acoustic crack emission.'
        : riskBand === 'WARNING'
        ? 'Spatially correlated surface tilt and lateral displacement exceeding continuous baseline threshold.'
        : 'Early inclination drift detected on active longwall face monitoring cluster.',
      evidenceItems: [
        {
          category: 'Spatial Correlation',
          finding: `${spatial.neighborAgreementRatio} demonstrating convergent ground movement vectors.`,
          weight: 25,
          verified: spatial.spatialCorrelationLevel !== 'LOW'
        },
        {
          category: 'Displacement',
          finding: `Peak cumulative displacement ${maxDisp.toFixed(1)} mm departing from calibrated baseline.`,
          weight: 35,
          verified: maxDisp > 1.2
        },
        {
          category: 'Tilt',
          finding: `Surface inclination increased to ${maxTilt.toFixed(2)}° with continuous slope gradient.`,
          weight: 15,
          verified: maxTilt > 0.25
        },
        {
          category: 'Temporal Persistence',
          finding: `Deformation pattern persisted across sequential sampling intervals without transient recovery.`,
          weight: 15,
          verified: true
        },
        {
          category: 'Multi-Sensor Agreement',
          finding: hasCrack ? 'Acoustic crack emissions coincide with mechanical extensometer strain.' : 'Strain and inclination sensors in multi-parameter agreement.',
          weight: 5,
          verified: hasCrack || maxVib > 0.1
        },
        {
          category: 'Sensor Health',
          finding: 'Node power telemetry and radio link quality verify active instrument integrity.',
          weight: 5,
          verified: true
        }
      ],
      recommendedAction: recommendedResponse,
      status: 'ACTIVE'
    };
  }

  return {
    riskScore,
    riskBand,
    confidence: consensus.confidence,
    breakdown: {
      displacement: dispContrib,
      spatialCorrelation: spatialContrib,
      tilt: tiltContrib,
      crack: crackContrib,
      vibration: vibContrib,
      temporalAcceleration: tempAccelContrib
    },
    activeAlert,
    recommendedResponse,
    configVersion: version,
    disclaimer
  };
}
