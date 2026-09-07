import React from 'react';
import { useSimulation } from '../../state/simulationContext';

export const SensorNetworkPage: React.FC = () => {
  const {
    nodes,
    cloudStatus,
    bufferedEventsCount,
    toggleNodeFailure,
    toggleCloudConnection,
    selectNode
  } = useSimulation();

  const isN04Offline = nodes['N04']?.status === 'OFFLINE';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header Bar */}
      <div className="card-industrial" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            BHUSTHIRA Sensor Network
          </h2>
          <p style={{ fontSize: '11px', color: '#64748b' }}>
            Wireless mesh network topology, packet delivery health, and dynamic failover rerouting for underground mining telemetry.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="sim-tag">
            NETWORK SIMULATION • SUB-GHZ MESH
          </span>
        </div>
      </div>

      {/* Resilience Simulation Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
      }}>
        {/* Fail Node Demonstration */}
        <div className="card-industrial" style={{ padding: '14px', background: isN04Offline ? '#fff7ed' : '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              Node Failure & Dynamic Route Failover
            </span>
            <span className={`badge-status ${isN04Offline ? 'warning' : 'normal'}`}>
              {isN04Offline ? 'N04 OFFLINE • REROUTED' : 'ALL NODES ROUTED'}
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.45, marginBottom: '12px' }}>
            Simulate a catastrophic hardware loss or battery exhaustion on Node N04. Observe neighboring nodes self-healing the mesh route directly to Edge Gateway GW-01.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => toggleNodeFailure('N04')}
              className={`btn-engineering ${isN04Offline ? 'primary' : 'danger'}`}
            >
              {isN04Offline ? 'RESTORE NODE N04' : 'FAIL NODE N04 (SIMULATE OUTAGE)'}
            </button>
            {isN04Offline && (
              <span style={{ fontSize: '11px', color: '#c2410c', fontWeight: 600 }}>
                ✓ Mesh dynamic reroute active via N03
              </span>
            )}
          </div>
        </div>

        {/* Cloud Disconnect Demonstration */}
        <div className="card-industrial" style={{ padding: '14px', background: cloudStatus === 'DISCONNECTED' ? '#fef2f2' : '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              Cloud Uplink Resilience & Edge Islanding
            </span>
            <span className={`badge-status ${cloudStatus === 'DISCONNECTED' ? 'critical' : 'normal'}`}>
              {cloudStatus === 'DISCONNECTED' ? 'EDGE ISOLATED' : 'CLOUD SYNCED'}
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.45, marginBottom: '12px' }}>
            Simulate an underground-to-cloud backhaul fiber cut. The local EDGE-01 processor continues running all anomaly detection, consensus, and alert logic offline.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={toggleCloudConnection}
              className={`btn-engineering ${cloudStatus === 'DISCONNECTED' ? 'primary' : 'warning'}`}
            >
              {cloudStatus === 'CONNECTED' ? 'DISCONNECT CLOUD' : 'RESTORE CONNECTION'}
            </button>
            {cloudStatus === 'DISCONNECTED' && (
              <span style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 600 }}>
                ✓ Local edge storage active ({bufferedEventsCount} buffered events)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mesh Topology Table */}
      <div className="card-industrial" style={{ padding: '14px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '10px' }}>
          Node Telemetry Fleet Status
        </div>

        <table className="table-engineering">
          <thead>
            <tr>
              <th>Node ID</th>
              <th>Sector / Location</th>
              <th>Status</th>
              <th>Health</th>
              <th>Next Hop</th>
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
                  {node.status === 'OFFLINE' ? '— (NO ROUTE)' : node.routeThrough}
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
