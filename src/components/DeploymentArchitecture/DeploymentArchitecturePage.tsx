import React from 'react';
import { 
  Radio, 
  Cpu, 
  Monitor, 
  Cloud, 
  ShieldAlert, 
  DollarSign, 
  Zap
} from 'lucide-react';

export const DeploymentArchitecturePage: React.FC = () => {
  const hardwareSensors = [
    {
      sensorType: 'Bi-Axial Surface Inclinometer',
      physicalMeasurement: 'Ground tilt / slope gradient (X/Y axes)',
      proposedComponent: 'SCA103T-D04 / ADIS16210 Bi-axial MEMS',
      accuracyCost: '±0.002° resolution • ~$35/node',
      installationRole: 'Installed on 1.5m anchored benchmark pillars on surface terrain overlying coal panels.'
    },
    {
      sensorType: 'Multi-Point Borehole Extensometer',
      physicalMeasurement: 'Subsurface strata differential displacement',
      proposedComponent: 'Linear Potentiometric / LVDT displacement probe',
      accuracyCost: '0.1 mm precision • ~$65/probe',
      installationRole: 'Grouted in vertical exploration boreholes to monitor immediate roof strata sag and bed separation.'
    },
    {
      sensorType: 'Low-Frequency Ground Geophone / Accelerometer',
      physicalMeasurement: 'Micro-seismic fracturing / vibration signatures',
      proposedComponent: '4.5 Hz Omni-directional Geophone + ADXL355',
      accuracyCost: '1 µg/√Hz low noise • ~$45/node',
      installationRole: 'Monitors dynamic seismic energy released during hard roof overhang fractures and main falls.'
    },
    {
      sensorType: 'Tensile Surface Crack Meter',
      physicalMeasurement: 'Ground fissure opening and perimeter shear',
      proposedComponent: 'Conductive resistive ribbon / Potentiometric wire',
      accuracyCost: 'Binary trip / 0.5 mm dilation • ~$15/strip',
      installationRole: 'Pinned across anticipated surface tensile cracks along subsidence trough perimeters.'
    }
  ];

  const migrationRoadmap = [
    {
      domain: 'Sensor Telemetry',
      currentStage: 'Synthetic Sensor Telemetry Engine',
      futureStage: 'Intrinsically Safe (IS) LoRa Mesh Nodes (ESP32-S3 + Semtech SX1262)',
      status: 'PROTOTYPE SIMULATION',
      detail: 'Software deterministic telemetry will be replaced by packet decoders subscribing to standard MQTT field broker topics.'
    },
    {
      domain: 'Mine Geometry',
      currentStage: 'Simulated 2D Vector Coal Panels (Panels A–D)',
      futureStage: 'AutoCAD DXF / MicroStation Mine Survey Plans & Digital Elevation Model (DEM)',
      status: 'PARAMETRIC VECTOR',
      detail: 'Geometrical panels will bind directly to georeferenced coordinates certified by qualified mine survey teams under DGMS regulations.'
    },
    {
      domain: 'Risk Calibration',
      currentStage: 'Heuristic Kinematic Consensus Scoring (0–100)',
      futureStage: 'Empirical Subsidence Profile Functions (e.g. Peck / National Coal Board UK / CMPDI empirical curves)',
      status: 'ALGORITHMIC BASELINE',
      detail: 'Scoring weights require geological calibration factoring in extraction thickness, depth of cover, and rock mass rating (RMR).'
    },
    {
      domain: 'Early Warning Dispatch',
      currentStage: 'Simulated In-Browser SMS / Dispatch Notification',
      futureStage: 'Direct SCADA Integration, Siren Activation, Shift Supervisor Cellular Broadcast',
      status: 'SIMULATED INTERFACE',
      detail: 'Hardwired relays on Edge-01 trigger audible sirens in pit control rooms while cellular gateways deliver automated SMS alerts.'
    }
  ];

  const costComparison = [
    {
      item: 'Surface Monitoring Cluster (6 Nodes)',
      conventionalCost: '₹ 25,00,000 - 45,00,000 (Imported Total Stations / InSAR contracts)',
      bhusthiraProposedCost: '₹ 1,80,000 - 2,50,000 (Low-Cost Distributed MEMS Mesh)',
      savings: '85 - 90% Capital Expenditure Reduction'
    },
    {
      item: 'Sampling Frequency & Latency',
      conventionalCost: 'Weekly / Bi-weekly manual levelling; 12-day InSAR satellite revisit',
      bhusthiraProposedCost: 'Real-time (5-second edge polling; instant event triggered bursts)',
      savings: 'Continuous early warning vs retrospective damage survey'
    },
    {
      item: 'Underground / Surface Power Resilience',
      conventionalCost: 'Heavy lead-acid stations requiring frequent technician battery swaps',
      bhusthiraProposedCost: 'Ultra-low power sleep states + 10W monocrystalline solar harvesting (5+ yr lifecycle)',
      savings: 'Zero operational downtime in remote Indian coalfields'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
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
              Proposed Field Deployment Architecture
            </h1>
            <span className="badge badge-neutral">PROPOSED SPECIFICATION</span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Engineering blueprint for transitioning from software-defined digital twin to physical field deployment in Indian underground coal mines.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Target Application</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>SIH26025 Coal Mine Subsidence</div>
        </div>
      </div>

      {/* End-to-End Pipeline Visualization */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        borderRadius: '6px', 
        border: '1px solid #e2e8f0', 
        padding: '24px' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              Physical-to-Digital Mine Intelligence Pipeline
            </h2>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              End-to-end edge-first architecture ensuring autonomous operation even during total cloud disconnect.
            </div>
          </div>
          <span className="badge badge-normal">ZERO-CLOUD-DEPENDENCY DECISION SUPPORT</span>
        </div>

        {/* Visual Architecture Flow Diagram */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: '12px',
          alignItems: 'stretch'
        }}>
          {/* Stage 1: Field Nodes */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ backgroundColor: '#e2e8f0', borderRadius: '4px', padding: '6px' }}>
                <Radio size={16} color="#0284c7" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>LAYER 1</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Surface Sensor Nodes
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4', flex: 1 }}>
              Ruggedized IP67 nodes (N01–N06) with bi-axial tilt, displacement extensometers, vibration geophones, and crack sensors.
            </div>
            <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>
              Solar + LiFePO4 • Sub-GHz Mesh
            </div>
          </div>

          {/* Stage 2: Mesh Network */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ backgroundColor: '#e2e8f0', borderRadius: '4px', padding: '6px' }}>
                <Zap size={16} color="#10b981" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>LAYER 2</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Sub-GHz RF Mesh
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4', flex: 1 }}>
              Self-healing multi-hop 868 MHz LoRa mesh. Resilient against line-of-sight obstruction in rugged overburden dumps.
            </div>
            <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
              &gt; 2.5 km Line-of-Sight Range
            </div>
          </div>

          {/* Stage 3: Edge Gateway */}
          <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #93c5fd', borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ backgroundColor: '#bfdbfe', borderRadius: '4px', padding: '6px' }}>
                <Cpu size={16} color="#0369a1" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1' }}>LAYER 3 (CORE)</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Edge Gateway (EDGE-01)
            </div>
            <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4', flex: 1 }}>
              On-site industrial edge computer hosting BHUSTHIRA engine: Baseline normalization, spatial consensus, and risk classification.
            </div>
            <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #bfdbfe', fontSize: '11px', color: '#0369a1', fontWeight: 700 }}>
              Autonomous Local Decision Island
            </div>
          </div>

          {/* Stage 4: Control Room */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ backgroundColor: '#e2e8f0', borderRadius: '4px', padding: '6px' }}>
                <Monitor size={16} color="#d97706" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>LAYER 4</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Mine Control Room
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4', flex: 1 }}>
              Command Center display for mine shift supervisors, audio siren triggers, and automated SMS dispatch to safety officers.
            </div>
            <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: '#d97706', fontWeight: 600 }}>
              Immediate Action Verification
            </div>
          </div>

          {/* Stage 5: Optional Cloud */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ backgroundColor: '#e2e8f0', borderRadius: '4px', padding: '6px' }}>
                <Cloud size={16} color="#64748b" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>LAYER 5 (OPTIONAL)</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Central HQ Cloud
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4', flex: 1 }}>
              Store-and-forward batch telemetry synchronization for DGMS statutory audits and inter-mine geological research.
            </div>
            <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              Decoupled from local alerts
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Specifications & Hardware Feasibility */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '20px' }}>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
          Low-Cost Physical Sensor Specifications
        </h2>
        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
          Designed around commercially available, industrial-grade MEMS components to fulfill the "Low Cost" requirement of SIH26025.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {hardwareSensors.map((item, idx) => (
            <div key={idx} style={{ 
              border: '1px solid #e2e8f0', 
              borderRadius: '6px', 
              padding: '16px', 
              backgroundColor: '#f8fafc' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{item.sensorType}</div>
                <span className="badge badge-neutral" style={{ fontSize: '10px' }}>PROPOSED SENSOR</span>
              </div>
              
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '10px' }}>
                <strong>Measurement:</strong> {item.physicalMeasurement}
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>IC / Probe:</strong> <span style={{ fontFamily: 'monospace', color: '#0284c7' }}>{item.proposedComponent}</span></div>
                <div><strong>Resolution / Cost:</strong> {item.accuracyCost}</div>
                <div style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>{item.installationRole}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* From Simulation to Field Migration Matrix */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              From Simulation to Field: Transition Roadmap
            </h2>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Clear architectural boundary separating prototype demonstration from future operational calibration.
            </div>
          </div>
          <span className="badge badge-normal">CLEAR BOUNDARIES</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569' }}>Subsystem Domain</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569' }}>Current Prototype (Software Simulation)</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569' }}>Operational Field Implementation</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569' }}>Architectural Migration Pathway</th>
              </tr>
            </thead>
            <tbody>
              {migrationRoadmap.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>{row.domain}</td>
                  <td style={{ padding: '12px 14px', color: '#d97706', fontWeight: 600 }}>
                    <span style={{ backgroundColor: '#fef3c7', padding: '3px 8px', borderRadius: '4px' }}>
                      {row.currentStage}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#15803d', fontWeight: 600 }}>
                    <span style={{ backgroundColor: '#dcfce7', padding: '3px 8px', borderRadius: '4px' }}>
                      {row.futureStage}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#475569', lineHeight: '1.4' }}>{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Economic & Feasibility Analysis for Indian Coal Sector */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <DollarSign size={18} color="#15803d" />
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            Techno-Economic Feasibility for Coal India / SCCL Operations
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {costComparison.map((cost, idx) => (
            <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px', backgroundColor: '#f8fafc' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
                {cost.item}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Traditional Approach:</div>
              <div style={{ fontSize: '12px', color: '#b91c1c', fontWeight: 600, marginBottom: '8px' }}>
                {cost.conventionalCost}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>BHUSTHIRA Proposed:</div>
              <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 700, marginBottom: '8px' }}>
                {cost.bhusthiraProposedCost}
              </div>
              <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '6px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                {cost.savings}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Regulatory & Honesty Disclaimer */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: '12px', 
        padding: '16px 20px', 
        backgroundColor: '#fffbeb', 
        borderRadius: '6px', 
        border: '1px solid #fde68a',
        fontSize: '12px',
        color: '#92400e',
        lineHeight: '1.5'
      }}>
        <ShieldAlert size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Statutory Compliance & Field Calibration Notice:</strong>
          <p style={{ margin: '4px 0 0 0' }}>
            BHUSTHIRA is a software-defined digital twin demonstration developed for SIH26025. 
            All measurements, scores, and topology graphs presented in this release are <strong>synthetic simulation artifacts</strong>. 
            Physical deployment in actual underground coal mines requires strict compliance with the Directorate General of Mines Safety (DGMS) regulations, 
            Intrinsically Safe (IS) equipment certification under PESO/CIMFR standards, and mine-specific geomechanical calibration before any life-critical operational use.
          </p>
        </div>
      </div>
    </div>
  );
};
