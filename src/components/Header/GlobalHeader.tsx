import React from 'react';
import { useSimulation } from '../../state/simulationContext';
import { useSystemClock } from '../../hooks/useSystemClock';
import { formatSimulationTime } from '../../utils/timeFormatters';
import { Radio, Cpu, Cloud, CloudOff, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';

export const GlobalHeader: React.FC = () => {
  const {
    riskBand,
    cloudStatus,
    bufferedEventsCount,
    toggleCloudConnection,
    simClockSec,
    currentScenario,
    isRunning
  } = useSimulation();

  const { istTime } = useSystemClock();

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      height: '62px',
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      flexShrink: 0,
      zIndex: 50,
      userSelect: 'none'
    }}>
      {/* 1. Left: Brand & Technical Identification */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src="/logo-emblem.png"
          alt="BHUSTHIRA Emblem"
          style={{
            width: '42px',
            height: '42px',
            objectFit: 'contain'
          }}
        />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.02em', color: '#09332c' }}>
              BHUSTHIRA
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '4px',
              background: '#09332c',
              color: '#ffffff',
              letterSpacing: '0.04em'
            }}>
              SIH26025
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, margin: '2px 0 0 0', lineHeight: 1 }} title="Real-Time Mine Subsidence Intelligence & Early Warning System">
            Real-Time Mine Intelligence & Early Warning
          </p>
        </div>
      </div>

      {/* 2. Center: Dual Clock Decoupling (LOCAL TIME vs SIM TIME vs SCENARIO) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        background: '#f8fafc',
        padding: '5px 16px',
        borderRadius: '6px',
        border: '1px solid #e2e8f0'
      }}>
        {/* Clock A: Real Independent System Clock (IST) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            LOCAL TIME:
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)' }} title="Real Indian Standard Time (Asia/Kolkata)">
            {istTime}
          </span>
        </div>

        <div style={{ height: '16px', width: '1px', background: '#cbd5e1' }} />

        {/* Clock B: Elapsed Simulation Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            SIM TIME:
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: isRunning ? '#09332c' : '#b45309', fontFamily: 'var(--font-mono)' }} title="Elapsed synthetic simulation time">
            {formatSimulationTime(simClockSec)} {!isRunning && <small style={{ fontSize: '10px', fontWeight: 600 }}>(PAUSED)</small>}
          </span>
        </div>

        <div style={{ height: '16px', width: '1px', background: '#cbd5e1' }} />

        {/* Current Active Scenario */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            SCENARIO:
          </span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
            {currentScenario.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* 3. Right: Edge-01, Cloud Islanding, System Band */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Synthetic Simulation Mode Tag */}
        <div
          className="sim-tag"
          title="Synthetic sensor telemetry — software-defined digital twin calibrated against baseline"
          style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Radio size={12} color="#d97706" />
          <span>SIMULATION MODE</span>
        </div>

        {/* On-Site Edge Node Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: '#334155',
          background: '#f8fafc',
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid #e2e8f0'
        }} title="On-site industrial edge gateway executing real-time spatial consensus and anomaly detection">
          <Cpu size={13} color="#0284c7" />
          <span>EDGE-01: <strong style={{ color: '#16a34a' }}>ACTIVE</strong></span>
        </div>

        {/* Cloud Link State with Toggle & Event Buffer Count */}
        <button
          onClick={toggleCloudConnection}
          className="btn-engineering"
          style={{
            padding: '4px 9px',
            fontSize: '11px',
            background: cloudStatus === 'DISCONNECTED' ? '#fef2f2' : '#ffffff',
            borderColor: cloudStatus === 'DISCONNECTED' ? '#fca5a5' : '#e2e8f0',
            cursor: 'pointer'
          }}
          title={cloudStatus === 'CONNECTED' ? 'Click to simulate Cloud Outage (Edge Islanding)' : 'Click to restore Cloud Uplink'}
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
              <span style={{ color: '#dc2626', fontWeight: 700 }}>CLOUD: OFFLINE ({bufferedEventsCount} BUFFERED)</span>
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
