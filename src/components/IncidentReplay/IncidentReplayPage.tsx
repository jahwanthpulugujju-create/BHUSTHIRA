import React, { useState } from 'react';
import { useSimulation } from '../../state/simulationContext';
import { History, FileText } from 'lucide-react';

interface ReplayKeyframe {
  timeStr: string;
  sec: number;
  label: string;
  risk: number;
  band: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';
  consensus: number;
  n03Disp: number;
  n03Tilt: number;
  affected: string;
  evidence: string;
}

const REPLAY_KEYFRAMES: ReplayKeyframe[] = [
  {
    timeStr: '10:00:00',
    sec: 0,
    label: 'Baseline Equilibrium',
    risk: 18,
    band: 'NORMAL',
    consensus: 0.18,
    n03Disp: 0.65,
    n03Tilt: 0.25,
    affected: 'None (Stable)',
    evidence: 'All sensors operating within ±0.03° baseline deviation.'
  },
  {
    timeStr: '10:00:30',
    sec: 30,
    label: 'First Anomaly (N03 Drift)',
    risk: 28,
    band: 'NORMAL',
    consensus: 0.32,
    n03Disp: 1.85,
    n03Tilt: 0.62,
    affected: 'Panel B Centroid',
    evidence: 'N03 centroid registers 0.14°/min inclination trend. Single sensor variance.'
  },
  {
    timeStr: '10:01:00',
    sec: 60,
    label: 'Spatial Correlation Onset',
    risk: 42,
    band: 'WATCH',
    consensus: 0.54,
    n03Disp: 3.40,
    n03Tilt: 1.10,
    affected: 'Panel B West & East Flanks',
    evidence: 'Adjacent nodes N02 and N04 show concurrent displacement vectors. Spatial correlation: MODERATE.'
  },
  {
    timeStr: '10:01:30',
    sec: 90,
    label: 'Multi-Sensor Convergence',
    risk: 58,
    band: 'WARNING',
    consensus: 0.68,
    n03Disp: 5.60,
    n03Tilt: 1.55,
    affected: 'Panel B Goaf Crown',
    evidence: 'Tilt, displacement, and micro-vibration cross joint alert threshold. Warning declared.'
  },
  {
    timeStr: '10:02:00',
    sec: 120,
    label: 'Critical Subsidence & Crack Trigger',
    risk: 82,
    band: 'CRITICAL',
    consensus: 0.84,
    n03Disp: 9.40,
    n03Tilt: 2.20,
    affected: 'Panel B Extraction Face',
    evidence: 'Acoustic emission crack detection registered. Convergence acceleration >1.2mm/hr.'
  },
  {
    timeStr: '10:02:30',
    sec: 150,
    label: 'Emergency Protocol DGMS-7A Action',
    risk: 76,
    band: 'CRITICAL',
    consensus: 0.81,
    n03Disp: 9.60,
    n03Tilt: 2.25,
    affected: 'Panel B Active Stand-down',
    evidence: 'Underground face evacuated. Shift safety crew dispatched for physical convergence check.'
  },
  {
    timeStr: '10:03:30',
    sec: 210,
    label: 'Strata Caving & Stabilization',
    risk: 48,
    band: 'WATCH',
    consensus: 0.46,
    n03Disp: 9.80,
    n03Tilt: 2.10,
    affected: 'Panel B Settled Goaf',
    evidence: 'Main roof caving complete. Kinetic energy dissipated; displacement rate decelerating.'
  },
  {
    timeStr: '10:04:12',
    sec: 252,
    label: 'Incident Resolved & Post-Audit Baseline',
    risk: 25,
    band: 'NORMAL',
    consensus: 0.22,
    n03Disp: 9.85,
    n03Tilt: 2.05,
    affected: 'Panel B (New Stable Baseline)',
    evidence: 'Deformation velocity zeroed across all 6 monitoring nodes. Post-subsidence equilibrium established.'
  }
];

export const IncidentReplayPage: React.FC = () => {
  const { setActiveModal } = useSimulation();
  const [sliderIndex, setSliderIndex] = useState<number>(4); // Default to Critical frame
  const currentFrame = REPLAY_KEYFRAMES[sliderIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header Bar */}
      <div className="card-industrial" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            BHUSTHIRA Incident Replay
          </h2>
          <p style={{ fontSize: '11px', color: '#64748b' }}>
            Historical time-scrubber reconstructing physical kinematics, spatial consensus, and early-warning escalations.
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
              Chronological Time Scrubber
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a' }}>
              {currentFrame.timeStr}
            </span>
            <span className={`badge-status ${currentFrame.band.toLowerCase()}`}>
              {currentFrame.band}
            </span>
          </div>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min={0}
          max={REPLAY_KEYFRAMES.length - 1}
          value={sliderIndex}
          onChange={(e) => setSliderIndex(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer', height: '6px', accentColor: '#0f172a' }}
        />

        {/* Keyframe Step Markers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${REPLAY_KEYFRAMES.length}, 1fr)`,
          gap: '4px',
          marginTop: '10px'
        }}>
          {REPLAY_KEYFRAMES.map((frame, idx) => (
            <button
              key={idx}
              onClick={() => setSliderIndex(idx)}
              style={{
                border: '1px solid',
                borderColor: sliderIndex === idx ? '#0f172a' : '#e2e8f0',
                background: sliderIndex === idx ? '#0f172a' : '#f8fafc',
                color: sliderIndex === idx ? '#ffffff' : '#475569',
                padding: '6px 4px',
                borderRadius: '4px',
                fontSize: '10px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.1s ease'
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{frame.timeStr}</div>
              <div style={{ fontSize: '9px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                {frame.label.split(' ')[0]}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Reconstruction Detail Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
        {/* State Snapshot at Selected Instant */}
        <div className="card-industrial" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px' }}>
            Reconstructed Telemetry State at {currentFrame.timeStr}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>RISK SCORE</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>{currentFrame.risk} / 100</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>CONSENSUS INDEX</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>{currentFrame.consensus}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>PEAK DISPLACEMENT (N03)</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{currentFrame.n03Disp} mm</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>PEAK TILT (N03)</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{currentFrame.n03Tilt}°</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
              Corroborated Engineering Evidence
            </div>
            <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.45, background: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              {currentFrame.evidence}
            </p>
          </div>
        </div>

        {/* Incident Summary Card (Section 107) */}
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
              <span style={{ color: '#64748b' }}>Peak Risk Reached:</span>
              <strong style={{ color: '#dc2626' }}>82 / 100 (CRITICAL)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Peak Consensus Score:</span>
              <strong>0.84 (HIGH CONF.)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Incident Duration:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>4m 12s</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Affected Zone:</span>
              <strong>Panel B (Longwall Retreat Face)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Participating Sensor Nodes:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>N02, N03, N04, N05</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Final Audit Status:</span>
              <span className="badge-status normal">RESOLVED & STABILIZED</span>
            </div>
          </div>

          <div style={{ marginTop: 'auto', padding: '8px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '10px', color: '#64748b' }}>
            <strong>Note:</strong> Reconstructed from internal event logger stream. All values reflect calibrated synthetic telemetry simulation.
          </div>
        </div>
      </div>
    </div>
  );
};
