const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
    name: String,
    age: Number,
    chronicConditions: [String],
    vitals: {
        heartRate: Number,
        bloodPressure: String,
        oxygenLevel: Number,
        temperature: Number
    },
    symptoms: [String],
    smartScore: Number,
    triageStatus: {
        type: String,
        enum: ["Waiting", "Triage", "Bed Assigned", "Admitted", "Discharged"],
        default: "Waiting"
    },
    urgencyLevel: {
        type: String,
        enum: ["Low", "Moderate", "High", "Critical"],
        default: "Moderate"
    },
    careLevel: String,
    assignedHospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital"
    }
}, { timestamps: true });

module.exports = mongoose.model("Patient", patientSchema);