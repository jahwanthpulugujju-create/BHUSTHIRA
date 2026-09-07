import React from 'react';
import { useSimulation } from '../../state/simulationContext';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { RISK_MODEL_CONFIG } from '../../intelligence/riskConfig';

export const DeformationIntelligencePage: React.FC = () => {
  const { consensusResult, spatialResult } = useSimulation();

  const pipelineStages = [
    {
      num: '01',
      title: 'Signal Processing',
      subtitle: 'Baseline & Filtering',
      details: 'Deterministic pseudo-noise filtering, rolling 30-tick baseline establishment, and kinematic range normalization.'
    },
    {
      num: '02',
      title: 'Anomaly Detection',
      subtitle: 'Deviation & Trend',
      details: 'Z-score deviation evaluation, tilt inclination rate, displacement rate of change, and transient spike rejection.'
    },
    {
      num: '03',
      title: 'Temporal Analysis',
      subtitle: 'Persistence & Acceleration',
      details: 'Separates transient seismic/mechanical shocks from sustained, progressive strata subsidence over time.'
    },
    {
      num: '04',
      title: 'Spatial Correlation',
      subtitle: 'Neighbor Agreement',
      details: 'Cluster validation across adjacent panels/sectors. Verifies whether neighboring nodes corroborate strata deformation.'
    },
    {
      num: '05',
      title: 'Multi-Sensor Concurrence',
      subtitle: 'Physical Orthogonality',
      details: 'Cross-verifies independent physical axes: Inclinometer tilt + Extensometer displacement + Geophone vibration.'
    },
    {
      num: '06',
      title: 'Consensus Engine',
      subtitle: 'Evidence Fusion (0–100)',
      details: 'Weighted Bayesian-inspired evidence fusion producing aggregate confidence score and fault discrimination.'
    },
    {
      num: '07',
      title: 'Risk Assessment',
      subtitle: '0–100 Risk Banding',
      details: 'Configurable prototype scoring model mapping deformation velocity and consensus into Normal, Watch, Warning, Critical.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header Bar */}
      <div className="card-industrial" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            BHUSTHIRA Deformation Intelligence Engine
          </h2>
          <p style={{ fontSize: '11px', color: '#64748b', margin: '3px 0 0 0' }}>
            Multi-stage evidence fusion pipeline transforming distributed physical telemetry into transparent, explainable early warning.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="sim-tag">
            PROTOTYPE INTELLIGENCE PIPELINE
          </span>
        </div>
      </div>

      {/* Core Architectural Differentiator (Req 99) */}
      <div className="card-industrial" style={{ padding: '16px', background: '#ffffff' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px' }}>
          Architectural Contrast: Naive Thresholds vs BHUSTHIRA Intelligence
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {/* Traditional Naive Model */}
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '12px 14px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', marginBottom: '6px' }}>
              Traditional Primitive Approach (High False Alarms)
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#7f1d1d',
              flexWrap: 'wrap',
              margin: '8px 0'
            }}>
              <span style={{ padding: '3px 6px', background: '#fee2e2', borderRadius: '3px' }}>Single Sensor</span>
              <ArrowRight size={12} />
              <span style={{ padding: '3px 6px', background: '#fee2e2', borderRadius: '3px' }}>Static Threshold</span>
              <ArrowRight size={12} />
              <span style={{ padding: '3px 6px', background: '#fca5a5', borderRadius: '3px', fontWeight: 700 }}>False Emergency Alert</span>
            </div>
            <p style={{ fontSize: '11px', color: '#7f1d1d', lineHeight: 1.4, margin: 0 }}>
              Prone to sensor fault false alarms, vibration noise triggering panic, and complete inability to distinguish local hardware failure from genuine geological subsidence.
            </p>
          </div>

          {/* BHUSTHIRA Multi-Tier Model */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            padding: '12px 14px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: '6px' }}>
              BHUSTHIRA Corroborative Intelligence (Zero Blind Alarms)
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: '#14532d',
              flexWrap: 'wrap',
              margin: '8px 0'
            }}>
              <span style={{ padding: '2px 5px', background: '#dcfce7', borderRadius: '3px' }}>Sensors</span>
              <ArrowRight size={10} />
              <span style={{ padding: '2px 5px', background: '#dcfce7', borderRadius: '3px' }}>Baseline</span>
              <ArrowRight size={10} />
              <span style={{ padding: '2px 5px', background: '#dcfce7', borderRadius: '3px' }}>Temporal</span>
              <ArrowRight size={10} />
              <span style={{ padding: '2px 5px', background: '#dcfce7', borderRadius: '3px' }}>Spatial</span>
              <ArrowRight size={10} />
              <span style={{ padding: '2px 5px', background: '#dcfce7', borderRadius: '3px' }}>Consensus</span>
              <ArrowRight size={10} />
              <span style={{ padding: '2px 5px', background: '#86efac', borderRadius: '3px', fontWeight: 700 }}>Explainable Warning</span>
            </div>
            <p style={{ fontSize: '11px', color: '#14532d', lineHeight: 1.4, margin: 0 }}>
              Hardware faults are isolated; genuine subsidence requires spatial correlation across neighboring nodes, multi-sensor agreement, and temporal persistence.
            </p>
          </div>
        </div>
      </div>

      {/* The 7-Stage Intelligence Pipeline (Req 48) */}
      <div className="card-industrial" style={{ padding: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px' }}>
          7-Stage Sequential Processing Pipeline
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '10px'
        }}>
          {pipelineStages.map((st) => (
            <div
              key={st.num}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="font-mono" style={{ fontSize: '12px', fontWeight: 800, color: '#0284c7' }}>
                  {st.num}
                </span>
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '1px 5px', borderRadius: '3px' }}>
                  OPERATIONAL
                </span>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                {st.title}
              </div>
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                {st.subtitle}
              </div>
              <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.4, margin: 0, marginTop: 'auto' }}>
                {st.details}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Consensus Evidence Breakdown & Spatial Agreement */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '14px' }}>
        {/* Consensus Engine Evidence Weight Allocation */}
        <div className="card-industrial" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              Consensus Engine Evidence Allocation
            </span>
            <span className="font-mono" style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              Consensus: {consensusResult.score} / 100
            </span>
          </div>

          <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px', lineHeight: 1.4 }}>
            Evidence contribution model for prototype decision support. If an isolated node spikes while neighbors remain stable, spatial evidence collapses to 0.
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

          {/* Prototype Risk Weights Disclosure */}
          <div style={{
            marginTop: '12px',
            padding: '10px',
            background: '#f8fafc',
            borderRadius: '4px',
            border: '1px solid #e2e8f0',
            fontSize: '11px',
            color: '#475569'
          }}>
            <div style={{ fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>
              Prototype Scoring Weights (Config-Driven):
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
              <span>Disp: {(RISK_MODEL_CONFIG.weights.displacement * 100).toFixed(0)}%</span>
              <span>Spatial: {(RISK_MODEL_CONFIG.weights.spatialCorrelation * 100).toFixed(0)}%</span>
              <span>Temporal: {(RISK_MODEL_CONFIG.weights.temporalPersistence * 100).toFixed(0)}%</span>
              <span>Tilt: {(RISK_MODEL_CONFIG.weights.tilt * 100).toFixed(0)}%</span>
              <span>Vib: {(RISK_MODEL_CONFIG.weights.vibration * 100).toFixed(0)}%</span>
              <span>Crack: {(RISK_MODEL_CONFIG.weights.crack * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Spatial Intelligence & Model Validation Status (Req 52) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Spatial Corroboration */}
          <div className="card-industrial" style={{ padding: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px' }}>
              Spatial Intelligence & Corroboration
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Neighbor Corroboration Ratio</div>
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

          {/* Model Validation Status Section (Req 52) */}
          <div className="card-industrial" style={{ padding: '14px', background: '#f8fafc' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#0f172a', marginBottom: '8px' }}>
              Model Validation Status
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Current Pipeline:</span>
                <strong style={{ color: '#0284c7' }}>Synthetic Simulation</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Field Calibration:</span>
                <strong style={{ color: '#d97706' }}>Pending Mine Survey Calibration</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: '#64748b' }}>Historical Ingestion:</span>
                <strong style={{ color: '#16a34a' }}>Telemetry Adapter Ready</strong>
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '10px', color: '#64748b', lineHeight: 1.35 }}>
              Notice: Prototype risk parameters are for demonstration only. Field deployment requires site-specific calibration against empirical subsidence profiles.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
