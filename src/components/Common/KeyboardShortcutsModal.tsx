import React from 'react';
import { useSimulation } from '../../state/simulationContext';
import { Keyboard, X, Cpu } from 'lucide-react';

export const KeyboardShortcutsModal: React.FC = () => {
  const { activeModal, setActiveModal } = useSimulation();

  if (activeModal !== 'SHORTCUTS') return null;

  const shortcuts = [
    { key: 'Space', desc: 'Pause / Resume Simulation Engine' },
    { key: 'R', desc: 'Reset Simulation to T+00:00 Baseline' },
    { key: 'D', desc: 'Start / Advance Guided Demo Phase (1 to 9)' },
    { key: '1', desc: 'Select Normal Baseline Scenario' },
    { key: '2', desc: 'Select Gradual Subsidence (Main 9-Phase Scenario)' },
    { key: '3', desc: 'Select Rapid Subsidence Scenario' },
    { key: 'W', desc: 'Reconstruct State: Skip to Warning (T+46)' },
    { key: 'C', desc: 'Reconstruct State: Skip to Critical (T+61)' },
    { key: 'N', desc: 'Simulate Node Failure (Toggles Node N04 Offline/Online)' },
    { key: 'O', desc: 'Simulate Cloud Disconnect / Islanding & Restore' },
    { key: 'P', desc: 'Toggle Clean Presentation Mode' },
    { key: 'Esc', desc: 'Dismiss Active Drawers / Modals' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '540px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #cbd5e1',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Keyboard size={18} color="#0f172a" />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Engineering Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={() => setActiveModal('NONE')}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px' }}>
          <p style={{ fontSize: '12px', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
            Designed for live SIH presentations. Use these single-key triggers to control the deterministic digital twin without hunting for UI buttons:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
            {shortcuts.map((sc) => (
              <div
                key={sc.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px'
                }}
              >
                <span style={{ fontSize: '12px', color: '#1e293b' }}>{sc.desc}</span>
                <kbd style={{
                  padding: '3px 8px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: '#0f172a',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '16px',
            padding: '10px 12px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <Cpu size={15} color="#166534" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '11px', color: '#166534', lineHeight: 1.4 }}>
              <strong>Deterministic State Machine:</strong> Skip actions reconstruct exact historical sensor states, link topology, and event logs matching replay verification.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => setActiveModal('NONE')}
            className="btn-engineering primary"
            style={{ padding: '6px 16px', fontSize: '12px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
