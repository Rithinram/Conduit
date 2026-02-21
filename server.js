const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const hospitalRoutes = require("./routes/hospitalRoutes");
const patientRoutes = require("./routes/patientRoutes");
const triageRoutes = require("./routes/triageRoutes");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const Hospital = require("./models/Hospital");

// Routes
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/triage", triageRoutes);

// System status endpoint (used by SystemStress and SurgePage)
app.get("/api/status", async (req, res) => {
    try {
        const hospitals = await Hospital.find();
        if (hospitals.length === 0) {
            return res.json({
                cityStress: 0,
                activeSurge: false,
                communityHealthIndex: 100,
                predictiveSurgeProb: 0
            });
        }

        // Calculate city stress from average occupancy
        const avgOccupancy = hospitals.reduce((sum, h) => {
            const occ = h.totalBeds ? (h.occupiedBeds / h.totalBeds) * 100 : 0;
            return sum + occ;
        }, 0) / hospitals.length;

        const cityStress = Math.round(avgOccupancy);
        const activeSurge = cityStress > 80;
        const communityHealthIndex = Math.max(0, Math.round(100 - (cityStress * 0.3)));
        const predictiveSurgeProb = Math.min(100, Math.round(cityStress * 0.4));

        res.json({
            cityStress,
            activeSurge,
            communityHealthIndex,
            predictiveSurgeProb
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

app.get("/", (req, res) => {
    res.send("Healthcare System Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});