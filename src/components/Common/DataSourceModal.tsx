import React from 'react';
import { useSimulation } from '../../state/simulationContext';
import { Database, X, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';

export const DataSourceModal: React.FC = () => {
  const { activeModal, setActiveModal, telemetryMode, fieldNodeId } = useSimulation();

  if (activeModal !== 'DATA_SOURCE') return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #cbd5e1',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          borderBottom: '1px solid #e2e8f0',
          background: '#09332c',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} color="#34d399" />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Field Telemetry & Data Layer Architecture
            </h3>
          </div>
          <button
            onClick={() => setActiveModal('NONE')}
            style={{
              background: 'none',
              border: 'none',
              color: '#cbd5e1',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '4px',
            background: telemetryMode === 'LIVE' ? '#dcfce7' : '#e0f2fe',
            border: `1px solid ${telemetryMode === 'LIVE' ? '#86efac' : '#bae6fd'}`,
            fontSize: '11px',
            fontWeight: 800,
            color: telemetryMode === 'LIVE' ? '#166534' : '#0369a1',
            textTransform: 'uppercase',
            marginBottom: '14px'
          }}>
            <Cpu size={14} />
            Data Source: {telemetryMode === 'LIVE' ? `FIELD TELEMETRY (NODE ${fieldNodeId || 'N01'} LIVE)` : 'SYNTHETIC DIGITAL TWIN'}
          </div>

          <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, marginBottom: '14px' }}>
            STRATUM operates on an industry-standard, transport-agnostic telemetry ingestion architecture. Physical communication transports are decoupled implementation details; the intelligence and visualization layers consume strictly normalized field telemetry.
          </p>

          {/* 8-Stage Architecture Pipeline */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '14px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#09332c', textTransform: 'uppercase', marginBottom: '8px' }}>
              Field-to-Decision Pipeline
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              lineHeight: 1.8,
              color: '#0f172a',
              background: '#ffffff',
              padding: '10px 14px',
              borderRadius: '4px',
              border: '1px solid #e2e8f0'
            }}>
              PHYSICAL SENSOR <span style={{ color: '#09332c', fontWeight: 800 }}>↓</span> TELEMETRY ADAPTER <span style={{ color: '#09332c', fontWeight: 800 }}>↓</span> NORMALIZED STRATUM TELEMETRY <span style={{ color: '#09332c', fontWeight: 800 }}>↓</span> ANOMALY DETECTION <span style={{ color: '#09332c', fontWeight: 800 }}>↓</span> TEMPORAL ANALYSIS <span style={{ color: '#09332c', fontWeight: 800 }}>↓</span> SPATIAL CORRELATION <span style={{ color: '#09332c', fontWeight: 800 }}>↓</span> MULTI-SENSOR CONSENSUS <span style={{ color: '#09332c', fontWeight: 800 }}>↓</span> RISK ENGINE <span style={{ color: '#09332c', fontWeight: 800 }}>↓</span> GIS + ALERT
            </div>
          </div>

          {/* Multi-Source Architectural Diagram */}
          <div style={{
            background: '#0f172a',
            color: '#e2e8f0',
            borderRadius: '6px',
            padding: '14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            lineHeight: 1.4,
            marginBottom: '16px'
          }}>
            <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '6px' }}>
              SOFTWARE ARCHITECTURE
            </div>
            <pre style={{ margin: 0, color: '#94a3b8' }}>{`STRATUM APP
      │
TelemetryProvider
      │
┌─────────────┼─────────────┐
│             │             │
Simulation   Field Node    Field Gateway
Digital Twin Bench Node    Industrial Network
│             │             │
└─────────────┼─────────────┘
      │
SAME NORMALIZED TELEMETRY
      │
┌────────────────┴───────────────┐
│                               │
Intelligence                    UI
anomaly → temporal → spatial    Map / Risk / Alerts
consensus → risk                Replay / Health`}</pre>
          </div>

          <div style={{
            padding: '10px 14px',
            background: telemetryMode === 'LIVE' ? '#f0fdf4' : '#f8fafc',
            border: `1px solid ${telemetryMode === 'LIVE' ? '#bbf7d0' : '#e2e8f0'}`,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color={telemetryMode === 'LIVE' ? '#166534' : '#0284c7'} />
              <span style={{ fontSize: '11px', color: telemetryMode === 'LIVE' ? '#166534' : '#334155', fontWeight: 700 }}>
                Active Mode: {telemetryMode === 'LIVE' 
                  ? 'Field Hardware Ingestion (Node N01 Live Stream)' 
                  : 'Simulation Mode (Deterministic Baseline Physics)'}
              </span>
            </div>
            <button
              onClick={() => setActiveModal('FIELD_TELEMETRY')}
              className="btn-engineering"
              style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Manage Field Link</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => setActiveModal('NONE')}
            className="btn-engineering primary"
            style={{ padding: '6px 16px', fontSize: '12px', background: '#09332c', borderColor: '#09332c', color: '#ffffff' }}
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
