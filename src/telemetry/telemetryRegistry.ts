/**
 * Telemetry Registry & Store
 * Centralized authoritative source of truth for telemetry sources, quality tracking,
 * stale detection, provenance, and subscriber dispatching.
 */

import type {
  NormalizedTelemetry,
  TelemetryQuality,
  OperatingMode,
  TelemetryConnectionState,
  DiagnosticsMetrics,
  ITelemetryProvider
} from './types';
import { TELEMETRY_CONFIG } from './types';
import { BleTelemetryProvider } from './bleTelemetryProvider';
import { LoRaTelemetryProvider } from './loraTelemetryProvider';
import { sessionRecorder } from './sessionRecorder';

export type TelemetryListener = (telemetry: NormalizedTelemetry) => void;
export type QualityListener = (nodeId: string, quality: TelemetryQuality, packetAgeMs: number) => void;
export type RegistryStateListener = () => void;

class TelemetryRegistry {
  private bleProvider: BleTelemetryProvider;
  private loraProvider: LoRaTelemetryProvider;
  private activeProvider: ITelemetryProvider;

  private _operatingMode: OperatingMode = 'SIMULATION';
  private _connectionState: TelemetryConnectionState = 'DISCONNECTED';
  private _statusMessage = 'Simulation Mode Active';

  // State maps
  private latestTelemetryByNode = new Map<string, NormalizedTelemetry>();
  private nodeProvenance = new Map<string, OperatingMode>();
  private nodeLastPacketTimes = new Map<string, number>();
  private nodeQualities = new Map<string, TelemetryQuality>();

  // Subscribers
  private telemetrySubscribers = new Set<TelemetryListener>();
  private qualitySubscribers = new Set<QualityListener>();
  private stateSubscribers = new Set<RegistryStateListener>();

  // Stale detection timer
  private staleCheckTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.bleProvider = new BleTelemetryProvider();
    this.loraProvider = new LoRaTelemetryProvider();
    this.activeProvider = this.bleProvider;

    // Attach BLE provider events
    this.bleProvider.setEventListeners({
      onTelemetry: (data) => this.handleIncomingTelemetry(data),
      onConnectionChange: (state, message) => this.handleConnectionChange(state, message),
      onDiagnosticsUpdate: () => this.notifyStateChange()
    });

