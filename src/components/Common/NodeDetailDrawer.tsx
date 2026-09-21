import React from 'react';
import { useSimulation } from '../../state/simulationContext';
import { 
  X, 
  Radio, 
  Battery, 
  Wifi, 
  Sliders, 
  RefreshCw,
  Clock,
  Layers,
  Thermometer,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export const NodeDetailDrawer: React.FC = () => {
  const { 
    selectedNodeId, 
    selectNode, 
    nodes, 
    toggleNodeFailure, 
    setActiveModal,
    simClockSec,
    telemetryMode,
    lastFieldPacket,
    spatialResult,
    consensusResult,
    riskScore,
    fieldTelemetryStatus
  } = useSimulation();

  if (!selectedNodeId || !nodes[selectedNodeId]) return null;

  const node = nodes[selectedNodeId];
  const isOffline = node.status === 'OFFLINE';
  const isLiveNode = telemetryMode === 'LIVE' && node.node_id === 'N01';
  
  // Data Quality & Provenance
  const dataQuality = isOffline 
    ? 'OFFLINE' 
    : isLiveNode 
      ? (fieldTelemetryStatus === 'CONNECTED' ? 'LIVE' : 'STALE')
      : 'LIVE';

  const provenance = isLiveNode ? 'FIELD TELEMETRY' : 'SIMULATION';

  const lastPacketAge = isLiveNode
    ? (lastFieldPacket 
        ? `${Math.max(0.4, ((lastFieldPacket.packet_age_ms || 1200) / 1000)).toFixed(1)}s ago`
        : 'Active stream')
    : `${(simClockSec % 3) + 1}s ago`;

  // Multi-sensor intelligence breakdown
  const temporalState = node.persistenceTicks > 4 ? 'ELEVATED' : 'STABLE';
  const spatialAgreement = spatialResult.spatialCorrelationLevel === 'HIGH' ? 'AGREEMENT' : spatialResult.spatialCorrelationLevel === 'MODERATE' ? 'MODERATE' : 'NORMAL';
  const consensusLevel = consensusResult.score > 60 ? 'HIGH' : consensusResult.score > 30 ? 'MODERATE' : 'LOW';
  const confidenceRating = consensusResult.confidence;
  const riskContribution = Math.round(node.anomalyScore * 35);

  const historyTilt = node.history?.tilt || Array(15).fill(node.tilt);
  const historyDisp = node.history?.displacement || Array(15).fill(node.displacement);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      zIndex: 998,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        width: '540px',
        maxWidth: '100vw',
        height: '100%',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #cbd5e1',
        boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '6px',
              backgroundColor: isOffline ? '#fee2e2' : node.status === 'CRITICAL' ? '#fee2e2' : node.status === 'ANOMALOUS' ? '#fef3c7' : '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Radio size={22} color={isOffline ? '#dc2626' : node.status === 'CRITICAL' ? '#dc2626' : node.status === 'ANOMALOUS' ? '#d97706' : '#0284c7'} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                  NODE {node.node_id}
                </h2>
                <span className={`badge ${
                  isOffline ? 'badge-critical' :
                  node.status === 'CRITICAL' ? 'badge-critical' :
                  node.status === 'ANOMALOUS' ? 'badge-warning' : 'badge-normal'
                }`}>
                  {node.status}
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '3px',
                  background: isLiveNode ? '#16a34a' : '#475569',
                  color: '#ffffff'
                }}>
                  {provenance} &bull; {dataQuality}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {node.panel} &bull; {node.sector}
              </div>
            </div>
          </div>

          <button
            onClick={() => selectNode(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '6px',
              borderRadius: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Quick Hardware Telemetry Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '10px 12px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>
                <Clock size={12} color="#0284c7" />
                <span>Last Packet</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {lastPacketAge}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>
                <Thermometer size={12} color="#f97316" />
                <span>Temperature</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {node.temperature.toFixed(1)}°C
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>
                <Battery size={12} color="#16a34a" />
                <span>Battery</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {node.battery}%
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>
                <Wifi size={12} color="#6366f1" />
                <span>RF Signal</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {node.rssi} dBm
              </div>
            </div>
          </div>

          {/* Primary Kinematic Channels Grid */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#09332c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Kinematic Field Channels
              </span>
              <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                Baseline calibrated
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {/* Tilt */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', backgroundColor: '#ffffff' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px', textTransform: 'uppercase', fontWeight: 600 }}>Tilt (Inclination)</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: node.tilt > 0.8 ? '#dc2626' : node.tilt > 0.4 ? '#d97706' : '#0f172a', fontFamily: 'var(--font-mono)' }}>
                    {node.tilt.toFixed(2)}°
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>ref {node.baseline.tilt}°</span>
                </div>
                <div style={{ fontSize: '10px', color: node.rateOfChangeTilt > 0 ? '#dc2626' : '#15803d', marginTop: '4px' }}>
                  Rate: +{(node.rateOfChangeTilt * 10).toFixed(3)}°/min
                </div>
              </div>

              {/* Displacement */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', backgroundColor: '#ffffff' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px', textTransform: 'uppercase', fontWeight: 600 }}>Displacement</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: node.displacement > 4.0 ? '#dc2626' : node.displacement > 1.5 ? '#d97706' : '#0284c7', fontFamily: 'var(--font-mono)' }}>
                    {node.displacement.toFixed(2)} mm
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>ref {node.baseline.displacement} mm</span>
                </div>
                <div style={{ fontSize: '10px', color: node.rateOfChangeDisp > 0 ? '#dc2626' : '#15803d', marginTop: '4px' }}>
                  Rate: +{(node.rateOfChangeDisp * 10).toFixed(3)} mm/min
                </div>
              </div>

              {/* Vibration */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', backgroundColor: '#ffffff' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px', textTransform: 'uppercase', fontWeight: 600 }}>Micro-Seismic Vibration</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: node.vibration > 0.4 ? '#dc2626' : node.vibration > 0.2 ? '#d97706' : '#0f172a', fontFamily: 'var(--font-mono)' }}>
                    {node.vibration.toFixed(2)} g
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>ref {node.baseline.vibration} g</span>
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                  Acoustic band: 0.5 - 25 Hz
                </div>
              </div>

              {/* Crack Signal */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', backgroundColor: '#ffffff' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px', textTransform: 'uppercase', fontWeight: 600 }}>Tensile Crack Signal</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: node.crack_signal ? '#dc2626' : '#16a34a', fontFamily: 'var(--font-mono)' }}>
                    {node.crack_signal ? 'TRIPPED' : 'CLEAR'}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: node.crack_signal ? '#dc2626' : '#16a34a', marginTop: '4px' }}>
                  {node.crack_signal ? 'Conductive ribbon fractured' : 'Loop continuity intact'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 14: Multi-Channel Intelligence & Consensus Matrix */}
          <div style={{
            background: '#090d16',
            borderRadius: '6px',
            border: '1px solid #1e293b',
            padding: '14px',
            color: '#f8fafc'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Deterministic Intelligence Vector
              </span>
              <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                Risk Contribution: {riskContribution} / 35
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', textAlign: 'center' }}>
              <div style={{ background: '#1e293b', padding: '8px 4px', borderRadius: '4px' }}>
                <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>ANOMALY</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: node.anomalyScore > 0.5 ? '#f87171' : '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                  {node.anomalyScore.toFixed(2)}
                </div>
              </div>

              <div style={{ background: '#1e293b', padding: '8px 4px', borderRadius: '4px' }}>
                <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>TEMPORAL</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: temporalState === 'ELEVATED' ? '#fbbf24' : '#4ade80', marginTop: '2px' }}>
                  {temporalState}
                </div>
              </div>

              <div style={{ background: '#1e293b', padding: '8px 4px', borderRadius: '4px' }}>
                <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>SPATIAL</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: spatialAgreement === 'AGREEMENT' ? '#fbbf24' : '#94a3b8', marginTop: '2px' }}>
                  {spatialAgreement}
                </div>
              </div>

              <div style={{ background: '#1e293b', padding: '8px 4px', borderRadius: '4px' }}>
                <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>CONSENSUS</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: consensusLevel === 'HIGH' ? '#f87171' : consensusLevel === 'MODERATE' ? '#fbbf24' : '#4ade80', marginTop: '2px' }}>
                  {consensusLevel}
                </div>
              </div>

              <div style={{ background: '#1e293b', padding: '8px 4px', borderRadius: '4px' }}>
                <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>CONFIDENCE</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: confidenceRating === 'HIGH' ? '#4ade80' : '#fbbf24', marginTop: '2px' }}>
                  {confidenceRating}
                </div>
              </div>
            </div>
          </div>

          {/* Recent History Mini-Trend */}
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '12px 14px',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={13} color="#0284c7" />
                <span>Recent Kinematic History (Last 15 Intervals)</span>
              </div>
              <span style={{ fontSize: '10px', color: '#64748b' }}>
                Tilt &bull; Disp
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '40px', padding: '4px 0' }}>
              {historyTilt.slice(-15).map((val, idx) => {
                const dispVal = historyDisp.slice(-15)[idx] || 0.5;
                const hPct = Math.min(100, Math.max(15, (val / 2.5) * 100));
                return (
                  <div
                    key={idx}
                    title={`Interval ${idx}: Tilt ${val.toFixed(2)}°, Disp ${dispVal.toFixed(2)}mm`}
                    style={{
                      flex: 1,
                      height: `${hPct}%`,
                      backgroundColor: val > 0.8 ? '#dc2626' : val > 0.4 ? '#d97706' : '#0284c7',
                      borderRadius: '2px',
                      opacity: 0.85
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Contributing Evidence Chain */}
          <div style={{
            backgroundColor: node.status === 'CRITICAL' ? '#fef2f2' : node.status === 'ANOMALOUS' ? '#fffbeb' : '#f0fdf4',
            border: `1px solid ${node.status === 'CRITICAL' ? '#fecaca' : node.status === 'ANOMALOUS' ? '#fde68a' : '#bbf7d0'}`,
            borderRadius: '6px',
            padding: '12px 14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="#09332c" />
                Evidence Chain & Risk Evaluation
              </span>
              <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                Overall Risk: {riskScore} / 100
              </span>
            </div>

            <div style={{ fontSize: '11px', color: '#334155', lineHeight: '1.5' }}>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                {node.tilt > 0.4 && <li>Persistent inclination angle departure from baseline envelope</li>}
                {node.displacement > 1.2 && <li>Extensometer tensile displacement acceleration detected</li>}
                {node.vibration > 0.25 && <li>Acoustic micro-seismic fracture energy elevation</li>}
                {node.crack_signal && <li>Surface fissure conductive continuity interrupted</li>}
                {node.status === 'NORMAL' && <li>All kinematic channels conform to 30-interval running baseline</li>}
                {isLiveNode && <li>Hardware provenance: physical bench field telemetry directly verified</li>}
              </ul>
            </div>
          </div>

          {/* Network Path & Topology */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px', backgroundColor: '#f8fafc', fontSize: '11px' }}>
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={13} color="#64748b" />
              <span>Network Path & Concentrator Link</span>
            </div>
            <div style={{ color: '#475569' }}>
              Active Next Hop: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>{node.routeThrough}</span> • Packet Loss: {node.packet_loss.toFixed(1)}% • Sensor Health: {node.health}%
            </div>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              className={`btn ${isOffline ? 'btn-primary' : 'btn-danger'}`}
              onClick={() => toggleNodeFailure(node.node_id)}
              style={{ flex: 1, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} />
              {isOffline ? 'Restore Node Online' : `Simulate Fail (${node.node_id})`}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setActiveModal('CONFIG_NODE')}
              style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sliders size={14} />
              Configure
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto'
        }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {isLiveNode 
              ? 'Field Telemetry Stream &bull; Live Hardware Node N01'
              : 'Normalized Telemetry Stream &bull; Digital Twin 1 Hz'}
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => selectNode(null)}
            style={{ fontSize: '12px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
