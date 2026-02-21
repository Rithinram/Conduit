const express = require("express");
const router = express.Router();
const HospitalLoad = require("../models/HospitalLoad");

// GET current load for all hospitals
router.get("/", async (req, res) => {
    try {
        const loads = await HospitalLoad.find()
            .sort({ timestamp: -1 })
            .limit(50)
            .populate('hospitalId');
        res.json(loads);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET historical load for a specific hospital
router.get("/hospital/:id", async (req, res) => {
    try {
        const loads = await HospitalLoad.find({ hospitalId: req.params.id })
            .sort({ timestamp: -1 })
            .limit(24);
        res.json(loads);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
