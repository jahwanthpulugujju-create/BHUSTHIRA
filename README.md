# STRATUM

> **Real-Time Mine Subsidence Intelligence & Early Warning System**  
> **Problem Statement SIH26025**: *Development of an AI-enabled Low Cost Real Time Mine Subsidence Monitoring, Prediction and Early Warning System for Underground Coal Mines in India.*

---

## Problem

Underground coal mining extraction (such as longwall retreat or bord-and-pillar extraction) in coal seams (e.g., Jharia Seam XI/XII) causes progressive void development, roof caving, and overburden strata stress redistribution. These subterranean movements propagate through overlying rock strata and manifest at the surface as continuous or discontinuous subsidence troughs, surface cracks, tensile fissures, and localized sinkholes.

Traditional subsidence monitoring relies on:
* **Manual optical leveling / Total Stations**: Intermittent (weekly or monthly), labor-intensive, hazardous to surveyors on unstable slopes, and unable to provide real-time early warning.
* **Satellite InSAR (Interferometric Synthetic Aperture Radar)**: High precision but limited by 6-to-12 day satellite revisit intervals, temporal decorrelation over vegetated soil, and weather latency.
* **Naive single-sensor thresholds**: High rate of false alarms caused by vehicle vibration, temperature drift, or transducer failure, leading to operator alarm fatigue.

**STRATUM** solves this challenge through a distributed, low-cost virtual sensor network and an explainable edge-first intelligence pipeline built on the principle:
$$\textbf{SENSE} \to \textbf{CORRELATE} \to \textbf{ASSESS} \to \textbf{WARN} \to \textbf{RESPOND} \to \textbf{REVIEW}$$

---

## Architecture

STRATUM is engineered with a strict edge-first, transport-agnostic architecture:

```
STRATUM APP
      │
TelemetryProvider
      │
┌─────────────┼─────────────┐
│             │             │
Simulation   Field Node    Field Gateway
Digital Twin Bench Node    Industrial Network
│             │             │
└─────────────┼─────────────┘
      │
NORMALIZED STRATUM TELEMETRY
      │
┌────────────────┴───────────────┐
│                               │
Intelligence                    UI
anomaly → temporal → spatial    Map / Risk / Alerts
consensus → risk                Replay / Health
```

### 8-Stage End-to-End Pipeline:
$$\text{PHYSICAL SENSOR} \to \text{TELEMETRY ADAPTER} \to \text{NORMALIZED TELEMETRY} \to \text{ANOMALY DETECTION} \to \text{TEMPORAL ANALYSIS} \to \text{SPATIAL CORRELATION} \to \text{MULTI-SENSOR CONSENSUS} \to \text{RISK ENGINE} \to \text{GIS + ALERT}$$

```
[LAYER 1: FIELD SENSORS]
  Bi-Axial MEMS Inclinometers (Tilt) • Multi-Point Extensometers (Displacement)
  Low-Frequency Geophones (Vibration) • Surface Tensile Crack Meters
                          ↓
[LAYER 2: TELEMETRY ADAPTER & INGESTION]
  Transport-Agnostic TelemetryProvider • Web GATT / Gateway Concentration
                          ↓
[LAYER 3: EDGE COMPUTING LAYER (EDGE-01)]
  Normalization • Baseline Calibration • Edge Islanding Buffer
                          ↓
[LAYER 4: INTELLIGENCE & RISK PIPELINE]
  Anomaly Detection • Temporal Persistence • Spatial Correlation
  Multi-Sensor Agreement • Consensus Engine • Configurable Risk Scoring
                          ↓
[LAYER 5: OPERATOR DECISION & APPLICATION LAYER]
  Command Center • Geotechnical Mine Map • Sensor Network • Incident Replay
  Deterministic Replay • Decision Support Guidance • Simulated Alert Dispatch
                          ↓ (Optional)
[CENTRAL HQ CLOUD SYNC]
  Store-and-forward batch archive (Completely decoupled from local early-warning decisions)
```

---

## Simulation

STRATUM incorporates a deterministic, evaluator-ready software digital twin:
* **Decoupled Dual Clocks**:
  * **Actual System Clock (`LOCAL TIME`)**: Displays live computer time in Indian Standard Time (`Asia/Kolkata`), updating once per second regardless of simulation state or speed.
  * **Simulation Elapsed Clock (`SIM TIME`)**: Measures simulation seconds (`T+00:42`), pause-able, and responsive to speed multipliers (`0.5x`, `1x`, `2x`, `5x`, `10x`).
