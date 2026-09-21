import React, { useState } from 'react';
import { useSimulation } from '../../state/simulationContext';
import { 
  Radio, 
  X, 
  Activity, 
  Zap, 
  Layers, 
  RefreshCw, 
  Power,
  Battery,
  Wifi,
  Wrench
} from 'lucide-react';

export const FieldTelemetryModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    telemetryMode,
    fieldNodeId,
    fieldPacketCount,
    fieldPacketRateHz,
    lastFieldPacket,
    fieldStatusMessage,
    connectFieldNode,
    disconnectFieldNode,
    injectBenchTelemetry,
    nodes
  } = useSimulation();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BENCH_TEST' | 'PIPELINE'>('OVERVIEW');
  const [isConnecting, setIsConnecting] = useState(false);

  // Bench Injection Test State
  const [benchTilt, setBenchTilt] = useState(0.85);
  const [benchDisp, setBenchDisp] = useState(2.4);
  const [benchVib, setBenchVib] = useState(0.18);
  const [benchCrack, setBenchCrack] = useState(false);

  if (activeModal !== 'FIELD_TELEMETRY') return null;

  const targetNode = nodes[fieldNodeId] || nodes['N01'];

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectFieldNode();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectFieldNode();
  };

  const handleInject = () => {
    injectBenchTelemetry({
      node_id: fieldNodeId || 'N01',
      tilt: Number(benchTilt),
      displacement: Number(benchDisp),
      vibration: Number(benchVib),
      crack_signal: benchCrack,
      temperature: 28.5,
      battery: 98,
      rssi: -66,
      packet_loss: 0.2,
      raw_payload: `BENCH_INJECT[tilt=${benchTilt},disp=${benchDisp},vib=${benchVib},crack=${benchCrack ? 1 : 0}]`
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
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
        maxWidth: '720px',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #cbd5e1',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* 1. Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          borderBottom: '1px solid #e2e8f0',
          background: '#09332c',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Radio size={20} color="#34d399" />
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                Field Telemetry • Ingestion Layer
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#a7f3d0' }}>
                Target: <strong>STRATUM FIELD NODE</strong> • Node {fieldNodeId || 'N01'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('NONE')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#cbd5e1',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          padding: '0 20px'
        }}>
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            style={{
              padding: '10px 16px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              borderBottom: activeTab === 'OVERVIEW' ? '2px solid #09332c' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === 'OVERVIEW' ? '#09332c' : '#64748b',
              cursor: 'pointer'
            }}
          >
            Hardware Link Status
          </button>
          <button
            onClick={() => setActiveTab('BENCH_TEST')}
            style={{
              padding: '10px 16px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              borderBottom: activeTab === 'BENCH_TEST' ? '2px solid #09332c' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === 'BENCH_TEST' ? '#09332c' : '#64748b',
              cursor: 'pointer'
            }}
          >
            Bench Test Harness
          </button>
          <button
            onClick={() => setActiveTab('PIPELINE')}
            style={{
              padding: '10px 16px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              borderBottom: activeTab === 'PIPELINE' ? '2px solid #09332c' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === 'PIPELINE' ? '#09332c' : '#64748b',
              cursor: 'pointer'
            }}
          >
            Software Architecture
          </button>
        </div>

        {/* 3. Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'OVERVIEW' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Primary Status Card */}
              <div style={{
                background: telemetryMode === 'LIVE' ? '#f0fdf4' : '#f8fafc',
                border: `1px solid ${telemetryMode === 'LIVE' ? '#86efac' : '#cbd5e1'}`,
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      background: telemetryMode === 'LIVE' ? '#16a34a' : '#d97706',
                      color: '#ffffff'
                    }}>
                      {telemetryMode === 'LIVE' ? (
                        <>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ffffff', animation: 'pulse 1.5s infinite' }} />
                          FIELD TELEMETRY — LINKED
                        </>
                      ) : (
                        <>
                          <Activity size={12} />
                          SIMULATION MODE
                        </>
                      )}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      {telemetryMode === 'LIVE' ? 'NODE N01 • LIVE' : 'Synthetic Physics Twin'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
                    {fieldStatusMessage || (telemetryMode === 'LIVE' 
                      ? 'Physical field sensor actively streaming normalized geotechnical telemetry.'
                      : 'Software-defined digital twin calibrated against baseline equilibrium.')}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {telemetryMode === 'LIVE' ? (
                    <>
                      <button
                        onClick={handleDisconnect}
                        className="btn-engineering danger"
                        style={{ padding: '8px 14px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Power size={14} />
                        <span>UNLINK</span>
                      </button>
                      <button
                        onClick={() => setActiveModal('ENGINEERING_DIAGNOSTICS')}
                        className="btn-engineering"
                        style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Wrench size={13} color="#0284c7" />
                        <span>DIAGNOSTICS</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="btn-engineering primary"
                        style={{ 
                          padding: '8px 18px', 
                          fontSize: '12px', 
                          fontWeight: 700, 
                          background: '#09332c', 
                          borderColor: '#09332c',
                          color: '#ffffff',
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px' 
                        }}
                      >
                        {isConnecting ? <RefreshCw size={14} className="spin" /> : <Zap size={14} color="#34d399" />}
                        <span>{isConnecting ? 'SCANNING...' : 'CONNECT FIELD NODE'}</span>
                      </button>
                      <button
                        onClick={() => setActiveModal('ENGINEERING_DIAGNOSTICS')}
                        className="btn-engineering"
                        style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Wrench size={13} color="#64748b" />
                        <span>DIAGNOSTICS</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Real-time Telemetry Metrics Stream */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Surface Tilt</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                    {targetNode.tilt.toFixed(2)}°
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Baseline: {targetNode.baseline.tilt}°</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Displacement</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                    {targetNode.displacement.toFixed(2)} mm
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Baseline: {targetNode.baseline.displacement} mm</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Vibration (g)</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                    {targetNode.vibration.toFixed(2)} g
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Baseline: {targetNode.baseline.vibration} g</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Crack Monitor</div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 800, 
                    color: targetNode.crack_signal ? '#dc2626' : '#16a34a',
                    marginTop: '4px'
                  }}>
                    {targetNode.crack_signal ? 'FRACTURE DETECTED' : 'INTACT'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Acoustic Emission Strip</div>
                </div>
              </div>

              {/* Hardware Health & Packet Statistics */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Wifi size={14} color="#0284c7" />
                  <span style={{ color: '#64748b' }}>Signal (RSSI):</span>
                  <strong>{targetNode.rssi} dBm</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Battery size={14} color="#16a34a" />
                  <span style={{ color: '#64748b' }}>Battery:</span>
                  <strong>{targetNode.battery}%</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={14} color="#d97706" />
                  <span style={{ color: '#64748b' }}>Stream Rate:</span>
                  <strong>{fieldPacketRateHz > 0 ? `${fieldPacketRateHz} Hz` : 'Polling'}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={14} color="#6366f1" />
                  <span style={{ color: '#64748b' }}>Packets:</span>
                  <strong>{fieldPacketCount}</strong>
                </div>
              </div>

              {/* Raw Payload Log */}
              {lastFieldPacket?.raw_payload !== undefined && lastFieldPacket?.raw_payload !== null && (
                <div style={{
                  background: '#090d16',
                  borderRadius: '6px',
                  padding: '12px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: '#38bdf8'
                }}>
                  <span style={{ color: '#94a3b8' }}>LATEST FIELD PAYLOAD: </span>
                  {typeof lastFieldPacket.raw_payload === 'string' 
                    ? lastFieldPacket.raw_payload 
                    : JSON.stringify(lastFieldPacket.raw_payload)}
                </div>
              )}
            </div>
          )}

          {activeTab === 'BENCH_TEST' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                padding: '12px',
                background: '#e0f2fe',
                border: '1px solid #bae6fd',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#0369a1',
                lineHeight: 1.5
              }}>
                <strong>Bench Test Harness:</strong> Direct live parameter injection into <code>NODE N01</code>.
                Allows testing real-time anomaly escalation, spatial consensus, and risk band transitions without physical sensor movement.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                    <span>Surface Tilt</span>
                    <strong>{benchTilt.toFixed(2)}°</strong>
                  </label>
                  <input
                    type="range"
                    min="0.10"
                    max="4.00"
                    step="0.05"
                    value={benchTilt}
                    onChange={(e) => setBenchTilt(parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                    <span>0.10° (Normal)</span>
                    <span>1.20° (Elevated)</span>
                    <span>3.00°+ (Critical)</span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                    <span>Displacement</span>
                    <strong>{benchDisp.toFixed(2)} mm</strong>
                  </label>
                  <input
                    type="range"
                    min="0.20"
                    max="15.00"
                    step="0.10"
                    value={benchDisp}
                    onChange={(e) => setBenchDisp(parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                    <span>0.5 mm (Normal)</span>
                    <span>4.0 mm (Warning)</span>
                    <span>10.0 mm+ (Critical)</span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                    <span>Vibration Signature</span>
                    <strong>{benchVib.toFixed(2)} g</strong>
                  </label>
                  <input
                    type="range"
                    min="0.04"
                    max="1.50"
                    step="0.02"
                    value={benchVib}
                    onChange={(e) => setBenchVib(parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                    <span>0.08 g (Normal)</span>
                    <span>0.35 g (Dynamic)</span>
                    <span>1.00 g+ (Shock)</span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={benchCrack}
                      onChange={(e) => setBenchCrack(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Simulate Tensile Fracture Trip</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Triggers acoustic fracture binary signal</div>
                    </div>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  onClick={() => {
                    setBenchTilt(0.20);
                    setBenchDisp(0.50);
                    setBenchVib(0.08);
                    setBenchCrack(false);
                  }}
                  className="btn-engineering"
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  Reset to Baseline
                </button>
                <button
                  onClick={handleInject}
                  className="btn-engineering primary"
                  style={{ fontSize: '12px', padding: '6px 18px', background: '#09332c', borderColor: '#09332c', color: '#ffffff' }}
                >
                  Inject Telemetry into N01
                </button>
              </div>
            </div>
          )}

          {activeTab === 'PIPELINE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                STRATUM implements a transport-agnostic telemetry ingestion layer. Transport protocol is an implementation detail: the intelligence and visualization layers consume strictly normalized field telemetry.
              </div>

              {/* 8-Stage Architecture Flow */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#09332c', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  End-to-End Intelligence Pipeline
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px'
                }}>
                  {[
                    { step: '1', title: 'PHYSICAL SENSOR', desc: 'MEMS Inclinometer, Extensometer, Geophone' },
                    { step: '2', title: 'TELEMETRY ADAPTER', desc: 'Hardware-independent GATT / Gateway ingest' },
                    { step: '3', title: 'NORMALIZED STRATUM TELEMETRY', desc: 'Unified schema (Tilt, Disp, Vib, Crack, Temp, RSSI)' },
                    { step: '4', title: 'ANOMALY DETECTION', desc: 'Z-score baseline variance & rate-of-change analysis' },
                    { step: '5', title: 'TEMPORAL ANALYSIS', desc: 'Persistence filter & acceleration discrimination' },
                    { step: '6', title: 'SPATIAL CORRELATION', desc: 'K-nearest neighbor & subsidence trough centroiding' },
                    { step: '7', title: 'MULTI-SENSOR CONSENSUS', desc: 'Multi-node quorum to eliminate isolated false trips' },
                    { step: '8', title: 'RISK ENGINE → GIS + ALERT', desc: 'Dynamic risk scoring (0-100), alert broadcast & 2D GIS' }
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      padding: '6px 10px'
                    }}>
                      <span style={{ 
                        background: '#09332c', 
                        color: '#ffffff', 
                        fontSize: '10px', 
                        fontWeight: 800, 
                        width: '18px', 
                        height: '18px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        borderRadius: '50%' 
                      }}>
                        {item.step}
                      </span>
                      <strong style={{ color: '#0f172a', minWidth: '220px' }}>{item.title}</strong>
                      <span style={{ color: '#64748b' }}>{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-Transport Abstraction Box */}
              <div style={{
                background: '#0f172a',
                color: '#e2e8f0',
                borderRadius: '6px',
                padding: '14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                lineHeight: 1.6
              }}>
                <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '6px' }}>
                  TELEMETRY PROVIDER ABSTRACTION
                </div>
                <div>TODAY:  Bench Hardware Node (N01) → Telemetry Adapter → STRATUM</div>
                <div>FINAL:  Intrinsically Safe Nodes → Gateway Concentrator → STRATUM</div>
                <div style={{ color: '#a7f3d0', marginTop: '6px' }}>
                  ✓ Core anomaly, consensus, and risk scoring pipelines remain 100% identical across deployments.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Modal Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          fontSize: '11px',
          color: '#64748b'
        }}>
          <div>
            STRATUM Field Telemetry Adapter • Transport-Independent Core
          </div>
          <button
            onClick={() => setActiveModal('NONE')}
            className="btn-engineering primary"
            style={{ padding: '6px 16px', fontSize: '12px', background: '#09332c', borderColor: '#09332c', color: '#ffffff' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
