import React from 'react';
import { useSimulation } from '../../state/simulationContext';
import { CheckCircle2 } from 'lucide-react';

export const DeformationIntelligencePage: React.FC = () => {
  const { consensusResult, spatialResult } = useSimulation();

  const pipelineSteps = [
    { title: '1. Simulated Field', desc: 'Active caving & stress redistribution', status: 'ACTIVE' },
    { title: '2. Telemetry Ingestion', desc: 'Tilt, displacement, vibration, crack', status: 'ACTIVE' },
    { title: '3. Mesh Delivery', desc: 'Sub-GHz 868MHz mesh to GW-01', status: 'ACTIVE' },
    { title: '4. Edge Processing', desc: 'Signal normalization & filtering', status: 'ACTIVE' },
    { title: '5. Anomaly Detection', desc: 'Z-score deviation from 30-tick baseline', status: 'ACTIVE' },
    { title: '6. Spatial Correlation', desc: 'Neighbor agreement across sector', status: 'ACTIVE' },
    { title: '7. Deformation Consensus', desc: 'Multi-evidence fusion score', status: 'ACTIVE' },
    { title: '8. Risk Assessment', desc: 'Kinematic & consensus blend (0-100)', status: 'ACTIVE' },
    { title: '9. GIS Influence Zone', desc: 'Dynamic subsidence contour overlay', status: 'ACTIVE' },
    { title: '10. Explainable Warning', desc: 'Transparent evidence breakdown', status: 'ACTIVE' },
    { title: '11. Operator Response', desc: 'Protocol DGMS safety guidance', status: 'ACTIVE' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header Bar */}
      <div className="card-industrial" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            BHUSTHIRA Intelligence Engine
          </h2>
          <p style={{ fontSize: '11px', color: '#64748b' }}>
            Multi-tier analytical pipeline transforming distributed physical telemetry into transparent, explainable early warning.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="sim-tag">
            EXPLAINABLE HEURISTIC AI • PROTOTYPE
          </span>
        </div>
      </div>

      {/* The 11-Step Mine Intelligence Pipeline Flow */}
      <div className="card-industrial" style={{ padding: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px' }}>
          End-to-End Mine Intelligence Architecture
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '8px'
        }}>
          {pipelineSteps.map((step, idx) => (
            <div
              key={idx}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '10px 12px',
                position: 'relative'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                {step.title}
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.35 }}>
                {step.desc}
              </p>
              <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#15803d' }}>OPERATIONAL</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consensus Evidence Fusion Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
        {/* Consensus Engine Weight Breakdown */}
        <div className="card-industrial" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              Deformation Consensus Engine Evidence Weights
            </span>
            <span className="font-mono" style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              Score: {consensusResult.score} / 100
            </span>
          </div>

          <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px' }}>
            Each component contributes weighted evidence towards the aggregate consensus score. Single isolated spikes receive zero spatial and multi-sensor points.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {consensusResult.evidence.map((ev, idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px 10px',
                  borderRadius: '4px',
                  background: ev.verified ? '#f0fdf4' : '#f8fafc',
                  border: ev.verified ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>
                    {ev.component}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {ev.description}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="font-mono" style={{ fontSize: '12px', fontWeight: 700, color: ev.verified ? '#15803d' : '#64748b' }}>
                    +{ev.weight} / {ev.maxWeight} pts
                  </span>
                  {ev.verified ? (
                    <CheckCircle2 size={13} color="#16a34a" />
                  ) : (
                    <span style={{ width: '13px' }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '12px', padding: '8px', background: '#fffbeb', borderRadius: '4px', border: '1px solid #fef3c7', fontSize: '10px', color: '#b45309' }}>
            <strong>Calibration Notice:</strong> Prototype scoring weights — require mine-specific geotechnical calibration before field deployment.
          </div>
        </div>

        {/* Spatial & Multi-Sensor Intelligence Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card-industrial" style={{ padding: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px' }}>
              Spatial Intelligence & Clustering
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Neighbor Agreement</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  {spatialResult.neighborAgreementRatio}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Spatial Correlation Level</div>
                <span className={`badge-status ${spatialResult.spatialCorrelationLevel === 'HIGH' ? 'critical' : spatialResult.spatialCorrelationLevel === 'MODERATE' ? 'warning' : 'normal'}`}>
                  {spatialResult.spatialCorrelationLevel}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Multi-Sensor Concurrence</div>
                <span className={`badge-status ${spatialResult.multiSensorAgreementLevel === 'HIGH' ? 'critical' : spatialResult.multiSensorAgreementLevel === 'MODERATE' ? 'warning' : 'normal'}`}>
                  {spatialResult.multiSensorAgreementLevel}
                </span>
              </div>

              <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.45, background: '#f8fafc', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                {spatialResult.explanation}
              </div>
            </div>
          </div>

          {/* Model Transparency Box */}
          <div className="card-industrial" style={{ padding: '14px', background: '#f8fafc' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '4px' }}>
              Model Specification & Transparency
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
              <div><strong>Architecture:</strong> Explainable Multi-Criteria Heuristic Evaluator</div>
              <div><strong>Baseline Window:</strong> Rolling 30 intervals</div>
              <div><strong>Kinematic Bounds:</strong> Empirical subsidence angle of draw (25°-35°)</div>
              <div><strong>Status:</strong> Synthetic simulation — model requires physical field calibration.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
