import React, { useState, useMemo } from 'react';
import { useSimulation } from '../../state/simulationContext';
import { History, FileText, Play } from 'lucide-react';
import { getScenarioStateAtTime } from '../../simulation/scenarioEngine';
import { INITIAL_NODES, INITIAL_PANELS, INITIAL_LINKS } from '../../simulation/mineModel';
import { formatSimulationTime, formatReplayTime } from '../../utils/timeFormatters';
import { calculateNodeAnomaly } from '../../intelligence/anomalyDetection';
import { analyzeSpatialCorrelation } from '../../intelligence/spatialCorrelation';
import { evaluateDeformationConsensus } from '../../intelligence/consensusEngine';
import { evaluateMineRisk } from '../../intelligence/riskEngine';

interface ReplayEventMarker {
  sec: number;
  label: string;
  eventType: string;
  expectedBand: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';
  description: string;
}

const KEY_INCIDENT_MARKERS: ReplayEventMarker[] = [
  { sec: 0, label: 'Baseline', eventType: 'SYSTEM_READY', expectedBand: 'NORMAL', description: 'System baseline equilibrium established. 6 virtual sensors calibrated.' },
  { sec: 18, label: 'Early Anomaly', eventType: 'NODE_ANOMALY', expectedBand: 'NORMAL', description: 'N03 registers subtle localized tilt and displacement drift in Panel B.' },
  { sec: 32, label: 'Spatial Cluster', eventType: 'SPATIAL_CORRELATION', expectedBand: 'WATCH', description: 'Adjacent nodes N02 and N04 corroborate deformation vectors across Sector 03.' },
  { sec: 48, label: 'Multi-Sensor Warning', eventType: 'WARNING', expectedBand: 'WARNING', description: 'Tilt, displacement, and micro-vibration cross joint consensus threshold. Warning declared.' },
  { sec: 62, label: 'Critical Subsidence', eventType: 'CRITICAL', expectedBand: 'CRITICAL', description: 'Convergence rate accelerates. Crack acoustic signal verified. Escalate for immediate inspection.' },
  { sec: 78, label: 'Cloud Severed', eventType: 'CLOUD_OFFLINE', expectedBand: 'CRITICAL', description: 'Backhaul fiber severed. Edge-01 islanding activates; local buffer captures incident events.' },
  { sec: 92, label: 'Node Failure', eventType: 'NODE_FAILURE', expectedBand: 'CRITICAL', description: 'Node N04 fails; mesh network self-heals by routing telemetry through alternate N03 link.' },
  { sec: 108, label: 'Cloud Restored', eventType: 'CLOUD_RESTORED', expectedBand: 'WATCH', description: 'Cloud backhaul restored. Local edge buffer synchronizes 23 historical events.' },
  { sec: 125, label: 'Stabilization', eventType: 'INCIDENT_RESOLVED', expectedBand: 'NORMAL', description: 'Kinetic energy dissipates. Displacement velocity returns to post-caving baseline equilibrium.' }
];

