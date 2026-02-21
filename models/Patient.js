const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
    name: String,
    age: Number,
    chronicConditions: [String],
    triageScore: Number,
    careLevel: String,
    assignedHospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital"
    }
}, { timestamps: true });

module.exports = mongoose.model("Patient", patientSchema);