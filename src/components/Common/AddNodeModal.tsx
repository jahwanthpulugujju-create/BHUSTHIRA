import React, { useState } from 'react';
import { useSimulation } from '../../state/simulationContext';
import { X, PlusCircle } from 'lucide-react';

export const AddNodeModal: React.FC = () => {
  const { activeModal, setActiveModal, addNewNode, nodes } = useSimulation();

  const nextIndex = Object.keys(nodes).length + 1;
  const defaultId = `N0${nextIndex}`;
  
  const [nodeName, setNodeName] = useState(`Surface Point ${nextIndex}`);
  const [selectedPanel, setSelectedPanel] = useState<'Panel A' | 'Panel B' | 'Panel C' | 'Panel D'>('Panel B');

  if (activeModal !== 'ADD_NODE') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default coordinates based on panel
    let x = 440;
    let y = 290;
    if (selectedPanel === 'Panel A') { x = 250; y = 140; }
    else if (selectedPanel === 'Panel B') { x = 480; y = 310; }
    else if (selectedPanel === 'Panel C') { x = 700; y = 200; }
    else if (selectedPanel === 'Panel D') { x = 500; y = 430; }

    addNewNode(nodeName, selectedPanel, x, y);
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
        width: '460px',
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
            <PlusCircle size={18} color="#0284c7" />
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              Scale Deployment: Add Node ({defaultId})
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Assigned Node Identifier
            </label>
            <input
              type="text"
              value={defaultId}
              disabled
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                fontFamily: 'monospace',
                fontSize: '13px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Installation Label / Description
            </label>
            <input
              type="text"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              placeholder="e.g. Surface Benchmark East"
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontSize: '13px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Target Mining Panel Sector
            </label>
            <select
              value={selectedPanel}
              onChange={(e) => setSelectedPanel(e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="Panel A">Panel A (Seam XI Barrier)</option>
              <option value="Panel B">Panel B (Active Longwall Face)</option>
              <option value="Panel C">Panel C (East Bord & Pillar)</option>
              <option value="Panel D">Panel D (Deep Exploration Boundary)</option>
            </select>
          </div>

          <div style={{
            padding: '12px',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#0369a1',
            lineHeight: '1.4'
          }}>
            <strong>Scalability Notice:</strong> Upon adding, the new node will register with Gateway GW-01, establish baseline reference metrics, and participate in spatial neighborhood consensus evaluation.
          </div>

          {/* Buttons */}
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
              Integrate Node
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
