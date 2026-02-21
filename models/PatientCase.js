const mongoose = require("mongoose");

const patientCaseSchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    age: { type: Number },
    gender: { type: String },
    symptoms: [{ type: String }],
    severity: { type: Number },
    durationHours: { type: Number },
    riskFactors: [{ type: String }],
    heartRate: { type: Number },
    bloodPressure: { type: String },
    oxygenLevel: { type: Number },
    urgencyLevel: {
        type: String,
        enum: ["Low", "Moderate", "High", "Critical"]
    },
    recommendedCare: {
        type: String,
        enum: ["Home", "Clinic", "Hospital", "ER"]
    },
    hospitalAssigned: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital"
    },
    outcomeStatus: {
        type: String,
        enum: ["Admitted", "Discharged", "Observation"]
    },
    policyFlag: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("PatientCase", patientCaseSchema);
