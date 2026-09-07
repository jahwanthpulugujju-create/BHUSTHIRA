# BHUSTHIRA

> **Real-Time Mine Subsidence Intelligence & Early Warning System**  
> **Problem Statement SIH26025**: *Development of an AI-enabled Low Cost Real Time Mine Subsidence Monitoring, Prediction and Early Warning System for Underground Coal Mines in India.*

---

## Problem

Underground coal mining extraction (such as longwall retreat or bord-and-pillar extraction) in coal seams (e.g., Jharia Seam XI/XII) causes progressive void development, roof caving, and overburden strata stress redistribution. These subterranean movements propagate through overlying rock strata and manifest at the surface as continuous or discontinuous subsidence troughs, surface cracks, tensile fissures, and localized sinkholes.

Traditional subsidence monitoring relies on:
* **Manual optical leveling / Total Stations**: Intermittent (weekly or monthly), labor-intensive, hazardous to surveyors on unstable slopes, and unable to provide real-time early warning.
* **Satellite InSAR (Interferometric Synthetic Aperture Radar)**: High precision but limited by 6-to-12 day satellite revisit intervals, temporal decorrelation over vegetated soil, and weather latency.
* **Naive single-sensor thresholds**: High rate of false alarms caused by vehicle vibration, temperature drift, or transducer failure, leading to operator alarm fatigue.

**BHUSTHIRA** solves this challenge through a distributed, low-cost virtual sensor network and an explainable edge-first intelligence pipeline built on the principle:
$$\textbf{SENSE} \to \textbf{CORRELATE} \to \textbf{ASSESS} \to \textbf{WARN} \to \textbf{RESPOND} \to \textbf{REVIEW}$$

---

## Architecture

BHUSTHIRA is engineered with a strict 5-layer edge-first architecture:

```
[FIELD SENSOR LAYER]
  Bi-Axial MEMS Inclinometers (Tilt) • Multi-Point Extensometers (Displacement)
  Low-Frequency Geophones (Vibration) • Surface Tensile Crack Meters
                          ↓
[WIRELESS MESH LAYER]
  Self-healing Sub-GHz (868 MHz) Wireless Mesh Network (Nodes N01–N06)
                          ↓
[EDGE COMPUTING LAYER (EDGE-01)]
  Gateway Ingestion • Rolling Baseline Calibration • Edge Islanding Buffer
                          ↓
[INTELLIGENCE & RISK PIPELINE]
  Anomaly Detection • Temporal Persistence • Spatial Correlation
  Multi-Sensor Agreement • Consensus Engine • Configurable Risk Scoring
                          ↓
[OPERATOR DECISION & APPLICATION LAYER]
  Command Center • Geotechnical Mine Map • Sensor Network • Incident Replay
  Deterministic Replay • Decision Support Guidance • Simulated Alert Dispatch
                          ↓ (Optional)
[CENTRAL HQ CLOUD SYNC]
  Store-and-forward batch archive (Completely decoupled from local early-warning decisions)
```

---

## Simulation

BHUSTHIRA incorporates a deterministic, evaluator-ready software digital twin:
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

## Field Integration Plan

```
[Phase 1: Software Simulation] → Active Prototype
       ↓
[Phase 2: Bench Hardware Integration] → Connect ESP32-S3 test bench via MQTT broker
       ↓
[Phase 3: Controlled Field Calibration] → Deploy benchmark inclinometer cluster on surface panel
       ↓
[Phase 4: Mine-Specific Geotechnical Calibration] → Factor in seam depth (-240m), extraction thickness, and lithology
       ↓
[Phase 5: Operational Deployment] → Full Integration with Mine SCADA, Control Room sirens, and SMS broadcast
```

---

## Running Locally

### Prerequisites
* Node.js 18+ or 20+
* npm 9+

### Commands
```bash
# Clone the repository
git clone https://github.com/jahwanthpulugujju-create/BHUSTHIRA.git

# Navigate into project directory
cd BHUSTHIRA

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

> **Notice:** **BHUSTHIRA** is a software-defined digital twin and early-warning prototype developed for **Smart India Hackathon (SIH26025)**. Telemetry streams, risk scores, and topological graphs in this demonstration are synthetic simulation artifacts. Field deployment in Indian coal mines requires strict compliance with Directorate General of Mines Safety (DGMS) regulations, Intrinsically Safe (IS) equipment certification under PESO/CIMFR standards, and mine-specific geomechanical calibration before any life-critical operational use.

---

*BHUSTHIRA • SIH26025 • Real-Time Mine Subsidence Intelligence & Early Warning System*
