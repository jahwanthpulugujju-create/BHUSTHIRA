import type { RiskBand } from '../types';

export interface RiskBandsConfig {
  normal: { min: number; max: number; label: string; color: string };
  watch: { min: number; max: number; label: string; color: string };
  warning: { min: number; max: number; label: string; color: string };
  critical: { min: number; max: number; label: string; color: string };
}

export interface RiskModelWeights {
  displacement: number; // weight for borehole extensometer & convergence
  spatialCorrelation: number; // weight for multi-node cluster correlation
  temporalPersistence: number; // weight for consecutive anomalous observation ticks
  tilt: number; // weight for surface biaxial inclinometer
  vibration: number; // weight for micro-seismic / geophone vibration
  crack: number; // weight for acoustic emission / conductive crack ribbon
}

export interface RiskModelConfig {
  version: string;
  name: string;
  disclaimer: string;
  weights: RiskModelWeights;
  bands: RiskBandsConfig;
  thresholds: {
    tiltRateWarningDegMin: number; // °/min
    dispRateWarningMmMin: number; // mm/min
    consensusWatchScore: number;
    consensusWarningScore: number;
    consensusCriticalScore: number;
  };
}

export const RISK_MODEL_CONFIG: RiskModelConfig = {
  version: '2.1.0-prototype',
  name: 'BHUSTHIRA Kinematic Consensus Model (Prototype)',
  disclaimer: 'Prototype risk model. Demonstration parameters only. Requires mine-specific geotechnical calibration before field deployment.',
  weights: {
    displacement: 0.35,
    spatialCorrelation: 0.25,
    temporalPersistence: 0.15,
    tilt: 0.15,
    vibration: 0.05,
    crack: 0.05
  },
  bands: {
    normal: { min: 0, max: 29, label: 'NORMAL', color: '#15803d' },
    watch: { min: 30, max: 49, label: 'WATCH', color: '#d97706' },
    warning: { min: 50, max: 69, label: 'WARNING', color: '#ea580c' },
    critical: { min: 70, max: 100, label: 'CRITICAL', color: '#dc2626' }
  },
  thresholds: {
    tiltRateWarningDegMin: 0.15,
    dispRateWarningMmMin: 0.60,
    consensusWatchScore: 35,
    consensusWarningScore: 55,
    consensusCriticalScore: 75
  }
};

export function getRiskBandForScore(score: number): RiskBand {
  if (score >= RISK_MODEL_CONFIG.bands.critical.min) return 'CRITICAL';
  if (score >= RISK_MODEL_CONFIG.bands.warning.min) return 'WARNING';
  if (score >= RISK_MODEL_CONFIG.bands.watch.min) return 'WATCH';
  return 'NORMAL';
}
