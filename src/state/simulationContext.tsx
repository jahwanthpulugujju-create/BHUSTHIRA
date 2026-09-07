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
import { getScenarioStateAtTime } from '../simulation/scenarioEngine';
import { calculateNodeAnomaly } from '../intelligence/anomalyDetection';
import { analyzeSpatialCorrelation } from '../intelligence/spatialCorrelation';
import type { SpatialAnalysisResult } from '../intelligence/spatialCorrelation';
import { evaluateDeformationConsensus } from '../intelligence/consensusEngine';
import type { ConsensusResult } from '../intelligence/consensusEngine';
import { evaluateMineRisk } from '../intelligence/riskEngine';
import type { RiskEvaluationResult } from '../intelligence/riskEngine';
import { formatSimulationTime } from '../utils/timeFormatters';

export interface SimulationContextType {
  // State
  simClockSec: number;
  isRunning: boolean;
  simSpeed: number;
  currentScenario: ScenarioType;
  demoPhaseName: string;
  isDemoMode: boolean;
  demoPhaseIndex: number;
  demoTotalPhases: number;
  isPresentationMode: boolean;
  nodes: Record<string, SensorNode>;
  panels: Record<string, MinePanel>;
  meshLinks: MeshLink[];
  cloudStatus: 'CONNECTED' | 'DISCONNECTED' | 'SYNCHRONIZING';
  bufferedEventsCount: number;
  networkHealth: number;
  failedNodeId: string | null;
  
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
  activeModal: 'NONE' | 'EVIDENCE' | 'INCIDENT_REPORT' | 'ADD_NODE' | 'CONFIG_NODE' | 'LIVE_TELEMETRY' | 'MOBILE_SMS' | 'EMAIL_ALERT' | 'SHORTCUTS' | 'DATA_SOURCE';
  