* **Deterministic Pseudo-Noise Engine**: Zero uncontrolled `Math.random()` in scenario-critical telemetry. All baseline readings, harmonic vibrations, and fault signals are generated via a seeded generator:
  $$\text{noise}(seed, tick, nodeId)$$
  guaranteeing exact reproducibility across demo runs, skip actions, and historical incident replay.
* **Deterministic State Reconstruction (`getScenarioStateAtTime`)**:
  Both live execution and historical scrubbing share a single pure function to evaluate node kinematics, active mesh topology, cloud buffer size, and consensus states for any scenario second.

---

## Intelligence Pipeline

The analytical pipeline processes telemetry through 7 transparent stages:

1. **Signal Processing & Baseline**: Filters transient noise and maintains a rolling baseline equilibrium.
2. **Anomaly Detection**: Evaluates kinematic deviation ($Z$-scores) and rate-of-change for surface inclination and subsurface displacement.
3. **Temporal Persistence**: Differentiates transient surface mechanical disturbances (passing dumper trucks, blasting tremors) from sustained strata subsidence trends.
4. **Spatial Correlation**: Quantifies neighborhood corroboration across contiguous nodes in the affected sector (e.g., Panel B centroid vs. perimeter).
5. **Multi-Sensor Agreement**: Evaluates physical orthogonality across independent channels (tilt + displacement + vibration + tensile crack).
6. **Deformation Consensus Engine**: Computes an aggregate consensus score ($0 - 100$) and separates hardware faults from true ground movement.
7. **Risk Assessment**: Maps kinematic consensus into actionable risk indices ($0 - 100$) with calibrated operational safety bands.

---

## Risk Model

Risk is evaluated via a configuration-driven scoring model (`RISK_MODEL_CONFIG`):

$$\text{Risk} = w_{\text{disp}} \cdot S_{\text{disp}} + w_{\text{spat}} \cdot S_{\text{spat}} + w_{\text{temp}} \cdot S_{\text{temp}} + w_{\text{tilt}} \cdot S_{\text{tilt}} + w_{\text{vib}} \cdot S_{\text{vib}} + w_{\text{crack}} \cdot S_{\text{crack}}$$

### Calibrated Operational Bands
* **$0 - 30$ NORMAL**: Stable baseline equilibrium. Regular shift monitoring.
* **$31 - 50$ WATCH**: Early kinematic drift. Enhanced monitoring of affected sector.
* **$51 - 70$ WARNING**: Multi-node spatial correlation. Inspect and verify affected zone according to mine safety procedures.
* **$71 - 100$ CRITICAL**: Accelerated strata displacement and crack signals. Escalate for immediate operator verification and follow applicable mine safety procedures.

### Severity vs. Confidence Decoupling
* **High Risk + High Confidence**: Spatially correlated multi-node subsidence event.
* **Elevated Metric + Low Confidence**: Single transducer hardware fault. The system flags a **Possible Sensor Fault** rather than issuing a mine evacuation alert.

---

## Scenarios

1. `NORMAL`: Baseline environmental conditions (Risk ~15–20, 6/6 healthy nodes).
2. `GRADUAL_SUBSIDENCE`: Progressive 9-phase subsidence across Panel B ($T+00$ to $T+125$).
3. `RAPID_SUBSIDENCE`: Fast-onset caving event demonstrating immediate alert escalation.
4. `SENSOR_FAULT`: Node N03 spikes to extreme values while adjacent nodes remain normal $\to$ System detects low spatial correlation and identifies transducer fault.
5. `NODE_FAILURE`: Node N04 goes offline; mesh routes dynamically self-heal via N03.
6. `NETWORK_DEGRADED`: High packet loss scenario testing delivery resilience.
7. `MULTI_SENSOR_ANOMALY`: Concurrent tilt, displacement, vibration, and crack sensor trip.
8. `CLOUD_OFFLINE`: Backhaul disconnection activating local edge storage and event buffer.
9. `RECOVERY`: Strata stabilizes; kinetic energy dissipates; risk decays back to baseline.

---

## Limitations

* **Prototype Scope**: Current telemetry and geometric coordinates are generated by the software simulation engine for concept demonstration.
* **Geotechnical Calibration**: Prototype risk model weights and thresholds are illustrative; operational field deployment requires site-specific calibration against empirical subsidence curves (e.g., Peck profile, NCB UK empirical functions, CMPDI models).
* **Sensor Hardware**: Physical deployments require Intrinsically Safe (IS) DGMS/PESO-certified enclosures for underground coal headings.

