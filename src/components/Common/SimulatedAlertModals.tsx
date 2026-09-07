import React from 'react';
import { useSimulation } from '../../state/simulationContext';
import { X, Mail, ShieldAlert } from 'lucide-react';

export const SimulatedAlertModals: React.FC = () => {
  const { activeModal, setActiveModal, riskResult, consensusResult, spatialResult } = useSimulation();

  if (activeModal !== 'MOBILE_SMS' && activeModal !== 'EMAIL_ALERT') return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {activeModal === 'MOBILE_SMS' && (
        <div style={{
          width: '380px',
          backgroundColor: '#1e293b',
          borderRadius: '24px',
          padding: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '4px solid #334155'
        }}>
          {/* Phone Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '11px', marginBottom: '16px', padding: '0 8px' }}>
            <span>BHUSTHIRA-SMS GATEWAY</span>
            <button
              onClick={() => setActiveModal('NONE')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* SMS Bubble */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', color: '#0f172a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <ShieldAlert size={16} color="#dc2626" />
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626', letterSpacing: '0.05em' }}>
                BHUSTHIRA EARLY WARNING
              </span>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
              DEFORMATION RISK: {riskResult.riskBand} ({riskResult.riskScore}/100)
            </div>

            <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4', marginBottom: '10px' }}>
              <strong>Zone:</strong> Panel B (Surface Sector 03)<br />
              <strong>Confidence:</strong> {consensusResult.confidence} ({consensusResult.score}/100)<br />
              <strong>Evidence:</strong> {spatialResult.neighborAgreementRatio} correlated nodes show tilt acceleration & extensometer displacement agreement.<br />
              <strong>Action:</strong> Shift In-Charge verification recommended immediately per SOP.
            </div>

            <div style={{ fontSize: '10px', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
              BHUSTHIRA EDGE-01 • Automated Dispatch Protocol
            </div>
          </div>

          <div style={{
            marginTop: '14px',
            backgroundColor: '#0f172a',
            padding: '8px',
            borderRadius: '6px',
            textAlign: 'center',
            fontSize: '11px',
            color: '#cbd5e1',
            border: '1px solid #334155'
          }}>
            Simulation only — no real cellular SMS dispatched.
          </div>
        </div>
      )}

      {activeModal === 'EMAIL_ALERT' && (
        <div style={{
          width: '560px',
          maxWidth: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden'
        }}>
          {/* Email Client Header */}
          <div style={{
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} color="#0284c7" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                Simulated Email Dispatch: Shift In-Charge Alert
              </span>
            </div>
            <button
              onClick={() => setActiveModal('NONE')}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Email Content */}
          <div style={{ padding: '20px', fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', fontSize: '12px' }}>
              <div><strong>From:</strong> bhusthira-edge01@mine-safety.internal</div>
              <div><strong>To:</strong> shift.supervisor@coalfields.in, dgms.monitoring@gov.in</div>
              <div><strong>Subject:</strong> [URGENT-EARLY-WARNING] Subsidence Consensus Alert: Panel B (Risk: {riskResult.riskScore}/100)</div>
            </div>

            <div style={{ lineHeight: '1.5' }}>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Attention Shift Supervisor & Mine Safety Officer,</strong>
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                The automated BHUSTHIRA intelligence pipeline at Gateway EDGE-01 has detected statistically significant 
                strata deformation exceeding operational safety bands in <strong>Panel B (Seam XI/XII Longwall Overburden)</strong>.
              </p>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '4px', border: '1px solid #e2e8f0', margin: '8px 0' }}>
                <div>• <strong>Current Risk Score:</strong> {riskResult.riskScore} / 100 ({riskResult.riskBand})</div>
                <div>• <strong>Consensus Agreement:</strong> {consensusResult.score} / 100 ({consensusResult.confidence})</div>
                <div>• <strong>Primary Anomaly Cluster:</strong> Nodes N02, N03, N04</div>
                <div>• <strong>Physical Channels:</strong> Inclinometer tilt rate increase + extensometer displacement acceleration</div>
              </div>
              <p style={{ margin: '8px 0 0 0' }}>
                Please review the real-time Command Center telemetry and conduct visual and mechanical verification of the surface perimeter.
              </p>
            </div>

            {/* Disclaimer */}
            <div style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '4px',
              padding: '10px',
              fontSize: '11px',
              color: '#92400e'
            }}>
              <strong>Notice:</strong> This is a software demonstration simulation of the automated dispatch service. No external network request was sent.
            </div>
          </div>

          {/* Footer */}
          <div style={{
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button
              className="btn btn-secondary"
              onClick={() => setActiveModal('NONE')}
              style={{ fontSize: '12px' }}
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
