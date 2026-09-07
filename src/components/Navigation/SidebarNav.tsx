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

interface NavGroup {
  groupName: string;
  items: {
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: string | null;
  }[];
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ activeTab, onSelectTab }) => {
  const { activeAlert } = useSimulation();

  const navGroups: NavGroup[] = [
    {
      groupName: 'MONITOR',
      items: [
        { id: 'COMMAND_CENTER', label: 'Command Center', icon: LayoutDashboard },
        { id: 'MINE_MAP', label: 'Deformation Map', icon: Map }
      ]
    },
    {
      groupName: 'ANALYZE',
      items: [
        { id: 'SENSOR_NETWORK', label: 'Sensor Network', icon: Network },
        { id: 'DEFORMATION_INTEL', label: 'Intelligence Engine', icon: Cpu },
        {
          id: 'RISK_ALERTS',
          label: 'Risk & Alerts',
          icon: AlertTriangle,
          badge: activeAlert ? activeAlert.severity : null
        }
      ]
    },
    {
      groupName: 'REVIEW',
      items: [
        { id: 'INCIDENT_REPLAY', label: 'Incident Replay', icon: History },
        { id: 'SYSTEM_HEALTH', label: 'System Health', icon: Activity }
      ]
    },
    {
      groupName: 'ARCHITECTURE',
      items: [
        { id: 'DEPLOYMENT_ARCH', label: 'Field Architecture', icon: Layers }
      ]
    }
  ];

  return (
    <aside style={{
      width: '215px',
      background: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      flexShrink: 0,
      userSelect: 'none'
    }}>
      {/* Upper Section: Brand Banner & Grouped Navigation */}
      <div style={{ overflowY: 'auto' }}>
        {/* Brand Header Banner */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img
            src="/logo-full.png"
            alt="BHUSTHIRA — Stable Mines, Safer Tomorrows"
            style={{
              width: '100%',
              maxWidth: '150px',
              height: 'auto',
              display: 'block'
            }}
          />
        </div>

        {/* Grouped Nav Items */}
        <div style={{ padding: '8px 6px' }}>
          {navGroups.map((group) => (
            <div key={group.groupName} style={{ marginBottom: '10px' }}>
              <div style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '0.06em',
                padding: '4px 10px 4px 10px',
                textTransform: 'uppercase'
              }}>
                {group.groupName}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: '4px',
                        border: 'none',
                        borderLeft: isActive ? '3px solid #09332c' : '3px solid transparent',
                        background: isActive ? '#f1f5f9' : 'transparent',
                        color: isActive ? '#0f172a' : '#475569',
                        fontSize: '12px',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.1s ease, color 0.1s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon size={15} color={isActive ? '#09332c' : '#64748b'} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '3px',
                          background: item.badge === 'CRITICAL' ? '#dc2626' : '#ea580c',
                          color: '#ffffff'
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Operational Integrity Note */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid #e2e8f0',
        background: '#f8fafc',
        fontSize: '11px',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '4px' }}>
          <Info size={13} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span style={{ fontSize: '10px', lineHeight: 1.3 }}>
            <strong>Prototype Integrity:</strong> Calibrated synthetic telemetry. Requires mine-specific field validation prior to deployment.
          </span>
        </div>
        <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
          CORE: SENSE → CORRELATE → WARN
        </div>
      </div>
    </aside>
  );
};