---

---

## Telemetry Provider Architecture

STRATUM decouples the physical hardware transport from the edge analytical pipeline using a pluggable, transport-agnostic provider layer (`ITelemetryProvider`):

```
FIELD DEVICE (ESP32 / LoRa Node)
     ↓
TRANSPORT ADAPTER (BLE / LoRa / MQTT / Serial / Simulation)
     ↓
TELEMETRY NORMALIZER (Schema Validation & Range Clamping)
     ↓
TELEMETRY STORE (Central Singleton Registry)
     ↓
ANALYSIS PIPELINE (Anomaly → Spatial → Consensus → Risk)
     ↓
OPERATOR UI (Transport-Neutral Industrial Interface)
```

### Supported Telemetry Adapters:
* **`BleTelemetryProvider`** (Fully implemented for bench hardware): Directly connects to ESP32 test node using Web Bluetooth GATT notifications.
* **`SimulationTelemetryProvider`** (Fully implemented): Authoritative deterministic physics twin for scenario generation and testing.
* **`LoRaTelemetryProvider`** (Target production interface contract): Production path for underground Sub-GHz LoRa mesh gateways streaming over MQTT/WebSocket/Serial.
* **`MqttTelemetryProvider`** & **`SerialTelemetryProvider`**: Industrial edge concentrator abstractions.

> **CRITICAL ARCHITECTURAL GUARANTEE:** The operator interface and the intelligence pipeline (`anomalyDetection`, `spatialCorrelation`, `consensusEngine`, `riskEngine`) **NEVER** import `navigator.bluetooth` or contain transport-specific logic. The operator UI displays `FIELD TELEMETRY`, `LIVE`, `STALE`, and `OFFLINE` regardless of whether the underlying transport is Bluetooth, LoRa, or MQTT.

---

## Physical Hardware Integration (Bench BLE Prototype)

### Bench Hardware Specifications
* **Target Node**: Node `N01` in Panel B
* **Device Name**: `MineGuard_Node_01`
* **GATT Service UUID**: `4fafc201-1fb5-459e-8fcc-c5c9c331914b`
* **GATT Characteristic UUID**: `beb5483e-36e1-4688-b7f5-ea07361b26a8`

### Expected JSON Telemetry Payload
The ESP32 firmware transmits JSON-formatted payloads via GATT notifications on the characteristic:

```json
{
  "schema_version": "stratum.telemetry.v1",
  "node_id": "MineGuard_Node_01",
  "timestamp": "2026-09-21T12:00:00.000Z",
  "sequence_number": 101,
  "tilt": 0.23,
  "displacement": 0.61,
  "vibration": 0.08,
  "crack_signal": false,
  "temperature": 28.3,
  "battery": 94,
  "rssi": -67,
  "packet_loss": 0
}
```

### Browser Requirements for Web Bluetooth:
* **Supported Browsers**: Google Chrome (v56+), Microsoft Edge (v79+), Opera, Chrome for Android.
* **Security Requirement**: Web Bluetooth requires either a secure context (`HTTPS`) or local development (`http://localhost:5173`).
* **Clean Fallback**: In unsupported browsers (e.g. Firefox, Safari), the application **does not crash**; it displays a professional unsupported notice and preserves full deterministic simulation and bench test injection capabilities.

### How to Connect Physical Hardware:
1. Power on the ESP32 flashing the `MineGuard_Node_01` firmware.
2. In STRATUM, click **`FIELD TELEMETRY`** on the action toolbar.
3. Click **`CONNECT FIELD NODE`**.
4. The browser device pairing picker will display `MineGuard_Node_01`. Select it and click **Pair**.
5. The status transitions: `DISCONNECTED` $\to$ `SCANNING` $\to$ `CONNECTING` $\to$ `LIVE`.
6. Live physical sensor readings now stream directly into `Node N01`, updating the Command Center, GIS Mine Map, Consensus Engine, and Risk Pipeline.

### Bench Test Harness:
For testing when physical ESP32 hardware is not physically present, open the **`FIELD TELEMETRY`** modal and select the **`BENCH TEST`** tab. Adjust sliders for Surface Tilt, Displacement, Vibration, and Fracture Trip, then click **`INJECT TELEMETRY INTO N01`** to observe deterministic risk escalation.

---

## Operating Modes

