import type { ScenarioType, SensorNode, MinePanel, MeshLink, IncidentEvent } from '../types';

export interface ScenarioStepState {
  nodes: Record<string, SensorNode>;
  panels: Record<string, MinePanel>;
  links: MeshLink[];
  cloudStatus: 'CONNECTED' | 'DISCONNECTED' | 'SYNCHRONIZING';
  bufferedEvents: number;
  networkHealth: number;
  newEvents: IncidentEvent[];
  demoPhaseName?: string;
}

/**
 * Deterministic Scenario Engine for BHUSTHIRA.
 * Updates physical synthetic telemetry step-by-step according to selected operational scenario.
 */
export function updateScenarioStep(
  scenario: ScenarioType,
  elapsedSec: number,
  currentNodes: Record<string, SensorNode>,
  currentPanels: Record<string, MinePanel>,
  currentLinks: MeshLink[],
  cloudStatus: 'CONNECTED' | 'DISCONNECTED' | 'SYNCHRONIZING',
  bufferedEvents: number
): ScenarioStepState {
  // Deep clone nodes
  const updatedNodes: Record<string, SensorNode> = {};
  const updatedPanels = { ...currentPanels };
  let updatedLinks = currentLinks.map(l => ({ ...l }));
  let currentCloud = cloudStatus;
  let currentBuffer = bufferedEvents;
  let networkHealth = 98;
  const newEvents: IncidentEvent[] = [];

  const formatClock = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `14:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Base slight Brownian noise (-0.02 to +0.02)
  const getNoise = (scale = 0.01) => (Math.sin(elapsedSec * 1.5) * 0.5 + Math.cos(elapsedSec * 2.3) * 0.5) * scale;

  // Initialize node copies
  Object.keys(currentNodes).forEach(id => {
    const orig = currentNodes[id];
    updatedNodes[id] = {
      ...orig,
      history: {
        tilt: [...orig.history.tilt.slice(1), orig.tilt],
        displacement: [...orig.history.displacement.slice(1), orig.displacement],
        vibration: [...orig.history.vibration.slice(1), orig.vibration]
      }
    };
  });

  let demoPhaseName = undefined;

  // SCENARIO LOGIC
  switch (scenario) {
    case 'NORMAL': {
      demoPhaseName = 'Baseline Environmental Conditions';
      Object.keys(updatedNodes).forEach(id => {
        const node = updatedNodes[id];
        node.status = 'NORMAL';
        node.isFaulty = false;
        node.persistenceTicks = 0;
        node.crack_signal = false;
        node.tilt = Number((node.baseline.tilt + getNoise(0.02)).toFixed(2));
        node.displacement = Number((node.baseline.displacement + getNoise(0.04)).toFixed(2));
        node.vibration = Number((node.baseline.vibration + getNoise(0.01)).toFixed(2));
        node.temperature = Number((27.5 + getNoise(0.2)).toFixed(1));
        node.packet_loss = 0.8;
      });
      break;
    }

    case 'GRADUAL_SUBSIDENCE': {
      // Progressively modify Panel B: N02, N03, N04
      // Early phase (sec 1-12)
      // Watch phase (sec 13-28)
      // Warning phase (sec 29-48)
      // Critical phase (sec 49+)
      const progress = Math.min(1.0, elapsedSec / 55);
      
      if (progress < 0.25) demoPhaseName = 'Early Strata Equilibrium Drift';
      else if (progress < 0.55) demoPhaseName = 'Watch State: Continuous Tilt Trend';
      else if (progress < 0.85) demoPhaseName = 'Warning State: Spatially Correlated Subsidence';
      else demoPhaseName = 'Critical State: Accelerated Convergence & Crack Detection';

      // N03 is the centroid of subsidence in Panel B
      const n03 = updatedNodes['N03'];
      n03.tilt = Number((0.25 + progress * 1.95 + getNoise(0.03)).toFixed(2));
      n03.displacement = Number((0.65 + progress * 8.8 + getNoise(0.08)).toFixed(2));
      n03.vibration = Number((0.09 + progress * 0.65 + getNoise(0.02)).toFixed(2));
      n03.crack_signal = progress > 0.65;
      n03.persistenceTicks = Math.min(24, Math.floor(elapsedSec / 2));
      n03.status = progress > 0.75 ? 'CRITICAL' : progress > 0.35 ? 'ANOMALOUS' : 'NORMAL';

      // N02 is west flank
      const n02 = updatedNodes['N02'];
      n02.tilt = Number((0.22 + progress * 1.45 + getNoise(0.03)).toFixed(2));
      n02.displacement = Number((0.58 + progress * 6.2 + getNoise(0.06)).toFixed(2));
      n02.vibration = Number((0.08 + progress * 0.42 + getNoise(0.02)).toFixed(2));
      n02.crack_signal = progress > 0.78;
      n02.persistenceTicks = Math.min(20, Math.floor(elapsedSec / 2.5));
      n02.status = progress > 0.80 ? 'CRITICAL' : progress > 0.42 ? 'ANOMALOUS' : 'NORMAL';

      // N04 is east flank
      const n04 = updatedNodes['N04'];
      n04.tilt = Number((0.20 + progress * 1.35 + getNoise(0.03)).toFixed(2));
      n04.displacement = Number((0.51 + progress * 5.8 + getNoise(0.06)).toFixed(2));
      n04.vibration = Number((0.08 + progress * 0.38 + getNoise(0.02)).toFixed(2));
      n04.persistenceTicks = Math.min(18, Math.floor(elapsedSec / 3));
      n04.status = progress > 0.82 ? 'CRITICAL' : progress > 0.48 ? 'ANOMALOUS' : 'NORMAL';

      // N01 and N05 experience slight marginal boundary vibration
      if (updatedNodes['N01']) updatedNodes['N01'].displacement = Number((0.42 + progress * 0.4 + getNoise(0.02)).toFixed(2));
      if (updatedNodes['N05']) updatedNodes['N05'].displacement = Number((0.38 + progress * 0.3 + getNoise(0.02)).toFixed(2));

      // Reference node N06 stays rigidly stable
      if (updatedNodes['N06']) {
        updatedNodes['N06'].tilt = 0.08;
        updatedNodes['N06'].displacement = 0.12;
        updatedNodes['N06'].status = 'NORMAL';
      }

      // Log timeline events at key inflection points
      if (elapsedSec === 8) {
        newEvents.push({
          id: `evt-${elapsedSec}-${Date.now()}`,
          timestamp: formatClock(elapsedSec),
          simSecond: elapsedSec,
          type: 'NODE_ANOMALY',
          nodeId: 'N03',
          panelId: 'Panel B',
          severity: 'INFO',
          description: 'N03 centroid tilt rate exceeded 0.15°/min baseline threshold.'
        });
      } else if (elapsedSec === 18) {
        newEvents.push({
          id: `evt-${elapsedSec}-${Date.now()}`,
          timestamp: formatClock(elapsedSec),
          simSecond: elapsedSec,
          type: 'SPATIAL_CORRELATION',
          panelId: 'Panel B',
          severity: 'WATCH',
          description: 'N02 and N04 show convergent displacement trends. Spatial correlation crossed MODERATE.'
        });
      } else if (elapsedSec === 32) {
        newEvents.push({
          id: `evt-${elapsedSec}-${Date.now()}`,
          timestamp: formatClock(elapsedSec),
          simSecond: elapsedSec,
          type: 'ALERT_GENERATED',
          panelId: 'Panel B',
          severity: 'WARNING',
          description: 'WARNING: Deformation Consensus crossed 65/100. Panel B surface warning zone active.'
        });
      } else if (elapsedSec === 49) {
        newEvents.push({
          id: `evt-${elapsedSec}-${Date.now()}`,
          timestamp: formatClock(elapsedSec),
          simSecond: elapsedSec,
          type: 'RISK_ESCALATION',
          panelId: 'Panel B',
          severity: 'CRITICAL',
          description: 'CRITICAL: Acoustic emission crack detection registered. Subsidence rate accelerating.'
        });
      }
      break;
    }

    case 'RAPID_SUBSIDENCE': {
      demoPhaseName = 'Rapid Strata Dynamic Displacement';
      const progress = Math.min(1.0, elapsedSec / 20);
      
      const n03 = updatedNodes['N03'];
      n03.tilt = Number((0.25 + progress * 2.8).toFixed(2));
      n03.displacement = Number((0.65 + progress * 13.5).toFixed(2));
      n03.vibration = Number((0.09 + progress * 0.92).toFixed(2));
      n03.crack_signal = true;
      n03.status = 'CRITICAL';
      n03.persistenceTicks = 12;

      const n02 = updatedNodes['N02'];
      n02.tilt = Number((0.22 + progress * 2.2).toFixed(2));
      n02.displacement = Number((0.58 + progress * 9.8).toFixed(2));
      n02.vibration = Number((0.08 + progress * 0.75).toFixed(2));
      n02.crack_signal = true;
      n02.status = 'CRITICAL';

      const n04 = updatedNodes['N04'];
      n04.tilt = Number((0.20 + progress * 2.0).toFixed(2));
      n04.displacement = Number((0.51 + progress * 8.9).toFixed(2));
      n04.vibration = Number((0.08 + progress * 0.68).toFixed(2));
      n04.status = 'CRITICAL';
      break;
    }

    case 'SENSOR_FAULT': {
      demoPhaseName = 'Isolated Transducer Artifact Discrimination';
      // N03 spikes to extreme values, but neighboring N02 and N04 are completely stable!
      const n03 = updatedNodes['N03'];
      n03.displacement = Number((8.6 + getNoise(0.3)).toFixed(2));
      n03.tilt = 0.28;
      n03.vibration = 0.11;
      n03.crack_signal = false;
      n03.status = 'ANOMALOUS';
      n03.health = 74; // degraded transducer health
      n03.isFaulty = true;

      // Neighbors remain baseline
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

    case 'NODE_FAILURE': {
      demoPhaseName = 'Mesh Route Recovery & Redundancy';
      // Node N04 is completely OFFLINE
      if (updatedNodes['N04']) {
        const n04 = updatedNodes['N04'];
        n04.status = 'OFFLINE';
        n04.health = 0;
        n04.packet_loss = 100;
        n04.rssi = -120;
      }
      
      // Mesh links connected to N04 become inactive, rerouting through N03
      updatedLinks = updatedLinks.map(l => {
        if (l.from === 'N04' || l.to === 'N04') return { ...l, active: false };
        return l;
      });
      break;
    }

    case 'NETWORK_DEGRADED': {
      demoPhaseName = 'Mesh Channel Congestion / Packet Drop Simulation';
      networkHealth = 64;
      Object.keys(updatedNodes).forEach(id => {
        updatedNodes[id].packet_loss = Number((14.5 + Math.random() * 8).toFixed(1));
        updatedNodes[id].rssi = -88;
      });
      break;
    }

    case 'MULTI_SENSOR_ANOMALY': {
      demoPhaseName = 'Concurrent Multimodal Strain Verification';
      ['N02', 'N03', 'N04'].forEach(id => {
        const n = updatedNodes[id];
        n.tilt = Number((1.8 + Math.random() * 0.4).toFixed(2));
        n.displacement = Number((7.5 + Math.random() * 1.5).toFixed(2));
        n.vibration = Number((0.68 + Math.random() * 0.15).toFixed(2));
        n.crack_signal = true;
        n.status = 'CRITICAL';
        n.persistenceTicks = 15;
      });
      break;
    }

    case 'CLOUD_OFFLINE': {
      demoPhaseName = 'Edge Autonomous Islanding Mode';
      currentCloud = 'DISCONNECTED';
      currentBuffer = bufferedEvents + 1;
      break;
    }

    case 'RECOVERY': {
      demoPhaseName = 'Post-Event Strata Stabilization & Recovery';
      // Progressively descend towards baseline
      const decay = Math.max(0, 1.0 - (elapsedSec / 25));
      ['N02', 'N03', 'N04'].forEach(id => {
        const n = updatedNodes[id];
        n.tilt = Number((n.baseline.tilt + decay * 1.4).toFixed(2));
        n.displacement = Number((n.baseline.displacement + decay * 5.2).toFixed(2));
        n.vibration = Number((n.baseline.vibration + decay * 0.3).toFixed(2));
        n.crack_signal = false;
        n.status = decay > 0.4 ? 'ANOMALOUS' : 'NORMAL';
      });

      if (elapsedSec === 24) {
        newEvents.push({
          id: `evt-recovery-${elapsedSec}`,
          timestamp: formatClock(elapsedSec),
          simSecond: elapsedSec,
          type: 'INCIDENT_RESOLVED',
          panelId: 'Panel B',
          severity: 'INFO',
          description: 'Deformation stabilization confirmed. All strata vectors returned within post-incident baseline.'
        });
      }
      break;
    }

    case 'FULL_DEMO': {
      // Complete 10-phase hackathon demonstration sequence (approx 120 sec full cycle)
      // Phase 1 (0-15s): Normal
      // Phase 2 (15-30s): Early Anomaly N03
      // Phase 3 (30-45s): Spatial Correlation N02, N03, N04
      // Phase 4 (45-60s): Multi-sensor Confirmation & Warning
      // Phase 5 (60-75s): Critical Subsidence & Crack detection
      // Phase 6 (75-85s): Cloud Disconnect (Edge processing continues)
      // Phase 7 (85-95s): Node N04 Failure (Reroute demonstration)
      // Phase 8 (95-105s): Cloud Reconnect & Sync
      // Phase 9 (105-120s): Recovery & Incident Resolution
      const sec = elapsedSec % 125;
      
      if (sec < 15) {
        demoPhaseName = 'Phase 1: Baseline Stable State (Risk 18)';
        // Normal
        Object.keys(updatedNodes).forEach(id => {
          const n = updatedNodes[id];
          n.status = 'NORMAL';
          n.crack_signal = false;
          n.tilt = n.baseline.tilt;
          n.displacement = n.baseline.displacement;
        });
      } else if (sec < 30) {
        demoPhaseName = 'Phase 2: Early Drift Detected on N03 Centroid (WATCH)';
        const n03 = updatedNodes['N03'];
        n03.tilt = 0.85;
        n03.displacement = 2.4;
        n03.status = 'ANOMALOUS';
        n03.persistenceTicks = 5;
      } else if (sec < 48) {
        demoPhaseName = 'Phase 3: Spatial Correlation Engaged across Panel B (WARNING)';
        const n03 = updatedNodes['N03'];
        n03.tilt = 1.45;
        n03.displacement = 5.2;
        n03.status = 'ANOMALOUS';

        const n02 = updatedNodes['N02'];
        n02.tilt = 1.15;
        n02.displacement = 4.1;
        n02.status = 'ANOMALOUS';

        const n04 = updatedNodes['N04'];
        n04.tilt = 0.95;
        n04.displacement = 3.8;
        n04.status = 'ANOMALOUS';
      } else if (sec < 75) {
        demoPhaseName = 'Phase 4 & 5: Multi-Sensor Critical Subsidence & Crack Detection';
        const n03 = updatedNodes['N03'];
        n03.tilt = 2.15;
        n03.displacement = 9.4;
        n03.vibration = 0.72;
        n03.crack_signal = true;
        n03.status = 'CRITICAL';
        n03.persistenceTicks = 18;

        const n02 = updatedNodes['N02'];
        n02.tilt = 1.85;
        n02.displacement = 7.8;
        n02.vibration = 0.58;
        n02.crack_signal = true;
        n02.status = 'CRITICAL';

        const n04 = updatedNodes['N04'];
        n04.tilt = 1.65;
        n04.displacement = 7.1;
        n04.vibration = 0.52;
        n04.status = 'CRITICAL';
      } else if (sec < 88) {
        demoPhaseName = 'Phase 6: Cloud Outage — Edge-01 Autonomous Operation';
        currentCloud = 'DISCONNECTED';
        currentBuffer = bufferedEvents + 1;
        // Keep critical
        updatedNodes['N03'].status = 'CRITICAL';
      } else if (sec < 98) {
        demoPhaseName = 'Phase 7: Node N04 Failure & Dynamic Mesh Reroute';
        updatedNodes['N04'].status = 'OFFLINE';
        updatedLinks = updatedLinks.map(l => (l.from === 'N04' || l.to === 'N04') ? { ...l, active: false } : l);
      } else if (sec < 108) {
        demoPhaseName = 'Phase 8: Cloud Restored & Telemetry Buffer Synchronized';
        currentCloud = 'SYNCHRONIZING';
        currentBuffer = 0;
        updatedNodes['N04'].status = 'NORMAL';
      } else {
        demoPhaseName = 'Phase 9: Controlled Recovery & Incident Resolution';
        currentCloud = 'CONNECTED';
        const dec = Math.max(0, 1.0 - ((sec - 108) / 16));
        ['N02', 'N03', 'N04'].forEach(id => {
          const n = updatedNodes[id];
          n.tilt = Number((n.baseline.tilt + dec * 1.2).toFixed(2));
          n.displacement = Number((n.baseline.displacement + dec * 4.0).toFixed(2));
          n.status = dec > 0.3 ? 'ANOMALOUS' : 'NORMAL';
          n.crack_signal = false;
        });
      }
      break;
    }
  }

  return {
    nodes: updatedNodes,
    panels: updatedPanels,
    links: updatedLinks,
    cloudStatus: currentCloud,
    bufferedEvents: currentBuffer,
    networkHealth,
    newEvents,
    demoPhaseName
  };
}
