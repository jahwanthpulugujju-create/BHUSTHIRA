/**
 * Web Bluetooth Telemetry Provider
 * Real physical GATT notification ingestion for ESP32 MineGuard_Node_01 bench prototype.
 * 
 * NOTE: The intelligence and UI layers never import this file directly;
 * they interact only with the transport-agnostic ITelemetryProvider interface.
 */

import type {
  ITelemetryProvider,
  TelemetrySource,
  TelemetryConnectionState,
  DiagnosticsMetrics,
  TelemetryProviderEvents
} from './types';
import { TELEMETRY_CONFIG } from './types';
import { TelemetryParser } from './telemetryParser';

export class BleTelemetryProvider implements ITelemetryProvider {
  readonly id = 'ble-provider';
  readonly name = 'Hardware Telemetry Interface (GATT)';
  readonly source: TelemetrySource = 'BLE';

  private _connectionState: TelemetryConnectionState = 'DISCONNECTED';
  private events: TelemetryProviderEvents | null = null;
  private parser = new TelemetryParser();

  // Web Bluetooth GATT handle references
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private device: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private characteristic: any = null;

  // Diagnostics
  private diagnostics: DiagnosticsMetrics = {
    packetCount: 0,
    validPackets: 0,
    malformedPackets: 0,
    staleTransitions: 0,
    reconnectCount: 0,
    sequenceGaps: 0,
    packetRateHz: 0,
    transportLatencyMs: 0,
    errors: []
  };

  private packetTimestamps: number[] = [];

  get connectionState(): TelemetryConnectionState {
    return this._connectionState;
  }

  get isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  setEventListeners(listeners: TelemetryProviderEvents): void {
    this.events = listeners;
  }

  getDiagnostics(): DiagnosticsMetrics {
    return { ...this.diagnostics };
  }

  private updateState(state: TelemetryConnectionState, message?: string) {
    this._connectionState = state;
    this.events?.onConnectionChange(state, message);
  }

  private recordError(message: string, snippet?: string) {
    const errObj = {
      timestamp: new Date().toISOString(),
      message,
      payloadSnippet: snippet
    };
    this.diagnostics.errors.unshift(errObj);
    if (this.diagnostics.errors.length > 30) {
      this.diagnostics.errors.pop();
    }
    this.events?.onDiagnosticsUpdate({ ...this.diagnostics });
  }

  /**
   * Request Bluetooth device and establish GATT notification stream
   */
  async connect(): Promise<boolean> {
    if (!this.isSupported) {
      const msg = 'Web Bluetooth API is unsupported in this browser. Please use Chrome or Edge over HTTPS or localhost.';
      this.updateState('ERROR', msg);
      this.recordError(msg);
      return false;
    }

    try {
      this.updateState('SCANNING', 'Opening Bluetooth device picker...');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const navBluetooth = (navigator as any).bluetooth;

      // First try: filter by service UUID (most reliable for properly advertising ESP32)
      let device: unknown = null;
      try {
        device = await navBluetooth.requestDevice({
          filters: [
            { services: [TELEMETRY_CONFIG.BLE_FIRMWARE.SERVICE_UUID] }
          ],
          optionalServices: [TELEMETRY_CONFIG.BLE_FIRMWARE.SERVICE_UUID]
        });
      } catch (filterErr: unknown) {
        // If filtered scan finds nothing or user cancelled, fall back to show all devices
        const filterMsg = filterErr instanceof Error ? filterErr.message : String(filterErr);
        if (filterMsg.includes('cancelled') || filterMsg.includes('cancel') || filterMsg.includes('User cancelled')) {
          // User deliberately cancelled
          this.updateState('DISCONNECTED', 'Device selection cancelled by operator');
          return false;
        }
        // Filter failed (device not advertising service UUID) — fall back to acceptAllDevices
        this.updateState('SCANNING', 'Retrying with all-devices scan (service UUID not found in advertisement)...');
        try {
          device = await navBluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [TELEMETRY_CONFIG.BLE_FIRMWARE.SERVICE_UUID]
          });
        } catch (fallbackErr: unknown) {
          const fbMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
          this.updateState('DISCONNECTED', 'Device selection cancelled');
          this.recordError(`Scan fallback cancelled: ${fbMsg}`);
          return false;
        }
      }

      if (!device) {
        this.updateState('DISCONNECTED', 'No hardware sensor selected');
        return false;
      }

      this.device = device;
      this.device.addEventListener('gattserverdisconnected', this.handleDisconnection);

      this.updateState('CONNECTING', `Connecting to GATT Server on ${(this.device as { name?: string }).name || 'device'}...`);

      const server = await this.device.gatt.connect();

