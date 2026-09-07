import React, { useState } from 'react';
import { useSimulation } from '../../state/simulationContext';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Cloud, 
  Activity, 
  Radio, 
  Info,
  ChevronRight,
  ShieldCheck,
  Terminal
} from 'lucide-react';

interface IntegrationDetail {
  name: string;
  category: string;
  status: 'ACTIVE' | 'SIMULATED' | 'READY';
  protocol: string;
  latency: string;
  description: string;
  fieldIntegrationNotes: string;
}

const INTEGRATIONS_CATALOG: IntegrationDetail[] = [
  {
    name: 'Edge Gateway (GW-01 / EDGE-01)',
    category: 'Edge Computing',
    status: 'SIMULATED',
    protocol: 'Local IPC / Socket.io emulation',
    latency: '< 15 ms',
    description: 'Autonomous edge processing daemon deployed on industrial Raspberry Pi CM4 / x86 edge computer.',
    fieldIntegrationNotes: 'Direct serial/UART/SPI connection to local multi-channel LoRa concentrator module.'
  },
  {
    name: 'GIS Spatial Projection',
    category: 'Geospatial Analytics',
    status: 'ACTIVE',
    protocol: 'SVG GeoJSON Vector Coordinates',
    latency: '< 5 ms',
    description: 'Real-time coordinate projection mapping sensor node coordinates to coal mine seam boundaries and surface sectors.',
    fieldIntegrationNotes: 'Binds directly to Mine Survey DXF/GeoTIFF plan files calibrated by certified mining surveyors.'
  },
  {
    name: 'MQTT Telemetry Broker',
    category: 'Field Ingestion',
    status: 'READY',
    protocol: 'MQTT 3.1.1 / TLS 1.3 (Port 8883)',
    latency: 'Sub-50 ms over 4G/Local Ethernet',
    description: 'Pub/Sub telemetry broker designed to accept payload streams from low-power ESP32 microcontrollers.',
    fieldIntegrationNotes: 'Standardized topic schema `mine/bhusthira/telemetry/{node_id}` ready to bind in production settings.'
  },
  {
    name: 'LoRaWAN Concentrator Interface',
    category: 'Wireless Mesh',
    status: 'READY',
    protocol: 'Semtech SX1302 868/915 MHz Packet Forwarder',
    latency: '500 - 1500 ms depending on SF7-SF12',
    description: 'Sub-GHz RF physical layer abstraction for deep underground / rugged surface coal mine terrain.',
    fieldIntegrationNotes: 'Requires DGMS/PESO intrinsically safe certified flame-proof enclosure in underground headings.'
  },
  {
    name: 'SMS Emergency Dispatcher',
    category: 'Early Warning',
    status: 'SIMULATED',
    protocol: 'HTTP REST / Twilio / NIC SMS Gateway',
    latency: '3 - 8 seconds',
    description: 'Broadcasts urgent safety alerts and operator verification notices to mining shift supervisors.',
    fieldIntegrationNotes: 'Integrates with internal PABX / Mine PA siren dispatch systems.'
  },
  {
    name: 'Cloud Archive & Synchronization',
    category: 'Cloud Storage',
    status: 'SIMULATED',
    protocol: 'HTTPS REST / PostgreSQL Sync',
    latency: '120 ms (when uplink active)',
    description: 'Long-term historical telemetry repository for regulatory compliance and deep geological audits.',
    fieldIntegrationNotes: 'Features store-and-forward edge cache to handle intermittent WAN connectivity in remote mine pits.'
  }
];

