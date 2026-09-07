import React from 'react';
import { MineMapCanvas } from './MineMapCanvas';
import { useSimulation } from '../../state/simulationContext';


export const MineMapPage: React.FC = () => {
  const { panels, nodes, selectedPanelId, selectPanel, selectNode, riskBand } = useSimulation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header Bar */}
      <div className="card-industrial" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            BHUSTHIRA Deformation Map
          </h2>
          <p style={{ fontSize: '11px', color: '#64748b' }}>
            Geotechnical GIS, subterranean panel layout, longwall retreat faces, and dynamic subsidence influence footprints.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="sim-tag">
            SIMULATED MINE GEOMETRY
          </span>
          <span className={`badge-status ${riskBand.toLowerCase()}`}>
            {riskBand}
          </span>
        </div>
      </div>

      {/* Main Map + Panel Side Dossier */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
        <div style={{ minHeight: '520px' }}>
          <MineMapCanvas height="520px" showControls={true} />
        </div>

        {/* Panel Geotechnical Dossier */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card-industrial" style={{ padding: '14px', flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px' }}>
              Monitored Mine Panels
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.values(panels).map(panel => {
                const isSelected = selectedPanelId === panel.id;
                const panelNodes = panel.nodeIds.map(id => nodes[id]).filter(Boolean);

                return (
                  <div
                    key={panel.id}
                    onClick={() => selectPanel(panel.id)}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: isSelected ? '1.5px solid #0f172a' : '1px solid #e2e8f0',
                      background: isSelected ? '#f8fafc' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'border-color 0.12s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                        {panel.name}
                      </span>
                      <span className={`badge-status ${panel.riskBand.toLowerCase()}`}>
                        {panel.riskBand}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                      <div><strong>Seam:</strong> {panel.seamType}</div>
                      <div><strong>Depth:</strong> -{panel.depthMeters} meters below surface</div>
                      <div><strong>Extraction:</strong> {panel.extractionMethod}</div>
                    </div>

                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', color: '#94a3b8', marginRight: '4px' }}>Assigned Nodes:</span>
                      {panelNodes.map(n => (
                        <button
                          key={n.node_id}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectNode(n.node_id);
                          }}
                          className={`badge-status ${n.status.toLowerCase()}`}
                          style={{ fontSize: '10px', cursor: 'pointer' }}
                        >
                          {n.node_id}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Geological Stratigraphy Context Card */}
          <div className="card-industrial" style={{ padding: '12px 14px', background: '#f8fafc' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '4px' }}>
              Overburden Stratigraphy Notes
            </div>
            <p style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.45 }}>
              Interbedded sandstone and shale strata. Caving extraction in Panel B induces tensile strain at the inflection point, registered as surface tilt before vertical subsidence trough formation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
