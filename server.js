const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const hospitalRoutes = require("./routes/hospitalRoutes");
const patientRoutes = require("./routes/patientRoutes");
const mlRoutes = require("./routes/mlRoutes");
const authRoutes = require("./routes/authRoutes");
const loadRoutes = require("./routes/loadRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const adminRoutes = require("./routes/adminRoutes");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/ml", mlRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/load", loadRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/admin", adminRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

app.get("/", (req, res) => {
    res.send("Healthcare System Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "127.0.0.1", () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});