const express = require("express");
const router = express.Router();
const PatientCase = require("../models/PatientCase");
const SystemState = require("../models/SystemState");

// GET all patient cases
router.get("/", async (req, res) => {
    try {
        const patients = await PatientCase.find().populate('hospitalAssigned');
        res.json(patients);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// REGISTER patient case
router.post("/register", async (req, res) => {
    try {
        // Fetch current system policy
        const state = await SystemState.findOne().sort({ createdAt: -1 });
        const patientData = req.body;

        if (state) {
            // 1. Enforce Urgency Filter
            const urgencyMap = { "Low": 1, "Moderate": 2, "High": 3, "Critical": 4 };
            const currentUrgencyValue = urgencyMap[patientData.urgencyLevel] || 0;

            if (state.urgencyFilterLevel >= 4 && currentUrgencyValue <= 2) {
                // If filter is strict (4-5) and urgency is Low/Moderate, redirect to Clinic
                patientData.recommendedCare = "Clinic";
                patientData.policyFlag = "Auto-Redirected: High Network Load";
            } else if (state.urgencyFilterLevel >= 3 && currentUrgencyValue === 1) {
                // If moderate (3) and urgency is Low, redirect
                patientData.recommendedCare = "Clinic";
                patientData.policyFlag = "Filtered: Resource Optimization";
            }

            // 2. Enforce Symptom-based Auto-Redirect
            const symptoms = patientData.symptoms || [];
            if (state.autoRedirectEligibility?.feverCough &&
                (symptoms.includes("Fever") || symptoms.includes("Cough"))) {
                patientData.recommendedCare = "Home"; // Teleconsult
                patientData.policyFlag = "Teleconsult Eligible: Mild Symptoms";
            }
        }

        const patientCase = new PatientCase(patientData);
        const newCase = await patientCase.save();
        res.status(201).json(newCase);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
