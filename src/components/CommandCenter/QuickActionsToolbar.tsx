import React from 'react';
import { useSimulation } from '../../state/simulationContext';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Sliders,
  AlertTriangle,
  Plus,
  FileText,
  Smartphone,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Keyboard,
  Tv
} from 'lucide-react';
import type { ScenarioType } from '../../types';

export const QuickActionsToolbar: React.FC = () => {
  const {
    isRunning,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    simSpeed,
    setSimSpeed,
    currentScenario,
    changeScenario,
    skipToWarning,
    skipToCritical,
    startGuidedDemo,
    nextDemoPhase,
    prevDemoPhase,
    exitDemoMode,
    isDemoMode,
    demoPhaseIndex,
    demoTotalPhases,
    demoPhaseName,
    isPresentationMode,
    togglePresentationMode,
    setActiveModal
  } = useSimulation();

  const scenarios: { id: ScenarioType; label: string }[] = [
    { id: 'NORMAL', label: '1. Normal Baseline' },
    { id: 'GRADUAL_SUBSIDENCE', label: '2. Gradual Subsidence (Main 9-Phase)' },
    { id: 'RAPID_SUBSIDENCE', label: '3. Rapid Subsidence' },
    { id: 'SENSOR_FAULT', label: '4. Sensor Fault Discriminator' },
    { id: 'NODE_FAILURE', label: '5. Node Failure & Reroute' },
    { id: 'NETWORK_DEGRADED', label: '6. Network Degraded' },
    { id: 'MULTI_SENSOR_ANOMALY', label: '7. Multi-Sensor Anomaly' },
    { id: 'CLOUD_OFFLINE', label: '8. Cloud Disconnect & Buffer' },
    { id: 'RECOVERY', label: '9. Stabilization Recovery' }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginBottom: '14px'
    }}>
      {/* 1. Guided Demo Active Header (When Demo Mode is Engaged) */}
      {isDemoMode && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0f172a',
          color: '#ffffff',
          borderRadius: '6px',
          padding: '8px 14px',
          borderLeft: '4px solid #0284c7',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              background: '#0284c7',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '3px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              LIVE GUIDED DEMO
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>
              Phase {demoPhaseIndex} of {demoTotalPhases}:
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
              {demoPhaseName}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={isRunning ? pauseSimulation : startSimulation}
              className="btn-engineering"
              style={{
                background: '#1e293b',
                color: '#ffffff',
                borderColor: '#334155',
                padding: '4px 10px',
                fontSize: '11px'
              }}
            >
              {isRunning ? <Pause size={13} /> : <Play size={13} />}
              <span>{isRunning ? 'PAUSE' : 'RESUME'}</span>
            </button>

            <button
              onClick={prevDemoPhase}
              disabled={demoPhaseIndex <= 1}
              className="btn-engineering"
              style={{
                background: '#1e293b',
                color: demoPhaseIndex <= 1 ? '#64748b' : '#ffffff',
                borderColor: '#334155',
                padding: '4px 8px',
                fontSize: '11px'
              }}
              title="Return to Previous Demo Phase"
            >
              <ChevronLeft size={13} />
              <span>PREV</span>
            </button>

            <button
              onClick={nextDemoPhase}
              disabled={demoPhaseIndex >= demoTotalPhases}
              className="btn-engineering primary"
              style={{ padding: '4px 10px', fontSize: '11px' }}
              title="Advance to Next Judging Phase"
            >
              <span>NEXT PHASE</span>
              <ChevronRight size={13} />
            </button>

            <button
              onClick={exitDemoMode}
              className="btn-engineering"
              style={{
                background: 'transparent',
                color: '#94a3b8',
                borderColor: '#334155',
                padding: '4px 8px',
                fontSize: '11px'
              }}
              title="Exit Guided Sequence & Return to Manual Controls"
            >
              <X size={13} />
              <span>EXIT</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Engineering Operational Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        padding: '8px 12px',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {/* Left: Simulation Engine Execution Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={isRunning ? pauseSimulation : startSimulation}
            className={`btn-engineering ${!isRunning ? 'primary' : ''}`}
            style={{
              minWidth: '95px',
              backgroundColor: !isRunning ? '#0284c7' : undefined,
              borderColor: !isRunning ? '#0284c7' : undefined,
              color: !isRunning ? '#ffffff' : undefined
            }}
            title={isRunning ? "Halt simulation tick progression" : "Begin deterministic simulation clock"}
          >
            {isRunning ? (
              <>
                <Pause size={14} />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play size={14} />
                <span>START</span>
              </>
            )}
          </button>

          <button
            onClick={() => resetSimulation(true)}
            className="btn-engineering"
            title="Reset simulation clock to T+00:00, restore nodes, and reset network topology"
          >
            <RotateCcw size={14} />
            <span>RESET</span>
          </button>

          {!isDemoMode && (
            <button
              onClick={startGuidedDemo}
              className="btn-engineering"
              style={{
                background: '#f8fafc',
                color: '#0f172a',
                borderColor: '#cbd5e1',
                fontWeight: 700
              }}
              title="Launch controlled 9-phase SIH judging sequence (Sense → Correlate → Warn → Recover)"
            >
              <Sparkles size={13} color="#0284c7" />
              <span>START GUIDED DEMO</span>
            </button>
          )}

          {/* Speed Multipliers: 0.5x, 1x, 2x, 5x, 10x */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            background: '#f1f5f9',
            padding: '2px',
            borderRadius: '4px',
            border: '1px solid #e2e8f0',
            marginLeft: '4px'
          }}>
            {[0.5, 1, 2, 5, 10].map(s => (
              <button
                key={s}
                onClick={() => setSimSpeed(s)}
                style={{
                  border: 'none',
                  background: simSpeed === s ? '#0f172a' : 'transparent',
                  color: simSpeed === s ? '#ffffff' : '#64748b',
                  padding: '3px 6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
                title={`Run simulation ticks at ${s}× real time (Real IST clock remains unaffected)`}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>

        {/* Center: Scenario Selection & Jump Shortcuts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Scenario:
          </span>
          <select
            value={currentScenario}
            onChange={(e) => changeScenario(e.target.value as ScenarioType)}
            disabled={isDemoMode}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              fontWeight: 600,
              color: '#0f172a',
              padding: '5px 10px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              background: isDemoMode ? '#f1f5f9' : '#ffffff',
              outline: 'none',
              cursor: isDemoMode ? 'not-allowed' : 'pointer'
            }}
          >
            {scenarios.map(sc => (
              <option key={sc.id} value={sc.id}>
                {sc.label}
              </option>
            ))}
          </select>

          {/* Deterministic State Reconstruction Fast-Forwards */}
          <button
            onClick={skipToWarning}
            className="btn-engineering warning"
            style={{ fontSize: '11px', padding: '5px 9px' }}
            title="Reconstruct historical state directly to Warning threshold (T+46)"
          >
            <FastForward size={13} />
            <span>SKIP TO WARNING</span>
          </button>

          <button
            onClick={skipToCritical}
            className="btn-engineering danger"
            style={{ fontSize: '11px', padding: '5px 9px' }}
            title="Reconstruct historical state directly to Critical threshold (T+61)"
          >
            <AlertTriangle size={13} />
            <span>SKIP TO CRITICAL</span>
          </button>
        </div>

        {/* Right: Auxiliary Presentation & Engineering Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={togglePresentationMode}
            className={`btn-engineering ${isPresentationMode ? 'primary' : ''}`}
            style={{ fontSize: '11px', padding: '5px 8px' }}
            title="Toggle Clean Presentation Mode to minimize secondary controls during judging"
          >
            <Tv size={13} />
            <span>{isPresentationMode ? 'FULL UI' : 'PRESENTATION'}</span>
          </button>

          <button
            onClick={() => setActiveModal('SHORTCUTS')}
            className="btn-engineering"
            style={{ fontSize: '11px', padding: '5px 8px' }}
            title="View keyboard hotkeys (Space, R, D, 1, 2, 3, W, C, N, O, P)"
          >
            <Keyboard size={13} />
            <span>KEYS</span>
          </button>

          {!isPresentationMode && (
            <>
              <button
                onClick={() => setActiveModal('ADD_NODE')}
                className="btn-engineering"
                style={{ fontSize: '11px', padding: '5px 8px' }}
                title="Add a new virtual sensor node to test network scale"
              >
                <Plus size={13} />
                <span>ADD NODE</span>
              </button>

              <button
                onClick={() => setActiveModal('INCIDENT_REPORT')}
                className="btn-engineering"
                style={{ fontSize: '11px', padding: '5px 8px' }}
                title="Generate simulation incident audit report"
              >
                <FileText size={13} />
                <span>REPORT</span>
              </button>

              <button
                onClick={() => setActiveModal('MOBILE_SMS')}
                className="btn-engineering"
                style={{ fontSize: '11px', padding: '5px 8px' }}
                title="Simulate SMS dispatch alert"
              >
                <Smartphone size={13} />
                <span>SMS</span>
              </button>

              <button
                onClick={() => setActiveModal('LIVE_TELEMETRY')}
                className="btn-engineering"
                style={{ fontSize: '11px', padding: '5px 8px' }}
                title="Inspect synthetic JSON telemetry feed"
              >
                <Sliders size={13} />
                <span>RAW DATA</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
