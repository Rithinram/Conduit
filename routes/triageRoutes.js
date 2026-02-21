const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const { runInference } = require("./mlRoutes");

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

        // Run ML Inference for Urgency
        const payload = {
            symptom: patient.symptoms?.[0] || 'fever',
            age: patient.age || 35,
            severity: 2, // Default median severity
            heart_rate: patient.vitals?.heartRate || 75,
            systolic_bp: patient.vitals?.bloodPressure ? parseInt(patient.vitals.bloodPressure.split('/')[0]) : 120,
            temperature: patient.vitals?.temperature || 37
        };

        const result = await runInference('urgency', payload);

        if (result) {
            patient.urgencyLevel = result.urgency_level.charAt(0).toUpperCase() + result.urgency_level.slice(1);
            // Map level to score for backend consistency
            const scoreMap = { 'critical': 95, 'high': 75, 'moderate': 50, 'low': 25 };
            patient.smartScore = scoreMap[result.urgency_level] || 50;
        }

        await patient.save();
        res.json({ success: true, patient });
    } catch (err) {
        console.error("[Triage-ML] Update failed:", err);
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

module.exports = router;
