import React from 'react';
import { useSimulation } from '../../state/simulationContext';
import { ShieldAlert, ShieldCheck, HelpCircle, ChevronRight } from 'lucide-react';

export const OperatorDecisionPanel: React.FC = () => {
  const {
    riskBand,
    consensusResult,
    spatialResult,
    riskResult,
    activeAlert,
    setActiveModal,
    simSpeed
  } = useSimulation();

  const isAlertActive = riskBand !== 'NORMAL';
  const intervalSec = Math.max(1, Math.round(1 / simSpeed));

  return (
    <div className="card-industrial" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#ffffff',
      border: isAlertActive
        ? riskBand === 'CRITICAL' ? '1.5px solid #dc2626' : '1.5px solid #ea580c'
        : '1px solid #e2e8f0',
      boxShadow: isAlertActive ? '0 4px 12px rgba(220, 38, 38, 0.08)' : '0 1px 3px rgba(0,0,0,0.03)'
    }}>
      {/* Decision Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e2e8f0',
        background: isAlertActive
          ? riskBand === 'CRITICAL' ? '#fef2f2' : '#fff7ed'
          : '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {riskBand === 'NORMAL' ? (
            <ShieldCheck size={18} color="#16a34a" />
          ) : (
            <ShieldAlert size={18} color={riskBand === 'CRITICAL' ? '#dc2626' : '#ea580c'} />
          )}
          <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a' }}>
            Operator Decision Support
          </span>
        </div>
        <span className={`badge-status ${riskBand.toLowerCase()}`}>
          {riskBand}
        </span>
      </div>

      {/* Main Decision Hierarchy */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
        {/* 1. Current Situation & Status */}
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '2px' }}>
            Current Strata Status
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: 700,
            color: riskBand === 'CRITICAL' ? '#dc2626' : riskBand === 'WARNING' ? '#ea580c' : riskBand === 'WATCH' ? '#d97706' : '#15803d'
          }}>
            {riskBand === 'CRITICAL' ? 'CRITICAL SUBSIDENCE ALERT' : riskBand === 'WARNING' ? 'DEFORMATION WARNING' : riskBand === 'WATCH' ? 'ELEVATED WATCH' : 'BASELINE EQUILIBRIUM'}
          </div>
        </div>

        {/* 2. Affected Geological Area */}
        <div style={{
          background: '#f8fafc',
          padding: '10px 12px',
          borderRadius: '6px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '2px' }}>
            Target Affected Zone
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
            {spatialResult.affectedPanel !== 'None' ? `${spatialResult.affectedPanel} / Longwall Goaf Crown` : 'Mine-wide Equilibrium (No active zone)'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Seam XI (High-Volatile Coking) • -240m Under-surface
          </div>
        </div>

        {/* 3. Decision Confidence & Consensus */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748b' }}>CONFIDENCE</div>
            <div style={{
              fontSize: '13px',
              fontWeight: 700,
              color: consensusResult.confidence === 'HIGH' ? '#b91c1c' : consensusResult.confidence === 'MODERATE' ? '#b45309' : '#15803d'
            }}>
              {consensusResult.confidence}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748b' }}>CONSENSUS</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              {consensusResult.score} / 100
            </div>
          </div>
        </div>

        {/* 4. Primary Corroborated Evidence */}
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '4px' }}>
            Primary Evidence Summary
          </div>
          <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.45 }}>
            {activeAlert ? activeAlert.primaryEvidence : consensusResult.summary}
          </p>
        </div>

        {/* 5. Recommended Operational Response */}
        <div style={{
          background: isAlertActive ? '#fffbeb' : '#f0fdf4',
          border: isAlertActive ? '1px solid #fef3c7' : '1px solid #bbf7d0',
          borderRadius: '6px',
          padding: '10px 12px'
        }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: isAlertActive ? '#b45309' : '#15803d',
            marginBottom: '3px'
          }}>
            Recommended Protocol
          </div>
          <p style={{ fontSize: '11px', color: '#0f172a', fontWeight: 500, lineHeight: 1.4 }}>
            {riskResult.recommendedResponse}
          </p>
        </div>

        {/* 6. Why Am I Seeing This Alert? Trigger Button */}
        <button
          onClick={() => setActiveModal('EVIDENCE')}
          className="btn-engineering primary"
          style={{ width: '100%', padding: '8px 12px', marginTop: 'auto' }}
        >
          <HelpCircle size={14} />
          <span>WHY AM I SEEING THIS ALERT?</span>
          <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
        </button>
      </div>

      {/* Footer Dispatch Telemetry Bar */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid #e2e8f0',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: '#64748b',
        fontFamily: 'var(--font-mono)'
      }}>
        <span>NEXT ENGINE CYCLE:</span>
        <strong style={{ color: '#0f172a' }}>{intervalSec}s</strong>
      </div>
    </div>
  );
};