  // Actions
  startSimulation: () => void;
  pauseSimulation: () => void;
  togglePlayPause: () => void;
  resetSimulation: (fullReset?: boolean) => void;
  setSimSpeed: (speed: number) => void;
  changeScenario: (scenario: ScenarioType) => void;
  startGuidedDemo: () => void;
  nextDemoPhase: () => void;
  prevDemoPhase: () => void;
  exitDemoMode: () => void;
  togglePresentationMode: () => void;
  selectNode: (nodeId: string | null) => void;
  selectPanel: (panelId: string | null) => void;
  setActiveModal: (modal: 'NONE' | 'EVIDENCE' | 'INCIDENT_REPORT' | 'ADD_NODE' | 'CONFIG_NODE' | 'LIVE_TELEMETRY' | 'MOBILE_SMS' | 'EMAIL_ALERT' | 'SHORTCUTS' | 'DATA_SOURCE') => void;
  toggleNodeFailure: (nodeId: string) => void;
  toggleCloudConnection: () => void;
  skipToWarning: () => void;
  skipToCritical: () => void;
  jumpToSimSecond: (second: number) => void;
  addNewNode: (name: string, panel: 'Panel A' | 'Panel B' | 'Panel C' | 'Panel D', x: number, y: number) => void;
  updateNodeConfig: (nodeId: string, updates: Partial<SensorNode>) => void;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

// Guided demo phase time milestones
const DEMO_PHASE_TIMES = [0, 16, 31, 46, 61, 76, 91, 106, 126];

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Simulation starts PAUSED by default in Normal equilibrium
  const [simClockSec, setSimClockSec] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [currentScenario, setCurrentScenario] = useState<ScenarioType>('NORMAL');
  const [demoPhaseName, setDemoPhaseName] = useState<string>('Ready • Simulation Paused');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [demoPhaseIndex, setDemoPhaseIndex] = useState<number>(1);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  
  const [nodes, setNodes] = useState<Record<string, SensorNode>>(INITIAL_NODES);
  const [panels, setPanels] = useState<Record<string, MinePanel>>(INITIAL_PANELS);
  const [meshLinks, setMeshLinks] = useState<MeshLink[]>(INITIAL_LINKS);
  const [cloudStatus, setCloudStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'SYNCHRONIZING'>('CONNECTED');
  const [bufferedEventsCount, setBufferedEventsCount] = useState<number>(0);
  const [networkHealth, setNetworkHealth] = useState<number>(98);
  const [failedNodeId, setFailedNodeId] = useState<string | null>(null);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>('Panel B');
  const [activeModal, setActiveModal] = useState<'NONE' | 'EVIDENCE' | 'INCIDENT_REPORT' | 'ADD_NODE' | 'CONFIG_NODE' | 'LIVE_TELEMETRY' | 'MOBILE_SMS' | 'EMAIL_ALERT' | 'SHORTCUTS' | 'DATA_SOURCE'>('NONE');
  
  const [alertHistory, setAlertHistory] = useState<SystemAlert[]>([]);
  const [eventLog, setEventLog] = useState<IncidentEvent[]>([
    {
      id: 'INIT-00-SYSTEM_BOOT',
      timestamp: 'T+00:00',
      simSecond: 0,
      type: 'SYSTEM_BOOT',
      severity: 'INFO',
      description: 'BHUSTHIRA edge intelligence online. 6 virtual sensors calibrated against baseline equilibrium.'
    }
  ]);
  
  // Historical time-series buffer (30 points)
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

  // Synchronize alerts cleanly
  const prevAlertIdRef = useRef<string | null>(null);
  useEffect(() => {
    const currentAlert = riskResult.activeAlert;
    if (currentAlert && currentAlert.id !== prevAlertIdRef.current) {
      prevAlertIdRef.current = currentAlert.id;
      setAlertHistory(prev => {
        if (prev.some(a => a.id === currentAlert.id)) return prev;
        return [currentAlert, ...prev.slice(0, 19)];
      });
    }
  }, [riskResult.activeAlert]);

  // Stable advancement function using functional state references
  const advanceSimulation = useCallback(() => {
    setSimClockSec(prevSec => {
      const nextSec = prevSec + 1;
      
      const step = getScenarioStateAtTime(
        currentScenario,
        nextSec,
        INITIAL_NODES,
        INITIAL_PANELS,
        INITIAL_LINKS,
        {
          cloudManualDisconnect: cloudStatus === 'DISCONNECTED',
          nodeManualFailId: failedNodeId
        }
      );

      setNodes(step.nodes);
      setPanels(step.panels);
      setMeshLinks(step.links);
      setCloudStatus(step.cloudStatus);
      setBufferedEventsCount(step.bufferedEvents);
      setNetworkHealth(step.networkHealth);
      if (step.demoPhaseName) setDemoPhaseName(step.demoPhaseName);
      if (step.demoPhaseIndex) setDemoPhaseIndex(step.demoPhaseIndex);

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
  }, [currentScenario, cloudStatus, failedNodeId, riskResult.riskScore, consensusResult.score]);

  // Stable Simulation Timer Loop
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      const intervalMs = Math.max(80, Math.floor(1000 / simSpeed));
      timerRef.current = setInterval(advanceSimulation, intervalMs);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, simSpeed, advanceSimulation]);

  // Jump to specific simulation second (Deterministic State Reconstruction)
  const jumpToSimSecond = useCallback((targetSec: number) => {
    const safeSec = Math.max(0, targetSec);
    setSimClockSec(safeSec);
    
    const reconstructed = getScenarioStateAtTime(
      currentScenario,
      safeSec,
      INITIAL_NODES,
      INITIAL_PANELS,
      INITIAL_LINKS,
      {
        cloudManualDisconnect: cloudStatus === 'DISCONNECTED',
        nodeManualFailId: failedNodeId
      }
    );

    setNodes(reconstructed.nodes);
    setPanels(reconstructed.panels);
    setMeshLinks(reconstructed.links);
    setCloudStatus(reconstructed.cloudStatus);
    setBufferedEventsCount(reconstructed.bufferedEvents);
    setNetworkHealth(reconstructed.networkHealth);
    if (reconstructed.demoPhaseName) setDemoPhaseName(reconstructed.demoPhaseName);
    if (reconstructed.demoPhaseIndex) setDemoPhaseIndex(reconstructed.demoPhaseIndex);

    // Populate retroactive telemetry window
    const newHist: TelemetrySnapshot[] = [];
    for (let s = Math.max(0, safeSec - 29); s <= safeSec; s++) {
      const pastState = getScenarioStateAtTime(
        currentScenario,
        s,
        INITIAL_NODES,
        INITIAL_PANELS,
        INITIAL_LINKS,
        { cloudManualDisconnect: cloudStatus === 'DISCONNECTED', nodeManualFailId: failedNodeId }
      );
      const pastAnom = Object.values(pastState.nodes).filter(n => n.status === 'ANOMALOUS' || n.status === 'CRITICAL').length;
      const pastTilt = Number((Object.values(pastState.nodes).reduce((acc, n) => acc + n.tilt, 0) / Math.max(1, Object.values(pastState.nodes).length)).toFixed(2));
      const pastDisp = Number((Object.values(pastState.nodes).reduce((acc, n) => acc + n.displacement, 0) / Math.max(1, Object.values(pastState.nodes).length)).toFixed(2));
      const pastVib = Number((Object.values(pastState.nodes).reduce((acc, n) => acc + n.vibration, 0) / Math.max(1, Object.values(pastState.nodes).length)).toFixed(2));
      
      newHist.push({
        simSecond: s,
        riskScore: pastAnom > 0 ? Math.min(85, 18 + s * 1.2) : 18,
        consensusScore: pastAnom > 0 ? Math.min(80, 15 + s * 1.1) : 18,
        avgTilt: pastTilt,
        avgDisp: pastDisp,
        avgVib: pastVib,
        activeAnomalousCount: pastAnom
      });
    }
    while (newHist.length < 30) {
      newHist.unshift({
        simSecond: newHist[0].simSecond - 1,
        riskScore: 18,
        consensusScore: 18,
        avgTilt: 0.20,
        avgDisp: 0.52,
        avgVib: 0.08,
        activeAnomalousCount: 0
      });
    }
    setTelemetryHistory(newHist);
  }, [currentScenario, cloudStatus, failedNodeId]);

  // Handlers
  const startSimulation = () => setIsRunning(true);
  const pauseSimulation = () => setIsRunning(false);
  const togglePlayPause = () => setIsRunning(prev => !prev);

  const resetSimulation = useCallback((fullReset = false) => {
    setIsRunning(false);
    setSimClockSec(0);
    setCurrentScenario('NORMAL');
    setIsDemoMode(false);
    setDemoPhaseIndex(1);
    setDemoPhaseName('Ready • Baseline Environmental Equilibrium');
    setFailedNodeId(null);
    setNodes(INITIAL_NODES);
    setPanels(INITIAL_PANELS);
    setMeshLinks(INITIAL_LINKS);
    setCloudStatus('CONNECTED');
    setBufferedEventsCount(0);
    setNetworkHealth(98);
    setSelectedNodeId(null);
    prevAlertIdRef.current = null;
    
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
        id: `RESET-${Date.now()}`,
        timestamp: 'T+00:00',
        simSecond: 0,
        type: 'SYSTEM_BOOT',
        severity: 'INFO',
        description: fullReset
          ? 'System fully reset. Telemetry buffers, mesh links, and scenario state restored to baseline.'
          : 'Scenario reset to baseline equilibrium. Ready for evaluator demonstration.'
      }
    ]);
  }, []);

  const changeScenario = useCallback((scenario: ScenarioType) => {
    setIsRunning(false);
    setSimClockSec(0);
    setCurrentScenario(scenario);
    setIsDemoMode(scenario === 'FULL_DEMO');
    setDemoPhaseIndex(1);
    setFailedNodeId(null);
    prevAlertIdRef.current = null;
    
    // Compute initial state at T=0 for selected scenario
    const initStep = getScenarioStateAtTime(scenario, 0, INITIAL_NODES, INITIAL_PANELS, INITIAL_LINKS);
    setNodes(initStep.nodes);
    setPanels(initStep.panels);
    setMeshLinks(initStep.links);
    setCloudStatus(initStep.cloudStatus);
    setBufferedEventsCount(0);
    setNetworkHealth(initStep.networkHealth);
    setDemoPhaseName(`Ready • ${scenario.replace(/_/g, ' ')}`);

    setEventLog(prev => [
      {
        id: `SCENARIO-${scenario}-${Date.now()}`,
        timestamp: 'T+00:00',
        simSecond: 0,
        type: 'SCENARIO_START',
        severity: 'INFO',
        description: `Operational scenario selected: ${scenario.replace(/_/g, ' ')}. Ready to start.`
      },
      ...prev
    ]);
  }, []);

  // Guided Demo Mode Controls
  const startGuidedDemo = useCallback(() => {
    changeScenario('GRADUAL_SUBSIDENCE');
    setIsDemoMode(true);
    setDemoPhaseIndex(1);
    setIsRunning(true);
    setSimSpeed(2); // 2x speed for comfortable 2-minute judging demo
  }, [changeScenario]);

  const nextDemoPhase = useCallback(() => {
    if (demoPhaseIndex < DEMO_PHASE_TIMES.length) {
      const nextIdx = demoPhaseIndex + 1;
      const targetSec = DEMO_PHASE_TIMES[nextIdx - 1];
      setDemoPhaseIndex(nextIdx);
      jumpToSimSecond(targetSec);
    }
  }, [demoPhaseIndex, jumpToSimSecond]);

  const prevDemoPhase = useCallback(() => {
    if (demoPhaseIndex > 1) {
      const prevIdx = demoPhaseIndex - 1;
      const targetSec = DEMO_PHASE_TIMES[prevIdx - 1];
      setDemoPhaseIndex(prevIdx);
      jumpToSimSecond(targetSec);
    }
  }, [demoPhaseIndex, jumpToSimSecond]);

  const exitDemoMode = useCallback(() => {
    setIsDemoMode(false);
    setSimSpeed(1);
  }, []);

  const togglePresentationMode = useCallback(() => {
    setIsPresentationMode(prev => !prev);
  }, []);

  // Precise State Reconstruction for Skip Buttons
  const skipToWarning = useCallback(() => {
    setCurrentScenario('GRADUAL_SUBSIDENCE');
    jumpToSimSecond(50); // Warning inflection milestone
    setIsRunning(true);
  }, [jumpToSimSecond]);

  const skipToCritical = useCallback(() => {
    setCurrentScenario('GRADUAL_SUBSIDENCE');
    jumpToSimSecond(65); // Critical inflection milestone
    setIsRunning(true);
  }, [jumpToSimSecond]);

  // Fault Injection: Fail / Restore Node
  const toggleNodeFailure = useCallback((nodeId: string) => {
    setFailedNodeId(prev => (prev === nodeId ? null : nodeId));
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
        id: `FAIL-${nodeId}-${Date.now()}`,
        timestamp: formatSimulationTime(simClockSec),
        simSecond: simClockSec,
        type: 'NODE_FAILURE',
        nodeId,
        severity: 'WARNING',
        description: `Instrument toggle: ${nodeId} state changed. Mesh topology and routing updated.`
      },
      ...prev
    ]);
  }, [simClockSec]);

  // Cloud Uplink & Buffer Flush
  const toggleCloudConnection = useCallback(() => {
    if (cloudStatus === 'CONNECTED') {
      setCloudStatus('DISCONNECTED');
      setEventLog(prev => [
        {
          id: `CLOUD-OFFLINE-${Date.now()}`,
          timestamp: formatSimulationTime(simClockSec),
          simSecond: simClockSec,
          type: 'CLOUD_OFFLINE',
          severity: 'WARNING',
          description: 'Cloud link severed. Autonomous on-site EDGE-01 processing islanding active. Local event buffer accumulating.'
        },
        ...prev
      ]);
    } else {
      setCloudStatus('SYNCHRONIZING');
      const countToSync = bufferedEventsCount;
      setTimeout(() => {
        setCloudStatus('CONNECTED');
        setBufferedEventsCount(0);
        setEventLog(prev => [
          {
            id: `CLOUD-SYNC-${Date.now()}`,
            timestamp: formatSimulationTime(simClockSec),
            simSecond: simClockSec,
            type: 'CLOUD_RESTORED',
            severity: 'INFO',
            description: `Cloud uplink restored. Flushed and synchronized ${countToSync} buffered telemetry events to central storage.`
          },
          ...prev
        ]);
      }, 1400);
    }
  }, [cloudStatus, simClockSec, bufferedEventsCount]);

  const addNewNode = useCallback((name: string, panel: 'Panel A' | 'Panel B' | 'Panel C' | 'Panel D', x: number, y: number) => {
    const newId = `N0${Object.keys(nodes).length + 1}`;
    const newNode: SensorNode = {
      node_id: newId,
      name: `${newId} (${name})`,
      x,
      y,
      panel,
      sector: `${panel} Sector Field Expansion`,
      isReference: false,
      status: 'NORMAL',
      health: 99,
      deformationSignal: 'NORMAL',
      tilt: 0.18,
      displacement: 0.45,
      vibration: 0.07,
      crack_signal: false,
      temperature: 27.0,
      battery: 100,
      rssi: -66,
      packet_loss: 0.5,
      lastUpdateSec: simClockSec,
      anomalyScore: 0.04,
      rateOfChangeTilt: 0,
      rateOfChangeDisp: 0,
      persistenceTicks: 0,
      routeThrough: 'GW-01',
      isFaulty: false,
      baseline: { tilt: 0.18, displacement: 0.45, vibration: 0.07 },
      history: {
        tilt: Array(25).fill(0.18),
        displacement: Array(25).fill(0.45),
        vibration: Array(25).fill(0.07)
      }
    };

    setNodes(prev => ({ ...prev, [newId]: newNode }));
    setMeshLinks(prev => [...prev, { from: newId, to: 'GW-01', active: true, rssi: -66, quality: 'GOOD' }]);
    setActiveModal('NONE');
    setEventLog(prev => [
      {
        id: `ADD-${newId}-${Date.now()}`,
        timestamp: formatSimulationTime(simClockSec),
        simSecond: simClockSec,
        type: 'SYSTEM_BOOT',
        nodeId: newId,
        panelId: panel,
        severity: 'INFO',
        description: `Deployment scale-out: Sensor Node ${newId} dynamically integrated into ${panel} active monitoring grid.`
      },
      ...prev
    ]);
  }, [nodes, simClockSec]);

  const updateNodeConfig = useCallback((nodeId: string, updates: Partial<SensorNode>) => {
    setNodes(prev => {
      const existing = prev[nodeId];
      if (!existing) return prev;
      return {
        ...prev,
        [nodeId]: { ...existing, ...updates }
      };
    });
    setActiveModal('NONE');
  }, []);

  // Global Keyboard Shortcuts (Requirement 131)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'r' || e.key === 'R') {
        resetSimulation(false);
      } else if (e.key === '1') {
        changeScenario('NORMAL');
      } else if (e.key === '2') {
        changeScenario('GRADUAL_SUBSIDENCE');
      } else if (e.key === '3') {
        changeScenario('RAPID_SUBSIDENCE');
      } else if (e.key === 'w' || e.key === 'W') {
        skipToWarning();
      } else if (e.key === 'c' || e.key === 'C') {
        skipToCritical();
      } else if (e.key === 'n' || e.key === 'N') {
        toggleNodeFailure('N04');
      } else if (e.key === 'o' || e.key === 'O') {
        toggleCloudConnection();
      } else if (e.key === '?') {
        setActiveModal('SHORTCUTS');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, resetSimulation, changeScenario, skipToWarning, skipToCritical, toggleNodeFailure, toggleCloudConnection]);

  return (
    <SimulationContext.Provider
      value={{
        simClockSec,
        isRunning,
        simSpeed,
        currentScenario,
        demoPhaseName,
        isDemoMode,
        demoPhaseIndex,
        demoTotalPhases: DEMO_PHASE_TIMES.length,
        isPresentationMode,
        nodes: evaluatedNodes,
        panels,
        meshLinks,
        cloudStatus,
        bufferedEventsCount,
        networkHealth,
        failedNodeId,
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
        togglePlayPause,
        resetSimulation,
        setSimSpeed,
        changeScenario,
        startGuidedDemo,
        nextDemoPhase,
        prevDemoPhase,
        exitDemoMode,
        togglePresentationMode,
        selectNode: setSelectedNodeId,
        selectPanel: setSelectedPanelId,
        setActiveModal,
        toggleNodeFailure,
        toggleCloudConnection,
        skipToWarning,
        skipToCritical,
        jumpToSimSecond,
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
