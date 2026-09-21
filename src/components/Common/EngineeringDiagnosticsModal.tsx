/**
 * Engineering Diagnostics Modal
 * Deep technical instrumentation view for engineering judges and evaluators.
 * Exposes low-level transport layer, GATT attributes, UUIDs, parser diagnostics, and packet health.
 */

import React, { useState, useEffect } from 'react';
import { useSimulation } from '../../state/simulationContext';
import { telemetryRegistry } from '../../telemetry/telemetryRegistry';
import { TELEMETRY_CONFIG } from '../../telemetry/types';
import { 
  Wrench, 
  X, 
  Terminal, 
  RefreshCw, 
  Power,
  RotateCcw
} from 'lucide-react';

export const EngineeringDiagnosticsModal: React.FC = () => {
  const { activeModal, setActiveModal } = useSimulation();
  const [, setTick] = useState(0);

  // Re-render diagnostics on interval
  useEffect(() => {
    if (activeModal !== 'ENGINEERING_DIAGNOSTICS') return;
    const interval = setInterval(() => setTick(t => t + 1), 500);
    return () => clearInterval(interval);
  }, [activeModal]);

  if (activeModal !== 'ENGINEERING_DIAGNOSTICS') return null;

  const diagnostics = telemetryRegistry.getDiagnostics();
  const connectionState = telemetryRegistry.connectionState;
  const isBleSupported = telemetryRegistry.ble.isSupported;
  const mappedNodeId = TELEMETRY_CONFIG.BLE_FIRMWARE.MAPPED_NODE_ID;
  const lastPacket = telemetryRegistry.getLatestTelemetry(mappedNodeId);
  const packetAgeMs = telemetryRegistry.getNodePacketAgeMs(mappedNodeId);
  const quality = telemetryRegistry.getNodeQuality(mappedNodeId);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '780px',
        maxHeight: '92vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        border: '1px solid #cbd5e1',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          borderBottom: '1px solid #334155',
          background: '#0f172a',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={18} color="#38bdf8" />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Engineering Transport Diagnostics (Bench Link Evaluator)
            </h3>
          </div>
          <button
            onClick={() => setActiveModal('NONE')}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Low-Level Transport Specifications */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '14px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
              Firmware & GATT Endpoint Configuration
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
              <div>
                <span style={{ color: '#64748b' }}>Device Advertised Name:</span>{' '}
                <strong style={{ color: '#0f172a' }}>{TELEMETRY_CONFIG.BLE_FIRMWARE.DEVICE_NAME}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Mapped Node ID:</span>{' '}
                <strong style={{ color: '#09332c' }}>{mappedNodeId} (Panel B Field Pillar)</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Target Primary Service:</span>{' '}
                <code style={{ fontSize: '11px', background: '#e2e8f0', padding: '2px 4px', borderRadius: '3px' }}>
                  {TELEMETRY_CONFIG.BLE_FIRMWARE.SERVICE_UUID}
                </code>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Target Characteristic:</span>{' '}
                <code style={{ fontSize: '11px', background: '#e2e8f0', padding: '2px 4px', borderRadius: '3px' }}>
                  {TELEMETRY_CONFIG.BLE_FIRMWARE.CHARACTERISTIC_UUID}
                </code>
              </div>
            </div>
          </div>

          {/* Real-Time Communication Telemetry Health */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>GATT State</div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 800, 
                marginTop: '4px',
                color: connectionState === 'CONNECTED' ? '#16a34a' : connectionState === 'CONNECTING' ? '#0284c7' : '#dc2626'
              }}>
                {connectionState}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                Browser Web BLE: {isBleSupported ? 'SUPPORTED' : 'UNAVAILABLE'}
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Packet Count</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                {diagnostics.packetCount}
              </div>
              <div style={{ fontSize: '10px', color: '#16a34a', marginTop: '2px' }}>
                Valid: {diagnostics.validPackets} • Seq Gaps: {diagnostics.sequenceGaps}
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Packet Age & Quality</div>
              <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '4px', color: quality === 'LIVE' ? '#16a34a' : quality === 'STALE' ? '#d97706' : '#64748b' }}>
                {quality} {packetAgeMs < Infinity ? `(${Number((packetAgeMs / 1000).toFixed(1))}s)` : '(N/A)'}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                Rate: {diagnostics.packetRateHz} Hz
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Parser Health</div>
              <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '4px', color: diagnostics.malformedPackets === 0 ? '#16a34a' : '#dc2626' }}>
                {diagnostics.malformedPackets === 0 ? '0 MALFORMED' : `${diagnostics.malformedPackets} REJECTED`}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                Reconnects: {diagnostics.reconnectCount}
              </div>
            </div>
          </div>

          {/* Latest Valid Raw Payload Snapshot */}
          <div style={{
            background: '#090d16',
            borderRadius: '6px',
            padding: '12px 16px',
            border: '1px solid #1e293b'
          }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={14} color="#38bdf8" />
              <span>RAW INCOMING JSON BUFFER (LATEST PACKET)</span>
            </div>
            <pre style={{ 
              margin: 0, 
              color: '#38bdf8', 
              fontSize: '11px', 
              fontFamily: 'var(--font-mono)', 
              overflowX: 'auto',
              lineHeight: 1.5
            }}>
              {lastPacket?.raw_payload 
                ? (typeof lastPacket.raw_payload === 'string' ? lastPacket.raw_payload : JSON.stringify(lastPacket.raw_payload, null, 2))
                : '// No live GATT notification packet received yet'}
            </pre>
          </div>

          {/* Diagnostic Log / Parser Errors */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
              Transport Error Log ({diagnostics.errors.length} events)
            </div>
            <div style={{
              maxHeight: '140px',
              overflowY: 'auto',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '8px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)'
            }}>
              {diagnostics.errors.length === 0 ? (
                <div style={{ color: '#16a34a', padding: '6px' }}>
                  ✓ Zero transport errors detected. GATT communications nominal.
                </div>
              ) : (
                diagnostics.errors.map((err, idx) => (
                  <div key={idx} style={{ padding: '4px 6px', borderBottom: '1px solid #e2e8f0', color: '#b91c1c' }}>
                    <span style={{ color: '#64748b' }}>[{new Date(err.timestamp).toLocaleTimeString()}]</span> {err.message}
                    {err.payloadSnippet && <div style={{ color: '#475569', fontSize: '10px' }}>Payload: {err.payloadSnippet}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {connectionState === 'CONNECTED' ? (
              <button
                onClick={() => telemetryRegistry.disconnectFieldHardware()}
                className="btn-engineering danger"
                style={{ fontSize: '11px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Power size={13} />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                onClick={() => telemetryRegistry.connectFieldHardware()}
                className="btn-engineering primary"
                style={{ fontSize: '11px', padding: '5px 12px', background: '#09332c', borderColor: '#09332c', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <RefreshCw size={13} />
                <span>Connect Hardware</span>
              </button>
            )}
            <button
              onClick={() => telemetryRegistry.reconnectFieldHardware()}
              className="btn-engineering"
              style={{ fontSize: '11px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <RotateCcw size={13} />
              <span>Reconnect</span>
            </button>
          </div>

          <button
            onClick={() => setActiveModal('NONE')}
            className="btn-engineering primary"
            style={{ padding: '6px 16px', fontSize: '12px', background: '#0f172a', borderColor: '#0f172a', color: '#ffffff' }}
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
