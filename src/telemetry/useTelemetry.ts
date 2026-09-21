/**
 * useTelemetry Hook
 * React hook exposing reactive state, connection controls, and diagnostics from the Telemetry Registry.
 */

import { useState, useEffect, useCallback } from 'react';
import { telemetryRegistry } from './telemetryRegistry';
import type {
  NormalizedTelemetry,
  TelemetryQuality,
  OperatingMode,
  TelemetryConnectionState,
  DiagnosticsMetrics
} from './types';

export function useTelemetry() {
  const [operatingMode, setOperatingMode] = useState<OperatingMode>(telemetryRegistry.operatingMode);
  const [connectionState, setConnectionState] = useState<TelemetryConnectionState>(telemetryRegistry.connectionState);
  const [statusMessage, setStatusMessage] = useState<string>(telemetryRegistry.statusMessage);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsMetrics>(telemetryRegistry.getDiagnostics());

  useEffect(() => {
    const unsubscribe = telemetryRegistry.subscribeState(() => {
      setOperatingMode(telemetryRegistry.operatingMode);
      setConnectionState(telemetryRegistry.connectionState);
      setStatusMessage(telemetryRegistry.statusMessage);
      setDiagnostics(telemetryRegistry.getDiagnostics());
    });

    return unsubscribe;
  }, []);

  const connect = useCallback(async () => {
    return await telemetryRegistry.connectFieldHardware();
  }, []);

  const disconnect = useCallback(async () => {
    await telemetryRegistry.disconnectFieldHardware();
  }, []);

  const reconnect = useCallback(async () => {
    return await telemetryRegistry.reconnectFieldHardware();
  }, []);

  const inject = useCallback((packet: Partial<NormalizedTelemetry>) => {
    telemetryRegistry.injectBenchPacket(packet);
  }, []);

  const getLatest = useCallback((nodeId: string) => {
    return telemetryRegistry.getLatestTelemetry(nodeId);
  }, []);

  const getQuality = useCallback((nodeId: string): TelemetryQuality => {
    return telemetryRegistry.getNodeQuality(nodeId);
  }, []);

  const getPacketAgeMs = useCallback((nodeId: string): number => {
    return telemetryRegistry.getNodePacketAgeMs(nodeId);
  }, []);

  return {
    operatingMode,
    connectionState,
    statusMessage,
    diagnostics,
    connect,
    disconnect,
    reconnect,
    inject,
    getLatest,
    getQuality,
    getPacketAgeMs,
    isSupported: telemetryRegistry.ble.isSupported
  };
}
