import React from 'react';
import { TopStatusStrip } from './TopStatusStrip';
import { QuickActionsToolbar } from './QuickActionsToolbar';
import { MineMapCanvas } from '../MineMap/MineMapCanvas';
import { OperatorDecisionPanel } from './OperatorDecisionPanel';
import { LiveRiskTrendChart } from './LiveRiskTrendChart';
import { EventTimelineStream } from './EventTimelineStream';
import { useSimulation } from '../../state/simulationContext';

export const CommandCenter: React.FC = () => {
  const { currentScenario, demoPhaseName } = useSimulation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* 1. Top High-Value Operational Status Strip */}
      <TopStatusStrip />

      {/* 2. Scenario & Simulation Quick Actions Toolbar */}
      <QuickActionsToolbar />

      {/* Demo Phase Progression Notice (when in demo or active scenario) */}
      {demoPhaseName && (
        <div style={{
          padding: '6px 12px',
          background: '#f1f5f9',
          border: '1px solid #cbd5e1',
          borderRadius: '4px',
          fontSize: '11px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
              ACTIVE DEMO STAGE:
            </span>
            <span style={{ color: '#334155', fontWeight: 600 }}>{demoPhaseName}</span>
          </div>
          <span style={{ color: '#64748b', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
            SCENARIO: {currentScenario.replace('_', ' ')}
          </span>
        </div>
      )}

      {/* 3. Primary Workspace: Left Mine GIS Model vs Right Operator Decision Engine */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.75fr 1.05fr',
        gap: '12px',
        minHeight: '440px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <MineMapCanvas height="100%" showControls={true} />
        </div>

        <div style={{ height: '100%' }}>
          <OperatorDecisionPanel />
        </div>
      </div>

      {/* 4. Bottom Stream: Left Risk Evolution Sparkline vs Right Chronological Event Stream */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '12px',
        minHeight: '210px'
      }}>
        <LiveRiskTrendChart />
        <EventTimelineStream />
      </div>
    </div>
  );
};