1. **`SIMULATION`**: The deterministic software simulation engine is authoritative for all 6 nodes.
2. **`LIVE`**: Physical field hardware telemetry is authoritative for connected nodes (`Node N01`), streaming real packets into the intelligence pipeline. Surrounding nodes continue running baseline simulation to maintain spatial context.
3. **`HYBRID`**: Node provenance is tracked individually (`nodeProvenance: Map<string, OperatingMode>`). Every packet and node carries explicit provenance metadata (`LIVE` vs `SIMULATION`).

---

## Technical Diagnostics (Judges & Evaluators)

While the main operator UI remains strictly transport-neutral, technical evaluators can inspect low-level transport metrics by clicking **`DIAGNOSTICS`** in the Field Telemetry modal:
* Connected Device Name & Transport protocol (`Web Bluetooth GATT / BLE 5.0`)
* Service UUID & Characteristic UUID verification
* GATT Connection & Notification active states
* Rolling Packet Rate (Hz) and Total Packet Counter
* Last Received Sequence Number and Sequence Gap Detection
* Transport Latency (ms) and Packet Age
* Malformed Packets & JSON Parser Diagnostic Log
* Full Raw UTF-8 Payload Inspector Buffer

---

## Target Production LoRa Architecture

For permanent underground deployment, the transport adapter transitions from BLE to LoRa Mesh without changing any upstream intelligence or UI components:

```
FIELD SENSOR NODES (ESP32 + SX1262 LoRa)
       ↓ (868 MHz Sub-GHz LoRa Mesh)
INTRINSICALLY SAFE MESH CONCENTRATOR
       ↓ (Industrial RS-485 / Ethernet)
SURFACE EDGE GATEWAY (EDGE-01)
       ↓ (Local WebSocket / MQTT Broker)
STRATUM NORMALIZER & REGISTRY (LoRaTelemetryProvider)
       ↓
INTELLIGENCE & RISK PIPELINE
```

---

## Incident Replay: Dual-Source Verification

STRATUM's **Incident Replay** module supports both verification paradigms:
1. **Deterministic Scenario Replay**: Scrubbing through standard calibrated subsidence scenarios with 9 milestone keyframe events.
2. **Live Session Replay**: Client-side **IndexedDB** (`stratum_telemetry_db`) records every live hardware session (packet sequence, timestamp, kinematic channels, and risk trajectory) for forensic audit and playback.

---

## Comprehensive 16-Phase Demonstration Procedure

Follow this procedure for the complete hackathon evaluation demo:

| Phase | Action | System Response |
|---|---|---|
| **Phase 1** | Launch application at `localhost:5173` | Command Center opens in paused equilibrium baseline. |
| **Phase 2** | Inspect Top Status Strip | Risk is $18/100$ (NORMAL); Data source shows `FIELD TELEMETRY • SIMULATION`. |
| **Phase 3** | Click `FIELD TELEMETRY` toolbar button | Field Telemetry panel opens; shows `DISCONNECTED` state. |
| **Phase 4** | Click `CONNECT FIELD NODE` | Web Bluetooth requests `MineGuard_Node_01` (Service UUID verified). |
| **Phase 5** | Device connected | Status switches to `FIELD TELEMETRY • LIVE`; packet counter increments. |
| **Phase 6** | Open `NODE N01` in Command Center or Map | Node detail drawer displays `N01 • LIVE`, packet age, and battery. |
| **Phase 7** | Tilt the physical sensor / use Bench slider | Live tilt channel updates in real time on drawer and Command Center. |
| **Phase 8** | Tilt exceeds $0.40^\circ$ | Node anomaly score rises to $>0.35$; rate of change calculates. |
| **Phase 9** | Displacement exceeds $1.5\text{ mm}$ | Multi-sensor agreement flag activates; evidence chain updates. |
| **Phase 10** | Consensus evaluation | If neighbors normal $\to$ Sensor Health degraded flag. If correlated $\to$ Risk escalates to `WATCH`/`WARNING`. |
| **Phase 11** | Open Engineering Diagnostics | Evaluator inspects GATT UUIDs, packet rate (Hz), sequence gaps, and raw JSON. |
| **Phase 12** | Disconnect hardware | Telemetry status transitions to `STALE` ($3-10\text{s}$) $\to$ `OFFLINE` ($>10\text{s}$). |
| **Phase 13** | Click `RECONNECT` | System seamlessly reconnects without page refresh. |
| **Phase 14** | Open `Incident Replay` | Switch to `LIVE SESSION REPLAY` to review recorded IndexedDB packet log. |
| **Phase 15** | Switch to `Guided Demo` | Run the 9-phase deterministic subsidence scenario for system-level demonstration. |
| **Phase 16** | Trigger `Node Failure` / `Cloud Disconnect` | Prove mesh self-healing reroute and edge buffer islanding. |