    this.startStaleMonitor();
  }

  get operatingMode(): OperatingMode {
    return this._operatingMode;
  }

  get connectionState(): TelemetryConnectionState {
    return this._connectionState;
  }

  get statusMessage(): string {
    return this._statusMessage;
  }

  get ble(): BleTelemetryProvider {
    return this.bleProvider;
  }

  get lora(): LoRaTelemetryProvider {
    return this.loraProvider;
  }

  getDiagnostics(): DiagnosticsMetrics {
    return this.activeProvider.getDiagnostics();
  }

  getLatestTelemetry(nodeId: string): NormalizedTelemetry | undefined {
    return this.latestTelemetryByNode.get(nodeId);
  }

  getNodeQuality(nodeId: string): TelemetryQuality {
    return this.nodeQualities.get(nodeId) || (this._operatingMode === 'LIVE' ? 'OFFLINE' : 'LIVE');
  }

  getNodePacketAgeMs(nodeId: string): number {
    const last = this.nodeLastPacketTimes.get(nodeId);
    if (!last) return Infinity;
    return Math.max(0, Date.now() - last);
  }

  getNodeProvenance(nodeId: string): OperatingMode {
    return this.nodeProvenance.get(nodeId) || this._operatingMode;
  }

  /**
   * Connect to physical bench field node
   */
  async connectFieldHardware(): Promise<boolean> {
    this.activeProvider = this.bleProvider;
    const ok = await this.bleProvider.connect();
    if (ok) {
      this._operatingMode = 'LIVE';
      this.nodeProvenance.set(TELEMETRY_CONFIG.BLE_FIRMWARE.MAPPED_NODE_ID, 'LIVE');
      sessionRecorder.startSession('LIVE', 'BLE', TELEMETRY_CONFIG.BLE_FIRMWARE.MAPPED_NODE_ID);
    }
    return ok;
  }

  /**
   * Disconnect physical bench field node and cleanly revert to simulation
   */
  async disconnectFieldHardware(): Promise<void> {
    await this.bleProvider.disconnect();
    this._operatingMode = 'SIMULATION';
    this._connectionState = 'DISCONNECTED';
    this._statusMessage = 'Field node unlinked. Simulation authoritative.';
    this.nodeProvenance.set(TELEMETRY_CONFIG.BLE_FIRMWARE.MAPPED_NODE_ID, 'SIMULATION');
    sessionRecorder.endSession();
    this.notifyStateChange();
  }

  /**
   * Reconnect to physical field node
   */
  async reconnectFieldHardware(): Promise<boolean> {
    return await this.bleProvider.reconnect();
  }

  /**
   * Switch operating mode manually (e.g., return to simulation)
   */
  setOperatingMode(mode: OperatingMode): void {
    if (this._operatingMode === mode) return;
    this._operatingMode = mode;
    if (mode === 'SIMULATION' && this._connectionState === 'CONNECTED') {
      this.disconnectFieldHardware();
    }
    this.notifyStateChange();
  }

  /**
   * Bench Test Harness injection
   * Allows injecting telemetry directly into the normalization pipeline without physical hardware.
   */
  injectBenchPacket(partial: Partial<NormalizedTelemetry>): void {
    const now = new Date().toISOString();
    const nodeId = partial.node_id || TELEMETRY_CONFIG.BLE_FIRMWARE.MAPPED_NODE_ID;

    const telemetry: NormalizedTelemetry = {
      schema_version: 'stratum.telemetry.v1',
      source: 'BLE',
      quality: 'LIVE',
      node_id: nodeId,
      timestamp: now,
      received_at: now,
      tilt: partial.tilt ?? 0.20,
      displacement: partial.displacement ?? 0.50,
      vibration: partial.vibration ?? 0.08,
      crack_signal: Boolean(partial.crack_signal),
      temperature: partial.temperature ?? 28.0,
      battery: partial.battery ?? 98,
      rssi: partial.rssi ?? -67,
      packet_loss: partial.packet_loss ?? 0.0,
      route_through: 'LOCAL',
      sequence_number: partial.sequence_number ?? 1,
      packet_age_ms: 0,
      transport_latency_ms: 5,
      raw_payload: partial.raw_payload ?? '[Bench Test Stream]'
    };

    this._operatingMode = 'LIVE';
    this._connectionState = 'CONNECTED';
    this._statusMessage = 'Bench hardware simulation active';
    this.handleIncomingTelemetry(telemetry);
  }

  private handleIncomingTelemetry(telemetry: NormalizedTelemetry) {
    const now = Date.now();
    const nodeId = telemetry.node_id;

    this.latestTelemetryByNode.set(nodeId, telemetry);
    this.nodeLastPacketTimes.set(nodeId, now);
    this.nodeQualities.set(nodeId, telemetry.quality);
    this.nodeProvenance.set(nodeId, 'LIVE');

    // Record session data
    sessionRecorder.recordPacket(telemetry);

    // Notify data subscribers
    this.telemetrySubscribers.forEach(sub => {
      try {
        sub(telemetry);
      } catch (err) {
        console.error('Error in telemetry subscriber:', err);
      }
    });

    this.notifyStateChange();
  }

  private handleConnectionChange(state: TelemetryConnectionState, message?: string) {
    this._connectionState = state;
    if (message) this._statusMessage = message;

    if (state === 'CONNECTED') {
      this._operatingMode = 'LIVE';
      this.nodeProvenance.set(TELEMETRY_CONFIG.BLE_FIRMWARE.MAPPED_NODE_ID, 'LIVE');
    } else if (state === 'DISCONNECTED') {
      this.nodeQualities.set(TELEMETRY_CONFIG.BLE_FIRMWARE.MAPPED_NODE_ID, 'OFFLINE');
      if (this._operatingMode === 'LIVE') {
        this._operatingMode = 'SIMULATION';
      }
    }

    this.notifyStateChange();
  }

  /**
   * Monitor for stale telemetry (LIVE < 3s, STALE 3-10s, OFFLINE > 10s)
   */
  private startStaleMonitor() {
    if (this.staleCheckTimer) clearInterval(this.staleCheckTimer);

    this.staleCheckTimer = setInterval(() => {
      if (this._operatingMode !== 'LIVE') return;

      const now = Date.now();
      let stateChanged = false;

      this.nodeLastPacketTimes.forEach((lastTime, nodeId) => {
        const ageMs = now - lastTime;
        const currentQuality = this.nodeQualities.get(nodeId);
        let nextQuality: TelemetryQuality = 'LIVE';

        if (ageMs > TELEMETRY_CONFIG.STALE_MAX_AGE_MS) {
          nextQuality = 'OFFLINE';
        } else if (ageMs > TELEMETRY_CONFIG.LIVE_MAX_AGE_MS) {
          nextQuality = 'STALE';
        }

        if (currentQuality !== nextQuality) {
          this.nodeQualities.set(nodeId, nextQuality);
          stateChanged = true;
          this.qualitySubscribers.forEach(sub => {
            try {
              sub(nodeId, nextQuality, ageMs);
            } catch (err) {
              console.error('Error in quality subscriber:', err);
            }
          });
        }
      });

      if (stateChanged) {
        this.notifyStateChange();
      }
    }, TELEMETRY_CONFIG.POLL_STALE_INTERVAL_MS);
  }

  subscribeTelemetry(listener: TelemetryListener): () => void {
    this.telemetrySubscribers.add(listener);
    return () => this.telemetrySubscribers.delete(listener);
  }

  subscribeQuality(listener: QualityListener): () => void {
    this.qualitySubscribers.add(listener);
    return () => this.qualitySubscribers.delete(listener);
  }

  subscribeState(listener: RegistryStateListener): () => void {
    this.stateSubscribers.add(listener);
    return () => this.stateSubscribers.delete(listener);
  }

  private notifyStateChange() {
    this.stateSubscribers.forEach(sub => {
      try {
        sub();
      } catch (err) {
        console.error('Error in state subscriber:', err);
      }
    });
  }
}

export const telemetryRegistry = new TelemetryRegistry();