export const SystemHealthPage: React.FC = () => {
  const { 
    nodes, 
    cloudStatus, 
    bufferedEventsCount, 
    networkHealth, 
    toggleCloudConnection,
    simClockSec,
    setActiveModal
  } = useSimulation();

  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationDetail | null>(null);

  const totalNodesCount = Object.keys(nodes).length;
  const healthyNodesCount = Object.values(nodes).filter(n => n.status !== 'OFFLINE' && n.health > 70).length;

  const systemServices = [
    {
      name: 'Telemetry Ingestion Daemon',
      sub: 'Edge-01 Local Pipeline',
      status: 'ACTIVE',
      health: 99,
      latency: '8 ms',
      heartbeat: `${(simClockSec % 3) + 1}s ago`,
      events: '14,280/hr',
      icon: Terminal
    },
    {
      name: 'Statistical Anomaly Engine',
      sub: 'Z-score & Rolling Baseline Analyzer',
      status: 'ACTIVE',
      health: 98,
      latency: '12 ms',
      heartbeat: `${(simClockSec % 2) + 1}s ago`,
      events: '2,400/hr',
      icon: Activity
    },
    {
      name: 'Deformation Consensus Engine',
      sub: 'Multi-Sensor Spatial/Temporal Fusion',
      status: 'ACTIVE',
      health: 97,
      latency: '14 ms',
      heartbeat: `${(simClockSec % 2) + 1}s ago`,
      events: '1,200/hr',
      icon: Cpu
    },
    {
      name: 'Risk & Early Warning Engine',
      sub: 'Dynamic Kinematic Threshold Evaluator',
      status: 'ACTIVE',
      health: 100,
      latency: '6 ms',
      heartbeat: `${(simClockSec % 4) + 1}s ago`,
      events: '600/hr',
      icon: ShieldCheck
    },
    {
      name: 'Local SQLite Ring Buffer',
      sub: 'Edge Persistent Flash Storage (16GB)',
      status: 'ACTIVE',
      health: 100,
      latency: '2 ms',
      heartbeat: 'Synchronized',
      events: 'Zero Data Loss Cache',
      icon: HardDrive
    },
    {
      name: 'Cloud Uplink Sync Daemon',
      sub: cloudStatus === 'CONNECTED' ? 'Central HQ Server Link' : 'Local Island Mode (Buffering)',
      status: cloudStatus === 'CONNECTED' ? 'ACTIVE' : cloudStatus === 'SYNCHRONIZING' ? 'SYNCING' : 'OFFLINE',
      health: cloudStatus === 'CONNECTED' ? 98 : 0,
      latency: cloudStatus === 'CONNECTED' ? '118 ms' : 'N/A (Disconnected)',
      heartbeat: cloudStatus === 'CONNECTED' ? '5s ago' : 'Buffering to Disk',
      events: `${bufferedEventsCount} buffered events`,
      icon: Cloud
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Context */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '16px 20px', 
        backgroundColor: '#ffffff', 
        borderRadius: '6px', 
        border: '1px solid #e2e8f0' 
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
              System Health & Diagnostics
            </h1>
            <span className="badge badge-normal">PROTOTYPE MONITORED</span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Continuous diagnostics for Edge Gateway, Distributed Wireless Sensor Nodes, and Analytic Pipeline Daemons.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-secondary"
            onClick={toggleCloudConnection}
            style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Cloud size={14} />
            {cloudStatus === 'CONNECTED' ? 'Simulate Cloud Disconnect' : 'Restore Cloud Uplink'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setActiveModal('LIVE_TELEMETRY')}
            style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Terminal size={14} />
            Inspect Raw Stream
          </button>
        </div>
      </div>

      {/* Core Operational Health Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sensor Fleet Status
            </span>
            <Radio size={16} color="#0284c7" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
              {healthyNodesCount} / {totalNodesCount}
            </span>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>Active Nodes</span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
            100% Heartbeat response on active mesh
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Edge Gateway (EDGE-01)
            </span>
            <Server size={16} color="#10b981" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>ONLINE</span>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>Nominal</span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
            CPU Load: 14% • RAM: 1.1GB / 4.0GB
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Mesh Reliability
            </span>
            <Activity size={16} color="#0284c7" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{networkHealth}%</span>
            <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600 }}>PDR Rate</span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
            Avg Packet Loss: 0.8% • Multi-hop dynamic routing
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Cloud Uplink
            </span>
            <Cloud size={16} color={cloudStatus === 'CONNECTED' ? '#10b981' : '#f59e0b'} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ 
              fontSize: '24px', 
              fontWeight: 700, 
              color: cloudStatus === 'CONNECTED' ? '#0f172a' : '#d97706' 
            }}>
              {cloudStatus}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
            {cloudStatus === 'CONNECTED' ? 'Synchronized in real-time' : `${bufferedEventsCount} events queued on local flash`}
          </div>
        </div>
      </div>

      {/* KEY CONCEPT SECTION: SENSOR HEALTH vs DEFORMATION SIGNAL */}
      <div style={{ 
        backgroundColor: '#f8fafc', 
        border: '1px solid #cbd5e1', 
        borderRadius: '6px', 
        padding: '18px 20px',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ 
            backgroundColor: '#0284c7', 
            color: '#ffffff', 
            borderRadius: '4px', 
            padding: '4px 8px', 
            fontSize: '11px', 
            fontWeight: 700, 
            letterSpacing: '0.05em' 
          }}>
            CRITICAL ENGINEERING PRINCIPLE
          </div>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            Sensor Health vs. Deformation Signal Independence
          </h2>
        </div>

        <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
          A common failure mode in simplistic monitoring systems is confusing <strong>sensor failure</strong> with 
          <strong> ground subsidence</strong>. In BHUSTHIRA, <em>Hardware Sensor Health</em> (is the instrument functional?) is strictly decoupled 
          from <em>Environmental Deformation Signal</em> (is the ground behaving abnormally?). If a sensor has degraded health, its reading confidence is lowered 
          rather than triggering a false catastrophic mine evacuation.
        </p>

        {/* Matrix Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569' }}>Node ID & Role</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569' }}>Battery</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569' }}>Packet Loss</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569' }}>Sensor Health Metric</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569' }}>Deformation Signal</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569' }}>Diagnostic Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(nodes).map(node => {
                const isHealthy = node.health >= 70 && node.status !== 'OFFLINE';
                const isDeforming = node.status === 'ANOMALOUS' || node.status === 'CRITICAL';

                return (
                  <tr key={node.node_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>
                      {node.name}
                      {node.isReference && (
                        <span style={{ marginLeft: '6px', fontSize: '10px', backgroundColor: '#e2e8f0', padding: '2px 4px', borderRadius: '2px' }}>
                          DATUM REF
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px' }}>{node.battery}%</td>
                    <td style={{ padding: '10px 14px' }}>{node.packet_loss.toFixed(1)}%</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          backgroundColor: node.health > 70 ? '#10b981' : node.health > 30 ? '#f59e0b' : '#ef4444' 
                        }} />
                        <span style={{ fontWeight: 600, color: node.health > 70 ? '#15803d' : '#b45309' }}>
                          {node.health}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className={`badge ${
                        node.deformationSignal === 'CRITICAL' ? 'badge-critical' :
                        node.deformationSignal === 'HIGH' ? 'badge-warning' :
                        node.deformationSignal === 'ELEVATED' ? 'badge-watch' : 'badge-normal'
                      }`}>
                        {node.status === 'OFFLINE' ? 'SIGNAL LOST' : node.deformationSignal}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>
                      {node.status === 'OFFLINE' ? (
                        <span style={{ color: '#dc2626', fontWeight: 600 }}>Node Offline. Rerouting active mesh traffic.</span>
                      ) : isHealthy && isDeforming ? (
                        <span style={{ color: '#b45309', fontWeight: 600 }}>Hardware Healthy: Genuine Ground Kinematic Movement</span>
                      ) : isHealthy && !isDeforming ? (
                        <span style={{ color: '#15803d' }}>Hardware Healthy: Stable Environmental Baseline</span>
                      ) : (
                        <span style={{ color: '#dc2626', fontWeight: 600 }}>Degraded Sensor: Reading discounted from consensus fusion</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid: Internal System Services & Integrations Architecture */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Column: Internal Daemons */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              Edge Computing Daemons & Services
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>6 of 6 active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {systemServices.map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <div 
                  key={idx}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    border: '1px solid #f1f5f9',
                    borderRadius: '4px',
                    backgroundColor: '#f8fafc'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '4px', 
                      backgroundColor: '#e2e8f0', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Icon size={16} color="#334155" />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{srv.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{srv.sub}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <span className={`badge ${srv.status === 'ACTIVE' ? 'badge-normal' : srv.status === 'SYNCING' ? 'badge-watch' : 'badge-critical'}`} style={{ fontSize: '10px' }}>
                        {srv.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                      {srv.heartbeat} • {srv.latency}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Integrations & Protocol Interface Status */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                Subsystem Integrations & Protocols
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                Click any interface to view field integration specification.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span className="badge badge-normal" style={{ fontSize: '10px' }}>ACTIVE: 1</span>
              <span className="badge badge-watch" style={{ fontSize: '10px' }}>SIMULATED: 3</span>
              <span className="badge badge-neutral" style={{ fontSize: '10px' }}>READY: 2</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {INTEGRATIONS_CATALOG.map((integ, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedIntegration(integ)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  border: selectedIntegration?.name === integ.name ? '1px solid #0284c7' : '1px solid #e2e8f0',
                  borderRadius: '4px',
                  backgroundColor: selectedIntegration?.name === integ.name ? '#f0f9ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{integ.name}</span>
                    <span className={`badge ${
                      integ.status === 'ACTIVE' ? 'badge-normal' :
                      integ.status === 'SIMULATED' ? 'badge-watch' : 'badge-neutral'
                    }`} style={{ fontSize: '10px' }}>
                      {integ.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    {integ.protocol} • {integ.category}
                  </div>
                </div>

                <ChevronRight size={16} color="#94a3b8" />
              </div>
            ))}
          </div>

          {/* Selected Integration Detail Box */}
          {selectedIntegration && (
            <div style={{ 
              marginTop: '14px', 
              padding: '12px', 
              backgroundColor: '#f8fafc', 
              border: '1px solid #cbd5e1', 
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                {selectedIntegration.name} Integration Note
              </div>
              <p style={{ margin: '0 0 6px 0', color: '#475569' }}>
                {selectedIntegration.description}
              </p>
              <div style={{ color: '#0284c7', fontWeight: 600 }}>
                Field Deployment Pathway: <span style={{ color: '#334155', fontWeight: 400 }}>{selectedIntegration.fieldIntegrationNotes}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transparency Footer Note */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        padding: '12px 16px', 
        backgroundColor: '#f1f5f9', 
        borderRadius: '6px', 
        border: '1px solid #e2e8f0',
        fontSize: '12px',
        color: '#64748b'
      }}>
        <Info size={16} color="#0284c7" />
        <span>
          <strong>System Health Notice:</strong> All heartbeat frequencies and latency metrics currently reflect the local software simulation environment. 
          Real-world physical deployments require Intrinsically Safe (IS) DGMS-certified hardware in gassy coal mine seams.
        </span>
      </div>
    </div>
  );
};
