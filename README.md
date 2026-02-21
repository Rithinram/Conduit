# Conduit — Advanced Hospital Coordination 🏥

Conduit is a next-generation hospital coordination platform designed to stabilize regional healthcare networks through reusable intelligence.

## 🧠 Triple Intelligence Engines

The core of Conduit is powered by three specialized ML/Logic engines:

### 1. Urgency Classification ([urgencyModel.js](src/lib/urgencyModel.js))
- **Purpose:** Automates patient prioritization.
- **Approach:** Rule-based scoring with weighted condition parsing (e.g., cardiac: 95, fever: 30) plus age and severity modifiers.
- **Integration:** Drives "Smart Triage" for hospitals and "Guided Care" for patients.

### 2. Load Prediction ([loadModel.js](src/lib/loadModel.js))
- **Purpose:** Forecasts ER wait times and ICU occupancy.
- **Approach:** Multivariate Linear Regression (trained on 200+ historical records) that accounts for hour of day, day of week, and current queue length.
- **Integration:** Powers the "Smart Time Recommendation" and "Load-aware Hospital Selector".

### 3. Surge Detection ([surgeLogic.js](src/lib/surgeLogic.js))
- **Purpose:** Early warning system for network saturation.
- **Approach:** Real-time thresholding (ICU > 85%, Wait > 45m) combined with 6-hour moving average spikes for predictive alerts.
- **Integration:** Triggers "Regional Redistribution Protocol" in the Admin/Surge Command center.

## 🛠️ Tech Stack

- **Frontend:** React + Vite (High-performance rendering)
- **Styling:** Premium Custom CSS (Glassmorphism, High-contrast accessibility)
- **Animations:** Framer Motion (Fluid transitions and micro-interactions)
- **Backend:** Express + MongoDB (Robust data persistence)
- **Intelligence:** `ml-regression`, `ml-logistic-regression`

---

## 🚀 Key Portals

### 👤 User Portal
- **Emergency Routing:** SOS feature with instant map routing to the facility with the lowest predicted load.
- **Hospital Selector:** Compare facilities using real-time ML-predicted wait times.
- **Smart Appointment:** AI-driven symptom analysis and wait-time forecasting.

### 🏥 Hospital Portal
- **Smart Triage:** Automated sorting of incoming patients by clinical urgency.
- **Queue Management:** ML-forecasted wait times to assist in staff scheduling.
- **Surge Management:** Local command center for activating surge protocols.

### 🛡️ Admin Portal
- **Network Dashboard:** Real-time map of all facility nodes with pulse indicators for health.
- **Surge Command:** Active redistribution engine that proposes patient transfers to balance network load.
- **Policy Engine:** "What-if" simulator to adjust urgency thresholds across the network.

---

## 🤝 Team Collaboration

For the team of 3 developers, please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) for the parallel development workflow, branching strategy, and ML audit requirements.
