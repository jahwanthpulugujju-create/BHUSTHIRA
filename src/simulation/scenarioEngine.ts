import type { ScenarioType, SensorNode, MinePanel, MeshLink, IncidentEvent } from '../types';
import { deterministicNoise } from './deterministicNoise';
import { formatSimulationTime } from '../utils/timeFormatters';

export interface ScenarioStepState {
  nodes: Record<string, SensorNode>;
  panels: Record<string, MinePanel>;
  links: MeshLink[];
  cloudStatus: 'CONNECTED' | 'DISCONNECTED' | 'SYNCHRONIZING';
  bufferedEvents: number;
  networkHealth: number;
  newEvents: IncidentEvent[];
  demoPhaseName: string;
  demoPhaseIndex?: number;
  demoTotalPhases?: number;
}

/**
 * Pure, deterministic scenario state evaluator for BHUSTHIRA.
 * Given a scenario and exact simulation second, computes the exact reproducible system state.
 * Used for live tick advances, Skip-to-Warning, Skip-to-Critical, and Incident Replay.
 */
export function getScenarioStateAtTime(
  scenario: ScenarioType,
  elapsedSec: number,
  baseNodes: Record<string, SensorNode>,
  basePanels: Record<string, MinePanel>,
  baseLinks: MeshLink[],
  options?: {
    seed?: string;
    cloudManualDisconnect?: boolean;
    nodeManualFailId?: string | null;
  }
): ScenarioStepState {
  const seed = options?.seed || 'BHUSTHIRA-SIH26025';
  const updatedNodes: Record<string, SensorNode> = {};
  const updatedPanels: Record<string, MinePanel> = {};
  let updatedLinks: MeshLink[] = baseLinks.map(l => ({ ...l }));
  let cloudStatus: 'CONNECTED' | 'DISCONNECTED' | 'SYNCHRONIZING' = options?.cloudManualDisconnect ? 'DISCONNECTED' : 'CONNECTED';
  let bufferedEvents = 0;
  let networkHealth = 98;
  const newEvents: IncidentEvent[] = [];
  let demoPhaseName = 'Baseline Environmental Conditions';
  let demoPhaseIndex = 1;
  const demoTotalPhases = 9;

  // Deep-clone panels
  Object.keys(basePanels).forEach(id => {
    updatedPanels[id] = { ...basePanels[id] };
  });

  // Deep-clone nodes with initialized 25-point history
  Object.keys(baseNodes).forEach(id => {
    const orig = baseNodes[id];
    updatedNodes[id] = {
      ...orig,
      history: {
        tilt: [...orig.history.tilt.slice(1), orig.tilt],
        displacement: [...orig.history.displacement.slice(1), orig.displacement],
        vibration: [...orig.history.vibration.slice(1), orig.vibration]
      }
    };
  });

  // SCENARIOS
  switch (scenario) {
    case 'NORMAL': {
      demoPhaseName = 'Baseline Environmental Conditions';
      demoPhaseIndex = 1;
      Object.keys(updatedNodes).forEach(id => {
        const node = updatedNodes[id];
        const noise = deterministicNoise(seed, elapsedSec, id, 0.02);
        node.status = 'NORMAL';
        node.isFaulty = false;
        node.persistenceTicks = 0;
        node.crack_signal = false;
        node.tilt = Number((node.baseline.tilt + noise).toFixed(2));
        node.displacement = Number((node.baseline.displacement + noise * 1.5).toFixed(2));
        node.vibration = Number((node.baseline.vibration + Math.abs(noise) * 0.4).toFixed(2));
        node.temperature = Number((27.5 + noise * 5).toFixed(1));
        node.packet_loss = 0.8;
      });
      break;
    }

    case 'GRADUAL_SUBSIDENCE':
    case 'FULL_DEMO': {
      // 9 Controlled Engineering Phases across 125 seconds:
      if (elapsedSec < 15) {
        // Phase 1: Baseline (0 - 15s)
        demoPhaseName = 'Phase 1/9: Baseline Environmental Conditions';
        demoPhaseIndex = 1;
        Object.keys(updatedNodes).forEach(id => {
          const node = updatedNodes[id];
          const noise = deterministicNoise(seed, elapsedSec, id, 0.02);
          node.tilt = Number((node.baseline.tilt + noise).toFixed(2));
          node.displacement = Number((node.baseline.displacement + noise * 1.2).toFixed(2));
          node.vibration = Number((node.baseline.vibration + Math.abs(noise) * 0.3).toFixed(2));
          node.status = 'NORMAL';
          node.crack_signal = false;
          node.persistenceTicks = 0;
        });
      } else if (elapsedSec < 30) {
        // Phase 2: Early Anomaly on Centroid N03 (15 - 30s)
        demoPhaseName = 'Phase 2/9: Early Anomaly Detection on Centroid N03';
        demoPhaseIndex = 2;
        const p = (elapsedSec - 15) / 15;
        const n03 = updatedNodes['N03'];
        n03.tilt = Number((0.25 + p * 0.45 + deterministicNoise(seed, elapsedSec, 'N03', 0.02)).toFixed(2));
        n03.displacement = Number((0.65 + p * 1.6 + deterministicNoise(seed, elapsedSec, 'N03', 0.04)).toFixed(2));
        n03.vibration = Number((0.09 + p * 0.12).toFixed(2));
        n03.persistenceTicks = Math.floor(elapsedSec - 14);
        n03.status = 'ANOMALOUS';

        if (elapsedSec === 16) {
          newEvents.push({
            id: `GRADUAL-16-NODE_ANOMALY-N03`,
            timestamp: formatSimulationTime(elapsedSec),
            simSecond: elapsedSec,
            type: 'NODE_ANOMALY',
            nodeId: 'N03',
            panelId: 'Panel B',
            severity: 'INFO',
            description: 'N03 centroid tilt rate exceeded 0.15°/min baseline threshold.'
          });
        }
      } else if (elapsedSec < 45) {
        // Phase 3: Spatial Correlation Across Panel B Flanks (30 - 45s)
        demoPhaseName = 'Phase 3/9: Spatial Correlation Across Panel B Flanks';
        demoPhaseIndex = 3;
        const p = (elapsedSec - 30) / 15;
        const n03 = updatedNodes['N03'];
        n03.tilt = Number((0.70 + p * 0.45 + deterministicNoise(seed, elapsedSec, 'N03', 0.02)).toFixed(2));
        n03.displacement = Number((2.25 + p * 2.1 + deterministicNoise(seed, elapsedSec, 'N03', 0.04)).toFixed(2));
        n03.persistenceTicks = Math.floor(elapsedSec - 14);
        n03.status = 'ANOMALOUS';

        const n02 = updatedNodes['N02'];
        n02.tilt = Number((0.22 + p * 0.48).toFixed(2));
        n02.displacement = Number((0.58 + p * 1.5).toFixed(2));
        n02.persistenceTicks = Math.floor(elapsedSec - 28);
        n02.status = 'ANOMALOUS';

        const n04 = updatedNodes['N04'];
        n04.tilt = Number((0.20 + p * 0.42).toFixed(2));
        n04.displacement = Number((0.51 + p * 1.4).toFixed(2));
        n04.persistenceTicks = Math.floor(elapsedSec - 29);
        n04.status = 'ANOMALOUS';

        if (elapsedSec === 31) {
          newEvents.push({
            id: `GRADUAL-31-SPATIAL_CORRELATION-PanelB`,
            timestamp: formatSimulationTime(elapsedSec),
            simSecond: elapsedSec,
            type: 'SPATIAL_CORRELATION',
            panelId: 'Panel B',
            severity: 'WATCH',
            description: 'N02 and N04 show convergent displacement trends. Spatial cluster agreement established.'
          });
        }
      } else if (elapsedSec < 60) {
        // Phase 4: Warning State: Sustained Subsidence Convergence (45 - 60s)
        demoPhaseName = 'Phase 4/9: Warning State: Multi-Sensor Subsidence Convergence';
        demoPhaseIndex = 4;
        const p = (elapsedSec - 45) / 15;
        const n03 = updatedNodes['N03'];
        n03.tilt = Number((1.15 + p * 0.55).toFixed(2));
        n03.displacement = Number((4.35 + p * 3.2).toFixed(2));
        n03.vibration = Number((0.21 + p * 0.28).toFixed(2));
        n03.persistenceTicks = Math.floor(elapsedSec - 14);
        n03.status = 'ANOMALOUS';

        const n02 = updatedNodes['N02'];
        n02.tilt = Number((0.70 + p * 0.52).toFixed(2));
        n02.displacement = Number((2.08 + p * 2.6).toFixed(2));
        n02.persistenceTicks = Math.floor(elapsedSec - 28);
        n02.status = 'ANOMALOUS';

        const n04 = updatedNodes['N04'];
        n04.tilt = Number((0.62 + p * 0.48).toFixed(2));
        n04.displacement = Number((1.91 + p * 2.3).toFixed(2));
        n04.persistenceTicks = Math.floor(elapsedSec - 29);
        n04.status = 'ANOMALOUS';

        if (elapsedSec === 46) {
          newEvents.push({
            id: `GRADUAL-46-ALERT_GENERATED-PanelB`,
            timestamp: formatSimulationTime(elapsedSec),
            simSecond: elapsedSec,
            type: 'ALERT_GENERATED',
            panelId: 'Panel B',
            severity: 'WARNING',
            description: 'WARNING: Deformation Consensus crossed 65/100. Panel B surface warning zone active.'
          });
        }
      } else if (elapsedSec < 75) {
        // Phase 5: Critical State: Accelerated Convergence & Crack Detection (60 - 75s)
        demoPhaseName = 'Phase 5/9: Critical State: Accelerated Convergence & Crack Detection';
        demoPhaseIndex = 5;
        const p = (elapsedSec - 60) / 15;
        const n03 = updatedNodes['N03'];
        n03.tilt = Number((1.70 + p * 0.40).toFixed(2));
        n03.displacement = Number((7.55 + p * 2.1).toFixed(2));
        n03.vibration = Number((0.49 + p * 0.32).toFixed(2));
        n03.crack_signal = true;
        n03.persistenceTicks = Math.floor(elapsedSec - 14);
        n03.status = 'CRITICAL';

        const n02 = updatedNodes['N02'];
        n02.tilt = Number((1.22 + p * 0.38).toFixed(2));
        n02.displacement = Number((4.68 + p * 1.8).toFixed(2));
        n02.crack_signal = p > 0.4;
        n02.status = 'CRITICAL';

        const n04 = updatedNodes['N04'];
        n04.tilt = Number((1.10 + p * 0.35).toFixed(2));
        n04.displacement = Number((4.21 + p * 1.7).toFixed(2));
        n04.status = 'CRITICAL';

        if (elapsedSec === 61) {
          newEvents.push({
            id: `GRADUAL-61-RISK_ESCALATION-PanelB`,
            timestamp: formatSimulationTime(elapsedSec),
            simSecond: elapsedSec,
            type: 'RISK_ESCALATION',
            panelId: 'Panel B',
            severity: 'CRITICAL',
            description: 'CRITICAL: Acoustic emission crack detection registered on N03. Rate of convergence accelerating.'
          });
        }
      } else if (elapsedSec < 90) {
        // Phase 6: Cloud Outage & Autonomous Edge Islanding (75 - 90s)
        demoPhaseName = 'Phase 6/9: Cloud Outage & Autonomous Edge Islanding';
        demoPhaseIndex = 6;
        cloudStatus = 'DISCONNECTED';
        // Buffered events accumulate strictly on every tick during cloud outage
        bufferedEvents = Math.floor(elapsedSec - 74);

        // Ground movements remain elevated
        const n03 = updatedNodes['N03'];
        n03.tilt = 2.05;
        n03.displacement = 9.4;
        n03.vibration = 0.78;
        n03.crack_signal = true;
        n03.status = 'CRITICAL';

        const n02 = updatedNodes['N02'];
        n02.tilt = 1.55;
        n02.displacement = 6.2;
        n02.status = 'CRITICAL';

        const n04 = updatedNodes['N04'];
        n04.tilt = 1.42;
        n04.displacement = 5.7;
        n04.status = 'CRITICAL';

        if (elapsedSec === 76) {
          newEvents.push({
            id: `GRADUAL-76-CLOUD_OFFLINE-SYSTEM`,
            timestamp: formatSimulationTime(elapsedSec),
            simSecond: elapsedSec,
            type: 'CLOUD_OFFLINE',
            severity: 'WARNING',
            description: 'Cloud uplink severed. EDGE-01 autonomous edge processing islanding active with local event buffering.'
          });
        }
      } else if (elapsedSec < 105) {
        // Phase 7: Node Failure & Dynamic Mesh Rerouting (90 - 105s)
        demoPhaseName = 'Phase 7/9: Node Failure & Dynamic Mesh Rerouting';
        demoPhaseIndex = 7;
        cloudStatus = 'DISCONNECTED';
        bufferedEvents = Math.floor(elapsedSec - 74);

        // N04 fails completely
        const n04 = updatedNodes['N04'];
        n04.status = 'OFFLINE';
        n04.health = 0;
        n04.packet_loss = 100;
        n04.rssi = -120;
        n04.displacement = 5.7;
        n04.lastUpdateSec = 90;

        networkHealth = 84;

        // Disconnect links to N04, reroute N02/N03 directly to Gateway
        updatedLinks = updatedLinks.map(l => {
          if (l.from === 'N04' || l.to === 'N04') return { ...l, active: false };
          return l;
        });

        if (elapsedSec === 91) {
          newEvents.push({
            id: `GRADUAL-91-NODE_FAILURE-N04`,
            timestamp: formatSimulationTime(elapsedSec),
            simSecond: elapsedSec,
            type: 'NODE_FAILURE',
            nodeId: 'N04',
            severity: 'WARNING',
            description: 'Instrument N04 telemetry lost (packet loss 100%). Dynamic mesh failover engaged via N03.'
          });
          newEvents.push({
            id: `GRADUAL-91-ROUTE_RECOVERY-N04`,
            timestamp: formatSimulationTime(elapsedSec),
            simSecond: elapsedSec,
            type: 'ROUTE_RECOVERY',
            nodeId: 'N03',
            severity: 'INFO',
            description: 'Mesh route recovery established: telemetry packets rerouted through Gateway node N03.'
          });
        }
      } else if (elapsedSec < 125) {
        // Phase 8: Cloud Link Restored & Stabilization (105 - 125s)
        demoPhaseName = 'Phase 8/9: Cloud Restored & Subsidence Stabilization';
        demoPhaseIndex = 8;
        cloudStatus = elapsedSec < 108 ? 'SYNCHRONIZING' : 'CONNECTED';
        bufferedEvents = elapsedSec < 108 ? Math.max(0, 31 - (elapsedSec - 105) * 10) : 0;

        // Ground velocity decelerates smoothly
        const decay = (125 - elapsedSec) / 20;
        const n03 = updatedNodes['N03'];
        n03.tilt = Number((0.35 + decay * 1.6).toFixed(2));
        n03.displacement = Number((1.2 + decay * 7.8).toFixed(2));
        n03.vibration = Number((0.11 + decay * 0.6).toFixed(2));
        n03.crack_signal = decay > 0.6;
        n03.status = decay > 0.4 ? 'ANOMALOUS' : 'NORMAL';

        const n02 = updatedNodes['N02'];
        n02.tilt = Number((0.28 + decay * 1.2).toFixed(2));
        n02.displacement = Number((0.85 + decay * 5.1).toFixed(2));
        n02.status = decay > 0.5 ? 'ANOMALOUS' : 'NORMAL';

        // N04 restored
        const n04 = updatedNodes['N04'];
        n04.status = 'NORMAL';
        n04.health = 94;
        n04.packet_loss = 1.4;
        n04.rssi = -76;
        n04.tilt = Number((0.24 + decay * 1.1).toFixed(2));
        n04.displacement = Number((0.75 + decay * 4.6).toFixed(2));

        if (elapsedSec === 106) {
          newEvents.push({
            id: `GRADUAL-106-CLOUD_RESTORED-SYSTEM`,
            timestamp: formatSimulationTime(elapsedSec),
            simSecond: elapsedSec,
            type: 'CLOUD_RESTORED',
            severity: 'INFO',
            description: 'Cloud uplink restored. Edge telemetry buffer flushed and synchronized with central cloud repository.'
          });
        }
      } else {
        // Phase 9: Incident Resolved (125s+)
        demoPhaseName = 'Phase 9/9: Incident Resolved & Forensic Dossier Available';
        demoPhaseIndex = 9;
        cloudStatus = 'CONNECTED';
        bufferedEvents = 0;
        networkHealth = 98;

        Object.keys(updatedNodes).forEach(id => {
          const node = updatedNodes[id];
          node.status = 'NORMAL';
          node.crack_signal = false;
          node.persistenceTicks = 0;
          node.tilt = node.baseline.tilt;
          node.displacement = node.baseline.displacement;
          node.vibration = node.baseline.vibration;
        });

        if (elapsedSec === 126) {
          newEvents.push({
            id: `GRADUAL-126-INCIDENT_RESOLVED-PanelB`,
            timestamp: formatSimulationTime(elapsedSec),
            simSecond: elapsedSec,
            type: 'INCIDENT_RESOLVED',
            panelId: 'Panel B',
            severity: 'INFO',
            description: 'Ground equilibrium restored. Incident SIM-INC-GRADUAL-001 resolved. Telemetry baseline verified.'
          });
        }
      }
      break;
    }

    case 'SENSOR_FAULT': {
      demoPhaseName = 'Isolated Transducer Artifact Discrimination';
      demoPhaseIndex = 1;
      // N03 spikes to extreme values, but neighboring N02 and N04 are completely baseline!
      const n03 = updatedNodes['N03'];
      n03.displacement = Number((8.60 + deterministicNoise(seed, elapsedSec, 'N03', 0.15)).toFixed(2));
      n03.tilt = 0.28;
      n03.vibration = 0.10;
      n03.crack_signal = false;
      n03.status = 'ANOMALOUS';
      n03.health = 74; // Degraded transducer health
      n03.isFaulty = true;

      // Surrounding nodes strictly baseline
      if (updatedNodes['N02']) {
        updatedNodes['N02'].displacement = 0.58;
        updatedNodes['N02'].status = 'NORMAL';
        updatedNodes['N02'].isFaulty = false;
      }
      if (updatedNodes['N04']) {
        updatedNodes['N04'].displacement = 0.51;
        updatedNodes['N04'].status = 'NORMAL';
        updatedNodes['N04'].isFaulty = false;
      }
      break;
    }

    case 'RAPID_SUBSIDENCE': {
      demoPhaseName = 'Rapid Dynamic Strata Convergence Stress Test';
      const p = Math.min(1.0, elapsedSec / 22);
      const n03 = updatedNodes['N03'];
      n03.tilt = Number((0.25 + p * 2.8).toFixed(2));
      n03.displacement = Number((0.65 + p * 13.5).toFixed(2));
      n03.vibration = Number((0.09 + p * 0.92).toFixed(2));
      n03.crack_signal = true;
      n03.status = 'CRITICAL';
      n03.persistenceTicks = 14;

      const n02 = updatedNodes['N02'];
      n02.tilt = Number((0.22 + p * 2.2).toFixed(2));
      n02.displacement = Number((0.58 + p * 9.8).toFixed(2));
      n02.vibration = Number((0.08 + p * 0.75).toFixed(2));
      n02.crack_signal = true;
      n02.status = 'CRITICAL';

      const n04 = updatedNodes['N04'];
      n04.tilt = Number((0.20 + p * 2.0).toFixed(2));
      n04.displacement = Number((0.51 + p * 8.9).toFixed(2));
      n04.vibration = Number((0.08 + p * 0.68).toFixed(2));
      n04.status = 'CRITICAL';
      break;
    }

    case 'NODE_FAILURE': {
      demoPhaseName = 'Mesh Route Recovery & Redundancy';
      if (updatedNodes['N04']) {
        const n04 = updatedNodes['N04'];
        n04.status = 'OFFLINE';
        n04.health = 0;
        n04.packet_loss = 100;
        n04.rssi = -120;
      }
      updatedLinks = updatedLinks.map(l => {
        if (l.from === 'N04' || l.to === 'N04') return { ...l, active: false };
        return l;
      });
      break;
    }

    case 'NETWORK_DEGRADED': {
      demoPhaseName = 'Mesh Channel Congestion & Packet Drop';
      networkHealth = 64;
      Object.keys(updatedNodes).forEach(id => {
        const pLoss = 14.5 + (deterministicNoise(seed, elapsedSec, id, 0.05) * 40);
        updatedNodes[id].packet_loss = Number(Math.max(10, Math.min(30, pLoss)).toFixed(1));
        updatedNodes[id].rssi = -88;
      });
      break;
    }

    case 'MULTI_SENSOR_ANOMALY': {
      demoPhaseName = 'Concurrent Multimodal Strain Verification';
      ['N02', 'N03', 'N04'].forEach(id => {
        const n = updatedNodes[id];
        n.tilt = Number((n.baseline.tilt + 0.85).toFixed(2));
        n.displacement = Number((n.baseline.displacement + 3.8).toFixed(2));
        n.vibration = Number((n.baseline.vibration + 0.35).toFixed(2));
        n.status = 'ANOMALOUS';
      });
      break;
    }

    case 'CLOUD_OFFLINE': {
      demoPhaseName = 'Autonomous Edge Islanding Demonstration';
      cloudStatus = 'DISCONNECTED';
      bufferedEvents = Math.max(1, elapsedSec);
      break;
    }

    case 'RECOVERY': {
      demoPhaseName = 'Post-Incident Strata Stabilization';
      const decay = Math.max(0, 1.0 - elapsedSec / 30);
      const n03 = updatedNodes['N03'];
      n03.tilt = Number((0.25 + decay * 1.5).toFixed(2));
      n03.displacement = Number((0.65 + decay * 6.5).toFixed(2));
      n03.status = decay > 0.4 ? 'ANOMALOUS' : 'NORMAL';

      const n02 = updatedNodes['N02'];
      n02.tilt = Number((0.22 + decay * 1.1).toFixed(2));
      n02.displacement = Number((0.58 + decay * 4.2).toFixed(2));
      n02.status = decay > 0.5 ? 'ANOMALOUS' : 'NORMAL';
      break;
    }
  }

  // Handle manual node failure override if requested
  if (options?.nodeManualFailId && updatedNodes[options.nodeManualFailId]) {
    const failed = updatedNodes[options.nodeManualFailId];
    failed.status = 'OFFLINE';
    failed.health = 0;
    failed.packet_loss = 100;
    failed.rssi = -120;
    updatedLinks = updatedLinks.map(l => {
      if (l.from === options.nodeManualFailId || l.to === options.nodeManualFailId) {
        return { ...l, active: false };
      }
      return l;
    });
    networkHealth = Math.min(networkHealth, 82);
  }

  // Reference node N06 is strictly immutable
  if (updatedNodes['N06']) {
    updatedNodes['N06'].tilt = 0.08;
    updatedNodes['N06'].displacement = 0.12;
    updatedNodes['N06'].status = 'NORMAL';
  }

  return {
    nodes: updatedNodes,
    panels: updatedPanels,
    links: updatedLinks,
    cloudStatus,
    bufferedEvents,
    networkHealth,
    newEvents,
    demoPhaseName,
    demoPhaseIndex,
    demoTotalPhases
  };
}

/**
 * Convenience step function for incremental simulation advances.
 */
export function updateScenarioStep(
  scenario: ScenarioType,
  elapsedSec: number,
  currentNodes: Record<string, SensorNode>,
  currentPanels: Record<string, MinePanel>,
  currentLinks: MeshLink[],
  cloudStatus: 'CONNECTED' | 'DISCONNECTED' | 'SYNCHRONIZING',
  _bufferedEvents: number,
  options?: { failedNodeId?: string | null }
): ScenarioStepState {
  const result = getScenarioStateAtTime(
    scenario,
    elapsedSec,
    currentNodes,
    currentPanels,
    currentLinks,
    {
      cloudManualDisconnect: cloudStatus === 'DISCONNECTED',
      nodeManualFailId: options?.failedNodeId
    }
  );

  return result;
}
