import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type {
  SensorNode,
  MinePanel,
  ScenarioType,
  RiskBand,
  SystemAlert,
  IncidentEvent,
  RiskBreakdown,
  TelemetrySnapshot,
  MeshLink
} from '../types';
import { INITIAL_NODES, INITIAL_PANELS, INITIAL_LINKS } from '../simulation/mineModel';
import { updateScenarioStep } from '../simulation/scenarioEngine';
import { calculateNodeAnomaly } from '../intelligence/anomalyDetection';
import { analyzeSpatialCorrelation } from '../intelligence/spatialCorrelation';
import type { SpatialAnalysisResult } from '../intelligence/spatialCorrelation';
import { evaluateDeformationConsensus } from '../intelligence/consensusEngine';
import type { ConsensusResult } from '../intelligence/consensusEngine';
import { evaluateMineRisk } from '../intelligence/riskEngine';
import type { RiskEvaluationResult } from '../intelligence/riskEngine';

interface SimulationContextType {
  // State
  simClockSec: number;
  isRunning: boolean;
  simSpeed: number;
  currentScenario: ScenarioType;
  demoPhaseName: string;
  nodes: Record<string, SensorNode>;
  panels: Record<string, MinePanel>;
  meshLinks: MeshLink[];
  cloudStatus: 'CONNECTED' | 'DISCONNECTED' | 'SYNCHRONIZING';
  bufferedEventsCount: number;
  networkHealth: number;
  
  // Intelligence Outputs
  consensusResult: ConsensusResult;
  spatialResult: SpatialAnalysisResult;
  riskResult: RiskEvaluationResult;
  riskScore: number;
  riskBand: RiskBand;
  riskBreakdown: RiskBreakdown;
  activeAlert: SystemAlert | null;
  alertHistory: SystemAlert[];
  eventLog: IncidentEvent[];
  telemetryHistory: TelemetrySnapshot[];
  
  // Interactivity
  selectedNodeId: string | null;
  selectedPanelId: string | null;
  activeModal: 'NONE' | 'EVIDENCE' | 'INCIDENT_REPORT' | 'ADD_NODE' | 'CONFIG_NODE' | 'LIVE_TELEMETRY' | 'MOBILE_SMS' | 'EMAIL_ALERT';
  
  // Actions
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  setSimSpeed: (speed: number) => void;
  changeScenario: (scenario: ScenarioType) => void;
  selectNode: (nodeId: string | null) => void;
  selectPanel: (panelId: string | null) => void;
  setActiveModal: (modal: 'NONE' | 'EVIDENCE' | 'INCIDENT_REPORT' | 'ADD_NODE' | 'CONFIG_NODE' | 'LIVE_TELEMETRY' | 'MOBILE_SMS' | 'EMAIL_ALERT') => void;
  toggleNodeFailure: (nodeId: string) => void;
  toggleCloudConnection: () => void;
  skipToWarning: () => void;
  skipToCritical: () => void;
  addNewNode: (name: string, panel: 'Panel A' | 'Panel B' | 'Panel C' | 'Panel D', x: number, y: number) => void;
  updateNodeConfig: (nodeId: string, updates: Partial<SensorNode>) => void;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [simClockSec, setSimClockSec] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [currentScenario, setCurrentScenario] = useState<ScenarioType>('NORMAL');
  const [demoPhaseName, setDemoPhaseName] = useState<string>('Baseline Environmental Conditions');
  
