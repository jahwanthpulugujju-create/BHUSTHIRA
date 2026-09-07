import React, { useState } from 'react';
import { useSimulation } from '../../state/simulationContext';
import { X, Sliders, RefreshCw } from 'lucide-react';

export const ConfigureNodeModal: React.FC = () => {
  const { activeModal, setActiveModal, selectedNodeId, nodes, updateNodeConfig } = useSimulation();

  if (activeModal !== 'CONFIG_NODE' || !selectedNodeId || !nodes[selectedNodeId]) return null;

  const node = nodes[selectedNodeId];

  const [samplingRate, setSamplingRate] = useState('1s');
  const [crackSensorEnabled, setCrackSensorEnabled] = useState(true);
  const [inclinometerEnabled, setInclinometerEnabled] = useState(true);
  const [extensometerEnabled, setExtensometerEnabled] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateNodeConfig(selectedNodeId, {
      crack_signal: crackSensorEnabled ? node.crack_signal : false
    });
  };

  const handleResetBaseline = () => {
    updateNodeConfig(selectedNodeId, {
      tilt: 0.15,
      displacement: 0.40,
      vibration: 0.06,
      crack_signal: false,
      status: 'NORMAL',
      health: 98,
      anomalyScore: 0.02
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backdropFilter: 'blur(2px)'
    }}>
      <div style={{
        width: '480px',
        maxWidth: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #cbd5e1'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="#0284c7" />
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              Configure Node Parameters: {node.node_id}
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
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                Assigned Panel
              </label>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                {node.panel}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                Mesh Route Link
              </label>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0284c7', fontFamily: 'monospace' }}>
                Direct -&gt; {node.routeThrough}
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Telemetry Telemetry Sampling Interval
            </label>
            <select
              value={samplingRate}
              onChange={(e) => setSamplingRate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="1s">1 Second (Continuous High Resolution)</option>
              <option value="5s">5 Seconds (Standard Operations)</option>
              <option value="30s">30 Seconds (Low Power Battery Conserve)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
              Active Instrumentation Channels
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={inclinometerEnabled}
                  onChange={(e) => setInclinometerEnabled(e.target.checked)}
                />
                <span>Bi-Axial Surface Inclinometer (Tilt X/Y)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={extensometerEnabled}
                  onChange={(e) => setExtensometerEnabled(e.target.checked)}
                />
                <span>Borehole Displacement Extensometer Probe</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={crackSensorEnabled}
                  onChange={(e) => setCrackSensorEnabled(e.target.checked)}
                />
                <span>Surface Tensile Crack Conductive Loop</span>
              </label>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>Re-zero Baseline Calibration</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Reset current readings to 30-interval running zero datum</div>
              </div>
              <button
                type="button"
                onClick={handleResetBaseline}
                className="btn btn-secondary"
                style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={12} />
                Re-Zero
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
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
              style={{ fontSize: '12px' }}
            >
              Apply Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
