const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient"
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital"
    },
    triageLevel: String,
    currentStage: {
        type: String,
        enum: ["Arrival", "Triage", "Waiting", "Consultation", "Lab", "Discharge"],
        default: "Arrival"
    },
    stageHistory: [{
        stage: String,
        enteredAt: { type: Date, default: Date.now },
        exitedAt: Date,
        approvedBy: String
    }],
    predictedWaitTime: Number,
    actualWaitTime: Number
}, { timestamps: true });

module.exports = mongoose.model("Visit", visitSchema);