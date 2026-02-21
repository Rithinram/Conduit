const express = require("express");
const router = express.Router();
const Hospital = require("../models/Hospital");
const SystemState = require("../models/SystemState");
const PatientCase = require("../models/PatientCase");
const Resource = require("../models/Resource");

// GET current system state
router.get("/system-state", async (req, res) => {
    try {
        let state = await SystemState.findOne().sort({ createdAt: -1 });
        if (!state) {
            state = await SystemState.create({
                globalAlertLevel: "Stable",
                activeGlobalAlert: "System Normal",
                redistributionProtocolActive: false
            });
        }
        res.json(state);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST to trigger redistribution (The "Blocks Moving" Logic)
router.post("/redistribute", async (req, res) => {
    try {
        const { intensity, proposals } = req.body;

        // 1. Update Global System State
        await SystemState.findOneAndUpdate({}, {
            redistributionProtocolActive: true,
            globalAlertLevel: intensity > 80 ? 'Critical' : 'Elevated',
            lastUpdated: new Date()
        }, { upsert: true });

        // 2. Perform Data Migration across hospitals in proposals
        for (const prop of proposals) {
            const source = await Hospital.findOne({ name: prop.from });
            const dest = await Hospital.findOne({ name: prop.to });

            if (source && dest) {
                // Shift Load: -prop.count from source, +prop.count to dest
                source.currentERLoad = Math.max(0, source.currentERLoad - prop.count);
                source.isSurgeActive = true;

                dest.currentERLoad = dest.currentERLoad + prop.count;
                dest.isSurgeActive = true;

                await source.save();
                await dest.save();
            }
        }

        res.json({ success: true, message: "Redistribution protocol dispatched to regional nodes." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST to reset simulation
router.post("/reset", async (req, res) => {
    try {
        await SystemState.findOneAndUpdate({}, {
            redistributionProtocolActive: false,
            globalAlertLevel: 'Stable',
            lastUpdated: new Date()
        });

        // Reset all hospital surge flags
        await Hospital.updateMany({}, { isSurgeActive: false });

        res.json({ success: true, message: "Network stabilized. Overrides cleared." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST to set a global alert
router.post("/alert", async (req, res) => {
    try {
        const { message, level } = req.body;
        await SystemState.findOneAndUpdate({}, {
            activeGlobalAlert: message,
            globalAlertLevel: level || 'Elevated',
            lastUpdated: new Date()
        }, { upsert: true });

        res.json({ success: true, message: "Global alert broadcasted." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST to update clinical policies
router.post("/update-policy", async (req, res) => {
    try {
        const { urgencyFilterLevel, autoRedirectEligibility, nudgeIntensity } = req.body;

        const update = {
            lastUpdated: new Date()
        };

        if (urgencyFilterLevel !== undefined) update.urgencyFilterLevel = urgencyFilterLevel;
        if (autoRedirectEligibility !== undefined) update.autoRedirectEligibility = autoRedirectEligibility;
        if (nudgeIntensity !== undefined) update.nudgeIntensity = nudgeIntensity;

        const state = await SystemState.findOneAndUpdate({}, update, { upsert: true, new: true });

        res.json({ success: true, message: "Policy pushed to network successfully.", state });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST to simulate policy impact
router.post("/simulate-policy", async (req, res) => {
    try {
        const { urgencyFilterLevel, autoRedirectEligibility } = req.body;
        const patients = await PatientCase.find().sort({ createdAt: -1 }).limit(100);

        let redirectedCount = 0;
        let teleconsultCount = 0;

        patients.forEach(p => {
            const urgencyMap = { "Low": 1, "Moderate": 2, "High": 3, "Critical": 4 };
            const val = urgencyMap[p.urgencyLevel] || 0;

            let redirected = false;
            // Filter Simulation
            if (urgencyFilterLevel >= 4 && val <= 2) redirected = true;
            else if (urgencyFilterLevel >= 3 && val === 1) redirected = true;

            if (redirected) redirectedCount++;

            // Teleconsult Simulation
            if (autoRedirectEligibility?.feverCough &&
                (p.symptoms?.includes("Fever") || p.symptoms?.includes("Cough"))) {
                teleconsultCount++;
            }
        });

        res.json({
            success: true,
            sampleSize: patients.length,
            redirectedCount,
            teleconsultCount,
            potentialImpact: ((redirectedCount + teleconsultCount) / (patients.length || 1) * 100).toFixed(1),
            estimatedHoursSaved: (redirectedCount * 1.2 + teleconsultCount * 0.8).toFixed(1)
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST to transfer resources (Ventilators, PPE, etc) between hospitals
router.post("/transfer-resource", async (req, res) => {
    try {
        const { fromHospitalName, toHospitalName, resourceType, count } = req.body;

        const sourceHosp = await Hospital.findOne({ name: fromHospitalName });
        const destHosp = await Hospital.findOne({ name: toHospitalName });

        if (!sourceHosp || !destHosp) {
            return res.status(404).json({ success: false, message: "Hospitals not found." });
        }

        const sourceRes = await Resource.findOne({ hospitalId: sourceHosp._id });
        const destRes = await Resource.findOne({ hospitalId: destHosp._id });

        if (!sourceRes || !destRes) {
            return res.status(404).json({ success: false, message: "Resource records not found for these hospitals." });
        }

        // Logic for different resource types
        if (resourceType === 'ventilators') {
            if (sourceRes.availableVentilators < count) {
                return res.status(400).json({ success: false, message: "Insufficient ventilators at source." });
            }
            sourceRes.availableVentilators -= count;
            sourceRes.ventilators -= count;
            destRes.availableVentilators += count;
            destRes.ventilators += count;
        } else if (resourceType === 'staff') {
            if (sourceRes.staffOnDuty < count) {
                return res.status(400).json({ success: false, message: "Insufficient staff at source." });
            }
            sourceRes.staffOnDuty -= count;
            destRes.staffOnDuty += count;
        }

        await sourceRes.save();
        await destRes.save();

        res.json({ success: true, message: `Successfully transferred ${count} ${resourceType} from ${fromHospitalName} to ${toHospitalName}.` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST to bulk redirect patients based on global policy
router.post("/bulk-redirect", async (req, res) => {
    try {
        const state = await SystemState.findOne().sort({ createdAt: -1 });
        if (!state) return res.status(404).json({ success: false, message: "System policy not found." });

        const urgencyMap = { "Low": 1, "Moderate": 2, "High": 3, "Critical": 4 };
        const filterLevel = state.urgencyFilterLevel;

        const patients = await PatientCase.find({ outcomeStatus: { $ne: "Discharged" } });
        let redirectedCount = 0;

        for (const p of patients) {
            const val = urgencyMap[p.urgencyLevel] || 0;
            let redirected = false;

            // Policy Logic: Redirect Low/Moderate if filter is high
            if (filterLevel >= 4 && val <= 2) {
                p.recommendedCare = "Clinic";
                redirected = true;
            } else if (filterLevel >= 3 && val === 1) {
                p.recommendedCare = "Home";
                redirected = true;
            }

            // Auto-redirect checks (Fever/Cough)
            if (state.autoRedirectEligibility.feverCough &&
                (p.symptoms?.includes("Fever") || p.symptoms?.includes("Cough")) &&
                p.durationHours < 48) {
                p.recommendedCare = "Clinic";
                redirected = true;
            }

            if (redirected) {
                p.policyFlag = "Auto-Redirected";
                await p.save();
                redirectedCount++;
            }
        }

        res.json({ success: true, message: `Bulk redirection complete. ${redirectedCount} patients processed across the network.` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
