const express = require("express");
const router = express.Router();
const Resource = require("../models/Resource");

// GET all resources
router.get("/", async (req, res) => {
    try {
        const resources = await Resource.find().populate('hospitalId');
        res.json(resources);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET resources for a specific hospital
router.get("/hospital/:id", async (req, res) => {
    try {
        const resources = await Resource.findOne({ hospitalId: req.params.id });
        res.json(resources);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
