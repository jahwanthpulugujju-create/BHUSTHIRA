import React, { useState } from 'react';
import { useSimulation } from '../../state/simulationContext';
import { X, PlusCircle } from 'lucide-react';

export const AddNodeModal: React.FC = () => {
  const { activeModal, setActiveModal, addNewNode, nodes } = useSimulation();

  const nextIndex = Object.keys(nodes).length + 1;
  const defaultId = `N0${nextIndex}`;
  
  const [nodeName, setNodeName] = useState(`Surface Transducer ${nextIndex}`);
  const [selectedPanel, setSelectedPanel] = useState<'Panel A' | 'Panel B' | 'Panel C' | 'Panel D'>('Panel B');
  const [sectorName, setSectorName] = useState('Central Goaf Crown');

  if (activeModal !== 'ADD_NODE') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default percentage coordinates within target panel (0-100 coordinate space)
    let x = 65;
    let y = 30;
    if (selectedPanel === 'Panel A') { x = 24; y = 22; }
    else if (selectedPanel === 'Panel B') { x = 66; y = 32; }
    else if (selectedPanel === 'Panel C') { x = 24; y = 62; }
    else if (selectedPanel === 'Panel D') { x = 65; y = 68; }

    addNewNode(`${nodeName} (${sectorName})`, selectedPanel, x, y);
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
        width: '460px',
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
            <PlusCircle size={18} color="#09332c" />
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              Scale Network: Deploy New Node ({defaultId})
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
            aria-label="Close add node modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Assigned Node Identifier
            </label>
            <input
              type="text"
              value={defaultId}
              disabled
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Node Display Name
            </label>
            <input
              type="text"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontSize: '12px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Target Geotechnical Panel
            </label>
            <select
              value={selectedPanel}
              onChange={(e) => setSelectedPanel(e.target.value as 'Panel A' | 'Panel B' | 'Panel C' | 'Panel D')}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="Panel A">Panel A (Continuous Miner North Seam XII)</option>
              <option value="Panel B">Panel B (Active Longwall Retreat Face Seam XI)</option>
              <option value="Panel C">Panel C (Bord & Pillar Depillaring Seam X)</option>
              <option value="Panel D">Panel D (Heading Development Seam IX)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Sector Description
            </label>
            <input
              type="text"
              value={sectorName}
              onChange={(e) => setSectorName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontSize: '12px'
              }}
            />
          </div>

          <div style={{
            padding: '10px 12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#475569'
          }}>
            <strong>Automatic Topology Binding:</strong> New node will dynamically register with Gateway <code>GW-01</code> and route telemetry through the on-site 868MHz wireless mesh.
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
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
              Deploy Sensor Node
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
