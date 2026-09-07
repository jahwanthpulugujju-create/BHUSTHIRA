export type NodeStatus = 'NORMAL' | 'ANOMALOUS' | 'CRITICAL' | 'OFFLINE';

export type RiskBand = 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';
export type ConfidenceLevel = 'LOW' | 'MODERATE' | 'HIGH';

export interface SensorBaseline {
  tilt: number; // degrees
  displacement: number; // mm
  vibration: number; // g
}

export interface SensorNode {
  node_id: string;
  name: string;
  x: number; // percentage in coordinate space (0-100)
  y: number; // percentage in coordinate space (0-100)
  panel: 'Panel A' | 'Panel B' | 'Panel C' | 'Panel D';
  sector: string;
  isReference: boolean;
  status: NodeStatus;
  health: number; // 0 - 100%
  deformationSignal: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';
  
  // Real-time telemetry values
  tilt: number; // degrees (baseline ~0.20°)
  displacement: number; // mm (baseline ~0.5mm)
  vibration: number; // g (baseline ~0.08g)
  crack_signal: boolean; // binary crack acoustic emission / fracture indicator
  temperature: number; // Celsius (~26-30°C)
  battery: number; // percentage (0-100%)
  rssi: number; // dBm (~ -65 to -90 dBm)
  packet_loss: number; // percentage (0-100%)
  
  // Historical / Analysis metadata
  lastUpdateSec: number;
  anomalyScore: number; // 0 - 1
  rateOfChangeTilt: number; // °/min
  rateOfChangeDisp: number; // mm/min
  persistenceTicks: number; // consecutive ticks showing anomaly
  routeThrough: string; // mesh next-hop (e.g. "GW-01" or "N02")
  isFaulty: boolean; // simulated hardware fault vs true deformation
  baseline: SensorBaseline;
  
  // Recent 30-tick history for sparklines
  history: {
    tilt: number[];
    displacement: number[];
    vibration: number[];
  };
}

export interface MinePanel {
  id: 'Panel A' | 'Panel B' | 'Panel C' | 'Panel D';
  name: string;
  seamType: string;
  depthMeters: number;
  extractionMethod: string;
  x: number;
  y: number;
  width: number;
  height: number;
  riskBand: RiskBand;
  riskScore: number;
  nodeIds: string[];
  subsidenceCentroid?: { x: number; y: number; radius: number };
}

export type ScenarioType =
  | 'NORMAL'
  | 'GRADUAL_SUBSIDENCE'
  | 'RAPID_SUBSIDENCE'
  | 'SENSOR_FAULT'
  | 'NODE_FAILURE'
  | 'NETWORK_DEGRADED'
  | 'MULTI_SENSOR_ANOMALY'
  | 'CLOUD_OFFLINE'
  | 'RECOVERY'
  | 'FULL_DEMO';

export interface AlertEvidenceItem {
  category: 'Tilt' | 'Displacement' | 'Vibration' | 'Crack Detection' | 'Spatial Correlation' | 'Multi-Sensor Agreement' | 'Sensor Health' | 'Temporal Persistence';
  finding: string;
  weight: number;
  verified: boolean;
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  simSecond: number;
  zone: string;
  panel: 'Panel A' | 'Panel B' | 'Panel C' | 'Panel D';
  severity: RiskBand;
  confidence: ConfidenceLevel;
  primaryEvidence: string;
  evidenceItems: AlertEvidenceItem[];
  recommendedAction: string;
  status: 'ACTIVE' | 'RESOLVED';
}

export interface IncidentEvent {
  id: string;
  timestamp: string;
  simSecond: number;
  type:
    | 'SYSTEM_BOOT'
    | 'SCENARIO_START'
    | 'NODE_ANOMALY'
    | 'SPATIAL_CORRELATION'
    | 'RISK_ESCALATION'
    | 'ALERT_GENERATED'
    | 'NODE_FAILURE'
    | 'ROUTE_RECOVERY'
    | 'CLOUD_OFFLINE'
    | 'CLOUD_RESTORED'
    | 'RECOVERY_INITIATED'
    | 'INCIDENT_RESOLVED';
  nodeId?: string;
  panelId?: string;
  severity: 'INFO' | 'WATCH' | 'WARNING' | 'CRITICAL';
  description: string;
}

export interface RiskBreakdown {
  displacement: number; // 0-100 normalized bar
  spatialCorrelation: number;
  tilt: number;
  crack: number;
  vibration: number;
  temporalAcceleration: number;
}

export interface TelemetrySnapshot {
  simSecond: number;
  riskScore: number;
  consensusScore: number;
  avgTilt: number;
  avgDisp: number;
  avgVib: number;
  activeAnomalousCount: number;
}

export interface MeshLink {
  from: string;
  to: string;
  active: boolean;
  rssi: number;
  quality: 'GOOD' | 'FAIR' | 'DEGRADED';
}
