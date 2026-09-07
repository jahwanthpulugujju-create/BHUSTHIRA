import React from 'react';
import { useSimulation } from '../../state/simulationContext';
import { 
  X, 
  Radio, 
  Battery, 
  Wifi, 
  Activity, 
  Sliders, 
  RefreshCw
} from 'lucide-react';

export const NodeDetailDrawer: React.FC = () => {
  const { 
    selectedNodeId, 
    selectNode, 
    nodes, 
    toggleNodeFailure, 
    setActiveModal,
    simClockSec 
  } = useSimulation();

  if (!selectedNodeId || !nodes[selectedNodeId]) return null;

  const node = nodes[selectedNodeId];
  const isOffline = node.status === 'OFFLINE';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      zIndex: 998,
      display: 'flex',
      justifyContent: 'flex-end',
      backdropFilter: 'blur(2px)'
    }}>
      <div style={{
        width: '520px',
        maxWidth: '100vw',
        height: '100%',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #cbd5e1',
        boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              backgroundColor: isOffline ? '#fee2e2' : node.status === 'CRITICAL' ? '#fee2e2' : node.status === 'ANOMALOUS' ? '#fef3c7' : '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Radio size={20} color={isOffline ? '#dc2626' : node.status === 'CRITICAL' ? '#dc2626' : node.status === 'ANOMALOUS' ? '#d97706' : '#0284c7'} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                  NODE {node.node_id}
                </h2>
                <span className={`badge ${
                  isOffline ? 'badge-critical' :
                  node.status === 'CRITICAL' ? 'badge-critical' :
                  node.status === 'ANOMALOUS' ? 'badge-warning' : 'badge-normal'
                }`}>
                  {node.status}
                </span>
                {node.isReference && (
                  <span className="badge badge-neutral" style={{ fontSize: '10px' }}>REFERENCE DATUM</span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {node.sector}
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
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Hardware Health & Network Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '12px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>
                <Activity size={13} color="#10b981" />
                <span>Sensor Health</span>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: node.health > 70 ? '#15803d' : '#b45309' }}>
                {node.health}%
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>
                <Battery size={13} color="#0284c7" />
                <span>Battery Level</span>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                {node.battery}%
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>
                <Wifi size={13} color="#0284c7" />
                <span>RF RSSI</span>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                {node.rssi} dBm
              </div>
            </div>
          </div>

          {/* Primary Telemetry Grid */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Live Physical Telemetry
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Updated {(simClockSec % 3) + 1} sec ago
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {/* Tilt */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', backgroundColor: '#ffffff' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Surface Inclination (Tilt)</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 700, color: node.tilt > 0.8 ? '#dc2626' : node.tilt > 0.4 ? '#d97706' : '#0f172a' }}>
                    {node.tilt.toFixed(2)}°
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>ref 0.15°</span>
                </div>
                <div style={{ fontSize: '11px', color: node.rateOfChangeTilt > 0 ? '#dc2626' : '#15803d', marginTop: '4px' }}>
                  Rate: +{(node.rateOfChangeTilt * 10).toFixed(3)}°/min
                </div>
              </div>

              {/* Displacement */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', backgroundColor: '#ffffff' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Extensometer Displacement</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 700, color: node.displacement > 4.0 ? '#dc2626' : node.displacement > 1.5 ? '#d97706' : '#0f172a' }}>
                    {node.displacement.toFixed(2)} mm
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>ref 0.40 mm</span>
                </div>
                <div style={{ fontSize: '11px', color: node.rateOfChangeDisp > 0 ? '#dc2626' : '#15803d', marginTop: '4px' }}>
                  Rate: +{(node.rateOfChangeDisp * 10).toFixed(3)} mm/min
                </div>
              </div>

              {/* Vibration */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', backgroundColor: '#ffffff' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Micro-Seismic Vibration</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 700, color: node.vibration > 0.4 ? '#dc2626' : node.vibration > 0.2 ? '#d97706' : '#0f172a' }}>
                    {node.vibration.toFixed(2)} g
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>ref 0.06 g</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  Band: 0.5 - 25 Hz low freq
                </div>
              </div>

              {/* Crack Signal */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', backgroundColor: '#ffffff' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Tensile Crack Signal</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: node.crack_signal ? '#dc2626' : '#15803d' }}>
                    {node.crack_signal ? 'TRIPPED' : 'INTACT'}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: node.crack_signal ? '#dc2626' : '#15803d', marginTop: '4px' }}>
                  {node.crack_signal ? 'Surface fissure dilated >0.5mm' : 'Conductive loop closed'}
                </div>
              </div>
            </div>
          </div>

          {/* AI / Intelligence Assessment Box */}
          <div style={{
            backgroundColor: node.status === 'CRITICAL' ? '#fef2f2' : node.status === 'ANOMALOUS' ? '#fffbeb' : '#f0fdf4',
            border: `1px solid ${node.status === 'CRITICAL' ? '#fecaca' : node.status === 'ANOMALOUS' ? '#fde68a' : '#bbf7d0'}`,
            borderRadius: '6px',
            padding: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                Intelligence Assessment: {node.status === 'CRITICAL' ? 'High Subsidence Likelihood' : node.status === 'ANOMALOUS' ? 'Elevated Deformation Watch' : 'Within Baseline Variance'}
              </span>
              <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                Score: {Math.round(node.anomalyScore * 100)} / 100
              </span>
            </div>

            <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
              <strong>Contributing Evidence:</strong>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px' }}>
                {node.tilt > 0.4 && <li>Persistent inclination angle departure from baseline</li>}
                {node.displacement > 1.2 && <li>Extensometer tensile displacement acceleration detected</li>}
                {node.vibration > 0.25 && <li>Acoustic micro-seismic fracture energy elevation</li>}
                {node.crack_signal && <li>Surface fissure ribbon continuity interrupted</li>}
                {node.status === 'NORMAL' && <li>All kinematic readings conform to 30-interval running baseline envelope</li>}
              </ul>
            </div>
          </div>

          {/* Mesh Routing Info */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px 14px', backgroundColor: '#f8fafc', fontSize: '12px' }}>
            <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>Network Path & Resilience</div>
            <div style={{ color: '#475569' }}>
              Active Next Hop: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0284c7' }}>{node.routeThrough}</span> • Packet Loss: {node.packet_loss.toFixed(1)}% • Ambient Temp: {node.temperature.toFixed(1)}°C
            </div>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', gap: '10px' }}>
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
          padding: '14px 20px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto'
        }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Synthetic Telemetry Stream (1 Hz)
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