  const [nodes, setNodes] = useState<Record<string, SensorNode>>(INITIAL_NODES);
  const [panels, setPanels] = useState<Record<string, MinePanel>>(INITIAL_PANELS);
  const [meshLinks, setMeshLinks] = useState<MeshLink[]>(INITIAL_LINKS);
  const [cloudStatus, setCloudStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'SYNCHRONIZING'>('CONNECTED');
  const [bufferedEventsCount, setBufferedEventsCount] = useState<number>(0);
  const [networkHealth, setNetworkHealth] = useState<number>(98);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>('Panel B');
  const [activeModal, setActiveModal] = useState<'NONE' | 'EVIDENCE' | 'INCIDENT_REPORT' | 'ADD_NODE' | 'CONFIG_NODE' | 'LIVE_TELEMETRY' | 'MOBILE_SMS' | 'EMAIL_ALERT'>('NONE');
  
  const [alertHistory, setAlertHistory] = useState<SystemAlert[]>([]);
  const [eventLog, setEventLog] = useState<IncidentEvent[]>([
    {
      id: 'evt-init',
      timestamp: '14:00:00',
      simSecond: 0,
      type: 'SYSTEM_BOOT',
      severity: 'INFO',
      description: 'BHUSTHIRA edge intelligence initialized. 6 virtual sensors calibrated against baseline.'
    }
  ]);
  
  // Historical time-series buffer (last 40 points)
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetrySnapshot[]>(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      simSecond: i - 30,
      riskScore: 18,
      consensusScore: 18,
      avgTilt: 0.20,
      avgDisp: 0.52,
      avgVib: 0.08,
      activeAnomalousCount: 0
    }));
  });

  // Calculate Intelligence pipeline for current node states
  const evaluatedNodes = React.useMemo(() => {
    const updated: Record<string, SensorNode> = {};
    Object.keys(nodes).forEach(id => {
      const n = nodes[id];
      const anomaly = calculateNodeAnomaly(n);
      updated[id] = {
        ...n,
        anomalyScore: anomaly.score,
        rateOfChangeTilt: anomaly.rateOfChangeTilt,
        rateOfChangeDisp: anomaly.rateOfChangeDisp,
        deformationSignal: anomaly.score > 0.75 ? 'CRITICAL' : anomaly.score > 0.4 ? 'HIGH' : anomaly.score > 0.2 ? 'ELEVATED' : 'NORMAL'
      };
    });
    return updated;
  }, [nodes]);

  const spatialResult = React.useMemo(() => {
    return analyzeSpatialCorrelation(evaluatedNodes, 'Panel B');
  }, [evaluatedNodes]);

  const consensusResult = React.useMemo(() => {
    return evaluateDeformationConsensus(evaluatedNodes, spatialResult, networkHealth);
  }, [evaluatedNodes, spatialResult, networkHealth]);

  const riskResult = React.useMemo(() => {
    return evaluateMineRisk(simClockSec, evaluatedNodes, consensusResult, spatialResult);
  }, [simClockSec, evaluatedNodes, consensusResult, spatialResult]);

  // Sync active alert into alert history
  useEffect(() => {
    if (riskResult.activeAlert) {
      setAlertHistory(prev => {
        const exists = prev.some(a => a.id === riskResult.activeAlert?.id);
        if (!exists && riskResult.activeAlert) {
          return [riskResult.activeAlert, ...prev.slice(0, 19)];
        }
        return prev;
      });
    }
  }, [riskResult.activeAlert]);

  // Main simulation tick loop
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stepSimulation = useCallback(() => {
    setSimClockSec(prevSec => {
      const nextSec = prevSec + 1;
      
      const step = updateScenarioStep(
        currentScenario,
        nextSec,
        nodes,
        panels,
        meshLinks,
        cloudStatus,
        bufferedEventsCount
      );

      setNodes(step.nodes);
      setPanels(step.panels);
      setMeshLinks(step.links);
      setCloudStatus(step.cloudStatus);
      setBufferedEventsCount(step.bufferedEvents);
      setNetworkHealth(step.networkHealth);
      if (step.demoPhaseName) setDemoPhaseName(step.demoPhaseName);

      if (step.newEvents.length > 0) {
        setEventLog(prev => [...step.newEvents, ...prev.slice(0, 49)]);
      }

      // Record snapshot for live charts
      const activeAnomCount = Object.values(step.nodes).filter(n => n.status === 'ANOMALOUS' || n.status === 'CRITICAL').length;
      const avgTilt = Number((Object.values(step.nodes).reduce((acc, n) => acc + n.tilt, 0) / Math.max(1, Object.values(step.nodes).length)).toFixed(2));
      const avgDisp = Number((Object.values(step.nodes).reduce((acc, n) => acc + n.displacement, 0) / Math.max(1, Object.values(step.nodes).length)).toFixed(2));
      const avgVib = Number((Object.values(step.nodes).reduce((acc, n) => acc + n.vibration, 0) / Math.max(1, Object.values(step.nodes).length)).toFixed(2));

      setTelemetryHistory(prev => [
        ...prev.slice(1),
        {
          simSecond: nextSec,
          riskScore: riskResult.riskScore,
          consensusScore: consensusResult.score,
          avgTilt,
          avgDisp,
          avgVib,
          activeAnomalousCount: activeAnomCount
        }
      ]);

      return nextSec;
    });
  }, [currentScenario, nodes, panels, meshLinks, cloudStatus, bufferedEventsCount, riskResult.riskScore, consensusResult.score]);

  useEffect(() => {
    if (isRunning) {
      const intervalMs = Math.max(100, Math.floor(1000 / simSpeed));
      timerRef.current = setInterval(stepSimulation, intervalMs);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, simSpeed, stepSimulation]);

  // Handlers
  const startSimulation = () => setIsRunning(true);
  const pauseSimulation = () => setIsRunning(false);
  
  const resetSimulation = () => {
    setSimClockSec(0);
    setCurrentScenario('NORMAL');
    setDemoPhaseName('Baseline Environmental Conditions');
    setNodes(INITIAL_NODES);
    setPanels(INITIAL_PANELS);
    setMeshLinks(INITIAL_LINKS);
    setCloudStatus('CONNECTED');
    setBufferedEventsCount(0);
    setNetworkHealth(98);
    setTelemetryHistory(Array.from({ length: 30 }, (_, i) => ({
      simSecond: i - 30,
      riskScore: 18,
      consensusScore: 18,
      avgTilt: 0.20,
      avgDisp: 0.52,
      avgVib: 0.08,
      activeAnomalousCount: 0
    })));
    setEventLog([
      {
        id: `evt-reset-${Date.now()}`,
        timestamp: '14:00:00',
        simSecond: 0,
        type: 'SYSTEM_BOOT',
        severity: 'INFO',
        description: 'System reset to baseline. Telemetry buffers and scenario clocks restored.'
      }
    ]);
  };

  const changeScenario = (scenario: ScenarioType) => {
    setSimClockSec(0);
    setCurrentScenario(scenario);
    setIsRunning(true);
    setEventLog(prev => [
      {
        id: `evt-scen-${Date.now()}`,
        timestamp: '14:00:00',
        simSecond: 0,
        type: 'SCENARIO_START',
        severity: 'INFO',
        description: `Operational scenario changed to: ${scenario}. Telemetry stream re-initialized.`
      },
      ...prev
    ]);
  };

  const toggleNodeFailure = (nodeId: string) => {
    setNodes(prev => {
      const node = prev[nodeId];
      if (!node) return prev;
      const isCurrentlyOffline = node.status === 'OFFLINE';
      const updatedStatus = isCurrentlyOffline ? 'NORMAL' : 'OFFLINE';
      return {
        ...prev,
        [nodeId]: {
          ...node,
          status: updatedStatus,
          health: isCurrentlyOffline ? 96 : 0,
          packet_loss: isCurrentlyOffline ? 1.0 : 100,
          rssi: isCurrentlyOffline ? -72 : -120
        }
      };
    });

    setMeshLinks(prev => {
      return prev.map(l => {
        if (l.from === nodeId || l.to === nodeId) {
          return { ...l, active: !l.active };
        }
        return l;
      });
    });

    setEventLog(prev => [
      {
        id: `evt-fail-${Date.now()}`,
        timestamp: '14:03:00',
        simSecond: simClockSec,
        type: 'NODE_FAILURE',
        nodeId,
        severity: 'WARNING',
        description: `Simulated Node Failure: ${nodeId} toggled state. Mesh routes dynamically reconfigured.`
      },
      ...prev
    ]);
  };

  const toggleCloudConnection = () => {
    if (cloudStatus === 'CONNECTED') {
      setCloudStatus('DISCONNECTED');
      setEventLog(prev => [
        {
          id: `evt-cloud-${Date.now()}`,
          timestamp: '14:04:12',
          simSecond: simClockSec,
          type: 'CLOUD_OFFLINE',
          severity: 'WARNING',
          description: 'Cloud link severed. Edge-01 autonomous processing islanding engaged. Local buffer active.'
        },
        ...prev
      ]);
    } else {
      setCloudStatus('SYNCHRONIZING');
      setTimeout(() => {
        setCloudStatus('CONNECTED');
        setBufferedEventsCount(0);
        setEventLog(prev => [
          {
            id: `evt-cloud-sync-${Date.now()}`,
            timestamp: '14:04:45',
            simSecond: simClockSec,
            type: 'CLOUD_RESTORED',
            severity: 'INFO',
            description: 'Cloud uplink restored. Edge telemetry buffer flushed and synchronized with central cloud repository.'
          },
          ...prev
        ]);
      }, 1500);
    }
  };

  const skipToWarning = () => {
    setCurrentScenario('GRADUAL_SUBSIDENCE');
    setSimClockSec(34);
    setIsRunning(true);
  };

  const skipToCritical = () => {
    setCurrentScenario('GRADUAL_SUBSIDENCE');
    setSimClockSec(54);
    setIsRunning(true);
  };

  const addNewNode = (name: string, panel: 'Panel A' | 'Panel B' | 'Panel C' | 'Panel D', x: number, y: number) => {
    const newId = `N0${Object.keys(nodes).length + 1}`;
    const newNode: SensorNode = {
      node_id: newId,
      name: `${newId} (${name})`,
      x,
      y,
      panel,
      sector: `${panel} Sector Custom`,
      isReference: false,
      status: 'NORMAL',
      health: 99,
      deformationSignal: 'NORMAL',
      tilt: 0.15,
      displacement: 0.40,
      vibration: 0.06,
      crack_signal: false,
      temperature: 27.0,
      battery: 100,
      rssi: -66,
      packet_loss: 0.5,
      lastUpdateSec: 1,
      anomalyScore: 0.04,
      rateOfChangeTilt: 0,
      rateOfChangeDisp: 0,
      persistenceTicks: 0,
      routeThrough: 'GW-01',
      isFaulty: false,
      baseline: { tilt: 0.15, displacement: 0.40, vibration: 0.06 },
      history: {
        tilt: Array(25).fill(0.15),
        displacement: Array(25).fill(0.40),
        vibration: Array(25).fill(0.06)
      }
    };

    setNodes(prev => ({ ...prev, [newId]: newNode }));
    setMeshLinks(prev => [...prev, { from: newId, to: 'GW-01', active: true, rssi: -66, quality: 'GOOD' }]);
    setActiveModal('NONE');
    setEventLog(prev => [
      {
        id: `evt-add-${Date.now()}`,
        timestamp: '14:05:00',
        simSecond: simClockSec,
        type: 'SYSTEM_BOOT',
        nodeId: newId,
        panelId: panel,
        severity: 'INFO',
        description: `Scaled deployment: Sensor Node ${newId} dynamically integrated into ${panel} active mesh.`
      },
      ...prev
    ]);
  };

  const updateNodeConfig = (nodeId: string, updates: Partial<SensorNode>) => {
    setNodes(prev => {
      const existing = prev[nodeId];
      if (!existing) return prev;
      return {
        ...prev,
        [nodeId]: { ...existing, ...updates }
      };
    });
    setActiveModal('NONE');
  };

  return (
    <SimulationContext.Provider
      value={{
        simClockSec,
        isRunning,
        simSpeed,
        currentScenario,
        demoPhaseName,
        nodes: evaluatedNodes,
        panels,
        meshLinks,
        cloudStatus,
        bufferedEventsCount,
        networkHealth,
        consensusResult,
        spatialResult,
        riskResult,
        riskScore: riskResult.riskScore,
        riskBand: riskResult.riskBand,
        riskBreakdown: riskResult.breakdown,
        activeAlert: riskResult.activeAlert,
        alertHistory,
        eventLog,
        telemetryHistory,
        selectedNodeId,
        selectedPanelId,
        activeModal,
        startSimulation,
        pauseSimulation,
        resetSimulation,
        setSimSpeed,
        changeScenario,
        selectNode: setSelectedNodeId,
        selectPanel: setSelectedPanelId,
        setActiveModal,
        toggleNodeFailure,
        toggleCloudConnection,
        skipToWarning,
        skipToCritical,
        addNewNode,
        updateNodeConfig
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
