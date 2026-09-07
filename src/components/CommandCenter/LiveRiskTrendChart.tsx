import React from 'react';
import { useSimulation } from '../../state/simulationContext';

export const LiveRiskTrendChart: React.FC = () => {
  const { telemetryHistory, riskScore, riskBand } = useSimulation();

  // Coordinates for SVG sparkline chart
  const width = 580;
  const height = 150;
  const paddingLeft = 36;
  const paddingBottom = 24;
  const paddingTop = 12;
  const paddingRight = 14;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = telemetryHistory;
  const count = points.length;

  // X coordinate calculation
  const getX = (index: number) => paddingLeft + (index / Math.max(1, count - 1)) * chartWidth;
  // Y coordinate calculation (0 is at bottom, 100 is at top)
  const getY = (val: number) => paddingTop + chartHeight - (Math.min(100, Math.max(0, val)) / 100) * chartHeight;

  // Generate path string for Risk line
  const riskPath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.riskScore)}`).join(' ');
  // Generate path string for Consensus line
  const consensusPath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.consensusScore)}`).join(' ');

  // Risk area fill
  const areaPath = `${riskPath} L ${getX(count - 1)} ${paddingTop + chartHeight} L ${getX(0)} ${paddingTop + chartHeight} Z`;

  return (
    <div className="card-industrial" style={{ padding: '12px 14px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
            Risk & Deformation Evolution
          </span>
          <span className="sim-tag" style={{ marginLeft: '8px' }}>
            SYNTHETIC SENSOR TELEMETRY
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '3px', background: '#dc2626' }} />
            <span style={{ color: '#475569', fontWeight: 600 }}>Risk Index ({riskScore})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '3px', background: '#0284c7' }} />
            <span style={{ color: '#475569', fontWeight: 600 }}>Consensus</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Engine */}
      <div style={{ flex: 1, width: '100%', minHeight: '120px' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="risk-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#ea580c" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Threshold Zone Bands */}
          {/* Critical (70-100) */}
          <rect
            x={paddingLeft}
            y={getY(100)}
            width={chartWidth}
            height={getY(70) - getY(100)}
            fill="#fef2f2"
            opacity="0.5"
          />
          {/* Warning (50-70) */}
          <rect
            x={paddingLeft}
            y={getY(70)}
            width={chartWidth}
            height={getY(50) - getY(70)}
            fill="#fff7ed"
            opacity="0.5"
          />
          {/* Watch (30-50) */}
          <rect
            x={paddingLeft}
            y={getY(50)}
            width={chartWidth}
            height={getY(30) - getY(50)}
            fill="#fffbeb"
            opacity="0.4"
          />

          {/* Reference Threshold Lines */}
          <line x1={paddingLeft} y1={getY(70)} x2={paddingLeft + chartWidth} y2={getY(70)} stroke="#fca5a5" strokeWidth="0.8" strokeDasharray="2,2" />
          <line x1={paddingLeft} y1={getY(50)} x2={paddingLeft + chartWidth} y2={getY(50)} stroke="#fdba74" strokeWidth="0.8" strokeDasharray="2,2" />
          <line x1={paddingLeft} y1={getY(30)} x2={paddingLeft + chartWidth} y2={getY(30)} stroke="#fde047" strokeWidth="0.8" strokeDasharray="2,2" />

          {/* Horizontal Axis Labels */}
          <text x={paddingLeft - 4} y={getY(70) + 3} textAnchor="end" fontSize="9" fill="#dc2626" fontFamily="var(--font-mono)">70</text>
          <text x={paddingLeft - 4} y={getY(50) + 3} textAnchor="end" fontSize="9" fill="#ea580c" fontFamily="var(--font-mono)">50</text>
          <text x={paddingLeft - 4} y={getY(30) + 3} textAnchor="end" fontSize="9" fill="#d97706" fontFamily="var(--font-mono)">30</text>
          <text x={paddingLeft - 4} y={getY(0) + 3} textAnchor="end" fontSize="9" fill="#94a3b8" fontFamily="var(--font-mono)">0</text>

          {/* Bottom X-Axis Axis */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={paddingLeft + chartWidth}
            y2={paddingTop + chartHeight}
            stroke="#cbd5e1"
            strokeWidth="1"
          />
          <text x={paddingLeft} y={height - 6} fontSize="9" fill="#94a3b8" fontFamily="var(--font-mono)">-30s</text>
          <text x={paddingLeft + chartWidth / 2} y={height - 6} textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="var(--font-mono)">-15s</text>
          <text x={paddingLeft + chartWidth} y={height - 6} textAnchor="end" fontSize="9" fill="#0f172a" fontWeight="bold" fontFamily="var(--font-mono)">NOW</text>

          {/* Area Fill */}
          <path d={areaPath} fill="url(#risk-area-grad)" />

          {/* Consensus Trend Line */}
          <path
            d={consensusPath}
            fill="none"
            stroke="#0284c7"
            strokeWidth="1.6"
            strokeDasharray="3,2"
            opacity="0.85"
          />

          {/* Main Risk Trend Line */}
          <path
            d={riskPath}
            fill="none"
            stroke={riskBand === 'CRITICAL' ? '#dc2626' : riskBand === 'WARNING' ? '#ea580c' : '#0f172a'}
            strokeWidth="2.2"
          />

          {/* Current Value Head Marker */}
          {count > 0 && (
            <circle
              cx={getX(count - 1)}
              cy={getY(points[count - 1].riskScore)}
              r="3.5"
              fill={riskBand === 'CRITICAL' ? '#dc2626' : '#0f172a'}
              stroke="#ffffff"
              strokeWidth="1.2"
            />
          )}
        </svg>
      </div>
    </div>
  );
};
