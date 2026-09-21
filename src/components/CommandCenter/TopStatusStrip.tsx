import React from 'react';
import { useSimulation } from '../../state/simulationContext';
import { AlertCircle, CheckCircle2, Cpu, Wifi, Database } from 'lucide-react';

export const TopStatusStrip: React.FC = () => {
  const {
    riskScore,
    riskBand,
    consensusResult,
    nodes,
    networkHealth,
    setActiveModal,
    telemetryMode,
    fieldPacketCount
  } = useSimulation();

  const totalMonitored = Object.values(nodes).filter(n => !n.isReference && n.status !== 'OFFLINE').length;
  const anomalousCount = Object.values(nodes).filter(n => n.status === 'ANOMALOUS' || n.status === 'CRITICAL').length;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '12px',
      marginBottom: '14px'
    }}>
      {/* 1. Current Risk */}
      <div className="card-industrial" style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Current Risk
          </span>
          <span className={`badge-status ${riskBand.toLowerCase()}`}>
            {riskBand}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
            {riskScore}
          </span>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>/ 100</span>
        </div>
      </div>

      {/* 2. Deformation Consensus */}
      <div className="card-industrial" style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Deform. Consensus
          </span>
          <span style={{
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: consensusResult.confidence === 'HIGH' ? '#15803d' : consensusResult.confidence === 'MODERATE' ? '#d97706' : '#64748b'
          }}>
            {consensusResult.confidence} CONF.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
            {consensusResult.normalizedScore}
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            ({consensusResult.score}%)
          </span>
        </div>
      </div>

      {/* 3. Active Anomalous Nodes */}
      <div className="card-industrial" style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Anomalous Nodes
          </span>
          {anomalousCount > 0 ? (
            <AlertCircle size={14} color="#ea580c" />
          ) : (
            <CheckCircle2 size={14} color="#16a34a" />
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span className="font-mono" style={{
            fontSize: '24px',
            fontWeight: 700,
            color: anomalousCount >= 2 ? '#dc2626' : anomalousCount === 1 ? '#d97706' : '#0f172a'
          }}>
            {anomalousCount} / {totalMonitored}
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>active fleet</span>
        </div>
      </div>

      {/* 4. Network Health */}
      <div className="card-industrial" style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Mesh Network
          </span>
          <Wifi size={14} color={networkHealth > 80 ? '#16a34a' : '#ea580c'} />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
            {networkHealth}%
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>packet delivery</span>
        </div>
      </div>

      {/* 5. Edge Gateway Engine */}
      <div className="card-industrial" style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Edge Gateway
          </span>
          <Cpu size={14} color="#0284c7" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span className="font-mono" style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
            EDGE-01
          </span>
          <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>ACTIVE</span>
        </div>
      </div>

      {/* 6. Field Telemetry Architecture Card */}
      <div
        onClick={() => setActiveModal('FIELD_TELEMETRY')}
        className="card-industrial"
        style={{
          padding: '10px 14px',
          cursor: 'pointer',
          border: `1px solid ${telemetryMode === 'LIVE' ? '#86efac' : '#bae6fd'}`,
          background: telemetryMode === 'LIVE' ? '#f0fdf4' : '#f0f9ff',
          transition: 'all 0.15s ease'
        }}
        title="Click to inspect Field Telemetry Adapter, Bench Ingestion, and Architecture Pipeline"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: telemetryMode === 'LIVE' ? '#166534' : '#0369a1', textTransform: 'uppercase' }}>
            Field Telemetry
          </span>
          <span style={{
            fontSize: '9px',
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: '3px',
            backgroundColor: telemetryMode === 'LIVE' ? '#16a34a' : '#0284c7',
            color: '#ffffff'
          }}>
            {telemetryMode === 'LIVE' ? 'LIVE' : 'SIMULATION'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Database size={15} color={telemetryMode === 'LIVE' ? '#16a34a' : '#0284c7'} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: telemetryMode === 'LIVE' ? '#15803d' : '#0369a1', textTransform: 'uppercase' }}>
            {telemetryMode === 'LIVE' ? 'NODE N01 • LINKED' : 'PHYSICS TWIN'}
          </span>
        </div>
        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
          {telemetryMode === 'LIVE' ? `${fieldPacketCount} packets received` : 'Deterministic baseline'}
        </div>
      </div>
    </div>
  );
};
