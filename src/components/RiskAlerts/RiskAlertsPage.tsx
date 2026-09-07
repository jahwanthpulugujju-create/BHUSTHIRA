import React from 'react';
import { useSimulation } from '../../state/simulationContext';
import { AlertTriangle, ShieldCheck, Smartphone, Mail, FileText } from 'lucide-react';

export const RiskAlertsPage: React.FC = () => {
  const {
    riskScore,
    riskBreakdown,
    activeAlert,
    alertHistory,
    setActiveModal
  } = useSimulation();

  const breakdownItems = [
    { label: 'Cumulative Displacement (mm)', value: riskBreakdown.displacement, color: '#dc2626' },
    { label: 'Spatial Neighborhood Correlation', value: riskBreakdown.spatialCorrelation, color: '#ea580c' },
    { label: 'Surface Inclination / Tilt (°)', value: riskBreakdown.tilt, color: '#d97706' },
    { label: 'Acoustic Crack Emissions', value: riskBreakdown.crack, color: '#7c3aed' },
    { label: 'Micro-Seismic Vibration (g)', value: riskBreakdown.vibration, color: '#0284c7' },
    { label: 'Temporal Velocity Acceleration', value: riskBreakdown.temporalAcceleration, color: '#0f172a' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header Bar */}
      <div className="card-industrial" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            BHUSTHIRA Risk Engine
          </h2>
          <p style={{ fontSize: '11px', color: '#64748b' }}>
            Dynamic kinematic feature contributions, multi-tier risk classification, and automated control-room dispatch triggers.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setActiveModal('INCIDENT_REPORT')}
            className="btn-engineering primary"
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <FileText size={13} />
            <span>EXPORT INCIDENT REPORT</span>
          </button>
        </div>
      </div>

      {/* Top Split: Risk Contribution Bars vs Active Alert Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
        {/* Risk Contribution Horizontal Bars */}
        <div className="card-industrial" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              Deformation Kinematic Feature Contributions
            </span>
            <span className="font-mono" style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              Risk: {riskScore} / 100
            </span>
          </div>

          <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '14px' }}>
            Relative contribution of each physical telemetry metric to the current aggregate risk index.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {breakdownItems.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{item.label}</span>
                  <span className="font-mono" style={{ fontWeight: 700, color: item.color }}>{item.value}%</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${item.value}%`,
                      background: item.color,
                      borderRadius: '4px',
                      transition: 'width 0.2s ease'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '14px', fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
            DEMONSTRATION RISK BANDS: 0-30 NORMAL • 31-50 WATCH • 51-70 WARNING • 71-100 CRITICAL
          </div>
        </div>

        {/* Active Alert & Notification Simulation Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeAlert ? (
            <div className="card-industrial" style={{
              padding: '16px',
              border: activeAlert.severity === 'CRITICAL' ? '1.5px solid #dc2626' : '1.5px solid #ea580c',
              background: activeAlert.severity === 'CRITICAL' ? '#fef2f2' : '#fff7ed'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={16} color={activeAlert.severity === 'CRITICAL' ? '#dc2626' : '#ea580c'} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                    {activeAlert.severity} ALERT ACTIVE
                  </span>
                </div>
                <span className={`badge-status ${activeAlert.severity.toLowerCase()}`}>
                  {activeAlert.confidence} CONFIDENCE
                </span>
              </div>

              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                Zone: <strong>{activeAlert.zone}</strong> • Logged: {activeAlert.timestamp}
              </div>

              <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.45, marginBottom: '12px' }}>
                {activeAlert.primaryEvidence}
              </p>

              <div style={{ background: '#ffffff', padding: '10px', borderRadius: '4px', border: '1px solid #fed7aa', marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>
                  Action Requirement:
                </div>
                <p style={{ fontSize: '11px', color: '#0f172a', fontWeight: 600, marginTop: '2px' }}>
                  {activeAlert.recommendedAction}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setActiveModal('MOBILE_SMS')}
                  className="btn-engineering"
                  style={{ flex: 1 }}
                >
                  <Smartphone size={13} />
                  <span>SIMULATE SMS</span>
                </button>
                <button
                  onClick={() => setActiveModal('EMAIL_ALERT')}
                  className="btn-engineering"
                  style={{ flex: 1 }}
                >
                  <Mail size={13} />
                  <span>SIMULATE EMAIL</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="card-industrial" style={{ padding: '24px', textAlign: 'center', background: '#f8fafc' }}>
              <ShieldCheck size={28} color="#16a34a" style={{ margin: '0 auto 8px auto' }} />
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                NO ACTIVE DEFORMATION INCIDENTS
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                All monitored simulation zones are currently within baseline geotechnical parameters.
              </p>
            </div>
          )}

          {/* Quick Simulation Trigger Box */}
          <div className="card-industrial" style={{ padding: '12px 14px', background: '#ffffff' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
              Alert Dispatch Channels
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
              <div>• <strong>Control-Room Relay:</strong> Instant SCADA screen flash & audible buzzer (Simulated)</div>
              <div>• <strong>SMS Broadcast:</strong> DGMS-certified mobile blast to Shift Under-Manager (Simulated)</div>
              <div>• <strong>Geotechnical Dossier:</strong> Automated email dispatch to strata control department</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert History Table */}
      <div className="card-industrial" style={{ padding: '14px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '10px' }}>
          Historical Incident & Warning Audit Log
        </div>

        <table className="table-engineering">
          <thead>
            <tr>
              <th>Time</th>
              <th>Monitored Zone</th>
              <th>Severity</th>
              <th>Confidence</th>
              <th>Primary Evidence</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {alertHistory.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>
                  No historical warning escalations logged in this simulation session.
                </td>
              </tr>
            ) : (
              alertHistory.map((alt, idx) => (
                <tr key={idx}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{alt.timestamp}</td>
                  <td style={{ fontWeight: 600 }}>{alt.zone}</td>
                  <td>
                    <span className={`badge-status ${alt.severity.toLowerCase()}`}>
                      {alt.severity}
                    </span>
                  </td>
                  <td>{alt.confidence}</td>
                  <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {alt.primaryEvidence}
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: alt.status === 'ACTIVE' ? '#dc2626' : '#16a34a' }}>
                      {alt.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
