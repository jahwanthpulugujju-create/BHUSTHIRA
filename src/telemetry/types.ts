/**
 * STRATUM Field Telemetry Types
 * Transport-agnostic normalization and provider contracts.
 */

export type TelemetrySource =
  | 'SIMULATION'
  | 'BLE'
  | 'LORA'
  | 'MQTT'
  | 'SERIAL';

export type TelemetryQuality =
  | 'LIVE'
  | 'STALE'
  | 'PARTIAL'
  | 'INVALID'
  | 'OFFLINE';

export type TelemetryConnectionState =
  | 'DISCONNECTED'
  | 'SCANNING'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'ERROR';

export type OperatingMode = 'SIMULATION' | 'LIVE' | 'HYBRID';

export interface NormalizedTelemetry {
  schema_version: string;
  source: TelemetrySource;
  quality: TelemetryQuality;

  node_id: string;

  timestamp: string;      // ISO 8601
  received_at: string;    // ISO 8601

  tilt: number;           // degrees
  displacement: number;   // mm
  vibration: number;      // g
  crack_signal: boolean;  // acoustic / tensile fracture trip

  temperature?: number;   // Celsius
  battery?: number;       // percentage 0-100

  rssi?: number;          // dBm
  packet_loss?: number;   // percentage 0-100
  route_through?: string; // mesh next hop or "LOCAL"

  sequence_number?: number;
  gateway_id?: string;

  packet_age_ms?: number;
  transport_latency_ms?: number;

  raw_payload?: unknown;
}

export interface DiagnosticsMetrics {
  packetCount: number;
  validPackets: number;
  malformedPackets: number;
  staleTransitions: number;
  reconnectCount: number;
  sequenceGaps: number;
  lastSequenceNumber?: number;
  lastPacketTime?: number;
  packetRateHz: number;
  transportLatencyMs: number;
  errors: Array<{ timestamp: string; message: string; payloadSnippet?: string }>;
}

export interface TelemetrySessionRecord {
  id: string;
  name: string;
  mode: OperatingMode;
  source: TelemetrySource;
  nodeId: string;
  startedAt: string;
  endedAt?: string;
  packetCount: number;
  packets: NormalizedTelemetry[];
  maxRiskScore: number;
  riskTrajectory: Array<{ timestamp: string; riskScore: number; riskBand: string }>;
}

export interface TelemetryProviderEvents {
  onTelemetry: (telemetry: NormalizedTelemetry) => void;
  onConnectionChange: (state: TelemetryConnectionState, message?: string) => void;
  onDiagnosticsUpdate: (diagnostics: DiagnosticsMetrics) => void;
}

export interface ITelemetryProvider {
  readonly id: string;
  readonly name: string;
  readonly source: TelemetrySource;
  readonly connectionState: TelemetryConnectionState;
  readonly isSupported: boolean;

  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  reconnect(): Promise<boolean>;
  getDiagnostics(): DiagnosticsMetrics;
  setEventListeners(listeners: TelemetryProviderEvents): void;
}

// Configurable timing thresholds for stale detection
export const TELEMETRY_CONFIG = {
  LIVE_MAX_AGE_MS: 3000,    // < 3s = LIVE
  STALE_MAX_AGE_MS: 10000,  // 3s - 10s = STALE; > 10s = OFFLINE
  POLL_STALE_INTERVAL_MS: 500,
  BLE_FIRMWARE: {
    DEVICE_NAME: 'MineGuard_Node_01',
    SERVICE_UUID: '4fafc201-1fb5-459e-8fcc-c5c9c331914b',
    CHARACTERISTIC_UUID: 'beb5483e-36e1-4688-b7f5-ea07361b26a8',
    MAPPED_NODE_ID: 'N01',
    OPERATOR_LABEL: 'STRATUM FIELD NODE'
  }
} as const;
