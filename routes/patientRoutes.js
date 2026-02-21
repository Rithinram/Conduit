const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");

// GET all patients
router.get("/", async (req, res) => {
    try {
        const patients = await Patient.find().populate('assignedHospital');
        res.json(patients);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// REGISTER patient
router.post("/register", async (req, res) => {
    try {
        const patient = new Patient(req.body);
        const newPatient = await patient.save();
        res.status(201).json(newPatient);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
