const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const Visit = require("../models/Visit");

// Helper: Calculate Smart Triage Score (0-100)
const STAGES = ["Arrival", "Triage", "Waiting", "Consultation", "Lab", "Discharge"];
const calculateSmartScore = (patient) => {
    let score = 0;
    const { vitals, age, symptoms } = patient;

    if (!vitals) return 50; // Default middle ground

    // 1. Oxygen Saturation (Critical Factor)
    if (vitals.oxygenLevel < 90) score += 40;
    else if (vitals.oxygenLevel < 94) score += 20;

    // 2. Heart Rate (Tachycardia/Bradycardia)
    if (vitals.heartRate > 120 || vitals.heartRate < 50) score += 15;
    else if (vitals.heartRate > 100) score += 5;

    // 3. Temperature (High Fever)
    if (vitals.temperature > 103) score += 10;
    else if (vitals.temperature > 100.4) score += 5;

    // 4. Age Factor (Vulnerable groups)
    if (age > 70 || age < 5) score += 10;

    // 5. Symptom Severity
    if (symptoms?.includes("Chest Pain")) score += 25;
    if (symptoms?.includes("Shortness of Breath")) score += 20;

    return Math.min(100, score);
};

// GET triage queue for a specific hospital
router.get("/queue/:hospitalId", async (req, res) => {
    try {
        const patients = await Patient.find({
            assignedHospital: req.params.hospitalId,
            triageStatus: { $in: ["Waiting", "Triage"] }
        }).sort({ smartScore: -1 });
        res.json(patients);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST to update vitals and trigger re-score
router.post("/update-vitals/:patientId", async (req, res) => {
    try {
        const { vitals, symptoms } = req.body;
        const patient = await Patient.findById(req.params.patientId);

        if (!patient) return res.status(404).json({ message: "Patient not found" });

        if (vitals) patient.vitals = { ...patient.vitals, ...vitals };
        if (symptoms) patient.symptoms = symptoms;

        // Recalculate AI Score
        patient.smartScore = calculateSmartScore(patient);

        // Update Urgency Level based on score
        if (patient.smartScore > 80) patient.urgencyLevel = "Critical";
        else if (patient.smartScore > 50) patient.urgencyLevel = "High";
        else if (patient.smartScore > 30) patient.urgencyLevel = "Moderate";
        else patient.urgencyLevel = "Low";

        await patient.save();
        res.json({ success: true, patient });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST to update triage status (Admit, Bed Assign, etc.)
router.post("/update-status/:patientId", async (req, res) => {
    try {
        const { status } = req.body;
        const patient = await Patient.findByIdAndUpdate(
            req.params.patientId,
            { triageStatus: status },
            { new: true }
        );
        res.json({ success: true, patient });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET Flow Metrics: Aggregate counts and delays per stage
router.get("/flow-metrics/:hospitalId", async (req, res) => {
    try {
        const visits = await Visit.find({ hospital: req.params.hospitalId });

        const metrics = STAGES.map(stage => {
            const stageVisits = visits.filter(v => v.currentStage === stage);

            // Calculate avg delay for patients currently in this stage
            let totalDelay = 0;
            stageVisits.forEach(v => {
                const currentStageEntry = v.stageHistory.find(h => h.stage === stage && !h.exitedAt);
                if (currentStageEntry) {
                    totalDelay += (Date.now() - new Date(currentStageEntry.enteredAt).getTime());
                }
            });

            const avgDelay = stageVisits.length > 0 ? Math.round(totalDelay / (stageVisits.length * 60000)) : 0;

            // Identify Bottlenecks: Stage with most patients or highest delay
            const isBottleneck = stageVisits.length > 10 || avgDelay > 20;

            return {
                stage,
                count: stageVisits.length,
                avgDelay,
                isBottleneck,
                patients: stageVisits.slice(0, 3).map(v => ({ id: v._id, stageEntry: v.stageHistory[v.stageHistory.length - 1]?.enteredAt }))
            };
        });

        res.json(metrics);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST Approve Movement: Move patient to the next stage
router.post("/approve-movement/:visitId", async (req, res) => {
    try {
        const { nextStage, approvedBy } = req.body;
        const visit = await Visit.findById(req.params.visitId);
        if (!visit) return res.status(404).json({ message: "Visit not found" });

        // Update current stage history (exit)
        const currentHist = visit.stageHistory.find(h => h.stage === visit.currentStage && !h.exitedAt);
        if (currentHist) currentHist.exitedAt = Date.now();

        // Add new stage entry
        visit.stageHistory.push({
            stage: nextStage,
            enteredAt: Date.now(),
            approvedBy: approvedBy || "Clinical System"
        });

        visit.currentStage = nextStage;
        await visit.save();

        res.json({ success: true, visit });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
