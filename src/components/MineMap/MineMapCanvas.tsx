import React, { useState } from 'react';
import { useSimulation } from '../../state/simulationContext';
import { GATEWAY_COORDINATES } from '../../simulation/mineModel';
import type { SensorNode } from '../../types';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MineMapCanvasProps {
  height?: string | number;
  showControls?: boolean;
}

export const MineMapCanvas: React.FC<MineMapCanvasProps> = ({
  height = '440px',
  showControls = true
}) => {
  const {
    nodes,
    panels,
    meshLinks,
    riskBand,
    riskScore,
    selectedNodeId,
    selectNode,
    selectedPanelId,
    selectPanel,
    currentScenario
  } = useSimulation();

  const [zoom, setZoom] = useState<number>(1);
  const [showMeshOverlay, setShowMeshOverlay] = useState<boolean>(true);
  const [showRiskContour, setShowRiskContour] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // Dynamic deformation zone radius & opacity around Panel B centroid (N03)
  const isDeforming = (riskBand === 'WATCH' || riskBand === 'WARNING' || riskBand === 'CRITICAL') && currentScenario !== 'SENSOR_FAULT';
  const deformationRadius = riskBand === 'CRITICAL' ? 32 : riskBand === 'WARNING' ? 24 : riskBand === 'WATCH' ? 16 : 8;
  const contourColor = riskBand === 'CRITICAL' ? '#dc2626' : riskBand === 'WARNING' ? '#ea580c' : '#d97706';

  const getNodeColor = (node: SensorNode) => {
    if (node.status === 'OFFLINE') return '#64748b';
    if (node.status === 'CRITICAL') return '#dc2626';
    if (node.status === 'ANOMALOUS') return '#ea580c';
    if (node.isReference) return '#0284c7';
    return '#16a34a';
  };

  return (
    <div className="card-industrial" style={{
      position: 'relative',
      height,
      overflow: 'hidden',
      background: '#fcfdfd',
      border: '1px solid #cbd5e1',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Banner with Required Transparency Tag */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '12px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span className="sim-tag" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          SIMULATED MINE GEOMETRY • JHARIA COAL SEAM XI/XII
        </span>
        <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
          SCALE: 1:2500 (100m GRID)
        </span>
      </div>

      {/* Map Interactive Toolbar */}
      {showControls && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '12px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: '#ffffff',
          padding: '3px',
          borderRadius: '4px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <button
            onClick={() => setShowMeshOverlay(!showMeshOverlay)}
            style={{
              padding: '4px 6px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '3px',
              border: 'none',
              background: showMeshOverlay ? '#0f172a' : 'transparent',
              color: showMeshOverlay ? '#ffffff' : '#64748b',
              cursor: 'pointer'
            }}
            title="Toggle wireless mesh link overlay"
          >
            Mesh
          </button>
          <button
            onClick={() => setShowRiskContour(!showRiskContour)}
            style={{
              padding: '4px 6px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '3px',
              border: 'none',
              background: showRiskContour ? '#0f172a' : 'transparent',
              color: showRiskContour ? '#ffffff' : '#64748b',
              cursor: 'pointer'
            }}
            title="Toggle subsidence risk contour influence zone"
          >
            Contour
          </button>
          <button
            onClick={() => setShowLabels(!showLabels)}
            style={{
              padding: '4px 6px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '3px',
              border: 'none',
              background: showLabels ? '#0f172a' : 'transparent',
              color: showLabels ? '#ffffff' : '#64748b',
              cursor: 'pointer'
            }}
            title="Toggle sensor IDs and panel labels"
          >
            Labels
          </button>
          <div style={{ width: '1px', height: '14px', background: '#e2e8f0', margin: '0 2px' }} />
          <button
            onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))}
            style={{ padding: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#334155' }}
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.8, prev - 0.1))}
            style={{ padding: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#334155' }}
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={() => setZoom(1)}
            style={{ padding: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#334155' }}
            title="Reset Zoom"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      )}

      {/* SVG Canvas Mine Model */}
      <div style={{ flex: 1, width: '100%', height: '100%', overflow: 'hidden', cursor: 'crosshair' }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: '100%',
            transform: `scale(${zoom})`,
            transformOrigin: '50% 50%',
            transition: 'transform 0.2s ease'
          }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="mine-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth="0.3" />
            </pattern>

            {/* Cross-hatch for unmined barrier pillars */}
            <pattern id="pillar-hatch" width="4" height="4" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="4" stroke="#cbd5e1" strokeWidth="0.8" />
            </pattern>

            {/* Radial Gradient for Subsidence Influence Zone */}
            <radialGradient id="subsidence-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={contourColor} stopOpacity={riskBand === 'CRITICAL' ? 0.35 : 0.22} />
              <stop offset="40%" stopColor={contourColor} stopOpacity={riskBand === 'CRITICAL' ? 0.20 : 0.12} />
              <stop offset="75%" stopColor={contourColor} stopOpacity={0.06} />
              <stop offset="100%" stopColor={contourColor} stopOpacity={0.0} />
            </radialGradient>
          </defs>

          {/* Background Technical Grid */}
          <rect width="100" height="100" fill="url(#mine-grid)" />

          {/* Mine District Boundary Border */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="0.6"
            strokeDasharray="2,1"
          />

          {/* Surface Access Haul Road / Transport Axis */}
          <path
            d="M 5 48 Q 48 48 50 48 T 95 48"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2.5"
            strokeDasharray="1,1"
          />
          <text x="6" y="47" fontSize="2" fill="#94a3b8" fontFamily="var(--font-mono)">
            MAIN SURFACE HAULAGE CORRIDOR
          </text>

          {/* Mine Panels (A, B, C, D) */}
          {Object.values(panels).map(panel => {
            const isSelected = selectedPanelId === panel.id;
            const isPanelB = panel.id === 'Panel B';
            const panelStroke = isPanelB && isDeforming ? contourColor : isSelected ? '#0f172a' : '#94a3b8';
            const panelFill = isPanelB && isDeforming ? '#fff7ed' : '#ffffff';

            return (
              <g
                key={panel.id}
                onClick={() => selectPanel(panel.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Panel Area Box */}
                <rect
                  x={panel.x}
                  y={panel.y}
                  width={panel.width}
                  height={panel.height}
                  fill={panelFill}
                  stroke={panelStroke}
                  strokeWidth={isSelected ? 1.0 : 0.6}
                  rx="1"
                />

                {/* Barrier Pillar Stripes */}
                <rect
                  x={panel.x}
                  y={panel.y}
                  width={panel.width}
                  height="3"
                  fill="url(#pillar-hatch)"
                />

                {/* Panel Label */}
                {showLabels && (
                  <g>
                    <text
                      x={panel.x + 2}
                      y={panel.y + 6}
                      fontSize="2.4"
                      fontWeight="bold"
                      fill="#334155"
                      fontFamily="var(--font-sans)"
                    >
                      {panel.id}
                    </text>
                    <text
                      x={panel.x + 2}
                      y={panel.y + 9}
                      fontSize="1.6"
                      fill="#64748b"
                      fontFamily="var(--font-mono)"
                    >
                      {panel.seamType} (-{panel.depthMeters}m)
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Dynamic Subsidence Influence Contour (Panel B) */}
          {showRiskContour && isDeforming && (
            <g>
              {/* Outer Influence Boundary Line */}
              <circle
                cx={71}
                cy={28}
                r={deformationRadius}
                fill="url(#subsidence-gradient)"
                stroke={contourColor}
                strokeWidth="0.5"
                strokeDasharray="1.5,1"
              />
              {/* Mid Contour Ring */}
              <circle
                cx={71}
                cy={28}
                r={deformationRadius * 0.6}
                fill="none"
                stroke={contourColor}
                strokeWidth="0.4"
                opacity="0.7"
              />
              {/* Centroid Focal Mark */}
              <line x1="69" y1="28" x2="73" y2="28" stroke={contourColor} strokeWidth="0.4" />
              <line x1="71" y1="26" x2="71" y2="30" stroke={contourColor} strokeWidth="0.4" />
              <text
                x="71"
                y={28 - deformationRadius - 1.5}
                textAnchor="middle"
                fontSize="1.8"
                fontWeight="bold"
                fill={contourColor}
                fontFamily="var(--font-mono)"
              >
                SUBSIDENCE CONTOUR (EST. RISK: {riskScore})
              </text>
            </g>
          )}

          {/* Wireless Mesh Communication Links */}
          {showMeshOverlay && meshLinks.map((link, idx) => {
            const fromNode = nodes[link.from] || (link.from === 'GW-01' ? GATEWAY_COORDINATES : null);
            const toNode = nodes[link.to] || (link.to === 'GW-01' ? GATEWAY_COORDINATES : null);
            if (!fromNode || !toNode) return null;

            return (
              <line
                key={`link-${idx}`}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={link.active ? '#94a3b8' : '#e2e8f0'}
                strokeWidth={link.active ? 0.5 : 0.3}
                strokeDasharray={link.active ? '1,1' : '0.5,0.5'}
                opacity={link.active ? 0.8 : 0.3}
              />
            );
          })}

          {/* Gateway Station (GW-01) */}
          <g
            transform={`translate(${GATEWAY_COORDINATES.x}, ${GATEWAY_COORDINATES.y})`}
            style={{ cursor: 'pointer' }}
          >
            <polygon
              points="0,-3.5 3.5,0 0,3.5 -3.5,0"
              fill="#0f172a"
              stroke="#ffffff"
              strokeWidth="0.5"
            />
            <circle cx="0" cy="0" r="1.2" fill="#0284c7" />
            {showLabels && (
              <text
                x="0"
                y="6"
                textAnchor="middle"
                fontSize="2.0"
                fontWeight="bold"
                fill="#0f172a"
                fontFamily="var(--font-mono)"
              >
                GW-01 (EDGE)
              </text>
            )}
          </g>

          {/* Sensor Nodes */}
          {Object.values(nodes).map(node => {
            const isSelected = selectedNodeId === node.node_id;
            const nodeColor = getNodeColor(node);
            const isAnom = node.status === 'ANOMALOUS' || node.status === 'CRITICAL';

            return (
              <g
                key={node.node_id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  selectNode(node.node_id);
                }}
                style={{ cursor: 'pointer' }}
              >
                {/* Pulse Ring for Warning/Critical */}
                {isAnom && (
                  <circle
                    cx="0"
                    cy="0"
                    r={node.status === 'CRITICAL' ? 4.5 : 3.5}
                    fill={nodeColor}
                    opacity="0.25"
                    className={node.status === 'CRITICAL' ? 'pulse-critical' : 'pulse-warning'}
                  />
                )}

                {/* Node Outer Circle */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? 2.6 : 2.0}
                  fill={nodeColor}
                  stroke="#ffffff"
                  strokeWidth="0.6"
                />

                {/* Node Center Core */}
                <circle cx="0" cy="0" r="0.7" fill="#ffffff" />

                {/* Node Identification Label */}
                {showLabels && (
                  <g>
                    <rect
                      x="-3.5"
                      y="2.8"
                      width="7"
                      height="2.8"
                      fill="#ffffff"
                      stroke="#e2e8f0"
                      strokeWidth="0.2"
                      rx="0.5"
                    />
                    <text
                      x="0"
                      y="4.8"
                      textAnchor="middle"
                      fontSize="1.8"
                      fontWeight="bold"
                      fill="#0f172a"
                      fontFamily="var(--font-mono)"
                    >
                      {node.node_id}
                      {node.isReference && ' (REF)'}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Map Legend (Required Text + Shape) */}
      <div style={{
        padding: '6px 14px',
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: '#475569',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
            <span>Normal Node</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ea580c' }} />
            <span>Anomalous Node</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }} />
            <span>Critical Node</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7' }} />
            <span>Reference Datum</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', transform: 'rotate(45deg)', background: '#0f172a' }} />
            <span>Edge Gateway</span>
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#94a3b8' }}>
          CLICK NODE FOR SENSOR DOSSIER • CLICK PANEL TO FOCUS
        </div>
      </div>
    </div>
  );
};
