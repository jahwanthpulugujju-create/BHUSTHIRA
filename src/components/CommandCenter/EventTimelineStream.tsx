import React from 'react';
import { useSimulation } from '../../state/simulationContext';
import { Clock } from 'lucide-react';
import type { IncidentEvent } from '../../types';

export const EventTimelineStream: React.FC = () => {
  const { eventLog, selectNode, selectPanel } = useSimulation();

  const getSeverityBadge = (sev: IncidentEvent['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="badge-status critical" style={{ fontSize: '9px', padding: '1px 5px' }}>CRIT</span>;
      case 'WARNING':
        return <span className="badge-status warning" style={{ fontSize: '9px', padding: '1px 5px' }}>WARN</span>;
      case 'WATCH':
        return <span className="badge-status watch" style={{ fontSize: '9px', padding: '1px 5px' }}>WATCH</span>;
      default:
        return <span className="badge-status normal" style={{ fontSize: '9px', padding: '1px 5px' }}>INFO</span>;
    }
  };

  const handleEventClick = (evt: IncidentEvent) => {
    if (evt.nodeId) {
      selectNode(evt.nodeId);
    }
    if (evt.panelId) {
      selectPanel(evt.panelId);
    }
  };

  return (
    <div className="card-industrial" style={{ padding: '12px 14px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} color="#64748b" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
            Operational Event Timeline
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
          {eventLog.length} EVENTS LOGGED
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {eventLog.slice(0, 10).map((evt, idx) => (
          <div
            key={`${evt.id}-${idx}`}
            onClick={() => handleEventClick(evt)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '6px 8px',
              borderRadius: '4px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              fontSize: '11px',
              transition: 'background 0.1s ease'
            }}
            title="Click to focus node / panel on map"
          >
            <span style={{ fontFamily: 'var(--font-mono)', color: '#64748b', fontSize: '10px', whiteSpace: 'nowrap', marginTop: '1px' }}>
              {evt.timestamp}
            </span>
            {getSeverityBadge(evt.severity)}
            <span style={{ color: '#334155', lineHeight: 1.35, flex: 1 }}>
              {evt.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
