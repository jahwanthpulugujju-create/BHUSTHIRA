import React from 'react';
import {
  LayoutDashboard,
  Map,
  Network,
  Cpu,
  AlertTriangle,
  History,
  Activity,
  Layers,
  Info
} from 'lucide-react';
import { useSimulation } from '../../state/simulationContext';

export type NavTab =
  | 'COMMAND_CENTER'
  | 'MINE_MAP'
  | 'SENSOR_NETWORK'
  | 'DEFORMATION_INTEL'
  | 'RISK_ALERTS'
  | 'INCIDENT_REPLAY'
  | 'SYSTEM_HEALTH'
  | 'DEPLOYMENT_ARCH';

interface SidebarNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ activeTab, onSelectTab }) => {
  const { activeAlert } = useSimulation();

  const navItems = [
    { id: 'COMMAND_CENTER', label: 'Command Center', icon: LayoutDashboard, badge: null },
    { id: 'MINE_MAP', label: 'Deformation Map', icon: Map, badge: null },
    { id: 'SENSOR_NETWORK', label: 'Sensor Network', icon: Network, badge: null },
    { id: 'DEFORMATION_INTEL', label: 'Intelligence Engine', icon: Cpu, badge: null },
    {
      id: 'RISK_ALERTS',
      label: 'Risk Engine',
      icon: AlertTriangle,
      badge: activeAlert ? activeAlert.severity : null
    },
    { id: 'INCIDENT_REPLAY', label: 'Incident Replay', icon: History, badge: null },
    { id: 'SYSTEM_HEALTH', label: 'System Health', icon: Activity, badge: null },
    { id: 'DEPLOYMENT_ARCH', label: 'Field Architecture', icon: Layers, badge: null }
  ];

  return (
    <aside style={{
      width: '210px',
      background: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      flexShrink: 0,
      userSelect: 'none'
    }}>
      {/* Primary Navigation List */}
      <div style={{ padding: '12px 8px' }}>
        <div style={{
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#94a3b8',
          padding: '4px 10px 8px 10px'
        }}>
          Operations Rail
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as NavTab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: isActive ? '#0f172a' : 'transparent',
                  background: isActive ? '#0f172a' : 'transparent',
                  color: isActive ? '#ffffff' : '#334155',
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.12s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <Icon size={16} color={isActive ? '#ffffff' : '#64748b'} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: item.badge === 'CRITICAL' ? '#dc2626' : '#ea580c',
                    color: '#ffffff'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Engineering Scope & Ethics Footnote */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid #e2e8f0',
        background: '#f8fafc'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '6px' }}>
          <Info size={13} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#334155' }}>
            Prototype Integrity
          </span>
        </div>
        <p style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.4 }}>
          Software-defined digital twin running calibrated synthetic telemetry. Requires geotechnical field validation prior to operational deployment.
        </p>
        <div style={{ marginTop: '8px', fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
          CORE: DETECT → CORRELATE → WARN
        </div>
      </div>
    </aside>
  );
};
