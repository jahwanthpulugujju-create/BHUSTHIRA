import React from 'react';
import { useSimulation } from '../../state/simulationContext';
import { Play, Pause, RotateCcw, FastForward, Sliders, AlertTriangle, Plus, FileText, Smartphone } from 'lucide-react';
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
    setActiveModal
  } = useSimulation();

  const scenarios: { id: ScenarioType; label: string }[] = [
    { id: 'NORMAL', label: '1. Normal Baseline' },
    { id: 'GRADUAL_SUBSIDENCE', label: '2. Gradual Subsidence (Main)' },
    { id: 'RAPID_SUBSIDENCE', label: '3. Rapid Subsidence' },
    { id: 'SENSOR_FAULT', label: '4. Sensor Fault Discriminator' },
    { id: 'NODE_FAILURE', label: '5. Node Failure & Reroute' },
    { id: 'NETWORK_DEGRADED', label: '6. Network Degraded' },
    { id: 'MULTI_SENSOR_ANOMALY', label: '7. Multi-Sensor Anomaly' },
    { id: 'CLOUD_OFFLINE', label: '8. Cloud Disconnect' },
    { id: 'RECOVERY', label: '9. Stabilization Recovery' },
    { id: 'FULL_DEMO', label: '★ Full Presentation Demo' }
  ];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      padding: '8px 12px',
      marginBottom: '14px',
      gap: '12px',
      flexWrap: 'wrap'
    }}>
      {/* Simulation Engine Execution Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={isRunning ? pauseSimulation : startSimulation}
          className={`btn-engineering ${isRunning ? 'primary' : ''}`}
          style={{ minWidth: '85px' }}
        >
          {isRunning ? (
            <>
              <Pause size={14} />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play size={14} />
              <span>RESUME</span>
            </>
          )}
        </button>

        <button
          onClick={resetSimulation}
          className="btn-engineering"
          title="Reset simulation clock, telemetry buffers, and network state"
        >
          <RotateCcw size={14} />
          <span>RESET</span>
        </button>

        {/* Speed Multipliers */}
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
          {[1, 2, 5, 10].map(s => (
            <button
              key={s}
              onClick={() => setSimSpeed(s)}
              style={{
                border: 'none',
                background: simSpeed === s ? '#0f172a' : 'transparent',
                color: simSpeed === s ? '#ffffff' : '#64748b',
                padding: '3px 7px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
          Scenario:
        </span>
        <select
          value={currentScenario}
          onChange={(e) => changeScenario(e.target.value as ScenarioType)}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            fontWeight: 600,
            color: '#0f172a',
            padding: '5px 10px',
            borderRadius: '4px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {scenarios.map(sc => (
            <option key={sc.id} value={sc.id}>
              {sc.label}
            </option>
          ))}
        </select>

        {/* Fast-Forward Shortcuts for Hackathon Presenters */}
        <button
          onClick={skipToWarning}
          className="btn-engineering warning"
          style={{ fontSize: '11px', padding: '5px 9px' }}
          title="Jump simulation clock directly to Warning state"
        >
          <FastForward size={13} />
          <span>SKIP TO WARNING</span>
        </button>

        <button
          onClick={skipToCritical}
          className="btn-engineering danger"
          style={{ fontSize: '11px', padding: '5px 9px' }}
          title="Jump simulation clock directly to Critical state"
        >
          <AlertTriangle size={13} />
          <span>SKIP TO CRITICAL</span>
        </button>
      </div>

      {/* Auxiliary Engineering Tools */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={() => setActiveModal('ADD_NODE')}
          className="btn-engineering"
          style={{ fontSize: '11px', padding: '5px 8px' }}
          title="Demonstrate scalability by placing a new sensor node into the network"
        >
          <Plus size={13} />
          <span>ADD NODE</span>
        </button>

        <button
          onClick={() => setActiveModal('INCIDENT_REPORT')}
          className="btn-engineering"
          style={{ fontSize: '11px', padding: '5px 8px' }}
          title="Generate exportable simulation incident report"
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
          title="Inspect live synthetic JSON telemetry"
        >
          <Sliders size={13} />
          <span>RAW TELEMETRY</span>
        </button>
      </div>
    </div>
  );
};