      // Try to get the STRATUM service UUID; if not found, report useful diagnostic
      let service;
      try {
        service = await server.getPrimaryService(TELEMETRY_CONFIG.BLE_FIRMWARE.SERVICE_UUID);
      } catch {
        const availableServices = 'Run BLE scan to inspect available UUIDs.';
        const errMsg = `GATT service UUID ${TELEMETRY_CONFIG.BLE_FIRMWARE.SERVICE_UUID} not found on device. ${availableServices} Check firmware sketch SERVICE_UUID matches.`;
        this.updateState('ERROR', errMsg);
        this.recordError(errMsg);
        this.device.gatt.disconnect();
        return false;
      }

      let characteristic;
      try {
        characteristic = await service.getCharacteristic(TELEMETRY_CONFIG.BLE_FIRMWARE.CHARACTERISTIC_UUID);
      } catch {
        const errMsg = `GATT characteristic UUID ${TELEMETRY_CONFIG.BLE_FIRMWARE.CHARACTERISTIC_UUID} not found. Check firmware sketch CHARACTERISTIC_UUID matches.`;
        this.updateState('ERROR', errMsg);
        this.recordError(errMsg);
        this.device.gatt.disconnect();
        return false;
      }

      this.characteristic = characteristic;
      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', this.handleCharacteristicValueChanged);

      this.updateState('CONNECTED', `Streaming from ${(this.device as { name?: string }).name || 'field node'}`);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('BLE Connection Error:', msg);
      this.updateState('ERROR', `Connection failed: ${msg}`);
      this.recordError(msg);
      return false;
    }
  }

  /**
   * Safe disconnect and clean up GATT subscriptions
   */
  async disconnect(): Promise<void> {
    try {
      if (this.characteristic) {
        try {
          await this.characteristic.stopNotifications();
          this.characteristic.removeEventListener('characteristicvaluechanged', this.handleCharacteristicValueChanged);
        } catch {
          // Ignore cleanup errors
        }
        this.characteristic = null;
      }

      if (this.device) {
        this.device.removeEventListener('gattserverdisconnected', this.handleDisconnection);
        if (this.device.gatt && this.device.gatt.connected) {
          this.device.gatt.disconnect();
        }
      }
    } finally {
      this.device = null;
      this.parser.resetSequence();
      this.updateState('DISCONNECTED', 'Field telemetry unlinked by operator');
    }
  }

  /**
   * Reconnect to previously paired device
   */
  async reconnect(): Promise<boolean> {
    this.diagnostics.reconnectCount++;
    this.updateState('RECONNECTING', 'Attempting reconnection to field node...');
    if (this.device && this.device.gatt) {
      try {
        await this.device.gatt.connect();
        const service = await this.device.gatt.getPrimaryService(TELEMETRY_CONFIG.BLE_FIRMWARE.SERVICE_UUID);
        this.characteristic = await service.getCharacteristic(TELEMETRY_CONFIG.BLE_FIRMWARE.CHARACTERISTIC_UUID);
        await this.characteristic.startNotifications();
        this.characteristic.addEventListener('characteristicvaluechanged', this.handleCharacteristicValueChanged);
        this.updateState('CONNECTED', 'Field node reconnected successfully');
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.recordError(`Reconnect failed: ${msg}`);
      }
    }
    // Fall back to full connect if device handle was lost
    return await this.connect();
  }

  private handleDisconnection = () => {
    this.characteristic = null;
    this.updateState('DISCONNECTED', 'Hardware connection severed (GATT disconnected)');
    this.recordError('GATT Server disconnected unexpectedly');
  };

  private handleCharacteristicValueChanged = (event: Event) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const target = event.target as any;
    const value: DataView | undefined = target?.value;

    if (!value) return;

    this.diagnostics.packetCount++;
    const now = Date.now();
    this.diagnostics.lastPacketTime = now;

    // Rolling rate (Hz) calculation
    this.packetTimestamps.push(now);
    if (this.packetTimestamps.length > 10) this.packetTimestamps.shift();
    if (this.packetTimestamps.length >= 2) {
      const spanSec = (this.packetTimestamps[this.packetTimestamps.length - 1] - this.packetTimestamps[0]) / 1000;
      this.diagnostics.packetRateHz = spanSec > 0 ? Number(((this.packetTimestamps.length - 1) / spanSec).toFixed(1)) : 0;
    }

    const result = this.parser.parse(value, 'BLE');

    if (result.success && result.telemetry) {
      this.diagnostics.validPackets++;
      if (result.isSequenceGap) {
        this.diagnostics.sequenceGaps++;
      }
      this.diagnostics.lastSequenceNumber = result.telemetry.sequence_number;
      this.diagnostics.transportLatencyMs = result.telemetry.transport_latency_ms || 0;

      this.events?.onTelemetry(result.telemetry);
      this.events?.onDiagnosticsUpdate({ ...this.diagnostics });
    } else {
      this.diagnostics.malformedPackets++;
      this.recordError(result.error || 'Unknown payload parsing failure', result.rawSnippet);
    }
  };
}
