import React, { useState } from 'react';
import { SimulationProvider } from './state/simulationContext';
import { GlobalHeader } from './components/Header/GlobalHeader';
import { SidebarNav } from './components/Navigation/SidebarNav';
import type { NavTab } from './components/Navigation/SidebarNav';
import { CommandCenter } from './components/CommandCenter/CommandCenter';
import { MineMapPage } from './components/MineMap/MineMapPage';
import { SensorNetworkPage } from './components/SensorNetwork/SensorNetworkPage';
import { DeformationIntelligencePage } from './components/DeformationIntelligence/DeformationIntelligencePage';
import { RiskAlertsPage } from './components/RiskAlerts/RiskAlertsPage';
import { IncidentReplayPage } from './components/IncidentReplay/IncidentReplayPage';
import { SystemHealthPage } from './components/SystemHealth/SystemHealthPage';
import { DeploymentArchitecturePage } from './components/DeploymentArchitecture/DeploymentArchitecturePage';

// Common Modals & Drawers
import { EvidenceDrawer } from './components/Common/EvidenceDrawer';
import { NodeDetailDrawer } from './components/Common/NodeDetailDrawer';
import { IncidentReportModal } from './components/Common/IncidentReportModal';
import { AddNodeModal } from './components/Common/AddNodeModal';
import { ConfigureNodeModal } from './components/Common/ConfigureNodeModal';
import { SimulatedAlertModals } from './components/Common/SimulatedAlertModals';
import { LiveTelemetryModal } from './components/Common/LiveTelemetryModal';

const AppShell: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('COMMAND_CENTER');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'var(--font-sans)'
    }}>
      {/* 1. Global Standard Header */}
      <GlobalHeader />

      {/* 2. Main Body with Navigation Rail & Scrollable Content */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* Left Operations Rail */}
        <SidebarNav activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Center Main View Area */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {activeTab === 'COMMAND_CENTER' && <CommandCenter />}
          {activeTab === 'MINE_MAP' && <MineMapPage />}
          {activeTab === 'SENSOR_NETWORK' && <SensorNetworkPage />}
          {activeTab === 'DEFORMATION_INTEL' && <DeformationIntelligencePage />}
          {activeTab === 'RISK_ALERTS' && <RiskAlertsPage />}
          {activeTab === 'INCIDENT_REPLAY' && <IncidentReplayPage />}
          {activeTab === 'SYSTEM_HEALTH' && <SystemHealthPage />}
          {activeTab === 'DEPLOYMENT_ARCH' && <DeploymentArchitecturePage />}

          {/* Persistent Professional Engineering Scope Footer */}
          <footer style={{
            marginTop: 'auto',
            paddingTop: '16px',
            borderTop: '1px solid #e2e8f0',
            fontSize: '11px',
            color: '#64748b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <strong>BHUSTHIRA</strong> • SIH26025 Prototype • 
              <span style={{ marginLeft: '4px', color: '#0284c7', fontWeight: 600 }}>Simulation Mode • Synthetic Sensor Telemetry</span>
            </div>
            <div>
              Prototype Scope: Calibrated heuristic digital twin. Requires mine-specific geotechnical calibration prior to field deployment.
            </div>
          </footer>
        </main>
      </div>

      {/* 3. Global Overlays, Drawers & Modals */}
      <EvidenceDrawer />
      <NodeDetailDrawer />
      <IncidentReportModal />
      <AddNodeModal />
      <ConfigureNodeModal />
      <SimulatedAlertModals />
      <LiveTelemetryModal />
    </div>
  );
};

export default function App() {
  return (
    <SimulationProvider>
      <AppShell />
    </SimulationProvider>
  );
}
