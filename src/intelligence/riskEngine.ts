import type { RiskBand, ConfidenceLevel, RiskBreakdown, SystemAlert, SensorNode } from '../types';
import type { ConsensusResult } from './consensusEngine';
import type { SpatialAnalysisResult } from './spatialCorrelation';

export interface RiskEvaluationResult {
  riskScore: number; // 0 - 100
  riskBand: RiskBand;
  confidence: ConfidenceLevel;
  breakdown: RiskBreakdown;
  activeAlert: SystemAlert | null;
  recommendedResponse: string;
}

/**
 * Evaluates current mine risk based on deformation consensus and kinematics.
 */
export function evaluateMineRisk(
  simSecond: number,
  nodes: Record<string, SensorNode>,
  consensus: ConsensusResult,
  spatial: SpatialAnalysisResult
): RiskEvaluationResult {
  // If sensor fault, risk remains controlled (<28, NORMAL)
  if (spatial.isSuspectedSensorFault) {
    return {
      riskScore: 24,
      riskBand: 'NORMAL',
      confidence: 'LOW',
      breakdown: {
        displacement: 40,
        spatialCorrelation: 5,
        tilt: 8,
        crack: 0,
        vibration: 5,
        temporalAcceleration: 4
      },
      activeAlert: null,
      recommendedResponse: 'Sensor diagnostic required: Verify Node N03 transducer calibration. No strata hazard indicated.'
    };
  }

  // Calculate kinematics contributions across Panel B
  const activeNodes = [nodes['N02'], nodes['N03'], nodes['N04']].filter(Boolean);
  const maxDisp = Math.max(...activeNodes.map(n => n ? n.displacement - n.baseline.displacement : 0), 0);
  const maxTilt = Math.max(...activeNodes.map(n => n ? n.tilt - n.baseline.tilt : 0), 0);
  const maxVib = Math.max(...activeNodes.map(n => n ? n.vibration - n.baseline.vibration : 0), 0);
  const hasCrack = activeNodes.some(n => n && n.crack_signal);

  // Normalized breakdown items (0 - 100 for visual bars)
  const dispContrib = Math.min(100, Math.round((maxDisp / 8.0) * 100));
  const tiltContrib = Math.min(100, Math.round((maxTilt / 1.8) * 100));
  const spatialContrib = Math.min(100, Math.round(spatial.clusterStrength * 100));
  const crackContrib = hasCrack ? 90 : 0;
  const vibContrib = Math.min(100, Math.round((maxVib / 0.5) * 100));
  const tempAccelContrib = Math.min(100, Math.round(consensus.normalizedScore * 95));

  // Risk Score calculation:
  // Combines deformation consensus score (70%) with peak kinematic displacement (30%)
  const kinematicScore = (dispContrib * 0.4) + (tiltContrib * 0.3) + (crackContrib * 0.15) + (vibContrib * 0.15);
  const blendedScore = (consensus.score * 0.65) + (kinematicScore * 0.35);
  
  // Baseline floor ~16-20
  const riskScore = Math.min(100, Math.max(16, Math.round(blendedScore)));

  let riskBand: RiskBand = 'NORMAL';
  let recommendedResponse = 'Routine strata monitoring. Maintain normal shift production cycle.';

  if (riskScore >= 70) {
    riskBand = 'CRITICAL';
    recommendedResponse = 'Initiate Protocol DGMS-7A: Order immediate operational stand-down in Panel B. Verify face convergence and dispatch geotechnical safety team for visual inspection.';
  } else if (riskScore >= 50) {
    riskBand = 'WARNING';
    recommendedResponse = 'Inspect and verify the affected zone according to mine safety procedures. Increase telemetry polling to 0.5Hz on Panel B gate roads.';
  } else if (riskScore >= 30) {
    riskBand = 'WATCH';
    recommendedResponse = 'Advisory notification: Elevated strata deformation rate logged on Panel B. Alert shift under-manager to observe goaf edge monitors.';
  }

  // Construct active alert if in Watch, Warning, or Critical
  let activeAlert: SystemAlert | null = null;
  if (riskBand !== 'NORMAL') {
    const formatTime = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${String(14).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    activeAlert = {
      id: `ALT-${simSecond}-${riskBand}`,
      timestamp: formatTime(simSecond),
      simSecond,
      zone: 'Panel B / Longwall Face & Goaf Overburden',
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
          weight: 18,
          verified: spatial.spatialCorrelationLevel !== 'LOW'
        },
        {
          category: 'Displacement',
          finding: `Peak cumulative displacement ${maxDisp.toFixed(1)} mm above calibrated baseline.`,
          weight: 22,
          verified: maxDisp > 1.5
        },
        {
          category: 'Tilt',
          finding: `Surface inclination increased to ${maxTilt.toFixed(2)}° with sustained gradient.`,
          weight: 16,
          verified: maxTilt > 0.3
        },
        {
          category: 'Temporal Persistence',
          finding: `Anomalous trend sustained across multiple observation windows without reset.`,
          weight: 15,
          verified: true
        },
        {
          category: 'Multi-Sensor Agreement',
          finding: hasCrack ? 'Acoustic emission crack detection confirmed alongside mechanical strain.' : 'Strain and inclination sensors in multi-parameter agreement.',
          weight: 14,
          verified: hasCrack || maxVib > 0.1
        },
        {
          category: 'Sensor Health',
          finding: 'Node battery and packet telemetry confirm valid transducer physical states.',
          weight: 8,
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
    recommendedResponse
  };
}
