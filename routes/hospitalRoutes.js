const express = require("express");
const router = express.Router();
const Hospital = require("../models/Hospital");

// GET all hospitals
router.get("/", async (req, res) => {
    try {
        const hospitals = await Hospital.find();
        res.json(hospitals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET hospital by ID
router.get("/:id", async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) return res.status(404).json({ message: "Hospital not found" });
        res.json(hospital);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADD hospital
router.post("/", async (req, res) => {
    try {
        const hospital = new Hospital(req.body);
        await hospital.save();
        res.status(201).json(hospital);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;