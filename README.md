# BHUSTHIRA

> **Real-Time Mine Subsidence Intelligence & Early Warning System**  
> *Mine Intelligence & Early Warning Platform*  
> **Problem Statement SIH26025**: *Development of an AI-enabled Low Cost Real Time Mine Subsidence Monitoring, Prediction and Early Warning System for Underground Coal Mines in India.*

---

## 📌 Executive Overview

**BHUSTHIRA** is a software-defined digital twin, telemetry simulation, and explainable early-warning decision support platform for underground coal mine subsidence monitoring. Designed under the guiding engineering philosophy: **"Operational clarity over visual spectacle."**

In underground mining operations (e.g., longwall retreat or bord-and-pillar extraction in coal seams such as Jharia Seam XI/XII), roof caving and stress redistribution induce ground movements that propagate to the surface as subsidence troughs. 

### Key Engineering Differentiators
1. **Single Sensor $\neq$ Subsidence Incident:**  
   $$\text{Deformation Incident} \neq \text{Isolated Sensor Spike}$$
   $$\text{Deformation Incident} = \text{Persistent} + \text{Spatially Correlated} + \text{Multi-Sensor Consensus}$$
2. **Sensor Health vs. Deformation Signal Independence:**  
   Decouples instrument hardware health (battery %, packet loss, RSSI) from ground movement. A failing or dying sensor reading is discounted from consensus rather than triggering false mine-wide evacuation sirens.
3. **Autonomous Edge Islanding (`EDGE-01`):**  
   Autonomous edge processing continues full baseline normalization, spatial correlation, consensus scoring, and early warning dispatches locally even during a complete cloud backhaul disconnection.
4. **Transparent & Explainable Early Warning:**  
   No black-box "99% AI predictions". The operator can open the *"Why am I seeing this alert?"* drawer to inspect an itemized 6-step checklist and formula weights.
5. **Honest Simulation Demarcation:**  
   Explicitly marks all prototype telemetry as `SYNTHETIC SENSOR TELEMETRY`, mine geometry as `SIMULATED MINE GEOMETRY`, and hardware specifications as `PROPOSED FIELD DEPLOYMENT`.

---

## 🏛️ System Architecture

### The 11-Step Mine Intelligence Pipeline
```
[Physical / Simulated World]
          ↓
[Sensor Telemetry (Tilt, Extensometer, Geophone, Crack)]
          ↓
[Sub-GHz 868MHz LoRa Mesh Network]
          ↓
[Edge Processing (EDGE-01 Ingestion & Normalization)]
          ↓
[Statistical Anomaly Detection (Baseline Deviation)]
          ↓
[Spatial + Temporal Correlation (Neighborhood Agreement)]
          ↓
[Deformation Consensus Engine]
          ↓
[Kinematic Risk Assessment (0 - 100 Risk Index)]
          ↓
[Geotechnical GIS Deformation Map (Influence Contours)]
          ↓
[Explainable Early Warning Dispatch]
          ↓
[Shift In-Charge & Operator Decision Support]
```

---

## 🧭 Core Application Modules

### 1. Command Center
The asymmetric operational command dashboard featuring:
- **Top 6 Operational Metrics Strip**: Current Risk Score, Consensus Confidence, Active Anomalous Nodes, Mesh Reliability, Edge-01 Status, Last Heartbeat.
- **Interactive Geotechnical Mine Map**: SVG vector rendering of Seam XI/XII panels (Panels A–D), barrier pillars, dynamic subsidence contour expansion, and mesh links.
- **Operator Decision Support Panel**: Real-time risk band, affected panel sector, consensus confidence, primary physical evidence, and SOP recommendation.
- **Live Risk Evolution Sparkline**: 0–100 risk score and consensus trend lines with threshold bands.
- **Operational Event Timeline Stream**: Chronological audit trail with click-to-focus interactivity.
- **Scenario Control Toolbar**: Instant playback (`1x` to `10x`), pause, reset, scenario picker, and one-click skip buttons.

### 2. BHUSTHIRA Deformation Map
- Geotechnical GIS visualizer for Panels A, B, C, and D.
- Subsidence influence zone contours with continuous parametric expansion based on active longwall retreat.
- Stratigraphic dossier detailing overburden depth (-185m to -310m), extraction method, and lithological characteristics.

### 3. BHUSTHIRA Sensor Network
- 868MHz LoRa wireless mesh topology table with real-time RSSI, packet loss, and battery diagnostics.
- **Dynamic Failover Demonstration**: Interactive `FAIL NODE N04` simulation demonstrating self-healing mesh rerouting through adjacent node N03.
- **Cloud Resilience Demonstration**: Interactive `DISCONNECT CLOUD` trigger demonstrating zero-loss edge storage and local buffering.

