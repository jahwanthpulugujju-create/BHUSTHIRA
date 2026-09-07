import React from 'react';
import { useSimulation } from '../../state/simulationContext';
import { Cpu, ShieldCheck } from 'lucide-react';

export const SensorNetworkPage: React.FC = () => {
  const {
    nodes,
    cloudStatus,
    bufferedEventsCount,
    toggleNodeFailure,
    toggleCloudConnection,
    selectNode,
    networkHealth
  } = useSimulation();

  const isN04Offline = nodes['N04']?.status === 'OFFLINE';
  const totalNodes = Object.keys(nodes).length;
  const activeNodesCount = Object.values(nodes).filter(n => n.status !== 'OFFLINE').length;
  const avgPacketDelivery = Math.round(
    Object.values(nodes)
      .filter(n => n.status !== 'OFFLINE')
      .reduce((acc, n) => acc + (100 - n.packet_loss), 0) / Math.max(1, activeNodesCount)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header Bar */}
      <div className="card-industrial" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            BHUSTHIRA Sensor Network & Mesh Topology
          </h2>
          <p style={{ fontSize: '11px', color: '#64748b', margin: '3px 0 0 0' }}>
            Underground Sub-GHz wireless mesh telemetry, multi-hop route recovery, and edge-first islanding resilience.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="sim-tag">
            SIMULATED 868MHz MESH TOPOLOGY
          </span>
        </div>
      </div>

      {/* Network Health KPIs (Req 41) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '12px'
      }}>
        <div className="card-industrial" style={{ padding: '10px 14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Node Availability
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
            <span className="font-mono" style={{ fontSize: '22px', fontWeight: 700, color: activeNodesCount === totalNodes ? '#16a34a' : '#dc2626' }}>
              {activeNodesCount} / {totalNodes}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>active</span>
          </div>
        </div>

        <div className="card-industrial" style={{ padding: '10px 14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Packet Delivery
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
            <span className="font-mono" style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>
              {avgPacketDelivery}%
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>delivered</span>
          </div>
        </div>

        <div className="card-industrial" style={{ padding: '10px 14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Network Health
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
            <span className="font-mono" style={{ fontSize: '22px', fontWeight: 700, color: networkHealth > 85 ? '#16a34a' : '#ea580c' }}>
              {networkHealth}%
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>link quality</span>
          </div>
        </div>

        <div className="card-industrial" style={{ padding: '10px 14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Gateway GW-01
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <ShieldCheck size={18} color="#16a34a" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a' }}>ACTIVE</span>
          </div>
        </div>

        <div className="card-industrial" style={{ padding: '10px 14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Local Edge-01
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <Cpu size={18} color="#0284c7" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7' }}>ISLAND READY</span>
          </div>
        </div>
      </div>

      {/* Interactive Topology Graph (Req 39 & 40) */}
      <div className="card-industrial" style={{ padding: '16px', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
              Dynamic Mesh Route Visualizer
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {isN04Offline
                ? 'FAILOVER ROUTE ACTIVE: N04 link severed. Telemetry dynamically reroutes via N02 → N03 → N05 → GW-01.'
                : 'OPTIMAL TOPOLOGY: All mesh links balanced. Multi-hop packet routing through N04/N05 concentrators.'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => toggleNodeFailure('N04')}
              className={`btn-engineering ${isN04Offline ? 'primary' : 'danger'}`}
              style={{ fontSize: '11px', padding: '5px 10px' }}
            >
              {isN04Offline ? 'RESTORE NODE N04' : 'FAIL NODE N04 (TRIGGER FAILOVER)'}
            </button>
            <button
              onClick={toggleCloudConnection}
              className={`btn-engineering ${cloudStatus === 'DISCONNECTED' ? 'primary' : 'warning'}`}
              style={{ fontSize: '11px', padding: '5px 10px' }}
            >
              {cloudStatus === 'CONNECTED' ? 'DISCONNECT CLOUD' : 'RESTORE CLOUD LINK'}
            </button>
          </div>
        </div>

        {/* SVG Mesh Diagram */}
        <div style={{
          width: '100%',
          background: '#f8fafc',
          borderRadius: '6px',
          border: '1px solid #e2e8f0',
          padding: '16px 10px',
          overflowX: 'auto'
        }}>
          <svg viewBox="0 0 940 240" style={{ width: '100%', height: 'auto', minWidth: '700px' }}>
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
              </marker>
              <marker id="arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#16a34a" />
              </marker>
              <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626" />
              </marker>
            </defs>

            {/* Mesh Links Background Grid / Lines */}
            {/* N01 (100, 60) to N02 (260, 60) */}
            <line x1="120" y1="60" x2="240" y2="60" stroke="#0284c7" strokeWidth="2" strokeDasharray={isN04Offline ? "none" : "none"} />
            <text x="180" y="52" fill="#64748b" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">-68 dBm</text>

            {/* N02 (260, 60) to N03 (420, 60) */}
            <line x1="280" y1="60" x2="400" y2="60" stroke={isN04Offline ? "#16a34a" : "#0284c7"} strokeWidth={isN04Offline ? "3" : "2"} />
            <text x="350" y="52" fill={isN04Offline ? "#16a34a" : "#64748b"} fontSize="9" fontWeight={isN04Offline ? "700" : "400"} fontFamily="var(--font-mono)" textAnchor="middle">
              {isN04Offline ? "REROUTE LINK (-64 dBm)" : "-72 dBm"}
            </text>

            {/* N02 (260, 60) to N04 (260, 160) */}
            {isN04Offline ? (
              <line x1="260" y1="80" x2="260" y2="140" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.6" />
            ) : (
              <line x1="260" y1="80" x2="260" y2="140" stroke="#0284c7" strokeWidth="2" />
            )}

            {/* N03 (420, 60) to N05 (420, 160) */}
            <line x1="420" y1="80" x2="420" y2="140" stroke={isN04Offline ? "#16a34a" : "#0284c7"} strokeWidth={isN04Offline ? "3" : "2"} />

            {/* N04 (260, 160) to N05 (420, 160) */}
            {isN04Offline ? (
              <line x1="280" y1="160" x2="400" y2="160" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.6" />
            ) : (
              <line x1="280" y1="160" x2="400" y2="160" stroke="#0284c7" strokeWidth="2" />
            )}

            {/* N06 Reference (100, 160) to N04 */}
            <line x1="120" y1="160" x2="240" y2="160" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />
            <text x="180" y="152" fill="#94a3b8" fontSize="8" fontFamily="var(--font-mono)" textAnchor="middle">REF SYNC</text>

            {/* N05 (420, 160) to GW-01 (570, 160) */}
            <line x1="440" y1="160" x2="550" y2="160" stroke="#0f172a" strokeWidth="2.5" />
            <text x="495" y="152" fill="#0f172a" fontSize="9" fontWeight="700" fontFamily="var(--font-mono)" textAnchor="middle">GATEWAY UPLINK</text>

            {/* GW-01 (570, 160) to EDGE-01 (700, 160) */}
            <line x1="590" y1="160" x2="680" y2="160" stroke="#0284c7" strokeWidth="3" />
            <text x="635" y="152" fill="#0284c7" fontSize="8" fontWeight="700" fontFamily="var(--font-mono)" textAnchor="middle">RS-485 BUS</text>

            {/* EDGE-01 (700, 160) to CLOUD (840, 160) */}
            {cloudStatus === 'DISCONNECTED' ? (
              <>
                <line x1="720" y1="160" x2="820" y2="160" stroke="#dc2626" strokeWidth="2" strokeDasharray="4,4" />
                <text x="770" y="150" fill="#dc2626" fontSize="9" fontWeight="700" fontFamily="var(--font-mono)" textAnchor="middle">WAN CUT (ISLANDED)</text>
              </>
            ) : (
              <>
                <line x1="720" y1="160" x2="820" y2="160" stroke="#16a34a" strokeWidth="2.5" />
                <text x="770" y="150" fill="#16a34a" fontSize="9" fontWeight="700" fontFamily="var(--font-mono)" textAnchor="middle">HTTPS / MQTT SYNC</text>
              </>
            )}

            {/* NODES RENDERING */}
            {/* N01 */}
            <g transform="translate(100, 60)" onClick={() => selectNode('N01')} style={{ cursor: 'pointer' }}>
              <circle r="18" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
              <text textAnchor="middle" dy="4" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">N01</text>
              <text textAnchor="middle" dy="28" fontSize="9" fill="#64748b">Sector 01</text>
            </g>

            {/* N02 */}
            <g transform="translate(260, 60)" onClick={() => selectNode('N02')} style={{ cursor: 'pointer' }}>
              <circle r="18" fill="#ffffff" stroke={nodes['N02']?.status === 'ANOMALOUS' ? '#ea580c' : '#0f172a'} strokeWidth="2" />
              <text textAnchor="middle" dy="4" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">N02</text>
              <text textAnchor="middle" dy="28" fontSize="9" fill="#64748b">Sector 02</text>
            </g>

            {/* N03 */}
            <g transform="translate(420, 60)" onClick={() => selectNode('N03')} style={{ cursor: 'pointer' }}>
              <circle r="18" fill="#ffffff" stroke={nodes['N03']?.status === 'CRITICAL' ? '#dc2626' : nodes['N03']?.status === 'ANOMALOUS' ? '#ea580c' : '#0f172a'} strokeWidth="2.5" />
              <text textAnchor="middle" dy="4" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">N03</text>
              <text textAnchor="middle" dy="28" fontSize="9" fill="#64748b">Sector 03</text>
            </g>

            {/* N04 */}
            <g transform="translate(260, 160)" onClick={() => selectNode('N04')} style={{ cursor: 'pointer' }}>
              <circle r="18" fill={isN04Offline ? "#fee2e2" : "#ffffff"} stroke={isN04Offline ? "#dc2626" : "#0f172a"} strokeWidth="2" />
              {isN04Offline ? (
                <>
                  <text textAnchor="middle" dy="4" fontSize="11" fontWeight="700" fill="#dc2626" fontFamily="var(--font-mono)">N04</text>
                  <text textAnchor="middle" dy="28" fontSize="9" fill="#dc2626" fontWeight="700">OFFLINE (SEVERED)</text>
                  <line x1="-12" y1="-12" x2="12" y2="12" stroke="#dc2626" strokeWidth="2" />
                </>
              ) : (
                <>
                  <text textAnchor="middle" dy="4" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">N04</text>
                  <text textAnchor="middle" dy="28" fontSize="9" fill="#64748b">Sector 04</text>
                </>
              )}
            </g>

            {/* N05 */}
            <g transform="translate(420, 160)" onClick={() => selectNode('N05')} style={{ cursor: 'pointer' }}>
              <circle r="18" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
              <text textAnchor="middle" dy="4" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">N05</text>
              <text textAnchor="middle" dy="28" fontSize="9" fill="#64748b">Sector 05</text>
            </g>

            {/* N06 Reference */}
            <g transform="translate(100, 160)" onClick={() => selectNode('N06')} style={{ cursor: 'pointer' }}>
              <rect x="-16" y="-16" width="32" height="32" fill="#f8fafc" stroke="#475569" strokeWidth="2" />
              <text textAnchor="middle" dy="4" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">N06</text>
              <text textAnchor="middle" dy="28" fontSize="9" fill="#475569" fontWeight="600">REFERENCE</text>
            </g>

            {/* Gateway GW-01 (Diamond Marker) */}
            <g transform="translate(570, 160)">
              <polygon points="0,-20 20,0 0,20 -20,0" fill="#f1f5f9" stroke="#0f172a" strokeWidth="2.5" />
              <text textAnchor="middle" dy="4" fontSize="10" fontWeight="800" fontFamily="var(--font-mono)">GW-01</text>
              <text textAnchor="middle" dy="30" fontSize="9" fill="#0f172a" fontWeight="700">GATEWAY</text>
            </g>

            {/* Local EDGE-01 (Server Unit) */}
            <g transform="translate(700, 160)">
              <rect x="-24" y="-20" width="48" height="40" rx="4" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
              <text textAnchor="middle" dy="0" fontSize="10" fontWeight="800" fill="#ffffff" fontFamily="var(--font-mono)">EDGE-01</text>
              <text textAnchor="middle" dy="12" fontSize="8" fontWeight="600" fill="#e0f2fe">ANOMALY/RISK</text>
              <text textAnchor="middle" dy="32" fontSize="9" fill="#0284c7" fontWeight="700">LOCAL ENGINE</text>
            </g>

            {/* CLOUD DATA LAKE */}
            <g transform="translate(840, 160)">
              <rect
                x="-26"
                y="-20"
                width="52"
                height="40"
                rx="4"
                fill={cloudStatus === 'DISCONNECTED' ? '#fef2f2' : '#f0fdf4'}
                stroke={cloudStatus === 'DISCONNECTED' ? '#dc2626' : '#16a34a'}
                strokeWidth="2"
              />
              <text textAnchor="middle" dy="0" fontSize="10" fontWeight="800" fill={cloudStatus === 'DISCONNECTED' ? '#dc2626' : '#16a34a'} fontFamily="var(--font-mono)">
                CLOUD
              </text>
              <text textAnchor="middle" dy="12" fontSize="8" fontWeight="700" fill={cloudStatus === 'DISCONNECTED' ? '#dc2626' : '#16a34a'}>
                {cloudStatus === 'DISCONNECTED' ? 'OFFLINE' : 'SYNCED'}
              </text>
              {cloudStatus === 'DISCONNECTED' && (
                <text textAnchor="middle" dy="32" fontSize="9" fill="#dc2626" fontWeight="700">
                  BUFFER: {bufferedEventsCount} EVTS
                </text>
              )}
            </g>
          </svg>
        </div>
      </div>

      {/* Fleet Telemetry Status Table */}
      <div className="card-industrial" style={{ padding: '14px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '10px' }}>
          Simulated Fleet Telemetry Table
        </div>

        <table className="table-engineering">
          <thead>
            <tr>
              <th>Node ID</th>
              <th>Sector / Role</th>
              <th>Status</th>
              <th>Sensor Health</th>
              <th>Next-Hop Route</th>
              <th>RSSI</th>
              <th>Packet Loss</th>
              <th>Battery</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(nodes).map(node => (
              <tr key={node.node_id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {node.node_id} {node.isReference && '(REF)'}
                </td>
                <td>{node.sector}</td>
                <td>
                  <span className={`badge-status ${node.status.toLowerCase()}`}>
                    {node.status}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: node.health > 80 ? '#16a34a' : node.health > 50 ? '#d97706' : '#dc2626', fontWeight: 600 }}>
                    {node.health}%
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>
                  {node.status === 'OFFLINE'
                    ? <span style={{ color: '#dc2626', fontWeight: 600 }}>SEVERED</span>
                    : node.routeThrough}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>
                  {node.status === 'OFFLINE' ? '—' : `${node.rssi} dBm`}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>
                  {node.status === 'OFFLINE' ? '100%' : `${node.packet_loss}%`}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>
                  {node.battery}%
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => selectNode(node.node_id)}
                      className="btn-engineering"
                      style={{ padding: '3px 8px', fontSize: '10px' }}
                    >
                      Dossier
                    </button>
                    {!node.isReference && (
                      <button
                        onClick={() => toggleNodeFailure(node.node_id)}
                        className="btn-engineering"
                        style={{ padding: '3px 6px', fontSize: '10px' }}
                        title={node.status === 'OFFLINE' ? 'Restore node' : 'Simulate failure'}
                      >
                        {node.status === 'OFFLINE' ? 'Restore' : 'Fail'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