export const IncidentReplayPage: React.FC = () => {
  const { setActiveModal, jumpToSimSecond } = useSimulation();
  const [replaySecond, setReplaySecond] = useState<number>(62); // Default to Critical frame

  // Deterministically reconstruct complete system state at selected replaySecond
  const reconstructedState = useMemo(() => {
    return getScenarioStateAtTime(
      'GRADUAL_SUBSIDENCE',
      replaySecond,
      INITIAL_NODES,
      INITIAL_PANELS,
      INITIAL_LINKS
    );
  }, [replaySecond]);

  // Run intelligence pipeline on reconstructed state for exact fidelity
  const evaluatedReplay = useMemo(() => {
    const evaluatedNodes: Record<string, any> = {};
    Object.keys(reconstructedState.nodes).forEach(id => {
      const n = reconstructedState.nodes[id];
      const anomaly = calculateNodeAnomaly(n);
      evaluatedNodes[id] = {
        ...n,
        anomalyScore: anomaly.score,
        rateOfChangeTilt: anomaly.rateOfChangeTilt,
        rateOfChangeDisp: anomaly.rateOfChangeDisp,
        deformationSignal: anomaly.score > 0.75 ? 'CRITICAL' : anomaly.score > 0.4 ? 'HIGH' : anomaly.score > 0.2 ? 'ELEVATED' : 'NORMAL'
      };
    });

    const spatial = analyzeSpatialCorrelation(evaluatedNodes, 'Panel B');
    const consensus = evaluateDeformationConsensus(evaluatedNodes, spatial, reconstructedState.networkHealth);
    const risk = evaluateMineRisk(replaySecond, evaluatedNodes, consensus, spatial);

    return { evaluatedNodes, spatial, consensus, risk };
  }, [reconstructedState, replaySecond]);

  const n03 = reconstructedState.nodes['N03'] || INITIAL_NODES['N03'];

  const currentMarker = KEY_INCIDENT_MARKERS.reduce((prev, curr) => {
    return Math.abs(curr.sec - replaySecond) < Math.abs(prev.sec - replaySecond) ? curr : prev;
  }, KEY_INCIDENT_MARKERS[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header Bar */}
      <div className="card-industrial" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            BHUSTHIRA Incident Replay & State Reconstruction
          </h2>
          <p style={{ fontSize: '11px', color: '#64748b', margin: '3px 0 0 0' }}>
            Deterministic historical timeline scrubbing powered by <code>getScenarioStateAtTime</code>. Reconstructs identical kinematics, risk, and network topologies.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="sim-tag">
            INCIDENT ID: SIM-INC-2026-0042
          </span>
          <button
            onClick={() => setActiveModal('INCIDENT_REPORT')}
            className="btn-engineering primary"
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <FileText size={13} />
            <span>EXPORT REPLAY AUDIT</span>
          </button>
        </div>
      </div>

      {/* Interactive Timeline Scrubber Bar */}
      <div className="card-industrial" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={16} color="#0f172a" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              Deterministic Timeline Scrubber
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              (Drag slider or click milestones below)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              color: '#0f172a',
              background: '#f1f5f9',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              REPLAY: {formatSimulationTime(replaySecond)}
            </span>
            <span className={`badge-status ${evaluatedReplay.risk.riskBand.toLowerCase()}`}>
              {evaluatedReplay.risk.riskBand}
            </span>
            <button
              onClick={() => jumpToSimSecond(replaySecond)}
              className="btn-engineering"
              style={{ fontSize: '10px', padding: '3px 8px' }}
              title="Synchronize Command Center simulation engine to this exact replay time"
            >
              <Play size={11} />
              <span>SYNC LIVE CC</span>
            </button>
          </div>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min={0}
          max={125}
          value={replaySecond}
          onChange={(e) => setReplaySecond(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer', height: '6px', accentColor: '#0284c7' }}
        />

        {/* Keyframe Step Markers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${KEY_INCIDENT_MARKERS.length}, 1fr)`,
          gap: '4px',
          marginTop: '12px'
        }}>
          {KEY_INCIDENT_MARKERS.map((marker) => {
            const isSelected = Math.abs(marker.sec - replaySecond) <= 5;
            return (
              <button
                key={marker.sec}
                onClick={() => setReplaySecond(marker.sec)}
                style={{
                  border: '1px solid',
                  borderColor: isSelected ? '#0284c7' : '#e2e8f0',
                  background: isSelected ? '#0f172a' : '#f8fafc',
                  color: isSelected ? '#ffffff' : '#334155',
                  padding: '6px 4px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease'
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {formatReplayTime(marker.sec)}
                </div>
                <div style={{
                  fontSize: '9px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '2px',
                  color: isSelected ? '#93c5fd' : '#64748b'
                }}>
                  {marker.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reconstruction Detail Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
        {/* State Snapshot at Selected Instant */}
        <div className="card-industrial" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
              Reconstructed Telemetry State at {formatSimulationTime(replaySecond)}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
              Cloud: {reconstructedState.cloudStatus} • Health: {reconstructedState.networkHealth}%
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>REPLAY RISK SCORE</div>
              <div style={{
                fontSize: '22px',
                fontWeight: 800,
                color: evaluatedReplay.risk.riskScore > 75 ? '#dc2626' : evaluatedReplay.risk.riskScore > 50 ? '#ea580c' : '#0f172a'
              }}>
                {evaluatedReplay.risk.riskScore} <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>/ 100</span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>CONSENSUS INDEX</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#0284c7' }}>
                {evaluatedReplay.consensus.score} <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>({evaluatedReplay.consensus.confidence})</span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>CENTROID DISPLACEMENT (N03)</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                {n03.displacement.toFixed(2)} mm
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>CENTROID INCLINATION (N03)</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                {n03.tilt.toFixed(2)}°
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
              Active Milestones & Evidence at T+{replaySecond}s
            </div>
            <div style={{
              fontSize: '12px',
              color: '#334155',
              lineHeight: 1.5,
              background: '#f8fafc',
              padding: '10px 12px',
              borderRadius: '4px',
              border: '1px solid #e2e8f0'
            }}>
              <strong>{currentMarker.label} [{currentMarker.eventType}]:</strong> {currentMarker.description}
            </div>
          </div>
        </div>

        {/* Incident Retrospective Dossier (Req 150) */}
        <div className="card-industrial" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
            Incident Retrospective Summary
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Incident Identifier:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>SIM-INC-2026-0042</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Scenario Type:</span>
              <strong>Gradual Subsidence & Recovery</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Peak Risk Reached:</span>
              <strong style={{ color: '#dc2626' }}>82 / 100 (CRITICAL)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Peak Consensus Score:</span>
              <strong>0.84 (HIGH CONFIDENCE)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Total Duration:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>T+02:05 (125 seconds)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Affected Mine Zone:</span>
              <strong>Panel B / Sector 03 (Longwall Goaf)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Participating Sensor Nodes:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>N02, N03, N04, N05</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Primary Evidence:</span>
              <span>Spatial + Temporal + Multi-Sensor</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Final Status:</span>
              <span className="badge-status normal">RESOLVED & STABILIZED</span>
            </div>
          </div>

          <div style={{ marginTop: 'auto', padding: '8px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '10px', color: '#64748b' }}>
            <strong>Deterministic Guarantee:</strong> Reconstructed directly from <code>getScenarioStateAtTime()</code>. Matches live simulation bit-for-bit.
          </div>
        </div>
      </div>
    </div>
  );
};
