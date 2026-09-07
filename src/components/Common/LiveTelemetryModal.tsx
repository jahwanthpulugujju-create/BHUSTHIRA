import React, { useState } from 'react';
import { useSimulation } from '../../state/simulationContext';
import { X, Terminal, Copy, Check, Info } from 'lucide-react';

export const LiveTelemetryModal: React.FC = () => {
  const { activeModal, setActiveModal, nodes, simClockSec, currentScenario } = useSimulation();
  const [copied, setCopied] = useState(false);
  const [selectedNodeKey, setSelectedNodeKey] = useState<string>('N03');

  if (activeModal !== 'LIVE_TELEMETRY') return null;

  const activeNode = nodes[selectedNodeKey] || Object.values(nodes)[0];

  const payload = {
    schema_version: 'bhusthira.telemetry.v1',
    stream_type: 'SYNTHETIC_SENSOR_TELEMETRY',
    simulation_clock_sec: simClockSec,
    scenario: currentScenario,
    telemetry_packet: {
      node_id: activeNode.node_id,
      sector: activeNode.sector,
      panel: activeNode.panel,
      timestamp_iso: new Date().toISOString(),
      kinematic_channels: {
        inclinometer_tilt_deg: activeNode.tilt,
        extensometer_displacement_mm: activeNode.displacement,
        geophone_vibration_g: activeNode.vibration,
        tensile_crack_tripped: activeNode.crack_signal
      },
      health_diagnostics: {
        battery_pct: activeNode.battery,
        rssi_dbm: activeNode.rssi,
        packet_loss_pct: activeNode.packet_loss,
        internal_temp_c: activeNode.temperature,
        mesh_next_hop: activeNode.routeThrough
      },
      edge_computed_anomaly_score: activeNode.anomalyScore,
      status: activeNode.status
    }
  };

  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '680px',
        maxWidth: '100%',
        maxHeight: '90vh',
        backgroundColor: '#0f172a',
        borderRadius: '8px',
        border: '1px solid #334155',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Terminal Header */}
        <div style={{
          padding: '12px 18px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#1e293b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={16} color="#38bdf8" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', fontFamily: 'monospace' }}>
              Raw Ingestion Stream: SYNTHETIC TELEMETRY
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleCopy}
              className="btn btn-secondary"
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                backgroundColor: '#334155',
                color: '#f8fafc',
                border: '1px solid #475569',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {copied ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
            <button
              onClick={() => setActiveModal('NONE')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Node selector tabs */}
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '8px 16px',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #1e293b',
          overflowX: 'auto'
        }}>
          {Object.keys(nodes).map(id => (
            <button
              key={id}
              onClick={() => setSelectedNodeKey(id)}
              style={{
                background: selectedNodeKey === id ? '#0284c7' : '#1e293b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'monospace'
              }}
            >
              {id}
            </button>
          ))}
        </div>

        {/* JSON Terminal Body */}
        <div style={{
          padding: '16px',
          overflowY: 'auto',
          backgroundColor: '#090d16',
          fontFamily: 'Consolas, Monaco, monospace',
          fontSize: '12px',
          color: '#38bdf8',
          lineHeight: '1.5'
        }}>
          <pre style={{ margin: 0 }}>
            {jsonString}
          </pre>
        </div>

        {/* Notice Bar */}
        <div style={{
          padding: '10px 16px',
          backgroundColor: '#1e293b',
          borderTop: '1px solid #334155',
          fontSize: '11px',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Info size={14} color="#38bdf8" />
          <span>
            Telemetry generated deterministically by BHUSTHIRA virtual physics model. TelemetryProvider abstraction is ready for MQTT/LoRaWAN ingestion.
          </span>
        </div>
      </div>
    </div>
  );
};