---

## Technical Honesty & Limitations

* **Bench Setup**: The current live connection demonstrates physical bench hardware integration via Web Bluetooth Low Energy. It proves the complete sensor $\to$ transport adapter $\to$ normalizer $\to$ intelligence pipeline $\to$ UI.
* **Mine-Scale Verification**: This demonstration does not claim underground mine-scale safety certification or life-safety sign-off. Operational underground use requires intrinsically safe enclosures, DGMS statutory compliance, and empirical geotechnical calibration against specific coal basin lithologies.
* **Transport Agnosticism**: BLE is a temporary bench transport; production architecture will utilize the documented LoRa mesh interface contract.

---

## Running Locally

### Prerequisites
* Node.js 18+ or 20+
* npm 9+

### Commands
```bash
# Clone the repository
git clone https://github.com/jahwanthpulugujju-create/STRATUM.git

# Navigate into project directory
cd STRATUM

# Install dependencies
npm install

# Launch Vite development server
npm run dev
```

The application will be accessible at:
**`http://localhost:5173/`**

---

## Build & Quality Commands

```bash
# Compile and build production bundle
npm run build

# Run TypeScript linter
npm run lint

# Preview production build locally
npm run preview
```

---

## Demo Instructions for Evaluators & Presenters

Follow this sequence for an evaluator judging demonstration:

1. **Open Command Center**: System starts in `PAUSED` state with `NORMAL` baseline ($18/100$ risk, $6/6$ healthy nodes, local Indian Standard Time active).
2. **Select Guided Demo**: Click **`START GUIDED DEMO`** on the action toolbar.
3. **Phase 1 to 2 (Baseline $\to$ Early Anomaly)**: Node N03 begins subtle tilt drift. Risk stays controlled as spatial agreement is low.
4. **Phase 3 (Spatial Correlation)**: Adjacent nodes N02 and N04 begin corroborating movement. 3-node deformation cluster is identified.
5. **Phase 4 (Warning State)**: Consensus threshold crossed. Click **`VIEW EVIDENCE & PIPELINE`** to inspect the 6-factor explainability checklist.
6. **Phase 5 (Critical Subsidence)**: Tensile crack ribbon trips; displacement rate accelerates; risk reaches $82/100$.
7. **Phase 6 (Cloud Disconnect)**: Cloud link severed. Observe **`EDGE-01 ACTIVE`**, **`LOCAL BUFFER ACTIVE`**, and event buffer incrementing.
8. **Phase 7 (Node Failure & Dynamic Rerouting)**: Node N04 goes offline. Observe mesh network reroute through N03 on the Sensor Network topology.
9. **Phase 8 (Cloud Restored & Recovery)**: Cloud reconnects, 23 buffered events synchronize, ground kinematics settle.
10. **Open Incident Replay**: Navigate to **Incident Replay** to scrub historical time keyframes and export the incident dossier.

### Keyboard Shortcuts
* `Space`: Pause / Resume Simulation
* `R`: Reset to Baseline
* `D`: Start / Advance Guided Demo
* `1`, `2`, `3`: Switch Scenarios (Normal / Gradual / Rapid)
* `W`: Skip directly to Warning State ($T+46$)
* `C`: Skip directly to Critical State ($T+61$)
* `N`: Toggle Node N04 Failure (Self-healing failover)
* `O`: Toggle Cloud Disconnect & Buffer Sync
* `P`: Toggle Presentation Mode

---

## Prototype Disclaimer

> **Notice:** **STRATUM** is a software-defined digital twin and early-warning prototype developed for **Smart India Hackathon (SIH26025)**. Telemetry streams, risk scores, and topological graphs in this demonstration are synthetic simulation artifacts. Field deployment in Indian coal mines requires strict compliance with Directorate General of Mines Safety (DGMS) regulations, Intrinsically Safe (IS) equipment certification under PESO/CIMFR standards, and mine-specific geomechanical calibration before any life-critical operational use.

---

*STRATUM • SIH26025 • Real-Time Mine Subsidence Intelligence & Early Warning System*
