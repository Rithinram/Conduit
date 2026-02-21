# 🏥 Conduit Intelligence Module

This folder is a standalone, isolated module containing all ML engines, training logic, and audit scripts for the Conduit platform.

## 📁 Folder Structure
- `engines/`: Core JS logic for Urgency, Load, and Surge detection (calls backend ML).
- `models/`: Binary Random Forest models (`.pkl`) and metadata.
- `train.py`: Unified Python training script (generates models).
- `inference.py`: Python bridge for real-time statistical inference.
- `docs/`: Design manifests and legacy documentation.
- `audit/`: Automated test suites for system health.

## 🧠 Intelligence Capabilities
- **Advanced Clinical Sense**: Urgency model uses **Shock Index** (HR/BP) and **Risk Interaction Mapping** (Age + Symptom clusters).
- **Network Foresight**: Load model predicts waits and occupancy using **Queue Pressure** and **Shift-Cycle Constraints**.
- **Generalization Audit**: The `stress_test.py` validates model stability (jitter) and monotonic learning.

## 🛠️ Commands
Run these from the project root:
- `npm run train-ml`: Regenerate models with interaction features.
- `python conduit-ml/stress_test.py`: Run a diagnostic audit on model generalization.
- `npm run audit-ml`: Verify core engine integration.

---
*Powered by Statistical Machine Learning (Random Forests).*
## 🤝 Team Transfer Guide
To share this module:
1. Zip this `conduit-ml/` folder.
2. Teammate places it in their project root.
*Powered by Statistical Machine Learning.*
