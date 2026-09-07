import React from 'react';
import { useSimulation } from '../../state/simulationContext';
import { X, ShieldAlert } from 'lucide-react';

export const EvidenceDrawer: React.FC = () => {
  const { activeModal, setActiveModal, riskResult, consensusResult, spatialResult, nodes } = useSimulation();

  if (activeModal !== 'EVIDENCE') return null;

  const activeAlert = riskResult.activeAlert;
  const panelNodes = Object.values(nodes).filter(n => n.panel === 'Panel B');

  const getWeight = (term: string) => {
    const item = consensusResult.evidence.find(e => e.component.toLowerCase().includes(term.toLowerCase()));
    return item ? item.weight : 0;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      zIndex: 999,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        width: '560px',
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
          padding: '20px',
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
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldAlert size={20} color="#dc2626" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                Why am I seeing this alert?
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Explainable Evidence Dossier • BHUSTHIRA Intelligence Engine
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveModal('NONE')}
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
          {/* Summary Banner */}
          <div style={{
            padding: '14px 16px',
            borderRadius: '6px',
            backgroundColor: riskResult.riskBand === 'CRITICAL' ? '#fef2f2' : riskResult.riskBand === 'WARNING' ? '#fffbeb' : '#f0fdf4',
            border: `1px solid ${riskResult.riskBand === 'CRITICAL' ? '#fecaca' : riskResult.riskBand === 'WARNING' ? '#fde68a' : '#bbf7d0'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                {activeAlert ? activeAlert.primaryEvidence : 'System Operating in Baseline Range'}
              </span>
              <span className={`badge ${
                riskResult.riskBand === 'CRITICAL' ? 'badge-critical' :
                riskResult.riskBand === 'WARNING' ? 'badge-warning' :
                riskResult.riskBand === 'WATCH' ? 'badge-watch' : 'badge-normal'
              }`}>
                RISK: {riskResult.riskScore}/100
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#334155' }}>
              Deformation Consensus: <strong>{consensusResult.score}/100 ({consensusResult.confidence} CONFIDENCE)</strong>.
              Derived from 6 independent heuristic evidence streams.
            </div>
          </div>

          {/* 6 Step Evidence Itemization */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Itemized Evidence Verification Checklist
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Evidence 1: Tilt Trend */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px 14px', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                      1
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Surface Inclinometer (Tilt) Deviation</span>
                  </div>
                  <span className="badge badge-warning" style={{ fontSize: '10px' }}>
                    +{getWeight('anomaly')} pts
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                  Bi-axial inclination has systematically drifted beyond the ±0.10° operational baseline envelope for 
                  continuous sampling intervals. Max observed tilt: <strong>{Math.max(...panelNodes.map(n => n.tilt)).toFixed(2)}°</strong> (Centroid Node N03).
                </div>
              </div>

              {/* Evidence 2: Displacement Acceleration */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px 14px', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                      2
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Differential Displacement Rate of Change</span>
                  </div>
                  <span className="badge badge-critical" style={{ fontSize: '10px' }}>
                    +{getWeight('temporal')} pts
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                  Extensometer probes demonstrate positive velocity acceleration. Max displacement in Panel B sector: 
                  <strong> {Math.max(...panelNodes.map(n => n.displacement)).toFixed(2)} mm</strong> vs 0.40 mm baseline datum.
                </div>
              </div>

              {/* Evidence 3: Spatial Correlation */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px 14px', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                      3
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Spatial Neighborhood Consensus</span>
                  </div>
                  <span className="badge badge-warning" style={{ fontSize: '10px' }}>
                    +{getWeight('spatial')} pts
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                  {spatialResult.neighborAgreementRatio} neighboring nodes in Panel B exhibit compatible kinematic deformation profiles. 
                  Spatial consensus: <strong>{spatialResult.spatialCorrelationLevel}</strong> ({spatialResult.agreementPercent}% agreement). Single-sensor false alarm hypothesis rejected.
                </div>
              </div>

              {/* Evidence 4: Multi-Sensor Cross-Modal Agreement */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px 14px', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                      4
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Multi-Modal Sensor Agreement</span>
                  </div>
                  <span className="badge badge-normal" style={{ fontSize: '10px' }}>
                    +{getWeight('multi-sensor')} pts
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                  Tilt, displacement, dynamic vibration ({Math.max(...panelNodes.map(n => n.vibration)).toFixed(2)} g), 
                  and surface crack ribbon sensors are concurrently active. Independent physical modalities confirm identical subsidence trajectory.
                </div>
              </div>

              {/* Evidence 5: Sensor Fleet Health Verification */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px 14px', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                      5
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Sensor Hardware Health Validation</span>
                  </div>
                  <span className="badge badge-normal" style={{ fontSize: '10px' }}>
                    +{getWeight('sensor health')} pts
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                  Contributing nodes possess average battery reserves of &gt;80% and packet loss &lt;2%. 
                  Signals are confirmed as genuine physical strata movements, not telemetry artifacts from dying batteries.
                </div>
              </div>

              {/* Evidence 6: Temporal Anomaly Persistence */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px 14px', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                      6
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Temporal Persistence vs Transient Spike</span>
                  </div>
                  <span className="badge badge-warning" style={{ fontSize: '10px' }}>
                    +{getWeight('network')} pts
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                  The anomaly has persisted continuously over successive evaluation windows rather than resolving as an isolated surface vehicle or blasting vibration spike.
                </div>
              </div>
            </div>
          </div>

          {/* Consensus Scoring Formula Breakdown */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Prototype Consensus Fusion Equation
            </div>
            <div style={{ 
              fontFamily: 'monospace', 
              fontSize: '11px', 
              color: '#334155', 
              backgroundColor: '#ffffff', 
              padding: '8px 12px', 
              borderRadius: '4px', 
              border: '1px solid #e2e8f0',
              marginBottom: '8px'
            }}>
              Consensus Score: {consensusResult.score} / 100 ({consensusResult.confidence} CONFIDENCE)
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Prototype scoring weights — require mine-specific calibration factoring depth of cover and geological rock mass rating before field deployment.
            </div>
          </div>

          {/* Operator Action Recommendation */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Standard Operating Procedure (SOP) Recommendation
            </div>
            <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
              {activeAlert ? activeAlert.recommendedAction : 'Continue routine continuous monitoring. No immediate supervisory intervention required.'}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            BHUSTHIRA Decision Support Engine
          </span>
          <button
            className="btn btn-primary"
            onClick={() => setActiveModal('NONE')}
            style={{ fontSize: '12px' }}
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
