import React from 'react';
import { useSimulation } from '../../state/simulationContext';
import { AlertCircle, CheckCircle2, Cpu, Wifi, Database, Info } from 'lucide-react';

export const TopStatusStrip: React.FC = () => {
  const {
    riskScore,
    riskBand,
    consensusResult,
    nodes,
    networkHealth,
    setActiveModal
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

      {/* 6. Data Source Disclosure Card (Req 154) */}
      <div
        onClick={() => setActiveModal('DATA_SOURCE')}
        className="card-industrial"
        style={{
          padding: '10px 14px',
          cursor: 'pointer',
          border: '1px solid #bae6fd',
          background: '#f0f9ff',
          transition: 'all 0.15s ease'
        }}
        title="Click to inspect Data Layer Architecture and Field Sensor Adapter Contract"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>
            Data Source
          </span>
          <Info size={13} color="#0284c7" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Database size={15} color="#0284c7" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>
            SYNTHETIC SIMULATION
          </span>
        </div>
        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
          Deterministic digital twin
        </div>
      </div>
    </div>
  );
};