### 4. BHUSTHIRA Intelligence Engine
- Transparent multi-evidence fusion consensus engine:
  $$\text{Score} = w_{\text{anom}} + w_{\text{temp}} + w_{\text{spat}} + w_{\text{multi}} + w_{\text{health}} + w_{\text{net}}$$
- Spatial neighborhood consensus vs. single-sensor transducer fault discriminator.
- Multi-modal agreement matrix across tilt, displacement, micro-vibration, and tensile crack detection.

### 5. BHUSTHIRA Risk Engine
- 0–100 risk scoring with calibrated operational safety bands:
  - `0 - 30`: **NORMAL** (Baseline equilibrium)
  - `31 - 50`: **WATCH** (Early kinematic drift)
  - `51 - 70`: **WARNING** (Multi-sensor convergence)
  - `71 - 100`: **CRITICAL** (Accelerated strata deformation)
- Kinematic feature contribution breakdown bars.
- Automated simulated SMS and Email dispatch previews.

### 6. BHUSTHIRA Incident Replay
- Interactive timeline scrubber (00:00 to 03:00) reconstructing historical strata kinematics.
- Complete retrospective audit report for incident `SIM-INC-2026-0042` with JSON export and printable view.

### 7. System Health & Diagnostics
- Sensor Health vs. Environmental Deformation Signal matrix.
- Edge daemon heartbeat monitor (Telemetry Ingestion, Anomaly Engine, Consensus Engine, Ring Buffer).
- Subsystem integration specifications (Active, Simulated, and Ready protocols).

### 8. Proposed Field Deployment Architecture
- 5-layer Physical-to-Digital Mine Intelligence Pipeline diagram.
- Low-cost sensor hardware specifications (Bi-axial MEMS inclinometer, potentiometric extensometer, 4.5Hz geophone, tensile crack ribbon).
- Techno-economic feasibility analysis demonstrating 85–90% cost reduction over conventional imported surveying setups.

---

## ⚡ 10 Deterministic Simulation Scenarios

1. `NORMAL`: Baseline environmental conditions (Risk ~15-20).
2. `GRADUAL_SUBSIDENCE`: Slow strata deformation developing over Panel B (Watch $\to$ Warning $\to$ Critical).
3. `RAPID_SUBSIDENCE`: Accelerated multi-sensor subsidence event.
4. `SENSOR_FAULT`: Node N03 spikes to extreme values while adjacent nodes remain normal $\to$ System classifies as *Transducer Artifact* and suppresses false mine evacuation alarm.
5. `NODE_FAILURE`: Node N04 goes offline; mesh routes dynamically self-heal.
6. `NETWORK_DEGRADED`: Channel congestion with packet loss increasing to 18%.
7. `MULTI_SENSOR_ANOMALY`: Tilt, displacement, vibration, and crack signals concurrently trigger.
8. `CLOUD_OFFLINE`: Edge islanding mode continues offline with zero data loss.
9. `RECOVERY`: Strata stabilizes; risk decays smoothly back to baseline.
10. `FULL_DEMO`: Automated 10-phase presentation sequence for SIH jury demonstrations.

---

## 🛠️ Technology Stack

- **Frontend & UI**: React 19, TypeScript, Vite
- **Styling**: Pure semantic industrial CSS (no bloated UI kits, crisp 1px borders, high-contrast typography)
- **Vector Graphics**: Native SVG geospatial coordinate projection
- **Icons**: Lucide React
- **State Management**: Centralized React Context with deterministic simulation loop

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Installation
```bash
# Clone the repository
git clone https://github.com/jahwanthpulugujju-create/BHUSTHIRA.git

# Navigate into project directory
cd BHUSTHIRA

# Install dependencies
npm install

# Launch development server
npm run dev
```

The application will be live at:
**`http://localhost:5173/`**

### Production Build
```bash
npm run build
npm run preview
```

---

## ⚠️ Prototype Scope & Regulatory Notice

> **Statutory Notice:** **BHUSTHIRA** is a software-defined digital twin and simulation prototype developed for **Smart India Hackathon (SIH26025)**. All telemetry values, risk scores, and mine models presented in this release are synthetic simulation artifacts. Physical deployment in operating Indian underground coal mines requires strict compliance with Directorate General of Mines Safety (DGMS) regulations, Intrinsically Safe (IS) equipment certification under PESO/CIMFR standards, and mine-specific geomechanical calibration before any life-critical operational use.

---

*BHUSTHIRA • SIH26025 Prototype • Real-Time Mine Subsidence Intelligence & Early Warning System*
