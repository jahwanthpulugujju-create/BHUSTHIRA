import React from 'react';
import { useSimulation } from '../../state/simulationContext';
import { X, FileText, Download, Printer, ShieldAlert } from 'lucide-react';

export const IncidentReportModal: React.FC = () => {
  const { activeModal, setActiveModal, riskResult, consensusResult, spatialResult, nodes, currentScenario, simClockSec } = useSimulation();

  if (activeModal !== 'INCIDENT_REPORT') return null;

  const incidentId = 'SIM-INC-2026-0042';
  const generatedTime = new Date().toLocaleString();
  const anomalousNodes = Object.values(nodes).filter(n => n.status === 'ANOMALOUS' || n.status === 'CRITICAL').map(n => n.node_id);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const reportData = {
      incidentId,
      system: 'BHUSTHIRA',
      disclaimer: 'SIMULATION GENERATED INCIDENT REPORT - NOT AN OFFICIAL DGMS CERTIFICATE',
      generatedAt: generatedTime,
      scenario: currentScenario,
      simSecondsElapsed: simClockSec,
      peakRiskScore: riskResult.riskScore,
      peakRiskBand: riskResult.riskBand,
      consensusScore: consensusResult.score,
      confidence: consensusResult.confidence,
      affectedZone: 'Panel B (Seam XI/XII)',
      anomalousNodes,
      evidenceChecklist: [
        'Surface inclinometer tilt departure > 0.40°',
        'Subsurface extensometer displacement acceleration > 1.50 mm',
        'Spatial neighborhood consensus confirmed across contiguous nodes',
        'Micro-seismic vibration energy elevated (0.5 - 25 Hz)',
        'Surface tensile crack conductive ribbon trip'
      ],
      nodesSnapshot: Object.values(nodes).map(n => ({
        id: n.node_id,
        status: n.status,
        health: n.health,
        tilt: n.tilt,
        disp: n.displacement,
        vibe: n.vibration,
        crack: n.crack_signal
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${incidentId}-report.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '740px',
        maxWidth: '100%',
        maxHeight: '90vh',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #cbd5e1'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} color="#0284c7" />
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Incident Dossier: {incidentId}
              </h2>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Automated Incident Audit • BHUSTHIRA Simulation Architecture
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={handlePrint}
              style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px' }}
            >
              <Printer size={13} />
              Print
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleDownloadJSON}
              style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px' }}
            >
              <Download size={13} />
              Export JSON
            </button>
            <button
              onClick={() => setActiveModal('NONE')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                padding: '4px',
                borderRadius: '4px'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Report Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Official Dossier Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="/logo.png" alt="BHUSTHIRA" style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'contain', border: '1px solid #e2e8f0', padding: '2px', background: '#ffffff' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>BHUSTHIRA</h3>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Real-Time Mine Subsidence Intelligence & Early Warning System</div>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b' }}>
              <div><strong style={{ color: '#0f172a' }}>SIH26025</strong> Prototype Dossier</div>
              <div>Generated: {new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC</div>
            </div>
          </div>
          {/* Statutory Simulation Notice */}
          <div style={{
            padding: '10px 14px',
            borderRadius: '4px',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            fontSize: '11px',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldAlert size={16} color="#d97706" style={{ flexShrink: 0 }} />
            <span>
              <strong>Simulation Incident Report:</strong> This document was generated automatically from synthetic telemetry for hackathon evaluation (SIH26025). 
              Not an official Directorate General of Mines Safety (DGMS) regulatory certificate.
            </span>
          </div>

          {/* Metadata Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '14px'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Incident Identifier</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                {incidentId}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Simulated Scenario</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                {currentScenario}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Current Risk Level</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: riskResult.riskScore > 70 ? '#dc2626' : riskResult.riskScore > 50 ? '#d97706' : '#15803d' }}>
                {riskResult.riskScore} / 100 ({riskResult.riskBand})
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Deformation Consensus</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0284c7' }}>
                {consensusResult.score} / 100 ({consensusResult.confidence})
              </div>
            </div>
          </div>

          {/* Geological & Spatial Context */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Spatial & Geotechnical Domain
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px', color: '#334155' }}>
              <div><strong>Affected Panel:</strong> Panel B (Active Longwall Extraction)</div>
              <div><strong>Monitored Seams:</strong> Seam XI / XII Superimposed Workings</div>
              <div><strong>Depth of Cover:</strong> 180 m Average Depth</div>
              <div><strong>Anomalous Nodes:</strong> {anomalousNodes.length > 0 ? anomalousNodes.join(', ') : 'None (Baseline Range)'}</div>
              <div><strong>Spatial Consensus:</strong> {spatialResult.neighborAgreementRatio} nodes correlated ({spatialResult.spatialCorrelationLevel})</div>
              <div><strong>Network State:</strong> Mesh routes active through GW-01</div>
            </div>
          </div>

          {/* Primary Evidence Synthesis */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Primary Physical Evidence Synthesis
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>
                <strong>Surface Inclinometer (Tilt):</strong> Maximum observed tilt of {Math.max(...Object.values(nodes).map(n => n.tilt)).toFixed(2)}° departing from baseline by {Math.abs(Math.max(...Object.values(nodes).map(n => n.tilt)) - 0.15).toFixed(2)}°.
              </li>
              <li>
                <strong>Extensometer Displacement:</strong> Subsurface tensile stretch reached {Math.max(...Object.values(nodes).map(n => n.displacement)).toFixed(2)} mm with sustained positive velocity.
              </li>
              <li>
                <strong>Spatial Correlation:</strong> Multiple independent sensor nodes in adjacent sectors exhibit synchronized kinematic movement.
              </li>
              <li>
                <strong>Acoustic / Micro-Seismic Energy:</strong> High-frequency transient roof-fracturing vibration signatures observed in 0.5–25 Hz bandwidth.
              </li>
              <li>
                <strong>Sensor Fleet Validation:</strong> Battery reserves and packet delivery ratios confirm hardware integrity; single-sensor false fault hypothesis rejected.
              </li>
            </ul>
          </div>

          {/* Sensor Fleet Telemetry Snapshot */}
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sensor Fleet Status at Incident Snapshot
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #e2e8f0' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', color: '#475569' }}>Node ID</th>
                  <th style={{ padding: '8px 10px', color: '#475569' }}>Panel Sector</th>
                  <th style={{ padding: '8px 10px', color: '#475569' }}>Status</th>
                  <th style={{ padding: '8px 10px', color: '#475569' }}>Health</th>
                  <th style={{ padding: '8px 10px', color: '#475569' }}>Tilt</th>
                  <th style={{ padding: '8px 10px', color: '#475569' }}>Displacement</th>
                  <th style={{ padding: '8px 10px', color: '#475569' }}>Vibration</th>
                  <th style={{ padding: '8px 10px', color: '#475569' }}>Crack Signal</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(nodes).map(n => (
                  <tr key={n.node_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 10px', fontWeight: 700 }}>{n.node_id}</td>
                    <td style={{ padding: '6px 10px' }}>{n.panel}</td>
                    <td style={{ padding: '6px 10px' }}>
                      <span className={`badge ${n.status === 'CRITICAL' ? 'badge-critical' : n.status === 'ANOMALOUS' ? 'badge-warning' : n.status === 'OFFLINE' ? 'badge-critical' : 'badge-normal'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                        {n.status}
                      </span>
                    </td>
                    <td style={{ padding: '6px 10px' }}>{n.health}%</td>
                    <td style={{ padding: '6px 10px' }}>{n.tilt.toFixed(2)}°</td>
                    <td style={{ padding: '6px 10px' }}>{n.displacement.toFixed(2)} mm</td>
                    <td style={{ padding: '6px 10px' }}>{n.vibration.toFixed(2)} g</td>
                    <td style={{ padding: '6px 10px', color: n.crack_signal ? '#dc2626' : '#15803d', fontWeight: 600 }}>
                      {n.crack_signal ? 'TRIPPED' : 'INTACT'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Log Recommendation */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
              Shift In-Charge / Shift Safety Officer Response Protocol
            </div>
            <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
              Verify subsurface tension crack perimeter around Panel B Sector 03. Deploy physical tape extensometer check to benchmark pillars. 
              If consensus exceeds 80 with CRITICAL risk, initiate precautionary perimeter standoff in accordance with Mine Safety Regulation 112.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Report Hash: SHA256-SIM-{simClockSec}-{Math.round(riskResult.riskScore * 142.5)}
          </span>
          <button
            className="btn btn-primary"
            onClick={() => setActiveModal('NONE')}
            style={{ fontSize: '12px' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
