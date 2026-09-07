import React from 'react';
import { useSimulation } from '../../state/simulationContext';
import { Radio, Cpu, Cloud, CloudOff, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';

export const GlobalHeader: React.FC = () => {
  const {
    riskBand,
    cloudStatus,
    bufferedEventsCount,
    toggleCloudConnection,
    simClockSec,
    currentScenario
  } = useSimulation();

  const formatClock = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `14:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      height: '66px',
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      flexShrink: 0,
      zIndex: 50
    }}>
      {/* Brand & Technical Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img
          src="/logo-emblem.png"
          alt="BHUSTHIRA Logo"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '8px',
            objectFit: 'contain',
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            padding: '3px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}
        />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: '#09332c' }}>
              BHUSTHIRA
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              background: '#09332c',
              color: '#ffffff',
              letterSpacing: '0.04em'
            }}>
              SIH26025
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#475569', fontWeight: 600, margin: '2px 0 0 0', lineHeight: 1 }} title="Real-Time Mine Subsidence Intelligence & Early Warning System">
            Real-Time Mine Subsidence Intelligence & Early Warning System
          </p>
        </div>
      </div>

      {/* Center Operational Clock & Scenario */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        background: '#f8fafc',
        padding: '4px 14px',
        borderRadius: '6px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: '#94a3b8' }}>CLOCK:</span>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatClock(simClockSec)}</span>
        </div>
        <div style={{ height: '14px', width: '1px', background: '#cbd5e1' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
          <span style={{ color: '#94a3b8' }}>SCENARIO:</span>
          <span style={{ fontWeight: 600, color: '#334155' }}>
            {currentScenario.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Right Operational Status Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Mandatory Non-Neon Simulation Mode Tag */}
        <div className="sim-tag" title="Synthetic sensor telemetry — does not represent actual mine data">
          <Radio size={12} style={{ marginRight: '4px', color: '#d97706' }} />
          SIMULATION MODE
        </div>

        {/* Edge-01 Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: '#334155',
          background: '#f8fafc',
          padding: '3px 8px',
          borderRadius: '4px',
          border: '1px solid #e2e8f0'
        }}>
          <Cpu size={13} color="#0284c7" />
          <span>EDGE-01: <strong style={{ color: '#16a34a' }}>ACTIVE</strong></span>
        </div>

        {/* Cloud Link State with Toggle */}
        <button
          onClick={toggleCloudConnection}
          className="btn-engineering"
          style={{ padding: '3px 8px', fontSize: '11px' }}
          title={cloudStatus === 'CONNECTED' ? 'Click to simulate Cloud Outage' : 'Click to restore Cloud Link'}
        >
          {cloudStatus === 'CONNECTED' ? (
            <>
              <Cloud size={13} color="#16a34a" />
              <span>CLOUD: SYNCED</span>
            </>
          ) : cloudStatus === 'SYNCHRONIZING' ? (
            <>
              <RefreshCw size={13} className="spin" color="#d97706" />
              <span>SYNCING...</span>
            </>
          ) : (
            <>
              <CloudOff size={13} color="#dc2626" />
              <span style={{ color: '#dc2626', fontWeight: 600 }}>CLOUD: OFFLINE ({bufferedEventsCount} BUFFERED)</span>
            </>
          )}
        </button>

        {/* Overall System Health Status */}
        <div className={`badge-status ${riskBand.toLowerCase()}`}>
          {riskBand === 'NORMAL' ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
          <span>SYSTEM {riskBand === 'CRITICAL' ? 'ALERT' : riskBand}</span>
        </div>
      </div>
    </header>
  );
};
