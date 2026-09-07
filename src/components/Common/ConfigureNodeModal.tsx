import React, { useState } from 'react';
import { useSimulation } from '../../state/simulationContext';
import { X, Sliders, RefreshCw, AlertCircle } from 'lucide-react';
import type { SensorNode } from '../../types';

interface ConfigureNodeModalContentProps {
  node: SensorNode;
}

const ConfigureNodeModalContent: React.FC<ConfigureNodeModalContentProps> = ({ node }) => {
  const { setActiveModal, updateNodeConfig } = useSimulation();

  const [samplingRate, setSamplingRate] = useState('1s');
  const [crackSensorEnabled, setCrackSensorEnabled] = useState(true);
  const [inclinometerEnabled, setInclinometerEnabled] = useState(true);
  const [extensometerEnabled, setExtensometerEnabled] = useState(true);
  
  // Baseline configuration
  const [baselineTilt, setBaselineTilt] = useState(node.baseline.tilt.toString());
  const [baselineDisp, setBaselineDisp] = useState(node.baseline.displacement.toString());
  const [baselineVib, setBaselineVib] = useState(node.baseline.vibration.toString());
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const tiltVal = parseFloat(baselineTilt);
    const dispVal = parseFloat(baselineDisp);
    const vibVal = parseFloat(baselineVib);

    if (isNaN(tiltVal) || tiltVal < 0 || tiltVal > 45) {
      setValidationError('Baseline tilt must be between 0.0° and 45.0°');
      return;
    }
    if (isNaN(dispVal) || dispVal < 0 || dispVal > 200) {
      setValidationError('Baseline displacement must be between 0.0mm and 200.0mm');
      return;
    }
    if (isNaN(vibVal) || vibVal < 0 || vibVal > 5) {
      setValidationError('Baseline vibration must be between 0.0g and 5.0g');
      return;
    }

    updateNodeConfig(node.node_id, {
      crack_signal: crackSensorEnabled ? node.crack_signal : false,
      baseline: {
        tilt: Number(tiltVal.toFixed(2)),
        displacement: Number(dispVal.toFixed(2)),
        vibration: Number(vibVal.toFixed(2))
      }
    });
  };

  const handleResetBaseline = () => {
    setBaselineTilt('0.20');
    setBaselineDisp('0.50');
    setBaselineVib('0.08');
    updateNodeConfig(node.node_id, {
      tilt: 0.20,
      displacement: 0.50,
      vibration: 0.08,
      crack_signal: false,
      status: 'NORMAL',
      health: 98,
      anomalyScore: 0.02,
      baseline: { tilt: 0.20, displacement: 0.50, vibration: 0.08 }
    });
  };

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
      <div style={{
        width: '500px',
        maxWidth: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '6px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #cbd5e1'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="#0f172a" />
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              Instrument Calibration & Config: {node.node_id}
            </h2>
          </div>
          <button
            onClick={() => setActiveModal('NONE')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b'
            }}
            aria-label="Close configuration modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {validationError && (
            <div style={{
              padding: '8px 12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertCircle size={14} />
              <span>{validationError}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '2px', fontWeight: 600 }}>
                Assigned Geotechnical Panel
              </label>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                {node.panel} ({node.sector})
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '2px', fontWeight: 600 }}>
                Mesh Route Hop
              </label>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#09332c', fontFamily: 'monospace' }}>
                Next Hop: {node.routeThrough}
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Telemetry Sampling Rate
            </label>
            <select
              value={samplingRate}
              onChange={(e) => setSamplingRate(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="1s">1 Second (Continuous High-Resolution Mode)</option>
              <option value="5s">5 Seconds (Standard Operations Mode)</option>
              <option value="30s">30 Seconds (Low Power Battery Conserve Mode)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Calibrated Zero Datum Baselines
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>
                  Tilt Baseline (°)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={baselineTilt}
                  onChange={(e) => setBaselineTilt(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>
                  Disp. Baseline (mm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={baselineDisp}
                  onChange={(e) => setBaselineDisp(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>
                  Vib. Baseline (g)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={baselineVib}
                  onChange={(e) => setBaselineVib(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Active Instrumentation Channels
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={inclinometerEnabled}
                  onChange={(e) => setInclinometerEnabled(e.target.checked)}
                />
                <span>Bi-Axial Surface Inclinometer (Tilt X/Y Channel)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={extensometerEnabled}
                  onChange={(e) => setExtensometerEnabled(e.target.checked)}
                />
                <span>Borehole Multi-Point Extensometer Probe</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={crackSensorEnabled}
                  onChange={(e) => setCrackSensorEnabled(e.target.checked)}
                />
                <span>Surface Tensile Crack Conductive Ribbon Loop</span>
              </label>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>Re-zero Calibration Baseline</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Reset current readings to calibrated 0.20° / 0.50mm datum</div>
              </div>
              <button
                type="button"
                onClick={handleResetBaseline}
                className="btn btn-secondary"
                style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px' }}
              >
                <RefreshCw size={12} />
                Re-Zero
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActiveModal('NONE')}
              style={{ fontSize: '12px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ fontSize: '12px', backgroundColor: '#09332c', borderColor: '#09332c' }}
            >
              Apply Calibration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ConfigureNodeModal: React.FC = () => {
  const { activeModal, selectedNodeId, nodes } = useSimulation();

  if (activeModal !== 'CONFIG_NODE' || !selectedNodeId || !nodes[selectedNodeId]) {
    return null;
  }

  return <ConfigureNodeModalContent node={nodes[selectedNodeId]} />;
};
